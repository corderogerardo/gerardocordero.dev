// Advanced batch 33 — App architecture case studies (architect). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED33_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED33_FLASHCARDS: Flashcard[] = [
  {
    id: "cs1",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How would you architect an image-heavy social feed?",
    answerHtml: `<p>MVVM + a <b>repository</b> over an <code>APIClient</code> for cursor <b>pagination</b>;
      <code>List</code>/<code>LazyVStack</code> with stable identity; an <b>actor-backed image cache</b> that
      <b>downsamples off-main</b> and de-dupes loads; prefetch ahead and cancel on scroll-away. State as an enum
      (loading/loaded/empty/error). The hard parts: scroll performance (no main-thread decode) and consistent
      pagination/refresh.</p>`,
    level: "architect",
  },
  {
    id: "cs2",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How would you architect an offline-first notes app?",
    answerHtml: `<p>Make the <b>local store the source of truth</b> (SwiftData/Core Data); the UI always reads
      locally and writes render instantly. A background <b>sync engine</b> reconciles with the server (or
      CloudKit via <code>NSPersistentCloudKitContainer</code>), with a <b>mutation queue</b> (idempotent,
      retried) and a defined <b>conflict policy</b>. Hard parts: ordering/idempotency of queued changes and
      merge conflicts.</p>`,
    level: "architect",
  },
  {
    id: "cs3",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How would you architect a real-time chat app?",
    answerHtml: `<p>A <b>WebSocket</b> (<code>URLSessionWebSocketTask</code>) for live messages behind a
      connection manager that auto-reconnects; persist messages locally so history loads instantly and survives
      offline; paginate older messages from the API. Use a <b>state machine</b> for connection state and dedupe
      via message ids/timestamps. Hard parts: ordering, delivery/read receipts, and reconnection.</p>`,
    level: "architect",
  },
  {
    id: "cs4",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How would you architect a video streaming app?",
    answerHtml: `<p><code>AVPlayer</code> with HLS adaptive streaming; a playback coordinator managing the
      current item, buffering, and background audio (audio session + now-playing/remote commands). Prefetch the
      next item, handle network drops gracefully, and support offline downloads via a background
      <code>URLSession</code>. Hard parts: smooth playback under variable network and resource/memory
      management.</p>`,
    level: "architect",
  },
  {
    id: "cs5",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How would you architect an e-commerce checkout?",
    answerHtml: `<p>A repository for catalog/cart; model <b>checkout as a state machine</b> (cart → address →
      payment → confirm) so steps and failures are explicit; use <b>StoreKit</b> for digital goods (verify
      transactions, restore) or a payment SDK for physical; keep money math server-authoritative. Hard parts:
      transaction verification, error/edge states, and never double-charging (idempotency).</p>`,
    level: "architect",
  },
  {
    id: "cs6",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What changes for a security-critical (banking) app?",
    answerHtml: `<p>Secrets in the <b>Keychain</b> (Secure Enclave-backed where possible), <b>biometric</b>
      gating, <b>certificate pinning</b> + ATS, jailbreak/integrity checks and <b>App Attest</b>, no sensitive
      data in logs/snapshots (obscure on backgrounding), short sessions, and server as the source of truth.
      Threat-model the data flow. Hard parts: balancing security with UX and a defensible "what leaves the
      device".</p>`,
    level: "architect",
  },
  {
    id: "cs7",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How would you architect onboarding & auth?",
    answerHtml: `<p>A <b>coordinator/router</b> drives the flow (welcome → sign-in → permissions → home) as
      data, so it's reorderable and testable; tokens in the <b>Keychain</b> with centralized refresh; offer
      <b>Sign in with Apple</b> (Guideline 4.8) and request permissions <b>in context</b>. Deep links resolve
      into the same routes. Hard parts: token refresh races and resuming an interrupted flow.</p>`,
    level: "architect",
  },
  {
    id: "cs8",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How would you architect a large modular 'super-app' for many teams?",
    answerHtml: `<p>A <b>modular monolith</b>: feature <b>Swift packages</b> depending on shared Core/
      DesignSystem/Networking, never on each other; a <b>router</b> + interface modules for cross-feature
      navigation without cycles; <b>feature flags</b> for independent rollout; CI that builds/tests changed
      packages. Hard parts: keeping the dependency graph acyclic and boundaries honest as it grows.</p>`,
    level: "architect",
  },
  {
    id: "cs9",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How would you architect a ride/delivery tracking app?",
    answerHtml: `<p>CoreLocation with the right update mode (significant-change/region vs continuous) and
      careful <b>background location</b> + battery budget; a live map (MapKit) with a smoothly-updating annotation;
      a <b>Live Activity</b> + push for ETA on the Lock Screen/Dynamic Island; server pushes drive updates. Hard
      parts: battery vs accuracy, background reliability, and keeping the Live Activity in sync.</p>`,
    level: "architect",
  },
  {
    id: "cs10",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How would you architect a health/fitness app?",
    answerHtml: `<p><b>HealthKit</b> as the data hub (background delivery + anchored queries for incremental
      sync), a watchOS companion with an <b>HKWorkoutSession</b> for live tracking, and Core Motion for
      steps/activity. Treat health data as highly sensitive (on-device, minimal, no ads). Hard parts: watch↔phone
      sync, background updates, and the "denied read looks like no data" model.</p>`,
    level: "architect",
  },
  {
    id: "cs11",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How would you architect a news/reader app with subscriptions?",
    answerHtml: `<p>Repository over API with aggressive <b>caching</b> (ETag) and a local store for <b>offline
      reading</b>; prefetch/download articles; <b>StoreKit 2</b> auto-renewable subscriptions (entitlement check
      via <code>Transaction.currentEntitlements</code>, server notifications for the source of truth) gating
      premium content. Hard parts: offline sync, subscription state across devices, and a clean paywall.</p>`,
    level: "architect",
  },
  {
    id: "cs12",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How would you architect a photo-editing app?",
    answerHtml: `<p>Pick images via <b>PhotosPicker</b> (no permission); build a <b>Core Image</b> pipeline
      (reused <code>CIContext</code>, chained filters rendered once on the GPU); keep edits as a
      <b>non-destructive</b> list of operations you can reorder/undo; downsample for the live preview and render
      full-res only on export. Hard parts: responsive live preview, memory, and undo/history.</p>`,
    level: "architect",
  },
  {
    id: "cs13",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How would you architect a dashboard/analytics app?",
    answerHtml: `<p>Repository feeding view models that expose ready-to-render series; <b>Swift Charts</b> with
      data <b>aggregated/downsampled</b> off the main actor; cache results and refresh on an interval/pull; handle
      large datasets with scrollable charts and bounded visible domains. Hard parts: large-data performance and
      keeping charts honest (axes/units).</p>`,
    level: "senior",
  },
  {
    id: "cs14",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How would you architect an app + widget + watch ecosystem?",
    answerHtml: `<p>Put shared models/logic in a <b>Swift package</b> all targets import; share data through an
      <b>App Group</b> (and/or CloudKit) so the widget and watch read what the app wrote; build complications and
      widgets on the same <b>WidgetKit</b> timeline code; trigger widget reloads via
      <code>WidgetCenter</code>. Hard parts: keeping data consistent across processes and respecting extension
      memory/time limits.</p>`,
    level: "architect",
  },
  {
    id: "cs15",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How would you migrate a large UIKit app to SwiftUI?",
    answerHtml: `<p><b>Incrementally</b>: host new SwiftUI screens in UIKit via <code>UIHostingController</code>
      and embed UIKit pieces in SwiftUI via representables; migrate leaf screens first, share the model layer, and
      keep one source of truth for navigation during the transition. Don't rewrite wholesale. Hard parts:
      bridging navigation/state across the boundary and avoiding a half-migrated mess.</p>`,
    level: "architect",
  },
  {
    id: "cs16",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How do you choose an architecture and avoid over-engineering?",
    answerHtml: `<p>Match it to <b>team size, app complexity, and lifespan</b>: MVVM + repositories for most
      apps; unidirectional/TCA when logic and team scale justify the ceremony; modular packages when many people
      touch the codebase. Add a layer/protocol when a <b>second implementation or a test</b> needs it — not
      speculatively. The best architecture is the simplest one that keeps the app shippable as it grows.</p>`,
    level: "architect",
  },
];

