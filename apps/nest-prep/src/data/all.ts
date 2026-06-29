// Single aggregation point for all content — consumed by the flashcards page,
// the daily session, and AI search so they never drift out of sync.
import { resolveLevel } from "@/lib/levels";
import type { Flashcard } from "./flashcards";
import { FLASHCARDS, FLASHCARD_FILTERS } from "./flashcards";
import { QUIZ, QUIZ_FILTERS } from "./quiz";
import { PROMPTS } from "./prompts";
import type { StudySection } from "@gerardocordero/prep-kit";

export const ALL_FLASHCARDS: Flashcard[] = FLASHCARDS.map((c) => ({
  ...c,
  level: resolveLevel(c),
}));
export const ALL_FLASHCARD_FILTERS = [...FLASHCARD_FILTERS];
export const ALL_QUIZ = [...QUIZ];
export const ALL_QUIZ_FILTERS = [...QUIZ_FILTERS];
export const ALL_PROMPTS = [...PROMPTS];
// No long-form study sections in the starter; add a src/data/study.ts and spread
// it here to power /search over study content too.
export const ALL_STUDY: StudySection[] = [];
