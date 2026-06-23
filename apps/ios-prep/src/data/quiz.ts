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
    explanationHtml: `<p>Structs are value types — assignment copies. Mutating the copy leaves the original
      untouched. A class would be shared by reference and would change.</p>`,
  },
  {
    id: "z2",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "Which is the safest way to handle a value that may be nil?",
    options: ["Force-unwrap with !", "guard let / if let", "Assume it's set", "Cast with as!"],
    answer: 1,
    explanationHtml: `<p><code>guard let</code> / <code>if let</code> unwrap safely and let you handle the nil
      case. Force-unwrap crashes on nil and should be rare.</p>`,
  },
  {
    id: "z3",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What prevents a strong reference cycle between two class instances?",
    options: ["Marking one reference weak or unowned", "Using a struct for both", "Adding @MainActor", "Calling deinit manually"],
    answer: 0,
    explanationHtml: `<p>Make one side <code>weak</code> (optional, nils out) or <code>unowned</code> (assumes
      it outlives) so ARC can release the objects. You can't call <code>deinit</code> yourself.</p>`,
  },
  {
    id: "z4",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "Swift 6's headline change is:",
    options: ["A new UI framework", "Compile-time data-race safety", "Dropping optionals", "Replacing Codable"],
    answer: 1,
    explanationHtml: `<p>Swift 6 enforces actor isolation and <code>Sendable</code> at compile time, turning
      many concurrency bugs into build errors. It's opt-in by language mode.</p>`,
  },
  {
    id: "z5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "In ForEach, using the array index as id can cause:",
    options: ["Faster rendering", "State attaching to the wrong row on reorder", "Type errors", "Smaller binaries"],
    answer: 1,
    explanationHtml: `<p>SwiftUI keys state/animation to identity. Index-as-id reattaches state to the wrong
      item when the collection changes. Use a stable id (<code>Identifiable</code>).</p>`,
  },
  {
    id: "z6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Which wrapper marks state OWNED by the current view?",
    options: ["@Binding", "@Environment", "@State", "@Bindable"],
    answer: 2,
    explanationHtml: `<p><code>@State</code> owns local view state. <code>@Binding</code> references state owned
      elsewhere; <code>@Bindable</code> binds to an <code>@Observable</code> model; <code>@Environment</code>
      reads injected values.</p>`,
  },
  {
    id: "z7",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "The advantage of @Observable over ObservableObject is:",
    options: ["It works only in UIKit", "Per-property read tracking, fewer re-renders", "It removes the need for state", "It runs off the main thread"],
    answer: 1,
    explanationHtml: `<p>The Observation framework tracks which properties a view reads, so only affected views
      re-render. <code>@Published</code> invalidated all observers of the object.</p>`,
  },
  {
    id: "z8",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: ".padding().background(.red) vs .background(.red).padding() differ because:",
    options: ["Modifiers are unordered", "Each modifier wraps the previous view", "Color overrides padding", "Only the first modifier applies"],
    answer: 1,
    explanationHtml: `<p>Modifiers compose outward, each wrapping the prior view. Padding-then-background colors
      the padded region; background-then-padding colors only the content and pads outside it.</p>`,
  },
  {
    id: "z9",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "What does awaiting an async call do to the thread?",
    options: ["Blocks it until done", "Frees it; the function suspends and resumes later", "Spawns a new thread", "Nothing — it's synchronous"],
    answer: 1,
    explanationHtml: `<p>An <code>await</code> can suspend the function and release the thread, which does other
      work until the awaited task completes — concurrency without blocking.</p>`,
  },
  {
    id: "z10",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "To protect a mutable cache accessed by many tasks, you'd use:",
    options: ["A global var", "An actor", "@State", "A struct"],
    answer: 1,
    explanationHtml: `<p>An <code>actor</code> serializes access to its mutable state, preventing data races.
      Callers <code>await</code> its methods. Swift 6 verifies this at compile time.</p>`,
  },
  {
    id: "z11",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "Code that updates the UI should run on:",
    options: ["Any background actor", "The main actor (@MainActor)", "A detached task", "The global queue"],
    answer: 1,
    explanationHtml: `<p>UI must run on the main thread. Annotate view models with <code>@MainActor</code> rather
      than scattering <code>DispatchQueue.main.async</code>.</p>`,
  },
  {
    id: "z12",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "async let is used to:",
    options: ["Declare a constant", "Run child work concurrently within a scope", "Block the main thread", "Replace Codable"],
    answer: 1,
    explanationHtml: `<p><code>async let</code> starts a child task that runs concurrently; you
      <code>await</code> it later. Children are scoped and cancelled with the parent — structured concurrency.</p>`,
  },
  {
    id: "z13",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Where should an authentication token be stored?",
    options: ["UserDefaults", "A plist in the bundle", "The Keychain", "A global variable"],
    answer: 2,
    explanationHtml: `<p>The Keychain is encrypted and hardware-backed. <code>UserDefaults</code> is an
      unencrypted plist — never put secrets there.</p>`,
  },
  {
    id: "z14",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "To map JSON full_name to a Swift property fullName you can:",
    options: ["Nothing — it just works", "Use CodingKeys or convertFromSnakeCase", "Rename the JSON", "Use a class instead of a struct"],
    answer: 1,
    explanationHtml: `<p>Provide a <code>CodingKeys</code> mapping, or set
      <code>keyDecodingStrategy = .convertFromSnakeCase</code> on the decoder.</p>`,
  },
  {
    id: "z15",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "SwiftData is best described as:",
    options: ["A networking library", "A modern Swift persistence layer built on Core Data", "A replacement for SwiftUI", "A testing framework"],
    answer: 1,
    explanationHtml: `<p>SwiftData (iOS 17+) is a Swift-native persistence API (<code>@Model</code>,
      <code>@Query</code>) layered on Core Data, with much less boilerplate.</p>`,
  },
  {
    id: "z16",
    category: "arch",
    categoryLabel: "Architecture",
    question: "The biggest build/structure win for a large app is usually:",
    options: ["One giant target", "Splitting into local Swift packages", "More singletons", "Disabling tests"],
    answer: 1,
    explanationHtml: `<p>Modularizing into local packages with a clear dependency direction speeds builds,
      enforces boundaries, and isolates tests — the "modular monolith".</p>`,
  },
  {
    id: "z17",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Injecting an APIClient protocol into a view model primarily improves:",
    options: ["App size", "Testability and decoupling", "Launch time", "Battery life"],
    answer: 1,
    explanationHtml: `<p>Depending on an abstraction lets you inject a mock in tests and a stub in previews, and
      decouples the feature from the concrete network layer.</p>`,
  },
  {
    id: "z18",
    category: "perf",
    categoryLabel: "Performance",
    question: "Before optimizing, you should:",
    options: ["Rewrite in UIKit", "Measure with Instruments", "Add more threads", "Disable animations"],
    answer: 1,
    explanationHtml: `<p>Profile first — the bottleneck is usually not where you'd guess. Time Profiler,
      Allocations, and the SwiftUI instrument point you at the real hotspot.</p>`,
  },
  {
    id: "z19",
    category: "perf",
    categoryLabel: "Performance",
    question: "A janky image feed most often improves when you:",
    options: ["Load full-resolution images eagerly", "Downsample off-main and cache thumbnails", "Use VStack instead of List", "Increase image size"],
    answer: 1,
    explanationHtml: `<p>Decoding huge images for small cells spikes memory and blocks the main thread.
      Downsample off the main actor, cache decoded thumbnails, and use lazy containers.</p>`,
  },
  {
    id: "z20",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "A provisioning profile ties together:",
    options: ["Only the app icon", "App ID + devices + a certificate", "Just the version number", "The App Store description"],
    answer: 1,
    explanationHtml: `<p>It authorizes a build by binding an App ID, allowed devices, and a signing certificate.
      The certificate identifies the team; the profile says what that identity may run/ship.</p>`,
  },
  {
    id: "z21",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "CFBundleVersion (build number) must:",
    options: ["Stay constant", "Increase with every App Store Connect upload", "Match the iOS version", "Be a date"],
    answer: 1,
    explanationHtml: `<p>The build number must increment per upload, even within the same marketing version
      (<code>CFBundleShortVersionString</code>). CI typically auto-increments it.</p>`,
  },
  {
    id: "z22",
    category: "appstore",
    categoryLabel: "App Store",
    question: "A phased release lets you:",
    options: ["Skip review", "Roll out to a growing % and pause if crashes spike", "Avoid TestFlight", "Bypass signing"],
    answer: 1,
    explanationHtml: `<p>Phased release ramps an update over ~7 days; you can pause it if crash rates rise and
      ship a fix before the whole user base updates.</p>`,
  },
  {
    id: "z23",
    category: "security",
    categoryLabel: "Security",
    question: "App Transport Security (ATS) by default:",
    options: ["Allows plaintext HTTP", "Requires HTTPS/TLS for network calls", "Disables the Keychain", "Encrypts UserDefaults"],
    answer: 1,
    explanationHtml: `<p>ATS forces secure HTTPS connections; plaintext HTTP needs a justified Info.plist
      exception that App Review scrutinizes. Keep ATS on.</p>`,
  },
  {
    id: "z24",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "A key benefit of on-device ML (Core ML) over a server call is:",
    options: ["Unlimited model size", "Privacy, low latency, and offline use", "No need for a model", "It avoids Swift"],
    answer: 1,
    explanationHtml: `<p>On-device inference keeps data private, removes the network round-trip, works offline,
      and has no per-call cost — accelerated by the Neural Engine.</p>`,
  },
];
