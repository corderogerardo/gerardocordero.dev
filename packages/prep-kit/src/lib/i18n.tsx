"use client";

import { createContext, useCallback, useContext, useMemo, useRef } from "react";
import en from "../locales/en.json";
import es from "../locales/es.json";
import type { Locale } from "./i18n-config";

type Dict = Record<string, string>;

const LOCALE_MAP: Record<Locale, Dict> = { en, es };

class I18n {
  dict: Dict;
  locale: Locale;

  constructor(locale: Locale) {
    this.locale = locale;
    this.dict = LOCALE_MAP[locale] ?? en;
  }

  t(key: string, params?: Record<string, string | number>): string {
    let text = this.dict[key];
    if (text === undefined) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[prep-kit/i18n] missing key: ${key}`);
      }
      text = en[key as keyof typeof en] ?? key;
    }
    if (!params) return text;
    return text.replace(
      /\{(\w+)\}/g,
      (_, k: string) => String(params[k] ?? `{${k}}`),
    );
  }
}

const I18nContext = createContext<{ i18n: I18n; localizedRoutes: boolean } | null>(null);

export function I18nProvider({
  locale,
  localizedRoutes = true,
  children,
}: {
  locale: Locale;
  /** False for single-locale apps without `/[locale]/` routes: nav links stay unprefixed and the language toggle is hidden. */
  localizedRoutes?: boolean;
  children: React.ReactNode;
}) {
  const value = useMemo(
    () => ({ i18n: new I18n(locale), localizedRoutes }),
    [locale, localizedRoutes],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): { t: I18n["t"]; locale: Locale; localizedRoutes: boolean } {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an <I18nProvider>");
  }
  return {
    t: ctx.i18n.t.bind(ctx.i18n),
    locale: ctx.i18n.locale,
    localizedRoutes: ctx.localizedRoutes,
  };
}
