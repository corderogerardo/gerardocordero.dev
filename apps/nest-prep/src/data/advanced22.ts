// Batch 22 — Async patterns & combinators: Promise.all / allSettled / race / any and their settle semantics, the sequential-await performance smell, error handling in chains vs async fns plus the process-level last-resort nets, and async iterators/generators for paginated APIs and stream consumption.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";

export const ADVANCED22_FLASHCARDS: Flashcard[] = [
  {
    id: "a22-promise-all-1",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `What are the three defining behaviors of Promise.all — ordering, fail-fast, and rejection?`,
    answerHtml: `<p><code>Promise.all(iterable)</code> waits for <b>every</b> promise to fulfill and resolves to an array of their values <b>in input order</b>, regardless of which settled first. It is <b>fail-fast</b>: the moment any one input rejects, the returned promise rejects with <i>that first rejection reason</i> and the others' outcomes are discarded (they keep running — <code>all</code> doesn't cancel them, it just stops waiting). Use it when you need <i>all</i> results and any failure means the whole operation is invalid.</p><p><b>Pitch:</b> "<code>Promise.all</code> is all-or-nothing with order preserved — perfect when a partial result is useless, wrong when one flaky call shouldn't sink the batch."</p>`,
  },
  {
    id: "a22-allsettled-1",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `How does Promise.allSettled differ from Promise.all, and what shape are its results?`,
    answerHtml: `<p><code>Promise.allSettled</code> <b>never rejects</b> — it waits for every input to settle and resolves to an array of outcome objects, one per input in order. Each is either <code>{ status: 'fulfilled', value }</code> or <code>{ status: 'rejected', reason }</code>. You inspect <code>status</code> to branch per item. Reach for it when you want <i>every</i> result and a single failure must not discard the successes — sending N notifications, fanning out to independent services, batch imports where you report which rows failed.</p><p><b>Red flag:</b> using <code>Promise.all</code> for "fire these N independent jobs and tell me which succeeded" — one rejection throws away every other result. That's <code>allSettled</code>'s job.</p>`,
  },
  {
    id: "a22-race-1",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `What does Promise.race settle to, and why is "first to settle" different from "first to succeed"?`,
    answerHtml: `<p><code>Promise.race</code> settles as soon as the <b>first</b> input settles — adopting that outcome whether it <b>fulfilled or rejected</b>. So a fast rejection beats a slow success and rejects the race. The classic use is a <b>timeout</b>: race the real work against a promise that rejects after N ms, and whichever finishes first wins. If you want "first one to <i>succeed</i>, ignore rejections" you want <code>Promise.any</code>, not <code>race</code>.</p><p><b>Red flag:</b> reaching for <code>race</code> to get the first successful response from mirrored servers — a single fast error kills it. That's <code>any</code>.</p>`,
  },
  {
    id: "a22-any-1",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `What does Promise.any resolve to, and what happens when every input rejects?`,
    answerHtml: `<p><code>Promise.any</code> resolves with the value of the <b>first input to fulfill</b>, ignoring rejections. It only rejects if <b>all</b> inputs reject — and then it rejects with an <code>AggregateError</code> whose <code>.errors</code> array holds every individual reason (in input order). It's the "first success wins" combinator: query several mirrors/replicas and take whichever answers first, tolerating that some fail.</p><p><b>Mental model:</b> <code>any</code> is to <code>race</code> what <code>allSettled</code> is to <code>all</code> — the failure-tolerant sibling. <code>race</code> = first to settle; <code>any</code> = first to <i>succeed</i>.</p>`,
  },
  {
    id: "a22-combinator-matrix-1",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `Give the one-line decision matrix for all / allSettled / race / any.`,
    answerHtml: `<ul><li><b>Need every result, any failure aborts</b> → <code>Promise.all</code> (fail-fast, ordered array).</li><li><b>Need every result, failures reported not fatal</b> → <code>Promise.allSettled</code> (never rejects; <code>{status,value|reason}[]</code>).</li><li><b>First to finish wins, success or error</b> → <code>Promise.race</code> (timeouts).</li><li><b>First success wins, tolerate failures</b> → <code>Promise.any</code> (<code>AggregateError</code> only if all reject).</li></ul><p><b>Interview framing:</b> two axes — "do I need <i>all</i> or just <i>one</i>?" and "does a rejection <i>stop</i> me or just <i>get recorded</i>?" The four combinators are exactly the four cells.</p>`,
  },
  {
    id: "a22-sequential-await-smell-1",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `What is the "sequential awaits that should be parallel" performance smell, and how do you fix it?`,
    answerHtml: `<p>Independent async calls awaited one after another run <b>serially</b>, so total latency is the <i>sum</i> instead of the <i>max</i>:</p><pre><code>// SMELL: ~300ms — each await blocks the next
const a = await getUser(id);
const b = await getOrders(id);
const c = await getPrefs(id);</code></pre><p>If none depend on each other, kick them all off first, then await together:</p><pre><code>// FIX: ~100ms — all three overlap
const [a, b, c] = await Promise.all([
  getUser(id), getOrders(id), getPrefs(id),
]);</code></pre><p><b>Red flag in code review:</b> back-to-back <code>await</code>s where line N doesn't use line N-1's result. Only serialize when there's a genuine data dependency.</p>`,
  },
  {
    id: "a22-await-in-loop-1",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `Why is "await inside a for-loop" often a red flag, and what's the parallel rewrite?`,
    answerHtml: `<p><code>await</code> in a loop body makes each iteration wait for the previous one to finish — N items means N sequential round-trips. When the iterations are independent, map them to promises and await the batch:</p><pre><code>// SLOW: N round-trips back to back
for (const id of ids) results.push(await fetch(id));

// FAST: all N in flight, resolved together
const results = await Promise.all(ids.map(id => fetch(id)));</code></pre><p><b>Nuance to say out loud:</b> unbounded <code>map</code> + <code>Promise.all</code> can open <i>thousands</i> of connections at once and hammer the downstream. Cap concurrency (a pool / <code>p-limit</code> / chunked batches) when N is large. And keep the loop sequential when each iteration genuinely depends on the last (pagination cursors, rate-limit backoff).</p>`,
  },
  {
    id: "a22-error-chains-1",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `What are the error-handling rules for promise chains versus async/await, and why does a missing catch matter?`,
    answerHtml: `<p>In a <code>.then()</code> chain, always terminate with <code>.catch()</code> — one <code>catch</code> at the end handles a rejection from <i>any</i> upstream link. In an <code>async</code> function, wrap awaited calls in <code>try/catch</code>; an <code>await</code> on a rejected promise <i>throws</i>, so it behaves like synchronous error flow. A rejection with no handler anywhere becomes an <b>unhandled rejection</b> — in modern Node that terminates the process by default.</p><p><b>Red flag:</b> firing an async function and not awaiting it and not attaching <code>.catch()</code> — a "floating promise." If it rejects, the error surfaces nowhere useful and can crash the process later. Either <code>await</code> it or attach a <code>.catch()</code>.</p>`,
  },
  {
    id: "a22-process-handlers-1",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `What are process.on('unhandledRejection') and 'uncaughtException' for, and why must they be last-resort nets that exit?`,
    answerHtml: `<p><code>process.on('uncaughtException')</code> fires for a synchronous throw that escaped every <code>try/catch</code>; <code>process.on('unhandledRejection')</code> fires for a rejected promise no <code>.catch()</code> ever handled. They exist to <b>log the fatal error and shut down gracefully</b> — flush logs, close the server/DB pool, then <code>process.exit(1)</code> — <i>not</i> to swallow the error and keep running.</p><p><b>Why exit:</b> after an uncaught exception the process is in an <i>unknown, possibly corrupted</i> state (half-open transactions, leaked handles). Continuing risks silent data corruption. The senior stance: "these handlers are a black box recorder, not a resurrection spell — log, drain, exit, and let the supervisor (systemd / PM2 / k8s) restart a clean process." Real fixes live in local <code>try/catch</code> and <code>.catch()</code>.</p>`,
  },
  {
    id: "a22-async-iterator-1",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `What is an async iterator and how does for await...of consume one?`,
    answerHtml: `<p>An async iterable exposes <code>Symbol.asyncIterator</code>, whose <code>next()</code> returns a <code>Promise&lt;{ value, done }&gt;</code>. <code>for await (const x of source)</code> awaits each <code>next()</code> in turn, so you write a clean sequential loop over values that arrive <i>over time</i> — no manual <code>.next().then()</code> plumbing. Node streams are async iterables, so <code>for await (const chunk of readable)</code> consumes a file/HTTP/DB stream with automatic backpressure: the loop body's <code>await</code> pauses reading until you're ready for the next chunk.</p><p><b>Why it matters:</b> it turns callback/event-driven streaming into ordinary control flow you can <code>try/catch</code> and <code>break</code> out of.</p>`,
  },
  {
    id: "a22-async-generator-pagination-1",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `How do async generators cleanly express a paginated API, and what's the payoff over collecting everything up front?`,
    answerHtml: `<p>An <code>async function*</code> can <code>await</code> a page fetch and <code>yield</code> items one page at a time, hiding the cursor loop behind an iterable:</p><pre><code>async function* pages(url) {
  let next = url;
  while (next) {
    const res = await fetch(next).then(r => r.json());
    yield* res.items;            // stream this page's items
    next = res.nextPageUrl;      // advance the cursor
  }
}
for await (const item of pages(api)) { process(item); }</code></pre><p><b>Payoff:</b> the caller iterates one flat stream and never sees pagination; it's <b>lazy</b> (a page is fetched only when the previous one is exhausted) and <b>constant-memory</b> — you never hold all N pages at once. <code>break</code> stops fetching further pages entirely.</p>`,
  },
  {
    id: "a22-race-timeout-pattern-1",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `Show the canonical Promise.race timeout wrapper and name its one leak to watch for.`,
    answerHtml: `<pre><code>function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), ms);
  });
  return Promise.race([promise, timeout])
    .finally(() => clearTimeout(timer));
}</code></pre><p><code>race</code> settles with whichever finishes first — the real work or the timeout rejection. <b>The leak:</b> if you forget the <code>clearTimeout</code>, the timer keeps the event loop alive (and in a long-lived server, timers pile up). The <code>.finally</code> cleans it up whichever side wins. Note <code>race</code> doesn't <i>cancel</i> the slow promise — it keeps running; for true cancellation you pass an <code>AbortSignal</code> into the underlying call.</p>`,
  },
  {
    id: "a22-first-rejection-reason-1",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `When Promise.all rejects, which reason do you get, and when do you reach for allSettled instead?`,
    answerHtml: `<p><code>Promise.all</code> rejects with the reason of the <b>first promise to reject</b> (by settle time, not input position). Any later rejections are lost — you never see them, and you never see the values of the ones that succeeded. If you need to know the fate of <i>every</i> input — which succeeded, which failed and why — switch to <code>Promise.allSettled</code> and read each result's <code>status</code>/<code>reason</code>. Rule of thumb: <code>all</code> when the first failure is genuinely a stop-the-world event; <code>allSettled</code> when partial success is meaningful and you want a per-item report.</p>`,
  },
];

