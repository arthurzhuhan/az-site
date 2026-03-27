import { NextRequest } from "next/server";
import {
  authenticateRequest,
  writeContentFile,
  isNonEmptyString,
} from "@/lib/content-api";

interface PersonaBody {
  personaZh: string;
  personaEn: string;
}

function validateBody(
  body: unknown
): { value: PersonaBody } | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "Request body must be a JSON object" };
  }

  const b = body as Record<string, unknown>;

  if (!isNonEmptyString(b.personaZh)) {
    return { error: "personaZh is required" };
  }
  if (!isNonEmptyString(b.personaEn)) {
    return { error: "personaEn is required" };
  }

  return {
    value: {
      personaZh: b.personaZh as string,
      personaEn: b.personaEn as string,
    },
  };
}

function buildPersonaFile(zh: string, en: string): string {
  return `import { Lang } from "./types";

const BASE_PERSONA_ZH = ${JSON.stringify(zh)};

const BASE_PERSONA_EN = ${JSON.stringify(en)};

export function buildSystemPrompt(lang: Lang, articleCatalog: string): string {
  const persona = lang === "zh" ? BASE_PERSONA_ZH : BASE_PERSONA_EN;
  const catalogHeader = lang === "zh"
    ? "## 我的内容目录（博文和资源）"
    : "## My Content Catalog (blog posts and resources)";

  return \`\${persona}\\n\\n\${catalogHeader}\\n\\n\${articleCatalog}\`;
}
`;
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

  const result = validateBody(body);
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  try {
    const fileContent = buildPersonaFile(
      result.value.personaZh,
      result.value.personaEn
    );

    writeContentFile("src/lib/chat/persona.ts", fileContent);

    return Response.json({
      ok: true,
      message: "Persona updated. Server restart may be needed for changes to take effect.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { error: `Failed to write persona: ${message}` },
      { status: 500 }
    );
  }
}
