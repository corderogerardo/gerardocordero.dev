window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "expoui-swiftui-primitive",
  title: "The SwiftUI-native primitive",
  emoji: "🍎",
  lang: "swift",
  lessons: [
    {
      id: "button",
      title: "A view that IS SwiftUI",
      steps: [
        {
          type: "text",
          md: [
            "## The shift: conform, don't wrap",
            "In the sensor course your view was `class DepthScannerView: ExpoView` — a UIKit view that *hosted* something. Here your view is a `struct` that conforms to **`ExpoSwiftUI.View`** — it doesn't host SwiftUI, it *is* SwiftUI. That one change unlocks everything `@expo/ui` does.",
            "Three pieces make a primitive:\n1. a **props class** (`@Field`-annotated, an observable object),\n2. a **SwiftUI struct** conforming to `ExpoSwiftUI.View` with `@ObservedObject var props`,\n3. **registration** in the module definition.",
            "> Red flag: reaching for the UIKit-wrapping `ExpoView` style here. That's right for an AR camera surface, but for a *native control* it means re-hosting SwiftUI by hand and losing the reactive `@Field` → body binding. When the view genuinely is SwiftUI, conform to `ExpoSwiftUI.View` instead of wrapping.",
          ],
        },
        {
          type: "code",
          lang: "swift",
          title: "ios/ExpoUIButton.swift — props + the SwiftUI view",
          source: String.raw`import ExpoModulesCore
import SwiftUI

// 1) Props: an observable object. @Field maps a JS prop to a Swift field.
final class ButtonProps: ExpoSwiftUI.ViewProps {
  @Field var title: String = ""
  var onPress = EventDispatcher()
}

// 2) The view IS SwiftUI. @ObservedObject re-renders body when a prop changes.
struct ButtonView: ExpoSwiftUI.View {
  @ObservedObject var props: ButtonProps

  var body: some View {
    SwiftUI.Button(props.title) {
      props.onPress()               // fire the event up to JS
    }
    .buttonStyle(.borderedProminent)
  }
}`,
          caption: "Because props is @ObservedObject and title is @Field, setting title from JS re-runs body automatically — no manual setter like setActive(). That reactivity is the SwiftUI-native payoff.",
        },
        {
          type: "text",
          md: [
            "## @expo/ui's real code, for contrast",
            "`@expo/ui`'s shipped `Button` looks almost identical — but its props extend `UIBaseViewProps` (not `ExpoSwiftUI.ViewProps`) and it registers with `ExpoUIView(...)` (not `View(...)`). Those are `@expo/ui`'s **internal** base classes that bolt on the `modifiers` system. You can't import them into your own module — which is exactly why you build on the public `ExpoSwiftUI.View` primitive instead.",
            "> In an interview, say: **\"@expo/ui's controls conform to `ExpoSwiftUI.View`; it just wraps the public primitive in internal base classes (`UIBaseViewProps`, `ExpoUIView`) to add a modifiers system. Rebuilding on the public primitive is how I proved I understood where the seam is.\"**",
          ],
        },
        {
          type: "exercise",
          lang: "swift",
          title: "Write the SwiftUI-native view",
          prompt: [
            "The `ButtonProps` class is given. Declare the view: a `struct ButtonView` conforming to `ExpoSwiftUI.View`, with `@ObservedObject var props: ButtonProps`, whose `body` is a `SwiftUI.Button(props.title)` that calls `props.onPress()` when tapped.",
          ],
          starter: String.raw`final class ButtonProps: ExpoSwiftUI.ViewProps {
  @Field var title: String = ""
  var onPress = EventDispatcher()
}

// declare the SwiftUI-native ButtonView here`,
          solution: String.raw`final class ButtonProps: ExpoSwiftUI.ViewProps {
  @Field var title: String = ""
  var onPress = EventDispatcher()
}

struct ButtonView: ExpoSwiftUI.View {
  @ObservedObject var props: ButtonProps

  var body: some View {
    SwiftUI.Button(props.title) {
      props.onPress()
    }
  }
}`,
          checks: [
            { re: /struct ButtonView:ExpoSwiftUI\.View\{/, hint: "Conform, don't wrap: `struct ButtonView: ExpoSwiftUI.View { … }` — the view IS SwiftUI." },
            { re: /@ObservedObject var props:ButtonProps/, hint: "Bind the props with `@ObservedObject var props: ButtonProps` so body re-renders when a @Field changes." },
            { re: /SwiftUI\.Button\(props\.title\)\{/, hint: "Build `SwiftUI.Button(props.title) { … }` — read the title straight off props." },
            { re: /props\.onPress\(\)/, hint: "In the action closure, fire the event up: `props.onPress()`." },
          ],
          success: "That's a real native SwiftUI button, reactive to JS props. No manual setters — @ObservedObject + @Field do the wiring. This is the exact shape @expo/ui's Button uses.",
        },
        {
          type: "text",
          md: [
            "## Register it, and bind it in TS",
            "Registration is one line: `View(ButtonView.self)`. And because a UI library ships **many** views from **one** module, the TS binding uses the **two-argument** form: `requireNativeView(moduleName, viewName)`.",
          ],
        },
        {
          type: "code",
          lang: "ts",
          title: "src/Button.tsx — the two-arg binding",
          source: String.raw`import { requireNativeView } from 'expo';

type ButtonProps = { title: string; onPress?: () => void };

// Two args: module name + view name — one module, many views.
const NativeButton = requireNativeView('ExpoUI', 'Button');

export function Button(props: ButtonProps) {
  return <NativeButton {...props} />;
}`,
          caption: "Compare the sensor course's single-arg requireNativeView('DepthScanner') — that module had one view. A UI library registers Button, Slider, Picker in one module, so each view needs a name.",
        },
        {
          type: "exercise",
          lang: "swift",
          title: "Register the view",
          prompt: [
            "Complete `definition()`: after `Name(\"ExpoUI\")`, register the button with `View(ButtonView.self)`.",
          ],
          starter: String.raw`public func definition() -> ModuleDefinition {
  Name("ExpoUI")

  // register ButtonView here
}`,
          solution: String.raw`public func definition() -> ModuleDefinition {
  Name("ExpoUI")

  View(ButtonView.self)
}`,
          checks: [
            { re: /Name\("ExpoUI"\)/, hint: "Keep the module name `Name(\"ExpoUI\")` — it's the first arg of the two-arg requireNativeView on the JS side." },
            { re: /View\(ButtonView\.self\)/, hint: "Register with `View(ButtonView.self)` — a SwiftUI-native view registers the same way a UIKit ExpoView does." },
          ],
          success: "One module can now register View after View — Button, then Slider, then Picker — each looked up by name from JS. That's a UI library taking shape.",
        },
      ],
    },
  ],
});
