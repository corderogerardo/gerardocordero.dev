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
    answerHtml: `<p>The choice is about what shape of input the user is producing, not a stylistic
      preference: <code>UITextField</code> is <b>single-line</b> input with a delegate for editing/return events;
      <code>UITextView</code> is <b>multi-line</b>, scrollable, and can be rich/editable or read-only. <b>I pick
      the field for a name or search box, and the view for a notes or comment editor — the moment content can
      wrap to multiple lines, it's a text view.</b></p>`,
    level: "mid",
  },
  {
    id: "kb2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What are SwiftUI's text input views?",
    answerHtml: `<p>SwiftUI splits text input by role instead of one configurable control:
      <code>TextField</code> (single-line, bound to a value), <code>SecureField</code> (masked input), and
      <code>TextEditor</code> (multi-line). <code>TextField</code> also has a
      <code>TextField(value:format:)</code> form that parses/formats typed text into a typed value, so you're not
      hand-parsing strings. <b>I reach for the typed <code>value:format:</code> initializer whenever the field
      backs a number or date, not a raw string.</b></p>`,
    level: "mid",
  },
  {
    id: "kb3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How does @FocusState work?",
    answerHtml: `<p><code>@FocusState</code> exists because SwiftUI has no notion of "the current first
      responder" to query — focus has to be driven declaratively from state. It tracks and controls which field
      is focused: bind fields with <code>.focused($focus, equals: .email)</code>, set the state to move focus
      programmatically (e.g. jump to the next field on submit), or set it to <code>nil</code> to
      <b>dismiss the keyboard</b>. It's the declarative analog of UIKit's first responder.
      <b>I use @FocusState to chain field-to-field focus on submit so users never have to tap the next field.</b></p>`,
    level: "senior",
  },
  {
    id: "kb4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How is keyboard avoidance handled?",
    answerHtml: `<p>A field hidden behind the keyboard is a hard blocker, not a cosmetic bug, so both
      frameworks solve it — the difference is who owns the work. SwiftUI moves focused content above the keyboard
      <b>automatically</b> in most cases. In UIKit you do it manually: observe
      <code>keyboardWillShow/Hide</code> notifications, read the keyboard frame, and adjust the scroll view's
      <code>contentInset</code>/constraints so the field isn't covered. <b>In UIKit I always drive keyboard
      avoidance off the notifications' frame, never a hardcoded offset, so it survives different keyboard
      heights (QuickType, predictive text, third-party keyboards).</b></p>
      <p>Red flag: hardcoding a fixed inset for "the keyboard height" — it breaks the moment the keyboard's
      accessory bar changes height or the user switches keyboards.</p>`,
    level: "senior",
  },
  {
    id: "kb5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you pick the right keyboard for a field?",
    answerHtml: `<p>The right keyboard is a UX decision that pays off in fewer typing errors and less friction,
      not just a nicety: set the <b>keyboard type</b> (<code>.keyboardType(.emailAddress / .numberPad / .URL)</code>),
      turn off autocapitalization/autocorrection where wrong (e.g. usernames), and choose the return key via
      <code>.submitLabel(.go/.search/.done)</code>. <b>I match the keyboard type and submit label to the field's
      semantic content, every field, no exceptions.</b></p>`,
    level: "mid",
  },
  {
    id: "kb6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What does textContentType enable (AutoFill)?",
    answerHtml: `<p>Sign-up/sign-in abandonment is driven by typing friction, and <code>textContentType</code>
      is how you hand that friction to the system instead of the user: it tells iOS the field's semantic purpose
      so it can <b>AutoFill</b> it — <code>.emailAddress</code>, <code>.password</code>,
      <code>.newPassword</code> (offers a strong password), and crucially <code>.oneTimeCode</code> (surfaces SMS
      OTPs from the QuickType bar). <b>I set textContentType on every auth field — it's one line that removes a
      whole category of typing errors and drop-off.</b></p>
      <p>Red flag: skipping textContentType "because the form works fine without it" — it works, but you're
      leaving a free conversion win on the table.</p>`,
    level: "senior",
  },
  {
    id: "kb7",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you add a toolbar above the keyboard (e.g. a Done button)?",
    answerHtml: `<p>Number pads and URL keyboards have no return key, so without an accessory bar the user has
      no way to confirm or leave the field — that's the problem this solves. SwiftUI:
      <code>.toolbar { ToolbarItemGroup(placement: .keyboard) { … } }</code>. UIKit: set the field's
      <code>inputAccessoryView</code> to a custom toolbar. <b>I add a keyboard toolbar with a "Done"/"Next" button
      any time a field's keyboard type has no return key.</b></p>`,
    level: "senior",
  },
  {
    id: "kb8",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you handle the return/submit action?",
    answerHtml: `<p>Handling submit well is what makes a multi-field form feel like one flow instead of a
      series of taps. SwiftUI: <code>.onSubmit { … }</code> (paired with <code>submitLabel</code>) fires when the
      user taps return. UIKit: implement <code>textFieldShouldReturn</code> and call
      <code>resignFirstResponder()</code> or move focus to the next field. <b>I chain onSubmit/textFieldShouldReturn
      to advance focus field-to-field, and only resign/dismiss on the last field.</b></p>`,
    level: "mid",
  },
  {
    id: "kb9",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you bind a field to a non-string value with validation?",
    answerHtml: `<p>Hand-parsing strings into numbers is where locale bugs and silent data corruption creep in,
      so let the type system own the conversion: use
      <code>TextField("Amount", value: $amount, format: .number)</code> — it parses input into the typed value and
      formats it back, rejecting unparseable text. For richer rules, validate on change/submit and surface errors.
      <b>I never hand-parse a numeric or date string from a TextField — I bind to the typed value with a
      FormatStyle and let it own the conversion.</b></p>`,
    level: "senior",
  },
  {
    id: "kb10",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you dismiss the keyboard?",
    answerHtml: `<p>Leaving the keyboard up after a user is done with a form blocks the content below it, so
      dismissal is a real interaction to design, not an afterthought. SwiftUI: set the <code>@FocusState</code>
      to <code>nil</code>, or use <code>.scrollDismissesKeyboard(.interactively)</code> for swipe-to-dismiss in
      scroll views. UIKit: <code>resignFirstResponder()</code> on the field (or
      <code>view.endEditing(true)</code>). <b>I pair a tap-outside gesture that clears focus with
      interactive scroll dismissal, so the keyboard never traps the user.</b></p>`,
    level: "mid",
  },
  {
    id: "kb11",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What should password fields do?",
    answerHtml: `<p>Password fields are a security surface as much as a UX one, so the framework's own
      AutoFill/strong-password machinery is the safer default over anything hand-rolled: use
      <code>SecureField</code> (UIKit: <code>isSecureTextEntry</code>) to mask input, set
      <code>textContentType(.password)</code> / <code>.newPassword</code> so AutoFill and the strong-password
      generator work, and pair sign-up with <code>.oneTimeCode</code> on the 2FA field.
      <b>I never disable AutoFill on a password field — it drives users toward stronger, unique passwords and
      cuts sign-up abandonment at the same time.</b></p>
      <p>Red flag: disabling paste or AutoFill on password fields "for security" — it pushes users toward weaker,
      reused passwords, which is worse for security, not better.</p>`,
    level: "senior",
  },
  {
    id: "kb12",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "What is the first responder / responder chain?",
    answerHtml: `<p>UIKit needs a single source of truth for "who's receiving input right now," and that's the
      first responder — it's what focus, keyboard routing, and edit/undo commands all key off. The
      <b>first responder</b> is the object currently receiving input (e.g. the focused text field);
      <code>becomeFirstResponder()</code>/<code>resignFirstResponder()</code> control it. Unhandled events (and
      editing/undo actions) travel up the <b>responder chain</b> — view → superview → view controller → window →
      app — until something handles them. <b>I think of the responder chain as UIKit's event fallback path:
      if nothing lower down claims an action, it keeps bubbling up until something does.</b></p>`,
    level: "senior",
  },
  {
    id: "kb13",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "How do you provide a custom keyboard / input view?",
    answerHtml: `<p>These are two different problems that get conflated: replacing your own field's keyboard is
      a per-view concern; providing a keyboard other apps can use is a system-wide extension. Set a field's
      <code>inputView</code> to your own view to <b>replace</b> the system keyboard for that field (e.g. a custom
      number pad or picker). A full third-party keyboard for <i>other</i> apps is a separate
      <b>Keyboard Extension</b> (app extension). <code>UITextInput</code> is the protocol custom text views adopt
      to integrate with the system text system. <b>If it only needs to work inside my own app, it's inputView;
      if it needs to work everywhere, it's a Keyboard Extension.</b></p>`,
    level: "architect",
  },
  {
    id: "kb14",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "What is marked text (and why care about IME)?",
    answerHtml: `<p>IME-based input methods build a character over several keystrokes before it's committed,
      and any code that reacts to "every keystroke" can stomp on that in-progress state. During composition (CJK
      input, dictation, emoji search) the system shows <b>marked (provisional) text</b> that isn't final yet. If
      you reformat or validate on every change you can corrupt the composition — so check for marked text and
      don't mutate the field mid-composition. <b>I treat marked text as read-only: no reformatting, no
      validation, until composition commits.</b></p>
      <p>Red flag: a "format as you type" field that never checks for marked text — it looks fine in English QA
      and silently breaks Japanese/Chinese/Korean input.</p>`,
    level: "architect",
  },
  {
    id: "kb15",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What goes wrong with real-time input formatting?",
    answerHtml: `<p>Live formatting is fighting the user for control of their own cursor, and that's exactly
      what goes wrong: reformatting text on every keystroke can <b>jump the cursor</b> to the end, fight the
      user's edits, and break composition (marked text). Prefer a <code>format:</code> binding or format on
      commit/blur; if you must format live, preserve the caret position carefully and skip while marked text is
      present. <b>My default is format-on-commit, not format-on-keystroke — live formatting is a last resort with
      a caret-preservation and marked-text bug waiting in it.</b></p>`,
    level: "senior",
  },
  {
    id: "kb16",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What accessibility concerns apply to text entry?",
    answerHtml: `<p>Text entry is where accessibility gaps are most punishing — a form a VoiceOver or Dynamic
      Type user can't fill in is a form they can't use at all. Let fields scale with <b>Dynamic Type</b> (don't
      clip), give them clear accessibility labels (a placeholder is not a label), ensure VoiceOver announces
      validation errors (move focus to the message), and support <b>hardware keyboards</b> (tab between fields,
      key commands). <b>I move accessibility focus to the error message the moment validation fails — a red
      border VoiceOver users can't see isn't feedback.</b></p>
      <p>Red flag: relying on a placeholder as the field's only label — VoiceOver has nothing to announce once
      the user starts typing and the placeholder disappears.</p>`,
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
      to <code>nil</code>, dismisses the keyboard. <code>resignFirstResponder</code> is tempting because it's the
      UIKit muscle memory, but SwiftUI has no first responder to call it on — focus is state, not an imperative
      call.</p>`,
  },
  {
    id: "kbz2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "To surface an SMS one-time code in the QuickType bar, set the field's:",
    options: ["keyboardType = .numberPad only", "textContentType = .oneTimeCode", "isSecureTextEntry", "submitLabel = .done"],
    answer: 1,
    explanationHtml: `<p><code>.oneTimeCode</code> tells iOS to offer the received SMS code for AutoFill — a big
      sign-in UX win. <code>keyboardType = .numberPad</code> alone just constrains which keys show; it doesn't
      tell the system this field wants an OTP, so the QuickType suggestion never appears.</p>`,
  },
  {
    id: "kbz3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Keyboard avoidance in SwiftUI is:",
    options: ["Always manual", "Mostly automatic (manual via notifications in UIKit)", "Impossible", "Done with a Timer"],
    answer: 1,
    explanationHtml: `<p>SwiftUI lifts focused content above the keyboard automatically; UIKit requires
      observing keyboard notifications and adjusting insets. "Always manual" is the common misconception carried
      over from UIKit experience — it's not wrong about UIKit, just wrong to assume SwiftUI works the same way.</p>`,
  },
  {
    id: "kbz4",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "Unhandled input/editing actions travel up the:",
    options: ["View controller stack", "Responder chain", "Navigation stack", "Run loop"],
    answer: 1,
    explanationHtml: `<p>Events flow through the responder chain (view → superview → VC → window → app) until
      something handles them; the focused field is the first responder. "View controller stack" sounds close
      because VCs sit on the chain, but the chain is a per-event fallback path, not the navigation hierarchy.</p>`,
  },
  {
    id: "kbz5",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "To replace the system keyboard for a field with your own number pad, set:",
    options: ["inputAccessoryView", "the field's inputView", "keyboardType", "becomeFirstResponder"],
    answer: 1,
    explanationHtml: `<p><code>inputView</code> replaces the keyboard; <code>inputAccessoryView</code> only adds a
      bar above it. A keyboard for other apps is a separate Keyboard Extension. Reaching for
      inputAccessoryView is the natural first guess since it's the more commonly used API, but it never removes
      the system keyboard — it just decorates it.</p>`,
  },
  {
    id: "kbz6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Reformatting text on every keystroke risks:",
    options: ["Nothing", "Cursor jumps and breaking IME composition (marked text)", "A memory leak", "A retain cycle"],
    answer: 1,
    explanationHtml: `<p>Live reformatting can move the caret and corrupt CJK/dictation composition; prefer a
      <code>format:</code> binding or format on commit, and respect marked text. "Nothing" is the trap answer —
      it works fine in every English-only manual test, which is exactly why this bug reaches production
      undetected until an international user hits it.</p>`,
  },
];

