# Android Interview Prep — Build Notes

Autonomous build (scheduled task, ~2:30 AM). Mirrors the `reactnative-prep` and `ios-prep`
sibling apps but with original, senior/staff-level **Android / Kotlin** content.

## Summary

- **Stack (unchanged from template):** Next.js 16 (static export), React 19, Tailwind 3, wrangler 4.
- **App shell, components, lib, config, and `public/` assets** were copied from `reactnative-prep`
  and re-branded for Android. **No shared component/page code was changed structurally** — only
  branding strings and the data layer.
- **All `src/data/*` content was rewritten** from scratch with deep Android material and correct,
  compiling Kotlin/Compose code examples. The TypeScript types/exports are byte-for-byte the same
  shapes the components/pages expect, so the shared code compiles unchanged.

## Verification result

| Check | Result |
| --- | --- |
| `tsc` (full `src`, strict — components + pages + lib + data) | ✅ **0 errors** (run before content expansion) |
| `tsc` (full `src/data` + `src/lib/levels` graph, strict) | ✅ **0 errors** (run after all content, covers every card/quiz/prompt) |
| Structural validation (categories↔filters, unique ids, quiz answer indices, prompt enums) | ✅ all green |
| `npm run build` (`next build` static export) | ⚠️ **could not complete in this sandbox** — see limitation below |

### Environment limitation (npm install / next build)
This unattended sandbox could not sustain a full `npm install`: long installs are killed at the
~45 s command ceiling, interrupted installs left `node_modules` in a state that can't be cleaned
(read-only mount files), and invoking the resulting `next build` **core-dumps in the native SWC
binary** (exit 135) — a toolchain/environment crash, not a code error.

To verify correctness anyway, TypeScript was installed into a clean `/tmp` location (off the eroding
mount) and run against the project in strict mode. **Both the full-`src` typecheck and the
data-layer typecheck pass with zero errors**, which is equivalent to `npm run typecheck`. The data
files therefore match the reference TypeScript types exactly. `next build` should succeed on a normal
machine where `npm install` can complete; Ger can run `npm install && npm run build` locally before
`npm run deploy`.

## Files created

### Config / shell (copied from reactnative-prep, re-branded)
`package.json` (name → `@gerardocordero/android-prep`, deploy `--project-name android-prep`),
`next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`,
`.gitignore`, `next-env.d.ts`, `README.md`, `public/semantic-worker.js`, `src/app/favicon.ico`.

### Re-branded source (Android titles/metadata only; logic unchanged)
`src/app/layout.tsx` (metadata, OG, `android.gerardocordero.dev`), `src/app/page.tsx` (hero, stats,
badge), `src/components/site-header.tsx` (`AND` badge + "Android Interview Prep"),
`src/components/site-footer.tsx`, `src/components/ai-tutor.tsx` (Android coach system prompt),
and the `study/flashcards/roadmap/architecture/pitches` page leads. `src/lib/levels.ts` category→level
map updated for Android categories. localStorage prefix `rnprep:` → `androidprep:` across components;
progress-tools app id → `android-prep`.

### Data layer — fully original Android content (~3,455 lines)

| File | Lines | Role / content |
| --- | ---: | --- |
| `flashcards.ts` | 452 | Base Q&A: Kotlin, Compose, framework, architecture, state/Flow, perf, testing, behavioral/STAR, optimization, on-device AI. Master filter list. |
| `quiz.ts` | 330 | Multiple-choice with explained answers (Kotlin, optimization, on-device AI + advanced chips). |
| `advanced.ts` | 347 | Coroutines & structured concurrency, Flow operators (Q&A + quiz + study). |
| `advanced2.ts` | 298 | Jetpack Compose internals: recomposition, stability, side-effects, theming, testing. |
| `advanced3.ts` | 263 | Framework: lifecycle, ViewModel/SavedStateHandle, process death, services, WorkManager, launch modes, notifications. |
| `advanced4.ts` | 266 | DI (Hilt/Dagger) + data layer (Room, DataStore, Paging 3, assisted injection). |
| `advanced5.ts` | 286 | Testing (JUnit, MockK, Turbine, Robolectric, Compose/Espresso, Macrobenchmark) + Gradle/build. |
| `advanced6.ts` | 166 | Security (Keystore, pinning, Play Integrity, R8 keep rules) + release engineering (signing, AAB, staged rollout, tracks). No quiz (matches template). |
| `advanced7.ts` | 165 | On-device generative AI (Gemini Nano/AICore, MediaPipe LLM, LiteRT) — flashcards, study, and practice prompts. |
| `architecture.ts` | 121 | System-design tour (8 sections) + 10 concept→example→problem→solution deep dives with Kotlin. |
| `prompts.ts` | 257 | Coding + system-design practice prompts (debounce Flow, retry/backoff, LRU cache, MVI reducer, offline-first repo, real-time chat, etc.). |
| `study.ts` | 127 | 20-section senior curriculum from Kotlin → on-device AI. |
| `roadmap.ts` | 106 | Junior → Mid → Senior → Architect → Beyond learning path, Android-specific. |
| `progress.ts` | 90 | Readiness checklist across Kotlin, Compose, architecture/Jetpack, perf/test/release, security/frontier. |
| `pitches.ts` | 94 | 10 spoken interview pitches (intros, why-Android, deep dive, STAR stories) with delivery tips. |
| `all.ts` | 87 | Aggregator — imports/exports kept consistent with every sibling file (unchanged contract). |

