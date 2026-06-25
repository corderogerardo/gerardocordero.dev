# prep-kit migration plan

Goal: kill the copy-paste drift across the three `*-prep` study sites (the bug
where the "Known/Solved today" fix landed in 2 of 3 apps) by extracting the
shared study engine into `@gerardocordero/prep-kit`, and stand up
`apps/template-prep` as the canonical scaffold for any new subject.

## Architecture

- **`packages/prep-kit`** — 14 components + lib (srs, streak, html, chrome-ai,
  use-local-storage, levels, plain-text) + content `types` + a React
  `PrepProvider`/`usePrepConfig`/`usePersisted` context.
- Components are generic and **prop-driven**. Only `daily-session` + `search-view`
  read aggregated content, which they pull from `usePrepConfig().content`.
- Per-app difference collapses to **one `PrepConfig`**: `storagePrefix`, `appId`,
  `brand`, `ai`, `nav`, `content`. Storage keys stay identical
  (`usePersisted("srs")` in the iOS app → `"iosprep:srs"`).
- Each app keeps `src/data/*` (content), `lib/levels.ts` (resolveLevel +
  per-subject category→level map), `lib/nav.ts` (nav content), `globals.css` +
  `tailwind.config.ts` (theme). Types are structurally compatible, so app `data/`
  files need **no** changes.

## Per-app migration (identical for all three)

1. `package.json`: add `"@gerardocordero/prep-kit": "workspace:*"`.
2. `next.config.ts`: add `transpilePackages: ["@gerardocordero/prep-kit"]`.
3. `tsconfig.json`: add path `"@gerardocordero/prep-kit": ["../../packages/prep-kit/src/index.ts"]`.
4. `tailwind.config.ts`: add `"../../packages/prep-kit/src/**/*.{ts,tsx}"` to `content`.
5. Add `src/prep.config.ts` (brand, ai, nav, content) + wrap `layout.tsx` in `<PrepProvider>`.
6. Rewrite page imports: `@/components/*` and `@/lib/html` → `@gerardocordero/prep-kit`.
7. Delete `src/components/*` (all 14) + `src/lib/{srs,streak,html,chrome-ai,use-local-storage}.ts`.
8. `pnpm --filter @gerardocordero/<app> typecheck && lint` must be green.

## Checklist

- [x] Fix the immediate `Known 0/12` bug in ios-prep (port from android).
- [x] Build `packages/prep-kit` (components + lib + config + types + barrel).
- [x] Migrate `apps/ios-prep` → green (typecheck + lint + static build, 14 routes).
- [x] Migrate `apps/android-prep` → green.
- [x] Migrate `apps/reactnative-prep` → green.
- [x] Composition-pattern win: bulk content is route-scoped props, not global context.
- [x] `apps/template-prep` — canonical scaffold on prep-kit (7 interactive routes, sample data) → green.
- [x] Full monorepo loop green: typecheck 5/5, lint 5/5, portfolio test 34/34.
- [x] Global skill (`shared-kit-extraction`) + memory (`prep-apps-framework`).
- [x] shadcn primitive layer in the kit: `cn` + CVA `Button`/`Badge` + `Card`/`Input` +
      a shared `Chip` + `components.json`. Chip deduped across 3 decks; template-prep
      showcases `Button`/`Card`. Live apps inherit it, visuals unchanged.
- [ ] OPTIONAL: full shadcn re-theme of the 3 live deployed apps (a deliberate, larger
      visual change — not bundled with the structural work).
