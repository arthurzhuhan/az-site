import Anthropic from '@anthropic-ai/sdk'
import type { LLMProvider, StreamChunk, ChatOptions } from './base'
import type { ChatMessage } from '../types'

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
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
    const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514'

    const anthropicMessages: Anthropic.MessageParam[] = messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    const tools = options?.tools?.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.parameters as Anthropic.Tool.InputSchema,
    }))

    // Non-streaming call to check for tool use
    if (tools && tools.length > 0) {
      const response = await this.client.messages.create({
        model,
        system: systemPrompt,
        messages: anthropicMessages,
        tools,
        max_tokens: options?.maxTokens ?? 2048,
      })

      for (const block of response.content) {
        if (block.type === 'tool_use') {
          yield {
            type: 'tool_call',
            name: block.name,
            args: block.input as Record<string, unknown>,
          }
          return
        }
      }
    }

    // Streaming call for final response
    const stream = this.client.messages.stream({
      model,
      system: systemPrompt,
      messages: anthropicMessages,
      max_tokens: options?.maxTokens ?? 2048,
    })

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield { type: 'content', text: event.delta.text }
      }
    }

    yield { type: 'done' }
  }
}
