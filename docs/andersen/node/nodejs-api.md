# Node.js core API

### http.createServer and the raw HTTP API
**They ask:** "What happens under Express/Nest — walk through the raw `http` module."

Every framework in the Node ecosystem sits on top of `http.createServer`, which takes a callback invoked once per incoming request with `(req, res)` — `req` is a *readable stream* of the request body, `res` is a *writable stream* for the response. Knowing this layer matters because it's what explains framework internals: Express's `req`/`res` are the same objects with extra methods bolted on via prototype augmentation, not new objects.

```js
const server = require('http').createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: true }));
});
server.listen(3000);
```

**Say it:** "`http.createServer`'s callback gives you `req` as a readable stream and `res` as a writable stream — every framework's request/response objects are extensions of exactly these, not a different abstraction."
**Red flag:** Believing Express reimplements HTTP handling from scratch. It wraps the same core `http` module and layers routing/middleware on top.

### Streaming request and response bodies
**They ask:** "Why shouldn't you always buffer the whole request body before processing it?"

`req` is a stream, so `req.on('data', ...)` fires per chunk as bytes arrive off the socket — buffering everything into one string/Buffer before acting on it (`body-parser`-style) is fine for small JSON payloads but wastes memory and adds latency for large uploads, where you could start processing (or piping to disk/S3) as chunks arrive instead of waiting for the whole thing.

```js
req.pipe(fs.createWriteStream('./upload.bin')); // streams straight to disk, no full buffering
```

The same logic applies to `res` — writing/`res.write()`ing a large response incrementally lets the client start receiving data before the server has finished generating all of it.

**Say it:** "`req`/`res` are streams, so for large payloads I pipe instead of buffering the whole thing in memory first — that's the difference between constant memory usage and memory proportional to payload size."
**Red flag:** Buffering an entire large file upload into a `Buffer` in memory before writing it to disk. It works until concurrent large uploads exhaust memory; streaming to disk avoids the ceiling entirely.

### Keep-alive and connection reuse
**They ask:** "What is HTTP keep-alive, and why does it matter for a Node server under load?"

Without keep-alive, every request opens a fresh TCP connection (and TLS handshake for HTTPS), which is expensive — keep-alive reuses one TCP connection across multiple sequential requests, avoiding that setup cost per request. Node's `http.Agent` manages a connection pool for *outgoing* requests (important when your server calls other services) with a `maxSockets` limit; on the server side, `server.keepAliveTimeout` controls how long an idle connection is held open waiting for the next request before closing. One trap: Node's built-in `fetch` (Undici under the hood) silently **ignores** an `agent` option — that's a leftover `http.request`-ism, not part of the Fetch spec. To pool connections with `fetch`, configure an Undici `Agent` as the global dispatcher instead; `http.request`/`http.get` still take `agent` directly.

```js
// http.request / http.get: agent works directly
const agent = new http.Agent({ keepAlive: true, maxSockets: 50 });
http.get(url, { agent }, (res) => { /* ... */ });

// fetch: agent is ignored — pool via a global Undici dispatcher instead
const { Agent, setGlobalDispatcher } = require('undici');
setGlobalDispatcher(new Agent({ keepAliveTimeout: 10_000, connections: 50 }));
fetch(url); // now uses the pooled dispatcher
```

**Say it:** "Keep-alive reuses a TCP connection instead of paying handshake cost per request — for outbound calls I pool via `http.Agent` when I'm on `http.request`/`http.get`, or an Undici `Agent` set as the global dispatcher when I'm on `fetch`, since `fetch(url, { agent })` is silently ignored. On the server side, `keepAliveTimeout` needs to exceed any load balancer's idle timeout or you get intermittent connection-reset errors."
**Red flag:** Passing `{ agent }` to `fetch()` expecting it to pool connections. Node's `fetch` silently ignores that option — no error, just no pooling — so it's a bug that only shows up as unexplained connection churn under load, not a crash. Also: not setting `keepAliveTimeout` above the load balancer's idle timeout. If the server closes idle connections first, the LB can still route a new request onto a connection the server just closed, causing sporadic `ECONNRESET`.

### setTimeout, setInterval, and setImmediate ordering
**They ask:** "How do `setTimeout`, `setInterval`, and `setImmediate` order relative to each other?"

