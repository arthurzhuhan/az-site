"use client";

import { Badge } from "@/components/ui/badge";
import { Post } from "@/lib/content";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Lang = "zh" | "en";
const LANG_KEY = "preferred-lang";

interface BlogPostPageProps {
  post: Post;
}

export function BlogPostPage({ post }: BlogPostPageProps) {
  const [lang, setLang] = useState<Lang>("zh");

  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY) as Lang;
    if (saved && (saved === "zh" || saved === "en")) setLang(saved);

    const handleLangChange = (event: CustomEvent<{ lang: Lang }>) => {
      setLang(event.detail.lang);
    };
    window.addEventListener("lang-change", handleLangChange as EventListener);
    return () =>
      window.removeEventListener(
        "lang-change",
        handleLangChange as EventListener
      );
  }, []);

  const title = lang === "zh" ? post.titleZh : post.titleEn;
  const tags = lang === "zh" ? post.tagsZh : post.tagsEn;

  return (
    <div className="h-screen flex-1 overflow-y-auto overflow-x-hidden">
      <div className="mx-auto max-w-4xl px-4 sm:px-8 py-12">
        {/* Back link */}
        <Link
          href="/blog"
          className="mb-6 flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {lang === "zh" ? "返回博客" : "Back to Blog"}
        </Link>

        {/* Post header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <time className="text-sm text-muted-foreground">{post.date}</time>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </header>

        {/* Post content */}
        <div
          className="prose dark:prose-invert max-w-none overflow-x-hidden [&_img]:max-w-full"
          dangerouslySetInnerHTML={{
            __html:
              (lang === "en"
                ? post.contentHtmlEn ?? post.contentHtmlZh
                : post.contentHtmlZh ?? post.contentHtmlEn) ?? "",
          }}
        />
      </div>
    </div>
  );
}
