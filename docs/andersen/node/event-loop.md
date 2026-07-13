# Node.js — event loop internals

### The six phases of the event loop
**They ask:** "Walk through the phases of the Node event loop."

Interviewers ask this to check you understand Node isn't "just JS" — it's a loop libuv drives through fixed phases, each with its own callback queue, and knowing the order explains ordering bugs that pure JS knowledge can't. The phases, in order, per tick: **timers** (expired `setTimeout`/`setInterval` callbacks), **pending callbacks** (some OS-level callbacks deferred from the previous loop), **idle/prepare** (internal use), **poll** (retrieve new I/O events and run their callbacks — this phase can block here waiting for I/O if nothing else is scheduled), **check** (`setImmediate` callbacks specifically), **close callbacks** (`socket.on('close', ...)` and similar cleanup).

```
┌───────────────────────┐
│         timers         │  setTimeout, setInterval
├───────────────────────┤
│    pending callbacks   │
├───────────────────────┤
│      idle, prepare      │  (internal)
├───────────────────────┤
│          poll           │  I/O callbacks; can block here
├───────────────────────┤
│          check          │  setImmediate
├───────────────────────┤
│     close callbacks     │  socket.on('close', ...)
└───────────────────────┘
```

**Say it:** "The loop cycles through timers, pending callbacks, poll, check, and close-callback phases each tick — the poll phase is where it can actually block waiting for I/O, which is why 'the event loop' isn't one queue, it's several, processed in a fixed order."
**Red flag:** Describing the event loop as "a single callback queue processed in order." That's the older mental model and misses why `setImmediate` and `setTimeout(fn, 0)` can fire in different orders depending on context.

### process.nextTick and microtasks vs macrotasks
**They ask:** "Where do process.nextTick and Promise microtasks run relative to timers and I/O callbacks?"

Both `process.nextTick` and resolved-promise callbacks are **microtasks**, and Node drains the *entire* microtask queue after every single callback completes — not just once per loop tick, but after every macrotask (a timer callback, an I/O callback, each `setImmediate`). `process.nextTick`'s queue is drained first, then the promise microtask queue, before the event loop is allowed to move to the next phase.

```js
setTimeout(() => console.log('timeout'), 0);       // macrotask: timers phase
setImmediate(() => console.log('immediate'));        // macrotask: check phase
process.nextTick(() => console.log('nextTick'));      // microtask, drained first
Promise.resolve().then(() => console.log('promise')); // microtask, drained second
console.log('sync');
// order: sync, nextTick, promise, then timeout/immediate (order between those two varies by context)
```

**Say it:** "nextTick and promise microtasks both run before the event loop advances to its next phase — nextTick's queue drains before the promise queue — so they always beat any timer or I/O callback, no matter how short the timeout."
**Red flag:** Claiming `setTimeout(fn, 0)` runs "immediately" or before microtasks — it's a macrotask; every pending microtask runs first, every time.

### Starving the event loop
**They ask:** "How can process.nextTick starve the event loop, and why is that dangerous?"

Because Node drains the *entire* `nextTick` queue before doing anything else, a `nextTick` callback that recursively schedules another `nextTick` (directly or via some chain of async logic) never lets the loop move past that microtask phase — no timers fire, no I/O callbacks run, no incoming connections get handled. The process looks "hung" even though it's technically still executing JS.

```js
// starves the event loop — I/O and timers never get a turn
function recurse() {
  process.nextTick(recurse);
}
recurse();
```

This is exactly why `setImmediate` exists as an alternative for "run this soon but let I/O have a turn first" — it's scheduled in the check phase, after poll, so it doesn't cut ahead of pending I/O the way a `nextTick` chain does.

**Say it:** "A recursive process.nextTick chain never lets the loop leave the microtask phase, so I/O and timers starve completely — that's why I reach for setImmediate when I want 'run soon' without blocking I/O behind it."
**Red flag:** Using `process.nextTick` for general deferred work "because it runs fast" without knowing it can starve the whole process if used recursively or in a hot path.

### What runs on the libuv thread pool
**They ask:** "Which Node APIs actually use the libuv thread pool, and which don't?"

