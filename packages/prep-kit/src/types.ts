// Canonical content types shared by every *-prep study site. Apps define their
// own data arrays; these are the shapes the kit components consume. (App `data/`
// modules may keep local copies of these shapes — TypeScript is structural, so
// identical shapes stay assignable either way.)
import type { Level } from "./lib/levels";

export type Flashcard = {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  answerHtml: string;
  /** Optional seniority level; defaults are derived per-category in the app. */
  level?: Level;
};

export type PromptKind = "coding" | "design";

export type Prompt = {
  id: string;
  kind: PromptKind;
  title: string;
  level: Level;
  tags: string[];
  /** The question / scenario (rich HTML). */
  promptHtml: string;
  /** Progressively revealed sections (e.g. Approach -> Solution). */
  reveal: { label: string; html: string }[];
};

export type QuizQuestion = {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  options: string[];
  answer: number;
  explanationHtml: string;
};

export type StudySection = { id: string; num: string; title: string; html: string };

export type Pitch = {
  id: string;
  num: string;
  title: string;
  metaHtml: string;
  scriptHtml: string;
  tipsHtml: string;
};

export type ChecklistItem = { id: string; label: string };
export type ChecklistGroup = { title: string; items: ChecklistItem[] };

export type NavItem = {
  href: string;
  label: string;
  /** Spanish nav label (falls back to `label` when absent). */
  labelEs?: string;
  /** Short description used on the overview page cards. */
  blurb?: string;
  /** Spanish blurb (falls back to `blurb` when absent). */
  blurbEs?: string;
};
