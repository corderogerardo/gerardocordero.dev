window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "expoui-modifiers-ship",
  title: "Modifiers, ContextMenu, and shipping",
  emoji: "🚀",
  lang: "ts",
  lessons: [
    {
      id: "ship",
      title: "The layer on top, and the pitch",
      steps: [
        {
          type: "text",
          md: [
            "## What @expo/ui adds on top of your primitive",
            "You've built the reusable floor: `ExpoSwiftUI.View` primitives, `Children()` composition, controlled values. `@expo/ui`'s value-add on top is a **modifiers system** — a `modifiers` prop carrying a list of SwiftUI-style modifiers (`padding`, `frame`, `background`, `onTapGesture`) that get applied to the native view.",
            "That's why `@expo/ui`'s props extend `UIBaseViewProps` and the TS binding wraps events with `createViewModifierEventListener` — event-based modifiers like `onTapGesture` and `onAppear` need their callbacks routed through the same EventDispatcher machinery you already know.",
            "> In an interview, say: **\"`@expo/ui` = SwiftUI/Compose-native primitives + a `Children()` composition model + a `modifiers` system layered on the base view props. I built the first two on the public primitive; the modifiers layer is its internal `UIBaseViewProps`/`ModifierRegistry` plumbing.\"**",
          ],
        },
        {
          type: "code",
          lang: "ts",
          title: "the modifiers idea, from the consumer side",
          source: String.raw`import { Host, VStack, Button } from '@expo/ui/swift-ui';
import { padding, frame } from '@expo/ui/swift-ui/modifiers';

<Host matchContents>
  <VStack modifiers={[padding({ all: 16 }), frame({ height: 200 })]}>
    <Button variant="borderedProminent">Book a walk</Button>
  </VStack>
</Host>;`,
          caption: "Each modifier is data in a list; the native side reads modifiers and applies the matching SwiftUI modifier. onTapGesture-style modifiers carry a callback that createViewModifierEventListener wires to a native event.",
        },
        {
          type: "text",
          md: [
            "## ContextMenu is just composition again",
            "A `ContextMenu` looks fancy but it's the `Children()` model you already built. The view attaches SwiftUI's `.contextMenu { }` and renders the menu items — which are React children — inside it. `Host` at the root, `Children()` for the menu content: same two primitives, a different SwiftUI modifier.",
            "That's the payoff of learning the pattern instead of the catalog: once `Host` + `Children()` + a props class click, **every** `@expo/ui` component is a variation you could rebuild.",
          ],
        },
        {
          type: "code",
          lang: "ts",
          title: "src/Slider.tsx — the two-arg binding, one per view",
          source: String.raw`import { requireNativeView } from 'expo';

type SliderProps = { value: number; onValueChange?: (e: { nativeEvent: { value: number } }) => void };

const NativeSlider = requireNativeView('ExpoUI', 'Slider');

export function Slider(props: SliderProps) {
  return <NativeSlider {...props} />;
}`,
          caption: "Every primitive gets its own tiny binding file, all pointing at the same module 'ExpoUI' with a different view name. That naming is why one module can ship a whole library.",
        },
        {
          type: "exercise",
          lang: "ts",
          title: "Bind another view from the same module",
          prompt: [
            "Your module 'ExpoUI' already registers a 'Picker' view. Write its binding: `requireNativeView` with the module name `'ExpoUI'` and the view name `'Picker'`, assigned to `NativePicker`.",
          ],
          starter: String.raw`import { requireNativeView } from 'expo';

const NativePicker = requireNativeView(/* module, view */);`,
          solution: String.raw`import { requireNativeView } from 'expo';

const NativePicker = requireNativeView('ExpoUI', 'Picker');`,
          checks: [
            { re: /const NativePicker=requireNativeView\('ExpoUI','Picker'\)/, hint: "Two args: `requireNativeView('ExpoUI', 'Picker')` — module first, view second. Same module as Button and Slider, different view name." },
          ],
          success: "That's how a whole native-UI library ships from one module: many named views, one requireNativeView(module, view) per binding.",
        },
        {
          type: "text",
          md: [
            "## Packaging: how @expo/ui splits its imports",
            "`@expo/ui` ships three surfaces, and knowing which to reach for is a real design call:",
            "1. **Universal** (`@expo/ui`) — one tree, runs on iOS/Android/web. Start here.\n2. **Platform-specific** (`@expo/ui/swift-ui`, `@expo/ui/jetpack-compose`) — richer, but you split into `.ios.tsx` / `.android.tsx` and maintain two trees. Drop to this only when the universal layer lacks a component or modifier.\n3. **Drop-in replacements** (`@expo/ui/community/*`) — API-compatible swaps for libraries like `@react-native-community/datetimepicker`, for migrations.",
            "> In an interview, say: **\"I start on `@expo/ui`'s universal layer for one cross-platform tree, and only drop to `/swift-ui` or `/jetpack-compose` when I need a platform-specific component — accepting the `.ios`/`.android` split as the cost.\"**",
          ],
        },
        {
          type: "text",
          md: [
            "## Verify, then defend",
            "Verification is the same layered framework as the sensor course: 1) **native compiles** (`expo run:ios`/`run:android`), 2) **the view mounts** (a `Host` with your `Button` renders a real native control), 3) **props flow down** (change `title`, the button updates), 4) **events flow up** (`onPress`/`onValueChange` log in Metro), 5) **composition works** (`Children()` nests controls natively).",
            "And the source-of-truth rule, one more time: for the *exact* current API, read `node_modules/@expo/ui/**/*.d.ts` and the `expo/expo` package source. This course taught the durable pattern; the private helpers (`UIBaseViewProps`, `ExpoUIView`, `ComposeProps`) move with the SDK.",
          ],
        },
        {
          type: "quiz",
          q: "Having rebuilt the pattern, what's the one-sentence explanation of how @expo/ui works?",
          choices: [
            "Each control is an Expo Module view conforming to ExpoSwiftUI.View (or Compose-native) that renders React children via Children(), with a modifiers system layered on top",
            "It compiles React components into SwiftUI at build time",
            "It's a JavaScript reimplementation of native controls styled to look native",
            "It uses the legacy RN bridge to serialize native views as JSON",
          ],
          answer: 0,
          explain: "That's the whole thing: SwiftUI/Compose-native Expo Module views + Children() composition + a modifiers layer, all wrapped by Host at the root. Being able to compress it to one sentence — and know which parts are public primitive vs internal plumbing — is exactly the depth this course was for.",
          nudge: "Name the three pieces: what the view conforms to, how children compose, what's layered on top.",
        },
      ],
    },
  ],
});
