"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n, LOCALES } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const { locale } = useI18n();

  const otherLocale = locale === "en" ? "es" : "en";
  const other = LOCALES.find((l) => l.id === otherLocale);
  if (!other) return null;

  const otherPath = pathname.replace(/^\/[^/]+/, `/${other.id}`);

  return (
    <Link
      href={otherPath}
      className="lang-switch"
      title={other.labelEn}
    >
      <span className="lang-globe">🌐</span>
      <span className="lang-label">{other.labelNative}</span>
    </Link>
  );
}
