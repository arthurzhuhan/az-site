"use client";

import { Badge } from "@/components/ui/badge";
import { Resource, ResourceCategory } from "@/lib/content";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Lang = "zh" | "en";
const LANG_KEY = "preferred-lang";

const categoryLabel: Record<ResourceCategory, { zh: string; en: string }> = {
  "recommended-projects": { zh: "推荐项目", en: "Projects" },
  "open-source-tools": { zh: "开源工具", en: "Tools" },
  "learning-resources": { zh: "学习资源", en: "Learning" },
};

interface ResourceDetailPageProps {
  resource: Resource;
}

export function ResourceDetailPage({ resource }: ResourceDetailPageProps) {
  const [lang, setLang] = useState<Lang>("zh");

  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY) as Lang;
    if (saved && (saved === "zh" || saved === "en")) setLang(saved);

    const handleLangChange = (event: CustomEvent<{ lang: Lang }>) => {
      setLang(event.detail.lang);
    };
    window.addEventListener("lang-change", handleLangChange as EventListener);
    return () =>
      window.removeEventListener("lang-change", handleLangChange as EventListener);
  }, []);

  const title = lang === "zh" ? resource.titleZh : resource.titleEn;
  const tags = lang === "zh" ? resource.tagsZh : resource.tagsEn;
  const catLabel =
    lang === "zh"
      ? categoryLabel[resource.category].zh
      : categoryLabel[resource.category].en;

  return (
    <div className="h-screen flex-1 overflow-y-auto">
      <div className="mx-auto max-w-4xl px-8 py-12">
        {/* Back link */}
        <Link
          href="/resources"
          className="mb-6 flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {lang === "zh" ? "返回资源" : "Back to Resources"}
        </Link>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Badge variant="secondary">{catLabel}</Badge>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </header>

        {/* External link button */}
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-8 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
        >
          <ExternalLink className="h-4 w-4" />
          {lang === "zh" ? "访问项目" : "Visit Project"}
        </a>

        {/* Content */}
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html:
              (lang === "en"
                ? resource.contentHtmlEn ?? resource.contentHtmlZh
                : resource.contentHtmlZh ?? resource.contentHtmlEn) ?? "",
          }}
        />
      </div>
    </div>
  );
}
