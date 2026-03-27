"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Copy, Check, Volume2, VolumeX } from "lucide-react";
import { marked } from "marked";
import { ExternalLink } from "lucide-react";
import type { ChatMessage, Reference, Lang } from "@/lib/chat/types";
import { personaConfig } from "../../../persona.config";
import { resolveTemplate } from "@/lib/config";

const LANG_KEY = "preferred-lang";

const quickReplies = personaConfig.quickReplies;

const greeting = {
  zh: resolveTemplate(personaConfig.greeting.zh),
  en: resolveTemplate(personaConfig.greeting.en),
};

const placeholder = {
  zh: "输入你想聊的话题...",
  en: "Type a topic you'd like to chat about...",
};

const errorLabel = {
  zh: "出错了：",
  en: "Error: ",
};

const copyLabel = { zh: "已复制", en: "Copied" };

interface ChatPageProps {
  onClose?: () => void;
}

// Strip markdown syntax for clean TTS speech
function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^[-*+]\s/gm, "")
    .replace(/^\d+\.\s/gm, "")
    .replace(/^>\s/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Cache TTS audio URLs by content hash
const ttsCache = new Map<string, string>();

// Global audio manager — only one audio plays at a time
let activeAudio: HTMLAudioElement | null = null;
let activeAudioCleanup: (() => void) | null = null;

function stopGlobalAudio() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }
  if (activeAudioCleanup) {
    activeAudioCleanup();
    activeAudioCleanup = null;
  }
}

