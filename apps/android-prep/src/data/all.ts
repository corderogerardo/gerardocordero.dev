// Single aggregation point for all content — consumed by the flashcards page,
// the daily session, and AI search so they never drift out of sync.
import { resolveLevel } from "@/lib/levels";
import type { Flashcard } from "./flashcards";
import { FLASHCARDS, FLASHCARD_FILTERS } from "./flashcards";
import { ADVANCED_FLASHCARDS, ADVANCED_FLASHCARD_FILTERS } from "./advanced";
import { ADVANCED2_FLASHCARDS, ADVANCED2_FLASHCARD_FILTERS } from "./advanced2";
import { ADVANCED3_FLASHCARDS, ADVANCED3_FLASHCARD_FILTERS } from "./advanced3";
import { ADVANCED4_FLASHCARDS, ADVANCED4_FLASHCARD_FILTERS } from "./advanced4";
import { ADVANCED5_FLASHCARDS, ADVANCED5_FLASHCARD_FILTERS } from "./advanced5";
import { ADVANCED6_FLASHCARDS, ADVANCED6_FLASHCARD_FILTERS } from "./advanced6";
import {
  ADVANCED7_FLASHCARDS,
  ADVANCED7_STUDY,
  ADVANCED7_PROMPTS,
} from "./advanced7";
import { QUIZ } from "./quiz";
import { ADVANCED_QUIZ } from "./advanced";
import { ADVANCED2_QUIZ } from "./advanced2";
import { ADVANCED3_QUIZ } from "./advanced3";
import { ADVANCED4_QUIZ } from "./advanced4";
import { ADVANCED5_QUIZ } from "./advanced5";
import { STUDY_SECTIONS } from "./study";
import { ADVANCED_STUDY } from "./advanced";
import { ADVANCED2_STUDY } from "./advanced2";
import { ADVANCED3_STUDY } from "./advanced3";
import { ADVANCED4_STUDY } from "./advanced4";
import { ADVANCED5_STUDY } from "./advanced5";
import { ADVANCED6_STUDY } from "./advanced6";
import { PROMPTS } from "./prompts";

export const ALL_FLASHCARDS: Flashcard[] = [
  ...FLASHCARDS,
  ...ADVANCED_FLASHCARDS,
  ...ADVANCED2_FLASHCARDS,
  ...ADVANCED3_FLASHCARDS,
  ...ADVANCED4_FLASHCARDS,
  ...ADVANCED5_FLASHCARDS,
  ...ADVANCED6_FLASHCARDS,
  ...ADVANCED7_FLASHCARDS,
].map((c) => ({ ...c, level: resolveLevel(c) }));

export const ALL_FLASHCARD_FILTERS = [
  ...FLASHCARD_FILTERS,
  ...ADVANCED_FLASHCARD_FILTERS,
  ...ADVANCED2_FLASHCARD_FILTERS,
  ...ADVANCED3_FLASHCARD_FILTERS,
  ...ADVANCED4_FLASHCARD_FILTERS,
  ...ADVANCED5_FLASHCARD_FILTERS,
  ...ADVANCED6_FLASHCARD_FILTERS,
];

export const ALL_QUIZ = [
  ...QUIZ,
  ...ADVANCED_QUIZ,
  ...ADVANCED2_QUIZ,
  ...ADVANCED3_QUIZ,
  ...ADVANCED4_QUIZ,
  ...ADVANCED5_QUIZ,
];

export const ALL_STUDY = [
  ...STUDY_SECTIONS,
  ...ADVANCED_STUDY,
  ...ADVANCED2_STUDY,
  ...ADVANCED3_STUDY,
  ...ADVANCED4_STUDY,
  ...ADVANCED5_STUDY,
  ...ADVANCED6_STUDY,
  ...ADVANCED7_STUDY,
];

export const ALL_PROMPTS = [...PROMPTS, ...ADVANCED7_PROMPTS];

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
