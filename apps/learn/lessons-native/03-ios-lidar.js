window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "native-ios-lidar",
  title: "iOS: reading LiDAR depth",
  emoji: "📱",
  lang: "swift",
  lessons: [
    {
      id: "arkit",
      title: "An ARKit view that streams depth",
      steps: [
        {
          type: "text",
          md: [
            "## The native view is where the real work is",
            "On iOS, the depth comes from ARKit. You run an AR session with **scene depth** turned on, and each frame carries a `depthMap` — a buffer of distances. Your `ExpoView` subclass hosts an `ARSCNView`, acts as the session's delegate, and on every frame reads the depth at the **center pixel** and fires it up to JS.",
            "Key fact you'll quote later: ARKit's `depthMap` is a `CVPixelBuffer` of `Float32` values already **in meters**. No unit conversion on iOS. (Android will be different — hold that thought.)",
          ],
        },
        {
          type: "code",
          lang: "swift",
          title: "ios/ExpoDepthScannerView.swift — the sensor half",
          source: String.raw`import ExpoModulesCore
import ARKit
import SceneKit

class DepthScannerView: ExpoView, ARSessionDelegate {
  private let sceneView = ARSCNView()
  private var isActive = false

  // Events declared in definition() become callable dispatchers here.
  let onDepth = EventDispatcher()
  let onUnsupported = EventDispatcher()

  required init(appContext: AppContext) {
    super.init(appContext: appContext)
    addSubview(sceneView)
    sceneView.session.delegate = self
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    sceneView.frame = bounds
  }

  func setActive(_ active: Bool) {
    guard active != isActive else { return }
    isActive = active
    active ? startSession() : sceneView.session.pause()
  }

  private func startSession() {
    guard ARWorldTrackingConfiguration.supportsFrameSemantics(.sceneDepth) else {
      onUnsupported(["reason": "LiDAR sceneDepth unavailable on this device"])
      return
    }
    let config = ARWorldTrackingConfiguration()
    config.frameSemantics = .sceneDepth        // the LiDAR switch
    sceneView.session.run(config)
  }
}`,
          caption: "EventDispatcher is the up-channel: calling onDepth([...]) delivers to the JS onDepth callback. supportsFrameSemantics guards devices without LiDAR — and reports it up instead of silently doing nothing.",
        },
        {
          type: "code",
          lang: "swift",
          title: "ios/ExpoDepthScannerView.swift — sampling the center pixel",
          source: String.raw`extension DepthScannerView {
  // ARSessionDelegate: called ~30-60x/sec with a fresh frame.
  func session(_ session: ARSession, didUpdate frame: ARFrame) {
    guard let depth = frame.sceneDepth else { return }
    let depthMap = depth.depthMap          // CVPixelBuffer, Float32, METERS

    CVPixelBufferLockBaseAddress(depthMap, .readOnly)
    defer { CVPixelBufferUnlockBaseAddress(depthMap, .readOnly) }

    let w = CVPixelBufferGetWidth(depthMap)
    let h = CVPixelBufferGetHeight(depthMap)
    guard let base = CVPixelBufferGetBaseAddress(depthMap) else { return }
    let rowBytes = CVPixelBufferGetBytesPerRow(depthMap)
    let ptr = base.advanced(by: (h / 2) * rowBytes).assumingMemoryBound(to: Float32.self)
    let meters = ptr[w / 2]

    onDepth(["meters": Double(meters), "confidence": 2.0])
  }
}`,
          caption: "Lock the buffer, jump to the middle row, read the middle column. The confidence map (0…2 per pixel) is sampled the same way in the full version; here we send a constant so the JS contract stays honest.",
        },
        {
          type: "text",
          md: [
            "## Now register it with the DSL",
            "The view exists; the module has to *register* it under the name JS looks up, declare its events, and map the `active` prop to `setActive`. This is the same `View(...) { Prop, Events }` DSL that `expo-ui` uses for every one of its controls.",
          ],
        },
        {
          type: "exercise",
          lang: "swift",
          title: "Register the view in definition()",
          prompt: [
            "Inside `definition()`, after `Name(\"DepthScanner\")`, register the view. Use `View(DepthScannerView.self) { … }` and inside it: declare `Events(\"onDepth\", \"onUnsupported\")`, then a `Prop(\"active\")` whose closure takes `(view: DepthScannerView, active: Bool)` and calls `view.setActive(active)`.",
          ],
          starter: String.raw`public func definition() -> ModuleDefinition {
  Name("DepthScanner")

  // register the view here
}`,
          solution: String.raw`public func definition() -> ModuleDefinition {
  Name("DepthScanner")

  View(DepthScannerView.self) {
    Events("onDepth", "onUnsupported")

    Prop("active") { (view: DepthScannerView, active: Bool) in
      view.setActive(active)
    }
  }
}`,
          checks: [
            { re: /View\(DepthScannerView\.self\)\{/, hint: "Register with `View(DepthScannerView.self) { … }` — `.self` passes the type itself." },
            { re: /Events\("onDepth","onUnsupported"\)/, hint: "Declare both events: `Events(\"onDepth\", \"onUnsupported\")` — the names must match the EventDispatchers and the TS callback." },
            { re: /Prop\("active"\)\{/, hint: "Map the down-channel: `Prop(\"active\") { … }`." },
            { re: /view\.setActive\(active\)/, hint: "Inside the Prop closure, call `view.setActive(active)` — prop value → native setter." },
          ],
          success: "That six-line block is the entire bridge on the iOS side — and it's structurally identical to how expo-ui registers a Button. You've now built a native view the expo-ui way.",
        },
        {
          type: "quiz",
          q: "ARKit's `frame.sceneDepth?.depthMap` gives distances in what unit, and what turns it on?",
          choices: [
            "Meters (Float32); enabled by config.frameSemantics = .sceneDepth",
            "Millimeters (Int16); enabled by config.depthMode = .automatic",
            "Pixels; enabled automatically with any AR session",
            "Centimeters; enabled by requesting camera permission",
          ],
          answer: 0,
          explain: "On iOS the depthMap is Float32 meters, and one line — config.frameSemantics = .sceneDepth — turns LiDAR depth on. The millimeters/.automatic answer is the ANDROID story; keeping the two straight is exactly the cross-platform detail an interviewer probes.",
          nudge: "One platform gives meters, the other millimeters. Which is iOS?",
        },
        {
          type: "exercise",
          lang: "swift",
          title: "Turn LiDAR on",
          prompt: [
            "Complete `startSession()`: between creating the config and running it, set the frame semantics to scene depth. That single line is what enables LiDAR.",
          ],
          starter: String.raw`let config = ARWorldTrackingConfiguration()
// enable LiDAR scene depth here
sceneView.session.run(config)`,
          solution: String.raw`let config = ARWorldTrackingConfiguration()
config.frameSemantics = .sceneDepth
sceneView.session.run(config)`,
          checks: [
            { re: /config\.frameSemantics=\.sceneDepth/, hint: "Set `config.frameSemantics = .sceneDepth` — everything else about \"turning on LiDAR\" is just plumbing around this one assignment." },
          ],
          success: "That's the whole 'enable LiDAR' step. Add NSCameraUsageDescription to app.json's ios.infoPlist, run `npx expo run:ios --device`, and point it at a wall — the readings should track a tape measure.",
        },
      ],
    },
  ],
});
