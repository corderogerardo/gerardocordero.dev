# Software Engineering Practices — Andersen matrix, junior→middle levels

### OOP fundamentals
**They ask:** "What's the difference between a class and an object, and can you define the four pillars of OOP?"

OOP organizes code around data and the behavior that owns it, so state can't be mutated by any caller — the object guards its own invariants. A class is the blueprint (the type); an object is a concrete instance with its own state. That distinction matters because you reason about classes at design time and objects at runtime.

The four pillars: **encapsulation** hides internal state behind a public interface; **abstraction** exposes only what a caller needs and hides the how; **inheritance** lets a type reuse and specialize another's behavior; **polymorphism** lets one interface work across many types. In JavaScript, inheritance is **prototypal** — objects delegate to a prototype object at runtime, and `class` is syntax sugar over that. Classical inheritance (Java, C#) copies structure from a compile-time class hierarchy.

**Say it:** "A class is the blueprint, an object is an instance; JS uses prototypal inheritance where objects delegate to a prototype at runtime — `class` is just sugar over `Object.getPrototypeOf`."
**Red flag:** Saying JS has "real" classes like Java. Under the hood it's prototype delegation — say that, because interviewers probe `__proto__` vs `prototype` next.

### Algorithms and data structures basics
**They ask:** "What is an algorithm, and which basic data structures do you reach for day to day?"

An algorithm is a finite, deterministic sequence of steps that transforms an input into an output — it matters because the same problem solved with the wrong structure turns a millisecond operation into a visible UI freeze. The data structure decides which operations are cheap.

The staples: **array** (indexed, O(1) access, O(n) search); **object/hash map** (O(1) average lookup by key — my default for dedup and lookups); **set** (unique membership); **stack** (LIFO — undo, call stack); **queue** (FIFO — task scheduling); **linked list, tree, graph** for hierarchical or connected data. Concretely: if I'm checking "have I seen this id" inside a loop, I use a `Set`, not `array.includes` — that turns an O(n²) scan into O(n).

**Say it:** "An algorithm is a finite set of deterministic steps; picking the right data structure is what turns an O(n²) loop into O(n) — a `Set` lookup instead of `array.includes`."
**Red flag:** Only naming arrays and objects. Interviewers want to hear you match structure to access pattern — say "stack for LIFO, queue for FIFO, hash map for O(1) lookup."

### The debugging process
**They ask:** "Walk me through how you debug a bug you've never seen before."

Debugging is a hypothesis loop, not random poking — a systematic sequence is what keeps you from "fixing" the symptom while the root cause stays live. The discipline is what makes it fast.

1. **Reproduce** it reliably — a bug you can't trigger on demand, you can't prove you fixed. 2. **Isolate**: narrow the surface — which screen, which input, which commit? Binary-search the code path or use `git bisect`. 3. **Form a hypothesis** about the cause and predict what you'd see if it were true. 4. **Prove it** with a `console.log`, breakpoint, or the debugger — observe, don't assume. 5. **Fix the root cause**, then confirm the repro is gone and nothing adjacent broke. Concretely: a list crashes intermittently → I reproduce with the exact data, log the item shape, find one record with a null field, and add the guard where all callers route through.

**Say it:** "I reproduce it reliably first — if I can't trigger it on demand I can't prove I fixed it — then isolate, hypothesize, prove with a breakpoint, and fix the root cause."
**Red flag:** Jumping straight to a fix. Say you reproduce and isolate first; guessing at fixes without a repro is how you ship the same bug twice.

### REST fundamentals
**They ask:** "What is REST?"

REST is an architectural style for networked APIs, not a protocol — it matters because its constraints (statelessness, uniform interface) are what let APIs scale horizontally and cache aggressively. Resources are the unit; you name them with URLs and act on them with HTTP verbs.

The core ideas: everything is a **resource** identified by a URL (`/users/42`); you use standard **HTTP methods** for actions (GET read, POST create, PUT/PATCH update, DELETE remove); it's **stateless** — every request carries everything the server needs, no server-side session between calls; and responses use standard **status codes** (200, 201, 404, 500). Concretely: `GET /walkers/7` returns walker 7, `DELETE /bookings/9` cancels booking 9 — the verb is the action, the URL is the noun.

**Say it:** "REST models everything as resources addressed by URLs and acted on with HTTP verbs, and it's stateless — each request is self-contained, which is what lets it scale and cache."
**Red flag:** Calling REST a protocol or conflating it with JSON. It's an architectural style; JSON is just a common representation — say "style, not protocol."

### GraphQL fundamentals
**They ask:** "What is GraphQL and what problem does it solve?"

GraphQL is a query language for APIs where the client declares exactly the data it wants, so it solves over-fetching and under-fetching in one round trip — the reason it took off on mobile, where every wasted byte and extra request costs battery and latency. There's one endpoint and a typed schema.

Mechanically: the server publishes a **schema** of types and fields; the client sends a **query** naming precisely the fields it needs, nested to match the shape it wants; the server resolves each field and returns matching JSON. **Queries** read, **mutations** write, **subscriptions** stream. Concretely: instead of hitting `/user` then `/user/bookings` then `/booking/walker`, I send one query for `user { name bookings { walker { name } } }` and get exactly that tree back — no more, no less.

**Say it:** "GraphQL lets the client ask for exactly the fields it needs from one typed endpoint, killing the over-fetch and the N+1 round trips REST forces on mobile."
**Red flag:** Saying GraphQL "replaces REST because it's newer." It's a trade-off — say it shines for nested/variable data needs but adds server complexity and complicates HTTP caching.

