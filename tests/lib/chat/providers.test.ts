import { describe, it, expect } from 'vitest'
import { createProvider } from '../../../src/lib/chat/providers'

describe('createProvider', () => {
  it('returns an LLMProvider with required methods', () => {
    const provider = createProvider()
    expect(typeof provider.chat).toBe('function')
    expect(typeof provider.supportsTools).toBe('function')
  })

  it('supportsTools returns a boolean', () => {
    const provider = createProvider()
    expect(typeof provider.supportsTools()).toBe('boolean')
  })
})
