// Single aggregation point for all content — consumed by the flashcards page,
// the quiz page, the daily session, and AI search so they never drift.
import { resolveLevel } from "@/lib/levels";
import type { Flashcard } from "./flashcards";
import { FLASHCARDS, FLASHCARD_FILTERS } from "./flashcards";
import { FLASHCARDS2, FLASHCARD2_FILTERS } from "./flashcards2";
import { FLASHCARDS3, FLASHCARD3_FILTERS } from "./flashcards3";
import { PERF_LESSONS, PERF_SESSIONS } from "./perf";
import { ADVANCED1_FLASHCARDS, ADVANCED1_QUIZ } from "./advanced1";
import { ADVANCED2_FLASHCARDS, ADVANCED2_QUIZ } from "./advanced2";
import { ADVANCED3_FLASHCARDS, ADVANCED3_QUIZ } from "./advanced3";
import { ADVANCED4_FLASHCARDS, ADVANCED4_QUIZ } from "./advanced4";
import { ADVANCED5_FLASHCARDS, ADVANCED5_QUIZ } from "./advanced5";
import { ADVANCED6_FLASHCARDS, ADVANCED6_QUIZ } from "./advanced6";
import { ADVANCED7_FLASHCARDS, ADVANCED7_QUIZ } from "./advanced7";
import { ADVANCED8_FLASHCARDS, ADVANCED8_QUIZ } from "./advanced8";
import { ADVANCED9_FLASHCARDS, ADVANCED9_QUIZ } from "./advanced9";
import { ADVANCED10_FLASHCARDS, ADVANCED10_QUIZ } from "./advanced10";
import { ADVANCED11_FLASHCARDS, ADVANCED11_QUIZ } from "./advanced11";
import { ADVANCED12_FLASHCARDS, ADVANCED12_QUIZ } from "./advanced12";
import { ADVANCED13_FLASHCARDS, ADVANCED13_QUIZ } from "./advanced13";
import { ADVANCED14_FLASHCARDS, ADVANCED14_QUIZ } from "./advanced14";
import { ADVANCED15_FLASHCARDS, ADVANCED15_QUIZ } from "./advanced15";
import { ADVANCED16_FLASHCARDS, ADVANCED16_QUIZ } from "./advanced16";
import { ADVANCED17_FLASHCARDS, ADVANCED17_QUIZ } from "./advanced17";
import { ADVANCED18_FLASHCARDS, ADVANCED18_QUIZ } from "./advanced18";
import { ADVANCED19_FLASHCARDS, ADVANCED19_QUIZ } from "./advanced19";
import { ADVANCED20_FLASHCARDS, ADVANCED20_QUIZ } from "./advanced20";
import { ADVANCED21_FLASHCARDS, ADVANCED21_QUIZ } from "./advanced21";
import { ADVANCED22_FLASHCARDS, ADVANCED22_QUIZ } from "./advanced22";
import { ADVANCED23_FLASHCARDS, ADVANCED23_QUIZ } from "./advanced23";
import { ADVANCED24_FLASHCARDS, ADVANCED24_QUIZ } from "./advanced24";
import { ADVANCED25_FLASHCARDS, ADVANCED25_QUIZ } from "./advanced25";
import { ADVANCED26_FLASHCARDS, ADVANCED26_QUIZ } from "./advanced26";
import { ADVANCED27_FLASHCARDS, ADVANCED27_QUIZ } from "./advanced27";
import { ADVANCED28_FLASHCARDS, ADVANCED28_QUIZ } from "./advanced28";
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
  ...ADVANCED1_FLASHCARDS,
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
  ...ADVANCED17_FLASHCARDS,
  ...ADVANCED18_FLASHCARDS,
  ...ADVANCED19_FLASHCARDS,
  ...ADVANCED20_FLASHCARDS,
  ...ADVANCED21_FLASHCARDS,
  ...ADVANCED22_FLASHCARDS,
  ...ADVANCED23_FLASHCARDS,
  ...ADVANCED24_FLASHCARDS,
  ...ADVANCED25_FLASHCARDS,
  ...ADVANCED26_FLASHCARDS,
  ...ADVANCED27_FLASHCARDS,
  ...ADVANCED28_FLASHCARDS,
].map((c) => ({ ...c, level: resolveLevel(c) }));

export const ALL_FLASHCARD_FILTERS: Filter[] = [
  { value: "all", label: "All" },
  ...FLASHCARD_FILTERS,
  ...FLASHCARD2_FILTERS,
  ...FLASHCARD3_FILTERS,
  { value: "perf", label: "Performance" },
  { value: "ts", label: "TypeScript" },
  { value: "aws", label: "AWS & Cloud" },
];

export const ALL_QUIZ = [...QUIZ, ...QUIZ2,
  ...ADVANCED1_QUIZ,
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
  ...ADVANCED17_QUIZ,
  ...ADVANCED18_QUIZ,
  ...ADVANCED19_QUIZ,
  ...ADVANCED20_QUIZ,
  ...ADVANCED21_QUIZ,
  ...ADVANCED22_QUIZ,
  ...ADVANCED23_QUIZ,
  ...ADVANCED24_QUIZ,
  ...ADVANCED25_QUIZ,
  ...ADVANCED26_QUIZ,
  ...ADVANCED27_QUIZ,
  ...ADVANCED28_QUIZ,
];

export const ALL_QUIZ_FILTERS: Filter[] = [
  { value: "all", label: "All" },
  ...QUIZ_FILTERS,
  ...QUIZ2_FILTERS,
  { value: "ts", label: "TypeScript" },
  { value: "aws", label: "AWS & Cloud" },
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
