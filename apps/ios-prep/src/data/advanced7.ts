// Advanced batch 7 — Widgets, Live Activities & App Intents (senior). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED7_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED7_FLASHCARDS: Flashcard[] = [
  {
    id: "h1",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How does a Home Screen widget actually render?",
    answerHtml: `<p>It's <b>not live</b>. WidgetKit asks your provider for a <b>timeline</b> of pre-rendered
      SwiftUI entries with dates, and the system shows the right one over time — your code isn't running while the
      widget is on screen. So you design around periodic snapshots, keep views static + cheap, and refresh via a
      reload policy or <code>WidgetCenter</code>.</p>`,
    level: "senior",
  },
  {
    id: "h2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What does a TimelineProvider supply?",
    answerHtml: `<p>Three things: <code>placeholder</code> (instant redacted UI), <code>snapshot</code> (a single
      entry for the widget gallery / transient states), and <code>timeline</code> (the array of future
      <code>TimelineEntry</code> values + a reload policy). Each entry is a value your widget's view renders.</p>
    <div class="code">struct Entry: TimelineEntry { let date: Date; let steps: Int }</div>`,
    level: "senior",
  },
  {
    id: "h3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How and when do widgets refresh?",
    answerHtml: `<p>Via the timeline's <b>reload policy</b>: <code>.atEnd</code> (ask again after the last entry),
      <code>.after(date)</code>, or <code>.never</code>. You can also push a refresh from the app with
      <code>WidgetCenter.shared.reloadTimelines(ofKind:)</code>. The system <b>budgets</b> refreshes (you don't
      get unlimited frequent updates), so batch entries and refresh meaningfully.</p>`,
    level: "senior",
  },
  {
    id: "h4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What widget families exist?",
    answerHtml: `<p>System sizes <code>.systemSmall/.systemMedium/.systemLarge/.systemExtraLarge</code> (Home
      Screen), and <b>accessory</b> families <code>.accessoryCircular/.accessoryRectangular/.accessoryInline</code>
      for the Lock Screen and Apple Watch complications. Declare which you support with
      <code>supportedFamilies</code> and switch your view on <code>@Environment(\\.widgetFamily)</code>.</p>`,
    level: "senior",
  },
  {
    id: "h5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do interactive widgets (iOS 17) work?",
    answerHtml: `<p>You can put a <code>Button</code> or <code>Toggle</code> in a widget whose action is an
      <b>App Intent</b> — tapping runs the intent (e.g. mark a task done, toggle a light) without launching the
      app, then the widget reloads. The widget itself still can't run arbitrary code; the App Intent is the unit
      of action.</p>`,
    level: "senior",
  },
  {
    id: "h6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How does a user configure a widget?",
    answerHtml: `<p>With an <code>AppIntentConfiguration</code> widget whose configuration intent exposes
      <code>@Parameter</code>s (pick a city, an account, etc.). The system renders the edit UI; your provider
      receives the chosen intent and builds the timeline accordingly. (This replaced the old SiriKit/Intents
      definition file approach.)</p>`,
    level: "senior",
  },
  {
    id: "h7",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What are Lock Screen and StandBy widgets?",
    answerHtml: `<p>The <b>accessory</b> families render on the Lock Screen (and as watch complications), using
      vibrancy/tinting rather than full color. <b>StandBy</b> (iPhone charging on its side) shows widgets at large
      scale. Same WidgetKit code — you just support the accessory families and design for monochrome/vibrant
      rendering.</p>`,
    level: "senior",
  },
  {
    id: "h8",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What are Controls / Control Widgets (iOS 18)?",
    answerHtml: `<p>Custom controls that live in <b>Control Center</b>, the Lock Screen, and the Action button —
      built with WidgetKit's control APIs and backed by <b>App Intents</b>. A control can be a button (run an
      intent) or a toggle (reflect + flip state), letting users trigger your app's actions system-wide without
      opening it.</p>`,
    level: "senior",
  },
  {
    id: "h9",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is a Live Activity and what framework powers it?",
    answerHtml: `<p>A glanceable, <b>live</b>, time-sensitive UI on the Lock Screen and in the Dynamic Island for
      something happening now (delivery, ride, game score, timer). It's powered by <b>ActivityKit</b> + WidgetKit
      views, runs for a bounded time, and updates locally or via push — unlike widgets, it's meant to change while
      visible.</p>`,
    level: "senior",
  },
  {
    id: "h10",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is ActivityAttributes?",
    answerHtml: `<p>The data model for a Live Activity: <b>static</b> attributes set at start (won't change) plus
      a nested <code>ContentState</code> that holds the <b>dynamic</b> values you update over the activity's life.
      Your Lock Screen and Dynamic Island views render from the current <code>ContentState</code>.</p>
    <div class="code">struct DeliveryAttributes: ActivityAttributes {
  struct ContentState: Codable, Hashable { var etaMinutes: Int }
  let orderNumber: String
}</div>`,
    level: "senior",
  },
  {
    id: "h11",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you start, update, and end a Live Activity?",
    answerHtml: `<p><code>Activity.request(attributes:content:)</code> to start (the app must be foreground and
      the user enabled Live Activities), <code>activity.update(...)</code> with a new <code>ContentState</code> to
      change it, and <code>activity.end(...)</code> with a dismissal policy to finish. There are duration limits,
      and the activity ends automatically after a maximum window.</p>`,
    level: "senior",
  },
  {
    id: "h12",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What are the Dynamic Island presentations?",
    answerHtml: `<p>You provide several: <b>compact</b> (leading + trailing around the camera), <b>minimal</b>
      (when multiple activities collapse to a dot), and <b>expanded</b> (regions: leading, trailing, center,
      bottom) shown on long-press. Plus the Lock Screen/banner view. Design each so the same activity reads well
      at every size.</p>`,
    level: "senior",
  },
  {
    id: "h13",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How are Live Activities updated remotely?",
    answerHtml: `<p>Each activity has a <b>push token</b>; your server sends ActivityKit pushes (APNs, a
      <code>liveactivity</code> push type) carrying a new <code>ContentState</code>. There's a high-frequency
      update option for fast-moving activities (sports), subject to a system budget. Push avoids needing the app
      to run to update the activity.</p>`,
    level: "architect",
  },
  {
    id: "h14",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What are the constraints on widget / Live Activity code?",
    answerHtml: `<p>They run in an <b>extension</b> with tight memory and time limits, render a <b>subset of
      SwiftUI</b> (no scrolling, no interactive controls beyond Button/Toggle-as-intent, no arbitrary async in the
      view), and can't run general background code. Do heavy work in the app, share results via an <b>App
      Group</b>, and keep the extension views simple.</p>`,
    level: "senior",
  },
  {
    id: "h15",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is the App Intents framework for?",
    answerHtml: `<p>It exposes your app's actions and content to the system — <b>Siri, Shortcuts, Spotlight, the
      Action button, interactive widgets, and Controls</b> — as strongly-typed Swift code (no separate intent
      definition files). Define what your app can do once, and it's available everywhere the system surfaces
      actions.</p>`,
    level: "senior",
  },
  {
    id: "h16",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What does an AppIntent look like?",
    answerHtml: `<p>A struct conforming to <code>AppIntent</code> with a <code>title</code>, optional
      <code>@Parameter</code>s, and an async <code>perform()</code> that does the work and returns a result.</p>
    <div class="code">struct MarkDone: AppIntent {
  static var title: LocalizedStringResource = "Mark Task Done"
  @Parameter(title: "Task") var task: TaskEntity
  func perform() async throws -&gt; some IntentResult {
    store.complete(task.id); return .result()
  }
}</div>`,
    level: "senior",
  },
  {
    id: "h17",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What are App Shortcuts?",
    answerHtml: `<p>Zero-setup shortcuts you ship with the app: implement <code>AppShortcutsProvider</code> to
      bind intents to spoken Siri phrases and surface them in Spotlight and the Shortcuts app — no user
      configuration required. (Users can still build custom shortcuts from your intents.)</p>`,
    level: "senior",
  },
  {
    id: "h18",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What are AppEntity and EntityQuery?",
    answerHtml: `<p><code>AppEntity</code> exposes your model objects (a task, a playlist) to the system so they
      can be intent parameters; <code>EntityQuery</code> tells the system how to look them up (by id, by search,
      or suggest defaults). Together they let Siri/Shortcuts say "mark <i>which</i> task done" with real choices
      from your data.</p>`,
    level: "architect",
  },
  {
    id: "h19",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What ties interactive widgets and Controls to your app's logic?",
    answerHtml: `<p><b>App Intents.</b> A widget <code>Button</code>/<code>Toggle</code> and a Control Center
      control both invoke an <code>AppIntent</code>'s <code>perform()</code> directly (often without launching the
      app), then the surface reloads. So writing good, granular App Intents pays off across Siri, Shortcuts,
      widgets, and Controls at once.</p>`,
    level: "senior",
  },
  {
    id: "h20",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do intents reach Siri and Spotlight, and what are donations?",
    answerHtml: `<p>App Shortcuts auto-register phrases for Siri and appear in Spotlight; parameterized intents
      can be invoked by voice with your <code>AppEntity</code> values. <b>Donating</b> intents/interactions hints
      the system about actions the user takes, improving Siri Suggestions and Spotlight ranking over time. Focus
      filters let an intent change app behavior per Focus mode.</p>`,
    level: "architect",
  },
];

