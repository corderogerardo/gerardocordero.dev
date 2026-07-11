window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "expoui-welcome",
  title: "What @expo/ui really is",
  emoji: "🎛️",
  lang: "ts",
  lessons: [
    {
      id: "welcome",
      title: "Build your own native-UI library",
      steps: [
        {
          type: "text",
          md: [
            "## The course that finishes the job",
            "In the LiDAR course you built an Expo native view by **wrapping** a UIKit view (`ExpoView` hosting an `ARSCNView`) and pointing it at a sensor. That taught the foundation `@expo/ui` stands on — but it stopped one floor short of `@expo/ui` itself.",
            "`@expo/ui` does something the sensor course didn't: the view you register **is** a SwiftUI (or Jetpack Compose) view, and it **renders React children as native children**. That's what makes `<Host><Button/><Slider/></Host>` compose real native controls. This course rebuilds that pattern from scratch — a mini `@expo/ui`: a `Host`, a `Button`, a `Slider`, a `Picker`/`Switch`, and a `ContextMenu`, on both platforms.",
            "> In an interview, say: **\"`@expo/ui` renders real SwiftUI and Jetpack Compose from React. Each control is an Expo Module view that conforms to `ExpoSwiftUI.View` (or the Compose equivalent) and renders its React children natively via `Children()`. I rebuilt that pattern to understand it end to end.\"**",
          ],
        },
        {
          type: "text",
          md: [
            "## Why render native UI at all?",
            "You *could* draw a button in JavaScript. So why does `@expo/ui` exist?",
            "- **Platform fidelity for free** — a native `Picker`, `DateTimePicker`, or `ContextMenu` matches the OS exactly, updates with OS versions, and inherits system behaviors you'd otherwise reimplement.\n- **Accessibility and input** — VoiceOver/TalkBack, Dynamic Type, haptics, and gesture semantics come from the real widget, not a JS approximation.\n- **The stuff you literally can't fake** — a native context menu, a SwiftUI `Menu`, a Compose `ModalBottomSheet` behave in ways a `<View>` never will.",
            "> Red flag: \"I'd just build the control in React Native for full control.\" Sometimes right — but a senior names the trade: **\"For anything the OS ships a widget for — pickers, menus, sheets — I reach for the native control so I inherit platform behavior and a11y instead of reimplementing (and drifting from) it.\"**",
          ],
        },
        {
          type: "text",
          md: [
            "## The two layers of @expo/ui (and which one you'll build)",
            "Being precise here is a seniority signal, because `@expo/ui` is *two* things stacked:",
            "1. **The public primitive you can reuse** — an Expo Module view conforming to `ExpoSwiftUI.View` on iOS (a Compose-native view on Android), with `@Field` props, an `EventDispatcher`, and `Children()` to host React children. **This is what you'll build** — the reusable floor.\n2. **`@expo/ui`'s own plumbing on top** — internal helpers like `UIBaseViewProps` / `ExpoUIView` / `ModifierRegistry` (iOS) and `@OptimizedComposeProps` / `ComposeProps` (Android) that add its `modifiers` system and the universal cross-platform layer. These are **versioned and private** — not a stable API to build against.",
            "> The honest rule (and the docs say the same): the installed package's TypeScript types (`node_modules/@expo/ui/**/*.d.ts`) and the `expo/expo` source are the source of truth for the *exact* current API. This course teaches the durable pattern; confirm signatures against your SDK version before you ship.",
          ],
        },
        {
          type: "quiz",
          q: "What's the core difference between the LiDAR course's native view and an @expo/ui control?",
          choices: [
            "The @expo/ui control IS a SwiftUI/Compose view and renders React children natively (Children()); the LiDAR view WRAPPED a UIKit view and had no children",
            "The @expo/ui control uses JavaScript to draw; the LiDAR view used native code",
            "There is no difference — both wrap UIKit views",
            "The @expo/ui control runs on the old RN bridge; the LiDAR view uses JSI",
          ],
          answer: 0,
          explain: "Both are Expo Modules — same foundation. The leap is composition: an @expo/ui view conforms to ExpoSwiftUI.View (it IS SwiftUI) and calls Children() to render its React children as native subviews, which is what makes <Host><Button/></Host> work. The sensor view just wrapped a UIKit camera surface with no children.",
          nudge: "Think about what <Host> composes, and where the children go.",
        },
        {
          type: "text",
          md: [
            "## The prerequisites (same hardware story, lighter)",
            "Unlike depth sensing, native UI doesn't need special hardware — but `@expo/ui` still renders through native views, so you develop on a real device or simulator with a build that includes the module. On SDK 56+, `@expo/ui` itself runs in Expo Go; a *from-scratch* module like the one you're building is local native code, so it needs a dev build (`npx expo run:ios` / `run:android`).",
          ],
        },
        {
          type: "xcode",
          label: "Over to your setup",
          title: "Get ready to build a native-UI module",
          intro: [
            "You'll scaffold a local Expo module and fill it with SwiftUI/Compose views. Confirm:",
          ],
          items: [
            "An Expo app (SDK 56+) with expo-dev-client installed.",
            "Xcode with a signing team (SwiftUI views build to a real/simulated iOS device).",
            "Android SDK + a device or emulator for the Compose side.",
            "You'll run a dev build (`npx expo run:ios` / `run:android`) — a local native-UI module needs it, even though @expo/ui itself runs in Expo Go on SDK 56+.",
            "Optional but recommended: install @expo/ui (`npx expo install @expo/ui`) so you can read its .d.ts and source as the source of truth while you build your own.",
          ],
        },
      ],
    },
  ],
});
