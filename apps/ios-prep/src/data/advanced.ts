// Advanced depth batch — senior / architect / beyond. Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

// Reuse the main category filters (these cards use existing categories).
export const ADVANCED_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED_FLASHCARDS: Flashcard[] = [
  {
    id: "a1",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "some vs any (opaque types vs existentials) — what's the difference?",
    answerHtml: `<p><code>some P</code> is an <b>opaque type</b>: one concrete type the compiler knows but you
      don't name — zero overhead, used for things like <code>some View</code>. <code>any P</code> is an
      <b>existential</b>: a box that can hold any conforming type at runtime, with a little indirection. Prefer
      <code>some</code> for performance and identity; use <code>any</code> when you genuinely need a
      heterogeneous collection.</p>`,
    level: "senior",
  },
  {
    id: "a2",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What is a result builder?",
    answerHtml: `<p>A compile-time DSL feature: methods like <code>buildBlock</code> transform a sequence of
      statements into a single value. <code>@ViewBuilder</code> is one — it's how SwiftUI lets you list child
      views in a <code>body</code> without commas or arrays. You can write your own for custom DSLs.</p>`,
    level: "senior",
  },
  {
    id: "a3",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What problem do Swift macros solve?",
    answerHtml: `<p>They generate boilerplate at compile time from an annotation, with full type information
      and no runtime cost. <code>@Observable</code> and Swift Testing's <code>#expect</code> are macros. They
      replaced a lot of what people used to do with manual codegen or runtime reflection.</p>`,
    level: "senior",
  },
  {
    id: "a4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "When do you use GeometryReader, and what's the catch?",
    answerHtml: `<p>Use it to read the size/position the parent offers (e.g. responsive layout). The catch: it
      greedily takes all offered space and can break layouts if overused. Prefer layout modifiers, the
      <code>Layout</code> protocol, or <code>containerRelativeFrame</code> first; reach for GeometryReader only
      when you truly need measured geometry.</p>`,
    level: "senior",
  },
  {
    id: "a5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is a PreferenceKey for?",
    answerHtml: `<p>It passes data <b>up</b> the view tree (children → ancestor), the opposite of
      <code>@Environment</code>. Classic use: a child reports its measured size via a preference, and a parent
      reads it to coordinate layout (e.g. equal-width buttons, a custom tab indicator).</p>`,
    level: "senior",
  },
  {
    id: "a6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How can making a view Equatable improve performance?",
    answerHtml: `<p>Wrapping a view in <code>EquatableView</code> (or conforming and using
      <code>.equatable()</code>) lets SwiftUI skip re-evaluating <code>body</code> when inputs are unchanged.
      Use it surgically for expensive subtrees — measure first; needless equality checks can cost more than they
      save.</p>`,
    level: "senior",
  },
  {
    id: "a7",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "AsyncStream vs AsyncSequence — what are they?",
    answerHtml: `<p><code>AsyncSequence</code> is the protocol for values produced over time you iterate with
      <code>for await</code>. <code>AsyncStream</code> is a concrete way to <b>build</b> one — often to bridge a
      delegate or callback API into async, yielding values into a continuation and finishing it when done.</p>`,
    level: "senior",
  },
  {
    id: "a8",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "What is actor reentrancy and why does it bite people?",
    answerHtml: `<p>When an actor method <code>await</code>s, it can suspend and let <i>other</i> calls into the
      actor run before it resumes — so state you read before the await may have changed after it. Don't assume
      invariants hold across an <code>await</code>; re-check state, or restructure to avoid the gap.</p>`,
    level: "architect",
  },
  {
    id: "a9",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "What is a global actor (like @MainActor) under the hood?",
    answerHtml: `<p>A singleton actor whose isolation you can apply to many declarations with an attribute.
      <code>@MainActor</code> is the built-in one for the main thread. You can define your own (e.g. a
      <code>@DatabaseActor</code>) to force all DB access onto one serialized executor.</p>`,
    level: "architect",
  },
  {
    id: "a10",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What does a Coordinator/Router do?",
    answerHtml: `<p>It centralizes navigation: features emit intent (a <code>Route</code> value), the router
      decides how to present it and owns the <code>NavigationStack</code> path. This decouples features from
      each other and from presentation, and makes deep links and state restoration a matter of building the
      path.</p>`,
    level: "senior",
  },
  {
    id: "a11",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How do feature flags fit into architecture?",
    answerHtml: `<p>They let you merge and ship code that's off by default, then enable it remotely — decoupling
      deploy from release. They power gradual rollouts, A/B tests, and a kill switch to disable a broken feature
      without shipping a new build through review.</p>`,
    level: "architect",
  },
  {
    id: "a12",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "NSCache vs a Dictionary for in-memory caching?",
    answerHtml: `<p><code>NSCache</code> is thread-safe and <b>evicts under memory pressure</b> automatically,
      so it won't grow unbounded; a plain dictionary does neither. For a Swift-concurrency design, wrap a cache
      in an <code>actor</code>; use <code>NSCache</code> when you want automatic purging.</p>`,
    level: "senior",
  },
  {
    id: "a13",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you keep work running when the app is backgrounded?",
    answerHtml: `<p>Use the right tool: <code>URLSession</code> background configuration for large downloads
      that survive suspension, <code>BGTaskScheduler</code> (BGAppRefreshTask / BGProcessingTask) for periodic
      refresh and maintenance, and <code>beginBackgroundTask</code> for a short finish-up window. The OS, not
      you, decides exact timing.</p>`,
    level: "senior",
  },
  {
    id: "a14",
    category: "perf",
    categoryLabel: "Performance",
    question: "What are os_signpost / signposts used for?",
    answerHtml: `<p>They mark intervals and events in your code that show up in Instruments, so you can measure
      the duration of <i>your own</i> operations (e.g. "parse feed", "render frame") rather than guessing
      from raw stack samples. Pair with the Points of Interest or a custom instrument.</p>`,
    level: "senior",
  },
  {
    id: "a15",
    category: "perf",
    categoryLabel: "Performance",
    question: "What does .drawingGroup() do?",
    answerHtml: `<p>It flattens a SwiftUI subtree into a single Metal-rendered layer, which can dramatically
      speed up complex vector/graphic content (many shapes, blends). It's a targeted tool — overusing it or
      applying it to simple views can hurt, so measure.</p>`,
    level: "senior",
  },
  {
    id: "a16",
    category: "security",
    categoryLabel: "Security",
    question: "What is certificate / public-key pinning?",
    answerHtml: `<p>Validating that the server's TLS certificate (or its public key) matches one you've pinned,
      so a compromised or rogue CA can't man-in-the-middle you. Implement via a
      <code>URLSessionDelegate</code> auth challenge. Pin the public key (not the leaf cert) so rotation doesn't
      brick the app.</p>`,
    level: "senior",
  },
  {
    id: "a17",
    category: "security",
    categoryLabel: "Security",
    question: "What are data protection classes?",
    answerHtml: `<p>File-level encryption tied to device lock state. The default
      (<code>NSFileProtectionComplete</code>) makes files unreadable while the device is locked. Choose a less
      strict class only when you need background access to a file while locked. It's encryption at rest with no
      crypto code from you.</p>`,
    level: "senior",
  },
  {
    id: "a18",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What changed with StoreKit 2?",
    answerHtml: `<p>StoreKit 2 is a modern, async/await API for in-app purchases with signed, on-device
      <b>transaction verification</b> (JWS) — far less server round-tripping to validate receipts. You
      <code>await Product.products(for:)</code>, call <code>purchase()</code>, and verify the returned
      transaction.</p>`,
    level: "senior",
  },
  {
    id: "a19",
    category: "test",
    categoryLabel: "Testing",
    question: "What is snapshot testing and when is it worth it?",
    answerHtml: `<p>Render a view to an image and compare against a stored reference; the test fails on visual
      diffs. Great for catching unintended UI changes in a design system, but reference images are brittle
      across OS/device changes — scope them and review diffs deliberately.</p>`,
    level: "mid",
  },
  {
    id: "a20",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What do SwiftLint and xcconfig files give a team?",
    answerHtml: `<p><b>SwiftLint</b> enforces consistent style and catches smells in CI, so reviews focus on
      substance. <b>xcconfig</b> files move build settings out of the project file into versioned text — per-env
      configuration (Debug/Release/Staging) with fewer merge conflicts and clearer diffs.</p>`,
    level: "senior",
  },
];

