// The single source of truth for the seniority-level taxonomy shared by
// prep-kit and every *-prep app: values, order, display labels, i18n keys, and
// badge classes. Each app layers only its own roadmap taglines onto LEVELS and
// keeps its own category → level mapping.
export type Level = "junior" | "mid" | "senior" | "architect" | "beyond";

export type LevelInfo = {
  value: Level;
  label: string;
  labelEs: string;
  /** i18n key for the translated label — render through `t()`, not directly. */
  localeKey: string;
  short: string;
};

export const LEVELS: LevelInfo[] = [
  { value: "junior", label: "Junior", labelEs: "Junior", localeKey: "level.junior", short: "JR" },
  { value: "mid", label: "Mid", labelEs: "Mid", localeKey: "level.mid", short: "MID" },
  { value: "senior", label: "Senior", labelEs: "Senior", localeKey: "level.senior", short: "SR" },
  { value: "architect", label: "Architect", labelEs: "Arquitecto", localeKey: "level.architect", short: "ARCH" },
  { value: "beyond", label: "Beyond", labelEs: "Beyond", localeKey: "level.beyond", short: "★" },
];

/** Project one field of LEVELS into a `Record<Level, string>` so the maps can't drift. */
function byLevel(key: "label" | "labelEs" | "localeKey"): Record<Level, string> {
  return Object.fromEntries(
    LEVELS.map((level) => [level.value, level[key]]),
  ) as Record<Level, string>;
}

/** Display name per level (English) — for non-translated surfaces. */
export const LEVEL_LABEL = byLevel("label");

/** Display name per level (Spanish). */
export const LEVEL_LABEL_ES = byLevel("labelEs");

/** i18n key per level — pass to `t()`. */
export const LEVEL_LOCALE_KEY = byLevel("localeKey");

/** Tailwind classes for a level badge. */
export const LEVEL_BADGE: Record<Level, string> = {
  junior: "border-good/40 bg-good/12 text-good",
  mid: "border-accent/40 bg-accent/12 text-accent",
  senior: "border-warn/40 bg-warn/12 text-warn",
  architect: "border-accent-2/40 bg-accent-2/12 text-accent-2",
  beyond: "border-bad/40 bg-bad/12 text-bad",
};