`setTimeout(fn, 0)` and `setImmediate(fn)` both queue a macrotask for "as soon as possible," but they run in *different event loop phases* — `setTimeout` fires in the timers phase, `setImmediate` fires in the check phase, which runs after I/O callbacks. Inside a plain synchronous script at the top level, their relative order is actually non-deterministic (depends on process startup timing), but **inside an I/O callback**, `setImmediate` is always guaranteed to run before any `setTimeout(fn, 0)`, because the check phase directly follows the poll/I/O phase in that same loop iteration. `setInterval` is `setTimeout` that reschedules itself — same phase, repeating.

```js
fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate')); // always logs first here
});
```

**Say it:** "Inside an I/O callback, `setImmediate` always beats `setTimeout(fn, 0)` because the check phase runs right after poll — outside I/O, at the top level, their order isn't guaranteed, which is exactly why the docs only make that ordering promise inside I/O callbacks."
**Red flag:** Asserting `setImmediate` always fires before `setTimeout(fn, 0)` in every context. That guarantee only holds inside an I/O callback — at the top level it's unspecified.

### unref and ref on timers
**They ask:** "What does `timer.unref()` do, and why would a Node process need it?"

By default, a pending timer keeps the event loop alive — the process won't exit while a `setInterval`/`setTimeout` is still scheduled, even if there's nothing else to do. `.unref()` marks a timer as "don't count toward keeping the process alive": if it's the only thing left in the loop, the process exits anyway, ignoring the timer. This is exactly what you want for background housekeeping (a periodic cache-flush, a metrics heartbeat) that shouldn't itself block a clean shutdown. `.ref()` reverses it.

```js
const heartbeat = setInterval(sendMetrics, 5000);
heartbeat.unref(); // process can still exit cleanly even with this running
```

**Say it:** "`unref()` tells the loop 'don't wait on me' — I use it on background timers like metrics heartbeats so they don't prevent a clean process exit when everything else is done."
**Red flag:** A CLI tool or short-lived script that hangs and never exits because of a forgotten `setInterval`. `unref()` (or clearing the interval) is the fix, not `process.exit()` as a blunt workaround.

### fs: sync vs callback vs promises API
**They ask:** "Node's `fs` module has three API styles — when do you use each?"

`fs.readFileSync` blocks the entire event loop until the disk read completes — every other request queued behind it stalls, so it's only acceptable at startup (reading config before the server starts accepting traffic), never in a request handler. The callback API (`fs.readFile(path, cb)`) is non-blocking but predates promises, so it composes poorly with `async/await`. `fs.promises`/`fs/promises` (or `require('node:fs/promises')`) gives the same non-blocking behavior with promise-based, `await`-friendly calls — the default choice in request-handling code today.

```js
const fs = require('node:fs/promises');
const config = await fs.readFile('./config.json', 'utf-8'); // non-blocking, await-friendly
```

**Say it:** "I reach for `fs/promises` in request handlers so file I/O never blocks the loop, and I only use the sync API for one-time startup work like loading config before the server begins accepting traffic."
**Red flag:** Calling `fs.readFileSync` inside a request handler "because it's simpler." Every concurrent request stalls behind that one blocking disk read — it defeats the entire point of Node's non-blocking model.

### Watching the filesystem
**They ask:** "How does `fs.watch` work, and what are its portability gotchas?"

`fs.watch(path, callback)` subscribes to OS-level filesystem change notifications (inotify on Linux, FSEvents on macOS, ReadDirectoryChangesW on Windows) — cheaper than polling since the OS pushes events instead of you repeatedly checking mtimes. The catch, and the reason most tooling (nodemon, webpack) doesn't rely on it alone: behavior is inconsistent across platforms — event coalescing, whether renames fire one event or two, and reliability on network filesystems all differ, and it can miss events under rapid successive changes. `fs.watchFile` is the polling fallback — more portable, but higher latency and CPU cost since it stats the file on an interval.

```js
fs.watch('./config.json', { persistent: false }, (eventType, filename) => reload(filename));
```

**Say it:** "`fs.watch` is OS-native and cheap but its exact event semantics differ across platforms, so anything that needs to work reliably everywhere either debounces aggressively or falls back to polling with `fs.watchFile`."
**Red flag:** Building critical logic (like a config hot-reload in production) directly on raw `fs.watch` events without debouncing. Editors often trigger multiple change events per save, and platform differences make exact event counts unreliable.

### EventEmitter basics
**They ask:** "What is `EventEmitter`, and how does it relate to Node's whole async model?"

