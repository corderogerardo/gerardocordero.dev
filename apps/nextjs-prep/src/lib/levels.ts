// Seniority levels used to grade flashcards and drive the /roadmap page.
// The taxonomy (values, order, labels, i18n keys, badge classes) lives in
// prep-kit; this module adds only the Next.js roadmap taglines and the
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
    tagline: "Ship pages and components with guidance.",
    taglineEs: "Publica páginas y componentes con guía.",
  },
  mid: {
    tagline: "Own a route end-to-end: data, layout, tests.",
    taglineEs: "Domina una ruta de principio a fin: datos, layout, tests.",
  },
  senior: {
    tagline: "Rendering & caching depth, performance & security.",
    taglineEs: "Profundidad en renderizado y caché, rendimiento y seguridad.",
  },
  architect: {
    tagline: "System design, platform decisions, org-wide conventions.",
    taglineEs: "Diseño de sistemas, decisiones de plataforma, convenciones para toda la organización.",
  },
  beyond: {
    tagline: "Frontier: Cache Components, edge, streaming AI UIs.",
    taglineEs: "Frontera: Cache Components, edge, UIs de IA en streaming.",
  },
};

/** The shared taxonomy plus this app's roadmap taglines. */
export const LEVELS = TAXONOMY.map((level) => ({
  ...level,
  ...TAGLINES[level.value],
}));

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