Only a specific set of APIs use the pool, because it's specifically there to fake async I/O for operations the OS doesn't offer a true async syscall for: most `fs` module calls, DNS lookups via `dns.lookup` (not `dns.resolve*`, which use the OS's async resolver directly over the network), some `crypto` functions (`pbkdf2`, `scrypt`, `randomBytes` async form), and `zlib` compression. Networking (`net`, `http`, `dgram`) uses the OS's native async I/O — epoll/kqueue/IOCP — directly, with **no thread pool involved at all**.

```js
fs.readFile('x', cb);        // thread pool
dns.lookup('example.com', cb); // thread pool (uses getaddrinfo)
dns.resolve4('example.com', cb); // NOT thread pool — async DNS query over the wire
http.get('http://x', cb);    // NOT thread pool — OS async socket I/O
```

**Say it:** "The thread pool exists only for the handful of APIs the OS has no async syscall for — fs, dns.lookup, some crypto and zlib — everything network-facing uses the OS's own async I/O directly, no pool involved."
**Red flag:** Assuming all Node I/O shares one thread pool, including network requests — that misunderstanding leads to wrong diagnoses when someone blames "thread pool exhaustion" for an HTTP-bound slowdown.

### Sizing the thread pool
**They ask:** "How do you resize the thread pool, and when would you need to?"

The pool defaults to 4 threads, set via the `UV_THREADPOOL_SIZE` environment variable (max 1024), and it must be set **before** libuv initializes — setting it inside your app's JS after startup on some platforms is too late, so it's typically set as an env var before the process starts.

```bash
UV_THREADPOOL_SIZE=8 node server.js
```

You'd bump it when your app is dominated by pool-bound work — heavy `fs` traffic, `crypto.pbkdf2` under load, DNS-heavy fan-out — and profiling shows requests queuing behind a full pool rather than being CPU-bound on the main thread. Bumping it blindly without evidence just trades one bottleneck for higher memory/context-switch overhead.

**Say it:** "UV_THREADPOOL_SIZE controls the pool, default 4, set as an env var before the process starts — I only raise it once profiling shows requests queued behind a full pool, not as a reflexive fix."
**Red flag:** Setting `UV_THREADPOOL_SIZE` inside application code after the process has already started — libuv has already sized the pool by then on most setups, so the change silently does nothing.

### Diagnosing thread pool exhaustion
**They ask:** "What symptoms show up when the thread pool is exhausted, and how do you diagnose it?"

The tell is that fs/crypto/dns.lookup calls start taking noticeably longer under load even though CPU usage looks low and the event loop itself isn't blocked — because the JS thread is idle, waiting on pool threads that are all busy. It shows up as growing tail latency on endpoints that touch the file system or do `bcrypt`/`pbkdf2` hashing, while endpoints that only do network I/O (DB queries over TCP, outbound HTTP) stay fast.

Diagnosis: instrument the specific pool-bound calls with timers to see queueing delay, watch `UV_THREADPOOL_SIZE` against concurrent pool-bound operations, or use Node's built-in `--prof`/`clinic.js`-style profiling to see threads blocked in libuv rather than in your JS.

**Say it:** "Thread pool exhaustion looks like rising latency specifically on fs/crypto/dns.lookup-heavy endpoints while the event loop and network-bound endpoints stay fine — that split is the diagnostic signal that points at the pool, not the loop itself."
**Red flag:** Reaching for "the event loop is blocked" as the default explanation for any slowdown — a saturated thread pool produces a different, narrower symptom pattern and a different fix (resize the pool or move work off it, not optimize JS).

### epoll, kqueue, and IOCP
**They ask:** "How does libuv abstract OS-level I/O notification (epoll, kqueue, IOCP) into one event loop?"

Every OS has its own mechanism for "tell me when any of these file descriptors is ready" — Linux uses epoll, BSD/macOS uses kqueue, Windows uses IOCP (I/O Completion Ports) — and they have different APIs and even different models (readiness-based vs completion-based). libuv's job is to present one consistent event-loop API to Node regardless of platform, by wrapping whichever mechanism the OS provides underneath.

This is why Node's async networking scales without a thread per connection: instead of blocking a thread per socket, libuv registers all open sockets with the OS's notification mechanism and the poll phase asks "which of these are ready" in one syscall, then dispatches callbacks only for the ready ones.

**Say it:** "libuv is the portability layer — it wraps epoll on Linux, kqueue on BSD/macOS, and IOCP on Windows behind one API, so Node's event loop code doesn't care which OS primitive is underneath."
**Red flag:** Treating libuv as "the event loop" itself rather than the cross-platform abstraction layer that implements it — the distinction matters because it's *why* the same Node code behaves consistently across operating systems.

### Why one thread can handle thousands of connections
**They ask:** "Why can a single Node process handle thousands of concurrent connections without a thread per connection?"

A thread-per-connection server (classic Apache prefork model) pays real OS costs per connection — stack memory, context-switch overhead, scheduler pressure — that scale badly past a few thousand concurrent connections, especially when most connections are idle most of the time (a chat app, long polling, SSE). Node instead registers every socket with the OS's readiness/completion mechanism (epoll/kqueue/IOCP) and only spends CPU on connections that actually have work ready — an idle connection costs a file descriptor and a bit of bookkeeping, not a parked thread.

The trade-off: this model is excellent for I/O-bound, high-concurrency, low-CPU-per-request workloads, and bad for CPU-bound work, because there's still only one JS thread doing the actual computation — that's what `cluster` and `worker_threads` exist to fix.

**Say it:** "Node scales concurrent connections by cost-per-idle-connection, not cost-per-active-thread — an idle socket is nearly free to hold open, which is why it beats thread-per-connection models for I/O-bound workloads at high concurrency."
**Red flag:** Claiming Node "handles more requests than X because it's faster" — it's not faster per request; it's cheaper per *idle* connection, which is a different and narrower claim.

### Comparing Node's model to a traditional thread-per-request server
**They ask:** "How does Node's single-threaded event loop model compare to Apache's thread-per-request model, and what's the trade-off?"

Apache's traditional (prefork/worker) model spins up a thread or process per request, which gives you strong isolation — one slow or crashing request can't easily take down another — at the cost of memory and context-switch overhead per connection, which caps concurrency well below what an event-loop model can sustain. Node's model flips that: cheap concurrency, shared-fate risk — one unhandled exception or one CPU-hogging synchronous block *does* affect every other in-flight request, because they all share the one JS thread.

The practical implication for architecture: Node rewards keeping request handlers I/O-bound and short, and pushes CPU-heavy or fault-isolation-sensitive work out to worker processes, a queue, or a separate service — you don't get free isolation the way a process-per-request model gives you.

**Say it:** "Thread-per-request buys isolation at the cost of concurrency ceiling; Node buys concurrency at the cost of shared fate on one thread — which is why a single misbehaving synchronous handler in Node hurts every other request, not just its own."
**Red flag:** Presenting this as "Node is just better" without naming the isolation trade-off — a senior answer names both directions of the trade, not just the one that favors Node.

### setImmediate vs setTimeout(fn, 0)
**They ask:** "What's the difference between setImmediate and setTimeout(fn, 0), and which runs first?"

They both mean "run this later," but they live in *different phases* — `setImmediate` fires in the **check** phase, `setTimeout(fn, 0)` in the **timers** phase — and that's why their relative order isn't guaranteed at the top level. From the main module, the outcome depends on how long the process took to reach the loop's first pass, so either can win. But inside an **I/O callback** the order is deterministic: `setImmediate` always fires first, because after the poll phase the loop goes straight to check before wrapping around to timers. So `setImmediate` is the right tool for "run right after this I/O completes, before any timer."

```js
const fs = require('node:fs');
fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
});
// inside an I/O callback, ALWAYS: immediate, then timeout
```

**Say it:** "setImmediate runs in the check phase and setTimeout(0) in the timers phase — at the top level their order is a race, but inside an I/O callback setImmediate always wins because check comes right after poll."
**Red flag:** Claiming `setImmediate` and `setTimeout(fn, 0)` are interchangeable. They resolve in a fixed order inside I/O callbacks, and code that relies on "immediate is sooner" will break if someone swaps it for a zero timer.
