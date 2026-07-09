window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "ship-it-graduation",
  title: "Ship It & Graduation",
  emoji: "🚀",
  lang: "ts",
  lessons: [
    {
      id: "hardening",
      title: "Harden it: helmet, CORS, rate limits",
      steps: [
        {
          type: "text",
          md: [
            "## The code works. Now make it safe to expose.",
            "Modules 07–12 got you a real PawWalk backend — walkers, JWT auth, bookings, a job queue, and tests that prove it. But 'it passes tests on my laptop' and 'it's safe on the public internet' are two different bars. The moment this API has a public URL, it gets scanned, scraped, and brute-forced within minutes — automated, indiscriminate, all day.",
            "Hardening isn't a feature you bolt on at the end; it's the difference between a demo and a service. This lesson adds the three cheapest, highest-leverage defenses: **secure headers** (helmet), a **CORS allow-list**, and **rate limiting** on the endpoints attackers hammer.",
            "> In an interview, say: `Before I ship a Node service I add helmet for headers, a CORS allow-list, and a throttler on auth — the baseline that stops the boring, automated attacks so I can focus on the interesting ones.`",
          ],
        },
        {
          type: "text",
          md: [
            "## Helmet sets the headers; CORS decides who may call",
            "Two different jobs people constantly confuse:",
            "- **helmet** is Express/Nest middleware that sets a bundle of **security response headers** — `X-Content-Type-Options`, `Strict-Transport-Security`, a `Content-Security-Policy`, and friends. One line turns on a dozen browser-side protections you'd otherwise forget.\n- **CORS** (Cross-Origin Resource Sharing) controls **which browser origins are allowed to call your API**. Left open (`*`), any website can call your endpoints with a logged-in user's cookies. You lock it to the origins you actually serve — your web app's domain.",
            "> Red flag: shipping with `origin: \"*\"` and credentials enabled 'to make CORS errors go away.' That's not a fix — it invites every origin to ride on your users' sessions. Name the domains you trust and allow only those.",
          ],
        },
        {
          type: "code",
          title: "src/main.ts",
          source: String.raw`import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({ origin: process.env.CORS_ORIGIN });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();`,
          caption: "Two lines of hardening in the bootstrap. helmet() installs the secure-header bundle; enableCors reads the allowed origin from the environment (never hard-coded) so staging and production each lock to their own domain. The port comes from the environment too — the same 12-factor idea the next lesson makes a rule.",
        },
        {
          type: "quiz",
          q: "You add `app.use(helmet())` and lock CORS to your own web domain. What class of problem does this pair address?",
          choices: [
            "Baseline HTTP hardening — helmet sets security response headers, and a CORS allow-list controls which browser origins may call your API",
            "It encrypts the database at rest",
            "It makes the event loop non-blocking",
            "It replaces the need for authentication",
          ],
          answer: 0,
          explain: "They're complementary browser-facing defenses: helmet hardens the response headers the browser enforces; CORS decides which origins the browser will even let talk to you. Neither encrypts data nor authenticates a user — they're the cheap baseline that runs before your real auth and business logic.",
          nudge: "One sets response headers; the other is an origin allow-list. Both live at the HTTP edge, before your logic.",
        },
        {
          type: "text",
          md: [
            "## Rate limiting: slow the brute force on `/auth/login`",
            "Your login endpoint is the juiciest target on the whole API — a bot can throw thousands of password guesses a second at it. Correct password hashing helps, but the real fix is to **refuse to answer that fast**: after N attempts in a window, return `429 Too Many Requests`.",
            "Nest ships this as **`@nestjs/throttler`**. You register a global default (say, 100 requests/minute per IP), then tighten specific routes — login, signup, password reset — with a stricter guard. It's the single highest-value control on an auth surface.",
            "> In an interview, say: `Rate limiting is defense in depth on auth — hashing makes each guess expensive for the attacker, throttling makes guessing at scale impossible. I apply a strict per-IP limit on login, signup, and reset specifically.`",
          ],
        },
        {
          type: "code",
          title: "src/app.module.ts — register the throttler",
          source: String.raw`import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";

@Module({
  imports: [
    ThrottlerModule.forRoot([
      { ttl: 60000, limit: 100 },
    ]),
  ],
})
export class AppModule {}`,
          caption: "The global default: 100 requests per 60000 ms (one minute) per client. `ttl` is the window in milliseconds; `limit` is how many requests fit in it. Individual controllers then opt into a stricter rule with a guard or a @Throttle() decorator — which is exactly the exercise below.",
        },
        {
          type: "exercise",
          title: "Throttle the login endpoint",
          prompt: [
            "The `AuthController` below has a `POST /auth/login`. Guard it against brute force: add `@UseGuards(ThrottlerGuard)` directly above `@Post(\"login\")`. Both imports are already in place.",
          ],
          starter: String.raw`import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // your code here
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }
}`,
          solution: String.raw`import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @UseGuards(ThrottlerGuard)
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }
}`,
          checks: [
            { re: /@UseGuards\(ThrottlerGuard\)/, hint: "Apply the guard with `@UseGuards(ThrottlerGuard)` — it enforces the rate limit before the method runs." },
            { re: /@UseGuards\(ThrottlerGuard\)@Post\("login"\)/, hint: "Put it on the line directly above `@Post(\"login\")` so it guards that route." },
          ],
          success: "That guard turns a wide-open login into one that answers `429` after too many tries — the single most valuable control on an auth surface. Attackers hate it.",
        },
      ],
    },
    {
      id: "config-shutdown",
      title: "Config from the environment, and graceful shutdown",
      steps: [
        {
          type: "text",
          md: [
            "## Secrets live in the environment, and the app fails loud without them",
            "You saw `process.env.CORS_ORIGIN` and `process.env.PORT` already. That's the **12-factor** rule: **config that changes between environments — database URLs, the JWT secret, Stripe keys — lives in environment variables, never in the code or git.** One image runs unchanged in dev, staging, and production; only the environment differs.",
            "The senior habit is **fail-fast**: check every required variable **at startup** and refuse to boot if one is missing. A crash on line one, before you accept a single request, is a good outage. A `JWT_SECRET` that's silently `undefined` — signing every token with 'undefined' — is a catastrophic one you find in production.",
            "> In an interview, say: `Config comes from the environment and I validate it at boot — if a required secret is missing the process exits immediately. I'd rather fail the deploy than run half-configured and leak it later.`",
          ],
        },
        {
          type: "code",
          title: "src/config/env.ts — validate at startup",
          source: String.raw`const REQUIRED = ["DATABASE_URL", "JWT_SECRET"];

export function validateEnv(): void {
  const missing = REQUIRED.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error("Missing required env vars: " + missing.join(", "));
  }
}`,
          caption: "Call validateEnv() at the very top of bootstrap(), before NestFactory.create. If DATABASE_URL or JWT_SECRET is unset, the process throws and exits — the deploy fails clean instead of the app booting into a broken half-state. Nest's ConfigModule with a validation schema does the same thing with more structure; this is the idea in ten lines.",
        },
        {
          type: "exercise",
          title: "Require a single env var or throw",
          prompt: [
            "Write the building block: `requireEnv` reads one variable and fails loud if it's absent. Read it into `const value = process.env[name]`. If `!value`, `throw new Error(...)` with a message naming what's missing. Otherwise `return value`.",
            "> Heads up: build the error message with `+`, not a template literal — typed exercises in this course avoid backticks.",
          ],
          starter: String.raw`function requireEnv(name: string): string {
  // your code here
}`,
          solution: String.raw`function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error("Missing required env var: " + name);
  }
  return value;
}`,
          checks: [
            { re: /const value=process\.env\[name\]/, hint: "Read the variable: `const value = process.env[name]` — an unset var comes back `undefined`." },
            { re: /if\(!value\)\{/, hint: "Guard the missing case: `if (!value) {` — `undefined` and `\"\"` are both falsy, so this catches both." },
            { re: /throw new Error\(/, hint: "Fail fast: `throw new Error(...)` so a missing secret stops the boot instead of running half-configured." },
            { re: /return value/, hint: "On the happy path, `return value` so callers get the checked string." },
          ],
          mustNot: [
            { re: /return process\.env\[name\]/, hint: "Don't return `process.env[name]` directly — validate it first, then return the checked `value`." },
          ],
          success: "That's the whole fail-fast pattern: read, check, throw or return. Wrap your required vars in it at startup and a misconfigured deploy dies on line one, where you can see it.",
        },
        {
          type: "text",
          md: [
            "## Zero-downtime deploys need a graceful goodbye",
            "Every deploy, autoscale-down, or pod reschedule ends the same way: the orchestrator sends your process **`SIGTERM`** and starts a countdown. Ignore it and the OS follows with `SIGKILL` — which severs in-flight requests mid-response and drops database connections on the floor. Users see 502s during every single deploy.",
            "A **graceful shutdown** turns that into a non-event. On `SIGTERM` you: **stop accepting new connections**, **let in-flight requests finish** (drain), **close the database pool and queue connections**, *then* exit. Done right, a deploy is invisible to users — the essence of zero-downtime.",
          ],
        },
        {
          type: "text",
          md: [
            "## `enableShutdownHooks()` wires SIGTERM to Nest's lifecycle",
            "Nest has lifecycle hooks — `onModuleDestroy`, `onApplicationShutdown` — where each provider cleans up after itself. But Nest **won't listen for OS signals unless you ask**, because attaching signal listeners has a cost it won't impose by default. `app.enableShutdownHooks()` is that opt-in: it makes `SIGTERM`/`SIGINT` trigger the whole teardown sequence.",
            "Then each provider that owns a resource implements `onModuleDestroy` to release it. Your `PrismaService` closes the connection pool; a queue worker stops pulling jobs. Nest calls them in reverse dependency order, so nothing tears down a thing another provider still needs.",
          ],
        },
        {
          type: "code",
          title: "src/prisma/prisma.service.ts — close the pool on shutdown",
          source: String.raw`import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  async onModuleDestroy() {
    await this.$disconnect();
  }
}`,
          caption: "When enableShutdownHooks() fires on SIGTERM, Nest calls onModuleDestroy on every provider that has one. Here PrismaService closes its connection pool with $disconnect() — no dangling connections left holding slots on the database after the process is gone.",
        },
        {
          type: "exercise",
          title: "Turn on the shutdown hooks",
          prompt: [
            "The bootstrap creates the app and listens, but never opts into signal handling — so `SIGTERM` skips the cleanup and requests get cut off on deploy. Add `app.enableShutdownHooks();` after the app is created and before `app.listen`.",
          ],
          starter: String.raw`async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // your code here

  await app.listen(3000);
}`,
          solution: String.raw`async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();

  await app.listen(3000);
}`,
          checks: [
            { re: /app\.enableShutdownHooks\(\)/, hint: "Opt in with `app.enableShutdownHooks()` — without it Nest ignores SIGTERM and never runs your onModuleDestroy cleanup." },
            { re: /app\.enableShutdownHooks\(\);await app\.listen/, hint: "Register the hooks before you start listening: put it above `await app.listen(3000)`." },
          ],
          success: "One line, and every deploy now drains cleanly instead of guillotining live requests. This is the difference between a deploy your users feel and one they never notice.",
        },
        {
          type: "quiz",
          q: "On a deploy, the orchestrator sends your pod `SIGTERM` and then waits a grace period before `SIGKILL`. Why does `enableShutdownHooks()` matter here?",
          choices: [
            "It lets Nest run the lifecycle hooks on SIGTERM — stop taking new requests, let in-flight ones finish, close the DB pool — so the deploy drops zero requests",
            "It speeds up the app's cold start",
            "It disables health checks during shutdown",
            "It forces the process to exit immediately, killing in-flight requests",
          ],
          answer: 0,
          explain: "SIGTERM is a polite 'wrap up, you're going away.' With shutdown hooks enabled, Nest uses that grace window to drain in-flight work and release resources cleanly, then exits before SIGKILL is needed. Without it, the process ignores the signal and gets killed mid-request — a 502 on every deploy.",
          nudge: "SIGTERM is a warning with a grace period. The hooks are what let you actually use that window to finish cleanly.",
        },
      ],
    },
    {
      id: "health-docker",
      title: "Health checks, the Dockerfile, and not blocking the loop",
      steps: [
        {
          type: "text",
          md: [
            "## Two different questions: 'are you alive?' and 'are you ready?'",
            "In production an orchestrator (Kubernetes, ECS, Cloud Run) polls your service constantly with two distinct probes — and confusing them causes outages:",
            "- **Liveness** — *is this process alive and responsive?* If it fails, the orchestrator **restarts** the pod. Keep it dependency-free: it must answer `200` the instant the process can, and nothing more.\n- **Readiness** — *is this instance ready to receive traffic right now?* If it fails, the orchestrator **stops routing to it** but leaves it running. This one *may* check dependencies — the DB pool is connected, migrations ran — because 'not ready yet' is a normal, recoverable state.",
            "> Red flag: making liveness check the database. A brief DB blip then fails liveness on every pod at once, the orchestrator restarts them all simultaneously, and you've turned a hiccup into a full outage. Liveness checks the process; readiness checks the dependencies.",
          ],
        },
        {
          type: "code",
          title: "src/health/health.controller.ts",
          source: String.raw`import { Controller, Get } from "@nestjs/common";
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from "@nestjs/terminus";
import { PrismaService } from "../prisma/prisma.service";

@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
  ) {}

  @Get("live")
  @HealthCheck()
  liveness() {
    return this.health.check([]);
  }

  @Get("ready")
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.db.pingCheck("database", this.prisma),
    ]);
  }
}`,
          caption: "@nestjs/terminus gives you the health-check plumbing. GET /health/live runs an empty check list — it's 200 as long as the process answers, so it never restarts the pod over a downstream blip. GET /health/ready pings the database, so an instance mid-startup reports 'not ready' and takes no traffic until its dependencies are up.",
        },
        {
          type: "quiz",
          q: "A request hits your pod mid-startup, before the Prisma pool has connected. Which probe should fail, and which should still pass?",
          choices: [
            "Readiness should fail (not ready for traffic yet); liveness should pass (the process is alive — don't restart it)",
            "Both should fail so the orchestrator restarts the pod",
            "Both should pass; health probes never check dependencies",
            "Liveness should fail; readiness is only for the load balancer",
          ],
          answer: 0,
          explain: "During startup the process is alive (liveness passes — restarting it would only reset the clock) but not yet able to serve real traffic (readiness fails, so no requests get routed to it). When the pool connects, readiness flips to passing and the instance joins the pool. Failing liveness here would restart a pod that was booting perfectly fine.",
          nudge: "Restarting a pod that's still booting just makes it boot again. Which probe controls restart, and which controls traffic?",
        },
        {
          type: "text",
          md: [
            "## Profiling first-aid: never block the event loop",
            "One production failure mode is unique to Node, and it's the first thing to suspect when latency spikes with CPU pinned on a single core: **something is blocking the event loop.** Node serves every client on one JS thread; the instant you run a *synchronous* CPU- or I/O-bound operation, every other request in the process waits behind it.",
            "The usual culprits: **synchronous `fs` calls** (`fs.readFileSync` in a request handler), a giant `JSON.parse`, synchronous crypto, or a tight loop over a big array. The tells and the fixes:",
            "- **Measure it.** Watch **event-loop lag** (`perf_hooks` `monitorEventLoopDelay`, or your APM's 'event loop lag' metric). Rising lag under load = the loop is starving.\n- **Move it off the loop.** Use the async API (`fs.promises.readFile`, not `readFileSync`), stream large payloads instead of parsing them whole, and push heavy CPU work to a **worker thread** or a **background job** (module 11's queue).",
            "> In an interview, say: `Node is single-threaded for JS, so my cardinal rule is never block the event loop — no sync fs or heavy CPU in a request path. If latency spikes with CPU pinned on one core, I measure event-loop lag first and move the offending work to async I/O, a worker thread, or the job queue.`",
          ],
        },
        {
          type: "text",
          md: [
            "## Package it: a multi-stage Dockerfile",
            "Most platforms deploy your service as a **container image**. The naive approach — one stage with the whole toolchain, dev dependencies, and source — ships a bloated image full of things production never runs. A **multi-stage build** fixes that: compile in a fat builder stage, then copy only the built output into a slim runtime stage and throw the builder away.",
            "Three production musts go in the runtime stage: install **production dependencies only**, set **`NODE_ENV=production`** (Nest and libraries skip dev-only work and dev warnings), and run as a **non-root user** so a compromise of the app can't act as root inside the container.",
          ],
        },
        {
          type: "text",
          md: [
            "## The Dockerfile in full",
            "Here's a production-shaped Dockerfile for the compiled NestJS app. Read it top to bottom — every line maps to something in this lesson (it's a Dockerfile, not TypeScript, so it's read-only here):",
            "```dockerfile\n# ---- build stage ----\nFROM node:22-slim AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\nRUN npm prune --omit=dev\n\n# ---- runtime stage ----\nFROM node:22-slim\nENV NODE_ENV=production\nWORKDIR /app\nCOPY --from=build /app/node_modules ./node_modules\nCOPY --from=build /app/dist ./dist\nUSER node\nEXPOSE 3000\nCMD [\"node\", \"dist/main.js\"]\n```",
            "`npm ci` installs from the lockfile for a reproducible build; `npm run build` compiles TypeScript to `dist/`; `npm prune --omit=dev` strips dev dependencies before they're copied forward. The runtime stage starts fresh, sets `NODE_ENV=production`, copies only `node_modules` and `dist`, and drops to the built-in unprivileged `node` user before running. The compiler and dev deps never reach the shipped image.",
          ],
        },
        {
          type: "quiz",
          q: "Your production Dockerfile builds in a `node:22-slim` stage, then runs from a fresh slim base as the non-root `node` user with `NODE_ENV=production`. What's the payoff of that shape?",
          choices: [
            "A smaller, safer runtime image — dev dependencies and build steps stay in the discarded build stage, and the non-root user limits the blast radius if the app is compromised",
            "It makes TypeScript compile faster at runtime",
            "It lets the container skip health checks",
            "Running as root is required for Node, so the USER line is cosmetic",
          ],
          answer: 0,
          explain: "Each FROM starts a new stage with its own filesystem; the runtime stage copies only node_modules and dist out of the builder, so the compiler and dev deps never ship. NODE_ENV=production turns off dev-only overhead, and USER node means a compromised process runs unprivileged instead of as root. Smaller attack surface, smaller image, safer default.",
          nudge: "Think about what's NOT in the final image, and what a break-in can and can't do when the process isn't root.",
        },
      ],
    },
    {
      id: "graduation",
      title: "Graduation",
      steps: [
        {
          type: "text",
          md: [
            "## Look how far you came",
            "You started this course never having written a line of backend TypeScript, knowing only that the PawWalk app from Part I *asked a server for data*. You are now the person who builds that server.",
            "Retrace the climb:",
            "- **The language & the runtime** (00–03) — TypeScript for the backend, `async`/`await` and the event loop, modules and npm. You learned *why* Node handles thousands of connections on one thread — and why blocking that thread is the cardinal sin.\n- **HTTP, then Nest** (04–06) — a raw `node:http` server, then NestJS: modules, controllers, providers, dependency injection, DTOs and validation. The three building blocks that make every resource look the same.\n- **The real PawWalk backend** (07–11) — Prisma and a database, the walkers API, **JWT auth**, **bookings** with transactions priced in cents, and **streams + a job queue**.\n- **Prove it & ship it** (12–13) — **testing** with Jest and Supertest, then hardening (helmet, CORS, throttler), fail-fast config, **graceful shutdown**, health checks, and a multi-stage **Docker** image.",
          ],
        },
        {
          type: "text",
          md: [
            "## What you can genuinely do now",
            "This wasn't a tour. You can sit down and build a real HTTP service in NestJS: model the domain, expose it through thin controllers and injectable services, validate input with DTOs, back it with Prisma and a database, guard it with JWT auth and rate limiting, cover it with Jest and Supertest, and ship it in a hardened container that shuts down gracefully behind liveness and readiness probes.",
            "Those are the same bones under a huge share of the APIs running in production today. You now read that code as a native speaker, not a tourist — and, just as important, you can explain the *why* behind each choice out loud.",
          ],
        },
        {
          type: "text",
          md: [
            "## Where to go next",
            "The service you built is real, but a production system keeps growing. The natural next steps, roughly in order:",
            "- **Observability** — structured logging (pino/nestjs-pino with request ids), plus metrics and traces, so you can *see* what production is doing instead of guessing.\n- **Caching** — a Redis layer in front of hot, read-heavy queries (the walker list) to cut database load and latency.\n- **Idempotency & retries** — idempotency keys on money-moving endpoints so a client retry after a timeout never double-charges or double-books.\n- **CI/CD** — wire the build → test → Docker → deploy pipeline so shipping is a push, and roll forward on green.",
            "And you have a whole monorepo of neighbors to study: the Rails `pawwalk-api`, plus the iOS and Android PawWalk apps, all speak to a backend just like the one you built. Read how they shape the same walkers, bookings, and cents from the other side of the URL.",
          ],
        },
        {
          type: "quiz",
          q: "It's 2am, the PawWalk API is slow, and CPU is pinned at 100% on a single core. What does a senior Node engineer suspect first?",
          choices: [
            "Something is blocking the event loop — a synchronous call (sync fs, a huge JSON.parse, a tight CPU loop) is stalling the one JS thread; measure event-loop lag and move that work off the loop",
            "The database needs more indexes, definitely",
            "Node can't use more than one core, so nothing can be done",
            "Add more RAM and restart the pod",
          ],
          answer: 0,
          explain: "One core pinned at 100% while everything queues is the signature of a blocked event loop — Node runs your JS on a single thread, so one synchronous heavy operation stalls every other request. Measure event-loop lag to confirm, then move the culprit to async I/O, a worker thread, or the background queue. Indexes and RAM are guesses; the CPU-on-one-core tell points straight at the loop.",
          nudge: "What's special about how Node runs your JavaScript, and what does 'one core pinned while everything waits' point to?",
        },
        {
          type: "text",
          md: [
            "## Congratulations",
            "You set out to learn the other side of the URL, and you built it: a real, tested, hardened, deployable Node/NestJS backend for PawWalk, from zero. That's a genuine, hireable skill — the kind that turns 'I call APIs' into 'I build them.'",
            "Take a lap. Then open the terminal one more time and prove to yourself it all runs.",
          ],
        },
        {
          type: "xcode",
          label: "Over to the terminal",
          title: "You can now…",
          intro: ["Your graduation checklist — every item is a real thing you're now able to do, start to finish, with the PawWalk backend you built."],
          items: [
            "Run the whole service locally: `npm run dev`, then hit `curl localhost:3000/health/live`",
            "Run the full test suite green: `npm test` (unit) and `npm run test:e2e` (Supertest)",
            "Prove the hardening: confirm `helmet`, an `enableCors` allow-list, and a `ThrottlerGuard` on `/auth/login` are all wired in `src/main.ts` and the auth controller",
            "Confirm graceful shutdown: `app.enableShutdownHooks()` in bootstrap and `onModuleDestroy` closing the Prisma pool",
            "Validate config fails fast: unset `JWT_SECRET`, start the app, and watch it refuse to boot",
            "Build and run the container: `docker build -t pawwalk-api .` then `docker run -p 3000:3000 pawwalk-api`",
            "Go read a neighbor: open the Rails `apps/pawwalk-api`, or the iOS/Android PawWalk app, and trace one request from the app to a handler you now understand",
            "Celebrate — you're a Node/NestJS backend developer. 🟢🚀",
          ],
        },
      ],
    },
  ],
});
