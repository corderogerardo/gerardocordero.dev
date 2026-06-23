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
    answerHtml: `<p>Every <code>UIView</code> is backed by a <code>CALayer</code> that does the actual drawing,
      positioning, and compositing — the view is mostly a responder/layout wrapper around it. Layers hold visual
      properties (<code>bounds</code>, <code>opacity</code>, <code>transform</code>, <code>cornerRadius</code>,
      shadows) and form their own tree. Drop to the layer for effects and animations UIView doesn't expose.</p>`,
    level: "senior",
  },
  {
    id: "w2",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "What is implicit animation on a layer?",
    answerHtml: `<p>Setting an <b>animatable</b> property on a standalone <code>CALayer</code> (not a view's
      backing layer) animates it automatically over the default duration, via an implicit transaction. UIView
      backing layers disable this outside <code>UIView.animate</code>. Wrap changes in a <code>CATransaction</code>
      to tune or disable it (<code>setDisableActions(true)</code>).</p>`,
    level: "senior",
  },
  {
    id: "w3",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "When do you use explicit CAAnimations?",
    answerHtml: `<p><code>CABasicAnimation</code> (from→to on a keyPath like <code>"opacity"</code>),
      <code>CAKeyframeAnimation</code> (multi-stop, along a path), and <code>CAAnimationGroup</code> (run several
      together) — for fine control SwiftUI/UIView animation can't express: animating layer-only properties,
      precise timing/keyframes, or driving <code>CAShapeLayer</code> path/strokeEnd.</p>`,
    level: "senior",
  },
  {
    id: "w4",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "Where does Core Animation actually composite?",
    answerHtml: `<p>In a separate system process (the <b>render server</b>), on the GPU. Your app commits a
      layer tree; the render server animates and composites it independently — which is why a smooth
      Core Animation can continue even if your main thread is briefly busy, and why doing layout/CPU work per
      frame on the main thread is what causes hitches.</p>`,
    level: "architect",
  },
  {
    id: "w5",
    category: "perf",
    categoryLabel: "Performance",
    question: "What is offscreen rendering and what triggers it?",
    answerHtml: `<p>The GPU renders a layer to a temporary offscreen buffer before compositing — extra passes
      that hurt scrolling. Common triggers: masks, <code>cornerRadius</code> + <code>masksToBounds</code> on
      complex content, shadows <b>without</b> a <code>shadowPath</code>, and rasterization. Profile with the Core
      Animation instrument (color offscreen-rendered).</p>`,
    level: "senior",
  },
  {
    id: "w6",
    category: "perf",
    categoryLabel: "Performance",
    question: "When does shouldRasterize help vs hurt?",
    answerHtml: `<p><code>shouldRasterize = true</code> caches a layer as a bitmap so a complex, <b>static</b>
      subtree composites cheaply. It <b>hurts</b> if the content changes every frame (constant re-rasterization)
      or if you forget <code>rasterizationScale = screen.scale</code> (blurry on Retina). Use it for static,
      expensive layers only.</p>`,
    level: "senior",
  },
  {
    id: "w7",
    category: "perf",
    categoryLabel: "Performance",
    question: "How do you make shadows and rounded corners cheap?",
    answerHtml: `<p>Always set an explicit <code>shadowPath</code> (a free shadow vs an expensive offscreen
      pass). For rounded corners, prefer the modern corner APIs over <code>cornerRadius</code> +
      <code>masksToBounds</code> on image-heavy layers, or pre-mask the image. Verify with the offscreen-render
      color in Instruments.</p>`,
    level: "senior",
  },
  {
    id: "w8",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "What is CADisplayLink for?",
    answerHtml: `<p>A timer synchronized to the display refresh — your callback fires once per frame, so it's the
      right tool for custom frame-by-frame animation, physics, or a game loop. Use the frame's
      <code>targetTimestamp</code>/delta for time-based motion, and set
      <code>preferredFrameRateRange</code> for ProMotion.</p>`,
    level: "senior",
  },
  {
    id: "w9",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "Name specialized CALayer subclasses.",
    answerHtml: `<p><code>CAShapeLayer</code> (vector paths, animatable <code>strokeEnd</code> for progress
      rings), <code>CAGradientLayer</code>, <code>CATextLayer</code>, <code>CAEmitterLayer</code> (particles),
      <code>CAReplicatorLayer</code> (cheap duplicates), and <code>CATiledLayer</code> (huge content). They let
      you build rich visuals without custom <code>draw(_:)</code>.</p>`,
    level: "senior",
  },
  {
    id: "w10",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "What does CATransaction do?",
    answerHtml: `<p>It groups layer changes into one transaction: set the duration/timing for implicit
      animations, <b>disable</b> them (<code>setDisableActions(true)</code>), or attach a
      <code>completionBlock</code>. It's how you coordinate or suppress Core Animation's automatic animations.</p>`,
    level: "senior",
  },
  {
    id: "w11",
    category: "perf",
    categoryLabel: "Performance",
    question: "What is Metal, at a high level?",
    answerHtml: `<p>Apple's low-level GPU API. You record work into a <code>MTLCommandBuffer</code> from a
      <code>MTLCommandQueue</code>, set up render or compute <b>pipelines</b> with shaders written in MSL (Metal
      Shading Language), and commit it. It's the foundation under Core Animation, SpriteKit, RealityKit, and
      Swift's GPU work — you use it directly for custom rendering, games, or heavy effects.</p>`,
    level: "architect",
  },
  {
    id: "w12",
    category: "perf",
    categoryLabel: "Performance",
    question: "When do you actually need Metal?",
    answerHtml: `<p>For custom real-time rendering (games, 3D, shader-driven effects), processing every frame at
      high throughput, or GPU compute. For UI, Core Animation/SwiftUI already use the GPU efficiently — reach for
      <code>MTKView</code> + Metal only when standard views/Canvas can't deliver the visuals or performance you
      need.</p>`,
    level: "architect",
  },
  {
    id: "w13",
    category: "perf",
    categoryLabel: "Performance",
    question: "What are Metal Performance Shaders (MPS)?",
    answerHtml: `<p>A library of highly optimized GPU kernels — image filters (blur, convolution), matrix/neural
      operations — so you get GPU-accelerated image processing and ML primitives without writing shaders. Core ML
      and Core Image can run on the GPU via MPS under the hood.</p>`,
    level: "architect",
  },
  {
    id: "w14",
    category: "perf",
    categoryLabel: "Performance",
    question: "How does SwiftUI tap into GPU/Metal rendering?",
    answerHtml: `<p><code>.drawingGroup()</code> flattens a subtree into one Metal-rendered layer (speeds up
      complex vector/blend content). <code>Canvas</code> draws many elements in one layer. iOS 17 adds
      <code>.colorEffect</code>/<code>.distortionEffect</code>/<code>.layerEffect</code> — real <b>Metal
      shaders</b> applied to SwiftUI views. Use them surgically and measure.</p>`,
    level: "senior",
  },
  {
    id: "w15",
    category: "perf",
    categoryLabel: "Performance",
    question: "What do you need to know about ProMotion / 120Hz?",
    answerHtml: `<p>ProMotion displays vary refresh up to 120Hz. Standard UIKit/SwiftUI animations adapt
      automatically, but custom <code>CADisplayLink</code>-driven animation should set
      <code>preferredFrameRateRange</code> and be <b>time-based</b> (use the frame delta), not assume a fixed
      60fps — otherwise it runs too fast or wastes power. Higher refresh also means a tighter per-frame budget.</p>`,
    level: "senior",
  },
  {
    id: "w16",
    category: "perf",
    categoryLabel: "Performance",
    question: "How do you choose the right graphics abstraction?",
    answerHtml: `<p>Climb down only as far as you must: <b>SwiftUI / Core Animation</b> for almost everything
      (GPU-composited, cheap), <b>Core Graphics</b> for custom 2D vector drawing on the CPU (one-off images),
      <b>Canvas</b> for many elements in a SwiftUI layer, and <b>Metal</b> for custom GPU rendering/compute. Lower
      levels mean more control and more cost/complexity — justify the drop with a measured need.</p>`,
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
      the compositing; drop to the layer for layer-only effects/animations.</p>`,
  },
  {
    id: "wz2",
    category: "perf",
    categoryLabel: "Performance",
    question: "A shadow without a shadowPath is expensive because it causes:",
    options: ["A retain cycle", "Offscreen rendering", "A data race", "A memory leak"],
    answer: 1,
    explanationHtml: `<p>The GPU must render the layer offscreen to compute the shadow; setting an explicit
      <code>shadowPath</code> makes it cheap.</p>`,
  },
  {
    id: "wz3",
    category: "perf",
    categoryLabel: "Performance",
    question: "shouldRasterize is a win for:",
    options: ["Content that changes every frame", "A complex but static layer (with correct rasterizationScale)", "Solid color views", "Text fields"],
    answer: 1,
    explanationHtml: `<p>Rasterizing caches a static complex subtree as a bitmap; for constantly-changing
      content it re-rasterizes every frame and hurts.</p>`,
  },
  {
    id: "wz4",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "A callback synchronized to each display refresh comes from:",
    options: ["Timer", "CADisplayLink", "DispatchQueue.main.asyncAfter", "URLSession"],
    answer: 1,
    explanationHtml: `<p><code>CADisplayLink</code> fires once per frame — the right driver for custom
      frame-by-frame animation or a game loop (use the frame delta, set the frame-rate range for ProMotion).</p>`,
  },
  {
    id: "wz5",
    category: "perf",
    categoryLabel: "Performance",
    question: "You'd reach for Metal directly when:",
    options: ["Building a standard list UI", "Doing custom real-time GPU rendering / compute", "Animating opacity", "Rounding corners"],
    answer: 1,
    explanationHtml: `<p>Core Animation/SwiftUI already use the GPU for UI; Metal is for custom rendering,
      games, shaders, or GPU compute that standard views can't deliver.</p>`,
  },
  {
    id: "wz6",
    category: "perf",
    categoryLabel: "Performance",
    question: "Custom CADisplayLink animation on ProMotion should be:",
    options: ["Assumed to run at 60fps", "Time-based using the frame delta, with a preferredFrameRateRange", "Disabled", "Run on a background thread"],
    answer: 1,
    explanationHtml: `<p>Refresh varies up to 120Hz, so drive motion by elapsed time (delta) and declare a
      frame-rate range — never hard-code 60fps.</p>`,
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
      coloring.</div>`,
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
      Canvas → Metal. Drop down only for a measured need; each step adds control and cost.</div>`,
  },
];
