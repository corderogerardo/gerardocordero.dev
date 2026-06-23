// Seniority levels used to grade flashcards and drive the /roadmap page.
export type Level = "junior" | "mid" | "senior" | "architect" | "beyond";

export const LEVELS: {
  value: Level;
  label: string;
  short: string;
  tagline: string;
}[] = [
  { value: "junior", label: "Junior", short: "JR", tagline: "Build & ship screens with guidance." },
  { value: "mid", label: "Mid", short: "MID", tagline: "Own features end-to-end: state, data, tests." },
  { value: "senior", label: "Senior", short: "SR", tagline: "Concurrency, performance, architecture & security depth." },
  { value: "architect", label: "Architect", short: "ARCH", tagline: "System design, modularization, platform & team leverage." },
  { value: "beyond", label: "Beyond", short: "★", tagline: "Frontier: on-device AI and pushing the platform." },
];

export const LEVEL_LABEL: Record<Level, string> = {
  junior: "Junior",
  mid: "Mid",
  senior: "Senior",
  architect: "Architect",
  beyond: "Beyond",
};

/** Default level for each flashcard category (overridable per card). */
const LEVEL_BY_CATEGORY: Record<string, Level> = {
  swift: "mid",
  swiftui: "mid",
  uikit: "mid",
  concurrency: "senior",
  arch: "architect",
  data: "mid",
  perf: "senior",
  test: "mid",
  cicd: "senior",
  appstore: "senior",
  security: "senior",
  ai: "beyond",
};

/** Per-card overrides to spread foundational base cards into lower levels. */
const LEVEL_OVERRIDES: Record<string, Level> = {};

export function resolveLevel(card: {
  id: string;
  category: string;
  level?: Level;
}): Level {
  return (
    card.level ?? LEVEL_OVERRIDES[card.id] ?? LEVEL_BY_CATEGORY[card.category] ?? "senior"
  );
}

/** Tailwind classes for a level badge. */
export const LEVEL_BADGE: Record<Level, string> = {
  junior: "border-good/40 bg-good/12 text-good",
  mid: "border-accent/40 bg-accent/12 text-accent",
  senior: "border-warn/40 bg-warn/12 text-warn",
  architect: "border-accent-2/40 bg-accent-2/12 text-accent-2",
  beyond: "border-bad/40 bg-bad/12 text-bad",
};