### AJAX and XHR basics
**They ask:** "What is AJAX, how do you make a basic request, and which HTTP methods map to CRUD?"

AJAX is the technique of exchanging data with a server **without a full page reload**, so the UI stays responsive while data updates in the background — it's what turned web pages into applications. "AJAX" predates `fetch`; the original engine was `XMLHttpRequest` (XHR).

Mechanically with XHR: create the object, `open(method, url)`, attach an `onload`/`onreadystatechange` handler, then `send()`; you read `xhr.status` and `xhr.responseText` in the callback. Today I use `fetch`, which returns a promise. **CRUD maps to verbs**: Create → POST, Read → GET, Update → PUT/PATCH, Delete → DELETE. Concretely: `fetch('/walkers')` reads the list; `fetch('/walkers', { method: 'POST', body })` creates one.

**Say it:** "AJAX is exchanging data without a page reload — XHR was the original engine, `fetch` is the modern one — and CRUD maps to POST/GET/PUT-PATCH/DELETE."
**Red flag:** Thinking AJAX requires XML. The X is historical — it's almost always JSON now. And don't forget errors: a `fetch` promise only rejects on network failure, so you must check `response.ok` for HTTP 4xx/5xx.

### Why CORS exists
**They ask:** "Why do we need CORS?"

CORS exists because browsers enforce the **same-origin policy** — by default a page can't read responses from a different origin — and CORS is the controlled way a server opts to relax it. Without the policy, any malicious site your logged-in user visits could silently read your bank's API using their cookies. CORS is the server saying "these specific origins are allowed to read me."

Mechanically: when JS makes a cross-origin request, the browser adds an `Origin` header; the server must respond with `Access-Control-Allow-Origin` naming that origin (or `*`). If it doesn't, the browser blocks the JS from reading the response — the request may still hit the server, but your code can't see the result. Concretely: `app.mobile.com` calling `api.company.com` needs the API to return the allow header, or the fetch fails in the browser.

**Say it:** "CORS is how a server opts specific origins out of the same-origin policy — without it, any site could read another origin's authenticated responses using the user's cookies."
**Red flag:** Saying "CORS is a security feature I can disable to fix the error." The browser enforces it; the fix is server-side allow headers, not turning off protection. Say the server must send `Access-Control-Allow-Origin`.

### How long polling works
**They ask:** "How does long polling work?"

Long polling simulates server push over plain HTTP, so you get near-real-time updates without WebSockets — useful when infrastructure or proxies don't allow persistent socket connections. The trick is holding the request open.

Mechanically: the client sends a request; instead of answering immediately, the server **holds the connection open** until it has new data (or a timeout fires); it then responds, and the client **immediately reopens** a new request. So there's almost always one pending request waiting for the next event. Concretely: a chat client asks "any new messages?" — the server waits, and the moment a message arrives it responds, delivering it with minimal latency, then the client asks again. Versus naive polling every 5s, long polling cuts both latency and the flood of empty responses.

**Say it:** "Long polling holds each request open until the server has data, then the client immediately reopens one — so there's always a pending request ready to receive the next push."
**Red flag:** Confusing it with regular polling on an interval. The difference is the held connection — say "the server holds the request open" rather than "polls faster."

### WebSocket API basics
**They ask:** "What are the main WebSocket API methods and events?"

WebSockets give you a **full-duplex, persistent** connection over a single TCP socket, so server and client can both push at any time with almost no per-message overhead — the right tool for live chat, presence, or GPS tracking where interval polling would be wasteful and laggy. It starts as an HTTP request that "upgrades" the protocol.

The API: construct `new WebSocket(url)`; send with `socket.send(data)`; close with `socket.close()`. The **events**: `onopen` (connection ready), `onmessage` (data received — the workhorse), `onerror` (failure), `onclose` (closed, with a code). Concretely: for live walker tracking I open a socket, `onmessage` fires with each new coordinate, and I push it to the map — no request per update.

**Say it:** "WebSockets are a persistent full-duplex channel — `send`/`close` methods, `onopen`/`onmessage`/`onerror`/`onclose` events — so both sides push freely without a request per message."
**Red flag:** Forgetting reconnection. Sockets drop on network changes — a senior mentions handling `onclose` with backoff reconnection, not just the happy path.

### Server-Sent Events basics
**They ask:** "What are Server-Sent Events, and what's the API?"

SSE is a **one-way** server-to-client stream over a single long-lived HTTP connection, so it's the lean choice when only the server needs to push — live scores, notifications, a progress feed — without the weight of a bidirectional socket. It's plain HTTP, so it works through most proxies and reconnects automatically.

The API: create `new EventSource(url)`; handle **events** `onopen`, `onmessage` (default messages), and `onerror`; listen for named events with `addEventListener('eventName', ...)`; stop with `.close()`. The browser **auto-reconnects** and can resume from the last event id — a big built-in advantage over hand-rolled polling. Concretely: `const es = new EventSource('/notifications')`, then `es.onmessage = e => show(e.data)`.

**Say it:** "SSE is a one-way server-to-client stream over plain HTTP via `EventSource` — `onmessage`/`onopen`/`onerror` — with automatic reconnection built in; I reach for it when only the server pushes."
**Red flag:** Claiming SSE is bidirectional like WebSockets. It's server→client only — if the client needs to push too, that's WebSockets. Say "one-way" explicitly.

