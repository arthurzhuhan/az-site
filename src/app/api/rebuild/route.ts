import { NextRequest } from "next/server";
import { exec } from "child_process";
import { authenticateRequest } from "@/lib/content-api";

const COOLDOWN_MS = 60_000;
const DEFAULT_REBUILD_CMD = "npx next build";

let lastRebuildAt = 0;

export async function POST(request: NextRequest) {
  const authError = authenticateRequest(request);
  if (authError) {
    return new Response(JSON.stringify({ error: authError.error }), {
      status: authError.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const now = Date.now();
  if (now - lastRebuildAt < COOLDOWN_MS) {
    const remaining = Math.ceil((COOLDOWN_MS - (now - lastRebuildAt)) / 1000);
    return new Response(
      JSON.stringify({
        error: `Rebuild in cooldown. Try again in ${remaining}s.`,
      }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  lastRebuildAt = now;

  const rebuildCmd = process.env.REBUILD_CMD || DEFAULT_REBUILD_CMD;

  exec(rebuildCmd, { cwd: process.cwd() });

  return new Response(
    JSON.stringify({ ok: true, message: "Rebuild started" }),
    { status: 202, headers: { "Content-Type": "application/json" } }
  );
}
