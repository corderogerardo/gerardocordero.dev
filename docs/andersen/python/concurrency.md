# Python — concurrency & parallelism

### What the GIL is and why CPython has one
**They ask:** "What does GIL stand for? What is it?"

The Global Interpreter Lock is a single mutex inside CPython that only lets one thread execute Python bytecode at a time, even on a multi-core machine. It exists because CPython's memory management — reference counting — isn't thread-safe: if two threads decremented the same object's refcount simultaneously without a lock, you'd get corrupted counts, use-after-free, and crashes. Rather than fine-grained locking on every object (which earlier experiments showed made single-threaded code much slower), CPython takes the simplest correct approach: one global lock.

```python
import threading
counter = 0
def incr():
    global counter
    for _ in range(1_000_000):
        counter += 1
threads = [threading.Thread(target=incr) for _ in range(4)]
[t.start() for t in threads]; [t.join() for t in threads]
# counter is still deterministic-ish because the GIL serializes bytecode execution
```

**Say it:** "The GIL is CPython's single mutex around bytecode execution, there to make reference-counting memory management thread-safe without paying for a lock on every object."
**Red flag:** Saying the GIL means "Python can't do multithreading." It can — it just can't run Python *bytecode* on two cores simultaneously; I/O-bound threads still overlap fine because the GIL is released during I/O.

### Is the GIL a language limitation or a CPython detail
**They ask:** "Is the GIL a limitation of the Python language in general, or specific to the CPython interpreter?"

It's an implementation detail of CPython specifically, not a rule of the Python language. The language spec says nothing about a global lock. Other implementations prove it: Jython and IronPython (JVM/.NET-hosted) have no GIL because their host runtimes provide thread-safe memory management differently; PyPy has historically had a GIL of its own for similar reasons to CPython's. The distinction matters in interviews because it shows you know "Python is slow at parallelism" is really "the dominant interpreter has this trade-off," not an inherent language property.

**Say it:** "The GIL belongs to CPython's implementation, not the language — Jython and IronPython don't have one, because their underlying runtimes handle memory safety differently."
**Red flag:** Conflating "Python" and "CPython" — most interview panels are testing whether you know that distinction exists at all.

### GIL scope: threads vs. processes
**They ask:** "Does the GIL have power at the thread level, at the process level?"

The GIL is per-process — each Python process gets its own interpreter and its own GIL, so it only serializes threads *within* that process. This is exactly why `multiprocessing` sidesteps it: spinning up separate processes each with their own interpreter and GIL gives you true parallel execution of Python bytecode across cores, at the cost of separate memory spaces and the overhead of pickling data to move it between them (via `Pipe`/`Queue`/shared memory).

```python
from multiprocessing import Pool
def cpu_heavy(n): return sum(i * i for i in range(n))
with Pool(4) as p:
    results = p.map(cpu_heavy, [10_000_000] * 4)  # true parallel, 4 GILs
```

**Say it:** "The GIL lives per-process, so threads inside one process are serialized but separate processes each get their own GIL — that's the whole reason `multiprocessing` achieves real parallelism where `threading` can't for CPU-bound work."
**Red flag:** Reaching for `threading` to speed up a CPU-bound loop. It won't parallelize bytecode execution; you want `multiprocessing` or a C-extension/numpy call that releases the GIL.

### When the GIL costs you, and when it doesn't
**They ask:** "Can the GIL slow down the execution of a program?"

It costs you specifically on CPU-bound, pure-Python multithreaded code — four threads crunching numbers in a loop run barely faster than one, because they're fighting over the same lock, and you pay thread-switching overhead on top. It costs you *nothing* meaningful on I/O-bound work: the GIL is explicitly released around blocking calls (socket reads, file I/O, `time.sleep`) and around calls into C extensions that opt out (`numpy`, `hashlib`), so those threads genuinely overlap. The senior framing: profile before blaming the GIL — most real-world slowness in web services is I/O-bound, where threads/asyncio already parallelize fine.

**Say it:** "The GIL only bites CPU-bound pure-Python threads — I/O-bound work releases it around blocking calls, so threading still helps there; for CPU-bound work I reach for multiprocessing or a GIL-releasing C extension like numpy."
**Red flag:** Blaming "the GIL" for slow I/O-bound code without profiling first — that's usually a network or database latency problem, not a concurrency-model problem.

### Disabling the GIL
**They ask:** "Is it possible to temporarily disable the GIL?"

As of CPython 3.13, yes — PEP 703 shipped an experimental **free-threaded build** (`python3.13t`) that removes the GIL entirely, using per-object locking and biased reference counting instead. It's opt-in and still marked experimental because a huge amount of the C-extension ecosystem (numpy, pandas and friends) assumes the GIL exists for their own thread safety and needs updates to work correctly without it. Before 3.13, the honest answer was "no" — you couldn't disable it at the Python level; the closest you got was C extensions releasing it around blocking calls via `Py_BEGIN_ALLOW_THREADS`.

**Say it:** "3.13 introduced an experimental free-threaded build that drops the GIL via per-object locking, but it's opt-in — the extension ecosystem is still catching up, so it's not the default yet."
**Red flag:** Claiming the GIL can't ever go away. PEP 703 is real and shipped; the honest nuance is that it's experimental, not that it's impossible.

### Pros and cons of the GIL
**They ask:** "What are the pros and cons of the GIL?"

