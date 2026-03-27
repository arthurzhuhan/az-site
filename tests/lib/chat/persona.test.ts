import { describe, it, expect } from 'vitest'
import { buildSystemPrompt } from '../../../src/lib/chat/persona'

describe('buildSystemPrompt', () => {
  it('returns a non-empty system prompt for English', () => {
    const prompt = buildSystemPrompt('en', '- article-1: Test Article')
    expect(prompt.length).toBeGreaterThan(0)
    expect(prompt).toContain('get_article')
    expect(prompt).toContain('Test Article')
  })

  it('returns a non-empty system prompt for Chinese', () => {
    const prompt = buildSystemPrompt('zh', '- article-1: 测试文章')
    expect(prompt.length).toBeGreaterThan(0)
    expect(prompt).toContain('get_article')
  })

  it('replaces {name} placeholder with configured name', () => {
    const prompt = buildSystemPrompt('en', '')
    expect(prompt).not.toContain('{name}')
  })

  it('includes content catalog header', () => {
    const promptEn = buildSystemPrompt('en', 'some catalog')
    expect(promptEn).toContain('My Content Catalog')

    const promptZh = buildSystemPrompt('zh', 'some catalog')
    expect(promptZh).toContain('我的内容目录')
  })

  it('includes article catalog when provided', () => {
    const catalog = '- [博文] slug="ai-test" 《AI Test》 标签:AI — Some excerpt'
    const prompt = buildSystemPrompt('zh', catalog)
    expect(prompt).toContain('AI Test')
    expect(prompt).toContain('ai-test')
  })
})
