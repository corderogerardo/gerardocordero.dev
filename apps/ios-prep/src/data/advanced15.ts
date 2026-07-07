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
    answerHtml: `<p>Debugging live in the console beats adding a print statement and rebuilding — LLDB lets you
      inspect and mutate a running process. The core set: <code>po expr</code> (print object description),
      <code>p</code>/<code>v</code> (print value / fast frame-variable read), <code>bt</code> (backtrace),
      <code>frame variable</code>, and step/continue (<code>n</code>, <code>s</code>, <code>c</code>).
      <code>expression</code> goes further — it runs or mutates code at a breakpoint so you can test a fix live
      before touching the source.</p>
      <p><b>I reach for LLDB before adding a print — po and expression let me test a hypothesis without a
      rebuild.</b></p>`,
    level: "senior",
  },
  {
    id: "v2",
    category: "test",
    categoryLabel: "Testing",
    question: "What can breakpoints do beyond pausing?",
    answerHtml: `<p>A breakpoint that just pauses forces you to babysit the debugger; the smarter ones do the
      filtering for you. <b>Conditional</b> breaks only when an expression is true (e.g. the 500th row), <b>symbolic</b>
      breaks on a method name across every type (e.g. <code>-[UIViewController viewDidAppear:]</code>), and
      <b>actions</b> log, run a command, or play a sound and then auto-continue — a free log point with no rebuild.
      A <b>Swift error</b>/<b>exception</b> breakpoint stops exactly where a throw or crash originates instead of
      wherever it happens to surface.</p>
      <p><b>I make the breakpoint do the filtering — conditional and symbolic breakpoints get me to the failing
      case without single-stepping through the ones that work.</b></p>`,
    level: "senior",
  },
  {
    id: "v3",
    category: "test",
    categoryLabel: "Testing",
    question: "What is a watchpoint?",
    answerHtml: `<p>"Who is mutating this property?" is unanswerable by stepping through code you already suspect —
      you need the debugger to break on the <i>data</i>, not a line. A watchpoint does exactly that: it stops
      execution when a particular variable or memory address changes, wherever that write happens to live. Set it
      on the value and LLDB breaks at the write, showing the culprit in the backtrace.</p>
      <p><b>When I can't find who's mutating a value by reading code, I set a watchpoint on it — LLDB breaks at
      the write and hands me the culprit.</b></p>`,
    level: "senior",
  },
  {
    id: "v4",
    category: "test",
    categoryLabel: "Testing",
    question: "Why might po show nothing useful in a Release build?",
    answerHtml: `<p>The compiler and the debugger disagree about what still exists: optimizations (<code>-O</code>)
      inline functions and elide locals entirely, so the variable <code>po</code> wants to read may simply not be
      there anymore, and the stack can look "wrong" for the same reason. Debug meaningfully in a <b>Debug</b>
      build; when you must inspect Release, rely on the crash report's symbolicated stack and structured logging
      instead.</p>
      <p>Red flag: trusting an ad-hoc <code>po</code> of an optimized local as ground truth — it can print stale or
      wrong values because the variable was never materialized the way you expect.</p>
      <p><b>I debug logic in a Debug build; for Release-only issues I trust the symbolicated crash stack and logs,
      not po on optimized locals.</b></p>`,
    level: "senior",
  },
  {
    id: "v5",
    category: "perf",
    categoryLabel: "Performance",
    question: "How should you profile with Instruments?",
    answerHtml: `<p>Profiling the wrong build wastes the whole exercise — you'll chase costs that don't exist in
      production. Profile a <b>Release</b> build on a <b>real device</b> (the simulator's CPU/GPU/thermal behavior
      isn't representative), reproduce the specific scenario, pick the matching template, find the single biggest
      cost, fix it, and re-measure before moving to the next one.</p>
      <p>Red flag: optimizing based on Debug-build or simulator numbers — you'll "fix" a bottleneck that Release
      optimizations already removed, or miss the real one.</p>
      <p><b>I profile Release on device, fix the single biggest cost, and re-measure before touching the next
      one — never Debug, never the simulator.</b></p>`,
    level: "senior",
  },
  {
    id: "v6",
    category: "perf",
    categoryLabel: "Performance",
    question: "What does the Time Profiler tell you?",
    answerHtml: `<p>Guessing which function is slow wastes an optimization pass on the wrong target — the Time
      Profiler tells you where CPU time actually goes by sampling stacks periodically and ranking the hottest call
      paths. Filter to the <b>main thread</b> to find work that blocks the UI, and re-run it after a fix to confirm
      the hotspot actually moved instead of assuming it did.</p>
      <p><b>I let the Time Profiler point at the hottest main-thread stack instead of guessing which function is
      slow, then re-profile to confirm the fix moved it.</b></p>`,
    level: "senior",
  },
  {
    id: "v7",
    category: "perf",
    categoryLabel: "Performance",
    question: "Allocations vs Leaks — what's the difference?",
    answerHtml: `<p>The two tools answer different questions, and reaching for only one leaves a whole class of
      memory bugs invisible. <b>Leaks</b> finds memory with no remaining references — a true leak, usually a
      retain cycle. <b>Allocations</b> tracks every live allocation over time, which is how you catch <b>abandoned
      memory</b>: still referenced, never freed, e.g. an ever-growing cache. Leaks won't flag that, because
      something is technically still pointing at it — you have to watch the Allocations graph climb and never come
      back down.</p>
      <p>Red flag: running only the Leaks instrument and declaring memory clean — an unbounded cache or array will
      sail right past it.</p>
      <p><b>Leaks catches true leaks; Allocations is what catches the memory that's still referenced but growing
      forever, like an unbounded cache.</b></p>`,
    level: "senior",
  },
  {
    id: "v8",
    category: "perf",
    categoryLabel: "Performance",
    question: "How does the Memory Graph Debugger help?",
    answerHtml: `<p>Finding a retain cycle by reading closures and reference chains by eye doesn't scale past a
      trivial case; the Memory Graph Debugger pauses the app and renders the actual object graph, highlighting
      cycles and who holds a given object. Click a leaked object to see the chain of strong references keeping it
      alive — the fastest way to find the <code>[weak self]</code> you forgot.</p>
      <p><b>Instead of eyeballing closures for a missing weak self, I pause on the Memory Graph and click the
      leaked object — it shows me the strong-reference chain directly.</b></p>`,
    level: "senior",
  },
  {
    id: "v9",
    category: "perf",
    categoryLabel: "Performance",
    question: "What does the SwiftUI instrument show?",
    answerHtml: `<p>SwiftUI's declarative model hides re-render cost until it shows up as jank, so you need a tool
      that names the cause, not just the symptom. The SwiftUI instrument shows how often each view's
      <code>body</code> is evaluated and <b>why</b> it updated — which dependency changed. A view recomputing far
      more than expected points to bad identity, an over-broad observable object, or heavy work sitting directly in
      <code>body</code>.</p>
      <p><b>When a SwiftUI screen feels laggy, I check the SwiftUI instrument for body counts and the "why" —
      that's what tells me if it's identity, an over-broad observable, or work that belongs off body.</b></p>`,
    level: "senior",
  },
  {
    id: "v10",
    category: "perf",
    categoryLabel: "Performance",
    question: "How do you diagnose stutter — hangs vs hitches?",
    answerHtml: `<p>"The app feels janky" isn't a diagnosis — hangs and hitches have different causes and different
      fixes, so the first job is telling them apart. <b>Hangs</b> flags main-thread blocks where the UI stops
      responding entirely; <b>Animation Hitches</b> flags individual late or dropped frames during scroll or
      animation while the app stays responsive. Core Animation FPS / commit data shows the frame timing underneath
      both.</p>
      <ol>
        <li>Reproduce the stutter and capture with the matching instrument.</li>
        <li>Classify it: unresponsive to taps → hang; choppy scroll but taps still register → hitch.</li>
        <li>Hangs → move the blocking work off the main thread. Hitches → cheaper per-frame work and fewer
          commits.</li>
        <li>Re-measure frame timing to confirm the fix.</li>
      </ol>
      <p><b>I classify stutter first — unresponsive means a hang and I move work off main; choppy-but-tappable
      means a hitch and I cut per-frame cost.</b></p>`,
    level: "senior",
  },
  {
    id: "v11",
    category: "perf",
    categoryLabel: "Performance",
    question: "When do you reach for the Network or Energy instruments?",
    answerHtml: `<p>Slowness and battery drain have separate root causes, and separate tools for finding them.
      <b>Network</b> shows requests, sizes, and timing — the tool for redundant or chatty calls and payload bloat.
      <b>Energy Log</b> attributes battery cost to CPU, networking, location, and GPU — essential before shipping
      any background feature or anything location/GPU-heavy, since that's exactly what reviewers and users notice
      first.</p>
      <p><b>Before shipping a background or location feature, I check the Energy instrument — battery complaints
      are harder to walk back than a slow screen.</b></p>`,
    level: "senior",
  },
  {
    id: "v12",
    category: "test",
    categoryLabel: "Testing",
    question: "What is the view hierarchy debugger for?",
    answerHtml: `<p>"Why is this view invisible, mispositioned, or not tappable?" is hard to answer from code alone
      when the layout math happens at runtime — so you inspect the rendered result instead. The view hierarchy
      debugger captures the live UI as a 3D, explodable hierarchy: you can inspect frames, z-order, clipped or
      zero-size views, and, for UIKit, the Auto Layout constraints and ambiguities actually in effect.</p>
      <p><b>When a view won't show or won't respond to taps, I pop open the view hierarchy debugger before
      guessing at the layout code.</b></p>`,
    level: "mid",
  },
  {
    id: "v13",
    category: "test",
    categoryLabel: "Testing",
    question: "How do you read a production crash, and what is symbolication?",
    answerHtml: `<p>A raw crash report is addresses, not function names — useless until it's mapped back to source,
      and that mapping only works for the exact binary that crashed. <b>Symbolication</b> is that mapping: it uses
      the matching <b>dSYM</b> (debug symbols) from that exact build, done automatically by Xcode Organizer or
      manually with <code>atos</code>. Read the crashed thread's stack and the exception type first, then work
      outward.</p>
      <p>Red flag: not archiving dSYMs per release build — without the matching dSYM, a crash report from
      production is permanently unreadable, no matter how good your crash service is.</p>
      <p><b>I keep a dSYM for every shipped build — a crash report you can't symbolicate is a crash you can't
      fix.</b></p>`,
    level: "senior",
  },
  {
    id: "v14",
    category: "perf",
    categoryLabel: "Performance",
    question: "What does MetricKit give you that local profiling can't?",
    answerHtml: `<p>Local profiling only ever covers the devices and network conditions on your desk — MetricKit
      covers the ones you'll never reproduce. It reports <b>field data</b> from real users: aggregated launch time,
      hang rate, memory, and energy, plus <b>diagnostic payloads</b> for crashes, hangs, and disk-write exceptions,
      sampled across the actual device mix in production.</p>
      <p><b>Instruments tells me what's slow on my device; MetricKit tells me what's slow for users I'll never see
      in person.</b></p>`,
    level: "senior",
  },
  {
    id: "v15",
    category: "test",
    categoryLabel: "Testing",
    question: "What do the sanitizers and Main Thread Checker catch?",
    answerHtml: `<p>Memory corruption, data races, and off-main UI calls often don't crash reliably — they misbehave
      intermittently until a specific timing or allocation pattern hits in the field. The sanitizers catch the
      class of bug before that happens: <b>Address Sanitizer</b> (use-after-free, overflows), <b>Thread
      Sanitizer</b> (data races), <b>Undefined Behavior Sanitizer</b>, and the <b>Main Thread Checker</b> (UIKit/
      AppKit calls off the main thread).</p>
      <p>Red flag: leaving them off because they slow the app down — that's expected, and it's exactly why they
      belong on a test scheme, not the shipping build, not why you should skip them entirely.</p>
      <p><b>I run the sanitizers on a test scheme so a data race or use-after-free surfaces in CI instead of as an
      intermittent crash in the field.</b></p>`,
    level: "senior",
  },
  {
    id: "v16",
    category: "test",
    categoryLabel: "Testing",
    question: "What's a sound debugging strategy for a hard bug?",
    answerHtml: `<p>Changing things at random until a hard bug goes away is how you end up with a fix you can't
      explain and can't trust. A systematic pass finds the actual cause:</p>
      <ol>
        <li><b>Reproduce</b> reliably first — a failing test is ideal, because it's also your regression guard.</li>
        <li><b>Isolate</b> by bisecting: <code>git bisect</code>, or cut the suspect surface in half repeatedly.</li>
        <li>Form one hypothesis and test one change at a time — never two at once, or you won't know which fixed
          it.</li>
        <li>Add structured logging (<code>Logger</code>/OSLog with categories) instead of scattered prints, and
          keep in mind Debug vs Release behavior can differ.</li>
      </ol>
      <p><b>I reproduce first, bisect to isolate, then change exactly one thing per hypothesis — that's what turns
      a hard bug into a boring one.</b></p>`,
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
    explanationHtml: `<p>A watchpoint breaks on the data itself changing, so LLDB stops at the write and shows the
      mutating call in the backtrace — regardless of which code path did it. A symbolic breakpoint (tempting
      because it also crosses call sites) only breaks on entry to a named method, not on an arbitrary property
      write, so it won't catch a direct ivar mutation.</p>`,
  },
  {
    id: "vz2",
    category: "perf",
    categoryLabel: "Performance",
    question: "You should profile performance on:",
    options: ["A Debug build in the simulator", "A Release build on a real device", "Any build, anywhere", "Only CI"],
    answer: 1,
    explanationHtml: `<p>Profile Release on real hardware — Debug's unoptimized code and the simulator's
      different CPU/GPU characteristics both distort timing, so "any build, anywhere" produces numbers that don't
      hold up in production. Debug-in-simulator is the tempting default because it's the fastest iteration loop,
      not because its measurements mean anything for performance work.</p>`,
  },
  {
    id: "vz3",
    category: "perf",
    categoryLabel: "Performance",
    question: "Memory that's still referenced but never freed (e.g. an unbounded cache) is best found with:",
    options: ["Leaks only", "Allocations (abandoned memory)", "Time Profiler", "Energy log"],
    answer: 1,
    explanationHtml: `<p>Allocations is what reveals abandoned memory that keeps growing while still referenced.
      Leaks looks tempting because it's the "memory problems" tool by name, but it only flags objects with zero
      remaining references — an unbounded cache is still referenced by design, so Leaks will report the app clean
      while memory climbs.</p>`,
  },
  {
    id: "vz4",
    category: "perf",
    categoryLabel: "Performance",
    question: "A retain cycle is fastest to pinpoint with:",
    options: ["print statements", "The Memory Graph Debugger", "The view debugger", "MetricKit"],
    answer: 1,
    explanationHtml: `<p>The Memory Graph shows the strong-reference chain keeping an object alive, which is
      exactly what a cycle looks like — two objects each holding the other. Print statements only show you when an
      object deinits (or doesn't); they can't show you who's holding the reference, so they tell you a leak exists
      without ever pointing at the cause.</p>`,
  },
  {
    id: "vz5",
    category: "test",
    categoryLabel: "Testing",
    question: "Function names in a production crash report require:",
    options: ["Nothing", "The matching dSYM (symbolication)", "A jailbroken device", "Source uploaded to Apple"],
    answer: 1,
    explanationHtml: `<p>Crash addresses are symbolicated using the matching build's dSYM — that's the entire
      mechanism, no jailbreak or source upload involved. Keep a dSYM archived for every release; without the exact
      one that matches the crashed binary, the report's addresses can never be mapped back to function names.</p>`,
  },
  {
    id: "vz6",
    category: "test",
    categoryLabel: "Testing",
    question: "Which tool catches data races at runtime?",
    options: ["Address Sanitizer", "Thread Sanitizer", "Main Thread Checker", "Time Profiler"],
    answer: 1,
    explanationHtml: `<p>Thread Sanitizer is the one built specifically for data races — concurrent unsynchronized
      access to shared state. Address Sanitizer is the tempting wrong pick because it's the more famous sanitizer,
      but it catches memory errors (use-after-free, overflows), not races; the Main Thread Checker only flags UI
      calls off the main thread, a narrower and different bug class.</p>`,
  },
];

