// Seniority levels used to grade flashcards and drive the /roadmap page.
// The taxonomy (values, order, labels, i18n keys, badge classes) lives in
// prep-kit; this module adds only the Android roadmap taglines and the
// category → level mapping.
import { LEVELS as TAXONOMY, type Level } from "@gerardocordero/prep-kit";

export {
  LEVEL_BADGE,
  LEVEL_LABEL,
  LEVEL_LABEL_ES,
  type Level,
} from "@gerardocordero/prep-kit";

/** Roadmap taglines — platform-specific copy this app owns. */
const TAGLINES: Record<Level, { tagline: string; taglineEs: string }> = {
  junior: {
    tagline: "Build & ship features with guidance.",
    taglineEs: "Construye y publica features con guía.",
  },
  mid: {
    tagline: "Own features end-to-end: data, state, tests.",
    taglineEs: "Domina features de principio a fin: datos, estado, tests.",
  },
  senior: {
    tagline: "Architecture, performance, native & security depth.",
    taglineEs: "Profundidad en arquitectura, rendimiento, nativo y seguridad.",
  },
  architect: {
    tagline: "System design, platform decisions, team leverage.",
    taglineEs: "Diseño de sistemas, decisiones de plataforma, apalancamiento del equipo.",
  },
  beyond: {
    tagline: "Frontier: on-device AI and pushing the platform.",
    taglineEs: "Frontera: IA en el dispositivo y empujar la plataforma.",
  },
};

/** The shared taxonomy plus this app's roadmap taglines. */
export const LEVELS = TAXONOMY.map((level) => ({
  ...level,
  ...TAGLINES[level.value],
}));

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
