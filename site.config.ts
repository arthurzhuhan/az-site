export const siteConfig = {
  // Identity
  name: "Your Name",
  title: "Builder · Writer · Creator",
  domain: "https://your-domain.com",
  avatar: "/avatar.jpg",

  // Social links (empty string = not displayed)
  social: {
    github: "",
    x: "",
    linkedin: "",
    email: "",
    rednote: "",
    tiktok: "",
    youtube: "",
  },

  // Feature toggles
  features: {
    chat: true,
    tts: true,
    newsletter: true,
    analytics: false,
  },

  // Internationalization
  i18n: {
    defaultLang: "en" as "en" | "zh",
    supported: ["en", "zh"] as readonly string[],
  },
}

export type SiteConfig = typeof siteConfig
