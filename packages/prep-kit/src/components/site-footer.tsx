"use client";

import { usePrepConfig } from "../config";
import { useI18n } from "../lib/i18n";

export function SiteFooter() {
  const { brand } = usePrepConfig();
  const { locale } = useI18n();
  const text = locale === "es" ? brand.footerTextEs ?? brand.footerText : brand.footerText;
  return (
    <footer className="border-t border-border/70 px-4 py-6 text-center text-sm text-muted">
      <p className="mx-auto max-w-content">{text}</p>
    </footer>
  );
}
