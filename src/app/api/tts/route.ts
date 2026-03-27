import { NextRequest } from "next/server";

const MAX_TEXT_LENGTH = 5000;

export async function POST(request: NextRequest) {
  const provider = process.env.TTS_PROVIDER;

  if (!provider) {
    return new Response(
      JSON.stringify({ error: "TTS not configured. Using browser native." }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const { text } = (await request.json()) as { text?: string };

  if (!text || typeof text !== "string" || text.length === 0) {
    return new Response(JSON.stringify({ error: "No text provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return new Response(
      JSON.stringify({
        error: `Text too long (max ${MAX_TEXT_LENGTH} chars)`,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    if (provider === "openai") {
      return await handleOpenAITTS(text);
    }

    return new Response(
      JSON.stringify({ error: `Unknown TTS provider: ${provider}` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Failed to connect to TTS service" }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}

async function handleOpenAITTS(text: string): Promise<Response> {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({
    apiKey: process.env.TTS_API_KEY || process.env.OPENAI_API_KEY || "not-configured",
  });

  const mp3 = await client.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: text,
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());
  return new Response(buffer, {
    headers: { "Content-Type": "audio/mpeg" },
  });
}
