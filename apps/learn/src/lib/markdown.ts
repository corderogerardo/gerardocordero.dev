// Mini-markdown renderer — per-block, matching app.js.
// Not a general-purpose parser; designed for controlled lesson content.

export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function mdInline(s: string): string {
  return esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

export function mdBlock(block: string): string {
  const lines = block.split("\n");
  if (block.startsWith("```") && block.endsWith("```"))
    return `<pre class="md-code">${esc(
      block.replace(/^```[^\n]*\n?/, "").replace(/\n?```$/, ""),
    )}</pre>`;
  if (block.startsWith("### ")) return `<h4>${mdInline(block.slice(4))}</h4>`;
  if (block.startsWith("## ")) return `<h3>${mdInline(block.slice(3))}</h3>`;
  if (lines.every((ln) => ln.startsWith("- ")))
    return `<ul>${lines.map((ln) => `<li>${mdInline(ln.slice(2))}</li>`).join("")}</ul>`;
  if (lines.every((ln) => /^\d+\. /.test(ln)))
    return `<ol>${lines.map((ln) => `<li>${mdInline(ln.replace(/^\d+\. /, ""))}</li>`).join("")}</ol>`;
  if (lines.every((ln) => ln.startsWith("> ")))
    return `<blockquote><p>${lines.map((ln) => mdInline(ln.slice(2))).join("<br>")}</p></blockquote>`;
  return `<p>${mdInline(block).replace(/\n/g, "<br>")}</p>`;
}

export function md(blocks: string[] | undefined | null): string {
  return (blocks || []).map(mdBlock).join("");
}
