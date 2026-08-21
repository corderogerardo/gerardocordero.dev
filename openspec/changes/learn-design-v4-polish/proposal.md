# Proposal: learn design v4 polish (Batch C + verification)

## Why

The apps/learn design audit (Engram `apps-learn/design-audit-2026-08`) and Batches A–B left three open items: (1) `reactnative.css` still duplicates the design-token palette as an HSL block, drifting from the single-source oklch tokens in `globals.css` (primary hue 245° vs 262°, muted-foreground 45% vs 52%, radius .625 vs .75rem) and producing a visible two-tone split — global-token header above a warm-canvas `.rn-root` body on every practice page; (2) the home page is card-on-card monotony (hero card → stats cards → tiles → course cards are all bordered rounded boxes); (3) the header "Courses" link targets one specific course (`/en/learn/ios`) with hardcoded English labels.

## What Changes

1. **RN palette unification** — delete the duplicate `:root`/`.dark` token blocks in `reactnative.css`; `.rn-root` inherits global oklch vars. Keep only the scoped reset.
2. **Home visual polish** — stats grid becomes a hairline-divided row; single accent discipline; hero card stays the sole elevated container; dark-mode parity verified.
3. **Header nav fix** — "Courses" points to `/#courses`; all nav labels localized.
4. **Verification** — full gate run including the deferred `next build` static export (~1490 pages).

## Scope

**In:** files below; i18n keys `nav.home`, `nav.courses`, `nav.practice`, `nav.flashcards`, `nav.challenges`, `nav.open_menu`, `nav.close_menu` (en+es).
**Out:** `[locale]` plain-CSS picker page, CoursesGrid/SceneTiles redesign, new dependencies, prep-kit apps.

## Approach & risk per item

| Item | Approach | Risk / mitigation |
|---|---|---|
| a. RN palette | Remove ~46 duplicated lines; keep `.rn-root` reset but switch its `hsl(var(--border))` to `var(--border)`. Chosen over "keep scoped values aligned": referencing globals removes the second source of truth that already drifted; visual delta is a deliberate warm→cool canvas alignment matching the rest of the Tailwind surfaces. | Medium: raw `hsl(var(--…))` usages inside practice components break. Mitigation: repo-wide grep sweep before build. |
| b. Home stats | Replace 4 bordered cards with `grid grid-cols-2 sm:grid-cols-4` + internal hairline dividers (`divide-y sm:divide-y-0 sm:divide-x divide-border`); explicit <768px collapse. Stat numbers use one token (`text-primary`) matching CTA accent lock. | Low: CSS-only; verify mobile 2-col divider edges and dark mode on `/`. |
| c. Nav | `href: '/en/learn/ios'` → `'/'#courses'` (static-export-safe anchor; add `id="courses"` + `scroll-mt-*` on HomePageClient courses section). Labels via `useI18n().t()` with new keys. Anchor href never matches `isActive` — acceptable (no active state for an index anchor). | Low: two TSX edits + JSON keys; `i18n-check.mjs` enforces en/es parity. |
| d. Verification | See plan below. | Build cost ~minutes; cached after first run. |

## Impact

| Area | Change |
|---|---|
| `apps/learn/src/app/reactnative/reactnative.css` | Token blocks removed; reset retargeted to `var()` |
| `apps/learn/src/components/HomePageClient.tsx` | Stats row restyle; accent token; `id="courses"` |
| `apps/learn/src/components/site-header.tsx` | Nav hrefs + localized labels/aria-labels |
| `apps/learn/src/locales/{en,es}.json` | 7 new `nav.*` keys each |

Surfaces: `/` (home), `/practice/reactnative*` (palette), header on all learn routes.

## Verification plan

1. `pnpm typecheck && pnpm lint && pnpm test`
2. `node tools/validate.mjs` · `node tools/i18n-check.mjs` · `node --test`
3. Grep sweep: no `hsl(var(` left in practice components
4. `next build` (deferred static export) from `apps/learn`
5. Dark/light parity spot-check on `/` and `/practice/reactnative`

## Follow-ups

**Standing design-improvement loop:** re-run the audit checklist quarterly or after any home/practice surface change — contrast AA both modes; card-vs-divider hierarchy (cards only where elevation means something); ≤1 eyebrow per 3 sections; one accent color locked per surface; one corner-radius scale; hero fits viewport, nav single line at desktop. Gates = the five commands above; findings recorded as GitHub issues (`ready-for-agent` label) plus Engram topic `apps-learn/design-audit-*`.

## Capabilities

New: None · Modified: None (styling/config change; no spec-level behavior contracts).
