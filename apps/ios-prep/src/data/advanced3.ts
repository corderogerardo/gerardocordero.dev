// Advanced batch 3 — senior/architect deep cuts (concurrency + architecture focus). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED3_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED3_FLASHCARDS: Flashcard[] = [
  {
    id: "d1",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "When do you use a TaskGroup instead of async let?",
    answerHtml: `<p>Use <code>async let</code> for a <b>fixed, small</b> number of concurrent children you name
      individually. Use a <code>TaskGroup</code> (<code>withThrowingTaskGroup</code>) when the number is
      <b>dynamic</b> — e.g. fan out one request per id and collect results as they finish. The group still gives
      structured concurrency: all children complete or are cancelled before it returns.</p>`,
    level: "senior",
  },
  {
    id: "d2",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "What is Task priority and the cooperative thread pool?",
    answerHtml: `<p>Swift concurrency runs tasks on a small <b>cooperative pool</b> (roughly one thread per
      core), not unbounded threads. Tasks carry a <b>priority</b> (e.g. <code>.userInitiated</code>,
      <code>.background</code>) that hints scheduling. The implication: never block a pool thread with sync I/O
      or sleeps — you can starve the whole system. Suspend with <code>await</code> instead.</p>`,
    level: "senior",
  },
  {
    id: "d3",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "Why is Task.detached usually the wrong default?",
    answerHtml: `<p>A detached task <b>opts out of structured concurrency</b>: it doesn't inherit priority,
      task-local values, or actor context, and it isn't cancelled with its parent — so it's easy to leak. Prefer
      a normal child <code>Task</code> (or a task group). Reach for <code>Task.detached</code> only when you
      explicitly need to escape the current context.</p>`,
    level: "architect",
  },
  {
    id: "d4",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "What does @Sendable on a closure mean, and when is it required?",
    answerHtml: `<p>It marks a closure as safe to run concurrently / cross actor boundaries, so everything it
      captures must itself be <code>Sendable</code>. Task closures and many concurrency APIs require it. Under
      Swift 6 the compiler rejects capturing non-Sendable mutable state in a <code>@Sendable</code> closure —
      catching a race at compile time.</p>`,
    level: "senior",
  },
  {
    id: "d5",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "What does `nonisolated` do?",
    answerHtml: `<p>It opts a member <b>out</b> of its type's actor isolation, so it can be called without
      <code>await</code> from any context — valid only when that member touches no isolated mutable state
      (e.g. a pure computed property, or conforming to a synchronous protocol like <code>Hashable</code> on a
      <code>@MainActor</code> type).</p>`,
    level: "architect",
  },
  {
    id: "d6",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "When would you use MainActor.assumeIsolated?",
    answerHtml: `<p>When you're <i>certain</i> you're already on the main thread (e.g. inside a UIKit delegate
      callback the runtime guarantees is main) but the compiler can't prove it. It runs the closure as
      main-actor-isolated <b>without suspending</b>, and traps if you're wrong. It's an escape hatch — prefer
      real <code>@MainActor</code> annotations.</p>`,
    level: "architect",
  },
  {
    id: "d7",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "How do you handle backpressure with AsyncStream?",
    answerHtml: `<p>Choose a <b>buffering policy</b> when you create it: <code>.bufferingNewest(n)</code>,
      <code>.bufferingOldest(n)</code>, or <code>.unbounded</code>. If a fast producer outruns a slow consumer,
      an unbounded buffer grows without limit — pick a bounded policy and decide whether to drop oldest or
      newest. The continuation's <code>onTermination</code> lets you clean up the source.</p>`,
    level: "architect",
  },
  {
    id: "d8",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "How do you cancel cleanly and propagate it?",
    answerHtml: `<p>Cancellation is cooperative and <b>propagates down</b> the structured tree: cancelling a
      parent cancels its children. Check <code>Task.isCancelled</code> or call
      <code>try Task.checkCancellation()</code> at suspension points, and use
      <code>withTaskCancellationHandler</code> to tear down resources (close a stream, abort a request) the
      moment cancellation arrives.</p>`,
    level: "senior",
  },
  {
    id: "d9",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What is the dependency rule in Clean Architecture?",
    answerHtml: `<p>Dependencies point <b>inward</b>: outer layers (UI, frameworks, networking) depend on inner
      layers (use cases, domain entities), never the reverse. Inner layers define protocols; outer layers
      implement them. The domain has zero knowledge of SwiftUI, URLSession, or the database — so it's portable
      and trivially testable.</p>`,
    level: "architect",
  },
  {
    id: "d10",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What are the moving parts of a unidirectional (TCA-style) architecture?",
    answerHtml: `<p><b>State</b> (a single value), <b>Actions</b> (everything that can happen), a <b>Reducer</b>
      (a pure function <code>(state, action) -&gt; effects</code> that also mutates state), and <b>Effects</b>
      (async work that feeds actions back in). Because the reducer is pure and effects are isolated, the whole
      flow is deterministic and exhaustively testable.</p>`,
    level: "architect",
  },
  {
    id: "d11",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How does dependency injection scale beyond passing initializers?",
    answerHtml: `<p>Initializer injection is the clean default. At scale teams add a lightweight <b>container</b>
      / registry (or SwiftUI's <code>@Environment</code> with custom <code>EnvironmentKey</code>s) to compose
      and override dependencies per environment (live, test, preview). The principle stays the same: depend on
      protocols, resolve concretes at the composition root.</p>`,
    level: "architect",
  },
  {
    id: "d12",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How do interface (protocol) modules break dependency cycles?",
    answerHtml: `<p>Extract the protocols a feature needs into a small <b>interface module</b>; features depend
      on the interface, and the concrete implementation depends on it too — but features don't depend on each
      other. This inverts the dependency so two features can interact (e.g. navigate to each other) without a
      compile-time cycle.</p>`,
    level: "architect",
  },
  {
    id: "d13",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How do you navigate between feature modules without coupling them?",
    answerHtml: `<p>Don't let Feature A import Feature B. Instead A emits a <b>route/intent</b> (a value or a
      protocol call) that a central <b>router</b> — which does know the concrete features — resolves into a
      destination. Features depend only on the routing interface, so the dependency graph stays acyclic.</p>`,
    level: "architect",
  },
  {
    id: "d14",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What's a good error-handling strategy across layers?",
    answerHtml: `<p>Use specific error types low down (network, decoding), <b>map</b> them to domain errors in
      the repository/use-case layer, and translate to user-facing messages at the edge. Swift 6's <b>typed
      throws</b> can make a function's error type explicit. The goal: the UI never sees a raw
      <code>URLError</code>, and each layer only handles errors it understands.</p>`,
    level: "senior",
  },
  {
    id: "d15",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How do you layer a caching strategy?",
    answerHtml: `<p>Think in tiers: an in-memory cache (fast, volatile — an actor or <code>NSCache</code>), a
      disk/database cache (survives launches), and the network (source of truth). The repository decides the
      policy — cache-first, network-first, or stale-while-revalidate — and owns invalidation. Keep that logic in
      one place, not scattered through views.</p>`,
    level: "senior",
  },
  {
    id: "d16",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What does an observability architecture include?",
    answerHtml: `<p>Structured logging (<b>OSLog</b>/Logger with privacy redaction), field metrics
      (<b>MetricKit</b>: launch time, hangs, energy), crash + non-fatal reporting, and analytics events behind a
      typed interface so they're testable and swappable. Define SLOs (crash-free rate, cold launch) and surface
      them on a dashboard — you can't operate what you can't see.</p>`,
    level: "architect",
  },
  {
    id: "d17",
    category: "perf",
    categoryLabel: "Performance",
    question: "Hang vs hitch — what's the difference?",
    answerHtml: `<p>A <b>hang</b> is the main thread blocked so the UI is unresponsive (caught by the Hangs
      instrument / MetricKit). A <b>hitch</b> is a single dropped/late frame during animation or scrolling
      (a smoothness problem). Different tools, different fixes: hangs → get work off the main actor; hitches →
      cheaper per-frame work and commits.</p>`,
    level: "senior",
  },
  {
    id: "d18",
    category: "perf",
    categoryLabel: "Performance",
    question: "How do you keep a fast list scrolling smoothly?",
    answerHtml: `<p>Realize cells lazily (<code>List</code>/<code>LazyVStack</code>), give them stable
      identity for reuse, do zero expensive work in <code>body</code>, and <b>prefetch</b> a few rows ahead
      (load images/data before they appear) while <b>cancelling</b> work for rows that scroll away. Validate
      with the Time Profiler and the Animation Hitches instrument.</p>`,
    level: "senior",
  },
  {
    id: "d19",
    category: "perf",
    categoryLabel: "Performance",
    question: "What is MetricKit and why use it?",
    answerHtml: `<p>An on-device framework that delivers <b>aggregated field metrics</b> from real users —
      launch time, hang rate, memory, energy, disk — plus diagnostic payloads for hangs and crashes. It's how
      you measure performance in production, beyond what you can profile locally on one device.</p>`,
    level: "senior",
  },
  {
    id: "d20",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What are typed throws (Swift 6)?",
    answerHtml: `<p>A function can declare the concrete error type it throws: <code>func f() throws(MyError)</code>.
      Callers then catch a known type instead of an opaque <code>any Error</code>. Use it for well-bounded
      domains (parsing, a module's API); keep untyped <code>throws</code> where errors are open-ended.</p>`,
    level: "senior",
  },
  {
    id: "d21",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What problem do noncopyable types (~Copyable) solve?",
    answerHtml: `<p>A type marked <code>~Copyable</code> has <b>unique ownership</b> — it can't be implicitly
      copied, only moved. That lets the compiler enforce single-owner resources (file handles, buffers, locks)
      and prevent use-after-consume bugs. It's a systems-level tool; most app code stays with normal value
      types.</p>`,
    level: "senior",
  },
  {
    id: "d22",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What's the performance cost of `any` (existentials) vs generics?",
    answerHtml: `<p>An existential (<code>any P</code>) boxes the value and dispatches dynamically — slight
      indirection, and it can heap-allocate for large values. Generics (<code>some P</code> / type parameters)
      let the compiler specialize and inline. In hot paths prefer generics; use <code>any</code> for
      heterogeneous storage or to break type-level coupling.</p>`,
    level: "senior",
  },
  {
    id: "d23",
    category: "security",
    categoryLabel: "Security",
    question: "What are App Attest and DeviceCheck for?",
    answerHtml: `<p>They let your server verify a request comes from a <b>genuine, unmodified instance</b> of
      your app on a real Apple device. <b>App Attest</b> issues a hardware-backed key to assert app integrity;
      <b>DeviceCheck</b> stores a couple of per-device bits (e.g. to stop trial-abuse). They fight fraud and
      tampering, not user authentication.</p>`,
    level: "senior",
  },
  {
    id: "d24",
    category: "security",
    categoryLabel: "Security",
    question: "What is the Secure Enclave and what runs there?",
    answerHtml: `<p>A dedicated security coprocessor isolated from the main CPU. Private keys generated there
      <b>never leave</b> it — you ask the Enclave to sign/decrypt, you never see the key. It backs Face ID/Touch
      ID and Keychain items with <code>kSecAttrTokenIDSecureEnclave</code>, so even a compromised app or OS
      can't exfiltrate the key material.</p>`,
    level: "senior",
  },
];

