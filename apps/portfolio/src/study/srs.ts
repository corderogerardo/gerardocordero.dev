// Lightweight spaced-repetition scheduler (SM-2-lite) with confidence grading.
// Ported from the ios-prep study tool. Pure functions, no I/O: `due` is an integer
// epoch-day so comparisons are timezone-stable and JSON-friendly. Shared by the
// flashcard deck, the daily session, and the due/known counters.

export type SrsEntry = { reps: number; interval: number; ease: number; due: number };
export type SrsMap = Record<string, SrsEntry>;
export type Grade = "again" | "hard" | "good" | "easy";

// Per-day log of card ids reviewed today. Powers the "X today" counter, which must
// keep climbing even though graded cards reschedule out of the due pool.
export type DayLog = { day: number; ids: string[] };

export const GRADE_ORDER: Grade[] = ["again", "hard", "good", "easy"];

export function todayEpochDay(): number {
  return Math.floor(Date.now() / 86_400_000);
}

/** Add an id to today's log (resetting it when the day rolls over). */
export function logToday(log: DayLog, id: string, today = todayEpochDay()): DayLog {
  const ids = log.day === today ? log.ids : [];
  return { day: today, ids: ids.includes(id) ? ids : [...ids, id] };
}

/** Count of ids logged for `today` (0 once the day rolls over). */
export function countToday(log: DayLog, today = todayEpochDay()): number {
  return log.day === today ? log.ids.length : 0;
}

/** A card is due if it's new (no entry) or its due day has arrived. */
export function isDue(entry: SrsEntry | undefined, today = todayEpochDay()): boolean {
  return !entry || entry.due <= today;
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
    const prevInterval = prev?.interval ?? 1;
    // Always advance by at least a day so a mature card can't get pinned at a
    // fixed interval (e.g. repeated "hard" when the multiplier rounds back to ×1).
    interval = Math.max(prevInterval + 1, Math.round(prevInterval * mult));
  }

  return { reps, interval, ease, due: today + interval };
}

/** How many of `ids` are due today. */
export function dueCount(ids: string[], srs: SrsMap, today = todayEpochDay()): number {
  return ids.filter((id) => isDue(srs[id], today)).length;
}

/** How many of `ids` have been studied at least once (have an SRS entry). */
export function seenCount(ids: string[], srs: SrsMap): number {
  return ids.filter((id) => srs[id]).length;
}

/** Human label for when a card next comes up. */
export function nextLabel(entry: SrsEntry | undefined, today = todayEpochDay()): string {
  if (!entry) return "new";
  const d = entry.due - today;
  if (d <= 0) return "due now";
  if (d === 1) return "in 1 day";
  return `in ${d} days`;
}
