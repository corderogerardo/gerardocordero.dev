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
    answerHtml: `<p>The feed lives or dies on scroll performance, so the architecture exists to keep every
      byte of image decoding off the main thread: MVVM + a <b>repository</b> over an <code>APIClient</code> for
      cursor <b>pagination</b>; <code>List</code>/<code>LazyVStack</code> with stable identity; an
      <b>actor-backed image cache</b> that <b>downsamples off-main</b> and de-dupes loads; prefetch ahead and
      cancel on scroll-away. State as an enum (loading/loaded/empty/error).</p>
    <p>Red flag: decoding full-resolution images on the main thread "because it's simpler" — that's the single
      most common way a feed jank-tests badly in review.</p>
    <p><b>I design the cache to guarantee decode never touches the main thread, then optimize everything else
      around that constraint.</b></p>`,
    level: "architect",
  },
  {
    id: "cs2",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How would you architect an offline-first notes app?",
    answerHtml: `<p>The whole architecture flows from one decision: never let network latency block the UI, so
      make the <b>local store the source of truth</b> (SwiftData/Core Data) — the UI always reads locally and
      writes render instantly. A background <b>sync engine</b> reconciles with the server (or CloudKit via
      <code>NSPersistentCloudKitContainer</code>), with a <b>mutation queue</b> (idempotent, retried) and a
      defined <b>conflict policy</b>.</p>
    <p>Red flag: syncing synchronously on save. That reintroduces the exact latency and offline-fragility the
      local-first design was meant to remove.</p>
    <p><b>The local store is the source of truth; the server is just another sync target the app reconciles
      against.</b></p>`,
    level: "architect",
  },
  {
    id: "cs3",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How would you architect a real-time chat app?",
    answerHtml: `<p>Chat has to feel instant and survive flaky networks, so the connection is treated as
      unreliable by design rather than assumed: a <b>WebSocket</b> (<code>URLSessionWebSocketTask</code>) for
      live messages behind a connection manager that auto-reconnects; persist messages locally so history loads
      instantly and survives offline; paginate older messages from the API. Use a <b>state machine</b> for
      connection state and dedupe via message ids/timestamps.</p>
    <p>Red flag: trusting arrival order as delivery order — reconnects and retries reorder messages, so ordering
      has to come from timestamps/ids, not socket sequence.</p>
    <p><b>I never trust the socket for ordering or delivery guarantees — that's what local persistence and
      message ids are for.</b></p>`,
    level: "architect",
  },
  {
    id: "cs4",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How would you architect a video streaming app?",
    answerHtml: `<p>Playback has to keep going through bandwidth swings and backgrounding, so adaptivity and
      lifecycle are the design centers, not the player itself: <code>AVPlayer</code> with HLS adaptive
      streaming; a playback coordinator managing the current item, buffering, and background audio (audio
      session + now-playing/remote commands). Prefetch the next item, handle network drops gracefully, and
      support offline downloads via a background <code>URLSession</code>.</p>
    <p><b>HLS adaptive bitrate plus a coordinator that owns buffering and the audio session is what keeps
      playback smooth when the network isn't.</b></p>`,
    level: "architect",
  },
  {
    id: "cs5",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How would you architect an e-commerce checkout?",
    answerHtml: `<p>Checkout is the one flow where an unhandled edge case costs real money, so the design goal
      is making every failure state explicit rather than implicit: a repository for catalog/cart; model
      <b>checkout as a state machine</b> (cart → address → payment → confirm); use <b>StoreKit</b> for digital
      goods (verify transactions, restore) or a payment SDK for physical; keep money math server-authoritative.</p>
    <p>Red flag: treating "payment succeeded" as a single boolean. Retries and flaky networks mean the same
      charge request can fire twice — idempotency keys are what prevent double-charging, not client-side
      guards.</p>
    <p><b>I never trust the client to be the source of truth for money — the server verifies, the client just
      reflects state.</b></p>`,
    level: "architect",
  },
  {
    id: "cs6",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What changes for a security-critical (banking) app?",
    answerHtml: `<p>Every extra layer here is a direct answer to a specific attack, not defense-in-depth for its
      own sake: secrets in the <b>Keychain</b> (Secure Enclave-backed where possible), <b>biometric</b> gating,
      <b>certificate pinning</b> + ATS, jailbreak/integrity checks and <b>App Attest</b>, no sensitive data in
      logs/snapshots (obscure on backgrounding), short sessions, and server as the source of truth. Threat-model
      the data flow first — you can't defend what you haven't mapped.</p>
    <p>Red flag: treating client-side checks (jailbreak detection, obfuscation) as the security boundary. They
      raise the cost of attack; they don't replace server-side authorization and validation.</p>
    <p><b>The client hardens the device, the server enforces the trust boundary — I never let the two swap
      roles.</b></p>`,
    level: "architect",
  },
  {
    id: "cs7",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How would you architect onboarding & auth?",
    answerHtml: `<p>Onboarding is where users churn, so the flow itself has to be a first-class, resumable
      data structure rather than a hardcoded screen sequence: a <b>coordinator/router</b> drives the flow
      (welcome → sign-in → permissions → home) as data, so it's reorderable and testable; tokens in the
      <b>Keychain</b> with centralized refresh; offer <b>Sign in with Apple</b> (Guideline 4.8) and request
      permissions <b>in context</b>. Deep links resolve into the same routes.</p>
    <p>Red flag: refreshing the token independently in every network call site — that's exactly what causes
      refresh races (two requests racing to refresh, one invalidating the other's new token). Centralize refresh
      behind one actor/queue.</p>
    <p><b>I centralize token refresh in one place so no two requests can race to invalidate each other's
      token.</b></p>`,
    level: "architect",
  },
  {
    id: "cs8",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How would you architect a large modular 'super-app' for many teams?",
    answerHtml: `<p>At many-team scale the bottleneck stops being runtime performance and becomes build times
      and merge conflicts, so the architecture optimizes for team independence: a <b>modular monolith</b> —
      feature <b>Swift packages</b> depending on shared Core/DesignSystem/Networking, never on each other; a
      <b>router</b> + interface modules for cross-feature navigation without cycles; <b>feature flags</b> for
      independent rollout; CI that builds/tests only changed packages.</p>
    <p>Red flag: letting one feature import another "just this once" for convenience — that one import cycle is
      how a modular monolith quietly becomes a distributed spaghetti monolith.</p>
    <p><b>The dependency graph is the architecture — I enforce acyclic boundaries in CI, not just in code
      review.</b></p>`,
    level: "architect",
  },
  {
    id: "cs9",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How would you architect a ride/delivery tracking app?",
    answerHtml: `<p>The core tension is that users want second-by-second accuracy but the OS (and their
      battery) punishes apps that ask for it constantly, so the design is a deliberate accuracy/battery
      trade-off: CoreLocation with the right update mode (significant-change/region vs continuous) and careful
      <b>background location</b> + battery budget; a live map (MapKit) with a smoothly-updating annotation; a
      <b>Live Activity</b> + push for ETA on the Lock Screen/Dynamic Island; server pushes drive updates.</p>
    <p>Red flag: requesting continuous high-accuracy location for the whole trip "to be safe" — that drains the
      battery fast enough to get the app flagged in reviews. Scale accuracy to what the current screen actually
      needs.</p>
    <p><b>I only ask for the location accuracy the current screen needs, not the maximum the API allows.</b></p>`,
    level: "architect",
  },
  {
    id: "cs10",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How would you architect a health/fitness app?",
    answerHtml: `<p>Health data has both a technical and a trust constraint, so the architecture is built
      around HealthKit as the single hub rather than a custom store: background delivery + anchored queries for
      incremental sync, a watchOS companion with an <b>HKWorkoutSession</b> for live tracking, and Core Motion
      for steps/activity. Treat health data as highly sensitive — on-device, minimal, no ads.</p>
    <p>Red flag: treating an empty HealthKit query result as "no data exists." A denied read permission returns
      the same empty result as no data — the UI can't distinguish them, so design for "assume available, degrade
      gracefully" rather than branching on absence.</p>
    <p><b>I never build UI that infers permission state from data shape — HealthKit deliberately makes denied
      and empty indistinguishable.</b></p>`,
    level: "architect",
  },
  {
    id: "cs11",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How would you architect a news/reader app with subscriptions?",
    answerHtml: `<p>Readers expect articles to open instantly and subscribers expect access to just work across
      devices, so both caching and entitlement checks are designed to be resolved locally first: repository over
      API with aggressive <b>caching</b> (ETag) and a local store for <b>offline reading</b>; prefetch/download
      articles; <b>StoreKit 2</b> auto-renewable subscriptions (entitlement check via
      <code>Transaction.currentEntitlements</code>, server notifications for the source of truth) gating premium
      content.</p>
    <p>Red flag: checking subscription status only against your own server on every launch — that fails offline
      and adds latency to the paywall check. StoreKit 2's local entitlement API answers "is this active" without
      a network round trip; the server notification is for keeping your backend in sync, not for gating the
      UI.</p>
    <p><b>I gate content on StoreKit's local entitlement, and treat the server as the reconciliation source, not
      the request path.</b></p>`,
    level: "architect",
  },
  {
    id: "cs12",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How would you architect a photo-editing app?",
    answerHtml: `<p>The live preview has to stay at 60fps while edits chain together, so the pipeline is designed
      around one <code>CIContext</code> doing GPU work once, not per-filter: pick images via
      <b>PhotosPicker</b> (no permission); build a <b>Core Image</b> pipeline (reused <code>CIContext</code>,
      chained filters rendered once on the GPU); keep edits as a <b>non-destructive</b> list of operations you
      can reorder/undo; downsample for the live preview and render full-res only on export.</p>
    <p>Red flag: creating a new <code>CIContext</code> per filter application or per frame — that's the most
      common cause of a laggy editor, since context creation is expensive and meant to be reused.</p>
    <p><b>Edits are a list of operations replayed on demand, not baked-in pixel mutations — that's what makes
      undo and full-res export both trivial.</b></p>`,
    level: "architect",
  },
  {
    id: "cs13",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How would you architect a dashboard/analytics app?",
    answerHtml: `<p>Dashboards fail two ways — slow rendering and misleading charts — so the architecture guards
      against both: a repository feeding view models that expose ready-to-render series; <b>Swift Charts</b>
      with data <b>aggregated/downsampled</b> off the main actor; cache results and refresh on an interval/pull;
      handle large datasets with scrollable charts and bounded visible domains.</p>
    <p><b>I downsample before the chart ever sees the data, and I keep axes/units honest — a fast chart that
      lies is worse than a slow one.</b></p>`,
    level: "senior",
  },
  {
    id: "cs14",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How would you architect an app + widget + watch ecosystem?",
    answerHtml: `<p>App, widget, and watch are separate processes with separate memory budgets, so the design
      goal is one shared source of logic and data, not three re-implementations: put shared models/logic in a
      <b>Swift package</b> all targets import; share data through an <b>App Group</b> (and/or CloudKit) so the
      widget and watch read what the app wrote; build complications and widgets on the same
      <b>WidgetKit</b> timeline code; trigger widget reloads via <code>WidgetCenter</code>.</p>
    <p>Red flag: forgetting that widget/watch extensions run under tight memory limits and get killed for doing
      app-sized work — timeline providers need to be lean and fast, not just correct.</p>
    <p><b>One shared package is the model layer for all three targets — the widget and watch never duplicate
      logic, they just read what the app wrote.</b></p>`,
    level: "architect",
  },
  {
    id: "cs15",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How would you migrate a large UIKit app to SwiftUI?",
    answerHtml: `<p>A big-bang rewrite risks the app for months with no shippable middle state, so the goal is
      always to keep the app releasable at every step: migrate <b>incrementally</b> — host new SwiftUI screens in
      UIKit via <code>UIHostingController</code> and embed UIKit pieces in SwiftUI via representables; migrate
      leaf screens first, share the model layer, and keep one source of truth for navigation during the
      transition.</p>
    <p>Red flag: proposing a full rewrite to a stakeholder as "the clean solution" — it reads as senior-sounding
      but it's the riskiest option; the incremental path is the actually disciplined one.</p>
    <p><b>I migrate leaf-first and keep exactly one source of truth for navigation throughout — that's what
      keeps a half-migrated app shippable instead of broken.</b></p>`,
    level: "architect",
  },
  {
    id: "cs16",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How do you choose an architecture and avoid over-engineering?",
    answerHtml: `<p>Over-engineering costs the same team velocity that under-engineering does, just later and
      more expensively, so the choice is driven by concrete forcing functions, not personal taste: match it to
      <b>team size, app complexity, and lifespan</b> — MVVM + repositories for most apps, unidirectional/TCA when
      logic and team scale justify the ceremony, modular packages when many people touch the codebase. Add a
      layer/protocol when a <b>second implementation or a test</b> needs it, not speculatively.</p>
    <p>The pitch when someone pushes for more ceremony up front: yes, a thinner layer costs you a slightly
      harder refactor if the app scales unexpectedly — but the alternative is paying abstraction tax on day one
      for flexibility you may never use, and untangling premature abstractions later is harder than adding a real
      one when a second implementation shows up.</p>
    <p><b>I add architecture in response to a real second need, not in anticipation of one — the simplest
      shippable design wins until proven otherwise.</b></p>`,
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
      a defined conflict policy. "Sync synchronously on tap" is tempting because it feels simpler to reason
      about, but it blocks the UI on network and silently loses edits made offline — exactly the failure mode
      offline-first is meant to prevent.</p>`,
  },
  {
    id: "csz2",
    category: "arch",
    categoryLabel: "Architecture",
    question: "A smooth image-heavy feed depends most on:",
    options: ["Bigger images", "Off-main downsampling + caching + stable identity + lazy lists", "AnyView", "More view models"],
    answer: 1,
    explanationHtml: `<p>Decode/downsample off the main thread, cache thumbnails, reuse rows via stable
      identity, and render lazily — that's what keeps scrolling smooth. "Bigger images" is a distractor: image
      size only matters relative to display size, and oversized images actually make main-thread decode
      worse.</p>`,
  },
  {
    id: "csz3",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Modeling checkout as a state machine helps by:",
    options: ["Reducing app size", "Making steps and failure states explicit and testable", "Avoiding StoreKit", "Skipping verification"],
    answer: 1,
    explanationHtml: `<p>Explicit states (cart→address→payment→confirm) prevent invalid combinations and make
      error/edge handling and idempotency clear. "Avoiding StoreKit" is a misread — the state machine is
      orthogonal to which payment SDK you use; it's about making steps and failures explicit, not about which
      framework handles the charge.</p>`,
  },
  {
    id: "csz4",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Cross-feature navigation in a modular app without import cycles uses:",
    options: ["Features importing each other", "A router + interface modules", "Singletons", "Global notifications only"],
    answer: 1,
    explanationHtml: `<p>Features depend on a routing interface (and shared interface modules), so a central
      router resolves destinations without A↔B dependencies. Singletons feel like they'd decouple features too,
      but they just hide the coupling — you still have implicit dependencies, minus the compiler's ability to
      catch a cycle.</p>`,
  },
  {
    id: "csz5",
    category: "arch",
    categoryLabel: "Architecture",
    question: "The recommended way to migrate UIKit → SwiftUI is:",
    options: ["A full rewrite", "Incrementally, bridging with hosting/representable", "Never", "Only new apps"],
    answer: 1,
    explanationHtml: `<p>Host SwiftUI in UIKit (and vice-versa), migrate leaf screens first, and share the model.
      A full rewrite sounds like the clean, senior answer, but it freezes feature work for months and risks
      shipping nothing — the incremental path is the one that keeps the app releasable throughout.</p>`,
  },
  {
    id: "csz6",
    category: "arch",
    categoryLabel: "Architecture",
    question: "You should add an extra layer or protocol when:",
    options: ["Always, up front", "A second implementation or a test actually needs it", "Never", "The file gets long"],
    answer: 1,
    explanationHtml: `<p>Introduce abstraction in response to a real need (testing, a second impl), not
      speculatively. "Always, up front" sounds disciplined but it's the classic over-engineering trap — you pay
      abstraction cost for flexibility the app may never use, and the simplest shippable architecture wins until
      a real need proves otherwise.</p>`,
  },
];

export const ADVANCED33_STUDY: StudySection[] = [
  {
    id: "st-adv-73",
    num: "88",
    title: "88 · Architecture case studies: applying the patterns",
    html: `<p><b>What it is.</b> Interviewers use case studies to see if you reach for the right pattern under
      pressure, not to test memorization — so the value here is the recurring moves, not the specific apps:
      <b>repository + MVVM</b> behind protocols; the <b>local store as source of truth</b> with a sync engine for
      offline; <b>actor-backed caches</b> and off-main work for media; a <b>state machine</b> for multi-step or
      connection-heavy flows (checkout, chat); a <b>router/coordinator</b> for navigation; <b>modular
      packages</b> + feature flags at team scale; and the right platform piece per job (WebSockets, StoreKit,
      HealthKit, Live Activities, App Group sharing).</p>
    <div class="callout tip"><span class="lbl">Interview shape</span> 1. Clarify requirements. 2. Name the
      layers (UI → ViewModel → Repository → services). 3. Call out the 2–3 <i>hard</i> decisions (pagination,
      conflict resolution, verification, battery). 4. Mention testing/observability. <br/><b>Say this:</b> "The
      architecture follows from the two or three hardest constraints, not the other way around."</div>`,
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
