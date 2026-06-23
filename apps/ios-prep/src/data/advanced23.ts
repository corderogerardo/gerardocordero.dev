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
    answerHtml: `<p>Apple's declarative <b>reactive</b> framework: <b>publishers</b> emit a stream of values
      (and a completion) over time, <b>operators</b> transform that stream, and <b>subscribers</b> consume it.
      You build a processing pipeline once and values flow through it as they arrive.</p>`,
    level: "senior",
  },
  {
    id: "c2",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "What are the three core Combine roles?",
    answerHtml: `<p><b>Publisher</b> (declares <code>Output</code> and <code>Failure</code> types, produces
      values), <b>Subscriber</b> (receives values + completion and signals demand), and <b>Subscription</b> (the
      connection between them, which controls flow and can be cancelled).</p>`,
    level: "senior",
  },
  {
    id: "c3",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "How does @Published relate to Combine?",
    answerHtml: `<p><code>@Published</code> on an <code>ObservableObject</code> exposes a <b>publisher</b>
      (<code>$property</code>) that emits on every change — the Combine machinery behind the older SwiftUI state
      model. You can subscribe to <code>$value</code> to react to changes outside the view layer.</p>`,
    level: "mid",
  },
  {
    id: "c4",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "What do the transforming operators do?",
    answerHtml: `<p><code>map</code>/<code>tryMap</code> transform each value, <code>scan</code> accumulates
      state across values, and <code>flatMap</code> swaps a value for a <i>new publisher</i> (e.g. a value →
      a network request) and flattens the results — the operator you use to chain async steps in a pipeline.</p>`,
    level: "senior",
  },
  {
    id: "c5",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "Name key filtering operators.",
    answerHtml: `<p><code>filter</code> (keep matching values), <code>compactMap</code> (drop nils / transform),
      <code>removeDuplicates</code> (suppress repeats), and <code>first</code>/<code>prefix</code> (limit). They
      shape <i>which</i> values continue down the pipeline.</p>`,
    level: "mid",
  },
  {
    id: "c6",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "How do you combine multiple publishers?",
    answerHtml: `<p><code>combineLatest</code> (emit when <i>any</i> source emits, using each's latest),
      <code>merge</code> (interleave same-typed streams), and <code>zip</code> (pair values in lockstep).
      <code>combineLatest</code> is the go-to for "recompute when any input changes" (e.g. form validation).</p>`,
    level: "senior",
  },
  {
    id: "c7",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "Which operators handle timing, and the classic use?",
    answerHtml: `<p><code>debounce</code> (wait for a pause before emitting), <code>throttle</code> (at most one
      per interval), and <code>delay</code>. The classic: debounce a search field's text so you only query after
      the user stops typing.</p>
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
    answerHtml: `<p>Both are <b>subjects</b> you can imperatively <code>send</code> values into (bridging
      non-Combine code). <code>PassthroughSubject</code> holds no value — subscribers only get values sent
      <i>after</i> they subscribe. <code>CurrentValueSubject</code> holds the latest value and replays it to new
      subscribers (and exposes <code>.value</code>).</p>`,
    level: "senior",
  },
  {
    id: "c9",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "What do subscribe(on:) and receive(on:) control?",
    answerHtml: `<p><code>subscribe(on:)</code> sets the scheduler where the <i>subscription/work</i> starts;
      <code>receive(on:)</code> sets where <i>downstream values</i> are delivered. The common pattern: do work off
      the main thread, then <code>receive(on: DispatchQueue.main)</code> before updating UI.</p>`,
    level: "senior",
  },
  {
    id: "c10",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "How do you manage Combine subscription lifetimes?",
    answerHtml: `<p><code>sink</code>/<code>assign</code> return an <code>AnyCancellable</code>; <b>store</b> it
      (usually in a <code>Set&lt;AnyCancellable&gt;</code> property) so it lives as long as the owner — and is
      auto-cancelled when the owner deallocates. Drop the cancellable on the floor and the subscription is
      cancelled immediately.</p>`,
    level: "senior",
  },
  {
    id: "c11",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "How does error handling work in Combine?",
    answerHtml: `<p>A publisher's <code>Failure</code> type flows to the completion (<code>.finished</code> or
      <code>.failure(error)</code>) — and a failure <b>terminates</b> the stream. Recover with
      <code>catch</code> (swap in another publisher), <code>retry(n)</code>, <code>replaceError(with:)</code>, or
      <code>mapError</code>. To keep a stream alive past errors, handle them inside (e.g.
      <code>flatMap</code> + <code>catch</code>).</p>`,
    level: "senior",
  },
  {
    id: "c12",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "sink vs assign?",
    answerHtml: `<p><code>sink</code> runs closures on received values/completion (general purpose).
      <code>assign(to:on:)</code> writes each value straight to a property via key path
      (<code>assign(to: \\.text, on: label)</code>), and <code>assign(to: &amp;$published)</code> pipes into a
      <code>@Published</code> without manual storage.</p>`,
    level: "senior",
  },
  {
    id: "c13",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "What is demand/backpressure in Combine?",
    answerHtml: `<p>Subscribers request a <b>demand</b> (how many values they're ready for); publishers must not
      exceed it. Most built-in subscribers (<code>sink</code>/<code>assign</code>) request <b>unlimited</b>, so
      you rarely manage it — but custom subscribers can apply backpressure by requesting limited demand.</p>`,
    level: "architect",
  },
  {
    id: "c14",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "Combine vs async/await — when each?",
    answerHtml: `<p><b>async/await</b> for one-shot async work and linear flows (the default now). <b>Combine</b>
      shines for <i>streams</i> of values over time with rich operators (debounce, combineLatest, merge) — though
      <code>AsyncSequence</code>/<code>AsyncStream</code> now cover many of those. Know Combine because large
      existing codebases and <code>@Published</code> rely on it.</p>`,
    level: "senior",
  },
  {
    id: "c15",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "How do Combine and async/await interoperate?",
    answerHtml: `<p>Any publisher exposes a <code>.values</code> <code>AsyncSequence</code> you can
      <code>for await</code> over — bridging Combine → async. Going the other way, <code>Future</code> wraps a
      one-shot async result as a publisher. So you can adopt async/await incrementally without ripping out
      Combine.</p>`,
    level: "senior",
  },
  {
    id: "c16",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "Where does Combine still show up even in async-first code?",
    answerHtml: `<p><code>@Published</code> properties, <code>NotificationCenter.publisher(for:)</code>,
      <code>Timer.publish</code>, <code>URLSession.dataTaskPublisher</code>, and many third-party/legacy APIs.
      So even if you write new logic with async/await, you'll read and bridge Combine pipelines in real
      codebases.</p>`,
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
      operators transform the stream and subscribers consume it.</p>`,
  },
  {
    id: "cz2",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "To debounce a search field in Combine you use:",
    options: ["throttle then map", "debounce(for:scheduler:)", "combineLatest", "zip"],
    answer: 1,
    explanationHtml: `<p><code>debounce</code> waits for a pause in input before emitting — the canonical
      search-as-you-type pattern.</p>`,
  },
  {
    id: "cz3",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "Which subject replays its latest value to new subscribers?",
    options: ["PassthroughSubject", "CurrentValueSubject", "Future", "Empty"],
    answer: 1,
    explanationHtml: `<p><code>CurrentValueSubject</code> holds and replays the latest value (and exposes
      <code>.value</code>); <code>PassthroughSubject</code> only forwards values sent after subscription.</p>`,
  },
  {
    id: "cz4",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "To deliver values on the main thread for UI updates, add:",
    options: ["subscribe(on: .main)", "receive(on: DispatchQueue.main)", "DispatchQueue.main.sync", "@MainActor to the publisher"],
    answer: 1,
    explanationHtml: `<p><code>receive(on:)</code> controls where downstream values are delivered;
      <code>subscribe(on:)</code> controls where the work starts.</p>`,
  },
  {
    id: "cz5",
    category: "concurrency",
    categoryLabel: "Concurrency",
    question: "If you don't store the AnyCancellable from sink:",
    options: ["It runs forever", "The subscription is cancelled immediately", "It leaks", "It crashes"],
    answer: 1,
    explanationHtml: `<p>The subscription's lifetime is tied to the cancellable — drop it and it cancels at
      once. Store it (e.g. in a <code>Set&lt;AnyCancellable&gt;</code>).</p>`,
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
    html: `<p><b>What it is.</b> A reactive pipeline: a <b>publisher</b> (with <code>Output</code>/
      <code>Failure</code> types) emits values over time, <b>operators</b> transform them — <code>map</code>/
      <code>flatMap</code>/<code>scan</code> (transform), <code>filter</code>/<code>compactMap</code>/
      <code>removeDuplicates</code> (filter), <code>combineLatest</code>/<code>merge</code>/<code>zip</code>
      (combine), <code>debounce</code>/<code>throttle</code> (timing) — and a <b>subscriber</b> consumes them.
      <b>Subjects</b> (<code>PassthroughSubject</code>/<code>CurrentValueSubject</code>) let you push values in
      imperatively; <code>@Published</code> is a built-in publisher.</p>
    <div class="callout tip"><span class="lbl">Mental model</span> Build the pipeline once; values flow through
      it. <code>combineLatest</code> = "recompute when any input changes"; <code>debounce</code> = "wait for a
      pause".</div>`,
  },
  {
    id: "st-adv-54",
    num: "69",
    title: "69 · Combine in practice: threading, lifetime & async interop",
    html: `<p><b>What it is.</b> The operational details. Use <code>subscribe(on:)</code> for where work starts
      and <code>receive(on: .main)</code> before touching UI. <b>Store</b> the <code>AnyCancellable</code> from
      <code>sink</code>/<code>assign</code> in a <code>Set&lt;AnyCancellable&gt;</code> (it cancels on dealloc, or
      immediately if dropped). Handle errors with <code>catch</code>/<code>retry</code>/<code>replaceError</code>
      — remember a failure <b>terminates</b> the stream.</p>
    <p><b>vs async/await</b>: prefer async for one-shot work; Combine for value streams/pipelines (and because
      <code>@Published</code>, <code>NotificationCenter.publisher</code>, <code>Timer.publish</code>, and legacy
      code use it). Bridge via a publisher's <code>.values</code> async sequence or <code>Future</code>.</p>
    <div class="callout warn"><span class="lbl">Gotcha</span> A forgotten <code>receive(on: .main)</code> →
      "updating UI from a background thread" bugs; a forgotten <code>.store(in:)</code> → the pipeline silently
      never runs.</div>`,
  },
];
