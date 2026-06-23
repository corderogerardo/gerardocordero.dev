// Advanced batch 28 — Keyboard & text input (mid/senior). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED28_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED28_FLASHCARDS: Flashcard[] = [
  {
    id: "kb1",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "UITextField vs UITextView?",
    answerHtml: `<p><code>UITextField</code> is <b>single-line</b> input (with a delegate for editing/return
      events); <code>UITextView</code> is <b>multi-line</b>, scrollable, and can be rich/editable or read-only.
      Pick the field for a name/search box, the view for a notes/comment editor.</p>`,
    level: "mid",
  },
  {
    id: "kb2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What are SwiftUI's text input views?",
    answerHtml: `<p><code>TextField</code> (single-line, bound to a value), <code>SecureField</code> (masked
      input), and <code>TextEditor</code> (multi-line). <code>TextField</code> also has a
      <code>TextField(value:format:)</code> form that parses/formats typed text into a typed value.</p>`,
    level: "mid",
  },
  {
    id: "kb3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How does @FocusState work?",
    answerHtml: `<p>It tracks and controls which field is focused. Bind fields with
      <code>.focused($focus, equals: .email)</code>; set the state to move focus programmatically (e.g. jump to
      the next field on submit) or set it to <code>nil</code> to <b>dismiss the keyboard</b>. It's the
      keyboard-focus analog of UIKit first responder.</p>`,
    level: "senior",
  },
  {
    id: "kb4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How is keyboard avoidance handled?",
    answerHtml: `<p>SwiftUI moves focused content above the keyboard <b>automatically</b> in most cases. In
      UIKit you do it manually: observe <code>keyboardWillShow/Hide</code> notifications, read the keyboard frame,
      and adjust the scroll view's <code>contentInset</code>/constraints so the field isn't covered.</p>`,
    level: "senior",
  },
  {
    id: "kb5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you pick the right keyboard for a field?",
    answerHtml: `<p>Set the <b>keyboard type</b> (<code>.keyboardType(.emailAddress / .numberPad / .URL)</code>),
      turn off autocapitalization/autocorrection where wrong (e.g. usernames), and choose the return key via
      <code>.submitLabel(.go/.search/.done)</code>. The right keyboard reduces typing errors and friction.</p>`,
    level: "mid",
  },
  {
    id: "kb6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What does textContentType enable (AutoFill)?",
    answerHtml: `<p>It tells the system the field's semantic purpose so iOS can <b>AutoFill</b> it:
      <code>.emailAddress</code>, <code>.password</code>, <code>.newPassword</code> (offers a strong password),
      and crucially <code>.oneTimeCode</code> (surfaces SMS OTPs from the QuickType bar). Setting it well is a big
      UX win for sign-in flows.</p>`,
    level: "senior",
  },
  {
    id: "kb7",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you add a toolbar above the keyboard (e.g. a Done button)?",
    answerHtml: `<p>SwiftUI: <code>.toolbar { ToolbarItemGroup(placement: .keyboard) { … } }</code>. UIKit: set
      the field's <code>inputAccessoryView</code> to a custom toolbar. Common use: a "Done"/"Next" button to
      dismiss or advance focus, especially for number pads that lack a return key.</p>`,
    level: "senior",
  },
  {
    id: "kb8",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you handle the return/submit action?",
    answerHtml: `<p>SwiftUI: <code>.onSubmit { … }</code> (paired with <code>submitLabel</code>) fires when the
      user taps return. UIKit: implement <code>textFieldShouldReturn</code> and call
      <code>resignFirstResponder()</code> or move focus to the next field. Use it to advance forms or trigger a
      search.</p>`,
    level: "mid",
  },
  {
    id: "kb9",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you bind a field to a non-string value with validation?",
    answerHtml: `<p>Use <code>TextField("Amount", value: $amount, format: .number)</code> — it parses input into
      the typed value and formats it back, rejecting unparseable text. For richer rules, validate on change/submit
      and surface errors. Avoid hand-parsing strings; let the <code>FormatStyle</code> do the conversion.</p>`,
    level: "senior",
  },
  {
    id: "kb10",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you dismiss the keyboard?",
    answerHtml: `<p>SwiftUI: set the <code>@FocusState</code> to <code>nil</code>, or use
      <code>.scrollDismissesKeyboard(.interactively)</code> for swipe-to-dismiss in scroll views. UIKit:
      <code>resignFirstResponder()</code> on the field (or <code>view.endEditing(true)</code>). A tap-outside
      gesture that clears focus is a common pattern.</p>`,
    level: "mid",
  },
  {
    id: "kb11",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What should password fields do?",
    answerHtml: `<p>Use <code>SecureField</code> (UIKit: <code>isSecureTextEntry</code>) to mask input, set
      <code>textContentType(.password)</code> / <code>.newPassword</code> so AutoFill and the strong-password
      generator work, and pair sign-up with <code>.oneTimeCode</code> on the 2FA field. Don't disable AutoFill —
      it improves both security and UX.</p>`,
    level: "senior",
  },
  {
    id: "kb12",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "What is the first responder / responder chain?",
    answerHtml: `<p>The <b>first responder</b> is the object currently receiving input (e.g. the focused text
      field). <code>becomeFirstResponder()</code>/<code>resignFirstResponder()</code> control it. Unhandled
      events (and editing/undo actions) travel up the <b>responder chain</b> — view → superview → view controller
      → window → app — until something handles them.</p>`,
    level: "senior",
  },
  {
    id: "kb13",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "How do you provide a custom keyboard / input view?",
    answerHtml: `<p>Set a field's <code>inputView</code> to your own view to <b>replace</b> the system keyboard
      (e.g. a custom number pad or picker). A full third-party keyboard for <i>other</i> apps is a separate
      <b>Keyboard Extension</b> (app extension). <code>UITextInput</code> is the protocol custom text views adopt
      to integrate with the system text system.</p>`,
    level: "architect",
  },
  {
    id: "kb14",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "What is marked text (and why care about IME)?",
    answerHtml: `<p>During composition (CJK input, dictation, emoji search) the system shows <b>marked
      (provisional) text</b> that isn't final yet. If you reformat or validate on every change you can corrupt the
      composition — so check for marked text and don't mutate the field mid-composition. It's a classic bug in
      "format as you type" fields.</p>`,
    level: "architect",
  },
  {
    id: "kb15",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What goes wrong with real-time input formatting?",
    answerHtml: `<p>Reformatting text on every keystroke can <b>jump the cursor</b> to the end, fight the user's
      edits, and break composition (marked text). Prefer a <code>format:</code> binding or format on
      commit/blur; if you must format live, preserve the caret position carefully and skip while marked text is
      present.</p>`,
    level: "senior",
  },
  {
    id: "kb16",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What accessibility concerns apply to text entry?",
    answerHtml: `<p>Let fields scale with <b>Dynamic Type</b> (don't clip), give them clear accessibility
      labels (a placeholder is not a label), ensure VoiceOver announces validation errors (move focus to the
      message), and support <b>hardware keyboards</b> (tab between fields, key commands). Accessible forms are
      both a requirement and better for everyone.</p>`,
    level: "senior",
  },
];

