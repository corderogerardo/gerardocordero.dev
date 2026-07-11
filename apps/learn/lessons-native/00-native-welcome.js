window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "native-welcome",
  title: "Why go native",
  emoji: "🛰️",
  lang: "ts",
  lessons: [
    {
      id: "welcome",
      title: "The other side of React Native",
      steps: [
        {
          type: "text",
          md: [
            "## The wall React Native eventually hits",
            "In the iOS and Android courses you built PawWalk's screens. Almost everything a walker sees — the walker list, the booking form, the live map — React Native can draw with JavaScript. But some things live **below** JavaScript: the LiDAR sensor on an iPhone, ARKit and ARCore, Bluetooth, the secure enclave. React Native has no JS API for those. When your product needs one, you don't wait for a library — **you write the native module yourself.**",
            "That single skill — reaching through React Native to a platform capability and handing it back to JS as a clean component — is what separates a mid-level RN developer from a senior one. It's also the thing `expo-ui`, `react-native-maps`, and every camera library are *made of*.",
            "> In an interview, say: **\"React Native is a rendering layer over native UI; when I need a capability JS can't reach — a sensor, an OS SDK — I write an Expo native module that exposes it as a typed component or function. Same machinery the ecosystem's own libraries use.\"**",
          ],
        },
        {
          type: "text",
          md: [
            "## What you'll build in this course",
            "PawWalk wants an off-leash feature: a walker points their phone at the dog and sees **how far away it is, in meters, live**. That's a depth reading from the device's AR sensor.",
            "You'll build `DepthScannerView` — one React component, backed by **two** native implementations (ARKit on iOS, ARCore on Android), streaming a distance number up to JavaScript. The React screen never changes between platforms; only the native adapter underneath does.",
            "- **Modules 1–2** — the mental model, then scaffold the module and design its TypeScript contract.\n- **Module 3** — the iOS side: an ARKit view that reads LiDAR depth.\n- **Module 4** — the Android side: an ARCore view that reads the depth image.\n- **Module 5** — wire the RN screen, verify on a real device, and rehearse how you'd defend every layer in an interview.",
          ],
        },
        {
          type: "code",
          lang: "ts",
          title: "app/depth.tsx — where you're headed",
          source: String.raw`import { useState } from 'react';
import { View, Text } from 'react-native';
import { DepthScannerView } from '../modules/expo-depth-scanner/src/DepthScannerView';

export default function DepthScreen() {
  const [meters, setMeters] = useState<number | null>(null);
  return (
    <View style={{ flex: 1 }}>
      <DepthScannerView
        style={{ flex: 1 }}
        active
        onDepth={(e) => setMeters(e.nativeEvent.meters)}
      />
      <Text>{meters == null ? '—' : meters.toFixed(2) + ' m'}</Text>
    </View>
  );
}`,
          caption: "One component, one event, one number. The whole course is about making this <DepthScannerView> real — twice, natively, behind an identical JS surface.",
        },
        {
          type: "text",
          md: [
            "## The realization that makes this tractable",
            "`expo-ui` — the package that gives you native SwiftUI `Button`, `Slider`, `Picker` in React — looks like magic. It isn't. **It is an ordinary Expo Module.** Every one of its components is registered with the exact same six-line DSL you're about to learn:",
            "```\nView(MyView.self) {\n  Prop(\"value\") { view, value in ... }\n  Events(\"onChange\")\n}\n```",
            "So \"investigate expo-ui and replicate it for LiDAR\" collapses to one sentence: **learn the Expo Modules native-view pattern once, then point it at ARKit/ARCore instead of at a button.** You are not building a framework. You are filling in one native view.",
            "> In an interview, say: **\"expo-ui isn't a special framework — it's a collection of Expo Modules. Each native control is a view registered with `View(...) { Prop, Events }`. I built a domain-specific version of that pattern for a depth sensor.\"**",
          ],
        },
        {
          type: "quiz",
          q: "Why would you write a native module instead of finding an npm package?",
          choices: [
            "Because the capability (a sensor, an OS SDK like ARKit) has no JavaScript API, so it must be reached in native code and exposed to JS",
            "Because native code always runs faster than JavaScript for every task",
            "Because React Native cannot render any native views without a custom module",
            "Because npm packages are not allowed in Expo projects",
          ],
          answer: 0,
          explain: "You reach for a native module when the thing you need lives below JS — LiDAR, ARKit/ARCore, the secure enclave. React Native already renders native views for its built-in components; a module is how you expose a NEW native capability. Often a package exists and you'd use it — but when one doesn't (or you need to understand how one works), writing the module is the senior move.",
          nudge: "Think about what JavaScript literally cannot call on its own.",
        },
        {
          type: "text",
          md: [
            "## The one hard constraint, up front",
            "Depth sensing needs the **camera and the depth hardware** — so it returns *nothing* on a Simulator or Emulator. Every run in this course is on a **physical device**: a LiDAR iPhone (12 Pro or newer Pro / iPad Pro) and an ARCore-capable Android phone.",
            "A physical device also means **no Expo Go** — a local native module forces a development build (`npx expo run:ios` / `run:android`). That's expected and correct here, not a workaround.",
            "> Red flag: saying \"I'll just test it in the simulator first.\" An interviewer hears that you don't know depth APIs need real hardware. The senior answer: **\"Depth and camera APIs are no-ops on simulators, so I develop against a real device with a dev build from day one.\"**",
          ],
        },
        {
          type: "quiz",
          q: "Why does this whole course run on a physical device with a development build instead of Expo Go on a simulator?",
          choices: [
            "Depth/camera hardware doesn't exist on simulators, and a local native module can't run in Expo Go — both force a dev build on a real device",
            "Expo Go is faster but only works on Android",
            "Development builds are required for any TypeScript project",
            "Simulators can run native modules but not JavaScript",
          ],
          answer: 0,
          explain: "Two independent reasons converge: the depth sensor simply isn't present on a simulator, and Expo Go can't load a custom local native module. Both point to the same setup — a development build on real hardware. Knowing this up front is a small but real seniority tell.",
          nudge: "There are two reasons — one about the sensor, one about how local native modules load.",
        },
      ],
    },
  ],
});
