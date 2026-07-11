# Plan: Fold `apps/learn-reactnative` into `apps/learn`'s Next app, and make that Next app the entire deployed academy

## Context

`apps/learn` today is really **two** things bolted together at deploy time:

1. A hand-written **static engine** (`index.html`, `android.html`, `go.html`, `python.html`,
   `ruby.html`, `app.js`, `styles.css`, `playground/`) that reads `lessons*/*.js` in the
   browser. **This is what `academy.gerardocordero.dev` actually serves today.**
2. A parallel **Next.js app** under `src/` that renders the *same* `lessons*` content (via
   `scripts/build-data.mjs` → `public/data/*.json`) but **has never been deployed**.

Separately, `apps/learn-reactnative` is its own Next.js workspace (Tailwind + shadcn) whose
`out/` is copied into the academy upload at `/reactnative/` by the `deploy-learn` CI job. It
holds the senior-RN practice: ~150 challenges with an in-browser JS test runner, 6 live game
previews, and a 91-card flashcard deck generated at build time from `docs/react-native-senior/*.md`.

**Goal (user-chosen "Full" end-state):** collapse all of this into **one** Next.js app —
`apps/learn`'s `src/` app — which becomes the **sole deployed academy**: it renders the course
homepage, all course lessons (iOS/Android/Ruby/Python/Go/Node/Native/expo-ui), **and** the RN
practice at `/reactnative/*`. The static engine is retired; the `apps/learn-reactnative`
workspace is deleted.

**Why this is safe to attempt:** the course data reaches the client as a **build-time prop**
(`layout.tsx` → `getCourseData()` → `<LearnShell course={course}>` → `<CourseProvider>`), not a
client fetch. The blank content pane seen when serving `out/` via `python -m http.server` is a
plain-static-server artifact (Next's export needs correct `__next/*.txt` RSC-payload + trailing-slash
routing, which Cloudflare Pages provides). **This must be confirmed on a Pages-like host before
the production flip** — it is the gating risk.

## Key risks (call out before executing)

- **R1 — the Next app must actually render on a real host.** Verify with `wrangler pages dev out`
  (serves the export the way Pages does) *before* deleting the static engine. If courses don't
  render there, stop and fix the hydration path first.
- **R2 — Tailwind preflight leaking onto course pages.** `apps/learn`'s course UI is plain CSS;
  `learn-reactnative` is Tailwind + shadcn. Tailwind CSS is global once imported anywhere in the
  App Router. Scope it (see Stage 2) so it cannot restyle the (now-shipping) course + native +
  expo-ui pages.
- **R3 — retiring the battle-tested engine.** The static engine is what production runs today.
  Keep it in git history; flip deploy only after R1 passes on a preview.
- **R4 — Pages 20k-file limit.** The Next `out/` is self-contained (no `node_modules`), ~1,175
  course pages + ~150 challenge pages + assets ≈ well under 20k, but confirm `find out -type f | wc -l`.

## Staged implementation (reversible until Stage 4)

### Stage 1 — Prove the Next app deploys correctly (gate; no deletions)
- `pnpm --filter @gerardocordero/learn build` (already green in this session).
- `cd apps/learn && npx wrangler pages dev out` and verify in the browser pane that a course
  lesson (e.g. `/en/learn/native/native-ios-lidar/arkit/`) renders its **content pane**, not just
  the sidebar. This confirms R1 and that the blank pane was a Python-server artifact.
- If it renders: proceed. If not: fix the client hydration of `<CourseProvider>` first (the
  course prop is embedded at build, so this should just work on a Pages-correct host).

### Stage 2 — Fold `learn-reactnative` into `apps/learn`'s Next app
- **Deps** → add to `apps/learn/package.json`: `tailwindcss`, `postcss`, `autoprefixer`,
  `@tailwindcss/typography`, `tailwindcss-animate`, `@radix-ui/react-*` (scroll-area, select,
  separator, slot), `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`,
  `react-markdown`, `remark-gfm`. (Versions: copy from `apps/learn-reactnative/package.json`;
  React/Next already match at 19.2.4 / 16.2.9.)
