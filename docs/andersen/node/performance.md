# Node.js — performance and diagnostics

### Profiling a CPU-bound Node process
**They ask:** "A Node endpoint is pegging a core. How do you find the hot function?"

The senior move is to profile before you guess — CPU problems in Node are almost always one synchronous function eating the thread, and a flame graph names it in minutes where reading code takes hours. Reach for the V8 sampling profiler: `node --prof app.js` writes an `isolate-*.log` you turn into a report with `node --prof-process`, or attach `--inspect` and take a CPU profile in Chrome DevTools / VS Code. For production-shaped load, `clinic flame` (or `0x`) wraps a load test and renders a flame graph directly — the widest bar at the top is your hot path.

```bash
node --prof server.js           # sample, then:
node --prof-process isolate-*.log > profile.txt
# or, load-test + flame graph in one shot:
clinic flame -- node server.js  # then hit it with autocannon
```

**Say it:** "I don't guess at CPU hotspots — I take a flame graph under realistic load with clinic or 0x, and the widest frame at the top is the function to optimize."
**Red flag:** Adding `console.time` calls all over the code to hunt for the slow part. That's guessing; a sampling profiler tells you where the thread actually spends its time without touching the source.

### Measuring and fixing event-loop lag
**They ask:** "Requests are slow but CPU looks fine and the DB is fast. What's your first suspicion?"

Event-loop lag: some callback is blocking the single thread long enough that everything queued behind it waits, so latency climbs while CPU sits idle between spikes. You measure it precisely with `perf_hooks.monitorEventLoopDelay`, which samples the delay between when a timer *should* fire and when it *does* — expose the p99 of that as a metric and alert on it. The fix is never "add threads to the loop"; it's to find the blocking callback (sync crypto, huge `JSON.parse`, a tight loop) and either chunk it, move it to `worker_threads`, or offload it to a queue.

```js
const { monitorEventLoopDelay } = require('node:perf_hooks');
const h = monitorEventLoopDelay({ resolution: 20 });
h.enable();
setInterval(() => console.log('loop lag p99 ms:', h.percentile(99) / 1e6), 5000);
```

**Say it:** "Latency up with CPU flat means event-loop lag — I measure it with monitorEventLoopDelay and fix it by getting the blocking work off the loop, not by scaling the box."
**Red flag:** Reaching for more replicas or a bigger instance to fix loop lag. Horizontal scale hides it per-process but the blocking callback still stalls every request that lands on the same worker.

### Diagnosing a memory leak in a running service
**They ask:** "A Node service's memory climbs until it OOMs every few days. How do you find the leak?"

You compare heap snapshots over time and look at *retained size* — a leak is an object graph that keeps growing because something still references it. Take a snapshot with the inspector (or trigger one in prod via `--heapsnapshot-signal=SIGUSR2` and `kill -USR2 <pid>`), let the service run under load, take a second, and diff them in Chrome DevTools: the constructor whose retained size grew is your culprit. The usual suspects are unbounded caches, listeners added but never removed, and closures captured in long-lived timers or global arrays.

```bash
node --heapsnapshot-signal=SIGUSR2 server.js
kill -USR2 <pid>   # writes Heap.<date>.heapsnapshot; take two, diff retained size
```

**Say it:** "I take two heap snapshots under load and diff retained size — the constructor that grew between them is the leak, and it's almost always an unbounded cache or a listener that's never removed."
**Red flag:** Just raising `--max-old-space-size` and calling it fixed. A bigger heap delays the OOM; it doesn't stop unbounded growth — you've turned a daily crash into a weekly one.

### Debugging a p99 latency spike
**They ask:** "p99 latency tripled in production but p50 barely moved. Walk me through it."

