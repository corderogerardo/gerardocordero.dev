// Batch 1 — Kotlin coroutines, structured concurrency & Flow (deep dive).
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED_FLASHCARD_FILTERS: { value: string; label: string }[] = [
  { value: "coroutines", label: "Coroutines" },
];

export const ADVANCED_FLASHCARDS: Flashcard[] = [
  {
    "id": "co-1",
    "category": "coroutines",
    "categoryLabel": "CORO",
    "question": "What is structured concurrency and why does it matter?",
    "answerHtml": "Every coroutine is launched in a <code>CoroutineScope</code> and becomes a child of that scope's <code>Job</code>. Consequences: the scope won't complete until all children finish; cancelling the scope cancels all children; and an uncaught failure in a child cancels the parent and siblings (unless a <code>SupervisorJob</code> isolates them). It matters because it makes leaks structurally impossible — work can't outlive its owner."
  },
  {
    "id": "co-2",
    "category": "coroutines",
    "categoryLabel": "CORO",
    "question": "Difference between launch and async?",
    "answerHtml": "<code>launch</code> starts a coroutine that returns a <code>Job</code> — fire-and-forget, used for side effects. <code>async</code> returns a <code>Deferred&lt;T&gt;</code> whose <code>await()</code> yields a result — used to run things in parallel and combine. Use <code>async</code> only inside a scope you control; a lone <code>async</code> whose exception you never <code>await</code> can swallow errors."
  },
  {
    "id": "co-3",
    "category": "coroutines",
    "categoryLabel": "CORO",
    "question": "Run two network calls in parallel and combine them?",
    "answerHtml": "Wrap them in <code>coroutineScope</code> and <code>async</code> both, then <code>await</code>:\n      <div class=\"code\">suspend fun loadProfile(id: String): Profile = coroutineScope {\n  val user = async { api.user(id) }\n  val posts = async { api.posts(id) }\n  Profile(user.await(), posts.await())\n}</div>\n      Because they share the scope, if either fails the other is cancelled and the exception propagates — no orphaned request."
  },
  {
    "id": "co-4",
    "category": "coroutines",
    "categoryLabel": "CORO",
    "question": "coroutineScope vs supervisorScope?",
    "answerHtml": "<code>coroutineScope</code> propagates failure: if one child throws, the others are cancelled and the scope rethrows. <code>supervisorScope</code> isolates children: one child's failure does <i>not</i> cancel its siblings (each is handled independently). Use <code>supervisorScope</code> when you launch several independent jobs and want one failure not to kill the rest (e.g. loading several widgets on a dashboard)."
  },
  {
    "id": "co-5",
    "category": "coroutines",
    "categoryLabel": "CORO",
    "question": "How does coroutine cancellation actually work?",
    "answerHtml": "Cancellation is <b>cooperative</b>. Cancelling a Job sets it inactive and throws <code>CancellationException</code> at the next suspension point. Code that doesn't suspend (a tight CPU loop) won't notice unless it checks <code>isActive</code> or calls <code>ensureActive()</code>/<code>yield()</code>. Never catch and swallow <code>CancellationException</code> — rethrow it, or your coroutine keeps running after cancellation."
  },
  {
    "id": "co-6",
    "category": "coroutines",
    "categoryLabel": "CORO",
    "question": "Why is catching a generic Exception around suspend code dangerous?",
    "answerHtml": "<code>try { } catch (e: Exception) { }</code> also catches <code>CancellationException</code> (it's an <code>Exception</code>), which breaks structured concurrency — the coroutine looks cancelled but your catch swallows it and keeps going. Either catch specific exceptions, or rethrow cancellation: <code>catch (e: Exception) { if (e is CancellationException) throw e; handle(e) }</code>."
  },
  {
    "id": "co-7",
    "category": "coroutines",
    "categoryLabel": "CORO",
    "question": "What does a CoroutineExceptionHandler do, and where does it work?",
    "answerHtml": "It's an element in the <code>CoroutineContext</code> that catches <b>uncaught</b> exceptions from a <code>launch</code> (root) coroutine. It does <b>not</b> catch exceptions from <code>async</code> (those surface at <code>await</code>), and it must be installed on the <i>root</i> scope/coroutine, not a child. On Android it's a last-resort net; prefer handling errors where they occur and modeling them as state."
  },
  {
    "id": "co-8",
    "category": "coroutines",
    "categoryLabel": "CORO",
    "question": "What's the difference between viewModelScope and a custom scope?",
    "answerHtml": "<code>viewModelScope</code> is a built-in scope tied to the ViewModel; it uses <code>Dispatchers.Main.immediate</code> + a <code>SupervisorJob</code> and is <b>cancelled automatically</b> in <code>onCleared()</code>. That auto-cancellation is why you don't leak. A custom scope you create (<code>CoroutineScope(SupervisorJob() + Dispatchers.Default)</code>) is fine too — but you must cancel it yourself, or it leaks like <code>GlobalScope</code>."
  },
  {
    "id": "co-9",
    "category": "coroutines",
    "categoryLabel": "CORO",
    "question": "Why avoid GlobalScope?",
    "answerHtml": "<code>GlobalScope</code> has application lifetime and no parent — work launched in it is never cancelled by any lifecycle, so it leaks and can update dead UI or run after the user leaves. It also detaches from structured concurrency (no propagation). Use a lifecycle-bound scope (<code>viewModelScope</code>, <code>lifecycleScope</code>) or an injected application scope you manage explicitly."
  },
  {
    "id": "co-10",
    "category": "coroutines",
    "categoryLabel": "CORO",
    "question": "Cold Flow vs hot Flow (StateFlow/SharedFlow)?",
    "answerHtml": "A <b>cold</b> Flow runs its producer block fresh for each collector and only while collected (like a recipe). <b>Hot</b> flows (<code>StateFlow</code>, <code>SharedFlow</code>) emit independently of collectors and are shared — they exist whether or not anyone is listening. Convert cold→hot with <code>stateIn</code>/<code>shareIn</code> to multicast and cache."
  },
  {
    "id": "co-11",
    "category": "coroutines",
    "categoryLabel": "CORO",
    "question": "What does flowOn do, and which direction does it affect?",
    "answerHtml": "<code>flowOn(dispatcher)</code> changes the context of the <b>upstream</b> (everything before it in the chain) — it's context-preservation done right, so the producer can run on <code>IO</code> while the collector stays on <code>Main</code>. It only affects upstream; operators after it run in the collector's context. You can't change the collector's context from inside the flow — that's the collector's job."
  },
  {
    "id": "co-12",
    "category": "coroutines",
    "categoryLabel": "CORO",
    "question": "map/filter vs flatMapLatest/flatMapMerge/flatMapConcat?",
    "answerHtml": "<code>map</code>/<code>filter</code> transform values 1:1. The <code>flatMap*</code> family flattens a flow-of-flows: <b>flatMapLatest</b> cancels the previous inner flow when a new value arrives (search-as-you-type), <b>flatMapMerge</b> runs inners concurrently and merges (parallel fan-out), <b>flatMapConcat</b> processes them sequentially in order. Pick based on whether you want cancellation, concurrency, or ordering."
  },
  {
    "id": "co-13",
    "category": "coroutines",
    "categoryLabel": "CORO",
    "question": "How do combine and zip differ?",
    "answerHtml": "<code>combine</code> emits whenever <i>any</i> source emits, pairing each with the latest of the others — ideal for deriving UI state from several streams. <code>zip</code> pairs emissions by index (1st with 1st, 2nd with 2nd) and waits for both — ideal for strictly correlated pairs. For UI state you almost always want <code>combine</code>."
  },
  {
    "id": "co-14",
    "category": "coroutines",
    "categoryLabel": "CORO",
    "question": "How do you turn a callback-based API into a Flow?",
    "answerHtml": "Use <code>callbackFlow</code>: register the listener, <code>trySend</code> emissions, and <code>awaitClose</code> to unregister when collection stops.\n      <div class=\"code\">fun locationFlow(client: Client): Flow&lt;Loc&gt; = callbackFlow {\n  val cb = object : Listener { override fun onLoc(l: Loc) { trySend(l) } }\n  client.register(cb)\n  awaitClose { client.unregister(cb) }\n}</div>\n      <code>awaitClose</code> is mandatory — it's what prevents the listener leaking when the collector is cancelled."
  },
  {
    "id": "co-15",
    "category": "coroutines",
    "categoryLabel": "CORO",
    "question": "How do you give a suspend operation a timeout?",
    "answerHtml": "<code>withTimeout(ms) { ... }</code> throws <code>TimeoutCancellationException</code> if the block doesn't finish in time (and cancels it); <code>withTimeoutOrNull</code> returns <code>null</code> instead of throwing. Because it cancels cooperatively, the suspended work must hit a suspension point to actually stop. Great for bounding a network call without manual timer plumbing."
  },
  {
    "id": "co-16",
    "category": "coroutines",
    "categoryLabel": "CORO",
    "question": "What is a Mutex and when do you use one instead of synchronized?",
    "answerHtml": "<code>Mutex</code> is a coroutine-friendly lock: <code>mutex.withLock { }</code> <i>suspends</i> instead of blocking a thread, so it won't starve the dispatcher's thread pool. Use it to guard shared mutable state across coroutines. Avoid <code>synchronized</code>/blocking locks inside coroutines — they block a pooled thread and can deadlock with limited dispatchers. Better still, prefer immutable state and confinement to avoid locks entirely."
  },
  {
    "id": "co-17",
    "category": "coroutines",
    "categoryLabel": "CORO",
    "question": "Dispatchers.IO vs Default — and the limitedParallelism trick?",
    "answerHtml": "<code>Default</code> is sized for CPU work (≈ number of cores). <code>IO</code> is a large elastic pool for blocking I/O (up to 64+ threads). They share threads underneath. For a resource that needs serialized access (e.g. a single connection), use <code>Dispatchers.IO.limitedParallelism(1)</code> to cap concurrency without blocking. Never run blocking I/O on <code>Default</code> — you'll starve CPU work."
  },
  {
    "id": "co-18",
    "category": "coroutines",
    "categoryLabel": "CORO",
    "question": "Why does collecting a Flow in a plain launch in onCreate leak work?",
    "answerHtml": "A plain <code>lifecycleScope.launch { flow.collect { } }</code> in <code>onCreate</code> keeps collecting while the app is backgrounded (the scope lives until DESTROYED). That wastes CPU/network and can push updates to an invisible UI. Wrap it in <code>repeatOnLifecycle(STARTED)</code>, which cancels collection when below STARTED and restarts it on return — the canonical fix."
  },
  {
    "id": "co-19",
    "category": "coroutines",
    "categoryLabel": "CORO",
    "question": "Channel vs SharedFlow for events — which and why?",
    "answerHtml": "A <code>Channel</code> is hot and each element is delivered to exactly <b>one</b> receiver (fan-out, not broadcast) — good for a strict producer→consumer queue. A <code>SharedFlow</code> broadcasts to all collectors and can replay. For one-shot UI events many teams use <code>Channel(Channel.BUFFERED).receiveAsFlow()</code> so each event is consumed once (no replay-on-rotation), whereas <code>SharedFlow(replay=0)</code> can drop events if there's no active collector at emit time. Pick Channel for exactly-once delivery, SharedFlow for broadcast."
  },
  {
    "id": "co-20",
    "category": "coroutines",
    "categoryLabel": "CORO",
    "question": "How does an exception propagate from async vs launch?",
    "answerHtml": "<code>launch</code> exposes a failure immediately to its parent (and any <code>CoroutineExceptionHandler</code>). <code>async</code> <b>defers</b> the exception — it's stored in the <code>Deferred</code> and thrown when you call <code>await()</code>. So an <code>async</code> whose result you never await can hide an error (it still cancels the parent scope under structured concurrency, but the specific exception surfaces at await). Always await your <code>async</code> results."
  },
  {
    "id": "co-21",
    "category": "coroutines",
    "categoryLabel": "CORO",
    "question": "What does suspendCancellableCoroutine do?",
    "answerHtml": "It bridges a callback-based, one-shot async API into a <code>suspend</code> function. You get a continuation to <code>resume</code> with a value or <code>resumeWithException</code>, and an <code>invokeOnCancellation</code> hook to clean up (cancel the underlying request) when the coroutine is cancelled. It's the single-value sibling of <code>callbackFlow</code> — use it to wrap something like a one-shot SDK callback with proper cancellation support."
  },
  {
    "id": "co-22",
    "category": "coroutines",
    "categoryLabel": "CORO",
    "question": "buffer vs conflate vs collectLatest — handling a slow collector?",
    "answerHtml": "When the producer outpaces the collector: <code>buffer(n)</code> lets the producer run ahead into a buffer; <code>conflate()</code> keeps only the latest value, dropping intermediates (good for UI state); <code>collectLatest { }</code> cancels the current collector block when a new value arrives and restarts it (good when processing each item is cancellable and only the latest matters). Choose by whether you need all values buffered, only the latest, or cancel-and-restart semantics."
  },
  {
    "id": "co-23",
    "category": "coroutines",
    "categoryLabel": "CORO",
    "question": "Why inject an application-scoped CoroutineScope for fire-and-forget work?",
    "answerHtml": "Some work must outlive a screen (e.g. finish writing an analytics event after the user navigates away) but still be cancellable on app teardown and testable. Instead of <code>GlobalScope</code>, inject an app-scoped <code>CoroutineScope(SupervisorJob() + Dispatchers.Default)</code> via Hilt. It's owned, named, swappable in tests, and cancellable — all the things <code>GlobalScope</code> isn't. Use it sparingly and deliberately."
  },
  {
    "id": "co-24",
    "category": "coroutines",
    "categoryLabel": "CORO",
    "question": "What is the difference between a suspending function and a blocking function?",
    "answerHtml": "A <b>blocking</b> function holds its thread until it returns (e.g. <code>Thread.sleep</code>, synchronous I/O) — wasteful, and on Main it freezes the UI. A <b>suspending</b> function can pause and <i>release</i> its thread at a suspension point (<code>delay</code>, <code>await</code>), letting other coroutines run on that thread, then resume later. That's why thousands of coroutines run on a few threads. Never call a blocking API on a coroutine without <code>withContext(IO)</code>."
  }
];

