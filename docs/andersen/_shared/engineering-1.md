# Software Engineering Practices (part 1)

### OOP fundamentals
**They ask:** "Explain the difference between a class and an object, and walk me through the four OOP pillars."

OOP matters because it lets you model a domain in units that hide their own complexity, so one part of the system can change without forcing the rest to. A class is the blueprint — the definition of fields and behavior; an object is a concrete instance of that blueprint with its own state. `class User {}` is written once; `new User()` produces many independent objects.

The four pillars each buy you something. Encapsulation hides internal state behind an interface, so invariants can't be corrupted from outside. Abstraction exposes only what a caller needs, hiding the how. Inheritance shares behavior across related types. Polymorphism lets one call site work with many types through a shared interface. In JS, remember inheritance is prototypal: objects delegate to a prototype chain at runtime, versus classical inheritance where a class copies structure from a parent at definition time. `class extends` is syntax sugar over that prototype linking.

**Say it:** "A class is the blueprint, an object is an instance of it; encapsulation and abstraction hide the how, inheritance and polymorphism share and vary behavior — and in JS all of it runs on the prototype chain."
**Red flag:** Saying JS classes are "real" classes like Java. They're sugar over prototypal delegation — say that, and mention `Object.getPrototypeOf`.

### Algorithms and data structures basics
**They ask:** "What is an algorithm, and which basic data structures do you reach for day to day?"

This matters because choosing the right structure is usually a bigger win than tuning code — the structure decides which operations are cheap. An algorithm is a finite, well-defined sequence of steps that transforms input into the required output and terminates; "finite and terminates" is the part juniors skip. Determinism is a property some algorithms have, not a requirement — a randomized algorithm (quicksort with a random pivot, reservoir sampling) is still a valid algorithm as long as it's finite and terminates.

The core structures split by access pattern. Arrays give O(1) index access but O(n) insert/delete in the middle. Linked lists flip that — O(1) insert once you hold the node, O(n) to find it. Hash maps (JS `Map`/objects) give amortized O(1) lookup by key, which is why they're the default for dedup and counting. Stacks (LIFO) model undo and call frames; queues (FIFO) model task processing. Trees and graphs model hierarchy and relationships. The senior move is naming the operation you care about — "I need fast membership tests, so a Set, not an array."

**Say it:** "An algorithm is a finite procedure that's guaranteed to terminate with the required output — determinism is optional, not a requirement; I pick the data structure by the operation I need to be cheap — Set for membership, Map for keyed lookup, array for ordered index access."
**Red flag:** Listing structures with no cost tradeoffs. The interviewer wants "array vs Map because lookup is O(n) vs O(1)," not a vocabulary dump.

### Debugging process
**They ask:** "Walk me through how you debug an issue you've never seen before."

A systematic process matters because random guessing scales badly — it fixes symptoms and reintroduces the bug next sprint. I treat debugging as narrowing, not guessing.

1. **Reproduce.** Get a reliable repro; an intermittent bug you can't trigger, you can't verify you fixed. 2. **Isolate.** Bisect the surface — comment out halves, check the network tab, add breakpoints — until the failure lives in one function or request. 3. **Form a hypothesis and prove it.** State what you think is wrong, then confirm with an observation (a logged value, a breakpoint), don't assume. 4. **Fix at the root.** Patch where all callers route through, not just the path in the ticket. 5. **Verify and add a regression test** so it can't silently return.

Concretely: a blank list on load — I check the network tab first (did the request 200 with data?), which instantly splits "backend/empty response" from "frontend/render bug" before I read a line of component code.

**Say it:** "Debugging is narrowing, not guessing: reproduce, isolate by bisection, prove the hypothesis with an observation, fix at the root, then lock it with a regression test."
**Red flag:** Jumping straight to editing code. Say you reproduce and isolate first — a fix you can't verify against a repro isn't a fix.

### REST fundamentals
**They ask:** "What is REST?"

REST matters because it gives teams a shared, predictable contract for HTTP APIs — you can guess the URL and method for a resource without reading docs. REST is an architectural style (not a protocol) where you model the domain as **resources** identified by URLs, and act on them with HTTP methods.