`EventEmitter` is Node's core pub-sub primitive — `.on(event, listener)` subscribes, `.emit(event, ...args)` synchronously calls every listener registered for that event, in registration order. It's foundational, not incidental: streams, HTTP servers/requests, child processes, and most of Node's built-in async APIs *are* EventEmitters under the hood, so understanding `.on`/`.emit`/`.once`/`.off` is understanding the vocabulary the rest of the platform is built from.

```js
const emitter = new (require('node:events').EventEmitter)();
emitter.on('data', chunk => process(chunk));
emitter.emit('data', buffer);
```

One easy-to-miss detail: `.emit()` runs listeners *synchronously* in the same tick — it's not an async dispatch by itself.

**Say it:** "`EventEmitter` is Node's core pub-sub primitive, and it's not just a utility — streams, servers, and child processes are all built on it, so `.on`/`.emit` is the vocabulary the rest of the async platform speaks."
**Red flag:** Assuming `.emit()` is asynchronous. It calls every registered listener synchronously, in order, on the current call stack — any error thrown inside a listener propagates synchronously too, unless it's an `'error'` event (which has special handling).

### Max listeners and memory leak warnings
**They ask:** "What is the `MaxListenersExceededWarning`, and what does it actually indicate?"

`EventEmitter` defaults to warning after 10 listeners are attached to the same event on the same instance — not a hard limit, just a heuristic tripwire for the most common real bug: code that adds a listener inside a function called repeatedly (a request handler, a loop) without ever removing it, which is a genuine memory leak, since each listener closure keeps its captured scope alive. The fix is almost never raising the limit — it's finding where a listener should have been removed, or moved to attach once at startup instead of per-call.

```js
emitter.setMaxListeners(20); // silences the warning without fixing the leak
// real fix: attach once, or emitter.off(event, handler) when done
```

**Say it:** "The max-listeners warning is a heuristic for a real bug class — a listener re-added on every call without cleanup — so I look for the leak before I ever raise the limit; raising it just hides the symptom."
**Red flag:** Silencing the warning with `setMaxListeners(Infinity)` without investigating why listeners are accumulating. That's treating a leak detector's alarm as the problem instead of the fix.

### Extending EventEmitter
**They ask:** "How and why would you extend `EventEmitter` for your own class?"

Extending `EventEmitter` is the idiomatic way to give a custom class pub-sub behavior that composes with the rest of Node's ecosystem — anything consuming your class can `.on('event', ...)` the same way they would a stream or HTTP server, no bespoke callback API to learn. It fits naturally for things like a job queue emitting `'started'`/`'completed'`/`'failed'`, or a connection wrapper emitting `'connect'`/`'disconnect'`.

```js
class JobQueue extends EventEmitter {
  async run(job) {
    this.emit('started', job);
    try {
      const result = await job.execute();
      this.emit('completed', job, result);
    } catch (err) {
      this.emit('error', err); // special: throws if there's no 'error' listener
    }
  }
}
```

The one gotcha worth knowing cold: an `'error'` event with no registered listener *throws* and can crash the process — always attach an `'error'` handler on anything that might emit one.

**Say it:** "I extend `EventEmitter` when a class's consumers benefit from the same `.on`/`.emit` vocabulary as the rest of Node's ecosystem — and I always register an `'error'` listener, because that specific event throws and can crash the process if nothing's listening."
**Red flag:** Emitting `'error'` on a custom `EventEmitter` without ensuring a listener is always attached. In production that's an uncaught exception waiting to happen, not just a missed log line.

### process.env and configuration
**They ask:** "What are the pitfalls of `process.env` for configuration?"

Every value in `process.env` is a string — `process.env.PORT` is `"3000"`, not `3000`, so unvalidated env config silently produces type bugs (`"3000" + 1` is `"30001"`, not `3001`). There's no built-in schema validation, so a typo'd variable name (`DATABAE_URL`) just silently resolves to `undefined` instead of failing loudly. The standard fix is validating and parsing env vars once at startup — with a library like `zod`/`envalid` or hand-rolled checks — so a misconfiguration fails fast at boot instead of producing a subtle runtime bug hours later.

```js
const PORT = Number(process.env.PORT) || 3000; // explicit coercion
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required'); // fail fast
```

**Say it:** "Everything in `process.env` is a string with no schema, so I validate and coerce it once at startup and throw on anything missing — failing fast at boot beats a silent `undefined` surfacing as a bug three services downstream."
**Red flag:** Reading `process.env.X` scattered throughout the codebase with no central validation. A typo'd or missing var then fails deep inside business logic instead of at startup, where it's cheap to diagnose.