export const ADVANCED_QUIZ_FILTERS: { value: string; label: string }[] = [
  { value: "coroutines", label: "Coroutines" },
];

export const ADVANCED_QUIZ: QuizQuestion[] = [
  {
    "id": "zc1",
    "category": "coroutines",
    "categoryLabel": "Coroutines",
    "question": "In a coroutineScope, one child throws. What happens to the siblings?",
    "options": [
      "Nothing — they continue independently",
      "They are cancelled and the scope rethrows the exception",
      "Only the parent is cancelled",
      "They restart automatically"
    ],
    "answer": 1,
    "explanationHtml": "<code>coroutineScope</code> propagates failure: a child exception cancels siblings and rethrows. Use <code>supervisorScope</code> if you want failures isolated."
  },
  {
    "id": "zc2",
    "category": "coroutines",
    "categoryLabel": "Coroutines",
    "question": "Why is `catch (e: Exception)` around a suspend call risky?",
    "options": [
      "It is slower than catching Throwable",
      "It also catches CancellationException, breaking structured concurrency",
      "It can't catch IOException",
      "It disables the debugger"
    ],
    "answer": 1,
    "explanationHtml": "<code>CancellationException</code> is an <code>Exception</code>; swallowing it makes a cancelled coroutine keep running. Rethrow cancellation or catch specific types."
  },
  {
    "id": "zc3",
    "category": "coroutines",
    "categoryLabel": "Coroutines",
    "question": "Which operator cancels the previous inner flow when a new value arrives?",
    "options": [
      "flatMapConcat",
      "flatMapMerge",
      "flatMapLatest",
      "zip"
    ],
    "answer": 2,
    "explanationHtml": "<code>flatMapLatest</code> cancels the in-flight inner flow on each new upstream value — the basis of search-as-you-type."
  },
  {
    "id": "zc4",
    "category": "coroutines",
    "categoryLabel": "Coroutines",
    "question": "flowOn(Dispatchers.IO) affects which part of the chain?",
    "options": [
      "The collector and everything after it",
      "Only the terminal operator",
      "The upstream (everything before flowOn)",
      "The entire chain regardless of position"
    ],
    "answer": 2,
    "explanationHtml": "<code>flowOn</code> changes the context of the upstream only; operators after it (and the collector) keep the collector's context."
  },
  {
    "id": "zc5",
    "category": "coroutines",
    "categoryLabel": "Coroutines",
    "question": "What makes coroutine cancellation actually stop a tight CPU loop?",
    "options": [
      "Nothing — it stops instantly",
      "Checking isActive / calling ensureActive() or yield()",
      "Catching CancellationException",
      "Switching to Dispatchers.IO"
    ],
    "answer": 1,
    "explanationHtml": "Cancellation is cooperative and only triggers at suspension points. A non-suspending loop must check <code>isActive</code> or call <code>ensureActive()</code>/<code>yield()</code>."
  },
  {
    "id": "zc6",
    "category": "coroutines",
    "categoryLabel": "Coroutines",
    "question": "Which emits whenever ANY source emits, pairing with the latest of the others?",
    "options": [
      "zip",
      "combine",
      "merge",
      "flatMapConcat"
    ],
    "answer": 1,
    "explanationHtml": "<code>combine</code> reacts to any source and uses the latest of each — ideal for deriving UI state. <code>zip</code> pairs by index and waits for both."
  },
  {
    "id": "zc7",
    "category": "coroutines",
    "categoryLabel": "Coroutines",
    "question": "What is mandatory inside callbackFlow to avoid leaking the listener?",
    "options": [
      "A call to flowOn",
      "awaitClose { unregister() }",
      "A SupervisorJob",
      "A try/finally with Thread.sleep"
    ],
    "answer": 1,
    "explanationHtml": "<code>awaitClose</code> suspends until collection ends and is where you unregister the callback — without it the listener leaks."
  },
  {
    "id": "zc8",
    "category": "coroutines",
    "categoryLabel": "Coroutines",
    "question": "Why prefer Mutex.withLock over synchronized inside a coroutine?",
    "options": [
      "It is faster on all devices",
      "It suspends instead of blocking a pooled thread",
      "It disables cancellation",
      "It requires no imports"
    ],
    "answer": 1,
    "explanationHtml": "<code>Mutex</code> suspends rather than blocking a dispatcher thread, avoiding thread starvation and certain deadlocks with limited dispatchers."
  },
  {
    "id": "zc9",
    "category": "coroutines",
    "categoryLabel": "Coroutines",
    "question": "A Channel-based event delivers each event to…",
    "options": [
      "All collectors (broadcast)",
      "Exactly one receiver",
      "Only the last collector",
      "No one until replay"
    ],
    "answer": 1,
    "explanationHtml": "A <code>Channel</code> fans out — each element goes to exactly one receiver. For one-shot UI events that's why <code>receiveAsFlow()</code> avoids replay-on-rotation. <code>SharedFlow</code> broadcasts."
  },
  {
    "id": "zc10",
    "category": "coroutines",
    "categoryLabel": "Coroutines",
    "question": "Where does an exception from `async` surface?",
    "options": [
      "Immediately at launch",
      "In the CoroutineExceptionHandler only",
      "When you call await() on the Deferred",
      "It is silently ignored forever"
    ],
    "answer": 2,
    "explanationHtml": "<code>async</code> defers the exception into the <code>Deferred</code>; it's thrown at <code>await()</code> (and still cancels the structured parent scope)."
  }
];

