import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Lang } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");
const POSTS_DIR = path.join(CONTENT_DIR, "posts");
const RESOURCES_DIR = path.join(CONTENT_DIR, "resources");
const WHATS_NEW_PATH = path.join(CONTENT_DIR, "whats-new.json");

interface WhatsNewItem {
  titleZh: string;
  titleEn: string;
  href: string;
  date: string;
}

export interface KnowledgeEntry {
  slug: string;
  type: "post" | "resource";
  titleZh: string;
  titleEn: string;
  excerptZh: string;
  excerptEn: string;
  contentZh: string | null;
  contentEn: string | null;
  tagsZh: string[];
  tagsEn: string[];
}

function readEntry(dir: string, slug: string, type: "post" | "resource"): KnowledgeEntry | null {
  const zhPath = path.join(dir, slug, "index.zh.md");
  const enPath = path.join(dir, slug, "index.en.md");
  const fallbackPath = path.join(dir, slug, "index.md");

  const primaryPath = fs.existsSync(zhPath) ? zhPath : fs.existsSync(fallbackPath) ? fallbackPath : null;

  if (!primaryPath && !fs.existsSync(enPath)) return null;

  const metaSource = primaryPath ?? enPath;
  const { data, content: primaryContent } = matter(fs.readFileSync(metaSource!, "utf8"));

  let enContent: string | null = null;
  if (fs.existsSync(enPath)) {
    const en = matter(fs.readFileSync(enPath, "utf8"));
    enContent = en.content;
  }

  return {
    slug,
    type,
    titleZh: (data.titleZh as string) ?? "",
    titleEn: (data.titleEn as string) ?? "",
    excerptZh: (data.excerptZh as string) ?? (data.descriptionZh as string) ?? "",
    excerptEn: (data.excerptEn as string) ?? (data.descriptionEn as string) ?? "",
    contentZh: primaryPath ? primaryContent : null,
    contentEn: enContent,
    tagsZh: (data.tagsZh as string[]) ?? [],
    tagsEn: (data.tagsEn as string[]) ?? [],
  };
}

function listSlugs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}

export function buildKnowledgeIndex(): KnowledgeEntry[] {
  const postEntries = listSlugs(POSTS_DIR)
    .map((slug) => readEntry(POSTS_DIR, slug, "post"))
    .filter((e): e is KnowledgeEntry => e !== null);

  const resourceEntries = listSlugs(RESOURCES_DIR)
    .map((slug) => readEntry(RESOURCES_DIR, slug, "resource"))
    .filter((e): e is KnowledgeEntry => e !== null);

  return [...postEntries, ...resourceEntries];
}

/** Build a compact catalog of all articles + whats-new for the system prompt */
export function buildArticleCatalog(lang: Lang, index: KnowledgeEntry[]): string {
  const articleLines = index.map((entry) => {
    const title = lang === "zh" ? entry.titleZh : entry.titleEn;
    const excerpt = lang === "zh" ? entry.excerptZh : entry.excerptEn;
    const tags = lang === "zh" ? entry.tagsZh : entry.tagsEn;
    const typeLabel = entry.type === "post" ? (lang === "zh" ? "博文" : "Post") : (lang === "zh" ? "推荐工具/资源" : "Tool/Resource");
    return `- [${typeLabel}] slug="${entry.slug}" 《${title}》 标签:${tags.join(",")} — ${excerpt}`;
  });

  // Load whats-new manual announcements
  let whatsNewLines: string[] = [];
  if (fs.existsSync(WHATS_NEW_PATH)) {
    const items: WhatsNewItem[] = JSON.parse(fs.readFileSync(WHATS_NEW_PATH, "utf8"));
    if (items.length > 0) {
      const header = lang === "zh" ? "\n最新动态：" : "\nLatest updates:";
      whatsNewLines = [header, ...items.map((item) => {
        const title = lang === "zh" ? item.titleZh : item.titleEn;
        return `- [${lang === "zh" ? "动态" : "Update"}] ${title} (${item.date}) → ${item.href}`;
      })];
    }
  }

  return [...articleLines, ...whatsNewLines].join("\n");
}

/** Extract references from response content by matching internal links */
export function extractReferences(
  content: string,
  lang: Lang,
  index: KnowledgeEntry[]
): { slug: string; type: "post" | "resource"; title: string; excerpt: string; href: string }[] {
  // Match markdown links to /blog/slug or /resources/slug
  const linkPattern = /\[([^\]]*)\]\(\/(blog|resources)\/([a-z0-9-]+)\)/g;
  const seen = new Set<string>();
  const refs: { slug: string; type: "post" | "resource"; title: string; excerpt: string; href: string }[] = [];

  let match;
  while ((match = linkPattern.exec(content)) !== null) {
    const slug = match[3];
    if (seen.has(slug)) continue;
    seen.add(slug);

    const entry = index.find((e) => e.slug === slug);
    if (!entry) continue;

    const title = lang === "zh" ? entry.titleZh : entry.titleEn;
    const excerpt = lang === "zh" ? entry.excerptZh : entry.excerptEn;
    refs.push({
      slug,
      type: entry.type,
      title,
      excerpt,
      href: `/${entry.type === "post" ? "blog" : "resources"}/${slug}`,
    });
  }

  return refs;
}

/** Get full article content by slug */
export function getArticleContent(slug: string, lang: Lang, index: KnowledgeEntry[]): string | null {
  const entry = index.find((e) => e.slug === slug);
  if (!entry) return null;

  const title = lang === "zh" ? entry.titleZh : entry.titleEn;
  const content = lang === "zh" ? entry.contentZh : entry.contentEn;

  if (!content) return null;
  return `# ${title}\n\n${content}`;
}
