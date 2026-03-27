import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Starfield } from "@/components/ui/starfield";
import { GradientBlobs } from "@/components/ui/gradient-blobs";
import { siteConfig } from "../../site.config";

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
  metadataBase: new URL(siteConfig.domain),
  title: {
    default: `${siteConfig.name} - ${siteConfig.title}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: `${siteConfig.name} — ${siteConfig.title}`,
  keywords: [siteConfig.name],
  authors: [{ name: siteConfig.name, url: siteConfig.domain }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: siteConfig.i18n.defaultLang === "zh" ? "zh_CN" : "en_US",
    alternateLocale: siteConfig.i18n.defaultLang === "zh" ? "en_US" : "zh_CN",
    url: siteConfig.domain,
    siteName: siteConfig.name,
    title: `${siteConfig.name} - ${siteConfig.title}`,
    description: `${siteConfig.name} — ${siteConfig.title}`,
    images: [{ url: "/avatar.jpg", width: 400, height: 400, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary",
    site: siteConfig.social.x || undefined,
    creator: siteConfig.social.x || undefined,
    title: `${siteConfig.name} - ${siteConfig.title}`,
    description: `${siteConfig.name} — ${siteConfig.title}`,
    images: ["/avatar.jpg"],
  },
  alternates: {
    canonical: siteConfig.domain,
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
      lang={siteConfig.i18n.defaultLang === "zh" ? "zh-CN" : "en"}
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