export const ADVANCED3_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED3_QUIZ: QuizQuestion[] = [
  {
    id: "dz1",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "For a dynamic number of concurrent child tasks you should use:",
    options: ["async let for each", "A TaskGroup", "DispatchQueue.concurrentPerform", "Detached tasks in a loop"],
    answer: 1,
    explanationHtml: `<p><code>async let</code> fits a fixed, named set; a <code>TaskGroup</code> handles a
      dynamic count while keeping structured cancellation and completion.</p>`,
  },
  {
    id: "dz2",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "Task.detached is discouraged by default because it:",
    options: ["Is slower to start", "Opts out of priority, task-locals, and parent cancellation", "Can't be awaited", "Only runs on the main actor"],
    answer: 1,
    explanationHtml: `<p>Detached tasks escape structured concurrency: no inherited context and no cancellation
      with the parent, so they leak easily. Prefer a normal child task.</p>`,
  },
  {
    id: "dz3",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "Blocking a cooperative-pool thread with synchronous I/O is bad because:",
    options: ["It uses more memory", "It can starve the whole concurrency system", "It changes the result", "It disables actors"],
    answer: 1,
    explanationHtml: `<p>The pool has roughly one thread per core; blocking one removes it from doing other
      work. Suspend with <code>await</code> instead of blocking.</p>`,
  },
  {
    id: "dz4",
    category: "arch",
    categoryLabel: "Architecture",
    question: "The Clean Architecture dependency rule says dependencies point:",
    options: ["Outward to frameworks", "Inward toward the domain", "Both directions", "Toward the database"],
    answer: 1,
    explanationHtml: `<p>Outer layers depend on inner ones; the domain knows nothing about UI, networking, or
      persistence, which makes it portable and testable.</p>`,
  },
  {
    id: "dz5",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Two feature modules need to navigate to each other. The clean fix is:",
    options: ["Import each other directly", "A shared router/interface they both depend on", "A global singleton", "Merge them into one module"],
    answer: 1,
    explanationHtml: `<p>Features emit routes to a central router (or depend on a small interface module),
      avoiding a direct A↔B dependency cycle.</p>`,
  },
  {
    id: "dz6",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "Typed throws (Swift 6) let a function:",
    options: ["Throw without try", "Declare the concrete error type it throws", "Avoid error handling", "Return optionals only"],
    answer: 1,
    explanationHtml: `<p><code>throws(MyError)</code> makes the thrown type explicit so callers catch a known
      type instead of <code>any Error</code> — best for well-bounded domains.</p>`,
  },
  {
    id: "dz7",
    category: "perf",
    categoryLabel: "Performance",
    question: "A 'hitch' refers to:",
    options: ["The main thread blocked for seconds", "A single late/dropped frame in animation", "A memory leak", "A network timeout"],
    answer: 1,
    explanationHtml: `<p>A hitch is one frame delivered late during scroll/animation. A multi-second
      main-thread block is a hang — different tool, different fix.</p>`,
  },
  {
    id: "dz8",
    category: "security",
    categoryLabel: "Security",
    question: "App Attest is used to:",
    options: ["Authenticate the user", "Prove a request comes from a genuine, untampered app instance", "Encrypt UserDefaults", "Store passwords"],
    answer: 1,
    explanationHtml: `<p>App Attest gives your server hardware-backed assurance of app integrity (anti-fraud /
      anti-tamper) — it is not user authentication.</p>`,
  },
];