export const ADVANCED28_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED28_QUIZ: QuizQuestion[] = [
  {
    id: "kbz1",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "To move focus between fields or dismiss the keyboard in SwiftUI, use:",
    options: ["resignFirstResponder", "@FocusState", "a Timer", "onAppear"],
    answer: 1,
    explanationHtml: `<p><code>@FocusState</code> drives which field is focused; setting it advances focus or, set
      to <code>nil</code>, dismisses the keyboard.</p>`,
  },
  {
    id: "kbz2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "To surface an SMS one-time code in the QuickType bar, set the field's:",
    options: ["keyboardType = .numberPad only", "textContentType = .oneTimeCode", "isSecureTextEntry", "submitLabel = .done"],
    answer: 1,
    explanationHtml: `<p><code>.oneTimeCode</code> tells iOS to offer the received SMS code for AutoFill —
      a big sign-in UX win.</p>`,
  },
  {
    id: "kbz3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Keyboard avoidance in SwiftUI is:",
    options: ["Always manual", "Mostly automatic (manual via notifications in UIKit)", "Impossible", "Done with a Timer"],
    answer: 1,
    explanationHtml: `<p>SwiftUI lifts focused content above the keyboard automatically; UIKit requires
      observing keyboard notifications and adjusting insets.</p>`,
  },
  {
    id: "kbz4",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "Unhandled input/editing actions travel up the:",
    options: ["View controller stack", "Responder chain", "Navigation stack", "Run loop"],
    answer: 1,
    explanationHtml: `<p>Events flow through the responder chain (view → superview → VC → window → app) until
      something handles them; the focused field is the first responder.</p>`,
  },
  {
    id: "kbz5",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "To replace the system keyboard for a field with your own number pad, set:",
    options: ["inputAccessoryView", "the field's inputView", "keyboardType", "becomeFirstResponder"],
    answer: 1,
    explanationHtml: `<p><code>inputView</code> replaces the keyboard; <code>inputAccessoryView</code> only adds a
      bar above it. A keyboard for other apps is a separate Keyboard Extension.</p>`,
  },
  {
    id: "kbz6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Reformatting text on every keystroke risks:",
    options: ["Nothing", "Cursor jumps and breaking IME composition (marked text)", "A memory leak", "A retain cycle"],
    answer: 1,
    explanationHtml: `<p>Live reformatting can move the caret and corrupt CJK/dictation composition; prefer a
      <code>format:</code> binding or format on commit, and respect marked text.</p>`,
  },
];

