import { describe, expect, it } from "vitest";

import { DEFAULT_BACKOFF, nextDelay, shouldQuarantine } from "../src/backoff";

describe("nextDelay", () => {
  it("waits between half and all of the base delay on the first attempt", () => {
    expect(nextDelay(0, 0)).toBe(500);
    expect(nextDelay(0, 0.999999)).toBe(1000);
  });

  it("doubles the ceiling on each attempt", () => {
    expect(nextDelay(1, 0)).toBe(1000);
    expect(nextDelay(2, 0)).toBe(2000);
    expect(nextDelay(3, 0)).toBe(4000);
  });

  it("never exceeds the cap", () => {
    const capped = nextDelay(20, 0.999999);
    expect(capped).toBe(DEFAULT_BACKOFF.capMs);
  });

  it("keeps the jitter inside [ceiling/2, ceiling]", () => {
    for (const attempt of [0, 1, 2, 3, 4]) {
      const ceiling = Math.min(DEFAULT_BACKOFF.capMs, DEFAULT_BACKOFF.baseMs * 2 ** attempt);
      for (const random of [0, 0.25, 0.5, 0.75, 0.99]) {
        const delay = nextDelay(attempt, random);
        expect(delay).toBeGreaterThanOrEqual(Math.round(ceiling * 0.5));
        expect(delay).toBeLessThanOrEqual(ceiling);
      }
    }
  });

  it("treats a negative attempt as the first one, and a broken random as zero", () => {
    expect(nextDelay(-5, 0)).toBe(nextDelay(0, 0));
    expect(nextDelay(1, Number.NaN)).toBe(nextDelay(1, 0));
  });
});

describe("shouldQuarantine", () => {
  it("holds until the configured maximum, then stops retrying", () => {
    expect(shouldQuarantine(7)).toBe(false);
    expect(shouldQuarantine(8)).toBe(true);
    expect(shouldQuarantine(99)).toBe(true);
  });
});
