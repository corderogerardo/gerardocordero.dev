// Advanced batch 19 — SpriteKit, RealityKit & AR (senior/architect). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED19_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED19_FLASHCARDS: Flashcard[] = [
  {
    id: "j1",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is SpriteKit and when do you reach for it?",
    answerHtml: `<p>Reach for SpriteKit when hundreds of animated sprites would make UIKit/SwiftUI views slow and
      awkward — it's Apple's <b>2D game/animation engine</b>: a scene graph of nodes rendered with a built-in game
      loop and physics, purpose-built for that scale. Use it for 2D games, particle effects, or richly animated,
      sprite-heavy scenes.</p>
      <p><b>"I reach for SpriteKit once I'm animating dozens of independent sprites with physics — that's outside
      what a SwiftUI view tree is built to render efficiently."</b></p>`,
    level: "senior",
  },
  {
    id: "j2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What's the SpriteKit node hierarchy?",
    answerHtml: `<p>Everything you draw is a node in one tree, which is why layering, hit-testing, and grouped
      transforms all fall out of standard scene-graph parent/child rules. An <code>SKScene</code> (root) contains
      <code>SKNode</code>s: <code>SKSpriteNode</code> (textured sprite), <code>SKLabelNode</code> (text),
      <code>SKShapeNode</code> (vector), <code>SKEmitterNode</code> (particles).</p>
      <p>Red flag: assuming SpriteKit coordinates match UIKit. The origin is <b>bottom-left</b> and y goes up —
      opposite of UIKit — so ported UIKit positioning math needs its y flipped.</p>`,
    level: "senior",
  },
  {
    id: "j3",
    category: "perf",
    categoryLabel: "Performance",
    question: "How does the SpriteKit game loop work?",
    answerHtml: `<p>Gameplay has to look identical on a 60Hz and a 120Hz display, which is why the loop hands you a
      timestamp instead of letting you assume a fixed frame duration. Each frame SpriteKit calls a sequence:
      <code>update(_:)</code> (your game logic), then physics/actions evaluation, then
      <code>didFinishUpdate</code>.</p>
      <p><b>"I drive game state off the delta time passed into update, never a fixed per-frame step — that's what
      keeps motion frame-rate independent."</b></p>`,
    level: "senior",
  },
  {
    id: "j4",
    category: "perf",
    categoryLabel: "Performance",
    question: "How does SpriteKit physics work?",
    answerHtml: `<p>Physics and "notify me" are deliberately split so you can detect an overlap (a coin pickup)
      without paying for a physical bounce. Attach an <code>SKPhysicsBody</code> to nodes; the scene's physics
      world applies gravity and resolves collisions. Use <code>categoryBitMask</code>/<code>collisionBitMask</code>/
      <code>contactTestBitMask</code> to define what collides and what merely <i>reports contact</i> to your
      <code>SKPhysicsContactDelegate</code>.</p>
      <p>Red flag: reaching for <code>collisionBitMask</code> when you only need a contact notification — that
      makes bodies physically bounce off each other when all you wanted was an event.</p>`,
    level: "senior",
  },
  {
    id: "j5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What are SKActions?",
    answerHtml: `<p>SKActions exist so you don't hand-write a timer-driven animation loop for every node — they're
      the SpriteKit equivalent of an animation timeline: declarative animations/behaviors you run on nodes (move,
      rotate, scale, fade, playSound, run a closure), composed with <code>sequence</code>, <code>group</code>
      (parallel), and <code>repeatForever</code>.</p>`,
    level: "mid",
  },
  {
    id: "j6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you embed SpriteKit in SwiftUI?",
    answerHtml: `<p>SwiftUI doesn't reimplement a game loop, so it hosts SpriteKit's instead: <code>SpriteView(scene:)</code>
      embeds an <code>SKScene</code> directly in a SwiftUI view — handy for game screens, animated backgrounds, or
      particle effects inside an otherwise-SwiftUI app. (UIKit hosts it via <code>SKView</code>.)</p>`,
    level: "mid",
  },
  {
    id: "j7",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "SpriteKit vs SceneKit vs RealityKit?",
    answerHtml: `<p>Each one owns a different rendering dimension and era, so the choice is mostly "what are you
      rendering," not personal preference: <b>SpriteKit</b> = 2D. <b>SceneKit</b> = older 3D scene graph.
      <b>RealityKit</b> = modern 3D + AR, ECS-based, the go-to for new 3D/AR work (and the only 3D engine on
      visionOS).</p>
      <p><b>"I pick SpriteKit for 2D games, and RealityKit for any new 3D or AR work — SceneKit is legacy at this
      point."</b></p>`,
    level: "senior",
  },
  {
    id: "j8",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is RealityKit?",
    answerHtml: `<p>visionOS needed one 3D engine that scales from a single AR anchor to a whole spatial-computing
      scene, which is why Apple built RealityKit on composition instead of a rigid class hierarchy. It's Apple's
      modern <b>3D rendering + AR</b> framework, built on an <b>Entity-Component-System</b> architecture with
      physically-based rendering, physics, animations, and spatial audio. It powers AR on iOS and all 3D on
      visionOS, and loads <b>USDZ</b> assets.</p>`,
    level: "senior",
  },
  {
    id: "j9",
    category: "perf",
    categoryLabel: "Performance",
    question: "Explain RealityKit's Entity-Component-System model.",
    answerHtml: `<p>ECS exists so adding behavior to thousands of objects doesn't mean growing a deep, fragile class
      hierarchy — you compose it instead. <b>Entities</b> are objects in the scene; <b>Components</b> are data
      attached to them (transform, model, collision, physics); <b>Systems</b> run logic over entities with given
      components each frame. A <code>ModelEntity</code> is an entity with a mesh + materials.</p>
      <p><b>"ECS favors composition over inheritance — I add a component to opt an entity into a behavior instead
      of subclassing, which is what lets the same system scale from one object to thousands."</b></p>`,
    level: "architect",
  },
  {
    id: "j10",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you host RealityKit content in SwiftUI?",
    answerHtml: `<p>The hosting API split tracks a real platform boundary, not just style preference: <code>RealityView</code>
      (iOS 18 / visionOS) is a SwiftUI view where you build and update a RealityKit scene (add entities, attach
      SwiftUI attachments, respond to state) natively. On older iOS, RealityKit content lives in an
      <code>ARView</code> bridged via <code>UIViewRepresentable</code>, since <code>RealityView</code> isn't
      available yet.</p>`,
    level: "senior",
  },
  {
    id: "j11",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do materials and models work in RealityKit?",
    answerHtml: `<p>Realistic-looking AR content needs both correct geometry and physically accurate shading, so
      RealityKit splits the two concerns: load assets from <b>USDZ</b> (Apple's 3D format) or build meshes in code,
      then apply <b>PBR materials</b> (<code>SimpleMaterial</code>, <code>PhysicallyBasedMaterial</code>) and
      lighting/image-based lighting on top. Animations ride along in the USDZ or are driven via the animation API;
      Reality Composer Pro helps author scenes.</p>`,
    level: "senior",
  },
  {
    id: "j12",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is ARKit and how does a session start?",
    answerHtml: `<p>Tracking and rendering are separated so either can improve independently — that's why ARKit
      does the <b>tracking and scene understanding</b> while RealityKit does the rendering. You run an
      <code>ARSession</code> with a configuration — <code>ARWorldTrackingConfiguration</code> (6-DoF world), face,
      body, image, or object tracking — and the session continuously reports camera pose and detected anchors.</p>
      <p><b>"ARKit tells me where the camera is and what it's looking at; RealityKit draws the content on top of
      that."</b></p>`,
    level: "senior",
  },
  {
    id: "j13",
    category: "perf",
    categoryLabel: "Performance",
    question: "How does plane detection work?",
    answerHtml: `<p>Virtual objects need a real surface to sit on convincingly, so ARKit continuously refines its
      understanding of the room rather than detecting once. Enable <code>planeDetection</code>
      (horizontal/vertical) on the world-tracking config; ARKit finds surfaces and surfaces them as
      <code>ARPlaneAnchor</code>s (with extent/classification) that grow as it learns the scene. You anchor
      virtual content to those planes (tables, floors, walls).</p>`,
    level: "senior",
  },
  {
    id: "j14",
    category: "perf",
    categoryLabel: "Performance",
    question: "How do you place virtual content where the user taps?",
    answerHtml: `<p><b>Raycasting</b>: cast a ray from the tapped screen point into the scene
      (<code>makeRaycastQuery</code> / <code>raycast</code>) to find where it hits a detected surface, then add an
      <code>AnchorEntity</code>/<code>ARAnchor</code> there and attach your model.</p>
      <p>Red flag: reaching for the older hit-test API in new code — raycasting against detected planes/geometry
      is the modern, more accurate replacement.</p>`,
    level: "senior",
  },
  {
    id: "j15",
    category: "perf",
    categoryLabel: "Performance",
    question: "What does LiDAR add to AR?",
    answerHtml: `<p>Without a depth mesh, virtual content always renders in front of real objects even when it
      should be hidden behind them — LiDAR closes that gap. On LiDAR devices, <b>scene reconstruction</b> builds a
      real-time mesh of the environment, enabling accurate <b>occlusion</b> (virtual objects hidden behind real
      ones), instant plane/depth, and physics against real surfaces.</p>
      <p>Red flag: shipping LiDAR-only occlusion with no fallback — most installed devices don't have LiDAR, so
      design a graceful non-LiDAR path rather than treating it as a hard requirement.</p>`,
    level: "architect",
  },
  {
    id: "j16",
    category: "perf",
    categoryLabel: "Performance",
    question: "What are AR best practices?",
    answerHtml: `<p>AR fails in ways form-based UIs don't — bad lighting, no trackable surface, thermal throttling —
      so a checklist beats improvising per app:</p>
      <p>1. <b>Guide tracking:</b> show the coaching overlay until a trackable surface is found. 2.
      <b>Match the room:</b> use lighting estimation so virtual content isn't obviously lit differently. 3.
      <b>Budget the hardware:</b> AR is GPU+sensor heavy — keep scenes lean and watch thermals/battery. 4.
      <b>Handle state changes:</b> react to tracking-state transitions instead of assuming tracking stays good. 5.
      <b>Use the current stack:</b> <code>RealityView</code>/<code>ARView</code> + raycasting over legacy SceneKit
      AR.</p>`,
    level: "senior",
  },
];

