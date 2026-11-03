// Unit tests for the study-session state machine. The screen is presentation only:
// these pin the rules that used to live inside it — what a session queues, how
// reveal/grade advance it, how "again" recirculates, and what progress means.
import type { SrsMap } from "@gerardocordero/prep-kit/lib/srs";

import {
  applyGrade,
  currentCardId,
  EMPTY_SESSION,
  revealCard,
  sessionProgress,
  type Session,
  startAheadSession,
  startDueSession,
} from "../src/study/session";

const TODAY = 20_000;

function entry(due: number) {
  return { reps: 2, interval: 3, ease: 2.3, due };
}

function session(overrides: Partial<Session> = {}): Session {
  return {
    key: "react-native|all",
    queue: ["a", "b"],
    revealed: false,
    done: 0,
    mode: "due",
    ...overrides,
  };
}

describe("startDueSession", () => {
  it("queues only due cards, preserving pool order", () => {
    const srs: SrsMap = {
      a: entry(TODAY + 1), // scheduled tomorrow: not due
      b: entry(TODAY), // due today
      c: entry(TODAY - 5), // overdue
      // d has no entry: new cards are always due
    };

    const started = startDueSession("react-native|all", ["a", "b", "c", "d"], srs, TODAY);

    expect(started.queue).toEqual(["b", "c", "d"]);
  });

  it("starts unrevealed and unfinished, in due mode, keyed to the subject/category", () => {
    const started = startDueSession("ios|performance", ["a"], {}, TODAY);

    expect(started).toEqual({
      key: "ios|performance",
      queue: ["a"],
      revealed: false,
      done: 0,
      mode: "due",
    });
  });

  it("has no current card when nothing in the pool is due", () => {
    const started = startDueSession("react-native|all", ["a"], { a: entry(TODAY + 2) }, TODAY);

    expect(currentCardId(started)).toBeUndefined();
    expect(sessionProgress(started)).toEqual({ total: 0, percent: 0 });
  });
});

describe("currentCardId", () => {
  it("is the head of the queue", () => {
    expect(currentCardId(session())).toBe("a");
  });

  it("is undefined once the queue is exhausted", () => {
    expect(currentCardId(EMPTY_SESSION)).toBeUndefined();
  });
});

describe("revealCard", () => {
  it("reveals the answer without touching the queue or progress", () => {
    const revealed = revealCard(session({ done: 1 }));

    expect(revealed.revealed).toBe(true);
    expect(revealed.queue).toEqual(["a", "b"]);
    expect(revealed.done).toBe(1);
  });

  it("is idempotent", () => {
    const revealed = revealCard(revealCard(session()));

    expect(revealed.revealed).toBe(true);
    expect(revealed.queue).toEqual(["a", "b"]);
  });
});

describe("applyGrade", () => {
  it.each(["hard", "good", "easy"] as const)(
    "removes the card and counts it as done for %s",
    (grade) => {
      const graded = applyGrade(session({ revealed: true }), grade);

      expect(graded.queue).toEqual(["b"]);
      expect(graded.done).toBe(1);
      expect(graded.revealed).toBe(false);
    },
  );

  it("sends an 'again' card to the back of the queue without counting it", () => {
    const graded = applyGrade(session({ queue: ["a", "b", "c"], revealed: true }), "again");

    expect(graded.queue).toEqual(["b", "c", "a"]);
    expect(graded.done).toBe(0);
    expect(graded.revealed).toBe(false);
  });

  it("keeps a single-card queue on the same card after 'again'", () => {
    const graded = applyGrade(session({ queue: ["a"], revealed: true }), "again");

    expect(graded.queue).toEqual(["a"]);
    expect(graded.done).toBe(0);
  });

  it("completes the session after the last card is graded well", () => {
    const graded = applyGrade(session({ queue: ["a"], done: 3, revealed: true }), "good");

    expect(currentCardId(graded)).toBeUndefined();
    expect(sessionProgress(graded)).toEqual({ total: 4, percent: 100 });
  });

  it("leaves the input session untouched", () => {
    const before = session({ queue: ["a", "b"], revealed: true });
    const queueBefore = [...before.queue];

    applyGrade(before, "again");

    expect(before.queue).toEqual(queueBefore);
    expect(before.revealed).toBe(true);
  });

  it("is a no-op when the queue is empty", () => {
    expect(applyGrade(EMPTY_SESSION, "good")).toEqual(EMPTY_SESSION);
  });
});

describe("startAheadSession", () => {
  it("queues the whole pool and restarts progress in ahead mode", () => {
    const ahead = startAheadSession(session({ queue: [], done: 3, revealed: true }), [
      "a",
      "b",
    ]);

    expect(ahead).toEqual({
      key: "react-native|all",
      queue: ["a", "b"],
      revealed: false,
      done: 0,
      mode: "ahead",
    });
  });

  it("takes its own copy of the pool", () => {
    const pool = ["a", "b"];
    const ahead = startAheadSession(session(), pool);

    pool.push("c");

    expect(ahead.queue).toEqual(["a", "b"]);
  });
});

describe("sessionProgress", () => {
  it("counts the current card plus finished ones", () => {
    const progress = sessionProgress(session({ queue: ["a", "b"], done: 1 }));

    expect(progress.total).toBe(3);
    expect(progress.percent).toBeCloseTo(100 / 3);
  });

  it("is zero-finished rather than NaN for an empty session", () => {
    expect(sessionProgress(EMPTY_SESSION)).toEqual({ total: 0, percent: 0 });
  });
});
