"use client";

import { usePrepConfig } from "../config";

export function SiteFooter() {
  const { brand } = usePrepConfig();
  return (
    <footer className="border-t border-border/70 px-4 py-6 text-center text-sm text-muted">
      <p className="mx-auto max-w-content">{brand.footerText}</p>
    </footer>
  );
}
