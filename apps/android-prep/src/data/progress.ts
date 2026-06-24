// Android readiness checklist. Typed modules are the source of truth — edit directly.
export type ChecklistItem = { id: string; label: string };
export type ChecklistGroup = { title: string; items: ChecklistItem[] };

export const PROGRESS_INTRO = "A checklist across every area a senior/staff Android interview covers, plus your study topics. Tick items as you feel solid on them — progress is saved in this browser.";

export const CHECKLIST_GROUPS: ChecklistGroup[] = [
  {
    "title": "🎥 Pitches recorded & reviewed",
    "items": [
      { "id": "p-01", "label": "01 · 30-second intro" },
      { "id": "p-02", "label": "02 · 60-second intro" },
      { "id": "p-03", "label": "03 · 2-minute career story" },
      { "id": "p-04", "label": "04 · Why Android / Kotlin" },
      { "id": "p-05", "label": "05 · Why this company" },
      { "id": "p-06", "label": "06 · Hardest technical project deep-dive" },
      { "id": "p-07", "label": "07 · STAR · performance/jank bug" },
      { "id": "p-08", "label": "08 · STAR · ownership of a release" },
      { "id": "p-09", "label": "09 · STAR · adaptability / ramp-up" },
      { "id": "p-10", "label": "10 · Closing + questions to ask" }
    ]
  },
  {
    "title": "⚙️ Kotlin & coroutines mastery",
    "items": [
      { "id": "t-kotlin", "label": "Idiomatic Kotlin: null-safety, data/sealed classes, scope functions" },
      { "id": "t-generics", "label": "Generics & variance (in/out), inline + reified" },
      { "id": "t-coroutines", "label": "Structured concurrency, scopes, cancellation, main-safety" },
      { "id": "t-dispatchers", "label": "Dispatchers (Main/IO/Default) and injecting them for tests" },
      { "id": "t-flow", "label": "Flow operators, StateFlow vs SharedFlow, stateIn(WhileSubscribed)" },
      { "id": "t-collect", "label": "Lifecycle-safe collection (repeatOnLifecycle / collectAsStateWithLifecycle)" }
    ]
  },
  {
    "title": "🎨 Jetpack Compose mastery",
    "items": [
      { "id": "c-recompose", "label": "Composition, recomposition scope & the 3 phases" },
      { "id": "c-state", "label": "State hoisting, remember vs rememberSaveable" },
      { "id": "c-effects", "label": "Side-effects: LaunchedEffect, DisposableEffect, derivedStateOf, produceState" },
      { "id": "c-stability", "label": "Stability / skippability and immutable collections" },
      { "id": "c-perf", "label": "Compose performance: deferred reads, keys, compiler metrics" },
      { "id": "c-test", "label": "Compose UI testing via the semantics tree" }
    ]
  },
  {
    "title": "🏛 Architecture & Jetpack",
    "items": [
      { "id": "a-mvvm", "label": "MVVM / MVI and unidirectional data flow" },
      { "id": "a-clean", "label": "Clean Architecture layers & single source of truth" },
      { "id": "a-repo", "label": "Repository pattern & DTO→domain mapping" },
      { "id": "a-di", "label": "Hilt/Dagger: modules, scopes, @Binds vs @Provides, qualifiers" },
      { "id": "a-room", "label": "Room (Flow DAOs, migrations) & DataStore vs SharedPreferences" },
      { "id": "a-net", "label": "Retrofit/OkHttp, interceptors, Authenticator, offline-first" },
      { "id": "a-nav", "label": "Navigation-Compose, typed routes & deep links" },
      { "id": "a-work", "label": "WorkManager vs Service vs coroutine for background work" },
      { "id": "a-modular", "label": "Modularization strategy & build boundaries" }
    ]
  },
  {
    "title": "🚀 Performance, testing & release",
    "items": [
      { "id": "r-jank", "label": "Jank & frame timing (JankStats, Macrobenchmark, Perfetto)" },
      { "id": "r-baseline", "label": "Baseline Profiles & cold-start optimization" },
      { "id": "r-leak", "label": "Memory leaks (LeakCanary) & ANRs (main-thread discipline)" },
      { "id": "r-r8", "label": "R8/ProGuard, App Bundle, App Startup" },
      { "id": "r-pyramid", "label": "Test pyramid: JUnit, MockK, Turbine, Robolectric, Espresso" },
      { "id": "r-gradle", "label": "Gradle variants/flavors, version catalogs, KSP vs kapt" },
      { "id": "r-cicd", "label": "CI/CD, signing, staged rollout, crash-free rate" }
    ]
  },
  {
    "title": "🔐 Security & frontier",
    "items": [
      { "id": "s-keystore", "label": "Keystore, EncryptedSharedPreferences, BiometricPrompt" },
      { "id": "s-net", "label": "Network Security Config, cert pinning, Play Integrity" },
      { "id": "s-masvs", "label": "OWASP MASVS / Mobile Top 10 vocabulary" },
      { "id": "s-ai", "label": "On-device AI: Gemini Nano (AICore), MediaPipe LLM, TFLite trade-offs" }
    ]
  },
  {
    "title": "✅ Final checks before the call",
    "items": [
      { "id": "f-company", "label": "Researched the company's app, stack & the team you'd join" },
      { "id": "f-quiz", "label": "Score 90%+ on the Quiz tab" },
      { "id": "f-star", "label": "3 STAR stories rehearsed out loud (performance, ownership, adaptability)" },
      { "id": "f-qa", "label": "All Q&A flashcards graded “Known”" },
      { "id": "f-setup", "label": "Camera, mic, lighting & quiet space tested; CV reviewed" }
    ]
  }
];
