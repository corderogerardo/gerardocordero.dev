# Software Engineering Practices — Andersen S2 (16 skills)

The breadth rows: architecture qualities and GRASP, reactive systems, CI/CD ownership, HTTP-layer trivia (REST constraints, CORS vs JSONP, WebSocket subprotocols), OWASP, refactoring policy, and testing process. Short answers, wide surface.

> Part of the [Andersen React Native S2 study guide](README.md). Drill these with [flashcards.md](flashcards.md).

## Architecture and Craft

### Architecture and Design
**They ask:** "What quality attributes drive an architecture, and which enterprise or cloud patterns have you actually applied?"

Architecture exists to satisfy quality attributes — performance, scalability, availability, modifiability, security, testability — and every design decision is a trade among them: caching buys performance at the cost of consistency, microservices buy independent deployability at the cost of operational complexity. A senior answer names the attribute a decision serves, not just the technology. UML at senior level is a communication tool, and each diagram answers one question: Component — what are the parts and their interfaces; Package — how is the code organized; Deployment — what runs on which node; Sequence — who calls whom in what order; Activity — what is the workflow, including branches and parallel paths. From Fowler's *Patterns of Enterprise Application Architecture*: Repository abstracts data access behind a collection-like interface, Unit of Work batches changes into one transaction, Service Layer defines the application's operation boundary, Gateway wraps an external system behind a local interface — a React Native API client module is a Gateway. Cloud: service models are IaaS (you manage the OS up), PaaS (you deploy code), SaaS (you consume software); deployment types are public, private, and hybrid. Cloud patterns that matter for mobile backends: retry with exponential backoff **and jitter, but only on idempotent operations** — a blind retry on a non-idempotent write duplicates the charge or the booking, so writes carry an idempotency key, attempts are bounded, and the client honors `Retry-After`; circuit breakers on the dependencies that actually fail under load, not blanket-applied to every call; CQRS when read and write loads diverge; strangler fig to migrate a legacy API incrementally instead of a big-bang rewrite.

**Say it:** "Architecture is the set of decisions that trade quality attributes against each other — I name the attribute first, then the pattern that serves it."
**Red flag:** Reciting pattern names without a driving quality attribute reads as memorization — always anchor the pattern to the attribute it buys and what it costs.

### OOP
**They ask:** "What is GRASP, and how does it differ from SOLID?"

GRASP answers the question SOLID does not: given a new responsibility, *which* class should own it — get that wrong and no amount of clean class design saves the codebase from coupling. GRASP (General Responsibility Assignment Software Patterns, from Larman) is nine patterns: Information Expert — assign the responsibility to the class holding the data it needs; Creator — the class that aggregates or closely uses an object creates it; Controller — a non-UI object receives system events; Low Coupling and High Cohesion — the evaluative criteria every assignment is judged against; Polymorphism — vary behavior by type, not by conditionals; Pure Fabrication — invent a class that represents no domain concept when cohesion demands it (a `PersistenceService`); Indirection — insert an intermediary to decouple two components; Protected Variations — wrap a predicted point of change behind a stable interface. The distinction to state sharply: SOLID governs how a class is *designed*; GRASP governs where a responsibility *lives* — you apply GRASP first to place the responsibility, then SOLID to shape the class. Concrete React Native example of Protected Variations: define a `PaymentProvider` TypeScript interface and put the Stripe SDK behind it — when the business swaps processors, one adapter changes and every screen that takes payments is untouched.

**Say it:** "SOLID tells me how to design a class; GRASP tells me which class should own a responsibility in the first place — I place with GRASP, then shape with SOLID."
**Red flag:** Answering a GRASP question with the SOLID acronym signals you have never heard of it — name Information Expert and Protected Variations with one concrete placement decision instead.

### Functional programming
**They ask:** "Give me real examples of pure functions in your code, and explain tail call optimization — can you rely on it in JavaScript?"

