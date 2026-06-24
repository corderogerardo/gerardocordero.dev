// Lightweight spaced-repetition scheduler (SM-2-lite) with confidence grading.
// Runs client-side; `due` is an integer epoch-day so comparisons are
// timezone-stable and JSON-friendly. Shared by flashcards, prompts, and /today.

export type SrsEntry = { reps: number; interval: number; ease: number; due: number };
export type SrsMap = Record<string, SrsEntry>;
export type Grade = "again" | "hard" | "good" | "easy";

// Per-day log of item ids reviewed "well" today. Powers the /today "X today"
// counters, which must keep climbing even though the daily set refills as you
// grade (graded items reschedule out of the due pool and leave the set).
export type DayLog = { day: number; ids: string[] };

/** Add an id to today's log (resetting it when the day rolls over). */
export function logToday(log: DayLog, id: string, today = todayEpochDay()): DayLog {
  const ids = log.day === today ? log.ids : [];
  return { day: today, ids: ids.includes(id) ? ids : [...ids, id] };
}

/** Remove an id from today's log (e.g. a re-grade that's no longer "known"). */
export function unlogToday(log: DayLog, id: string, today = todayEpochDay()): DayLog {
  const ids = log.day === today ? log.ids : [];
  return { day: today, ids: ids.filter((x) => x !== id) };
}

/** Count of ids logged for `today` (0 once the day rolls over). */
export function countToday(log: DayLog, today = todayEpochDay()): number {
  return log.day === today ? log.ids.length : 0;
}

export const GRADES: { value: Grade; label: string; badge: string; key: string }[] = [
  { value: "again", label: "Again", badge: "bg-bad/15 text-bad hover:bg-bad/25", key: "1" },
  { value: "hard", label: "Hard", badge: "bg-warn/15 text-warn hover:bg-warn/25", key: "2" },
  { value: "good", label: "Good", badge: "bg-good/15 text-good hover:bg-good/25", key: "3" },
  { value: "easy", label: "Easy", badge: "bg-accent/15 text-accent hover:bg-accent/25", key: "4" },
];

export function todayEpochDay(): number {
  return Math.floor(Date.now() / 86_400_000);
}

/** A card is due if it's new (no entry) or its due day has arrived. */
export function isDue(entry: SrsEntry | undefined, today = todayEpochDay()): boolean {
  return !entry || entry.due <= today;
}

/** "known" = last graded good/easy (used for the simple Known counter). */
export function isKnown(grade: Grade | undefined): boolean {
  return grade === "good" || grade === "easy";
}

/** Next schedule after a confidence grade. */
export function schedule(
  prev: SrsEntry | undefined,
  grade: Grade,
  today = todayEpochDay(),
): SrsEntry {
  const ease0 = prev?.ease ?? 2.3;

  if (grade === "again") {
    return { reps: 0, interval: 1, ease: Math.max(1.3, ease0 - 0.2), due: today };
  }

  const reps = (prev?.reps ?? 0) + 1;
  const ease =
    grade === "hard"
      ? Math.max(1.3, ease0 - 0.05)
      : grade === "easy"
        ? Math.min(2.9, ease0 + 0.1)
        : ease0;

  let interval: number;
  if (reps === 1) interval = grade === "easy" ? 4 : grade === "hard" ? 1 : 2;
  else if (reps === 2) interval = grade === "easy" ? 7 : grade === "hard" ? 3 : 4;
  else {
    const mult = grade === "hard" ? 1.2 : grade === "easy" ? ease * 1.3 : ease;
    interval = Math.max(1, Math.round((prev?.interval ?? 1) * mult));
  }

  return { reps, interval, ease, due: today + interval };
}

export function dueCount(
  ids: string[],
  srs: SrsMap,
  today = todayEpochDay(),
): number {
  return ids.filter((id) => isDue(srs[id], today)).length;
}

/** Human label for when an item next comes up. */
export function nextLabel(entry: SrsEntry | undefined, today = todayEpochDay()): string {
  if (!entry) return "new";
  const d = entry.due - today;
  if (d <= 0) return "due now";
  if (d === 1) return "in 1 day";
  return `in ${d} days`;
}