export const ADVANCED_STUDY: StudySection[] = [
  {
    "id": "st-co-1",
    "num": "A1",
    "title": "A1 · Structured concurrency in depth",
    "html": "<p>The whole model rests on one rule: <b>a coroutine cannot outlive its scope</b>. A scope owns a <code>Job</code>; every coroutine you launch becomes a child. The scope's job won't complete until all children do, cancellation flows down to every child, and (with a normal <code>Job</code>) a child failure cancels the parent and siblings.</p>\n      <ul>\n        <li><b>SupervisorJob</b> changes only the failure direction: a child failing doesn't cancel siblings, but cancelling the parent still cancels children. <code>viewModelScope</code> uses one so one failed load doesn't nuke the screen.</li>\n        <li><b>Scope from context</b>: <code>CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)</code>. Cancel it in your lifecycle hook.</li>\n        <li><b>coroutineScope { }</b> is a suspend function that creates a child scope and waits for all children — the building block for parallel decomposition with all-or-nothing semantics.</li>\n      </ul>\n      <div class=\"callout tip\"><span class=\"lbl\">Interview line</span> \"I let the scope own cancellation\" — it captures why lifecycle-bound scopes prevent leaks without manual bookkeeping.</div>"
  },
  {
    "id": "st-co-2",
    "num": "A2",
    "title": "A2 · Dispatchers, main-safety & confinement",
    "html": "<p>A suspend function should be callable from the main thread and switch context internally. That's <b>main-safety</b>: <code>withContext(Dispatchers.IO) { blockingIo() }</code> inside the function, so callers never think about threads.</p>\n      <ul>\n        <li><b>Main</b>: UI updates; <code>Main.immediate</code> avoids a re-dispatch when already on Main.</li>\n        <li><b>Default</b>: CPU-bound work, sized to cores. <b>IO</b>: blocking I/O, large elastic pool. They share threads.</li>\n        <li><b>limitedParallelism(n)</b>: cap concurrency for a resource (e.g. <code>IO.limitedParallelism(1)</code> to serialize DB writes) without a blocking lock.</li>\n        <li><b>Inject dispatchers</b> (don't hardcode) so tests pass a <code>TestDispatcher</code> and control virtual time.</li>\n      </ul>"
  },
  {
    "id": "st-co-3",
    "num": "A3",
    "title": "A3 · Flow operators that show up in interviews",
    "html": "<p>Know the families and what each buys you:</p>\n      <ul>\n        <li><b>Context</b>: <code>flowOn</code> (upstream dispatcher), and why you can't switch the collector's context from inside.</li>\n        <li><b>Flattening</b>: <code>flatMapLatest</code> (cancel previous — search), <code>flatMapMerge</code> (concurrent fan-out), <code>flatMapConcat</code> (ordered, sequential).</li>\n        <li><b>Combining</b>: <code>combine</code> (latest of each, reactive state) vs <code>zip</code> (index-paired).</li>\n        <li><b>Backpressure/rate</b>: <code>buffer</code>, <code>conflate</code> (drop intermediate), <code>debounce</code>, <code>sample</code>.</li>\n        <li><b>Sharing</b>: <code>stateIn</code> / <code>shareIn</code> with a <code>SharingStarted</code> policy (<code>WhileSubscribed(5000)</code> to survive rotation).</li>\n      </ul>\n      <div class=\"map\"><span class=\"lbl\">In practice</span> A search screen is the canonical combo: <code>debounce</code> → <code>distinctUntilChanged</code> → <code>flatMapLatest</code> → <code>flowOn(Default)</code>, exposed as <code>StateFlow</code> via <code>stateIn</code>.</div>"
  }
];
