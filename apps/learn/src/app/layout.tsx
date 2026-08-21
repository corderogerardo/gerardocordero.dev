import type { ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n";
import { geistSans, geistMono } from "@/lib/fonts";
import "./globals.css";

export const metadata = {
  title: "Academy",
  description: "Interactive courses — build the PawWalk app step by step",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <I18nProvider locale="en">{children}</I18nProvider>
      </body>
    </html>
  );
}