/**
 * Prefix content HTML links with the current locale so they resolve
 * under `/[locale]/` routes: `href="/flashcards"` → `href="/en/flashcards"`.
 * Idempotent (skips already-prefixed links); skips protocol-relative URLs
 * and pure anchors. External links never match (they don't start with /).
 */
export function prefixContentLinks(html: string, locale: string): string {
  return html.replace(/href="\/(?!\/|#|en\/|es\/)/g, `href="/${locale}/`);
}
