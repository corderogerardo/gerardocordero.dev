# Design: learn design v4 polish (Batch C)

## Technical Approach

Four independent, low-risk edits verified by the standing learn gates plus the deferred static build.

### 1. RN palette unification (`src/app/reactnative/reactnative.css`)

**Keep:** the file header comment, `@reference "../globals.css";`, and the second `@layer base { .rn-root, .rn-root * {...} .rn-root {...} }` block.
**Delete:** the entire first `@layer base` containing `:root {…}` and `.dark {…}` (~lines 7–54).
**Edit:** line 63 `border-color: hsl(var(--border));` → `border-color: var(--border);`.

- **Why delete vs align:** globals.css tokens are oklch strings (`--primary: oklch(0.55 0.2 262)`), not HSL triples — `hsl(var(--x))` functional wrapping would produce invalid CSS if kept. Inheriting removes the drifted second source of truth (245°→262° hue, `.625rem`→`.75rem` radius) at zero runtime cost.
- **Why `@reference` stays:** reactnative.css has no Tailwind entry of its own; `@reference` gives the `@apply bg-background text-foreground` access to the global theme without re-emitting layers or touching preflight-excluded course pages. Deleting it breaks the `@apply`.
- **Migration sweep:** repo-wide grep confirmed exactly **one** raw `hsl(var(--` usage in `apps/learn/src` (reactnative.css:63). No TSX component uses inline `hsl(var(...))` styles — nothing else to migrate. Visual delta (warm→cool canvas on `/practice/reactnative*`) is intentional per spec.
- Dark mode: `.rn-root` pages inherit the global `.dark` cascade via `@custom-variant dark (&:is(.dark *))` — no scoped dark block needed.

### 2. Home stats hairline row (`src/components/HomePageClient.tsx`, lines 93–111)

Replace the container classes with `mt-12 grid grid-cols-2 gap-3 divide-y divide-border sm:grid-cols-4 sm:divide-y-0 sm:divide-x` (note: `gap-3` retained; `divide-*` draws hairlines between items). Strip each stat item's `rounded-2xl border border-border bg-card p-4` → plain `py-4 text-center` (padding moves from box to item so divider spacing reads correctly; `p-4` removal is mandated by spec). Stat numbers keep `text-accent` — the spec mandates `text-accent` as the single accent token (proposal's `text-primary` mention is superseded by the spec delta; current markup already complies). Hero card remains the sole elevated container.

### 3. Header nav fix (`src/components/site-header.tsx`)

- Module-level arrays become label-key maps inside the component (or keep arrays with `labelKey` field): `{ href: '/#courses', labelKey: 'nav.courses' }`; render `t(item.labelKey)` in both desktop and mobile nav loops.
- `navItems[0]`: `href: '/'`, `labelKey: 'nav.home'`; `[2]`: `'/practice'`, `'nav.practice'`. `reactNativeItems`: `'nav.flashcards'`, `'nav.challenges'`.
- Mobile menu button `aria-label`: `t(open ? 'nav.close_menu' : 'nav.open_menu')` replacing hardcoded English.
- `isActive('/#courses')`: falls into the generic branch — `pathname === '/#courses' || pathname.startsWith('/#courses/')` never matches a real pathname → no active state, as accepted. No logic change needed.
- Focus rings untouched (`focus-visible:ring-primary` preserved).

### 4. Anchor target (`HomePageClient.tsx`, courses section ~line 114)

Add `id="courses"` + `scroll-mt-20` to the `<section className="mt-12 space-y-4">` element. No other structural change; CoursesGrid untouched (out of scope).

## Component impact map

| File | Change | Est. lines |
|---|---|---|
| `apps/learn/src/app/reactnative/reactnative.css` | Delete dup token blocks; retarget reset | −46 net |
| `apps/learn/src/components/HomePageClient.tsx` | Stats restyle; `id="courses"` + `scroll-mt-20` | ~10 mod |
| `apps/learn/src/components/site-header.tsx` | hrefs + `labelKey`/`t()` labels + aria | ~15 mod |
| `apps/learn/src/locales/en.json` / `es.json` | 7 `nav.*` keys each | +8 each |

No new components (design gate: all edits fit existing units; no fragmentation).

## i18n key table

| Key | en | es |
|---|---|---|
| `nav.home` | Home | Academy |
| `nav.courses` | Courses | Cursos |
| `nav.practice` | Practice | Práctica |
| `nav.flashcards` | Flashcards | Flashcards |
| `nav.challenges` | Challenges | Retos |
| `nav.open_menu` | Menu | Menú abierto |
| `nav.close_menu` | Close | Menú cerrado |

Insert after `"app.lang.es"` line to keep parity ordering; `i18n-check.mjs` enforces en/es key parity.

## Verification strategy

| Scenario / gate | Command or step |
|---|---|
| Types/lint/unit loop | `pnpm typecheck && pnpm lint && pnpm test` |
| Lesson content validator | `node tools/validate.mjs` (apps/learn) |
| i18n en/es parity (spec: i18n-keys) | `node tools/i18n-check.mjs` |
| Validator unit tests | `node --test` |
| Static export (~1490 pages) | `pnpm --filter @gerardocordero/learn exec next build` |
| No residual raw HSL tokens (spec: rn-palette) | grep sweep: zero `hsl(var(` matches under apps/learn/src |
| Warm→cool canvas, reset-only CSS | dev server :3100 → inspect `/practice/reactnative` computed `background-color` = oklch cool hue; light+dark toggle |
| Hairline stats mobile (<768px) | :3100 `/` narrow viewport → single column? Spec says grid-cols-2 base with `divide-y`; verify 2-col mobile with vertical dividers, 4-col + `sm:divide-x` at ≥768px |
| Dark mode parity | :3100 `/` dark toggle → dividers visible via `divide-border`, no card shadows |
| Nav href + localized labels | :3100 `/` click Courses → lands at `/#courses` scrolled below sticky header; switch ES → labels "Academy/Cursos/Práctica", aria-labels Spanish |
| Anchor inactive state | On `/`, confirm Courses link lacks `bg-primary text-primary-foreground` |

Note on spec/base-grid mismatch: home-stats.md prose says "single column below 768px" but its normative clause mandates `grid-cols-2 … sm:grid-cols-4`. Design follows the normative MUST (2-col mobile).

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Risks & rollback

| Risk | Mitigation / rollback |
|---|---|
| Practice-page palette shift surprises users | Deliberate per proposal; revert = restore deleted blocks from git history (single commit) |
| Hidden `hsl(var(` consumer outside src (e.g., public/) | Grep sweep covers src; extend sweep to whole app dir before build if build fails |
| `divide-*` + `gap` double-spacing artifacts | Spot-check at :3100; drop `gap-3` if dividers look doubled |
| Build cost | One-time ~minutes; Turbo/EAS cache afterwards |
| Rollback | All four edits are independent files — revert individually without cross-impact |

No migration, no new deps, no feature flags.
