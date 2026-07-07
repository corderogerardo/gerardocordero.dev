## i18n Bilingual Support — Status

### Goal
Make the learn app and 4 prep-study apps bilingual (English/Spanish) with locale routing, UI translations, and content scaffolding.

### Done

#### Learn App (apps/learn)
- ✅ `[locale]` routing: pages under `app/[locale]/learn/[course]/...`
- ✅ Language picker at `/`
- ✅ `generateStaticParams` for `en` + `es` on all page groups
- ✅ `src/lib/i18n-config.ts` (server-safe constants)
- ✅ `src/lib/i18n.tsx` (I18nProvider + useI18n hook with param replacement)
- ✅ `src/locales/en.json` (40 UI keys covering sidebar, steps, review, map, search)
- ✅ `src/locales/es.json` (40 UI keys, fully translated)
- ✅ All 11 UI components use `t()` instead of hardcoded strings
- ✅ Build-data reads locale-specific lesson dirs (`lessons-es/`, etc.) falling back to English
- ✅ Language switcher in sidebar
- ✅ Scaffolding script (`scripts/scaffold-es.mjs`) for Spanish lesson content
- ✅ Build produces 971 static pages (1 root + 2 locale pickers + 484 en + 484 es)
- ✅ Typecheck passes, build succeeds

#### Prep-Kit (packages/prep-kit) — Shared Study Engine
- ✅ `src/lib/i18n-config.ts` — `Locale` type, locale constants
- ✅ `src/lib/i18n.tsx` — `I18nProvider` + `useI18n().t()` hook (same pattern as learn app)
- ✅ `src/locales/en.json` — 100+ UI keys covering every component
- ✅ `src/locales/es.json` — full Spanish translations
- ✅ Exported from `src/index.ts`
- ✅ `levels.ts` — `LEVELS` entries carry `localeKey` field; `LEVEL_LABEL` values are locale keys
- ✅ `srs.ts` — `GRADES` use `localeKey` instead of `label`; `nextLabel` returns `{key, params}` pair

#### Prep-Kit Components (all use `t()` now)
- ✅ `site-header.tsx` — nav toggle aria-label
- ✅ `flashcard-deck.tsx` — all strings (level, filters, due, shuffle, hint, grade labels, AI, etc.)
- ✅ `quiz.tsx` — score, unanswered, reset, correct/wrong, Q labels
- ✅ `prompt-deck.tsx` — kind filters, level, due, solve/revisit labels
- ✅ `daily-session.tsx` — streak, cards due, done button, no-cards message, section titles
- ✅ `progress-checklist.tsx` — completion stats, reset button
- ✅ `progress-tools.tsx` — title, body, export/import buttons, messages
- ✅ `search-view.tsx` — placeholder, AI enable, loading/hybrid/error states, results count
- ✅ `ai-tutor.tsx` — checking, unavailable, preset labels, busy/ask states, error
- ✅ `teleprompter.tsx` — close, play/pause, reset, slower/faster, A−/A+, hint
- ✅ `pitches.tsx` — teleprompter button

#### Prep App Layouts (all 4)
- ✅ `apps/nextjs-prep/src/app/layout.tsx` — I18nProvider added (hardcoded `locale="en"`)
- ✅ `apps/ios-prep/src/app/layout.tsx` — I18nProvider added
- ✅ `apps/android-prep/src/app/layout.tsx` — I18nProvider added
- ✅ `apps/nest-prep/src/app/layout.tsx` — I18nProvider added

#### Conversion Script
- ✅ `scripts/bilingualify-prep.mjs` — automated tool to convert any prep app to `[locale]` routing
  - Moves pages under `[locale]/`, creates locale picker root page, adds `generateStaticParams`, creates Spanish content stubs

#### Verification
- ✅ `pnpm typecheck` — all 14 packages pass
- ✅ `pnpm lint` — portfolio passes (learn app has pre-existing ESLint config issue)
- ✅ `pnpm test` — 5 test suites, 34 tests pass
- ✅ Learn app build — 971 static pages

### Language Switchers
- ✅ **Learn app**: `LanguageSwitcher` component in sidebar footer — styled accent pill, uses `<Link>` for client-side nav. CSS added to `styles.css` (`.lang-switch`). Switches between `/en/...` and `/es/...` paths.
- ✅ **Prep-kit SiteHeader**: Language toggle pill in the desktop nav (shows "ES" or "EN") + mobile menu link. Uses the current locale from `useI18n()` to compute the opposite locale path.

### Next Steps (manual, per app)
1. **Run the conversion script**: `node scripts/bilingualify-prep.mjs apps/nextjs-prep`
2. **Translate content data** in `src/data/*.es.ts` files (flashcard Q&A, prompts, quiz questions, etc.)
3. **Update page files** to import locale-appropriate data based on locale param
4. **Repeat** for ios-prep, android-prep, nest-prep
5. **Deploy** — each prep app on its own subdomain, generating both /en and /es paths

### Architecture
```
apps/*-prep/src/app/
├── page.tsx                  ← locale picker (English / Español)
├── layout.tsx                ← root (fonts + CSS only)
├── globals.css
├── rich.css
└── [locale]/
    ├── layout.tsx            ← I18nProvider + PrepProvider + SiteHeader + SiteFooter
    ├── page.tsx              ← home (locale-aware)
    ├── flashcards/page.tsx   ← locale param, locale-aware data
    ├── quiz/page.tsx
    └── ...
```