Purity is what makes core logic testable and cacheable: a pure function returns the same output for the same inputs and performs no side effects — no mutation, no I/O, no reads of external mutable state. Real examples from a React Native codebase: Redux reducers (`(state, action) => newState`), selectors, date/currency formatting utilities, and an SRS scheduler that computes the next review interval from a card's history. The payoff is referential transparency — a call can be replaced by its result — which enables memoization (`useMemo`, `reselect`), trivial unit tests with no mocks, and safe concurrency. Tail call optimization: when a function's final action is a call in tail position, the engine can reuse the current stack frame, making deep recursion run in constant stack space. Proper tail calls are in the ES2015 specification, but only JavaScriptCore (Safari) ships them — V8 removed its implementation, and Hermes, React Native's default engine, does not perform TCO. So the senior position is: do not rely on TCO in JavaScript; for deep recursion over large data, convert to an explicit loop with a stack, or use a trampoline that returns thunks instead of recursing.

```ts
const sum = (xs: number[]) => xs.reduce((acc, x) => acc + x, 0); // pure
```

**Say it:** "TCO is in the ES2015 spec but only JavaScriptCore implements it — Hermes and V8 don't — so for deep recursion I convert to a loop or trampoline rather than gamble on the engine."
**Red flag:** Claiming JavaScript recursion is safe "because ES6 added TCO" is a stack overflow waiting in production — state that engine support never materialized outside Safari.

### Reactive programming
**They ask:** "What makes a system reactive? Define the four characteristics from the Reactive Manifesto."

The term covers two things a senior keeps apart: reactive *systems* — an architectural style from the Reactive Manifesto — and reactive *programming* — coding with asynchronous data streams (Rx-style observables and operators); conflating them signals shallow reading. The Manifesto's four characteristics: **responsive** — the system answers within consistent, bounded time, because latency is the user-facing contract everything else serves; **resilient** — it stays responsive under failure, through isolation, replication, and delegation, so one component's crash does not cascade; **elastic** — it stays responsive under varying load by scaling resources up and down; **message-driven** — asynchronous message passing is the foundation that provides the loose coupling, isolation, and backpressure making the other three achievable. Message-driven is the enabler; responsive is the goal. Reactive programming is one implementation technique: observables emit values over time, operators (`map`, `debounce`, `switchMap`) transform streams declaratively, and backpressure lets a slow consumer signal a fast producer. The mobile connection: a React Native app is inherently stream-shaped — gestures, WebSocket messages, location updates — and state layers like MobX or RxJS-based services apply reactive programming locally, while the backend the app talks to should exhibit the four system characteristics so a spike in mobile traffic degrades gracefully instead of failing hard.

**Say it:** "Responsive is the goal, resilient and elastic keep it true under failure and load, and message-driven is the asynchronous foundation that makes the other three possible."
**Red flag:** Answering the systems question with an RxJS operator tour confuses the architecture with the coding style — define the four characteristics first, then note Rx is one way to program within such a system.

### Algorithms and data structures
**They ask:** "How do you reason about algorithm complexity, and where has it actually mattered in a mobile app?"

Complexity analysis is what separates code that survives production data volumes from code that only survived the demo — on a mid-range phone, an accidental O(n²) over a 10k-item list is a frozen JS thread, not a footnote. The reasoning rules: drop constants and keep the dominant term (O(2n + 10) is O(n)); sequential steps add, nested loops over the same input multiply (O(n·m), or O(n²) when equal); halving the input each step gives a log factor — binary search is O(log n), efficient comparison sorts are O(n log n); amortized analysis averages occasional expensive operations over many cheap ones — array `push` is amortized O(1) despite occasional reallocation, as is hash-map insertion across resizes. Structure costs to state from memory: hash map — O(1) average lookup/insert; array — O(1) index access, O(n) search and mid-insertion; balanced tree — O(log n) for everything, ordered. Space trades against time: memoization buys speed with memory, which is a real constraint on low-end devices. The mobile framing that lands: a `.find` inside a render over a list is O(n) per row, O(n²) per pass — build a `Map` once instead; and re-sorting inside render on every keystroke is wasted O(n log n) that memoization removes.

