/**
 * Renders authored long-form content migrated from the original study guide.
 * The HTML is trusted (authored by us at build time, never user input), so
 * dangerouslySetInnerHTML is safe here; `.rich` (rich.css) styles it.
 */
export function RichText({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  return (
    <div
      className={`rich ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
