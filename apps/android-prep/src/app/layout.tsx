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
  metadataBase: new URL("https://android.gerardocordero.dev"),
  title: {
    default: "Android Interview Prep — Senior Kotlin & Compose Study Guide",
    template: "%s · Android Interview Prep",
  },
  description:
    "A senior Android interview study guide: Kotlin coroutines & Flow, Jetpack Compose, architecture deep-dives, Jetpack libraries, performance, testing, practice pitches, flashcards, and a multiple-choice quiz.",
  openGraph: {
    title: "Android Interview Prep — Senior Kotlin & Compose Study Guide",
    description:
      "Kotlin, Jetpack Compose, architecture deep-dives, practice pitches, flashcards, and a quiz for senior/staff Android interviews.",
    type: "website",
    url: "https://android.gerardocordero.dev",
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