### process.argv and exit codes
**They ask:** "How do you parse CLI arguments and communicate success/failure from a Node script?"

`process.argv` is an array where index `0` is the node binary path and index `1` is the script path — actual user-supplied arguments start at index `2`. For anything beyond a couple of flags, hand-parsing gets fragile fast (quoting, `--flag=value` vs `--flag value`, short flags); a parsing library (`commander`, `yargs`) is the pragmatic choice once you need more than one or two options. Exit codes communicate outcome to whatever invoked the process (a shell script, CI pipeline): `0` means success, any non-zero value signals failure — `process.exit(1)` (or, better, letting the process exit naturally with a non-zero code set) is how a CI job knows to fail the build.

```js
const args = process.argv.slice(2);
if (!args.length) { console.error('usage: mytool <file>'); process.exit(1); }
```

**Say it:** "`process.argv` real arguments start at index 2, and exit codes are the process's contract with whatever invoked it — zero is success, non-zero fails the calling shell script or CI step, which is exactly how CI decides pass/fail."
**Red flag:** A CLI tool that logs an error but exits with code `0` anyway. CI and shell scripts only look at the exit code — a logged error with a zero exit silently passes.

### uncaughtException and unhandledRejection
**They ask:** "What are `uncaughtException` and `unhandledRejection`, and what should a Node process do when it hits one?"

`uncaughtException` fires when a synchronous error escapes every `try/catch` on the call stack; `unhandledRejection` fires when a promise rejects and nothing ever attached a `.catch`/`await`-`try` to it. Both indicate the process is now in an *unknown state* — some cleanup or state mutation may have partially happened — so the correct response is almost always: log the error with full context, then exit the process (`process.exit(1)`) and let a process manager (PM2, Kubernetes) restart it cleanly, rather than trying to keep running.

```js
process.on('uncaughtException', (err) => {
  logger.fatal(err);
  process.exit(1); // don't try to keep serving traffic from a corrupted state
});
```

**Say it:** "Both events mean the process's internal state is now unverified, so the right response is log-and-exit for a clean restart by the process manager — trying to catch-and-continue just risks serving requests from corrupted state."
**Red flag:** Adding an `uncaughtException` handler that swallows the error and lets the process keep running "to avoid downtime." That converts a crash into silent data corruption, which is strictly worse.

### spawn, exec, and fork
**They ask:** "What are the differences between `spawn`, `exec`, and `fork` in `child_process`?"

`spawn` launches a new process and streams its `stdout`/`stderr` incrementally — no buffering limit, right for long-running processes or large output. `exec` also spawns a process but buffers all output into memory and delivers it via a callback once the process exits — simpler for short commands with small output, but it has a default buffer size limit that throws if exceeded, and it runs through a shell (`sh -c`), which opens a shell-injection risk if the command string includes unsanitized input. `fork` is specialized for spawning another **Node.js** process specifically, and it sets up a built-in IPC channel for structured message-passing between parent and child, unlike the raw stdio pipes `spawn`/`exec` give you.

```js
const { spawn } = require('node:child_process');
const grep = spawn('grep', ['pattern', 'file.txt']); // streamed, no shell by default
grep.stdout.on('data', chunk => process.stdout.write(chunk));
```

**Say it:** "`spawn` streams output for long-running or large-output processes, `exec` buffers and runs through a shell — so it's the injection-risk one with untrusted input — and `fork` is specifically for spawning a child Node process with a built-in IPC channel."
**Red flag:** Using `exec` with string-concatenated user input (`exec('ls ' + userInput)`). Because `exec` runs through a shell, that's a direct command-injection vector — use `spawn` with an argument array, which never touches a shell.

### IPC between parent and child processes
**They ask:** "How does a parent process communicate with a child created via `fork`?"

`fork` wires up a dedicated message channel automatically — the parent calls `child.send(message)`/listens on `child.on('message', ...)`, and the child does the mirror image with `process.send`/`process.on('message', ...)`. Under the hood it's serialized (structured-clone-like, not raw strings) over a pipe, which is why it works well for passing plain objects between processes — this is exactly the mechanism the `cluster` module uses internally to hand off connections between the primary and worker processes.

```js
// parent.js
const child = fork('./worker.js');
child.send({ type: 'task', payload: data });
child.on('message', result => console.log(result));

// worker.js
process.on('message', msg => process.send({ done: true, result: compute(msg.payload) }));
```