export const ADVANCED15_STUDY: StudySection[] = [
  {
    id: "st-adv-37",
    num: "52",
    title: "52 · Debugging with LLDB & Xcode",
    html: `<p><b>Why it matters.</b> A print-and-rebuild loop is the slowest possible way to test a hypothesis;
      Xcode's interactive tools let you inspect and mutate a running process instead. In <b>LLDB</b>:
      <code>po</code>/<code>p</code>, <code>bt</code>, step commands, and <code>expression</code> to run code at a
      breakpoint. Use <b>conditional</b> and <b>symbolic</b> breakpoints, <b>breakpoint actions</b> (log +
      auto-continue), an <b>exception/Swift-error</b> breakpoint to stop at the source of a crash/throw, and
      <b>watchpoints</b> to catch who mutates a value.</p>
    <p>Beyond the console: the <b>view hierarchy debugger</b> (3D inspect frames/constraints/clipped views) and
      the <b>Memory Graph Debugger</b> (retain cycles). Debug in a Debug build — optimized Release builds hide
      locals. Enable <b>sanitizers</b> (Address/Thread) and the <b>Main Thread Checker</b> in a test scheme to
      surface latent bugs before they ship.</p>
    <div class="callout tip"><span class="lbl">Method</span> Reproduce → isolate (bisect) → one change at a time;
      structured <code>Logger</code> beats scattered prints.</div>
    <p><b>Say this:</b> "I reach for LLDB and watchpoints before adding a print — they let me test a hypothesis
      live without a rebuild."</p>`,
  },
  {
    id: "st-adv-38",
    num: "53",
    title: "53 · Instruments, crashes & field metrics",
    html: `<p><b>Why it matters.</b> Optimizing without measuring means fixing whatever you assume is slow, which is
      usually the wrong thing. Profile a <b>Release build on device</b> with <b>Instruments</b>: <b>Time
      Profiler</b> (CPU/main-thread hotspots), <b>Allocations</b>/<b>Leaks</b> (abandoned memory vs true leaks),
      the <b>SwiftUI</b> instrument (body counts + why), <b>Hangs</b>/<b>Animation Hitches</b> (stalls and dropped
      frames), plus <b>Network</b> and <b>Energy</b>.</p>
    <p>For production, on-device profiling stops covering you the moment the app ships to devices you'll never
      touch: <b>symbolicate</b> crash reports with the build's <b>dSYM</b> (keep them), and adopt <b>MetricKit</b>
      for aggregated field metrics + crash/hang/disk diagnostics from real users. Define budgets (cold launch,
      crash-free rate) and watch them over releases.</p>
    <div class="callout warn"><span class="lbl">Rule</span> Measure before optimizing, change one thing,
      re-measure — and never trust simulator/Debug numbers for performance.</div>
    <p><b>Say this:</b> "Instruments tells me what's slow on my device; MetricKit tells me what's slow for users
      I'll never see in person — I use both before and after shipping."</p>`,
  },
];
