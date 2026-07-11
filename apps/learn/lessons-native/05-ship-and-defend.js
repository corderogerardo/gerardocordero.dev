window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "native-ship-defend",
  title: "Wire it up, verify, and defend it",
  emoji: "🚀",
  lang: "ts",
  lessons: [
    {
      id: "ship",
      title: "The screen, the proof, and the pitch",
      steps: [
        {
          type: "text",
          md: [
            "## The React screen never learned about platforms",
            "Both native backends emit the same `{ meters, confidence }` event, so the screen is one file that runs unchanged on iOS and Android. It renders the camera full-bleed, overlays a center crosshair, and shows the live distance. The only JS-side logic worth adding is **throttling** — the native side fires 30–60×/sec, more than a calm UI needs.",
          ],
        },
        {
          type: "exercise",
          lang: "ts",
          title: "Wire the event into state",
          prompt: [
            "Finish the `<DepthScannerView>` in the screen: add an `onDepth` prop that takes the event `e` and calls `setMeters(e.nativeEvent.meters)`. Remember native events arrive under `nativeEvent`.",
          ],
          starter: String.raw`<DepthScannerView
  style={{ flex: 1 }}
  active
  // your code here
/>`,
          solution: String.raw`<DepthScannerView
  style={{ flex: 1 }}
  active
  onDepth={(e) => setMeters(e.nativeEvent.meters)}
/>`,
          checks: [
            { re: /onDepth=\{\(e\)=>/, hint: "Add the callback prop: `onDepth={(e) => …}`." },
            { re: /setMeters\(e\.nativeEvent\.meters\)/, hint: "Read the meters off `e.nativeEvent.meters` — the native payload is always nested under `nativeEvent` — and pass it to `setMeters`." },
          ],
          success: "That's the last wire. props down (active), events up (onDepth) — the round trip is complete, from LiDAR photons to a number in React state.",
        },
        {
          type: "text",
          md: [
            "## Verify it works — a numbered framework, not a vibe",
            "\"Does it work\" for a native module means proving each layer in order. When an interviewer asks how you'd validate a native feature, give the sequence:",
            "1. **Native compiles** — `npx expo run:ios` / `run:android` finishes with no red screen.\n2. **Bridge wired** — a log in `setActive` fires when you toggle `active`. If not: the `Name(\"DepthScanner\")` string, the `requireNativeView` string, and `expo-module.config.json` disagree.\n3. **Events flow** — `onDepth` logs in Metro. If silent: an event-name mismatch across the three files, or you're on a simulator (no depth).\n4. **Physically accurate** — the meters match a tape measure within ~10–20% at 0.3–3 m.\n5. **Cross-platform parity** — the *unchanged* screen works on both devices. This is the headline proof.",
            "> In an interview, say: **\"I verify a native module layer by layer — compile, then the prop path, then the event path, then physical accuracy, then cross-platform parity on the same JS. Each step isolates a different failure, so a break points straight at its cause.\"**",
          ],
        },
        {
          type: "text",
          md: [
            "## Troubleshooting — the four you'll actually hit",
            "1. **\"Cannot find native view DepthScanner\"** → autolinking. Re-run `npx expo prebuild --clean`, rebuild, and check the three name strings line up.\n2. **Black screen, no depth** → missing camera permission string, or you're on a simulator/emulator.\n3. **Android reads huge numbers (1500 m)** → forgot `÷1000`, or didn't mask the low 13 bits.\n4. **Metro stutters** → you're rendering 30–60 events/sec; throttle `onDepth` in JS to ~5/sec.",
            "> Red flag: reaching for native-code changes when the readout is silent. The senior move is to check the *name-string contract* and *permissions* first — the two cheapest, most common causes — before touching Swift or Kotlin.",
          ],
        },
        {
          type: "text",
          md: [
            "## Your five interview lines",
            "You've earned these — say them in your own words:",
            "1. **\"expo-ui is just Expo Modules.\"** Native UI packages register views with `View(...) { Prop, Events }`; I built a domain-specific version of that for a depth sensor instead of a control.\n2. **\"One JS contract, two native backends.\"** ARKit and ARCore differ only in buffer format and units (meters vs millimeters); the event to JS is identical.\n3. **\"Props down, events up, over JSI.\"** Direct calls, not the legacy bridge's async JSON — which is why 60 Hz sensor streaming is viable.\n4. **\"Policy in JS, sensing in native.\"** I ship a confidence value up and let the app decide what to trust; the native layer stays a dumb, reusable sensor.\n5. **\"I know both authoring styles.\"** `ExpoView`-wrapping (what I used for an AR camera surface) vs the newer `ExpoSwiftUI.View`/Compose-native registration that expo-ui itself uses.",
          ],
        },
        {
          type: "text",
          md: [
            "## Stretch goals, if you're ahead",
            "Each of these is a natural follow-up an interviewer might push toward — good to have opinions on even if you don't build them:",
            "- **Colorized depth heatmap** overlay (iOS: a Metal shader over the depthMap; Android: a GL SurfaceView). Big visual payoff, real GPU work.\n- **`AsyncFunction(\"captureSnapshot\")`** on the module — a ref-callable that returns a saved depth frame. Shows you know functions, not just views.\n- **Full mesh / point cloud** via ARKit `sceneReconstruction = .mesh` or ARCore raw depth — the impressive, scope-busting version. Naming it as *out of scope for a two-day build* is itself a seniority signal.",
          ],
        },
        {
          type: "quiz",
          q: "What is the single sentence that captures why this architecture is 'senior'?",
          choices: [
            "The cross-platform design lives in the TypeScript contract; iOS and ARCore are interchangeable adapters behind an identical JS surface",
            "It uses the newest APIs available on each platform",
            "It avoids writing any native code by using a library",
            "It renders faster than a pure-JavaScript implementation",
          ],
          answer: 0,
          explain: "The whole thesis: design the contract first, and the platforms become swappable implementations that cannot drift. That's the same principle behind expo-ui — and being able to state it in one sentence is what turns 'I made LiDAR work' into 'I understand native module architecture.'",
          nudge: "Where does the cross-platform design actually live — in the Swift, the Kotlin, or the TypeScript?",
        },
      ],
    },
  ],
});
