// TypeScript types mirroring the lesson data format.
// Generated data lives in public/data/*.json (created by scripts/build-data.mjs).

export interface CheckRule {
  re: { source: string; flags: string } | unknown;
  hint: string;
}

export type StepType = "text" | "code" | "quiz" | "exercise" | "xcode";

export interface BaseStep {
  type: StepType;
  title?: string;
  caption?: string;
  lang?: LangId;
}

export interface TextStep extends BaseStep {
  type: "text";
  md: string[];
}

export interface CodeStep extends BaseStep {
  type: "code";
  source: string;
}

export interface QuizStep extends BaseStep {
  type: "quiz";
  q: string;
  choices: string[];
  answer: number;
  explain?: string;
  nudge?: string;
}

export interface ExerciseStep extends BaseStep {
  type: "exercise";
  prompt: string[];
  starter?: string;
  solution: string;
  checks: CheckRule[];
  mustNot?: CheckRule[];
  success?: string;
}

export interface XcodeStep extends BaseStep {
  type: "xcode";
  items: string[];
  label?: string;
  intro?: string[];
}

export type Step = TextStep | CodeStep | QuizStep | ExerciseStep | XcodeStep;

export interface Lesson {
  id: string;
  title: string;
  steps: Step[];
}

export interface Module {
  id: string;
  title: string;
  emoji?: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  emoji: string;
  storeKey: string;
  modules: Module[];
}

export type LangId = "swift" | "python" | "kotlin" | "ruby" | "go" | "ts";
