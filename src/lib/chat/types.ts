export type Lang = "zh" | "en";

export interface Reference {
  slug: string;
  type: "post" | "resource";
  title: string;
  excerpt: string;
  href: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  references?: Reference[];
}

export interface ChatRequest {
  messages: ChatMessage[];
  lang: Lang;
}
