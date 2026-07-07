import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./rich.css";
import { PrepProvider, I18nProvider, SiteHeader, SiteFooter } from "@gerardocordero/prep-kit";
import { prepConfig } from "@/prep.config";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nextjs.gerardocordero.dev"),
  title: {
    default: "Next.js Interview Prep — Senior Study Guide",
    template: "%s · Next.js Interview Prep",
  },
  description:
    "A senior Next.js + React interview study guide: the App Router, Server Components, rendering & caching, and frontend system-design deep-dives — with flashcards, a quiz, and practice prompts.",
  openGraph: {
    title: "Next.js Interview Prep — Senior Study Guide",
    description:
      "App Router, RSC vs Client Components, Cache Components, Server Actions, performance, and architecture deep-dives for senior Next.js interviews.",
    type: "website",
    url: "https://nextjs.gerardocordero.dev",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <I18nProvider locale="en">
          <PrepProvider config={prepConfig}>
            <SiteHeader />
            <main className="mx-auto w-full max-w-content flex-1 px-4 py-8 sm:px-6 sm:py-10">
              {children}
            </main>
            <SiteFooter />
          </PrepProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
