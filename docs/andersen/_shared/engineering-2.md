# Software Engineering Practices (part 2)

### CORS headers
**They ask:** "Which response headers actually control CORS, and what does the browser do with them?"

CORS exists because the browser blocks cross-origin reads by default, so the *server* has to opt in with headers — the browser is the enforcer, the server grants permission. Get the header set wrong and the request silently fails in the browser even though the server returned 200.

Mechanically: `Access-Control-Allow-Origin` names the allowed origin (a specific origin, or `*`). For a "non-simple" request the browser first sends a preflight `OPTIONS`, and the server must answer with `Access-Control-Allow-Methods` and `Access-Control-Allow-Headers` echoing what the real request will use. To send cookies you need `Access-Control-Allow-Credentials: true` — and then `Allow-Origin` cannot be `*`, it must be the exact origin. `Access-Control-Max-Age` caches the preflight so you don't pay it every call; `Access-Control-Expose-Headers` lets JS read non-safelisted response headers.

**Say it:** "CORS is server-granted, browser-enforced: Allow-Origin plus, for preflight, Allow-Methods and Allow-Headers — and with credentials the origin must be explicit, never the wildcard."
**Red flag:** Saying you'd "add CORS on the frontend." You can't; CORS headers come from the server (or a proxy). A frontend-only fix means you disabled web security in dev, which won't work in production.

### Long polling vs polling
**They ask:** "How is long polling different from regular polling, and when would you reach for it?"

The point of long polling is latency without wasted requests — you get near-real-time push over plain HTTP when a WebSocket isn't available. Regular polling asks "anything new?" on a fixed interval, so you either waste requests when nothing changed or add delay when it did. Long polling holds the request open until the server has data (or a timeout), then the client immediately reopens it.

So the trade is: regular polling is dead simple and stateless but bursts empty requests; long polling cuts empty round-trips and delivers events fast, at the cost of many held-open connections on the server. Area of usage: notifications, chat, live dashboards — anywhere you need push semantics but must survive old proxies and firewalls that break WebSockets. It's the graceful-degradation fallback.

**Say it:** "Regular polling wastes requests on a timer; long polling holds the connection open and returns the instant data exists — real-time feel over ordinary HTTP."
**Red flag:** Calling long polling "the same as WebSockets." It's still request/response — one message per cycle, and you re-establish after every push. If you need high-frequency bidirectional traffic, that's WebSockets, not long polling.

### WebSocket cross-origin
**They ask:** "Do WebSockets follow the same-origin policy? How do you integrate one safely?"

Here's the gotcha that bites people: WebSockets are *not* restricted by CORS. The handshake starts as HTTP and sends an `Origin` header, but the browser does not block cross-origin WebSocket connections the way it blocks fetch. That means the server must validate `Origin` itself — otherwise any site can open a socket to your backend (Cross-Site WebSocket Hijacking), riding the user's cookies.

Mechanically, integration: open with `new WebSocket(url)` (use `wss://` for TLS), then wire the events — `onopen`, `onmessage`, `onerror`, `onclose` — and `send()` to push. On the server you check `Origin`, authenticate the connection (a token in the first message or a signed cookie), and don't rely on the browser to gate access. Ways of integration in practice: a raw `ws`/`wss` server, or a library like Socket.IO that adds reconnection, rooms, and fallbacks on top.

**Say it:** "WebSockets skip CORS, so the server must validate the Origin header and authenticate the connection itself — otherwise you've got cross-site WebSocket hijacking."
**Red flag:** Assuming the browser's same-origin policy protects your socket like it protects fetch. It doesn't — the check is your responsibility on the server.

### SSE with CORS
**They ask:** "How does CORS apply to Server-Sent Events and the EventSource API?"

Unlike WebSockets, EventSource *does* obey CORS — it's a regular HTTP GET under the hood, so the same `Access-Control-Allow-Origin` rules apply. That's why SSE is often easier to secure and reason about: it plays by the ordinary fetch rules you already know.

Mechanically: to connect cross-origin you construct `new EventSource(url, { withCredentials: true })` if you need cookies, and the server must return `Access-Control-Allow-Origin` set to the exact origin (not `*`) plus `Access-Control-Allow-Credentials: true` when credentials are on. The stream itself is `Content-Type: text/event-stream`, the server keeps the connection open and writes `data:` lines, and EventSource auto-reconnects and resumes via the `Last-Event-ID` header. You handle it with `onmessage`, `onerror`, or `addEventListener` for named events.

