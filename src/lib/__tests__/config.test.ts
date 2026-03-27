import { describe, it, expect } from 'vitest'
import { resolveTemplate, getActiveSocialLinks } from '../config'

describe('config', () => {
  describe('resolveTemplate', () => {
    it('replaces {name} placeholders', () => {
      const result = resolveTemplate('Hello {name}, welcome to {name}\'s site')
      expect(result).not.toContain('{name}')
    })

    it('returns original string when no placeholders', () => {
      const result = resolveTemplate('Hello world')
      expect(result).toBe('Hello world')
    })
  })

  describe('getActiveSocialLinks', () => {
    it('filters out empty social links', () => {
      const links = getActiveSocialLinks()
      links.forEach(link => {
        expect(link.url.length).toBeGreaterThan(0)
      })
    })

    it('returns array', () => {
      const links = getActiveSocialLinks()
      expect(Array.isArray(links)).toBe(true)
    })
  })
})
