@AGENTS.md

# az-site

AI-native personal website template.

## Configuration
- `site.config.ts` — site identity and feature toggles
- `persona.config.ts` — AI chat persona and LLM provider
- `.env` — API keys and secrets (see `.env.example`)

## Development
- `npm run dev` — start dev server
- `npm run build` — production build
- `npx vitest run` — run tests

## Content
- Blog posts: `content/posts/<slug>/index.{en,zh}.md`
- Resources: `content/resources/<slug>/index.{en,zh}.md`
- Announcements: `content/whats-new.json`
