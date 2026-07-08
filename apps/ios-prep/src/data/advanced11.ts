// Advanced batch 11 — Networking depth (senior/architect). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED11_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED11_FLASHCARDS: Flashcard[] = [
  {
    id: "r1",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What do the three URLSession configurations give you?",
    answerHtml: `<p>Picking the wrong configuration either leaks private data to disk or kills a transfer the
      moment the user backgrounds the app — so the choice is architectural, not cosmetic. <code>.default</code>
      persists cache/cookies/credentials; <code>.ephemeral</code> writes nothing to disk (private/incognito);
      <code>.background</code> hands transfers to a system daemon that keeps running while the app is suspended
      or terminated. <b>I pick the session config for the job instead of defaulting to
      <code>URLSession.shared</code> everywhere.</b></p>
    <p>Red flag: using <code>.default</code> (or <code>.shared</code>) for a large download and being surprised
      it dies when the user swipes the app away — that transfer needed a background session.</p>`,
    level: "senior",
  },
  {
    id: "r2",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you use WebSockets natively?",
    answerHtml: `<p>Realtime features (chat, live tracking, presence) need a persistent duplex connection, and
      pulling in a socket library for that is unnecessary weight — the platform already has one.
      <code>URLSessionWebSocketTask</code> gives you it: create with <code>session.webSocketTask(with: url)</code>,
      <code>resume()</code>, then <code>send(.string/.data)</code> and loop on <code>receive()</code>. Send
      periodic <code>sendPing</code>s to keep it alive and handle close/errors to reconnect. <b>No third-party
      library needed for basic WebSocket use — it's built into URLSession.</b></p>
    <div class="code">let task = session.webSocketTask(with: url); task.resume()
try await task.send(.string("hello"))
let message = try await task.receive()</div>`,
    level: "senior",
  },
  {
    id: "r3",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you consume a streaming response (e.g. SSE / token stream)?",
    answerHtml: `<p>Buffering the whole response before showing anything means the user stares at a spinner for as
      long as the slowest chunk takes — for an LLM token stream or a long-lived SSE feed that's the whole UX.
      Use <code>URLSession.bytes(for:)</code>, which returns an <code>AsyncBytes</code> sequence — iterate
      <code>for try await line in bytes.lines</code> to process events or tokens incrementally as they arrive.
      <b>I stream with <code>bytes(for:)</code> so the UI updates chunk-by-chunk instead of waiting for the whole
      body.</b></p>
    <div class="code">let (bytes, _) = try await URLSession.shared.bytes(for: request)
for try await line in bytes.lines { handle(line) }</div>`,
    level: "senior",
  },
  {
    id: "r4",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you upload a file or multipart form?",
    answerHtml: `<p>Loading a large file into an in-memory <code>Data</code> to upload it is how you get jetsammed on a
      big video — the fix is to hand the file to the transport instead of holding it in RAM. Build a
      <code>multipart/form-data</code> body (boundary + parts) or use <code>upload(for:from:)</code> / an
      <code>uploadTask</code> with the data or a file URL. <b>For large files I use a file-based upload on a
      background session so memory stays flat and the transfer survives backgrounding.</b></p>
    <p>Red flag: reading the whole file into <code>Data</code> before uploading it — that's the memory spike an
      interviewer is listening for; upload from the file URL instead.</p>`,
    level: "senior",
  },
  {
    id: "r5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do background URLSession transfers work?",
    answerHtml: `<p>A large up/download that only runs while the app is in the foreground fails the moment the user
      switches apps — background sessions exist so the transfer survives that. A
      <code>.background(withIdentifier:)</code> session hands the transfer to a system process that continues
      while your app is suspended or killed. When it finishes, the system relaunches your app and calls
      <code>handleEventsForBackgroundURLSession</code>; you store the completion handler and invoke it once the
      delegate finishes delivering events. <b>Background sessions decouple the transfer's lifetime from the
      app's process lifetime.</b></p>`,
    level: "architect",
  },
  {
    id: "r6",
    category: "security",
    categoryLabel: "Security",
    question: "What does URLSessionDelegate let you intercept?",
    answerHtml: `<p>It's the hook for security and observability at the transport layer — anything you need to inspect
      or override about how a connection is made has to happen here, below where <code>Codable</code> models even
      exist. It lets you intercept authentication challenges (do <b>certificate/public-key pinning</b> or handle
      basic/bearer auth), redirects (<code>willPerformHTTPRedirection</code>), and per-request <b>metrics</b>
      (<code>URLSessionTaskMetrics</code> — DNS/connect/TLS/transfer timings for diagnosing slowness). <b>I use
      URLSessionDelegate for pinning and task metrics — it's the only place transport-level detail is
      visible.</b></p>`,
    level: "senior",
  },
  {
    id: "r7",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How does HTTP caching work with URLSession?",
    answerHtml: `<p>HTTP caching exists to avoid re-downloading a body the server already told you hasn't changed —
      that's bandwidth and latency you don't have to pay. <code>URLCache</code> honors server
      <code>Cache-Control</code>/<code>ETag</code>: with an ETag, the client sends <code>If-None-Match</code> and
      the server can reply <b>304 Not Modified</b> (no body, reuse the cached copy). Set a cache policy per
      request and size the <code>URLCache</code>. <b>I let URLCache handle HTTP-level caching and layer my own
      store on top for offline/domain caching beyond what HTTP gives you.</b></p>`,
    level: "senior",
  },
  {
    id: "r8",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Where should auth tokens and refresh live?",
    answerHtml: `<p>Refresh logic scattered across call sites is where race conditions live — two requests hitting a
      401 at once can each fire a refresh and stomp on each other's token. Attach the bearer token in an
      <code>Authorization</code> header from a central client, not at each call site. On a 401, run a
      <b>single</b> token refresh, queue the in-flight requests, then retry them once it succeeds — and store the
      refresh token in the <b>Keychain</b>, never UserDefaults. <b>Auth belongs in one central client with a
      single-flight refresh, not duplicated at every call site.</b></p>
    <p>Red flag: refreshing the token independently inside every failing request — that's the double-refresh
      race that logs users out or duplicates the refresh call.</p>`,
    level: "senior",
  },
  {
    id: "r9",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you talk to a GraphQL API from iOS?",
    answerHtml: `<p>The decision here is really "do I need a client-side cache with entity normalization or not" —
      GraphQL itself needs no special transport. It's just HTTP POST with a <code>query</code> +
      <code>variables</code> JSON body, so plain <code>URLSession</code> + <code>Codable</code> works fine.
      For larger apps, <b>Apollo iOS</b> generates type-safe models from your schema/operations and gives a
      normalized cache and watchers. <b>I reach for Apollo when many queries share entities and I need a
      normalized cache — plain URLSession + Codable otherwise.</b></p>`,
    level: "senior",
  },
  {
    id: "r10",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What about gRPC on iOS?",
    answerHtml: `<p>gRPC trades REST's flexibility for a strict, generated contract and a much smaller wire format —
      worth it when throughput or type-safety across services matters more than human-readable payloads. Use
      <b>grpc-swift</b>: define services in <code>.proto</code>, generate Swift stubs, and call typed RPCs over
      <b>HTTP/2</b> with Protobuf payloads (compact, fast). It supports unary and <b>streaming</b> RPCs
      (client/server/bidirectional). <b>I reach for gRPC when the backend is already gRPC and I need typed,
      high-throughput calls — it needs HTTP/2 support end to end.</b></p>`,
    level: "architect",
  },
  {
    id: "r11",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How should a client handle 429 / rate limiting?",
    answerHtml: `<p>A naive immediate retry on 429 is how a client makes its own rate-limiting worse — it hammers a
      server that just told you to back off. Respect the <code>Retry-After</code> header when present; otherwise
      back off exponentially with jitter. Make retried requests <b>idempotent</b> (or send an idempotency key) so
      a retry can't double a side effect like a duplicate charge. Cap attempts and surface a clear state to the
      user. <b>I honor Retry-After or back off with jitter, and I never retry a non-idempotent request without an
      idempotency key.</b></p>
    <p>Red flag: retrying immediately in a tight loop — that's what turns a transient rate limit into a client
      that gets IP-banned.</p>`,
    level: "senior",
  },
  {
    id: "r12",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "When do you drop to the Network framework (NWConnection)?",
    answerHtml: `<p>Reaching for <code>NWConnection</code> when <code>URLSession</code> would do is over-engineering —
      it exists for cases outside HTTP entirely: custom protocols, raw TCP/UDP, TLS you control, or low-level
      performance work below <code>URLSession</code>'s HTTP abstraction. <code>NWConnection</code> handles the
      socket lifecycle, and <code>NWPathMonitor</code> reports connectivity/interface changes. <b>Most apps never
      need the Network framework — I reach for it only for bespoke, non-HTTP transports.</b></p>`,
    level: "architect",
  },
  {
    id: "r13",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you handle very large or streamed JSON responses?",
    answerHtml: `<p>Decoding a multi-hundred-MB JSON response with a single <code>JSONDecoder.decode</code> call holds
      the whole body and the whole parsed object graph in memory at once — that's the crash, not the parsing.
      Avoid loading the whole body into memory: stream with <code>bytes(for:)</code> and decode incrementally
      (NDJSON line-by-line, or a streaming parser), or page the API instead. <b>For normal payloads
      <code>JSONDecoder</code> is fine; for huge ones I stream and decode incrementally so memory stays flat.</b></p>`,
    level: "senior",
  },
  {
    id: "r14",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How does Swift concurrency improve networking code?",
    answerHtml: `<p>The old completion-handler pyramid didn't just look bad — it made cancellation and error propagation
      something you hand-wired yourself at every call site. Async <code>URLSession</code> methods make
      multi-request flows read top-to-bottom; independent calls run in parallel with <code>async let</code> or
      task groups; and cancellation propagates automatically — when the screen disappears (<code>.task</code>
      cancels) the request is cancelled with it. <b>Structured concurrency gives networking code free
      cancellation and no nested completion handlers.</b></p>`,
    level: "senior",
  },
  {
    id: "r15",
    category: "security",
    categoryLabel: "Security",
    question: "What does App Transport Security enforce for networking?",
    answerHtml: `<p>ATS exists so a network stack can't quietly regress to cleartext or weak TLS just because a backend
      team forgot to configure HTTPS properly — it's enforced at the OS level, not left to app code discipline.
      By default it requires HTTPS with modern TLS; cleartext HTTP and weak TLS are blocked unless you add a
      narrowly-scoped, justified exception in <code>Info.plist</code> (which App Review scrutinizes). <b>I treat
      ATS as the floor and layer public-key pinning via the session delegate on top for high-assurance
      connections.</b></p>
    <p>Red flag: adding a blanket <code>NSAllowsArbitraryLoads</code> exception to make a networking error go
      away — that disables ATS app-wide and App Review will flag it.</p>`,
    level: "senior",
  },
  {
    id: "r16",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you handle connectivity changes and offline?",
    answerHtml: `<p>A reachability flag only tells you the interface state a moment ago, not whether the next request
      will succeed — gating requests on it just adds a stale check that's wrong exactly when it matters. Monitor
      with <code>NWPathMonitor</code>, but don't gate requests on it — just try and handle failure. Queue failed
      mutations, retry on reconnect with backoff, and serve from a local cache/store so the UI works offline.
      <b>I treat connectivity monitoring as a signal for retry timing, not a gate on whether to attempt the
      request.</b></p>
    <p>Red flag: checking <code>NWPathMonitor</code> before every request and skipping it when "offline" — the
      path can flip the instant after you check; try the request and handle the failure instead.</p>`,
    level: "senior",
  },
];