**Say it:** "`fork` sets up a structured IPC channel for free — `send`/`on('message')` on both ends — and it's the same mechanism `cluster` uses under the hood to route connections to worker processes."
**Red flag:** Trying to pass functions, class instances, or circular structures through `child.send()`. The channel serializes messages (structured-clone semantics), so those either get stripped or throw — pass plain, serializable data.

### Operational vs programmer errors
**They ask:** "What's the distinction between operational and programmer errors, and why does it change how you handle them?"

This is a framing from Node's own error-handling guidance: **operational errors** are expected failure modes of a correctly-written program interacting with the outside world — a failed DB connection, a timed-out request, invalid user input, a full disk. They should be handled gracefully — retried, surfaced as a 4xx/5xx, logged — the program's logic is fine. **Programmer errors** are bugs — a `TypeError` from calling a method on `undefined`, a broken invariant — and the correct response isn't to catch and continue, because the process is now in a state the code never anticipated; the safer move is to let it crash and restart clean.

```js
try {
  await db.query(sql); // operational: DB down is an expected failure mode — handle it
} catch (err) {
  if (isOperational(err)) return res.status(503).json({ error: 'db unavailable' });
  throw err; // programmer error — let it propagate to a crash handler
}
```

**Say it:** "Operational errors are expected interactions with the outside world and should be handled gracefully; programmer errors are bugs, and swallowing them just hides a broken invariant — I let those crash the process for a clean restart instead of catching blindly."
**Red flag:** A single global `try/catch` that treats every error the same way — logging and continuing regardless of type. Programmer errors need to surface, not be quietly absorbed alongside expected operational failures.

### The cluster module
**They ask:** "How does the `cluster` module let a single-threaded Node process use multiple CPU cores?"

Node's JS execution is single-threaded per process, so one process can only use one core no matter how much traffic arrives. `cluster` forks multiple **worker processes**, each running its own event loop and V8 instance, all sharing the same server port — the primary process's OS handles distributing incoming connections across workers (round-robin by default on most platforms). Since each worker is a fully separate process, they don't share memory — any shared state (sessions, caches) has to live externally (Redis, a database), not in-process.

```js
if (cluster.isPrimary) {
  for (let i = 0; i < os.cpus().length; i++) cluster.fork();
} else {
  http.createServer(handler).listen(3000); // each worker binds the same port
}
```

**Say it:** "`cluster` forks separate OS processes, each with its own event loop, so a multi-core box can serve more concurrent connections than one Node process ever could alone — but because workers don't share memory, any shared state has to move to an external store like Redis."
**Red flag:** Storing session data in an in-memory object under `cluster`. Each worker has its own separate memory, so a user's session only exists on whichever worker handled their first request — subsequent requests routed to a different worker see no session.

### worker_threads vs cluster
**They ask:** "When do you reach for `worker_threads` instead of `cluster`?"

They solve different problems. `cluster` scales *I/O-bound* throughput across cores by running multiple independent processes, each handling its own share of connections — no shared memory, heavier per-worker overhead (separate V8 heap, separate process). `worker_threads` is for offloading *CPU-bound* work (image processing, heavy computation, parsing) from the main thread within the *same process*, and — the key differentiator — it supports `SharedArrayBuffer` for genuine shared memory between threads, which cluster's separate processes can never do.

```js
const { Worker } = require('node:worker_threads');
const worker = new Worker('./cpu-heavy-task.js', { workerData: input });
worker.on('message', result => respond(result));
```

**Say it:** "`cluster` scales I/O throughput across separate processes; `worker_threads` offloads CPU-bound work within one process and can share memory via `SharedArrayBuffer` — I reach for threads specifically when the bottleneck is computation blocking the main event loop, not connection volume."
**Red flag:** Using `cluster` to solve a CPU-bound bottleneck (e.g. image resizing blocking the event loop). Cluster still runs that heavy synchronous work on each worker's single thread — it doesn't parallelize the computation itself, only the connection handling.

### N-API and C++ addons
**They ask:** "What are native addons for, and what does N-API solve that older addon APIs didn't?"

A native addon is a compiled C/C++ (or Rust via bindings) module loaded into Node for work that's either too CPU-intensive for JS or needs to call an existing native library — image/video codecs, cryptography primitives, hardware/driver access. Before N-API, addons were compiled directly against V8's internal API, which changes between V8 versions — meaning an addon had to be recompiled for every Node major version, a maintenance burden known as ABI instability. **N-API** is a stable, ABI-independent C API Node commits to keeping backward-compatible — an addon built against N-API keeps working across Node versions without recompilation.

