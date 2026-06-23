import type { Level } from "@/lib/levels";

export type PromptKind = "coding" | "design";

export type Prompt = {
  id: string;
  kind: PromptKind;
  title: string;
  level: Level;
  tags: string[];
  /** The question / scenario (rich HTML). */
  promptHtml: string;
  /** Progressively revealed sections (e.g. Approach -> Solution). */
  reveal: { label: string; html: string }[];
};

// Coding + system-design prompts for iOS. Try before you reveal.
export const PROMPTS: Prompt[] = [
  {
    id: "code-1",
    kind: "coding",
    title: "Debounce a SwiftUI search field",
    level: "mid",
    tags: ["swiftui", "concurrency", "search"],
    promptHtml: `<p>A search field fires a query on every keystroke. Make it only query after the user pauses
      typing for 300ms, and cancel the in-flight query when a new keystroke arrives — using Swift concurrency,
      no Combine.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
          <li>Drive a <code>.task(id: query)</code> modifier so a new task starts whenever the query changes —
            and SwiftUI cancels the previous task automatically.</li>
          <li>Inside, <code>try await Task.sleep(for: .milliseconds(300))</code>. If cancelled during the sleep
            it throws, so a new keystroke aborts the pending query.</li>
          <li>After the sleep, run the search. Cancellation makes the debounce fall out for free.</li>
        </ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">struct SearchView: View {
  @State private var query = ""
  @State private var results: [Item] = []

  var body: some View {
    List(results) { Text($0.name) }
      .searchable(text: $query)
      .task(id: query) {
        guard !query.isEmpty else { results = []; return }
        do {
          try await Task.sleep(for: .milliseconds(300))
          results = try await api.search(query)
        } catch {
          // cancelled (new keystroke) or failed — ignore
        }
      }
  }
}</div>
        <p>The key insight: <code>.task(id:)</code> ties task lifetime to the value, so debounce + cancellation
        come from the framework rather than manual timers.</p>`,
      },
    ],
  },
  {
    id: "code-2",
    kind: "coding",
    title: "A thread-safe image cache with an actor",
    level: "senior",
    tags: ["concurrency", "actor", "cache"],
    promptHtml: `<p>Many view tasks request images concurrently. Build an in-memory cache that never races, and
      that <i>de-duplicates</i> concurrent requests for the same URL so it only downloads once.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
          <li>Use an <code>actor</code> so all access to the dictionary is serialized — no locks.</li>
          <li>Cache either a finished image or the in-flight <code>Task</code>, so concurrent callers for the
            same URL await the same download.</li>
          <li>Await the stored task and return its value.</li>
        </ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">actor ImageCache {
  private enum Entry { case ready(UIImage); case loading(Task&lt;UIImage, Error&gt;) }
  private var cache: [URL: Entry] = [:]

  func image(for url: URL) async throws -&gt; UIImage {
    if case .ready(let img)? = cache[url] { return img }
    if case .loading(let task)? = cache[url] { return try await task.value }

    let task = Task { try await download(url) }
    cache[url] = .loading(task)
    let img = try await task.value
    cache[url] = .ready(img)
    return img
  }
}</div>
        <p>Storing the in-flight <code>Task</code> is what de-dupes: ten views asking at once all await one
        download. The actor guarantees the dictionary is never accessed concurrently.</p>`,
      },
    ],
  },
  {
    id: "code-3",
    kind: "coding",
    title: "Decode a messy JSON payload with Codable",
    level: "mid",
    tags: ["data", "codable", "json"],
    promptHtml: `<p>An API returns <code>snake_case</code> keys, ISO-8601 dates, and a nested object. Decode it
      into clean Swift models without hand-writing every key.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
          <li>Model the shape with nested <code>Codable</code> structs.</li>
          <li>Set <code>keyDecodingStrategy = .convertFromSnakeCase</code> so <code>full_name</code> maps to
            <code>fullName</code> automatically.</li>
          <li>Set <code>dateDecodingStrategy = .iso8601</code> for the timestamps.</li>
        </ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">struct User: Codable, Identifiable {
  let id: Int
  let fullName: String
  let profile: Profile
  let createdAt: Date
}
struct Profile: Codable { let bio: String }

func decodeUser(_ data: Data) throws -&gt; User {
  let decoder = JSONDecoder()
  decoder.keyDecodingStrategy = .convertFromSnakeCase
  decoder.dateDecodingStrategy = .iso8601
  return try decoder.decode(User.self, from: data)
}</div>
        <p>Strategies handle the common cases globally; reach for explicit <code>CodingKeys</code> only when a
        single field doesn't follow the pattern.</p>`,
      },
    ],
  },
  {
    id: "code-4",
    kind: "coding",
    title: "Async retry with exponential backoff",
    level: "senior",
    tags: ["concurrency", "networking", "resilience"],
    promptHtml: `<p>Wrap an async operation so it retries on failure up to N times with exponential backoff,
      respects cancellation, and rethrows the last error if all attempts fail.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
          <li>Loop up to <code>maxAttempts</code>; on success return, on failure remember the error.</li>
          <li>Between attempts <code>try await Task.sleep</code> for a growing delay (cancellation-aware).</li>
          <li>After the loop, throw the last captured error.</li>
        </ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">func retry&lt;T&gt;(
  maxAttempts: Int = 3,
  operation: () async throws -&gt; T
) async throws -&gt; T {
  var attempt = 0
  while true {
    do { return try await operation() }
    catch {
      attempt += 1
      if attempt &gt;= maxAttempts { throw error }
      let delay = pow(2.0, Double(attempt))   // 2s, 4s, ...
      try await Task.sleep(for: .seconds(delay))
    }
  }
}</div>
        <p>Because the sleep is cancellation-aware, cancelling the surrounding task stops the retries
        immediately. Add jitter in production to avoid thundering herds.</p>`,
      },
    ],
  },
  {
    id: "code-5",
    kind: "coding",
    title: "An @Observable list view model with load states",
    level: "mid",
    tags: ["swiftui", "mvvm", "state"],
    promptHtml: `<p>Build a view model that loads a list and exposes loading / loaded / empty / error states so
      the view can render each cleanly. Make it testable.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
          <li>Model state as an <code>enum</code> so impossible combinations can't exist.</li>
          <li>Depend on an <code>APIClient</code> protocol (injected) so tests pass a mock.</li>
          <li>Mark the model <code>@MainActor</code> and <code>@Observable</code>; switch over state in the
            view.</li>
        </ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">enum ListState { case loading, empty, loaded([Item]), failed(String) }

@MainActor @Observable
final class ItemsModel {
  private let api: APIClient
  var state: ListState = .loading
  init(api: APIClient) { self.api = api }

  func load() async {
    state = .loading
    do {
      let items = try await api.items()
      state = items.isEmpty ? .empty : .loaded(items)
    } catch {
      state = .failed(error.localizedDescription)
    }
  }
}</div>
        <p>The view does <code>switch model.state</code> and renders a spinner, list, empty view, or error.
        Tests construct <code>ItemsModel(api: MockAPI())</code> and assert the resulting state.</p>`,
      },
    ],
  },
  {
    id: "code-6",
    kind: "coding",
    title: "Fetch two endpoints concurrently and combine",
    level: "mid",
    tags: ["concurrency", "networking"],
    promptHtml: `<p>A profile screen needs the user and their posts from two endpoints. Fetch them in parallel
      and combine — don't await one then the other.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
          <li>Use <code>async let</code> to start both requests immediately.</li>
          <li><code>await</code> both when constructing the combined result; they run concurrently.</li>
          <li>If either throws, the whole function throws (and the sibling is cancelled).</li>
        </ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">func loadProfile(id: Int) async throws -&gt; Profile {
  async let user = api.user(id)
  async let posts = api.posts(forUser: id)
  return try await Profile(user: user, posts: posts)
}</div>
        <p>Two round-trips happen in parallel, roughly halving latency versus sequential awaits. For a dynamic
        number of children, use a <code>TaskGroup</code> instead.</p>`,
      },
    ],
  },
  {
    id: "code-7",
    kind: "coding",
    title: "A minimal Keychain token store",
    level: "senior",
    tags: ["security", "keychain"],
    promptHtml: `<p>Store and read an auth token securely. Explain why this belongs in the Keychain rather than
      <code>UserDefaults</code>.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
          <li>Use the Security framework's <code>SecItem</code> APIs with
            <code>kSecClassGenericPassword</code>.</li>
          <li>Delete any existing item before adding, so save is idempotent.</li>
          <li>UserDefaults is an unencrypted plist; the Keychain is encrypted and hardware-backed.</li>
        </ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">enum Keychain {
  static func save(_ token: String, account: String) {
    let data = Data(token.utf8)
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrAccount as String: account,
    ]
    SecItemDelete(query as CFDictionary)
    var add = query
    add[kSecValueData as String] = data
    SecItemAdd(add as CFDictionary, nil)
  }

  static func read(account: String) -&gt; String? {
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrAccount as String: account,
      kSecReturnData as String: true,
    ]
    var out: AnyObject?
    guard SecItemCopyMatching(query as CFDictionary, &amp;out) == errSecSuccess,
          let data = out as? Data else { return nil }
    return String(decoding: data, as: UTF8.self)
  }
}</div>
        <p>Tokens and passwords go here, not in UserDefaults. For higher assurance add
        <code>kSecAttrAccessible</code> and biometric access control.</p>`,
      },
    ],
  },
  {
    id: "code-8",
    kind: "coding",
    title: "Bridge a callback API to async/await",
    level: "senior",
    tags: ["concurrency", "interop"],
    promptHtml: `<p>You have a legacy <code>load(completion:)</code> that returns a <code>Result</code>. Expose a
      modern <code>async throws</code> version without rewriting the legacy code.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
          <li>Use <code>withCheckedThrowingContinuation</code>.</li>
          <li>Call the legacy API; in its completion, <code>resume</code> the continuation with the value or
            error — exactly once.</li>
          <li>The checked variant traps if you resume zero or multiple times.</li>
        </ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">func load() async throws -&gt; Data {
  try await withCheckedThrowingContinuation { continuation in
    legacyLoad { result in
      switch result {
      case .success(let data): continuation.resume(returning: data)
      case .failure(let err): continuation.resume(throwing: err)
      }
    }
  }
}</div>
        <p>This is the standard adapter for delegate- and completion-based APIs. Guarantee a single
        <code>resume</code> on every path or you'll leak or crash.</p>`,
      },
    ],
  },
  {
    id: "code-9",
    kind: "coding",
    title: "Infinite-scroll list that paginates",
    level: "senior",
    tags: ["swiftui", "performance", "pagination"],
    promptHtml: `<p>Render a long list that loads the next page as the user nears the bottom, without loading
      everything up front and without firing duplicate page requests.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
          <li>Use <code>List</code> (lazy) and trigger a load when the last item appears via
            <code>.onAppear</code>.</li>
          <li>Guard with an <code>isLoading</code> flag so you don't fire the same page twice.</li>
          <li>Append results and advance the page cursor in the model.</li>
        </ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">struct FeedView: View {
  @State private var model = FeedModel()
  var body: some View {
    List(model.items) { item in
      RowView(item: item)
        .onAppear {
          if item.id == model.items.last?.id {
            Task { await model.loadNextPage() }
          }
        }
    }
  }
}
// In FeedModel.loadNextPage(): guard !isLoading; isLoading = true;
// fetch page; items += new; page += 1; isLoading = false.</div>
        <p><code>List</code> only realizes visible rows, so memory stays flat; the last-item check plus the
        loading guard gives clean, duplicate-free pagination.</p>`,
      },
    ],
  },
  {
    id: "design-1",
    kind: "design",
    title: "Design an offline-first notes app",
    level: "architect",
    tags: ["architecture", "sync", "data"],
    promptHtml: `<p>Users create and edit notes that must work fully offline and sync across devices. Design the
      data flow, sync strategy, and conflict resolution.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
          <li>Clarify: multi-device, last-writer acceptable? rich text or plain? scale?</li>
          <li>Local store as source of truth; background sync engine; mutation queue with retries.</li>
          <li>Define conflict policy and change tracking.</li>
        </ul>`,
      },
      {
        label: "Model answer",
        html: `<p><b>Source of truth = local.</b> The UI always reads/writes SwiftData (or Core Data); writes
          render instantly with no spinner. A background <b>sync engine</b> pushes a queue of mutations and
          pulls remote changes.</p>
        <p><b>Sync:</b> each note has a stable id, an <code>updatedAt</code>, and a dirty flag. Mutations are
          queued with idempotency keys and retried on reconnect (with backoff). <b>Conflicts:</b> start with
          server-authoritative or last-write-wins by timestamp; upgrade to per-field merge or CRDTs only if the
          product needs true concurrent editing. <b>Observability:</b> surface a subtle sync state and a manual
          retry. The interview is really testing whether you make the local store authoritative and handle the
          queue/conflict edge cases explicitly.</p>`,
      },
    ],
  },
  {
    id: "design-2",
    kind: "design",
    title: "Architect an app for 30 engineers",
    level: "architect",
    tags: ["architecture", "modularization", "spm"],
    promptHtml: `<p>A single-target app has 12-minute incremental builds and constant merge conflicts. How do
      you restructure it so a large team can move fast?</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
          <li>Diagnose: one target = serial builds, tangled deps, merge pain.</li>
          <li>Modularize into local Swift packages with a strict dependency direction.</li>
          <li>Add shared foundations and tooling; enforce boundaries.</li>
        </ul>`,
      },
      {
        label: "Model answer",
        html: `<p><b>Modular monolith.</b> Split into local Swift packages: <i>feature</i> packages
          (Search, Profile, Checkout) that depend on shared <i>Core</i>, <i>DesignSystem</i>, and
          <i>Networking</i> packages — and never on each other. The app target just composes features.</p>
        <p><b>Payoffs:</b> parallel + incremental builds, compiler-enforced boundaries, per-feature tests and
          previews, and the ability to build a feature in isolation. Add a router so features stay decoupled
          from navigation, a design system for consistency, and CI that builds/tests changed packages. The
          architect signal is treating <b>module boundaries and dependency direction</b> as the core decision,
          plus a migration plan (extract leaf features first).</p>`,
      },
    ],
  },
  {
    id: "design-3",
    kind: "design",
    title: "Design a smooth image-heavy feed",
    level: "senior",
    tags: ["performance", "swiftui", "media"],
    promptHtml: `<p>Design a social feed of high-resolution photos that scrolls at a steady frame rate on older
      devices and doesn't blow the memory budget.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
          <li>Lazy rendering, off-main decoding, downsampling, caching, stable identity.</li>
          <li>Prefetch ahead; cancel loads for cells that scroll away.</li>
        </ul>`,
      },
      {
        label: "Model answer",
        html: `<p><b>Render lazily</b> with <code>List</code>/<code>LazyVStack</code> so only visible cells
          exist. <b>Downsample</b> images to the display size off the main actor (never decode 4000px for a
          300px cell). <b>Cache</b> decoded thumbnails in an actor-backed cache keyed by URL+size, de-duping
          concurrent loads. Give rows <b>stable identity</b> so SwiftUI reuses views. <b>Prefetch</b> a few rows
          ahead and <b>cancel</b> loads when cells disappear (tie work to <code>.task</code>). Validate with the
          Time Profiler (no main-thread decode) and Allocations (flat memory). The senior signal: smooth = do
          less per frame, off the main thread.</p>`,
      },
    ],
  },
  {
    id: "design-4",
    kind: "design",
    title: "Design the networking & data layer",
    level: "senior",
    tags: ["architecture", "networking", "caching"],
    promptHtml: `<p>Design the layer between your UI and the backend: how requests, decoding, caching, auth
      refresh, and testing fit together.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
          <li>Layered: ViewModel → Repository → (APIClient + Store).</li>
          <li>Protocols at each seam; central auth/retry; caching policy.</li>
        </ul>`,
      },
      {
        label: "Model answer",
        html: `<p><b>APIClient</b> (a protocol) owns transport: builds <code>URLRequest</code>s, runs
          <code>URLSession</code>, decodes <code>Codable</code>, maps errors. A <b>Repository</b> sits above it,
          returning domain models and owning the fresh-vs-cached decision (memory/disk/store) and pagination.
          <b>ViewModels</b> depend only on repository protocols, so tests inject fakes. Centralize
          <b>auth refresh</b> (intercept 401, refresh once, retry queued requests) and <b>retry/backoff</b> in
          one place. The win is one source of truth, clear seams for testing, and no duplicated networking
          logic in views.</p>`,
      },
    ],
  },
  {
    id: "design-5",
    kind: "design",
    title: "Design navigation & deep linking",
    level: "senior",
    tags: ["architecture", "navigation"],
    promptHtml: `<p>Design navigation for a multi-tab app that must support deep links, push-notification
      routing, and state restoration.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
          <li>Navigation as data: a path of typed Route values.</li>
          <li>A router maps routes to destinations; links/notifications decode to routes.</li>
        </ul>`,
      },
      {
        label: "Model answer",
        html: `<p>Model navigation as <b>data</b>: a <code>NavigationStack(path:)</code> bound to an array of
          typed <code>Route</code> values per tab. A <b>router</b> owns the path and maps routes to destinations
          via <code>navigationDestination(for:)</code>; features emit routes rather than presenting screens
          themselves. <b>Deep links and notifications</b> decode a URL/payload into <code>Route</code> values
          appended to the path — same mechanism as in-app navigation. <b>State restoration</b> becomes
          persist-and-reload the path. This decouples "what to show" from "how to present," makes flows
          testable, and gives one place to reason about the whole graph.</p>`,
      },
    ],
  },
  {
    id: "design-6",
    kind: "design",
    title: "Design a CI/CD & release pipeline",
    level: "senior",
    tags: ["cicd", "release", "signing"],
    promptHtml: `<p>Set up build, test, signing, and release for a team so every change is verified and shipping
      is one click — with a safe rollout.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
          <li>PR CI runs tests; main auto-ships TestFlight; releases promoted with phased rollout.</li>
          <li>Reproducible signing; versioning; observability + rollback.</li>
        </ul>`,
      },
      {
        label: "Model answer",
        html: `<p><b>On PR:</b> CI builds and runs unit + UI tests and lint. <b>On merge to main:</b> auto
          archive, sign, and upload a <b>TestFlight</b> build, auto-incrementing <code>CFBundleVersion</code>.
          <b>Release:</b> promote a TestFlight build to the App Store with a <b>phased rollout</b>. Use
          <b>Xcode Cloud</b> for tight App Store Connect integration, or <b>Fastlane</b> lanes on GitHub Actions
          for control; manage signing reproducibly (Fastlane <i>match</i> or automatic signing).
          <b>Safety net:</b> crash monitoring + a feature flag kill-switch so a bad release can be disabled
          without a new build. The signal is a repeatable path from commit to store with a rollback story.</p>`,
      },
    ],
  },
  {
    id: "design-7",
    kind: "design",
    title: "Design on-device semantic search",
    level: "beyond",
    tags: ["ai", "coreml", "search"],
    promptHtml: `<p>Let users search their content by <i>meaning</i>, not just keywords, entirely on device for
      privacy. Design it.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
          <li>Embed content with a small on-device model; store vectors locally.</li>
          <li>At query time, embed the query and rank by cosine similarity.</li>
        </ul>`,
      },
      {
        label: "Model answer",
        html: `<p><b>Index:</b> run each item through a small embedding model via <b>Core ML</b> (on the Neural
          Engine) to get a normalized vector; store vectors alongside the items locally. <b>Query:</b> embed the
          query with the same model and rank items by <b>cosine similarity</b> (top-k). Keep a keyword fallback
          and blend scores. <b>Engineering:</b> embed lazily/incrementally, cache vectors, quantize the model to
          fit memory/latency, and run indexing off the main actor. It's private (nothing leaves the device),
          works offline, and has no per-query cost — exactly the architecture this guide's own browser search
          uses as a live demo.</p>`,
      },
    ],
  },
];
