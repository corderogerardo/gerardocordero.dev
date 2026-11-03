// Seniority levels used to grade flashcards and drive the /roadmap page.
// The taxonomy (values, order, labels, i18n keys, badge classes) lives in
// prep-kit; this module adds only the React Native roadmap taglines and the
// category → level mapping.
import { LEVELS as TAXONOMY, type Level } from "@gerardocordero/prep-kit";

export { LEVEL_BADGE, LEVEL_LABEL, type Level } from "@gerardocordero/prep-kit";

/** Roadmap taglines — platform-specific copy this app owns. */
const TAGLINES: Record<Level, { tagline: string }> = {
  junior: { tagline: "Build & ship features with guidance." },
  mid: { tagline: "Own features end-to-end: data, state, tests." },
  senior: { tagline: "Architecture, performance, native & security depth." },
  architect: { tagline: "System design, platform decisions, team leverage." },
  beyond: { tagline: "Frontier: on-device AI and pushing the platform." },
};

/** The shared taxonomy plus this app's roadmap taglines. */
export const LEVELS = TAXONOMY.map((level) => ({
  ...level,
  ...TAGLINES[level.value],
}));

/** Default level for each flashcard category (overridable per card). */
const LEVEL_BY_CATEGORY: Record<string, Level> = {
  rn: "senior",
  arch: "architect",
  state: "mid",
  perf: "senior",
  test: "mid",
  behavior: "senior",
  opt: "senior",
  ai: "beyond",
  nativeui: "mid",
  data: "mid",
  expo: "mid",
  native: "senior",
  security: "senior",
  release: "senior",
  react: "mid",
  integrations: "mid",
};

/** Per-card overrides to spread foundational base cards into lower levels. */
const LEVEL_OVERRIDES: Record<string, Level> = {
  q5: "mid", // What is Hermes
  q8: "mid", // Expo vs bare
  q9: "mid", // New Arch default version
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
