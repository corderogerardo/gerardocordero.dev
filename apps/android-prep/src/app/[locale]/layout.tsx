import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import "../rich.css";
import { I18nProvider, PrepProvider, SiteHeader, SiteFooter } from "@gerardocordero/prep-kit";
import type { Locale } from "@gerardocordero/prep-kit";
import { prepConfig } from "@/prep.config";
import type { Metadata } from "next";

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
  metadataBase: new URL("https://android-prep.gerardocordero.dev"),
  title: "Android Interview Prep",
};

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <html
      lang={locale}
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <I18nProvider locale={locale as Locale}>
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