```cpp
// simplified N-API export
napi_value Add(napi_env env, napi_callback_info info) { /* ... */ }
```

**Say it:** "Pre-N-API addons were compiled against V8's internals directly, so they broke on every Node upgrade — N-API is a stable ABI Node commits to, which is what makes an addon portable across Node versions without recompiling."
**Red flag:** Reaching for a native addon before checking whether `worker_threads` or a pure-JS optimization solves the performance problem. Native code adds build complexity, platform-specific binaries, and a much larger blast radius for bugs (a native crash takes down the whole process, unlike a JS exception).

### When to reach for a native addon
**They ask:** "Beyond raw performance, what's the actual decision framework for writing a native addon?"

The senior framing isn't "is this slow in JS" — V8's JIT makes most JS surprisingly fast — it's "does this need something JS structurally cannot do": binding to an existing C/C++/Rust library with no JS equivalent, true multi-threaded parallel computation with shared memory beyond what `worker_threads` + `SharedArrayBuffer` offers, or direct hardware/OS-level access. Before reaching for a native addon, the cheaper steps are: profile to confirm the bottleneck is real, try `worker_threads` to move CPU-bound JS off the main thread, and check if an existing WASM module solves it with far less build/deploy complexity than a compiled native binary per platform/architecture.

**Say it:** "I reach for a native addon only when the requirement is structural — wrapping an existing native library, or hardware access — not for raw speed, since `worker_threads` and WASM solve most CPU-bound problems with far less platform-specific build complexity."
**Red flag:** Writing a C++ addon to speed up JSON parsing or string manipulation. Those are exactly the kind of hot paths V8 already optimizes well; the addon adds cross-platform build/deploy burden for marginal gain.

### Buffer and binary data
**They ask:** "What is `Buffer`, and why does Node need a separate binary type when JS has strings?"

JS strings are UTF-16 sequences meant for text — they're the wrong tool for raw binary data (file contents, network packets, image bytes), which isn't inherently text and shouldn't be forced through a text encoding. `Buffer` is Node's fixed-length, raw binary data type, allocated outside the regular V8 JS heap for efficiency, and it's what every I/O API in Node deals in by default — file reads, TCP sockets, crypto — before you optionally decode it to a string with an explicit encoding.

```js
const buf = Buffer.from('hello', 'utf-8');
buf.toString('hex'); // '68656c6c6f' — explicit encoding both ways
```

**Say it:** "`Buffer` is Node's raw binary type, allocated off the main V8 heap — I treat any I/O result as a `Buffer` first and only decode to a string with an explicit encoding when I actually need text, since assuming UTF-8 silently corrupts binary or differently-encoded data."
**Red flag:** Calling `.toString()` on a `Buffer` with no encoding argument for binary (non-text) data like an image or a compressed file. It defaults to UTF-8, which silently mangles bytes that aren't valid UTF-8 text.

### Buffer vs TypedArray
**They ask:** "How does `Buffer` relate to JS's standard `TypedArray`/`ArrayBuffer`?"

`Buffer` predates `TypedArray` in the JS spec and was Node-specific; today `Buffer` is implemented as a subclass of `Uint8Array` (a `TypedArray`), so it interoperates with the standard `ArrayBuffer`-based APIs — you can pass a `Buffer` anywhere a `Uint8Array` is expected, and vice versa in most cases. The practical reason `Buffer` still exists rather than using plain `Uint8Array` everywhere: it adds Node-specific convenience methods (`.toString(encoding)`, `Buffer.concat`, `Buffer.compare`) that the spec-level `TypedArray` doesn't have.

```js
const buf = Buffer.alloc(4);
buf instanceof Uint8Array; // true
```

**Say it:** "`Buffer` is a `Uint8Array` subclass with Node-specific convenience methods layered on top — it's compatible with standard `TypedArray`/`ArrayBuffer` APIs, which is why it interops cleanly with web-standard binary code, not a parallel, incompatible binary type."
**Red flag:** Assuming `Buffer` is a browser-incompatible Node-only concept unrelated to web standards. It's built on the same `TypedArray` foundation the browser uses — that shared foundation is exactly why isomorphic binary-handling code works.

### Graceful shutdown and process signals
**They ask:** "How do you shut a Node server down cleanly instead of dropping in-flight requests?"

Orchestrators (Kubernetes, systemd, Docker) send `SIGTERM` to ask a process to stop, then `SIGKILL` after a grace period if it hasn't exited — so the correct pattern is listening for `SIGTERM`, stopping the server from *accepting new* connections (`server.close()`), letting in-flight requests finish, closing DB/queue connections, then exiting — all within the grace period the orchestrator allows, or it'll be force-killed mid-shutdown anyway.

