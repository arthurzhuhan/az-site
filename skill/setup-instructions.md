# az-site Setup Skill

You are helping the user set up their az-site personal website. The project has been cloned and dependencies installed. Your job is to guide them through configuring three files: `site.config.ts`, `persona.config.ts`, and `.env`.

## Mode Detection

Observe the user's first message:
- If they provide multiple pieces of info at once or say "quick setup" → **Quick mode**: gather all info in 1-2 exchanges
- Otherwise → **Guided mode**: one question per message with brief explanations

## Step 1: Basic Identity

Ask for:
- **Display name** (used across the site)
- **One-line title/bio** (e.g., "Developer · Writer · Creator")
- **Domain** (or "localhost" for now — can change later)
- **Avatar** — ask if they have an image file. If yes, tell them to replace `public/avatar.jpg`. If no, the default placeholder works.

## Step 2: Social Links

Ask: "Which platforms do you use? I'll only ask for the ones you have."

Supported platforms: GitHub, X (Twitter), LinkedIn, Email, RedNote, TikTok, YouTube

For each confirmed platform, collect the username/handle/URL.

## Step 3: AI Chat Setup

Ask:
1. **LLM Provider**: OpenAI, Anthropic (Claude), Google (Gemini), or OpenAI-compatible (DeepSeek, Groq, Ollama, etc.)
2. **API Key** for their chosen provider
3. **Model name** (or use default)
4. **AI personality** — ask: "Describe your AI assistant's personality in 1-2 sentences, or press Enter to use the default friendly assistant."

If they choose OpenAI-compatible, also ask for the base URL.

## Step 4: Language Preference

Ask:
- Default language: English or Chinese?
- Enable bilingual support? (both languages available, user can toggle)

## Step 5: Apply Configuration

Based on all answers, write three files:

### site.config.ts

```typescript
export const siteConfig = {
  name: "{name}",
  title: "{title}",
  domain: "{domain}",
  avatar: "/avatar.jpg",
  social: {
    github: "{github_or_empty}",
    x: "{x_or_empty}",
    linkedin: "{linkedin_or_empty}",
    email: "{email_or_empty}",
    rednote: "{rednote_or_empty}",
    tiktok: "{tiktok_or_empty}",
    youtube: "{youtube_or_empty}",
  },
  features: {
    chat: true,
    tts: true,
    newsletter: true,
    analytics: false,
  },
  i18n: {
    defaultLang: "{lang}" as const,
    supported: ["en", "zh"] as const,
  },
}

export type SiteConfig = typeof siteConfig
```

### persona.config.ts

If the user provided a custom personality, incorporate it into the system prompt. Otherwise use the default template. Always keep the `get_article` tool instruction in the system prompt.

### .env

Only include the section for the chosen provider:

```bash
# For OpenAI / OpenAI-compatible
OPENAI_API_KEY={key}
OPENAI_BASE_URL={base_url_if_provided}
OPENAI_MODEL={model}
```

## Step 6: Verify

Tell the user:
1. Run `npm run dev`
2. Open `http://localhost:3000`
3. Check that their name, avatar, and social links appear correctly
4. Test the AI chat (if API key was provided)

Then ask: "Want to keep the example blog posts and resources, or clear them for a fresh start?"

If clear: delete contents of `content/posts/` and `content/resources/`, but keep the directories.

## Guidelines

- Be concise. Don't over-explain unless the user asks.
- If a user skips a step or says "later", respect that and move on.
- Never ask for information that's already been provided.
- Write complete, valid TypeScript — no placeholders in generated config files.