**Say it:** "SSE is a plain GET, so it honors CORS — cross-origin needs an explicit Allow-Origin, and with withCredentials the origin can't be the wildcard."
**Red flag:** Expecting EventSource to send custom headers or work cross-origin with `*` and cookies. It can't set request headers, and credentialed CORS forbids the wildcard.

### Security threats and cryptography
**They ask:** "Walk me through common threat categories and where symmetric vs asymmetric crypto fit."

Senior security answers start from the threat model, not a checklist. The categories worth naming: defacement (attacker alters your content), infiltration (unauthorized access to systems/data), phishing (tricking users into handing over credentials) and its cousin pharming (poisoning DNS so a legit URL lands on a fake site), session-management attacks (stealing or fixing a session id), and JSON Hijacking — an old attack where a top-level JSON array returned to a GET could be read cross-site; defenses are not returning bare arrays and requiring POST/tokens for sensitive reads.

On cryptography, the distinction is about key management. Symmetric (AES) uses one shared key — fast, great for bulk data, but you must distribute the key securely. Asymmetric (RSA, ECC) uses a public/private pair — solves key distribution and enables signatures, but is slow. That's exactly why TLS uses both: asymmetric to exchange a session key, symmetric to encrypt the actual traffic.

**Say it:** "Symmetric is fast but shares one key; asymmetric solves key distribution and enables signatures — so real systems like TLS use asymmetric to bootstrap a symmetric session key."
**Red flag:** Treating "encryption" as one thing. Not knowing why you'd use asymmetric to establish and symmetric to transport signals a shallow security background.

### Code review and metrics
**They ask:** "What's the point of code review, and which metrics do you actually track?"

Reframe it up front: review isn't gatekeeping, it's shared ownership and knowledge transfer — the reviewer inherits the code too. The concrete mechanism is the pull request: small, focused diffs, described intent, automated checks green before a human looks, and tools (GitHub/GitLab, Crucible, Upsource) to thread comments against lines.

On software metrics, know what each one actually tells you. SLOC is a rough size proxy (easy to game). Code coverage shows which lines tests execute — necessary, not sufficient. Cohesion (how focused a module is) and coupling (how much it depends on others) are the design health pair: high cohesion, low coupling is the goal. Cyclomatic complexity counts independent paths through a function — high numbers flag hard-to-test, bug-prone code and are a good "split this up" trigger. The senior move is treating metrics as conversation starters, not pass/fail gates.

**Say it:** "I use PRs for shared ownership, and I read metrics as signals — high cyclomatic complexity or tight coupling starts a refactor conversation, it isn't an automatic reject."
**Red flag:** Chasing 100% coverage or a low SLOC as the goal. Metrics you optimize directly get gamed; they inform judgment, they don't replace it.

### Reactive programming challenges
**They ask:** "Reactive programming sounds clean — what actually goes wrong when you implement it?"

The reason to name the challenges is that reactive code fails in ways imperative code doesn't, and a senior has felt them. The big four: memory leaks from unsubscribed streams (every subscription is a resource you must tear down), backpressure (a fast producer overwhelming a slow consumer), debugging (asynchronous, declarative pipelines produce stack traces that don't map to your source), and error handling (one unhandled error can kill an entire stream silently).

Concretely, in an RxJS app: a subscription in a component that isn't unsubscribed on unmount keeps firing and holds references — a leak. You solve it with `takeUntil`/`takeUntilDestroyed` or the async pipe. Backpressure you address with operators like `throttle`, `debounce`, or `buffer`. Debugging you attack with `tap` for logging and marble tests. And you place `catchError` deliberately so a failure recovers instead of collapsing the stream.

**Say it:** "The three that bite are lifecycle leaks from stray subscriptions, backpressure when a producer outruns the consumer, and debugging async pipelines — so I lean on takeUntil, throttling operators, and catchError placement."
**Red flag:** Selling reactive as pure upside. Not mentioning subscription cleanup or error propagation says you haven't run it in production.

### CI build pipelines
**They ask:** "How do you structure a multi-phase build on a CI server?"

The value of a real pipeline is that every commit produces the same verifiable artifact without a human — reproducibility and fast feedback. So I structure the CI job (Jenkins, GitHub Actions, TeamCity, Travis) as explicit phases: install, build, test, package, deploy — each failing fast and reporting status back to the PR.

