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
    answerHtml: `<p>This is a performance and API-design decision, not just syntax: <code>some P</code> is an
      <b>opaque type</b> — the compiler resolves one concrete type at compile time, so there's zero indirection —
      while <code>any P</code> is an <b>existential</b>, a runtime box that can hold any conforming type at the
      cost of dynamic dispatch and boxing. That's why <code>some View</code>, not <code>any View</code>, is what
      SwiftUI wants: one concrete, specializable type per call site.</p>
    <p>Reach for <code>any</code> only when you genuinely need heterogeneity — a mixed-type array or a stored
      property whose concrete type varies at runtime.</p>
    <p><b>I default to <code>some</code> for performance and identity, and only reach for <code>any</code> when I
      need a genuinely heterogeneous collection.</b></p>
    <p>Red flag: treating <code>any</code> as the "safer, more flexible" default — that flexibility is paid for in
      indirection and dispatch on every call, which is the wrong trade in a view body evaluated on every
      re-render.</p>`,
    level: "senior",
  },
  {
    id: "a2",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What is a result builder?",
    answerHtml: `<p>SwiftUI's declarative body syntax works because of a compile-time DSL feature: a result
      builder's static methods (<code>buildBlock</code>, <code>buildEither</code>, <code>buildOptional</code>)
      transform a sequence of statements into a single value. <code>@ViewBuilder</code> is the built-in one —
      it's the reason you can list child views in a <code>body</code> with no commas, arrays, or explicit
      returns.</p>
    <p>You can write your own result builder for any DSL where you want that same declarative, list-like syntax —
      not just views.</p>
    <p><b>Result builders are what let SwiftUI's body read like markup instead of imperative code — that's a
      compiler feature, not runtime magic.</b></p>`,
    level: "senior",
  },
  {
    id: "a3",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What problem do Swift macros solve?",
    answerHtml: `<p>Macros exist to kill boilerplate without paying a runtime cost: instead of reflection or a
      separate codegen script, the compiler expands a macro at compile time from an annotation, with full
      type-checking on the generated code. <code>@Observable</code> and Swift Testing's <code>#expect</code> are
      both macros — they replaced patterns that used to rely on manual codegen or runtime reflection.</p>
    <p><b>Macros move codegen into the compiler, so the generated code is type-checked and costs nothing at
      runtime.</b></p>`,
    level: "senior",
  },
  {
    id: "a4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "When do you use GeometryReader, and what's the catch?",
    answerHtml: `<p>GeometryReader answers "how much space did my parent actually give me" — necessary for
      responsive layout, but it's a blunt instrument: it reports geometry by <b>greedily consuming all offered
      space</b> as its own frame, which silently breaks layouts that expected the view to size to its content.</p>
    <p>Prefer layout modifiers, the <code>Layout</code> protocol, or <code>containerRelativeFrame</code> first;
      reach for <code>GeometryReader</code> only when you truly need measured geometry, and constrain its frame
      explicitly.</p>
    <p><b>I reach for GeometryReader last, and only inside a frame I've already constrained — not as my default
      way to measure a view.</b></p>
    <p>Red flag: dropping a GeometryReader in and being surprised your view now fills the screen — that's not a
      bug, it's documented behavior; the fix is constraining its frame, not avoiding measurement.</p>`,
    level: "senior",
  },
  {
    id: "a5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is a PreferenceKey for?",
    answerHtml: `<p>SwiftUI's data flow is one-directional — parent to child via <code>@Environment</code> or
      bindings — so when a child needs to report something to an ancestor (its measured size, for example),
      there's no built-in channel going the other way. <code>PreferenceKey</code> is that channel: it passes data
      <b>up</b> the tree, the mirror image of <code>@Environment</code>.</p>
    <p>Classic use: a child reports its measured size via a preference, and a parent reads it with
      <code>onPreferenceChange</code> to coordinate layout — equal-width buttons, a custom tab indicator that
      tracks a selected child's frame.</p>
    <p><b>Environment flows down, preferences flow up — that's the one line that keeps the two straight in an
      interview.</b></p>`,
    level: "senior",
  },
  {
    id: "a6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How can making a view Equatable improve performance?",
    answerHtml: `<p>SwiftUI re-evaluates a view's <code>body</code> whenever its inputs might have changed, even if
      the actual values are identical — for an expensive subtree, that's wasted work. Conforming to
      <code>Equatable</code> and wrapping in <code>EquatableView</code> (or calling <code>.equatable()</code>)
      lets SwiftUI compare old and new input and skip re-evaluating <code>body</code> when nothing actually
      changed.</p>
    <p>Use it surgically, on subtrees you've profiled as expensive — the equality check itself has a cost, and
      needless checks on cheap views can cost more than they save.</p>
    <p><b>I only reach for .equatable() after profiling shows a specific subtree re-rendering needlessly — it's a
      scalpel, not a default.</b></p>`,
    level: "senior",
  },
  {
    id: "a7",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "AsyncStream vs AsyncSequence — what are they?",
    answerHtml: `<p>Async/await needed a way to consume a sequence of values that arrive over time — that's
      <code>AsyncSequence</code>, the protocol you iterate with <code>for await</code>. But most real-world value
      sources (delegate callbacks, notification observers, sensor updates) don't natively speak that protocol, so
      Swift needs a concrete adapter: <code>AsyncStream</code> builds an <code>AsyncSequence</code> from a
      continuation you yield values into and finish when done.</p>
    <p><b>AsyncSequence is the protocol you consume; AsyncStream is the tool you reach for to bridge a callback
      API into one.</b></p>`,
    level: "senior",
  },
  {
    id: "a8",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "What is actor reentrancy and why does it bite people?",
    answerHtml: `<p>Actors serialize access to their own state, but not across suspension points — when an actor
      method hits an <code>await</code>, it can suspend and let <i>other</i> calls into the same actor run and
      mutate state before it resumes. That's reentrancy, and it's why state you read before the await may no
      longer be true after it.</p>
    <p>Don't assume invariants hold across an <code>await</code>; re-check state after resuming, or restructure
      the method to do all its mutation before the first suspension point.</p>
    <p><b>I treat every await inside an actor method as a place where my assumptions about state might no longer
      hold, and re-check after resuming.</b></p>
    <p>Red flag: assuming an actor's isolation means "nothing else can touch my state while I'm running" —
      isolation guarantees no data races, not atomicity across an await.</p>`,
    level: "architect",
  },
  {
    id: "a9",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "What is a global actor (like @MainActor) under the hood?",
    answerHtml: `<p>Sometimes isolation needs to apply across many unrelated types and functions, not just within
      one actor's instance — a global actor is a singleton actor you can attach to any declaration with an
      attribute, giving it that isolation without threading a reference to an actor instance everywhere.
      <code>@MainActor</code> is the built-in one, forcing UI-touching code onto the main thread.</p>
    <p>You can define your own — a <code>@DatabaseActor</code>, say — to force all database access onto one
      serialized executor without an actor instance in every signature.</p>
    <p><b>A global actor is how I apply one isolation domain across a whole subsystem without passing an actor
      reference around.</b></p>`,
    level: "architect",
  },
  {
    id: "a10",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What does a Coordinator/Router do?",
    answerHtml: `<p>It centralizes navigation so features don't need to know about each other or about how
      they're presented: a feature emits intent as a <code>Route</code> value, and the router decides whether
      that means a push, a sheet, or a full-screen cover, owning the <code>NavigationStack</code> path itself.</p>
    <p>That decoupling is what makes deep links and state restoration tractable — both become a matter of
      building the right path, not wiring up each screen's presentation logic separately.</p>
    <p><b>Features emit intent, the router owns presentation — that separation is what makes deep linking and
      state restoration a solved problem instead of a special case per screen.</b></p>
    <p>Red flag: letting a feature push its own next screen directly — that couples it to a specific navigation
      context and breaks the moment you want to present that same feature from two different places.</p>`,
    level: "senior",
  },
  {
    id: "a11",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How do feature flags fit into architecture?",
    answerHtml: `<p>Feature flags decouple <b>deploy</b> from <b>release</b>: merged code ships inert, off by
      default, and you flip it on remotely once you're ready — which means you can ship continuously without
      every merge being a release decision.</p>
    <p>That decoupling is what powers gradual rollouts, A/B tests, and a kill switch that disables a broken
      feature instantly, without shipping a new build through App Review.</p>
    <p><b>Shipping a flag off by default means a bad feature is a remote toggle away from gone, not an emergency
      App Store submission.</b></p>
    <p>Red flag: treating flags as free — an accumulation of stale, never-cleaned-up flags is its own tech debt;
      retire them once a feature is fully rolled out.</p>`,
    level: "architect",
  },
  {
    id: "a12",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "NSCache vs a Dictionary for in-memory caching?",
    answerHtml: `<p>An in-memory cache that competes with the rest of the app for memory needs a way to give it
      back under pressure, or it becomes the thing that gets your app jetsam-killed. <code>NSCache</code> is
      thread-safe and <b>evicts under memory pressure</b> automatically; a plain dictionary does neither and will
      grow unbounded until something crashes.</p>
    <p>For a Swift-concurrency design, wrap a cache in an <code>actor</code> for safe concurrent access; reach
      for <code>NSCache</code> specifically when you want that automatic purging behavior too.</p>
    <p><b>NSCache gives me thread safety and automatic eviction for free — a dictionary gives me neither, so
      it's never my default for a cache that can grow.</b></p>`,
    level: "senior",
  },
  {
    id: "a13",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you keep work running when the app is backgrounded?",
    answerHtml: `<p>The OS decides when your app gets CPU time in the background, not you — so this is about
      picking the API that matches what the system will actually guarantee, not just "run this later."
      <code>URLSession</code> background configuration hands large downloads to the OS so they survive suspension
      and even app termination; <code>BGTaskScheduler</code> (BGAppRefreshTask / BGProcessingTask) requests
      periodic refresh and maintenance windows; <code>beginBackgroundTask</code> buys a short grace period to
      finish up work already in flight.</p>
    <p><b>I pick the background API by what guarantee I actually need — survive suspension, get a periodic
      window, or just finish what's already running — not by which one I remember first.</b></p>
    <p>Red flag: assuming beginBackgroundTask gives you meaningful time to do new work — it's a short finish-up
      window for work already started, not a way to schedule new background jobs.</p>`,
    level: "senior",
  },
  {
    id: "a14",
    category: "perf",
    categoryLabel: "Performance",
    question: "What are os_signpost / signposts used for?",
    answerHtml: `<p>Instruments can show raw stack samples, but it can't know which of those samples correspond
      to <i>your</i> logical operation — os_signpost is how you tell it. It marks intervals and events in your
      code (e.g. "parse feed", "render frame") so you can measure the duration of a specific operation directly,
      instead of inferring it from sampling.</p>
    <p>Pair it with the Points of Interest instrument, or build a custom Instruments template around your
      signposts for repeatable measurement.</p>
    <p><b>Signposts turn "this feels slow" into a number I can point at in Instruments, tied to the exact
      operation I care about.</b></p>`,
    level: "senior",
  },
  {
    id: "a15",
    category: "perf",
    categoryLabel: "Performance",
    question: "What does .drawingGroup() do?",
    answerHtml: `<p>SwiftUI normally composites each view individually, which gets expensive fast for complex
      vector or graphic content — many overlapping shapes, blends, gradients. <code>.drawingGroup()</code>
      flattens that subtree into a single Metal-rendered layer, turning many composited draws into one, which can
      dramatically speed up that kind of content.</p>
    <p>It's a targeted tool, not a default: applying it to a simple view adds the cost of rendering to an
      offscreen buffer for no benefit, so measure before and after.</p>
    <p><b>drawingGroup is for flattening a subtree that's expensive to composite, not a general performance
      switch — I only reach for it after Instruments points at compositing cost.</b></p>`,
    level: "senior",
  },
  {
    id: "a16",
    category: "security",
    categoryLabel: "Security",
    question: "What is certificate / public-key pinning?",
    answerHtml: `<p>TLS alone trusts any certificate signed by any CA in the OS trust store — which means a
      compromised or fraudulently-issued CA certificate can man-in-the-middle a connection that otherwise looks
      perfectly valid. Certificate/public-key pinning closes that gap by validating the server's certificate (or
      its public key) against one you've pinned in the app, so only that specific key is trusted regardless of
      what the CA store says.</p>
    <p>Implement it in a <code>URLSessionDelegate</code> auth challenge. Pin the <b>public key</b>, not the leaf
      certificate — certs rotate on their own schedule, and pinning the leaf means every renewal ships a new app
      version or breaks connectivity.</p>
    <p><b>I pin the public key, not the leaf certificate — that survives cert renewal without an app
      update.</b></p>
    <p>Red flag: pinning the leaf certificate because it feels more specific — that decision bricks the app the
      day the cert rotates, which is exactly the kind of outage pinning shouldn't cause.</p>`,
    level: "senior",
  },
  {
    id: "a17",
    category: "security",
    categoryLabel: "Security",
    question: "What are data protection classes?",
    answerHtml: `<p>Encrypting files at rest usually means writing and managing crypto code yourself — data
      protection classes give you that for free at the file-system level, tied to the device's lock state instead
      of a key you manage. The default, <code>NSFileProtectionComplete</code>, makes a file completely unreadable
      while the device is locked, with the OS handling key management transparently.</p>
    <p>Choose a less strict class only when you have a real need for background access to a file while the
      device is locked — e.g. a VoIP app that must read data to handle an incoming call. That's a deliberate
      trade of security for functionality, not a default.</p>
    <p><b>Data protection is encryption at rest with no crypto code from me — I only weaken the default class
      when there's a concrete background-access requirement.</b></p>`,
    level: "senior",
  },
  {
    id: "a18",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What changed with StoreKit 2?",
    answerHtml: `<p>StoreKit 1 receipt validation meant round-tripping an opaque receipt blob to your server (or
      Apple's) just to confirm a purchase — StoreKit 2 replaces that with a modern async/await API where each
      transaction is a <b>signed, on-device verifiable</b> JWS payload, so you can trust a purchase without a
      server call in the loop.</p>
    <p>You <code>await Product.products(for:)</code>, call <code>purchase()</code>, and verify the returned
      transaction's signature yourself.</p>
    <p><b>StoreKit 2 lets me trust a transaction from its signature on-device — no server round trip just to
      confirm someone paid.</b></p>
    <p>Red flag: assuming on-device verification means you never need a server — you still want server-side
      verification for anything tied to entitlements you can't afford to get wrong (e.g. server-granted content),
      but for most apps the on-device check is enough.</p>`,
    level: "senior",
  },
  {
    id: "a19",
    category: "test",
    categoryLabel: "Testing",
    question: "What is snapshot testing and when is it worth it?",
    answerHtml: `<p>Snapshot testing exists because some regressions are only visible, not logical — a layout
      shift, a color that silently changed, a design-system component that drifted. It renders a view to an image
      and compares it against a stored reference, failing the test on visual diffs a normal assertion would never
      catch.</p>
    <p>The trade-off: reference images are brittle across OS and device changes, so an unscoped snapshot suite
      becomes a wall of false-positive failures nobody trusts. Scope snapshots to stable, high-value surfaces (a
      design system's components) and review diffs deliberately rather than blindly re-recording.</p>
    <p><b>I snapshot-test the design system, not every screen — that's where visual regressions are expensive
      and the reference images are stable enough to trust.</b></p>`,
    level: "mid",
  },
  {
    id: "a20",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What do SwiftLint and xcconfig files give a team?",
    answerHtml: `<p>Both tools move a source of friction out of code review and into automation or configuration,
      so reviews can focus on substance instead of nitpicks. <b>SwiftLint</b> enforces consistent style and
      catches smells in CI before a human ever looks at the diff. <b>xcconfig</b> files move build settings out of
      the project file into versioned text, so per-environment configuration (Debug/Release/Staging) gets fewer
      merge conflicts and a diff you can actually read.</p>
    <p><b>Style and build-setting arguments belong in CI and xcconfig, not in a PR comment — that keeps review
      focused on what the code does.</b></p>`,
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
      callers, so there's no runtime boxing — it's resolved and specialized at compile time. The tempting wrong
      answer is "a protocol box": that's what <code>any View</code> would give you, the existential with dynamic
      dispatch. <code>some</code> is the opposite of a box — it's a compile-time guarantee of one concrete
      type.</p>`,
  },
  {
    id: "az2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "To pass measured size from a child UP to an ancestor you use:",
    options: ["@Environment", "A PreferenceKey", "@State", "@Binding"],
    answer: 1,
    explanationHtml: `<p>Preferences flow up the tree; the environment flows down. <code>@Environment</code> is
      the tempting wrong pick because it's the other half of SwiftUI's data flow — but it only ever pushes values
      from ancestor to descendant, so it can't carry a child's measured size upward. A child sets a preference
      and an ancestor reads it with <code>onPreferenceChange</code>.</p>`,
  },
  {
    id: "az3",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "Actor reentrancy means that across an await inside an actor method:",
    options: ["Nothing else can run on the actor", "Other calls may run and mutate state", "The actor deadlocks", "State is frozen"],
    answer: 1,
    explanationHtml: `<p>Suspending at an <code>await</code> lets other calls into the actor proceed — invariants
      you checked before the await may not hold after it. "Nothing else can run on the actor" is the
      misconception: actor isolation guarantees no data races on its state, not that the actor is atomic across a
      suspension point. Re-check state after resuming rather than assuming it's frozen.</p>`,
  },
  {
    id: "az4",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "AsyncStream is most commonly used to:",
    options: ["Replace Codable", "Bridge a callback/delegate API into an AsyncSequence", "Block the main actor", "Cache images"],
    answer: 1,
    explanationHtml: `<p>You yield values into an AsyncStream's continuation from a delegate/callback and finish
      it when done, exposing that source as something you iterate with <code>for await</code>. "Block the main
      actor" is the misconception — AsyncStream is specifically how you avoid blocking anything: consumers
      suspend cooperatively instead of a producer blocking a thread waiting for a value.</p>`,
  },
  {
    id: "az5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Compared with a plain dictionary, NSCache automatically:",
    options: ["Encrypts entries", "Evicts under memory pressure and is thread-safe", "Persists to disk", "Sorts keys"],
    answer: 1,
    explanationHtml: `<p>NSCache purges itself when memory is tight and is safe for concurrent access — a plain
      dictionary does neither and can grow unbounded until something crashes. "Persists to disk" is the tempting
      wrong answer because it sounds like what a "cache" should do, but NSCache is purely in-memory; persistence
      is a job for URLCache or your own disk layer, not NSCache.</p>`,
  },
  {
    id: "az6",
    category: "appstore",
    categoryLabel: "App Store",
    question: "A headline feature of StoreKit 2 is:",
    options: ["XML receipts only", "Async API with on-device signed transaction verification", "No need to offer IAP", "It removes subscriptions"],
    answer: 1,
    explanationHtml: `<p>StoreKit 2 is async/await with cryptographically signed (JWS) transactions you can
      verify on device, cutting the server receipt-validation round trip. "XML receipts only" describes the old
      StoreKit 1 model, where you shipped an opaque receipt blob to a server to validate — picking it as
      StoreKit 2's headline feature is describing the API it replaced, not the one it introduced.</p>`,
  },
  {
    id: "az7",
    category: "security",
    categoryLabel: "Security",
    question: "Public-key pinning protects against:",
    options: ["Slow networks", "A rogue/compromised CA performing a MITM", "Large downloads", "Memory leaks"],
    answer: 1,
    explanationHtml: `<p>Pinning the server's public key means a fraudulently issued certificate from another CA
      won't validate, blocking man-in-the-middle interception. The tempting misconception is that plain HTTPS
      already covers this — TLS trusts any cert signed by any CA in the OS trust store, so a compromised or rogue
      CA can still MITM a connection that looks completely valid without pinning.</p>`,
  },
  {
    id: "az8",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Feature flags primarily let you:",
    options: ["Skip code review", "Decouple deploy from release (and kill-switch features)", "Avoid testing", "Reduce app size"],
    answer: 1,
    explanationHtml: `<p>Code ships dark and is enabled remotely, powering gradual rollouts, A/B tests, and the
      ability to disable a broken feature without a new build. The tempting misconception is thinking of flags
      purely as an A/B-testing or marketing tool — their real architectural value is decoupling <i>deploy</i>
      (code merged and shipped) from <i>release</i> (code turned on for users), which is what makes a kill switch
      possible in the first place.</p>`,
  },
];

