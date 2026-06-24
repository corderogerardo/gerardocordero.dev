// Pure-logic tests for the study engine. Every function takes an explicit `today`
// (integer epoch-day) so the scheduler is deterministic and timezone-independent.
import {
  countToday,
  dueCount,
  isDue,
  logToday,
  nextLabel,
  schedule,
  seenCount,
  type SrsMap,
} from "../src/study/srs";
import { bumpStreak, currentStreak } from "../src/study/streak";

const DAY = 100;

describe("srs.schedule", () => {
  it("schedules a new card 2 days out on 'good'", () => {
    const e = schedule(undefined, "good", DAY);
    expect(e.reps).toBe(1);
    expect(e.interval).toBe(2);
    expect(e.due).toBe(DAY + 2);
  });

  it("'easy' on a new card pushes further than 'good'", () => {
    expect(schedule(undefined, "easy", DAY).due).toBeGreaterThan(
      schedule(undefined, "good", DAY).due,
    );
  });

  it("'again' makes the card due immediately and lowers ease", () => {
    const e = schedule({ reps: 3, interval: 10, ease: 2.3, due: DAY }, "again", DAY);
    expect(e.due).toBe(DAY);
    expect(e.reps).toBe(0);
    expect(e.ease).toBeCloseTo(2.1, 5);
  });

  it("intervals grow across consecutive 'good' reviews", () => {
    let e = schedule(undefined, "good", DAY); // reps 1 -> 2d
    e = schedule(e, "good", e.due); // reps 2 -> 4d
    const third = schedule(e, "good", e.due); // reps 3 -> interval*ease
    expect(third.reps).toBe(3);
    expect(third.interval).toBeGreaterThan(e.interval);
  });

  it("clamps ease to exactly the [1.3, 2.9] band edges", () => {
    let e = schedule(undefined, "easy", DAY);
    for (let i = 0; i < 20; i++) e = schedule(e, "easy", e.due);
    expect(e.ease).toBe(2.9);
    let h = schedule(undefined, "hard", DAY);
    for (let i = 0; i < 30; i++) h = schedule(h, "hard", h.due);
    expect(h.ease).toBe(1.3);
  });

  it("'hard' on a new card pins a 1-day interval and dips ease to 2.25", () => {
    const e = schedule(undefined, "hard", DAY);
    expect(e.interval).toBe(1);
    expect(e.ease).toBe(2.25);
    expect(e.due).toBe(DAY + 1);
  });

  it("lands the third consecutive 'good' at a 9-day interval", () => {
    let e = schedule(undefined, "good", DAY); // reps 1 -> 2d
    e = schedule(e, "good", e.due); // reps 2 -> 4d
    e = schedule(e, "good", e.due); // reps 3 -> max(5, round(4*2.3)) = 9d
    expect(e.reps).toBe(3);
    expect(e.interval).toBe(9);
  });

  it("never pins the interval on repeated 'hard' once mature", () => {
    let e = schedule(undefined, "good", DAY);
    e = schedule(e, "good", e.due);
    e = schedule(e, "good", e.due); // reps 3, interval 9
    const after = schedule(e, "hard", e.due); // reps 4 -> must exceed 9
    expect(after.interval).toBeGreaterThan(e.interval);
  });
});

describe("srs.nextLabel", () => {
  it("labels new, due, and future cards", () => {
    expect(nextLabel(undefined, DAY)).toBe("new");
    expect(nextLabel({ reps: 1, interval: 1, ease: 2.3, due: DAY }, DAY)).toBe("due now");
    expect(nextLabel({ reps: 1, interval: 1, ease: 2.3, due: DAY + 1 }, DAY)).toBe("in 1 day");
    expect(nextLabel({ reps: 1, interval: 3, ease: 2.3, due: DAY + 3 }, DAY)).toBe("in 3 days");
  });
});

describe("srs due/seen helpers", () => {
  const srs: SrsMap = {
    a: { reps: 1, interval: 1, ease: 2.3, due: DAY }, // due today
    b: { reps: 2, interval: 5, ease: 2.3, due: DAY + 5 }, // future
  };

  it("treats new (no entry) cards as due", () => {
    expect(isDue(undefined, DAY)).toBe(true);
    expect(isDue(srs.a, DAY)).toBe(true);
    expect(isDue(srs.b, DAY)).toBe(false);
  });

  it("counts due and seen across an id set", () => {
    const ids = ["a", "b", "c"]; // c is new
    expect(dueCount(ids, srs, DAY)).toBe(2); // a + new c
    expect(seenCount(ids, srs)).toBe(2); // a + b have entries
  });
});

describe("srs.dayLog", () => {
  it("dedups ids within a day and counts uniques", () => {
    let log = { day: 0, ids: [] as string[] };
    log = logToday(log, "x", DAY);
    log = logToday(log, "x", DAY); // dup
    log = logToday(log, "y", DAY);
    expect(countToday(log, DAY)).toBe(2);
  });

  it("resets the count when the day rolls over", () => {
    const log = logToday({ day: 0, ids: [] }, "x", DAY);
    expect(countToday(log, DAY)).toBe(1);
    expect(countToday(log, DAY + 1)).toBe(0);
  });
});

describe("streak", () => {
  it("starts at 1, is a no-op the same day, and grows on consecutive days", () => {
    const d1 = bumpStreak(undefined, DAY);
    expect(d1.count).toBe(1);
    expect(bumpStreak(d1, DAY)).toBe(d1); // same day -> unchanged
    const d2 = bumpStreak(d1, DAY + 1);
    expect(d2.count).toBe(2);
    expect(d2.best).toBe(2);
  });

  it("resets after a skipped day but remembers the best", () => {
    const d2 = bumpStreak(bumpStreak(undefined, DAY), DAY + 1); // count 2
    const skipped = bumpStreak(d2, DAY + 3); // gap
    expect(skipped.count).toBe(1);
    expect(skipped.best).toBe(2);
  });

  it("currentStreak is 0 once a day is missed", () => {
    const s = bumpStreak(undefined, DAY);
    expect(currentStreak(s, DAY)).toBe(1);
    expect(currentStreak(s, DAY + 1)).toBe(1); // yesterday still counts
    expect(currentStreak(s, DAY + 2)).toBe(0); // missed
  });
});
