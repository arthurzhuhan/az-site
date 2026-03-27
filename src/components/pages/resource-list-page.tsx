"use client";

import { Badge } from "@/components/ui/badge";
import { ResourceMeta, ResourceCategory } from "@/lib/content";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Lang = "zh" | "en";
const LANG_KEY = "preferred-lang";

const categories: { key: ResourceCategory | "all"; labelZh: string; labelEn: string }[] = [
  { key: "all", labelZh: "全部", labelEn: "All" },
  { key: "recommended-projects", labelZh: "推荐项目", labelEn: "Projects" },
  { key: "open-source-tools", labelZh: "开源工具", labelEn: "Tools" },
  { key: "learning-resources", labelZh: "学习资源", labelEn: "Learning" },
];

const categoryLabel: Record<ResourceCategory, { zh: string; en: string }> = {
  "recommended-projects": { zh: "推荐项目", en: "Projects" },
  "open-source-tools": { zh: "开源工具", en: "Tools" },
  "learning-resources": { zh: "学习资源", en: "Learning" },
};

interface ResourceListPageProps {
  resources: ResourceMeta[];
}

export function ResourceListPage({ resources }: ResourceListPageProps) {
  const [lang, setLang] = useState<Lang>("zh");
  const [activeCategory, setActiveCategory] = useState<ResourceCategory | "all">("all");

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

  const filtered =
    activeCategory === "all"
      ? resources
      : resources.filter((r) => r.category === activeCategory);

  return (
    <div className="h-screen flex-1 overflow-y-auto">
      <div className="mx-auto max-w-4xl px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="mb-6 flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {lang === "zh" ? "返回首页" : "Back to Home"}
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            {lang === "zh" ? "资源 & 项目" : "Resources & Projects"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {lang === "zh"
              ? `共 ${resources.length} 个资源`
              : `${resources.length} resource${resources.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {lang === "zh" ? cat.labelZh : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Resource list */}
        <div className="space-y-4">
          {filtered.map((resource) => (
            <Link
              key={resource.slug}
              href={`/resources/${resource.slug}`}
              className="block"
            >
              <article className="group flex cursor-pointer items-start gap-4 rounded-lg border border-border p-5 transition-colors hover:border-primary/30">
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-medium text-foreground transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {lang === "zh" ? resource.titleZh : resource.titleEn}
                    </h2>
                    <Badge variant="secondary" className="text-xs">
                      {lang === "zh"
                        ? categoryLabel[resource.category].zh
                        : categoryLabel[resource.category].en}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {lang === "zh" ? resource.descriptionZh : resource.descriptionEn}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <div className="flex flex-wrap gap-1.5">
                      {(lang === "zh" ? resource.tagsZh : resource.tagsEn).map(
                        (tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                </div>
                <ExternalLink className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
