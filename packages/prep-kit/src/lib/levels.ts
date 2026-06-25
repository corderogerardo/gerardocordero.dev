// Shared seniority-level taxonomy used by the kit's flashcard deck (filter chips
// + badges). Per-subject level *mapping* (which category is which level) and the
// roadmap taglines stay in each app's own lib/levels.ts.
export type Level = "junior" | "mid" | "senior" | "architect" | "beyond";

export const LEVELS: {
  value: Level;
  label: string;
  short: string;
}[] = [
  { value: "junior", label: "Junior", short: "JR" },
  { value: "mid", label: "Mid", short: "MID" },
  { value: "senior", label: "Senior", short: "SR" },
  { value: "architect", label: "Architect", short: "ARCH" },
  { value: "beyond", label: "Beyond", short: "★" },
];

export const LEVEL_LABEL: Record<Level, string> = {
  junior: "Junior",
  mid: "Mid",
  senior: "Senior",
  architect: "Architect",
  beyond: "Beyond",
};

/** Tailwind classes for a level badge. */
export const LEVEL_BADGE: Record<Level, string> = {
  junior: "border-good/40 bg-good/12 text-good",
  mid: "border-accent/40 bg-accent/12 text-accent",
  senior: "border-warn/40 bg-warn/12 text-warn",
  architect: "border-accent-2/40 bg-accent-2/12 text-accent-2",
  beyond: "border-bad/40 bg-bad/12 text-bad",
};
