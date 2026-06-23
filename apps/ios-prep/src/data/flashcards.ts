import type { Level } from "@/lib/levels";

export type Flashcard = {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  answerHtml: string;
  /** Optional seniority level; defaults are derived per-category in lib/levels. */
  level?: Level;
};

export const FLASHCARD_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "swift", label: "Swift Language" },
  { value: "swiftui", label: "SwiftUI" },
  { value: "uikit", label: "UIKit" },
  { value: "concurrency", label: "Concurrency" },
  { value: "arch", label: "Architecture" },
  { value: "data", label: "Data & Networking" },
  { value: "perf", label: "Performance" },
  { value: "test", label: "Testing" },
  { value: "cicd", label: "CI/CD & Tooling" },
  { value: "appstore", label: "App Store" },
  { value: "security", label: "Security" },
  { value: "ai", label: "On-Device AI" },
];

export const FLASHCARDS: Flashcard[] = [
  {
    id: "q1",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "Struct vs class — what's the core difference and when do you choose each?",
    answerHtml: `<p>Structs are <b>value types</b> (copied on assignment, no shared identity); classes are
      <b>reference types</b> (shared, identity-bearing, ARC-managed). Default to <code>struct</code> for models
      and SwiftUI views; use <code>class</code> when you need shared mutable state, identity, inheritance, or
      reference semantics (e.g. an <code>@Observable</code> model).</p>`,
    level: "junior",
  },
  {
    id: "q2",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "How do you safely work with optionals?",
    answerHtml: `<p>Unwrap with <code>if let</code> / <code>guard let</code>, provide defaults with
      <code>??</code>, and chain with <code>?.</code>. Avoid force-unwrap <code>!</code> except where a
      <code>nil</code> is genuinely a programmer error. <code>guard let … else { return }</code> keeps the happy
      path unindented.</p>`,
    level: "junior",
  },
  {
    id: "q3",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What is copy-on-write and why does it matter for value types?",
    answerHtml: `<p>Swift's standard collections (Array, Dictionary, Set, String) share storage until one copy
      is mutated, then they copy lazily. So passing an <code>Array</code> around is cheap until you write to a
      second reference. It gives value semantics without paying for a copy on every assignment.</p>`,
    level: "mid",
  },
  {
    id: "q4",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "strong vs weak vs unowned — and what's a retain cycle?",
    answerHtml: `<p>A retain cycle is two reference types holding each other strongly, so neither is ever
      freed. Break it with <code>weak</code> (becomes <code>nil</code> when the target deallocates — use when
      the reference can outlive) or <code>unowned</code> (assumes the target outlives — no optional, but
      crashes if wrong). Classic case: <code>[weak self]</code> in an escaping closure.</p>`,
    level: "mid",
  },
  {
    id: "q5",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What is protocol-oriented programming in Swift?",
    answerHtml: `<p>Designing around <b>protocols</b> (with default implementations via extensions) instead of
      class inheritance. You compose behavior from small protocols, get polymorphism without a base class, and
      keep value types. It's the idiomatic Swift alternative to deep class hierarchies.</p>`,
  },
  {
    id: "q6",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What do enums with associated values give you?",
    answerHtml: `<p>They model <b>mutually exclusive states that carry data</b> — e.g.
      <code>enum Load { case idle; case loading; case loaded([Item]); case failed(Error) }</code>. Combined with
      a <code>switch</code>, the compiler forces you to handle every case, eliminating impossible states.</p>`,
    level: "mid",
  },
  {
    id: "q7",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What are property wrappers? Name a few you use.",
    answerHtml: `<p>Reusable property behavior defined once and applied with <code>@</code>. SwiftUI is built on
      them: <code>@State</code>, <code>@Binding</code>, <code>@Environment</code>, <code>@Bindable</code>,
      <code>@Query</code>. You can write your own (e.g. a <code>@UserDefault</code> wrapper).</p>`,
  },
  {
    id: "q8",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What changed with Swift 6?",
    answerHtml: `<p>Swift 6 enables <b>complete, compile-time data-race safety</b>: the compiler checks actor
      isolation and that values crossing concurrency boundaries are <code>Sendable</code>. It's opt-in via the
      language mode so you can migrate incrementally. The practical effect: many concurrency bugs become build
      errors instead of runtime crashes.</p>`,
    level: "senior",
  },
  {
    id: "q9",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What does “declarative UI” mean in SwiftUI?",
    answerHtml: `<p>You describe the UI as a function of state (<code>body</code> returns views for the current
      state); SwiftUI diffs and updates the screen when state changes. You don't imperatively mutate views like
      in UIKit — you change state and let the framework reconcile.</p>`,
    level: "junior",
  },
  {
    id: "q10",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Why does modifier order matter?",
    answerHtml: `<p>Each modifier wraps the view it's applied to, so the chain builds outward.
      <code>.padding().background(.red)</code> pads first then colors the padded area; reversed, the background
      hugs the content and the padding sits outside it. Order changes the result.</p>`,
    level: "junior",
  },
  {
    id: "q11",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "@State vs @Binding vs @Observable — who owns what?",
    answerHtml: `<p><code>@State</code> = state <i>owned</i> by this view. <code>@Binding</code> = a two-way
      reference to state owned elsewhere. <code>@Observable</code> = a reference-type model the views observe;
      own it with <code>@State</code> and bind into it with <code>@Bindable</code>. One source of truth, passed
      down as bindings.</p>`,
    level: "mid",
  },
  {
    id: "q12",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How does the Observation framework (@Observable) improve on ObservableObject?",
    answerHtml: `<p>It tracks reads at the <b>property level</b>, so only views that actually read a changed
      property re-render. <code>ObservableObject</code>/<code>@Published</code> invalidated <i>all</i> observers
      of the object. <code>@Observable</code> (iOS 17+) is less boilerplate and more efficient.</p>`,
    level: "mid",
  },
  {
    id: "q13",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Why must ForEach items have a stable identity?",
    answerHtml: `<p>SwiftUI keys view state and animations to identity. Using the array <i>index</i> as
      <code>id</code> reattaches state to the wrong item when the list reorders or items are inserted/removed.
      Use a real stable id (conform the model to <code>Identifiable</code>).</p>`,
    level: "mid",
  },
  {
    id: "q14",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "When should you use LazyVStack instead of VStack?",
    answerHtml: `<p><code>VStack</code> builds all children immediately; <code>LazyVStack</code> (inside a
      <code>ScrollView</code>) only creates views as they scroll into view. Use lazy stacks (or
      <code>List</code>) for long or unbounded content to keep memory and layout cost down.</p>`,
    level: "mid",
  },
  {
    id: "q15",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is the @Environment property wrapper for?",
    answerHtml: `<p>It reads values injected into the view tree — system values (<code>colorScheme</code>,
      <code>dismiss</code>, <code>modelContext</code>) or your own via <code>environment(_:)</code>. It's
      SwiftUI's built-in dependency injection: set once high up, read anywhere below.</p>`,
  },
  {
    id: "q16",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you animate a state change in SwiftUI?",
    answerHtml: `<p>Wrap the state mutation in <code>withAnimation { … }</code>, or attach
      <code>.animation(_:value:)</code> to a view so it animates when that value changes. SwiftUI interpolates
      between the before/after states automatically.</p>`,
    level: "junior",
  },
  {
    id: "q17",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "Walk through the UIViewController lifecycle.",
    answerHtml: `<p><code>loadView → viewDidLoad</code> (once, set up subviews) →
      <code>viewWillAppear → viewDidAppear</code> (each time it shows) →
      <code>viewWillDisappear → viewDidDisappear</code>. Do one-time setup in <code>viewDidLoad</code>; refresh
      data in <code>viewWillAppear</code>.</p>`,
    level: "mid",
  },
  {
    id: "q18",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "How do you embed a SwiftUI view in UIKit and vice-versa?",
    answerHtml: `<p>SwiftUI inside UIKit: wrap it in a <code>UIHostingController</code> and add it as a child VC.
      UIKit inside SwiftUI: conform to <code>UIViewRepresentable</code> / <code>UIViewControllerRepresentable</code>
      and implement <code>makeUIView</code>/<code>updateUIView</code> (plus a Coordinator for delegates).</p>`,
    level: "mid",
  },
  {
    id: "q19",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "What problem do diffable data sources solve?",
    answerHtml: `<p>They replace manual <code>insertRows</code>/<code>deleteRows</code> bookkeeping for
      table/collection views. You apply a <b>snapshot</b> of sections + items and UIKit computes and animates
      the diff — far fewer "number of rows" inconsistency crashes.</p>`,
    level: "senior",
  },
  {
    id: "q20",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "When would you still drop down to UIKit in a SwiftUI app?",
    answerHtml: `<p>For APIs SwiftUI doesn't fully expose or where you need fine control: complex text input,
      certain camera/AVFoundation views, advanced collection layouts, precise scroll control, or integrating a
      large existing UIKit codebase incrementally.</p>`,
  },
  {
    id: "q21",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "What does async/await actually do under the hood?",
    answerHtml: `<p>An <code>await</code> can <b>suspend</b> the function and free the thread until the awaited
      work completes, then resume — without blocking. It's cooperative scheduling on a thread pool, so you get
      concurrency without manually managing threads or nesting completion handlers.</p>`,
    level: "mid",
  },
  {
    id: "q22",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "What is structured concurrency (async let, task groups)?",
    answerHtml: `<p>Child tasks have a defined scope tied to their parent: with <code>async let</code> or a
      <code>TaskGroup</code>, children run concurrently and are <b>awaited (and cancelled) together</b>. No
      orphaned work — when the scope exits, children are done or cancelled.</p>`,
    level: "senior",
  },
  {
    id: "q23",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "What is an actor and what problem does it solve?",
    answerHtml: `<p>An <code>actor</code> is a reference type that <b>serializes access to its mutable state</b>,
      so concurrent callers can't race. You <code>await</code> its methods from outside. It replaces manual
      locks/queues for protecting shared state (e.g. a cache).</p>`,
    level: "senior",
  },
  {
    id: "q24",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "What does @MainActor mean?",
    answerHtml: `<p>It pins a type or function to the <b>main thread</b>. UI work must be on the main actor;
      annotate view models with <code>@MainActor</code> so their state updates are main-thread-safe by default,
      instead of scattering <code>DispatchQueue.main.async</code>.</p>`,
    level: "mid",
  },
  {
    id: "q25",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "What is Sendable?",
    answerHtml: `<p>A marker protocol meaning a value is <b>safe to pass across concurrency boundaries</b>.
      Value types of Sendable members are Sendable; reference types generally aren't unless immutable or
      otherwise protected. Swift 6 enforces it at compile time, catching data races early.</p>`,
    level: "senior",
  },
  {
    id: "q26",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "How do you bridge a completion-handler API to async/await?",
    answerHtml: `<p>Wrap it with <code>withCheckedContinuation</code> (or
      <code>withCheckedThrowingContinuation</code>): call the old API, then <code>resume</code> the continuation
      exactly once with the result or error. Resuming zero or multiple times is a bug the checked variant traps.</p>`,
    level: "senior",
  },
  {
    id: "q27",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "How does task cancellation work?",
    answerHtml: `<p>Cancellation is <b>cooperative</b>: cancelling a <code>Task</code> sets a flag; your code
      must check it (<code>Task.isCancelled</code> or <code>try Task.checkCancellation()</code>) and stop. Many
      stdlib async calls throw <code>CancellationError</code> on await. Structured children cancel with their
      parent.</p>`,
    level: "senior",
  },
  {
    id: "q28",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What does MVVM look like in SwiftUI?",
    answerHtml: `<p>The View renders state and forwards user intent; an <code>@Observable</code> ViewModel holds
      presentation state and logic and talks to services/repositories. The View stays thin and the ViewModel is
      unit-testable without UI. SwiftUI's data flow makes this natural.</p>`,
    level: "mid",
  },
  {
    id: "q29",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Why modularize an app into Swift packages?",
    answerHtml: `<p>Faster incremental and parallel builds, enforced boundaries (features can't import each
      other), isolated tests and previews, and clearer ownership. It's the highest-leverage structural decision
      in a large iOS codebase — a "modular monolith".</p>`,
    level: "architect",
  },
  {
    id: "q30",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How do you make a view model testable?",
    answerHtml: `<p>Depend on <b>protocols</b> and inject them (initializer injection or
      <code>@Environment</code>) instead of constructing singletons/<code>URLSession</code> inside. In tests
      you pass a fake; in previews a stub. No network, deterministic results.</p>`,
    level: "senior",
  },
  {
    id: "q31",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What is the repository pattern and why use it?",
    answerHtml: `<p>A repository sits between the UI and data sources (network + local store). View models ask it
      for domain models; it owns decoding, caching, and the fresh-vs-cached decision. Benefits: one source of
      truth, a clean seam for testing, and one place for retries/auth/pagination.</p>`,
    level: "senior",
  },
  {
    id: "q32",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What is Codable and how do you map mismatched JSON keys?",
    answerHtml: `<p><code>Codable = Encodable & Decodable</code> — automatic JSON↔type mapping. Rename fields
      with a <code>CodingKeys</code> enum, or set <code>decoder.keyDecodingStrategy = .convertFromSnakeCase</code>.
      Custom dates via <code>dateDecodingStrategy</code>.</p>`,
    level: "junior",
  },
  {
    id: "q33",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you fetch data with modern URLSession?",
    answerHtml: `<p><code>let (data, response) = try await URLSession.shared.data(from: url)</code>, check the
      <code>HTTPURLResponse</code> status, then <code>JSONDecoder().decode(...)</code>. No completion handlers,
      no manual thread hops — it's async and cancellable.</p>`,
    level: "junior",
  },
  {
    id: "q34",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "SwiftData vs Core Data — when each?",
    answerHtml: `<p>SwiftData (iOS 17+) is the modern, Swift-native layer: <code>@Model</code> classes,
      <code>@Query</code>, less boilerplate. Core Data is older but more powerful for complex migrations, fine
      control, and older deployment targets. SwiftData is built on Core Data under the hood.</p>`,
    level: "mid",
  },
  {
    id: "q35",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Where should you store an auth token?",
    answerHtml: `<p>The <b>Keychain</b> — it's encrypted and hardware-backed. Never <code>UserDefaults</code>
      (an unencrypted plist). UserDefaults is for small non-sensitive preferences only.</p>`,
    level: "mid",
  },
  {
    id: "q36",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you design an offline-first app?",
    answerHtml: `<p>Make the <b>local store the source of truth</b>: the UI reads from SwiftData/Core Data and
      a background sync engine reconciles with the server. Queue mutations (idempotent), retry on reconnect, and
      define a conflict-resolution policy (last-write-wins, server-authoritative, or per-field merge).</p>`,
    level: "architect",
  },
  {
    id: "q37",
    category: "perf",
    categoryLabel: "Performance",
    question: "What's the first rule of optimization, and which tool?",
    answerHtml: `<p><b>Measure first</b> — guesses are usually wrong. Use <b>Instruments</b>: Time Profiler for
      CPU, Allocations/Leaks for memory, the SwiftUI instrument for view-body counts, and Hangs for main-thread
      stalls. Find the hotspot, then fix it.</p>`,
    level: "senior",
  },
  {
    id: "q38",
    category: "perf",
    categoryLabel: "Performance",
    question: "Why can a SwiftUI list scroll poorly, and how do you fix it?",
    answerHtml: `<p>Usually expensive work in <code>body</code> (decoding, sorting) or full-res images in small
      cells. Fix: keep <code>body</code> cheap and pure, downsample images off the main actor and cache them,
      use <code>List</code>/<code>LazyVStack</code>, and give rows stable identity so views are reused.</p>`,
    level: "senior",
  },
  {
    id: "q39",
    category: "perf",
    categoryLabel: "Performance",
    question: "How do you find and fix a memory leak?",
    answerHtml: `<p>Use the Leaks/Allocations instruments (or the Memory Graph debugger) to spot objects that
      never deallocate — usually a <b>retain cycle</b>. Fix by making one reference <code>weak</code>/
      <code>unowned</code>, commonly <code>[weak self]</code> in an escaping closure.</p>`,
    level: "senior",
  },
  {
    id: "q40",
    category: "perf",
    categoryLabel: "Performance",
    question: "What slows app launch and how do you improve it?",
    answerHtml: `<p>Heavy work on the main thread at startup, too much eager initialization, large asset loads.
      Defer non-essential setup, lazy-load, move work off the main actor, and measure cold launch with the
      App Launch instrument. Set a launch-time budget and watch it in CI.</p>`,
    level: "senior",
  },
  {
    id: "q41",
    category: "test",
    categoryLabel: "Testing",
    question: "XCTest vs Swift Testing?",
    answerHtml: `<p>XCTest is the established framework (<code>XCTAssert</code>, <code>setUp/tearDown</code>).
      Swift Testing (Xcode 16+) is the modern one: <code>@Test</code> functions, <code>#expect</code>/
      <code>#require</code> macros, built-in parameterized tests, and clean async support. New projects favor
      Swift Testing; both coexist.</p>`,
    level: "mid",
  },
  {
    id: "q42",
    category: "test",
    categoryLabel: "Testing",
    question: "How do you test code that makes network calls?",
    answerHtml: `<p>Don't hit the network. Depend on an <code>APIClient</code> protocol and inject a mock that
      returns canned responses (or a <code>URLProtocol</code> stub). The view model runs deterministically and
      offline. This is why dependency injection matters.</p>`,
    level: "mid",
  },
  {
    id: "q43",
    category: "test",
    categoryLabel: "Testing",
    question: "What belongs in a UI test vs a unit test?",
    answerHtml: `<p>Unit tests cover logic (view models, parsing, business rules) — fast and numerous. UI tests
      (XCUITest) cover a few critical end-to-end flows (login, checkout) — slower and fragile, so keep them
      focused. Push logic into testable units so UI tests stay thin.</p>`,
  },
  {
    id: "q44",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "Xcode Cloud vs Fastlane?",
    answerHtml: `<p>Xcode Cloud is Apple's hosted CI, tightly integrated with App Store Connect and signing —
      low setup. Fastlane is the cross-platform automation standard (lanes for build/test/ship) that runs on any
      CI like GitHub Actions and gives more control. Teams often use one or both.</p>`,
    level: "senior",
  },
  {
    id: "q45",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "Explain code signing: certificates vs provisioning profiles.",
    answerHtml: `<p>A <b>certificate</b> identifies the developer/team (signing identity). A <b>provisioning
      profile</b> ties together an App ID, allowed devices, and a certificate to authorize a build to run/ship.
      Automatic signing handles common cases; Fastlane <i>match</i> shares them reproducibly across a team.</p>`,
    level: "senior",
  },
  {
    id: "q46",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "Version string vs build number?",
    answerHtml: `<p><b>Version</b> (<code>CFBundleShortVersionString</code>, e.g. 2.3.0) is the marketing
      version users see. <b>Build number</b> (<code>CFBundleVersion</code>) must increase with every upload to
      App Store Connect, even for the same version. CI usually auto-increments the build number.</p>`,
    level: "mid",
  },
  {
    id: "q47",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What are common App Store review rejections?",
    answerHtml: `<p>Crashes/incomplete features, privacy issues (missing usage-description strings, undisclosed
      data collection), misleading metadata or screenshots, using private APIs, and broken links. Most are
      avoidable with complete metadata, honest App Privacy answers, and TestFlight smoke-testing first.</p>`,
    level: "senior",
  },
  {
    id: "q48",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What is a phased release?",
    answerHtml: `<p>An automatic, gradual rollout of an App Store update to a growing percentage of users over
      about 7 days. If crash rates spike you can pause it and ship a fix before everyone updates. Pair it with
      crash monitoring and a kill-switch flag.</p>`,
    level: "senior",
  },
  {
    id: "q49",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What is TestFlight for?",
    answerHtml: `<p>Apple's beta distribution: upload a build and invite internal (team) or external (up to
      10,000) testers before App Store release. It runs the same review-lite checks and collects feedback and
      crash logs — your last gate before shipping.</p>`,
    level: "mid",
  },
  {
    id: "q50",
    category: "security",
    categoryLabel: "Security",
    question: "How do you add Face ID / Touch ID to a flow?",
    answerHtml: `<p>Use the LocalAuthentication framework: create an <code>LAContext</code>, check
      <code>canEvaluatePolicy</code>, then <code>evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, …)</code>.
      Always provide a fallback (passcode) and a clear <code>localizedReason</code>.</p>`,
    level: "senior",
  },
  {
    id: "q51",
    category: "security",
    categoryLabel: "Security",
    question: "What is App Transport Security (ATS)?",
    answerHtml: `<p>A policy that forces network connections over <b>HTTPS with modern TLS</b> by default.
      Plaintext HTTP is blocked unless you add a (justified, App-Review-scrutinized) exception in
      <code>Info.plist</code>. Keep it on.</p>`,
    level: "senior",
  },
  {
    id: "q52",
    category: "security",
    categoryLabel: "Security",
    question: "What is a privacy manifest and why does it matter?",
    answerHtml: `<p>A <code>PrivacyInfo.xcprivacy</code> file declaring the data your app (and SDKs) collect and
      the <b>required-reason APIs</b> you use. Apple requires it for submission and uses it to build the App
      Privacy label. Missing or inaccurate manifests cause rejections.</p>`,
    level: "senior",
  },
  {
    id: "q53",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "Why run ML on device instead of a server?",
    answerHtml: `<p><b>Privacy</b> (data never leaves the device), <b>latency</b> (no round-trip), <b>offline</b>
      use, and <b>no per-call cost</b>. The Neural Engine accelerates it. Fall back to a server only when the
      task exceeds on-device capability.</p>`,
    level: "beyond",
  },
  {
    id: "q54",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "What is Core ML and how do models get there?",
    answerHtml: `<p>Core ML runs trained models on device, optimized for the CPU/GPU/Neural Engine. Train with
      Create ML or convert PyTorch/TensorFlow models using <code>coremltools</code>, then optimize (quantize,
      prune) to fit latency and memory budgets.</p>`,
    level: "beyond",
  },
  {
    id: "q55",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "Which frameworks cover common on-device ML tasks?",
    answerHtml: `<p><b>Vision</b> for images (detection, text recognition), <b>Natural Language</b> for text,
      <b>Speech</b> for transcription, and <b>Sound Analysis</b> for audio — all on-device. <b>Apple
      Intelligence</b> adds system-level generative features and on-device foundation models.</p>`,
    level: "beyond",
  },
];