The mechanics: resources are nouns (`/users/42`), not verbs (`/getUser?id=42`); the HTTP method is the verb — GET reads, POST creates, PUT/PATCH update, DELETE removes. Responses use status codes meaningfully (200, 201, 404, 422), and it's **stateless** — every request carries everything the server needs, so no per-client session is stored on the server between calls. That statelessness is what lets you scale horizontally behind a load balancer.

The trap is calling any JSON-over-HTTP endpoint "RESTful." A real signal of understanding is naming statelessness and resource-orientation as the constraints, and admitting most production APIs are "REST-ish," not fully hypermedia-driven.

**Say it:** "REST models the domain as resources addressed by URLs and manipulated with HTTP verbs, statelessly — which is exactly what makes it cacheable and horizontally scalable."
**Red flag:** "REST means using JSON." JSON is a format; REST is resources + verbs + statelessness. Say that.

### GraphQL fundamentals
**They ask:** "What is GraphQL and what problem does it solve?"

GraphQL matters because it moves the shape of the response into the client's hands, which kills over- and under-fetching — the two chronic pains of fixed REST endpoints. It's a query language and runtime where the client sends a query describing exactly the fields it wants, and gets back that shape and nothing more.

Mechanically: there's usually a single endpoint (`POST /graphql`); the server exposes a typed **schema** (queries for reads, mutations for writes, subscriptions for realtime); and resolvers fetch each field. Because the client picks fields, a mobile screen can request three fields while a dashboard requests thirty — from the same graph, no new endpoint. You also fetch related data in one round trip instead of chaining three REST calls.

The cost to acknowledge: caching is harder than REST (no URL-per-resource to cache on), and a naive resolver graph invites the N+1 problem, which is why DataLoader-style batching exists.

**Say it:** "GraphQL lets the client specify the exact fields it needs from a typed schema through one endpoint, eliminating over- and under-fetching — at the cost of harder HTTP caching and N+1 resolver risk."
**Red flag:** Selling GraphQL as strictly better than REST. Name the caching and N+1 costs — that's the seniority signal.

### AJAX and XHR
**They ask:** "What is AJAX, and how would you make a basic request and handle the response?"

AJAX matters because it's what made single-page apps possible: updating part of a page from the server without a full reload, so the UI stays responsive. AJAX ("Asynchronous JavaScript and XML") is a technique, not a technology — asynchronously exchanging data with the server and updating the DOM in place. The name says XML, but today it's almost always JSON.

The original API is `XMLHttpRequest`: `open(method, url)`, set headers, `send()`, and listen on `readystatechange` / `load` for the response, reading `xhr.status` and `xhr.responseText`. In modern code I use `fetch()` with `async/await` — it's promise-based and far cleaner — but I can still explain XHR because that's what fetch replaced.

Map the CRUD operations onto HTTP methods: Create → POST, Read → GET, Update → PUT/PATCH, Delete → DELETE. Getting that mapping right is what makes an API predictable.

**Say it:** "AJAX is asynchronously talking to the server and updating the DOM without a reload; XHR was the original API, fetch is the modern promise-based one, and CRUD maps to POST/GET/PUT-PATCH/DELETE."
**Red flag:** Not knowing XHR because you only ever used fetch/axios. Interviewers ask the fundamental to see if you understand the layer under your library.

### Why CORS exists
**They ask:** "Why do we need CORS?"

CORS matters because the browser's default — the **same-origin policy** — deliberately blocks a page on one origin from reading responses from another origin, to stop a malicious site from silently reading your bank's API using your logged-in cookies. CORS (Cross-Origin Resource Sharing) is the controlled, opt-in exception the *server* grants.

An origin is scheme + host + port; differ in any one and it's cross-origin. When your frontend on `app.example.com` calls `api.example.com`, the browser adds an `Origin` header and only exposes the response to JS if the server replies with a matching `Access-Control-Allow-Origin`. The server, not the client, decides who's allowed.

The key mental correction: CORS is a **relaxation** of a browser security rule, not a security feature you add. It also doesn't protect the server — anyone with curl bypasses it; it only governs what browser JS is allowed to read.

**Say it:** "CORS exists because the same-origin policy blocks cross-origin reads by default; it's the server's opt-in to relax that rule for specific origins — a browser mechanism, not server-side protection."
**Red flag:** "CORS secures my API." It's a browser rule; curl ignores it. Say CORS controls what *browser JS* may read, and real security is auth on the server.

### Long polling mechanics
**They ask:** "How does long polling work?"

