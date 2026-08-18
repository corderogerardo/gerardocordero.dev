"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import { LOCALES, type Locale } from "@/lib/i18n-config";

const bundles: Record<string, Record<string, string>> = { en, es };

interface I18nCtx {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nCtx | null>(null);

export function I18nProvider({
  locale: initialLocale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("pawwalk-locale") as Locale) || initialLocale;
    }
    return initialLocale;
  });

  useEffect(() => {
    localStorage.setItem("pawwalk-locale", locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useMemo(
    () => (key: string, params?: Record<string, string | number>) => {
      let val = bundles[locale]?.[key] ?? bundles.en[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          val = val.replace(`{${k}}`, String(v));
        }
      }
      return val;
    },
    [locale],
  );

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nCtx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be inside <I18nProvider>");
  return ctx;
}

export { LOCALES };
export type { Locale };