### What refactoring is
**They ask:** "What is refactoring, and when do you do it?"

Refactoring is changing code's internal structure **without changing its observable behavior** — the discipline matters because it lets you improve design continuously instead of accumulating a big scary rewrite. The behavior-preserving part is the whole point: if outputs change, that's not refactoring, that's a rewrite or a bug.

Mechanically it's small, safe steps — rename for clarity, extract a function, remove duplication, split a bloated component — each verified by tests so you know behavior held. That's why refactoring depends on having tests: they're your safety net. Concretely: a 300-line component that fetches, formats, and renders → I extract the fetch into a hook and the formatting into a pure function, run the tests, and the UI behaves identically but each piece is now testable and reusable.

**Say it:** "Refactoring improves internal structure without changing observable behavior — tests are the safety net that prove behavior held, which is why I refactor in small verified steps."
**Red flag:** Mixing refactoring with feature work in one commit. Say you keep them separate — behavior-preserving changes and behavior-changing changes in different commits so review and rollback stay clean.

### Testing fundamentals and FIRST
**They ask:** "Explain test plan, suite, and case, the main test types, and what makes a good unit test."

Tests exist to let you change code without fear — the vocabulary and the FIRST properties matter because they're what separate a suite people trust from one they ignore. A **test case** is one scenario (input → expected output); a **test suite** groups related cases; a **test plan** is the higher-level document of what will be tested and how.

