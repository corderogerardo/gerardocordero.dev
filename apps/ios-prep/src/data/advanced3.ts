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
    answerHtml: `<p>The choice is about whether the shape of the work is known at compile time — that decides
      whether you can name each child or need a collection to hold them. Use <code>async let</code> for a
      <b>fixed, small</b> number of concurrent children you name individually. Use a <code>TaskGroup</code>
      (<code>withThrowingTaskGroup</code>) when the number is <b>dynamic</b> — e.g. fan out one request per id and
      collect results as they finish. The group still gives structured concurrency: all children complete or are
      cancelled before it returns. <b>I use async let when I can name every child; I reach for a TaskGroup the
      moment the fan-out count is a runtime value.</b></p>`,
    level: "senior",
  },
  {
    id: "d2",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "What is Task priority and the cooperative thread pool?",
    answerHtml: `<p>The pool is small on purpose — it's what keeps Swift concurrency from spinning up a thread
      per task like GCD could — so how you treat it matters more than with old-style threading. Swift
      concurrency runs tasks on a small <b>cooperative pool</b> (roughly one thread per core), not unbounded
      threads. Tasks carry a <b>priority</b> (e.g. <code>.userInitiated</code>, <code>.background</code>) that
      hints scheduling. The implication: never block a pool thread with sync I/O or sleeps — you can starve the
      whole system. Suspend with <code>await</code> instead.</p>
      <p><b>Red flag:</b> calling a blocking/synchronous API or <code>Thread.sleep</code> inside a
      <code>Task</code> — on GCD that just wastes one thread, but on the cooperative pool it can stall every task
      sharing that core. <b>I treat the pool as a scarce resource: suspend with await, never block it.</b></p>`,
    level: "senior",
  },
  {
    id: "d3",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "Why is Task.detached usually the wrong default?",
    answerHtml: `<p>Structured concurrency's whole value proposition is that a parent can guarantee its
      children finish or die with it — <code>Task.detached</code> breaks that guarantee, so it should be an
      explicit exception, not a habit. A detached task <b>opts out of structured concurrency</b>: it doesn't
      inherit priority, task-local values, or actor context, and it isn't cancelled with its parent — so it's easy
      to leak. Prefer a normal child <code>Task</code> (or a task group). Reach for <code>Task.detached</code>
      only when you explicitly need to escape the current context.</p>
      <p><b>Red flag:</b> reaching for <code>Task.detached</code> as the default way to "just start some async
      work" — it silently drops cancellation propagation, so a screen dismissal won't stop it.
      <b>I default to a structured child task and only detach when I have a concrete reason to outlive the
      parent.</b></p>`,
    level: "architect",
  },
  {
    id: "d4",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "What does @Sendable on a closure mean, and when is it required?",
    answerHtml: `<p>Data races used to be a runtime crapshoot you'd only catch under Thread Sanitizer or in
      production — <code>@Sendable</code> moves that check to compile time. It marks a closure as safe to run
      concurrently / cross actor boundaries, so everything it captures must itself be <code>Sendable</code>. Task
      closures and many concurrency APIs require it. Under Swift 6 the compiler rejects capturing non-Sendable
      mutable state in a <code>@Sendable</code> closure — catching a race at compile time.
      <b>I treat a Sendable error as the compiler finding a real race, not a hoop to jump through.</b></p>`,
    level: "senior",
  },
  {
    id: "d5",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "What does `nonisolated` do?",
    answerHtml: `<p><code>nonisolated</code> exists because actor isolation is a promise about mutable state,
      not about every member — some members touch nothing isolated and forcing <code>await</code> on them is
      pure friction. It opts a member <b>out</b> of its type's actor isolation, so it can be called without
      <code>await</code> from any context — valid only when that member touches no isolated mutable state (e.g. a
      pure computed property, or conforming to a synchronous protocol like <code>Hashable</code> on a
      <code>@MainActor</code> type). <b>I only mark something nonisolated when I can prove it never touches
      isolated state — otherwise it's a race waiting to happen.</b></p>`,
    level: "architect",
  },
  {
    id: "d6",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "When would you use MainActor.assumeIsolated?",
    answerHtml: `<p>It exists for the gap between what you know and what the type system can prove — a runtime
      guarantee (like "this UIKit delegate callback always fires on main") that the compiler has no way to
      verify statically. When you're <i>certain</i> you're already on the main thread but the compiler can't
      prove it, <code>assumeIsolated</code> runs the closure as main-actor-isolated <b>without suspending</b>, and
      traps if you're wrong. It's an escape hatch — prefer real <code>@MainActor</code> annotations.</p>
      <p><b>Red flag:</b> reaching for <code>assumeIsolated</code> to silence a compiler warning without verifying
      the calling context really is main — that turns a compile-time question into a runtime crash risk.
      <b>I use assumeIsolated only at a boundary where the platform, not my code, guarantees main-thread
      delivery.</b></p>`,
    level: "architect",
  },
  {
    id: "d7",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "How do you handle backpressure with AsyncStream?",
    answerHtml: `<p>An unbounded producer/consumer pipe is a memory leak waiting for a slow consumer, so
      <code>AsyncStream</code> makes you choose the failure mode up front. Choose a <b>buffering policy</b> when
      you create it: <code>.bufferingNewest(n)</code>, <code>.bufferingOldest(n)</code>, or <code>.unbounded</code>.
      If a fast producer outruns a slow consumer, an unbounded buffer grows without limit — pick a bounded policy
      and decide whether to drop oldest or newest. The continuation's <code>onTermination</code> lets you clean
      up the source. <b>I default to a bounded buffer and pick "drop oldest" or "drop newest" deliberately, based
      on which stale data is safer to lose.</b></p>`,
    level: "architect",
  },
  {
    id: "d8",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "How do you cancel cleanly and propagate it?",
    answerHtml: `<p>Cancellation only works if code actually checks for it, so the design is cooperative by
      necessity — nothing forces a task to stop, which is exactly why you have to build the checks in yourself.
      It <b>propagates down</b> the structured tree: cancelling a parent cancels its children. Check
      <code>Task.isCancelled</code> or call <code>try Task.checkCancellation()</code> at suspension points, and
      use <code>withTaskCancellationHandler</code> to tear down resources (close a stream, abort a request) the
      moment cancellation arrives.</p>
      <p><b>Red flag:</b> assuming cancellation stops a task automatically — a tight loop with no
      <code>await</code> or cancellation check will run to completion regardless. <b>I say cancellation is
      cooperative: I check for it at every suspension point and clean up in a cancellation handler, not just
      hope the runtime stops for me.</b></p>`,
    level: "senior",
  },
  {
    id: "d9",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What is the dependency rule in Clean Architecture?",
    answerHtml: `<p>The rule exists to protect the part of the app that's expensive to get wrong and cheap to
      test — the business logic — from churn in the parts that change on every OS release. Dependencies point
      <b>inward</b>: outer layers (UI, frameworks, networking) depend on inner layers (use cases, domain
      entities), never the reverse. Inner layers define protocols; outer layers implement them. The domain has
      zero knowledge of SwiftUI, URLSession, or the database — so it's portable and trivially testable.</p>
      <p><b>Red flag:</b> saying "the UI layer talks to the database" as if that's fine because it's convenient —
      that's the dependency arrow pointing the wrong way, and it's what makes a domain untestable without a
      simulator. <b>I keep the domain framework-free; everything framework-specific implements a protocol the
      domain defines.</b></p>`,
    level: "architect",
  },
  {
    id: "d10",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What are the moving parts of a unidirectional (TCA-style) architecture?",
    answerHtml: `<p>The point of the whole shape is to push every mutation and every side effect through one
      chokepoint, so state transitions become something you can test as pure functions instead of chasing
      mutations across a view hierarchy. The moving parts: <b>State</b> (a single value), <b>Actions</b>
      (everything that can happen), a <b>Reducer</b> (a pure function <code>(state, action) -&gt; effects</code>
      that also mutates state), and <b>Effects</b> (async work that feeds actions back in). Because the reducer
      is pure and effects are isolated, the whole flow is deterministic and exhaustively testable. <b>I like
      unidirectional architectures for exactly this: every state change is a diffable, replayable action, not a
      side effect buried in a view.</b></p>`,
    level: "architect",
  },
  {
    id: "d11",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How does dependency injection scale beyond passing initializers?",
    answerHtml: `<p>Passing initializers by hand works until the object graph gets deep enough that every leaf
      dependency has to thread through every intermediate type — that's the point to add a mechanism, not before.
      Initializer injection is the clean default. At scale teams add a lightweight <b>container</b> / registry
      (or SwiftUI's <code>@Environment</code> with custom <code>EnvironmentKey</code>s) to compose and override
      dependencies per environment (live, test, preview). The principle stays the same: depend on protocols,
      resolve concretes at the composition root. <b>I start with plain initializer injection and only reach for
      a container once threading dependencies by hand becomes the actual pain point.</b></p>`,
    level: "architect",
  },
  {
    id: "d12",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How do interface (protocol) modules break dependency cycles?",
    answerHtml: `<p>Two feature modules that need to call each other create a literal compile-time cycle in
      Swift Package Manager — the fix is to give both something acyclic to depend on instead of each other.
      Extract the protocols a feature needs into a small <b>interface module</b>; features depend on the
      interface, and the concrete implementation depends on it too — but features don't depend on each other.
      This inverts the dependency so two features can interact (e.g. navigate to each other) without a
      compile-time cycle. <b>I break feature-to-feature cycles with a shared interface module both sides depend
      on, never by merging the features.</b></p>`,
    level: "architect",
  },
  {
    id: "d13",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How do you navigate between feature modules without coupling them?",
    answerHtml: `<p>Navigation is exactly the kind of cross-cutting concern that tempts every feature to import
      every other feature — left unchecked it turns a modular codebase back into one giant target. Don't let
      Feature A import Feature B. Instead A emits a <b>route/intent</b> (a value or a protocol call) that a
      central <b>router</b> — which does know the concrete features — resolves into a destination. Features
      depend only on the routing interface, so the dependency graph stays acyclic.</p>
      <p><b>Red flag:</b> a feature module importing another feature module just to push its screen — that's the
      cycle in disguise. <b>I have features emit a route to a router that knows every destination; features
      themselves know nothing about each other.</b></p>`,
    level: "architect",
  },
  {
    id: "d14",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What's a good error-handling strategy across layers?",
    answerHtml: `<p>An error type is as much a layer's public contract as its return value — leaking a raw
      <code>URLError</code> up to the UI couples your presentation code to networking internals it shouldn't
      know about. Use specific error types low down (network, decoding), <b>map</b> them to domain errors in the
      repository/use-case layer, and translate to user-facing messages at the edge. Swift 6's <b>typed throws</b>
      can make a function's error type explicit. The goal: the UI never sees a raw <code>URLError</code>, and
      each layer only handles errors it understands.</p>
      <p><b>Red flag:</b> a view showing <code>error.localizedDescription</code> straight from a decoding
      failure — that's an implementation detail leaking into the UI, not a user-facing message.
      <b>I map errors at each layer boundary so the UI only ever sees domain errors it knows how to present.</b></p>`,
    level: "senior",
  },
  {
    id: "d15",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How do you layer a caching strategy?",
    answerHtml: `<p>Caching only pays off if exactly one place owns the policy — scatter cache-or-network
      decisions across views and you get inconsistent staleness with no single place to fix it. Think in tiers:
      an in-memory cache (fast, volatile — an actor or <code>NSCache</code>), a disk/database cache (survives
      launches), and the network (source of truth). The repository decides the policy — cache-first,
      network-first, or stale-while-revalidate — and owns invalidation. Keep that logic in one place, not
      scattered through views. <b>I put caching policy in the repository so every consumer gets the same
      freshness guarantee, not whatever the calling view happened to implement.</b></p>`,
    level: "senior",
  },
  {
    id: "d16",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What does an observability architecture include?",
    answerHtml: `<p>You can't operate what you can't see — an architecture that ships without observability
      means the first sign of a regression is a 1-star review, not a dashboard. Structured logging (<b>OSLog</b>
      /Logger with privacy redaction), field metrics (<b>MetricKit</b>: launch time, hangs, energy), crash +
      non-fatal reporting, and analytics events behind a typed interface so they're testable and swappable.
      Define SLOs (crash-free rate, cold launch) and surface them on a dashboard. <b>I ask "how would we know
      this regressed in production, and how fast" before I call any architecture done.</b></p>`,
    level: "architect",
  },
  {
    id: "d17",
    category: "perf",
    categoryLabel: "Performance",
    question: "Hang vs hitch — what's the difference?",
    answerHtml: `<p>They look similar to a user — the app feels janky — but they point to opposite fixes, so
      conflating them sends you profiling the wrong thing. A <b>hang</b> is the main thread blocked so the UI is
      unresponsive (caught by the Hangs instrument / MetricKit). A <b>hitch</b> is a single dropped/late frame
      during animation or scrolling (a smoothness problem). Different tools, different fixes: hangs → get work
      off the main actor; hitches → cheaper per-frame work and commits.</p>
      <p><b>Red flag:</b> reaching for the Time Profiler on a scrolling hitch when the culprit is one expensive
      frame commit, not a blocked main thread — that's the Animation Hitches instrument's job.
      <b>I say hang means unresponsive, hitch means one late frame — and I pick the instrument that matches which
      one I'm chasing.</b></p>`,
    level: "senior",
  },
  {
    id: "d18",
    category: "perf",
    categoryLabel: "Performance",
    question: "How do you keep a fast list scrolling smoothly?",
    answerHtml: `<p>Every technique here is really the same rule applied at a different point in the row's
      lifecycle: never do more work than the frame budget allows, right when the frame needs it. Realize cells
      lazily (<code>List</code>/<code>LazyVStack</code>), give them stable identity for reuse, do zero expensive
      work in <code>body</code>, and <b>prefetch</b> a few rows ahead (load images/data before they appear) while
      <b>cancelling</b> work for rows that scroll away. Validate with the Time Profiler and the Animation Hitches
      instrument. <b>I keep body cheap, prefetch just ahead of the viewport, and cancel work for anything that
      scrolled past — measured, not guessed.</b></p>`,
    level: "senior",
  },
  {
    id: "d19",
    category: "perf",
    categoryLabel: "Performance",
    question: "What is MetricKit and why use it?",
    answerHtml: `<p>Whatever you measure on your own device is one data point from one phone on one network —
      MetricKit exists because real-world performance is a distribution, not a single profiling session. It's an
      on-device framework that delivers <b>aggregated field metrics</b> from real users — launch time, hang rate,
      memory, energy, disk — plus diagnostic payloads for hangs and crashes. <b>I treat MetricKit as the source
      of truth for "is this actually slow for users," not my own device's Instruments trace.</b></p>`,
    level: "senior",
  },
  {
    id: "d20",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What are typed throws (Swift 6)?",
    answerHtml: `<p>Untyped <code>throws</code> means every caller catches an opaque <code>any Error</code> and
      has to guess what's actually possible — typed throws puts that contract back in the signature. A function
      can declare the concrete error type it throws: <code>func f() throws(MyError)</code>. Callers then catch a
      known type instead of an opaque <code>any Error</code>. Use it for well-bounded domains (parsing, a
      module's API); keep untyped <code>throws</code> where errors are open-ended. <b>I reach for typed throws at
      a module boundary with a closed, well-known error set — not as a default on every function.</b></p>`,
    level: "senior",
  },
  {
    id: "d21",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What problem do noncopyable types (~Copyable) solve?",
    answerHtml: `<p>Some resources are only correct to have one owner of — a file handle closed twice, a lock
      released twice — and implicit copying is exactly what makes that bug easy to write by accident. A type
      marked <code>~Copyable</code> has <b>unique ownership</b> — it can't be implicitly copied, only moved. That
      lets the compiler enforce single-owner resources (file handles, buffers, locks) and prevent
      use-after-consume bugs. It's a systems-level tool; most app code stays with normal value types.
      <b>I reach for ~Copyable when a resource's correctness depends on having exactly one owner, not as a
      general performance trick.</b></p>`,
    level: "senior",
  },
  {
    id: "d22",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What's the performance cost of `any` (existentials) vs generics?",
    answerHtml: `<p>The performance gap comes down to when the concrete type is known: generics resolve it at
      compile time, existentials defer it to runtime, and that deferral has a real cost. An existential
      (<code>any P</code>) boxes the value and dispatches dynamically — slight indirection, and it can
      heap-allocate for large values. Generics (<code>some P</code> / type parameters) let the compiler
      specialize and inline. In hot paths prefer generics; use <code>any</code> for heterogeneous storage or to
      break type-level coupling.</p>
      <p><b>Red flag:</b> reaching for <code>any</code> everywhere "to keep it flexible" — that flexibility has a
      dispatch and allocation cost you're paying on every call. <b>I default to generics in hot paths and use
      any only when I genuinely need heterogeneous storage.</b></p>`,
    level: "senior",
  },
  {
    id: "d23",
    category: "security",
    categoryLabel: "Security",
    question: "What are App Attest and DeviceCheck for?",
    answerHtml: `<p>User authentication proves who's asking; App Attest and DeviceCheck answer a different
      question — is this really your app, unmodified, running on a real device — which is what stops bots and
      tampered clients that already have valid user credentials. They let your server verify a request comes
      from a <b>genuine, unmodified instance</b> of your app on a real Apple device. <b>App Attest</b> issues a
      hardware-backed key to assert app integrity; <b>DeviceCheck</b> stores a couple of per-device bits (e.g. to
      stop trial-abuse).</p>
      <p><b>Red flag:</b> describing App Attest as a login/auth mechanism — it verifies the app instance, not the
      user. <b>I use App Attest/DeviceCheck to stop fraud and tampering, and user auth (sign-in, tokens) to
      answer who's making the request.</b></p>`,
    level: "senior",
  },
  {
    id: "d24",
    category: "security",
    categoryLabel: "Security",
    question: "What is the Secure Enclave and what runs there?",
    answerHtml: `<p>The threat the Secure Enclave defends against is a fully compromised app or OS — no amount
      of code-level protection helps if the key itself is ever loaded into main-CPU memory, so the Enclave
      simply never lets that happen. It's a dedicated security coprocessor isolated from the main CPU. Private
      keys generated there <b>never leave</b> it — you ask the Enclave to sign/decrypt, you never see the key. It
      backs Face ID/Touch ID and Keychain items with <code>kSecAttrTokenIDSecureEnclave</code>, so even a
      compromised app or OS can't exfiltrate the key material. <b>I say the Secure Enclave doesn't protect a key
      better — it makes the key physically inaccessible to the rest of the system.</b></p>`,
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
    explanationHtml: `<p>A TaskGroup is right because the count is only known at runtime.
      <code>async let</code> looks tempting since it's the more familiar tool, but it needs each child named at
      compile time — it can't loop and add children dynamically the way a group's <code>addTask</code> can, while
      still keeping structured cancellation and completion.</p>`,
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
      persistence, which makes it portable and testable. "Outward to frameworks" is backwards — that's the
      arrow you get if the domain imports SwiftUI or URLSession directly, which is the mistake the rule
      prevents.</p>`,
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
      type instead of <code>any Error</code> — best for well-bounded domains. It's not about avoiding error
      handling — the function still throws and callers still must handle it, just against a concrete type
      instead of an opaque one.</p>`,
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
    html: `<p><b>What it is.</b> The patterns that come up once async/await basics are second nature — they
      all exist to keep the concurrency structured, so a parent can still guarantee its children finish or die
      with it. <b>Fan-out/fan-in</b> with a task group; <b>bridging</b> callbacks with continuations and
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
      the three bugs that make async code flaky. <b>Say this:</b> "I lean on structured concurrency so I never
      have to manually track whether a child task finished or leaked."</div>`,
  },
  {
    id: "st-adv-9",
    num: "24",
    title: "24 · Clean Architecture & the dependency rule",
    html: `<p><b>What it is.</b> Concentric layers — Entities (domain) → Use Cases → Interface Adapters
      (view models, repositories) → Frameworks (SwiftUI, URLSession, SwiftData) — with one rule: <b>dependencies
      point inward</b>. The rule exists so the business logic — the part most expensive to get wrong — stays
      insulated from churn in frameworks and OS versions. Inner layers define protocols; outer layers implement
      them and are wired together at a composition root.</p>
    <p>In practice you don't need every layer for every app — the value is the <i>direction</i>. Keep the domain
      free of framework imports and you get code that's portable, parallel-buildable as packages, and testable
      without a simulator.</p>
    <div class="callout tip"><span class="lbl">Pragmatism</span> For most apps, MVVM + repositories already
      honors the dependency rule. Reserve the full layering for large, long-lived codebases where the
      decoupling pays for its ceremony. <b>Say this:</b> "I don't add layers for their own sake — I add them when
      the domain needs to outlive a framework decision."</div>`,
  },
  {
    id: "st-adv-10",
    num: "25",
    title: "25 · Error-handling strategy",
    html: `<p><b>What it is.</b> A deliberate plan for how errors are typed, mapped, and surfaced — treating
      an error type as part of a layer's public contract, not an afterthought. Low layers throw specific errors
      (<code>URLError</code>, <code>DecodingError</code>); the repository/use-case layer <b>maps</b> them to
      domain errors; the UI translates domain errors into messages and recovery actions. Swift 6 <b>typed
      throws</b> can make a module's error contract explicit.</p>
    <div class="callout warn"><span class="lbl">Anti-pattern</span> Catching <code>Error</code> everywhere and
      showing the raw <code>localizedDescription</code> to users. Each layer should handle only the errors it
      understands and translate the rest upward. <b>Say this:</b> "The UI should never see a raw networking or
      decoding error — only the domain error it knows how to present."</div>`,
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