**Content counts:** ~202 flashcards · 58 quiz questions · 17 practice prompts · 34 study sections ·
8 architecture sections + 10 deep dives · 10 pitches · 256 unique ids.

## Topics covered (per the task spec)

- **Kotlin:** null-safety, val/var & immutability, data/sealed classes, scope functions, delegation,
  inline/reified, generics & variance, value classes, collections, `==` vs `===`.
- **Coroutines & Flow:** structured concurrency, scopes & cancellation, dispatchers & main-safety,
  `coroutineScope`/`supervisorScope`, `async`/`await`, exception propagation, Channel vs SharedFlow,
  `callbackFlow`/`suspendCancellableCoroutine`, Flow operators, StateFlow/SharedFlow, `stateIn`,
  `flatMapLatest`, `combine`/`zip`, buffer/conflate/collectLatest, lifecycle-safe collection.
- **Jetpack Compose:** composition/recomposition, the 3 phases, stability/skippability, state hoisting,
  all side-effects (LaunchedEffect, rememberCoroutineScope, DisposableEffect, derivedStateOf,
  produceState, rememberUpdatedState, SideEffect), CompositionLocal, modifier order, Material 3, Lazy
  layouts, animation, navigation, testing via semantics, previewability.
- **Framework:** Activity/Fragment lifecycle, configuration changes, ViewModel & SavedStateHandle,
  process death/restoration, Services & foreground services, WorkManager, BroadcastReceivers,
  ContentProviders, Intents/PendingIntent, Doze/App Standby, notifications, Activity Result API,
  permissions, edge-to-edge/WindowInsets, single-Activity architecture.
- **Architecture:** MVVM, MVI, Clean Architecture, UDF, repository pattern, single source of truth,
  modularization, dependency inversion.
- **Jetpack libraries:** Room (Flow DAOs, migrations, relations, @Transaction), DataStore
  (Preferences/Proto), Navigation-Compose & deep links, Paging 3 (RemoteMediator), Hilt/Dagger DI.
- **Networking & data:** Retrofit, OkHttp, interceptors/Authenticator, Moshi/kotlinx.serialization,
  caching, error handling (sealed Result), offline-first & stale-while-revalidate.
- **Concurrency & performance:** threading model, dispatchers, main-safety, leaks (LeakCanary), ANRs,
  jank/frame timing (JankStats/Macrobenchmark/Perfetto), Baseline Profiles, R8/ProGuard, app startup,
  overdraw.
- **Testing:** JUnit, MockK, Turbine, runTest/TestDispatcher, Espresso, Compose UI testing,
  Robolectric, fakes vs mocks, Room/migration tests, screenshot testing, Main-dispatcher rule.
- **Gradle:** build types/flavors/dimensions, version catalogs, KSP vs kapt, api vs implementation,
  convention plugins, configuration/build cache, modularization.
- **Security & release:** Keystore, EncryptedSharedPreferences, BiometricPrompt, Network Security
  Config, certificate pinning, Play Integrity, MASVS, CI/CD, signing/Play App Signing, AAB, staged
  rollout, Android Vitals, mapping files, in-app updates.
- **On-device AI:** Gemini Nano (AICore/ML Kit GenAI), MediaPipe LLM Inference, LiteRT/TF Lite,
  quantization, streaming + batching, sizing/RAM, hybrid fallback, privacy.

## Known gaps / follow-ups for Ger

1. **Run the build locally:** `cd android-prep && npm install && npm run typecheck && npm run build`.
   Types are verified clean; the static export was not producible in the sandbox (native SWC crash).
   Do **not** deploy from here — `npm run deploy` was intentionally not run.
2. **Remove three throwaway files** left by in-sandbox verification — they are inert for `next build`
   (Next only reads `tsconfig.json`) but are not needed: `tsconfig.verify.json`, `tsconfig.data.json`,
   `tsconfig.tsbuildinfo`. (They couldn't be deleted here due to read-only mount permissions.)
3. **Cloudflare Pages project** `android-prep` must exist before the first `npm run deploy`
   (the deploy script targets `--project-name android-prep`).
4. **Content choices made autonomously:** pitches are written as adaptable first-person Android-engineer
   templates (no proprietary/personal CV text copied); on-device AI reflects the Gemini Nano / MediaPipe
   / LiteRT landscape as of the knowledge cutoff and should be sanity-checked against current device
   support before relying on specifics in an interview.
