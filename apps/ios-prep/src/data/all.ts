// Single aggregation point for all content — consumed by the flashcards page,
// the daily session, and AI search so they never drift out of sync.
import { resolveLevel } from "@/lib/levels";
import type { Flashcard } from "./flashcards";
import { FLASHCARDS, FLASHCARD_FILTERS } from "./flashcards";
import { ADVANCED_FLASHCARDS, ADVANCED_QUIZ, ADVANCED_STUDY } from "./advanced";
import { ADVANCED2_FLASHCARDS, ADVANCED2_QUIZ, ADVANCED2_STUDY } from "./advanced2";
import { ADVANCED3_FLASHCARDS, ADVANCED3_QUIZ, ADVANCED3_STUDY } from "./advanced3";
import { ADVANCED4_FLASHCARDS, ADVANCED4_QUIZ, ADVANCED4_STUDY } from "./advanced4";
import { ADVANCED5_FLASHCARDS, ADVANCED5_QUIZ, ADVANCED5_STUDY } from "./advanced5";
import { ADVANCED6_FLASHCARDS, ADVANCED6_QUIZ, ADVANCED6_STUDY } from "./advanced6";
import { ADVANCED7_FLASHCARDS, ADVANCED7_QUIZ, ADVANCED7_STUDY } from "./advanced7";
import { ADVANCED8_FLASHCARDS, ADVANCED8_QUIZ, ADVANCED8_STUDY } from "./advanced8";
import { ADVANCED9_FLASHCARDS, ADVANCED9_QUIZ, ADVANCED9_STUDY } from "./advanced9";
import { ADVANCED10_FLASHCARDS, ADVANCED10_QUIZ, ADVANCED10_STUDY } from "./advanced10";
import { ADVANCED11_FLASHCARDS, ADVANCED11_QUIZ, ADVANCED11_STUDY } from "./advanced11";
import { ADVANCED12_FLASHCARDS, ADVANCED12_QUIZ, ADVANCED12_STUDY } from "./advanced12";
import { ADVANCED13_FLASHCARDS, ADVANCED13_QUIZ, ADVANCED13_STUDY } from "./advanced13";
import { ADVANCED14_FLASHCARDS, ADVANCED14_QUIZ, ADVANCED14_STUDY } from "./advanced14";
import { ADVANCED15_FLASHCARDS, ADVANCED15_QUIZ, ADVANCED15_STUDY } from "./advanced15";
import { ADVANCED16_FLASHCARDS, ADVANCED16_QUIZ, ADVANCED16_STUDY } from "./advanced16";
import { QUIZ } from "./quiz";
import { STUDY_SECTIONS } from "./study";
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
  ...ADVANCED8_FLASHCARDS,
  ...ADVANCED9_FLASHCARDS,
  ...ADVANCED10_FLASHCARDS,
  ...ADVANCED11_FLASHCARDS,
  ...ADVANCED12_FLASHCARDS,
  ...ADVANCED13_FLASHCARDS,
  ...ADVANCED14_FLASHCARDS,
  ...ADVANCED15_FLASHCARDS,
  ...ADVANCED16_FLASHCARDS,
].map((c) => ({ ...c, level: resolveLevel(c) }));

export const ALL_FLASHCARD_FILTERS = [...FLASHCARD_FILTERS];

export const ALL_QUIZ = [
  ...QUIZ,
  ...ADVANCED_QUIZ,
  ...ADVANCED2_QUIZ,
  ...ADVANCED3_QUIZ,
  ...ADVANCED4_QUIZ,
  ...ADVANCED5_QUIZ,
  ...ADVANCED6_QUIZ,
  ...ADVANCED7_QUIZ,
  ...ADVANCED8_QUIZ,
  ...ADVANCED9_QUIZ,
  ...ADVANCED10_QUIZ,
  ...ADVANCED11_QUIZ,
  ...ADVANCED12_QUIZ,
  ...ADVANCED13_QUIZ,
  ...ADVANCED14_QUIZ,
  ...ADVANCED15_QUIZ,
  ...ADVANCED16_QUIZ,
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
  ...ADVANCED8_STUDY,
  ...ADVANCED9_STUDY,
  ...ADVANCED10_STUDY,
  ...ADVANCED11_STUDY,
  ...ADVANCED12_STUDY,
  ...ADVANCED13_STUDY,
  ...ADVANCED14_STUDY,
  ...ADVANCED15_STUDY,
  ...ADVANCED16_STUDY,
];

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