**Say it:** "I drop constants, keep the dominant term, and watch for the hidden multiplication — a linear lookup inside a loop is the O(n²) that freezes a list screen."
**Red flag:** Dismissing Big-O as "irrelevant, devices are fast" is a senior-level fail — mid-range Android hardware and 10k-item datasets make the quadratic term visible to the user.

## Delivery and Operations

### Builds and CI CD
**They ask:** "Describe your CI/CD setup for a React Native app. How do you handle signing, build numbers, and releases — and can you build from the command line without the pipeline?"

CI exists to make integration a non-event: small changes merge continuously behind automated gates, so the cost of finding a defect stays proportional to the size of the change. The practices that matter: trunk-based development with short-lived branches, a fast fail-loud pipeline (build, typecheck, lint, unit tests on every push), and caching (node_modules, Gradle, CocoaPods) so feedback arrives in minutes, not hours. For mobile the stack is typically GitHub Actions or similar for the verification gate, plus Fastlane or EAS Build for the native build-sign-submit lane — signing credentials live in a secrets store (CI secrets, EAS credentials, Fastlane match), never in the repo. Build numbers must be monotonic and machine-owned (auto-increment in CI or remote versioning), while the marketing version stays human-owned in one source of truth. CLI fluency is the escape hatch when the pipeline breaks:

```bash
xcodebuild -workspace App.xcworkspace -scheme App \
  -configuration Release clean archive
./gradlew clean assembleRelease
```

Software Configuration Management ties it together: the pipeline definition, build config, and dependency lockfiles are versioned alongside the code — and the build *environment* is pinned too (Node/JDK/Xcode versions, the CI image), because lockfiles alone don't make a mobile binary reproducible. Release notes and changelogs are pipeline artifacts generated from commits/PRs, not documents someone remembers to write. The trade-off of all this automation is upfront pipeline investment — but the alternative is a "works on my machine" release process that fails exactly when you need a hotfix.

**Say it:** "My rule is that a release must be reproducible from a git tag plus a pinned build environment and dependency artifacts; the remaining controlled inputs are the CI-owned build number and signing material."
**Red flag:** Describing releases as "I archive in Xcode and upload manually" — that says the release process lives in one person's head; describe the automated lane and present the manual CLI path as the documented fallback.

### Troubleshooting, Logging and Monitoring
**They ask:** "Your app is crashing in production but works fine locally. Walk me through your observability setup — what tools do you have in place before the incident, and how do you profile once you reproduce it?"

Production observability is what turns "users say it's broken" into a stack trace with context — without it you are debugging blind on devices you don't own. I set up three pillars before launch. 1. Crash reporting: Sentry or Crashlytics, with the critical RN-specific step of uploading source maps (JS) and dSYMs/ProGuard mapping files (native) in the release pipeline — without them, minified Hermes frames and obfuscated native frames are unreadable, so symbol upload is a CI step, not a manual chore. 2. Performance monitoring: track cold start, TTI, slow/frozen frames, and network spans (Sentry performance monitoring or Firebase Performance), so regressions show up as trends, not user complaints. 3. Structured logging with levels and breadcrumbs: breadcrumbs reconstruct the user's path to the crash; verbose logging is stripped or gated in release builds because logs cost performance and can leak PII. For local profiling I match the tool to the layer: React DevTools Profiler for re-render waste, the Hermes sampling profiler for JS CPU time, Xcode Instruments (Time Profiler, Allocations) and Android Studio Profiler for native CPU, memory, and rendering. Alerts fire on crash-free session rate dropping below a threshold per release — that single number is the go/no-go signal for staged rollouts.

**Say it:** "I treat symbol upload as a release-pipeline gate, and crash-free rate per release as the rollout go/no-go metric — monitoring is configured before the incident, not during it."
**Red flag:** Answering with "I'd add console.logs and try to reproduce it" — that admits there was no observability in place; lead with the crash reporter and breadcrumbs you already ship, then profiling as the follow-up once it reproduces.