export const ADVANCED_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED_QUIZ: QuizQuestion[] = [
  {
    id: "az1",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "`some View` (an opaque return type) means the function returns:",
    options: ["Any type at runtime", "One specific type the caller doesn't name", "A protocol box", "Void"],
    answer: 1,
    explanationHtml: `<p>Opaque types fix one concrete underlying type known to the compiler but hidden from
      callers — no existential boxing. <code>any View</code> would be the runtime existential.</p>`,
  },
  {
    id: "az2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "To pass measured size from a child UP to an ancestor you use:",
    options: ["@Environment", "A PreferenceKey", "@State", "@Binding"],
    answer: 1,
    explanationHtml: `<p>Preferences flow up the tree; the environment flows down. A child sets a preference
      and an ancestor reads it with <code>onPreferenceChange</code>.</p>`,
  },
  {
    id: "az3",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "Actor reentrancy means that across an await inside an actor method:",
    options: ["Nothing else can run on the actor", "Other calls may run and mutate state", "The actor deadlocks", "State is frozen"],
    answer: 1,
    explanationHtml: `<p>Suspending at an <code>await</code> lets other calls into the actor proceed, so
      invariants you checked before the await may not hold after it. Re-check state.</p>`,
  },
  {
    id: "az4",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "AsyncStream is most commonly used to:",
    options: ["Replace Codable", "Bridge a callback/delegate API into an AsyncSequence", "Block the main actor", "Cache images"],
    answer: 1,
    explanationHtml: `<p>You yield values into its continuation from a delegate/callback and finish it when
      done, exposing the source as something you iterate with <code>for await</code>.</p>`,
  },
  {
    id: "az5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Compared with a plain dictionary, NSCache automatically:",
    options: ["Encrypts entries", "Evicts under memory pressure and is thread-safe", "Persists to disk", "Sorts keys"],
    answer: 1,
    explanationHtml: `<p>NSCache purges itself when memory is tight and is safe for concurrent access — a plain
      dictionary does neither and can grow unbounded.</p>`,
  },
  {
    id: "az6",
    category: "appstore",
    categoryLabel: "App Store",
    question: "A headline feature of StoreKit 2 is:",
    options: ["XML receipts only", "Async API with on-device signed transaction verification", "No need to offer IAP", "It removes subscriptions"],
    answer: 1,
    explanationHtml: `<p>StoreKit 2 is async/await with cryptographically signed (JWS) transactions you can
      verify on device, cutting the server receipt-validation dance.</p>`,
  },
  {
    id: "az7",
    category: "security",
    categoryLabel: "Security",
    question: "Public-key pinning protects against:",
    options: ["Slow networks", "A rogue/compromised CA performing a MITM", "Large downloads", "Memory leaks"],
    answer: 1,
    explanationHtml: `<p>Pinning the server's public key means a fraudulently issued certificate from another
      CA won't validate, blocking man-in-the-middle interception.</p>`,
  },
  {
    id: "az8",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Feature flags primarily let you:",
    options: ["Skip code review", "Decouple deploy from release (and kill-switch features)", "Avoid testing", "Reduce app size"],
    answer: 1,
    explanationHtml: `<p>Code ships dark and is enabled remotely, powering gradual rollouts, A/B tests, and the
      ability to disable a broken feature without a new build.</p>`,
  },
];