A p99-only spike means most requests are fine and a tail is getting stuck — so I isolate *what* stalls the tail, in order: **1. Event-loop lag** — check `monitorEventLoopDelay` p99; a periodic blocking callback (GC, sync crypto, big serialization) stalls whatever's queued behind it. **2. Thread-pool saturation** — fs, DNS, and crypto share libuv's 4-thread pool; if they're saturated, extra requests wait (raise `UV_THREADPOOL_SIZE` or move the work). **3. Downstream tail** — a slow DB connection-pool wait or a dependency's own p99, visible in traces. **4. GC pauses** — `--trace-gc` shows major collections that freeze the thread. The point is p50-vs-p99 divergence tells you it's contention/tail, not a uniform slowdown.

**Say it:** "p99 up with p50 flat is a tail problem, so I check event-loop lag, then thread-pool saturation, then downstream p99, then GC pauses — in that order — instead of assuming the whole system got slower."
**Red flag:** Optimizing average latency in response to a p99 alert. The average is fine; you'd be tuning the wrong thing while the tail keeps timing out users.

### Tuning the V8 heap and GC flags
**They ask:** "When would you touch V8's heap and GC flags, and which ones?"

Rarely, and only after profiling — but a senior knows the knobs. `--max-old-space-size=<MB>` raises the old-space cap (the default is ~2 GB on 64-bit); you raise it for a genuinely large working set, *not* to paper over a leak. `--max-semi-space-size` grows the young generation so short-lived objects get collected by cheap minor GC instead of getting promoted to expensive major GC — worth tuning for allocation-heavy request handlers. `--trace-gc` prints every collection so you can see whether major GC is your latency source before you touch anything.

```bash
node --max-old-space-size=4096 --trace-gc server.js
# [.. Scavenge ..] = minor GC (cheap); [.. Mark-sweep ..] = major GC (stop-the-world)
```

**Say it:** "I only touch V8 flags after a heap profile — raise max-old-space-size for a real large working set, grow the semi-space to keep short-lived objects out of major GC, and always trace-gc first to confirm GC is actually the problem."
**Red flag:** Setting `--max-old-space-size` high as a default deploy flag. If memory grows to fill it, you've just made every eventual OOM bigger and the heap snapshots slower to capture.

### Diagnosing GC pauses that hurt latency
**They ask:** "How do you tell whether garbage collection is what's hurting your latency?"

Turn on `--trace-gc` and look at the *type* and *duration* of collections: **Scavenge** entries are minor GC on the young generation — fast, frequent, usually harmless. **Mark-sweep / Mark-compact** entries are major GC — they're stop-the-world, freeze the single thread, and a long one lines up exactly with a latency spike. If majors are frequent and slow, you're promoting too much to old space (large or long-lived allocations), so the fix is to allocate less per request or keep hot objects out of the request path (reuse buffers, avoid rebuilding big structures every call).

**Say it:** "I trace-gc and watch for frequent long mark-sweep pauses — those are stop-the-world, so if they line up with my latency spikes the fix is to allocate less and stop promoting short-lived objects into old space."
**Red flag:** Blaming GC for a spike without evidence. Minor Scavenge GC runs constantly and is fine; only a correlated, long *major* collection is worth acting on.

### Load testing and reading percentiles
**They ask:** "How do you load-test a Node API, and what number do you actually watch?"

You drive it with a tool that reports the latency *distribution*, not an average — `autocannon` (Node-native) or `k6` — and you watch p99, not mean, because the mean hides the tail that actually pages you. A good test ramps connections to a realistic level, runs long enough to trigger GC and connection-pool contention (not a 5-second burst), and holds throughput steady while you watch whether p99 stays flat or climbs. Climbing p99 under steady load is the early signal of a resource limit — thread pool, DB pool, or event-loop lag — before it becomes an outage.

```bash
autocannon -c 100 -d 30 http://localhost:3000/api/orders
# read the 99% latency row, not the average
```

**Say it:** "I load-test with autocannon or k6 and watch p99 under sustained load — a rising p99 at steady throughput is a resource ceiling surfacing, and averages would've hidden it."
**Red flag:** Reporting "handles 10k req/s" from a 5-second run with the average latency. Too short to hit GC or pool limits, and the average buries exactly the tail that breaks in production.
