// Advanced batch 16 — Core Animation, Metal & graphics (senior/architect). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED16_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED16_FLASHCARDS: Flashcard[] = [
  {
    id: "w1",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "What is a CALayer and its relationship to UIView?",
    answerHtml: `<p>UIKit splits responder/layout logic from rendering so the drawing side can live on the GPU
      compositor independently of your view hierarchy — that's why <code>UIView</code> is mostly a thin wrapper
      around a <code>CALayer</code>, which does the actual drawing, positioning, and compositing. Layers hold visual
      properties (<code>bounds</code>, <code>opacity</code>, <code>transform</code>, <code>cornerRadius</code>,
      shadows) and form their own parallel tree. Drop to the layer directly for effects and animations
      <code>UIView</code> doesn't expose.</p>
      <p><b>Every view has a layer, but not every layer has a view — that's the hook for custom Core Animation
      work.</b></p>`,
    level: "senior",
  },
  {
    id: "w2",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "What is implicit animation on a layer?",
    answerHtml: `<p>Core Animation animates property changes by default because layers are meant to be animated,
      not just drawn — so setting an <b>animatable</b> property on a standalone <code>CALayer</code> (not a view's
      backing layer) animates it automatically over the default duration via an implicit transaction. UIView
      backing layers disable this outside <code>UIView.animate</code>, which is why the same layer code behaves
      differently depending on whether a view owns it. Wrap changes in a <code>CATransaction</code> to tune or
      disable the implicit animation (<code>setDisableActions(true)</code>).</p>
      <p>Red flag: assuming a property change on a view's backing layer will animate on its own — it won't, because
      UIView explicitly disables implicit actions outside an animation block.</p>
      <p><b>Layers animate by default; views suppress that so animation stays explicit and predictable.</b></p>`,
    level: "senior",
  },
  {
    id: "w3",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "When do you use explicit CAAnimations?",
    answerHtml: `<p>Reach for explicit <code>CAAnimation</code>s when you need control that SwiftUI/UIView animation
      simply can't express: animating layer-only properties, precise multi-stop timing, or driving
      <code>CAShapeLayer</code> path/strokeEnd. <code>CABasicAnimation</code> is a from→to on a keyPath like
      <code>"opacity"</code>, <code>CAKeyframeAnimation</code> is multi-stop along a path, and
      <code>CAAnimationGroup</code> runs several together.</p>
      <p><b>I use UIView/SwiftUI animation until I need layer-only properties or precise keyframes — then I drop to
      explicit CAAnimations.</b></p>`,
    level: "senior",
  },
  {
    id: "w4",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "Where does Core Animation actually composite?",
    answerHtml: `<p>Compositing is decoupled from your app's main thread on purpose: Core Animation actually
      composites in a separate system process — the <b>render server</b> — on the GPU. Your app just commits a
      layer tree; the render server animates and composites it independently. That's why a Core Animation can stay
      smooth even if your main thread is briefly busy, and conversely why doing layout/CPU work per frame on the
      main thread is what causes visible hitches — you're not blocking the animation, you're blocking the commit.</p>
      <p><b>Core Animation runs the compositor out-of-process, so a running animation survives a busy main
      thread — but new layout work still has to get through it.</b></p>`,
    level: "architect",
  },
  {
    id: "w5",
    category: "perf",
    categoryLabel: "Performance",
    question: "What is offscreen rendering and what triggers it?",
    answerHtml: `<p>Some visual effects can't be composited straight from the layer's own contents, so the GPU has
      to render the layer to a temporary offscreen buffer first — an extra pass that hurts scroll performance if it
      happens per frame on many layers. Common triggers: masks, <code>cornerRadius</code> + <code>masksToBounds</code>
      on complex content, shadows <b>without</b> a <code>shadowPath</code>, and rasterization. Profile with the Core
      Animation instrument (color offscreen-rendered) rather than guessing.</p>
      <p>Red flag: shipping <code>cornerRadius</code> + <code>masksToBounds</code> on a scrolling list of image
      cells without profiling — that combination is one of the most common silent scroll-perf killers.</p>
      <p><b>I check the offscreen-rendered coloring in Instruments before assuming a visual effect is free.</b></p>`,
    level: "senior",
  },
  {
    id: "w6",
    category: "perf",
    categoryLabel: "Performance",
    question: "When does shouldRasterize help vs hurt?",
    answerHtml: `<p>Rasterization trades a one-time render cost for cheap recompositing, so it only pays off when
      the content is static: <code>shouldRasterize = true</code> caches a layer as a bitmap so a complex,
      <b>static</b> subtree composites cheaply on every subsequent frame. It <b>hurts</b> if the content changes
      every frame — you pay the rasterization cost constantly instead of saving it — or if you forget
      <code>rasterizationScale = screen.scale</code>, which renders blurry on Retina.</p>
      <p>Red flag: turning on <code>shouldRasterize</code> as a general performance fix — on animating or
      frequently-updated content it makes things slower, not faster.</p>
      <p><b>I rasterize static, expensive layers only, and I set rasterizationScale to the screen scale or it
      goes blurry.</b></p>`,
    level: "senior",
  },
  {
    id: "w7",
    category: "perf",
    categoryLabel: "Performance",
    question: "How do you make shadows and rounded corners cheap?",
    answerHtml: `<p>Both defaults force the GPU into an extra offscreen pass, and both have a cheap alternative
      that avoids it. Always set an explicit <code>shadowPath</code> — that turns an expensive offscreen shadow
      into a free one. For rounded corners, prefer the modern corner APIs over <code>cornerRadius</code> +
      <code>masksToBounds</code> on image-heavy layers, or pre-mask the image ahead of time. Verify with the
      offscreen-render color in Instruments rather than assuming either fix landed.</p>
      <p>Red flag: adding <code>cornerRadius</code> to every cell in a scrolling list without a
      <code>shadowPath</code> or a masking strategy — that's the classic path to dropped frames on scroll.</p>
      <p><b>Shadows get a shadowPath, corners get pre-masked or a modern corner API — either way I check
      Instruments, not just the diff.</b></p>`,
    level: "senior",
  },
  {
    id: "w8",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "What is CADisplayLink for?",
    answerHtml: `<p>Timers on their own aren't synced to the display, so anything driving per-pixel motion needs a
      callback tied to the actual refresh — that's <code>CADisplayLink</code>: a timer synchronized to the display
      refresh whose callback fires once per frame, making it the right tool for custom frame-by-frame animation,
      physics, or a game loop. Use the frame's <code>targetTimestamp</code>/delta for time-based motion, and set
      <code>preferredFrameRateRange</code> for ProMotion.</p>
      <p><b>Anything I animate frame-by-frame myself is driven by CADisplayLink's delta, never a fixed-interval
      Timer.</b></p>`,
    level: "senior",
  },
  {
    id: "w9",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "Name specialized CALayer subclasses.",
    answerHtml: `<p>These exist so you can build rich visuals declaratively, GPU-composited, without dropping to
      custom <code>draw(_:)</code>: <code>CAShapeLayer</code> (vector paths, animatable <code>strokeEnd</code> for
      progress rings), <code>CAGradientLayer</code>, <code>CATextLayer</code>, <code>CAEmitterLayer</code>
      (particles), <code>CAReplicatorLayer</code> (cheap duplicates), and <code>CATiledLayer</code> (huge content).</p>
      <p><b>I reach for a specialized CALayer before writing a custom draw(_:) — it's composited on the GPU and
      animatable for free.</b></p>`,
    level: "senior",
  },
  {
    id: "w10",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "What does CATransaction do?",
    answerHtml: `<p>Implicit animations fire independently per property unless something coordinates them, so
      <code>CATransaction</code> is that coordination point: it groups layer changes into one transaction, letting
      you set the duration/timing for implicit animations, <b>disable</b> them
      (<code>setDisableActions(true)</code>), or attach a <code>completionBlock</code> that fires once every
      animation in the group finishes.</p>
      <p><b>When I need to know exactly when a batch of layer changes finishes, I wrap it in a CATransaction and
      use the completion block — not a fixed delay.</b></p>`,
    level: "senior",
  },
  {
    id: "w11",
    category: "perf",
    categoryLabel: "Performance",
    question: "What is Metal, at a high level?",
    answerHtml: `<p>Every higher-level graphics API on Apple platforms ultimately has to talk to the GPU through
      something, and Metal is that something — Apple's low-level GPU API. You record work into a
      <code>MTLCommandBuffer</code> from a <code>MTLCommandQueue</code>, set up render or compute <b>pipelines</b>
      with shaders written in MSL (Metal Shading Language), and commit it. It's the foundation under Core Animation,
      SpriteKit, RealityKit, and Swift's GPU work — you use it directly only for custom rendering, games, or heavy
      effects those layers can't express.</p>
      <p><b>Metal is the layer everything else — Core Animation, SpriteKit, RealityKit — sits on top of; I go
      there directly only when those abstractions can't deliver what I need.</b></p>`,
    level: "architect",
  },
  {
    id: "w12",
    category: "perf",
    categoryLabel: "Performance",
    question: "When do you actually need Metal?",
    answerHtml: `<p>The real question isn't "is Metal faster" — it's whether Core Animation/SwiftUI's GPU
      compositing can already express what you need, because for UI it usually can. Reach for
      <code>MTKView</code> + Metal directly for custom real-time rendering (games, 3D, shader-driven effects),
      processing every frame at high throughput, or GPU compute — only when standard views/Canvas can't deliver
      the visuals or performance you need.</p>
      <p>Red flag: reaching for Metal to speed up ordinary UI rendering — Core Animation is already GPU-composited,
      so the bottleneck is almost never "not enough Metal," it's an offscreen-render trigger or main-thread work.</p>
      <p><b>I don't drop to Metal to make UI faster — Core Animation already runs on the GPU. Metal is for custom
      rendering the UI layer can't express.</b></p>`,
    level: "architect",
  },
  {
    id: "w13",
    category: "perf",
    categoryLabel: "Performance",
    question: "What are Metal Performance Shaders (MPS)?",
    answerHtml: `<p>Writing your own shaders for common operations like blur or convolution is wasted effort when
      Apple already ships optimized ones — that's what Metal Performance Shaders are: a library of highly
      optimized GPU kernels (image filters, matrix/neural operations) that give you GPU-accelerated image
      processing and ML primitives without writing shaders yourself. Core ML and Core Image run on the GPU via
      MPS under the hood.</p>
      <p><b>Before I hand-write a shader for a filter or matrix op, I check whether Metal Performance Shaders
      already has it.</b></p>`,
    level: "architect",
  },
  {
    id: "w14",
    category: "perf",
    categoryLabel: "Performance",
    question: "How does SwiftUI tap into GPU/Metal rendering?",
    answerHtml: `<p>SwiftUI doesn't make you drop to <code>MTKView</code> to get Metal's benefits — it exposes
      them at increasing levels of directness. <code>.drawingGroup()</code> flattens a subtree into one
      Metal-rendered layer (speeds up complex vector/blend content). <code>Canvas</code> draws many elements in
      one layer. iOS 17 adds <code>.colorEffect</code>/<code>.distortionEffect</code>/<code>.layerEffect</code> —
      real <b>Metal shaders</b> applied directly to SwiftUI views. Use them surgically and measure; they're not
      free by default.</p>
      <p><b>I reach for .drawingGroup() or a layerEffect shader only after profiling shows the plain view tree is
      the bottleneck.</b></p>`,
    level: "senior",
  },
  {
    id: "w15",
    category: "perf",
    categoryLabel: "Performance",
    question: "What do you need to know about ProMotion / 120Hz?",
    answerHtml: `<p>ProMotion displays vary refresh up to 120Hz, so any animation that hard-codes a frame rate
      breaks on it. Standard UIKit/SwiftUI animations adapt automatically, but custom
      <code>CADisplayLink</code>-driven animation should set <code>preferredFrameRateRange</code> and be
      <b>time-based</b> (use the frame delta) — otherwise it runs too fast or wastes power. Higher refresh also
      means a tighter per-frame budget for whatever work you do in that callback.</p>
      <p>Red flag: assuming a fixed 60fps in a custom animation loop — on a 120Hz display that either doubles the
      perceived speed or, if you clamp it, wastes the extra frames the display can render.</p>
      <p><b>Custom animation is driven by elapsed time, not frame count — that's what makes it correct on 60Hz and
      120Hz alike.</b></p>`,
    level: "senior",
  },
  {
    id: "w16",
    category: "perf",
    categoryLabel: "Performance",
    question: "How do you choose the right graphics abstraction?",
    answerHtml: `<p>Every level down this stack trades a more expensive/complex API for more direct control, so the
      framework is: climb down only as far as a measured need forces you. 1. <b>SwiftUI / Core Animation</b> for
      almost everything — GPU-composited, cheap. 2. <b>Core Graphics</b> for custom 2D vector drawing on the CPU
      (one-off images). 3. <b>Canvas</b> for many elements composited in a single SwiftUI layer. 4. <b>Metal</b>
      for custom GPU rendering/compute nothing above can express.</p>
      <p>Red flag: reaching for Metal or Core Graphics by default "for performance" — you've added control and
      cost without evidence the higher level was actually the bottleneck.</p>
      <p><b>I start at SwiftUI/Core Animation and only drop a level when a profiler tells me that level is the
      bottleneck.</b></p>`,
    level: "architect",
  },
];