Long polling matters because it approximates server push over plain HTTP when you can't use WebSockets — it's the pragmatic fallback for near-realtime updates. The idea: instead of the client asking "anything new?" every few seconds (regular polling, which wastes requests), the client sends one request and the **server holds it open** until it has data or a timeout.

The cycle: client requests → server parks the connection → when an event occurs the server responds → client processes it and immediately opens a new request. So there's almost always one pending request waiting, and updates arrive as soon as they exist rather than on the next poll tick.

The tradeoff to name: it ties up a server connection per client and still carries full HTTP header overhead on each cycle, so at scale it's heavier than a persistent WebSocket. It shines when you need push semantics but the infrastructure (old proxies, no WS support) forces HTTP.

**Say it:** "Long polling holds the request open server-side until there's data, then the client immediately re-requests — so you get push-like latency over plain HTTP, at the cost of a held connection per client."
**Red flag:** Confusing it with regular polling. Regular polls on a fixed interval; long polling holds one request open until data exists. State that distinction explicitly.

### WebSocket API
**They ask:** "What are the main WebSocket API methods and events on the client?"

WebSockets matter because they give you a single, full-duplex, persistent TCP connection — both sides can send anytime with almost no per-message overhead, which is what real chat, live cursors, and trading feeds need. Unlike HTTP request/response, the connection stays open after an upgrade handshake (starts as HTTP, then switches to the `ws://`/`wss://` protocol).

On the client the surface is small. Construct with `new WebSocket(url)`. Methods: `send(data)` to push a message, `close(code, reason)` to shut down. Events: `onopen` (connection ready), `onmessage` (data arrived — read `event.data`), `onerror` (failure), `onclose` (closed, with a code you can inspect to decide whether to reconnect). A real implementation adds reconnect-with-backoff and heartbeat pings, because a dropped socket won't always fire `onclose` cleanly.

The senior note: WebSocket has no built-in reconnection or message-delivery guarantees — you build those on top, which is why libraries like Socket.IO exist.

**Say it:** "WebSocket is a persistent full-duplex connection: `send`/`close` methods, `onopen`/`onmessage`/`onerror`/`onclose` events — and you add reconnection and heartbeats yourself because the protocol doesn't."
**Red flag:** Assuming the socket auto-reconnects. It doesn't — mention backoff reconnection and heartbeats as production necessities.

### Server-Sent Events API
**They ask:** "What are the API methods and events for Server-Sent Events?"

SSE matters because when you only need **server-to-client** streaming — live scores, notifications, progress — it's far simpler than WebSockets and comes with auto-reconnect built in. It's a one-way stream over a normal long-lived HTTP response with `Content-Type: text/event-stream`.

The client API is `EventSource`: `new EventSource(url)` opens the stream. Events: `onopen` (connected), `onmessage` (default message, read `event.data`), and `onerror`. You can also listen for named events via `addEventListener('eventName', ...)` when the server tags messages with an `event:` field. Call `close()` to stop. The killer feature: if the connection drops, the browser reconnects automatically and can resume using the `Last-Event-ID` header, so you don't hand-roll reconnection.

The limits to name: it's unidirectional (client-to-server still needs a normal request), text-only (no binary), and browsers cap concurrent connections per domain over HTTP/1.1.

**Say it:** "SSE is one-way server-to-client streaming via `EventSource` — `onopen`/`onmessage`/`onerror`, `addEventListener` for named events — with automatic reconnection and `Last-Event-ID` resume built into the browser."
**Red flag:** Treating SSE and WebSocket as interchangeable. SSE is one-directional and text-only but auto-reconnects; pick it when the client only needs to listen.

### Refactoring concept
**They ask:** "What is refactoring, and what makes it different from just changing code?"

Refactoring matters because it's how a codebase stays cheap to change — you pay down complexity continuously instead of letting it compound into a rewrite. The defining property: refactoring changes the internal structure **without changing external behavior**. Same inputs, same outputs; only the shape improves.

That "no behavior change" clause is the whole point and the discipline. Adding a feature or fixing a bug is not refactoring — mixing the two hides which change caused a regression. So I refactor in small, verified steps: rename a variable, extract a function, inline a redundant one, each backed by a passing test suite that proves behavior held. Tests are the safety net; refactoring without them is just editing and hoping.

