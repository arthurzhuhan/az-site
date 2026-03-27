"use client";

import { Languages } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Lang = "zh" | "en";

const LANG_KEY = "preferred-lang";

export function LanguageToggle({ collapsed = false }: { collapsed?: boolean }) {
  const [lang, setLang] = useState<Lang>("zh");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY) as Lang;
    if (saved && (saved === "zh" || saved === "en")) {
      setLang(saved);
    }
    setMounted(true);
  }, []);

  const toggleLang = () => {
    const newLang: Lang = lang === "zh" ? "en" : "zh";
    setLang(newLang);
    localStorage.setItem(LANG_KEY, newLang);
    window.dispatchEvent(
      new CustomEvent("lang-change", { detail: { lang: newLang } })
    );
  };

  if (!mounted) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2",
          collapsed && "justify-center"
        )}
      >
        <Languages className="h-5 w-5 flex-shrink-0" />
      </div>
    );
  }

  return (
    <button
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent whitespace-nowrap",
        collapsed ? "justify-center" : "w-full"
      )}
      onClick={toggleLang}
      title="切换语言 / Toggle Language"
    >
      <Languages className="h-5 w-5 flex-shrink-0" />
      {!collapsed && <span>{lang === "zh" ? "EN" : "中文"}</span>}
    </button>
  );
}