The **types by scope**: **unit** (one function/component in isolation), **integration** (units working together), **functional/e2e** (the whole feature from the user's side). A good unit test follows **FIRST**: **Fast** (runs in milliseconds), **Isolated/Independent** (no ordering or shared state), **Repeatable** (same result every run, no clock/network flakiness), **Self-validating** (passes or fails, no manual inspection), **Timely** (written with the code). Concretely: a pure `formatPrice` function is trivial to test — fixed input, fixed output, no mocks.

**Say it:** "A good unit test is FIRST — Fast, Isolated, Repeatable, Self-validating, Timely — and the pyramid says most tests should be fast unit tests, fewer integration, fewest e2e."
**Red flag:** Calling every test a "unit test." If it hits the network or database it's integration — say so; mislabeling is what makes suites slow and flaky.

### Functional programming fundamentals
**They ask:** "What is functional programming and what are its core concepts?"

FP is a paradigm built on **pure functions and immutable data**, and it matters because pure code is trivial to test, reason about, and parallelize — no hidden state to break under you. React embraced it: components as functions, state treated as immutable.

The core bricks: a **pure function** returns the same output for the same input with no side effects; **immutability** means you produce new data instead of mutating; **first-class functions** can be passed and returned like any value; **higher-order functions** take or return functions (`map`, `filter`, `reduce`); **lambdas** are anonymous functions; **recursion** replaces loops; **lazy evaluation** defers work until the result is needed. Concretely: instead of a `for` loop mutating an array, I `items.filter(active).map(toView)` — no mutation, each step pure and testable.

**Say it:** "FP centers on pure functions and immutable data — same input, same output, no side effects — which is exactly why it's easy to test and why React's render model is functional."
**Red flag:** Reciting "monads" as the definition. At this level, lead with pure functions and immutability — say why it helps (testability, no shared-state bugs), not just the vocabulary.

### Following code conventions
**They ask:** "How do you make sure you follow a project's code conventions?"

Conventions exist so a codebase reads as if one person wrote it — that consistency is what lets a team move fast, because nobody wastes review cycles on style. Following them is a seniority signal: you adapt to the house style instead of imposing your own.

Mechanically, most of it should be **automated so it isn't a debate**: a linter (ESLint) and formatter (Prettier) enforce style on save and in CI, so PRs fail on violations before a human looks. Beyond formatting, I read the surrounding code and match its patterns — naming, file structure, how errors are handled — and I check the CONTRIBUTING or style docs. Concretely: dropping into a new repo, I run the linter first and mirror how the nearest existing module is structured rather than inventing my own layout.

**Say it:** "I let the linter and formatter enforce style automatically so it's never a review debate, and for everything else I match the patterns of the code around me."
**Red flag:** "I write it the way I'm used to." Say you adapt to the project's conventions — imposing personal style on an existing codebase is a red flag for collaboration.

### Reactive programming fundamentals
**They ask:** "What is reactive programming, and what are its main building blocks?"

Reactive programming models your app as **streams of values over time** that you react to declaratively, so instead of manually wiring "when this changes, update that," you compose data flows and let the system propagate changes — which tames the callback spaghetti of async, event-heavy UIs.

The building blocks: an **Observable** is a stream that emits values over time (clicks, responses, state changes); a **subscription** connects a consumer to that stream and can be cancelled; **operators** (`map`, `filter`, `debounce`) transform streams like array methods for time; an **observer** receives `next`, `error`, and `complete` notifications. Concretely: a search box — I take the stream of keystrokes, `debounce` it so I don't fire on every letter, `switchMap` to the request, and the results flow to the UI; unsubscribing cancels everything cleanly.

**Say it:** "Reactive programming treats everything as observable streams you compose with operators and subscribe to — it's what turns tangled async callbacks into a declarative data flow."
**Red flag:** Forgetting to unsubscribe. Say you manage subscription lifecycle — leaked subscriptions are a classic memory-leak and a senior mentions cleanup, not just `subscribe`.

### Automated builds basics
**They ask:** "What's an automated build, and what does a build tool actually do?"

An automated build turns source into a deployable artifact with **one repeatable command**, and it matters because "works on my machine" dies the moment the build is reproducible on any machine — including CI. It removes humans from an error-prone manual process.

Mechanically, a build tool (webpack, Vite, esbuild; older Gulp/Grunt task runners; Bazel for large monorepos) **transpiles** (TypeScript/modern JS → target JS), **bundles** modules into fewer files, **minifies** to shrink payload, and processes assets. It also **cleans** the output directory first so stale artifacts from a previous build don't ship. Concretely: `npm run build` transpiles TS, tree-shakes unused code, minifies, and drops hashed files in `dist/` — the same output whether I run it or CI does.

**Say it:** "An automated build is one repeatable command that transpiles, bundles, and minifies source into a deployable artifact — reproducible anywhere, which is what kills 'works on my machine.'"
**Red flag:** Skipping the clean step. Say the build cleans its output first — shipping stale files from a prior build is a real and confusing bug.

### Logging and the browser console
**They ask:** "How do you use the browser console and logging to troubleshoot?"

Logging exists to make a running system observable — the difference between "it's broken somewhere" and "it fails at this line with this value" is whether you logged the right thing at the right level. The console is your first window; structured logging is the long game.

The **console** beyond `console.log`: `console.error`/`console.warn` for severity, `console.table` for arrays of objects, `console.group` to nest, `console.time`/`timeEnd` for quick timing, plus the Network and Sources (breakpoints) tabs. For **app logging**, use **levels** — `debug`, `info`, `warn`, `error` — so you can turn down noise in production and still capture errors, and route them to a service (Sentry) instead of relying on someone watching a console. Concretely: I log at `error` with context (user id, request id) so a production crash is traceable, not just `console.log(x)`.

**Say it:** "I use log levels — debug/info/warn/error — so production stays quiet but every error is captured with context like a request id, and I route them to a service rather than a console nobody's watching."
**Red flag:** Leaving `console.log` debugging statements in committed code. Say you use levels and remove or gate debug logs — stray logs leak data and clutter production.

### Web security fundamentals
**They ask:** "Cover HTTP vs HTTPS, how you store passwords, and the common form/URL attacks."

Security is non-negotiable because one gap exposes every user at once — so I treat inputs as hostile and never store what I can't afford to leak. **HTTPS** is HTTP over TLS: same semantics, but the transport is encrypted and the server authenticated, so traffic can't be read or tampered with in transit. Everything sensitive is HTTPS-only.

**Passwords** are never stored plaintext or even plain-hashed — I use a slow, salted password hash (bcrypt/argon2) so a stolen database can't be reversed. A **hash** is one-way (integrity); an **HMAC** adds a secret key so you can verify the message came from someone who holds the key (authenticity), which a bare hash can't. **Attacks**: **XSS** injects script into a page — defend by escaping/encoding output and never `innerHTML` with user data; **CSRF** rides the user's cookies to forge requests — defend with anti-CSRF tokens and `SameSite` cookies; **semantic URL** attacks tamper with ids in the URL (`/account/123` → `/account/124`) — defend with server-side authorization checks. And **filter/validate all input** server-side.

**Say it:** "I store passwords with a slow salted hash like bcrypt, serve everything over HTTPS, escape output against XSS, use anti-CSRF tokens, and validate every input server-side — a hash proves integrity, an HMAC adds authenticity with a secret key."
**Red flag:** "I hash passwords with SHA-256." Fast hashes are brute-forceable — say bcrypt/argon2 with a salt. And never trust client-side validation for security; it's UX only.

### Code smells and technical debt
**They ask:** "What code smells and anti-patterns do you watch for, and how do you manage technical debt?"

Code smells are surface symptoms that hint at deeper design problems — naming them matters because it lets a team talk about "why this hurts to change" without hand-waving. They're not bugs; they're signals that changing this code is riskier and slower than it should be.

Common **smells**: long functions/god components, duplicated code, long parameter lists, feature envy (a function that reaches into another object's data), primitive obsession, and deep nesting. **Anti-patterns** are bad solutions at a larger scale — spaghetti code, the god object, copy-paste programming, magic numbers. For **technical debt**, I make it visible and deliberate: track it (tickets, TODOs with context), quantify its cost in slowed delivery, and pay it down incrementally — often via the boy-scout rule, refactoring the code you're already touching. Concretely: I don't stop a feature to rewrite everything; I leave each file I touch a little cleaner and log the bigger debt so it's a planned decision, not a surprise.

**Say it:** "Smells are signals that code is risky to change — I make technical debt visible and deliberate, paying it down incrementally as I touch code rather than in one heroic rewrite."
**Red flag:** Treating all debt as "must fix now." Say you triage — some debt is fine to carry; a senior weighs the cost of paying it against the cost of living with it.

### Testing pyramid, TDD and test doubles
**They ask:** "Explain the testing pyramid, TDD vs BDD, and the difference between a stub and a mock."

The **testing pyramid** prescribes the ratio: many fast **unit** tests at the base, fewer **integration** in the middle, few slow **e2e** at the top — because that shape gives you the most confidence per second of run time. Inverting it (mostly e2e) gives a slow, flaky suite people stop trusting.

**TDD** is red-green-refactor: write a failing test, make it pass minimally, then refactor — it drives design and guarantees coverage. **BDD** frames the same loop in behavior/business language (Given-When-Then) so tests double as living specification stakeholders can read. A **fixture** is the known baseline state a test runs against. **Test doubles**: a **stub** provides canned answers so the code under test can run (state verification — "did the output come out right?"); a **mock** additionally asserts it was *called* correctly (interaction/behavior verification — "was `sendEmail` called once with this arg?"). Concretely: I stub an API to return fixed data; I mock an analytics call to assert it fired exactly once.

**Say it:** "The pyramid is many unit, some integration, few e2e — for speed and stability; a stub feeds canned data to verify output, a mock also asserts the interaction happened."
**Red flag:** Using "stub" and "mock" interchangeably. The distinction is state vs interaction verification — say it, because over-mocking couples tests to implementation and makes refactoring painful.

### SOLID principles
**They ask:** "Walk me through SOLID, and give a real example of one you've applied."

SOLID is five design principles that keep object-oriented code flexible and change-tolerant — they matter because each one localizes a kind of change so a new requirement touches one place, not ten. **S**ingle Responsibility: one reason to change per module. **O**pen/Closed: open for extension, closed for modification — add behavior without editing tested code. **L**iskov Substitution: a subtype must be usable anywhere its base type is, without surprises. **I**nterface Segregation: many small focused interfaces beat one fat one, so clients don't depend on methods they don't use. **D**ependency Inversion: depend on abstractions, not concretions.

Polymorphism is the engine behind Open/Closed and Liskov — you swap implementations behind a shared interface. Concretely: a payment flow that `switch`es over payment types violates Open/Closed — every new method edits it. I invert it to a `PaymentProvider` interface with one implementation per method; adding Apple Pay is a new class, and the flow never changes.

**Say it:** "SOLID keeps code change-tolerant — SRP is one reason to change per module, Open/Closed means I add a new class instead of editing tested code, and Dependency Inversion means I depend on an interface, not a concrete type."
**Red flag:** Reciting the acronym with no example. Interviewers want one refactor you actually did — say the `switch`-to-polymorphism story; naming the letters proves nothing.

### Functors, monads and composition
**They ask:** "Contrast imperative and functional style, and explain functors, monads, and currying."

**Imperative** code describes *how* — explicit steps mutating state (`for` loops, reassignment); **functional** describes *what* — composing transformations over immutable data. Functional wins for readability and testability because there's no hidden state to track through the steps.

A **functor** is anything with a `map` that applies a function to the value(s) inside while preserving the structure — an array is a functor, and so is a `Promise` (`.then` maps over the eventual value). A **monad** adds `flatMap`/`chain` — it lets you sequence operations that each return a wrapped value without nesting them (a `Promise` is monadic: `.then` flattens returned promises so you don't get `Promise<Promise<T>>`). **Composition** builds a pipeline by feeding one function's output into the next (`compose(f, g)(x) === f(g(x))`). **Currying** turns a multi-arg function into a chain of single-arg functions, which makes partial application and composition natural. Concretely: `const add = a => b => a + b; const inc = add(1)` — currying gives me a reusable `inc` for free.

**Say it:** "A functor is anything you can `map` over preserving structure; a monad adds `flatMap` to sequence wrapped values without nesting — a Promise is both — and currying enables partial application so functions compose cleanly."
**Red flag:** Defining a monad only as "a burrito" or with jargon. Ground it: "a Promise is a monad — `.then` flattens nested promises." Concrete beats mystical here.

### Big-O and sorting algorithms
**They ask:** "Explain Big-O notation and compare a few sorting and searching algorithms."

Big-O describes how an algorithm's cost **grows with input size**, ignoring constants — it matters because it predicts which code survives a 10x data increase and which one falls over. It's about scaling, not stopwatch time.

The ladder: **O(1)** constant (hash lookup), **O(log n)** logarithmic (binary search — halves the space each step, but requires sorted data), **O(n)** linear (a single scan), **O(n log n)** (good comparison sorts — merge sort, quicksort average, the practical floor for comparison sorting), **O(n²)** quadratic (bubble/insertion sort, or nested loops — the smell to avoid on large inputs). **Searching**: linear O(n) on unsorted; binary O(log n) on sorted. Concretely: dedup with a nested loop is O(n²); a `Set` makes it O(n) — same result, survives scale. I quote worst-case unless average is clearly relevant (quicksort is O(n log n) average, O(n²) worst).

**Say it:** "Big-O is how cost grows with input, ignoring constants — binary search is O(log n) but needs sorted data, good sorts are O(n log n), and a nested-loop O(n²) is the thing to catch before it hits production data."
**Red flag:** Confusing "fast on my test data" with good complexity. A O(n²) algorithm looks fine on 10 items and dies on 10,000 — say you reason about growth, not observed speed on small inputs.

### REST caching constraint
**They ask:** "Caching is a REST constraint — how does it actually work over HTTP?"

Cacheability is one of REST's architectural constraints precisely because statelessness would otherwise force every read to hit the origin — caching is what buys REST its scalability, letting responses be reused without recomputation or another round trip. The uniform interface makes responses self-describing enough to cache safely.

Mechanically, the server marks responses cacheable with headers: `Cache-Control` (`max-age`, `no-cache`, `private`/`public`) sets freshness; `ETag` gives a version fingerprint so the client can revalidate with `If-None-Match` and get a cheap `304 Not Modified` instead of the full body; `Last-Modified`/`If-Modified-Since` do the same by date. **GET** should be safe and idempotent, which is exactly why it's cacheable — POST generally isn't. Concretely: a walker list rarely changes, so I serve it with `Cache-Control: max-age=60` and an `ETag`; repeat loads within a minute skip the network entirely, and after that a 304 confirms nothing changed.

**Say it:** "Caching is a REST constraint because statelessness would otherwise mean every read hits the origin — `Cache-Control` sets freshness and `ETag` enables cheap 304 revalidation, so GETs are reused instead of recomputed."
**Red flag:** Caching non-idempotent requests. Say only safe methods (GET) are cacheable — caching a POST that mutates state is a correctness bug, not an optimization.

### GraphQL versus REST
**They ask:** "When would you choose GraphQL over REST, and what do you give up?"

The honest framing is trade-offs, not "newer is better." REST's role: resource-oriented, one URL per resource, leans on HTTP's built-in caching. GraphQL's role: a single typed endpoint where the client shapes the response — it eliminates over-fetching and the N+1 round trips REST forces when a screen needs data from several resources.

GraphQL wins when the client's data needs are **nested and variable** — a mobile screen assembling user + bookings + walker in one query instead of three requests, each client asking for only the fields it renders. REST wins when data is **resource-shaped and cache-heavy** — HTTP caching, CDNs, and `ETag`s work out of the box, whereas GraphQL's single POST endpoint bypasses that and needs its own caching layer. GraphQL also adds server complexity (schema, resolvers, N+1 on the *server* side needing DataLoader) and makes rate-limiting harder since one query's cost is variable.

**Say it:** "GraphQL lets the client fetch exactly the nested data it needs in one round trip — great for mobile — but I give up free HTTP caching and take on schema and resolver complexity; REST stays simpler when data is resource-shaped and cache-heavy."
**Red flag:** "GraphQL is just better than REST." Name a concrete cost — lost HTTP caching, harder rate-limiting, server-side N+1 — a senior defends the choice by naming what it costs.

### PUT, PATCH, POST and COMET
**They ask:** "Difference between PUT, PATCH, and POST — and what do OPTIONS and HEAD do? Also, AJAX vs COMET?"

The verbs encode **intent and idempotency**, which matters because idempotency decides whether a client can safely retry after a network blip. **PUT** replaces a resource entirely and is **idempotent** — sending it twice leaves the same state. **PATCH** applies a partial update (idempotent depending on the patch semantics). **POST** creates or triggers and is **not idempotent** — two POSTs create two resources, so retries risk duplicates.

**OPTIONS** asks what a resource supports and is what the browser sends as the CORS **preflight**. **HEAD** is a GET without a body — you get the headers (size, `ETag`) to check something before downloading. **AJAX vs COMET**: AJAX is client-initiated request/response; **COMET** is an umbrella for older server-push techniques over HTTP (long polling, streaming) that let the server send data without the client asking first — the pre-WebSocket way to push. Concretely: I POST to create a booking (guard against double-submit), PUT to fully replace it, PATCH to change just its status.

**Say it:** "PUT fully replaces and is idempotent, PATCH updates partially, POST creates and isn't idempotent — so retries are safe on PUT but risk duplicates on POST; OPTIONS is the CORS preflight and COMET was server-push before WebSockets."
**Red flag:** Calling POST idempotent or using it for everything. Say POST isn't idempotent — that's why you guard create endpoints against double-submits and prefer PUT/PATCH for updates.

### CORS headers and preflight
**They ask:** "Walk me through the CORS headers and when a preflight happens."

Preflight exists so a server can veto a dangerous cross-origin request **before** it executes — the browser asks permission for anything beyond a "simple" request, which protects state-changing calls. Understanding the headers is what lets you actually fix a CORS error instead of flailing.

A **simple request** (GET/POST/HEAD with safe headers) goes straight through; the server just needs `Access-Control-Allow-Origin`. Anything else — a `PUT`/`DELETE`, custom headers, a JSON content-type — triggers a **preflight**: the browser sends an `OPTIONS` request first, and the server must answer with `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`, and `Access-Control-Allow-Origin`; only then does the real request go. For cookies/auth, the client sets `credentials: 'include'` and the server must return `Access-Control-Allow-Credentials: true` **and** a specific origin — you can't use `*` with credentials. Concretely: a `DELETE /booking/9` with an auth header preflights; if the server omits `Allow-Methods: DELETE`, the browser blocks it.

**Say it:** "Simple requests just need `Access-Control-Allow-Origin`, but anything with a custom header or non-simple method preflights via OPTIONS and needs `Allow-Methods` and `Allow-Headers` too — and with credentials you can't use `*`, you must name the origin."
**Red flag:** Setting `Access-Control-Allow-Origin: *` alongside credentialed requests. The browser rejects that combination — say you must echo a specific origin when `credentials: include` is used.

### Long polling versus regular polling
**They ask:** "Long polling vs regular polling — what's the difference and where do you use each?"

The difference is who waits, and it matters because it's the trade-off between latency and wasted requests. **Regular polling** asks on a fixed interval — "any updates?" every N seconds — so you get a constant stream of requests, most returning nothing, and updates lag up to N seconds behind. **Long polling** holds each request open until the server actually has data, then the client immediately reopens, so updates arrive near-instantly with far fewer empty responses.

Long polling costs a held server connection per client; regular polling costs repeated round trips and latency. **Where to use**: regular polling is fine for low-urgency data where a delay is acceptable and simplicity wins (a dashboard refreshing every 30s). Long polling suits near-real-time needs when WebSockets aren't available — restrictive proxies, legacy infra. Above that, I'd reach for SSE or WebSockets. Concretely: notifications that must feel instant → long polling or SSE; a stats widget that can lag → simple interval polling.

**Say it:** "Regular polling asks on a fixed interval and mostly gets nothing back; long polling holds the request open until there's data, trading a held connection for near-instant delivery and fewer wasted requests."
**Red flag:** Reaching for polling when the app needs true real-time bidirectional data. Say that's a WebSocket job — polling is a fallback, not the default for live features.

### WebSocket cross-origin and integration
**They ask:** "How do WebSockets handle cross-origin, and how do you integrate them into an app?"

The key gotcha: WebSockets are **not bound by the same-origin policy the way XHR is** — the browser will open a cross-origin socket, and it does *not* enforce CORS on it. That shifts the security burden onto the server: it must validate the `Origin` header itself and authenticate the connection, or you're exposed to cross-site WebSocket hijacking. Knowing this is a seniority signal.

The handshake starts as an HTTP `Upgrade` request, so the server sees `Origin` and should check it plus a token/session before accepting. For **integration**, I rarely hand-roll the raw API — I use a library (Socket.IO, or a client wrapper) that adds **reconnection with backoff, heartbeats, and fallback** to long polling when a socket can't be established. In React Native I open the socket in an effect, handle `onmessage` to update state, and clean up on unmount. Concretely: live GPS tracking — authenticate on connect, push coordinates, reconnect on network change, close on unmount to avoid leaks.

**Say it:** "WebSockets aren't protected by CORS, so the server must validate `Origin` and authenticate the connection itself — and in practice I use a library that gives me reconnection, heartbeats, and polling fallback rather than the raw socket."
**Red flag:** Assuming CORS protects WebSockets. It doesn't — say the server must check `Origin` and authenticate, or you've opened a cross-site hijacking hole.

### EventSource and CORS
**They ask:** "How does CORS work with SSE and EventSource?"

SSE runs over normal HTTP, so it plays by the **same CORS rules as fetch** — which is actually convenient, because the mechanism you already know applies. The server must return `Access-Control-Allow-Origin` for the `EventSource` connection to be readable cross-origin, same as any cross-origin GET.

The credentials wrinkle: by default `EventSource` does **not** send cookies cross-origin. To include them you construct it with `new EventSource(url, { withCredentials: true })`, and then the server must return both `Access-Control-Allow-Credentials: true` and a **specific** origin (not `*`) — identical to the credentialed-fetch rule. Concretely: a notifications stream on `api.company.com` consumed by `app.company.com` needs the allow-origin header; if it relies on the session cookie, I set `withCredentials: true` and the server names the exact origin. And SSE only supports GET — you pass any parameters in the URL or via a prior authenticated request.

**Say it:** "SSE obeys the same CORS rules as fetch — the server needs `Access-Control-Allow-Origin`, and for cookies I set `withCredentials: true` on the EventSource plus `Allow-Credentials: true` and a specific origin server-side."
**Red flag:** Expecting cookies to flow cross-origin by default. They don't — say `withCredentials: true` plus a named origin; `*` with credentials is rejected just like with fetch.

### Threats and cryptography
**They ask:** "Name some threat categories, explain JSON hijacking, and contrast symmetric and asymmetric cryptography."

Threat modeling matters because you can't defend what you haven't named. Key categories: **defacement** (altering public content), **infiltration** (unauthorized access to internal systems), **phishing** (tricking users into giving credentials) and **pharming** (redirecting them to a fake site via DNS/hosts tampering), **DoS** (overwhelming a service), and **session-management attacks** (session fixation/hijacking — stealing or forcing a session id). **JSON hijacking** was an older attack where a malicious page could read a JSON array response returned to a `GET` via a `<script>` tag; defenses are not returning bare arrays for sensitive data, requiring POST, and anti-CSRF tokens.

**Cryptography**: **symmetric** uses one shared secret key for both encrypt and decrypt — fast, but both sides must already share the key (AES). **Asymmetric** uses a key pair — public key encrypts, private key decrypts (or private signs, public verifies) — which solves key exchange but is slower (RSA, ECC). Real systems combine them: TLS uses asymmetric crypto to exchange a symmetric session key, then symmetric for the bulk data because it's fast.

**Say it:** "Symmetric crypto shares one fast secret key; asymmetric uses a public/private pair to solve key exchange but is slower — so TLS uses asymmetric to exchange a symmetric session key, then symmetric for speed."
**Red flag:** Treating phishing and pharming as the same. Phishing tricks the user; pharming poisons DNS to redirect them without their action — say the distinction, and note TLS mixes both crypto types rather than picking one.

### Code review and software metrics
**They ask:** "What's your approach to code review, and which software metrics do you actually use?"

The reframe that makes reviews work: the goal is **helping the author ship good code**, not policing — partnership over gatekeeping — because a review that reads as an attack gets defensiveness, not better code. I acknowledge what's solid first, tie each suggestion to a benefit (readability, a bug avoided), and separate blocking issues from nits.

Mechanically it's the **pull request** flow — small, focused PRs are reviewable; giant ones get rubber-stamped — with tooling (GitHub, GitLab, or dedicated tools like Crucible/Upsource) for inline comments. **Metrics** give objective signals but none is the whole story: **SLOC** (size, weak signal), **code coverage** (what tests exercise — high coverage of trivial code still isn't quality), **cohesion** (how focused a module is — want high), **coupling** (how entangled modules are — want low), and **cyclomatic complexity** (number of independent paths — high means hard to test and a refactor candidate). Concretely: a function with cyclomatic complexity of 15 is my flag to suggest splitting it, and low coverage on a critical path is a blocking comment.

**Say it:** "I review to help the author ship, not to police — I lead with what's good, tie feedback to a benefit, and use metrics like cyclomatic complexity and coupling as signals to start a conversation, never as the verdict."
**Red flag:** Chasing 100% coverage or treating metrics as goals. Say metrics are signals, not targets — gaming coverage or SLOC produces worse code; the review conversation is what matters.

### Reactive programming challenges
**They ask:** "What are the hard parts of implementing reactive programming in practice?"

The honest answer is that reactive's power — implicit propagation through streams — is also its main hazard, so the challenges are mostly about **observability and lifecycle**. First, **debugging**: a value flows through a chain of operators, so a bug's stack trace points at the pipeline plumbing, not the logical origin — you lean on tap/log operators and marble diagrams to see where a stream went wrong.

Second, **subscription lifecycle and memory leaks**: every subscription must be cleaned up or it holds references and keeps firing after a component unmounts — the classic reactive leak. Third, **backpressure**: when a producer emits faster than the consumer handles (rapid scroll or socket events), you need `debounce`, `throttle`, `buffer`, or sampling or you drown the UI. Fourth, the **learning curve** — thinking in streams and choosing between `mergeMap`/`switchMap`/`concatMap` (do they cancel? queue? run parallel?) is genuinely hard, and the wrong operator causes race conditions. Concretely: a search-as-you-type needs `switchMap` so a stale request is cancelled when a new keystroke arrives — `mergeMap` there causes out-of-order results.

**Say it:** "The hard parts are lifecycle and observability — leaked subscriptions, debugging across operator chains, backpressure when producers outrun consumers, and picking the right flattening operator, since `switchMap` vs `mergeMap` is the difference between cancelling stale work and a race condition."
**Red flag:** Ignoring subscription cleanup or defaulting to `mergeMap` everywhere. Say you manage teardown and choose the flattening operator deliberately — that's where the subtle bugs live.

### CI/CD pipelines and release automation
**They ask:** "How do you build and maintain a real CI/CD pipeline beyond just running tests?"

A pipeline exists to make releases **boring and repeatable** — the more of the build-test-deploy path is scripted, the less a release depends on one person remembering the steps at 5pm on a Friday. I write and maintain the pipeline scripts as code (on Jenkins, GitHub Actions, TeamCity, Travis, etc.) so the process is versioned and reviewable like any other code.

A mature **multiphase** pipeline: **build** the artifact, **test** (unit → integration → e2e as gates that fail the pipeline), package/build the installer, then **deploy** to a staging or release area — integrated with **source control** so it triggers on push and handles **versioning and tagging** releases. I add **scheduled/nightly builds** for slow full-suite runs, **build monitoring and status notifications** (Slack on red), and automate **release notes** generated from commit/PR history. Concretely in this repo's world: a tagged `v*` push runs the release workflow — build, gate on tests, tag, and queue the deploy — so cutting a release is one command, not a checklist.

**Say it:** "I treat the pipeline as versioned code with staged gates — build, test, package, tag, deploy — plus nightly full runs, red-build notifications, and auto-generated release notes, so a release is one trigger instead of a manual checklist."
**Red flag:** A pipeline that only runs tests. Say a mature one also tags, versions, deploys, and reports status — automating the whole path is what removes human error from releases.

### Architecture and design patterns
**They ask:** "Cover the GoF pattern groups, the main macro-architecture patterns, and where UML fits."

Architecture is about choosing structure that absorbs change cheaply — patterns matter because they're a shared vocabulary for proven solutions, so a team can say "use a factory here" instead of re-deriving it. The **GoF** patterns fall in three groups: **creational** (how objects are made — Factory, Singleton, Builder), **structural** (how they're composed — Adapter, Decorator, Facade, Composite), and **behavioral** (how they interact — Observer, Strategy, Command, Iterator). The trap is over-applying them; a pattern is a tool for a real problem, not a badge.

**Macro-architecture**: presentation patterns **MVC/MVP/MVVM** separate UI from logic (MVVM's data-binding is React/Vue's mental model); **Layered** stacks presentation/business/data; **IoC/Dependency Injection** inverts who wires dependencies; and system-scale styles — **SOA**, **Microservices** (independently deployable services), **EDA** (event-driven), **Event Sourcing** (store events, derive state), **DDD** (model around the domain). I also weigh **backward/forward compatibility** — versioning APIs so old clients don't break. **UML** communicates design: **use case** diagrams for actor goals, **class** diagrams for structure, **ER** diagrams for data relationships, **data-flow** diagrams for how data moves.

**Say it:** "GoF splits into creational, structural, and behavioral; macro-patterns range from MVVM at the UI to microservices and event sourcing at the system level — and I pick the pattern for a real problem, never apply one for its own sake."
**Red flag:** Applying patterns everywhere to look sophisticated. Say patterns solve specific problems — a Singleton or a microservice split with no need is over-engineering, and senior judgment is knowing when *not* to use one.
