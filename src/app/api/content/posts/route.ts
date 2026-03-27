import { NextRequest } from "next/server";
import {
  authenticateRequest,
  validateSlug,
  validateImage,
  writeContentFile,
  writeImageFile,
  contentFileExists,
  buildPostFrontmatter,
  isNonEmptyString,
  isStringArray,
  isValidDate,
  type ImageInput,
} from "@/lib/content-api";

const MAX_BODY_SIZE = 20 * 1024 * 1024; // 20MB

interface PostBody {
  slug: string;
  titleZh: string;
  titleEn: string;
  excerptZh: string;
  excerptEn: string;
  date: string;
  tagsZh: string[];
  tagsEn: string[];
  contentZh: string;
  contentEn: string;
  images?: ImageInput[];
}

function validateBody(
  body: unknown
): { value: PostBody } | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "Request body must be a JSON object" };
  }

  const b = body as Record<string, unknown>;

  const slugResult = validateSlug(b.slug);
  if ("error" in slugResult) return { error: slugResult.error };

  if (!isNonEmptyString(b.titleZh)) return { error: "titleZh is required" };
  if (!isNonEmptyString(b.titleEn)) return { error: "titleEn is required" };
  if (!isNonEmptyString(b.excerptZh)) return { error: "excerptZh is required" };
  if (!isNonEmptyString(b.excerptEn)) return { error: "excerptEn is required" };
  if (!isValidDate(b.date)) return { error: "date must be YYYY-MM-DD format" };
  if (!isStringArray(b.tagsZh)) return { error: "tagsZh must be a string array" };
  if (!isStringArray(b.tagsEn)) return { error: "tagsEn must be a string array" };
  if (!isNonEmptyString(b.contentZh)) return { error: "contentZh is required" };
  if (!isNonEmptyString(b.contentEn)) return { error: "contentEn is required" };

  if (b.images !== undefined) {
    if (!Array.isArray(b.images)) return { error: "images must be an array" };
    for (let i = 0; i < b.images.length; i++) {
      const imgErr = validateImage(b.images[i], i);
      if (imgErr) return { error: imgErr.error };
    }
  }

  return {
    value: {
      slug: slugResult.value,
      titleZh: b.titleZh as string,
      titleEn: b.titleEn as string,
      excerptZh: b.excerptZh as string,
      excerptEn: b.excerptEn as string,
      date: b.date as string,
      tagsZh: b.tagsZh as string[],
      tagsEn: b.tagsEn as string[],
      contentZh: b.contentZh as string,
      contentEn: b.contentEn as string,
      images: (b.images as ImageInput[]) ?? [],
    },
  };
}

export async function POST(request: NextRequest) {
  // Auth
  const authErr = authenticateRequest(request);
  if (authErr) {
    return Response.json({ error: authErr.error }, { status: authErr.status });
  }

  // Size check
  const contentLength = parseInt(
    request.headers.get("content-length") ?? "0",
    10
  );
  if (contentLength > MAX_BODY_SIZE) {
    return Response.json(
      { error: `Request body exceeds ${MAX_BODY_SIZE / 1024 / 1024}MB limit` },
      { status: 413 }
    );
  }

  // Parse
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate
  const result = validateBody(body);
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  const post = result.value;
  const isUpdate = contentFileExists(`content/posts/${post.slug}/index.zh.md`);

  try {
    // Write images to public/blog/[slug]/
    const images = post.images ?? [];
    for (const img of images) {
      writeImageFile(`public/blog/${post.slug}/${img.filename}`, img.data);
    }

    // Determine cover image path
    const coverImage = images.some((img) => img.filename.startsWith("hero"))
      ? `/blog/${post.slug}/hero.png`
      : images.length > 0
        ? `/blog/${post.slug}/${images[0].filename}`
        : `/blog/${post.slug}/hero.png`;

    // Build Chinese file (frontmatter + HTML)
    const frontmatter = buildPostFrontmatter({
      titleZh: post.titleZh,
      titleEn: post.titleEn,
      excerptZh: post.excerptZh,
      excerptEn: post.excerptEn,
      date: post.date,
      tagsZh: post.tagsZh,
      tagsEn: post.tagsEn,
      image: coverImage,
    });

    writeContentFile(
      `content/posts/${post.slug}/index.zh.md`,
      `${frontmatter}\n\n${post.contentZh}`
    );

    // Build English file (pure HTML, no frontmatter)
    writeContentFile(
      `content/posts/${post.slug}/index.en.md`,
      post.contentEn
    );

    return Response.json({
      ok: true,
      action: isUpdate ? "updated" : "created",
      slug: post.slug,
      url: `/blog/${post.slug}`,
      files: {
        zh: `content/posts/${post.slug}/index.zh.md`,
        en: `content/posts/${post.slug}/index.en.md`,
        images: images.map((img) => `public/blog/${post.slug}/${img.filename}`),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { error: `Failed to write files: ${message}` },
      { status: 500 }
    );
  }
}
