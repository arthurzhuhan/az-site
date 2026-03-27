import { GoogleGenerativeAI } from '@google/generative-ai'
import type { LLMProvider, StreamChunk, ChatOptions } from './base'
import type { ChatMessage } from '../types'

export class GoogleProvider implements LLMProvider {
  private genAI: GoogleGenerativeAI

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')
  }

  supportsTools(): boolean {
    return true
  }

  async *chat(
    systemPrompt: string,
    messages: ChatMessage[],
    options?: ChatOptions
  ): AsyncIterable<StreamChunk> {
    const modelName = process.env.GOOGLE_MODEL || 'gemini-2.0-flash'

    const tools = options?.tools?.map((t) => ({
      functionDeclarations: [
        {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      ],
    }))

    const model = this.genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
      tools: tools || undefined,
    })

    const geminiHistory = messages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const chat = model.startChat({ history: geminiHistory })
    const lastMessage = messages[messages.length - 1]

    // Check for function calls first (non-streaming)
    if (tools && tools.length > 0) {
      const result = await chat.sendMessage(lastMessage.content)
      const response = result.response
      const candidate = response.candidates?.[0]

      if (candidate?.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.functionCall) {
            yield {
              type: 'tool_call',
              name: part.functionCall.name,
              args: (part.functionCall.args || {}) as Record<string, unknown>,
            }
            return
          }
        }
      }
    }

    // Streaming response
    const streamResult = await chat.sendMessageStream(lastMessage.content)

    for await (const chunk of streamResult.stream) {
      const text = chunk.text()
      if (text) {
        yield { type: 'content', text }
      }
    }

    yield { type: 'done' }
  }
}