export const ADVANCED3_STUDY: StudySection[] = [
  {
    id: "st-adv-8",
    num: "23",
    title: "23 · Concurrency patterns in depth",
    html: `<p><b>What it is.</b> The patterns that come up once async/await basics are second nature.
      <b>Fan-out/fan-in</b> with a task group; <b>bridging</b> callbacks with continuations and
      <code>AsyncStream</code>; <b>isolation</b> design with actors and <code>@MainActor</code>; and disciplined
      <b>cancellation</b>.</p>
    <div class="code">func loadAll(ids: [Int]) async throws -&gt; [Item] {
  try await withThrowingTaskGroup(of: Item.self) { group in
    for id in ids { group.addTask { try await api.item(id) } }
    var items: [Item] = []
    for try await item in group { items.append(item) }
    return items   // children joined or cancelled before return
  }
}</div>
    <div class="callout warn"><span class="lbl">Watch</span> Don't block the cooperative pool with sync work,
      remember actor reentrancy across <code>await</code>, and resume every continuation exactly once. These are
      the three bugs that make async code flaky.</div>`,
  },
  {
    id: "st-adv-9",
    num: "24",
    title: "24 · Clean Architecture & the dependency rule",
    html: `<p><b>What it is.</b> Concentric layers — Entities (domain) → Use Cases → Interface Adapters
      (view models, repositories) → Frameworks (SwiftUI, URLSession, SwiftData) — with one rule: <b>dependencies
      point inward</b>. Inner layers define protocols; outer layers implement them and are wired together at a
      composition root.</p>
    <p>In practice you don't need every layer for every app — the value is the <i>direction</i>. Keep the domain
      free of framework imports and you get code that's portable, parallel-buildable as packages, and testable
      without a simulator.</p>
    <div class="callout tip"><span class="lbl">Pragmatism</span> For most apps, MVVM + repositories already
      honors the dependency rule. Reserve the full layering for large, long-lived codebases where the
      decoupling pays for its ceremony.</div>`,
  },
  {
    id: "st-adv-10",
    num: "25",
    title: "25 · Error-handling strategy",
    html: `<p><b>What it is.</b> A deliberate plan for how errors are typed, mapped, and surfaced. Low layers
      throw specific errors (<code>URLError</code>, <code>DecodingError</code>); the repository/use-case layer
      <b>maps</b> them to domain errors; the UI translates domain errors into messages and recovery actions.
      Swift 6 <b>typed throws</b> can make a module's error contract explicit.</p>
    <div class="callout warn"><span class="lbl">Anti-pattern</span> Catching <code>Error</code> everywhere and
      showing the raw <code>localizedDescription</code> to users. Each layer should handle only the errors it
      understands and translate the rest upward.</div>`,
  },
  {
    id: "st-adv-11",
    num: "26",
    title: "26 · Observability & analytics architecture",
    html: `<p><b>What it is.</b> Knowing how the app behaves in the field. <b>Logging</b> with OSLog/Logger
      (with privacy redaction), <b>MetricKit</b> for aggregated launch/hang/energy metrics and crash
      diagnostics, third-party crash + non-fatal reporting, and <b>analytics</b> events behind a typed protocol
      so they're swappable and testable.</p>
    <p>Define service levels — crash-free sessions, cold-launch budget, hang rate — and watch them on a
      dashboard with alerts. Pair with <b>feature flags</b> so a regression can be turned off remotely while you
      ship a fix.</p>
    <div class="callout tip"><span class="lbl">Architect lens</span> "How do we know it's healthy, and how do
      we turn it off if it isn't?" Observability plus flags is the answer.</div>`,
  },
];
