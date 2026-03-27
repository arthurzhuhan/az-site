import OpenAI from 'openai'
import type { LLMProvider, StreamChunk, ChatOptions } from './base'
import type { ChatMessage } from '../types'

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'not-configured',
      baseURL: process.env.OPENAI_BASE_URL || undefined,
    })
  }

  supportsTools(): boolean {
    return true
  }

  async *chat(
    systemPrompt: string,
    messages: ChatMessage[],
    options?: ChatOptions
  ): AsyncIterable<StreamChunk> {
    const model = process.env.OPENAI_MODEL || 'gpt-4o'

    const openaiMessages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    const tools = options?.tools?.map((t) => ({
      type: 'function' as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }))

    // Non-streaming call to check for tool calls
    if (tools && tools.length > 0) {
      const response = await this.client.chat.completions.create({
        model,
        messages: openaiMessages,
        tools,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2048,
      })

      const choice = response.choices[0]
      if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
        for (const tc of choice.message.tool_calls) {
          if (tc.type === 'function') {
            yield {
              type: 'tool_call',
              name: (tc as any).function.name,
              args: JSON.parse((tc as any).function.arguments),
            }
          }
        }
        return
      }
    }

    // Streaming call for final response
    const stream = await this.client.chat.completions.create({
      model,
      messages: openaiMessages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2048,
      stream: true,
    })

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta
      if (delta?.content) {
        yield { type: 'content', text: delta.content }
      }
    }

    yield { type: 'done' }
  }
}
