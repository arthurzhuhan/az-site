import { describe, it, expect } from "vitest";
import {
  validateSlug,
  validateImage,
  isNonEmptyString,
  isStringArray,
  isValidDate,
  buildPostFrontmatter,
  buildResourceFrontmatter,
} from "../content-api";

describe("validateSlug", () => {
  it("accepts valid slugs", () => {
    expect(validateSlug("hello-world")).toEqual({ value: "hello-world" });
    expect(validateSlug("ai-2027")).toEqual({ value: "ai-2027" });
    expect(validateSlug("moloch-lives-in-your-okr")).toEqual({
      value: "moloch-lives-in-your-okr",
    });
  });

  it("rejects empty or non-string", () => {
    expect(validateSlug("")).toHaveProperty("error");
    expect(validateSlug(null)).toHaveProperty("error");
    expect(validateSlug(123)).toHaveProperty("error");
    expect(validateSlug(undefined)).toHaveProperty("error");
  });

  it("rejects uppercase", () => {
    expect(validateSlug("Hello-World")).toHaveProperty("error");
  });

  it("rejects path traversal", () => {
    expect(validateSlug("../etc/passwd")).toHaveProperty("error");
    expect(validateSlug("a/b")).toHaveProperty("error");
  });

  it("rejects consecutive hyphens", () => {
    expect(validateSlug("hello--world")).toHaveProperty("error");
  });

  it("rejects slugs starting/ending with hyphen", () => {
    expect(validateSlug("-hello")).toHaveProperty("error");
    expect(validateSlug("hello-")).toHaveProperty("error");
  });

  it("rejects overly long slugs", () => {
    const longSlug = "a".repeat(101);
    expect(validateSlug(longSlug)).toHaveProperty("error");
  });

  it("accepts single character slugs as invalid (needs start+end)", () => {
    // Single char fails the regex since it requires start AND end to be alphanumeric
    // with something in between
    expect(validateSlug("a")).toHaveProperty("error");
  });

  it("accepts two-character slugs", () => {
    expect(validateSlug("ab")).toEqual({ value: "ab" });
  });
});

describe("validateImage", () => {
  it("accepts valid image", () => {
    const img = { filename: "hero.png", data: "aGVsbG8=" };
    expect(validateImage(img, 0)).toBeNull();
  });

  it("rejects non-object", () => {
    expect(validateImage("string", 0)).toHaveProperty("error");
    expect(validateImage(null, 0)).toHaveProperty("error");
  });

  it("rejects invalid filename", () => {
    expect(
      validateImage({ filename: "../hack.png", data: "aGVsbG8=" }, 0)
    ).toHaveProperty("error");
    expect(
      validateImage({ filename: "UPPER.PNG", data: "aGVsbG8=" }, 0)
    ).toHaveProperty("error");
  });

  it("rejects unsupported format", () => {
    expect(
      validateImage({ filename: "file.bmp", data: "aGVsbG8=" }, 0)
    ).toHaveProperty("error");
  });

  it("rejects empty data", () => {
    expect(
      validateImage({ filename: "hero.png", data: "" }, 0)
    ).toHaveProperty("error");
  });

  it("rejects oversized image", () => {
    const bigData = "A".repeat(7 * 1024 * 1024); // ~5.25MB decoded
    expect(
      validateImage({ filename: "hero.png", data: bigData }, 0)
    ).toHaveProperty("error");
  });
});

describe("isNonEmptyString", () => {
  it("returns true for non-empty strings", () => {
    expect(isNonEmptyString("hello")).toBe(true);
  });

  it("returns false for empty/whitespace/non-string", () => {
    expect(isNonEmptyString("")).toBe(false);
    expect(isNonEmptyString("  ")).toBe(false);
    expect(isNonEmptyString(null)).toBe(false);
    expect(isNonEmptyString(123)).toBe(false);
  });
});

describe("isStringArray", () => {
  it("returns true for string arrays", () => {
    expect(isStringArray(["a", "b"])).toBe(true);
    expect(isStringArray([])).toBe(true);
  });

  it("returns false for non-arrays or mixed arrays", () => {
    expect(isStringArray("string")).toBe(false);
    expect(isStringArray([1, 2])).toBe(false);
    expect(isStringArray(["a", 1])).toBe(false);
  });
});

describe("isValidDate", () => {
  it("accepts YYYY-MM-DD", () => {
    expect(isValidDate("2026-03-19")).toBe(true);
  });

  it("rejects other formats", () => {
    expect(isValidDate("03/19/2026")).toBe(false);
    expect(isValidDate("2026")).toBe(false);
    expect(isValidDate("")).toBe(false);
    expect(isValidDate(null)).toBe(false);
  });
});

describe("buildPostFrontmatter", () => {
  it("builds valid YAML frontmatter", () => {
    const result = buildPostFrontmatter({
      titleZh: "测试标题",
      titleEn: "Test Title",
      excerptZh: "摘要",
      excerptEn: "Excerpt",
      date: "2026-03-19",
      tagsZh: ["AI", "测试"],
      tagsEn: ["AI", "Test"],
      image: "/blog/test/hero.png",
    });

    expect(result).toContain("---");
    expect(result).toContain('"测试标题"');
    expect(result).toContain('"Test Title"');
    expect(result).toContain('"2026-03-19"');
    expect(result).toContain('["AI","测试"]');
  });
});

describe("buildResourceFrontmatter", () => {
  it("builds valid resource frontmatter", () => {
    const result = buildResourceFrontmatter({
      titleZh: "资源",
      titleEn: "Resource",
      descriptionZh: "描述",
      descriptionEn: "Description",
      category: "open-source-tools",
      url: "https://example.com",
      date: "2026-03-01",
      tagsZh: ["AI"],
      tagsEn: ["AI"],
      image: null,
    });

    expect(result).toContain("---");
    expect(result).toContain('"open-source-tools"');
    expect(result).toContain("image: null");
  });
});