export const ADVANCED11_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED11_QUIZ: QuizQuestion[] = [
  {
    id: "rz1",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Native WebSocket support comes from:",
    options: ["URLSessionWebSocketTask", "A third-party pod only", "NSURLConnection", "MKDirections"],
    answer: 0,
    explanationHtml: `<p><code>URLSessionWebSocketTask</code> provides send/receive/ping natively — no library
      needed for basic use. The tempting wrong answer, "a third-party pod only," is outdated advice from before
      Apple added native WebSocket support; reaching for a pod first is unnecessary weight today.</p>`,
  },
  {
    id: "rz2",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "To process a server token/event stream incrementally, use:",
    options: ["data(from:) and wait", "URLSession.bytes(for:) and iterate lines", "a Timer", "downloadTask"],
    answer: 1,
    explanationHtml: `<p><code>bytes(for:)</code> yields an <code>AsyncBytes</code> sequence you can iterate
      (e.g. <code>.lines</code>) for SSE/streaming without buffering the whole body. <code>data(from:) and wait</code>
      is the misconception: it blocks until the whole response arrives, which defeats the point of an incremental
      stream — you'd show nothing until the last token lands.</p>`,
  },
  {
    id: "rz3",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Transfers that must continue when the app is suspended need a:",
    options: ["default session", "ephemeral session", "background URLSession configuration", "WebSocket"],
    answer: 2,
    explanationHtml: `<p>A <code>.background</code> configuration hands the transfer to a system process and
      relaunches your app to finish handling it. A plain <code>default session</code> looks fine in a foreground
      test but the transfer is tied to your app's process — the moment it's suspended or killed, the transfer
      dies with it.</p>`,
  },
  {
    id: "rz4",
    category: "security",
    categoryLabel: "Security",
    question: "Certificate pinning is implemented via:",
    options: ["Info.plist only", "The URLSessionDelegate auth challenge", "JSONDecoder", "URLCache"],
    answer: 1,
    explanationHtml: `<p>Handle the delegate's authentication challenge to validate the server's pinned
      key/cert and reject mismatches. <code>Info.plist only</code> is the misconception — ATS exceptions in
      Info.plist control which hosts/TLS levels are allowed at all, but the actual pin comparison against a
      specific cert or key happens in code, in the delegate callback.</p>`,
  },
  {
    id: "rz5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "An ETag enables the server to respond with:",
    options: ["always 200 + body", "304 Not Modified (reuse cache)", "a WebSocket", "a redirect"],
    answer: 1,
    explanationHtml: `<p>The client sends <code>If-None-Match</code>; an unchanged resource returns 304 with no
      body, so the cached copy is reused — saving bandwidth. "Always 200 + body" is the naive assumption that
      caching headers do nothing — it's exactly the redundant transfer ETags exist to eliminate.</p>`,
  },
  {
    id: "rz6",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "On HTTP 429, the best first move is to:",
    options: ["Retry immediately in a tight loop", "Respect Retry-After / back off with jitter, idempotently", "Crash", "Switch to WebSockets"],
    answer: 1,
    explanationHtml: `<p>Honor <code>Retry-After</code> or exponential backoff with jitter, and ensure retries
      are idempotent so you don't duplicate side effects. Retrying immediately in a tight loop is the tempting
      instinct under pressure — it's also exactly the behavior that turns a 429 into an IP ban and hammers a
      server that just told you to slow down.</p>`,
  },
];

