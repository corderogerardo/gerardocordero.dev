/**
 * Prefix content HTML links with the current locale so they resolve
 * under `/[locale]/` routes. Handles `href="/flashcards"` → `href="/en/flashcards"`.
 * Skips external URLs, anchors, and protocol-relative URLs.
 */
export function prefixContentLinks(html: string, locale: string): string {
  return html.replace(
    /href="\/(?!\/|http[^s]|#)/g,
    `href="/${locale}/`,
  );
}
