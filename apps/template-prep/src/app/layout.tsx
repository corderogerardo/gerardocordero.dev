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
  title: {
    default: "Prep Template — build an on-device study site in minutes",
    template: "%s · Prep Template",
  },
  description:
    "A starter template for spaced-repetition study sites built on @gerardocordero/prep-kit: flashcards, quiz, practice prompts, on-device AI search & tutor, streaks. Drop in your content and ship.",
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
