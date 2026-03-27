import { NextRequest } from "next/server";
import type { ChatCompletionChunk, ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { ChatCompletionTool } from "openai/resources/chat/completions";
import { Lang, ChatMessage } from "@/lib/chat/types";
import { buildSystemPrompt } from "@/lib/chat/persona";
import { buildKnowledgeIndex, buildArticleCatalog, getArticleContent, extractReferences, KnowledgeEntry } from "@/lib/chat/knowledge";
import { createLLMClient } from "@/lib/chat/llm-client";

const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 10000;
const MAX_TOOL_ROUNDS = 3;

let knowledgeIndexCache: KnowledgeEntry[] | null = null;

function getKnowledgeIndex(): KnowledgeEntry[] {
  if (!knowledgeIndexCache) {
    knowledgeIndexCache = buildKnowledgeIndex();
  }
  return knowledgeIndexCache;
}

function isValidLang(value: unknown): value is Lang {
  return value === "zh" || value === "en";
}

function isValidRole(role: unknown): role is "user" | "assistant" {
  return role === "user" || role === "assistant";
}

function validateRequest(body: unknown): { messages: ChatMessage[]; lang: Lang } | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Invalid request body" };
  }

  const { messages, lang } = body as Record<string, unknown>;

  if (!isValidLang(lang)) {
    return { error: "Invalid lang: must be 'zh' or 'en'" };
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return { error: "messages must be a non-empty array" };
  }

  if (messages.length > MAX_MESSAGES) {
    return { error: `Too many messages (max ${MAX_MESSAGES})` };
  }

  const validated: ChatMessage[] = [];
  for (const msg of messages) {
    if (!msg || typeof msg !== "object" || !isValidRole(msg.role) || typeof msg.content !== "string") {
      return { error: "Each message must have a valid role ('user'|'assistant') and string content" };
    }
    if (msg.role === "user" && msg.content.length > MAX_MESSAGE_LENGTH) {
      return { error: `Message too long (max ${MAX_MESSAGE_LENGTH} chars)` };
    }
    validated.push({ role: msg.role, content: msg.content });
  }

  return { messages: validated, lang };
}

const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_article",
      description: "获取一篇博文或资源的完整内容。当用户的问题与某篇文章相关时调用此工具。",
      parameters: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            description: "文章的 slug 标识符，来自内容目录中的 slug 字段",
          },
        },
        required: ["slug"],
      },
    },
  },
];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = validateRequest(body);

  if ("error" in result) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, lang } = result;
  const index = getKnowledgeIndex();
  const catalog = buildArticleCatalog(lang, index);
  const systemPrompt = buildSystemPrompt(lang, catalog);

  const client = createLLMClient();
  const model = process.env.ARK_MODEL ?? "";

  // Build the full message list for the LLM
  const llmMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  try {
    // Tool call loop: non-streaming calls until the model stops calling tools
    let toolRounds = 0;
    while (toolRounds < MAX_TOOL_ROUNDS) {
      const response = await client.chat.completions.create({
        model,
        messages: llmMessages,
        tools,
        stream: false,
      });

      const choice = response.choices[0];

      if (choice.finish_reason !== "tool_calls" || !choice.message.tool_calls?.length) {
        // No tool calls — model wants to respond directly
        // If it already has content from the non-streaming call, stream it out as SSE
        if (choice.message.content) {
          const encoder = new TextEncoder();
          const content = choice.message.content;
          const refs = extractReferences(content, lang, index);
          const readableStream = new ReadableStream({
            start(controller) {
              const chunkSize = 4;
              for (let i = 0; i < content.length; i += chunkSize) {
                const slice = content.slice(i, i + chunkSize);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: slice })}\n\n`));
              }
              if (refs.length > 0) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ references: refs })}\n\n`));
              }
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
            },
          });

          return new Response(readableStream, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
            },
          });
        }
        break;
      }

      // Process tool calls
      llmMessages.push(choice.message as ChatCompletionMessageParam);

      for (const toolCall of choice.message.tool_calls) {
        if (toolCall.type === "function" && toolCall.function.name === "get_article") {
          const args = JSON.parse(toolCall.function.arguments);
          const articleContent = getArticleContent(args.slug, lang, index);
          llmMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: articleContent ?? `Article with slug "${args.slug}" not found.`,
          });
        }
      }

      toolRounds++;
    }

    // Final streaming response after tool calls are resolved
    const stream = await client.chat.completions.create({
      model,
      messages: llmMessages,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        let fullContent = "";
        try {
          for await (const chunk of stream as AsyncIterable<ChatCompletionChunk>) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              fullContent += content;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          // Extract and send references before DONE
          const refs = extractReferences(fullContent, lang, index);
          if (refs.length > 0) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ references: refs })}\n\n`));
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Failed to connect to AI service" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
