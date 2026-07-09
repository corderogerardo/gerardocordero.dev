# Node / NestJS content to-do

Turns [the compass Node.js study guide](compass_artifact_wf-068a84e6-c62d-4ba7-8eb6-819160b6059b_text_markdown.md)
into content for **apps/nest-prep** (deepen the prep site) and **apps/learn** (new "Node & NestJS" course).

Pick a task, do the one file, run its verify, tick the box. `[sonnet]` = author, `[haiku]` = translate.
Apply the `.claude/skills/senior-coach-content/SKILL.md` voice to every authoring task.
Where a task cites benchmark numbers or OWASP hashing guidance, keep the doc's caveat ("directional", "guidance evolves").

**Verify commands**
- nest-prep: `pnpm --filter @gerardocordero/nest-prep typecheck && pnpm --filter @gerardocordero/nest-prep lint`
- learn: `cd apps/learn && node tools/validate.mjs lessons-node && cd ../.. && pnpm --filter @gerardocordero/learn typecheck && pnpm --filter @gerardocordero/learn lint`

**Ordering**: Phase-A batches all edit `all.ts` → land sequentially. Phase-C: **C0 before C1–C13**. `-es` twins depend on their EN task.

---

## Phase A — nest-prep advanced batches (Node-general depth)

Exemplar: `apps/nest-prep/src/data/advanced18.ts` (+ `advanced1.es.ts` for twins). Each `advancedN.ts` = header comment `// Batch N — …`, exports `ADVANCEDN_FLASHCARDS: Flashcard[]` (10–14) + `ADVANCEDN_QUIZ: QuizQuestion[]` (~5). ids `aN-<slug>-K`. Register in `all.ts` (1 import + spread into `ALL_FLASHCARDS` and `ALL_QUIZ`).

- [x] **A19** `advanced19.ts` `[sonnet]` — Event-loop ordering drills (doc Part 1): 6 phases, microtask drain between macrotasks, `nextTick` vs `setImmediate` vs `setTimeout(0)` (inc. inside-I/O determinism), output-prediction quiz snippets, `nextTick` starvation, ESM top-level caveat. category `node`/`Node.js Core`. Don't repeat batch 12's libuv/cluster material.
- [x] **A20** `advanced20.ts` `[sonnet]` — V8 memory & leak hunting (Part 1): generational heap (Scavenge vs Mark-Sweep/Compact), `--max-old-space-size`, 5 leak patterns + fixes, two-snapshot workflow, retainer chains, `maxListeners` warning as leak signal, Buffers off-heap vs UTF-16 strings. category `node`.
- [x] **A21** `advanced21.ts` `[sonnet]` — Streams & backpressure (Part 1): 4 stream types, `highWaterMark`, `.write()`→false, `pipe()` vs `pipeline()` (errors), `for await` over streams, streams vs buffering. category `node`.
- [x] **A22** `advanced22.ts` `[sonnet]` — Async patterns & combinators (Part 2): `all`/`allSettled`/`race`/`any` (+`AggregateError`), sequential-await-should-be-parallel smell, `unhandledRejection`/`uncaughtException` policy, async generators for pagination. category `node`.
- [x] **A23** `advanced23.ts` `[sonnet]` — CJS vs ESM (Part 3): require caching/singleton, circular deps (partial exports vs live bindings), resolution order, `.mjs`/`"type":"module"`, top-level await, dual-package hazard. category `node`.
- [x] **A24** `advanced24.ts` `[sonnet]` — Senior TypeScript (Part 4): generic constraints, conditional types + `infer`, mapped types (+`-readonly`/`-?`), utility types w/ use-cases, template literal types, discriminated unions + assertion functions, branded types, `interface` vs `type`, strict tsconfig. **New category** `ts`/`TypeScript` → add filter entries to `ALL_FLASHCARD_FILTERS` + `ALL_QUIZ_FILTERS` in `all.ts`.
- [x] **A25** `advanced25.ts` `[sonnet]` — Distributed systems (Part 8): CAP as C-vs-A during partition, idempotency keys + completion records, exactly-once myth → idempotent consumers, distributed locks (Redlock caveats), saga choreography vs orchestration, circuit breaker/bulkhead/fallback/timeout, retry backoff+jitter. category `micro`.
- [x] **A26** `advanced26.ts` `[sonnet]` — AWS for Node (Part 9): Lambda model (Firecracker, cold starts, memory=CPU, 1024 MB default), Lambda vs Fargate vs EC2 + cost-crossover caveat, SQS vs SNS fan-out, DynamoDB access-pattern-first, S3 presigned/multipart, task-level IAM. **New category** `aws`/`AWS & Cloud` → filter entries in `all.ts`.
- [x] **A27** `advanced27.ts` `[sonnet]` — Profiling & diagnostics (Part 12): diagnostic loop, clinic flame/0x, bubbleprof (serial async), `node --prof`, two-snapshot heap diff, event-loop lag as Prometheus canary, k6/autocannon, sawtooth vs ratchet memory. category `perf` (already a filter).
- [x] **A28** `advanced28.ts` `[sonnet]` — Security hardening (Part 10): Argon2id-first vs bcrypt (cost ≥10, 12 in 2026, 72-byte limit) **+ "guidance evolves" caveat**, pin alg / reject `alg:none` / `verify` not `decode`, httpOnly+SameSite vs localStorage, enumeration-safe responses, secrets fail-fast + rotation, supply chain (lockfiles/audit/SCA), prototype pollution, SSRF in webhooks. category `auth`.
- [x] **A19-es … A28-es** `[haiku]` ×10 — `.es.ts` twins (mirror export names, translate strings, keep `id`/`category` identical). Exemplar `advanced1.es.ts`.

