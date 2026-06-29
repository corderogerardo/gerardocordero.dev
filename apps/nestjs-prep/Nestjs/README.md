# NestJS Interview Prep

A senior **NestJS + Node.js** interview study guide — a static Next.js 16 site built on the shared
[`@gerardocordero/prep-kit`](../../../packages/prep-kit) study engine (the same engine behind the
iOS / Android / React Native prep sites). NestJS is the spine; Node.js internals are woven in where they matter.

Content is current to **NestJS 11** and **Node.js 24 LTS** (as of mid‑2026) and sourced from the
official [NestJS docs](https://docs.nestjs.com), the [Node.js API docs](https://nodejs.org/docs/latest/api/),
and widely-cited best-practice guides.

## What's inside

All content lives in typed modules under `src/data/`:

- **Flashcards** (`flashcards*.ts`, `perf.ts`) — 140+ Q&A across Core, DI & Modules, Request Lifecycle,
  Config, Data & ORM, Auth, Testing, GraphQL, WebSockets, Microservices, Queues, Node.js Core,
  Performance, Security, Deploy & Ops, Architecture, Beyond, and Behavioral. Each is graded
  junior → mid → senior → architect → beyond.
- **Quiz** (`quiz*.ts`) — 34 multiple-choice questions with explained answers.
- **Study guide** (`study.ts`, `study2.ts`) — 36 topics, each with a "how to say it" interview line.
- **Architecture** (`architecture.ts`) — 10 system-design sections + 6 deep dives
  (rate limiter, URL shortener, notification service, chat backend, job queue, file upload).
- **Practice** (`prompts.ts`, `dsa.ts`, `perf.ts`) — 31 coding / DSA / system-design / performance prompts
  with progressive reveals.
- **Pitches** (`pitches.ts`) — 10 spoken answers with a teleprompter (fill in the `[bracketed]` placeholders).
- **Roadmap** (`roadmap.ts`) and **Progress** (`progress.ts`) — a level-graded path and a readiness checklist.

Features (from the shared kit): spaced-repetition flashcards, a daily session with a streak,
on-device AI search + tutor (runs in the browser, nothing leaves your device), and a teleprompter.

## Run it

From the **monorepo root** (first time, or after pulling — deps are not committed):

```bash
pnpm install
```

Then:

```bash
pnpm --filter @gerardocordero/nestjs-prep dev        # dev server at http://localhost:3000
pnpm --filter @gerardocordero/nestjs-prep typecheck  # tsc --noEmit
pnpm --filter @gerardocordero/nestjs-prep lint        # eslint
pnpm --filter @gerardocordero/nestjs-prep build       # static export to ./out
```

`pnpm typecheck` / `pnpm lint` at the root also include this app via Turbo.

## Editing content

Everything is plain typed data — edit the files in `src/data/`. Answers are trusted HTML rendered via
the kit's `<RichText>` component; the styling classes (`callout`, `callout tip/warn`, `map`, `lbl`,
`code`, `dd-block`, `pill`) are defined in `src/app/rich.css`. Add a flashcard by appending to a
`FLASHCARDS*` array; add a study section to `STUDY*_SECTIONS`; everything is aggregated in `src/data/all.ts`.

## Deploy

Configured for a Cloudflare Pages static deploy (project `nestjs-prep`):

```bash
pnpm --filter @gerardocordero/nestjs-prep deploy
```

This requires a Cloudflare Pages project named `nestjs-prep` and `wrangler` auth. A path-filtered CI
deploy job (mirroring the other `*-prep` apps in `.github/workflows/ci.yml`) is **not yet wired** —
add one once the Cloudflare project and DNS (`nestjs.gerardocordero.dev`) exist.