```js
process.on('SIGTERM', async () => {
  await new Promise((resolve, reject) => {
    server.close(err => (err ? reject(err) : resolve())); // await the drain of in-flight requests
  });
  await db.end();       // only now close the DB pool — nothing is still using it
  await queue.close();  // stop consuming, finish in-flight jobs
  process.exit(0);
});
```

**Say it:** "SIGTERM is the orchestrator's polite request to stop — I close the listener first so no new work comes in, drain what's in flight, close downstream connections, then exit, all before the grace period runs out and SIGKILL forces it."
**Red flag:** Ignoring `SIGTERM` entirely and relying on the orchestrator's forceful `SIGKILL`. That drops in-flight requests and can leave DB transactions or queue messages in an inconsistent, unacknowledged state.

### AsyncLocalStorage for request context
**They ask:** "How do you attach a request ID or user to every log line without passing it through every function?"

`AsyncLocalStorage` — it's Node's built-in continuation-local storage, and it solves the exact problem that a single-threaded async server makes hard: there's no thread-local, and threading a context object through every call is invasive and leaky. You `run()` a callback with a store at the start of each request (in middleware), and any code executing within that async call chain — however deep, across awaits and callbacks — reads the same store via `getStore()`. Your logger pulls the request ID from it automatically, so every log line is correlated with zero plumbing.

```js
const { AsyncLocalStorage } = require('node:async_hooks');
const als = new AsyncLocalStorage();
app.use((req, _res, next) => als.run({ reqId: crypto.randomUUID() }, next));
// anywhere downstream, no params threaded through:
log.info({ reqId: als.getStore()?.reqId }, 'order created');
```

**Say it:** "AsyncLocalStorage gives me per-request context that follows the async call chain, so the logger stamps a request ID on every line without me passing it through a dozen function signatures."
**Red flag:** Storing request context on a module-level or global variable to avoid passing it. On a concurrent server it's shared across all in-flight requests — request B overwrites A's context between awaits, and you get logs and data attributed to the wrong user.

### Sharing state between worker_threads
**They ask:** "Two worker_threads need to share data. What are your options and their costs?"

Two mechanisms, and the choice is about copy cost. **Message passing** (`postMessage`) is the default: the payload is *structured-cloned* — deep-copied — so each thread gets its own isolated copy, which is safe but expensive for large data and shares nothing live. For genuinely shared memory you use a **`SharedArrayBuffer`**: both threads see the same bytes with no copy, and you coordinate access with the `Atomics` API (atomic loads/stores and `Atomics.wait/notify` as a lock primitive). SharedArrayBuffer is the only way to share live state, but you've now signed up for real concurrency hazards — data races if you skip `Atomics`. Most workloads are better served by passing messages and keeping each worker's state private.

**Say it:** "postMessage structured-clones the payload, so it's safe but copies — for large shared state I use a SharedArrayBuffer with Atomics for coordination, accepting that I'm now doing real shared-memory concurrency with all its race hazards."
**Red flag:** Assuming worker threads share memory like OS threads in Java or C++ by default. They don't — each has its own V8 isolate and heap; the only shared memory is an explicit `SharedArrayBuffer`, and a plain object you `postMessage` is a copy, not a reference.

### Cluster, sticky sessions, and shared state
**They ask:** "You scale with the cluster module behind a load balancer. What breaks for WebSockets or in-memory sessions?"

Anything that assumed one process breaks, because now a client's requests can land on *any* worker. In-memory sessions fail: worker 1 stored the session, worker 2 gets the next request and has no idea who the user is. WebSockets have two distinct problems: an established socket connection stays pinned to the worker that accepted it (it's one long-lived TCP connection), but the *handshake* can still land on the wrong worker — especially with fallback transports like Socket.io's long-polling, where the handshake spans several HTTP requests that must hit the same worker — and a broadcast emitted on one worker never reaches clients connected to another. Two fixes, and seniors name both: **sticky sessions** (route a client to the same worker by IP/cookie hash) keep a connection pinned, but they weaken load balancing and still lose state if that worker dies. The durable fix is to **externalize shared state** — sessions in Redis, and a pub/sub adapter (e.g. Socket.io's Redis adapter) so a broadcast on any worker reaches clients connected to all of them.

