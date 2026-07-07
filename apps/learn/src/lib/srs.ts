// SM-2-lite spaced repetition scheduler.
// Ported from apps/portfolio/src/study/srs.ts — pure functions, epoch-day due dates.

export interface SrsEntry {
  reps: number;
  interval: number;
  ease: number;
  due: number;
}

export type SrsGrade = "again" | "good";

export function todayEpochDay(): number {
  return Math.floor(Date.now() / 86400000);
}

export function srsIsDue(entry: SrsEntry | null | undefined, today?: number): boolean {
  return !entry || entry.due <= (today ?? todayEpochDay());
}

export function srsSchedule(
  prev: SrsEntry | null | undefined,
  grade: SrsGrade,
  today?: number,
): SrsEntry {
  today = today ?? todayEpochDay();
  const ease0 = prev?.ease ?? 2.3;
  if (grade === "again") {
    return { reps: 0, interval: 1, ease: Math.max(1.3, ease0 - 0.2), due: today };
  }
  const reps = (prev?.reps ?? 0) + 1;
  let interval: number;
  if (reps === 1) interval = 2;
  else if (reps === 2) interval = 4;
  else {
    const prevInterval = prev?.interval ?? 1;
    interval = Math.max(prevInterval + 1, Math.round(prevInterval * ease0));
  }
  return { reps, interval, ease: ease0, due: today + interval };
}