Mechanically, a mature setup does more than "run the build." It integrates with source control to trigger on push and to tag/version releases; it runs scripted phases so testing and packaging are separate gates; it can build an installer and generate release notes (often from commit history) as part of packaging; it publishes artifacts to a release area; and it notifies on status — a red build should page the right people. Scheduled nightly builds catch slow-burning breakage (integration, flaky tests, dependency drift) that a fast PR pipeline skips.

**Say it:** "I split CI into install, build, test, package, deploy — each a fail-fast gate that reports back — plus nightly builds to catch the slow breakage the PR pipeline is too fast to see."
**Red flag:** Describing CI as one monolithic script. Without separated phases and status reporting, a failure is opaque and nobody knows which stage broke.

### JavaScript testing stack
**They ask:** "What does a JavaScript testing stack look like, and how does BDD fit in?"

Pick tools by role, not by fashion — that's what makes the stack coherent. BDD in JS means writing specs as behavior: `describe`/`it` blocks that read like sentences, so tests double as documentation of intent. The classic split is a runner, an assertion library, and a mocking library: Mocha (runner) + Chai (`expect`/`should` assertions) + Sinon (spies, stubs, mocks). Jasmine bundles all three into one framework. Jest also bundles runner, assertions, and mocking, and adds snapshot testing and a built-in mock system — which is why it's the common default now.

Karma's role is different: it's a test *runner that launches real browsers*, so your specs run in actual Chrome/Firefox rather than a simulated DOM. You reach for it when browser-specific behavior matters; for most logic and component tests, jsdom under Jest is enough and far faster.

**Say it:** "Mocha plus Chai plus Sinon is runner, assertions, and mocks composed; Jasmine and Jest bundle all three — and Karma is the piece that runs specs in real browsers when that matters."
**Red flag:** Listing tool names without their roles. If you can't say which piece is the runner versus the assertion library, it reads as never having wired a suite yourself.

### Pure functions and tail calls
**They ask:** "Give me a real pure function, and explain tail call optimization."

Purity is worth defending because it's what makes code trivially testable and safe to memoize or parallelize: same input, same output, no side effects. A real example: a `calculateTotal(items)` that maps prices and reduces to a sum, touching nothing outside its arguments — you can test it with no setup and cache it freely. Contrast an impure `addToCart` that mutates a shared array or reads `Date.now()`; its result depends on hidden state.

Tail call optimization is a runtime optimization for recursion: when a function's *last* action is calling itself, the engine can reuse the current stack frame instead of adding a new one, so deep recursion won't overflow the stack. The honest caveat for a JS interview: TCO is in the ES2015 spec but, in practice, only Safari/JavaScriptCore implements it — V8 (Chrome, Node) does not. So in JS you don't rely on it; you convert deep recursion to iteration or an explicit stack.

**Say it:** "A pure function is same-input-same-output with no side effects, which is why it's trivially testable and cacheable — and TCO reuses the stack frame for tail-recursion, though in JS only JavaScriptCore actually ships it."
**Red flag:** Claiming JS engines optimize tail calls generally. Say the truth: it's spec'd but effectively Safari-only, so you don't depend on it.

### Third-party profilers and monitoring
**They ask:** "How do you configure profiling, logging, and monitoring with third-party tools?"

The senior framing is a three-layer picture, because each answers a different question. Profilers answer "why is *this* slow" — Chrome DevTools Performance, React DevTools Profiler, or a Node `--inspect` heap/CPU profile — you capture a trace under load and read flame graphs for the hot path. Logging answers "what happened" over time — you ship structured logs (JSON, with levels and correlation ids) to something like the ELK stack, Datadog, or CloudWatch, not raw `console.log` scattered around. Monitoring answers "is it healthy right now" — dashboards and alerts on metrics (latency, error rate, throughput) plus error trackers like Sentry that group exceptions with stack traces and release context.

Configuring them well means correlation: a request id that flows from the frontend error in Sentry, through the logs, to the trace — so an incident is one thread to pull, not three tools to cross-reference by hand.

**Say it:** "Profilers tell me why one path is slow, structured logging tells me what happened, monitoring and error trackers tell me if it's healthy now — and a shared correlation id stitches all three into one incident thread."
**Red flag:** Conflating the three. "I'll add logging" isn't a profiling answer, and dashboards don't tell you why a single function is slow — name the right tool for the question.

### Code quality tooling
**They ask:** "How do you enforce code quality with tooling across a JS/TS project?"

