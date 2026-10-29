// Lightweight spaced-repetition scheduler (SM-2-lite) with confidence grading.
// Single home for the monorepo (S4): portfolio and learn consume this module via
// the deep file import `@gerardocordero/prep-kit/lib/srs` — never the barrel
// `index.ts`, which pulls React. Runs client-side; `due` is an integer epoch-day
// so comparisons are timezone-stable and JSON-friendly. Shared by flashcards,
// prompts, /today, the portfolio study deck, and learn review.
// NOTE: zero imports — keep it that way so deep imports pull no Next/React.

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

export const GRADES: { value: Grade; localeKey: string; badge: string; key: string }[] = [
  { value: "again", localeKey: "flashcard.grade.again", badge: "bg-bad/15 text-bad hover:bg-bad/25", key: "1" },
  { value: "hard", localeKey: "flashcard.grade.hard", badge: "bg-warn/15 text-warn hover:bg-warn/25", key: "2" },
  { value: "good", localeKey: "flashcard.grade.good", badge: "bg-good/15 text-good hover:bg-good/25", key: "3" },
  { value: "easy", localeKey: "flashcard.grade.easy", badge: "bg-accent/15 text-accent hover:bg-accent/25", key: "4" },
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
    const prevInterval = prev?.interval ?? 1;
    // Always advance by at least a day so a mature card can't get pinned at a
    // fixed interval (e.g. repeated "hard" when the multiplier rounds back to ×1).
    interval = Math.max(prevInterval + 1, Math.round(prevInterval * mult));
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

/** How many of `ids` have been studied at least once (have an SRS entry). */
export function seenCount(ids: string[], srs: SrsMap): number {
  return ids.filter((id) => srs[id]).length;
}

/** Locale-aware label for when an item next comes up. Returns a key + optional param. */
export function nextLabel(entry: SrsEntry | undefined, today = todayEpochDay()): { key: string; params?: Record<string, number> } {
  if (!entry) return { key: "srs.new" };
  const d = entry.due - today;
  if (d <= 0) return { key: "srs.dueNow" };
  if (d === 1) return { key: "srs.in1day" };
  return { key: "srs.inDays", params: { n: d } };
}

/** Plain-English label for when an item next comes up (no i18n; for RN callers). */
export function nextLabelEn(entry: SrsEntry | undefined, today = todayEpochDay()): string {
  if (!entry) return "new";
  const d = entry.due - today;
  if (d <= 0) return "due now";
  if (d === 1) return "in 1 day";
  return `in ${d} days`;
}