export const ADVANCED19_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED19_QUIZ: QuizQuestion[] = [
  {
    id: "jz1",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "SpriteKit is the right tool for:",
    options: ["A settings form", "A 2D game with many sprites and physics", "A REST client", "A table of data"],
    answer: 1,
    explanationHtml: `<p>SpriteKit is a 2D engine with a game loop + physics — ideal for sprite-heavy games and
      effects. A settings form, REST client, or data table is standard control-based UI; reaching for a game
      engine there is over-engineering that costs you the free layout/accessibility behavior UIKit/SwiftUI already
      give you.</p>`,
  },
  {
    id: "jz2",
    category: "perf",
    categoryLabel: "Performance",
    question: "To make SpriteKit motion frame-rate independent, use:",
    options: ["A fixed pixel step per frame", "The delta time passed to update(_:)", "DispatchQueue", "A Timer"],
    answer: 1,
    explanationHtml: `<p>Drive movement by elapsed time (delta) in <code>update(_:)</code> so it behaves the same
      at 60 or 120 fps. A fixed pixel step per frame is the tempting-but-wrong answer — it looks fine until the
      device's refresh rate changes and gameplay speed silently changes with it.</p>`,
  },
  {
    id: "jz3",
    category: "perf",
    categoryLabel: "Performance",
    question: "In SpriteKit, to be notified when two bodies touch (without bouncing) you set:",
    options: ["collisionBitMask", "contactTestBitMask + a contact delegate", "zPosition", "alpha"],
    answer: 1,
    explanationHtml: `<p><code>contactTestBitMask</code> reports contacts to the
      <code>SKPhysicsContactDelegate</code> without affecting physics. Picking <code>collisionBitMask</code> alone
      is the common mistake — that controls physical bouncing/blocking, not notification, so bodies would collide
      physically instead of just reporting the touch.</p>`,
  },
  {
    id: "jz4",
    category: "perf",
    categoryLabel: "Performance",
    question: "RealityKit is architected around:",
    options: ["MVC", "An Entity-Component-System (ECS)", "Storyboards", "UIView hierarchy"],
    answer: 1,
    explanationHtml: `<p>Entities hold components (data); systems run logic over them — composition over
      inheritance, scaling to many objects. MVC and storyboards are UIKit app-architecture patterns, not how
      RealityKit models a 3D scene internally.</p>`,
  },
  {
    id: "jz5",
    category: "perf",
    categoryLabel: "Performance",
    question: "In ARKit, the rendering vs tracking split is:",
    options: ["ARKit renders, RealityKit tracks", "ARKit tracks/understands the scene; RealityKit renders", "Both render", "Neither tracks"],
    answer: 1,
    explanationHtml: `<p>ARKit provides camera pose, planes, and scene understanding; RealityKit (or SceneKit)
      draws the virtual content. Swapping that direction ("ARKit renders") is the misconception — ARKit has no
      renderer of its own, it feeds tracking data to whichever engine draws.</p>`,
  },
  {
    id: "jz6",
    category: "perf",
    categoryLabel: "Performance",
    question: "To place an object where the user taps a real surface, use:",
    options: ["A random position", "A raycast to a detected surface, then anchor there", "CoreLocation", "A timer"],
    answer: 1,
    explanationHtml: `<p>Raycast from the screen point to a detected surface and attach an anchor/entity at the
      hit — the modern replacement for the older hit-test API, and far more reliable than guessing a random
      position (which ignores the actual room geometry entirely).</p>`,
  },
];

