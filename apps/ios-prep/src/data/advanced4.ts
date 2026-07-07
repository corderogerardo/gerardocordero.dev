// Advanced batch 4 — SwiftUI internals & animations (senior/architect). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED4_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED4_FLASHCARDS: Flashcard[] = [
  {
    id: "e1",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Structural identity vs explicit identity — why does it matter?",
    answerHtml: `<p>Identity is what tells SwiftUI whether a mutation is "the same view with new state" or "a
      different view entirely" — get that wrong and you either see state bleed across rows or animations that
      never fire. <b>Structural</b> identity comes from a view's position in the tree (its type + branch);
      <b>explicit</b> identity is what you set with <code>.id(value)</code> or a <code>ForEach</code> id. Identity
      controls state lifetime and transitions: when identity changes, the old view is torn down (its
      <code>@State</code> resets, removal/insertion transitions fire) and a new one is created.</p>
      <p>Red flag: using an array index as a <code>ForEach</code> id when rows can be inserted, removed, or
      reordered — the index is structural, not stable, so state silently reattaches to the wrong row. Use a
      real, stable id from the model instead.</p>
      <p><b>I keep identity stable so state and animations persist, and I only change .id() when I want a hard
      reset.</b></p>`,
    level: "senior",
  },
  {
    id: "e2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How does @ViewBuilder let you list views without commas or arrays?",
    answerHtml: `<p><code>@ViewBuilder</code> exists so <code>body</code> can read like a plain list of views while
      the compiler still produces one composite, <b>statically-typed</b> tree — no arrays, no type erasure, no
      runtime dispatch cost. It's a <b>result builder</b>: the compiler turns the statements into calls like
      <code>buildBlock</code>, <code>buildOptional</code> (for <code>if</code>), and <code>buildEither</code> (for
      <code>if/else</code>). That's why an <code>if</code> inside a builder yields a different concrete type per
      branch — and why you can't drop arbitrary imperative code in there.</p>
      <p><b>@ViewBuilder is why my view code looks declarative but still compiles to a single static type — the
      builder does the type bookkeeping I'd otherwise have to erase away.</b></p>`,
    level: "senior",
  },
  {
    id: "e3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "When exactly does a view's body re-evaluate?",
    answerHtml: `<p>This is the mechanism that makes SwiftUI fast at scale, so knowing it exactly is what lets you
      diagnose "why did this re-render" instead of guessing. <code>body</code> re-evaluates when a dependency it
      <i>read</i> changes: <code>@State</code>/<code>@Binding</code> it uses, an <code>@Observable</code> property
      it accessed, an <code>@Environment</code> value, or a changed input from its parent. SwiftUI records those
      reads, invalidates only affected views, recomputes their <code>body</code>, and diffs the result against the
      previous tree to apply minimal changes.</p>
      <p>Red flag: reading a broad <code>@Environment</code> object or a whole <code>@Observable</code> model in a
      view that only needs one field — that read gets tracked too, so the view re-renders on every unrelated
      change to that object.</p>
      <p><b>I keep body pure and only read the exact properties a view needs, so the invalidate-and-diff loop
      stays cheap.</b></p>`,
    level: "senior",
  },
  {
    id: "e4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Why avoid AnyView?",
    answerHtml: `<p><code>AnyView</code> trades away the exact thing SwiftUI's performance model depends on:
      knowing a view's concrete type and structural identity. Type-erasing hides both from SwiftUI, defeating its
      diffing optimizations and often forcing full subtree rebuilds instead of minimal updates.</p>
      <p>Red flag: reaching for <code>AnyView</code> just to make two branches of an <code>if</code> "the same
      type" so it compiles — that's exactly what <code>@ViewBuilder</code>, <code>some View</code>, or a
      <code>Group</code> with branches already solve without paying the erasure cost. Reach for
      <code>AnyView</code> only when you genuinely must store heterogeneous views (rare).</p>
      <p><b>I avoid AnyView because it defeats SwiftUI's diffing — I reach for @ViewBuilder or some View instead,
      and only erase type when I truly need heterogeneous storage.</b></p>`,
    level: "senior",
  },
  {
    id: "e5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you build a reusable ViewModifier?",
    answerHtml: `<p>A <code>ViewModifier</code> is how you turn a one-off styling recipe into a reusable design-system
      primitive instead of copy-pasting modifier chains across every screen. Conform to <code>ViewModifier</code>
      with a <code>body(content:)</code> that wraps <code>content</code>, then expose it via a <code>View</code>
      extension for ergonomics. It packages styling + behavior (and can hold its own <code>@State</code>), keeping
      call sites clean and consistent.</p>
    <div class="code">struct Card: ViewModifier {
  func body(content: Content) -&gt; some View {
    content.padding().background(.regularMaterial, in: .rect(cornerRadius: 12))
  }
}
extension View { func card() -&gt; some View { modifier(Card()) } }</div>
    <p><b>I package repeated styling as a ViewModifier behind a View extension so call sites stay a one-liner and
      the design system has a single place to change.</b></p>`,
    level: "senior",
  },
  {
    id: "e6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "withAnimation vs .animation(_:value:) — what's the difference?",
    answerHtml: `<p>The choice is about blast radius: do you want to animate everything one state change triggers, or
      pin an animation to one view and one value. <code>withAnimation { state = … }</code> is <b>explicit</b>: it
      animates whatever changes as a result of that mutation. <code>.animation(_:value:)</code> is <b>implicit and
      scoped</b>: it animates a specific view whenever the given <code>value</code> changes.</p>
      <p>Red flag: using the old value-less <code>.animation()</code> — it's deprecated because it animated
      <i>any</i> change to the view, including ones you never meant to animate. Always scope with
      <code>value:</code>.</p>
      <p><b>I use withAnimation for the general effect of a state change and .animation(_:value:) when I need to
      pin an animation to one specific view and value.</b></p>`,
    level: "senior",
  },
  {
    id: "e7",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do transitions work, and what is an asymmetric transition?",
    answerHtml: `<p>Transitions exist because appearance and disappearance are structural events, not property changes
      — SwiftUI needs to know how to animate a view whose identity is appearing or vanishing from the tree.
      A <code>.transition(_:)</code> defines how a view animates <b>in (insertion)</b> and <b>out (removal)</b>
      when it's added/removed, inside a <code>withAnimation</code>. <code>.asymmetric(insertion:removal:)</code>
      uses different transitions for each direction (e.g. slide in, fade out).</p>
      <p>Red flag: toggling a view's own <code>opacity</code> and calling it a "transition" — the view never
      leaves the tree, so <code>.transition</code> never fires. A transition requires the view to actually be
      inserted or removed.</p>
      <p><b>I use .transition for views entering or leaving the tree, and reach for asymmetric when the in and
      out motion should feel different.</b></p>`,
    level: "senior",
  },
  {
    id: "e8",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What does matchedGeometryEffect do (hero animations)?",
    answerHtml: `<p>It exists to make a jump between two screens read as continuity instead of a cut — the thing that
      makes an app feel polished rather than assembled from disconnected views. It links two views sharing an
      <code>id</code> in the same <code>@Namespace</code> so SwiftUI animates one morphing into the other
      (position + size) when the visible one changes — the basis of hero/shared-element transitions (e.g. a grid
      thumbnail expanding into a detail view).</p>
      <p>Red flag: keeping both matched views present at once — only one matched view per id should exist at a
      time, or the morph breaks.</p>
      <p><b>matchedGeometryEffect with a shared @Namespace is how I build hero transitions so a navigation feels
      continuous instead of a hard cut.</b></p>`,
    level: "senior",
  },
  {
    id: "e9",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Name the main Animation curve types and when to use them.",
    answerHtml: `<p>The choice matters most when a user can interrupt an animation mid-flight — a timing curve just
      keeps playing to a fixed duration, which reads as unresponsive under a fast second gesture. Timing curves
      — <code>.linear</code>, <code>.easeIn/out/inOut</code>, <code>.timingCurve(...)</code> — animate over a
      fixed <b>duration</b>. <b>Springs</b> — <code>.spring</code>, and the presets <code>.bouncy</code>,
      <code>.smooth</code>, <code>.snappy</code> — are physically-based and interruptible, so they feel natural
      for gestures and UI that can be re-triggered mid-flight.</p>
      <p><b>I reach for springs for most interactive motion because they're interruptible, and timing curves only
      for animations that always run to completion on a fixed schedule.</b></p>`,
    level: "senior",
  },
  {
    id: "e10",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you animate something SwiftUI can't interpolate by default (e.g. a Shape)?",
    answerHtml: `<p>SwiftUI only knows how to tween properties it can see as a vector — a custom <code>Shape</code>'s
      internal parameters aren't visible to it by default, so without this the shape would snap instead of
      animate. Conform to <code>Animatable</code> and expose the value to interpolate via
      <code>animatableData</code> (a <code>VectorArithmetic</code> type). SwiftUI then tweens that property each
      frame and your <code>path</code>/draw uses it. For multiple values, use <code>AnimatablePair</code>.</p>
    <div class="code">struct Wave: Shape {
  var phase: CGFloat
  var animatableData: CGFloat {
    get { phase } set { phase = newValue }
  }
  func path(in rect: CGRect) -&gt; Path { /* use phase */ Path() }
}</div>
    <p><b>I expose the interpolatable value through animatableData so SwiftUI can tween my custom Shape frame by
      frame instead of snapping between states.</b></p>`,
    level: "architect",
  },
  {
    id: "e11",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is PhaseAnimator (iOS 17)?",
    answerHtml: `<p>It replaces the timers-and-boolean-state you'd otherwise hand-roll for a multi-step effect with a
      declarative sequence — less state to keep in sync, fewer chances to leave an animation half-finished. A
      <code>PhaseAnimator</code> drives an animation through a <b>sequence of discrete phases</b> automatically
      (or on a trigger), giving you a different look per phase without managing timers or state. Great for
      looping, multi-step effects (pulse → settle, attention bounces) where each step has its own animation.</p>
      <p><b>For a looping multi-step effect I reach for PhaseAnimator instead of a Timer and a state machine —
      it's declarative and SwiftUI drives the sequence for me.</b></p>`,
    level: "senior",
  },
  {
    id: "e12",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is KeyframeAnimator (iOS 17) for?",
    answerHtml: `<p>It exists for the motion a single spring or phase sequence physically can't express: several
      properties moving on independent timing curves at once. A <code>KeyframeAnimator</code> animates multiple
      properties along independent <b>keyframe tracks</b> over time — like a timeline editor in code. Use it for
      complex, choreographed motion (scale, rotation, and offset each on their own curve).</p>
      <p><b>When one property's motion isn't enough — scale, rotation, and offset each need their own curve — I
      reach for KeyframeAnimator instead of stacking multiple springs.</b></p>`,
    level: "senior",
  },
  {
    id: "e13",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "When do you implement the Layout protocol?",
    answerHtml: `<p>Nested <code>GeometryReader</code>s can brute-force almost any arrangement, but they break the
      layout system's size-proposal negotiation and get expensive fast — the <code>Layout</code> protocol is the
      correct escape hatch when stacks/grids can't express what you need (e.g. a flow/tag layout, radial layout).
      You implement <code>sizeThatFits</code> (report your size for a proposed size) and
      <code>placeSubviews</code> (position each child) — directly participating in SwiftUI's negotiation instead
      of fighting it.</p>
      <p><b>I reach for Layout, not nested GeometryReaders, for a custom arrangement — it's reusable and stays
      inside SwiftUI's size-proposal system instead of fighting it.</b></p>`,
    level: "architect",
  },
  {
    id: "e14",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What does alignmentGuide let you do?",
    answerHtml: `<p>The built-in alignments only cover a view's own edges/center — <code>alignmentGuide</code> is what
      you reach for when the alignment you need depends on the view's content, not just its frame (e.g. lining up
      text baselines across differently-sized views). It overrides how a view aligns within its container by
      returning a custom value for an alignment from the view's own dimensions, and pairs with a custom
      <code>AlignmentID</code> when you need an alignment guide the built-ins don't offer at all.</p>
      <p><b>I use alignmentGuide when the built-in alignments can't see the content detail I need — like matching
      baselines across views of different sizes.</b></p>`,
    level: "architect",
  },
  {
    id: "e15",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is @Namespace and where is it used?",
    answerHtml: `<p><code>@Namespace</code> is the plumbing that lets two otherwise-unrelated views tell SwiftUI "we're
      the same logical element" — without it, <code>matchedGeometryEffect</code> has no scope to match within. It
      creates a stable namespace ID for animation grouping. Declare it once (<code>@Namespace private var ns</code>)
      and pass it to the matched views so SwiftUI can pair them across states.</p>
      <p><b>@Namespace is the shared scope matchedGeometryEffect needs to know two views are the same element —
      I declare it once and pass it to both sides of the match.</b></p>`,
    level: "senior",
  },
  {
    id: "e16",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "When would you reach for Canvas and TimelineView?",
    answerHtml: `<p>The tell is when "one view per element" stops scaling — hundreds of particles or chart points as
      separate SwiftUI views tank performance, and nothing state-driven refreshes on a wall-clock schedule.
      <code>Canvas</code> gives you an immediate-mode 2D drawing surface (shapes, text, images) in a single
      high-performance layer. <code>TimelineView</code> re-renders on a schedule (e.g. every frame, or every
      minute) instead of on state change — pair them for clocks, live meters, or animations driven by real
      time.</p>
      <p><b>Once I'd need one view per element, I switch to Canvas; once something needs to update on a clock
      instead of on state change, I reach for TimelineView.</b></p>`,
    level: "senior",
  },
  {
    id: "e17",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What scroll APIs arrived in iOS 17 worth knowing?",
    answerHtml: `<p>These APIs matter because they closed the gap that used to force a drop to
      <code>UIScrollView</code>-bridging for anything beyond basic scrolling — snapping, reading scroll position,
      and per-item effects are now native SwiftUI. <code>scrollTargetBehavior(.paging/.viewAligned)</code> +
      <code>scrollTargetLayout()</code> handle snapping/paging, <code>scrollPosition(id:)</code> reads/drives the
      scrolled item, <code>scrollTransition</code> gives per-item effects as cells enter/leave, and
      <code>ScrollView</code> content margins round it out.</p>
      <p><b>For carousels and snapping lists I reach for the iOS 17 scroll APIs first — they cover what used to
      need a UIScrollView bridge.</b></p>`,
    level: "senior",
  },
  {
    id: "e18",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "task(id:) vs onAppear, and the iOS 17 onChange signature?",
    answerHtml: `<p>The reason to prefer <code>.task</code> over <code>onAppear</code> + a manual <code>Task</code> is
      lifecycle safety: <code>.task { }</code> runs async work tied to the view's lifetime and is auto-cancelled
      on disappear, while a manually-spawned <code>Task</code> from <code>onAppear</code> keeps running after the
      view is gone unless you cancel it yourself. <code>.task(id:)</code> restarts the work when the id changes.
      The new <code>onChange(of:) { oldValue, newValue in }</code> gives you both values (the single-parameter
      form is deprecated), plus an <code>initial:</code> option.</p>
      <p>Red flag: spawning a <code>Task</code> in <code>onAppear</code> without capturing it to cancel on
      disappear — that's a silent leak that keeps doing work (and can crash on stale state) after the view is
      dismissed.</p>
      <p><b>I use .task instead of onAppear + a manual Task because SwiftUI cancels it for me on disappear — no
      leaked work.</b></p>`,
    level: "mid",
  },
  {
    id: "e19",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What do containerRelativeFrame and visualEffect (iOS 17) solve?",
    answerHtml: `<p>Both solve the same underlying problem: <code>GeometryReader</code> is greedy — it expands to fill
      its container and breaks the surrounding layout — so any geometry-aware sizing or effect used to force that
      trade-off. <code>containerRelativeFrame</code> sizes a view as a fraction of its container without one (e.g.
      carousel cards at 90% width). <code>visualEffect</code> lets you modify a view based on its own geometry
      (its frame in some coordinate space) without wrapping it in GeometryReader — ideal for scroll-driven
      parallax/scale effects.</p>
      <p><b>For geometry-driven sizing or effects I reach for containerRelativeFrame or visualEffect first — they
      get GeometryReader's information without its layout side effects.</b></p>`,
    level: "senior",
  },
  {
    id: "e20",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is a Transaction and when would you use it?",
    answerHtml: `<p>It's the layer below <code>withAnimation</code> itself — reach for it when you need finer control
      than "animate this block," like turning animation off for just one update in an otherwise-animated tree. A
      <code>Transaction</code> carries the animation context for a state change down the view tree; you read or
      override it (<code>transaction { $0.animation = nil }</code> or <code>.transaction { }</code>) to disable
      animation for one specific update, or attach a custom animation to a binding's changes.</p>
      <p><b>When I need to suppress animation for just one update inside an otherwise-animated tree, I reach for
      Transaction — it's the same mechanism withAnimation itself is built on.</b></p>`,
    level: "architect",
  },
];

