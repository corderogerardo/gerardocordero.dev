// Tests for course progress computation (Phase 1 home progress rings).
// Imports the TS source directly — Node 24 strips types; the module has no
// runtime imports (only `import type`), so no path-alias resolution needed.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildCourseProgressShape,
  computeCourseProgress,
  lessonCompleteInternal,
  parseStoredProgress,
} from "../src/lib/course-progress.ts";

function makeCourse(modules) {
  return {
    id: "ios",
    title: "iOS & Swift",
    emoji: "📱",
    storeKey: "pawwalk-academy-ios-v1",
    modules,
  };
}

const gated = { type: "quiz", q: "?", choices: ["a", "b"], answer: 0 };
const open = { type: "text", md: ["hi"] };

const twoLesson = makeCourse([
  {
    id: "m1",
    title: "Module 1",
    lessons: [
      { id: "l1", title: "Lesson 1", steps: [open, gated] },
      { id: "l2", title: "Lesson 2", steps: [open, gated] },
    ],
  },
]);

const tenLesson = makeCourse([
  { id: "m1", title: "Module 1", lessons: [
    ...Array.from({ length: 10 }, (_, i) => ({
      id: `l${i}`,
      title: `Lesson ${i}`,
      steps: [open, gated],
    })),
  ] },
]);

test("shape carries only lesson keys, step counts and gated indexes", () => {
  assert.deepEqual(buildCourseProgressShape(twoLesson), {
    storeKey: "pawwalk-academy-ios-v1",
    lessons: [
      { key: "m1/l1", steps: 2, gated: [1] },
      { key: "m1/l2", steps: 2, gated: [1] },
    ],
  });
});

test("unstarted course shows 0%", () => {
  assert.deepEqual(computeCourseProgress(buildCourseProgressShape(twoLesson), {}, {}), {
    completed: 0,
    total: 2,
    pct: 0,
  });
});

test("3 of 10 completed lessons show 30%", () => {
  const done = {};
  const reveal = {};
  for (let i = 0; i < 3; i++) {
    done[`m1/l${i}/1`] = true;
    reveal[`m1/l${i}`] = 2;
  }
  assert.deepEqual(computeCourseProgress(buildCourseProgressShape(tenLesson), done, reveal), {
    completed: 3,
    total: 10,
    pct: 30,
  });
});

test("all lessons complete shows 100%", () => {
  const done = { "m1/l1/1": true, "m1/l2/1": true };
  const reveal = { "m1/l1": 2, "m1/l2": 2 };
  assert.equal(computeCourseProgress(buildCourseProgressShape(twoLesson), done, reveal).pct, 100);
});

test("reveal full but gated step missing keeps lesson incomplete", () => {
  const reveal = { "m1/l1": 2 };
  assert.deepEqual(computeCourseProgress(buildCourseProgressShape(twoLesson), {}, reveal), {
    completed: 0,
    total: 2,
    pct: 0,
  });
});

test("partial reveal keeps lesson incomplete even with gated step done", () => {
  const done = { "m1/l1/1": true };
  const reveal = { "m1/l1": 1 };
  assert.equal(computeCourseProgress(buildCourseProgressShape(twoLesson), done, reveal).pct, 0);
});

test("lesson with only open steps completes when fully revealed", () => {
  const course = makeCourse([
    { id: "m1", title: "M1", lessons: [
      { id: "l1", title: "L1", steps: [open, open] },
    ] },
  ]);
  const reveal = { "m1/l1": 2 };
  assert.equal(computeCourseProgress(buildCourseProgressShape(course), {}, reveal).pct, 100);
});

test("help/skip values count as done like lessonCompleteInternal", () => {
  const done = { "m1/l1/1": "help", "m1/l2/1": "skip" };
  const reveal = { "m1/l1": 2, "m1/l2": 2 };
  assert.equal(computeCourseProgress(buildCourseProgressShape(twoLesson), done, reveal).pct, 100);
});

test("empty course yields 0%", () => {
  const course = makeCourse([]);
  assert.deepEqual(computeCourseProgress(buildCourseProgressShape(course), {}, {}), {
    completed: 0,
    total: 0,
    pct: 0,
  });
});

test("lessonCompleteInternal matches shell semantics", () => {
  const lesson = twoLesson.modules[0].lessons[0];
  assert.equal(
    lessonCompleteInternal("m1", "l1", lesson, { "m1/l1": 2 }, { "m1/l1/1": true }),
    true,
  );
  assert.equal(
    lessonCompleteInternal("m1", "l1", lesson, { "m1/l1": 2 }, {}),
    false,
  );
  assert.equal(
    lessonCompleteInternal("m1", "l1", lesson, {}, { "m1/l1/1": true }),
    false,
  );
});

test("parseStoredProgress reads zustand persist wrapper", () => {
  const raw = JSON.stringify({
    state: { done: { "m1/l1/1": true }, reveal: { "m1/l1": 2 } },
    version: 0,
  });
  assert.deepEqual(parseStoredProgress(raw), {
    done: { "m1/l1/1": true },
    reveal: { "m1/l1": 2 },
  });
});

test("parseStoredProgress reads legacy raw format", () => {
  const raw = JSON.stringify({ done: { "m1/l1/1": true }, reveal: { "m1/l1": 2 } });
  assert.deepEqual(parseStoredProgress(raw), {
    done: { "m1/l1/1": true },
    reveal: { "m1/l1": 2 },
  });
});

test("parseStoredProgress tolerates missing or malformed storage", () => {
  assert.deepEqual(parseStoredProgress(null), { done: {}, reveal: {} });
  assert.deepEqual(parseStoredProgress("not json {"), { done: {}, reveal: {} });
  assert.deepEqual(parseStoredProgress(JSON.stringify({ state: "nope" })), { done: {}, reveal: {} });
});
