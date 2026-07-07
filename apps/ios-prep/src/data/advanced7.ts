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
    answerHtml: `<p>Widgets have no live process — WidgetKit renders SwiftUI from a schedule, so the mental model has
      to be "snapshot," not "app." Your provider hands over a <b>timeline</b>: an array of dated entries with
      pre-computed data, and the system displays whichever entry matches the current time — your code isn't
      running while the widget is on screen. That's why views stay static and cheap, with updates driven by a
      reload policy or a manual <code>WidgetCenter</code> refresh.</p>
    <p>Red flag: assuming you can poll a server or animate live values inside the widget view — none of that code
      runs once an entry is on screen.</p>
    <p><b>A widget shows a snapshot the system picked from a schedule you handed it, not a live view your code
      drives.</b></p>`,
    level: "senior",
  },
  {
    id: "h2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What does a TimelineProvider supply?",
    answerHtml: `<p>The provider is the seam between your data and the system's rendering schedule, so it answers
      three different questions at three different moments: <code>placeholder</code> gives an instant redacted UI
      before real data exists, <code>snapshot</code> gives one representative entry for the widget gallery or
      transient states, and <code>timeline</code> gives the array of future <code>TimelineEntry</code> values plus
      a reload policy. Each entry is the value your widget's view actually renders.</p>
    <div class="code">struct Entry: TimelineEntry { let date: Date; let steps: Int }</div>
    <p>Red flag: treating <code>snapshot</code> as just "the first timeline entry" — it's a separate, transient
      request (e.g. for the widget gallery preview) that shouldn't trigger real side effects.</p>
    <p><b>Placeholder is a shape, snapshot is a preview, timeline is the real schedule.</b></p>`,
    level: "senior",
  },
  {
    id: "h3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How and when do widgets refresh?",
    answerHtml: `<p>Refreshes are the scarcest resource in WidgetKit, so the reload policy is how you spend that
      budget deliberately instead of asking for updates you won't get: <code>.atEnd</code> (ask again after the
      last entry), <code>.after(date)</code>, or <code>.never</code>. You can also push a refresh from the app with
      <code>WidgetCenter.shared.reloadTimelines(ofKind:)</code>.</p>
    <p>Red flag: designing as if refreshes are unlimited and frequent — the system budgets them, so a policy that
      asks for updates too often just gets throttled, not honored.</p>
    <p><b>I pick a reload policy that matches how often the data actually changes, not how often I'd like the UI
      to update.</b></p>`,
    level: "senior",
  },
  {
    id: "h4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What widget families exist?",
    answerHtml: `<p>Which families you support determines how much of the system your widget reaches, so it's a
      product decision, not just a size choice: system sizes
      <code>.systemSmall/.systemMedium/.systemLarge/.systemExtraLarge</code> cover the Home Screen, and
      <b>accessory</b> families <code>.accessoryCircular/.accessoryRectangular/.accessoryInline</code> cover the
      Lock Screen and Apple Watch complications. Declare which you support with <code>supportedFamilies</code> and
      switch your view on <code>@Environment(\\.widgetFamily)</code>.</p>
    <p><b>I design one adaptive view per family, not one widget crammed into every size.</b></p>`,
    level: "senior",
  },
  {
    id: "h5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do interactive widgets (iOS 17) work?",
    answerHtml: `<p>Interactive widgets exist because a static widget used to mean "tap it and launch the app" even
      for a one-tap toggle — bad enough UX that iOS 17 added a real fix: you can put a <code>Button</code> or
      <code>Toggle</code> in a widget whose action is an <b>App Intent</b>, so tapping runs the intent (mark a task
      done, flip a light) without launching the app, then the widget reloads.</p>
    <p>Red flag: implying the widget runs arbitrary code on tap — it doesn't; the App Intent's <code>perform()</code>
      is the only unit of action, executed by the system on the widget's behalf.</p>
    <p><b>The widget stays a snapshot; the App Intent is what actually does the work.</b></p>`,
    level: "senior",
  },
  {
    id: "h6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How does a user configure a widget?",
    answerHtml: `<p>Configuration used to require a separate SiriKit/Intents definition file — exactly the kind of
      split source of truth that rots. <code>AppIntentConfiguration</code> replaced it with one Swift type: a
      configuration intent whose <code>@Parameter</code>s (pick a city, an account) the system turns into the edit
      UI automatically. Your provider receives the chosen intent and builds the timeline from it.</p>
    <p><b>The configuration UI isn't hand-built — it's generated from the same App Intent parameters your
      provider already understands.</b></p>`,
    level: "senior",
  },
  {
    id: "h7",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What are Lock Screen and StandBy widgets?",
    answerHtml: `<p>Lock Screen and StandBy reuse the exact same WidgetKit code path, so the only new work is
      visual, not architectural: the <b>accessory</b> families render on the Lock Screen and as watch complications
      using vibrancy/tinting instead of full color, and <b>StandBy</b> (iPhone charging on its side) shows those
      same widgets at large scale.</p>
    <p><b>One WidgetKit implementation, designed for monochrome/vibrant rendering, covers Lock Screen, StandBy, and
      the watch face.</b></p>`,
    level: "senior",
  },
  {
    id: "h8",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What are Controls / Control Widgets (iOS 18)?",
    answerHtml: `<p>Controls exist to put your app's actions where the user already is — Control Center, the Lock
      Screen, the Action button — without opening the app at all: built with WidgetKit's control APIs and backed
      by <b>App Intents</b>, a control is either a button (runs an intent) or a toggle (reflects and flips state).</p>
    <p><b>Controls turn a single App Intent into a system-wide switch the user can flip from anywhere.</b></p>`,
    level: "senior",
  },
  {
    id: "h9",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is a Live Activity and what framework powers it?",
    answerHtml: `<p>Widgets and Live Activities solve different problems, and mixing them up is the most common
      mistake here: a widget is a periodic snapshot, but a <b>Live Activity</b> is a glanceable, time-sensitive UI
      on the Lock Screen and in the Dynamic Island for something actually happening right now (delivery, ride, game
      score, timer). It's powered by <b>ActivityKit</b> + WidgetKit views, runs for a bounded time, and — unlike a
      widget — is meant to change while it's on screen.</p>
    <p>Red flag: reaching for a widget with an aggressive reload policy to fake "live" data — that's exactly what
      Live Activities exist to replace.</p>
    <p><b>Widgets are for glanceable state that changes occasionally; Live Activities are for state that changes
      while the user is watching.</b></p>`,
    level: "senior",
  },
  {
    id: "h10",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is ActivityAttributes?",
    answerHtml: `<p>A Live Activity needs a data model that separates "set once" from "changes constantly," because
      that split is what lets the system update the UI cheaply: <code>ActivityAttributes</code> holds <b>static</b>
      attributes fixed at start, plus a nested <code>ContentState</code> that holds the <b>dynamic</b> values you
      update over the activity's life. Your Lock Screen and Dynamic Island views always render from the current
      <code>ContentState</code>.</p>
    <div class="code">struct DeliveryAttributes: ActivityAttributes {
  struct ContentState: Codable, Hashable { var etaMinutes: Int }
  let orderNumber: String
}</div>
    <p><b>Static attributes are the activity's identity; ContentState is the only thing that actually
      changes.</b></p>`,
    level: "senior",
  },
  {
    id: "h11",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you start, update, and end a Live Activity?",
    answerHtml: `<p>A Live Activity has an explicit lifecycle because the system needs to know when to stop
      showing it, even if your app never tells it to:</p>
    <p>1. <b>Start</b> — <code>Activity.request(attributes:content:)</code>, only while the app is foreground and
      the user has Live Activities enabled.<br/>
      2. <b>Update</b> — <code>activity.update(...)</code> with a new <code>ContentState</code> whenever the real
      state changes.<br/>
      3. <b>End</b> — <code>activity.end(...)</code> with a dismissal policy once the task is done.</p>
    <p>There are duration limits, and the activity ends automatically after a maximum window even if you never
      call <code>end</code>.</p>
    <p><b>I always plan for the activity ending on its own — end() is a courtesy, not the only exit.</b></p>`,
    level: "senior",
  },
  {
    id: "h12",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What are the Dynamic Island presentations?",
    answerHtml: `<p>The Dynamic Island isn't one layout — it's several, because the same activity has to read at
      every size the system chooses to show it at: <b>compact</b> (leading + trailing around the camera),
      <b>minimal</b> (a single dot when multiple activities collapse), and <b>expanded</b> (leading, trailing,
      center, bottom regions) on long-press, plus the separate Lock Screen/banner view.</p>
    <p><b>I design the expanded view first for content, then strip it down to compact and minimal — not the other
      way around.</b></p>`,
    level: "senior",
  },
  {
    id: "h13",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How are Live Activities updated remotely?",
    answerHtml: `<p>Remote updates exist so a Live Activity can stay current without the app running at all — the
      whole point for something like a delivery or a game score: each activity has a <b>push token</b>, and your
      server sends ActivityKit pushes (APNs, a <code>liveactivity</code> push type) carrying a new
      <code>ContentState</code>. A high-frequency update option exists for fast-moving activities like sports,
      subject to a system budget.</p>
    <p>Red flag: assuming the app has to be running or foregrounded to push an update — the whole design point of
      the push token is that it doesn't.</p>
    <p><b>Push is how a Live Activity keeps up with server-side truth without the app being open.</b></p>`,
    level: "architect",
  },
  {
    id: "h14",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What are the constraints on widget / Live Activity code?",
    answerHtml: `<p>Widgets and Live Activities run in an <b>extension</b>, not your app process, and that boundary
      is the source of every constraint: tight memory and time limits, a <b>subset of SwiftUI</b> (no scrolling, no
      interactive controls beyond Button/Toggle-as-intent, no arbitrary async in the view), and no general
      background code. Do the heavy work in the app and share results via an <b>App Group</b>, keeping the
      extension views simple.</p>
    <p>Red flag: trying to fetch or compute inside the widget/Live Activity view itself — the extension's limits
      will kill or throttle that work; the app should hand it finished data instead.</p>
    <p><b>The extension renders; the app computes — and an App Group is the bridge between them.</b></p>`,
    level: "senior",
  },
  {
    id: "h15",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is the App Intents framework for?",
    answerHtml: `<p>App Intents exist so you define an action once and get it everywhere the system surfaces
      actions, instead of writing bespoke integration code per surface: it exposes your app's actions and content —
      <b>Siri, Shortcuts, Spotlight, the Action button, interactive widgets, and Controls</b> — as strongly-typed
      Swift code, with no separate intent definition files.</p>
    <p><b>I model an action as one App Intent, and it shows up in Siri, Spotlight, Shortcuts, widgets, and Controls
      for free.</b></p>`,
    level: "senior",
  },
  {
    id: "h16",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What does an AppIntent look like?",
    answerHtml: `<p>An <code>AppIntent</code> is a plain Swift type because the whole framework's value is that the
      compiler — not a definition file — enforces the contract: a struct conforming to <code>AppIntent</code> with
      a <code>title</code>, optional <code>@Parameter</code>s, and an async <code>perform()</code> that does the
      work and returns a result.</p>
    <div class="code">struct MarkDone: AppIntent {
  static var title: LocalizedStringResource = "Mark Task Done"
  @Parameter(title: "Task") var task: TaskEntity
  func perform() async throws -&gt; some IntentResult {
    store.complete(task.id); return .result()
  }
}</div>
    <p><b>perform() is the one place the intent's actual work happens — everywhere else is metadata the system
      uses to surface it.</b></p>`,
    level: "senior",
  },
  {
    id: "h17",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What are App Shortcuts?",
    answerHtml: `<p>App Shortcuts exist because requiring users to manually build a Shortcut before Siri works is a
      dead end for most people — you ship the phrases yourself: implement <code>AppShortcutsProvider</code> to
      bind intents to spoken Siri phrases and surface them in Spotlight and the Shortcuts app, with zero user
      configuration required. Users can still build custom shortcuts from your intents on top of that.</p>
    <p><b>App Shortcuts are the intents I want working the day the app installs, no setup screen required.</b></p>`,
    level: "senior",
  },
  {
    id: "h18",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What are AppEntity and EntityQuery?",
    answerHtml: `<p><code>AppEntity</code> and <code>EntityQuery</code> split two different jobs that are easy to
      conflate: <code>AppEntity</code> exposes your model objects (a task, a playlist) so they can be intent
      parameters, while <code>EntityQuery</code> tells the system how to look them up — by id, by search, or as
      suggested defaults. Together they let Siri/Shortcuts ask "mark <i>which</i> task done" with real choices
      pulled from your data.</p>
    <p><b>AppEntity is the shape of the object; EntityQuery is how the system finds one.</b></p>`,
    level: "architect",
  },
  {
    id: "h19",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What ties interactive widgets and Controls to your app's logic?",
    answerHtml: `<p><b>App Intents</b> are the reason building interactive widgets and Controls doesn't mean
      writing separate logic for each: a widget <code>Button</code>/<code>Toggle</code> and a Control Center
      control both invoke an <code>AppIntent</code>'s <code>perform()</code> directly, often without launching the
      app, then the surface reloads.</p>
    <p><b>I write one granular App Intent, and it pays off across Siri, Shortcuts, widgets, and Controls at
      once.</b></p>`,
    level: "senior",
  },
  {
    id: "h20",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do intents reach Siri and Spotlight, and what are donations?",
    answerHtml: `<p>Siri and Spotlight surface your intents automatically once they exist, but the system also
      needs signal about which ones matter to a given user — that's what donations are for: App Shortcuts
      auto-register phrases for Siri and appear in Spotlight, and parameterized intents can be invoked by voice with
      your <code>AppEntity</code> values. <b>Donating</b> intents/interactions hints the system about actions the
      user actually takes, improving Siri Suggestions and Spotlight ranking over time. Focus filters let an intent
      change app behavior per Focus mode.</p>
    <p><b>Donating an intent every time it runs is what teaches Siri Suggestions to predict it later.</b></p>`,
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
    explanationHtml: `<p>WidgetKit renders entries from a timeline; your code isn't running while the widget is on
      screen — refresh happens via a reload policy or <code>WidgetCenter</code>, not a live loop.</p>
    <p>The tempting wrong answer is "a continuously running live view" — that's how a widget <i>feels</i> to the
      user, but assuming your code is actually alive on screen leads you to write polling or animation logic that
      silently never executes.</p>`,
  },
  {
    id: "hz2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Tapping a Button inside an iOS 17 interactive widget runs:",
    options: ["Arbitrary code in the widget", "An App Intent's perform()", "A URL scheme only", "Nothing"],
    answer: 1,
    explanationHtml: `<p>Interactive widget controls are backed by App Intents — the intent's <code>perform()</code>
      runs (often without launching the app) and the widget reloads afterward.</p>
    <p>"Arbitrary code in the widget" is the misconception: the widget extension can't execute general logic on
      tap — the App Intent is the only unit of action, which is exactly why the framework requires one.</p>`,
  },
  {
    id: "hz3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "For UI that must change while visible on the Lock Screen / Dynamic Island, use:",
    options: ["A widget timeline", "A Live Activity (ActivityKit)", "A background task", "A push notification banner"],
    answer: 1,
    explanationHtml: `<p>Live Activities are the live, time-sensitive surface, built for exactly this — Lock Screen
      and Dynamic Island UI that's meant to change while visible.</p>
    <p>"A widget timeline" is the trap: widgets are snapshot-based by design, so reaching for one to show
      continuously changing state just fights the reload budget instead of solving the problem.</p>`,
  },
  {
    id: "hz4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "In ActivityAttributes, the values you update over time live in:",
    options: ["The static attributes", "The nested ContentState", "UserDefaults", "The timeline"],
    answer: 1,
    explanationHtml: `<p>Static attributes are set once at start; the dynamic <code>ContentState</code> is the part
      you actually update, locally or via push.</p>
    <p>"The static attributes" is the misconception — treating them as mutable ignores why
      <code>ActivityAttributes</code> splits identity from state in the first place: static fields are fixed for
      the activity's whole life.</p>`,
  },
  {
    id: "hz5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "App Intents expose your app's actions to:",
    options: ["Only the Shortcuts app", "Siri, Shortcuts, Spotlight, widgets, and Controls", "Only widgets", "The App Store"],
    answer: 1,
    explanationHtml: `<p>One App Intent definition surfaces across Siri, Spotlight, Shortcuts, interactive widgets,
      and Control Center — that reach is the entire point of the framework.</p>
    <p>"Only the Shortcuts app" undersells it and is the pre-App-Intents mental model — the old SiriKit/Intents
      approach really was Shortcuts-only; App Intents replaced it precisely to reach every surface at once.</p>`,
  },
  {
    id: "hz6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "To let an intent accept one of your model objects as a parameter, you implement:",
    options: ["Codable only", "AppEntity + EntityQuery", "A property wrapper", "A TimelineProvider"],
    answer: 1,
    explanationHtml: `<p><code>AppEntity</code> exposes the object as an intent parameter and
      <code>EntityQuery</code> tells the system how to find or suggest instances for it.</p>
    <p>"Codable only" is the misconception — conforming to <code>Codable</code> gets you serialization, not a
      system-searchable, user-pickable parameter; that lookup behavior is exactly what <code>EntityQuery</code>
      adds.</p>`,
  },
];

