// Single aggregation point for all content — consumed by the flashcards page,
// the quiz page, the daily session, and AI search so they never drift.
import { resolveLevel } from "@/lib/levels";
import type { Flashcard } from "./flashcards";
import { FLASHCARDS, FLASHCARD_FILTERS } from "./flashcards";
import { QUIZ, QUIZ_FILTERS } from "./quiz";
import { STUDY_SECTIONS } from "./study";
import { PROMPTS } from "./prompts";

type Filter = { value: string; label: string };

export const ALL_FLASHCARDS: Flashcard[] = FLASHCARDS.map((c) => ({
  ...c,
  level: resolveLevel(c),
}));

export const ALL_FLASHCARD_FILTERS: Filter[] = [
  { value: "all", label: "All" },
  ...FLASHCARD_FILTERS,
];

export const ALL_QUIZ = [...QUIZ];

export const ALL_QUIZ_FILTERS: Filter[] = [
  { value: "all", label: "All" },
  ...QUIZ_FILTERS,
];

export const ALL_STUDY = [...STUDY_SECTIONS];

export const ALL_PROMPTS = [...PROMPTS];

/** Strip HTML tags + decode a few entities for search/preview text. */
export function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&apos;/g, "'")
    .replace(/&[a-z]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
