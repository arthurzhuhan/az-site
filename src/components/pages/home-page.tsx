"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Mail,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { PostMeta, WhatsNewItem, ResourceMeta } from "@/lib/content";

type Lang = "zh" | "en";
const LANG_KEY = "preferred-lang";

const quickReplies = {
  zh: [
    "分享最新的AI技术变革",
    "我有一个想法，帮我分析一下",
    "聊聊你最近在做什么项目？",
  ],
  en: [
    "Share the latest AI tech breakthroughs",
    "I have an idea, help me analyze it",
    "What projects are you working on?",
  ],
};

// 双语内容
const translations = {
  zh: {
    hero: {
      name: "Arthur Zhu",
      title: "Builder · 写作者 · AI创业者",
      greeting:
        "哈喽 👋 我是 Arthur，欢迎来到我的个人空间！无论是技术探讨、项目合作、还是闲聊交流，都可以随时找我。现在开始我们的第一个话题吧：",
    },
    whatsNew: "最新动态",
    blog: "Blog",
    viewAll: "查看全部",
    resourcesLabel: "资源 & 项目",
    askAnything: {
      title: "Ask Me Anything",
      subtitle: "与我的智能体直接对话，获取项目信息或讨论技术问题",
      button: "开始对话",
      placeholder: "输入你想聊的话题...",
    },
    subscribe: {
      title: "订阅更新",
      description:
        "每月一封，分享最新的技术思考、项目动态和资源分享。无 spam，随时取消订阅。",
      placeholder: "your@email.com",
      button: "订阅",
      success: "订阅成功！感谢关注，后续更新会发到你的邮箱。",
      error: "订阅失败，请稍后重试",
      already: "你已经订阅过了 :)",
    },
    footer: {
      copyright: "© 2026 Arthur Zhu. All rights reserved.",
    },
  },
  en: {
    hero: {
      name: "Arthur Zhu",
      title: "Builder · Writer · AI Entrepreneur",
      greeting:
        "Hey 👋 I'm Arthur, welcome to my space! Whether it's tech discussions, project collaborations, or casual chats — feel free to reach out. Let's start our first topic:",
    },
    whatsNew: "What's New",
    blog: "Blog",
    viewAll: "View All",
    resourcesLabel: "Resources & Projects",
    askAnything: {
      title: "Ask Me Anything",
      subtitle:
        "Chat directly with my AI Agent to get project information or discuss technical topics",
      button: "Start Chat",
      placeholder: "Type a topic you'd like to chat about...",
    },
    subscribe: {
      title: "Subscribe",
      description:
        "Monthly updates on tech insights, project news, and resources. No spam, unsubscribe anytime.",
      placeholder: "your@email.com",
      button: "Subscribe",
      success: "Subscribed! Thanks for following, updates will be sent to your inbox.",
      error: "Failed to subscribe, please try again",
      already: "You're already subscribed :)",
    },
    footer: {
      copyright: "© 2026 Arthur Zhu. All rights reserved.",
    },
  },
};

interface HomePageProps {
  posts: PostMeta[];
  whatsNew: WhatsNewItem[];
  resources: ResourceMeta[];
}