**Say it:** "Once I fork with cluster, in-memory session and socket state is per-worker, so I move sessions to Redis and use a pub/sub adapter for broadcasts — sticky sessions alone just pin the problem to one worker instead of solving it."
**Red flag:** Keeping sessions or socket rooms in a module variable after adding cluster and assuming it "just scales." It works in dev with one worker and silently loses state the moment a second worker handles a request.

### Buffer.alloc vs Buffer.allocUnsafe
**They ask:** "What's the difference between Buffer.alloc and Buffer.allocUnsafe, and why does it matter for security?"

`Buffer.alloc(n)` returns a zero-filled buffer; `Buffer.allocUnsafe(n)` grabs a chunk of memory from Node's internal pool **without clearing it**, so it can contain whatever was there before — potentially fragments of other requests' data, keys, or tokens. `allocUnsafe` is faster because it skips the zero-fill, but if you don't immediately overwrite every byte you write out uninitialized memory, which is a real information-disclosure bug. The rule: default to `Buffer.alloc`; only use `allocUnsafe` in a hot path where you provably fill the entire buffer before anyone reads it.

**Say it:** "alloc zero-fills, allocUnsafe hands back uninitialized pooled memory that may hold old data — I default to alloc and only reach for allocUnsafe when I'm about to overwrite every byte in a performance-critical path."
**Red flag:** Using `allocUnsafe` (or the deprecated `new Buffer(n)`) by default "for speed" and returning or logging it before fully overwriting it. That leaks whatever was previously in that memory — a classic Node information-disclosure vulnerability.

### Timeouts and cancellation with AbortSignal
**They ask:** "How do you put a timeout on any async operation — a fetch, a DB call — and cancel it cleanly?"

`AbortSignal` is the standard cancellation primitive, and modern Node gives you `AbortSignal.timeout(ms)` to create one that fires automatically — pass it to any API that accepts a signal (`fetch`, `fs` promises, many DB drivers) and the operation rejects with an `AbortError` when time's up, releasing its resources instead of hanging. For "timeout *or* the user navigated away," combine signals with `AbortSignal.any([...])` so whichever fires first cancels the work. This is how a senior stops a slow dependency from holding a request (and its DB connection) open indefinitely.

```js
const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
// timeout OR external cancel:
const signal = AbortSignal.any([AbortSignal.timeout(2000), req.signal]);
```

**Say it:** "I wrap slow async calls in AbortSignal.timeout so they reject and release resources instead of hanging, and AbortSignal.any lets me cancel on whichever comes first — the timeout or the client disconnecting."
**Red flag:** Using `Promise.race` with a `setTimeout` as a homemade timeout. The losing promise keeps running — the fetch or query isn't actually cancelled, so it still holds a connection and can still fire side effects after you've "timed out."

### Stream-processing a file too big for memory
**They ask:** "You need to process a multi-gigabyte CSV or JSON file. How do you do it without loading it into memory?"

You never `readFile` it — you create a read stream and pipe it through an incremental parser so only a small window is in memory at once, and backpressure keeps the reader from outrunning your processing. For CSV, a streaming parser (`csv-parse`) emits row by row; for large JSON, a streaming parser like `stream-json` emits values/array-items as they're parsed instead of building the whole tree. You pipe read → parse → your transform (validate, map, write to DB in batches) → destination, and `pipeline()` ties error handling and cleanup together across all of it. One detail that's easy to get wrong in the transform: `cb()` signals "ready for the next chunk," so it has to fire only once the batch insert actually finishes — calling it right after kicking off an async insert breaks backpressure, because the pipeline pulls the next chunk before the write is done.

```js
const { pipeline } = require('node:stream/promises');
await pipeline(
  fs.createReadStream('huge.csv'),
  parse({ columns: true }),          // csv-parse: emits one row at a time
  new Transform({
    objectMode: true,
    transform(row, _e, cb) {
      batchInsert(row).then(() => cb(), cb); // cb only after the insert settles; errors propagate too
    },
  }),
);
```

**Say it:** "For a file bigger than memory I stream it through an incremental parser — csv-parse or stream-json — so I'm only ever holding a few rows, and backpressure through pipeline() stops the reader from overwhelming the database writes. The transform's callback only fires once the batch insert actually resolves, or backpressure is a lie and the reader keeps outrunning the writes."
**Red flag:** `JSON.parse(fs.readFileSync(...))` on a large file. It reads the whole thing into memory and blocks the event loop for the entire parse — it works on your laptop's sample and OOMs or stalls the server on the real file.
