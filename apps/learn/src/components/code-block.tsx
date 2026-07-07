// Reusable syntax-highlighted code block (read-only display).
// The "Run" button (Python/Ruby) is added by the parent component.

import { highlight, type LangId } from "@/lib/highlight";

export default function CodeBlock({
  source,
  title,
  lang,
  children,
}: {
  source: string;
  title?: string;
  lang: LangId;
  children?: React.ReactNode;
}) {
  const display = source.replace(/^\n+|\s+$/g, "");
  return (
    <div className="codeblock">
      {title && (
        <div className="code-title">
          <span>⌘</span> {title}
          {children}
        </div>
      )}
      {!title && children}
      <pre dangerouslySetInnerHTML={{ __html: highlight(display, lang) }} />
    </div>
  );
}
