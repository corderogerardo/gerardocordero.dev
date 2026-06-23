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
    answerHtml: `<p><code>.default</code> (persistent cache/cookies/credentials), <code>.ephemeral</code> (nothing
      written to disk — private/incognito), and <code>.background</code> (transfers continue when the app is
      suspended/terminated, handed off to a system daemon). Pick the config for the job rather than always using
      <code>URLSession.shared</code>.</p>`,
    level: "senior",
  },
  {
    id: "r2",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you use WebSockets natively?",
    answerHtml: `<p><code>URLSessionWebSocketTask</code>: create with
      <code>session.webSocketTask(with: url)</code>, <code>resume()</code>, then <code>send(.string/.data)</code>
      and loop on <code>receive()</code>. Send periodic <code>sendPing</code>s to keep it alive and handle
      close/errors to reconnect. No third-party library needed for basic use.</p>
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
    answerHtml: `<p>Use <code>URLSession.bytes(for:)</code>, which returns an <code>AsyncBytes</code> sequence —
      iterate <code>for try await line in bytes.lines</code> to process server-sent events or an LLM token stream
      incrementally, instead of waiting for the whole body.</p>
    <div class="code">let (bytes, _) = try await URLSession.shared.bytes(for: request)
for try await line in bytes.lines { handle(line) }</div>`,
    level: "senior",
  },
  {
    id: "r4",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you upload a file or multipart form?",
    answerHtml: `<p>Build a <code>multipart/form-data</code> body (boundary + parts) or use
      <code>upload(for:from:)</code> / an <code>uploadTask</code> with the data or a file URL. For large files use
      a file-based upload (and a background session) so memory stays flat and the transfer survives
      backgrounding.</p>`,
    level: "senior",
  },
  {
    id: "r5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do background URLSession transfers work?",
    answerHtml: `<p>A <code>.background(withIdentifier:)</code> session hands transfers to a system process that
      continues while your app is suspended or killed. The system relaunches your app and calls
      <code>handleEventsForBackgroundURLSession</code>; you store the completion handler and invoke it when the
      session finishes delivering events via the delegate. Used for large up/downloads.</p>`,
    level: "architect",
  },
  {
    id: "r6",
    category: "security",
    categoryLabel: "Security",
    question: "What does URLSessionDelegate let you intercept?",
    answerHtml: `<p>Authentication challenges (do <b>certificate/public-key pinning</b> or handle basic/bearer
      auth), redirect handling (<code>willPerformHTTPRedirection</code>), and per-request <b>metrics</b>
      (<code>URLSessionTaskMetrics</code> — DNS/connect/TLS/transfer timings for diagnosing slowness). It's the
      hook for security and observability at the transport layer.</p>`,
    level: "senior",
  },
  {
    id: "r7",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How does HTTP caching work with URLSession?",
    answerHtml: `<p><code>URLCache</code> honors server <code>Cache-Control</code>/<code>ETag</code>. With an
      ETag, the client sends <code>If-None-Match</code> and the server can reply <b>304 Not Modified</b> (no body,
      reuse cache). Set a cache policy per request and size the <code>URLCache</code>. Layer your own store for
      offline/domain caching beyond HTTP.</p>`,
    level: "senior",
  },
  {
    id: "r8",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Where should auth tokens and refresh live?",
    answerHtml: `<p>Attach the bearer token in an <code>Authorization</code> header from a central client (not in
      each call site). On a 401, run a <b>single</b> token refresh, queue in-flight requests, then retry them —
      and store the refresh token in the <b>Keychain</b>. Centralizing this avoids race conditions and duplicated
      logic.</p>`,
    level: "senior",
  },
  {
    id: "r9",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you talk to a GraphQL API from iOS?",
    answerHtml: `<p>GraphQL is just HTTP POST with a <code>query</code> + <code>variables</code> JSON body, so
      plain <code>URLSession</code> + <code>Codable</code> works. For larger apps, <b>Apollo iOS</b> generates
      type-safe models from your schema/operations and gives a normalized cache and watchers — worth it when you
      have many queries sharing entities.</p>`,
    level: "senior",
  },
  {
    id: "r10",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What about gRPC on iOS?",
    answerHtml: `<p>Use <b>grpc-swift</b>: define services in <code>.proto</code>, generate Swift stubs, and call
      typed RPCs over <b>HTTP/2</b> with Protobuf payloads (compact, fast). It supports unary and <b>streaming</b>
      RPCs (client/server/bidirectional). Good for high-throughput, strongly-typed backends; needs HTTP/2 support
      end to end.</p>`,
    level: "architect",
  },
  {
    id: "r11",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How should a client handle 429 / rate limiting?",
    answerHtml: `<p>Respect the <code>Retry-After</code> header when present; otherwise back off exponentially
      with jitter. Make retried requests <b>idempotent</b> (or send an idempotency key) so a retry can't double a
      side effect. Cap attempts and surface a clear state to the user.</p>`,
    level: "senior",
  },
  {
    id: "r12",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "When do you drop to the Network framework (NWConnection)?",
    answerHtml: `<p>For custom protocols, raw TCP/UDP, TLS you control, or low-level performance — things above
      <code>URLSession</code>'s HTTP abstraction. <code>NWConnection</code> handles the socket lifecycle, and
      <code>NWPathMonitor</code> reports connectivity/interface changes. Most apps never need it; reach for it for
      bespoke transports.</p>`,
    level: "architect",
  },
  {
    id: "r13",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you handle very large or streamed JSON responses?",
    answerHtml: `<p>Avoid loading the whole body into memory: stream with <code>bytes(for:)</code> and decode
      incrementally (NDJSON line-by-line, or a streaming parser), or page the API. For normal payloads
      <code>JSONDecoder</code> is fine; for huge ones, downloading to a file and decoding from a stream keeps
      memory flat.</p>`,
    level: "senior",
  },
  {
    id: "r14",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How does Swift concurrency improve networking code?",
    answerHtml: `<p>Async <code>URLSession</code> methods make multi-request flows read top-to-bottom; run
      independent calls in parallel with <code>async let</code>/task groups; and cancellation propagates — when
      the screen disappears (<code>.task</code> cancels) the request is cancelled too. No nested completion
      handlers, no manual main-thread hops.</p>`,
    level: "senior",
  },
  {
    id: "r15",
    category: "security",
    categoryLabel: "Security",
    question: "What does App Transport Security enforce for networking?",
    answerHtml: `<p>HTTPS with modern TLS by default; cleartext HTTP and weak TLS are blocked unless you add a
      narrowly-scoped, justified exception in <code>Info.plist</code> (which App Review scrutinizes). Combine ATS
      with public-key pinning (via the session delegate) for high-assurance connections.</p>`,
    level: "senior",
  },
  {
    id: "r16",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you handle connectivity changes and offline?",
    answerHtml: `<p>Monitor with <code>NWPathMonitor</code> (don't gate requests on a stale reachability
      flag — just try and handle failure). Queue failed mutations, retry on reconnect with backoff, and serve from
      a local cache/store so the UI works offline (ties into offline-first architecture).</p>`,
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
      needed for basic use.</p>`,
  },
  {
    id: "rz2",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "To process a server token/event stream incrementally, use:",
    options: ["data(from:) and wait", "URLSession.bytes(for:) and iterate lines", "a Timer", "downloadTask"],
    answer: 1,
    explanationHtml: `<p><code>bytes(for:)</code> yields an <code>AsyncBytes</code> sequence you can iterate
      (e.g. <code>.lines</code>) for SSE/streaming without buffering the whole body.</p>`,
  },
  {
    id: "rz3",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Transfers that must continue when the app is suspended need a:",
    options: ["default session", "ephemeral session", "background URLSession configuration", "WebSocket"],
    answer: 2,
    explanationHtml: `<p>A <code>.background</code> configuration hands the transfer to a system process and
      relaunches your app to finish handling it.</p>`,
  },
  {
    id: "rz4",
    category: "security",
    categoryLabel: "Security",
    question: "Certificate pinning is implemented via:",
    options: ["Info.plist only", "The URLSessionDelegate auth challenge", "JSONDecoder", "URLCache"],
    answer: 1,
    explanationHtml: `<p>Handle the delegate's authentication challenge to validate the server's pinned
      key/cert and reject mismatches.</p>`,
  },
  {
    id: "rz5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "An ETag enables the server to respond with:",
    options: ["always 200 + body", "304 Not Modified (reuse cache)", "a WebSocket", "a redirect"],
    answer: 1,
    explanationHtml: `<p>The client sends <code>If-None-Match</code>; an unchanged resource returns 304 with no
      body, so the cached copy is reused — saving bandwidth.</p>`,
  },
  {
    id: "rz6",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "On HTTP 429, the best first move is to:",
    options: ["Retry immediately in a tight loop", "Respect Retry-After / back off with jitter, idempotently", "Crash", "Switch to WebSockets"],
    answer: 1,
    explanationHtml: `<p>Honor <code>Retry-After</code> or exponential backoff with jitter, and ensure retries
      are idempotent so you don't duplicate side effects.</p>`,
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
