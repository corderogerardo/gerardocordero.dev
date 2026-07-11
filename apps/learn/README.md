# PawWalk Academy

One **Next.js 16 static-export app** that is the whole of `academy.gerardocordero.dev`.
It renders two things from a single build:

1. **Interactive courses** — step-by-step, type-the-real-code, in-browser-checked lessons that
   rebuild the PawWalk app and backend from zero. One engine, eight courses:
   - **iOS** — Swift & SwiftUI · **Android** — Kotlin & Jetpack Compose · **Ruby** — Ruby & Rails
   - **Python** — Flask → Django → FastAPI → LLM agents → RAG · **Go** — net/http → a real backend
   - **Node** — NestJS · **Native RN** — Expo native modules + a LiDAR/ARCore depth view
   - **Rebuild @expo/ui** — SwiftUI/Compose-native primitives + Host/Children composition
2. **Senior React Native practice** at **`/reactnative/`** — a 91-card flashcard deck (generated
   at build time from `docs/react-native-senior/*.md`) and 150 coding challenges with an
   in-browser JS test runner and 6 live game previews.

The former hand-written static engine and the separate `apps/learn-reactnative` workspace were
folded into this one app (see [`docs/plans/recursive-twirling-raven.md`](../../docs/plans/recursive-twirling-raven.md)).

## Run it

```sh
pnpm install
pnpm --filter @gerardocordero/learn dev       # Turbopack dev server → localhost:3000
# …or preview the actual export the way Cloudflare Pages serves it:
pnpm --filter @gerardocordero/learn build     # build-data.mjs + next build → apps/learn/out
npx serve apps/learn/out
```

Open `/en` for the course picker, `/en/learn/<course>/…` for a lesson, `/reactnative/` for
flashcards, `/reactnative/challenges/` for the challenges.

> To preview the static **export**, prefer `serve` (or `wrangler pages dev out`) over
> `python -m http.server` — Next's export needs correct clean-URL / trailing-slash routing to
> hydrate.

Course progress (including code you type) is saved in `localStorage` under per-course store keys
(`pawwalk-academy-<id>-v1`), so progress in one course never touches another.

## Architecture

- **Courses are data.** Each `lessons-<id>/*.js` file pushes one module onto `window.COURSE`.
  `scripts/build-data.mjs` runs them in a sandbox and emits `public/data/{locale}/<id>.json`,
  which the App Router pages (`src/app/[locale]/learn/…`) render. Adding a course = a new
  `lessons-<id>/` dir + registration in `scripts/build-data.mjs`, `tools/validate.mjs`,
  `src/lib/i18n-config.ts` (`COURSE_IDS`), and the homepage `src/app/[locale]/page.tsx`.
- **Two-column shell** — `src/components/learn-shell.tsx` wraps `<nav>` + `<main>` in
  `<div className="layout">` (the flex container from `styles.css`, imported via
  `src/app/globals.css`). That `.layout` wrapper is load-bearing for the desktop layout.
- **The `/reactnative` section** (`src/app/reactnative/…`) uses Tailwind + shadcn, scoped under
  `.rn-root` with **Tailwind preflight disabled** (`tailwind.config.js`) so its reset can't touch
  the plain-CSS course pages. Its shared code lives in `src/lib/*` and `src/components/*`
  (Flashcard*, `ui/`, `challenge-runner.ts`, `flashcards.ts`, …).

## Gates

Run from `apps/learn/`:

```sh
pnpm typecheck                # tsc --noEmit  (in the pnpm/turbo loop)
pnpm lint                     # eslint         (in the pnpm/turbo loop)
node tools/validate.mjs       # lesson schema + every exercise's solution passes its own checks
                              # (no arg validates all: lessons | lessons-android | lessons-ruby |
                              #  lessons-python | lessons-go | lessons-node | lessons-native | lessons-expoui)
node tools/i18n-check.mjs     # translation-overlay drift
node --test                   # tools/validate.test.mjs (the validator's own tests)
```

CI runs these in the path-filtered `validate-learn` job; `deploy-learn` builds the app and
`pages deploy out` to the `academy` Pages project on pushes to `main`.

## Content voice

All lesson content is authored in the senior-coach voice — see
[`.claude/skills/senior-coach-content/SKILL.md`](../../.claude/skills/senior-coach-content/SKILL.md).
