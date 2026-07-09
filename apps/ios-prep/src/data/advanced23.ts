// Advanced batch 23 — Combine deep-dive (senior). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED23_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED23_FLASHCARDS: Flashcard[] = [
  {
    id: "c1",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "What is Combine?",
    answerHtml: `<p>Combine exists so async state changes propagate declaratively instead of through a web of
      manually-wired callbacks and delegate methods — you build the pipeline once and every future value flows
      through it. Mechanically: <b>publishers</b> emit a stream of values (and a completion) over time,
      <b>operators</b> transform that stream, and <b>subscribers</b> consume it.
      <b>"I use Combine to turn a chain of callbacks into a declarative pipeline I build once."</b></p>`,
    level: "senior",
  },
  {
    id: "c2",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "What are the three core Combine roles?",
    answerHtml: `<p>Splitting the pipeline into three roles is what lets Combine support backpressure and
      cancellation without every publisher reimplementing them. <b>Publisher</b> declares <code>Output</code> and
      <code>Failure</code> types and produces values; <b>Subscriber</b> receives values + completion and signals
      demand; <b>Subscription</b> is the connection between them, controlling flow and cancellation.
      <b>"Publisher produces, Subscriber consumes, Subscription is the live connection you can cancel."</b></p>`,
    level: "senior",
  },
  {
    id: "c3",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "How does @Published relate to Combine?",
    answerHtml: `<p>SwiftUI's older state model needed a way to notify observers outside the view hierarchy too,
      so it's built directly on Combine rather than a bespoke notification system. <code>@Published</code> on an
      <code>ObservableObject</code> exposes a <b>publisher</b> (<code>$property</code>) that emits on every change;
      you can subscribe to <code>$value</code> to react to changes outside the view layer.
      <b>"@Published isn't magic — it's a Combine publisher SwiftUI subscribes to."</b></p>`,
    level: "mid",
  },
  {
    id: "c4",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "What do the transforming operators do?",
    answerHtml: `<p>These are the operators that let a pipeline do actual work, not just pass values through
      unchanged. <code>map</code>/<code>tryMap</code> transform each value, <code>scan</code> accumulates state
      across values, and <code>flatMap</code> swaps a value for a <i>new publisher</i> (e.g. a value → a network
      request) and flattens the results — the operator you use to chain async steps in a pipeline.
      <b>"flatMap is how I turn a value into another async call without leaving the pipeline."</b></p>`,
    level: "senior",
  },
  {
    id: "c5",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "Name key filtering operators.",
    answerHtml: `<p>Filtering keeps downstream operators and the subscriber from doing work on values that don't
      matter. <code>filter</code> keeps matching values, <code>compactMap</code> drops nils / transforms,
      <code>removeDuplicates</code> suppresses repeats, and <code>first</code>/<code>prefix</code> limit the
      stream — they shape <i>which</i> values continue down the pipeline.
      <b>"I filter early in the pipeline so expensive operators downstream only see values that matter."</b></p>`,
    level: "mid",
  },
  {
    id: "c6",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "How do you combine multiple publishers?",
    answerHtml: `<p>Which combinator you pick depends on whether inputs are independent, interchangeable, or
      paired — get this wrong and validation recomputes on the wrong events, or silently misses updates.
      <code>combineLatest</code> emits when <i>any</i> source emits, using each's latest value;
      <code>merge</code> interleaves same-typed streams; <code>zip</code> pairs values in lockstep.
      <code>combineLatest</code> is the go-to for "recompute when any input changes" (e.g. form validation).
      <b>"For form validation across independent fields, combineLatest is the right combinator, not zip."</b></p>`,
    level: "senior",
  },
  {
    id: "c7",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "Which operators handle timing, and the classic use?",
    answerHtml: `<p>Timing operators exist to protect a backend (or the UI) from being hit on every keystroke or
      scroll event instead of once the user actually settles. <code>debounce</code> waits for a pause before
      emitting, <code>throttle</code> allows at most one emission per interval, and <code>delay</code> just
      shifts timing. The classic: debounce a search field's text so you only query after the user stops typing.
      <b>"I debounce search input so we fire one network request per pause, not per keystroke."</b></p>
    <div class="code">$query
  .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
  .removeDuplicates()
  .sink { runSearch($0) }
  .store(in: &amp;cancellables)</div>`,
    level: "senior",
  },
  {
    id: "c8",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "PassthroughSubject vs CurrentValueSubject?",
    answerHtml: `<p>The choice is really "does a late subscriber need to know current state, or only future
      events?" Both are <b>subjects</b> you can imperatively <code>send</code> values into (bridging non-Combine
      code). <code>PassthroughSubject</code> holds no value — subscribers only get values sent <i>after</i> they
      subscribe. <code>CurrentValueSubject</code> holds the latest value and replays it to new subscribers (and
      exposes <code>.value</code>).
      <b>"CurrentValueSubject when late subscribers need current state; PassthroughSubject for pure events."</b></p>
      <p>Red flag: reaching for PassthroughSubject to model state (like "is logged in") — a subscriber that
      attaches after the state changed will simply never see it.</p>`,
    level: "senior",
  },
  {
    id: "c9",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "What do subscribe(on:) and receive(on:) control?",
    answerHtml: `<p>Confusing these two is exactly how "update UI from a background thread" crashes sneak into a
      Combine pipeline. <code>subscribe(on:)</code> sets the scheduler where the <i>subscription/work</i> starts;
      <code>receive(on:)</code> sets where <i>downstream values</i> are delivered. The common pattern: do work off
      the main thread, then <code>receive(on: DispatchQueue.main)</code> before updating UI.
      <b>"subscribe(on:) is where the work runs, receive(on:) is where the result lands — I always receive on main before touching UI."</b></p>
      <p>Red flag: assuming subscribe(on: .main) is enough to keep UI updates safe — it only controls where the
      pipeline starts, not where later values are delivered.</p>`,
    level: "senior",
  },
  {
    id: "c10",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "How do you manage Combine subscription lifetimes?",
    answerHtml: `<p>Combine ties a subscription's lifetime to a value you hold, so forgetting to store it is a
      silent failure, not a crash — the pipeline just never runs. <code>sink</code>/<code>assign</code> return an
      <code>AnyCancellable</code>; <b>store</b> it (usually in a <code>Set&lt;AnyCancellable&gt;</code> property)
      so it lives as long as the owner and is auto-cancelled when the owner deallocates.
      <b>"I always store the AnyCancellable — an unstored one cancels immediately and the pipeline silently never fires."</b></p>
      <p>Red flag: not noticing your sink never runs because the returned cancellable went out of scope
      unretained — no crash, no log, just silence.</p>`,
    level: "senior",
  },
  {
    id: "c11",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "How does error handling work in Combine?",
    answerHtml: `<p>Combine's error model is unforgiving by design — a failure is terminal for the stream, so
      recovery has to be explicit or the whole pipeline dies on the first error. A publisher's <code>Failure</code>
      type flows to the completion (<code>.finished</code> or <code>.failure(error)</code>). Recover with
      <code>catch</code> (swap in another publisher), <code>retry(n)</code>, <code>replaceError(with:)</code>, or
      <code>mapError</code>. To keep a stream alive past errors, handle them inside (e.g.
      <code>flatMap</code> + <code>catch</code>).
      <b>"A Combine failure terminates the whole stream, so I catch inside the flatMap, not outside it, to keep the outer pipeline alive."</b></p>
      <p>Red flag: adding a top-level catch and expecting the pipeline to keep running per-item — the outer
      stream is already gone by the time it fires.</p>`,
    level: "senior",
  },
  {
    id: "c12",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "sink vs assign?",
    answerHtml: `<p>The choice comes down to whether you need custom logic on each value or just want it written
      straight to a property. <code>sink</code> runs closures on received values/completion — general purpose.
      <code>assign(to:on:)</code> writes each value straight to a property via key path
      (<code>assign(to: \\.text, on: label)</code>), and <code>assign(to: &amp;$published)</code> pipes into a
      <code>@Published</code> without manual cancellable storage.
      <b>"assign for a straight value-to-property pipe, sink when I need custom logic or completion handling."</b></p>`,
    level: "senior",
  },
  {
    id: "c13",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "What is demand/backpressure in Combine?",
    answerHtml: `<p>Backpressure is what keeps a fast publisher from overwhelming a slow subscriber — without it
      a producer could push values faster than a consumer can process them. Subscribers request a <b>demand</b>
      (how many values they're ready for); publishers must not exceed it. Most built-in subscribers
      (<code>sink</code>/<code>assign</code>) request <b>unlimited</b>, so you rarely manage it directly, but
      custom subscribers can apply backpressure by requesting limited demand.
      <b>"Combine has backpressure baked into the protocol, even though sink/assign opt out of it by requesting unlimited."</b></p>`,
    level: "architect",
  },
  {
    id: "c14",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "Combine vs async/await — when each?",
    answerHtml: `<p>The role split is one-shot vs. ongoing stream, not "old vs. new." <b>async/await</b> is the
      default for one-shot async work and linear flows. <b>Combine</b> shines for <i>streams</i> of values over
      time with rich operators (debounce, combineLatest, merge), though <code>AsyncSequence</code>/
      <code>AsyncStream</code> now cover many of those cases. Know Combine because large existing codebases and
      <code>@Published</code> rely on it.
      <b>"I reach for async/await for a single result, Combine when I need operators over a stream of values."</b></p>`,
    level: "senior",
  },
  {
    id: "c15",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "How do Combine and async/await interoperate?",
    answerHtml: `<p>This bridging is what makes migrating a codebase incremental instead of a rip-and-replace.
      Any publisher exposes a <code>.values</code> <code>AsyncSequence</code> you can <code>for await</code> over
      — bridging Combine → async. Going the other way, <code>Future</code> wraps a one-shot async result as a
      publisher.
      <b>"I bridge with .values or Future so I can adopt async/await incrementally without ripping out Combine."</b></p>`,
    level: "senior",
  },
  {
    id: "c16",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "Where does Combine still show up even in async-first code?",
    answerHtml: `<p>Even a codebase written entirely with async/await going forward still has to read and bridge
      Combine, because a chunk of the platform's own APIs are publisher-based: <code>@Published</code> properties,
      <code>NotificationCenter.publisher(for:)</code>, <code>Timer.publish</code>,
      <code>URLSession.dataTaskPublisher</code>, and many third-party/legacy APIs.
      <b>"I write new logic in async/await, but I still need to read Combine fluently — @Published and NotificationCenter aren't going away."</b></p>`,
    level: "mid",
  },
];