function ReferenceCards({ references }: { references: Reference[] }) {
  return (
    <div className="ml-11 mt-2 flex flex-col gap-2">
      {references.map((ref) => (
        <a
          key={ref.slug}
          href={ref.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-start gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/30 hover:bg-muted/50"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                {ref.type === "post" ? "Blog" : "Resource"}
              </span>
              <span className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                {ref.title}
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {ref.excerpt}
            </p>
          </div>
          <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
        </a>
      ))}
    </div>
  );
}

function AssistantActions({
  content,
  lang,
}: {
  content: string;
  lang: Lang;
}) {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [content]);

  const playAudio = useCallback((url: string) => {
    // Stop any currently playing audio globally
    stopGlobalAudio();

    const audio = new Audio(url);
    audioRef.current = audio;
    activeAudio = audio;
    activeAudioCleanup = () => { setSpeaking(false); audioRef.current = null; };
    setSpeaking(true);

    const cleanup = () => {
      setSpeaking(false);
      audioRef.current = null;
      if (activeAudio === audio) {
        activeAudio = null;
        activeAudioCleanup = null;
      }
    };
    audio.onended = cleanup;
    audio.onerror = cleanup;
    audio.play();
  }, []);

  const handleTTS = useCallback(async () => {
    // Stop if this instance is currently playing
    if (speaking) {
      stopGlobalAudio();
      return;
    }

    const plainText = stripMarkdown(content);
    const cached = ttsCache.get(plainText);

    if (cached) {
      playAudio(cached);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: plainText }),
      });

      if (!res.ok) {
        setLoading(false);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      ttsCache.set(plainText, url);
      setLoading(false);
      playAudio(url);
    } catch {
      setLoading(false);
    }
  }, [content, speaking, playAudio]);

  return (
    <div className="ml-11 mt-1.5 flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Copy"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            <span>{copyLabel[lang]}</span>
          </>
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
      <button
        onClick={handleTTS}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Text to speech"
      >
        {loading ? (
          <span className="inline-flex items-center gap-0.5 text-xs">
            <span className="animate-pulse">•</span>
            <span className="animate-pulse [animation-delay:200ms]">•</span>
          </span>
        ) : speaking ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

export function ChatPage({ onClose }: ChatPageProps) {
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<Lang>("zh");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialQuerySent = useRef(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendMessageRef = useRef<(text: string) => void>(undefined);

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

  // Auto-send query from URL param (?q=...)
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !initialQuerySent.current) {
      initialQuerySent.current = true;
      // Wait for sendMessage to be available via ref
      setTimeout(() => sendMessageRef.current?.(q), 0);
    }
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      setError(null);
      setInput("");

      const userMessage: ChatMessage = { role: "user", content: trimmed };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsStreaming(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updatedMessages, lang }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          const msg = body?.error ?? `Request failed (${response.status})`;
          setError(msg);
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          setError("No response stream available");
          return;
        }

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: "",
        };
        setMessages((prev) => [...prev, assistantMessage]);

        const decoder = new TextDecoder();
        let assistantContent = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine.startsWith("data: ")) continue;

            const data = trimmedLine.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.references) {
                // References event — attach to the last assistant message
                setMessages((prev) => {
                  const next = [...prev];
                  next[next.length - 1] = {
                    ...next[next.length - 1],
                    references: parsed.references,
                  };
                  return next;
                });
              } else if (parsed.content) {
                assistantContent += parsed.content;
                setMessages((prev) => {
                  const next = [...prev];
                  next[next.length - 1] = {
                    role: "assistant",
                    content: assistantContent,
                    references: next[next.length - 1].references,
                  };
                  return next;
                });
              }
            } catch {
              /* skip malformed lines */
            }
          }
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(msg);
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, messages, lang]
  );

  sendMessageRef.current = sendMessage;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-dvh w-full max-w-[100vw] flex-col overflow-x-hidden bg-background">
      {/* Messages Area — full width scroll, content centered */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 pt-14 pb-6 md:pt-6">
          {/* AI greeting bubble */}
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src="/avatar.jpg" alt="Avatar" />
              <AvatarFallback className="text-xs">AZ</AvatarFallback>
            </Avatar>
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-primary/10 px-4 py-3 text-[15px] leading-relaxed text-foreground/90">
              {greeting[lang]}
            </div>
          </div>

          {/* Quick Replies — hidden once conversation starts */}
          {!hasMessages && (
            <div className="ml-11 mt-4 flex flex-col items-start gap-2">
              {quickReplies[lang].map((text) => (
                <button
                  key={text}
                  onClick={() => sendMessage(text)}
                  className="max-w-[85%] rounded-2xl rounded-tl-sm border border-border bg-muted/50 px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {text}
                </button>
              ))}
            </div>
          )}

          {/* Conversation messages */}
          {messages.map((msg, idx) =>
            msg.role === "user" ? (
              <div key={idx} className="mt-4 flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-[15px] leading-relaxed text-primary-foreground">
                  {msg.content}
                </div>
              </div>
            ) : (
              <div key={idx} className="mt-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src="/avatar.jpg" alt="Avatar" />
                    <AvatarFallback className="text-xs">AZ</AvatarFallback>
                  </Avatar>
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-primary/10 px-4 py-3 text-[15px] leading-relaxed text-foreground/90">
                    {msg.content ? (
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-pre:my-2 prose-blockquote:my-2"
                        dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) as string }}
                      />
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="animate-pulse">•</span>
                        <span className="animate-pulse [animation-delay:200ms]">•</span>
                        <span className="animate-pulse [animation-delay:400ms]">•</span>
                      </span>
                    )}
                  </div>
                </div>
                {/* Reference cards */}
                {msg.references && msg.references.length > 0 && (
                  <ReferenceCards references={msg.references} />
                )}
                {/* Copy & TTS buttons — only shown after streaming is done */}
                {msg.content && !(isStreaming && idx === messages.length - 1) && (
                  <AssistantActions content={msg.content} lang={lang} />
                )}
              </div>
            )
          )}

          {/* Typing indicator — left side with avatar */}
          {isStreaming &&
            messages.length > 0 &&
            messages[messages.length - 1].role === "user" && (
              <div className="mt-4 flex items-start gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src="/avatar.jpg" alt="Avatar" />
                  <AvatarFallback className="text-xs">AZ</AvatarFallback>
                </Avatar>
                <div className="rounded-2xl rounded-tl-sm bg-primary/10 px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="animate-pulse">•</span>
                    <span className="animate-pulse [animation-delay:200ms]">•</span>
                    <span className="animate-pulse [animation-delay:400ms]">•</span>
                  </span>
                </div>
              </div>
            )}

          {/* Error display */}
          {error && (
            <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorLabel[lang]}
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Bar — full width, content centered */}
      <div className="shrink-0 border-t border-border bg-background">
        <div className="mx-auto flex max-w-2xl items-center gap-2 overflow-hidden px-4 py-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder={placeholder[lang]}
            className="min-w-0 flex-1 rounded-full border border-border bg-muted/50 px-4 py-2.5 text-base text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-primary/50 focus:bg-background disabled:opacity-50 md:text-sm"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isStreaming || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
