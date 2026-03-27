import type { ChatMessage, Reference } from '../types'

export type StreamChunk =
  | { type: 'content'; text: string }
  | { type: 'tool_call'; name: string; args: Record<string, unknown> }
  | { type: 'tool_result'; toolCallId: string; content: string }
  | { type: 'references'; items: Reference[] }
  | { type: 'done' }

export interface ChatOptions {
  tools?: ToolDefinition[]
  temperature?: number
  maxTokens?: number
}

export interface ToolDefinition {
  name: string
  description: string
  parameters: Record<string, unknown>
}

export interface LLMProvider {
  chat(
    systemPrompt: string,
    messages: ChatMessage[],
    options?: ChatOptions
  ): AsyncIterable<StreamChunk>

  supportsTools(): boolean
}
