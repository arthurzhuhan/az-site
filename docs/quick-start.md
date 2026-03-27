# Quick Start

## Prerequisites

- Node.js 18+
- npm
- An AI coding tool (Claude Code, OpenClaw) — optional but recommended

## 1. Clone and Install

```bash
git clone https://github.com/arthurzhuhan/az-site.git
cd az-site
npm install
```

## 2. Run the Dev Server

```bash
npm run dev
```

Open http://localhost:3000 — you'll see the site with placeholder name and example content.

## 3. Configure with the Skill

In your AI coding tool, run:

```
/az-site
```

The skill will guide you through:
1. Your name and bio
2. Social links
3. AI chat provider and API key
4. Language preference

It writes `site.config.ts`, `persona.config.ts`, and `.env` for you.

**No AI tool?** Copy `.env.example` to `.env`, then edit `site.config.ts` and `persona.config.ts` manually.

## 4. Write Your First Post

Create a folder under `content/posts/`:

```
content/posts/my-first-post/
├── index.en.md
└── index.zh.md
```

Each file needs YAML frontmatter:

```markdown
---
titleEn: "My First Post"
titleZh: "我的第一篇文章"
excerptEn: "A short description"
excerptZh: "简短描述"
date: "2026-03-27"
tagsEn: ["Hello"]
tagsZh: ["你好"]
image: "/blog/minimalist-code.jpg"
---

# My First Post

Your content here...
```

## 5. Deploy

**Vercel (recommended):**
1. Push to GitHub
2. Import in Vercel
3. Add environment variables from `.env`
4. Deploy

**Other platforms:** Any platform that supports Next.js works — Netlify, Docker, self-hosted.