The pro is simplicity and speed for the common case: single-threaded code (still the vast majority of Python programs) runs faster without the overhead of fine-grained locking on every object, and C extensions are simpler to write because they can assume no other Python thread is touching interpreter state concurrently. The con is exactly what it sounds like: CPU-bound multithreaded Python can't use more than one core, which pushed the ecosystem toward `multiprocessing`, C extensions, and async I/O as the standard workarounds rather than "just add threads."

**Say it:** "The GIL trades multi-core CPU-bound throughput for single-threaded speed and simpler C-extension internals — and that trade-off is exactly why `multiprocessing` and asyncio are the idiomatic Python answers to concurrency, not raw threading."
**Red flag:** Framing the GIL as pure downside with no upside — interviewers are listening for whether you understand *why* the trade-off was made, not just that it exists.

### GIL, deadlocks, and asyncio
**They ask:** "Is the GIL applied at the asyncio level? Is it possible to have a deadlock with the GIL present?"

`asyncio` runs on a single thread by design, so it's not really "subject to" the GIL in a meaningful way — there's only one thread wanting the lock, so contention never happens; the GIL is a non-issue for asyncio's own execution model. Deadlocks *are* still possible with the GIL present, but the GIL itself doesn't cause them — a classic case is a C extension that acquires its own lock while holding the GIL, and another thread tries to acquire the GIL while holding that same lock in the other order (lock-ordering inversion). The GIL prevents Python-*data* races, not application-level deadlocks from your own locking code.

**Say it:** "asyncio is single-threaded so the GIL is a non-factor there; deadlocks still happen when application or C-extension locks are acquired in inconsistent order relative to the GIL, which the GIL itself doesn't protect against."
**Red flag:** Assuming the GIL prevents all concurrency bugs. It only serializes bytecode execution — it doesn't stop you from deadlocking on your own `threading.Lock`s.

### asyncio: the event loop and coroutines
**They ask:** "How does asyncio achieve concurrency without threads, and what is a coroutine?"

`asyncio` gets concurrency from cooperative multitasking on one thread: an `async def` function is a coroutine — it doesn't run until awaited, and every `await` is a checkpoint where it *voluntarily* hands control back to the event loop, which then runs whatever else is ready (another coroutine, a timer callback, an I/O completion). The win is doing thousands of concurrent I/O-bound operations (HTTP calls, DB queries) without the memory and context-switch cost of one OS thread per operation. The trade-off: a coroutine that never awaits (a tight CPU loop) blocks the *entire* event loop, since nothing preempts it.

```python
import asyncio
async def fetch(url):
    await asyncio.sleep(1)   # yields control here, doesn't block the loop
    return f"data from {url}"

async def main():
    results = await asyncio.gather(*(fetch(u) for u in ["a", "b", "c"]))
```

**Say it:** "Coroutines cooperate on one thread — every `await` is a yield point back to the event loop — which is why asyncio scales I/O-bound concurrency cheaply but a CPU-bound coroutine with no `await` blocks everything else."
**Red flag:** Calling an `async def` function without `await`ing or scheduling it. It just returns a coroutine object that never runs — a classic "why didn't my function execute" bug.

### Choosing threading, multiprocessing, or asyncio
**They ask:** "How do you decide between threading, multiprocessing, and asyncio for a concurrency problem?"

The decision hinges on what's actually the bottleneck. **I/O-bound, many concurrent operations** (thousands of HTTP calls, DB queries): `asyncio` wins on resource efficiency — one thread, no per-task OS overhead — but only pays off if your whole I/O stack is async-native (`aiohttp`, async DB drivers); mixing in blocking calls stalls the loop. **I/O-bound, moderate scale, or a legacy blocking library you can't swap**: `threading` — the GIL releases around blocking calls, so a thread pool still overlaps I/O fine with less rewrite. **CPU-bound**: only `multiprocessing` (or delegating to a GIL-releasing C extension) actually parallelizes, because it's the only option with more than one GIL.

**Say it:** "I/O-bound at scale goes to asyncio if the stack is async-native, moderate I/O with blocking libraries goes to threading since the GIL releases there anyway, and CPU-bound work only parallelizes with multiprocessing — three different bottlenecks, three different tools."
**Red flag:** Reaching for asyncio to speed up a CPU-bound computation. It doesn't help at all — a single un-yielding coroutine blocks the loop exactly like a synchronous call would.

### Race conditions and locking with threads
**They ask:** "Given the GIL, can you still get race conditions with `threading` in Python? How do you fix them?"

Yes — the GIL guarantees a single *bytecode instruction* runs atomically, but most operations you care about (`counter += 1`, "check-then-act" patterns) compile to multiple bytecode instructions, and the GIL can switch threads between any of them. So `counter += 1` from two threads can still lose updates. The fix is the same as in any language: a `threading.Lock` around the critical section, or reach for higher-level primitives (`queue.Queue`, which is internally synchronized) instead of hand-rolled shared state.

```python
lock = threading.Lock()
def incr():
    global counter
    for _ in range(1_000_000):
        with lock:
            counter += 1   # now atomic across threads
```

**Say it:** "The GIL only makes single bytecode instructions atomic, not compound operations like `x += 1` — so race conditions are still real in threaded Python, and I guard shared mutable state with a `Lock` or route it through a thread-safe `Queue` instead."
**Red flag:** Assuming "Python has a GIL" means thread-safety is automatic. It isn't — it just changes *which* races are possible, not whether they exist.