export const ADVANCED_STUDY: StudySection[] = [
  {
    id: "st-adv-1",
    num: "16",
    title: "16 · Swift 6 & the concurrency migration",
    html: `<p><b>What it is.</b> Swift 6 adds a language mode that proves <b>data-race safety at compile time</b>.
      The compiler checks actor isolation and requires values crossing concurrency boundaries to be
      <code>Sendable</code>. You migrate incrementally: stay in Swift 5 mode, turn on strict-concurrency
      warnings, fix them module by module, then flip the language mode.</p>
    <p>The common fixes: annotate UI types <code>@MainActor</code>; make model value types
      <code>Sendable</code>; isolate shared mutable state behind actors; and mark intentionally cross-actor
      closures <code>@Sendable</code>. The payoff is that an entire class of heisenbugs becomes compile errors.</p>
    <div class="callout tip"><span class="lbl">Talk track</span> "I migrate per-module with strict-concurrency
      warnings on, fixing isolation as I go, rather than flipping the whole app to Swift 6 at once." That shows
      you've actually done it.</div>`,
  },
  {
    id: "st-adv-2",
    num: "17",
    title: "17 · Advanced SwiftUI: layout, identity & the render loop",
    html: `<p><b>What it is.</b> Beyond stacks, SwiftUI layout is a negotiation: a parent proposes a size, the
      child chooses, the parent positions it. The custom <code>Layout</code> protocol lets you implement that
      contract directly; <code>PreferenceKey</code> sends data up the tree; and <code>alignmentGuide</code>
      fine-tunes positioning. Understanding <b>identity</b> (structural vs explicit <code>.id()</code>) explains
      why state survives or resets across updates.</p>
    <div class="callout warn"><span class="lbl">Re-render mental model</span> A view re-evaluates its
      <code>body</code> when state it reads changes or its inputs change. The Observation framework narrows that
      to per-property reads. Keep bodies pure and cheap, and give lists stable identity, and the render loop
      stays fast.</div>`,
  },
  {
    id: "st-adv-3",
    num: "18",
    title: "18 · Modular architecture in practice",
    html: `<p><b>What it is.</b> Turning one app target into a graph of local Swift packages. A typical layout:
      an app shell that composes <i>feature</i> packages, which depend on shared <i>Core</i> (models, utilities),
      <i>DesignSystem</i> (components, tokens), and <i>Networking</i> packages — with a strict rule that features
      never import each other. Cross-feature communication goes through a router and shared protocols.</p>
    <p>Get the <b>dependency direction</b> right (everything points inward toward Core) and you gain parallel
      builds, compiler-enforced boundaries, and isolated tests/previews. Migrate by extracting leaf features
      first, then the shared foundations.</p>
    <div class="callout tip"><span class="lbl">Architect lens</span> The hard part isn't the tooling — it's
      defining boundaries and keeping the dependency graph acyclic as the app grows.</div>`,
  },
  {
    id: "st-adv-4",
    num: "19",
    title: "19 · Instruments-driven performance",
    html: `<p><b>What it is.</b> A repeatable method: reproduce the slow scenario, profile it, find the single
      biggest cost, fix that, and re-measure. Match the instrument to the symptom — <b>Time Profiler</b> for CPU
      and main-thread work, <b>Allocations</b>/<b>Leaks</b> for memory and retain cycles, the <b>SwiftUI</b>
      instrument for excessive body evaluations, <b>Hangs</b> for unresponsiveness, and <b>os_signpost</b> to
      time your own operations.</p>
    <div class="callout warn"><span class="lbl">Discipline</span> Never optimize on a hunch and never optimize
      two things at once — you won't know which helped. One change, re-measure, keep or revert.</div>`,
  },
];