export const ADVANCED7_STUDY: StudySection[] = [
  {
    id: "st-adv-20",
    num: "35",
    title: "35 · WidgetKit: timelines, families & interactivity",
    html: `<p><b>Why it exists.</b> A widget has no live process, so the whole API is built around handing the
      system a pre-computed schedule instead of a running view: widgets are SwiftUI rendered from a <b>timeline</b>
      of dated entries. A <code>TimelineProvider</code> supplies <code>placeholder</code>, <code>snapshot</code>,
      and <code>timeline</code> (entries + a reload policy: <code>.atEnd</code>, <code>.after</code>,
      <code>.never</code>); refresh budgets mean you batch entries and reload meaningfully (or call
      <code>WidgetCenter.reloadTimelines</code>).</p>
    <p>Support the right <b>families</b> (system sizes + accessory for Lock Screen/StandBy/watch) and switch on
      <code>@Environment(\\.widgetFamily)</code>. iOS 17 adds <b>interactive widgets</b> (Button/Toggle backed by
      App Intents) and <code>AppIntentConfiguration</code> for user settings; iOS 18 adds <b>Controls</b> in
      Control Center and the Action button.</p>
    <div class="callout warn"><span class="lbl">Constraint</span> Widgets run in a memory/time-limited extension
      with a SwiftUI subset. Do heavy work in the app and share via an App Group.</div>
    <p>Say this: "A widget renders whatever entry the system scheduled — my code isn't alive on screen, so I design
      for periodic snapshots, not continuous updates."</p>`,
  },
  {
    id: "st-adv-21",
    num: "36",
    title: "36 · Live Activities & the Dynamic Island",
    html: `<p><b>Why it exists.</b> Widgets are snapshot-based, which isn't enough for something actually happening
      right now — a delivery, a ride, a live score. ActivityKit fills that gap with a <b>live</b>, bounded-duration
      activity on the Lock Screen and in the <b>Dynamic Island</b>. Model it with <code>ActivityAttributes</code>
      (static) + a nested <code>ContentState</code> (dynamic). Start with <code>Activity.request</code>, update
      with <code>update</code>, finish with <code>end</code>.</p>
    <p>Provide every Dynamic Island presentation — <b>compact</b> (leading/trailing), <b>minimal</b> (collapsed
      dot), and <b>expanded</b> (regions) — plus the Lock Screen view. Update locally or via an <b>ActivityKit
      push</b> using the activity's push token (with a high-frequency option for fast events, within a budget).</p>
    <div class="callout tip"><span class="lbl">Design</span> The same activity must read clearly at every size,
      from a sliver beside the camera to the full expanded view.</div>
    <p>Say this: "Widgets are for state that changes occasionally; a Live Activity is for state that changes while
      the user is watching it."</p>`,
  },
  {
    id: "st-adv-22",
    num: "37",
    title: "37 · App Intents, Shortcuts & system integration",
    html: `<p><b>Why it exists.</b> Every system surface that runs your actions — Siri, Shortcuts, Spotlight,
      widgets, Controls — used to need its own integration code. App Intents expose your app's actions and content
      to all of them in pure Swift, no intent-definition files. An <code>AppIntent</code> has a <code>title</code>,
      <code>@Parameter</code>s, and an async <code>perform()</code>. <code>AppEntity</code> + <code>EntityQuery</code>
      expose your model objects as parameters; <code>AppShortcutsProvider</code> ships ready-made Siri phrases (and
      Spotlight entries) with no user setup.</p>
    <p>The payoff is leverage: the <i>same</i> intents drive <b>Siri, Spotlight, the Shortcuts app, interactive
      widgets, and Control Center</b>. Donating interactions improves Siri Suggestions, and Focus filters let an
      intent adapt the app per Focus mode.</p>
    <div class="callout tip"><span class="lbl">Strategy</span> Model actions as small, composable App Intents
      early — they become your integration surface across the whole system.</div>
    <p>Say this: "I model an action once as an App Intent, and it shows up in Siri, Spotlight, Shortcuts, widgets,
      and Controls for free."</p>`,
  },
];