export const ADVANCED4_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED4_QUIZ: QuizQuestion[] = [
  {
    id: "ez1",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Changing a view's .id(value) causes SwiftUI to:",
    options: ["Reuse the same view and keep its @State", "Tear down the old view and create a new one (state resets)", "Throw a runtime error", "Pause animations"],
    answer: 1,
    explanationHtml: `<p>A new explicit identity is a new view: the old one is removed (state reset, removal
      transition), a new one inserted. Picking "reuse the same view and keep its @State" is the tempting answer
      if you think of <code>.id()</code> as just a label — it isn't, it's identity, and identity is what SwiftUI
      uses to decide whether to keep or tear down state.</p>`,
  },
  {
    id: "ez2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Wrapping views in AnyView is discouraged because it:",
    options: ["Crashes on iOS 17", "Erases type/structural identity and hurts diffing", "Disables dark mode", "Prevents using @State"],
    answer: 1,
    explanationHtml: `<p>Type erasure hides identity and the concrete type from SwiftUI, defeating its diffing
      optimizations and forcing broader rebuilds. It's tempting to think of <code>AnyView</code> as a harmless
      convenience for mixing branch types — the actual cost is invisible until you profile a re-render that
      should've been cheap. Prefer <code>@ViewBuilder</code> / <code>some View</code> / <code>Group</code>.</p>`,
  },
  {
    id: "ez3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "A shared-element 'hero' transition between two views is built with:",
    options: ["AnyView", "matchedGeometryEffect + @Namespace", "GeometryReader only", "TimelineView"],
    answer: 1,
    explanationHtml: `<p><code>matchedGeometryEffect(id:in:)</code> with a shared <code>@Namespace</code> morphs
      one view into the other (position + size). "GeometryReader only" is the tempting distractor because it also
      deals in frames — but GeometryReader just reports geometry, it doesn't pair two views or drive a morph
      between them.</p>`,
  },
  {
    id: "ez4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "The recommended implicit-animation modifier is:",
    options: [".animation(_) with no value", ".animation(_:value:)", "withAnimation in body", "UIView.animate"],
    answer: 1,
    explanationHtml: `<p>The value-less <code>.animation()</code> looks like the simpler answer since it needs no
      extra argument, but that's exactly the problem — it animates <i>any</i> change to the view, including ones
      you never intended to animate. It's deprecated for that reason. Scope it with
      <code>.animation(_:value:)</code>, or use explicit <code>withAnimation</code>.</p>`,
  },
  {
    id: "ez5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "To animate a custom Shape's parameter, you implement:",
    options: ["onAppear", "Animatable / animatableData", "a Timer", "AnyView"],
    answer: 1,
    explanationHtml: `<p>Conform to <code>Animatable</code> and expose the value via
      <code>animatableData</code>; SwiftUI tweens it each frame so your path redraws smoothly. A
      <code>Timer</code> is the tempting distractor since it also "changes a value over time," but it only
      drives your own state updates — it doesn't interpolate the intermediate frames the way
      <code>animatableData</code> does.</p>`,
  },
  {
    id: "ez6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "For a custom flow/tag arrangement that stacks can't express, you use:",
    options: ["Nested GeometryReaders", "The Layout protocol", "AnyView", "drawingGroup"],
    answer: 1,
    explanationHtml: `<p>Implement <code>Layout</code> (<code>sizeThatFits</code> + <code>placeSubviews</code>) —
      reusable and far cheaper than nesting GeometryReaders. Nested GeometryReaders can technically brute-force
      the same arrangement, which is why it's the tempting wrong answer, but they break SwiftUI's size-proposal
      negotiation and get expensive fast.</p>`,
  },
];