Concretely: a 200-line component that fetches, transforms, and renders — I extract the fetch into a hook and the transform into a pure function. Behavior is identical; the code is now testable and each piece has one reason to change.

**Say it:** "Refactoring improves internal structure without changing external behavior, in small steps guarded by tests — if behavior changed, it wasn't a refactor, it was a feature or a bug."
**Red flag:** Bundling refactoring into a feature PR. Keep them separate commits so a regression is traceable — say you do them in isolation.

### Testing fundamentals and FIRST
**They ask:** "Explain test plan, suite, and case, the main test types, and what makes a good unit test."

Testing vocabulary matters because it's how a team coordinates coverage. A **test case** is one scenario (input → expected output); a **test suite** groups related cases; a **test plan** is the higher-level document of scope, strategy, and what's in/out. Test **types** climb a scale: unit (one function/module in isolation), integration (modules working together, e.g. component + store), functional/e2e (a user flow end to end).

A good unit test follows **FIRST**: **Fast** (milliseconds, so you run them constantly), **Isolated/Independent** (no shared state, any order), **Repeatable** (same result every run — no reliance on real time, network, or randomness), **Self-validating** (a clear pass/fail, no manual log-reading), **Timely** (written with the code, ideally just before). In JS that's Jest/Vitest: `describe` for the suite, `it`/`test` for the case, `expect` for the assertion.

The senior framing: FIRST is why you mock the network — a test that hits a real API is slow and not repeatable, so it isn't a unit test.

**Say it:** "A case is one scenario, a suite groups them, a plan sets scope; and a good unit test is FIRST — Fast, Isolated, Repeatable, Self-validating, Timely."
**Red flag:** Calling a test that hits the network or database a "unit test." That breaks Isolated and Repeatable — call it an integration test and mock the boundary for units.

### Functional programming basics
**They ask:** "What is functional programming, and what are its core building blocks?"

FP matters because its core discipline — no shared mutable state, no side effects — makes code far easier to reason about, test, and parallelize: a function's output depends only on its input, so you can understand it in isolation. It's a paradigm built on composing pure functions rather than mutating state through steps.

The building blocks: **first-class functions** (functions are values you can pass and return), **higher-order functions** (take or return functions — `map`, `filter`, `reduce`), **lambdas** (anonymous inline functions), **pure functions** (same input → same output, no side effects), **immutability** (never mutate; produce new values), **recursion** (iteration via self-calls instead of loops), and **lazy evaluation** (defer work until the result is needed). JS supports all of these, which is why `array.map(fn)` over a `for` loop that mutates is the everyday FP move.

The payoff to name: pure + immutable means trivially testable (no setup/teardown) and safe to memoize and cache.

**Say it:** "Functional programming composes pure functions over immutable data — same input, same output, no side effects — which is exactly what makes it easy to test, memoize, and parallelize."
**Red flag:** Reciting the terms without the *why*. Lead with "pure + immutable = predictable and testable," then name first-class/higher-order/lazy as the mechanics.

### Code conventions
**They ask:** "Why follow the code conventions defined on a project, even ones you'd have written differently?"

Conventions matter because consistency is a feature — a codebase that reads as if one person wrote it lowers the cognitive cost for everyone reviewing, onboarding, or debugging under pressure. The specific rule matters less than that everyone follows the same one; arguing over tabs vs spaces wastes more time than either choice ever costs.

Mechanically, I enforce conventions with tooling, not willpower: a formatter (Prettier) settles style automatically, a linter (ESLint) catches convention and correctness issues, and both run in a pre-commit hook and CI so nonconforming code can't merge. That removes the human friction — nobody nitpicks whitespace in review because the machine already did.

The teamwork framing: when I join a project I adopt its conventions even where they differ from my preference, and I raise disagreements as a team decision (update the config once), not as one-off deviations in my PRs. Silent inconsistency is worse than a convention you dislike.

**Say it:** "Consistency beats personal preference — I adopt the project's conventions, enforce them with a formatter and linter in CI so they're automatic, and take disagreements to the team as a config change, not a rogue PR."
**Red flag:** "I follow my own style, it's cleaner." That fragments the codebase. Say you conform to the project and change the shared config if you want a different rule.

### Reactive programming basics
**They ask:** "What is reactive programming, and what are its main building blocks?"