export const ADVANCED22_QUIZ: QuizQuestion[] = [
  {
    id: "a22-qz-1",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `Consider: Promise.all([Promise.resolve(1), Promise.reject(new Error('boom')), Promise.resolve(3)]) versus Promise.allSettled([...the same...]). What does each produce?`,
    options: [
      `Both reject with Error('boom')`,
      `all rejects with Error('boom'); allSettled resolves to [{status:'fulfilled',value:1},{status:'rejected',reason:Error('boom')},{status:'fulfilled',value:3}]`,
      `all resolves to [1, undefined, 3]; allSettled rejects with Error('boom')`,
      `all resolves to [1, 3]; allSettled resolves to [1, 3] with the rejected one skipped`,
    ],
    answer: 1,
    explanationHtml: `<p><code>Promise.all</code> is fail-fast: the rejected input makes the whole thing reject with that first reason (<code>Error('boom')</code>), discarding the <code>1</code> and <code>3</code>. <code>Promise.allSettled</code> <b>never rejects</b> — it waits for all three to settle and returns one outcome object per input, in order: two <code>{status:'fulfilled', value}</code> and one <code>{status:'rejected', reason}</code>. That per-item report is exactly why you pick <code>allSettled</code> when partial success matters.</p>`,
  },
  {
    id: "a22-qz-2",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `You want the first server among several mirrors that returns a successful response, tolerating that some mirrors error out. Which combinator fits?`,
    options: [
      `Promise.race — it returns the first to settle`,
      `Promise.all — it waits for every mirror`,
      `Promise.any — first fulfillment wins; rejects only if all reject`,
      `Promise.allSettled — it never rejects`,
    ],
    answer: 2,
    explanationHtml: `<p><code>Promise.any</code> resolves with the first input to <b>fulfill</b>, ignoring rejections, and only rejects (with an <code>AggregateError</code>) if <i>every</i> input rejects. <code>Promise.race</code> is the trap here: it settles on the first to <i>settle</i> — a fast rejection from one mirror would kill it. "First success, tolerate failures" is precisely <code>any</code>.</p>`,
  },
  {
    id: "a22-qz-3",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `Three independent fetches each take ~100ms. What's the latency of running them as three back-to-back awaits versus one Promise.all of the three?`,
    options: [
      `~100ms sequential vs ~300ms with Promise.all`,
      `~300ms sequential vs ~100ms with Promise.all`,
      `~300ms in both cases — Promise.all changes nothing`,
      `~100ms in both cases — JS awaits run in parallel automatically`,
    ],
    answer: 1,
    explanationHtml: `<p>Back-to-back <code>await</code>s serialize: each blocks the next, so total time is the <i>sum</i> (~300ms). <code>Promise.all([...])</code> starts all three before awaiting, so they overlap and total time is the <i>max</i> (~100ms). This is the "sequential awaits that should be parallel" smell — it only applies when the calls are independent; a real data dependency forces sequencing.</p>`,
  },
  {
    id: "a22-qz-4",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `In modern Node, what is the correct role of process.on('uncaughtException') / process.on('unhandledRejection')?`,
    options: [
      `A place to swallow the error and keep the process running as if nothing happened`,
      `A last-resort net: log the fatal error, gracefully shut down (flush/close resources), then exit so a clean process restarts`,
      `A replacement for local try/catch — put all error handling there instead`,
      `They fire on every caught error, so they're the primary logging hook`,
    ],
    answer: 1,
    explanationHtml: `<p>These handlers catch errors that escaped all local handling. After an uncaught exception the process may be in a corrupted state (half-open transactions, leaked handles), so the safe move is to <b>log, drain/close resources, then <code>process.exit(1)</code></b> and let a supervisor restart a fresh process. Swallowing and continuing risks silent data corruption. They are a black-box recorder, not a substitute for <code>try/catch</code> and <code>.catch()</code> at the real failure sites.</p>`,
  },
  {
    id: "a22-qz-5",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `You're consuming a paginated REST API and want to iterate every item lazily without holding all pages in memory. What's the idiomatic tool?`,
    options: [
      `Recursively call Promise.all until nextPageUrl is null, concatenating every page's items`,
      `An async generator (async function*) that awaits each page and yields its items, consumed with for await...of`,
      `A plain synchronous generator (function*) yielding fetch() promises`,
      `Promise.race across all pages to get whichever returns first`,
    ],
    answer: 1,
    explanationHtml: `<p>An <code>async function*</code> can <code>await</code> a page fetch and <code>yield</code> its items, advancing the cursor in a loop; the caller drives it with <code>for await...of</code>. It's <b>lazy</b> (next page fetched only when the current is exhausted) and <b>constant-memory</b> (you never hold all pages at once), and <code>break</code> stops further fetches. A plain <code>function*</code> can't <code>await</code>, and <code>Promise.all</code>/collect-everything defeats the memory goal.</p>`,
  },
];