export const ADVANCED23_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED23_QUIZ: QuizQuestion[] = [
  {
    id: "cz1",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "In Combine, a publisher emits:",
    options: ["Exactly one value", "A stream of values over time plus a completion", "Only errors", "UI views"],
    answer: 1,
    explanationHtml: `<p>Publishers produce zero-or-more values and then a completion (finished or failure);
      operators transform the stream and subscribers consume it. "Exactly one value" describes a
      <code>Future</code>, one specific publisher — not the general contract every publisher follows.</p>`,
  },
  {
    id: "cz2",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "To debounce a search field in Combine you use:",
    options: ["throttle then map", "debounce(for:scheduler:)", "combineLatest", "zip"],
    answer: 1,
    explanationHtml: `<p><code>debounce</code> waits for a pause in input before emitting — the canonical
      search-as-you-type pattern. <code>throttle</code> emits at a fixed cadence regardless of pauses, so it
      still fires mid-typing and doesn't wait for the user to stop.</p>`,
  },
  {
    id: "cz3",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "Which subject replays its latest value to new subscribers?",
    options: ["PassthroughSubject", "CurrentValueSubject", "Future", "Empty"],
    answer: 1,
    explanationHtml: `<p><code>CurrentValueSubject</code> holds and replays the latest value (and exposes
      <code>.value</code>); <code>PassthroughSubject</code> only forwards values sent after subscription — a
      late subscriber to a PassthroughSubject sees nothing until the next send.</p>`,
  },
  {
    id: "cz4",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "To deliver values on the main thread for UI updates, add:",
    options: ["subscribe(on: .main)", "receive(on: DispatchQueue.main)", "DispatchQueue.main.sync", "@MainActor to the publisher"],
    answer: 1,
    explanationHtml: `<p><code>receive(on:)</code> controls where downstream values are delivered;
      <code>subscribe(on:)</code> only controls where the work starts, so setting it to <code>.main</code> does
      not guarantee later values arrive on the main thread — that's the trap in that wrong option.</p>`,
  },
  {
    id: "cz5",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "If you don't store the AnyCancellable from sink:",
    options: ["It runs forever", "The subscription is cancelled immediately", "It leaks", "It crashes"],
    answer: 1,
    explanationHtml: `<p>The subscription's lifetime is tied to the cancellable — drop it and it cancels at
      once, silently, with no crash or log. Store it (e.g. in a <code>Set&lt;AnyCancellable&gt;</code>) rather
      than assuming Combine keeps it alive for you.</p>`,
  },
  {
    id: "cz6",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "A Combine publisher can be consumed with async/await via:",
    options: ["It can't", "its .values AsyncSequence (for await)", "Task.detached", "sink only"],
    answer: 1,
    explanationHtml: `<p>Every publisher exposes <code>.values</code>, an <code>AsyncSequence</code> you can
      <code>for await</code> over — bridging Combine into async code.</p>`,
  },
];