## Network

### REST
**They ask:** "REST gets thrown around loosely — what are the actual architectural constraints, and why do they matter?"

REST's constraints exist to let a system scale and evolve without coordinating every client with every server — that's the business payoff, not the URL aesthetics. Fielding defined six: **client-server** (separate UI concerns from data storage so each evolves independently), **stateless** (every request carries all context; no server-side session), **cacheable** (responses declare their own cacheability), **uniform interface**, **layered system** (a client can't tell whether it's talking to the origin server or a proxy/CDN/load balancer), and **code-on-demand** — the only optional one (server ships executable code, e.g. JavaScript).

Statelessness is the constraint with the biggest operational consequence: if no request depends on server memory of a previous one, any server can handle any request — horizontal scaling and failover become load-balancer configuration instead of sticky-session engineering. The layered-system constraint is what makes CDNs and API gateways free to insert.

Uniform interface is the one candidates forget, and it's four sub-constraints: resource identification (URIs), manipulation through representations (you exchange JSON/XML representations, not the resource itself), self-descriptive messages (media types, standard methods), and HATEOAS (responses link to available next actions). Most production "REST" APIs stop before HATEOAS — worth naming Richardson's maturity model here: level 2 (resources + verbs + status codes) is the industry norm; level 3 (hypermedia) is rare.

**Say it:** "Statelessness is the constraint I care about most in practice — when no request depends on server session state, horizontal scaling is a load-balancer problem, not an application problem."
**Red flag:** Reciting "GET, POST, PUT, DELETE" as the definition of REST — those are HTTP methods, not constraints; name the six Fielding constraints and unpack uniform interface, the one everyone skips.

### AJAX
**They ask:** "Beyond GET and POST — what do CONNECT and TRACE do, and what can XHR do that fetch still can't?"

These two methods matter because they explain how your HTTPS traffic actually traverses debugging proxies — knowledge you use every time you attach Charles or mitmproxy to a React Native app. **CONNECT** asks a proxy to open a raw TCP tunnel to a host:port; after the proxy replies 200, bytes flow through opaquely — this is how TLS passes through an HTTP proxy without being terminated. A debugging proxy like Charles answers the CONNECT, then performs a man-in-the-middle with its own root certificate, which is exactly why you must install and trust that certificate on the device (and why apps with certificate pinning go dark under Charles). **TRACE** echoes the received request back for diagnostics; it's disabled on virtually all production servers because it enabled cross-site tracing (XST) — reflecting requests could leak cookies marked `HttpOnly`.

Advanced XHR is the second half of the question: `responseType` (`'blob'`, `'arraybuffer'`, `'json'`), `timeout` with `ontimeout`, `abort()`, `withCredentials` for cross-origin cookies, and — the differentiator — `xhr.upload.onprogress` for upload progress. Fetch has since matched most of this (`AbortController` for cancellation, streaming response bodies), but **upload progress remains the gap**: fetch cannot report it without streaming-request support, so file-upload progress bars still justify XHR — which is also why React Native libraries fall back to XHR for uploads.

**Say it:** "CONNECT is how HTTPS traverses a proxy — the proxy opens a blind TCP tunnel, which is exactly what Charles intercepts with its own root cert; and upload progress is the one thing XHR still does that fetch doesn't."
**Red flag:** Calling XHR "legacy, just use fetch" — that answer collapses the moment they ask how you'd show upload progress; acknowledge fetch as the default and name the concrete gap.

### CORS
**They ask:** "Compare JSONP and CORS — and does any of this even apply in React Native?"

Both exist because of the browser's same-origin policy — the security boundary that stops a script on one origin from reading responses from another, so a malicious page can't ride your logged-in cookies into your bank's API. **JSONP** is the pre-CORS workaround: `<script>` tags were never subject to the read restriction, so the client injects `<script src="https://api.example.com/data?callback=handle">` and the server wraps the JSON in a call to `handle(...)`. Its costs define why it died: GET-only, no HTTP error handling (a failed script just doesn't run), and total trust — you're executing arbitrary code from the remote server, which is a self-inflicted XSS vector.