export const ADVANCED28_STUDY: StudySection[] = [
  {
    id: "st-adv-63",
    num: "78",
    title: "78 · Text input & the keyboard",
    html: `<p><b>Why it matters.</b> Every field a form makes the user fight — wrong keyboard, no AutoFill, no
      submit chaining — is a drop-off point, so the framework's text-input APIs exist to close those gaps rather
      than leave them to hand-rolled UX. SwiftUI gives <code>TextField</code>/<code>SecureField</code>/
      <code>TextEditor</code> with <b>@FocusState</b> to control focus and dismiss the keyboard, plus
      <code>.onSubmit</code>/<code>submitLabel</code>. Tune the experience with <b>keyboard type</b>,
      capitalization/autocorrect, a <b>keyboard toolbar</b> (<code>.toolbar(placement: .keyboard)</code> or UIKit
      <code>inputAccessoryView</code>), and especially <b>textContentType</b> for AutoFill
      (<code>.password</code>/<code>.newPassword</code>/<code>.oneTimeCode</code>). Keyboard avoidance is
      automatic in SwiftUI; UIKit handles it via keyboard notifications + insets.</p>
    <div class="callout tip"><span class="lbl">Say this</span> "I treat keyboard type, textContentType, and
      @FocusState field-chaining as non-negotiable defaults on every text field — they cost one line each and
      remove a whole category of typing friction."</div>`,
  },
  {
    id: "st-adv-64",
    num: "79",
    title: "79 · First responder, formatting & input edge cases",
    html: `<p><b>Why it matters.</b> The mechanics below are also where text-input bugs hide — they only surface
      for real users (a CJK typist, a VoiceOver user), so they're easy to ship and easy to get caught missing in
      an interview. UIKit's <b>first responder</b> / <b>responder chain</b> underpins focus and event routing
      (<code>becomeFirstResponder</code>/<code>resignFirstResponder</code>); custom keyboards come from a field's
      <code>inputView</code>, and custom text views adopt <code>UITextInput</code>. For typed/validated input,
      prefer <code>TextField(value:format:)</code> over hand-parsing. The big edge case: <b>real-time
      formatting</b> can jump the cursor and corrupt <b>marked text</b> (CJK/dictation composition) — format on
      commit or preserve the caret and skip while composing.</p>
    <div class="callout warn"><span class="lbl">Say this</span> "I default to format-on-commit and check for
      marked text before mutating a field live — real-time formatting that ignores IME composition is a bug
      that only shows up for CJK and dictation users." Fields must also scale with Dynamic Type, have real
      labels (not just placeholders), announce errors via VoiceOver focus, and support hardware-keyboard
      tabbing.</div>`,
  },
];