- **Routes** → move the RN app under a non-localized segment so URLs stay `/reactnative/*`:
  - `apps/learn-reactnative/app/page.tsx` → `apps/learn/src/app/reactnative/page.tsx`
  - `app/challenges/**` → `apps/learn/src/app/reactnative/challenges/**` (keeps `[id]`,
    `ChallengeListClient.tsx`, `components/`, `hooks/`, `lib/`, `previews/`)
  - `app/layout.tsx` → `apps/learn/src/app/reactnative/layout.tsx` (nested layout — this is the
    Tailwind scope boundary, see below)
- **Shared code** → move into the Next app's aliased dirs:
  - `lib/{challenges.ts,challenge-runner.ts,flashcards.ts,progress.ts,strip-code.ts,utils.ts}`
    and `lib/challenges/*` → `apps/learn/src/lib/reactnative/**`
  - `components/{FlashcardDeck,FlashcardCard}.tsx` and `components/ui/*` →
    `apps/learn/src/components/reactnative/**`
  - Fix the `@/` import paths to the new locations. `flashcards.ts`'s
    `path.join(process.cwd(), '../../docs/react-native-senior')` **needs no change** — `apps/learn`
    is the same depth as `apps/learn-reactnative`, so it still resolves to `<repo>/docs/react-native-senior`.
