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
    answerHtml: `<p>SwiftUI tracks each view by <b>identity</b>. <b>Structural</b> identity comes from a view's
      position in the tree (its type + branch); <b>explicit</b> identity is what you set with <code>.id(value)</code>
      or a <code>ForEach</code> id. Identity controls state lifetime and transitions: when identity changes, the
      old view is torn down (its <code>@State</code> resets, removal/insertion transitions fire) and a new one is
      created. Changing <code>.id()</code> is how you force a fresh view; keeping identity stable is how state
      and animations persist.</p>`,
    level: "senior",
  },
  {
    id: "e2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How does @ViewBuilder let you list views without commas or arrays?",
    answerHtml: `<p>It's a <b>result builder</b>: the compiler turns the statements in a <code>body</code> into
      calls like <code>buildBlock</code>, <code>buildOptional</code> (for <code>if</code>), and
      <code>buildEither</code> (for <code>if/else</code>), producing one composite, statically-typed view. That's
      why an <code>if</code> inside a builder yields different concrete types per branch — and why you can't put
      arbitrary imperative code there.</p>`,
    level: "senior",
  },
  {
    id: "e3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "When exactly does a view's body re-evaluate?",
    answerHtml: `<p>When a dependency it <i>read</i> changes: <code>@State</code>/<code>@Binding</code> it uses,
      an <code>@Observable</code> property it accessed, an <code>@Environment</code> value, or a changed input
      from its parent. SwiftUI records those reads, invalidates only affected views, recomputes their
      <code>body</code>, and diffs the result against the previous tree to apply minimal changes. Keep
      <code>body</code> pure and cheap so this loop stays fast.</p>`,
    level: "senior",
  },
  {
    id: "e4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Why avoid AnyView?",
    answerHtml: `<p><code>AnyView</code> type-erases a view, which <b>hides structural identity and the concrete
      type</b> from SwiftUI — defeating its diffing optimizations and often forcing full rebuilds. Prefer
      <code>@ViewBuilder</code>, <code>some View</code>, or a <code>Group</code> with branches. Reach for
      <code>AnyView</code> only when you genuinely must store heterogeneous views (rare).</p>`,
    level: "senior",
  },
  {
    id: "e5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you build a reusable ViewModifier?",
    answerHtml: `<p>Conform to <code>ViewModifier</code> with a <code>body(content:)</code> that wraps
      <code>content</code>, then expose it via a <code>View</code> extension for ergonomics. It packages styling
      + behavior (and can hold its own <code>@State</code>), keeping call sites clean and consistent — the
      building block of a design system.</p>
    <div class="code">struct Card: ViewModifier {
  func body(content: Content) -&gt; some View {
    content.padding().background(.regularMaterial, in: .rect(cornerRadius: 12))
  }
}
extension View { func card() -&gt; some View { modifier(Card()) } }</div>`,
    level: "senior",
  },
  {
    id: "e6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "withAnimation vs .animation(_:value:) — what's the difference?",
    answerHtml: `<p><code>withAnimation { state = … }</code> is <b>explicit</b>: it animates whatever changes as a
      result of that state mutation. <code>.animation(_:value:)</code> is <b>implicit and scoped</b>: it animates
      a specific view whenever the given <code>value</code> changes. Prefer the <code>value:</code> form (the old
      value-less <code>.animation()</code> is deprecated because it animated unrelated changes too).</p>`,
    level: "senior",
  },
  {
    id: "e7",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do transitions work, and what is an asymmetric transition?",
    answerHtml: `<p>A <code>.transition(_:)</code> defines how a view animates <b>in (insertion)</b> and
      <b>out (removal)</b> when it's added/removed from the tree (its identity appears/disappears), inside a
      <code>withAnimation</code>. <code>.asymmetric(insertion:removal:)</code> uses different transitions for
      each direction (e.g. slide in, fade out). The view must actually be inserted/removed — toggling
      <code>opacity</code> isn't a transition.</p>`,
    level: "senior",
  },
  {
    id: "e8",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What does matchedGeometryEffect do (hero animations)?",
    answerHtml: `<p>It links two views sharing an <code>id</code> in the same <code>@Namespace</code> so SwiftUI
      animates one morphing into the other (position + size) when the visible one changes — the basis of
      hero/shared-element transitions (e.g. a grid thumbnail expanding into a detail view). Only one matched view
      per id should be present at a time.</p>`,
    level: "senior",
  },
  {
    id: "e9",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Name the main Animation curve types and when to use them.",
    answerHtml: `<p>Timing curves — <code>.linear</code>, <code>.easeIn/out/inOut</code>,
      <code>.timingCurve(...)</code> — animate over a fixed <b>duration</b>. <b>Springs</b> —
      <code>.spring</code>, and the presets <code>.bouncy</code>, <code>.smooth</code>, <code>.snappy</code> —
      are physically-based and interruptible, so they feel natural for gestures and UI that can be re-triggered
      mid-flight. Reach for springs for most interactive motion.</p>`,
    level: "senior",
  },
  {
    id: "e10",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you animate something SwiftUI can't interpolate by default (e.g. a Shape)?",
    answerHtml: `<p>Conform to <code>Animatable</code> and expose the value to interpolate via
      <code>animatableData</code> (an <code>VectorArithmetic</code> type). SwiftUI then tweens that property each
      frame and your <code>path</code>/draw uses it. For multiple values use
      <code>AnimatablePair</code>.</p>
    <div class="code">struct Wave: Shape {
  var phase: CGFloat
  var animatableData: CGFloat {
    get { phase } set { phase = newValue }
  }
  func path(in rect: CGRect) -&gt; Path { /* use phase */ Path() }
}</div>`,
    level: "architect",
  },
  {
    id: "e11",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is PhaseAnimator (iOS 17)?",
    answerHtml: `<p>A view that drives an animation through a <b>sequence of discrete phases</b> automatically (or
      on a trigger), giving you a different look per phase without managing timers or state. Great for looping,
      multi-step effects (pulse → settle, attention bounces) where each step has its own animation.</p>`,
    level: "senior",
  },
  {
    id: "e12",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is KeyframeAnimator (iOS 17) for?",
    answerHtml: `<p>It animates multiple properties along independent <b>keyframe tracks</b> over time — like a
      timeline editor in code. Use it for complex, choreographed motion (scale, rotation, and offset each on their
      own curve) that a single spring or phase sequence can't express.</p>`,
    level: "senior",
  },
  {
    id: "e13",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "When do you implement the Layout protocol?",
    answerHtml: `<p>When stacks/grids can't express the arrangement you need (e.g. a flow/tag layout, radial
      layout). You implement <code>sizeThatFits</code> (report your size for a proposed size) and
      <code>placeSubviews</code> (position each child) — directly participating in SwiftUI's size-proposal
      negotiation. It's reusable and far cheaper than nested GeometryReaders.</p>`,
    level: "architect",
  },
  {
    id: "e14",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What does alignmentGuide let you do?",
    answerHtml: `<p>Override how a view aligns within its container by returning a custom value for an alignment
      from the view's own dimensions. It's how you fine-tune alignment beyond the built-ins — e.g. align text
      baselines across differently-sized views, or build a custom alignment with an
      <code>AlignmentID</code>.</p>`,
    level: "architect",
  },
  {
    id: "e15",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is @Namespace and where is it used?",
    answerHtml: `<p>It creates a stable namespace ID for animation grouping — most importantly to pair views in
      <code>matchedGeometryEffect</code>. Declare it once (<code>@Namespace private var ns</code>) and pass it to
      the matched views so SwiftUI knows they're the same logical element across states.</p>`,
    level: "senior",
  },
  {
    id: "e16",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "When would you reach for Canvas and TimelineView?",
    answerHtml: `<p><code>Canvas</code> gives you an immediate-mode 2D drawing surface (shapes, text, images) in a
      single high-performance layer — good for charts, particles, custom visuals where one view per element would
      be too many. <code>TimelineView</code> re-renders on a schedule (e.g. every frame, or every minute) — pair
      them for clocks, live meters, or animations driven by real time.</p>`,
    level: "senior",
  },
  {
    id: "e17",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What scroll APIs arrived in iOS 17 worth knowing?",
    answerHtml: `<p><code>scrollTargetBehavior(.paging/.viewAligned)</code> + <code>scrollTargetLayout()</code>
      for snapping/paging, <code>scrollPosition(id:)</code> to read/drive the scrolled item,
      <code>scrollTransition</code> for per-item effects as cells enter/leave, and <code>ScrollView</code> content
      margins. They replace a lot of old <code>UIScrollView</code>-bridging hacks.</p>`,
    level: "senior",
  },
  {
    id: "e18",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "task(id:) vs onAppear, and the iOS 17 onChange signature?",
    answerHtml: `<p><code>.task { }</code> runs async work tied to the view's lifetime (auto-cancelled on
      disappear); <code>.task(id:)</code> restarts it when the id changes — cleaner than
      <code>onAppear</code> + manual <code>Task</code>. The new <code>onChange(of:) { oldValue, newValue in }</code>
      gives you both values (the single-parameter form is deprecated), plus an <code>initial:</code> option.</p>`,
    level: "mid",
  },
  {
    id: "e19",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What do containerRelativeFrame and visualEffect (iOS 17) solve?",
    answerHtml: `<p><code>containerRelativeFrame</code> sizes a view as a fraction of its container without a
      GeometryReader (e.g. carousel cards at 90% width). <code>visualEffect</code> lets you modify a view based on
      its geometry (its frame in some coordinate space) <b>without</b> wrapping it in GeometryReader and breaking
      layout — ideal for scroll-driven parallax/scale effects.</p>`,
    level: "senior",
  },
  {
    id: "e20",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is a Transaction and when would you use it?",
    answerHtml: `<p>A <code>Transaction</code> carries the animation context for a state change down the view
      tree. You read/override it (<code>transaction { $0.animation = nil }</code> or
      <code>.transaction { }</code>) to, say, <b>disable</b> animation for one specific update, or to attach a
      custom animation to a binding's changes. It's the low-level mechanism <code>withAnimation</code> uses.</p>`,
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
    explanationHtml: `<p>A new explicit identity is a new view: old one is removed (state reset, removal
      transition), new one inserted. That's how you force a fresh view — or accidentally lose state.</p>`,
  },
  {
    id: "ez2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Wrapping views in AnyView is discouraged because it:",
    options: ["Crashes on iOS 17", "Erases type/structural identity and hurts diffing", "Disables dark mode", "Prevents using @State"],
    answer: 1,
    explanationHtml: `<p>Type erasure hides identity and the concrete type from SwiftUI, defeating its
      optimizations. Prefer <code>@ViewBuilder</code> / <code>some View</code> / <code>Group</code>.</p>`,
  },
  {
    id: "ez3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "A shared-element 'hero' transition between two views is built with:",
    options: ["AnyView", "matchedGeometryEffect + @Namespace", "GeometryReader only", "TimelineView"],
    answer: 1,
    explanationHtml: `<p><code>matchedGeometryEffect(id:in:)</code> with a shared <code>@Namespace</code> morphs
      one view into the other (position + size).</p>`,
  },
  {
    id: "ez4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "The recommended implicit-animation modifier is:",
    options: [".animation(_) with no value", ".animation(_:value:)", "withAnimation in body", "UIView.animate"],
    answer: 1,
    explanationHtml: `<p>The value-less <code>.animation()</code> is deprecated (it animated unrelated changes).
      Scope it with <code>.animation(_:value:)</code>, or use explicit <code>withAnimation</code>.</p>`,
  },
  {
    id: "ez5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "To animate a custom Shape's parameter, you implement:",
    options: ["onAppear", "Animatable / animatableData", "a Timer", "AnyView"],
    answer: 1,
    explanationHtml: `<p>Conform to <code>Animatable</code> and expose the value via
      <code>animatableData</code>; SwiftUI tweens it each frame so your path redraws smoothly.</p>`,
  },
  {
    id: "ez6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "For a custom flow/tag arrangement that stacks can't express, you use:",
    options: ["Nested GeometryReaders", "The Layout protocol", "AnyView", "drawingGroup"],
    answer: 1,
    explanationHtml: `<p>Implement <code>Layout</code> (<code>sizeThatFits</code> + <code>placeSubviews</code>) —
      reusable and far cheaper than nesting GeometryReaders.</p>`,
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
      stays cheap.</div>`,
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
      for a specific update.</div>`,
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
      run often — keep their math cheap, and measure with the SwiftUI instrument.</div>`,
  },
];
