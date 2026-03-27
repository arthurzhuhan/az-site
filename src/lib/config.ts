import { siteConfig } from '../../site.config'
import { personaConfig } from '../../persona.config'
import type { Lang } from './chat/types'

/**
 * Replace {name} placeholders in persona text with siteConfig.name
 */
export function resolveTemplate(template: string): string {
  return template.replace(/\{name\}/g, siteConfig.name)
}

/**
 * Get resolved persona text for a given field and language
 */
export function getPersonaText(
  field: 'system' | 'greeting',
  lang: Lang
): string {
  return resolveTemplate(personaConfig[field][lang])
}

/**
 * Get resolved quick replies for a language
 */
export function getQuickReplies(lang: Lang): string[] {
  return personaConfig.quickReplies[lang]
}

/**
 * Get social links that have a non-empty value
 */
export function getActiveSocialLinks(): Array<{ platform: string; url: string }> {
  return Object.entries(siteConfig.social)
    .filter(([, url]) => url.length > 0)
    .map(([platform, url]) => ({ platform, url }))
}

export { siteConfig, personaConfig }
