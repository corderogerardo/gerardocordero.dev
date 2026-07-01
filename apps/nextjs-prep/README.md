# Next.js Interview Prep

A static study app for senior Next.js / React interview prep — **the App Router,
Server Components, rendering & caching (Cache Components), Server Actions, routing,
performance, auth, testing, and security** — framed for junior → mid → senior →
architect → beyond, with interview-style Q&A.

Built with Next.js (App Router, static export) + React + Tailwind, deployed to
Cloudflare Pages. It's a sibling of `ios-prep` / `android-prep` / `reactnative-prep` /
`nest-prep`, reusing the same engine (spaced-repetition flashcards, multiple-choice
quiz, practice prompts, teleprompter pitches, progress tracker, and on-device AI
search/tutor) with all-new Next.js 16 content.

## Run it

```bash
pnpm --filter @gerardocordero/nextjs-prep dev        # local dev server at http://localhost:3000
pnpm --filter @gerardocordero/nextjs-prep build       # static export to ./out
pnpm --filter @gerardocordero/nextjs-prep typecheck
pnpm --filter @gerardocordero/nextjs-prep deploy      # build + wrangler deploy (project: nextjs-prep)
```

## What's inside

- **/today** — the daily 20-minute loop: due flashcards + one coding & one design prompt, with a streak.
- **/roadmap** — junior → architect → beyond, what you can do and what to learn next.
- **/study** — study-guide topic deep-dives across the App Router, RSC, caching, data, and more.
- **/architecture** — system-design sections + concept→example→problem→solution deep dives.
- **/pitches** — spoken talk-tracks that explain core Next.js topics out loud, with a teleprompter.
- **/flashcards** — Q&A cards with spaced repetition; filter by topic and level.
- **/quiz** — multiple choice with instant explained feedback.
- **/practice** — coding & system-design prompts; try before you reveal.
- **/search** — instant keyword search, optional on-device semantic search, and an on-device AI tutor.
- **/progress** — a readiness checklist across the whole guide.

## Content

Content lives in typed modules under `src/data/` (the source of truth): `study.ts`,
`architecture.ts`, `flashcards.ts`, `quiz.ts`, `prompts.ts`, `pitches.ts`, `roadmap.ts`,
`progress.ts`. `all.ts` aggregates everything for the flashcards page, the daily
session, and search. Curated GitHub sources used while authoring content are logged in
`docs/study-resources.md`.

Categories: Core (App Router), Rendering & Caching, Data & Server Actions, Routing,
Performance, Auth, Testing, Security.

Content targets **Next.js 16.2** and **React 19.2** — Cache Components / `"use cache"`,
`proxy.ts` (formerly `middleware.ts`), async `params`/`searchParams`/`cookies()`/
`headers()`, and Turbopack-by-default.
