import { NextRequest } from "next/server";
import {
  authenticateRequest,
  writeContentFile,
  isNonEmptyString,
  isValidDate,
} from "@/lib/content-api";

interface WhatsNewItem {
  titleZh: string;
  titleEn: string;
  href: string;
  color: string;
  date: string;
}

const VALID_COLORS = new Set([
  "blue", "green", "purple", "orange", "red", "yellow", "pink", "teal",
]);

function validateItems(
  body: unknown
): { value: WhatsNewItem[] } | { error: string } {
  if (!Array.isArray(body)) {
    return { error: "Request body must be a JSON array of items" };
  }

  const items: WhatsNewItem[] = [];

  for (let i = 0; i < body.length; i++) {
    const item = body[i];
    if (typeof item !== "object" || item === null) {
      return { error: `items[${i}]: must be an object` };
    }

    const { titleZh, titleEn, href, color, date } = item as Record<string, unknown>;

    if (!isNonEmptyString(titleZh)) return { error: `items[${i}]: titleZh required` };
    if (!isNonEmptyString(titleEn)) return { error: `items[${i}]: titleEn required` };
    if (!isNonEmptyString(href)) return { error: `items[${i}]: href required` };
    if (!isNonEmptyString(color) || !VALID_COLORS.has(color as string)) {
      return { error: `items[${i}]: color must be one of: ${[...VALID_COLORS].join(", ")}` };
    }
    if (!isValidDate(date)) return { error: `items[${i}]: date must be YYYY-MM-DD` };

    items.push({
      titleZh: titleZh as string,
      titleEn: titleEn as string,
      href: href as string,
      color: color as string,
      date: date as string,
    });
  }

  return { value: items };
}

export async function PUT(request: NextRequest) {
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

  const result = validateItems(body);
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  try {
    writeContentFile(
      "content/whats-new.json",
      JSON.stringify(result.value, null, 2)
    );

    return Response.json({
      ok: true,
      count: result.value.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { error: `Failed to write file: ${message}` },
      { status: 500 }
    );
  }
}
