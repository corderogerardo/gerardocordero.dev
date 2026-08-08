# PawWalk Academy (`apps/learn`) — Playful Learning Brand Redesign

**Status:** Plan (direction + scope approved by owner)
**Direction:** Playful learning brand — warm, rounded, friendly, Duolingo-energy, with per-course identity and celebration moments.
**Scope:** Full app — home, course shell, lesson experience, review, RN practice (flashcards + challenges), interview decks.
**App:** `apps/learn` (Next.js 16 static export, en/es i18n, plain CSS + scoped Tailwind).

---

## 1. Design principles

1. **Friendly first** — the app teaches people to build software; it should feel encouraging, not intimidating. Warm neutrals, rounded shapes, generous whitespace.
2. **Momentum is visible** — progress always in view: sidebar bar, step rail, lesson dots, per-course cards. The user always knows what's next.
3. **Celebrate completion** — finishing a lesson/course is a moment: animation, color, a tangible "you did it" card.
4. **Per-course identity** — each course owns a hue + emoji; identity shows on cards, shell, and step accents.
5. **Playful, not childish** — the playfulness comes from color, shape, motion, and copy tone — not from decreasing readability or breaking conventions.
6. **One token system** — plain CSS and Tailwind consume the same variables; no more duplicated palettes.

## 2. Visual language

### 2.1 Color system

