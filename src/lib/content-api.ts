import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

// --- Auth ---

export function authenticateRequest(
  request: NextRequest
): { error: string; status: number } | null {
  const apiKey = process.env.CONTENT_API_KEY;
  if (!apiKey) {
    return { error: "CONTENT_API_KEY not configured on server", status: 500 };
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Missing or invalid Authorization header", status: 401 };
  }

  const token = authHeader.slice(7);
  if (token !== apiKey) {
    return { error: "Invalid API key", status: 403 };
  }

  return null;
}

// --- Slug Validation ---

const VALID_SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
const MAX_SLUG_LENGTH = 100;

export function validateSlug(
  slug: unknown
): { value: string } | { error: string } {
  if (typeof slug !== "string" || slug.length === 0) {
    return { error: "slug is required and must be a string" };
  }
  if (slug.length > MAX_SLUG_LENGTH) {
    return { error: `slug must be ${MAX_SLUG_LENGTH} characters or less` };
  }
  if (!VALID_SLUG_RE.test(slug)) {
    return {
      error:
        "slug must contain only lowercase letters, numbers, and hyphens, and must start/end with a letter or number",
    };
  }
  if (slug.includes("--")) {
    return { error: "slug must not contain consecutive hyphens" };
  }
  return { value: slug };
}

// --- Image Handling ---

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB per image
const ALLOWED_IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp", "gif", "svg"]);
const VALID_FILENAME_RE = /^[a-z0-9][a-z0-9._-]*\.[a-z]+$/;

export interface ImageInput {
  filename: string;
  data: string; // base64
}

export function validateImage(
  img: unknown,
  index: number
): { error: string } | null {
  if (typeof img !== "object" || img === null) {
    return { error: `images[${index}]: must be an object` };
  }

  const { filename, data } = img as Record<string, unknown>;

  if (typeof filename !== "string" || !VALID_FILENAME_RE.test(filename)) {
    return {
      error: `images[${index}]: invalid filename (lowercase alphanumeric, dots, hyphens only)`,
    };
  }

  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
    return {
      error: `images[${index}]: unsupported format '${ext}', allowed: ${[...ALLOWED_IMAGE_EXTENSIONS].join(", ")}`,
    };
  }

  if (typeof data !== "string" || data.length === 0) {
    return { error: `images[${index}]: data must be a non-empty base64 string` };
  }

  const sizeBytes = Math.ceil((data.length * 3) / 4);
  if (sizeBytes > MAX_IMAGE_SIZE) {
    return {
      error: `images[${index}]: exceeds ${MAX_IMAGE_SIZE / 1024 / 1024}MB limit`,
    };
  }

  return null;
}

// --- File System Helpers ---

const PROJECT_ROOT = process.cwd();

export function writeContentFile(
  relativePath: string,
  content: string
): void {
  const fullPath = path.join(PROJECT_ROOT, relativePath);
  const dir = path.dirname(fullPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content, "utf-8");
}

export function writeImageFile(
  relativePath: string,
  base64Data: string
): void {
  const fullPath = path.join(PROJECT_ROOT, relativePath);
  const dir = path.dirname(fullPath);
  fs.mkdirSync(dir, { recursive: true });
  const buffer = Buffer.from(base64Data, "base64");
  fs.writeFileSync(fullPath, buffer);
}

export function contentFileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(PROJECT_ROOT, relativePath));
}

// --- Frontmatter Builder ---

export function buildPostFrontmatter(meta: {
  titleZh: string;
  titleEn: string;
  excerptZh: string;
  excerptEn: string;
  date: string;
  tagsZh: string[];
  tagsEn: string[];
  image: string;
}): string {
  return [
    "---",
    `titleZh: ${JSON.stringify(meta.titleZh)}`,
    `titleEn: ${JSON.stringify(meta.titleEn)}`,
    `excerptZh: ${JSON.stringify(meta.excerptZh)}`,
    `excerptEn: ${JSON.stringify(meta.excerptEn)}`,
    `date: ${JSON.stringify(meta.date)}`,
    `tagsZh: ${JSON.stringify(meta.tagsZh)}`,
    `tagsEn: ${JSON.stringify(meta.tagsEn)}`,
    `image: ${JSON.stringify(meta.image)}`,
    "---",
  ].join("\n");
}

export function buildResourceFrontmatter(meta: {
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  category: string;
  url: string;
  date: string;
  tagsZh: string[];
  tagsEn: string[];
  image: string | null;
}): string {
  return [
    "---",
    `titleZh: ${JSON.stringify(meta.titleZh)}`,
    `titleEn: ${JSON.stringify(meta.titleEn)}`,
    `descriptionZh: ${JSON.stringify(meta.descriptionZh)}`,
    `descriptionEn: ${JSON.stringify(meta.descriptionEn)}`,
    `category: ${JSON.stringify(meta.category)}`,
    `url: ${JSON.stringify(meta.url)}`,
    `date: ${JSON.stringify(meta.date)}`,
    `tagsZh: ${JSON.stringify(meta.tagsZh)}`,
    `tagsEn: ${JSON.stringify(meta.tagsEn)}`,
    `image: ${meta.image ? JSON.stringify(meta.image) : "null"}`,
    "---",
  ].join("\n");
}

// --- String Validators ---

export function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((item) => typeof item === "string");
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export function isValidDate(v: unknown): v is string {
  return typeof v === "string" && DATE_RE.test(v);
}