## Phase B — nest-prep prompts, pitches, roadmap, progress

- [x] **B1** `prompts.ts` `[sonnet]` — append 4 coding prompts (ids `pr-impl-*`, level `senior`) from Part 16: `Promise.all`, custom `EventEmitter`, promise pool, LRU cache. reveal = Approach + Solution + "Key insight".
- [x] **B2** `prompts.ts` `[sonnet]` — append 3 more: token-bucket rate limiter, retry w/ backoff+jitter (retryable-errors/AbortSignal follow-ups), debounce & throttle.
- [x] **B3** `prompts.ts` `[sonnet]` — append 3 `kind:"design"` prompts (Part 8, check id collisions): job queue + DLQ, notification system (per-channel queues/dedup/DLQ), distributed rate limiter (Redis+Lua). reveal = clarify beats + high-level design + trade-offs to voice.
- [x] **B4** `pitches.ts` `[sonnet]` — append 3: Express vs Fastify vs NestJS (Part 6 numbers as *directional* w/ disclaimer, land on team-fit + Fastify-adapter); "trade-off formula" (Part 18 + p95/p99); CARL story skeleton (Part 19, Learnings beat).
- [x] **B5** `progress.ts` `[sonnet]` — append 2 `CHECKLIST_GROUPS`: "8-week study plan" (Part 20 four fortnights) + "Know the loop" (Part 18's 7 stages, item = stage + what it tests). Read the file's shape first.
- [x] **B6** `roadmap.ts` `[sonnet]` — edit senior/lead stages: fold in senior-vs-mid distinction (decision frameworks, p95/p99 not guesswork, circuit breakers not just try/catch, flamegraphs/APM) into `can`/`next`/`drillHtml`.
- [x] **B1-es … B6-es** `[haiku]` ×6 — mirror each into `prompts.es.ts` / `pitches.es.ts` / `progress.es.ts` / `roadmap.es.ts`.

## Phase C — apps/learn "Node & NestJS" course

- [x] **C0** wiring `[sonnet, do first]` — `tools/validate.mjs` (`ALL_DIRS`+=`lessons-node`, `KNOWN_LANGS`+=`ts`); `scripts/build-data.mjs` (`COURSES`+= node entry); `src/lib/course-data.ts` + `src/lib/code-check.ts` (`LangId`+=`ts`); `src/lib/highlight.ts` (`TS_KW` + `ts` entry using Go's regex); `src/lib/i18n-config.ts` (`COURSE_IDS`+=`node`); `lessons-node/FORMAT-NODE.md` (TS addendum, mirror FORMAT-GO backtick trap for template literals); `lessons-node/00-node-welcome.js`. Every module sets `lang: "ts"`.

Each C-module `[sonnet]`: `lessons-node/NN-slug.js`, 2–4 lessons × 5–12 steps, every lesson ends in quiz/exercise, PawWalk-anchored, zero prior Node assumed early, `lang:"ts"`. **Grep for stray backticks inside `String.raw` blocks before finishing** (FORMAT-GO trap applies to TS template literals too). Author in order; each states what earlier modules covered.

- [x] **C1** `01-ts-for-backend.js` — TS/JS essentials: types, interfaces, async syntax (Part 4 basics).
- [x] **C2** `02-async-event-loop.js` — event loop phases, micro/macrotasks, promises/async-await (Parts 1–2; quiz = output prediction).
- [x] **C3** `03-modules-npm.js` — CJS vs ESM, package.json, scripts, module caching (Part 3).
- [x] **C4** `04-http-first-server.js` — `node:http`, minimal Express, REST verbs/status codes (Part 5).
- [x] **C5** `05-nest-kickoff.js` — CLI, modules/controllers/providers, DI as the big idea (Part 6).
- [x] **C6** `06-dtos-validation.js` — DTOs, class-validator, pipes, request-lifecycle order.
- [x] **C7** `07-database-prisma.js` — Prisma schema/migrations, repository-ish service layer (Part 7).
- [x] **C8** `08-pawwalk-api.js` — build the walkers API (mirror `apps/pawwalk-api` domain).
- [x] **C9** `09-auth-jwt.js` — JWT guards, refresh rotation, hashing Argon2id/bcrypt (Part 10).
- [x] **C10** `10-bookings-transactions.js` — bookings + transactions + idempotency key on POST (Parts 5, 7).
- [x] **C11** `11-streams-queues.js` — streams/backpressure + a BullMQ job queue (Parts 1, 8).
- [x] **C12** `12-testing.js` — Jest/Supertest unit + e2e, test pyramid, boundary mocking (Part 11).
- [x] **C13** `13-ship-it-graduation.js` — helmet/rate limiting, graceful shutdown, Docker multi-stage, profiling first-aid (Parts 10, 12, 14) + graduation.

## Not in scope

Locale wiring fixes (PR #69 owns it) · learn-app Spanish lesson dirs (EN fallback works) · `study3.ts` narrative · Part 17/salary/platform-pricing content.
