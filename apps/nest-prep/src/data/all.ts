// Single aggregation point for all content — consumed by the flashcards page,
// the quiz page, the daily session, and AI search so they never drift.
import { resolveLevel } from "@/lib/levels";
import type { Flashcard } from "./flashcards";
import { FLASHCARDS, FLASHCARD_FILTERS } from "./flashcards";
import { FLASHCARDS2, FLASHCARD2_FILTERS } from "./flashcards2";
import { FLASHCARDS3, FLASHCARD3_FILTERS } from "./flashcards3";
import { PERF_LESSONS, PERF_SESSIONS } from "./perf";
import { QUIZ, QUIZ_FILTERS } from "./quiz";
import { QUIZ2, QUIZ2_FILTERS } from "./quiz2";
import { STUDY_SECTIONS } from "./study";
import { STUDY2_SECTIONS } from "./study2";
import { PROMPTS } from "./prompts";
import { DSA_PROMPTS } from "./dsa";

type Filter = { value: string; label: string };

export const ALL_FLASHCARDS: Flashcard[] = [
  ...FLASHCARDS,
  ...FLASHCARDS2,
  ...FLASHCARDS3,
  ...PERF_LESSONS,
].map((c) => ({ ...c, level: resolveLevel(c) }));

export const ALL_FLASHCARD_FILTERS: Filter[] = [
  { value: "all", label: "All" },
  ...FLASHCARD_FILTERS,
  ...FLASHCARD2_FILTERS,
  ...FLASHCARD3_FILTERS,
  { value: "perf", label: "Performance" },
];

export const ALL_QUIZ = [...QUIZ, ...QUIZ2];

export const ALL_QUIZ_FILTERS: Filter[] = [
  { value: "all", label: "All" },
  ...QUIZ_FILTERS,
  ...QUIZ2_FILTERS,
];

export const ALL_STUDY = [...STUDY_SECTIONS, ...STUDY2_SECTIONS];

export const ALL_PROMPTS = [...PROMPTS, ...DSA_PROMPTS, ...PERF_SESSIONS];

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
