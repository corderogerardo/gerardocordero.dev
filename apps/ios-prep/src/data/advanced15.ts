// Advanced batch 15 — Debugging & Instruments deep-dive (senior). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED15_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED15_FLASHCARDS: Flashcard[] = [
  {
    id: "v1",
    category: "test",
    categoryLabel: "Testing",
    question: "What are the LLDB commands you actually use?",
    answerHtml: `<p><code>po expr</code> (print object description), <code>p</code>/<code>v</code> (print value /
      fast frame-variable read), <code>bt</code> (backtrace), <code>frame variable</code>, and step/continue
      (<code>n</code>, <code>s</code>, <code>c</code>). <code>expression</code> lets you run/mutate code at a
      breakpoint to test a fix live.</p>`,
    level: "senior",
  },
  {
    id: "v2",
    category: "test",
    categoryLabel: "Testing",
    question: "What can breakpoints do beyond pausing?",
    answerHtml: `<p><b>Conditional</b> (break only when an expression is true), <b>symbolic</b> (break on a method
      name across all types, e.g. <code>-[UIViewController viewDidAppear:]</code>), and <b>actions</b> (log,
      run a command, play a sound, then auto-continue). Add a <b>Swift error</b> / <b>exception</b> breakpoint to
      stop exactly where a throw or crash originates.</p>`,
    level: "senior",
  },
  {
    id: "v3",
    category: "test",
    categoryLabel: "Testing",
    question: "What is a watchpoint?",
    answerHtml: `<p>A breakpoint on <b>data</b>: it stops execution when a particular variable/memory address
      <i>changes</i>. Perfect for "who is mutating this property?" — set it on the value and LLDB breaks at the
      write, showing the culprit in the backtrace.</p>`,
    level: "senior",
  },
  {
    id: "v4",
    category: "test",
    categoryLabel: "Testing",
    question: "Why might po show nothing useful in a Release build?",
    answerHtml: `<p>Optimizations (<code>-O</code>) inline and elide variables, so locals may be unavailable and
      stacks look "wrong". Debug meaningfully in a <b>Debug</b> build; when you must inspect Release, rely on the
      crash report's symbolicated stack and add logging — don't trust ad-hoc <code>po</code> of optimized
      locals.</p>`,
    level: "senior",
  },
  {
    id: "v5",
    category: "perf",
    categoryLabel: "Performance",
    question: "How should you profile with Instruments?",
    answerHtml: `<p>Profile a <b>Release</b> build on a <b>real device</b> (the simulator's performance isn't
      representative), reproduce the specific scenario, pick the matching template, find the single biggest cost,
      fix it, and re-measure. Never optimize Debug builds or the simulator.</p>`,
    level: "senior",
  },
  {
    id: "v6",
    category: "perf",
    categoryLabel: "Performance",
    question: "What does the Time Profiler tell you?",
    answerHtml: `<p>Where CPU time goes — it samples stacks periodically and shows the hottest call paths. Filter
      to the <b>main thread</b> to find work that blocks the UI, and use it to confirm a fix actually moved the
      hotspot rather than guessing.</p>`,
    level: "senior",
  },
  {
    id: "v7",
    category: "perf",
    categoryLabel: "Performance",
    question: "Allocations vs Leaks — what's the difference?",
    answerHtml: `<p><b>Leaks</b> finds memory with no remaining references (true leaks, often retain cycles).
      <b>Allocations</b> tracks all live allocations over time — use it to spot <b>abandoned memory</b> (still
      referenced but never freed, e.g. an ever-growing cache) that Leaks won't flag. Watch the graph climb and
      not come back down.</p>`,
    level: "senior",
  },
  {
    id: "v8",
    category: "perf",
    categoryLabel: "Performance",
    question: "How does the Memory Graph Debugger help?",
    answerHtml: `<p>It pauses the app and shows the object graph, highlighting <b>retain cycles</b> and who holds
      a given object. Click a leaked object to see the chain of strong references keeping it alive — the fastest
      way to find the <code>[weak self]</code> you forgot.</p>`,
    level: "senior",
  },
  {
    id: "v9",
    category: "perf",
    categoryLabel: "Performance",
    question: "What does the SwiftUI instrument show?",
    answerHtml: `<p>How often each view's <code>body</code> is evaluated and <b>why</b> a view updated (which
      dependency changed). Use it to catch needless re-renders — a view recomputing far more than expected points
      to bad identity, an over-broad observable, or heavy work in <code>body</code>.</p>`,
    level: "senior",
  },
  {
    id: "v10",
    category: "perf",
    categoryLabel: "Performance",
    question: "How do you diagnose stutter — hangs vs hitches?",
    answerHtml: `<p>The <b>Hangs</b> instrument flags main-thread blocks (unresponsive UI); <b>Animation
      Hitches</b> flags individual late/dropped frames during scroll/animation. The Core Animation FPS / commit
      data shows frame timing. Hangs → move work off main; hitches → cheaper per-frame work and fewer
      commits.</p>`,
    level: "senior",
  },
  {
    id: "v11",
    category: "perf",
    categoryLabel: "Performance",
    question: "When do you reach for the Network or Energy instruments?",
    answerHtml: `<p><b>Network</b> to see requests, sizes, and timing (redundant/chatty calls, payload bloat).
      <b>Energy Log</b> to attribute battery cost to CPU, networking, location, and GPU — essential before
      shipping background features or anything location/GPU-heavy.</p>`,
    level: "senior",
  },
  {
    id: "v12",
    category: "test",
    categoryLabel: "Testing",
    question: "What is the view hierarchy debugger for?",
    answerHtml: `<p>It captures the live UI as a 3D, explodable hierarchy so you can inspect frames, z-order,
      clipped/zero-size views, and (for UIKit) Auto Layout constraints and ambiguities. Great for "why is this
      view invisible / mispositioned / not tappable?".</p>`,
    level: "mid",
  },
  {
    id: "v13",
    category: "test",
    categoryLabel: "Testing",
    question: "How do you read a production crash, and what is symbolication?",
    answerHtml: `<p>A crash report has addresses, not function names; <b>symbolication</b> maps them back to your
      source using the matching <b>dSYM</b> (debug symbols) from that exact build — Xcode Organizer does it
      automatically, or <code>atos</code> manually. Keep dSYMs for every release (upload to your crash service) or
      reports are unreadable. Read the crashed thread's stack + exception type.</p>`,
    level: "senior",
  },
  {
    id: "v14",
    category: "perf",
    categoryLabel: "Performance",
    question: "What does MetricKit give you that local profiling can't?",
    answerHtml: `<p><b>Field data</b> from real users: aggregated launch time, hang rate, memory, energy, plus
      <b>diagnostic payloads</b> for crashes, hangs, and disk-write exceptions — sampled across devices you'll
      never reproduce on locally. It's how you measure performance and stability in production.</p>`,
    level: "senior",
  },
  {
    id: "v15",
    category: "test",
    categoryLabel: "Testing",
    question: "What do the sanitizers and Main Thread Checker catch?",
    answerHtml: `<p><b>Address Sanitizer</b> (memory errors: use-after-free, overflows), <b>Thread Sanitizer</b>
      (data races), <b>Undefined Behavior Sanitizer</b>, and the <b>Main Thread Checker</b> (UIKit/AppKit calls
      off the main thread). Turn them on in a test scheme — they catch bugs that are invisible until they crash in
      the field.</p>`,
    level: "senior",
  },
  {
    id: "v16",
    category: "test",
    categoryLabel: "Testing",
    question: "What's a sound debugging strategy for a hard bug?",
    answerHtml: `<p><b>Reproduce</b> reliably first (a failing test is ideal), <b>isolate</b> by bisecting
      (git bisect, or remove half the suspects), form a hypothesis and test one change at a time. Add structured
      logging (<code>Logger</code>/OSLog with categories) rather than scattered prints, and remember Debug vs
      Release behavior can differ.</p>`,
    level: "senior",
  },
];

