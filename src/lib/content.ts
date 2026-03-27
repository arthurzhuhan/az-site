import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

/**
 * If content is already HTML (starts with an HTML tag), return it directly.
 * Otherwise, parse as Markdown.
 */
async function renderContent(raw: string): Promise<string> {
  const trimmed = raw.trim();
  if (trimmed.startsWith("<")) {
    return trimmed;
  }
  return marked.parse(trimmed);
}

const CONTENT_DIR = path.join(process.cwd(), "content");
const POSTS_DIR = path.join(CONTENT_DIR, "posts");
const RESOURCES_DIR = path.join(CONTENT_DIR, "resources");

const VALID_SLUG_RE = /^[a-z0-9-]+$/;

function isValidSlug(slug: string): boolean {
  return VALID_SLUG_RE.test(slug);
}

// ─── Shared helpers ──────────────────────────────────────────────

function resolvePrimaryFile(dir: string, slug: string): string | null {
  const zhPath = path.join(dir, slug, "index.zh.md");
  if (fs.existsSync(zhPath)) return zhPath;

  const fallback = path.join(dir, slug, "index.md");
  if (fs.existsSync(fallback)) return fallback;

  return null;
}

function listSlugs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

async function readBilingualContent(
  dir: string,
  slug: string
): Promise<{ zhHtml: string | null; enHtml: string | null } | null> {
  const zhPath = resolvePrimaryFile(dir, slug);
  const enPath = path.join(dir, slug, "index.en.md");
  const enExists = fs.existsSync(enPath);

  if (!zhPath && !enExists) return null;

  let zhHtml: string | null = null;
  if (zhPath) {
    const { content } = matter(fs.readFileSync(zhPath, "utf8"));
    zhHtml = await renderContent(content);
  }

  let enHtml: string | null = null;
  if (enExists) {
    const { content } = matter(fs.readFileSync(enPath, "utf8"));
    enHtml = await renderContent(content);
  }

  return { zhHtml, enHtml };
}

// ─── Posts ────────────────────────────────────────────────────────

export interface PostMeta {
  slug: string;
  titleZh: string;
  titleEn: string;
  excerptZh: string;
  excerptEn: string;
  date: string;
  tagsZh: string[];
  tagsEn: string[];
  image: string;
}

export interface Post extends PostMeta {
  contentHtmlZh: string | null;
  contentHtmlEn: string | null;
}

function parsePostMeta(slug: string, data: Record<string, unknown>): PostMeta {
  return {
    slug,
    titleZh: data.titleZh as string,
    titleEn: data.titleEn as string,
    excerptZh: data.excerptZh as string,
    excerptEn: data.excerptEn as string,
    date: data.date as string,
    tagsZh: (data.tagsZh as string[]) ?? [],
    tagsEn: (data.tagsEn as string[]) ?? [],
    image: data.image as string,
  };
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const slugs = await getAllPostSlugs();

  const posts = slugs
    .map((slug) => {
      const primaryPath = resolvePrimaryFile(POSTS_DIR, slug);
      if (!primaryPath) return null;
      const { data } = matter(fs.readFileSync(primaryPath, "utf8"));
      return parsePostMeta(slug, data);
    })
    .filter((post): post is PostMeta => post !== null);

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!isValidSlug(slug)) return null;

  const primaryPath = resolvePrimaryFile(POSTS_DIR, slug);
  const enPath = path.join(POSTS_DIR, slug, "index.en.md");
  const enExists = fs.existsSync(enPath);
  if (!primaryPath && !enExists) return null;

  const metaPath = primaryPath ?? enPath;
  const { data } = matter(fs.readFileSync(metaPath, "utf8"));
  const bilingual = await readBilingualContent(POSTS_DIR, slug);

  return {
    ...parsePostMeta(slug, data),
    contentHtmlZh: bilingual?.zhHtml ?? null,
    contentHtmlEn: bilingual?.enHtml ?? null,
  };
}