**CORS** replaces the hack with an explicit server opt-in: the browser still enforces the same-origin policy, but the server can relax it per-response via `Access-Control-Allow-Origin` and friends. Non-simple requests (custom headers, `PUT`/`DELETE`, non-form content types like `application/json`) trigger a **preflight** `OPTIONS` request the server must answer before the real request is sent; credentialed requests additionally require `Access-Control-Allow-Credentials: true` and an explicit (non-wildcard) origin.

The senior React Native point: there is no browser and therefore no same-origin policy in the native runtime — fetch from an RN app hits any host directly. CORS pain reappears only in RN-Web builds and browser-based dev tooling.

**Say it:** "JSONP was a script-tag loophole that traded away error handling and security; CORS is the server explicitly opting out of the same-origin policy — and in native React Native there's no browser enforcing SOP, so CORS only bites me on the web target."
**Red flag:** Saying "I'd fix CORS errors on the server by adding headers to the request" — CORS is granted by response headers from the server; adding headers to the client request is what triggers preflight, it never grants access.

### Web Socket
**They ask:** "Walk me through the WebSocket handshake — and what are subprotocols and extensions for?"

WebSocket exists because request-response HTTP makes the server mute — it can't push — so real-time features degrade into polling; WebSocket replaces that with one persistent, full-duplex connection. Mechanically: the client sends an HTTP/1.1 GET with `Upgrade: websocket`, `Connection: Upgrade`, and a random `Sec-WebSocket-Key`; the server answers `101 Switching Protocols` with the derived `Sec-WebSocket-Accept`, and from then on the TCP connection carries lightweight WebSocket frames in both directions instead of HTTP.

The matrix specifically wants the two negotiation layers, which live at different levels:
- **Subprotocols** (`Sec-WebSocket-Protocol`) negotiate the *application* protocol spoken over the socket — the client offers a list (`graphql-ws`, `stomp`), the server picks one. WebSocket itself gives you frames, not message semantics; subprotocols are how both sides agree what the messages mean.
- **Extensions** (`Sec-WebSocket-Extensions`) negotiate *frame-level* features transparent to application code — the canonical one is `permessage-deflate`, per-message compression.

Production reality is the seniority layer: intermediaries silently kill idle connections, so you run application-level heartbeats (ping/pong) and reconnect with exponential backoff plus jitter, and you re-authenticate and re-subscribe on reconnect. React Native ships a `WebSocket` implementation natively, so libraries like `graphql-ws` work without polyfills.

**Say it:** "Subprotocols negotiate what the messages mean — like graphql-ws — while extensions negotiate frame-level features like permessage-deflate; one is application-layer, the other is transport-layer."
**Red flag:** Treating the connection as reliable — an answer without heartbeats and backoff-with-jitter reconnection describes a demo, not production; name both unprompted.

### Server Sent Events
**They ask:** "EventSource versus WebSocket — when would you pick each, and what's the story in React Native?"

The choice is an infrastructure decision, not a feature comparison: SSE rides plain HTTP, so every proxy, load balancer, and auth layer you already run keeps working, while WebSocket is a separate protocol your infrastructure must explicitly support. **SSE** (`EventSource`) is a one-way server-to-client stream over a long-lived HTTP response (`Content-Type: text/event-stream`), text-only, with two features WebSocket makes you build yourself: automatic reconnection, and a message-replay *hook* — the client sends the `Last-Event-ID` header on reconnect, but resume only happens if the server assigns event ids, retains history, and implements the replay; without that server-side work a disconnect still drops events. **WebSocket** is full-duplex and binary-capable, but ships no reconnect, no replay, and no message semantics — you build or adopt all three.

Decision rule: match the data direction. Server-push-only flows — notification feeds, dashboards, live scores, and LLM token streaming (the pattern behind chat-completion UIs, whether as SSE proper or fetch streaming) — fit SSE; client-input-driven flows — chat, collaborative editing, multiplayer — need the upstream channel and justify WebSocket. If the client only sends occasional commands, SSE down plus regular POSTs up is often simpler than a socket.