export const ADVANCED15_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED15_QUIZ: QuizQuestion[] = [
  {
    id: "vz1",
    category: "test",
    categoryLabel: "Testing",
    question: "To find out WHAT is mutating a variable, set a:",
    options: ["Symbolic breakpoint", "Watchpoint on the variable", "Conditional breakpoint on a line", "Network instrument"],
    answer: 1,
    explanationHtml: `<p>A watchpoint breaks on a data change, so LLDB stops at the write and shows the
      mutating call in the backtrace.</p>`,
  },
  {
    id: "vz2",
    category: "perf",
    categoryLabel: "Performance",
    question: "You should profile performance on:",
    options: ["A Debug build in the simulator", "A Release build on a real device", "Any build, anywhere", "Only CI"],
    answer: 1,
    explanationHtml: `<p>Debug builds and the simulator aren't representative — profile Release on real
      hardware.</p>`,
  },
  {
    id: "vz3",
    category: "perf",
    categoryLabel: "Performance",
    question: "Memory that's still referenced but never freed (e.g. an unbounded cache) is best found with:",
    options: ["Leaks only", "Allocations (abandoned memory)", "Time Profiler", "Energy log"],
    answer: 1,
    explanationHtml: `<p>Leaks needs zero references; Allocations reveals abandoned memory that keeps growing
      while still referenced.</p>`,
  },
  {
    id: "vz4",
    category: "perf",
    categoryLabel: "Performance",
    question: "A retain cycle is fastest to pinpoint with:",
    options: ["print statements", "The Memory Graph Debugger", "The view debugger", "MetricKit"],
    answer: 1,
    explanationHtml: `<p>The Memory Graph shows the strong-reference chain keeping an object alive — exactly
      what reveals a cycle.</p>`,
  },
  {
    id: "vz5",
    category: "test",
    categoryLabel: "Testing",
    question: "Function names in a production crash report require:",
    options: ["Nothing", "The matching dSYM (symbolication)", "A jailbroken device", "Source uploaded to Apple"],
    answer: 1,
    explanationHtml: `<p>Crash addresses are symbolicated using the build's dSYM; keep dSYMs for every release or
      reports stay unreadable.</p>`,
  },
  {
    id: "vz6",
    category: "test",
    categoryLabel: "Testing",
    question: "Which tool catches data races at runtime?",
    options: ["Address Sanitizer", "Thread Sanitizer", "Main Thread Checker", "Time Profiler"],
    answer: 1,
    explanationHtml: `<p>Thread Sanitizer detects data races; ASan catches memory errors and the Main Thread
      Checker flags UI calls off the main thread.</p>`,
  },
];

