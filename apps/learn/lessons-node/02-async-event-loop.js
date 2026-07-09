window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "async-event-loop",
  title: "The Event Loop & Async",
  emoji: "🔁",
  lang: "ts",
  lessons: [
    {
      id: "callbacks-to-async-await",
      title: "Callbacks → Promises → async/await",
      steps: [
        {
          type: "text",
          md: [
            "## One thread, never waiting",
            "Node runs your code on **a single thread**. That sounds like a weakness until you see the trick: when your code asks for something slow — a database row, an HTTP call, a file — Node hands the wait to the operating system and **moves on to the next request**. When the answer arrives, Node comes back and runs the code that was waiting on it. One thread, thousands of connections, because it is never sitting idle.",
            "This is *non-blocking I/O*, and it is the whole reason Node is good at APIs. Your job as the author is simple to state and easy to break: **never make that one thread sit and wait.** Everything in this module is a variation on that one rule.",
            "> The senior pitch: \"Node isn't fast because it's parallel — it's fast because it refuses to wait. One thread stays busy by never blocking on I/O.\"",
          ],
        },
        {
          type: "text",
          md: [
            "## Three generations of async",
            "The *how* of \"run this when the answer arrives\" evolved three times. You will read all three in real codebases, so you need to recognize them:",
            "1. **Callbacks** — pass a function to be called later. Nest a few and you get the *\"callback pyramid\"*: hard to read, harder to error-handle.\n2. **Promises** — an object representing a value that isn't here *yet*. `.then()` chains the next step, `.catch()` handles failure. Flat, composable.\n3. **async/await** — syntax over Promises that reads like ordinary top-to-bottom code. `await` pauses the function (not the thread) until the Promise settles.",
            "You'll write async/await almost exclusively. But it *is* Promises underneath — an `async` function always returns a `Promise`, and `await` just unwraps one.",
          ],
        },
        {
          type: "code",
          title: "The same fetch, three ways",
          source: String.raw`// 1) Callback — the pyramid starts here
findWalker(id, (err, walker) => {
  if (err) return handle(err);
  findBookings(walker.id, (err, bookings) => {
    if (err) return handle(err);
    render(walker, bookings);
  });
});

// 2) Promise — flat, but still ceremony
findWalker(id)
  .then((walker) => findBookings(walker.id))
  .then((bookings) => render(walker, bookings))
  .catch(handle);

// 3) async/await — reads like a recipe
const walker = await findWalker(id);
const bookings = await findBookings(walker.id);
render(walker, bookings);`,
          caption: "All three do the same thing. The third is the one you write. Note that `await` does not block the thread — while this function is paused on `findWalker`, Node is off serving other requests.",
        },
        {
          type: "text",
          md: [
            "## The cardinal sin: blocking the loop",
            "`await` is safe — it pauses your function and frees the thread. What is **not** safe is a long stretch of *synchronous* work: a big `for` loop, a giant `JSON.parse`, hashing a password with the sync API, recomputing a price for every booking in memory. Synchronous code holds the one thread hostage. While it runs, **every other request is frozen** — no responses go out, health checks time out, the server looks dead.",
            "Imagine a `/reports` endpoint that synchronously recomputes the price of 50,000 bookings on each call. That loop might take 400ms. For those 400ms your entire API — every user, every endpoint — is stalled behind it.",
            "> **Red flag:** in an interview, describing a CPU-heavy synchronous loop in a request handler with no mention of the event loop. The senior move is to name it: \"That blocks the loop — I'd offload it to a worker thread, a queue, or precompute it.\"",
          ],
        },
        {
          type: "code",
          title: "src/reports/reports.service.ts (the trap)",
          source: String.raw`// Blocks the event loop: nothing else runs until this returns
function totalRevenueCentsSync(bookings: Booking[]): number {
  let total = 0;
  for (const b of bookings) {
    total += recomputePrice(b); // heavy, synchronous CPU work
  }
  return total;
}`,
          caption: "There is no `await` here, so there is no yield point. On 50,000 bookings this pins the one thread and freezes the whole server. Awaiting genuinely async work (a DB query) is fine; grinding CPU synchronously is the sin.",
        },
        {
          type: "quiz",
          q: "A request handler runs a synchronous 400ms loop. What happens to the other 200 users connected at that moment?",
          choices: [
            "Their requests are frozen — no responses go out until the loop finishes, because it holds the single thread",
            "Nothing — Node spawns a new thread per request, so they're unaffected",
            "They each get a copy of the loop running in parallel",
            "Node automatically pauses the loop halfway to serve them",
          ],
          answer: 0,
          explain: "There's one thread. A synchronous loop owns it start to finish — no callback, no `await`, nothing else can run until it returns. That's why blocking the loop is the cardinal sin: one slow handler degrades every user at once. `await`ing real I/O is fine; it's synchronous CPU work that freezes everyone.",
          nudge: "How many threads run your JavaScript in Node?",
        },
        {
          type: "text",
          md: [
            "## Your turn: write an async function",
            "An `async` function returns a `Promise`. Inside it, `await` unwraps other Promises so the code reads top-to-bottom. Assume a helper `fetchBookings()` that returns `Promise<Booking[]>`, where each `Booking` has a numeric `priceCents`.",
            "You'll add the money math with `reduce` — summing over an already-fetched array is cheap and fine on the loop.",
          ],
        },
        {
          type: "exercise",
          title: "Sum revenue asynchronously",
          prompt: [
            "Write `totalRevenueCents` as an `async` function returning `Promise<number>`. Inside: `await fetchBookings()` into a `bookings` const, then `return` the sum of every booking's `priceCents` using `bookings.reduce((sum, b) => sum + b.priceCents, 0)`.",
            "> Use `await`, not `.then()` — that's the whole point of `async`.",
          ],
          starter: String.raw`async function totalRevenueCents(): Promise<number> {
  // your code here
}`,
          solution: String.raw`async function totalRevenueCents(): Promise<number> {
  const bookings = await fetchBookings();
  return bookings.reduce((sum, b) => sum + b.priceCents, 0);
}`,
          checks: [
            { re: /async function totalRevenueCents\(\):Promise<number>/, hint: "Mark it `async` and annotate the return type `Promise<number>` — an async function always resolves to a Promise." },
            { re: /const bookings=await fetchBookings\(\)/, hint: "Await the async call: `const bookings = await fetchBookings()`." },
            { re: /reduce\(\(sum,b\)=>sum\+b\.priceCents,0\)/, hint: "Sum with reduce and a starting value of 0: `bookings.reduce((sum, b) => sum + b.priceCents, 0)`." },
          ],
          mustNot: [
            { re: /\.then\(/, hint: "Inside an `async` function, use `await` — leave `.then()` chains behind." },
          ],
          success: "That's the shape of nearly every service method you'll write: async in, await the I/O, return the computed result.",
        },
      ],
    },
    {
      id: "inside-the-event-loop",
      title: "Inside the event loop",
      steps: [
        {
          type: "text",
          md: [
            "## Macrotasks, microtasks, and phases",
            "The event loop runs in **phases**, each with its own queue of callbacks. You don't need all six for interviews, but you need three plus one rule:",
            "- **Timers** — runs `setTimeout` / `setInterval` callbacks whose time is up.\n- **Poll (I/O)** — retrieves and runs I/O callbacks (a DB reply, an incoming request). **This is where most of your code runs.**\n- **Check** — runs `setImmediate` callbacks, right after poll.",
            "These queued callbacks are called **macrotasks**, and Node runs **one per tick** of a phase.",
          ],
        },
        {
          type: "text",
          md: [
            "## Microtasks drain between macrotasks",
            "The rule that trips people up: **between every macrotask, Node fully drains the microtask queues.** Microtasks are `process.nextTick` callbacks and Promise `.then/.catch/.finally`. \"Fully drains\" means it runs *all* of them — including any new ones they schedule — before touching the next macrotask.",
            "And there are **two** microtask queues, in priority order:",
            "1. the **`process.nextTick`** queue (highest priority), then\n2. the **Promise** microtask queue.",
            "So the overall priority is: **synchronous code → `nextTick` → Promise `.then` → next macrotask (timer / I/O / immediate).**",
            "> Mnemonic: sync runs to completion, then microtasks empty *completely*, then exactly one macrotask, then microtasks empty again. Repeat.",
          ],
        },
        {
          type: "text",
          md: [
            "## nextTick vs setImmediate vs setTimeout(0)",
            "- **`process.nextTick(fn)`** — a *microtask*, fired before the loop continues, ahead of Promises. Powerful and dangerous: recursive `nextTick` **starves** the loop, so real I/O never gets a turn.\n- **`setImmediate(fn)`** — a *macrotask* in the **check** phase, i.e. after I/O.\n- **`setTimeout(fn, 0)`** — a *macrotask* in the **timers** phase.",
            "The classic gotcha: at the **top level**, `setTimeout(0)` vs `setImmediate` order is *non-deterministic* (it depends on process startup timing). But **inside an I/O callback**, `setImmediate` **always** fires before `setTimeout(0)` — because you're already past poll, so check comes next. Naming that distinction out loud is a senior signal.",
          ],
        },
        {
          type: "code",
          title: "Predict the output",
          source: String.raw`console.log("A: start");

setTimeout(() => console.log("B: timeout"), 0);
Promise.resolve().then(() => console.log("C: promise"));
process.nextTick(() => console.log("D: nextTick"));

console.log("E: end");`,
          caption: "Two synchronous logs, one timer (macrotask), one Promise (microtask), one nextTick (microtask). Trace it before you flip to the quiz.",
        },
        {
          type: "quiz",
          q: "In the snippet above, in what order do the five labels print?",
          choices: [
            "A, E, D, C, B",
            "A, E, B, D, C",
            "A, E, C, D, B",
            "A, B, C, D, E",
          ],
          answer: 0,
          explain: "Synchronous first, top to bottom: A then E. Now the microtask queues drain before any macrotask — nextTick outranks Promises, so D then C. Only then does Node run a macrotask: the timer, B. Result: A, E, D, C, B.",
          nudge: "Sync code finishes first. Then which drains before timers — microtasks or macrotasks? And within microtasks, nextTick or Promise?",
        },
        {
          type: "text",
          md: [
            "## Why this matters past trivia",
            "Predicting output is the interview drill, but the real lesson is the **priority ladder**. It's why a `nextTick` can accidentally starve I/O, why a flood of resolved Promises delays your timers, and why \"it logged in a weird order\" is almost always microtask-vs-macrotask, not a bug.",
            "> Benchmark from the hiring side: *\"can predict the output of a mixed nextTick / Promise / setTimeout / setImmediate snippet without hesitation.\"* That's the bar this lesson clears.",
          ],
        },
        {
          type: "quiz",
          q: "Between two macrotasks, how much of the microtask queue does Node process?",
          choices: [
            "All of it — including microtasks scheduled by those microtasks — before the next macrotask",
            "Exactly one microtask, then the next macrotask",
            "None; microtasks only run when the loop is otherwise idle",
            "Half now, half after the next macrotask, to stay fair",
          ],
          answer: 0,
          explain: "Microtask queues are drained to empty between macrotasks — if a microtask schedules another microtask, that runs too, before the loop moves on. This is exactly why unbounded recursive `process.nextTick` can starve the event loop: the queue never empties, so I/O never gets its turn.",
          nudge: "Think about how recursive `nextTick` manages to starve I/O — what would have to be true about draining for that to happen?",
        },
      ],
    },
    {
      id: "parallel-awaits",
      title: "Parallel awaits & error handling",
      steps: [
        {
          type: "text",
          md: [
            "## Sequential await is a trap",
            "`await` reads so naturally that it's easy to write it wrong. Two independent calls, one after another, run **in series** — the second doesn't even start until the first finishes. If each takes 100ms, you just spent 200ms doing what should take 100.",
            "The tell: two `await`s in a row where the second **doesn't use the first's result**. That's a signal they could run at the same time.",
          ],
        },
        {
          type: "code",
          title: "The sequential version (slow)",
          source: String.raw`// walker and bookings don't depend on each other,
// yet bookings waits for walker to finish first: ~200ms total
const walker = await fetchWalker(walkerId);
const bookings = await fetchBookings(walkerId);
return { walker, bookings };`,
          caption: "Two round-trips that could have overlapped, run back to back. On a hot path this is the difference between a snappy endpoint and a sluggish one.",
        },
        {
          type: "text",
          md: [
            "## Promise.all overlaps independent work",
            "`Promise.all([...])` starts every Promise **immediately** and waits for all of them together. Now the two 100ms calls overlap and finish in ~100ms. Destructure the resolved array to name the results.",
            "Know its failure mode: `Promise.all` is **fail-fast** — if any Promise rejects, the whole thing rejects with that first error (the others keep running but their results are discarded). When you want *every* result regardless of individual failures, reach for **`Promise.allSettled`**, which never rejects and hands back `{ status, value }` or `{ status, reason }` for each.",
            "> Pitch line: \"Independent awaits go in a `Promise.all`. Sequential `await` is for when step two needs step one's result — otherwise it's latency I'm leaving on the table.\"",
          ],
        },
        {
          type: "text",
          md: [
            "## Errors: wrap await in try/catch",
            "A rejected Promise that you `await` **throws**. So you catch it with an ordinary `try/catch` — the same construct as synchronous code, which is a big part of why async/await won.",
            "```ts\ntry {\n  const walker = await fetchWalker(id);\n  return walker;\n} catch (err) {\n  logger.error(err);\n  throw new NotFoundException();\n}\n```",
            "One `try/catch` around your awaits handles both a thrown error and a rejected Promise. Miss it and a rejection becomes an *unhandled rejection* — which in modern Node can crash the process.",
          ],
        },
        {
          type: "code",
          title: "src/dashboard/dashboard.service.ts (parallel + guarded)",
          source: String.raw`async function loadDashboard(walkerId: string) {
  try {
    const [walker, bookings] = await Promise.all([
      fetchWalker(walkerId),
      fetchBookings(walkerId),
    ]);
    return { walker, bookings };
  } catch (err) {
    logger.error("dashboard load failed", err);
    throw err;
  }
}`,
          caption: "Independent calls overlapped in a `Promise.all`, the whole thing guarded by one `try/catch`. This is the shape of a real service method.",
        },
        {
          type: "quiz",
          q: "`fetchWalker` takes 120ms and `fetchBookings` takes 90ms, and they don't depend on each other. Roughly how long does `await Promise.all([fetchWalker(), fetchBookings()])` take?",
          choices: [
            "~120ms — they run at the same time, so you wait for the slower one",
            "~210ms — the two durations add up",
            "~90ms — Promise.all returns as soon as the first one finishes",
            "~0ms — Promise.all doesn't actually wait",
          ],
          answer: 0,
          explain: "Promise.all starts both immediately and resolves when *all* have settled, so the total is the slowest one, ~120ms — not the sum. Awaiting them sequentially would have cost ~210ms. (If you wanted 'as soon as the first finishes,' that's `Promise.race`, not `all`.)",
          nudge: "They overlap. Waiting for all of them means waiting for the longest, not the total.",
        },
        {
          type: "text",
          md: [
            "## Your turn: parallelize it",
            "Below is the slow sequential version. `fetchWalker(walkerId)` and `fetchBookings(walkerId)` are independent — the second doesn't need the first. Rewrite the body so both start at once.",
          ],
        },
        {
          type: "exercise",
          title: "Convert two sequential awaits to Promise.all",
          prompt: [
            "Replace the two sequential awaits with a single `await Promise.all([...])`. Pass `fetchWalker(walkerId)` and `fetchBookings(walkerId)` into the array, and destructure the result into `const [walker, bookings]`. Keep the `return { walker, bookings }`.",
          ],
          starter: String.raw`async function loadDashboard(walkerId: string) {
  // Replace the two sequential awaits with one Promise.all.
  // your code here
  return { walker, bookings };
}`,
          solution: String.raw`async function loadDashboard(walkerId: string) {
  const [walker, bookings] = await Promise.all([
    fetchWalker(walkerId),
    fetchBookings(walkerId),
  ]);
  return { walker, bookings };
}`,
          checks: [
            { re: /await Promise\.all\(\[/, hint: "Wrap the calls in one `await Promise.all([ ... ])` so they start together." },
            { re: /const\[walker,bookings\]=/, hint: "Destructure the resolved array: `const [walker, bookings] = await Promise.all(...)`." },
            { re: /fetchWalker\(walkerId\),fetchBookings\(walkerId\)/, hint: "Put both calls inside the array, comma-separated: `[fetchWalker(walkerId), fetchBookings(walkerId)]`." },
          ],
          mustNot: [
            { re: /const walker=await fetchWalker/, hint: "That's the sequential version you're replacing — don't await them one at a time; hand both to Promise.all." },
          ],
          success: "Two round-trips now overlap instead of stacking. That single change is one of the most common latency wins in a Node service.",
        },
      ],
    },
  ],
});
