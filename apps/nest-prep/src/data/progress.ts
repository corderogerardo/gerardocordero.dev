export type ChecklistItem = { id: string; label: string };
export type ChecklistGroup = { title: string; items: ChecklistItem[] };

export const PROGRESS_INTRO =
  "A readiness checklist for senior NestJS / Node backend interviews. Tick each item once you can explain it cold and code it under pressure — progress is saved in this browser.";

export const CHECKLIST_GROUPS: ChecklistGroup[] = [
  {
    title: "🧱 Core & DI",
    items: [
      { id: "nest-c-1", label: "Explain modules, providers, controllers, and the @Module keys (incl. why exports matters)" },
      { id: "nest-c-2", label: "Walk through NestFactory bootstrap and the Express vs Fastify adapter seam" },
      { id: "nest-c-3", label: "Custom providers: useClass / useValue / useFactory / useExisting + the inject array" },
      { id: "nest-c-4", label: "Injection scopes (singleton vs REQUEST vs TRANSIENT) and their perf cost" },
      { id: "nest-c-5", label: "Resolve a circular dependency with forwardRef and know when not to" },
    ],
  },
  {
    title: "🔁 Request lifecycle",
    items: [
      { id: "nest-c-6", label: "Recite the exact order: middleware → guards → interceptors(pre) → pipes → handler → interceptors(post) → filters" },
      { id: "nest-c-7", label: "Bind a guard/pipe/interceptor/filter at method, controller, and global scope" },
      { id: "nest-c-8", label: "Build a custom guard, pipe, interceptor, and exception filter from scratch" },
      { id: "nest-c-9", label: "Lifecycle hooks + enableShutdownHooks for graceful shutdown" },
    ],
  },
  {
    title: "🗄️ Data & persistence",
    items: [
      { id: "nest-c-10", label: "Repository pattern with TypeORM/Prisma and where transaction boundaries belong" },
      { id: "nest-c-11", label: "Avoid N+1 (and use DataLoader in GraphQL)" },
      { id: "nest-c-12", label: "Typed config & secrets via ConfigModule" },
      { id: "nest-c-13", label: "Run and reason about migrations" },
    ],
  },
  {
    title: "🔌 APIs at scale",
    items: [
      { id: "nest-c-14", label: "Code-first GraphQL resolvers, @ResolveField, and subscriptions" },
      { id: "nest-c-15", label: "Microservices: @MessagePattern vs @EventPattern and choosing a transport" },
      { id: "nest-c-16", label: "Hybrid app (HTTP + microservice) and WebSocket gateways" },
      { id: "nest-c-17", label: "Idempotency, retries, and dead-letter handling on a broker" },
    ],
  },
  {
    title: "🔐 Security & testing",
    items: [
      { id: "nest-c-18", label: "Passport + JWT auth, AuthGuard, and role-based access with Reflector" },
      { id: "nest-c-19", label: "ValidationPipe with whitelist / forbidNonWhitelisted / transform" },
      { id: "nest-c-20", label: "helmet, CORS, and rate limiting with @nestjs/throttler" },
      { id: "nest-c-21", label: "Unit test a service with overrideProvider; e2e test with supertest" },
    ],
  },
  {
    title: "🚀 Performance & ops",
    items: [
      { id: "nest-c-22", label: "Caching with CacheModule + Redis and the CacheInterceptor" },
      { id: "nest-c-23", label: "Health checks (@nestjs/terminus), structured logging, and tracing" },
      { id: "nest-c-24", label: "Background jobs/queues with BullMQ" },
      { id: "nest-c-25", label: "Know the throughput/maintainability trade-offs you'd defend in design review" },
    ],
  },
];
