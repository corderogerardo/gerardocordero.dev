import type { Level } from "@/lib/levels";

export type RoadmapStage = {
  level: Level;
  summary: string;
  /** What you can already do at this level. */
  can: string[];
  /** What to learn to reach the next level. */
  next: string[];
  /** Where to drill in this app (rendered as rich HTML with links). */
  drillHtml: string;
};

export const ROADMAP: RoadmapStage[] = [
  {
    level: "junior",
    summary:
      "You build endpoints and ship features with guidance. The goal is fluency in the fundamentals — modules, controllers, providers, DTOs, and basic data access — so you can deliver a working CRUD module end to end.",
    can: [
      "Scaffold a module with the CLI and wire a controller + service.",
      "Define routes and read params/query/body with DTOs.",
      "Inject a service via the constructor and understand it's a singleton.",
      "Validate input with class-validator + a global ValidationPipe.",
      "Read and write data through a repository (TypeORM/Prisma/Mongoose).",
    ],
    next: [
      "Dependency injection in depth: tokens, custom providers, exports/imports.",
      "The request lifecycle — guards, interceptors, pipes, filters and their order.",
      "The Node event loop and async/await pitfalls.",
      "Write your first unit + e2e tests with @nestjs/testing and supertest.",
    ],
    drillHtml:
      'Drill the <a href="/flashcards">flashcards</a> filtered to <b>Junior</b>, plus the <b>Core</b> and <b>Data &amp; ORM</b> categories. Read study topics <a href="/study#st-1">01</a>–<a href="/study#st-4">04</a>, <a href="/study#st-8">08</a>, and <a href="/study#st-14">14</a>.',
  },
  {
    level: "mid",
    summary:
      "You own modules end to end — data, validation, tests — with little hand-holding. The goal is depth across the everyday NestJS toolkit and the start of performance awareness.",
    can: [
      "Use the full request pipeline: guards, interceptors, pipes, exception filters.",
      "Model config with @nestjs/config and validate env at boot.",
      "Run transactions and avoid the synchronize-in-prod trap.",
      "Write unit tests with overridden providers and e2e tests with supertest.",
      "Reason about the event loop and avoid blocking it.",
    ],
    next: [
      "Injection scopes and the cost of REQUEST scope; dynamic modules (forRoot/forFeature).",
      "Authentication (JWT/Passport), RBAC, and rate limiting.",
      "Caching, queues (BullMQ), scheduling, and events — and their multi-replica gotchas.",
      "Streams & backpressure; worker_threads vs cluster.",
    ],
    drillHtml:
      'Filter flashcards to <b>Mid</b> and the <b>DI &amp; Modules</b>, <b>Request Lifecycle</b>, <b>Config</b>, and <b>Testing</b> categories. Work study topics <a href="/study#st-5">05</a>–<a href="/study#st-13">13</a> and <a href="/study#st-20">20</a>–<a href="/study#st-25">25</a>.',
  },
  {
    level: "senior",
    summary:
      "You bring DI depth, performance, and security maturity, and you raise the team around you. The goal is to be the person who profiles instead of guessing and reasons about the system, not just the syntax.",
    can: [
      "Explain DI scopes, dynamic modules, and the request lifecycle cold.",
      "Design auth (JWT + refresh, RBAC/ABAC) and harden the API.",
      "Profile and fix event-loop blocking, N+1 queries, and memory leaks.",
      "Make caching/rate-limiting/queues correct across replicas with Redis.",
      "Own observability: structured logs, traces, health checks, graceful shutdown.",
    ],
    next: [
      "System design at scale: layering/hexagonal, CQRS, resilience patterns.",
      "Microservices: transports, message vs event, sagas + outbox.",
      "GraphQL at scale (DataLoader, federation) and real-time (WebSockets + Redis).",
      "Deployment: multi-stage Docker, CI/CD, SLOs.",
    ],
    drillHtml:
      'Filter flashcards to <b>Senior</b> and the <b>Node.js Core</b>, <b>Performance</b>, <b>Security</b>, <b>Auth</b>, and <b>Deploy &amp; Ops</b> categories. Read study topics <a href="/study#st-26">26</a>–<a href="/study#st-34">34</a> and the full <a href="/architecture">Architecture guide</a>.',
  },
  {
    level: "architect",
    summary:
      "You design backend systems end to end and make platform decisions that move a whole team. The goal is decision-making before code — for the worst query, the worst network, and the worst traffic spike.",
    can: [
      "Design a service end to end and justify the architecture, data, and consistency strategy.",
      "Choose modular monolith vs microservices and draw clean boundaries.",
      "Apply sagas, the outbox, idempotency, and resilience patterns.",
      "Design multi-tenancy and prevent cross-tenant leakage.",
      "Stand up CI/CD, observability, and SLOs across services.",
    ],
    next: [
      "Org-level platform strategy: shared libraries, conventions, golden paths.",
      "Cost/perf budgets at scale and evaluating emerging tech.",
    ],
    drillHtml:
      'Filter flashcards to <b>Architect</b> and the <b>Architecture</b> and <b>Microservices</b> categories. Work the <a href="/architecture">Architecture guide + Deep dives</a>, the <a href="/practice">system-design prompts</a>, and study topics <a href="/study#st-28">28</a>, <a href="/study#st-36">36</a>.',
  },
  {
    level: "beyond",
    summary:
      "The frontier — where you push what a Node/NestJS backend can do. The goal is to bring genuinely new capability and pioneer patterns the rest of the team will adopt.",
    can: [
      "Run NestJS in serverless/edge with cached bootstrap and connection pooling.",
      "Build event-sourced and CQRS systems where they genuinely fit.",
      "Stream LLM/AI responses (SSE/WebSocket) with backpressure and cancellation.",
      "Use AsyncLocalStorage for context with singleton-scope performance.",
    ],
    next: [
      "Adopt NestJS 12 (ESM, Standard Schema/Zod, Vitest) and contribute patterns back to the team.",
    ],
    drillHtml:
      'Filter flashcards to <b>Beyond</b>, and read study topics <a href="/study#st-29">29</a>, <a href="/study#st-30">30</a>. Try the <a href="/practice">event-driven and idempotency design prompts</a>.',
  },
];
