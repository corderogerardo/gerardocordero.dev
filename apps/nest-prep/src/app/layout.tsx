import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./rich.css";
import { PrepProvider, SiteHeader, SiteFooter } from "@gerardocordero/prep-kit";
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
  metadataBase: new URL("https://nestjs.gerardocordero.dev"),
  title: {
    default: "NestJS Interview Prep — Senior Study Guide",
    template: "%s · NestJS Interview Prep",
  },
  description:
    "A senior NestJS + Node.js interview study guide: dependency injection, the request lifecycle, microservices, and backend system-design deep-dives — with flashcards, a quiz, and practice prompts.",
  openGraph: {
    title: "NestJS Interview Prep — Senior Study Guide",
    description:
      "DI, the request lifecycle, microservices, Node.js internals, architecture deep-dives, flashcards, and a quiz for senior NestJS interviews.",
    type: "website",
    url: "https://nestjs.gerardocordero.dev",
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
        <PrepProvider config={prepConfig}>
          <SiteHeader />
          <main className="mx-auto w-full max-w-content flex-1 px-4 py-8 sm:px-6 sm:py-10">
            {children}
          </main>
          <SiteFooter />
        </PrepProvider>
      </body>
    </html>
  );
}
