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
  { value: "junior", label: "Junior", labelEs: "Junior", short: "JR", tagline: "Build & ship endpoints with guidance.", taglineEs: "Construye y publica endpoints con guía." },
  { value: "mid", label: "Mid", labelEs: "Mid", short: "MID", tagline: "Own modules end-to-end: data, validation, tests.", taglineEs: "Domina módulos de principio a fin: datos, validación, tests." },
  { value: "senior", label: "Senior", labelEs: "Senior", short: "SR", tagline: "DI depth, the request lifecycle, performance & security.", taglineEs: "Profundidad en DI, el ciclo de vida de la petición, rendimiento y seguridad." },
  { value: "architect", label: "Architect", labelEs: "Arquitecto", short: "ARCH", tagline: "System design, microservices, platform decisions.", taglineEs: "Diseño de sistemas, microservicios, decisiones de plataforma." },
  { value: "beyond", label: "Beyond", labelEs: "Beyond", short: "★", tagline: "Frontier: event-driven at scale, edge & serverless Nest.", taglineEs: "Frontera: event-driven a escala, edge y Nest serverless." },
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

/** Tailwind classes for a level badge. */
export const LEVEL_BADGE: Record<Level, string> = {
  junior: "border-good/40 bg-good/12 text-good",
  mid: "border-accent/40 bg-accent/12 text-accent",
  senior: "border-warn/40 bg-warn/12 text-warn",
  architect: "border-accent-2/40 bg-accent-2/12 text-accent-2",
  beyond: "border-bad/40 bg-bad/12 text-bad",
};