export const ADVANCED11_STUDY: StudySection[] = [
  {
    id: "st-adv-29",
    num: "44",
    title: "44 · Networking beyond GET: WebSockets, streaming & uploads",
    html: `<p><b>What it is.</b> The transport tools past a simple fetch. <b>WebSockets</b>
      (<code>URLSessionWebSocketTask</code>) for bidirectional realtime; <b>streaming</b> via
      <code>URLSession.bytes(for:)</code> (<code>AsyncBytes</code>) for SSE/token streams; <b>uploads</b>
      (multipart or file-based <code>uploadTask</code>); and <b>background sessions</b> for large transfers that
      survive suspension. For other shapes: <b>GraphQL</b> is HTTP POST (Apollo iOS for typed/cached at scale),
      <b>gRPC</b> via grpc-swift over HTTP/2 + Protobuf, and the <b>Network framework</b> for custom low-level
      transports.</p>
    <div class="callout tip"><span class="lbl">Pick the shape</span> request/response → URLSession; push/realtime
      → WebSocket; incremental → AsyncBytes; many typed queries → GraphQL/Apollo; high-throughput typed RPC →
      gRPC.</div>`,
  },
  {
    id: "st-adv-30",
    num: "45",
    title: "45 · Production networking: caching, auth & resilience",
    html: `<p><b>What it is.</b> What separates a demo from a shippable client. <b>Caching</b>: honor
      <code>Cache-Control</code>/<b>ETag</b> (304s) via <code>URLCache</code>, plus a domain store for offline.
      <b>Auth</b>: attach tokens centrally, refresh once on 401 and retry queued requests, keep the refresh token
      in the Keychain. <b>Resilience</b>: respect <code>Retry-After</code>/backoff-with-jitter on 429/5xx,
      idempotent retries, and connectivity handling with <code>NWPathMonitor</code>.</p>
    <p><b>Observability/security</b>: the <code>URLSessionDelegate</code> gives task metrics (DNS/TLS/transfer
      timings) and the hook for certificate pinning; keep ATS on. Wrap it all behind an <code>APIClient</code>
      protocol so it's testable and swappable.</p>
    <div class="callout warn"><span class="lbl">Don't</span> sprinkle networking through views, retry
      non-idempotent calls blindly, or gate requests on a stale reachability flag — just try and handle
      failure.</div>`,
  },
];
