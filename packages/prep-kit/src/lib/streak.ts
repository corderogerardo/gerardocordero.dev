import { todayEpochDay } from "./srs";

export type Streak = { last: number; count: number; best: number };

/** Mark today complete. No-op if already counted today; resets if a day was skipped. */
export function bumpStreak(prev: Streak | undefined, today = todayEpochDay()): Streak {
  if (!prev) return { last: today, count: 1, best: 1 };
  if (prev.last === today) return prev;
  const count = prev.last === today - 1 ? prev.count + 1 : 1;
  return { last: today, count, best: Math.max(prev.best ?? 0, count) };
}

export function doneToday(s: Streak | undefined, today = todayEpochDay()): boolean {
  return !!s && s.last === today;
}

/** Current streak, accounting for a missed day (resets to 0 unless done today/yesterday). */
export function currentStreak(s: Streak | undefined, today = todayEpochDay()): number {
  if (!s) return 0;
  if (s.last === today || s.last === today - 1) return s.count;
  return 0;
}