export const ADVANCED19_STUDY: StudySection[] = [
  {
    id: "st-adv-45",
    num: "60",
    title: "60 · SpriteKit: 2D games & effects",
    html: `<p><b>Why it exists.</b> Hundreds of animated, physics-driven sprites would be slow and awkward as a
      UIView/SwiftUI tree, so SpriteKit gives you a purpose-built 2D engine instead: an <code>SKScene</code> graph
      of nodes (<code>SKSpriteNode</code>, <code>SKLabelNode</code>, <code>SKEmitterNode</code>) with a built-in
      <b>game loop</b> (<code>update(_:)</code> using delta time), <b>physics</b> (<code>SKPhysicsBody</code> with
      category/collision/contact masks + a contact delegate), and <b>SKActions</b> for animation. Host it in
      SwiftUI with <code>SpriteView</code>.</p>
    <p>Reach for SpriteKit when you have many sprites, particles, or physics; reach for UIKit/SwiftUI otherwise.
      (Note the bottom-left origin.)</p>
    <div class="callout tip"><span class="lbl">Frame independence</span> Always scale motion by the time delta in
      <code>update</code> so gameplay is identical at 60 and 120 fps. In an interview, say: "I drive motion off
      delta time, never a fixed per-frame step."</div>`,
  },
  {
    id: "st-adv-46",
    num: "61",
    title: "61 · RealityKit & ARKit",
    html: `<p><b>Why the split.</b> Tracking and rendering are separate concerns that evolve on different
      timelines, so Apple built them as separate frameworks: <b>RealityKit</b> is the modern 3D + AR engine
      (Entity-Component-System, PBR materials, USDZ assets) — the only 3D engine on visionOS and the renderer for
      AR on iOS. Host it with <code>RealityView</code> (SwiftUI, iOS 18/visionOS) or an <code>ARView</code>.
      <b>ARKit</b> handles tracking and scene understanding: run an <code>ARSession</code> with a configuration
      (world/face/body/image), detect planes, and place content via <b>raycasting</b> to anchors.</p>
    <p>On LiDAR devices, <b>scene reconstruction</b> adds occlusion and real-surface physics — but ship a
      non-LiDAR fallback, since most installed devices lack it. Use the coaching overlay and lighting estimation,
      and watch thermals — AR is GPU- and sensor-heavy.</p>
    <div class="callout warn"><span class="lbl">Division of labor</span> ARKit = "where is the camera and what's
      around it"; RealityKit/SceneKit = "draw the virtual stuff." In an interview, say: "ARKit tracks, RealityKit
      renders — they're deliberately separate frameworks."</div>`,
  },
];
