window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "expoui-compose-android",
  title: "The Compose-native primitive (Android)",
  emoji: "🤖",
  lang: "kotlin",
  lessons: [
    {
      id: "compose",
      title: "The same Button, in Jetpack Compose",
      steps: [
        {
          type: "text",
          md: [
            "## One contract, a Compose backend",
            "Same lesson as the sensor course's second half: the JS `<Button>` doesn't change; you write a second native adapter. On Android the durable, public way to render Compose from an Expo view is to host a `ComposeView` inside an `ExpoView` and drive it with `setContent { … }`.",
            "The reactivity model differs from iOS in an instructive way. SwiftUI gave you automatic re-render via `@ObservedObject` + `@Field`. In Compose you hold **`mutableStateOf`**, update it from a `Prop` setter, and Compose recomposes when that state changes.",
          ],
        },
        {
          type: "code",
          lang: "kotlin",
          title: "android/.../ButtonView.kt — Compose in an ExpoView",
          source: String.raw`class ButtonView(context: Context, appContext: AppContext) :
  ExpoView(context, appContext) {

  private val onPress by EventDispatcher()
  private val title = mutableStateOf("")

  fun setTitle(value: String) { title.value = value }   // prop -> state -> recompose

  private val composeView = ComposeView(context).also { addView(it) }

  init {
    composeView.setContent {
      Button(onClick = { onPress(mapOf()) }) {
        Text(title.value)                                // reactive read
      }
    }
  }
}`,
          caption: "Excerpt — the Expo, Android, Compose, and state imports are omitted for focus. title is mutableStateOf, so reading title.value inside setContent subscribes the composable: setTitle() updates state and Compose recomposes the Button. onPress is the same EventDispatcher up-channel as iOS.",
        },
        {
          type: "code",
          lang: "kotlin",
          title: "android/.../ExpoUIModule.kt — register it the same way",
          source: String.raw`override fun definition() = ModuleDefinition {
  Name("ExpoUI")

  View(ButtonView::class) {
    Events("onPress")

    Prop("title") { view: ButtonView, value: String ->
      view.setTitle(value)
    }
  }
}`,
          caption: "Identical DSL to the sensor course and to iOS: View(...::class), Events, Prop. The name 'ExpoUI' matches the iOS module and the two-arg requireNativeView('ExpoUI', 'Button').",
        },
        {
          type: "text",
          md: [
            "## @expo/ui's real Android code, for honesty",
            "`@expo/ui` doesn't use the `ComposeView`-in-`ExpoView` path above for its shipped controls — it uses newer **internal** helpers: an `@OptimizedComposeProps` data class implementing `ComposeProps`, a `@Composable` content function, and `ExpoUIView<Props>(\"Name\") { Content { … } }` registration, with children via `Children(UIComposableScope())`. Those types are `@expo/ui`-private and versioned.",
            "> In an interview, say: **\"The public, reusable Android path is hosting Compose in an `ExpoView` via `setContent`. `@expo/ui` ships its own Compose-native registration (`ExpoUIView` + `ComposeProps`) that adds its modifiers system — but that's internal API, so I built on the public primitive.\"** Naming the line between public and private API is a strong senior signal.",
          ],
        },
        {
          type: "text",
          md: [
            "## The cross-platform diff — memorize it",
            "- **The view** — iOS: `struct: ExpoSwiftUI.View`  ·  Android: `ExpoView` hosting `ComposeView.setContent`.\n- **Reactivity** — iOS: `@Field` + `@ObservedObject` (auto re-render)  ·  Android: `mutableStateOf` + a `Prop` setter (manual state, then recompose).\n- **Event up-channel** — **identical**: an `EventDispatcher` fired with a map.\n- **Registration** — iOS: `View(ButtonView.self)`  ·  Android: `View(ButtonView::class)`.\n- **The JS component** — **identical**: one `<Button title onPress>`.",
          ],
        },
        {
          type: "quiz",
          q: "Why does the Android view use mutableStateOf where iOS used @Field + @ObservedObject?",
          choices: [
            "Compose recomposes when observed state changes; mutableStateOf is how you make a prop reactive, mirroring what @ObservedObject does automatically in SwiftUI",
            "mutableStateOf is faster than @Field on all devices",
            "Android can't use the Expo Modules DSL, so state is manual",
            "It's a stylistic choice with no functional difference",
          ],
          answer: 0,
          explain: "Both platforms need a prop change to trigger a re-render. SwiftUI's @ObservedObject + @Field wires that automatically; Compose's equivalent is reading mutableStateOf inside the composable, so updating it from the Prop setter recomposes. Same goal, each framework's idiom.",
          nudge: "What has to happen when 'title' changes so the button updates?",
        },
        {
          type: "exercise",
          lang: "kotlin",
          title: "Write the Compose body",
          prompt: [
            "Fill in `setContent`: a Compose `Button` whose `onClick` fires `onPress(mapOf())`, containing a `Text(title.value)`. Reading `title.value` is what makes it reactive.",
          ],
          starter: String.raw`composeView.setContent {
  // a Compose Button showing title.value that fires onPress on click
}`,
          solution: String.raw`composeView.setContent {
  Button(onClick = { onPress(mapOf()) }) {
    Text(title.value)
  }
}`,
          checks: [
            { re: /Button\(onClick=\{onPress\(mapOf\(\)\)\}\)/, hint: "Wire the click to the up-channel: `Button(onClick = { onPress(mapOf()) }) { … }`." },
            { re: /Text\(title\.value\)/, hint: "Show `Text(title.value)` — reading the mutableStateOf's `.value` subscribes the composable so it recomposes when the prop changes." },
          ],
          success: "Both platforms now render a native button from the same <Button title onPress>. The reactivity idioms differ; the JS contract is byte-identical.",
        },
      ],
    },
  ],
});
