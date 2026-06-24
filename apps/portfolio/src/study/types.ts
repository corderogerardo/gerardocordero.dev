// Content model for the study engine. The engine is generic; a "subject" (React
// Native, iOS, and — in future — Android, Python, Go …) is just data you register
// in registry.ts. Adding a subject = drop a content/<id>.ts file and list it there.
import type { Grade } from "./srs";

export type Level = "junior" | "mid" | "senior" | "architect" | "beyond";

export type Card = {
  /** Globally unique across all subjects (prefix by subject+category, e.g. "rn-perf-1"). */
  id: string;
  /** Filter key within the subject, e.g. "performance". */
  category: string;
  /** Display label for the category chip, e.g. "PERFORMANCE". */
  categoryLabel: string;
  question: string;
  /**
   * Lightweight, RN-renderable markup — NO HTML. Supported: `inline code`
   * (backticks), **bold** (double asterisks), blank-line paragraphs, and "- "
   * bullet lines. Rendered by <Rich /> in rich.tsx.
   */
  answer: string;
  level?: Level;
};

export type Category = { value: string; label: string };

export type Subject = {
  id: string;
  /** Full name, e.g. "React Native". */
  label: string;
  /** Compact badge, e.g. "RN". */
  short: string;
  /** One-line description for the subject picker. */
  blurb: string;
  cards: Card[];
};

export type { Grade };