export const ADVANCED23_STUDY: StudySection[] = [
  {
    id: "st-adv-53",
    num: "68",
    title: "68 · Combine: publishers, operators & subjects",
    html: `<p><b>Why it matters.</b> Combine exists to replace ad-hoc callback chains and manual state
      propagation with a pipeline you build once and never re-wire. A <b>publisher</b> (with <code>Output</code>/
      <code>Failure</code> types) emits values over time, <b>operators</b> transform them — <code>map</code>/
      <code>flatMap</code>/<code>scan</code> (transform), <code>filter</code>/<code>compactMap</code>/
      <code>removeDuplicates</code> (filter), <code>combineLatest</code>/<code>merge</code>/<code>zip</code>
      (combine), <code>debounce</code>/<code>throttle</code> (timing) — and a <b>subscriber</b> consumes them.
      <b>Subjects</b> (<code>PassthroughSubject</code>/<code>CurrentValueSubject</code>) let you push values in
      imperatively; <code>@Published</code> is a built-in publisher.</p>
    <div class="callout tip"><span class="lbl">Say this</span> "Build the pipeline once; values flow through it.
      combineLatest = recompute when any input changes, debounce = wait for a pause."</div>`,
  },
  {
    id: "st-adv-54",
    num: "69",
    title: "69 · Combine in practice: threading, lifetime & async interop",
    html: `<p><b>Why it matters.</b> Combine's power is undermined by three easy-to-miss operational details —
      get any one wrong and you ship a UI-thread crash, a pipeline that silently never runs, or an error that
      kills more of the stream than intended. Use <code>subscribe(on:)</code> for where work starts and
      <code>receive(on: .main)</code> before touching UI. <b>Store</b> the <code>AnyCancellable</code> from
      <code>sink</code>/<code>assign</code> in a <code>Set&lt;AnyCancellable&gt;</code> (it cancels on dealloc, or
      immediately if dropped). Handle errors with <code>catch</code>/<code>retry</code>/<code>replaceError</code>
      — remember a failure <b>terminates</b> the stream.</p>
    <p><b>vs async/await</b>: prefer async for one-shot work; Combine for value streams/pipelines (and because
      <code>@Published</code>, <code>NotificationCenter.publisher</code>, <code>Timer.publish</code>, and legacy
      code use it). Bridge via a publisher's <code>.values</code> async sequence or <code>Future</code>.
      <b>"I keep new one-shot logic in async/await but still read Combine fluently for the platform APIs that emit it."</b></p>
    <div class="callout warn"><span class="lbl">Gotcha</span> A forgotten <code>receive(on: .main)</code> →
      "updating UI from a background thread" bugs; a forgotten <code>.store(in:)</code> → the pipeline silently
      never runs.</div>`,
  },
];