The reason to automate quality is to remove taste from review — the machine handles style so humans discuss design. The layered toolset: a linter (ESLint is the standard; JSHint and TSLint are legacy — TSLint is deprecated in favor of ESLint with `@typescript-eslint`) catches bugs and enforces rules; a formatter (Prettier) settles style so nobody argues bracket placement; and a platform like SonarQube runs deeper static analysis across the whole codebase — duplication, complexity, security hotspots, coverage trends — with a quality gate that can fail the build.

Creating a code policy document turns implicit norms explicit: the agreed rules, the lint config as the enforced version of that policy, and the exceptions with rationale. The senior signal is wiring these into CI and a pre-commit hook so violations are caught before review, not litigated during it — and running Sonar's gate as a merge condition so quality regressions are visible.

**Say it:** "ESLint plus Prettier removes style from human review, and SonarQube's quality gate catches complexity, duplication, and security regressions in CI — so reviewers spend their time on design, not semicolons."
**Red flag:** Naming TSLint as a current choice. It's deprecated; the answer is ESLint with the TypeScript plugin.

### Design patterns and architecture
**They ask:** "What design patterns and architectural patterns do you actually apply, and when?"

Patterns are a shared vocabulary for recurring problems — their value is communication and avoiding reinvented, buggy wheels, not using them for their own sake. The GoF three groups: creational (how objects are made — Factory, Singleton, Builder), structural (how they compose — Adapter, Decorator, Facade), behavioral (how they interact — Observer, Strategy, Command). In JS you use these constantly, often without naming them: Observer *is* the event system, Strategy is passing a comparator to `sort`.

Macro-architecture is a level up: MVC/MVP/MVVM separate presentation from logic; Layered keeps concerns in tiers; IoC/dependency injection inverts who wires collaborators; SOA and Microservices split a system into independently deployable services; EDA and Event Sourcing make events the source of truth; DDD aligns the model to the domain. UML is the notation to communicate these — Use Case for scope, Class for structure, ER for data, Data Flow for movement.

**Say it:** "Patterns are shared vocabulary for recurring problems — I reach for Strategy or Observer to communicate intent, and I choose macro patterns like layered or event-driven by the forces in the system, never by fashion."
**Red flag:** Forcing patterns everywhere. A Singleton or an AbstractFactory where a plain module or function would do is over-engineering — the seniority signal is knowing when *not* to.

### GRASP
**They ask:** "What is GRASP, and how does it relate to SOLID?"

GRASP — General Responsibility Assignment Software Patterns — is the layer beneath SOLID: it answers the most basic OO question, "which class should own this responsibility?" SOLID tells you what good structure looks like; GRASP gives you the reasoning to *assign* responsibilities so you get there.

The principles worth naming: Information Expert (assign a responsibility to the class that has the data to fulfill it), Creator (the class that aggregates or closely uses another should create it), Controller (a coordinating object handles system events), Low Coupling and High Cohesion (the same design health pair metrics measure), Polymorphism (use it instead of type-checking conditionals), Pure Fabrication (invent a service class when no domain class fits, to keep cohesion high), Indirection (introduce a mediator to decouple), and Protected Variations (wrap unstable points behind a stable interface). The through-line is that every principle is really serving low coupling and high cohesion.

**Say it:** "GRASP is the reasoning for *where* responsibilities go — Information Expert, Controller, Pure Fabrication — and almost every one of them is ultimately in service of low coupling and high cohesion."
**Red flag:** Treating GRASP as trivia. It's the vocabulary for defending a class design in review — "this belongs on the Expert, not the Controller" is a concrete, senior argument.

### Continuous integration
**They ask:** "What does continuous integration actually require, beyond 'we have a CI server'?"

CI is a *discipline*, not a tool — the goal is that main is always releasable because everyone integrates small changes frequently and the build proves it. The best practices that make it real: commit to main often (so merges are small and conflicts are cheap), keep the build fast (a slow build gets bypassed), fix a broken build immediately (a red main blocks everyone), and make the build self-testing so green actually means something.

Concretely you pick tools for the environment, make the build runnable from the command line (no "works on the CI box only" magic), automate the trivial glue with shell scripts, clean build outputs so runs are reproducible, and integrate Software Configuration Management — versioning, tagging, branching strategy, and generating release documents as part of the pipeline. The senior point: CI's payoff is cultural (frequent integration), and the tooling only exists to enforce that habit.

