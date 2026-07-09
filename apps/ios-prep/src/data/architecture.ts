export type ArchSection = { id: string; num: string; title: string; html: string };
export type DeepDive = { id: string; pill: string; title: string; html: string };

export const ARCH_INTRO =
  "A tour of how iOS apps are designed at scale — patterns, module boundaries, data flow, concurrency, and release. This is the “how would you build a large iOS app” material that separates senior and architect answers from feature work.";

export const ARCH_SECTIONS: ArchSection[] = [
  {
    id: "arch-1",
    num: "01",
    title: "01 · Architecture patterns: MVC → MVVM → TCA",
    html: `<p>iOS has moved from UIKit's <b>MVC</b> (which often became "Massive View Controller") to
      <b>MVVM</b>, where a view model holds presentation logic and state and the view stays thin and testable.
      SwiftUI's data flow is naturally MVVM-friendly; some teams go further with a <b>unidirectional</b> /
      <b>TCA</b> (The Composable Architecture) approach: state in one place, changes via actions through a
      reducer, side effects isolated and testable.</p>
    <div class="callout tip"><span class="lbl">How to choose</span> Small/medium app or a team new to it:
      MVVM with the Observation framework. Large app, many engineers, heavy logic, a premium on testability and
      consistency: a unidirectional architecture (TCA or a hand-rolled equivalent) pays off. <b>"I match the
      architecture to the team and the product's complexity — I don't cargo-cult one pattern everywhere."</b></div>`,
  },
  {
    id: "arch-2",
    num: "02",
    title: "02 · Modularization with Swift packages",
    html: `<p>As an app grows, a single target becomes a bottleneck: slow builds, tangled dependencies, and
      merge pain. Split it into <b>local Swift packages</b> — feature modules plus shared <i>Core</i> /
      <i>DesignSystem</i> / <i>Networking</i> packages — with an explicit <b>dependency direction</b> (features
      depend on core, never on each other).</p>
    <div class="callout tip"><span class="lbl">Payoff</span> Faster incremental and parallel builds, enforced
      boundaries (no accidental cross-feature imports), feature-level tests and previews, and the option to
      build a feature in isolation. <b>"Modularizing into Swift packages is the single highest-leverage
      architecture decision in a large iOS codebase."</b></div>`,
  },
  {
    id: "arch-3",
    num: "03",
    title: "03 · Dependency injection & testability",
    html: `<p>Depend on <b>protocols</b>, not concrete types, and pass dependencies in (initializer injection
      or SwiftUI's <code>@Environment</code>) rather than reaching for singletons. That single discipline makes
      view models testable with fakes, decouples features from infrastructure, and lets you swap
      implementations (e.g. a stub API in previews).</p>
    <div class="callout warn"><span class="lbl">Red flag</span> A view model that constructs
      <code>URLSession.shared</code> or a global singleton internally can't be tested without the network.
      <b>"I inject an APIClient protocol so the view model never talks to the network directly — that's what
      makes it testable with a fake."</b></div>`,
  },
  {
    id: "arch-4",
    num: "04",
    title: "04 · Networking & the repository pattern",
    html: `<p>Put a <b>repository</b> between your UI and the network/persistence layers. View models ask the
      repository for domain models; the repository owns the <code>APIClient</code>, decoding, caching, and the
      decision of when to serve cached vs fresh data. This keeps a single source of truth and a single place to
      add retries, auth refresh, and pagination.</p>
    <div class="callout tip"><span class="lbl">Talk track</span> "UI → ViewModel → Repository → (APIClient +
      Store)." Each layer has one job and a protocol seam for testing. Caching and offline behavior live in the
      repository, not scattered through views.</div>`,
  },
  {
    id: "arch-5",
    num: "05",
    title: "05 · Offline-first & sync",
    html: `<p>For apps that must work without a connection, make the <b>local store the source of truth</b>:
      the UI always reads from SwiftData/Core Data, and a sync engine reconciles with the server in the
      background. You need a strategy for <b>conflict resolution</b> (last-write-wins, server-authoritative, or
      per-field merge), change tracking, and retry of failed mutations.</p>
    <div class="callout warn"><span class="lbl">Hard parts</span> Ordering and idempotency of queued
      mutations, clock skew, and partial failures. <b>"I design the mutation queue and conflict policy
      explicitly up front — offline sync fails at the edges, not the happy path."</b></div>`,
  },
  {
    id: "arch-6",
    num: "06",
    title: "06 · Navigation architecture",
    html: `<p>Centralize routing so navigation is <b>data, not scattered <code>NavigationLink</code>s</b>. A
      router/coordinator owns a <code>NavigationStack</code> path of <code>Route</code> values; features emit
      routes, the router decides how to present them. Deep links and push notifications decode into the same
      <code>Route</code> values, and state restoration becomes "persist and reload the path".</p>
    <div class="callout tip"><span class="lbl">Why</span> Decoupling "what to show" from "how to present it"
      keeps features independent, makes deep linking and A/B-tested flows trivial, and gives you one place to
      reason about the entire navigation graph. <b>"Navigation is data in my apps — a router owns the path, so
      deep links, push notifications, and state restoration all just append a Route."</b></div>`,
  },
  {
    id: "arch-7",
    num: "07",
    title: "07 · Concurrency architecture",
    html: `<p>Design isolation deliberately: UI and view models run on the <code>@MainActor</code>; shared
      mutable state (caches, in-memory stores) lives behind <b>actors</b>; expensive work runs in background
      tasks and hops back to the main actor only to publish results. Under Swift 6, making types
      <code>Sendable</code> and respecting isolation is enforced at compile time — so the architecture has to
      be intentional, not accidental.</p>
    <div class="callout warn"><span class="lbl">Red flag</span> Sprinkling <code>DispatchQueue.main.async</code>
      and locks everywhere is a symptom of undesigned isolation. <b>"I put shared mutable state behind actors
      and pin UI to @MainActor so the compiler proves I'm race-free, instead of policing it by convention."</b></div>`,
  },
  {
    id: "arch-8",
    num: "08",
    title: "08 · Observability, flags & release",
    html: `<p>Production readiness is part of architecture. Wire in <b>structured logging</b> (OSLog),
      <b>metrics</b>/MetricKit, and <b>crash reporting</b>; gate risky features behind <b>feature flags</b> so
      you can ship dark and roll out gradually; and use <b>phased release</b> on the App Store with a rollback
      plan (a flag to disable, or an expedited fix). Define budgets — cold launch, crash-free rate — and watch
      them.</p>
    <div class="callout tip"><span class="lbl">Architect lens</span> "How do you know it's healthy, and how do
      you turn it off if it isn't?" A confident answer to that question — flags, dashboards, phased rollout,
      rollback — is what distinguishes architect-level thinking.</div>`,
  },
];

