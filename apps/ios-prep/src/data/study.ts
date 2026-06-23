// iOS study guide — typed content is the source of truth. Edit directly.
export type StudySection = { id: string; num: string; title: string; html: string };

export const STUDY_INTRO_HTML = `<span class="lbl">How to read this</span> Each topic opens with <b>what it is</b>,
  then the points an interview actually probes, and a <b>level</b> note so you know whether it's table-stakes
  (junior/mid) or differentiating (senior/architect). Read top to bottom once, then come back via the
  <a href="/flashcards">flashcards</a> and <a href="/practice">prompts</a> to make it stick.`;

export const STUDY_SECTIONS: StudySection[] = [
  {
    id: "st-1",
    num: "01",
    title: "01 · Swift Language Essentials",
    html: `<p><b>What it is.</b> Swift is a value-oriented, type-safe language. The single most important
      idea to internalize early is <b>value types vs reference types</b>: <code>struct</code> and
      <code>enum</code> are copied on assignment (value semantics), while <code>class</code> instances are
      shared by reference. SwiftUI leans hard on value types, so default to <code>struct</code> and reach for
      <code>class</code> only when you need identity or reference semantics.</p>
    <p>Core fluency the interview assumes: <b>optionals</b> (and safe unwrapping with <code>if let</code> /
      <code>guard let</code> rather than force-unwrap <code>!</code>), <b>enums with associated values</b>,
      <b>closures</b> and how they capture, <b>protocols</b> and protocol-oriented design, <b>generics</b>,
      and <b>error handling</b> with <code>do/try/catch</code>.</p>
    <div class="code">// Value vs reference
struct Point { var x = 0 }      // copied
final class Box { var x = 0 }   // shared

var a = Point(); var b = a; b.x = 9   // a.x still 0
let p = Box(); let q = p; q.x = 9     // p.x is now 9

// Optionals, no force-unwrap
func first(_ xs: [Int]) -&gt; Int {
  guard let head = xs.first else { return 0 }
  return head
}</div>
    <div class="callout warn"><span class="lbl">Memory</span> Classes are reference-counted (ARC). A
      closure capturing <code>self</code> strongly inside a stored property creates a <b>retain cycle</b> —
      break it with <code>[weak self]</code>. This is a classic senior follow-up.</div>
    <div class="callout tip"><span class="lbl">Level</span> Junior: optionals, structs, closures. Senior:
      protocol-oriented design, generics with constraints, and reasoning about ARC and value-semantics
      performance (copy-on-write).</div>`,
  },
  {
    id: "st-2",
    num: "02",
    title: "02 · SwiftUI Fundamentals",
    html: `<p><b>What it is.</b> SwiftUI is a <i>declarative</i> UI framework: you describe what the UI should
      look like for a given state, and the framework diffs and updates the screen when state changes. A view is
      a lightweight <code>struct</code> conforming to <code>View</code> with a <code>body</code> that returns
      more views.</p>
    <p>Master <b>modifiers</b> (and that <i>order matters</i> — <code>.padding().background()</code> differs
      from <code>.background().padding()</code>), <b>layout</b> with <code>VStack</code>/<code>HStack</code>/
      <code>ZStack</code>, <code>Spacer</code>, <code>frame</code>, and alignment, and <b>lists</b> with
      <code>List</code> and <code>ForEach</code> keyed by stable identity.</p>
    <div class="code">struct Greeting: View {
  let name: String
  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      Text("Hello, \\(name)").font(.title.bold())
      Text("Welcome back").foregroundStyle(.secondary)
    }
    .padding()
  }
}</div>
    <div class="callout warn"><span class="lbl">Identity</span> SwiftUI tracks views by <b>identity</b>. In
      <code>ForEach</code>, use a stable <code>id</code> (a real model id, not the array index) or animations
      and state will attach to the wrong row.</div>
    <div class="callout tip"><span class="lbl">Level</span> Junior/mid: build screens, compose views, use
      modifiers correctly. Senior: reason about view identity, diffing, and when a re-render is unnecessary
      (see Performance, topic 09).</div>`,
  },
  {
    id: "st-3",
    num: "03",
    title: "03 · State & Data Flow in SwiftUI",
    html: `<p><b>What it is.</b> SwiftUI is driven by a <b>single source of truth</b>. Pick the right property
      wrapper for who owns the state:</p>
    <ul>
      <li><code>@State</code> — value owned by <i>this</i> view (private, transient UI state).</li>
      <li><code>@Binding</code> — a two-way reference to state owned elsewhere.</li>
      <li><code>@Observable</code> (the Observation framework, iOS 17+) — reference-type model whose
        properties the views observe automatically; pair with <code>@State</code> to own it and
        <code>@Bindable</code> to bind to it.</li>
      <li><code>@Environment</code> — dependencies injected down the view tree.</li>
    </ul>
    <p>Before iOS 17 this was <code>ObservableObject</code> + <code>@Published</code> + <code>@StateObject</code>/
      <code>@ObservedObject</code>; know both, because plenty of code still uses the older API.</p>
    <div class="code">@Observable
final class CounterModel { var count = 0 }

struct CounterView: View {
  @State private var model = CounterModel()
  var body: some View {
    Button("Tapped \\(model.count)") { model.count += 1 }
  }
}</div>
    <div class="callout tip"><span class="lbl">Why it matters</span> The Observation framework tracks reads
      at the <i>property</i> level, so only views that actually read a changed property re-render — a real
      performance win over the older <code>@Published</code> model, which invalidated all observers.</div>`,
  },
  {
    id: "st-4",
    num: "04",
    title: "04 · UIKit & Interoperability",
    html: `<p><b>What it is.</b> UIKit is the imperative, mature UI framework that powered iOS for a decade.
      Even in a SwiftUI-first app you need it for APIs SwiftUI doesn't fully cover, deep customization, and
      large existing codebases. Know the <b>UIViewController lifecycle</b>
      (<code>viewDidLoad → viewWillAppear → viewDidAppear → …</code>), <b>Auto Layout</b> constraints, and
      <code>UITableView</code>/<code>UICollectionView</code> with <b>diffable data sources</b>.</p>
    <p>The bridge goes both ways: wrap UIKit in SwiftUI with <code>UIViewRepresentable</code> /
      <code>UIViewControllerRepresentable</code>, and host SwiftUI inside UIKit with
      <code>UIHostingController</code>.</p>
    <div class="code">struct MapView: UIViewRepresentable {
  func makeUIView(context: Context) -&gt; MKMapView { MKMapView() }
  func updateUIView(_ view: MKMapView, context: Context) { /* sync state */ }
}</div>
    <div class="callout tip"><span class="lbl">Level</span> Mid: use UIKit components and the representable
      wrappers. Senior: drive a UIKit ↔ SwiftUI migration, manage the Coordinator pattern for delegates, and
      know which framework owns the navigation stack.</div>`,
  },
  {
    id: "st-5",
    num: "05",
    title: "05 · Swift Concurrency",
    html: `<p><b>What it is.</b> Modern async iOS is built on <b>async/await</b> and <b>structured
      concurrency</b>. <code>async</code> functions suspend without blocking a thread; <code>Task</code>
      starts concurrent work; <code>async let</code> and <code>TaskGroup</code> run children in parallel and
      join them. <b>Actors</b> protect mutable state from data races by serializing access, and
      <code>@MainActor</code> guarantees code runs on the main thread (required for UI).</p>
    <p>Swift 6 turns this into <b>compile-time data-race safety</b>: types crossing concurrency boundaries
      must be <code>Sendable</code>, and the compiler enforces actor isolation. Understanding isolation,
      <code>Sendable</code>, and <code>@MainActor</code> is the senior concurrency conversation.</p>
    <div class="code">func loadProfile() async throws -&gt; Profile {
  async let user = api.user()        // these two run
  async let posts = api.posts()      // concurrently
  return try await Profile(user: user, posts: posts)
}

@MainActor
func show(_ p: Profile) { self.profile = p }  // safe UI update</div>
    <div class="callout warn"><span class="lbl">Pitfall</span> Don't reach for <code>DispatchQueue.main.async</code>
      out of habit — use <code>@MainActor</code>. And never block the main actor with synchronous work; move it
      off with a <code>Task</code> or a background actor.</div>
    <div class="callout tip"><span class="lbl">Level</span> Mid: use async/await and <code>@MainActor</code>.
      Senior: explain actor isolation, <code>Sendable</code>, cancellation, and how to migrate a callback-based
      API to async with <code>withCheckedContinuation</code>.</div>`,
  },
  {
    id: "st-6",
    num: "06",
    title: "06 · Networking & Codable",
    html: `<p><b>What it is.</b> The standard stack is <code>URLSession</code>'s async API plus
      <b>Codable</b> for JSON. <code>Codable</code> (= <code>Encodable & Decodable</code>) maps JSON to Swift
      types automatically; use <code>CodingKeys</code> to rename fields and decoder strategies (e.g.
      <code>.convertFromSnakeCase</code>, custom date decoding) to handle real-world payloads.</p>
    <div class="code">struct User: Codable, Identifiable {
  let id: Int
  let fullName: String
  enum CodingKeys: String, CodingKey {
    case id, fullName = "full_name"
  }
}

func fetchUser(id: Int) async throws -&gt; User {
  let url = URL(string: "https://api.example.com/users/\\(id)")!
  let (data, response) = try await URLSession.shared.data(from: url)
  guard (response as? HTTPURLResponse)?.statusCode == 200 else {
    throw URLError(.badServerResponse)
  }
  return try JSONDecoder().decode(User.self, from: data)
}</div>
    <div class="callout tip"><span class="lbl">Talk track</span> Wrap networking behind a protocol
      (<code>APIClient</code>) so view models depend on an abstraction you can mock in tests. Layer caching with
      <code>URLCache</code> or your persistence store, and centralize retry/auth-refresh logic.</div>`,
  },
  {
    id: "st-7",
    num: "07",
    title: "07 · Persistence",
    html: `<p><b>What it is.</b> Pick storage by the data: <b>SwiftData</b> (iOS 17+) for app models —
      annotate a class with <code>@Model</code>, save through a <code>ModelContext</code>, and query reactively
      with <code>@Query</code>; <b>Core Data</b> for older targets or advanced control; <b>UserDefaults</b> for
      small preferences; the <b>Keychain</b> for secrets (tokens, passwords — never UserDefaults); and the file
      system for blobs.</p>
    <div class="code">@Model
final class Task {
  var title: String
  var isDone = false
  init(title: String) { self.title = title }
}

struct TaskList: View {
  @Query(sort: \\Task.title) private var tasks: [Task]
  @Environment(\\.modelContext) private var context
  var body: some View {
    List(tasks) { Text($0.title) }
  }
}</div>
    <div class="callout warn"><span class="lbl">Don't</span> store auth tokens or PII in
      <code>UserDefaults</code> — it's an unencrypted plist. Use the Keychain (see Security, topic 14).</div>
    <div class="callout tip"><span class="lbl">Level</span> Mid: model data and do CRUD with SwiftData/Core
      Data. Senior: design migrations, reason about the context/threading model, and sync with a backend
      (offline-first — see Architecture).</div>`,
  },
  {
    id: "st-8",
    num: "08",
    title: "08 · Navigation & App Structure",
    html: `<p><b>What it is.</b> An app's entry point is a <code>struct</code> conforming to <code>App</code>
      with <code>@main</code>, composing <code>Scene</code>s (usually a <code>WindowGroup</code>). For
      navigation, <code>NavigationStack</code> with <code>navigationDestination</code> replaced the old
      <code>NavigationView</code> and enables <b>programmatic, value-driven navigation</b>: bind a
      <code>path</code> array and push/pop by mutating it. <code>TabView</code> handles top-level sections, and
      deep links map a URL onto that path.</p>
    <div class="code">@main
struct MyApp: App {
  var body: some Scene { WindowGroup { RootView() } }
}

struct RootView: View {
  @State private var path: [Route] = []
  var body: some View {
    NavigationStack(path: $path) {
      HomeView()
        .navigationDestination(for: Route.self) { route in
          DetailView(route: route)
        }
    }
  }
}</div>
    <div class="callout tip"><span class="lbl">Talk track</span> Value-driven navigation makes deep linking and
      state restoration straightforward: a URL or push notification decodes into <code>Route</code> values you
      append to <code>path</code>. That's the senior framing — navigation as data.</div>`,
  },
  {
    id: "st-9",
    num: "09",
    title: "09 · Performance & Instruments",
    html: `<p><b>What it is.</b> Performance work is mostly about doing <i>less</i>: fewer re-renders, fewer
      allocations, less main-thread work. In SwiftUI that means keeping <code>body</code> cheap and pure (no
      heavy computation, no side effects), giving views stable identity, using <code>LazyVStack</code>/
      <code>LazyHStack</code> and <code>List</code> for long content, and letting the Observation framework
      re-render only the views that read a changed property.</p>
    <p>Measure with <b>Instruments</b>: <b>Time Profiler</b> for CPU hotspots, <b>Allocations</b>/<b>Leaks</b>
      for memory and retain cycles, the <b>SwiftUI</b> instrument for view-body counts, and <b>Hangs</b> for
      main-thread stalls. Rule one: profile before you optimize — guesses are usually wrong.</p>
    <div class="callout warn"><span class="lbl">Common bugs</span> Decoding or sorting inside
      <code>body</code>; loading full-resolution images into small thumbnails (downsample first); retain cycles
      from closures capturing <code>self</code>; and blocking the main actor with synchronous I/O.</div>
    <div class="callout tip"><span class="lbl">Level</span> Senior: read an Instruments trace, find the
      hotspot, and explain the fix. Architect: set performance budgets (cold-launch, scroll, memory) and wire
      them into CI and observability.</div>`,
  },
  {
    id: "st-10",
    num: "10",
    title: "10 · Testing",
    html: `<p><b>What it is.</b> Two unit-test frameworks ship today: the long-standing <b>XCTest</b> and the
      newer <b>Swift Testing</b> (<code>@Test</code> functions with <code>#expect</code>/<code>#require</code>
      macros, parameterized tests, and async support), introduced with Xcode 16. UI flows are covered by
      <b>XCUITest</b>. The thing interviews probe is <i>testability</i>: inject dependencies behind protocols so
      you can substitute fakes, and keep logic in view models rather than views.</p>
    <div class="code">import Testing

@Test func totalsAreSummed() {
  let cart = Cart(items: [2, 3])
  #expect(cart.total == 5)
}

@Test func loadsUser() async throws {
  let client = MockAPIClient(user: .stub)
  let model = ProfileModel(api: client)
  try await model.load()
  #expect(model.user?.id == 1)
}</div>
    <div class="callout tip"><span class="lbl">Talk track</span> "I depend on an <code>APIClient</code>
      protocol, not <code>URLSession</code>, so the view model takes a mock in tests and runs with no network."
      That one sentence signals you design for testability.</div>`,
  },
  {
    id: "st-11",
    num: "11",
    title: "11 · Dependencies & Swift Package Manager",
    html: `<p><b>What it is.</b> <b>Swift Package Manager (SPM)</b> is the first-class way to add dependencies
      and — just as important — to <b>modularize your own app</b> into local packages. A <code>Package.swift</code>
      manifest declares targets (code) and products (what you expose). Splitting a feature into its own package
      enforces boundaries, speeds incremental builds, and lets features be tested in isolation. CocoaPods and
      Carthage still exist in legacy projects, but SPM is the default for new work.</p>
    <div class="code">// Package.swift
let package = Package(
  name: "Feature",
  products: [.library(name: "Feature", targets: ["Feature"])],
  dependencies: [],
  targets: [
    .target(name: "Feature"),
    .testTarget(name: "FeatureTests", dependencies: ["Feature"]),
  ]
)</div>
    <div class="callout tip"><span class="lbl">Architect lens</span> Local packages are the cheapest way to
      get modular architecture: a clear dependency direction, no accidental cross-feature imports, and parallel
      compilation. This is a recurring system-design answer (see Architecture).</div>`,
  },
  {
    id: "st-12",
    num: "12",
    title: "12 · CI/CD & Release",
    html: `<p><b>What it is.</b> A repeatable pipeline that builds, tests, signs, and ships every change.
      <b>Xcode Cloud</b> is Apple's hosted CI integrated with App Store Connect; <b>Fastlane</b> is the
      cross-tool automation standard (and runs on GitHub Actions, etc.). The part that trips everyone up is
      <b>code signing</b>: certificates identify the team, provisioning profiles tie an app id + devices +
      certificate together. Automatic signing handles the common case; teams often manage it explicitly
      (e.g. Fastlane <i>match</i>) for shared, reproducible credentials.</p>
    <div class="code"># Fastlane: build & ship a TestFlight beta
lane :beta do
  increment_build_number
  build_app(scheme: "App")
  upload_to_testflight
end</div>
    <div class="callout tip"><span class="lbl">Talk track</span> Distinguish <b>version</b> (marketing,
      <code>CFBundleShortVersionString</code>) from <b>build number</b> (<code>CFBundleVersion</code>, must
      increase per upload). Senior answer: PRs run unit + UI tests on CI; merges to main auto-ship a TestFlight
      build; releases are promoted with a phased rollout.</div>`,
  },
  {
    id: "st-13",
    num: "13",
    title: "13 · App Store Review & Distribution",
    html: `<p><b>What it is.</b> Shipping happens through <b>App Store Connect</b>: you upload a build, fill in
      metadata and screenshots, complete <b>App Privacy</b> (the privacy "nutrition label"), and submit for
      <b>review</b> against the App Store Review Guidelines. Beta testing goes through <b>TestFlight</b>. Know
      the common rejection reasons so you can avoid them: broken/incomplete functionality, privacy issues
      (missing usage-description strings, undisclosed data collection), misleading metadata, and using private
      APIs.</p>
    <ul>
      <li><b>Phased release</b> rolls an update out to a growing % of users over ~7 days — pause if crash rates spike.</li>
      <li><b>Privacy manifests</b> + required-reason APIs must be declared (see Security, topic 14).</li>
      <li><b>StoreKit</b> handles in-app purchases and subscriptions; Apple requires IAP for digital goods.</li>
    </ul>
    <div class="callout warn"><span class="lbl">Reality</span> Review is mostly automated checks plus a human
      pass; most rejections are avoidable with complete metadata, honest privacy answers, and a build that
      doesn't crash on first launch. Use TestFlight to catch the obvious stuff first.</div>`,
  },
  {
    id: "st-14",
    num: "14",
    title: "14 · Security & Privacy",
    html: `<p><b>What it is.</b> Store secrets in the <b>Keychain</b> (encrypted, hardware-backed), never in
      <code>UserDefaults</code>. Gate sensitive flows with <b>biometrics</b> via the LocalAuthentication
      framework (Face ID / Touch ID). Keep <b>App Transport Security</b> (HTTPS-only) on. Use <b>data
      protection</b> classes so files are encrypted at rest when the device is locked. Respect privacy:
      declare a <b>privacy manifest</b> (<code>PrivacyInfo.xcprivacy</code>) and required-reason API usage,
      and request tracking permission via <b>App Tracking Transparency</b> before using the IDFA.</p>
    <div class="code">import LocalAuthentication

func authenticate() async -&gt; Bool {
  let ctx = LAContext()
  guard ctx.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil)
  else { return false }
  return (try? await ctx.evaluatePolicy(
    .deviceOwnerAuthenticationWithBiometrics,
    localizedReason: "Unlock your vault")) ?? false
}</div>
    <div class="callout tip"><span class="lbl">Level</span> Senior: Keychain, biometrics, ATS, and privacy
      manifests are expected. Architect: own the app's privacy posture — data-minimization, on-device
      processing (see topic 15), and a defensible answer to "what data leaves the device and why".</div>`,
  },
  {
    id: "st-15",
    num: "15",
    title: "15 · On-Device AI & Machine Learning",
    html: `<p><b>What it is.</b> Apple's ML runs <i>on device</i> for privacy, low latency, and offline use,
      accelerated by the Neural Engine. The toolbox: <b>Core ML</b> (run trained models), <b>Create ML</b>
      (train without leaving Swift), and task frameworks — <b>Vision</b> (images), <b>Natural Language</b>
      (text), <b>Speech</b> (transcription), and <b>Sound Analysis</b>. <b>Apple Intelligence</b> pushes this
      further with system-level generative features and on-device foundation models. Convert third-party models
      to Core ML with <code>coremltools</code>, and optimize (quantize, prune) to fit memory and latency
      budgets.</p>
    <div class="code">import Vision

func detectText(in image: CGImage) async throws -&gt; [String] {
  let request = VNRecognizeTextRequest()
  request.recognitionLevel = .accurate
  let handler = VNImageRequestHandler(cgImage: image)
  try handler.perform([request])
  return request.results?.compactMap {
    $0.topCandidates(1).first?.string
  } ?? []
}</div>
    <div class="callout tip"><span class="lbl">Frontier framing</span> "Run inference on device when you can —
      it's private, works offline, and has no per-call cost; fall back to a server model only when the task
      exceeds on-device capability." This guide's own search runs a small embedding model in your browser as a
      working demonstration.</div>`,
  },
];
