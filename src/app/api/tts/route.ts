import { NextRequest } from "next/server";

const TTS_URL = "https://openspeech.bytedance.com/api/v3/tts/unidirectional";
const MAX_TEXT_LENGTH = 5000;

export async function POST(request: NextRequest) {
  const { text } = (await request.json()) as { text?: string };

  if (!text || typeof text !== "string" || text.length === 0) {
    return new Response(JSON.stringify({ error: "No text provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return new Response(
      JSON.stringify({ error: `Text too long (max ${MAX_TEXT_LENGTH} chars)` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const appId = process.env.TTS_APP_ID ?? "";
  const accessToken = process.env.TTS_ACCESS_TOKEN ?? "";
  const voice = process.env.TTS_VOICE ?? "zh_male_shenyeboke_emo_v2_mars_bigtts";

  try {
    const response = await fetch(TTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-App-Key": appId,
        "X-Api-Access-Key": accessToken,
        "X-Api-Resource-Id": "seed-tts-1.0",
      },
      body: JSON.stringify({
        user: { uid: "web-chat" },
        req_params: {
          text,
          speaker: voice,
          audio_params: {
            format: "mp3",
            sample_rate: 24000,
            bit_rate: 128000,
          },
        },
      }),
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "TTS service unavailable" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // Response is chunked: multiple JSON lines, each may contain base64 audio in `data`
    const body = await response.text();
    const lines = body.trim().split("\n");
    const audioChunks: Buffer[] = [];

    for (const line of lines) {
      const chunk = JSON.parse(line) as { code: number; message: string; data?: string };
      if (chunk.data) {
        audioChunks.push(Buffer.from(chunk.data, "base64"));
      }
      // code 20000000 = final "OK" chunk, code 0 = data chunk
      if (chunk.code !== 0 && chunk.code !== 20000000) {
        return new Response(
          JSON.stringify({ error: chunk.message || "TTS failed" }),
          { status: 502, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const audioBuffer = Buffer.concat(audioChunks);

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Failed to connect to TTS service" }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}