export function HomePage({ posts, whatsNew, resources }: HomePageProps) {
  const [lang, setLang] = useState<Lang>("zh");
  const [pastHero, setPastHero] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<"loading" | "success" | "already" | "error" | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

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

  // Track scroll position to toggle FAB
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setPastHero(!entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        ref={scrollRef}
        className="h-screen flex-1 snap-y snap-proximity overflow-y-auto overflow-x-hidden"
      >
        {/* ===== Page 1: Hero ===== */}
        <section
          ref={heroRef}
          className="relative flex min-h-screen snap-start flex-col"
        >
          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-8 py-12">
            {/* User Info */}
            <div className="flex items-start gap-6">
              <Avatar className="h-20 w-20 md:h-24 md:w-24">
                <AvatarImage src="/avatar.jpg" alt="Avatar" />
                <AvatarFallback className="text-2xl">AZ</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  {t.hero.name}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground md:text-base">
                  {t.hero.title}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary">Founder</Badge>
                  <Badge variant="secondary">AI</Badge>
                  <Badge variant="secondary">Open Source</Badge>
                </div>
              </div>
            </div>

            {/* Chat Bubble */}
            <div className="mt-8 max-w-lg rounded-2xl bg-primary/10 px-5 py-4 text-[15px] leading-relaxed text-foreground/90 md:mt-10">
              {t.hero.greeting}
            </div>

            {/* Quick Replies */}
            <div className="mt-4 flex flex-col gap-2">
              {quickReplies[lang].map((text) => (
                <Link
                  key={text}
                  href={`/chat?q=${encodeURIComponent(text)}`}
                  className="w-fit max-w-sm rounded-2xl border border-border bg-muted/50 px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {text}
                </Link>
              ))}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* AI Chat Entry — PC: large inline card */}
            <div className="mb-8 hidden md:block">
              <Link
                href="/chat"
                className="group block w-full rounded-2xl border border-border bg-card p-6 text-left shadow-lg transition-all hover:border-primary/30 hover:shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold">{t.askAnything.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {t.askAnything.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform group-hover:scale-105">
                    {t.askAnything.button}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
                {/* Fake input bar */}
                <div className="mt-4 flex items-center gap-3 rounded-full border border-border bg-muted/50 px-5 py-3">
                  <span className="text-sm text-muted-foreground">
                    {t.askAnything.placeholder}
                  </span>
                </div>
              </Link>
            </div>

            {/* Scroll hint */}
            <div className="flex justify-center pb-4 md:pb-6">
              <ChevronDown className="h-5 w-5 animate-bounce text-muted-foreground/50" />
            </div>
          </div>

          {/* AI Chat Entry — Mobile: fixed at bottom */}
          {!pastHero && (
            <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
              <div className="h-6 bg-gradient-to-t from-background to-transparent" />
              <div className="border-t border-border bg-background/95 px-4 py-3 pb-12 backdrop-blur">
                <Link
                  href="/chat"
                  className="flex w-full items-center gap-3 rounded-full border border-border bg-muted/50 px-4 py-3.5"
                >
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <span className="flex-1 text-left text-sm text-muted-foreground">
                    {t.askAnything.placeholder}
                  </span>
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    {t.askAnything.button}
                  </span>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* ===== Page 2: Content ===== */}
        <section className="min-h-screen snap-start">
          <div className="mx-auto max-w-4xl px-8 py-12">
            {/* What's New */}
            <div className="mb-16">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">{t.whatsNew}</h2>
                </div>
              <div className="space-y-3">
                {whatsNew.map((item) => (
                  <Link key={item.href + item.date} href={item.href} className="group block">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-2 w-2 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-foreground/80 group-hover:text-foreground">
                        {lang === "zh" ? item.titleZh : item.titleEn}
                      </span>
                      <time className="flex-shrink-0 text-xs text-muted-foreground">
                        {item.date}
                      </time>
                      <ArrowRight className="h-4 w-4 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Blog Section */}
            <div className="mb-16">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">{t.blog}</h2>
                <Link
                  href="/blog"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  {t.viewAll}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {posts.slice(0, 4).map((post) => (
                  <Link key={post.slug} href={"/blog/" + post.slug}>
                    <article className="group cursor-pointer">
                      <div className="mb-3 overflow-hidden rounded-lg border border-border">
                        <Image
                          src={post.image}
                          alt={lang === "zh" ? post.titleZh : post.titleEn}
                          width={700}
                          height={298}
                          className="aspect-[2.35/1] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <h3 className="text-base font-medium text-foreground transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {lang === "zh" ? post.titleZh : post.titleEn}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
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
                    </article>
                  </Link>
                ))}
              </div>
            </div>

            {/* Resources Section */}
            <div className="mb-16">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">{t.resourcesLabel}</h2>
                <Link
                  href="/resources"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  {t.viewAll}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {resources.slice(0, 3).map((resource) => (
                  <Link
                    key={resource.slug}
                    href={`/resources/${resource.slug}`}
                    className="group rounded-lg border border-border p-4 transition-colors hover:border-primary/30"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">
                          {lang === "zh" ? resource.titleZh : resource.titleEn}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {lang === "zh"
                            ? resource.descriptionZh
                            : resource.descriptionEn}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {(lang === "zh" ? resource.tagsZh : resource.tagsEn).map(
                            (tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Footer / Newsletter */}
            <footer className="mt-16 border-t border-border pt-8 pb-8">
              <div className="mb-8">
                <h2 className="mb-2 text-xl font-semibold">
                  {t.subscribe.title}
                </h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  {t.subscribe.description}
                </p>
                <form
                  className="flex gap-2"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const emailInput = form.querySelector("input") as HTMLInputElement;
                    const email = emailInput.value.trim();
                    if (!email) return;

                    setSubscribeStatus("loading");
                    try {
                      const res = await fetch("/api/subscribe", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email }),
                      });
                      const data = await res.json();
                      if (!res.ok) {
                        setSubscribeStatus("error");
                        return;
                      }
                      setSubscribeStatus(data.alreadySubscribed ? "already" : "success");
                      emailInput.value = "";
                    } catch {
                      setSubscribeStatus("error");
                    }
                  }}
                >
                  <Input
                    type="email"
                    placeholder={t.subscribe.placeholder}
                    className="max-w-xs text-base md:text-sm"
                    required
                    disabled={subscribeStatus === "loading"}
                  />
                  <Button type="submit" disabled={subscribeStatus === "loading"}>
                    <Mail className="mr-2 h-4 w-4" />
                    {t.subscribe.button}
                  </Button>
                </form>
                {subscribeStatus && subscribeStatus !== "loading" && (
                  <p className={`mt-2 text-sm ${subscribeStatus === "error" ? "text-destructive" : "text-green-600 dark:text-green-400"}`}>
                    {subscribeStatus === "success" ? t.subscribe.success : subscribeStatus === "already" ? t.subscribe.already : t.subscribe.error}
                  </p>
                )}
              </div>
              <div className="text-center text-sm text-muted-foreground">
                <p>{t.footer.copyright}</p>
              </div>
            </footer>
          </div>
        </section>
      </div>

      {/* ===== Floating Chat FAB — shows after scrolling past Hero ===== */}
      {pastHero && (
        <Link
          href="/chat"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 overflow-hidden rounded-full shadow-lg ring-2 ring-primary/20 transition-transform hover:scale-110 active:scale-95"
          aria-label="Open Chat"
        >
          <Avatar className="h-14 w-14">
            <AvatarImage src="/avatar.jpg" alt="Arthur Zhu" />
            <AvatarFallback className="text-sm">AZ</AvatarFallback>
          </Avatar>
        </Link>
      )}
    </>
  );
}
