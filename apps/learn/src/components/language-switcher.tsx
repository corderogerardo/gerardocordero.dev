"use client";

import { usePathname } from "next/navigation";
import { useI18n, LOCALES } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const { locale, t } = useI18n();

  const otherLocale = locale === "en" ? "es" : "en";
  const other = LOCALES.find((l) => l.id === otherLocale);
  if (!other) return null;

  const otherPath = pathname.replace(/^\/[^/]+/, `/${other.id}`);

  return (
    <a href={otherPath} className="ghost" style={{ textAlign: "center" }}>
      {other.labelNative}
    </a>
  );
}
