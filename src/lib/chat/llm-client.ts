import OpenAI from "openai";
import { ChatMessage } from "./types";

export function createLLMClient(): OpenAI {
  return new OpenAI({
    apiKey: process.env.ARK_API_KEY ?? "",
    baseURL: process.env.ARK_BASE_URL ?? "https://ark.cn-beijing.volces.com/api/v3",
  });
}

export function buildChatParams(
  systemPrompt: string,
  messages: ChatMessage[]
): OpenAI.Chat.ChatCompletionCreateParams {
  return {
    model: process.env.ARK_MODEL ?? "",
    stream: true,
    messages: [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ],
  };
}
