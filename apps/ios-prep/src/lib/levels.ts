// Seniority levels used to grade flashcards and drive the /roadmap page.
// The taxonomy (values, order, labels, i18n keys, badge classes) lives in
// prep-kit; this module adds only the iOS roadmap taglines and the
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
    tagline: "Build & ship screens with guidance.",
    taglineEs: "Construye y publica pantallas con guía.",
  },
  mid: {
    tagline: "Own features end-to-end: state, data, tests.",
    taglineEs: "Domina features de principio a fin: estado, datos, tests.",
  },
  senior: {
    tagline: "Concurrency, performance, architecture & security depth.",
    taglineEs: "Profundidad en concurrencia, rendimiento, arquitectura y seguridad.",
  },
  architect: {
    tagline: "System design, modularization, platform & team leverage.",
    taglineEs: "Diseño de sistemas, modularización, apalancamiento de plataforma y equipo.",
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