export const ADVANCED_STUDY: StudySection[] = [
  {
    id: "st-adv-1",
    num: "16",
    title: "16 · Swift 6 & the concurrency migration",
    html: `<p><b>What it is.</b> Swift 6 adds a language mode that proves <b>data-race safety at compile time</b>
      — instead of finding concurrency bugs from a 2am crash report, the compiler refuses to build code with an
      unsynchronized cross-actor access. It checks actor isolation and requires values crossing concurrency
      boundaries to be <code>Sendable</code>.</p>
    <p>Migrate incrementally, not as a big-bang flip:</p>
    <ul>
      <li>1. Stay in Swift 5 language mode and turn on strict-concurrency warnings.</li>
      <li>2. Fix warnings module by module, starting from leaf modules with no local dependents.</li>
      <li>3. Once a module is warning-clean, flip its language mode to Swift 6.</li>
      <li>4. Repeat up the dependency graph until the whole app builds in Swift 6 mode.</li>
    </ul>
    <p>The common fixes along the way: annotate UI types <code>@MainActor</code>; make model value types
      <code>Sendable</code>; isolate shared mutable state behind actors; mark intentionally cross-actor closures
      <code>@Sendable</code>.</p>
    <div class="callout tip"><span class="lbl">Talk track</span> "I migrate per-module with strict-concurrency
      warnings on, fixing isolation as I go, rather than flipping the whole app to Swift 6 at once." That shows
      you've actually done it.</div>`,
  },
  {
    id: "st-adv-2",
    num: "17",
    title: "17 · Advanced SwiftUI: layout, identity & the render loop",
    html: `<p><b>What it is.</b> Beyond stacks, SwiftUI layout is a negotiation: a parent proposes a size, the
      child chooses, the parent positions it — understanding that negotiation is what separates "I stacked some
      views" from "I can explain why this layout does what it does." The custom <code>Layout</code> protocol lets
      you implement that contract directly; <code>PreferenceKey</code> sends data up the tree; and
      <code>alignmentGuide</code> fine-tunes positioning within it.</p>
    <p>Understanding <b>identity</b> (structural vs explicit <code>.id()</code>) explains why state survives or
      resets across updates — it's the mental model behind almost every "my state randomly reset" bug report.</p>
    <div class="callout warn"><span class="lbl">Re-render mental model</span> A view re-evaluates its
      <code>body</code> when state it reads changes or its inputs change. The Observation framework narrows that
      to per-property reads. <b>Keep bodies pure and cheap, and give lists stable identity, and the render loop
      stays fast.</b></div>`,
  },
  {
    id: "st-adv-3",
    num: "18",
    title: "18 · Modular architecture in practice",
    html: `<p><b>What it is.</b> Turning one app target into a graph of local Swift packages exists to make a
      growing codebase's boundaries enforced by the compiler instead of by convention. A typical layout: an app
      shell that composes <i>feature</i> packages, which depend on shared <i>Core</i> (models, utilities),
      <i>DesignSystem</i> (components, tokens), and <i>Networking</i> packages — with a strict rule that features
      never import each other. Cross-feature communication goes through a router and shared protocols.</p>
    <p>Get the <b>dependency direction</b> right (everything points inward toward Core) and you gain parallel
      builds, compiler-enforced boundaries, and isolated tests/previews. Migrate by extracting leaf features
      first, then the shared foundations.</p>
    <p>Modularizing costs real time up front — extracting packages, untangling accidental cross-feature imports,
      more Package.swift ceremony to maintain. The alternative, though, is a single target where build times climb
      linearly with headcount and "just import the other feature's internals" is always one line away, until
      nobody can tell what depends on what. Treat the extraction as an investment in the team's velocity a year
      out, not a detour from feature work — and revisit package boundaries periodically, because a graph that made
      sense at 3 features can need re-drawing at 15.</p>
    <div class="callout tip"><span class="lbl">Architect lens</span> The hard part isn't the tooling — it's
      defining boundaries and keeping the dependency graph acyclic as the app grows.</div>`,
  },
  {
    id: "st-adv-4",
    num: "19",
    title: "19 · Instruments-driven performance",
    html: `<p><b>What it is.</b> Performance work fails when it's guesswork — the fix is a repeatable method, not
      a hunch:</p>
    <ul>
      <li>1. Reproduce the slow scenario reliably.</li>
      <li>2. Profile it with the instrument matched to the symptom.</li>
      <li>3. Find the single biggest cost in that profile.</li>
      <li>4. Fix that one thing.</li>
      <li>5. Re-measure before touching anything else.</li>
    </ul>
    <p>Match the instrument to the symptom: <b>Time Profiler</b> for CPU and main-thread work,
      <b>Allocations</b>/<b>Leaks</b> for memory and retain cycles, the <b>SwiftUI</b> instrument for excessive
      body evaluations, <b>Hangs</b> for unresponsiveness, and <b>os_signpost</b> to time your own operations.</p>
    <div class="callout warn"><span class="lbl">Discipline</span> Never optimize on a hunch and never optimize
      two things at once — you won't know which helped. One change, re-measure, keep or revert.</div>`,
  },
];