export const DEEPDIVES_INTRO =
  "The senior playbook in a concept → example → problem → solution shape, so each idea sticks as a real engineering decision rather than a definition.";

export const DEEP_DIVES: DeepDive[] = [
  {
    id: "dd-1",
    pill: "State",
    title: "MVVM vs The Composable Architecture",
    html: `<div class="dd-row">
      <div class="dd-block dd-concept"><span class="lbl">Concept</span> MVVM keeps state in view models;
        TCA centralizes state and routes every change through actions and a reducer, isolating side effects.</div>
      <div class="dd-block dd-example"><span class="lbl">Example</span> A multi-step checkout with shared
        state, analytics, and complex validation across screens.</div>
      <div class="dd-block dd-problem"><span class="lbl">Problem</span> With ad-hoc MVVM, state leaks across
        view models, ordering bugs creep in, and side effects are hard to test.</div>
      <div class="dd-block dd-solution"><span class="lbl">Solution</span> A unidirectional store makes state
        transitions explicit and exhaustively testable; reach for it when complexity and team size justify the
        ceremony — otherwise MVVM is lighter.</div>
    </div>`,
  },
  {
    id: "dd-2",
    pill: "Modularity",
    title: "The modular monolith with SPM",
    html: `<div class="dd-row">
      <div class="dd-block dd-concept"><span class="lbl">Concept</span> Keep one app, but split it into local
        Swift packages with a strict dependency direction.</div>
      <div class="dd-block dd-example"><span class="lbl">Example</span> 30 engineers, one app target, 12-minute
        incremental builds and constant merge conflicts.</div>
      <div class="dd-block dd-problem"><span class="lbl">Problem</span> Everything depends on everything; a
        change anywhere recompiles the world and risks breaking unrelated features.</div>
      <div class="dd-block dd-solution"><span class="lbl">Solution</span> Feature packages depend only on Core
        / DesignSystem; builds parallelize, boundaries are enforced by the compiler, and features ship and test
        independently. <b>"I let the compiler enforce module boundaries instead of a lint rule or code review
        convention."</b></div>
    </div>`,
  },
  {
    id: "dd-3",
    pill: "Data",
    title: "Offline-first sync",
    html: `<div class="dd-row">
      <div class="dd-block dd-concept"><span class="lbl">Concept</span> The local database is the source of
        truth; a sync engine reconciles with the server in the background.</div>
      <div class="dd-block dd-example"><span class="lbl">Example</span> A notes app users edit on the subway
        with no signal.</div>
      <div class="dd-block dd-problem"><span class="lbl">Problem</span> Naive "save to server on tap" loses
        edits offline and shows spinners everywhere.</div>
      <div class="dd-block dd-solution"><span class="lbl">Solution</span> Write locally and render instantly;
        queue mutations with idempotency keys; sync with a defined conflict policy and retry on reconnect.
        <b>"The local store is the source of truth — the UI never waits on the network to show what the user
        just did."</b></div>
    </div>`,
  },
  {
    id: "dd-4",
    pill: "Concurrency",
    title: "Actor-based shared state",
    html: `<div class="dd-row">
      <div class="dd-block dd-concept"><span class="lbl">Concept</span> An actor serializes access to mutable
        state, eliminating data races by construction.</div>
      <div class="dd-block dd-example"><span class="lbl">Example</span> An in-memory image cache hit from many
        concurrent view tasks.</div>
      <div class="dd-block dd-problem"><span class="lbl">Problem</span> A plain dictionary cache accessed from
        multiple tasks crashes or corrupts under load.</div>
      <div class="dd-block dd-solution"><span class="lbl">Solution</span> Wrap the cache in an actor; callers
        <code>await</code> its methods. Swift 6 then proves the absence of races at compile time. <b>"I reach
        for an actor instead of a lock because it makes the race impossible, not just unlikely."</b></div>
    </div>`,
  },
  {
    id: "dd-5",
    pill: "Performance",
    title: "An image-heavy feed that stays at 120fps",
    html: `<div class="dd-row">
      <div class="dd-block dd-concept"><span class="lbl">Concept</span> Smooth scrolling = cheap cells, lazy
        loading, and no main-thread work per frame.</div>
      <div class="dd-block dd-example"><span class="lbl">Example</span> A social feed of full-resolution photos
        in a scrolling list.</div>
      <div class="dd-block dd-problem"><span class="lbl">Problem</span> Decoding 4000px images for 300px cells
        spikes memory and drops frames; the Time Profiler shows decode on the main thread.</div>
      <div class="dd-block dd-solution"><span class="lbl">Solution</span> Downsample off the main actor, cache
        decoded thumbnails in an actor, use <code>LazyVStack</code>, and give rows stable identity so SwiftUI
        reuses them. <b>"Frame drops are almost always decode work leaking onto the main thread — move it off,
        cache the result, and the frame rate takes care of itself."</b></div>
    </div>`,
  },
  {
    id: "dd-6",
    pill: "AI",
    title: "An on-device AI feature",
    html: `<div class="dd-row">
      <div class="dd-block dd-concept"><span class="lbl">Concept</span> Run inference on device for privacy,
        offline use, and zero per-call cost; fall back to the server only when needed.</div>
      <div class="dd-block dd-example"><span class="lbl">Example</span> Smart search that ranks notes by meaning,
        not just keywords.</div>
      <div class="dd-block dd-problem"><span class="lbl">Problem</span> Sending every note to a server is slow,
        costly, and a privacy liability.</div>
      <div class="dd-block dd-solution"><span class="lbl">Solution</span> Embed content with a small Core ML
        model on the Neural Engine, store vectors locally, and rank by cosine similarity — exactly what this
        guide's own search does in your browser. <b>"On-device inference isn't just a privacy story — it's zero
        marginal cost per query and it still works with no signal."</b></div>
    </div>`,
  },
  {
    id: "dd-7",
    pill: "Layers",
    title: "Clean Architecture & the dependency rule",
    html: `<div class="dd-row">
      <div class="dd-block dd-concept"><span class="lbl">Concept</span> Concentric layers (domain → use cases →
        adapters → frameworks) with dependencies pointing only inward; the domain imports nothing.</div>
      <div class="dd-block dd-example"><span class="lbl">Example</span> A pricing engine reused across an app,
        a widget, and a server-side Swift target.</div>
      <div class="dd-block dd-problem"><span class="lbl">Problem</span> Business rules tangled with SwiftUI and
        URLSession can't be reused or tested without spinning up the whole app.</div>
      <div class="dd-block dd-solution"><span class="lbl">Solution</span> Put rules in a framework-free domain
        package; outer layers implement its protocols and wire up at a composition root. Now the core is
        portable and unit-tested with no simulator.</div>
    </div>`,
  },
  {
    id: "dd-8",
    pill: "Testing",
    title: "A test strategy that actually scales",
    html: `<div class="dd-row">
      <div class="dd-block dd-concept"><span class="lbl">Concept</span> A pyramid: many fast unit tests, fewer
        integration tests, a thin layer of end-to-end UI tests on critical flows.</div>
      <div class="dd-block dd-example"><span class="lbl">Example</span> Login, checkout, and sync in a growing
        app with a 20-minute CI budget.</div>
      <div class="dd-block dd-problem"><span class="lbl">Problem</span> Leaning on slow, flaky XCUITests for
        everything makes CI slow and reds out on timing, so people stop trusting it.</div>
      <div class="dd-block dd-solution"><span class="lbl">Solution</span> Push logic into injectable view
        models covered by fast unit tests; keep a handful of UI tests for the money paths; parallelize on
        simulator clones via a test plan. <b>"I keep the pyramid shape on purpose — UI tests verify the money
        paths still work end to end, unit tests do the exhaustive edge-case coverage."</b></div>
    </div>`,
  },
];
