import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "@/lib/chat/persona";

describe("buildSystemPrompt", () => {
  it("returns Chinese prompt when lang is zh", () => {
    const prompt = buildSystemPrompt("zh", "");
    expect(prompt).toContain("Arthur");
    expect(prompt).toContain("中文");
  });

  it("returns English prompt when lang is en", () => {
    const prompt = buildSystemPrompt("en", "");
    expect(prompt).toContain("Arthur");
    expect(prompt).toContain("English");
  });

  it("includes article catalog when provided", () => {
    const catalog = '- [博文] slug="ai-test" 《AI Test》 标签:AI — Some excerpt';
    const prompt = buildSystemPrompt("zh", catalog);
    expect(prompt).toContain("AI Test");
    expect(prompt).toContain("ai-test");
  });
});
