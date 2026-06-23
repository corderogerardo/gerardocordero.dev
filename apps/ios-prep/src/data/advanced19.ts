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
    answerHtml: `<p>Apple's <b>2D game/animation engine</b>: a scene graph of nodes rendered with a built-in game
      loop and physics. Use it for 2D games, particle effects, or richly animated, sprite-heavy scenes that would
      be awkward and slow as hundreds of UIViews/SwiftUI views.</p>`,
    level: "senior",
  },
  {
    id: "j2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What's the SpriteKit node hierarchy?",
    answerHtml: `<p>An <code>SKScene</code> (root) contains <code>SKNode</code>s: <code>SKSpriteNode</code>
      (textured sprite), <code>SKLabelNode</code> (text), <code>SKShapeNode</code> (vector),
      <code>SKEmitterNode</code> (particles). Note the origin is <b>bottom-left</b> and y goes up — opposite of
      UIKit.</p>`,
    level: "senior",
  },
  {
    id: "j3",
    category: "perf",
    categoryLabel: "Performance",
    question: "How does the SpriteKit game loop work?",
    answerHtml: `<p>Each frame SpriteKit calls a sequence: <code>update(_:)</code> (your game logic), then
      physics/actions evaluation, then <code>didFinishUpdate</code>. Drive game state in <code>update</code> using
      the passed timestamp (delta time) so motion is frame-rate independent.</p>`,
    level: "senior",
  },
  {
    id: "j4",
    category: "perf",
    categoryLabel: "Performance",
    question: "How does SpriteKit physics work?",
    answerHtml: `<p>Attach an <code>SKPhysicsBody</code> to nodes; the scene's physics world applies gravity and
      resolves collisions. Use <code>categoryBitMask</code>/<code>collisionBitMask</code>/
      <code>contactTestBitMask</code> to define what collides and what merely <i>reports contact</i> to your
      <code>SKPhysicsContactDelegate</code>.</p>`,
    level: "senior",
  },
  {
    id: "j5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What are SKActions?",
    answerHtml: `<p>Declarative animations/behaviors you run on nodes: move, rotate, scale, fade, playSound,
      run a closure — composed with <code>sequence</code>, <code>group</code> (parallel), and
      <code>repeatForever</code>. They're the SpriteKit equivalent of an animation timeline for node
      properties.</p>`,
    level: "mid",
  },
  {
    id: "j6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you embed SpriteKit in SwiftUI?",
    answerHtml: `<p>Use <code>SpriteView(scene:)</code> to host an <code>SKScene</code> directly in a SwiftUI
      view — handy for game screens, animated backgrounds, or particle effects inside an otherwise-SwiftUI app.
      (UIKit hosts it via <code>SKView</code>.)</p>`,
    level: "mid",
  },
  {
    id: "j7",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "SpriteKit vs SceneKit vs RealityKit?",
    answerHtml: `<p><b>SpriteKit</b> = 2D. <b>SceneKit</b> = older 3D scene graph. <b>RealityKit</b> = modern 3D
      + AR, ECS-based, the go-to for new 3D/AR work (and the only 3D engine on visionOS). Pick SpriteKit for 2D
      games; RealityKit for 3D and augmented reality.</p>`,
    level: "senior",
  },
  {
    id: "j8",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is RealityKit?",
    answerHtml: `<p>Apple's modern <b>3D rendering + AR</b> framework, built on an <b>Entity-Component-System</b>
      architecture with physically-based rendering, physics, animations, and spatial audio. It powers AR on iOS
      and all 3D on visionOS, and loads <b>USDZ</b> assets.</p>`,
    level: "senior",
  },
  {
    id: "j9",
    category: "perf",
    categoryLabel: "Performance",
    question: "Explain RealityKit's Entity-Component-System model.",
    answerHtml: `<p><b>Entities</b> are objects in the scene; <b>Components</b> are data attached to them
      (transform, model, collision, physics); <b>Systems</b> run logic over entities with given components each
      frame. A <code>ModelEntity</code> is an entity with a mesh + materials. ECS favors composition over
      inheritance and scales to many objects.</p>`,
    level: "architect",
  },
  {
    id: "j10",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you host RealityKit content in SwiftUI?",
    answerHtml: `<p><code>RealityView</code> (iOS 18 / visionOS): a SwiftUI view where you build and update a
      RealityKit scene (add entities, attach SwiftUI attachments, respond to state). On older iOS, RealityKit
      content lives in an <code>ARView</code> bridged via <code>UIViewRepresentable</code>.</p>`,
    level: "senior",
  },
  {
    id: "j11",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do materials and models work in RealityKit?",
    answerHtml: `<p>Load realistic assets from <b>USDZ</b> (Apple's 3D format) or build meshes in code; apply
      <b>PBR materials</b> (<code>SimpleMaterial</code>, <code>PhysicallyBasedMaterial</code>) and lighting/
      image-based lighting. Animations ride along in the USDZ or are driven via the animation API. Reality
      Composer Pro helps author scenes.</p>`,
    level: "senior",
  },
  {
    id: "j12",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is ARKit and how does a session start?",
    answerHtml: `<p>ARKit does the <b>tracking and scene understanding</b> (RealityKit does the rendering). You
      run an <code>ARSession</code> with a configuration —
      <code>ARWorldTrackingConfiguration</code> (6-DoF world), face, body, image, or object tracking — and the
      session continuously reports camera pose and detected anchors.</p>`,
    level: "senior",
  },
  {
    id: "j13",
    category: "perf",
    categoryLabel: "Performance",
    question: "How does plane detection work?",
    answerHtml: `<p>Enable <code>planeDetection</code> (horizontal/vertical) on the world-tracking config; ARKit
      finds surfaces and surfaces them as <code>ARPlaneAnchor</code>s (with extent/classification) that grow as it
      learns the scene. You anchor virtual content to those planes (tables, floors, walls).</p>`,
    level: "senior",
  },
  {
    id: "j14",
    category: "perf",
    categoryLabel: "Performance",
    question: "How do you place virtual content where the user taps?",
    answerHtml: `<p><b>Raycasting</b>: cast a ray from the tapped screen point into the scene
      (<code>makeRaycastQuery</code> / <code>raycast</code>) to find where it hits a detected surface, then add an
      <code>AnchorEntity</code>/<code>ARAnchor</code> there and attach your model. Prefer raycasts over the older
      hit-test API.</p>`,
    level: "senior",
  },
  {
    id: "j15",
    category: "perf",
    categoryLabel: "Performance",
    question: "What does LiDAR add to AR?",
    answerHtml: `<p>On LiDAR devices, <b>scene reconstruction</b> builds a real-time mesh of the environment,
      enabling accurate <b>occlusion</b> (virtual objects hidden behind real ones), instant plane/depth, and
      physics against real surfaces — a big realism jump. Provide a non-LiDAR fallback for unsupported
      devices.</p>`,
    level: "architect",
  },
  {
    id: "j16",
    category: "perf",
    categoryLabel: "Performance",
    question: "What are AR best practices?",
    answerHtml: `<p>Show the <b>coaching overlay</b> to guide the user to a trackable surface, use <b>lighting
      estimation</b> so virtual content matches the room, watch <b>thermals/battery</b> (AR is GPU+sensor heavy —
      keep scenes lean), handle tracking-state changes, and prefer <code>RealityView</code>/<code>ARView</code> +
      raycasting over legacy SceneKit AR.</p>`,
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
      effects, not standard form UI.</p>`,
  },
  {
    id: "jz2",
    category: "perf",
    categoryLabel: "Performance",
    question: "To make SpriteKit motion frame-rate independent, use:",
    options: ["A fixed pixel step per frame", "The delta time passed to update(_:)", "DispatchQueue", "A Timer"],
    answer: 1,
    explanationHtml: `<p>Drive movement by elapsed time (delta) in <code>update(_:)</code> so it behaves the same
      at 60 or 120 fps.</p>`,
  },
  {
    id: "jz3",
    category: "perf",
    categoryLabel: "Performance",
    question: "In SpriteKit, to be notified when two bodies touch (without bouncing) you set:",
    options: ["collisionBitMask", "contactTestBitMask + a contact delegate", "zPosition", "alpha"],
    answer: 1,
    explanationHtml: `<p><code>contactTestBitMask</code> reports contacts to the
      <code>SKPhysicsContactDelegate</code>; <code>collisionBitMask</code> controls physical bouncing.</p>`,
  },
  {
    id: "jz4",
    category: "perf",
    categoryLabel: "Performance",
    question: "RealityKit is architected around:",
    options: ["MVC", "An Entity-Component-System (ECS)", "Storyboards", "UIView hierarchy"],
    answer: 1,
    explanationHtml: `<p>Entities hold components (data); systems run logic over them — composition over
      inheritance, scaling to many objects.</p>`,
  },
  {
    id: "jz5",
    category: "perf",
    categoryLabel: "Performance",
    question: "In ARKit, the rendering vs tracking split is:",
    options: ["ARKit renders, RealityKit tracks", "ARKit tracks/understands the scene; RealityKit renders", "Both render", "Neither tracks"],
    answer: 1,
    explanationHtml: `<p>ARKit provides camera pose, planes, and scene understanding; RealityKit (or SceneKit)
      draws the virtual content.</p>`,
  },
  {
    id: "jz6",
    category: "perf",
    categoryLabel: "Performance",
    question: "To place an object where the user taps a real surface, use:",
    options: ["A random position", "A raycast to a detected surface, then anchor there", "CoreLocation", "A timer"],
    answer: 1,
    explanationHtml: `<p>Raycast from the screen point to a detected surface and attach an anchor/entity at the
      hit — the modern replacement for hit-testing.</p>`,
  },
];

export const ADVANCED19_STUDY: StudySection[] = [
  {
    id: "st-adv-45",
    num: "60",
    title: "60 · SpriteKit: 2D games & effects",
    html: `<p><b>What it is.</b> A 2D engine: an <code>SKScene</code> graph of nodes (<code>SKSpriteNode</code>,
      <code>SKLabelNode</code>, <code>SKEmitterNode</code>) with a built-in <b>game loop</b>
      (<code>update(_:)</code> using delta time), <b>physics</b> (<code>SKPhysicsBody</code> with
      category/collision/contact masks + a contact delegate), and <b>SKActions</b> for animation. Host it in
      SwiftUI with <code>SpriteView</code>.</p>
    <p>Reach for SpriteKit when you have many sprites, particles, or physics — work that would be slow and awkward
      as a UIView/SwiftUI tree. (Note the bottom-left origin.)</p>
    <div class="callout tip"><span class="lbl">Frame independence</span> Always scale motion by the time delta in
      <code>update</code> so gameplay is identical at 60 and 120 fps.</div>`,
  },
  {
    id: "st-adv-46",
    num: "61",
    title: "61 · RealityKit & ARKit",
    html: `<p><b>What it is.</b> <b>RealityKit</b> is the modern 3D + AR engine (Entity-Component-System, PBR
      materials, USDZ assets) — the only 3D engine on visionOS and the renderer for AR on iOS. Host it with
      <code>RealityView</code> (SwiftUI, iOS 18/visionOS) or an <code>ARView</code>. <b>ARKit</b> handles tracking
      and scene understanding: run an <code>ARSession</code> with a configuration (world/face/body/image),
      detect planes, and place content via <b>raycasting</b> to anchors.</p>
    <p>On LiDAR devices, <b>scene reconstruction</b> adds occlusion and real-surface physics. Use the coaching
      overlay and lighting estimation, and watch thermals — AR is GPU- and sensor-heavy.</p>
    <div class="callout warn"><span class="lbl">Division of labor</span> ARKit = "where is the camera and what's
      around it"; RealityKit/SceneKit = "draw the virtual stuff".</div>`,
  },
];
