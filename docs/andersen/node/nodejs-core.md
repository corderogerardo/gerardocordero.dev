# Node.js — core async model & modules

### Blocking vs non-blocking IO
**They ask:** "Why is Node's I/O non-blocking by default, and what does that actually save you?"

The whole pitch of Node is one thread serving many concurrent requests, and that only works if I/O never parks that thread. A blocking call (classic synchronous file read, a blocking DB driver) freezes the entire process until the OS returns — every other request queued behind it waits too. A non-blocking call hands the work to the OS or the libuv thread pool, returns immediately, and fires a callback (or resolves a promise) when the result is ready, so the thread stays free to serve other requests in the meantime.

```js
// blocking: nothing else runs until the disk read returns
const data = fs.readFileSync('/big-file.json');

// non-blocking: the thread is free while the read happens off-thread
fs.readFile('/big-file.json', (err, data) => { /* ... */ });
```

This is why one Node process can hold thousands of idle-ish connections (chat, long polling, streaming) cheaply — it's not doing more work in parallel, it's not *wasting* a thread per idle connection.

**Say it:** "Non-blocking I/O means the event loop thread never waits on a syscall — it hands the work off and moves on, which is how one thread serves thousands of concurrent connections."
**Red flag:** Saying Node is "multi-threaded for I/O" without qualifying it — your JS still runs on one thread; only the I/O work itself is offloaded to the OS or the libuv pool.

### What actually happens on an async IO call
**They ask:** "Walk through what happens when you call fs.readFile — where does control go while the disk read happens?"

