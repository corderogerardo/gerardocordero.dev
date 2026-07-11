window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "expoui-host-children",
  title: "Host & the children model",
  emoji: "🪆",
  lang: "swift",
  lessons: [
    {
      id: "children",
      title: "Composing native children",
      steps: [
        {
          type: "text",
          md: [
            "## The magic word is Children()",
            "How does `<Host><HStack><Button/><Button/></HStack></Host>` turn React children into *native* SwiftUI subviews? One function: **`Children()`**. Inside a SwiftUI-native view's `body`, calling `Children()` renders whatever React children were passed, as native views, right at that spot.",
            "This is the whole composition model. A container view (an `HStack`, a `VStack`, a card) is just a SwiftUI layout whose `body` places `Children()` inside it.",
            "> In an interview, say: **\"`@expo/ui` composes native children through a `Children()` call in the SwiftUI body — React children are mounted as native subviews at that point in the layout. That's what lets you nest native controls declaratively from JS.\"**",
          ],
        },
        {
          type: "code",
          lang: "swift",
          title: "ios/ExpoUIHStack.swift — a container that hosts children",
          source: String.raw`import ExpoModulesCore
import SwiftUI

final class HStackProps: ExpoSwiftUI.ViewProps {
  @Field var spacing: Double = 8
}

struct HStackView: ExpoSwiftUI.View {
  @ObservedObject var props: HStackProps

  var body: some View {
    HStack(spacing: props.spacing) {
      Children()          // React children render here, as native subviews
    }
  }
}`,
          caption: "props.spacing flows down; Children() renders the nested <Button/>, <Slider/>, etc. as real SwiftUI views inside the HStack. Layout is native; the tree came from JS.",
        },
        {
          type: "text",
          md: [
            "## What Host actually does",
            "`Host` is the **root boundary** where the React tree hands off to a native SwiftUI tree. Every `@expo/ui` subtree must be wrapped in one:",
            "- It creates the top-level SwiftUI hosting surface inside a React Native view.\n- It measures and sizes that surface (`matchContents` sizes the native content to fit; otherwise it fills like a normal RN view).\n- Everything *below* `Host` is native and composes via `Children()`; everything *above* is ordinary React Native.",
            "So the boundary is: **`Host` = the JS→native handoff; `Children()` = native views re-entering the tree at each container.** To embed an RN component back *inside* a native tree, `@expo/ui` provides `RNHostView` — the inverse boundary.",
            "> Red flag: wrapping every native control in its own `Host`. `Host` is a per-subtree boundary with a real cost (a hosting controller + a measurement pass); nest with one `Host` at the root and compose the rest with `Children()`. Reach for `RNHostView` only when you must drop an RN view back into a native subtree.",
          ],
        },
        {
          type: "code",
          lang: "ts",
          title: "app usage — Host wraps, containers nest",
          source: String.raw`import { Host, HStack, Button } from '../modules/expo-ui/src';

export function Toolbar() {
  return (
    <Host matchContents>
      <HStack spacing={12}>
        <Button title="Book" onPress={book} />
        <Button title="Cancel" onPress={cancel} />
      </HStack>
    </Host>
  );
}`,
          caption: "One Host at the root; HStack.body calls Children(), so the two Buttons mount as native SwiftUI subviews. No .ios/.android split needed for this platform-specific tree beyond the import.",
        },
        {
          type: "quiz",
          q: "In a SwiftUI-native container view, what does calling Children() in the body do?",
          choices: [
            "Renders the React children passed from JS as native SwiftUI subviews at that position in the layout",
            "Fetches child components over the network",
            "Creates a new React context for descendants",
            "Returns the number of child views for layout math",
          ],
          answer: 0,
          explain: "Children() is the composition primitive: it mounts the JS-provided children as real native subviews inside the container's SwiftUI layout. Without it, a container would render its own chrome but drop everything nested inside it.",
          nudge: "Where do the <Button/>s inside <HStack> actually get placed?",
        },
        {
          type: "exercise",
          lang: "swift",
          title: "Make a container that hosts its children",
          prompt: [
            "Finish `VStackView`'s body: a SwiftUI `VStack(spacing: props.spacing)` that renders the React children inside it. The one call that mounts the children is `Children()`.",
          ],
          starter: String.raw`struct VStackView: ExpoSwiftUI.View {
  @ObservedObject var props: VStackProps

  var body: some View {
    VStack(spacing: props.spacing) {
      // render the React children here
    }
  }
}`,
          solution: String.raw`struct VStackView: ExpoSwiftUI.View {
  @ObservedObject var props: VStackProps

  var body: some View {
    VStack(spacing: props.spacing) {
      Children()
    }
  }
}`,
          checks: [
            { re: /VStack\(spacing:props\.spacing\)\{/, hint: "Lay out with `VStack(spacing: props.spacing) { … }` — the spacing prop flows down." },
            { re: /Children\(\)/, hint: "Mount the nested React views with `Children()` — this is the entire composition trick." },
          ],
          success: "That's a real native container. Nest <Button/>, <Slider/>, another <VStack/> inside it from JS and they all render as native SwiftUI subviews. You've rebuilt @expo/ui's composition core.",
        },
      ],
    },
  ],
});
