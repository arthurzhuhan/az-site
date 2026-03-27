"use client";

import { Badge } from "@/components/ui/badge";
import { PostMeta } from "@/lib/content";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Lang = "zh" | "en";
const LANG_KEY = "preferred-lang";

interface BlogListPageProps {
  posts: PostMeta[];
}

export function BlogListPage({ posts }: BlogListPageProps) {
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

  return (
    <div className="h-screen flex-1 overflow-y-auto overflow-x-hidden">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="mb-6 flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {lang === "zh" ? "返回首页" : "Back to Home"}
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {lang === "zh"
              ? `共 ${posts.length} 篇文章`
              : `${posts.length} post${posts.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Post list */}
        <div className="space-y-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block">
              <article className="group flex cursor-pointer flex-col gap-4 overflow-hidden rounded-lg border border-border p-4 transition-colors hover:border-primary/30 md:flex-row md:gap-5">
                <div className="w-full flex-shrink-0 overflow-hidden rounded-md md:w-[280px]">
                  <Image
                    src={post.image}
                    alt={lang === "zh" ? post.titleZh : post.titleEn}
                    width={280}
                    height={119}
                    className="aspect-[2.35/1] h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <h2 className="text-base font-medium text-foreground transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {lang === "zh" ? post.titleZh : post.titleEn}
                  </h2>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {lang === "zh" ? post.excerptZh : post.excerptEn}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <time className="text-xs text-muted-foreground">
                      {post.date}
                    </time>
                    <div className="flex flex-wrap gap-1.5">
                      {(lang === "zh" ? post.tagsZh : post.tagsEn).map(
                        (tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
