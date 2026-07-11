window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "native-mental-model",
  title: "The three-layer mental model",
  emoji: "🧱",
  lang: "ts",
  lessons: [
    {
      id: "layers",
      title: "Sensor → native view → bridge → JS",
      steps: [
        {
          type: "text",
          md: [
            "## One vertical slice, three layers",
            "Before any code, hold the whole shape in your head. Data flows **up** from a sensor to your screen; configuration flows **down** from your screen to the sensor. You are building one vertical slice through three layers:",
            "1. **React Native (TypeScript/JSX)** — `<DepthScannerView onDepth={…} />` on a screen, plus a thin TS binding that names the native view.\n2. **The Expo Module definition** — the `View(...) { Prop, Events }` DSL. This is the bridge you author.\n3. **The native view + sensor** — a real UIKit/Android view hosting ARKit or ARCore, sampling depth.",
            "> In an interview, say: **\"A native module is one vertical slice: props flow down from JS to a native setter, events flow up from the sensor to a JS callback. Everything else is plumbing between those two directions.\"**",
          ],
        },
        {
          type: "code",
          lang: "ts",
          title: "The layers, drawn",
          source: String.raw`React Native (TS/JSX)
  <DepthScannerView onDepth={e => setMeters(e.nativeEvent.meters)} />
  requireNativeView('DepthScanner')            // thin TS binding
        ▲  props down, events up  (over JSI)
Expo Module definition()  — the DSL you write
  View(DepthScannerView.self) {
    Prop('active') { view, active in ... }      // props down
    Events('onDepth')                           // events up
  }
        ▲
Native view + sensor
  iOS:  ExpoView -> ARSCNView -> ARKit sceneDepth.depthMap
  And:  ExpoView -> ARScene(Compose) -> ARCore DEPTH16`,
          caption: "Memorize this. When something breaks, you'll know which of the three layers to inspect — and that diagnostic instinct is what an interviewer is listening for.",
        },
        {
          type: "text",
          md: [
            "## Props down, events up — and why it's fast",
            "Two directions, both crossing the same boundary:",
            "- **Props flow down.** JS sets `active={true}` → the module maps it to a native setter (`view.setActive(true)`). Props are how JS *configures* the native view.\n- **Events flow up.** The sensor produces a depth reading → the native view fires an event dispatcher → your `onDepth` JS callback runs. Events are how native *reports back*.",
            "Modern Expo Modules ride **JSI** (the JavaScript Interface), not the legacy React Native bridge. The old bridge serialized every call to JSON and batched it asynchronously — fine for a button tap, a bottleneck for a sensor emitting 30–60 readings a second. JSI lets JS and native share memory and call each other directly, so streaming depth at 60 Hz is comfortable.",
            "> Red flag: describing all RN native comms as \"the bridge\" that serializes JSON. That's the *old* architecture. The senior answer: **\"Expo Modules use JSI, so prop-setting and event dispatch are direct calls, not async JSON serialization — which is what makes 60 Hz sensor streaming viable.\"**",
          ],
        },
        {
          type: "quiz",
          q: "In this architecture, what is a 'prop' and what is an 'event'?",
          choices: [
            "A prop flows down (JS configures the native view via a setter); an event flows up (native reports data to a JS callback)",
            "A prop flows up from native; an event flows down from JS",
            "Both props and events flow only from JS to native",
            "Props and events are the same thing with different names",
          ],
          answer: 0,
          explain: "Props are JS → native configuration, mapped to a native setter. Events are native → JS reporting, delivered to a JS callback. Getting this direction right is the backbone of every native view you'll ever write.",
          nudge: "Which direction is 'set active = true' and which is 'here's a new depth reading'?",
        },
        {
          type: "text",
          md: [
            "## Two ways to author the native view (know both)",
            "When an interviewer asks how you'd build a native view, naming both authoring styles signals depth:",
            "1. **`ExpoView` wrapping a platform view** — your registered view subclasses `ExpoView` (a UIKit `UIView` / Android `View`) and hosts the real native view inside it. Rock-solid, well-documented. ARKit's `ARSCNView` and ARCore's renderer are UIKit/Android-View objects anyway, so wrapping is the *natural* fit for an AR camera surface. **This is what we'll use.**\n2. **`ExpoSwiftUI.View` / Compose-native registration** — newer: the registered view *is* a SwiftUI or Jetpack Compose view directly. This is the modern, expo-ui-style path.",
            "> In an interview, say: **\"For an AR camera surface I wrapped the platform view in an `ExpoView` — it's the sturdiest path and ARKit/ARCore are UIKit/Android views already. I'd reach for the newer `ExpoSwiftUI.View` registration when the view is genuinely a SwiftUI/Compose tree, which is how expo-ui itself is built.\"** Naming the trade-off, not just one option, is the seniority signal.",
          ],
        },
        {
          type: "text",
          md: [
            "## The prerequisites checklist",
            "This is a `type: \"xcode\"` checklist — a real-world step done outside the browser. Confirm your hardware before Module 3, because none of it runs on a simulator.",
          ],
        },
        {
          type: "xcode",
          label: "Over to your devices",
          title: "Confirm you can actually run this",
          intro: [
            "Depth sensing needs real hardware on both platforms. Tick these off before the iOS module:",
          ],
          items: [
            "A LiDAR iPhone/iPad on hand (iPhone 12 Pro or newer Pro, or iPad Pro 2020+).",
            "An ARCore-capable Android phone (most modern phones — no dedicated ToF sensor required; ARCore synthesizes depth from motion).",
            "Xcode installed with a signing team set (a free personal team is fine for on-device dev).",
            "USB debugging on the Android phone; `adb devices` lists it.",
            "Accept that runs use a development build (`npx expo run:ios` / `run:android`), not Expo Go — a local native module requires it.",
          ],
        },
      ],
    },
  ],
});
