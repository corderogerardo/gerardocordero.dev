import { Geist, Geist_Mono } from "next/font/google";

// Single type family for the whole app: UI, body, display headings and code.
// Self-hosted + subset by next/font, preloaded, `display: swap` — static-export
// safe. Both variables are injected on <html> by the root layout and consumed
// through --font-geist-sans / --font-geist-mono (Tailwind fontFamily in
// tailwind.config.js and the --sans/--mono stacks in styles.css).
export const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
});

export const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});