export const ADVANCED7_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED7_QUIZ: QuizQuestion[] = [
  {
    id: "hz1",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "A Home Screen widget's content is best described as:",
    options: ["A continuously running live view", "A timeline of pre-rendered entries the system shows over time", "A web page", "A background thread"],
    answer: 1,
    explanationHtml: `<p>WidgetKit renders entries from a timeline; your code isn't running while it's on
      screen. Refresh via reload policy or <code>WidgetCenter</code>.</p>`,
  },
  {
    id: "hz2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Tapping a Button inside an iOS 17 interactive widget runs:",
    options: ["Arbitrary code in the widget", "An App Intent's perform()", "A URL scheme only", "Nothing"],
    answer: 1,
    explanationHtml: `<p>Interactive widget controls are backed by App Intents — the intent runs (often without
      launching the app) and the widget reloads.</p>`,
  },
  {
    id: "hz3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "For UI that must change while visible on the Lock Screen / Dynamic Island, use:",
    options: ["A widget timeline", "A Live Activity (ActivityKit)", "A background task", "A push notification banner"],
    answer: 1,
    explanationHtml: `<p>Live Activities are the live, time-sensitive surface; widgets are snapshot-based and
      not meant to update continuously.</p>`,
  },
  {
    id: "hz4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "In ActivityAttributes, the values you update over time live in:",
    options: ["The static attributes", "The nested ContentState", "UserDefaults", "The timeline"],
    answer: 1,
    explanationHtml: `<p>Static attributes are set once at start; the dynamic <code>ContentState</code> is what
      you update (locally or via push).</p>`,
  },
  {
    id: "hz5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "App Intents expose your app's actions to:",
    options: ["Only the Shortcuts app", "Siri, Shortcuts, Spotlight, widgets, and Controls", "Only widgets", "The App Store"],
    answer: 1,
    explanationHtml: `<p>One App Intent definition surfaces across Siri, Spotlight, Shortcuts, interactive
      widgets, and Control Center.</p>`,
  },
  {
    id: "hz6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "To let an intent accept one of your model objects as a parameter, you implement:",
    options: ["Codable only", "AppEntity + EntityQuery", "A property wrapper", "A TimelineProvider"],
    answer: 1,
    explanationHtml: `<p><code>AppEntity</code> exposes the object and <code>EntityQuery</code> tells the system
      how to find/suggest instances for the parameter.</p>`,
  },
];

