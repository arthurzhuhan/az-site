# az-site

> AI-native personal website. Blog, resources, AI chat — all in one.

## Quick Start (5 minutes)

```bash
git clone https://github.com/arthurzhuhan/az-site.git
cd az-site
npm install
npm run dev
```

Then run `/az-site` in your AI coding tool (Claude Code or OpenClaw) to configure your site.

## Features

- **Blog** — Bilingual Markdown blog with tags, images, and SEO
- **AI Chat** — Chat with your own AI persona (multi-provider support)
- **Resources** — Showcase tools, projects, and learning materials
- **Dark/Light Theme** — Toggle with system preference support
- **i18n** — English and Chinese with language toggle
- **Text-to-Speech** — Browser native (zero-config) or third-party
- **SEO** — OpenGraph, JSON-LD, sitemap, robots.txt
- **Newsletter** — Email subscription with built-in API

## Configuration

| File | Purpose |
|------|---------|
| `site.config.ts` | Identity, social links, feature toggles, i18n |
| `persona.config.ts` | AI personality, greeting, quick replies, LLM provider |
| `.env` | API keys and secrets (see `.env.example`) |

## Supported AI Providers

| Provider | SDK | Notes |
|----------|-----|-------|
| OpenAI | `openai` | Also covers DeepSeek, Groq, Ollama, Ark via `OPENAI_BASE_URL` |
| Anthropic | `@anthropic-ai/sdk` | Claude models |
| Google | `@google/generative-ai` | Gemini models |

## Setup Skill

The `/az-site` skill guides you through configuration in ~5 minutes:

| Tool | Installation | Command |
|------|-------------|---------|
| Claude Code | Auto-discovered from `skill/claude/` | `/az-site` |
| OpenClaw | Copy `skill/openclaw/` to workspace skills | `/az-site` |
| Other | Paste `skill/setup-instructions.md` into chat | Manual |

See [skill/INSTALL.md](skill/INSTALL.md) for detailed instructions.

## Content

**Blog posts:** `content/posts/<slug>/index.{en,zh}.md`

**Resources:** `content/resources/<slug>/index.{en,zh}.md`

**Announcements:** `content/whats-new.json`

Each content file uses YAML frontmatter for metadata (title, excerpt, tags, date, image).

## Deployment

- **Vercel** (recommended) — Connect your repo for automatic deploys
- **Netlify** — Standard Next.js deployment
- **Docker** — `npm run build && npm start`
- **Self-hosted** — Any Node.js 18+ environment

## Tech Stack

- [Next.js 16](https://nextjs.org) + [React 19](https://react.dev)
- [Tailwind CSS 4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [OpenAI SDK](https://github.com/openai/openai-node) / [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-typescript) / [Google AI SDK](https://github.com/google/generative-ai-js)
- [Vitest](https://vitest.dev) for testing

## Development

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run test      # Run tests
npm run lint      # Lint code
```

## License

MIT
