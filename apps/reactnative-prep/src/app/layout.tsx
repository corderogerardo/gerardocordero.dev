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
  metadataBase: new URL("https://reactnative.gerardocordero.dev"),
  title: {
    default: "React Native Interview Prep — Senior Study Guide",
    template: "%s · RN Interview Prep",
  },
  description:
    "A senior React Native interview study guide: architecture deep-dives, practice pitches, flashcards, and a multiple-choice quiz — tied to real shipped experience.",
  openGraph: {
    title: "React Native Interview Prep — Senior Study Guide",
    description:
      "Architecture deep-dives, practice pitches, flashcards, and a quiz for senior React Native interviews.",
    type: "website",
    url: "https://reactnative.gerardocordero.dev",
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
