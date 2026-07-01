// Batch 22 — Now in Android's modular/offline-first architecture, patterns from the
// official Compose Samples, MVVM vs MVI as compared in Android Architecture Blueprints,
// and reading real open-source Android codebases (AnkiDroid) & curated roadmaps.
// Sources: android/nowinandroid, android/compose-samples, android/architecture-samples,
// ankidroid/Anki-Android, skydoves/android-developer-roadmap,
// androiddevnotes/awesome-android-learning-resources (see docs/study-resources.md).
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED22_FLASHCARDS: Flashcard[] = [
  {
    id: "nia1",
    category: "arch",
    categoryLabel: "Architecture",
    question: `Now in Android splits into dozens of Gradle modules by type (feature, data, domain, core). What's the actual payoff versus one big app module?`,
    answerHtml: `<p>Module boundaries are enforced by <b>Gradle's dependency graph</b>, not just code review — a <code>feature:foryou</code> module literally cannot import from <code>feature:bookmarks</code> unless you add the dependency, so architecture drift is a build error, not a review comment. It also unlocks <b>build parallelism and incremental compilation</b>: changing one feature module only recompiles that module and its dependents, not the whole app, which matters a lot at CI/local-build scale.</p>`,
    level: "architect",
  },
  {
    id: "nia2",
    category: "arch",
    categoryLabel: "Architecture",
    question: `What's a Gradle convention plugin, and what problem does Now in Android use it to solve?`,
    answerHtml: `<p>A convention plugin is a small custom Gradle plugin (in <code>build-logic/</code>) that applies a consistent set of configuration — compile SDK, Kotlin options, Compose setup, lint rules — to every module of a given type, instead of copy-pasting the same lines into each module's <code>build.gradle.kts</code>. It centralizes build config the same way a base class centralizes shared behavior: change it once in the convention plugin and every module picks it up.</p>`,
    level: "senior",
  },
  {
    id: "nia3",
    category: "arch",
    categoryLabel: "Architecture",
    question: `How does Now in Android implement offline-first, and why is the local database the source of truth rather than the network response?`,
    answerHtml: `<p>Every repository reads from <b>Room</b> and exposes a <code>Flow</code>; a background <b>Sync</b> worker (via WorkManager) fetches from the network and writes results into Room. The UI never reads the network response directly — it observes the database, so the UI updates the instant local data changes, works fully offline, and a slow or failed sync degrades gracefully instead of blocking the screen.</p>`,
    level: "senior",
  },
  {
    id: "nia4",
    category: "arch",
    categoryLabel: "Architecture",
    question: `What is a "core" module in this structure (core:data, core:network, core:designsystem, core:ui) and why keep it separate from "feature" modules?`,
    answerHtml: `<p><b>Core modules</b> hold cross-cutting, reusable code — a network client, the Room database, shared Compose components, design tokens — that multiple feature modules depend on but which itself depends on nothing feature-specific. Keeping them separate enforces a one-way dependency (features depend on core, never the reverse), which is what prevents the module graph from becoming a tangle where every module can reach every other module.</p>`,
    level: "senior",
  },
  {
    id: "nia5",
    category: "arch",
    categoryLabel: "Architecture",
    question: `Now in Android's sync layer combines per-source WorkInfo flows (topics, news, authors) rather than one global "isSyncing" flag. Why?`,
    answerHtml: `<p>Different data types can sync independently and finish at different times; combining each worker's own <code>WorkInfo</code> flow lets the UI show accurate per-source progress and know the instant <i>all</i> syncs finish, rather than a single coarse boolean that either lies about partial progress or has to be manually reset.</p>`,
    level: "architect",
  },
  {
    id: "nia6",
    category: "perf",
    categoryLabel: "Performance",
    question: `What does Now in Android use Baseline Profiles for, and how are they generated rather than hand-written?`,
    answerHtml: `<p>A <b>Baseline Profile</b> lists the classes/methods the app uses most during startup and key journeys, telling ART to <b>ahead-of-time compile</b> exactly those instead of interpreting/JIT-ing them on first run — cutting cold-start jank. Now in Android generates it with a <b>Macrobenchmark</b> test that drives the real app through those journeys on a device or emulator and records what actually executes, rather than a developer guessing which methods matter.</p>`,
    level: "senior",
  },
  {
    id: "nia7",
    category: "test",
    categoryLabel: "Testing",
    question: `How does Now in Android structure Compose previews and screenshot tests across many feature modules without them going stale?`,
    answerHtml: `<p>Each feature module owns its own <code>@Preview</code> composables fed with fake, preview-only data (no live repository), and a shared <b>screenshot-testing</b> setup renders those same previews in CI and diffs them against golden images. Because previews and screenshot tests share the exact same composable and fake data, a screen can't drift from its preview without a test catching it.</p>`,
    level: "senior",
  },
  {
    id: "nia8",
    category: "compose",
    categoryLabel: "Compose",
    question: `Why does Now in Android favor stateless, hoisted composables (screen-level state passed down) over composables that call viewModel() deep in the tree?`,
    answerHtml: `<p>Hoisting state to the top of each screen and passing plain parameters down makes every inner composable <b>previewable and testable in isolation</b> with fake data — no Hilt graph, no ViewModel, no repository needed to render it. Reaching for <code>viewModel()</code> deep inside a leaf composable couples that leaf to the DI graph and makes it un-previewable without a real app context.</p>`,
    level: "mid",
  },
  {
    id: "cmp1",
    category: "compose",
    categoryLabel: "Compose",
    question: `Jetsnack (Compose Samples) choreographs a cart animation where offset, scale, and alpha all change together off one state enum. What Compose primitive is built for that, instead of several separate animate*AsState calls?`,
    answerHtml: `<p><code>updateTransition</code> (or the lower-level <code>Animatable</code>), driven off a single state enum, animating multiple properties in sync as that state changes — rather than several independent <code>animate*AsState</code> calls that can drift out of phase with each other. One state transition then drives a whole choreographed set of value changes together.</p>`,
    level: "senior",
  },
  {
    id: "cmp2",
    category: "compose",
    categoryLabel: "Compose",
    question: `Jetcaster (Compose Samples) shows a podcast player driving playback position into the UI. What's the recommended pattern for exposing a continuously-changing player position to Compose without excessive recomposition?`,
    answerHtml: `<p>Poll or listen to the player's position inside a <code>LaunchedEffect</code> that updates a single piece of state (e.g. <code>mutableFloatStateOf</code>), and read that state only in the small composable that renders the scrubber — not at the top of the screen. That keeps the high-frequency updates scoped to one small recomposition instead of invalidating the whole player screen every frame.</p>`,
    level: "senior",
  },
  {
    id: "cmp3",
    category: "compose",
    categoryLabel: "Compose",
    question: `Reply (Compose Samples) adapts its layout across phone/foldable/tablet using WindowSizeClass. What's the key state-hoisting change needed to go from a single-pane phone layout to a list-detail pane layout?`,
    answerHtml: `<p>Selection state ("which email is open") has to move from being local to a detail screen reached via the nav controller, to being hoisted <b>above both the list and detail composables</b> — in a two-pane layout they render as siblings at the same time rather than as sequential destinations, so the detail pane needs to observe the same selection state the list pane writes to.</p>`,
    level: "senior",
  },
  {
    id: "cmp4",
    category: "test",
    categoryLabel: "Testing",
    question: `The Compose Samples repo checks that every sample builds clean under the Compose compiler's stability/skipping reports in CI. What's the practical benefit over just eyeballing scroll performance?`,
    answerHtml: `<p>The Compose compiler can report which composables or parameters are <b>unstable</b> and therefore skip recomposition optimizations, turning "is this composable well-behaved" from a runtime profiling exercise into a <b>build-time signal</b> caught in CI before it ships — the same category of guarantee unit tests give you for correctness, applied to recomposition performance.</p>`,
    level: "architect",
  },
  {
    id: "mvi1",
    category: "arch",
    categoryLabel: "Architecture",
    question: `Android's Architecture Blueprints (architecture-samples) reimplements the same to-do app across a few different architectural approaches. What's the core structural difference between the MVVM branch and an MVI branch?`,
    answerHtml: `<p>In <b>MVVM</b>, the ViewModel exposes several independent pieces of UI state (a loading flag, an error, the items) that the view reads separately, and user actions call ViewModel methods directly. In <b>MVI</b>, all UI state is collapsed into <b>one immutable UiState</b> object the view renders wholesale, and every user action is dispatched as an <b>Intent/Action</b> through a single entry point that produces the next UiState — trading MVVM's flexibility for MVI's single, always-consistent state stream.</p>`,
    level: "senior",
  },
  {
    id: "mvi2",
    category: "arch",
    categoryLabel: "Architecture",
    question: `What specific bug class does MVI's "one UiState, one reducer" shape prevent that plain MVVM with several separate StateFlow properties doesn't?`,
    answerHtml: `<p><b>Inconsistent intermediate states</b> — e.g. a screen briefly showing <code>isLoading = true</code> alongside stale <code>items</code> from before, because two separate state flows updated in different order. MVI can't produce that: the whole screen's state is one value transitioned atomically by the reducer, so there's no window where two independently-updated properties disagree.</p>`,
    level: "senior",
  },
  {
    id: "mvi3",
    category: "arch",
    categoryLabel: "Architecture",
    question: `What's the main cost of the MVI approach that Architecture Blueprints calls out as a trade-off?`,
    answerHtml: `<p>More <b>boilerplate and indirection</b> for simple screens — every user action needs an Intent/Action type, and the reducer has to handle every case even when a simpler, direct ViewModel-method call would do. It earns its ceremony on screens with genuinely complex, interdependent state; on a simple form it's often more code for the same result as MVVM.</p>`,
    level: "architect",
  },
  {
    id: "mvi4",
    category: "arch",
    categoryLabel: "Architecture",
    question: `Both the MVVM and MVI branches of Architecture Blueprints keep the same repository/data layer unchanged. What does that demonstrate about where architectural choice should live?`,
    answerHtml: `<p>MVVM vs. MVI is a <b>presentation-layer</b> decision — how state flows from ViewModel to UI and how actions flow back — not a data-layer one. The repository, Room database, and network layer don't need to know or care which presentation pattern sits above them, which is exactly the kind of clean separation the dependency rule (data doesn't depend on presentation) is meant to produce.</p>`,
    level: "senior",
  },
  {
    id: "mvi5",
    category: "test",
    categoryLabel: "Testing",
    question: `How would you unit test a reducer in an MVI-style ViewModel, and why is that often easier than testing an MVVM ViewModel with several StateFlow properties?`,
    answerHtml: `<p>A reducer is typically a <b>pure function</b>: <code>(currentState, action) -&gt; newState</code>. You can test it directly with no ViewModel, no coroutines, and no mocking — call it with a state and an action, assert on the returned state. An MVVM ViewModel with several independent <code>StateFlow</code>s often needs to advance a test dispatcher and collect multiple flows to assert the same behavior.</p>`,
    level: "mid",
  },
  {
    id: "mvi6",
    category: "arch",
    categoryLabel: "Architecture",
    question: `When would choosing MVVM over MVI for a new Android screen actually be the better call?`,
    answerHtml: `<p>When the screen's state is <b>simple and mostly independent</b> — a settings toggle, a single form — MVVM's direct ViewModel-method calls and a couple of <code>StateFlow</code>s solve it with less ceremony. Reach for MVI when a screen has many interdependent pieces of state that need to change atomically and consistently, like a multi-step wizard or a screen with complex loading/error/data interplay.</p>`,
    level: "senior",
  },
  {
    id: "oss1",
    category: "arch",
    categoryLabel: "Architecture",
    question: `AnkiDroid implements the SM-2 spaced-repetition algorithm (deciding when a flashcard is next due) as a pure module separate from its UI and database layers. Why does that separation matter for a scheduling algorithm specifically?`,
    answerHtml: `<p>A scheduling algorithm is <b>pure math over a card's review history</b> (ease factor, interval, due date) with no Android dependency at all — keeping it as plain Kotlin functions/classes, not tied to Room entities or a ViewModel, means it can be exhaustively unit tested with fixed inputs and expected outputs, and reused unchanged if the storage layer or UI is rewritten. Coupling it to Android framework types would drag platform test setup into what should be a fast, deterministic test suite.</p>`,
    level: "senior",
  },
  {
    id: "oss2",
    category: "arch",
    categoryLabel: "Architecture",
    question: `AnkiDroid is a long-running open-source Android app, originally Java, migrated incrementally to Kotlin over many years. What does reading a real long-lived migration like this teach you that a greenfield Kotlin app can't?`,
    answerHtml: `<p>How to keep a large app <b>shippable throughout</b> a multi-year migration: interop patterns for Java calling Kotlin and vice versa, converting one module at a time behind existing tests, and prioritizing user-facing risk — touch the stable core last, migrate low-risk peripheral code first. Greenfield code shows you the target state; a real migration's history shows you the path there without breaking production.</p>`,
    level: "senior",
  },
  {
    id: "oss3",
    category: "behavior",
    categoryLabel: "Behavioral",
    question: `How does a mature app like AnkiDroid, with review reminders that must fire even when the app is closed, use WorkManager to survive process death and Doze?`,
    answerHtml: `<p>A periodic or one-off <code>WorkRequest</code> is scheduled with constraints, and rescheduled after a reboot via a <code>BroadcastReceiver</code> listening for <code>BOOT_COMPLETED</code> — so the reminder isn't tied to the app process staying alive. WorkManager persists the request and the system, not your process, is responsible for waking work up, respecting Doze/App Standby batching windows rather than fighting them with a foreground service or exact alarms it doesn't need.</p>`,
    level: "senior",
  },
  {
    id: "oss4",
    category: "arch",
    categoryLabel: "Architecture",
    question: `What's a fast way to locate the "real" architecture of a large open-source Android app like AnkiDroid or one from Android's architecture-samples, without reading every file?`,
    answerHtml: `<p>Start at the root Gradle module list (<code>settings.gradle.kts</code>) for the module boundaries the team chose, find the Application/Hilt (or Dagger) entry point for the composition root, and read the <b>test directory structure</b> — it usually mirrors the real architecture more honestly than the source tree does, since tests are organized around the seams the team actually relies on.</p>`,
    level: "mid",
  },
  {
    id: "oss5",
    category: "arch",
    categoryLabel: "Architecture",
    question: `What's the interview value of studying a curated roadmap (like android-developer-roadmap) versus just reading whatever Android blog post you find first?`,
    answerHtml: `<p>A roadmap sequences topics by <b>actual dependency</b> (Kotlin fundamentals before coroutines, coroutines before Flow-heavy architecture) and by seniority, so you know what's foundational versus what's a senior-level differentiator — closing a real gap instead of randomly deepening a topic you already know. Use it to find the 2-3 topics you're weakest on, then go deep on primary docs/source for those specifically.</p>`,
    level: "mid",
  },
  {
    id: "oss6",
    category: "arch",
    categoryLabel: "Architecture",
    question: `Why is contributing a small, real PR to an open-source Android project (a docs fix, a small bug fix in AnkiDroid or a Compose Samples app) good interview prep beyond the code itself?`,
    answerHtml: `<p>It's a rehearsal for working inside <b>someone else's CI, code style, and review process</b> — following contribution guidelines, getting real review comments, and iterating — which is a much closer proxy for the job than a solo portfolio app. It also gives you a concrete, verifiable story for "tell me about working in an unfamiliar codebase" instead of a hypothetical answer.</p>`,
    level: "mid",
  },
];