export const ADVANCED33_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED33_QUIZ: QuizQuestion[] = [
  {
    id: "csz1",
    category: "arch",
    categoryLabel: "Architecture",
    question: "The single most important decision for an offline-first app is:",
    options: ["Use the newest API", "Make the local store the source of truth", "Cache nothing", "Sync synchronously on tap"],
    answer: 1,
    explanationHtml: `<p>The UI reads/writes locally (instant, works offline) and a background engine syncs with
      a defined conflict policy — server-on-tap loses edits offline.</p>`,
  },
  {
    id: "csz2",
    category: "arch",
    categoryLabel: "Architecture",
    question: "A smooth image-heavy feed depends most on:",
    options: ["Bigger images", "Off-main downsampling + caching + stable identity + lazy lists", "AnyView", "More view models"],
    answer: 1,
    explanationHtml: `<p>Decode/downsample off the main thread, cache thumbnails, reuse rows via stable
      identity, and render lazily — that's what keeps scrolling smooth.</p>`,
  },
  {
    id: "csz3",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Modeling checkout as a state machine helps by:",
    options: ["Reducing app size", "Making steps and failure states explicit and testable", "Avoiding StoreKit", "Skipping verification"],
    answer: 1,
    explanationHtml: `<p>Explicit states (cart→address→payment→confirm) prevent invalid combinations and make
      error/edge handling and idempotency clear.</p>`,
  },
  {
    id: "csz4",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Cross-feature navigation in a modular app without import cycles uses:",
    options: ["Features importing each other", "A router + interface modules", "Singletons", "Global notifications only"],
    answer: 1,
    explanationHtml: `<p>Features depend on a routing interface (and shared interface modules), so a central
      router resolves destinations without A↔B dependencies.</p>`,
  },
  {
    id: "csz5",
    category: "arch",
    categoryLabel: "Architecture",
    question: "The recommended way to migrate UIKit → SwiftUI is:",
    options: ["A full rewrite", "Incrementally, bridging with hosting/representable", "Never", "Only new apps"],
    answer: 1,
    explanationHtml: `<p>Host SwiftUI in UIKit (and vice-versa), migrate leaf screens first, and share the model
      — avoid a risky big-bang rewrite.</p>`,
  },
  {
    id: "csz6",
    category: "arch",
    categoryLabel: "Architecture",
    question: "You should add an extra layer or protocol when:",
    options: ["Always, up front", "A second implementation or a test actually needs it", "Never", "The file gets long"],
    answer: 1,
    explanationHtml: `<p>Introduce abstraction in response to a real need (testing, a second impl), not
      speculatively — the simplest shippable architecture wins.</p>`,
  },
];

