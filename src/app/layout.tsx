import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Starfield } from "@/components/ui/starfield";
import { GradientBlobs } from "@/components/ui/gradient-blobs";

const gaId = process.env.NEXT_PUBLIC_GA_ID;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://ziut.cn"),
  title: {
    default: "Arthur Zhu - Builder · Writer · AI Entrepreneur",
    template: "%s | Arthur Zhu",
  },
  description:
    "Arthur Zhu 的个人空间 — AI 创业者、技术写作者。分享 AI、编程、创业相关的思考与实践。Personal space of Arthur Zhu — AI entrepreneur & tech writer.",
  keywords: ["Arthur Zhu", "AI", "编程", "创业", "技术博客", "Programming", "Startup"],
  authors: [{ name: "Arthur Zhu", url: "https://ziut.cn" }],
  creator: "Arthur Zhu",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    alternateLocale: "en_US",
    url: "https://ziut.cn",
    siteName: "Arthur Zhu",
    title: "Arthur Zhu - Builder · Writer · AI Entrepreneur",
    description:
      "AI 创业者、技术写作者。分享 AI、编程、创业相关的思考与实践。",
    images: [{ url: "/avatar.jpg", width: 400, height: 400, alt: "Arthur Zhu" }],
  },
  twitter: {
    card: "summary",
    site: "@Arthur__Ju",
    creator: "@Arthur__Ju",
    title: "Arthur Zhu - Builder · Writer · AI Entrepreneur",
    description:
      "AI 创业者、技术写作者。分享 AI、编程、创业相关的思考与实践。",
    images: ["/avatar.jpg"],
  },
  alternates: {
    canonical: "https://ziut.cn",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      )}
      <body className="min-h-full flex overflow-x-hidden antialiased">
        <ThemeProvider>
          <Starfield />
          <GradientBlobs />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
