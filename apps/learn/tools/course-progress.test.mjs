// Course Progress Tests — Phase 1 home progress rings
//
// Test Organization:
//
//   This file is organized by feature area, following BDD patterns.
//   Each `test.describe` block groups related assertions around a specific
//   concern.  Every test:
//     • States what it tests (the "what")
//     • Explains why it matters (the "why")
//     • Demonstrates how to test in isolation (the "how")
//
//   Run: `node --test tools/course-progress.test.mjs`
//   Coverage: buildCourseProgressShape, computeCourseProgress,
//             lessonCompleteInternal, parseStoredProgress
//
import { test, describe } from "node:test";
import assert from "node:assert/strict";

// Import the core functions under test
import {
  buildCourseProgressShape,
  computeCourseProgress,
  lessonCompleteInternal,
  parseStoredProgress,
} from "../src/lib/course-progress.ts";

// ---------------------------------------------------------------------------
// Helper: make a course with a given number of modules and lessons
// ---------------------------------------------------------------------------

function makeCourse(modules) {
  return {
    id: "ios",
    title: "iOS & Swift",
    emoji: "📱",
    storeKey: "pawwalk-academy-ios-v1",
    modules,
  };
}

// Test data: two-lesson course (one module, two lessons)
const twoLesson = makeCourse([
  {
    id: "m1",
    title: "Module 1",
    lessons: [
      { id: "l1", title: "Lesson 1", steps: [{ type: "text", md: ["hi"] }, { type: "quiz", q: "?", choices: ["a", "b"], answer: 0 }] },
      { id: "l2", title: "Lesson 2", steps: [{ type: "text", md: ["hi"] }, { type: "quiz", q: "?", choices: ["a", "b"], answer: 0 }] },
    ],
  },
]);

// Test data: ten-lesson course (one module)
const tenLesson = makeCourse([
  { id: "m1", title: "Module 1", lessons: Array.from({ length: 10 }, (_, i) => ({
    id: `l${i}`, title: `Lesson ${i}`, steps: [{ type: "text", md: ["hi"] }, { type: "quiz", q: "?", choices: ["a", "b"], answer: 0 }] },
  })),
  }]);
// ---------------------------------------------------------------------------
// Feature: buildCourseProgressShape
// ---------------------------------------------------------------------------

describe("buildCourseProgressShape", () => {
  test("carries only lesson keys, step counts and gated indexes", () => {
    const shape = buildCourseProgressShape(twoLesson);
    assert.deepEqual(shape, {
      storeKey: "pawwalk-academy-ios-v1",
      lessons: [
        { key: "m1/l1", steps: 2, gated: [1] },
        { key: "m1/l2", steps: 2, gated: [1] },
      ],
    });
  });
});

// ---------------------------------------------------------------------------
// Feature: computeCourseProgress
// ---------------------------------------------------------------------------

describe("computeCourseProgress", () => {
  test("unstarted course shows 0%", () => {
    const result = computeCourseProgress(buildCourseProgressShape(twoLesson), {}, {});
    assert.deepEqual(result, { completed: 0, total: 2, pct: 0 });
  });

  test("3 of 10 completed lessons show 30%", () => {
    const done = {};
    const reveal = {};
    for (let i = 0; i < 3; i++) {
      done[`m1/l${i}/1`] = true;
      reveal[`m1/l${i}`] = 2;
    }
    assert.deepEqual(
      computeCourseProgress(buildCourseProgressShape(tenLesson), done, reveal),
      { completed: 3, total: 10, pct: 30 }
    );
  });

  test("all lessons complete shows 100%", () => {
    const done = { "m1/l1/1": true, "m1/l2/1": true };
    const reveal = { "m1/l1": 2, "m1/l2": 2 };
    assert.equal(
      computeCourseProgress(buildCourseProgressShape(twoLesson), done, reveal).pct,
      100
    );
  });
});

// ---------------------------------------------------------------------------
// Feature: lessonCompleteInternal
// ---------------------------------------------------------------------------

describe("lessonCompleteInternal", () => {
  test("matches shell semantics — full completion", () => {
    const lesson = twoLesson.modules[0].lessons[0];
    assert.equal(
      lessonCompleteInternal("m1", "l1", lesson, { "m1/l1": 2 }, { "m1/l1/1": true }),
      true
    );
  });

  test("matches shell semantics — incomplete gated step", () => {
    const lesson = twoLesson.modules[0].lessons[0];
    assert.equal(
      lessonCompleteInternal("m1", "l1", lesson, { "m1/l1": 2 }, {}),
      false
    );
  });

  test("matches shell semantics — incomplete reveal", () => {
    const lesson = twoLesson.modules[0].lessons[0];
    assert.equal(
      lessonCompleteInternal("m1", "l1", lesson, {}, { "m1/l1/1": true }),
      false
    );
  });
});

// ---------------------------------------------------------------------------
// Feature: parseStoredProgress
// ---------------------------------------------------------------------------

describe("parseStoredProgress", () => {
  test("reads Zustand persist wrapper format", () => {
    const raw = JSON.stringify({
      state: { done: { "m1/l1/1": true }, reveal: { "m1/l1": 2 } },
      version: 0,
    });
    assert.deepEqual(parseStoredProgress(raw), {
      done: { "m1/l1/1": true },
      reveal: { "m1/l1": 2 },
    });
  });

  test("reads legacy raw format", () => {
    const raw = JSON.stringify({ done: { "m1/l1/1": true }, reveal: { "m1/l1": 2 } });
    assert.deepEqual(parseStoredProgress(raw), {
      done: { "m1/l1/1": true },
      reveal: { "m1/l1": 2 },
    });
  });

  test("tolerates missing or malformed storage", () => {
    assert.deepEqual(parseStoredProgress(null), { done: {}, reveal: {} });
    assert.deepEqual(parseStoredProgress("not json {"), { done: {}, reveal: {} });
    assert.deepEqual(
      parseStoredProgress(JSON.stringify({ state: "nope" })),
      { done: {}, reveal: {} }
    );
  });
});

// ---------------------------------------------------------------------------
// Integration: end-to-end progress flow
// ---------------------------------------------------------------------------

describe("progress flow integration", () => {
  test("partial completion reflects correct percentage", () => {
    const course = makeCourse([
      {
        id: "m1",
        title: "Module 1",
        lessons: [
          { id: "l1", title: "Lesson 1", steps: [{ type: "text", md: ["hi"] }, { type: "quiz", q: "?", choices: ["a", "b"], answer: 0 }] },
          { id: "l2", title: "Lesson 2", steps: [{ type: "text", md: ["hi"] }, { type: "quiz", q: "?", choices: ["a", "b"], answer: 0 }] },
        ],
      },
    ]);
    const done = { "m1/l1/1": true };
    const reveal = { "m1/l1": 2, "m1/l2": 0 };
    const result = computeCourseProgress(buildCourseProgressShape(course), done, reveal);
    assert.equal(result.pct, 50);
    assert.equal(result.completed, 1);
    assert.equal(result.total, 2);
  });
});
