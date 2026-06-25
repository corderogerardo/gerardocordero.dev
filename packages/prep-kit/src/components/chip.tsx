import * as React from "react";
import { cn } from "../lib/cn";

// The filter/segment pill repeated across the flashcard, prompt, and quiz decks —
// now one primitive instead of three copies. `active` toggles the accent state.
export function Chip({
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-accent/40 bg-accent/15 text-accent"
          : "border-border bg-surface text-muted hover:text-text",
        className,
      )}
      {...props}
    />
  );
}
