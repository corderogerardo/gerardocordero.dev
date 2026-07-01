// Seniority levels used to grade flashcards and drive the /roadmap page.
export type Level = "junior" | "mid" | "senior" | "architect" | "beyond";

export const LEVELS: {
  value: Level;
  label: string;
  short: string;
  tagline: string;
}[] = [
  { value: "junior", label: "Junior", short: "JR", tagline: "Ship pages and components with guidance." },
  { value: "mid", label: "Mid", short: "MID", tagline: "Own a route end-to-end: data, layout, tests." },
  { value: "senior", label: "Senior", short: "SR", tagline: "Rendering & caching depth, performance & security." },
  { value: "architect", label: "Architect", short: "ARCH", tagline: "System design, platform decisions, org-wide conventions." },
  { value: "beyond", label: "Beyond", short: "★", tagline: "Frontier: Cache Components, edge, streaming AI UIs." },
];

export const LEVEL_LABEL: Record<Level, string> = {
  junior: "Junior",
  mid: "Mid",
  senior: "Senior",
  architect: "Architect",
  beyond: "Beyond",
};

/** Default level for each flashcard/quiz category (overridable per card). */
const LEVEL_BY_CATEGORY: Record<string, Level> = {
  core: "mid", // App Router fundamentals: file conventions, layouts, pages
  rendering: "senior", // SSR/SSG/ISR, Cache Components/PPR, RSC vs Client Components
  data: "senior", // data fetching, the caching layers, Server Actions, revalidation
  routing: "mid", // dynamic/parallel/intercepting routes, proxy.ts, redirects
  perf: "senior", // next/image, next/font, streaming, Core Web Vitals, Turbopack
  auth: "senior", // authn/authz patterns in the App Router
  testing: "mid", // unit + e2e testing Next.js apps
  security: "senior", // headers, CSRF/XSS, env var exposure, data access layer
  arch: "architect", // architecture & frontend system design
  behavior: "senior", // soft skills & collaboration
  beyond: "beyond", // frontier
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