**Say it:** "CI is the discipline of integrating small changes constantly so main stays releasable — a fast, self-testing, command-line-runnable build is what makes that habit enforceable, not the server itself."
**Red flag:** Equating CI with "we have Jenkins." If people branch for weeks and integrate rarely, you have a build server, not continuous integration.

### OWASP and TLS
**They ask:** "Walk me through OWASP Top 10 thinking and how TLS actually protects a request."

The value of OWASP Top 10 is a shared priority list of the vulnerabilities that actually cause breaches — Broken Access Control, Injection (SQL, SSI — server-side includes injecting commands into server-parsed pages), Cryptographic Failures, Security Misconfiguration, plus authentication and access-control attacks like credential stuffing and privilege escalation. The senior framing is defense per category: parameterized queries for injection, least-privilege and server-side checks for access control, and never trusting client input at a trust boundary.

TLS/SSL protects a request in three properties: confidentiality (traffic is encrypted), integrity (tampering is detected), and authentication (the certificate proves you're talking to the real server). The handshake is the elegant part — asymmetric crypto authenticates the server via its certificate and negotiates a shared secret, then the session switches to fast symmetric encryption for the actual data. "SSL" is the dead predecessor; modern connections are TLS (1.2/1.3), and you should say TLS.

**Say it:** "OWASP is my priority list of what actually gets exploited, and TLS gives confidentiality, integrity, and server authentication — asymmetric to authenticate and agree a key, symmetric to carry the traffic."
**Red flag:** Saying "we use SSL." SSL is deprecated and insecure; the correct term and the thing you actually deploy is TLS.

### Refactoring to patterns
**They ask:** "What does 'refactoring to patterns' mean, and how do you manage technical debt as a policy?"

Refactoring to patterns is the disciplined middle path: you don't design every pattern up front (speculative, over-engineered) and you don't leave a mess (unmaintainable) — you let a design pattern *emerge* when the code's pain points call for it. You see repeated conditional type-checks and refactor toward Strategy or Polymorphism; you see tangled construction and introduce a Factory. The pattern is the destination of a smell-driven refactor, not the starting blueprint.

Managing technical debt as a policy means making it visible and governed instead of silent. You define what counts as debt, track it in the backlog with the same weight as features, and report it regularly to stakeholders — Team, PM, Product Owner, Client — framed as risk and cost, not "cleanup we'd like." The three-beat pitch to a skeptical PM: (a) yes, paying it down costs a sprint now; (b) not paying it means every future feature in that module ships slower and buggier — the interest compounds silently; (c) so this is an investment in delivery speed, and here's the tracked ledger proving where the interest is.

**Say it:** "I refactor *to* a pattern when a smell demands it, never speculatively — and I track technical debt as visible, reported backlog items so it's a governed investment decision, not silent rot."
**Red flag:** Framing debt work as "cleanup" you sneak in. Unquantified, invisible debt never gets prioritized; the senior move is making its interest cost legible to the people who fund the roadmap.

### Architecture qualities and cloud
**They ask:** "How do you reason about architecture qualities, and how do cloud service models factor in?"

Senior architecture is driven by quality attributes — the non-functional requirements — not by features. The ones that shape decisions: scalability, availability, performance, security, maintainability, reliability, and observability. You can't maximize all of them, so architecture is explicitly trading among them (strong consistency versus availability under partition is the classic one), and you document those decisions. Advanced UML is how you communicate the structure: Component and Package diagrams for modules, Deployment diagrams for where things run, Sequence and Activity diagrams for behavior over time.

Cloud choices map onto this through service models. IaaS gives you raw compute (max control, max ops burden), PaaS abstracts the runtime (you ship code, the platform handles the machine), SaaS is fully managed. Deployment types — public, private, hybrid — trade control against cost and compliance. Cloud patterns like auto-scaling, circuit breaker, and CQRS are named tools for hitting specific quality attributes.

**Say it:** "I drive architecture from quality attributes and their trade-offs, document the decisions, and pick the cloud service model — IaaS to SaaS — by how much operational control the attributes actually demand."
**Red flag:** Designing for features while ignoring quality attributes. "It works" isn't an architecture; the qualities and their trade-offs are the architecture.

### Reactive systems
**They ask:** "A reactive *system* is more than reactive programming — what are its four characteristics?"

The distinction matters: reactive programming is a coding style (async data streams), while a Reactive System — from the Reactive Manifesto — is an architectural property of the whole system. The four characteristics build on each other. Responsive: the system replies in a timely way, so problems are detected fast and UX stays predictable. Resilient: it stays responsive under failure, through replication, isolation, and containment — a failure in one component doesn't cascade. Elastic: it stays responsive under varying load, scaling resources up and down with demand. Message-driven: the foundation — components communicate via asynchronous message passing, which is what *enables* the other three by establishing loose coupling, isolation, and location transparency.

The senior insight is the dependency order: message-driven is the means; elasticity and resilience are the mechanisms; responsiveness is the goal the user actually experiences.

**Say it:** "A reactive system is responsive, resilient, and elastic, and message-driven is the foundation that makes the other three possible — async message passing gives you the isolation and loose coupling everything else rests on."
**Red flag:** Confusing reactive programming with reactive systems. Using RxJS doesn't make your architecture reactive; the four characteristics are a system property, not a library choice.

### Complexity calculation
**They ask:** "How do you actually calculate the complexity of an algorithm?"

The reason to compute it rather than eyeball it is that complexity determines whether something survives production scale — an O(n²) that's fine on 100 rows melts on 100,000. You calculate time complexity by counting how the number of basic operations grows with input size n, then keeping only the dominant term and dropping constants — that's Big-O. A single loop over n is O(n); a nested loop is O(n²); halving the search space each step is O(log n); a loop that does log-work inside is O(n log n), the bound for comparison sorts.

Concretely: for recursion you set up a recurrence and solve it (Merge Sort is T(n) = 2T(n/2) + O(n), which resolves to O(n log n) via the Master Theorem). You also distinguish best/average/worst case — Quicksort is O(n log n) average but O(n²) worst on a bad pivot — and analyze space complexity the same way by counting extra memory that grows with n.

**Say it:** "I count how operations grow with n, drop constants and lower-order terms for the dominant Big-O, and for recursion I solve the recurrence — while calling out worst versus average case, like Quicksort's n log n average but n² worst."
**Red flag:** Giving only a single Big-O with no case analysis. Worst-case matters — an algorithm that's usually fast but occasionally quadratic is a production incident waiting on the wrong input.

### REST six constraints
**They ask:** "REST is defined by six architectural constraints — name them and why they matter."

REST is worth defining precisely because "a JSON HTTP API" is not automatically RESTful — the constraints are what earn the scalability and evolvability REST is prized for. The six: (1) Client–Server — separate UI from data storage so each evolves independently. (2) Stateless — each request carries everything needed; the server holds no session, which is what makes horizontal scaling trivial. (3) Cacheable — responses label themselves cacheable or not, cutting round-trips. (4) Uniform Interface — the central constraint: resources identified by URIs, manipulated through representations, self-descriptive messages, and HATEOAS (hypermedia drives state). (5) Layered System — intermediaries (proxies, gateways, load balancers) can sit between client and server invisibly. (6) Code on Demand — optional — the server can ship executable code (like JS) to extend the client.

The senior point is that statelessness and the uniform interface are what actually deliver REST's scalability; most "REST APIs" honor those two and quietly skip HATEOAS.

**Say it:** "Client–server, stateless, cacheable, uniform interface, layered system, and optional code-on-demand — statelessness is what makes REST scale horizontally, and the uniform interface is what lets clients and servers evolve independently."
**Red flag:** Equating REST with "uses HTTP verbs and returns JSON." Without statelessness and a uniform interface you have an HTTP API, not a RESTful one — and most APIs skip HATEOAS entirely.

### CONNECT and TRACE
**They ask:** "What do the CONNECT and TRACE HTTP methods do, and how do you push XHR beyond the basics?"

These two round out the method set and mostly matter for what they enable — and the risk they carry. CONNECT establishes a tunnel to the server, typically through a proxy — it's how an HTTPS request gets forwarded through an HTTP proxy, which opens a raw TCP tunnel so the encrypted traffic passes through untouched. TRACE echoes the received request back for diagnostics, so a client can see what intermediaries changed. The catch: TRACE is a security liability (Cross-Site Tracing can leak headers/cookies), so it's disabled on essentially every production server — worth stating that you'd turn it off.

Advanced XHR is about the capabilities beyond `open`/`send`: tracking upload/download via the `progress` events on `xhr.upload`, setting `responseType` to `blob`/`arraybuffer` for binary, `timeout` and `abort()` for control, `withCredentials` for cross-origin cookies, and reading `readystatechange` transitions. In modern code `fetch` plus `AbortController` covers most of this, but XHR still owns upload progress.

**Say it:** "CONNECT tunnels TCP through a proxy for HTTPS, TRACE echoes the request for diagnostics — and I'd disable TRACE because of Cross-Site Tracing — while advanced XHR is progress events, binary responseType, abort, and withCredentials."
**Red flag:** Recommending TRACE for debugging. It's a known attack vector and off by default in production; mention that, don't suggest enabling it.

### JSONP vs CORS
**They ask:** "Before CORS existed there was JSONP — what's the difference and why did CORS win?"

Both solve cross-origin data access, but one is a hack and one is a standard — that's the whole story. JSONP exploits the fact that `<script>` tags aren't blocked by the same-origin policy: you inject a script whose URL points at the other origin, and the server wraps its JSON in a function call your page defined, so loading the script *invokes* your callback with the data. Its limits are fatal for modern use: it only supports GET, it has no real error handling, and — critically — it requires you to fully trust the remote server, because you're executing whatever it returns as script. A malicious or compromised endpoint runs arbitrary code in your page.

CORS is the standards-based replacement: the browser makes a real request (any method) and the server grants access via `Access-Control-Allow-Origin` headers, with the browser enforcing the rule. It supports all verbs, real error handling, credentials, and preflight — and it doesn't require executing foreign code.

**Say it:** "JSONP is a script-tag hack — GET-only and it runs the server's code in your page — while CORS is the standard: real requests of any method, server-granted via headers, no arbitrary code execution."
**Red flag:** Proposing JSONP for a new project. It's a legacy workaround with an arbitrary-code-execution risk; CORS (or a same-origin proxy) is the answer today.

### WebSocket extensions and subprotocols
**They ask:** "What are WebSocket extensions and subprotocols, and how do they differ?"

They solve two different layers, and mixing them up is the common mistake. A subprotocol defines the *application-level* message format the two sides agree to speak over the socket — the client offers a list via the `Sec-WebSocket-Protocol` header (or the second argument to `new WebSocket(url, protocols)`), and the server picks one and echoes it back. Examples are STOMP, WAMP, or MQTT-over-WebSocket. It answers "once the pipe is open, what do the messages mean?"

An extension operates at the *protocol framing* level, transforming the frames themselves independently of their meaning — negotiated via `Sec-WebSocket-Extensions`. The canonical one is `permessage-deflate`, which compresses each message. So: extension = how bytes are framed/transformed on the wire (compression), subprotocol = what the messages mean to the application (semantics). Both are negotiated during the opening handshake, and both sides must agree or the feature is simply not used.

**Say it:** "A subprotocol is the application message format both sides agree to, like STOMP; an extension transforms the framing itself, like permessage-deflate compression — semantics versus wire-format, both negotiated in the handshake."
**Red flag:** Treating them as interchangeable. Compression is an extension, a message grammar is a subprotocol — conflating the two shows you haven't looked past `send()` and `onmessage`.

### EventSource vs WebSocket
**They ask:** "SSE and WebSockets both push from the server — when do you pick which?"

Pick by directionality and by what you get for free, not by which is newer. SSE (EventSource) is a one-way channel: server-to-client only, over a single long-lived HTTP response. In exchange for that limitation you get real advantages — it's plain HTTP so it works through proxies and honors CORS, it auto-reconnects and resumes via `Last-Event-ID` with zero code, and it's dead simple to implement. WebSockets are full-duplex: both directions over one persistent connection, upgraded from HTTP to the `ws`/`wss` protocol, and they carry binary as well as text.

So the decision rule: if the client only needs to *receive* a stream — live scores, notifications, a status feed, server logs — SSE is the lighter, more resilient choice. If you need the client to *send* frequently too, or you need binary or very low latency both ways — chat, collaborative editing, multiplayer, trading — use WebSockets. The senior nuance: SSE is capped at ~6 concurrent connections per domain on HTTP/1.1, a limit HTTP/2 multiplexing removes.

**Say it:** "SSE is one-way over plain HTTP with free auto-reconnect and CORS — perfect for receive-only feeds — while WebSockets are full-duplex and binary-capable for genuinely bidirectional, low-latency traffic like chat or collaboration."
**Red flag:** Reaching for WebSockets on a receive-only feed. If the client never sends, you're paying for duplex you don't use and reimplementing reconnection SSE gives you for free.