export const ADVANCED22_QUIZ: QuizQuestion[] = [
  {
    id: "niaz1",
    category: "arch",
    categoryLabel: "Architecture",
    question: `In Now in Android's multi-module setup, what actually enforces that feature:foryou can't accidentally import feature:bookmarks?`,
    options: [`Code review only`, `Gradle's module dependency graph — you'd need to explicitly add the dependency`, `A lint rule that can be suppressed`, `Kotlin's visibility modifiers`],
    answer: 1,
    explanationHtml: `<p>Module dependencies are compile-time Gradle declarations — the boundary is enforced structurally, not by convention or review discipline.</p>`,
  },
  {
    id: "niaz2",
    category: "perf",
    categoryLabel: "Performance",
    question: `Now in Android generates its Baseline Profile using:`,
    options: [`A hand-maintained list of class names`, `A Macrobenchmark test that drives real app journeys and records what actually executes`, `The Play Console automatically`, `R8/Proguard rules`],
    answer: 1,
    explanationHtml: `<p>Macrobenchmark exercises the real app on-device and records the executed classes/methods, producing an accurate profile instead of a developer's guess.</p>`,
  },
  {
    id: "niaz3",
    category: "arch",
    categoryLabel: "Architecture",
    question: `Now in Android keeps the local Room database as the source of truth for offline-first data. What does the UI actually observe?`,
    options: [`The raw network response`, `A Flow from Room, updated by a background sync worker`, `A static in-memory cache only`, `Nothing — it polls the network directly`],
    answer: 1,
    explanationHtml: `<p>The UI reads Room via <code>Flow</code>; sync workers write network results into Room, so the database — not the network call — drives the UI.</p>`,
  },
  {
    id: "cmpz1",
    category: "compose",
    categoryLabel: "Compose",
    question: `Jetsnack's cart animation choreographs several properties (offset, scale, alpha) changing together off one state enum. The right Compose primitive for that is:`,
    options: [`Several independent animate*AsState calls`, `updateTransition driven by the state enum`, `LaunchedEffect with a manual delay loop`, `A ValueAnimator from the View system`],
    answer: 1,
    explanationHtml: `<p><code>updateTransition</code> ties multiple animated properties to one state so they move together in sync, unlike several independent <code>animate*AsState</code> calls that can drift.</p>`,
  },
  {
    id: "cmpz2",
    category: "compose",
    categoryLabel: "Compose",
    question: `Adapting a phone-only list-detail screen (like Reply) to a two-pane tablet layout requires which state change?`,
    options: [`No change — panes manage their own state`, `Hoisting selection state above both the list and detail composables, since they now render as siblings`, `Removing the ViewModel entirely`, `Switching from Compose to XML layouts`],
    answer: 1,
    explanationHtml: `<p>In a two-pane layout, list and detail render simultaneously as siblings, so shared selection state must live above both rather than inside a single sequential destination.</p>`,
  },
  {
    id: "mviz1",
    category: "arch",
    categoryLabel: "Architecture",
    question: `The core structural difference between an MVVM and MVI implementation of the same screen is:`,
    options: [`MVI uses Room and MVVM doesn't`, `MVI collapses all UI state into one immutable UiState updated by a single reducer; MVVM exposes several independent state properties`, `MVVM can't use coroutines`, `There is no real difference`],
    answer: 1,
    explanationHtml: `<p>MVI models the whole screen as one state value transitioned by a reducer; MVVM typically exposes several independent state properties updated more freely.</p>`,
  },
  {
    id: "mviz2",
    category: "arch",
    categoryLabel: "Architecture",
    question: `MVI's single-UiState-plus-reducer shape specifically prevents:`,
    options: [`Slow builds`, `Two independently-updated state properties briefly disagreeing (e.g. stale items shown alongside isLoading = true)`, `Memory leaks`, `Compose recomposition entirely`],
    answer: 1,
    explanationHtml: `<p>Because the whole state transitions atomically through one reducer, there's no window where two separately-updated flags or values can be inconsistent with each other.</p>`,
  },
  {
    id: "mviz3",
    category: "arch",
    categoryLabel: "Architecture",
    question: `Architecture Blueprints' MVVM and MVI branches share the same repository/data layer unchanged. That demonstrates:`,
    options: [`The data layer must be rewritten per presentation pattern`, `MVVM vs MVI is a presentation-layer decision, independent of the data layer`, `MVI requires a different database`, `Repositories are unnecessary in MVI`],
    answer: 1,
    explanationHtml: `<p>The choice between MVVM and MVI concerns state/action flow in the presentation layer only — a well-separated data layer doesn't need to know or change based on that choice.</p>`,
  },
  {
    id: "ossz1",
    category: "arch",
    categoryLabel: "Architecture",
    question: `AnkiDroid keeps its SM-2 spaced-repetition scheduling logic as plain Kotlin with no Android/Room dependency. The main benefit is:`,
    options: [`It runs faster on a real device`, `It can be exhaustively unit tested with fixed inputs/outputs and reused independent of the storage/UI layer`, `It avoids needing Kotlin coroutines`, `It's required by the Play Store`],
    answer: 1,
    explanationHtml: `<p>Pure scheduling logic decoupled from Android types is fast to test deterministically and portable if the storage or UI layers change.</p>`,
  },
  {
    id: "ossz2",
    category: "behavior",
    categoryLabel: "Behavioral",
    question: `AnkiDroid schedules review reminders that must fire even after the app process dies, using:`,
    options: [`A foreground service kept alive indefinitely`, `WorkManager with constraints, rescheduled on BOOT_COMPLETED`, `A background Thread with an infinite loop`, `Push notifications only`],
    answer: 1,
    explanationHtml: `<p>WorkManager persists the request independent of the app process and respects Doze/App Standby, rescheduling after boot via a <code>BroadcastReceiver</code> rather than relying on the process staying alive.</p>`,
  },
];

