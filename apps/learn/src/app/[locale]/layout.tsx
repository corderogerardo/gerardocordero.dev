import type { ReactNode } from "react";
import { LOCALES, type Locale } from "@/lib/i18n-config";
import TranslationLayout from "./translation-layout";

export function generateStaticParams() {
  return LOCALES.map((l) => ({ locale: l.id }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <TranslationLayout locale={(LOCALES.find((l) => l.id === locale)?.id as Locale) || "en"}>
      {children}
    </TranslationLayout>
  );
}