export const ADVANCED4_STUDY: StudySection[] = [
  {
    id: "st-adv-12",
    num: "27",
    title: "27 · SwiftUI internals: identity, lifetime & the dependency graph",
    html: `<p><b>What it is.</b> The mental model behind every SwiftUI bug. A view value is cheap and ephemeral;
      what persists is its <b>identity</b> and the <b>state</b> attached to it. <b>Structural identity</b> comes
      from tree position; <b>explicit identity</b> from <code>.id()</code> / <code>ForEach</code> ids. SwiftUI
      records which dependencies each <code>body</code> <i>reads</i> (state, observable properties, environment),
      invalidates only those views on change, recomputes, and <b>diffs</b> to apply minimal updates.</p>
    <div class="callout warn"><span class="lbl">Consequences</span> Index-as-id reattaches state to the wrong
      row; an <code>AnyView</code> hides identity and kills diffing; changing <code>.id()</code> resets
      <code>@State</code> and fires transitions. Keep <code>body</code> pure so the read-tracking + diff loop
      stays cheap.</div>
    <p><b>Say this:</b> "Identity, not the view value, is what SwiftUI persists — I design around that when I
      decide whether to key a list on index or a stable id."</p>`,
  },
  {
    id: "st-adv-13",
    num: "28",
    title: "28 · Animations in depth",
    html: `<p><b>What it is.</b> Two ways to animate: <b>explicit</b> (<code>withAnimation { state = … }</code>,
      animates whatever that change affects) and <b>implicit, scoped</b> (<code>.animation(_:value:)</code>).
      Curves come in timing (<code>.easeInOut</code>, <code>.timingCurve</code>) and physical
      (<code>.spring</code>, <code>.bouncy/.smooth/.snappy</code> — interruptible, ideal for gestures).</p>
    <p><b>Transitions</b> (<code>.transition</code>, <code>.asymmetric</code>) animate views as their identity
      enters/leaves. <b>matchedGeometryEffect</b> + <code>@Namespace</code> gives hero transitions. iOS 17 adds
      <b>PhaseAnimator</b> (stepped sequences) and <b>KeyframeAnimator</b> (multi-track timelines). For types
      SwiftUI can't interpolate, conform to <b>Animatable</b> via <code>animatableData</code>.</p>
    <div class="callout tip"><span class="lbl">Rule of thumb</span> Reach for springs for interactive motion,
      scope implicit animations with <code>value:</code>, and use a <code>Transaction</code> to disable animation
      for a specific update.</div>
    <p><b>Say this:</b> "I pick springs for anything a gesture can interrupt, and reserve timing curves for
      animations that always run to completion."</p>`,
  },
  {
    id: "st-adv-14",
    num: "29",
    title: "29 · Custom layout & drawing",
    html: `<p><b>What it is.</b> When stacks and grids fall short, drop to the primitives. The <b>Layout</b>
      protocol (<code>sizeThatFits</code> + <code>placeSubviews</code>) lets you implement any arrangement
      (flow/tag, radial) as a reusable, efficient participant in SwiftUI's size-proposal negotiation —
      vastly better than nested GeometryReaders. <b>alignmentGuide</b> and custom <code>AlignmentID</code>s
      fine-tune positioning.</p>
    <p>For dense visuals, <b>Canvas</b> draws many elements in one layer (charts, particles), and
      <b>TimelineView</b> re-renders on a schedule for time-driven UI. <code>visualEffect</code> and
      <code>containerRelativeFrame</code> (iOS 17) cover geometry-aware effects without breaking layout.</p>
    <div class="callout warn"><span class="lbl">Performance</span> Custom layout and Canvas are powerful but
      run often — keep their math cheap, and measure with the SwiftUI instrument.</div>
    <p><b>Say this:</b> "I reach for Layout over nested GeometryReaders because it participates in the
      size-proposal system instead of fighting it, and I keep the placement math cheap since it runs often."</p>`,
  },
];
