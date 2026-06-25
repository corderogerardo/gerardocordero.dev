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
  metadataBase: new URL("https://ios.gerardocordero.dev"),
  title: {
    default: "iOS Development Study Guide — Swift, SwiftUI & the whole stack",
    template: "%s · iOS Dev Prep",
  },
  description:
    "Learn iOS development from scratch: Swift, SwiftUI, UIKit, concurrency, architecture, testing, CI/CD, the App Store, and on-device AI — junior to architect, with flashcards, a quiz, and practice prompts.",
  openGraph: {
    title: "iOS Development Study Guide — Swift, SwiftUI & the whole stack",
    description:
      "Swift, SwiftUI, concurrency, architecture, CI/CD, App Store review, and on-device AI — junior to architect, with flashcards, quiz, and practice prompts.",
    type: "website",
    url: "https://ios.gerardocordero.dev",
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