Reactive programming matters because it gives you one consistent model for asynchronous, event-driven data — user input, WebSocket messages, timers — so you compose and transform event flows instead of scattering callbacks and manual state. It's programming with **asynchronous streams** and declaring how to react as new values arrive over time.

The building blocks: a **stream** is a sequence of values delivered over time; an **Observable** is the object representing that stream (a producer you can subscribe to); a **subscription** is the act of listening (and, crucially, `unsubscribe` to stop — the main leak source if you forget). **Operators** (`map`, `filter`, `debounce`, `merge`) transform streams declaratively, like array methods but over time. A typeahead search is the canonical example: keystrokes → `debounce` → `switchMap` to the API → render, all as one composed pipeline.

The senior note: an Observable is **lazy and cancellable** — nothing runs until you subscribe, and `switchMap` cancels the previous in-flight request, which is why it beats hand-managing promises.

**Say it:** "Reactive programming models async events as observable streams you transform with operators and consume via subscriptions — lazy, cancellable, and composable, which is why it fits typeahead and realtime far better than raw callbacks."
**Red flag:** Forgetting `unsubscribe`. Unclosed subscriptions leak memory and cause stale updates — always name teardown as part of the model.

### Build automation and CI/CD
**They ask:** "What is an automated build, and what does a build tool actually do for a JS project?"

Build automation matters because it makes shipping **repeatable and reviewable** — the same command produces the same artifact on any machine, so "works on my laptop" stops being a defense. An automated build is a scripted, one-command pipeline that turns source into a deployable product without manual steps.

For JS a build tool (Webpack, Vite, esbuild, Rollup) does several jobs: **bundling** many modules into few files, **transpiling** modern JS/TS/JSX down to what browsers run (via Babel/tsc), **minifying** to shrink payload, **tree-shaking** to drop unused code, and hashing filenames for cache-busting. It also **cleans the output** — wiping the previous `dist/` before a build so stale artifacts never ship, which is a real source of "the fix didn't deploy" bugs.

CI/CD is that build triggered automatically: on every push, CI installs deps, runs the build, lint, and tests, and CD deploys the artifact if all gates pass. The value is a green pipeline as the single signal that a change is safe to ship.

**Say it:** "An automated build is a one-command, reproducible pipeline — bundle, transpile, minify, tree-shake, clean the output — and CI/CD runs it on every push so a green pipeline is the proof a change is safe."
**Red flag:** Forgetting to clean stale output. Say the build wipes `dist/` first — leftover artifacts cause "my fix didn't deploy" phantoms.

### Console and logging
**They ask:** "How do you use the browser console effectively, and how do you think about logging in production?"

Logging matters because in production you can't attach a debugger — logs are often your only window into what actually happened, so *what* and *how* you log is a design decision, not an afterthought. The browser console is the first tool: beyond `console.log`, I use `console.table` for arrays of objects, `console.group` to nest related output, `console.time`/`timeEnd` for quick timing, `console.error`/`warn` for severity, and conditional breakpoints in Sources over sprinkled logs.

For real logging I use **levels** — error, warn, info, debug — so I can dial verbosity by environment: debug locally, warn-and-above in production. Logs should be **structured** (JSON with context: request/correlation id, timestamp, route) not raw strings, because structured logs are searchable and aggregatable. If a user identifier is needed for support lookups, log a pseudonymous or hashed id, not the raw user id — it's personal data. And logs must never leak secrets or PII — a logged token is a breach.

The senior framing: a log line needs enough context to answer "what was happening?" without a repro — a correlation id tying frontend, backend, and error-tracker together is worth more than ten `console.log('here')`.

**Say it:** "Logs are my production debugger, so I log with levels and structured context — a correlation id, never secrets — because a searchable log that needs no repro beats scattered `console.log`s."
**Red flag:** Shipping `console.log` to production or logging tokens/PII. Say you use leveled, structured logging and strip debug logs in the build.

### Web security basics
**They ask:** "Cover HTTP vs HTTPS, how you'd store passwords, hash vs HMAC, and the common form/URL attacks."

Security basics matter because most breaches exploit fundamentals, not exotic flaws — get these four right and you've closed the common doors. **HTTP vs HTTPS**: same protocol, but HTTPS wraps it in TLS so data is encrypted in transit and the server's identity is verified — without it, anyone on the network reads or tampers with traffic. Everything is HTTPS-only today.