export const ADVANCED28_STUDY: StudySection[] = [
  {
    id: "st-adv-63",
    num: "78",
    title: "78 · Text input & the keyboard",
    html: `<p><b>What it is.</b> SwiftUI gives <code>TextField</code>/<code>SecureField</code>/
      <code>TextEditor</code> with <b>@FocusState</b> to control focus and dismiss the keyboard, plus
      <code>.onSubmit</code>/<code>submitLabel</code>. Tune the experience with <b>keyboard type</b>,
      capitalization/autocorrect, a <b>keyboard toolbar</b> (<code>.toolbar(placement: .keyboard)</code> or UIKit
      <code>inputAccessoryView</code>), and especially <b>textContentType</b> for AutoFill
      (<code>.password</code>/<code>.newPassword</code>/<code>.oneTimeCode</code>). Keyboard avoidance is
      automatic in SwiftUI; UIKit handles it via keyboard notifications + insets.</p>
    <div class="callout tip"><span class="lbl">Forms that don't fight you</span> Right keyboard type + AutoFill
      content types + @FocusState to advance fields = far less typing and friction.</div>`,
  },
  {
    id: "st-adv-64",
    num: "79",
    title: "79 · First responder, formatting & input edge cases",
    html: `<p><b>What it is.</b> The mechanics and the traps. UIKit's <b>first responder</b> /
      <b>responder chain</b> underpins focus and event routing
      (<code>becomeFirstResponder</code>/<code>resignFirstResponder</code>); custom keyboards come from a field's
      <code>inputView</code>, and custom text views adopt <code>UITextInput</code>. For typed/validated input,
      prefer <code>TextField(value:format:)</code> over hand-parsing. The big edge case: <b>real-time
      formatting</b> can jump the cursor and corrupt <b>marked text</b> (CJK/dictation composition) — format on
      commit or preserve the caret and skip while composing.</p>
    <div class="callout warn"><span class="lbl">Accessibility</span> Fields must scale with Dynamic Type, have
      real labels (not just placeholders), announce errors via VoiceOver focus, and support hardware-keyboard
      tabbing.</div>`,
  },
];