export const ADVANCED22_STUDY: StudySection[] = [
  {
    id: "st-nia-1",
    num: "H1",
    title: "H1 · Now in Android: modularization, convention plugins & offline-first",
    html: `<p><b>What it is.</b> <a href="https://github.com/android/nowinandroid">Now in Android</a> is Google's
      reference app for how a modern, modular Android codebase actually looks: dozens of Gradle modules split
      by type (<code>feature:*</code>, <code>core:data</code>, <code>core:network</code>,
      <code>core:designsystem</code>) with dependencies enforced by the build graph itself, not code review —
      a feature module literally can't import another feature module without adding the Gradle dependency.
      Shared build config (compile SDK, Compose setup, lint) lives in <b>convention plugins</b>
      (<code>build-logic/</code>) applied consistently across modules instead of copy-pasted per module.</p>
    <p>Its data layer is <b>offline-first</b>: every repository reads from Room and exposes a
      <code>Flow</code>, while a WorkManager-driven sync layer fetches from the network in the background and
      writes results into Room. The UI never touches the network response directly — only the local database
      — so it works offline, updates instantly on local writes, and degrades gracefully when sync is slow or
      fails.</p>
    <div class="callout tip"><span class="lbl">In practice</span> "I'd point to Now in Android's module
      graph as the reference for enforcing architecture boundaries at build time instead of relying on
      review discipline — and its sync layer as the reference offline-first shape: local store as truth,
      background workers reconciling with the network."</div>`,
  },
  {
    id: "st-mvi-1",
    num: "H2",
    title: "H2 · MVVM vs MVI: what Architecture Blueprints actually compares",
    html: `<p><b>What it is.</b> <a href="https://github.com/android/architecture-samples">Android Architecture
      Blueprints</a> implements the same to-do app across multiple architectural approaches, which makes the
      MVVM-vs-MVI trade-off concrete instead of theoretical. <b>MVVM</b>: the ViewModel exposes several
      independent state properties (loading, error, items) and the view calls ViewModel methods directly for
      each action. <b>MVI</b>: all UI state collapses into one immutable <code>UiState</code>, and every
      action is dispatched as an Intent through a single reducer that produces the next state — trading
      MVVM's flexibility for a state stream that can never show two independently-updated properties
      disagreeing mid-transition.</p>
    <p>Both branches keep the <b>same repository and data layer</b> unchanged — the choice is a
      presentation-layer concern only. A reducer is a pure function
      (<code>(state, action) -&gt; state</code>), so it's trivially unit-testable with no ViewModel,
      coroutines, or mocking required.</p>
    <div class="callout warn"><span class="lbl">Trade-off</span> MVI's ceremony (an Intent/Action type per
      user action, an exhaustive reducer) earns its keep on screens with genuinely complex, interdependent
      state — a multi-step wizard, a screen with tangled loading/error/data interplay. On a simple form it's
      usually more code than MVVM for the same result.</div>`,
  },
  {
    id: "st-oss-1",
    num: "H3",
    title: "H3 · Reading real Android codebases: AnkiDroid, Compose Samples & curated roadmaps",
    html: `<p><b>What it is.</b> <a href="https://github.com/ankidroid/Anki-Android">AnkiDroid</a> is a
      15+ year, originally-Java app incrementally migrated to Kotlin — reading it teaches interop and
      migration discipline a greenfield app can't: converting one module at a time behind existing tests,
      touching the stable core last. Its SM-2 spaced-repetition scheduler is kept as plain Kotlin with zero
      Android dependency, which is exactly why it's exhaustively unit tested — pure math over a review
      history needs no platform test setup. Its review reminders use <b>WorkManager</b> with a
      <code>BOOT_COMPLETED</code> receiver so they survive process death and Doze without a foreground
      service.</p>
    <p><b>Skimming a large unfamiliar Android codebase</b> fast: start at <code>settings.gradle.kts</code>
      for the module boundaries, find the Application/Hilt entry point for the composition root, and read
      the <b>test directory structure</b> — it usually mirrors the real architecture more honestly than the
      source tree does. Curated maps like
      <a href="https://github.com/skydoves/android-developer-roadmap">android-developer-roadmap</a> and
      <a href="https://github.com/androiddevnotes/awesome-android-learning-resources">awesome-android-learning-resources</a>
      help you find the 2-3 topics you're genuinely weak on instead of randomly deepening what you already
      know, and the official
      <a href="https://github.com/android/compose-samples">Compose Samples</a> are worth reading end-to-end
      for idiomatic patterns (Jetsnack's choreographed transitions, Reply's adaptive list-detail panes) you'd
      otherwise only see described secondhand.</p>
    <div class="callout tip"><span class="lbl">Portfolio signal</span> A small, real PR to an open-source
      Android project — even a docs fix — is a rehearsal for someone else's CI and review process, and gives
      you a concrete, verifiable "working in an unfamiliar codebase" story instead of a hypothetical one.</div>`,
  },
];
