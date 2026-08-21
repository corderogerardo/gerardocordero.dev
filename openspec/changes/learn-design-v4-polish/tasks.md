# Tasks: learn design v4 polish

Implementation tasks derived from `design.md`. STRICT TDD project mode: every task's acceptance is a command or a browser assertion, never a claim.

## Work unit A — RN palette unification
- [x] 1.1 Delete the duplicated `:root {…}` / `.dark {…}` token blocks from `apps/learn/src/app/reactnative/reactnative.css` (~lines 7–54). Keep header comment, `@reference "../globals.css";`, and the `.rn-root` reset block.
  - Acceptance: file contains no token definitions; `grep -r 'hsl(var(' apps/learn/src` → 0 matches.
- [x] 1.2 In `.rn-root` reset, change `border-color: hsl(var(--border));` → `border-color: var(--border);`.
  - Acceptance: same grep stays 0; `/practice/reactnative` renders 200 with cool-canvas background.

## Work unit B — Home stats hairline row + anchor target
- [x] 2.1 Replace the 4 bordered stat cards in `HomePageClient.tsx` with a hairline row: container `mt-12 grid grid-cols-2 gap-3 divide-y divide-border sm:grid-cols-4 sm:divide-y-0 sm:divide-x`; items lose `rounded-2xl border border-border bg-card p-4`, gain `py-4 text-center`; numbers keep `text-accent`.
  - Acceptance: no `bg-card`/`border-border` on stat items; dividers visible light+dark at :3100.
- [x] 2.2 Add `id="courses"` + `scroll-mt-20` to the courses `<section>` in `HomePageClient.tsx`.
  - Acceptance: rendered home HTML contains `id="courses"`.

## Work unit C — Header nav localization + anchor href
- [x] 3.1 `site-header.tsx`: nav arrays carry `labelKey`; render `t(item.labelKey)` in desktop + mobile loops; "Courses" href → `/#courses`; mobile menu button aria-labels use `t('nav.open_menu'/'nav.close_menu')`.
  - Acceptance: typecheck passes; no hardcoded English nav strings remain in the component.
- [x] 3.2 Add keys to `src/locales/en.json` and `src/locales/es.json`: `nav.home`, `nav.courses`, `nav.practice`, `nav.flashcards`, `nav.challenges`, `nav.open_menu`, `nav.close_menu`.
  - Acceptance: `node tools/i18n-check.mjs` passes (1226+ units parity).

## Work unit D — Verification & build
- [x] 4.1 Gates: `pnpm --filter @gerardocordero/learn typecheck && lint && test`; `node tools/validate.mjs`; `node tools/i18n-check.mjs`.
- [x] 4.2 Browser E2E verification (Playwright MCP) per screen with screenshots: `/` (EN light/dark), `/` ES labels, `/practice/reactnative` palette check, `/practice/reactnative/challenges`, `/en/learn/ios` course page intact, narrow-viewport stats row.
- [x] 4.3 `next build` static export passes (~1490 pages).

## Review Workload Forecast
Estimated changed lines: ~90 · Risk: low · Chained PRs recommended: **No** · 800-line budget risk: **Low** · Decision needed before apply: **No**