export const ADVANCED33_STUDY: StudySection[] = [
  {
    id: "st-adv-73",
    num: "88",
    title: "88 · Architecture case studies: applying the patterns",
    html: `<p><b>What it is.</b> The capstone — composing everything in this guide into real apps. Recurring
      moves: <b>repository + MVVM</b> behind protocols; the <b>local store as source of truth</b> with a sync
      engine for offline; <b>actor-backed caches</b> and off-main work for media; a <b>state machine</b> for
      multi-step or connection-heavy flows (checkout, chat); a <b>router/coordinator</b> for navigation;
      <b>modular packages</b> + feature flags at team scale; and the right platform piece per job (WebSockets,
      StoreKit, HealthKit, Live Activities, App Group sharing).</p>
    <div class="callout tip"><span class="lbl">Interview shape</span> Clarify requirements → name the layers
      (UI → ViewModel → Repository → services) → call out the 2–3 <i>hard</i> decisions (pagination, conflict
      resolution, verification, battery) → mention testing/observability.</div>`,
  },
  {
    id: "st-adv-74",
    num: "89",
    title: "89 · Choosing architecture & the system-design answer",
    html: `<p><b>What it is.</b> There's no one architecture — match it to <b>team size, complexity, and
      lifespan</b>. MVVM + repositories suits most apps; unidirectional/TCA earns its ceremony in large,
      logic-heavy products; modular Swift packages pay off when many engineers share the codebase. Add a layer or
      protocol when a <b>second implementation or a test</b> demands it, not speculatively.</p>
    <p>In a system-design interview: state assumptions, sketch the data flow and module boundaries, justify
      trade-offs out loud, and always answer "how do you know it's healthy, and how do you turn it off?"
      (observability + feature flags). Confidence in trade-offs reads as senior/architect.</p>
    <div class="callout warn"><span class="lbl">Avoid</span> Cargo-culting a pattern, over-abstracting early, and
      ignoring the operational story (testing, rollout, monitoring).</div>`,
  },
];
