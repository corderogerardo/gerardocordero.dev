# Archive Report: learn-design-v4-polish

**Closed: 2026-08-21 · Verdict: PASS · All 9 tasks completed.**

## Final state at close

- RN practice palette fully unified with global oklch tokens; `reactnative.css` is token-free (reset only); zero raw `hsl(var(…))` repo-wide.
- Home stats are a hairline-divided row (4-col desktop / 2-col mobile); hero card is the sole elevated container.
- Header nav: Courses → `/#courses` anchor with `id="courses"` target; all labels + menu aria-labels localized via 7 new `nav.*` keys (en/es parity enforced).
- Two verification-caught defects fixed inside this change: i18n hydration mismatch (`I18nProvider` now hydrates server locale + mount-effect restore) and serif fallback on non-course routes (`body { font-family: var(--font-sans) }` in globals.css).
- Gates at close: tsc clean · eslint 0 errors · tests 23/23 · validate.mjs ✓ · i18n-check 1226 ✓ · E2E 12/12 with 0 console errors · `next build` static export success (~1490 pages).

## Artifacts

- proposal.md · specs/*.md (4) · design.md · tasks.md · verify-report.md — all under this directory; Engram mirrors under topic keys `sdd/learn-design-v4-polish/*`.
- Verification tooling added to the standing loop: `apps/learn/tools/e2e-verify.mjs`.

## Follow-ups (recorded, not blocking)

1. Dark-mode toggle for Tailwind surfaces (class-based today; prefers-color-scheme inert there).
2. `[locale]` plain-CSS picker page still duplicates home content with legacy tokens.
3. Tidy spec prose (stats mobile-collapse wording) superseded by normative MUST during execution.