**Passwords**: never store plaintext or plain hashes. Use a slow, salted, adaptive hash — bcrypt, scrypt, or Argon2 — where the per-user salt defeats rainbow tables and the cost factor makes brute force expensive. **Hash vs HMAC**: a plain hash (SHA-256) only proves accidental integrity — it detects an unintentional change, but an attacker who can modify the data can just recompute a matching hash, so it proves nothing against a motivated adversary. An HMAC adds a secret key, so only someone holding that key could have produced a valid tag — that's what actually gives you integrity **and authenticity** (used for signing tokens/webhooks); a digital signature is the asymmetric-key version of the same idea.

**Attacks**: XSS = injected script running in your page → escape output and use a CSP. CSRF = a forged request riding the user's cookies → anti-CSRF tokens / SameSite cookies. Semantic URL attacks = trusting an id in the URL (`/account?id=42`) → always authorize server-side; never trust client input.

**Say it:** "HTTPS encrypts and authenticates transit; passwords go through salted Argon2/bcrypt not plain hashes; a plain hash only catches accidental change while HMAC is a keyed hash that proves authenticity against an attacker; and XSS/CSRF/URL-tampering all come down to escape output, verify origin, and authorize server-side."
**Red flag:** "I hash passwords with SHA-256." Fast hashes are brute-forceable — say bcrypt/scrypt/Argon2 with a per-user salt.

### Code smells and technical debt
**They ask:** "What code smells and anti-patterns do you watch for, and how do you manage technical debt?"

This matters because unmanaged debt compounds until every change is slow and risky — recognizing smells early lets you refactor when it's cheap. A **code smell** is a surface symptom of a deeper design problem, not a bug: long methods, large "god" classes doing too much, long parameter lists, duplicated code, feature envy (a method using another object's data more than its own), and shotgun surgery (one change forcing edits in many files). **Anti-patterns** are recurring bad solutions — spaghetti code, copy-paste programming, magic numbers, premature optimization.

Technical debt is the accumulated cost of shortcuts, some deliberate and reasonable (ship now, fix later), some accidental. The management discipline is making it **visible and tracked**: I log debt as tickets with the concrete cost and interest ("this hack slows every new form"), so it's a prioritized team decision against features — not something that silently rots. Deployability and maintainability are the outcomes we're protecting: debt that makes deploys scary is the debt to pay first.

**Say it:** "Code smells are surface symptoms of design problems, and I manage tech debt by making it visible — tracked tickets naming the cost — so paying it down is a deliberate priority call, not a silent slide into a rewrite."
**Red flag:** Treating all debt as bad or all shortcuts as fine. Say some debt is a reasonable deliberate tradeoff — the failure is leaving it *invisible* and untracked.

### Testing pyramid and test doubles
**They ask:** "Explain the testing pyramid, TDD vs BDD, and the difference between stubs and mocks."

The pyramid matters because it allocates testing effort by cost and speed: many fast **unit** tests at the base, fewer **integration** tests in the middle, very few slow, brittle **e2e** tests at the top. Invert it — mostly e2e — and your suite becomes slow and flaky, so people stop trusting it. The pyramid is a strategy for a fast, reliable suite.

**TDD** is red-green-refactor: write a failing test first, make it pass minimally, then refactor — the test drives the design and guarantees the code is testable. **BDD** builds on TDD but frames tests as behavior in domain language (`describe`/`it` reading like sentences, Given-When-Then), so tests double as living specs a non-engineer can follow.

**Test doubles** break real dependencies so a unit tests in isolation. A **stub** provides canned return values (state verification — "given this input, assert the output"). A **mock** additionally verifies *interactions* — that a method was called, how many times, with what args (behavior verification). **Fixtures** are the fixed setup/data a test runs against.

**Say it:** "The pyramid is many unit, fewer integration, fewest e2e for a fast trustworthy suite; TDD drives design red-green-refactor, BDD frames it as behavior specs; and a stub feeds canned data while a mock also asserts the interaction happened."
**Red flag:** Using "stub" and "mock" interchangeably. Stubs verify state (return values); mocks verify behavior (calls made). Draw that line explicitly.

### Polymorphism and SOLID
**They ask:** "Give me a practiced take on polymorphism and walk through SOLID."

