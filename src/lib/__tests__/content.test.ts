import { describe, it, expect } from "vitest";
import {
  getAllPosts,
  getPostBySlug,
  getWhatsNew,
  getAllPostSlugs,
} from "../content";

describe("getAllPosts()", () => {
  it("returns a PostMeta array", async () => {
    const posts = await getAllPosts();
    expect(Array.isArray(posts)).toBe(true);
  });

  it("returns the correct number of posts", async () => {
    const posts = await getAllPosts();
    expect(posts.length).toBeGreaterThanOrEqual(5);
  });

  it("returns posts sorted by date descending", async () => {
    const posts = await getAllPosts();
    for (let i = 0; i < posts.length - 1; i++) {
      expect(new Date(posts[i].date).getTime()).toBeGreaterThanOrEqual(
        new Date(posts[i + 1].date).getTime()
      );
    }
  });

  it("each post has required PostMeta fields", async () => {
    const posts = await getAllPosts();
    for (const post of posts) {
      expect(typeof post.slug).toBe("string");
      expect(typeof post.titleZh).toBe("string");
      expect(typeof post.titleEn).toBe("string");
      expect(typeof post.excerptZh).toBe("string");
      expect(typeof post.excerptEn).toBe("string");
      expect(typeof post.date).toBe("string");
      expect(Array.isArray(post.tagsZh)).toBe(true);
      expect(Array.isArray(post.tagsEn)).toBe(true);
      expect(typeof post.image).toBe("string");
    }
  });
});

describe("getPostBySlug()", () => {
  it("returns a Post with bilingual contentHtml for a valid slug", async () => {
    const post = await getPostBySlug("ai-brain-fatigue");
    expect(post).not.toBeNull();
    expect(post!.contentHtmlZh).not.toBeNull();
    expect(post!.contentHtmlZh!.length).toBeGreaterThan(0);
    expect(post!.contentHtmlEn).not.toBeNull();
    expect(post!.contentHtmlEn!.length).toBeGreaterThan(0);
  });

  it("returns all PostMeta fields for a valid slug", async () => {
    const post = await getPostBySlug("ai-brain-fatigue");
    expect(post).not.toBeNull();
    expect(post!.slug).toBe("ai-brain-fatigue");
    expect(typeof post!.titleZh).toBe("string");
    expect(typeof post!.titleEn).toBe("string");
  });

  it("returns null for a nonexistent slug", async () => {
    const post = await getPostBySlug("nonexistent");
    expect(post).toBeNull();
  });

  it("returns null for a slug with path traversal characters (..)", async () => {
    const post = await getPostBySlug("../whats-new");
    expect(post).toBeNull();
  });

  it("returns null for a slug with forward slash", async () => {
    const post = await getPostBySlug("posts/ai-first-workflow");
    expect(post).toBeNull();
  });

  it("returns null for a slug with invalid characters", async () => {
    const post = await getPostBySlug("ai_first_workflow!");
    expect(post).toBeNull();
  });
});

describe("getWhatsNew()", () => {
  it("returns an array", async () => {
    const items = await getWhatsNew();
    expect(Array.isArray(items)).toBe(true);
  });

  it("returns items", async () => {
    const items = await getWhatsNew();
    expect(items.length).toBeGreaterThanOrEqual(1);
  });

  it("each item has required WhatsNewItem fields", async () => {
    const items = await getWhatsNew();
    for (const item of items) {
      expect(typeof item.titleZh).toBe("string");
      expect(typeof item.titleEn).toBe("string");
      expect(typeof item.href).toBe("string");
      expect(typeof item.color).toBe("string");
      expect(typeof item.date).toBe("string");
    }
  });
});

describe("getAllPostSlugs()", () => {
  it("returns a string array", async () => {
    const slugs = await getAllPostSlugs();
    expect(Array.isArray(slugs)).toBe(true);
    for (const slug of slugs) {
      expect(typeof slug).toBe("string");
    }
  });

  it("returns directory names of all posts", async () => {
    const slugs = await getAllPostSlugs();
    expect(slugs).toContain("ai-brain-fatigue");
    expect(slugs).toContain("ai-didnt-make-you-slower");
    expect(slugs).toContain("antirez-ai-programming");
  });

  it("returns slugs matching the post count", async () => {
    const slugs = await getAllPostSlugs();
    expect(slugs.length).toBeGreaterThanOrEqual(5);
  });
});
