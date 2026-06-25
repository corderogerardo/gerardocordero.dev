# template-prep

A ready-to-fork starter for an on-device, spaced-repetition **study site**, built
on [`@gerardocordero/prep-kit`](../../packages/prep-kit). It's how `ios-prep`,
`android-prep`, and `reactnative-prep` are built — minus the content.

Everything interactive (flashcards + SM-2-lite scheduling, a quiz, practice
prompts, on-device AI hybrid search, an on-device AI tutor, a daily streak, and
local progress export/import) comes from the kit. You supply the content and one
config object.

## Make it your own

1. **`src/prep.config.ts`** — brand strings, a **unique** `storagePrefix` (the
   localStorage namespace; must differ per deployed origin), `appId`, and the AI
   tutor's subject framing.
2. **`src/data/*`** — replace the sample arrays:
   - `flashcards.ts` — `Flashcard[]` + `FLASHCARD_FILTERS`
   - `prompts.ts` — `Prompt[]` (coding / design)
   - `quiz.ts` — `QuizQuestion[]` + `QUIZ_FILTERS`
   - `progress.ts` — `ChecklistGroup[]`
   - `all.ts` — the single aggregation point the pages/search read from
   - Card ids must be globally unique — prefix `"<subject>-<category>-N"`.
3. **`src/lib/nav.ts`** — your routes (header, mobile menu, and overview cards read it).
4. **`src/lib/levels.ts`** — map your categories to default seniority levels.

Add a route by dropping a `src/app/<route>/page.tsx` that imports a kit component
and passes data as props (see `flashcards/page.tsx`). Long-form content? Add
`src/data/study.ts` and spread it into `ALL_STUDY` so `/search` indexes it too.

## Develop

```bash
pnpm --filter @gerardocordero/template-prep dev        # next dev
pnpm --filter @gerardocordero/template-prep typecheck  # tsc --noEmit
pnpm --filter @gerardocordero/template-prep lint        # eslint
pnpm --filter @gerardocordero/template-prep build       # static export -> out/
```

## Notes

- **Static export** (`output: "export"`) → deploys as plain assets (e.g. Cloudflare
  Pages). The `deploy` script targets a `template-prep` Pages project; it is **not**
  wired into CI — this app is a scaffold, not a published site.
- Theme lives in `src/app/globals.css` + `tailwind.config.ts` (CSS-variable colors:
  `bg / surface / accent / good / warn / …`). The kit uses those class names, and
  `tailwind.config.ts` already scans the kit source so its classes aren't purged.
- Everything is **on-device**. Nothing is uploaded.
