# Configuration Guide

## site.config.ts

Controls site identity, social links, features, and internationalization.

### Identity

```ts
name: "Your Name",       // Displayed in sidebar, hero, SEO, copyright
title: "Your Title",     // One-line bio shown under your name
domain: "https://...",   // Used for SEO, sitemap, canonical URLs
avatar: "/avatar.jpg",   // Path to avatar image in public/
```

### Social Links

Empty string = not displayed. The sidebar auto-hides unconfigured links.

```ts
social: {
  github: "username",           // → https://github.com/username
  x: "@handle",                 // → https://x.com/@handle
  linkedin: "in/profile",       // → https://linkedin.com/in/profile
  email: "you@example.com",     // → mailto:you@example.com
  rednote: "https://...",       // Full URL (no auto-prefix)
  tiktok: "@handle",            // → https://tiktok.com/@handle
  youtube: "@channel",          // → https://youtube.com/@channel
}
```

You can also provide full URLs (starting with `http`) for any platform.

### Feature Toggles

```ts
features: {
  chat: true,        // Enable/disable AI chat page
  tts: true,         // Enable/disable text-to-speech button
  newsletter: true,  // Enable/disable email subscription
  analytics: false,  // Enable/disable Google Analytics
}
```

### Internationalization

```ts
i18n: {
  defaultLang: "en",          // "en" or "zh"
  supported: ["en", "zh"],    // Languages available for toggle
}
```

## persona.config.ts

Controls the AI chat personality and behavior.

### Provider

```ts
provider: "openai",   // "openai" | "anthropic" | "google"
```

- `"openai"` — Works with OpenAI and all compatible APIs (DeepSeek, Groq, Ollama, Ark) via `OPENAI_BASE_URL`
- `"anthropic"` — Anthropic Claude models
- `"google"` — Google Gemini models

### System Prompt

Use `{name}` as a placeholder — it's auto-replaced with `siteConfig.name`.

```ts
system: {
  en: "You are {name}'s AI assistant...",
  zh: "你是{name}的 AI 助手...",
}
```

The system prompt should instruct the AI to use the `get_article` tool when questions relate to your published content.

### Greeting and Quick Replies

```ts
greeting: {
  en: "Hi! Ask me anything.",
  zh: "你好！随便问。",
},
quickReplies: {
  en: ["What do you do?", "Tell me about your projects"],
  zh: ["你做什么的？", "聊聊你的项目"],
},
```

## .env

Secrets and API keys. See `.env.example` for all available options.

### LLM Provider Keys

Fill only the section matching your `persona.config.ts` provider:

| Provider | Required Variables |
|----------|-------------------|
| openai | `OPENAI_API_KEY`, optionally `OPENAI_BASE_URL`, `OPENAI_MODEL` |
| anthropic | `ANTHROPIC_API_KEY`, optionally `ANTHROPIC_MODEL` |
| google | `GOOGLE_API_KEY`, optionally `GOOGLE_MODEL` |

### TTS (Optional)

Leave `TTS_PROVIDER` empty to use browser native Web Speech API (free, zero-config).

Set `TTS_PROVIDER=openai` and `TTS_API_KEY` to use OpenAI's TTS API for higher quality voices.

### Content API & Rebuild

Set `CONTENT_API_KEY` to a secure random string. This protects the content management and rebuild endpoints:

- `POST /api/content/posts` — Create/update blog posts
- `POST /api/content/resources` — Create/update resources
- `PUT /api/content/whats-new` — Update announcements
- `POST /api/rebuild` — Trigger site rebuild (SSG re-generation)

The rebuild endpoint has a 60-second cooldown to prevent abuse. It runs asynchronously and returns `202` immediately.

For self-hosted deployments, set `REBUILD_CMD` to customize the build command (e.g., `"npx next build && pm2 restart my-site"`). Default is `"npx next build"`.

### Analytics (Optional)

Set `NEXT_PUBLIC_GA_ID` to your Google Analytics measurement ID.

## Content System

### Blog Posts

```
content/posts/<slug>/
├── index.en.md    # English version
└── index.zh.md    # Chinese version
```

Frontmatter fields:

| Field | Type | Required |
|-------|------|----------|
| `titleEn` | string | Yes |
| `titleZh` | string | Yes |
| `excerptEn` | string | Yes |
| `excerptZh` | string | Yes |
| `date` | string (YYYY-MM-DD) | Yes |
| `tagsEn` | string[] | Yes |
| `tagsZh` | string[] | Yes |
| `image` | string (path in public/) | Yes |

### Resources

```
content/resources/<slug>/
├── index.en.md
└── index.zh.md
```

Additional frontmatter fields:

| Field | Type | Values |
|-------|------|--------|
| `category` | string | `"recommended-projects"`, `"open-source-tools"`, `"learning-resources"` |
| `url` | string | External link to the resource |
| `descriptionEn` | string | Used instead of excerptEn |
| `descriptionZh` | string | Used instead of excerptZh |

### What's New

`content/whats-new.json` — manual announcements. Posts and resources auto-generate entries.

```json
[
  {
    "titleZh": "新公告",
    "titleEn": "New Announcement",
    "href": "/blog/my-post",
    "date": "2026-03-27",
    "color": "#3b82f6"
  }
]
```

## Deployment

### Vercel (Recommended)

1. Push your repo to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add environment variables from `.env`
4. Deploy — Vercel auto-detects Next.js

### Netlify

1. Push to GitHub
2. Import in Netlify
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Add environment variables

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Self-Hosted

Any server with Node.js 18+:

```bash
npm run build
npm start
```
