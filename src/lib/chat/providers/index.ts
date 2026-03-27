import { personaConfig } from '../../../../persona.config'
import type { LLMProvider } from './base'
import { OpenAIProvider } from './openai'
import { AnthropicProvider } from './anthropic'
import { GoogleProvider } from './google'

export function createProvider(): LLMProvider {
  switch (personaConfig.provider) {
    case 'openai':
      return new OpenAIProvider()
    case 'anthropic':
      return new AnthropicProvider()
    case 'google':
      return new GoogleProvider()
    default:
      return new OpenAIProvider()
  }
}

export type { LLMProvider, StreamChunk, ChatOptions, ToolDefinition } from './base'