React Native angle: RN has native WebSocket support but **no built-in `EventSource`** — you use a community polyfill (e.g. `react-native-sse`) or consume the stream via fetch with incremental reading, which is how streaming-LLM RN apps typically do it.

**Say it:** "SSE is one-way over plain HTTP with reconnection built in and a Last-Event-ID replay contract the server must implement; WebSocket is two-way and binary but you build the reliability yourself — so I pick by data direction, not by which is newer."
**Red flag:** Defaulting to WebSocket for a notifications feed "because it's real-time" — a one-way feed on WebSocket means hand-rolling the reconnect EventSource gives you for free and the replay protocol SSE at least standardizes; reserve the socket for genuinely bidirectional traffic.

## Quality and Security

### Security and Cryptography
**They ask:** "Walk me through the OWASP Top 10, name some concrete authentication attacks, and explain what actually happens in a TLS handshake."

One exploited auth flaw or leaked token turns into a breach disclosure, so security is an architectural property, not a checklist you run before release. From the OWASP Top 10 (2025 revision — ten categories; know that you're quoting a subset), the five worth deepest fluency: broken access control (users reaching data or actions beyond their role), injection (untrusted input interpreted as code — SQL, command, or SSI injection, where an attacker submits server-side include directives like `<!--#exec -->` into a page the server renders with SSI enabled), cryptographic failures, authentication failures, and security misconfiguration. The OWASP **Mobile** Top 10 (2024) is a separate ten-item taxonomy, not an appendix to the web list — the two that bite RN apps hardest are insecure data storage and insecure communication — which is why a JWT belongs in Keychain/Keystore (SecureStore in Expo), never in AsyncStorage, which is unencrypted. Classic auth attacks: credential stuffing (replaying leaked credentials), session fixation (forcing a known session id, defeated by rotating the session on login), and JWT pitfalls — accepting `alg: none`, tokens without expiry, or no server-side revocation path. TLS in one breath: client and server negotiate protocol version and cipher suite, the server presents a certificate chain the client validates to a trusted root, an ECDHE key exchange derives a session key (forward secrecy — a stolen private key can't decrypt past traffic), then all traffic runs under symmetric encryption. Certificate pinning hardens the chain-validation step against a compromised or coerced CA.

**Say it:** "TLS handles encryption in transit, but most real breaches are broken access control and broken auth — so I threat-model the authorization boundary, keep tokens in the platform keystore, and validate JWTs for algorithm, expiry, and audience on every request."
**Red flag:** Answering "we use HTTPS, so we're secure" — HTTPS covers transport only; say instead that you also cover storage (Keychain/Keystore, not AsyncStorage) and access control, the actual number-one OWASP category.

### Refactoring
**They ask:** "How do you refactor a legacy area safely, and how would you define and report a technical-debt policy to non-technical stakeholders?"

Refactoring is how you keep delivery speed constant as a codebase ages — done ad hoc it's risk; done as policy it's an investment with a visible return. The safe mechanics: 1. Pin behavior with characterization tests before touching anything. 2. Move in small, reversible steps, each one green and shippable. 3. Refactor *toward a named pattern* — extract a Strategy from a growing conditional, replace a type-switch with polymorphism — so the destination is a structure the team already recognizes. 4. For large migrations, use the strangler-fig approach: route traffic through a seam and replace the old implementation slice by slice, never a big-bang rewrite. A debt policy has three parts: a **definition** (what counts as debt — a deliberate, recorded shortcut, not just "code I dislike"), a **register** (every accepted shortcut gets a tagged ticket plus a short decision record: why we took it, what the payoff trigger is), and a **budget** (a fixed share of each sprint reserved for paydown, so it never competes with features ticket-by-ticket). Reporting is where seniors differ: stakeholders don't feel "cyclomatic complexity" — they feel crash rate, lead time for changes, and onboarding time, so tie the register to those metrics and report the trend, not the backlog size.

