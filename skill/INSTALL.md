# Installing the az-site Setup Skill

## Claude Code

**Option A — Workspace skill (auto-discovered):**
The skill is already at `skill/claude/skill.md` in your project. Claude Code auto-discovers workspace skills. Just run `/az-site` in the terminal.

**Option B — Global install:**
1. Copy `skill/claude/` to `~/.claude/skills/az-site/`
2. Available as `/az-site` in any project

## OpenClaw

**Option A — Workspace install:**
1. Copy `skill/openclaw/` to `<your-workspace>/skills/az-site/`
2. Available as `/az-site` in that workspace

**Option B — Global install:**
1. Copy `skill/openclaw/` to `~/.openclaw/skills/az-site/`
2. Available as `/az-site` globally

## Other AI Coding Tools (Cursor, Windsurf, etc.)

1. Open `skill/setup-instructions.md` in your project
2. Copy the contents into your AI assistant's chat
3. Follow the guided setup prompts
