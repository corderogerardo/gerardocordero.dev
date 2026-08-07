// Pure course-progress helpers shared by the lesson page and the home-page
// progress rings. Read-only consumers of the per-course Zustand store data
// persisted under `Course.storeKey` — never write to localStorage here.
//
// NOTE: this module has NO runtime imports (only `import type`), which lets the
// Node test runner strip types and import it directly (tools/course-progress.test.mjs).

import type { Course, Lesson, Step } from "@/lib/course-data";

export type DoneValue = true | "help" | "skip";

export interface ProgressState {
  done: Record<string, DoneValue>;
  reveal: Record<string, number>;
}

/** Steps that gate Continue until marked done (quiz/exercise/xcode). */
export function isGated(step: Step): boolean {
  return step.type === "quiz" || step.type === "exercise" || step.type === "xcode";
}

export function isStepDone(
  mId: string,
  lId: string,
  i: number,
  step: Step,
  done: Record<string, DoneValue>,
): boolean {
  if (!isGated(step)) return true;
  return !!done[`${mId}/${lId}/${i}`];
}

/** Same semantics as the lesson page: fully revealed AND every gated step done. */
export function lessonCompleteInternal(
  mId: string,
  lId: string,
  lesson: Lesson,
  reveal: Record<string, number>,
  done: Record<string, DoneValue>,
): boolean {
  const r = reveal[`${mId}/${lId}`] ?? 1;
  return (
    r >= lesson.steps.length &&
    lesson.steps.every((s, i) => isStepDone(mId, lId, i, s, done))
  );
}

/** Lean per-lesson info the home cards need — avoids serializing whole courses. */
export interface LessonShape {
  /** `${moduleId}/${lessonId}` — the key used in `reveal` and `done` maps. */
  key: string;
  steps: number;
  /** Step indexes that gate completion (quiz/exercise/xcode). */
  gated: number[];
}

export interface CourseProgressShape {
  storeKey: string;
  lessons: LessonShape[];
}

export function buildCourseProgressShape(course: Course): CourseProgressShape {
  const lessons: LessonShape[] = [];
  for (const m of course.modules) {
    for (const l of m.lessons) {
      const gated: number[] = [];
      l.steps.forEach((s, i) => {
        if (isGated(s)) gated.push(i);
      });
      lessons.push({ key: `${m.id}/${l.id}`, steps: l.steps.length, gated });
    }
  }
  return { storeKey: course.storeKey, lessons };
}

/** Fraction of lessons completed (0-100, rounded). Mirrors lessonCompleteInternal. */
export function computeCourseProgress(
  shape: CourseProgressShape,
  done: Record<string, DoneValue>,
  reveal: Record<string, number>,
): { completed: number; total: number; pct: number } {
  let completed = 0;
  for (const l of shape.lessons) {
    const r = reveal[l.key] ?? 1;
    const allGatedDone = l.gated.every((i) => !!done[`${l.key}/${i}`]);
    if (r >= l.steps && allGatedDone) completed += 1;
  }
  return {
    completed,
    total: shape.lessons.length,
    pct: shape.lessons.length === 0 ? 0 : Math.round((completed / shape.lessons.length) * 100),
  };
}

/**
 * Parse a stored progress blob. Zustand persist writes `{ state, version }`;
 * legacy builds wrote the bare `{ done, reveal }` object. Anything else (or
 * malformed JSON) yields empty progress — never throws.
 */
export function parseStoredProgress(raw: string | null): ProgressState {
  if (!raw) return { done: {}, reveal: {} };
  try {
    const parsed = JSON.parse(raw) as { state?: unknown } | Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return { done: {}, reveal: {} };
    const state = (parsed as { state?: unknown }).state ?? parsed;
    if (!state || typeof state !== "object") return { done: {}, reveal: {} };
    const s = state as Record<string, unknown>;
    return {
      done: (s.done as Record<string, DoneValue>) ?? {},
      reveal: (s.reveal as Record<string, number>) ?? {},
    };
  } catch {
    return { done: {}, reveal: {} };
  }
}