The call returns to the event loop immediately: `fs.readFile` hands the request to libuv, which either issues it as a truly async OS syscall (sockets, on most platforms) or queues it on the libuv thread pool (file system calls, which POSIX doesn't offer async APIs for). Your JS keeps executing past that line with nothing paused.

When the OS or the pool thread finishes, libuv puts the completion in a queue; the event loop picks it up in the poll phase and invokes your callback with the result. Nothing about this is magic concurrency — it's cooperative handoff between JS (single thread) and libuv (which *does* use OS threads under the hood for the pieces that need them).

**Say it:** "The call itself doesn't block — libuv owns the wait, either via the OS's async I/O or a pool thread, and hands the result back to the event loop as a callback when it's ready."
**Red flag:** Describing `fs.readFile` as "running in the background on another thread" as if that's true for every async API — sockets use OS-level async I/O with no thread pool involved at all; only a specific set of APIs (fs, DNS lookups, some crypto) use the pool.

### Where blocking code sneaks into an async app
**They ask:** "What kinds of code accidentally block the event loop even in an 'async' Node app?"

Async I/O only protects you if the *rest* of your code is fast. A tight synchronous loop, a big JSON.parse/stringify, a synchronous regex with catastrophic backtracking, or a CPU-heavy computation (image resize, password hashing with bcrypt at high cost) all run on the one JS thread and block every other request until they finish — regardless of how many async I/O calls surround them.

```js
// this blocks the event loop for everyone, even though the app is "async"
app.get('/report', (req, res) => {
  const result = heavySynchronousAggregation(hugeArray); // O(n^2), runs sync
  res.json(result);
});
```

The fix is to move CPU-bound work off the main thread (worker_threads, a job queue, a separate service) or chunk it so it yields back to the event loop between pieces.

**Say it:** "Non-blocking I/O doesn't make CPU-bound code free — a synchronous loop or a heavy hash still hogs the one JS thread, so I move that work to worker_threads or a queue instead of pretending async/await fixes it."
**Red flag:** Assuming `async function` automatically means the work inside is non-blocking — `async` only changes how you *consume* a result, it doesn't make synchronous CPU work asynchronous.

### The error-first callback convention
**They ask:** "What is the error-first callback convention and why did Node standardize on it?"

Before promises existed, Node needed one consistent shape for "this async thing might fail," so every core API's callback takes `(err, result)` as its first two arguments — check `err` first, always. Standardizing it meant any two Node APIs composed predictably instead of every library inventing its own error-signaling scheme.

```js
fs.readFile('config.json', (err, data) => {
  if (err) return handleError(err); // always check err first
  console.log(JSON.parse(data));
});
```

**Say it:** "Error-first callbacks give every async Node API the same shape — check `err` before touching the result — which is what made it possible to compose core APIs and third-party libraries predictably before promises existed."
**Red flag:** Forgetting the `return` after handling `err` — code below keeps running on a `data` that's `undefined`, which is a classic source of "cannot read property of undefined" crashes deep in callback-heavy code.

### Callback hell and its fixes
**They ask:** "What is 'callback hell' and how did the ecosystem move past it?"

Nesting callback inside callback to sequence dependent async steps produces a pyramid that's hard to read, hard to add error handling to consistently, and easy to get wrong (forgetting a `return`, handling the same error twice). It's not really about indentation — it's that control flow and error flow both become implicit and scattered.

```js
// callback hell
getUser(id, (err, user) => {
  if (err) return done(err);
  getOrders(user.id, (err, orders) => {
    if (err) return done(err);
    getInvoice(orders[0].id, (err, invoice) => {
      if (err) return done(err);
      done(null, invoice);
    });
  });
});
```

Promises flattened this into `.then()` chains with one `.catch()`; `async/await` flattened it further into code that reads top-to-bottom with ordinary `try/catch`. `util.promisify` bridges old callback APIs into promises so you're not stuck rewriting them.

```js
try {
  const user = await getUser(id);
  const orders = await getOrders(user.id);
  const invoice = await getInvoice(orders[0].id);
} catch (err) { done(err); }
```

**Say it:** "Callback hell is really error-handling and control-flow duplication, not indentation — async/await fixes it by letting one try/catch cover a whole sequence of awaited steps."
**Red flag:** "Just use arrow functions to flatten it" — that's cosmetic; the real fix is collapsing the repeated error branches, which callbacks can't do and async/await can.

### Fibers and coroutines in Node
**They ask:** "What are fibers/coroutines, and why doesn't Node use them the way Ruby or Go do?"

A fiber (or coroutine) is a lightweight, cooperatively-scheduled unit of execution that can suspend and resume without going through the OS scheduler — Go's goroutines and Ruby's Fiber library are examples. They let you write code that *looks* synchronous but yields control at specific points, without needing an event loop and callbacks.

Node deliberately didn't build fibers into the language runtime; instead it built one thread plus an event loop plus callbacks, and later layered promises and async/await on top to get the "looks synchronous" ergonomics without adding a second concurrency primitive. There *was* a userland `fibers` npm package (used by early Meteor and Fibers-based ORMs), but it required a native addon, broke on new V8/Node versions, and effectively died once async/await shipped natively.

**Say it:** "Node solved the same problem fibers solve — writing async code that reads top-to-bottom — with async/await instead, so it never needed a second scheduling primitive competing with the event loop."
**Red flag:** Confusing fibers with worker_threads — fibers are cooperative and share the same thread; worker_threads are real OS threads with separate V8 instances and no shared memory by default.

### Async/await as syntactic coroutines
**They ask:** "How does async/await give you coroutine-like code without real OS-level coroutines?"

`async/await` is sugar over promises: an `async function` implicitly returns a promise, and `await` suspends *that function's* execution until the awaited promise settles — without blocking the event loop, because control returns to it while waiting. Under the hood the engine compiles this into something close to a generator-based state machine: each `await` is a yield point the runtime resumes at when the microtask for that promise runs.

```js
async function loadUser(id) {
  const res = await fetch(`/users/${id}`); // suspends here, event loop keeps running
  return res.json();
}
```

So you get coroutine-like sequential-looking code, but the "suspension" is really: return control to the event loop, register a microtask callback, resume the function when that microtask fires. No OS thread is ever parked.

**Say it:** "await doesn't block anything — it suspends the async function and lets the event loop keep running, then resumes the function as a microtask once the promise settles."
**Red flag:** Saying `await` "pauses the whole program." It pauses only the async function's continuation; every other code path — timers, other requests, other awaits — keeps running.

### module.exports vs exports
**They ask:** "What's the difference between module.exports and exports, and how do people break their module by reassigning exports?"

`exports` is just a variable that Node initializes to point at the same object as `module.exports` — a convenience reference, not a separate thing. Adding properties to `exports` (`exports.foo = ...`) works because you're mutating the object both names point to. But reassigning `exports = { foo }` only repoints the local variable; `module.exports` — the thing `require()` actually returns — still points at the original (now empty) object, so your export silently disappears.

```js
// works: mutating the shared object
exports.add = (a, b) => a + b;

// breaks: exports now points somewhere else; module.exports doesn't
exports = { add: (a, b) => a + b };

// correct way to export a single value/function
module.exports = (a, b) => a + b;
```

**Say it:** "exports is a convenience alias for module.exports at module load time — mutate it and you're fine, reassign it and you've silently orphaned your exports because require() only ever reads module.exports."
**Red flag:** Not knowing that `require()` returns `module.exports`, not `exports` — that's the whole bug in one sentence.

### Node's global objects
**They ask:** "What globals does Node inject into every module that don't exist in the browser?"

Node gives every module `__dirname` and `__filename` (absolute paths, since there's no URL bar to derive them from), `require` and `module` (the CommonJS machinery itself), and `process` (env vars, argv, signals, exit). `global` is Node's equivalent of the browser's `window` — but polluting it is a bigger anti-pattern in Node because modules are meant to be explicit about their dependencies via `require`/`import`, not implicit via shared globals.

```js
console.log(__dirname, __filename); // per-module, not per-app
console.log(process.env.NODE_ENV, process.argv);
```

Note `__dirname`/`__filename`/`require`/`module` aren't truly global — they're per-module locals that Node's module wrapper injects, which is why they differ from file to file (unlike `process` and `global`, which really are shared).

**Say it:** "`__dirname`, `__filename`, `require`, and `module` are per-module locals Node injects via the module wrapper — only `process` and `global` are genuinely shared across the whole app."
**Red flag:** Treating `__dirname` as a real global constant — it's scoped per file, which is exactly why it's useful for building paths relative to the current module.

### package.json and semver ranges
**They ask:** "Walk me through package.json — dependencies vs devDependencies vs peerDependencies, and what ^1.2.3 actually allows."

`dependencies` ship with the package at runtime; `devDependencies` are build/test-only tooling that a consumer never needs installed; `peerDependencies` declare "I need to run alongside a host-provided version of X" (React plugins declaring a peer on `react` so they share the app's single copy instead of bundling their own).

Semver ranges: `^1.2.3` allows anything that doesn't change the leftmost non-zero digit — so up to but not including `2.0.0` (patch and minor bumps only, on the theory that semver promises no breaking changes below a major bump). `~1.2.3` is stricter — only patch bumps, up to but not including `1.3.0`. An exact `1.2.3` pins one version.

```json
{
  "dependencies": { "express": "^4.18.0" },
  "devDependencies": { "jest": "^29.0.0" },
  "peerDependencies": { "react": ">=18" }
}
```

**Say it:** "`^` trusts semver's promise that minor/patch bumps are non-breaking and auto-updates within a major version; `~` is patch-only; peerDependencies say 'the host app supplies this, I just need it to exist.'"
**Red flag:** Trusting `^` ranges blindly in a large team project without a lockfile — semver is a promise, not a guarantee, and a bad minor release can still break your build.

### Why commit package-lock.json
**They ask:** "Why do we commit package-lock.json, and what problem does it solve that semver ranges alone don't?"

`package.json` describes *acceptable* version ranges; `package-lock.json` records the *exact* resolved version (and the exact dependency tree, including transitive deps) that was installed the last time someone ran `npm install`. Without the lockfile, two developers running `npm install` on the same `package.json` weeks apart can get different transitive versions if anything in the tree published a new minor/patch — "works on my machine" bugs and non-reproducible CI builds follow directly from that drift.

Committing the lockfile means `npm ci` (used in CI) installs the *exact same* tree every time, fails fast if the lockfile and package.json disagree, and gives you a diff-able record of what actually changed when a dependency bump lands.

**Say it:** "package.json is a range, package-lock.json is the exact resolution — committing the lockfile is what makes `npm ci` reproducible instead of re-resolving semver ranges fresh on every install."
**Red flag:** Deleting package-lock.json to "fix" an install problem without understanding you're throwing away the exact dependency tree everyone else, and CI, is relying on.

### CommonJS module resolution and caching
**They ask:** "How does require() find and cache a module?"

`require('./foo')` resolves relative paths against the calling file's directory, tries `.js`/`.json`/`.node` extensions, and falls back to `foo/index.js` if `foo` is a directory. `require('some-pkg')` (no leading `./` or `/`) walks up the directory tree checking each `node_modules` folder until it finds a match, all the way to the filesystem root.

Every resolved module is cached by its absolute file path — the *first* `require()` executes the module's top-level code once and caches `module.exports`; every subsequent `require()` of that same path returns the cached object, it does not re-run the file. That's why singletons (a shared DB connection, a config object) "just work" via `require` across a codebase — but it's also why mutating a required object's internals affects every other file that required it.

```js
// db.js runs its top-level code exactly once, no matter how many files require it
const db = require('./db');
```

**Say it:** "require() resolves by absolute path and caches the result on first load — every later require of that path returns the same cached exports object, which is what makes require-based singletons work but also means mutating shared state leaks across every consumer."
**Red flag:** Assuming `require()` re-executes the module file each time you call it — that's not how the cache works, and code that relies on "fresh state per require" will be silently wrong.

### CommonJS vs ES modules
**They ask:** "What are the real differences between CommonJS and native ES modules in Node, and where do they clash?"

CommonJS (`require`/`module.exports`) resolves and loads synchronously and dynamically — you can `require()` conditionally, inside an `if`, computed at runtime. ES modules (`import`/`export`) are statically analyzed: imports are resolved and hoisted before any code runs, which is what lets tools tree-shake dead exports and what makes `import` illegal inside a conditional block (`import()` the *function* form is the escape hatch for dynamic, async loading).

Node needs to know which system a file uses — via `"type": "module"` in package.json, a `.mjs` extension, or `.cjs` to force CommonJS regardless of the package type. The friction point: CommonJS can `require()` an ESM-only package synchronously in older Node without special handling; interop generally requires the dynamic `import()` (async) or waiting for the package to ship a CJS build too.

```js
// ESM — static, hoisted, tree-shakeable
import { readFile } from 'node:fs/promises';
export const load = () => readFile('x');

// CJS — dynamic, synchronous, cached
const { readFile } = require('node:fs/promises');
module.exports = { load: () => readFile('x') };
```

**Say it:** "CommonJS resolves dynamically at runtime and CJS-requiring-ESM is the awkward direction; ESM is statically analyzed at parse time, which is what enables tree-shaking and forces import() as the async escape hatch for dynamic loading."
**Red flag:** Saying "ESM is just newer CommonJS" — they have fundamentally different resolution timing (static vs dynamic), which is exactly why interop between them is a real engineering problem, not a syntax detail.

### Circular dependencies in CommonJS
**They ask:** "What happens when two CommonJS modules require each other?"

Because `require()` caches by path and executes top-to-bottom, a circular `require` doesn't throw — but whichever module is still mid-execution when the cycle closes gets a *partial* (possibly empty) `module.exports` from the other side, because that module hasn't finished populating its exports yet.

```js
// a.js
exports.a = 'a';
const b = require('./b'); // b.js starts requiring a.js mid-way through *its* execution
console.log(b.b); // may be undefined depending on require order

// b.js
const a = require('./a'); // gets a's *partial* exports object at this point
exports.b = 'b';
```

The fix is usually to restructure so the cycle doesn't exist (extract the shared piece into a third module both depend on), or to require lazily *inside* a function body instead of at the top of the file, so the require happens after both modules have finished their initial load.

**Say it:** "A circular require doesn't error — it hands back whatever's been exported so far, which can be an empty object if the cycle closes before the other module finished running, so I break the cycle by extracting the shared piece rather than requiring lazily as a workaround."
**Red flag:** Treating a circular-dependency bug as random or flaky — it's completely deterministic based on require order; tracing which module requires which first tells you exactly what each side sees.