export const ADVANCED15_STUDY: StudySection[] = [
  {
    id: "st-adv-37",
    num: "52",
    title: "52 · Debugging with LLDB & Xcode",
    html: `<p><b>What it is.</b> The interactive toolkit. In <b>LLDB</b>: <code>po</code>/<code>p</code>,
      <code>bt</code>, step commands, and <code>expression</code> to run code at a breakpoint. Use
      <b>conditional</b> and <b>symbolic</b> breakpoints, <b>breakpoint actions</b> (log + auto-continue), an
      <b>exception/Swift-error</b> breakpoint to stop at the source of a crash/throw, and <b>watchpoints</b> to
      catch who mutates a value.</p>
    <p>Beyond the console: the <b>view hierarchy debugger</b> (3D inspect frames/constraints/clipped views) and
      the <b>Memory Graph Debugger</b> (retain cycles). Debug in a Debug build — optimized Release builds hide
      locals. Enable <b>sanitizers</b> (Address/Thread) and the <b>Main Thread Checker</b> in a test scheme to
      surface latent bugs.</p>
    <div class="callout tip"><span class="lbl">Method</span> Reproduce → isolate (bisect) → one change at a time;
      structured <code>Logger</code> beats scattered prints.</div>`,
  },
  {
    id: "st-adv-38",
    num: "53",
    title: "53 · Instruments, crashes & field metrics",
    html: `<p><b>What it is.</b> Measuring reality. Profile a <b>Release build on device</b> with <b>Instruments</b>:
      <b>Time Profiler</b> (CPU/main-thread hotspots), <b>Allocations</b>/<b>Leaks</b> (abandoned memory vs true
      leaks), the <b>SwiftUI</b> instrument (body counts + why), <b>Hangs</b>/<b>Animation Hitches</b> (stalls and
      dropped frames), plus <b>Network</b> and <b>Energy</b>.</p>
    <p>For production: <b>symbolicate</b> crash reports with the build's <b>dSYM</b> (keep them), and adopt
      <b>MetricKit</b> for aggregated field metrics + crash/hang/disk diagnostics from real users. Define budgets
      (cold launch, crash-free rate) and watch them over releases.</p>
    <div class="callout warn"><span class="lbl">Rule</span> Measure before optimizing, change one thing,
      re-measure — and never trust simulator/Debug numbers for performance.</div>`,
  },
];
