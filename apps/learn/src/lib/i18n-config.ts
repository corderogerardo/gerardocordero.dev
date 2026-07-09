// Server-safe i18n constants — no "use client", no React.
// Used by server components (layouts, page generators).

export type Locale = "en" | "es";

export interface LocaleInfo {
  id: Locale;
  labelEn: string;
  labelNative: string;
}

export const LOCALES: LocaleInfo[] = [
  { id: "en", labelEn: "English", labelNative: "English" },
  { id: "es", labelEn: "Spanish", labelNative: "Español" },
];

export const COURSE_IDS = ["ios", "android", "ruby", "python", "go", "node"] as const;
