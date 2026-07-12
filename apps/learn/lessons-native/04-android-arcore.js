window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "native-android-arcore",
  title: "Android: reading ARCore depth",
  emoji: "🤖",
  lang: "kotlin",
  lessons: [
    {
      id: "arcore",
      title: "The same contract, a second backend",
      steps: [
        {
          type: "text",
          md: [
            "## One JS contract, two native backends",
            "Here's the payoff of designing the contract first: the Android side is a *different implementation of the same interface*. The React screen won't change at all. Only the native adapter does.",
            "On Android the depth comes from **ARCore**. Raw camera rendering wants OpenGL — too much for a focused build — so we host a Compose `ARScene` (from the SceneView library) inside an `ExpoView`, and read depth off each frame. ARCore gives a `DEPTH16` image in **millimeters**, where the low 13 bits are the distance.",
            "> In an interview, say: **\"Because I designed the TypeScript contract up front, adding Android was writing a second adapter to the same `{ meters, confidence }` event — the JS never changed. Cross-platform design lives in the contract, not the implementations.\"**",
          ],
        },
        {
          type: "code",
          lang: "kotlin",
          title: "android/.../ExpoDepthScannerView.kt — Compose AR surface + depth read",
          source: String.raw`class DepthScannerView(context: Context, appContext: AppContext) :
  ExpoView(context, appContext) {

  private val onDepth by EventDispatcher()
  private val onUnsupported by EventDispatcher()
  var active: Boolean = false

  private val composeView = ComposeView(context).also { addView(it) }

  init {
    composeView.setContent {
      ARScene(
        sessionConfiguration = { session, config ->
          if (session.isDepthModeSupported(Config.DepthMode.AUTOMATIC)) {
            config.depthMode = Config.DepthMode.AUTOMATIC   // the depth switch
          } else {
            onUnsupported(mapOf("reason" to "ARCore depth unavailable"))
          }
        },
        onSessionUpdated = { _, frame ->
          if (!active) return@ARScene
          try {
            frame.acquireDepthImage16Bits().use { img ->     // DEPTH16, MILLIMETERS
              val buf = img.planes[0].buffer
              val rowStride = img.planes[0].rowStride
              val cx = img.width / 2; val cy = img.height / 2
              val idx = cy * rowStride + cx * 2
              val raw = (buf.get(idx).toInt() and 0xFF) or
                        ((buf.get(idx + 1).toInt() and 0xFF) shl 8)
              val millimeters = raw and 0x1FFF               // low 13 bits = depth
              onDepth(mapOf("meters" to millimeters / 1000.0, "confidence" to 2.0))
            }
          } catch (_: NotYetAvailableException) { /* depth not ready this frame */ }
        }
      )
    }
  }
}`,
          caption: "Same up-channel (EventDispatcher → onDepth), same event shape. The differences are all inside: a 16-bit buffer, a bit-mask, and a millimetres-to-metres divide.",
        },
        {
          type: "text",
          md: [
            "## The cross-platform diff — memorize this",
            "This little table is the single most quotable thing in the course. Same idea on both platforms (a per-pixel depth raster), different plumbing:",
            "- **Enable it** — iOS: `frameSemantics = .sceneDepth`  ·  Android: `config.depthMode = AUTOMATIC`.\n- **Buffer** — iOS: `CVPixelBuffer` of `Float32`  ·  Android: `Image` of `DEPTH16`.\n- **Units** — iOS: **meters**  ·  Android: **millimeters** (divide by 1000).\n- **Bit layout** — iOS: a full float  ·  Android: low 13 bits are depth, top 3 are confidence.\n- **The JS event** — **identical** on both: `{ meters, confidence }`.",
            "> In an interview, say: **\"ARKit and ARCore differ only in buffer format and units — meters vs millimeters. The event I ship to JS is byte-for-byte the same on both platforms. The last row is the whole point: the contract is identical; only the adapter differs.\"**",
          ],
        },
        {
          type: "quiz",
          q: "You wire up Android and the readout says '1500 m' pointing at a wall. What's the bug?",
          choices: [
            "The raw millimeter value wasn't converted to meters (÷1000) — 1.5 m read as 1500",
            "The LiDAR sensor is broken and needs recalibration",
            "ARCore isn't supported on the device",
            "The camera permission wasn't granted",
          ],
          answer: 0,
          explain: "1500 is 1.5 m expressed in millimeters — a missing ÷1000. This is exactly why iOS-vs-Android units are worth memorizing: a wildly-too-large number on Android is almost always the unconverted-millimeters bug, and being able to diagnose it instantly is a great signal.",
          nudge: "1.5 meters is how many millimeters?",
        },
        {
          type: "exercise",
          lang: "kotlin",
          title: "Register the view (Android side)",
          prompt: [
            "Inside `definition()`, after `Name(\"DepthScanner\")`, register the view with `View(DepthScannerView::class) { … }`: declare `Events(\"onDepth\", \"onUnsupported\")`, then a `Prop(\"active\")` whose lambda is `view: DepthScannerView, active: Boolean -> view.active = active`.",
          ],
          starter: String.raw`override fun definition() = ModuleDefinition {
  Name("DepthScanner")

  // register the view here
}`,
          solution: String.raw`override fun definition() = ModuleDefinition {
  Name("DepthScanner")

  View(DepthScannerView::class) {
    Events("onDepth", "onUnsupported")

    Prop("active") { view: DepthScannerView, active: Boolean ->
      view.active = active
    }
  }
}`,
          checks: [
            { re: /View\(DepthScannerView::class\)\{/, hint: "Register with `View(DepthScannerView::class) { … }` — Kotlin passes the class with `::class`, where Swift used `.self`." },
            { re: /Events\("onDepth","onUnsupported"\)/, hint: "Declare `Events(\"onDepth\", \"onUnsupported\")` — same names as iOS and the TS contract." },
            { re: /Prop\("active"\)\{/, hint: "Add `Prop(\"active\") { … }`." },
            { re: /view\.active=active/, hint: "The lambda body sets `view.active = active` — here the prop maps to a property, not a setter method." },
          ],
          success: "Line it up against the Swift version from Module 3: the DSL is identical, only `.self` vs `::class` and setter-vs-property differ. That symmetry is the whole thesis of the course.",
        },
        {
          type: "exercise",
          lang: "kotlin",
          title: "Emit the depth event (with the unit fix)",
          prompt: [
            "The raw 13-bit millimeter distance is in `millimeters`. Fire the event: call `onDepth(mapOf(...))` with `\"meters\"` mapped to the value **converted to meters** (`millimeters / 1000.0`) and `\"confidence\"` mapped to `2.0`.",
          ],
          starter: String.raw`val millimeters = raw and 0x1FFF   // low 13 bits = depth in mm
onDepth(mapOf(
  // your code here
))`,
          solution: String.raw`val millimeters = raw and 0x1FFF
onDepth(mapOf("meters" to millimeters / 1000.0, "confidence" to 2.0))`,
          checks: [
            { re: /"meters"to millimeters\/1000\.0/, hint: "Convert: `\"meters\" to millimeters / 1000.0`. The `.0` makes it a Double divide — integer division would floor you to whole meters." },
            { re: /"confidence"to 2\.0/, hint: "Also send `\"confidence\" to 2.0` so the event shape matches iOS and the TS contract." },
          ],
          mustNot: [
            { re: /"meters"to millimeters,/, hint: "Don't send raw millimeters — that's the '1500 m' bug. Divide by 1000.0." },
          ],
          success: "Both platforms now emit the identical { meters, confidence } event. Run `npx expo run:android --device`, point at a wall, and the number should match the iPhone's — from a completely different sensor stack.",
        },
      ],
    },
  ],
});
