import type { Locale } from "@gerardocordero/prep-kit";
import { FLASHCARDS, FLASHCARD_FILTERS } from "@/data/flashcards";
import { QUIZ, QUIZ_FILTERS } from "@/data/quiz";
import { STUDY_SECTIONS } from "@/data/study";
import { PROMPTS } from "@/data/prompts";
import { PITCHES, PITCHES_INTRO_HTML } from "@/data/pitches";
import { CHECKLIST_GROUPS, PROGRESS_INTRO } from "@/data/progress";
import { ROADMAP } from "@/data/roadmap";
import { ARCH_INTRO, ARCH_SECTIONS, DEEP_DIVES, DEEPDIVES_INTRO } from "@/data/architecture";
import { resolveLevel } from "@/lib/levels";
import type { Flashcard } from "@/data/flashcards";

// Spanish imports
import { FLASHCARDS as FLASHCARDS_ES, FLASHCARD_FILTERS as FLASHCARD_FILTERS_ES } from "@/data/flashcards.es";
import { QUIZ as QUIZ_ES, QUIZ_FILTERS as QUIZ_FILTERS_ES } from "@/data/quiz.es";
import { STUDY_SECTIONS as STUDY_SECTIONS_ES } from "@/data/study.es";
import { PROMPTS as PROMPTS_ES } from "@/data/prompts.es";
import { PITCHES as PITCHES_ES, PITCHES_INTRO_HTML as PITCHES_INTRO_HTML_ES } from "@/data/pitches.es";
import { CHECKLIST_GROUPS as CHECKLIST_GROUPS_ES, PROGRESS_INTRO as PROGRESS_INTRO_ES } from "@/data/progress.es";
import { ROADMAP as ROADMAP_ES } from "@/data/roadmap.es";
import { ARCH_INTRO as ARCH_INTRO_ES, ARCH_SECTIONS as ARCH_SECTIONS_ES, DEEP_DIVES as DEEP_DIVES_ES, DEEPDIVES_INTRO as DEEPDIVES_INTRO_ES } from "@/data/architecture.es";

type Filter = { value: string; label: string };

export function getFlashcards(locale: Locale): Flashcard[] {
  const source = locale === "es" ? FLASHCARDS_ES : FLASHCARDS;
  return source.map((c) => ({
    ...c,
    level: resolveLevel(c),
  }));
}

export function getFlashcardFilters(locale: Locale): Filter[] {
  const source = locale === "es" ? FLASHCARD_FILTERS_ES : FLASHCARD_FILTERS;
  return [
    { value: "all", label: locale === "es" ? "Todas" : "All" },
    ...source,
  ];
}

export function getQuiz(locale: Locale) {
  return locale === "es" ? QUIZ_ES : QUIZ;
}

export function getQuizFilters(locale: Locale): Filter[] {
  const source = locale === "es" ? QUIZ_FILTERS_ES : QUIZ_FILTERS;
  return [
    { value: "all", label: locale === "es" ? "Todas" : "All" },
    ...source,
  ];
}

export function getStudySections(locale: Locale) {
  return locale === "es" ? STUDY_SECTIONS_ES : STUDY_SECTIONS;
}

export function getPrompts(locale: Locale) {
  return locale === "es" ? PROMPTS_ES : PROMPTS;
}

export function getPitches(locale: Locale) {
  return locale === "es" ? PITCHES_ES : PITCHES;
}

export function getPitchesIntroHtml(locale: Locale) {
  return locale === "es" ? PITCHES_INTRO_HTML_ES : PITCHES_INTRO_HTML;
}

export function getChecklistGroups(locale: Locale) {
  return locale === "es" ? CHECKLIST_GROUPS_ES : CHECKLIST_GROUPS;
}

export function getProgressIntro(locale: Locale) {
  return locale === "es" ? PROGRESS_INTRO_ES : PROGRESS_INTRO;
}

export function getRoadmap(locale: Locale) {
  return locale === "es" ? ROADMAP_ES : ROADMAP;
}

export function getArchitecture(locale: Locale) {
  return locale === "es"
    ? { intro: ARCH_INTRO_ES, sections: ARCH_SECTIONS_ES, deepDives: DEEP_DIVES_ES, deepDivesIntro: DEEPDIVES_INTRO_ES }
    : { intro: ARCH_INTRO, sections: ARCH_SECTIONS, deepDives: DEEP_DIVES, deepDivesIntro: DEEPDIVES_INTRO };
}