- **Tailwind scoping (R2)** → `apps/learn/tailwind.config.js` with `corePlugins: { preflight: false }`
  (do not ship Tailwind's global reset). Put `@tailwind base/components/utilities` +
  shadcn CSS-var tokens in a `reactnative.css` imported **only** in
  `src/app/reactnative/layout.tsx`, wrapped in a `.rn-root` container so shadcn tokens are scoped.
  Verify course pages are visually unchanged after this (Stage-2 check).
- **Remove `basePath`**: the RN app used `basePath: '/reactnative'`; as a real route segment it's
  served at `/reactnative` natively — drop basePath. `<Link>`/asset paths adjust automatically.
- **Build gate**: `pnpm --filter @gerardocordero/learn build`; confirm `out/reactnative/index.html`,
  `out/reactnative/challenges/index.html`, and a sample `out/reactnative/challenges/<id>/index.html`
  exist, and `find out -type f | wc -l` < 20k.

### Stage 3 — Verify the merged app end-to-end (gate before any deletion)
- `wrangler pages dev out`, then in the browser pane:
  - a course lesson renders content (R1 still holds after the Tailwind change),
  - `/reactnative/` renders, `/reactnative/challenges/` lists challenges, a challenge detail runs
    the in-browser test runner, and the flashcard deck renders (build-time gen from
    `docs/react-native-senior`).
- `pnpm --filter @gerardocordero/learn typecheck && lint`.

### Stage 4 — Flip deploy + retire the static engine + delete the old workspace
- **Rewrite `deploy-learn` in `.github/workflows/ci.yml`** (currently rsyncs the static engine +
  copies `learn-reactnative/out`): now
  1. `pnpm install --frozen-lockfile`
  2. `pnpm --filter @gerardocordero/learn build`
  3. `wrangler pages deploy apps/learn/out --project-name=academy --branch=main`
  - Change-detection `PATHS`: drop `apps/learn-reactnative/`; keep `^(apps/learn/|docs/react-native-senior/)`.
  - Remove the separate "Build the React Native practice app" step and the `dist-academy` rsync/cp assembly.
- **Delete the static engine**: `index.html`, `android.html`, `go.html`, `python.html`, `ruby.html`,
  `app.js`, `styles.css`, `playground/`.
- **Delete obsolete tests** (they assert the static engine): `apps/learn/app.test.mjs`
  (tests `app.js`'s highlighter) and `apps/learn/pages.test.mjs` (tests the `.html` shells,
  cross-link mesh, the CLAUDE.md doc row, and `docs/learning/go-academy-plan.md`). Keep
  `tools/validate.mjs` + `tools/validate.test.mjs` + `tools/i18n-check.mjs` (they validate
  `lessons*` content, which still feeds the Next app).
- **Delete `apps/learn-reactnative/`** entirely. The `apps/*` workspace glob drops it automatically;
  no `pnpm-workspace.yaml` change needed. (`apps/reactnative-prep` is a *different* app — untouched.)

### Stage 5 — Docs + final gates
- **`CLAUDE.md`**: rewrite the `apps/learn` row — it is now a single deployed Next.js app
  (courses + `/reactnative` practice); the static engine and `learn-reactnative` workspace are
  gone; gates are `pnpm typecheck` + `pnpm lint` + `node tools/validate.mjs` +
  `node tools/i18n-check.mjs` + `node --test` (new, lower test count) + `next build`; deploy =
  `deploy-learn` builds and deploys the Next `out/`. **Remove the `apps/learn-reactnative` row.**
  (Note: this row is asserted by `pages.test.mjs`, which is being deleted — so the CLAUDE.md
  coupling goes away with it.)
- **`apps/learn/README.md`**: update from "N courses share one static engine" to the single-Next-app
  architecture.
- **Final loop**: `pnpm --filter @gerardocordero/learn typecheck`, `lint`, `node tools/validate.mjs`,
  `node tools/i18n-check.mjs`, `node --test`, `pnpm --filter @gerardocordero/learn build`.

## Files touched (representative, not exhaustive)

- **New/moved**: `apps/learn/src/app/reactnative/**`, `apps/learn/src/lib/reactnative/**`,
  `apps/learn/src/components/reactnative/**`, `apps/learn/tailwind.config.js`,
  `apps/learn/postcss.config.js`, `apps/learn/src/app/reactnative/reactnative.css`.
- **Edited**: `apps/learn/package.json` (deps), `.github/workflows/ci.yml` (`deploy-learn`),
  `CLAUDE.md`, `apps/learn/README.md`.
- **Deleted**: `apps/learn/{index,android,go,python,ruby}.html`, `apps/learn/app.js`,
  `apps/learn/styles.css`, `apps/learn/playground/`, `apps/learn/app.test.mjs`,
  `apps/learn/pages.test.mjs`, and the whole `apps/learn-reactnative/` directory.
- **Unchanged (load-bearing)**: `apps/learn/lessons*/**`, `apps/learn/scripts/build-data.mjs`,
  `apps/learn/tools/{validate,i18n-check}.mjs`, `apps/learn/src/**` course-rendering code,
  `docs/react-native-senior/**`.

## Verification

1. **Local, Pages-accurate**: `pnpm --filter @gerardocordero/learn build` then
   `cd apps/learn && npx wrangler pages dev out` — browser-verify (a) a course lesson's content
   pane renders, (b) `/reactnative/` + `/reactnative/challenges/` + a challenge run + flashcards,
   (c) course pages visually unchanged by Tailwind.
2. **File count**: `find apps/learn/out -type f | wc -l` < 20,000.
3. **Loop**: typecheck + lint + `node tools/validate.mjs` + `node tools/i18n-check.mjs` + `node --test` all green.
4. **Production**: after merge to `main`, `deploy-learn` builds and deploys the Next `out/` to the
   `academy` Pages project; smoke-check `academy.gerardocordero.dev/` (courses) and
   `academy.gerardocordero.dev/reactnative/challenges/`.

## Rollback

Nothing is deleted until Stage 4, after Stages 1 and 3 confirm the Next app renders on a
Pages-accurate host. If the production deploy misbehaves, revert the `deploy-learn` commit — the
static engine + `learn-reactnative` remain in git history and can be restored wholesale.
