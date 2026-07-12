window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "native-contract",
  title: "Scaffold the module & design the contract",
  emoji: "📐",
  lang: "ts",
  lessons: [
    {
      id: "scaffold",
      title: "Generate a local module",
      steps: [
        {
          type: "text",
          md: [
            "## Scaffold once, fill in the guts",
            "Expo ships a generator that creates a native module with a view and an event example already wired — you replace the guts, not the plumbing. From a fresh Expo app (created with `create-expo-app`, plus `expo install expo-dev-client`), run:",
            "```\nnpx create-expo-module@latest expo-depth-scanner \\\n  --local \\\n  --platform apple android \\\n  --features View ViewEvent\n```",
            "`--local` puts the module *inside your app* at `modules/expo-depth-scanner/` — no separate package to publish yet. You get `ios/` (Swift), `android/` (Kotlin), `src/` (TypeScript), and `expo-module.config.json` (autolinking).",
          ],
        },
        {
          type: "code",
          lang: "ts",
          title: "modules/expo-depth-scanner/ — what the generator makes",
          source: String.raw`modules/expo-depth-scanner/
  expo-module.config.json     // autolinking: which native classes to register
  ios/
    ExpoDepthScannerModule.swift   // the definition() DSL
    ExpoDepthScannerView.swift     // the native view
  android/
    .../ExpoDepthScannerModule.kt
    .../ExpoDepthScannerView.kt
  src/
    ExpoDepthScanner.types.ts      // the TS contract (you design this first)
    DepthScannerView.tsx           // the requireNativeView binding`,
          caption: "The single most common 'why isn't my module found' bug lives in expo-module.config.json — iOS lists the class name only, Android lists the FULLY-QUALIFIED name (expo.modules.depthscanner.…). Read it before you touch anything else.",
        },
        {
          type: "text",
          md: [
            "## Design the JS contract *first*",
            "This is the senior instinct: before writing a line of Swift or Kotlin, design the TypeScript API. It's the **cross-platform contract** — the one thing both native implementations must satisfy. If the contract is right, iOS and Android become two independent adapters that can't drift.",
            "Our event carries two fields: the distance in meters, and a **confidence** value. Shipping `confidence` up to JS is a deliberate choice — it lets the *app* decide whether to trust a reading, keeping the native layer a dumb, reusable sensor.",
            "> In an interview, say: **\"I design the TypeScript contract before the native code — it's the cross-platform seam. Policy lives in JS (I ship a confidence value up and let the app decide what to trust); the native layer stays a dumb sensor. That separation is what makes the module reusable.\"**",
          ],
        },
        {
          type: "code",
          lang: "ts",
          title: "src/ExpoDepthScanner.types.ts — the shape both platforms honor",
          source: String.raw`import type { ViewProps } from 'react-native';

export type DepthEvent = { meters: number; confidence: number };`,
          caption: "DepthEvent is the payload. Next you'll type the view's props — the down-channel (active) and the up-channel (onDepth).",
        },
        {
          type: "exercise",
          lang: "ts",
          title: "Type the view's props",
          prompt: [
            "Below `DepthEvent`, declare the view's prop type. It needs an optional `active` boolean (starts/stops the session), an optional `onDepth` callback receiving `{ nativeEvent: DepthEvent }` and returning `void`, and it must extend React Native's `ViewProps` (so `style` etc. work).",
          ],
          starter: String.raw`export type DepthScannerViewProps = {
  // your code here
} & ViewProps;`,
          solution: String.raw`export type DepthScannerViewProps = {
  active?: boolean;
  onDepth?: (event: { nativeEvent: DepthEvent }) => void;
} & ViewProps;`,
          checks: [
            { re: /type DepthScannerViewProps=\{/, hint: "Declare `export type DepthScannerViewProps = { … } & ViewProps` — an object type intersected with ViewProps." },
            { re: /active\?:boolean/, hint: "Add `active?: boolean` — the optional `?` matters; the view works before JS sets it." },
            { re: /onDepth\?:\(event:\{nativeEvent:DepthEvent\}\)=>void/, hint: "The callback is `onDepth?: (event: { nativeEvent: DepthEvent }) => void` — native events are delivered under `nativeEvent`." },
            { re: /\}&ViewProps/, hint: "Intersect with `& ViewProps` so `style`, `testID`, and the rest come along." },
          ],
          mustNot: [
            { re: /onDepth:\(/, hint: "Make `onDepth` optional with `?` — `onDepth?: (…)` — a scanner shouldn't require a listener to mount." },
          ],
          success: "That's the whole cross-platform contract. iOS and Android now have one target to hit — and they can't disagree about the shape.",
        },
        {
          type: "text",
          md: [
            "## The binding: name the native view",
            "The TS side of the bridge is tiny. `requireNativeView('DepthScanner')` looks up the native view your module registered under the name `'DepthScanner'` and returns a React component. You wrap it so the rest of your app imports a normal-looking component.",
            "The string `'DepthScanner'` is a **contract in two places**: here in `requireNativeView('DepthScanner')` and in the native `Name(\"DepthScanner\")` — a mismatch is the classic \"Cannot find native view\" crash, so check those two names first. Autolinking is a *separate* concern: `expo-module.config.json` must list the **module class** so Expo finds the module at all; get that wrong and the whole module is missing, not just the view.",
          ],
        },
        {
          type: "exercise",
          lang: "ts",
          title: "Write the requireNativeView binding",
          prompt: [
            "In `DepthScannerView.tsx`, get the native component with `requireNativeView('DepthScanner')` into a const `NativeView`, then export a `DepthScannerView` function component that takes `props: DepthScannerViewProps` and returns `<NativeView {...props} />`.",
          ],
          starter: String.raw`import { requireNativeView } from 'expo';
import type { DepthScannerViewProps } from './ExpoDepthScanner.types';

// your code here`,
          solution: String.raw`import { requireNativeView } from 'expo';
import type { DepthScannerViewProps } from './ExpoDepthScanner.types';

const NativeView = requireNativeView('DepthScanner');

export function DepthScannerView(props: DepthScannerViewProps) {
  return <NativeView {...props} />;
}`,
          checks: [
            { re: /const NativeView=requireNativeView\('DepthScanner'\)/, hint: "Grab the native view: `const NativeView = requireNativeView('DepthScanner')` — the string must match the native `Name(...)`." },
            { re: /export function DepthScannerView\(props:DepthScannerViewProps\)/, hint: "Export `function DepthScannerView(props: DepthScannerViewProps)`." },
            { re: /return<NativeView\{\.\.\.props\}\/>/, hint: "Return the native view with all props forwarded: `<NativeView {...props} />`." },
          ],
          success: "The JS half of the bridge is done — a typed component whose name points straight at the native view. Now let's give it something native to point at.",
        },
      ],
    },
  ],
});