export const ADVANCED16_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED16_QUIZ: QuizQuestion[] = [
  {
    id: "wz1",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "What does the actual drawing/compositing for a UIView?",
    options: ["The view's draw(rect:) only", "Its backing CALayer", "The main run loop", "Auto Layout"],
    answer: 1,
    explanationHtml: `<p>Every UIView is backed by a <code>CALayer</code> that holds visual properties and does
      the compositing; drop to the layer for layer-only effects/animations. <code>draw(rect:)</code> is only
      invoked for custom CPU drawing — most views never override it, since the layer composites their content
      directly — and Auto Layout only computes frames, it has no role in rendering.</p>`,
  },
  {
    id: "wz2",
    category: "perf",
    categoryLabel: "Performance",
    question: "A shadow without a shadowPath is expensive because it causes:",
    options: ["A retain cycle", "Offscreen rendering", "A data race", "A memory leak"],
    answer: 1,
    explanationHtml: `<p>The GPU must render the layer offscreen to compute the shadow's shape; setting an
      explicit <code>shadowPath</code> tells it the shape up front, skipping that pass. It's easy to assume this
      is a memory issue (leak/retain cycle) because "expensive" gets reached for as a memory word by default —
      but this is purely a rendering-pipeline cost, not a memory one.</p>`,
  },
  {
    id: "wz3",
    category: "perf",
    categoryLabel: "Performance",
    question: "shouldRasterize is a win for:",
    options: ["Content that changes every frame", "A complex but static layer (with correct rasterizationScale)", "Solid color views", "Text fields"],
    answer: 1,
    explanationHtml: `<p>Rasterizing caches a static complex subtree as a bitmap; for constantly-changing
      content it re-rasterizes every frame and hurts. The tempting misconception is that
      <code>shouldRasterize</code> is a blanket performance switch — it's only a win when the render cost you're
      caching is paid once and reused across many frames, which is exactly what's false for content that changes
      every frame.</p>`,
  },
  {
    id: "wz4",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "A callback synchronized to each display refresh comes from:",
    options: ["Timer", "CADisplayLink", "DispatchQueue.main.asyncAfter", "URLSession"],
    answer: 1,
    explanationHtml: `<p><code>CADisplayLink</code> fires once per frame — the right driver for custom
      frame-by-frame animation or a game loop (use the frame delta, set the frame-rate range for ProMotion). A
      plain <code>Timer</code> or <code>asyncAfter</code> looks similar but isn't synced to the display's actual
      refresh, so its callbacks drift out of phase with what's on screen — fine for a debounce, wrong for
      per-frame motion.</p>`,
  },
  {
    id: "wz5",
    category: "perf",
    categoryLabel: "Performance",
    question: "You'd reach for Metal directly when:",
    options: ["Building a standard list UI", "Doing custom real-time GPU rendering / compute", "Animating opacity", "Rounding corners"],
    answer: 1,
    explanationHtml: `<p>Core Animation/SwiftUI already use the GPU for UI; Metal is for custom rendering,
      games, shaders, or GPU compute that standard views can't deliver. Opacity animation and corner rounding are
      tempting distractors here precisely because they're already GPU-composited by Core Animation — reaching for
      Metal on those adds complexity for zero gain.</p>`,
  },
  {
    id: "wz6",
    category: "perf",
    categoryLabel: "Performance",
    question: "Custom CADisplayLink animation on ProMotion should be:",
    options: ["Assumed to run at 60fps", "Time-based using the frame delta, with a preferredFrameRateRange", "Disabled", "Run on a background thread"],
    answer: 1,
    explanationHtml: `<p>Refresh varies up to 120Hz, so drive motion by elapsed time (delta) and declare a
      frame-rate range — never hard-code 60fps, which was safe in the pre-ProMotion era but silently runs motion
      too fast (or wastes power if you clamp the callback rate) once the display can do 120Hz. Backgrounding it on
      a separate thread doesn't fix that; the issue is the time model, not the thread.</p>`,
  },
];

