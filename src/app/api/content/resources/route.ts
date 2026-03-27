import { NextRequest } from "next/server";
import {
  authenticateRequest,
  validateSlug,
  writeContentFile,
  contentFileExists,
  buildResourceFrontmatter,
  isNonEmptyString,
  isStringArray,
  isValidDate,
} from "@/lib/content-api";

const VALID_CATEGORIES = new Set([
  "recommended-projects",
  "open-source-tools",
  "learning-resources",
]);

interface ResourceBody {
  slug: string;
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
  contentZh: string;
  contentEn: string;
}

function validateBody(
  body: unknown
): { value: ResourceBody } | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "Request body must be a JSON object" };
  }

  const b = body as Record<string, unknown>;

  const slugResult = validateSlug(b.slug);
  if ("error" in slugResult) return { error: slugResult.error };

  if (!isNonEmptyString(b.titleZh)) return { error: "titleZh is required" };
  if (!isNonEmptyString(b.titleEn)) return { error: "titleEn is required" };
  if (!isNonEmptyString(b.descriptionZh)) return { error: "descriptionZh is required" };
  if (!isNonEmptyString(b.descriptionEn)) return { error: "descriptionEn is required" };
  if (!isNonEmptyString(b.category) || !VALID_CATEGORIES.has(b.category as string)) {
    return { error: `category must be one of: ${[...VALID_CATEGORIES].join(", ")}` };
  }
  if (!isNonEmptyString(b.url)) return { error: "url is required" };
  if (!isValidDate(b.date)) return { error: "date must be YYYY-MM-DD format" };
  if (!isStringArray(b.tagsZh)) return { error: "tagsZh must be a string array" };
  if (!isStringArray(b.tagsEn)) return { error: "tagsEn must be a string array" };
  if (!isNonEmptyString(b.contentZh)) return { error: "contentZh is required" };
  if (!isNonEmptyString(b.contentEn)) return { error: "contentEn is required" };

  return {
    value: {
      slug: slugResult.value,
      titleZh: b.titleZh as string,
      titleEn: b.titleEn as string,
      descriptionZh: b.descriptionZh as string,
      descriptionEn: b.descriptionEn as string,
      category: b.category as string,
      url: b.url as string,
      date: b.date as string,
      tagsZh: b.tagsZh as string[],
      tagsEn: b.tagsEn as string[],
      image: typeof b.image === "string" ? b.image : null,
      contentZh: b.contentZh as string,
      contentEn: b.contentEn as string,
    },
  };
}

export async function POST(request: NextRequest) {
  const authErr = authenticateRequest(request);
  if (authErr) {
    return Response.json({ error: authErr.error }, { status: authErr.status });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = validateBody(body);
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  const resource = result.value;
  const isUpdate = contentFileExists(
    `content/resources/${resource.slug}/index.zh.md`
  );

  try {
    const frontmatter = buildResourceFrontmatter({
      titleZh: resource.titleZh,
      titleEn: resource.titleEn,
      descriptionZh: resource.descriptionZh,
      descriptionEn: resource.descriptionEn,
      category: resource.category,
      url: resource.url,
      date: resource.date,
      tagsZh: resource.tagsZh,
      tagsEn: resource.tagsEn,
      image: resource.image,
    });

    writeContentFile(
      `content/resources/${resource.slug}/index.zh.md`,
      `${frontmatter}\n\n${resource.contentZh}`
    );

    writeContentFile(
      `content/resources/${resource.slug}/index.en.md`,
      resource.contentEn
    );

    return Response.json({
      ok: true,
      action: isUpdate ? "updated" : "created",
      slug: resource.slug,
      url: `/resources/${resource.slug}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { error: `Failed to write files: ${message}` },
      { status: 500 }
    );
  }
}
