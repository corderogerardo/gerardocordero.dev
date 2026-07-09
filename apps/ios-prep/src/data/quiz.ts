export type QuizQuestion = {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  options: string[];
  answer: number;
  explanationHtml: string;
};

export const QUIZ_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "swift", label: "Swift Language" },
  { value: "swiftui", label: "SwiftUI" },
  { value: "concurrency", label: "Concurrency" },
  { value: "data", label: "Data & Networking" },
  { value: "arch", label: "Architecture" },
  { value: "perf", label: "Performance" },
  { value: "cicd", label: "CI/CD & Tooling" },
  { value: "security", label: "Security" },
  { value: "appstore", label: "App Store" },
  { value: "ai", label: "On-Device AI" },
];

export const QUIZ: QuizQuestion[] = [
  {
    id: "z1",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "You assign a struct value to a new variable and mutate the copy. The original is:",
    options: ["Also mutated (shared)", "Unchanged (value semantics)", "Set to nil", "A compile error"],
    answer: 1,
    explanationHtml: `<p>Value semantics is what makes structs safe to pass around without defensive
      copying — the correctness guarantee behind SwiftUI state. Assignment copies, so mutating the copy
      leaves the original untouched.</p>
      <p>Red flag: picking "also mutated" — that's reference semantics, which only applies to classes,
      where two variables can point at the same instance.</p>`,
  },
  {
    id: "z2",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "Which is the safest way to handle a value that may be nil?",
    options: ["Force-unwrap with !", "guard let / if let", "Assume it's set", "Cast with as!"],
    answer: 1,
    explanationHtml: `<p>The goal is a crash-free app, not just silencing the compiler warning — so
      <code>guard let</code> / <code>if let</code> unwrap safely and let you branch on the nil case
      explicitly.</p>
      <p>Red flag: reaching for <code>!</code> "because it compiles" — force-unwrap turns a nil you didn't
      expect into a runtime crash instead of a handled path.</p>`,
  },
  {
    id: "z3",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What prevents a strong reference cycle between two class instances?",
    options: ["Marking one reference weak or unowned", "Using a struct for both", "Adding @MainActor", "Calling deinit manually"],
    answer: 0,
    explanationHtml: `<p>Two objects strongly holding each other means ARC's reference count never hits
      zero, so neither ever deallocates — a silent memory leak. Break it by making one side
      <code>weak</code> (optional, nils out) or <code>unowned</code> (assumes it outlives).</p>
      <p>Red flag: thinking a struct "fixes" the cycle — structs don't have identity-based reference
      counting, so the fix is choosing the right ownership on the class reference, not switching types.</p>`,
  },
  {
    id: "z4",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "Swift 6's headline change is:",
    options: ["A new UI framework", "Compile-time data-race safety", "Dropping optionals", "Replacing Codable"],
    answer: 1,
    explanationHtml: `<p>Data races used to be a runtime crash you'd only find in production; Swift 6 moves
      that check to compile time by enforcing actor isolation and <code>Sendable</code> conformance,
      turning many concurrency bugs into build errors. It's opt-in by language mode.</p>
      <b>I treat Swift 6 strict concurrency as free race-condition testing at compile time.</b>`,
  },
  {
    id: "z5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "In ForEach, using the array index as id can cause:",
    options: ["Faster rendering", "State attaching to the wrong row on reorder", "Type errors", "Smaller binaries"],
    answer: 1,
    explanationHtml: `<p>SwiftUI keys state and animation to identity, not position — so when a row's index
      shifts, index-as-id silently reattaches that row's state to whatever item now sits there. Use a
      stable id (<code>Identifiable</code>) that follows the data, not the slot.</p>
      <p>Red flag: assuming index-as-id is "just a minor perf detail" — it's a correctness bug that shows
      up as scrambled selections or animations on reorder, not a performance one.</p>`,
  },
  {
    id: "z6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Which wrapper marks state OWNED by the current view?",
    options: ["@Binding", "@Environment", "@State", "@Bindable"],
    answer: 2,
    explanationHtml: `<p>Ownership is the distinction that matters here: <code>@State</code> owns local view
      state and is the source of truth. <code>@Binding</code> only references state owned elsewhere;
      <code>@Bindable</code> binds to an <code>@Observable</code> model; <code>@Environment</code> reads
      injected values it doesn't own either.</p>
      <p>Red flag: calling <code>@Binding</code> "the same as @State" — a binding is a read/write pointer
      to someone else's state, so mutating it never creates or owns storage locally.</p>`,
  },
  {
    id: "z7",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "The advantage of @Observable over ObservableObject is:",
    options: ["It works only in UIKit", "Per-property read tracking, fewer re-renders", "It removes the need for state", "It runs off the main thread"],
    answer: 1,
    explanationHtml: `<p>The win is re-render scope: the Observation framework tracks which properties a
      given view actually reads, so only views touching a changed property re-render. The older
      <code>ObservableObject</code>/<code>@Published</code> model invalidated every observer of the
      object on any change, regardless of which property they used.</p>
      <b>@Observable gives per-property change tracking, so a view that only reads one field doesn't
      re-render when a sibling field changes.</b>`,
  },
  {
    id: "z8",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: ".padding().background(.red) vs .background(.red).padding() differ because:",
    options: ["Modifiers are unordered", "Each modifier wraps the previous view", "Color overrides padding", "Only the first modifier applies"],
    answer: 1,
    explanationHtml: `<p>Modifier order is structural, not cosmetic — each modifier wraps the view produced
      by the previous one, building a new view each time. Padding-then-background colors the padded
      region; background-then-padding colors only the content and pads outside it.</p>
      <p>Red flag: saying "modifiers are unordered" — that's the mental model that produces layout bugs
      you can't explain; treat each <code>.modifier()</code> call as wrapping, top to bottom.</p>`,
  },
  {
    id: "z9",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "What does awaiting an async call do to the thread?",
    options: ["Blocks it until done", "Frees it; the function suspends and resumes later", "Spawns a new thread", "Nothing — it's synchronous"],
    answer: 1,
    explanationHtml: `<p>The reason async/await scales better than blocking calls: an <code>await</code>
      suspends the function and releases the thread back to the pool, which does other work until the
      awaited task completes — concurrency without tying up a thread per in-flight operation.</p>
      <p>Red flag: saying "it blocks the thread" — that's the old semaphore/lock mental model; the whole
      point of structured concurrency is that suspension isn't blocking.</p>`,
  },
  {
    id: "z10",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "To protect a mutable cache accessed by many tasks, you'd use:",
    options: ["A global var", "An actor", "@State", "A struct"],
    answer: 1,
    explanationHtml: `<p>The correctness guarantee you need for a shared mutable cache is serialized access,
      and that's exactly what an <code>actor</code> gives you — it isolates its state and processes calls
      one at a time. Callers <code>await</code> its methods; Swift 6 verifies the isolation at compile
      time.</p>
      <p>Red flag: reaching for a global <code>var</code> — that's the data race waiting to happen; a
      struct doesn't help either since it has no isolation, only value copying.</p>`,
  },
  {
    id: "z11",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "Code that updates the UI should run on:",
    options: ["Any background actor", "The main actor (@MainActor)", "A detached task", "The global queue"],
    answer: 1,
    explanationHtml: `<p>UIKit/SwiftUI aren't thread-safe, so any UI mutation off the main thread is undefined
      behavior, not just slow. Annotate view models with <code>@MainActor</code> so the compiler enforces
      it, rather than scattering <code>DispatchQueue.main.async</code> calls and hoping you caught every
      path.</p>
      <b>I put @MainActor on the view model itself so the type system — not code review — catches any UI
      update from a background context.</b>`,
  },
  {
    id: "z12",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "async let is used to:",
    options: ["Declare a constant", "Run child work concurrently within a scope", "Block the main thread", "Replace Codable"],
    answer: 1,
    explanationHtml: `<p>The value over a detached task is lifecycle safety: <code>async let</code> starts a
      child task that runs concurrently, and that child is scoped to and cancelled with its parent —
      structured concurrency means no orphaned work outliving the function that spawned it.</p>
      <p>Red flag: confusing it with a plain constant declaration — <code>async let</code> is a task
      launch, not a value binding, and forgetting to <code>await</code> it leaks the concurrency.</p>`,
  },
  {
    id: "z13",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Where should an authentication token be stored?",
    options: ["UserDefaults", "A plist in the bundle", "The Keychain", "A global variable"],
    answer: 2,
    explanationHtml: `<p>An auth token is a credential, so it needs storage with actual security guarantees:
      the Keychain is encrypted and hardware-backed. <code>UserDefaults</code> is just an unencrypted
      plist on disk — trivially readable on a jailbroken device or from a backup.</p>
      <p>Red flag: "UserDefaults is fine, it's just for app data" — that reasoning is how tokens end up in
      plaintext backups; secrets always go in the Keychain, no exceptions.</p>`,
  },
  {
    id: "z14",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "To map JSON full_name to a Swift property fullName you can:",
    options: ["Nothing — it just works", "Use CodingKeys or convertFromSnakeCase", "Rename the JSON", "Use a class instead of a struct"],
    answer: 1,
    explanationHtml: `<p>Swift's naming convention and the API's naming convention are two separate
      concerns Codable is designed to bridge — you don't rename either side. Provide a
      <code>CodingKeys</code> mapping, or set <code>keyDecodingStrategy = .convertFromSnakeCase</code> on
      the decoder for a whole payload.</p>
      <p>Red flag: "it just works" — Codable matches property names to keys exactly by default; a mismatch
      throws a decoding error, it doesn't silently guess.</p>`,
  },
  {
    id: "z15",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "SwiftData is best described as:",
    options: ["A networking library", "A modern Swift persistence layer built on Core Data", "A replacement for SwiftUI", "A testing framework"],
    answer: 1,
    explanationHtml: `<p>SwiftData's pitch is removing Core Data's ceremony without giving up its
      battle-tested storage engine: it's a Swift-native persistence API (<code>@Model</code>,
      <code>@Query</code>) layered on Core Data, so you get macro-driven models and less boilerplate on
      top of the same underlying store.</p>
      <b>I reach for SwiftData when a feature needs real persistence with querying, not just caching a
      network response.</b>`,
  },
  {
    id: "z16",
    category: "arch",
    categoryLabel: "Architecture",
    question: "The biggest build/structure win for a large app is usually:",
    options: ["One giant target", "Splitting into local Swift packages", "More singletons", "Disabling tests"],
    answer: 1,
    explanationHtml: `<p>1. Split by feature/layer into local Swift packages with a clear, one-directional
      dependency graph. 2. Each package builds and tests independently, so incremental builds only
      recompile what changed. 3. Package boundaries become enforced module boundaries — no more "just
      import anything from anywhere."</p>
      <p>Red flag: "one giant target is simpler" — it's simpler on day one and a full rebuild on every
      change by month six; modularizing is what keeps a large app's build times and test isolation sane.</p>`,
  },
  {
    id: "z17",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Injecting an APIClient protocol into a view model primarily improves:",
    options: ["App size", "Testability and decoupling", "Launch time", "Battery life"],
    answer: 1,
    explanationHtml: `<p>The dependency is what you're actually managing here: depending on a protocol instead
      of the concrete client lets you inject a mock in tests and a stub in previews, and decouples the
      feature from the network layer's implementation details.</p>
      <b>I inject an APIClient protocol so my view model tests never touch the network — they run in
      milliseconds against a mock.</b>`,
  },
  {
    id: "z18",
    category: "perf",
    categoryLabel: "Performance",
    question: "Before optimizing, you should:",
    options: ["Rewrite in UIKit", "Measure with Instruments", "Add more threads", "Disable animations"],
    answer: 1,
    explanationHtml: `<p>1. Measure with Instruments before touching code — the bottleneck is almost never
      where intuition says. 2. Use Time Profiler for CPU hotspots, Allocations for memory churn, and the
      SwiftUI instrument for re-render storms. 3. Fix the specific hotspot the data points to, then
      re-measure.</p>
      <p>Red flag: "add more threads" without profiling first — that can make contention worse and burns
      effort on a bottleneck you haven't confirmed exists.</p>`,
  },
  {
    id: "z19",
    category: "perf",
    categoryLabel: "Performance",
    question: "A janky image feed most often improves when you:",
    options: ["Load full-resolution images eagerly", "Downsample off-main and cache thumbnails", "Use VStack instead of List", "Increase image size"],
    answer: 1,
    explanationHtml: `<p>The jank comes from decoding cost, not list rendering: decoding a full-resolution
      image for a thumbnail-sized cell spikes memory and can block the main thread. Downsample off the
      main actor, cache the decoded thumbnails, and let a lazy container handle recycling.</p>
      <p>Red flag: "swap VStack for List" — a non-lazy container isn't the root cause here; the decode
      cost per image is, and fixing the container without downsampling just moves the jank.</p>`,
  },
  {
    id: "z20",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "A provisioning profile ties together:",
    options: ["Only the app icon", "App ID + devices + a certificate", "Just the version number", "The App Store description"],
    answer: 1,
    explanationHtml: `<p>Signing exists to prove both who built the app and what it's allowed to run on. The
      profile is the binding layer: it authorizes a build by tying together an App ID, the allowed
      devices, and a signing certificate. The certificate identifies the team; the profile says what that
      identity may run or ship.</p>
      <b>When signing breaks, I check profile-certificate-device match before touching anything else — it's
      almost always a mismatch, not a code problem.</b>`,
  },
  {
    id: "z21",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "CFBundleVersion (build number) must:",
    options: ["Stay constant", "Increase with every App Store Connect upload", "Match the iOS version", "Be a date"],
    answer: 1,
    explanationHtml: `<p>App Store Connect uses the build number to disambiguate uploads within one marketing
      version, so it must increment on every single upload — even two builds of the same
      <code>CFBundleShortVersionString</code>. CI typically auto-increments it so nobody has to remember.</p>
      <p>Red flag: bumping only the marketing version and forgetting the build number — Connect will
      reject the upload as a duplicate.</p>`,
  },
  {
    id: "z22",
    category: "appstore",
    categoryLabel: "App Store",
    question: "A phased release lets you:",
    options: ["Skip review", "Roll out to a growing % and pause if crashes spike", "Avoid TestFlight", "Bypass signing"],
    answer: 1,
    explanationHtml: `<p>The value is limiting blast radius: a phased release ramps an update over ~7 days
      instead of hitting 100% of users at once, so you can pause it if crash rates rise and ship a fix
      before the whole user base updates.</p>
      <b>I ship risky releases phased so a bad build only ever reaches a fraction of users before I can
      pause it.</b>`,
  },
  {
    id: "z23",
    category: "security",
    categoryLabel: "Security",
    question: "App Transport Security (ATS) by default:",
    options: ["Allows plaintext HTTP", "Requires HTTPS/TLS for network calls", "Disables the Keychain", "Encrypts UserDefaults"],
    answer: 1,
    explanationHtml: `<p>ATS exists to make plaintext network traffic the exception, not the default: it forces
      HTTPS/TLS on outgoing connections, and plaintext HTTP needs a justified Info.plist exception that
      App Review scrutinizes.</p>
      <p>Red flag: disabling ATS globally to "fix" a networking error instead of fixing the endpoint — that
      exception is a real security regression App Review will push back on.</p>`,
  },
  {
    id: "z24",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "A key benefit of on-device ML (Core ML) over a server call is:",
    options: ["Unlimited model size", "Privacy, low latency, and offline use", "No need for a model", "It avoids Swift"],
    answer: 1,
    explanationHtml: `<p>The trade-off senior candidates should name explicitly: on-device inference keeps
      user data private, removes the network round-trip, works offline, and has no per-call server cost —
      at the price of being bounded by the device's Neural Engine and the app's binary/model size.</p>
      <b>I default to Core ML for anything touching user data directly, and only fall back to a server
      model when the model is too large or needs frequent retraining.</b>`,
  },
];
