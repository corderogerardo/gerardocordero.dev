// Zustand store for course progress — replaces the `const state = loadState()`
// singleton in app.js. Persisted to localStorage per-course (storeKey).

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SrsEntry } from "@/lib/srs";

/** Per-lesson reveal count (how many steps are visible). Key = "moduleId/lessonId" */
type RevealMap = Record<string, number>;

/** Step completion. Key = "moduleId/lessonId/stepIdx" → true | "help" | "skip" */
type DoneMap = Record<string, true | "help" | "skip">;

/** Xcode checklist items. Key = "moduleId/lessonId/stepIdx/itemIdx" */
type ChecksMap = Record<string, boolean>;

/** Exercise editor content. Key = "moduleId/lessonId/stepIdx" */
type CodeMap = Record<string, string>;

/** SRS card state. Key = "moduleId/lessonId/stepIdx" */
type ReviewMap = Record<string, SrsEntry>;

export interface LearnState {
  done: DoneMap;
  reveal: RevealMap;
  checks: ChecksMap;
  code: CodeMap;
  review: ReviewMap;
  setDone: (key: string, val: true | "help" | "skip") => void;
  setReveal: (key: string, count: number) => void;
  setCheck: (key: string, checked: boolean) => void;
  setCode: (key: string, code: string) => void;
  setReview: (key: string, entry: SrsEntry) => void;
  /** Reset progress for a single lesson (moduleId/lessonId prefix). */
  resetLesson: (prefix: string) => void;
  /** Reset all progress (writes tombstone so legacy migration doesn't fire). */
  resetAll: () => void;
}

export function createLearnStore(storeKey: string) {
  return create<LearnState>()(
    persist(
      (set) => ({
        done: {},
        reveal: {},
        checks: {},
        code: {},
        review: {},

        setDone: (key, val) =>
          set((s) => ({ done: { ...s.done, [key]: val } })),

        setReveal: (key, count) =>
          set((s) => ({ reveal: { ...s.reveal, [key]: count } })),

        setCheck: (key, checked) =>
          set((s) => ({ checks: { ...s.checks, [key]: checked } })),

        setCode: (key, code) =>
          set((s) => ({ code: { ...s.code, [key]: code } })),

        setReview: (key, entry) =>
          set((s) => ({ review: { ...s.review, [key]: entry } })),

        resetLesson: (prefix) =>
          set((s) => {
            const filter = <T extends Record<string, unknown>>(map: T): T => {
              const next = { ...map };
              for (const key of Object.keys(next)) {
                if (key.startsWith(prefix)) delete (next as Record<string, unknown>)[key];
              }
              return next;
            };
            return {
              done: filter(s.done) as DoneMap,
              checks: filter(s.checks) as ChecksMap,
              code: filter(s.code) as CodeMap,
              reveal: filter(s.reveal) as RevealMap,
            };
          }),

        resetAll: () => set({ done: {}, reveal: {}, checks: {}, code: {}, review: {} }),
      }),
      {
        name: storeKey,
      },
    ),
  );
}