**Say it:** "I refactor behind tests in small reversible steps toward known patterns, and I run debt as a policy — a register of recorded decisions and a fixed sprint budget — reported to stakeholders in metrics they feel: crash rate and lead time."
**Red flag:** Proposing a rewrite as the answer to debt — big-bang rewrites stall feature delivery and usually re-implement undocumented behavior wrong; say strangler fig instead.

### Testing processes
**They ask:** "Describe your JavaScript testing strategy — what BDD means to you, and where tools like Jasmine, Mocha/Chai/Sinon, Karma, and Jest fit."

A test suite's job is to make change cheap: the fastest feedback at the bottom of the pyramid, the highest confidence at the top. My shape: many unit tests (Jest — pure logic, reducers, schedulers), a solid integration layer (React Native Testing Library, asserting behavior through the UI contract, never implementation details like state internals), and few E2E flows (Detox or Maestro) for the critical paths. BDD is a collaboration practice before it's a syntax: specifications written in behavior language — Given-When-Then — that product and engineering agree on, with Cucumber/Gherkin when non-developers own the specs. The `describe`/`it` style in every modern runner is BDD's readable-spec heritage:

```js
describe('SRS scheduler', () => {
  it('given a failed card, schedules it for today', () => {
    const next = schedule(card, 'again');
    expect(next.due).toEqual(today);
  });
});
```

Stack history, because they will probe it: Mocha + Chai + Sinon was the composable trio — runner, assertions, and test doubles chosen separately; Jasmine shipped all three batteries-included; Karma was the runner that executed suites in real browsers; it was officially deprecated in 2023 and no longer receives new features. Jest superseded that generation by bundling runner, assertions, mocking, snapshots, and coverage; Vitest follows the same batteries-included model, though its coverage ships as an optional provider package (`@vitest/coverage-v8`) rather than in the box. Sinon's vocabulary still matters: a **spy** records calls, a **stub** replaces behavior, a **mock** carries pre-programmed expectations that fail the test themselves.

**Say it:** "I keep the pyramid honest — many Jest unit tests, RNTL integration tests that assert behavior not implementation, few E2E flows — and I treat BDD as shared Given-When-Then specs, not just describe/it syntax."
**Red flag:** Equating BDD with using `describe`/`it` — that's only the syntax; say the practice is behavior-language specs agreed with product before code.

### Code review and code standards
**They ask:** "How do you set up code-quality standards for a team — linting, policy documents, and services like SonarQube?"

The principle: automate every objective judgment so human review is spent on design, naming, and correctness — a reviewer arguing about semicolons is a wasted senior. Tooling layer: ESLint (flat config is the current format, default since v9) with typescript-eslint for type-aware rules — TSLint was deprecated in 2019 and its rules migrated into typescript-eslint — plus Prettier so formatting is never a review comment, all enforced in CI so "passing lint" is a precondition of review, not a request in it. Policy layer — the documents that make standards teachable instead of tribal: a style guide (mostly "we use X, configured here," pointing at the lint config as the source of truth), a PR checklist and Definition of Done, and ADRs (architecture decision records) so the *why* behind conventions survives team turnover. Service layer: SonarQube-class analysis adds what a linter can't see per-file — duplication, cognitive complexity, known-vulnerable patterns, and coverage on new code — expressed as a **quality gate** in CI: the build fails if new code drops below the thresholds, which stops debt at the door without relitigating the old code. Review culture is the multiplier: small PRs, author-first descriptions (what/why before the diff), and review as partnership — the goal is helping the author ship, not gatekeeping.

**Say it:** "I automate the objective layer — ESLint, Prettier, and a SonarQube quality gate in CI — so human review is reserved for design and correctness, guided by a written policy: style guide, PR checklist, and ADRs."
**Red flag:** Describing review as catching style violations — that signals junior gatekeeping; say the linter owns style and reviewers own design, correctness, and knowledge transfer.
