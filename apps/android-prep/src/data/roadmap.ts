import type { Level } from "@/lib/levels";

export type RoadmapStage = {
  level: Level;
  summary: string;
  /** What you can already do at this level. */
  can: string[];
  /** What to learn to reach the next level. */
  next: string[];
  /** Where to drill in this app (rendered as rich HTML with links). */
  drillHtml: string;
};

export const ROADMAP: RoadmapStage[] = [
  {
    level: "junior",
    summary:
      "You build screens and ship features with guidance. The goal is fluency in the fundamentals — Kotlin basics, composables, simple state, lists, and navigation — so you can deliver a working screen end to end.",
    can: [
      "Write idiomatic Kotlin: val/var, null-safety (?., ?:), data classes, and when expressions.",
      "Build UI with Compose: Column/Row/Box, Material 3 components, and Modifiers.",
      "Hold simple UI state with remember / mutableStateOf and hoist it to a stateless composable.",
      "Show a list with LazyColumn and navigate between screens with Navigation-Compose.",
      "Fetch data with a suspend function and render loading / error / empty states.",
    ],
    next: [
      "Coroutines basics: viewModelScope, Dispatchers, and main-safety with withContext.",
      "ViewModel + StateFlow, and collectAsStateWithLifecycle for safe collection.",
      "The Activity lifecycle and why configuration changes recreate the screen.",
      "Your first unit test with JUnit + MockK, and a Compose UI test.",
    ],
    drillHtml:
      'Drill the <a href="/flashcards">flashcards</a> filtered to <b>Junior</b>, plus the <b>Kotlin</b> and <b>State &amp; Flow</b> categories. Read study topics <a href="/study#st-1">01</a>, <a href="/study#st-4">04</a>, <a href="/study#st-6">06</a>, and <a href="/study#st-7">07</a>.',
  },
  {
    level: "mid",
    summary:
      "You own features end to end — data, state, tests, and polish — with little hand-holding. The goal is depth across the everyday Android toolkit and the start of architecture and performance awareness.",
    can: [
      "Use coroutines & Flow well: structured concurrency, StateFlow/SharedFlow, combine, flatMapLatest.",
      "Apply MVVM with a single immutable UiState and a repository as the source of truth.",
      "Persist with Room and DataStore, and build a typed Retrofit/OkHttp network layer.",
      "Wire dependency injection with Hilt and keep classes constructor-injected.",
      "Write unit + integration tests and a few Compose UI tests; survive process death with SavedStateHandle.",
    ],
    next: [
      "Compose performance: stability, recomposition scope, derivedStateOf, deferred reads.",
      "Clean Architecture / MVI, modularization, and the domain layer.",
      "Paging 3, WorkManager, deep links, and offline-first sync.",
    ],
    drillHtml:
      'Filter flashcards to <b>Mid</b> and the <b>Compose</b>, <b>Framework</b>, and <b>State &amp; Flow</b> categories. Work study topics <a href="/study#st-2">02</a>, <a href="/study#st-3">03</a>, <a href="/study#st-5">05</a>, and <a href="/study#st-8">08</a>–<a href="/study#st-13">13</a>.',
  },
  {
    level: "senior",
    summary:
      "You bring architecture, performance, concurrency, and testing depth, and you raise the team around you. The goal is to be the person who profiles instead of guessing and who reasons about threading, leaks, and stability cold.",
    can: [
      "Explain the threading model, structured concurrency, and cancellation precisely.",
      "Profile and fix jank, memory leaks, and slow cold start with Perfetto / Macrobenchmark / LeakCanary.",
      "Design Compose for stability and add Baseline Profiles to guard hot paths.",
      "Reason about security in threat-model buckets (Keystore, EncryptedSharedPreferences, pinning, Play Integrity, MASVS).",
      "Own a release: CI, instrumented tests, staged rollout, crash-free rate, and a kill switch.",
    ],
    next: [
      "System design at scale: offline-first, sync & conflict resolution, real-time, pagination.",
      "Modularization strategy, convention plugins, and build-time/observability budgets.",
      "Mentoring through reviews and multiplying a team via shared modules.",
    ],
    drillHtml:
      'Filter flashcards to <b>Senior</b> and the <b>Performance</b>, <b>Coroutines</b>, <b>DI</b>, and <b>Security</b> categories. Read study topics <a href="/study#st-14">14</a>–<a href="/study#st-19">19</a> and the full <a href="/architecture">Architecture guide</a>.',
  },
  {
    level: "architect",
    summary:
      "You design Android systems end to end and make platform decisions that move a whole team. The goal is decision-making before code — for the worst device, worst network, and worst moment (process death under memory pressure).",
    can: [
      "Design a feature end to end and justify architecture, state, navigation, and data strategy.",
      "Plan modularization, the dependency graph, and incremental migrations with bounded risk.",
      "Stand up CI/CD, build infrastructure, baseline-profile generation, and production observability.",
      "Define the security posture and the testing strategy across the org.",
      "Multiply a team through shared modules, convention plugins, and code review.",
    ],
    next: [
      "Org-level platform strategy: Kotlin Multiplatform reach, dynamic delivery, and build-time at scale.",
      "Cost/perf budgets, SLOs, and evaluating emerging tech (on-device AI).",
    ],
    drillHtml:
      'Filter flashcards to <b>Architect</b> and the <b>Architecture</b> category. Work the <a href="/architecture">Architecture guide + Deep dives</a> and study topics <a href="/study#st-8">08</a>, <a href="/study#st-12">12</a>, <a href="/study#st-18">18</a>.',
  },
  {
    level: "beyond",
    summary:
      "The frontier — where you push what an Android app can do. The goal is to bring genuinely new capability on-device and pioneer patterns the rest of the team will adopt.",
    can: [
      "Run generative models on-device with Gemini Nano (AICore / ML Kit GenAI) and MediaPipe LLM Inference, reasoning about the privacy/cost/latency trade-off.",
      "Use TensorFlow Lite / LiteRT for vision and audio with GPU delegates and quantization.",
      "Push the platform: Kotlin Multiplatform, Compose Multiplatform, and deep system interop.",
    ],
    next: [
      "Contribute upstream, prototype with new Jetpack/Compose internals, and set team direction on emerging tech.",
    ],
    drillHtml:
      'Filter flashcards to <b>Beyond</b> and the <b>On-Device AI</b> category, and read study topic <a href="/study#st-20">20</a>.',
  },
];
