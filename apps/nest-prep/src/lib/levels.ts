// Seniority levels used to grade flashcards and drive the /roadmap page.
// The taxonomy (values, order, labels, i18n keys, badge classes) lives in
// prep-kit; this module adds only the NestJS roadmap taglines and the
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
    tagline: "Build & ship endpoints with guidance.",
    taglineEs: "Construye y publica endpoints con guía.",
  },
  mid: {
    tagline: "Own modules end-to-end: data, validation, tests.",
    taglineEs: "Domina módulos de principio a fin: datos, validación, tests.",
  },
  senior: {
    tagline: "DI depth, the request lifecycle, performance & security.",
    taglineEs: "Profundidad en DI, el ciclo de vida de la petición, rendimiento y seguridad.",
  },
  architect: {
    tagline: "System design, microservices, platform decisions.",
    taglineEs: "Diseño de sistemas, microservicios, decisiones de plataforma.",
  },
  beyond: {
    tagline: "Frontier: event-driven at scale, edge & serverless Nest.",
    taglineEs: "Frontera: event-driven a escala, edge y Nest serverless.",
  },
};

/** The shared taxonomy plus this app's roadmap taglines. */
export const LEVELS = TAXONOMY.map((level) => ({
  ...level,
  ...TAGLINES[level.value],
}));

/** Default level for each flashcard/quiz category (overridable per card). */
const LEVEL_BY_CATEGORY: Record<string, Level> = {
  core: "mid", // modules, controllers, providers, basics
  di: "senior", // dependency injection, scopes, dynamic modules
  lifecycle: "senior", // middleware, guards, interceptors, pipes, filters
  data: "mid", // TypeORM/Prisma/Mongoose, repositories, transactions
  config: "mid", // config, validation, DTOs
  auth: "senior", // authn/authz, passport, JWT, RBAC
  testing: "mid", // unit + e2e testing
  graphql: "senior", // GraphQL, resolvers, DataLoader
  ws: "senior", // websockets, gateways
  micro: "architect", // microservices, transports, patterns
  queues: "senior", // queues, scheduling, events
  node: "senior", // Node.js internals — event loop, streams, workers
  perf: "senior", // performance, caching, profiling
  security: "senior", // security hardening
  arch: "architect", // architecture & system design
  deploy: "senior", // CI/CD, Docker, observability
  dsa: "mid", // algorithms for backend interviews
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
