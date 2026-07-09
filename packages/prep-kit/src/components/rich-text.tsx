"use client";

import { useI18n } from "../lib/i18n";
import { prefixContentLinks } from "../lib/link-prefix";

/**
 * Renders authored long-form content migrated from the original study guide.
 * The HTML is trusted (authored by us at build time, never user input), so
 * dangerouslySetInnerHTML is safe here; `.rich` (rich.css) styles it.
 * Internal links (`href="/study#..."`) are locale-prefixed automatically so
 * content data can stay locale-agnostic.
 */
export function RichText({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  const { locale } = useI18n();
  return (
    <div
      className={`rich ${className}`}
      dangerouslySetInnerHTML={{ __html: prefixContentLinks(html, locale) }}
    />
  );
}