- **Foundation (shared):** warm canvas (`#FAFAF8` family), ink (`#1B1830` family), neutral grays — kept from the current editorial skin.
- **Primary action color:** a friendlier "learning green" or warm coral replaces violet as the global primary (violet becomes one course's color, or remains as a secondary accent — decided in Phase 0 design).
- **Per-course hues** (map in Phase 0, rough sketch):
  - iOS & Swift 📱 — blue
  - Android & Kotlin 🤖 — green
  - Ruby & Rails 💎 — red/coral
  - Python & FastAPI 🐍 — teal
  - Go Backend 🐹 — cyan
  - Native RN & Expo 🛰️ — violet
  - Rebuild @expo/ui 🎛️ — amber
- Each course hue needs a **4-step ramp**: base, strong (hover), soft (tint background), and a readable on-color. Dark mode uses lightened ramps.
- State colors (green/amber/red) stay semantic but harmonize with the new palette.

### 2.2 Typography

- **Display/headings:** a rounded, friendly display face (e.g. Baloo 2, Fredoka, or Nunito Black) for hero, course titles, lesson titles. Loaded via `next/font` (static export-safe).
- **Body:** keep DM Sans (already loaded; good readability).
- **Mono:** keep JetBrains Mono for code, captions, crumbs.
- Clear type scale: hero (clamp 40–64px), page title, section label (mono, uppercase), body 16.5px, caption 12.5–13px.

### 2.3 Shape & depth

- Radius scale up: cards 18–24px, buttons 12–14px, pills 999px. Softer, chunkier feel.
- Shadows: soft, tinted with the card's course hue at low opacity on hover.
- Buttons: rounded, bold, tactile press (`transform: translateY(1px)` on active), course-colored primary variants.

### 2.4 Motion

- `rise`-style entry for steps (exists) — refine to a single consistent easings/curve set.
- Progress micro-animations: bar fill, step dots, card progress rings.
- **Completion celebration:** confetti-like burst (CSS-only, no new deps — e.g. 12–20 absolutely-positioned colored pieces with keyframes) on lesson complete card; course-complete gets a bigger variant.
- Flashcard flip animation for the RN deck.
- Respect `prefers-reduced-motion` (disable non-essential animation).

## 3. Token unification (Phase 0 core deliverable)

**Problem:** `styles.css` defines hex tokens; `reactnative.css` defines HSL triples for Tailwind. Duplicated, drifting.

**Target:** one shared variable namespace in `styles.css` `:root` (both light + dark), consumed by both systems:

- Keep `--canvas`, `--ink`, `--accent` etc. for plain CSS.
- Add HSL-triple twin variables (`--accent-hsl`, `--course-ios-hsl`, …) that Tailwind's config maps (`hsl(var(--accent-hsl))`).
- Plain CSS that needs Tailwind-facing colors uses `hsl(var(--...))` too — one source of truth.
- **Parity guard:** extend `tools/validate.mjs` (or a small new check) to fail when a Tailwind-referenced `-hsl` var has no matching base var or when ramp steps are missing — so drift becomes a CI failure, not a surprise.

**Constraint (load-bearing):** Tailwind `preflight: false` + `.rn-root` scoping stays. Unify tokens, never the reset.

## 4. Surface specs

### 4.1 Home / course picker (`[locale]/page.tsx`, `styles.css` picker section)

- **Hero:** brand statement + playful visual anchor — emoji/mascot cluster or a stylized "code window" card with the PawWalk 🐾 motif; rounded, layered, course-colored accents. Keep the mono eyebrow.
- **Progress-aware course cards:** each card gets its course hue, big emoji in a tinted rounded tile, title, meta (lessons/modules), plus a progress ring or bar if the user has started that course (read from the course's `storeKey` progress in `localStorage` — client component or hydration-safe read).
- **Practice section:** same card language for RN Practice 🧠 and the Andersen decks, with their own hues.
- **Stats strip:** total lessons, courses, flashcards, challenges — playful counters.
- **Note card:** keep the local-progress privacy note, restyled.

### 4.2 Course shell + sidebar (`learn-shell.tsx`, `sidebar.tsx`, `overall-progress.tsx`)

- **Brand header:** course emoji in a tinted rounded tile + brand title; course-colored.
- **Overall progress:** keep the bar but rounder + animated fill; percent label.
- **Module accordion:** course-hued active states; done ticks in green; emoji tiles.
- **Search:** restyled to match (rounded, soft focus ring).
- **Footer actions:** export/import/reset stay — restyle to secondary/ghost chips.
- **Mobile drawer:** rounded panel, smoother slide, overlay scrim.

### 4.3 Lesson experience (`lesson-page-client.tsx`, `steps/*`, `styles.css` steps section)

- **Crumb rail:** keep mono crumbs; add **step dots** (one per step, filled/current/locked) as a visual progress rail.
- **Step typography:** h3/h4 scale from the new type system; blockquotes as tinted callout cards.
- **Code blocks:** rounded container, course-colored title bar, keep token colors + run button; output panel styled as a terminal card (works for light + dark).
- **Quiz:** rounder choices, course-colored correct state, keep shake on wrong, explain/nudge as styled feedback cards.
- **Exercise:** editor stays, but chrome (toolbar, buttons) gets the new language; feedback banner styled `ok`/`bad`.
- **Xcode checklist:** keep left-rail accent, rounder check items with a satisfying check animation.
- **Continue button:** bold, primary course color; blocked state shows a friendly hint.
- **Completion card:** the 🐾 moment — confetti burst, course-colored card, "next lesson" link (add a next-lesson CTA; compute from module/lesson order).
- **Review page:** restyle the context + stats; same card language.

### 4.4 RN practice (`/reactnative`) + interview decks (`/practice/[spec]`)

- **Shared `FlashcardDeck`:** restyle once, benefits both routes.
  - Deck header with playful title + stats chips.
  - **Flashcard card:** big rounded card, category chip + level badges, flip animation (CSS transform), correct/wrong as friendly primary/secondary buttons with color feedback.
  - Study session controls: Selects, Shuffle, progress counter — restyled to match the new language (Selects are shadcn; theme via tokens).
  - Category progress grid: rounded tiles with the new tokens.
- **Challenges:** list cards get hue tiles per difficulty; detail page restyles the runner output and test result states (pass/fail) with the new color language.
- **Nav:** the `/reactnative` top nav gains the brand treatment; keep the "← PawWalk Academy" link.

## 5. Phases

Each phase is shippable on its own; order is dependency-safe (foundations before surfaces, home before shell, shell before lessons, deck restyle last since it touches shared components).

| # | Phase | Deliverable | Acceptance criteria |
|---|---|---|---|
| 0 | **Foundations** | Token unification (dual var namespace + parity guard), type scale, radius/shadow/motion system, per-course hue map, font loading | No visual regression on any surface; parity check passes; both locales render; `next build` green |
| 1 | **Home / picker** | New hero, per-course cards, practice section, stats strip | Screens at both locales match spec; progress-aware cards read real `localStorage`; responsive down to 360px |
| 2 | **Shell + sidebar** | Brand header, progress, accordion, search, drawer | All shell states (open/closed/done/active) styled; mobile drawer works |
| 3 | **Lesson + steps + review** | Step rail, step components restyle, completion celebration, next-lesson CTA, review page | All 5 step types restyled; gating/reveal logic untouched; lesson completion triggers celebration; no regressions in unit tests |
| 4 | **RN practice + decks** | FlashcardDeck restyle (both routes), challenges list/detail, nav | Deck flip/grade flows work; challenge runner output styled; both routes consistent |
| 5 | **Motion + polish** | Entry animations, progress micro-anims, dark-mode audit, a11y pass, `prefers-reduced-motion` | Dark mode fully readable on every surface; keyboard/screen-reader pass; reduced-motion respected |
| 6 | **Verification** | Full gate suite + visual QA | `pnpm typecheck`, `pnpm lint`, `node tools/validate.mjs`, `node tools/i18n-check.mjs`, `node --test`, `next build` all green; visual QA on exported site, both locales, light + dark |

## 6. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Tailwind reset touching course pages | Keep `preflight: false`; scope everything under `.rn-root` (unchanged, load-bearing) |
| Token drift between the two CSS systems | Shared var namespace + parity guard in the validation suite (Phase 0) |
| i18n breakage | New copy written in both `en`/`es` bundles; `tools/i18n-check.mjs` gate |
| Progress data loss | `storeKey`/`localStorage` keys untouched; read-only access for new progress displays |
| Lesson logic regressions (gating, reveal) | Visual-only changes in Phases 2–3; unit tests + manual walkthrough |
| Static export limits (no server deps, no new runtimes) | Fonts via `next/font`; animations CSS-only; no new packages unless needed |
| Scope creep / giant PR | Slice by phase; each phase lands reviewable |

## 7. Execution

**Recommended: SDD change** — the redesign has real ambiguity per surface (colors, copy, states) that durable proposal/spec/design/tasks materially reduce. Run as one SDD change with phases as task batches:

- `/sdd-new` → proposal (this plan) → spec (per-surface requirements + scenarios) → design (token architecture, component deltas) → tasks (phased, work-unit commits) → apply → verify → archive.
- If forecast exceeds ~400 changed lines, chain PRs per phase (delivery strategy is decided at preflight).

**Alternative:** direct surface-by-surface implementation without SDD artifacts — faster to start, but state decisions in conversation instead of durable specs.

**Decision needed before execution starts:** SDD vs direct; if SDD, the session preflight choices (pace, artifact store, PR strategy, review budget).

## 8. Open questions (resolved during Phase 0 design or proposal)

1. Global primary color: keep violet as the global accent, or move to green/coral with violet demoted to the RN course hue?
2. Display font choice: Baloo 2 vs Fredoka vs Nunito (load-test for size/export).
3. Should the hero include a small illustration (CSS/emoji composition) or stay typographic with a code-window card?
4. Add a next-lesson CTA in the completion card? (Proposed yes.)
5. Dark mode default: keep `prefers-color-scheme`, or add a manual toggle? (Proposed: keep auto, no toggle.)
