# Verify Report: learn-design-v4-polish

**Verdict: PASS** — every requirement verified with real evidence (browser E2E + gates + visual screenshots). Date: 2026-08-21.

## Requirements → Evidence

| Requirement (spec) | Result | Evidence |
|---|---|---|
| RN palette: no duplicate `:root`/`.dark` blocks in reactnative.css; reset uses `var()` | ✅ | File rewritten (token-free, 22 lines); `grep -r 'hsl(var(' apps/learn/src` = **0 matches** |
| `.rn-root` resolves global oklch tokens | ✅ | E2E computed `background-color` of `.rn-root` = `lab(98.26 -0.38 -1.05)` (cool global token, not warm cream) — screenshot `practice-rn.png` |
| Home stats: hairline row, no card boxes, 4-col desktop / 2-col mobile, single accent token | ✅ | DOM classes clean (`py-4 text-center`, no bg-card/border/rounded); computed grid columns **4 @1280px / 2 @390px** — screenshots `home-en.png`, `home-mobile.png` |
| Nav "Courses" → `/#courses`; anchor target exists | ✅ | href attribute = `/#courses`; `#courses` node present on home |
| Nav labels localized via `nav.*` keys en+es (7 keys) | ✅ | ES click renders `Inicio\|Cursos\|Práctica`; i18n-check passes **1226 units parity** |
| Keyboard focus rings preserved | ✅ | `focus-visible:outline-hidden focus-visible:ring-2 ring-primary` kept in header rewrite |
| Non-regression: course pages untouched by preflight; single font family | ✅ | Build prerenders all course routes; body font on course page AND home = Geist stack |
| Gates: typecheck/lint/test/validate/i18n-check/next build | ✅ | tsc clean · lint 0 errors (17 pre-existing warnings) · tests **23/23** · validate all lessons ✓ · i18n ✓ · static export build success (~1490 pages) |

## Defects found & fixed during verification

1. **Hydration mismatch (server "Home" vs client "Inicio")** — exposed by nav localization on practice routes; root cause pre-existing: `I18nProvider` read `localStorage` during first client render. Fixed in `src/lib/i18n.tsx`: hydrate with server locale, restore persisted locale in mount-only effect. Re-run: **12/12 assertions + 0 console errors**.
2. **Serif fallback on home/practice** (visual, caught by screenshot review): excluding Tailwind preflight removed the default `font-family` assignment for non-course routes. Fixed in `globals.css` body rule (`font-family: var(--font-sans)`). Visual confirmation: `home-en-fixed.png` renders Geist.

Both fixes are within the change's non-regression scope.

## Known gaps (follow-ups, not blockers)

- Dark mode is class-based with **no toggle UI** on Tailwind surfaces; `prefers-color-scheme` has no effect there (documented INFO in e2e output).
- Spec prose inconsistency (stats mobile collapse wording) resolved following the normative MUST; tidy specs at archive time.
- `[locale]` plain-CSS picker page duplicates home content with old tokens (out of scope per proposal).

## Verification tooling added

`apps/learn/tools/e2e-verify.mjs` — repeatable Playwright screen auditor (system Chrome, 12 assertions, screenshots to `$SHOTS_DIR`). Part of the standing improvement loop; run against any dev server via `BASE_URL`.
