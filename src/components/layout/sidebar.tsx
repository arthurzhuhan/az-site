"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";
import {
  PanelLeftClose,
  PanelLeftOpen,
  User,
  FileText,
  FolderOpen,
  MessageSquare,
  Github,
  Mail,
  BookOpen,
  Linkedin,
  Youtube,
  Globe,
} from "lucide-react";
import { XIcon, TikTokIcon } from "@/components/ui/social-icons";
import { siteConfig } from "../../../site.config";

type Lang = "zh" | "en";
const LANG_KEY = "preferred-lang";

type IconComponent = React.ComponentType<{ className?: string }>;

interface NavItem {
  icon: IconComponent;
  labelZh: string;
  labelEn: string;
  href: string;
}

interface SocialItem {
  icon: IconComponent;
  labelZh: string;
  labelEn: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: User, labelZh: "关于我", labelEn: "About", href: "/" },
  { icon: FileText, labelZh: "Blog", labelEn: "Blog", href: "/blog" },
  { icon: FolderOpen, labelZh: "资源", labelEn: "Resources", href: "/resources" },
  { icon: MessageSquare, labelZh: "问我", labelEn: "AMA", href: "/chat" },
];

const SOCIAL_ICON_MAP: Record<string, { icon: IconComponent; labelZh: string; labelEn: string; urlPrefix?: string }> = {
  github: { icon: Github, labelZh: "GitHub", labelEn: "GitHub", urlPrefix: "https://github.com/" },
  x: { icon: XIcon, labelZh: "X", labelEn: "X", urlPrefix: "https://x.com/" },
  linkedin: { icon: Linkedin, labelZh: "LinkedIn", labelEn: "LinkedIn", urlPrefix: "https://linkedin.com/in/" },
  email: { icon: Mail, labelZh: "邮箱", labelEn: "Email", urlPrefix: "mailto:" },
  rednote: { icon: BookOpen, labelZh: "小红书", labelEn: "RedNote" },
  tiktok: { icon: TikTokIcon, labelZh: "TikTok", labelEn: "TikTok", urlPrefix: "https://tiktok.com/@" },
  youtube: { icon: Youtube, labelZh: "YouTube", labelEn: "YouTube", urlPrefix: "https://youtube.com/@" },
};

function buildSocialItems(): SocialItem[] {
  return Object.entries(siteConfig.social)
    .filter(([, value]) => value.length > 0)
    .map(([platform, value]) => {
      const meta = SOCIAL_ICON_MAP[platform] || { icon: Globe, labelZh: platform, labelEn: platform };
      const href = value.startsWith("http") || value.startsWith("mailto:")
        ? value
        : meta.urlPrefix
          ? `${meta.urlPrefix}${value}`
          : value;
      return { icon: meta.icon, labelZh: meta.labelZh, labelEn: meta.labelEn, href };
    });
}

const socialItems: SocialItem[] = buildSocialItems();

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const [lang, setLang] = useState<Lang>("zh");

  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY) as Lang;
    if (saved && (saved === "zh" || saved === "en")) {
      setLang(saved);
    }
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
    <>
      {/* ===== Mobile: floating toggle button (collapsed state) ===== */}
      {collapsed && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(false)}
          className="fixed left-3 top-3 z-50 md:hidden"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </Button>
      )}

      {/* ===== Mobile: overlay backdrop ===== */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* ===== Sidebar ===== */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-border bg-sidebar transition-[width] duration-300 ease-in-out overflow-hidden",
          collapsed ? "md:w-[60px]" : "md:w-[240px]",
          !collapsed &&
            "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-border bg-sidebar shadow-xl md:relative md:w-[240px] md:shadow-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          {collapsed ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(false)}
              className="mx-auto"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          ) : (
            <>
              <div className="flex min-w-0 items-center gap-2">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={siteConfig.avatar} alt={siteConfig.name} />
                  <AvatarFallback className="text-xs">{siteConfig.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="whitespace-nowrap font-semibold text-sidebar-foreground">
                  {siteConfig.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(true)}
                className="ml-auto flex-shrink-0"
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent whitespace-nowrap",
                collapsed && "justify-center"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <span>{lang === "zh" ? item.labelZh : item.labelEn}</span>
              )}
            </Link>
          ))}
        </nav>

        <Separator className="bg-sidebar-border" />

        {/* Social Links */}
        <div className="space-y-1 p-2">
          {socialItems.map((item) => (
            <a
              key={item.labelEn}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent whitespace-nowrap",
                collapsed && "justify-center"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <span>{lang === "zh" ? item.labelZh : item.labelEn}</span>
              )}
            </a>
          ))}
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Theme & Language Toggles */}
        <div className="space-y-1 p-2">
          <ThemeToggle
            collapsed={collapsed}
            label={lang === "zh" ? "主题" : "Theme"}
          />
          <LanguageToggle collapsed={collapsed} />
        </div>
      </aside>
    </>
  );
}
