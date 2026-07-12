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