Polymorphism matters because it's how you add new cases without touching existing code — one call site works across many types through a shared interface, so `shapes.forEach(s => s.area())` handles a new shape you add tomorrow with zero changes to the loop. That "open to extension" property is the thread running through SOLID.

**S**RP — one reason to change per module; a component that fetches, formats, and renders has three, so split them. **O**pen/closed — open for extension, closed for modification; add behavior via new types/strategies, not by editing a growing switch. **L**iskov — a subtype must be substitutable for its base without breaking callers (a `Square` that breaks `Rectangle`'s width/height contract violates it). **I**nterface segregation — many small focused interfaces over one fat one, so clients don't depend on methods they never call. **D**ependency inversion — depend on abstractions, not concretions; inject a `Logger` interface so you can swap console for a service without touching the consumer.

The unifying idea: SOLID exists to make change cheap and localized. Polymorphism and DI are the mechanics that deliver the O and D.

**Say it:** "Polymorphism lets one call site serve many types, and SOLID is five rules for making change cheap — one reason to change, extend don't modify, honor substitutability, keep interfaces small, and depend on abstractions."
**Red flag:** "SRP means a class does one thing." It's one *reason to change* — a class can do several related things that change together. Correct that precisely.

### Functors, monads, and currying
**They ask:** "Contrast imperative and functional style, and explain functors, monads, and currying."

This matters because functional composition builds complex behavior from small, testable pieces with no hidden state — the opposite of imperative code that mutates variables step by step. **Imperative** says *how*: a `for` loop mutating an accumulator. **Functional** says *what*: `array.map(...).filter(...)` describing the transformation, no mutation. Functional is more declarative and easier to reason about because each step is pure.

A **functor** is anything with a `map` that applies a function to a wrapped value while preserving structure — an array is a functor (`[1,2].map(x=>x+1)`), and so is a Promise-like or Maybe container. A **monad** adds `flatMap`/`chain`: it lets you sequence operations that each return a wrapped value without nesting them — Promises are the everyday monad (`.then` chains async steps and flattens, so you don't get `Promise<Promise<T>>`). The point of both is composing wrapped values safely.

**Currying** transforms a multi-arg function into a chain of single-arg functions: `add(a,b)` → `add(a)(b)`. It enables partial application — fix some args now, supply the rest later — which makes functions easy to compose and specialize.

**Say it:** "Functional style says what not how; a functor is anything you can `map` over preserving structure, a monad adds `flatMap` to sequence wrapped values without nesting — Promises are the everyday monad — and currying enables partial application for composition."
**Red flag:** Overcomplicating monads with category theory. Say "a Promise is a monad — `.then` chains and flattens," and the interviewer sees you grasp the practical shape.

### Big-O, sorting and searching
**They ask:** "Explain Big-O and how you'd reason about sorting and searching algorithms."

Big-O matters because it predicts how code behaves as data grows — the difference between O(n) and O(n²) is invisible on 10 items and fatal on 10 million, so it's how you catch scaling bombs before production does. Big-O describes the **growth rate** of time or space relative to input size, ignoring constants — it's about the shape of the curve, not the stopwatch.

The ladder to know: O(1) constant (hash lookup), O(log n) (binary search — halving each step), O(n) (single pass), O(n log n) (efficient comparison sorts — merge, quicksort average, the practical floor for general sorting), O(n²) (nested loops — bubble/insertion sort, fine only for tiny n), O(2ⁿ) (naive recursion — a red alert).

**Searching**: linear search is O(n) on any array; binary search is O(log n) but **requires sorted data**. **Sorting**: the good general algorithms (merge, quicksort, timsort — what JS `Array.sort` uses) are O(n log n); the O(n²) ones are teaching tools. The senior move is naming the space tradeoff too — merge sort is O(n) extra space, quicksort is in-place but O(n²) worst case.

**Say it:** "Big-O is the growth curve ignoring constants; I reason from the ladder — O(1)/O(log n)/O(n)/O(n log n)/O(n²) — and remember binary search needs sorted data and good sorts are O(n log n) with a time-vs-space tradeoff."
**Red flag:** Quoting best-case complexity. Interviewers mean worst/average — say quicksort is O(n log n) average but O(n²) worst, and why.

### REST caching constraint
**They ask:** "REST lists caching as an architectural constraint — why does it matter and how does it work over HTTP?"

Caching matters because it's the constraint that lets REST scale: statelessness means every response is self-describing, so responses can be labeled cacheable and served from a cache (browser, CDN, proxy) without re-hitting the origin — cutting latency and load dramatically. REST *requires* responses to declare whether and how long they can be reused.

The HTTP mechanics: `Cache-Control` is the primary control (`max-age=3600` for freshness, `no-store` to forbid caching, `private` vs `public` for who may cache). For **validation** after expiry, the server sends an `ETag` (a content fingerprint) or `Last-Modified`; the client revalidates with `If-None-Match`/`If-Modified-Since`, and the server answers `304 Not Modified` with no body if unchanged — saving bandwidth even when it must check. GET is cacheable by design; POST/PUT/DELETE generally are not because they mutate.

The senior framing: caching is *why* REST maps so well to CDNs — every resource has a URL, so a CDN caches per-URL for free. That's the exact thing GraphQL's single endpoint makes harder.

**Say it:** "REST's statelessness makes responses self-describing and cacheable, so `Cache-Control` sets freshness and `ETag`/`304` handles revalidation — which is why REST resources map cleanly onto CDN caching per URL."
**Red flag:** Confusing caching a mutation. Only safe/idempotent GETs are cacheable by default — say POST/PUT/DELETE aren't, and why.

### GraphQL vs REST
**They ask:** "When would you choose GraphQL over REST, and what do you give up?"

The honest answer leads with tradeoffs, because neither wins outright — the choice depends on your clients and data shape. **REST** shines when resources are stable, the responses are cache-friendly, and you want to lean on HTTP's built-in caching and CDNs — every resource has a URL, so caching, monitoring, and status codes come free. **GraphQL** shines when clients need varying slices of a rich, connected graph — multiple frontends (mobile wants three fields, web wants thirty) fetching related data in one round trip, killing over- and under-fetching.

The 3-beat tradeoff: (a) GraphQL's real cost is caching — no URL-per-resource means you can't lean on HTTP/CDN caching, and naive resolvers hit the N+1 problem needing DataLoader batching. (b) But REST's cost is round trips and endpoint sprawl — a screen needing user + posts + comments makes three calls or forces a bespoke aggregate endpoint per view. (c) So I'd reframe: pick GraphQL when *client-driven flexibility over a connected graph* outweighs *easy caching*; pick REST when *cacheability and simplicity* win. Long term, GraphQL also shifts complexity to the schema/resolver layer you must own.

**Say it:** "REST wins on caching and simplicity because every resource is a URL; GraphQL wins when varied clients need exact slices of a connected graph in one request — so I choose by whether client flexibility or HTTP-level caching matters more."
**Red flag:** "GraphQL replaces REST." They coexist and often GraphQL fronts REST services. Frame it as a fit-to-problem choice with real caching/N+1 costs.

### HTTP methods: PUT vs PATCH vs POST
**They ask:** "Explain OPTIONS, HEAD, and PATCH, and the real difference between PUT, PATCH, and POST."

Getting these right matters because the method communicates intent and safety guarantees to every proxy, cache, and client in the chain — misusing them breaks retries and caching. **OPTIONS** asks what a resource supports and is the CORS **preflight** the browser sends before non-simple cross-origin requests. **HEAD** is GET without a body — you get the headers (size, `ETag`, last-modified) to check existence or freshness without downloading. **PATCH** applies a *partial* update.

The core distinction is **PUT vs PATCH vs POST**. **POST** creates a new resource (or triggers a process) and is **not idempotent** — call it twice, get two resources. **PUT** replaces a resource entirely and **is idempotent** — sending the same full representation twice leaves the same final state, so it's safe to retry. **PATCH** updates *part* of a resource and is not guaranteed idempotent (depends on the patch semantics). So: creating → POST; full replace → PUT; partial edit → PATCH.

The senior signal is idempotency: it's *why* a client can safely retry a PUT on a timeout but must be careful retrying a POST (hence idempotency keys on payment APIs).

**Say it:** "POST creates and isn't idempotent, PUT fully replaces and is idempotent so it's retry-safe, PATCH does a partial update; OPTIONS is the CORS preflight and HEAD fetches headers only — and idempotency is what makes retries safe."
**Red flag:** "PUT and PATCH are the same." PUT replaces the whole resource (idempotent); PATCH edits part of it. Name idempotency as the reason it matters for retries.
