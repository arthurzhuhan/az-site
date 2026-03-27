import { describe, it, expect } from "vitest";
import { buildKnowledgeIndex, buildArticleCatalog, getArticleContent } from "@/lib/chat/knowledge";

describe("buildKnowledgeIndex", () => {
  it("returns an array of knowledge entries from content files", () => {
    const index = buildKnowledgeIndex();
    expect(index.length).toBeGreaterThan(0);
    expect(index[0]).toHaveProperty("slug");
    expect(index[0]).toHaveProperty("titleZh");
    expect(index[0]).toHaveProperty("contentZh");
  });
});

describe("buildArticleCatalog", () => {
  it("returns a formatted catalog string with all entries", () => {
    const index = buildKnowledgeIndex();
    const catalog = buildArticleCatalog("zh", index);
    expect(catalog).toContain("slug=");
    expect(catalog).toContain("博文");
    expect(catalog.split("\n").length).toBeGreaterThanOrEqual(index.length);
  });
});

describe("getArticleContent", () => {
  it("returns full content for a valid slug", () => {
    const index = buildKnowledgeIndex();
    const firstSlug = index[0].slug;
    const content = getArticleContent(firstSlug, "zh", index);
    expect(content).not.toBeNull();
    expect(content).toContain(index[0].titleZh);
  });

  it("returns null for an invalid slug", () => {
    const index = buildKnowledgeIndex();
    const content = getArticleContent("nonexistent-slug", "zh", index);
    expect(content).toBeNull();
  });
});
