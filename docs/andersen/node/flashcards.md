# Flashcards — Node.js (Andersen matrix)

Every matrix row as an interviewer question. Filter by level and category in the deck.

## Event Loop

### Event Loop

- Walk through the phases of the Node event loop. — [answer](event-loop.md#the-six-phases-of-the-event-loop)
- Where do process.nextTick and Promise microtasks run relative to timers and I/O callbacks? — [answer](event-loop.md#processnexttick-and-microtasks-vs-macrotasks)
- How can process.nextTick starve the event loop, and why is that dangerous? — [answer](event-loop.md#starving-the-event-loop)
- Which Node APIs actually use the libuv thread pool, and which don't? — [answer](event-loop.md#what-runs-on-the-libuv-thread-pool)
- How do you resize the thread pool, and when would you need to? — [answer](event-loop.md#sizing-the-thread-pool)
- What symptoms show up when the thread pool is exhausted, and how do you diagnose it? — [answer](event-loop.md#diagnosing-thread-pool-exhaustion)
- How does libuv abstract OS-level I/O notification (epoll, kqueue, IOCP) into one event loop? — [answer](event-loop.md#epoll-kqueue-and-iocp)
- Why can a single Node process handle thousands of concurrent connections without a thread per connection? — [answer](event-loop.md#why-one-thread-can-handle-thousands-of-connections)
- How does Node's single-threaded event loop model compare to Apache's thread-per-request model, and what's the trade-off? — [answer](event-loop.md#comparing-nodes-model-to-a-traditional-thread-per-request-server)

## Frameworks

### Frameworks

- How does Express's middleware chain work, and what does calling next() actually do? — [answer](frameworks.md#express-middleware-pipeline)
- How do you write error-handling middleware in Express, and what makes it different from regular middleware? — [answer](frameworks.md#express-error-handling-middleware)
- How does Express match a route, and how do route-level vs app-level middleware differ? — [answer](frameworks.md#express-routing-internals)
- What is NestJS's core architecture, and why did it choose Angular-style DI over Express's minimalism? — [answer](frameworks.md#nestjss-architecture)
- Walk through how a Nest module wires providers and controllers together via DI. — [answer](frameworks.md#providers-modules-and-di-in-nest)
- What are guards, interceptors, and pipes in Nest, and where does each run in the request lifecycle? — [answer](frameworks.md#guards-interceptors-and-pipes-in-nest)
- What does LoopBack add on top of Express, and when is that worth the extra structure? — [answer](frameworks.md#what-loopback-adds-over-hand-rolled-express)
- How does LoopBack generate REST APIs from a data model? — [answer](frameworks.md#loopbacks-model-driven-rest-generation)
- How does Hapi's route configuration differ from Express's middleware chain? — [answer](frameworks.md#hapis-configuration-over-code-philosophy)
- What are Hapi plugins for, and how do they compare to Express middleware? — [answer](frameworks.md#hapi-plugins)
- What does Socket.io give you over the raw ws WebSocket API? — [answer](frameworks.md#socketio-vs-raw-websockets)
- How do rooms and namespaces let you scope broadcasts in Socket.io? — [answer](frameworks.md#rooms-and-namespaces-in-socketio)
- How do you scale Socket.io across multiple Node processes or servers? — [answer](frameworks.md#scaling-socketio-across-processes)
- How does Koa's middleware model differ from Express's, and why does that matter for error handling? — [answer](frameworks.md#koa-vs-express-middleware-model)
- What is Koa's ctx object, and how does async/await middleware composition actually work? — [answer](frameworks.md#koas-context-object-and-async-composition)
- What does helmet actually protect against, and what doesn't it cover? — [answer](frameworks.md#common-express-security-middleware)
- How would you add rate limiting to an Express or Nest API, and what attack does it mitigate? — [answer](frameworks.md#rate-limiting-and-dos-protection)
- How do you write an integration test for an Express or Nest endpoint without hitting a real database? — [answer](frameworks.md#testing-an-express-or-nest-endpoint)
- How do you test code that uses setTimeout or fs without slowing down your test suite? — [answer](frameworks.md#mocking-timers-and-io-in-node-tests)

## Node.js Core

### Node.js Core

- Why is Node's I/O non-blocking by default, and what does that actually save you? — [answer](nodejs-core.md#blocking-vs-non-blocking-io)
- Walk through what happens when you call fs.readFile — where does control go while the disk read happens? — [answer](nodejs-core.md#what-actually-happens-on-an-async-io-call)
- What kinds of code accidentally block the event loop even in an 'async' Node app? — [answer](nodejs-core.md#where-blocking-code-sneaks-into-an-async-app)
- What is the error-first callback convention and why did Node standardize on it? — [answer](nodejs-core.md#the-error-first-callback-convention)
- What is 'callback hell' and how did the ecosystem move past it? — [answer](nodejs-core.md#callback-hell-and-its-fixes)
- What are fibers/coroutines, and why doesn't Node use them the way Ruby or Go do? — [answer](nodejs-core.md#fibers-and-coroutines-in-node)
- How does async/await give you coroutine-like code without real OS-level coroutines? — [answer](nodejs-core.md#asyncawait-as-syntactic-coroutines)
- What's the difference between module.exports and exports, and how do people break their module by reassigning exports? — [answer](nodejs-core.md#moduleexports-vs-exports)
- What globals does Node inject into every module that don't exist in the browser? — [answer](nodejs-core.md#nodes-global-objects)
- Walk me through package.json — dependencies vs devDependencies vs peerDependencies, and what ^1.2.3 actually allows. — [answer](nodejs-core.md#packagejson-and-semver-ranges)
- Why do we commit package-lock.json, and what problem does it solve that semver ranges alone don't? — [answer](nodejs-core.md#why-commit-package-lockjson)
- How does require() find and cache a module? — [answer](nodejs-core.md#commonjs-module-resolution-and-caching)
- What are the real differences between CommonJS and native ES modules in Node, and where do they clash? — [answer](nodejs-core.md#commonjs-vs-es-modules)
- What happens when two CommonJS modules require each other? — [answer](nodejs-core.md#circular-dependencies-in-commonjs)

## Streams

### Streams

- Node has four kinds of streams — Readable, Writable, Duplex, Transform — what's each for? — [answer](streams.md#the-four-stream-types)
- What is backpressure in streams, and what happens if you ignore it? — [answer](streams.md#backpressure)
- Why does the Node docs recommend stream.pipeline() over manual .pipe() chains? — [answer](streams.md#pipe-vs-pipeline)
- What is object mode in streams, and when would you use it? — [answer](streams.md#object-mode-streams)
- How would you gzip a file being streamed to an HTTP response without loading it into memory? — [answer](streams.md#piping-streams-to-compresstransform-on-the-fly)
- How would you implement a custom Transform stream, and what do you have to get right? — [answer](streams.md#implementing-a-custom-transform-stream)

## JavaScript (ES5)

### Fundamentals

- What's the real difference between `var`, `let`, and `const`? — [answer](javascript-fundamentals.md#var-let-and-const) {J1, J2, J3, M1, M2, M3, S1, S2}
- Explain hoisting — what actually gets hoisted? — [answer](javascript-fundamentals.md#hoisting) {J1, J2, J3, M1, M2, M3, S1, S2}
- What is a closure, and give a practical use for one. — [answer](javascript-fundamentals.md#closures) {J1, J2, J3, M1, M2, M3, S1, S2}
- How is `this` determined in JavaScript? — [answer](javascript-fundamentals.md#this-binding-rules) {J1, J2, J3, M1, M2, M3, S1, S2}
- What's the difference between `call`, `apply`, and `bind`? — [answer](javascript-fundamentals.md#call-apply-and-bind) {J1, J2, J3, M1, M2, M3, S1, S2}
- What are the ways to create objects in JS, and when do you reach for each? — [answer](javascript-fundamentals.md#object-creation-patterns) {J1, J2, J3, M1, M2, M3, S1, S2}
- What do `Object.freeze`, `Object.seal`, and `Object.assign` actually guarantee? — [answer](javascript-fundamentals.md#objectfreeze-seal-and-assign) {J1, J2, J3, M1, M2, M3, S1, S2}
- How do you clone an object in JS, and what's the shallow-vs-deep trap? — [answer](javascript-fundamentals.md#shallow-vs-deep-clone) {J1, J2, J3, M1, M2, M3, S1, S2}
- How does garbage collection work in Node/V8, at a level a senior should know? — [answer](javascript-fundamentals.md#garbage-collection-in-v8) {J1, J2, J3, M1, M2, M3, S1, S2}
- What are the classic ways a long-running Node process leaks memory? — [answer](javascript-fundamentals.md#common-memory-leak-patterns) {J1, J2, J3, M1, M2, M3, S1, S2}
- What's the practical difference between primitive and reference types in JS? — [answer](javascript-fundamentals.md#primitive-vs-reference-types) {J1, J2, J3, M1, M2, M3, S1, S2}
- Explain type coercion, and why prefer `===` over `==`? — [answer](javascript-fundamentals.md#type-coercion-and-strict-equality) {J1, J2, J3, M1, M2, M3}
- What are the common gotchas with JavaScript's `Date`? — [answer](javascript-fundamentals.md#date-pitfalls) {J1, J2, J3, M1, M2, M3, S1, S2}
- What does `JSON.stringify` silently drop or change? — [answer](javascript-fundamentals.md#jsonstringify-and-jsonparse-edge-cases) {J1, J2, J3, M1, M2, M3, S1, S2}
- What is a higher-order function, and why do `map`/`filter`/`reduce` matter? — [answer](javascript-fundamentals.md#higher-order-functions) {J1, J2, J3, M1, M2, M3, S1, S2}
- What is an execution context, and how does the call stack relate to it? — [answer](javascript-fundamentals.md#execution-context-and-the-call-stack) {J1, J2, J3, M1, M2, M3, S1, S2}
- What is the scope chain, and how does JS resolve a variable lookup? — [answer](javascript-fundamentals.md#scope-chain-and-lexical-scoping) {J1, J2, J3, M1, M2, M3, S1, S2}
- How does property lookup work through the prototype chain? — [answer](javascript-fundamentals.md#the-prototype-chain) {J1, J2, J3, M1, M2, M3, S1, S2}
- How is JS's prototypal inheritance different from classical (class-based) inheritance, and what is `class` actually doing? — [answer](javascript-fundamentals.md#prototypal-vs-classical-inheritance) {J1, J2, J3, M1, M2, M3, S1, S2}
- Walk through the regex methods you actually use, and their differences. — [answer](javascript-fundamentals.md#regular-expressions-in-practice) {J1, J2, J3, M1, M2, M3, S1, S2}
- What is catastrophic backtracking in regex, and why is it a security concern (ReDoS)? — [answer](javascript-fundamentals.md#catastrophic-backtracking) {J1, J2, J3, M1, M2, M3, S1, S2}
- What are the precise semantics of try/catch/finally, especially with return values? — [answer](javascript-fundamentals.md#trycatchfinally-semantics) {J2, J3, M1, M2, M3, S1, S2}
- Why and how do you create custom Error subclasses? — [answer](javascript-fundamentals.md#custom-error-subclasses) {J2, J3, M1, M2, M3, S1, S2}

## JavaScript (ES6+)

### Modern syntax and modules

- How do destructuring and default parameters simplify function signatures? — [answer](javascript-modern.md#destructuring-and-default-parameters) {J1, J2, J3, M1, M2, M3, S1, S2}
- What's the difference between spread and rest, even though they use the same `...` syntax? — [answer](javascript-modern.md#spread-and-rest-operators) {J1, J2, J3, M1, M2, M3, S1, S2}
- Beyond string interpolation, what are template literals actually good for? — [answer](javascript-modern.md#template-literals-and-tagged-templates) {J1, J2, J3, M1, M2, M3, S1, S2}
- What problem do `?.` and `??` solve, and how are they different from `&&` and `||`? — [answer](javascript-modern.md#optional-chaining-and-nullish-coalescing) {J1, J2, J3, M1, M2, M3, S1, S2}
- When do you use named exports vs a default export, and what's the trade-off? — [answer](javascript-modern.md#named-vs-default-exports) {J1, J2, J3, M1, M2, M3, S1, S2}
- Why does tree-shaking need ES modules specifically, and not CommonJS? — [answer](javascript-modern.md#tree-shaking-and-es-modules) {J1, J2, J3, M1, M2, M3, S1, S2}
- What do class fields and `#private` fields add over the old constructor-assignment pattern? — [answer](javascript-modern.md#class-fields-and-private-fields) {J1, J2, J3, M1, M2, M3, S1, S2}
- What are static members for, and when do you reach for them over instance methods? — [answer](javascript-modern.md#static-methods-and-properties) {J1, J2, J3, M1, M2, M3, S1, S2}
- What do `get`/`set` accessors buy you over a plain property? — [answer](javascript-modern.md#getters-and-setters) {J1, J2, J3, M1, M2, M3, S1, S2}
- What does `fetch` give you over the old `XMLHttpRequest`, and what does it *not* handle automatically that people assume it does? — [answer](javascript-modern.md#the-fetch-api) {J1, J2, J3, M1, M2, M3, S1, S2}
- How do you cancel an in-flight `fetch`, and why does that matter? — [answer](javascript-modern.md#abortcontroller-and-cancelling-fetch) {J1, J2, J3, M1, M2, M3, S1, S2}

### Promises and async/await

- Walk through `Promise.all`, `.race`, `.allSettled`, and `.any` — when does each fit? — [answer](javascript-modern.md#promise-combinators-all-race-allsettled-any) {J3, M1, M2, M3, S1, S2}
- What are the common mistakes in `.then` chains? — [answer](javascript-modern.md#promise-chaining-pitfalls) {J3, M1, M2, M3, S1, S2}
- How should you structure error handling around async/await? — [answer](javascript-modern.md#error-handling-in-asyncawait) {J3, M1, M2, M3, S1, S2}
- When should independent async calls run in parallel instead of sequentially, and how do you write that? — [answer](javascript-modern.md#sequential-vs-parallel-awaits) {J3, M1, M2, M3, S1, S2}

### Data types: Map, Set, Symbol, WeakMap

- When do you reach for `Map` instead of a plain object? — [answer](javascript-modern.md#map-vs-plain-object) {M1, M2, M3, S1, S2}
- What is `Set` for, and what's a practical use beyond 'unique array'? — [answer](javascript-modern.md#set-and-its-use-cases) {M1, M2, M3, S1, S2}
- What is `Symbol` for, and where do you actually see it used? — [answer](javascript-modern.md#symbol) {M1, M2, M3, S1, S2}
- What problem do `WeakMap`/`WeakRef` solve that a regular `Map` doesn't? — [answer](javascript-modern.md#weakmap-and-weakref) {M1, M2, M3, S1, S2}

### Generators and iterators

- What is a generator function, and what makes it different from a regular function? — [answer](javascript-modern.md#generator-functions) {M2, M3, S1, S2}
- What is the iterator protocol, and how does `for...of` rely on it? — [answer](javascript-modern.md#the-iterator-protocol) {M2, M3, S1, S2}
- What is an async generator, and when do you reach for it? — [answer](javascript-modern.md#async-generators-and-for-await-of) {M2, M3, S1, S2}

## Node.js API

### HTTP, timers, filesystem, and events

- What happens under Express/Nest — walk through the raw `http` module. — [answer](nodejs-api.md#httpcreateserver-and-the-raw-http-api) {J3, M1, M2, M3, S1}
- Why shouldn't you always buffer the whole request body before processing it? — [answer](nodejs-api.md#streaming-request-and-response-bodies) {J3, M1, M2, M3, S1}
- What is HTTP keep-alive, and why does it matter for a Node server under load? — [answer](nodejs-api.md#keep-alive-and-connection-reuse) {J3, M1, M2, M3, S1}
- How do `setTimeout`, `setInterval`, and `setImmediate` order relative to each other? — [answer](nodejs-api.md#settimeout-setinterval-and-setimmediate-ordering) {J3, M1, M2, M3, S1}
- What does `timer.unref()` do, and why would a Node process need it? — [answer](nodejs-api.md#unref-and-ref-on-timers) {J3, M1, M2, M3, S1}
- Node's `fs` module has three API styles — when do you use each? — [answer](nodejs-api.md#fs-sync-vs-callback-vs-promises-api) {J3, M1, M2, M3, S1}
- How does `fs.watch` work, and what are its portability gotchas? — [answer](nodejs-api.md#watching-the-filesystem) {J3, M1, M2, M3, S1}
- What is `EventEmitter`, and how does it relate to Node's whole async model? — [answer](nodejs-api.md#eventemitter-basics) {J3, M1, M2, M3, S1}
- What is the `MaxListenersExceededWarning`, and what does it actually indicate? — [answer](nodejs-api.md#max-listeners-and-memory-leak-warnings) {J3, M1, M2, M3, S1}
- How and why would you extend `EventEmitter` for your own class? — [answer](nodejs-api.md#extending-eventemitter) {J3, M1, M2, M3, S1}

### Process and child processes

- What are the pitfalls of `process.env` for configuration? — [answer](nodejs-api.md#processenv-and-configuration) {J3, M1, M2, M3, S1}
- How do you parse CLI arguments and communicate success/failure from a Node script? — [answer](nodejs-api.md#processargv-and-exit-codes) {J3, M1, M2, M3, S1}
- What are `uncaughtException` and `unhandledRejection`, and what should a Node process do when it hits one? — [answer](nodejs-api.md#uncaughtexception-and-unhandledrejection) {J3, M1, M2, M3, S1}
- What are the differences between `spawn`, `exec`, and `fork` in `child_process`? — [answer](nodejs-api.md#spawn-exec-and-fork) {J3, M1, M2, M3, S1}
- How does a parent process communicate with a child created via `fork`? — [answer](nodejs-api.md#ipc-between-parent-and-child-processes) {J3, M1, M2, M3, S1}
- What's the distinction between operational and programmer errors, and why does it change how you handle them? — [answer](nodejs-api.md#operational-vs-programmer-errors) {J3, M1, M2, M3, S1}

### Cluster and worker threads

- How does the `cluster` module let a single-threaded Node process use multiple CPU cores? — [answer](nodejs-api.md#the-cluster-module) {J3, M1, M2, M3, S1}
- When do you reach for `worker_threads` instead of `cluster`? — [answer](nodejs-api.md#worker_threads-vs-cluster) {J3, M1, M2, M3, S1}

### Native modules and Buffer

- What are native addons for, and what does N-API solve that older addon APIs didn't? — [answer](nodejs-api.md#n-api-and-c-addons) {M1, M2, M3, S1, S2}
- Beyond raw performance, what's the actual decision framework for writing a native addon? — [answer](nodejs-api.md#when-to-reach-for-a-native-addon) {M1, M2, M3, S1, S2}
- What is `Buffer`, and why does Node need a separate binary type when JS has strings? — [answer](nodejs-api.md#buffer-and-binary-data) {J3, M1, M2, M3, S1, S2}
- How does `Buffer` relate to JS's standard `TypedArray`/`ArrayBuffer`? — [answer](nodejs-api.md#buffer-vs-typedarray) {J3, M1, M2, M3, S1, S2}
- How do you shut a Node server down cleanly instead of dropping in-flight requests? — [answer](nodejs-api.md#graceful-shutdown-and-process-signals) {M1, M2, M3, S1, S2}

## Databases

### SQL schema design

- What data type choices actually matter for a schema, and where do people get them wrong? — [answer](databases.md#sql-data-types) {J1, J2, J3, M1, M2, M3, S1, S2}
- Explain normalization — what problem does it solve, and when do you deliberately break it? — [answer](databases.md#normalization) {J1, J2, J3, M1, M2, M3, S1, S2}
- Walk through primary, foreign, and composite keys and how they enforce data integrity. — [answer](databases.md#primary-foreign-and-composite-keys) {J1, J2, J3, M1, M2, M3, S1, S2}
- How do you decide what to index, and what's the cost of over-indexing? — [answer](databases.md#indexing-strategy) {J1, J2, J3, M1, M2, M3, S1, S2}
- Explain INNER, LEFT, and how the query planner actually executes a join. — [answer](databases.md#join-strategies) {J1, J2, J3, M1, M2, M3, S1, S2}
- Why push validation into database constraints instead of only application code? — [answer](databases.md#constraints-not-null-unique-check-fk) {J1, J2, J3, M1, M2, M3, S1, S2}
- What are `ON DELETE CASCADE`/`SET NULL`/`RESTRICT`, and how do you choose between them? — [answer](databases.md#cascade-behavior-on-deleteupdate) {J1, J2, J3, M1, M2, M3, S1, S2}
- Model the three relationship types and how each is represented in SQL. — [answer](databases.md#one-to-one-one-to-many-many-to-many-relationships) {J1, J2, J3, M1, M2, M3}

### Migrations

- How do schema migrations work, and what makes a migration workflow safe in a team? — [answer](databases.md#migration-tools-and-workflow) {J1, J2, J3, M1, M2, M3, S1, S2}
- What makes a migration's rollback actually safe to run in production? — [answer](databases.md#writing-a-safe-rollback-migration) {J1, J2, J3, M1, M2, M3, S1, S2}

### NoSQL

- Walk through the major NoSQL database families and what each is actually good at. — [answer](databases.md#document-vs-key-value-vs-column-vs-graph-databases) {J1, J2, J3, M1, M2, M3, S1, S2}
- Give a real decision framework for SQL vs NoSQL, not just buzzwords. — [answer](databases.md#when-to-reach-for-nosql-over-sql) {J1, J2, J3, M1, M2, M3, S1, S2}
- How does schema design in MongoDB differ from relational normalization — embed or reference? — [answer](databases.md#mongodb-schema-design) {J1, J2, J3, M1, M2, M3, S1, S2}

### Database common operations

- How do you choose between an ORM, a query builder, and raw SQL? — [answer](databases.md#orm-vs-query-builder-vs-raw-sql) {J1, J2, J3, M1, M2, M3, S1, S2}
- What is the N+1 query problem, and how do you fix it? — [answer](databases.md#the-n1-query-problem) {J1, J2, J3, M1, M2, M3, S1, S2}

### Database deployment

- Why does a Node app need a connection pool instead of opening a connection per request? — [answer](databases.md#connection-pooling) {J3, M1, M2, M3, S1, S2}
- How do read replicas scale reads, and what problem does replication lag cause? — [answer](databases.md#read-replicas-and-replication-lag) {J3, M1, M2, M3, S1, S2}

### Triggers and transactions

- What are database triggers for, and what's the trade-off of using them? — [answer](databases.md#sql-triggers) {M1, M2, M3, S1, S2}
- Explain ACID and why transactions matter for multi-step writes. — [answer](databases.md#transactions-and-acid) {M1, M2, M3, S1, S2}
- What are the SQL isolation levels, and what anomaly does each one prevent? — [answer](databases.md#transaction-isolation-levels) {M1, M2, M3, S1, S2}
- What causes a database deadlock, and how do you prevent one? — [answer](databases.md#deadlocks) {M1, M2, M3, S1, S2}

## TypeScript

### Types, interfaces, and functions

- What's the difference between a union and an intersection type, and how do you narrow a union? — [answer](typescript.md#union-and-intersection-types) {J1, J2, J3, M1, M2, M3, S1, S2}
- Beyond a basic `typeof` check, what are the ways TypeScript narrows types? — [answer](typescript.md#type-narrowing) {J1, J2, J3, M1, M2, M3, S1, S2}
- When do you reach for `interface` vs `type`, and does it actually matter? — [answer](typescript.md#interface-vs-type-alias) {J1, J2, J3, M1, M2, M3, S1, S2}
- How does interface extension differ from declaration merging, and where do you use each? — [answer](typescript.md#extending-and-merging-interfaces) {J1, J2, J3, M1, M2, M3, S1, S2}
- What are function overloads for, and how do they differ from a union-typed parameter? — [answer](typescript.md#function-overloads) {J1, J2, J3, M1, M2, M3, S1, S2}
- Write a generic function and explain what problem generics solve over `any`. — [answer](typescript.md#generics-in-functions) {J1, J2, J3, M1, M2, M3, S1, S2}

### Classes and modifiers

- How do TypeScript's `public`/`private`/`protected` differ from JS's `#private` fields, and does the distinction matter at runtime? — [answer](typescript.md#access-modifiers-public-private-protected) {J1, J2, J3, M1, M2, M3, S1, S2}
- What does `readonly` guarantee, and what are parameter properties? — [answer](typescript.md#readonly-and-parameter-properties) {J1, J2, J3, M1, M2, M3, S1, S2}

### Enums

- When do you use a TypeScript `enum` vs a union of string literals, and why do many teams avoid `enum`? — [answer](typescript.md#enums-vs-union-literal-types) {J1, J2, J3, S2}
- What does `const enum` do differently from a regular `enum`? — [answer](typescript.md#const-enum) {J1, J2, J3, S2}

### Declaration files

- What is a `.d.ts` file, and when do you write one yourself? — [answer](typescript.md#declaration-files-dts) {J1, J2, J3, M1, M2, M3, S1, S2}
- What does `declare module`/`declare global` do, and where do ambient types live? — [answer](typescript.md#declare-module-and-ambient-types) {J1, J2, J3, M1, M2, M3, S1, S2}

### Advanced types

- Walk through `Partial`, `Pick`, `Omit`, and `Record` — what does each transform, and when do you reach for it? — [answer](typescript.md#utility-types) {M1, M2, M3, S1, S2}
- Write a custom type guard and explain the `is` return type. — [answer](typescript.md#type-guards-and-discriminated-unions) {M1, M2, M3, S1, S2}
- What do `keyof` and indexed access types let you express that plain interfaces can't? — [answer](typescript.md#keyof-and-indexed-access-types) {M1, M2, M3, S1, S2}
- What are mapped types and conditional types, and where do the built-in utility types come from? — [answer](typescript.md#mapped-and-conditional-types) {M1, M2, M3, S1, S2}

## Software Engineering Practices

### Network

- What actually makes an API RESTful, beyond 'uses HTTP verbs'? — [answer](networking.md#rest-principles-and-resource-design) {J1, J2, J3, M1, M2, M3, S1, S2}
- Which HTTP methods are idempotent, and why does that matter for retries? — [answer](networking.md#idempotency-and-http-methods) {J1, J2, J3, M1, M2, M3, S1, S2}
- What problem does GraphQL solve over REST, and what does it cost you? — [answer](networking.md#graphql-vs-rest) {J1, J2, J3, M1, M2, M3, S1}
- How does the N+1 problem show up specifically in GraphQL, and how do you fix it? — [answer](networking.md#graphql-resolvers-and-the-n1-problem) {J1, J2, J3, M1, M2, M3, S1}
- What is AJAX, and how does the modern `fetch` API relate to the older `XMLHttpRequest`? — [answer](networking.md#ajax-and-xmlhttprequest-vs-fetch) {J1, J2, J3, M1, M2, M3, S1, S2}
- What problem does CORS solve, and what triggers a preflight request? — [answer](networking.md#cors-what-it-protects-and-preflight-requests) {J1, J2, J3, M1, M2, M3, S1, S2}
- What's the most common dangerous CORS misconfiguration you see in real APIs? — [answer](networking.md#cors-misconfigurations) {J1, J2, J3, M1, M2, M3, S1, S2}
- How does long polling work, and why was it used before WebSockets were widely available? — [answer](networking.md#long-polling) {J1, J2, J3, M1, M2, M3, S1}
- How does a WebSocket connection get established, and how is it different from HTTP after that? — [answer](networking.md#websocket-handshake-and-protocol) {J1, J2, J3, M1, M2, M3, S1, S2}
- For a real-time feature, how do you decide between WebSocket, polling, long polling, and SSE? — [answer](networking.md#websocket-vs-http-polling) {J1, J2, J3, M1, M2, M3, S1, S2}
- What is SSE, and what does it give you for free that a hand-rolled solution wouldn't? — [answer](networking.md#server-sent-events) {J1, J2, J3, M1, M2, M3, S1, S2}
- What actually changed between HTTP/1.1, HTTP/2, and HTTP/3, and why does it matter for a backend engineer? — [answer](networking.md#http11-vs-http2-vs-http3) {M1, M2, M3, S1, S2}
- How do you version a public API without breaking existing clients? — [answer](networking.md#api-versioning-strategies) {M1, M2, M3, S1, S2}
- How do webhooks work, and what makes an endpoint that receives them trustworthy and safe? — [answer](networking.md#webhooks) {M1, M2, M3, S1, S2}
- When would you reach for gRPC over a REST/JSON API? — [answer](networking.md#grpc-vs-rest) {M1, M2, M3, S1, S2}

### OOP

- Walk through encapsulation, abstraction, inheritance, and polymorphism with real JS/TS examples — and which ones actually earn their keep in a Node codebase. — [answer](engineering.md#oop-principles-in-jsts) {J1, J2, J3, M1, M2, M3, S1, S2}
- Why do senior engineers generally prefer composition over inheritance? — [answer](engineering.md#composition-over-inheritance) {J1, J2, J3, M1, M2, M3, S1, S2}

### Algorithms and data structures

- How do you reason about algorithmic complexity when picking a data structure in real code, not a whiteboard problem? — [answer](engineering.md#big-o-and-choosing-the-right-data-structure) {J1, J2, J3, M1, M2, M3, S1, S2}
- What algorithm patterns come up repeatedly in senior interviews, briefly? — [answer](engineering.md#common-algorithm-patterns-interviewers-probe) {J1, J2, J3, M1, M2, M3, S1, S2}

### Troubleshooting, logging, and monitoring

- Why does structured logging matter more than readable console output in production? — [answer](engineering.md#structured-logging) {J1, J2, J3, M1, M2, M3, S1, S2}
- What's the difference between logs, metrics, and traces, and why do you need all three? — [answer](engineering.md#application-monitoring-and-metrics) {J1, J2, J3, M1, M2, M3, S1, S2}
- How does distributed tracing actually work across service boundaries? — [answer](engineering.md#distributed-tracing) {J1, J2, J3, M1, M2, M3, S1, S2}

### Refactoring

- What makes a refactor 'safe,' and how do you refactor a risky piece of legacy code with no tests? — [answer](engineering.md#refactoring-safely) {J1, J2, J3, M1, M2, M3, S1, S2}
- What are the code smells you actually flag in review, beyond style nits? — [answer](engineering.md#code-smells-worth-flagging-in-review) {J1, J2, J3, M1, M2, M3, S1, S2}

### Testing processes

- How do you decide what belongs in a unit test vs an integration test vs an e2e test? — [answer](engineering.md#unit-vs-integration-vs-e2e-testing) {J1, J2, J3, M1, M2, M3, S1, S2}
- What's the precise difference between a mock, a stub, a spy, and a fake? — [answer](engineering.md#test-doubles-mocks-stubs-spies-fakes) {J1, J2, J3, M1, M2, M3, S1, S2}

### Functional programming

- What functional programming concepts show up in idiomatic JS, and why do they matter for correctness? — [answer](engineering.md#functional-programming-concepts-in-js) {J2, J3, M1, M2, M3, S1, S2}
- What is currying, and how does it enable function composition? — [answer](engineering.md#currying-and-composition) {J2, J3, M1, M2, M3, S1, S2}

### Code review and code standards

- What does a genuinely useful code review actually check, beyond 'does it work'? — [answer](engineering.md#what-to-look-for-in-code-review) {J2, J3, M1, M2, M3, S1, S2}
- How do you give critical code review feedback without it landing badly? — [answer](engineering.md#giving-code-review-feedback-well) {J2, J3, M1, M2, M3, S1, S2}

### Reactive programming

- What is reactive programming, and what does an Observable give you over a Promise? — [answer](engineering.md#reactive-programming-and-rxjs-basics) {J3, M1, M2, M3, S1, S2}
- How does backpressure in a reactive stream (RxJS) compare to backpressure in a Node stream? — [answer](engineering.md#backpressure-in-reactive-streams-vs-node-streams) {J3, M1, M2, M3, S1, S2}

### Builds and CI/CD

- Walk through the stages of a typical CI/CD pipeline and what each is guarding against. — [answer](engineering.md#cicd-pipeline-stages) {J3, M1, M2, M3, S1, S2}
- What's the difference between blue-green and canary deployments, and what risk does each manage? — [answer](engineering.md#blue-green-and-canary-deployments) {J3, M1, M2, M3, S1, S2}

### Security and cryptography

- Walk through the OWASP-style vulnerabilities you actually defend against in a Node API. — [answer](engineering.md#common-web-security-vulnerabilities) {J3, M1, M2, M3, S1, S2}
- What's the practical difference between hashing and encryption, and why does password storage need one specifically, never the other? — [answer](engineering.md#hashing-vs-encryption) {J3, M1, M2, M3, S1, S2}
- JWT vs server-side sessions — what's the actual trade-off, not just 'JWT is stateless'? — [answer](engineering.md#jwt-and-session-based-auth-trade-offs) {J3, M1, M2, M3, S1, S2}
- What's the difference between validation and sanitization, and where should each happen? — [answer](engineering.md#input-validation-and-sanitization) {J3, M1, M2, M3, S1, S2}

### Architecture and Design

- Give a real trade-off analysis for monolith vs microservices — not just 'microservices scale better.' — [answer](architecture.md#monolith-vs-microservices-trade-offs) {S1, S2}
- How do you decide where to draw a service boundary? — [answer](architecture.md#service-boundaries-and-domain-driven-design) {S1, S2}
- What does an API gateway do in a microservices architecture, and what problem does it solve for clients? — [answer](architecture.md#api-gateway-pattern) {S1, S2}
- What does event-driven architecture solve that direct service-to-service HTTP calls don't? — [answer](architecture.md#event-driven-architecture-and-message-queues) {S1, S2}
- What is CQRS, and how does event sourcing relate to it? — [answer](architecture.md#cqrs-and-event-sourcing) {S1, S2}
- What architectural properties does a service need to actually scale horizontally? — [answer](architecture.md#designing-for-horizontal-scalability) {S1, S2}
- Walk through cache-aside, write-through, and write-behind, and how you handle invalidation. — [answer](architecture.md#caching-strategies) {S1, S2}
- What is the circuit breaker pattern, and what failure mode does it prevent? — [answer](architecture.md#circuit-breaker-pattern) {S1, S2}
- How do you keep data consistent across a multi-step operation that spans several microservices, when a single ACID transaction can't span them? — [answer](architecture.md#the-saga-pattern-for-distributed-transactions) {S1, S2}
- How do you isolate tenant data in a multi-tenant SaaS system, and what's the trade-off between the approaches? — [answer](architecture.md#multi-tenancy-data-isolation-strategies) {S1, S2}

## Software Development Processes

### Bug tracking systems

- What makes a bug report actually actionable, and how do you use a tracker like Jira effectively? — [answer](process.md#bug-tracking-workflow) {J1, J2, J3, M1, M2, M3, S1, S2}
- Walk through the anatomy of a bug report you'd actually want to receive. — [answer](process.md#writing-a-good-bug-report) {J1, J2, J3, M1, M2, M3, S1, S2}

### Version Control System (Git)

- Compare trunk-based development, Git Flow, and GitHub Flow — what does each optimize for? — [answer](process.md#git-branching-strategies) {J1, J2, J3, M1, M2, M3, S1, S2}
- When do you rebase vs merge, and what's the actual risk with rebase? — [answer](process.md#git-rebase-vs-merge) {J1, J2, J3, M1, M2, M3, S1, S2}
- Walk through how you actually resolve a non-trivial merge conflict correctly, not just make the markers go away. — [answer](process.md#resolving-merge-conflicts) {J1, J2, J3, M1, M2, M3, S1, S2}

### Estimations

- How do story points and planning poker actually help estimate work, versus estimating in hours/days? — [answer](process.md#estimation-techniques) {J2, J3, M1, M2, M3, S1, S2}
- How do you communicate an estimate you're genuinely not confident in, to a stakeholder who wants a single number? — [answer](process.md#communicating-estimate-uncertainty) {J2, J3, M1, M2, M3, S1, S2}

### Development methodologies

- Precisely, how do Agile, Scrum, Kanban, and Waterfall relate to each other? — [answer](process.md#agile-vs-scrum-vs-kanban-vs-waterfall) {J2, J3, M1, M2, M3, S1, S2}
- What is each Scrum ceremony actually for, and how do they go wrong in practice? — [answer](process.md#standups-and-sprint-ceremonies) {J2, J3, M1, M2, M3, S1, S2}

### Process Planning (SDLC)

- Walk through the phases of the SDLC, and where does testing actually belong? — [answer](process.md#sdlc-phases) {J3, M1, M2, M3, S1, S2}
- How do you handle a requirement changing mid-development without it derailing the timeline? — [answer](process.md#requirements-gathering-and-change-management) {J3, M1, M2, M3, S1, S2}

### Team practices

- What belongs in a team's Definition of Done, and why does it matter beyond 'the code works'? — [answer](process.md#definition-of-done) {M1, M2, M3, S1, S2}
- How do you track and prioritize technical debt so it doesn't just accumulate silently? — [answer](process.md#technical-debt-tracking) {M1, M2, M3, S1, S2}