export async function getAllPostSlugs(): Promise<string[]> {
  return listSlugs(POSTS_DIR);
}

// ─── Resources ───────────────────────────────────────────────────

export type ResourceCategory =
  | "recommended-projects"
  | "open-source-tools"
  | "learning-resources";

export interface ResourceMeta {
  slug: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  category: ResourceCategory;
  url: string;
  date: string;
  tagsZh: string[];
  tagsEn: string[];
  image: string | null;
}

export interface Resource extends ResourceMeta {
  contentHtmlZh: string | null;
  contentHtmlEn: string | null;
}

function parseResourceMeta(
  slug: string,
  data: Record<string, unknown>
): ResourceMeta {
  return {
    slug,
    titleZh: data.titleZh as string,
    titleEn: data.titleEn as string,
    descriptionZh: data.descriptionZh as string,
    descriptionEn: data.descriptionEn as string,
    category: data.category as ResourceCategory,
    url: data.url as string,
    date: data.date as string,
    tagsZh: (data.tagsZh as string[]) ?? [],
    tagsEn: (data.tagsEn as string[]) ?? [],
    image: (data.image as string) ?? null,
  };
}

export async function getAllResources(): Promise<ResourceMeta[]> {
  const slugs = getAllResourceSlugs();

  const resources = slugs
    .map((slug) => {
      const primaryPath = resolvePrimaryFile(RESOURCES_DIR, slug);
      if (!primaryPath) return null;
      const { data } = matter(fs.readFileSync(primaryPath, "utf8"));
      return parseResourceMeta(slug, data);
    })
    .filter((r): r is ResourceMeta => r !== null);

  return resources.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getResourceBySlug(
  slug: string
): Promise<Resource | null> {
  if (!isValidSlug(slug)) return null;

  const primaryPath = resolvePrimaryFile(RESOURCES_DIR, slug);
  const enPath = path.join(RESOURCES_DIR, slug, "index.en.md");
  const enExists = fs.existsSync(enPath);
  if (!primaryPath && !enExists) return null;

  const metaPath = primaryPath ?? enPath;
  const { data } = matter(fs.readFileSync(metaPath, "utf8"));
  const bilingual = await readBilingualContent(RESOURCES_DIR, slug);

  return {
    ...parseResourceMeta(slug, data),
    contentHtmlZh: bilingual?.zhHtml ?? null,
    contentHtmlEn: bilingual?.enHtml ?? null,
  };
}

export function getAllResourceSlugs(): string[] {
  return listSlugs(RESOURCES_DIR);
}

// ─── What's New ──────────────────────────────────────────────────

export interface WhatsNewItem {
  titleZh: string;
  titleEn: string;
  href: string;
  color: string;
  date: string;
}

const WHATS_NEW_LIMIT = 5;

export async function getWhatsNew(): Promise<WhatsNewItem[]> {
  // 1. Auto-generate from recent posts
  const posts = await getAllPosts();
  const postItems: WhatsNewItem[] = posts.map((p) => ({
    titleZh: `发布新文章：${p.titleZh}`,
    titleEn: `New post: ${p.titleEn}`,
    href: `/blog/${p.slug}`,
    color: "#22c55e", // green
    date: p.date,
  }));

  // 2. Auto-generate from recent resources
  const resources = await getAllResources();
  const resourceItems: WhatsNewItem[] = resources.map((r) => ({
    titleZh: `新增资源：${r.titleZh}`,
    titleEn: `New resource: ${r.titleEn}`,
    href: `/resources/${r.slug}`,
    color: "#a855f7", // purple
    date: r.date,
  }));

  // 3. Manual announcements from JSON
  const jsonPath = path.join(CONTENT_DIR, "whats-new.json");
  let manualItems: WhatsNewItem[] = [];
  if (fs.existsSync(jsonPath)) {
    manualItems = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  }

  // Merge, sort by date descending, take top N
  return [...postItems, ...resourceItems, ...manualItems]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, WHATS_NEW_LIMIT);
}
