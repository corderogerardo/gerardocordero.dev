"use client";

import type { ReactNode } from "react";
import { I18nProvider, type Locale } from "@/lib/i18n";

export default function TranslationLayout({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <I18nProvider locale={locale}>
      {children}
    </I18nProvider>
  );
}
