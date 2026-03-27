import { getPersonaText } from '../config'
import type { Lang } from './types'

/**
 * Build the full system prompt for the AI chat.
 * Reads persona from persona.config.ts via the config loader.
 */
export function buildSystemPrompt(lang: Lang, articleCatalog: string): string {
  const basePrompt = getPersonaText('system', lang)

  const catalogHeader =
    lang === 'zh'
      ? '## 我的内容目录（博文和资源）'
      : '## My Content Catalog (blog posts and resources)'

  return `${basePrompt}\n\n${catalogHeader}\n\n${articleCatalog}`
}
