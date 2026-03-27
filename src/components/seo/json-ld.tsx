import type { PostMeta, ResourceMeta } from "@/lib/content";

const BASE_URL = "https://ziut.cn";

const PERSON = {
  "@type": "Person",
  name: "Arthur Zhu",
  url: BASE_URL,
  jobTitle: "AI Entrepreneur",
  knowsAbout: ["AI", "Programming", "Startup", "Web Development"],
  sameAs: [
    "https://github.com/arthurzhuhan",
    "https://x.com/Arthur__Ju",
    "https://www.tiktok.com/@arthurzhuhan",
  ],
};

export function WebsiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        url: BASE_URL,
        name: "Arthur Zhu",
        description:
          "Arthur Zhu 的个人空间 — AI 创业者、技术写作者",
        author: PERSON,
      },
      { ...PERSON, "@context": undefined },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BlogPostJsonLd({ post }: { post: PostMeta }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.titleZh,
    alternativeHeadline: post.titleEn,
    description: post.excerptZh,
    image: post.image ? `${BASE_URL}${post.image}` : undefined,
    datePublished: post.date,
    author: PERSON,
    publisher: PERSON,
    url: `${BASE_URL}/blog/${post.slug}`,
    keywords: [...post.tagsZh, ...post.tagsEn].join(", "),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ResourceJsonLd({ resource }: { resource: ResourceMeta }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: resource.titleZh,
    alternateName: resource.titleEn,
    description: resource.descriptionZh,
    url: `${BASE_URL}/resources/${resource.slug}`,
    author: PERSON,
    datePublished: resource.date,
    keywords: [...resource.tagsZh, ...resource.tagsEn].join(", "),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
