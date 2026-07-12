window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "expoui-value-primitives",
  title: "Stateful primitives: Slider, Switch, Picker",
  emoji: "🎚️",
  lang: "swift",
  lessons: [
    {
      id: "values",
      title: "Value down, change up",
      steps: [
        {
          type: "text",
          md: [
            "## Controlled from JS, always",
            "A `Button` only emits. A `Slider`, `Switch`, or `Picker` also *holds a value* — which raises the question every senior gets asked: **who owns the state?** The answer for a well-behaved native control is the same as for a well-behaved React input: **the JS layer owns it.** The native view is *controlled*.",
            "- **Value flows down** — a `value` prop tells the native control what to display.\n- **Change flows up** — an `onValueChange` event proposes a new value; JS decides whether to accept it and set `value` back down.",
            "> In an interview, say: **\"I build native inputs as controlled components: `value` down, `onValueChange` up, JS owns the source of truth. It keeps the native view stateless and prevents the classic bug where native state and JS state silently diverge.\"**",
            "> Red flag: letting the native control hold its own state and only emitting on change (an *uncontrolled* input). It feels simpler, but the native value and your JS state drift the moment anything else sets the value — and you can't reset or validate from JS. Keep it controlled: `value` down, `onValueChange` up.",
          ],
        },
        {
          type: "code",
          lang: "swift",
          title: "ios/ExpoUISlider.swift — a controlled Slider",
          source: String.raw`final class SliderProps: ExpoSwiftUI.ViewProps {
  @Field var value: Double = 0
  var onValueChange = EventDispatcher()
}

struct SliderView: ExpoSwiftUI.View {
  @ObservedObject var props: SliderProps

  var body: some View {
    Slider(value: Binding(
      get: { props.value },
      set: { props.onValueChange(["value": $0]) }
    ))
  }
}`,
          caption: "The Binding is the trick: get reads the JS-owned value; set doesn't mutate locally — it fires the change up and lets JS set value back down. That's a controlled component in SwiftUI.",
        },
        {
          type: "text",
          md: [
            "## Switch and Picker are the same shape",
            "Every value control is this pattern with a different SwiftUI view:",
            "- **Switch** → `Toggle(isOn: Binding(get:…, set:…))` with a `Bool` value.\n- **Picker** → `Picker(selection: Binding(…))` over an `options: [String]` prop, firing the selected index up.\n- **DateTimePicker** → `DatePicker(selection: Binding(…))` with a date value.",
            "The props class gains an `options` or a differently-typed `value`; the body swaps the SwiftUI view; the down/up contract is unchanged. On Android each maps to its Compose twin (`Slider`, `Switch`, exposed dropdown) with `mutableStateOf` + the same event.",
          ],
        },
        {
          type: "quiz",
          q: "In the controlled Slider, why does the Binding's `set` fire onValueChange instead of storing the value locally?",
          choices: [
            "So JS stays the single source of truth — the native view proposes a change and JS confirms it by setting value back down, preventing state divergence",
            "Because SwiftUI Bindings can't store values",
            "To make the slider run faster",
            "Because EventDispatcher requires it for compilation",
          ],
          answer: 0,
          explain: "A controlled component never trusts its own local state as truth. set() proposes (onValueChange up); JS decides and sets value down. If you stored locally instead, the native slider and the JS state could drift apart — exactly the bug controlled components exist to prevent.",
          nudge: "What goes wrong if the native view and JS both think they own the value?",
        },
        {
          type: "exercise",
          lang: "swift",
          title: "Wire the Slider's up-channel",
          prompt: [
            "Complete the Binding's `set` closure: fire `props.onValueChange` with the new value (`$0`) under the key `\"value\"`. Don't store anything locally — just propose the change upward.",
          ],
          starter: String.raw`Slider(value: Binding(
  get: { props.value },
  set: { /* fire the change up with the new value */ }
))`,
          solution: String.raw`Slider(value: Binding(
  get: { props.value },
  set: { props.onValueChange(["value": $0]) }
))`,
          checks: [
            { re: /get:\{props\.value\}/, hint: "Keep `get: { props.value }` — the displayed value is the JS-owned one." },
            { re: /set:\{props\.onValueChange\(\["value":\$0\]\)\}/, hint: "In `set`, fire it up: `props.onValueChange([\"value\": $0])` — `$0` is the new value the user dragged to." },
          ],
          success: "That's a fully controlled native Slider. JS owns the value; the slider only ever proposes changes. Same Binding shape powers Switch, Picker, and DateTimePicker.",
        },
      ],
    },
  ],
});
