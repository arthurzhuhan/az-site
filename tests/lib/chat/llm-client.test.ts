import { describe, it, expect, vi, beforeEach } from "vitest";
import { createLLMClient, buildChatParams } from "@/lib/chat/llm-client";

describe("createLLMClient", () => {
  beforeEach(() => {
    vi.stubEnv("ARK_API_KEY", "test-key");
    vi.stubEnv("ARK_BASE_URL", "https://test.example.com/v3");
  });

  it("returns an OpenAI client configured with Ark env vars", () => {
    const client = createLLMClient();
    expect(client).toBeDefined();
    expect(client.chat).toBeDefined();
    expect(client.baseURL).toBe("https://test.example.com/v3");
    expect(client.apiKey).toBe("test-key");
  });
});

describe("buildChatParams", () => {
  it("builds params with system prompt and messages", () => {
    const params = buildChatParams("You are Arthur", [
      { role: "user", content: "hello" },
    ]);
    expect(params.messages[0]).toEqual({ role: "system", content: "You are Arthur" });
    expect(params.messages[1]).toEqual({ role: "user", content: "hello" });
    expect(params.stream).toBe(true);
  });
});
