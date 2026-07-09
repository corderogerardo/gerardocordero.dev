// Seniority levels used to grade flashcards and drive the /roadmap page.
export type Level = "junior" | "mid" | "senior" | "architect" | "beyond";

export const LEVELS: {
  value: Level;
  label: string;
  labelEs: string;
  short: string;
  tagline: string;
  taglineEs: string;
}[] = [
  { value: "junior", label: "Junior", labelEs: "Junior", short: "JR", tagline: "Build & ship features with guidance.", taglineEs: "Construye y publica features con guía." },
  { value: "mid", label: "Mid", labelEs: "Mid", short: "MID", tagline: "Own features end-to-end: data, state, tests.", taglineEs: "Domina features de principio a fin: datos, estado, tests." },
  { value: "senior", label: "Senior", labelEs: "Senior", short: "SR", tagline: "Architecture, performance, native & security depth.", taglineEs: "Profundidad en arquitectura, rendimiento, nativo y seguridad." },
  { value: "architect", label: "Architect", labelEs: "Arquitecto", short: "ARCH", tagline: "System design, platform decisions, team leverage.", taglineEs: "Diseño de sistemas, decisiones de plataforma, apalancamiento del equipo." },
  { value: "beyond", label: "Beyond", labelEs: "Beyond", short: "★", tagline: "Frontier: on-device AI and pushing the platform.", taglineEs: "Frontera: IA en el dispositivo y empujar la plataforma." },
];

export const LEVEL_LABEL: Record<Level, string> = {
  junior: "Junior",
  mid: "Mid",
  senior: "Senior",
  architect: "Architect",
  beyond: "Beyond",
};

export const LEVEL_LABEL_ES: Record<Level, string> = {
  junior: "Junior",
  mid: "Mid",
  senior: "Senior",
  architect: "Arquitecto",
  beyond: "Beyond",
};

/** Default level for each flashcard category (overridable per card). */
const LEVEL_BY_CATEGORY: Record<string, Level> = {
  kotlin: "mid",
  coroutines: "senior",
  compose: "senior",
  framework: "mid",
  arch: "architect",
  state: "mid",
  di: "senior",
  data: "mid",
  perf: "senior",
  test: "mid",
  gradle: "senior",
  security: "senior",
  release: "senior",
  behavior: "senior",
  opt: "senior",
  ai: "beyond",
};

/** Per-card overrides to spread foundational base cards into lower levels. */
const LEVEL_OVERRIDES: Record<string, Level> = {
  k1: "junior", // val/var, types, immutability
  k2: "junior", // null safety basics
  k3: "junior", // data classes
  comp1: "mid", // What is Jetpack Compose
  fw1: "junior", // Activity lifecycle basics
};

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