export const ADVANCED7_STUDY: StudySection[] = [
  {
    id: "st-adv-20",
    num: "35",
    title: "35 · WidgetKit: timelines, families & interactivity",
    html: `<p><b>What it is.</b> Widgets are SwiftUI views rendered from a <b>timeline</b> of dated entries — not
      a live process. A <code>TimelineProvider</code> supplies <code>placeholder</code>, <code>snapshot</code>,
      and <code>timeline</code> (entries + a reload policy: <code>.atEnd</code>, <code>.after</code>,
      <code>.never</code>); refresh budgets mean you batch entries and reload meaningfully (or call
      <code>WidgetCenter.reloadTimelines</code>).</p>
    <p>Support the right <b>families</b> (system sizes + accessory for Lock Screen/StandBy/watch) and switch on
      <code>@Environment(\\.widgetFamily)</code>. iOS 17 adds <b>interactive widgets</b> (Button/Toggle backed by
      App Intents) and <code>AppIntentConfiguration</code> for user settings; iOS 18 adds <b>Controls</b> in
      Control Center and the Action button.</p>
    <div class="callout warn"><span class="lbl">Constraint</span> Widgets run in a memory/time-limited extension
      with a SwiftUI subset. Do heavy work in the app and share via an App Group.</div>`,
  },
  {
    id: "st-adv-21",
    num: "36",
    title: "36 · Live Activities & the Dynamic Island",
    html: `<p><b>What it is.</b> ActivityKit shows a <b>live</b>, bounded-duration activity on the Lock Screen and
      in the <b>Dynamic Island</b> for something happening now. Model it with <code>ActivityAttributes</code>
      (static) + a nested <code>ContentState</code> (dynamic). Start with
      <code>Activity.request</code>, update with <code>update</code>, finish with <code>end</code>.</p>
    <p>Provide every Dynamic Island presentation — <b>compact</b> (leading/trailing), <b>minimal</b> (collapsed
      dot), and <b>expanded</b> (regions) — plus the Lock Screen view. Update locally or via an <b>ActivityKit
      push</b> using the activity's push token (with a high-frequency option for fast events, within a budget).</p>
    <div class="callout tip"><span class="lbl">Design</span> The same activity must read clearly at every size,
      from a sliver beside the camera to the full expanded view.</div>`,
  },
  {
    id: "st-adv-22",
    num: "37",
    title: "37 · App Intents, Shortcuts & system integration",
    html: `<p><b>What it is.</b> App Intents expose your app's actions and content to the system in pure Swift —
      no intent-definition files. An <code>AppIntent</code> has a <code>title</code>, <code>@Parameter</code>s,
      and an async <code>perform()</code>. <code>AppEntity</code> + <code>EntityQuery</code> expose your model
      objects as parameters; <code>AppShortcutsProvider</code> ships ready-made Siri phrases (and Spotlight
      entries) with no user setup.</p>
    <p>The payoff is leverage: the <i>same</i> intents drive <b>Siri, Spotlight, the Shortcuts app, interactive
      widgets, and Control Center</b>. Donating interactions improves Siri Suggestions, and Focus filters let an
      intent adapt the app per Focus mode.</p>
    <div class="callout tip"><span class="lbl">Strategy</span> Model actions as small, composable App Intents
      early — they become your integration surface across the whole system.</div>`,
  },
];