export const ADVANCED16_STUDY: StudySection[] = [
  {
    id: "st-adv-39",
    num: "54",
    title: "54 · Core Animation & the layer tree",
    html: `<p><b>What it is.</b> Under every <code>UIView</code> is a <code>CALayer</code> that holds the visual
      properties and does the compositing — and the system <b>render server</b> animates/composites the layer tree
      in a separate process on the GPU. Animatable layer properties animate <b>implicitly</b>; for control use
      explicit <code>CABasicAnimation</code>/<code>CAKeyframeAnimation</code> and group/suppress with
      <code>CATransaction</code>. Specialized layers (<code>CAShapeLayer</code>, <code>CAGradientLayer</code>,
      <code>CAEmitterLayer</code>) build rich visuals; <code>CADisplayLink</code> drives custom per-frame
      animation.</p>
    <div class="callout warn"><span class="lbl">Watch the GPU</span> Masks, corner-radius+clip, and shadows
      without a <code>shadowPath</code> cause <b>offscreen rendering</b>; <code>shouldRasterize</code> helps only
      for static layers (set <code>rasterizationScale</code>). Confirm with the Core Animation instrument's
      coloring — don't take it on faith.</div>
    <p>Say this: "Every view has a backing layer that does the actual compositing — I use that seam when I need
      layer-only effects, and I profile the offscreen-render coloring before shipping masks or shadows on a
      scrolling list."</p>`,
  },
  {
    id: "st-adv-40",
    num: "55",
    title: "55 · Metal & GPU graphics",
    html: `<p><b>What it is.</b> <b>Metal</b> is the low-level GPU API (command queue/buffer, render + compute
      pipelines, MSL shaders) underpinning Core Animation, SpriteKit, and RealityKit. Use it directly via
      <code>MTKView</code> for custom real-time rendering, games, or GPU compute; <b>Metal Performance Shaders</b>
      provide optimized image/ML kernels without writing shaders.</p>
    <p>SwiftUI reaches the GPU too: <code>.drawingGroup()</code> (Metal-flattened subtree), <code>Canvas</code>,
      and iOS 17 <code>.colorEffect</code>/<code>.layerEffect</code> (real Metal shaders on views). Respect
      <b>ProMotion</b> — drive custom animation by time delta with a <code>preferredFrameRateRange</code>.</p>
    <div class="callout tip"><span class="lbl">Pick the level</span> SwiftUI/Core Animation → Core Graphics →
      Canvas → Metal. Drop down only for a measured need; each step adds control and cost.</div>
    <p>Say this: "Metal is the layer everything else — Core Animation, SpriteKit, RealityKit — is built on. I only
      reach for MTKView directly when a profiled bottleneck shows the higher-level abstractions can't deliver
      what I need."</p>`,
  },
];
