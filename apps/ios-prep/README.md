# iOS Dev Study Guide

A static study app for learning iOS development from scratch — **Swift, SwiftUI, UIKit,
concurrency, architecture, data, performance, testing, CI/CD, the App Store, security, and
on-device AI** — framed for junior → mid → senior → architect → beyond, with interview-style Q&A.

Built with Next.js (App Router, static export) + React + Tailwind, deployed to Cloudflare Pages.
It's a sibling of `reactnative-prep`, reusing the same engine (spaced-repetition flashcards,
multiple-choice quiz, practice prompts, teleprompter pitches, progress tracker, and on-device
AI search/tutor) with all-new iOS content.

## Run it

```bash
npm install      # install dependencies
npm run dev      # local dev server at http://localhost:3000
npm run build    # static export to ./out
npm run typecheck
npm run deploy   # build + wrangler deploy to Cloudflare Pages (project: ios-prep)
```

## What's inside

- **/today** — the daily 20-minute loop: due flashcards + one coding & one design prompt, with a streak.
- **/roadmap** — junior → architect → beyond, what you can do and what to learn next.
- **/study** — 22 topic deep-dives across the whole stack, each with a level note.
- **/architecture** — system-design sections + concept→example→problem→solution deep dives.
- **/pitches** — spoken talk-tracks that explain core iOS topics out loud, with a teleprompter.
- **/flashcards** — 90+ Q&A cards with spaced repetition; filter by topic and level.
- **/quiz** — multiple choice with instant explained feedback.
- **/practice** — coding & system-design prompts; try before you reveal.
- **/search** — instant keyword search, optional on-device semantic search, and an on-device AI tutor.
- **/progress** — a readiness checklist across the whole stack.

## Content

Content lives in typed modules under `src/data/` (the source of truth):
`study.ts`, `architecture.ts`, `flashcards.ts`, `quiz.ts`, `prompts.ts`, `pitches.ts`,
`roadmap.ts`, `progress.ts`, and the depth batches `advanced.ts` / `advanced2.ts`.
`all.ts` aggregates everything for the flashcards page, the daily session, and search.

Categories: Swift, SwiftUI, UIKit, Concurrency, Architecture, Data & Networking, Performance,
Testing, CI/CD & Tooling, App Store, Security, On-Device AI.

> Note: SwiftUI/Swift code samples in the content use escaped backslashes (`\\(...)`, `\\.keyPath`)
> in the TypeScript source so they render as real Swift (`\(...)`, `\.keyPath`) in the browser.
