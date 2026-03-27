import { NextRequest } from 'next/server'
import { createProvider } from '@/lib/chat/providers'
import type { ToolDefinition, StreamChunk } from '@/lib/chat/providers/base'
import { buildSystemPrompt } from '@/lib/chat/persona'
import {
  buildKnowledgeIndex,
  buildArticleCatalog,
  getArticleContent,
  extractReferences,
  KnowledgeEntry,
} from '@/lib/chat/knowledge'
import type { Lang, ChatMessage } from '@/lib/chat/types'

const MAX_MESSAGES = 50
const MAX_MESSAGE_LENGTH = 10000
const MAX_TOOL_ROUNDS = 3

let knowledgeIndexCache: KnowledgeEntry[] | null = null

function getKnowledgeIndex(): KnowledgeEntry[] {
  if (!knowledgeIndexCache) {
    knowledgeIndexCache = buildKnowledgeIndex()
  }
  return knowledgeIndexCache
}

function isValidLang(value: unknown): value is Lang {
  return value === 'zh' || value === 'en'
}

function isValidRole(role: unknown): role is 'user' | 'assistant' {
  return role === 'user' || role === 'assistant'
}

function validateRequest(
  body: unknown
): { messages: ChatMessage[]; lang: Lang } | { error: string } {
  if (!body || typeof body !== 'object') {
    return { error: 'Invalid request body' }
  }

  const { messages, lang } = body as Record<string, unknown>

  if (!isValidLang(lang)) {
    return { error: "Invalid lang: must be 'zh' or 'en'" }
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return { error: 'messages must be a non-empty array' }
  }

  if (messages.length > MAX_MESSAGES) {
    return { error: `Too many messages (max ${MAX_MESSAGES})` }
  }

  const validated: ChatMessage[] = []
  for (const msg of messages) {
    if (
      !msg ||
      typeof msg !== 'object' ||
      !isValidRole(msg.role) ||
      typeof msg.content !== 'string'
    ) {
      return {
        error:
          "Each message must have a valid role ('user'|'assistant') and string content",
      }
    }
    if (msg.role === 'user' && msg.content.length > MAX_MESSAGE_LENGTH) {
      return { error: `Message too long (max ${MAX_MESSAGE_LENGTH} chars)` }
    }
    validated.push({ role: msg.role, content: msg.content })
  }

  return { messages: validated, lang }
}

const GET_ARTICLE_TOOL: ToolDefinition = {
  name: 'get_article',
  description:
    'Retrieve the full content of a blog post or resource by its slug.',
  parameters: {
    type: 'object',
    properties: {
      slug: {
        type: 'string',
        description: 'The slug of the article or resource',
      },
    },
    required: ['slug'],
  },
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const result = validateRequest(body)

  if ('error' in result) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { messages, lang } = result
  const index = getKnowledgeIndex()
  const catalog = buildArticleCatalog(lang, index)
  const systemPrompt = buildSystemPrompt(lang, catalog)

  const provider = createProvider()

  try {
    // Tool call loop: resolve tool calls before streaming final response
    let currentMessages = [...messages]

    if (provider.supportsTools()) {
      for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
        const chunks: StreamChunk[] = []
        for await (const chunk of provider.chat(systemPrompt, currentMessages, {
          tools: [GET_ARTICLE_TOOL],
        })) {
          chunks.push(chunk)
        }

        const toolCall = chunks.find((c) => c.type === 'tool_call')
        if (!toolCall || toolCall.type !== 'tool_call') break

        const articleContent = getArticleContent(
          toolCall.args.slug as string,
          lang,
          index
        )

        // Append tool call context as messages
        currentMessages = [
          ...currentMessages,
          {
            role: 'assistant',
            content: `[Looking up: ${toolCall.args.slug}]`,
          },
          {
            role: 'user',
            content: `[Article content for ${toolCall.args.slug}]: ${articleContent || 'Not found.'}`,
          },
        ]
      }
    }

    // Final streaming response
    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        let fullContent = ''
        try {
          for await (const chunk of provider.chat(
            systemPrompt,
            currentMessages
          )) {
            if (chunk.type === 'content') {
              fullContent += chunk.text
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ content: chunk.text })}\n\n`
                )
              )
            }
            if (chunk.type === 'done') {
              const refs = extractReferences(fullContent, lang, index)
              if (refs.length > 0) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ references: refs })}\n\n`
                  )
                )
              }
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            }
          }
        } catch {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`
            )
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    })
  } catch {
    return new Response(
      JSON.stringify({ error: 'Failed to connect to AI service' }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
