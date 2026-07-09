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
        html: `<p>Every unnecessary keystroke that hits the network wastes bandwidth and can return results out
          of order — the framework already solves both if you tie the request's lifetime to the query value.</p>
        <ul>
          <li>1. Drive a <code>.task(id: query)</code> modifier so a new task starts whenever the query changes —
            and SwiftUI cancels the previous task automatically.</li>
          <li>2. Inside, <code>try await Task.sleep(for: .milliseconds(300))</code>. If cancelled during the sleep
            it throws, so a new keystroke aborts the pending query.</li>
          <li>3. After the sleep, run the search. Cancellation makes the debounce fall out for free.</li>
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
        <p><b>Tying task lifetime to the value is the whole trick</b> — debounce and cancellation come from the
        framework rather than a hand-rolled timer or Combine's <code>.debounce</code>.</p>
        <p>Red flag: reaching for a <code>Timer</code> or a manual <code>DispatchWorkItem</code> to cancel the
        previous call — it works, but it's exactly the boilerplate <code>.task(id:)</code> exists to remove, and
        interviewers read it as not knowing structured concurrency.</p>`,
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
        html: `<p>A plain dictionary behind a lock only solves the race — it doesn't stop ten cells that scroll
          onto screen at once from each kicking off the same download. Caching the in-flight work, not just the
          result, is what collapses that into one request.</p>
        <ul>
          <li>1. Use an <code>actor</code> so all access to the dictionary is serialized — no locks.</li>
          <li>2. Cache either a finished image or the in-flight <code>Task</code>, so concurrent callers for the
            same URL await the same download.</li>
          <li>3. Await the stored task and return its value.</li>
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
        <p><b>Storing the in-flight <code>Task</code>, not just the finished result, is what de-dupes</b> — ten
        views asking at once all await one download, and the actor guarantees the dictionary is never touched
        concurrently.</p>`,
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
        html: `<p>Hand-writing <code>CodingKeys</code> for every field is maintenance debt that breaks silently
          the moment the backend adds a field — decoder-level strategies handle the common transforms once, for
          every model in the app.</p>
        <ul>
          <li>1. Model the shape with nested <code>Codable</code> structs.</li>
          <li>2. Set <code>keyDecodingStrategy = .convertFromSnakeCase</code> so <code>full_name</code> maps to
            <code>fullName</code> automatically.</li>
          <li>3. Set <code>dateDecodingStrategy = .iso8601</code> for the timestamps.</li>
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
        <p><b>Strategies handle the common cases globally; reach for explicit <code>CodingKeys</code> only when a
        single field doesn't follow the pattern.</b> Writing full <code>CodingKeys</code> for every model when a
        strategy would do is the tell that someone hasn't used <code>Codable</code> at scale.</p>`,
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
        html: `<p>Retrying immediately on failure just hammers a struggling server harder; growing the delay
          between attempts is what keeps a flaky network from turning into a self-inflicted outage.</p>
        <ul>
          <li>1. Loop up to <code>maxAttempts</code>; on success return, on failure remember the error.</li>
          <li>2. Between attempts <code>try await Task.sleep</code> for a growing delay (cancellation-aware).</li>
          <li>3. After the loop, throw the last captured error.</li>
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
        <p><b>Because the sleep is cancellation-aware, cancelling the surrounding task stops the retries
        immediately</b> — no orphaned background work. Add jitter in production so many clients retrying at once
        don't re-synchronize into a thundering herd.</p>`,
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
        html: `<p>A view that juggles separate <code>isLoading</code>/<code>items</code>/<code>error</code>
          booleans can represent impossible states (loading <i>and</i> error at once) — modeling state as one enum
          makes those states unrepresentable, and injecting the API dependency is what makes it testable at all.</p>
        <ul>
          <li>1. Model state as an <code>enum</code> so impossible combinations can't exist.</li>
          <li>2. Depend on an <code>APIClient</code> protocol (injected) so tests pass a mock.</li>
          <li>3. Mark the model <code>@MainActor</code> and <code>@Observable</code>; switch over state in the
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
        <p><b>The view just does <code>switch model.state</code></b> and renders a spinner, list, empty view, or
        error — no combinatorial boolean logic. Tests construct <code>ItemsModel(api: MockAPI())</code> and assert
        the resulting state directly.</p>`,
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
        html: `<p>Awaiting the two requests sequentially pays their full latency twice for no reason — the
          requests don't depend on each other, so they should be in flight at the same time.</p>
        <ul>
          <li>1. Use <code>async let</code> to start both requests immediately.</li>
          <li>2. <code>await</code> both when constructing the combined result; they run concurrently.</li>
          <li>3. If either throws, the whole function throws (and the sibling is cancelled).</li>
        </ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">func loadProfile(id: Int) async throws -&gt; Profile {
  async let user = api.user(id)
  async let posts = api.posts(forUser: id)
  return try await Profile(user: user, posts: posts)
}</div>
        <p><b>Two round-trips happen in parallel, roughly halving latency versus sequential awaits.</b> For a
        fixed, known-in-advance set of requests <code>async let</code> is the right tool; for a dynamic number of
        children, use a <code>TaskGroup</code> instead.</p>`,
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
        html: `<p>An auth token in <code>UserDefaults</code> sits in an unencrypted plist that any process with
          filesystem access to the container can read — the Keychain exists specifically to keep secrets encrypted
          and hardware-backed, which is a compliance requirement on most teams, not a nice-to-have.</p>
        <ul>
          <li>1. Use the Security framework's <code>SecItem</code> APIs with
            <code>kSecClassGenericPassword</code>.</li>
          <li>2. Delete any existing item before adding, so save is idempotent.</li>
          <li>3. Read it back with a matching query and decode the returned <code>Data</code>.</li>
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
        <p><b>Tokens and passwords go in the Keychain, never in UserDefaults.</b> For higher assurance add
        <code>kSecAttrAccessible</code> and biometric access control.</p>
        <p>Red flag: saying "I'd just encrypt the UserDefaults value myself" — that only moves the key-storage
        problem one level down without the hardware backing the Keychain already gives you for free.</p>`,
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
        html: `<p>Rewriting the legacy completion-based API risks breaking every existing caller for no gain —
          the continuation bridge lets new call sites adopt async/await while the legacy implementation stays
          untouched.</p>
        <ul>
          <li>1. Use <code>withCheckedThrowingContinuation</code>.</li>
          <li>2. Call the legacy API; in its completion, <code>resume</code> the continuation with the value or
            error — exactly once.</li>
          <li>3. Return the awaited value; the checked variant traps if you resume zero or multiple times.</li>
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
        <p><b>This is the standard adapter for delegate- and completion-based APIs.</b> Guarantee a single
        <code>resume</code> on every code path — the checked continuation traps at runtime if you resume it zero
        or more than once, which is exactly the bug class it's designed to surface early.</p>`,
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
        html: `<p>Loading the entire dataset up front burns memory and bandwidth the user may never scroll far
          enough to need — lazy rendering plus a load-triggered-by-appearance keeps both flat while still feeling
          continuous to the user.</p>
        <ul>
          <li>1. Use <code>List</code> (lazy) and trigger a load when the last item appears via
            <code>.onAppear</code>.</li>
          <li>2. Guard with an <code>isLoading</code> flag so you don't fire the same page twice.</li>
          <li>3. Append results and advance the page cursor in the model.</li>
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
        <p><b><code>List</code> only realizes visible rows, so memory stays flat; the last-item check plus the
        loading guard gives clean, duplicate-free pagination.</b></p>
        <p>Red flag: forgetting the <code>isLoading</code> guard — <code>.onAppear</code> can fire more than once
        for the same row during fast scrolling, and without the guard you'll fire the same page request twice.</p>`,
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
        html: `<p>An app that treats the network as the source of truth is unusable the moment connectivity
          drops — offline-first means the local store is authoritative and sync is a background concern layered
          on top, not a blocking dependency of every write.</p>
        <ul>
          <li>1. Clarify: multi-device, last-writer acceptable? rich text or plain? scale?</li>
          <li>2. Make the local store the source of truth; add a background sync engine with a mutation queue and
            retries.</li>
          <li>3. Define the conflict policy and how changes are tracked.</li>
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
          retry.</p>
        <p>Yes, a mutation queue with idempotency keys is more code than "just PUT the note" — but the
          alternative is silent data loss the moment two devices edit offline and reconnect, which is much more
          expensive to debug in production than to build up front. Treat it as infrastructure you write once and
          every future feature reuses, and budget for the long-term cost too: CRDTs in particular need tombstone
          garbage collection or their metadata grows unbounded. <b>The interview is really testing whether you
          make the local store authoritative and handle the queue/conflict edge cases explicitly.</b></p>`,
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
        html: `<p>A single target forces the compiler to rebuild everything on any change and forces every
          engineer to edit the same files — the fix isn't a faster machine, it's removing the coupling that makes
          builds serial and diffs collide in the first place.</p>
        <ul>
          <li>1. Diagnose: one target = serial builds, tangled deps, merge pain.</li>
          <li>2. Modularize into local Swift packages with a strict dependency direction.</li>
          <li>3. Add shared foundations and tooling, and enforce the boundaries in CI.</li>
        </ul>`,
      },
      {
        label: "Model answer",
        html: `<p><b>Modular monolith.</b> Split into local Swift packages: <i>feature</i> packages
          (Search, Profile, Checkout) that depend on shared <i>Core</i>, <i>DesignSystem</i>, and
          <i>Networking</i> packages — and never on each other. The app target just composes features.</p>
        <p><b>Payoffs:</b> parallel + incremental builds, compiler-enforced boundaries, per-feature tests and
          previews, and the ability to build a feature in isolation. Add a router so features stay decoupled
          from navigation, a design system for consistency, and CI that builds/tests changed packages.</p>
        <p>The migration itself costs real sprint time and a stretch of dual-maintenance while packages are
          extracted — but leaving it as one target costs that same time every week forever, in build minutes and
          merge conflicts across 30 engineers. Extract leaf features first so the payoff compounds early, and plan
          for it as an investment in velocity, not a one-off cleanup: as the team grows, module boundaries are
          what keep onboarding and code review tractable. <b>The architect signal is treating module boundaries
          and dependency direction as the core decision</b>, with a concrete migration plan.</p>`,
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
        html: `<p>Dropped frames during scroll almost always mean too much work is happening on the main thread
          per frame — the fix is doing less work there, not making the device faster.</p>
        <ul>
          <li>1. Render lazily, decode off the main thread, downsample, cache, and give rows stable identity.</li>
          <li>2. Prefetch a few rows ahead; cancel loads for cells that scroll away.</li>
        </ul>`,
      },
      {
        label: "Model answer",
        html: `<p><b>Render lazily</b> with <code>List</code>/<code>LazyVStack</code> so only visible cells
          exist. <b>Downsample</b> images to the display size off the main actor (never decode 4000px for a
          300px cell). <b>Cache</b> decoded thumbnails in an actor-backed cache keyed by URL+size, de-duping
          concurrent loads. Give rows <b>stable identity</b> so SwiftUI reuses views. <b>Prefetch</b> a few rows
          ahead and <b>cancel</b> loads when cells disappear (tie work to <code>.task</code>). Validate with the
          Time Profiler (no main-thread decode) and Allocations (flat memory).</p>
        <p><b>Smooth = do less per frame, off the main thread</b> — that's the one sentence to say when asked how
          you'd approach any scroll-performance problem, image feed or not.</p>`,
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
        html: `<p>Networking logic scattered across view models means auth refresh and retry get reimplemented
          (and re-broken) in every screen — a layered architecture puts each concern in exactly one place.</p>
        <ul>
          <li>1. Layer it: ViewModel → Repository → (APIClient + Store).</li>
          <li>2. Put a protocol at each seam so tests can inject fakes.</li>
          <li>3. Centralize auth refresh and retry policy in one place, not per-call-site.</li>
        </ul>`,
      },
      {
        label: "Model answer",
        html: `<p><b>APIClient</b> (a protocol) owns transport: builds <code>URLRequest</code>s, runs
          <code>URLSession</code>, decodes <code>Codable</code>, maps errors. A <b>Repository</b> sits above it,
          returning domain models and owning the fresh-vs-cached decision (memory/disk/store) and pagination.
          <b>ViewModels</b> depend only on repository protocols, so tests inject fakes. Centralize
          <b>auth refresh</b> (intercept 401, refresh once, retry queued requests) and <b>retry/backoff</b> in
          one place.</p>
        <p><b>One source of truth for auth and retry, with clear seams for testing, beats no duplicated
          networking logic scattered across views.</b> Say that line when asked why you'd bother with a
          Repository layer instead of calling the API straight from a view model.</p>`,
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
        html: `<p>Navigation that's imperative — screens presenting other screens directly — can't be driven by
          an external event like a push notification or a deep link without threading UIKit-style delegates
          through the whole app. Modeling navigation as data removes that problem entirely.</p>
        <ul>
          <li>1. Model navigation as a path of typed <code>Route</code> values.</li>
          <li>2. A router maps routes to destinations.</li>
          <li>3. Decode deep links and notification payloads into the same <code>Route</code> values.</li>
        </ul>`,
      },
      {
        label: "Model answer",
        html: `<p>Model navigation as <b>data</b>: a <code>NavigationStack(path:)</code> bound to an array of
          typed <code>Route</code> values per tab. A <b>router</b> owns the path and maps routes to destinations
          via <code>navigationDestination(for:)</code>; features emit routes rather than presenting screens
          themselves. <b>Deep links and notifications</b> decode a URL/payload into <code>Route</code> values
          appended to the path — same mechanism as in-app navigation. <b>State restoration</b> becomes
          persist-and-reload the path.</p>
        <p><b>This decouples "what to show" from "how to present," makes flows testable, and gives one place to
          reason about the whole navigation graph</b> — the line to lead with when asked why routes-as-data beats
          screens presenting screens.</p>`,
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
        html: `<p>Manual signing and manual TestFlight uploads don't scale past a couple of engineers and turn
          "ship it" into a half-day ritual — automating build → sign → distribute is what makes releases boring,
          which is the goal.</p>
        <ul>
          <li>1. On every PR, run tests and lint in CI.</li>
          <li>2. On merge to main, auto-archive, sign, and upload a TestFlight build.</li>
          <li>3. Promote releases with a phased rollout, and keep a rollback path.</li>
        </ul>`,
      },
      {
        label: "Model answer",
        html: `<p><b>On PR:</b> CI builds and runs unit + UI tests and lint. <b>On merge to main:</b> auto
          archive, sign, and upload a <b>TestFlight</b> build, auto-incrementing <code>CFBundleVersion</code>.
          <b>Release:</b> promote a TestFlight build to the App Store with a <b>phased rollout</b>. Use
          <b>Xcode Cloud</b> for tight App Store Connect integration, or <b>Fastlane</b> lanes on GitHub Actions
          for control; manage signing reproducibly (Fastlane <i>match</i> or automatic signing).</p>
        <p>Setting this up costs real time up front, and phased rollout means a fix takes longer to reach 100% of
          users than a single big-bang release — but the alternative is a bad build reaching everyone at once with
          no way back except an expedited review. Add a crash-monitoring + feature-flag kill-switch as the
          long-term safety net so a bad release can be disabled without a new build at all. <b>The signal is a
          repeatable path from commit to store with a rollback story</b>, not just green CI.</p>`,
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
        html: `<p>Sending content to a server for embedding is the easy path, but it means user data leaves the
          device and the feature stops working offline — an on-device embedding model trades a heavier client for
          both privacy and zero per-query cost.</p>
        <ul>
          <li>1. Embed content with a small on-device model; store vectors locally.</li>
          <li>2. At query time, embed the query and rank by cosine similarity.</li>
        </ul>`,
      },
      {
        label: "Model answer",
        html: `<p><b>Index:</b> run each item through a small embedding model via <b>Core ML</b> (on the Neural
          Engine) to get a normalized vector; store vectors alongside the items locally. <b>Query:</b> embed the
          query with the same model and rank items by <b>cosine similarity</b> (top-k). Keep a keyword fallback
          and blend scores. <b>Engineering:</b> embed lazily/incrementally, cache vectors, quantize the model to
          fit memory/latency, and run indexing off the main actor.</p>
        <p>An on-device model adds app size and needs quantization work a server-side model wouldn't — but a
          server round-trip means user content leaves the device and the feature dies offline, which is a
          non-starter for anything privacy-sensitive. <b>It's private (nothing leaves the device), works offline,
          and has no per-query cost</b> — exactly the architecture this guide's own browser search uses as a live
          demo. Plan for re-embedding as the model improves; treat the index as something you version, not a
          one-time build.</p>`,
      },
    ],
  },
];
