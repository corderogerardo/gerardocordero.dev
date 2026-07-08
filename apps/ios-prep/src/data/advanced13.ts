// Advanced batch 13 — watchOS & multiplatform (senior/architect). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED13_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED13_FLASHCARDS: Flashcard[] = [
  {
    id: "t1",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How are watchOS apps built today, and what's an independent app?",
    answerHtml: `<p>An independent watch app removes the iPhone as a single point of failure — it keeps working
      for a user who leaves their phone at home, which matters for fitness and health use cases. watchOS apps are
      <b>SwiftUI-first</b> (WatchKit is legacy). An <b>independent</b> app installs and runs without the iPhone app,
      talking to the network and HealthKit on its own; a <b>dependent</b> one ships only alongside the phone app.</p>
      <p><b>"I default to an independent watch app so the experience survives without the phone nearby — dependent
      is the exception, not the rule."</b></p>`,
    level: "senior",
  },
  {
    id: "t2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you build watch complications now?",
    answerHtml: `<p>Apple unified complications and widgets so you write one codebase instead of maintaining
      ClockKit and WidgetKit in parallel. Complications are built with <b>WidgetKit</b> (ClockKit is deprecated):
      the same <code>TimelineProvider</code> and accessory widget families (<code>.accessoryCircular</code>,
      <code>.accessoryRectangular</code>, <code>.accessoryInline</code>, <code>.accessoryCorner</code>) that power
      Lock Screen widgets render on the watch face.</p>
      <p>Red flag: reaching for ClockKit APIs in a new project — it's deprecated, and any code you write against it
      is a rewrite waiting to happen.</p>
      <p><b>"One WidgetKit codebase drives Lock Screen widgets and watch complications — I don't maintain two
      systems."</b></p>`,
    level: "senior",
  },
  {
    id: "t3",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do the iPhone and Watch apps communicate?",
    answerHtml: `<p>The watch is usually offline or out of Bluetooth range, so sync has to work for both "both
      devices reachable right now" and "deliver this whenever they reconnect" — that's why Watch Connectivity
      exposes two different delivery guarantees instead of one. Via <b>Watch Connectivity</b>
      (<code>WCSession</code>): <code>sendMessage</code> for live interactive messaging when both are reachable, and
      <code>transferUserInfo</code>/<code>updateApplicationContext</code> for queued background sync, plus file
      transfers. Activate a session on both sides and handle the delegate callbacks.</p>
      <p><b>"I pick <code>sendMessage</code> for live round-trips and <code>updateApplicationContext</code> for
      state sync that just needs to arrive eventually."</b></p>`,
    level: "senior",
  },
  {
    id: "t4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What watch-specific UX must you handle?",
    answerHtml: `<p>Every watch UI decision is a constraint problem: tiny screen, glance-and-go attention span, and
      a display that's on all day. Handle the <b>Digital Crown</b> (<code>.digitalCrownRotation</code> for precise
      scrolling/values), the <b>Always-On display</b> (your UI dims to a low-luminance state), tiny screens (one
      task per screen), and quick glance-and-go interactions.</p>
      <p>Red flag: designing the Always-On state like a normal screen — ticking seconds or sensitive data left
      visible all day is both a battery cost and a privacy leak; simplify or hide that content when dimmed.</p>
      <p><b>"I treat Always-On as a distinct display mode, not just a dimmer version of the active screen."</b></p>`,
    level: "senior",
  },
  {
    id: "t5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do workout apps keep running on the watch?",
    answerHtml: `<p>watchOS suspends apps aggressively to save battery, so without an explicit exemption a workout
      screen would stop updating the moment the wrist drops — which is unacceptable mid-run. An
      <b>HKWorkoutSession</b> (HealthKit) grants extended background runtime so you can keep reading heart rate and
      motion and updating the UI during a workout — one of the few ways a watch app runs continuously in the
      background. Pair it with the workout background mode.</p>
      <p><b>"For anything that needs sustained background time on the watch, I reach for
      <code>HKWorkoutSession</code> — general background modes aren't enough."</b></p>`,
    level: "architect",
  },
  {
    id: "t6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How does the watch app lifecycle differ from iOS?",
    answerHtml: `<p>Battery life on the wrist is the constraint that shapes the whole lifecycle: runtime is far more
      constrained than iOS, apps are suspended aggressively, and background time is scarce — mostly via
      complications, notifications, workouts, and background refresh.</p>
      <p>Red flag: assuming your watch app keeps state warm like an iOS app in the background — design for "launch,
      show the one thing, done," and keep state synced so a cold launch is instant.</p>
      <p><b>"I design watch screens assuming a cold launch every time, synced from the phone or HealthKit, not a
      long-lived process."</b></p>`,
    level: "senior",
  },
  {
    id: "t7",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What are the core visionOS scene types?",
    answerHtml: `<p>visionOS gives you three scene types because "how much of the user's surroundings should this
      content own" is a spectrum, not a binary — from a flat panel to full immersion. <b>Windows</b> (flat 2D
      content, like an iPad window in space), <b>volumes</b> (bounded 3D content you can walk around), and
      <b>immersive spaces</b> (your content fills the surroundings, mixed or fully immersive). You compose them with
      SwiftUI scenes plus RealityKit for 3D.</p>
      <p><b>"I pick the least immersive scene type that gets the job done — windows first, volumes for 3D content,
      immersive spaces only when the experience genuinely needs the surroundings."</b></p>`,
    level: "senior",
  },
  {
    id: "t8",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How does input work on visionOS?",
    answerHtml: `<p>There's no cursor to hover-then-click with, so visionOS input design has to assume the user's
      precision is lower than a mouse's — every control has to tolerate an imprecise pinch. Primarily <b>eyes +
      hands</b>: the user looks at a control and pinches to "tap." So make tap targets generous, rely on standard
      SwiftUI controls (they get this for free), use hover effects, and avoid tiny or densely packed interactive
      elements.</p>
      <p>Red flag: porting an iOS UI dense with small tap targets straight to visionOS — gaze-and-pinch is far less
      precise than a finger on glass, and cramped layouts cause mis-taps.</p>
      <p><b>"I lean on standard SwiftUI controls on visionOS because they already get gaze-and-pinch and hover
      effects for free."</b></p>`,
    level: "senior",
  },
  {
    id: "t9",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Do existing iOS apps run on visionOS?",
    answerHtml: `<p>Apple wanted the App Store to feel populated on day one, so most iPad/iPhone apps run as
      "Designed for iPad" in a visionOS window with <b>no changes</b> — a free baseline. A true spatial experience
      (volumes, immersive spaces, glass materials, RealityKit) is opt-in work on top, built with SwiftUI +
      RealityKit.</p>
      <p><b>"Shipping on visionOS costs nothing extra to start — going spatial is a deliberate, additive
      investment, not a requirement."</b></p>`,
    level: "senior",
  },
  {
    id: "t10",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Mac Catalyst vs native macOS SwiftUI — when each?",
    answerHtml: `<p>This is a speed-vs-polish trade-off, not a right-vs-wrong choice: <b>Catalyst</b> brings an
      existing UIKit/iPad app to the Mac quickly (UIKit translated to AppKit under the hood) — the fastest path if
      you already have an iPad app. <b>Native macOS</b> (SwiftUI multiplatform) gives a more Mac-true app and shares
      a SwiftUI codebase with iOS.</p>
      <p><b>"I reach for Catalyst to get an existing iPad app onto the Mac fast, and native SwiftUI when the Mac
      experience itself is the priority."</b></p>`,
    level: "architect",
  },
  {
    id: "t11",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How does one SwiftUI codebase serve multiple platforms?",
    answerHtml: `<p>Maintaining separate UI stacks per platform multiplies bugs and design drift, so the goal is one
      codebase that adapts rather than five that duplicate. SwiftUI is largely cross-platform: a single
      <code>View</code> often works on iOS, iPadOS, macOS, watchOS, and visionOS. Branch on differences with
      <code>#if os(macOS)</code> / <code>#if os(watchOS)</code> and adapt layout to size classes/idioms. Share the
      model and business logic; let each platform tweak the presentation.</p>
      <p><b>"I share the model and logic everywhere and only branch the presentation layer where a platform
      genuinely needs it."</b></p>`,
    level: "architect",
  },
  {
    id: "t12",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How do you share code across platform targets?",
    answerHtml: `<p>Copy-pasting model and networking code across app targets means every bug fix has to be applied
      N times and inevitably drifts. Put shared model, networking, and logic in <b>Swift packages</b> that every app
      target (iOS, watch, Mac, vision) depends on. Keep the packages platform-agnostic (guard platform-specific bits
      with <code>#if</code>/<code>@available</code>), so the watch and phone apps share one tested core.</p>
      <p>Red flag: copy-pasting shared code between targets instead of extracting a package — it looks faster today
      and guarantees the watch and phone silently diverge tomorrow.</p>
      <p><b>"Shared logic lives in a Swift package every target depends on — I never duplicate it between
      targets."</b></p>`,
    level: "architect",
  },
  {
    id: "t13",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How do you guard platform- and version-specific APIs?",
    answerHtml: `<p>Platform and OS-version differences are two separate axes, so Swift gives you two separate
      tools: compile-time <code>#if os(iOS)</code> for platform code paths that don't even exist on other targets,
      and runtime <code>if #available(iOS 17, *)</code> to call newer APIs while still supporting older OSes, with
      <code>@available</code> to annotate your own declarations. Set a sensible minimum deployment target and gate
      new features behind availability checks.</p>
      <p>Red flag: using <code>#if</code> to gate an OS-version check — it only knows the SDK you compiled against,
      not what's running on the device, so it can't protect a call to a newer API from crashing on an older OS.</p>
      <p><b>"Platform differences are compile-time <code>#if</code>; OS-version differences are runtime
      <code>#available</code> — mixing them up is how you ship a crash on an older OS."</b></p>`,
    level: "senior",
  },
  {
    id: "t14",
    category: "appstore",
    categoryLabel: "App Store",
    question: "How does the App Store handle a multi-platform app?",
    answerHtml: `<p>Apple wants a single purchase to follow the user across their devices rather than charging them
      per platform, so one app record can ship binaries for iPhone, iPad, Mac, Apple Watch, Vision Pro, and Apple TV
      under a shared identity. <b>Universal purchase</b> means a paid app or IAP bought on one Apple platform is
      available on the others. You manage per-platform availability and screenshots in App Store Connect under the
      same app.</p>
      <p><b>"With universal purchase, the user pays once and the app follows them to every Apple platform — I don't
      need separate SKUs per device."</b></p>`,
    level: "senior",
  },
  {
    id: "t15",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you design one UI for phone, pad, and Mac?",
    answerHtml: `<p>Forking screens per device class is how a multiplatform app turns into three apps you maintain
      separately — the goal is a layout that reflows instead. Adapt, don't fork: use <b>size classes</b> (compact
      vs regular) and layout that reflows (<code>NavigationSplitView</code> for sidebars on big screens, stacks on
      phones), respect the idiom, and let SwiftUI's adaptive containers do the work. Test at the extremes (small
      phone ↔ large Mac window).</p>
      <p><b>"I build one adaptive layout with size classes and <code>NavigationSplitView</code> rather than a
      separate screen per device."</b></p>`,
    level: "senior",
  },
  {
    id: "t16",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What's distinctive about tvOS?",
    answerHtml: `<p>There's no touch surface on a TV, so every interaction model has to route through a single
      abstraction: the <b>focus engine</b>. Users move focus with the remote, and your UI must show a clear focused
      state and a sensible focus order. SwiftUI handles much of it (focusable, focus effects), but you design around
      "what's focused and where does focus go next."</p>
      <p>Red flag: designing tvOS screens like touch UI with tap targets — there's no touch at all; everything is
      reachable only by moving focus, so an unreachable or ambiguous focus order breaks the screen.</p>
      <p><b>"On tvOS I design the focus order first — the UI has to work purely through 'what's focused next,' not
      taps."</b></p>`,
    level: "mid",
  },
];

export const ADVANCED13_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED13_QUIZ: QuizQuestion[] = [
  {
    id: "tz1",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Watch complications today are built with:",
    options: ["ClockKit", "WidgetKit accessory families", "UIKit", "SpriteKit"],
    answer: 1,
    explanationHtml: `<p>ClockKit is deprecated — complications use WidgetKit's accessory widget families, the
      same code as Lock Screen widgets. Picking ClockKit is a common misconception from older tutorials; it still
      compiles, but it's a dead end for new work.</p>`,
  },
  {
    id: "tz2",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "iPhone↔Watch communication uses:",
    options: ["URLSession to Apple's servers", "Watch Connectivity (WCSession)", "AirDrop", "iCloud only"],
    answer: 1,
    explanationHtml: `<p><code>WCSession</code> provides live messaging, queued context/userInfo sync, and file
      transfer directly between the paired apps. URLSession is tempting because it's the general-purpose
      networking API, but device-to-device sync has nothing to do with a server round-trip — the watch and phone
      talk to each other directly, often with no network at all.</p>`,
  },
  {
    id: "tz3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "A watch app can keep running in the background mainly during:",
    options: ["Any time it wants", "An HKWorkoutSession (workouts)", "Scrolling", "Charging"],
    answer: 1,
    explanationHtml: `<p>Watch runtime is tightly constrained; a workout session is one of the few ways to get
      sustained background execution. "Any time it wants" is the misconception carried over from thinking of
      watchOS like iOS — the watch suspends apps aggressively specifically to protect battery on the wrist.</p>`,
  },
  {
    id: "tz4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Primary input on visionOS is:",
    options: ["A mouse cursor", "Eyes + hands (look and pinch)", "A game controller only", "Keyboard"],
    answer: 1,
    explanationHtml: `<p>Users look at a target and pinch — no cursor — so targets should be generous and use
      standard controls/hover effects. "Mouse cursor" is the wrong mental model because it assumes hover-then-click
      precision that gaze tracking simply doesn't give you; that's exactly why tap targets need to be bigger on
      visionOS.</p>`,
  },
  {
    id: "tz5",
    category: "arch",
    categoryLabel: "Architecture",
    question: "To call an iOS 17 API while supporting iOS 16, you use:",
    options: ["#if os(iOS)", "if #available(iOS 17, *)", "a try/catch", "@MainActor"],
    answer: 1,
    explanationHtml: `<p><code>#if os()</code> is compile-time platform branching; runtime version gating uses
      <code>#available</code>/<code>@available</code>. Picking <code>#if os(iOS)</code> is the common mistake — it
      only knows the SDK you built against, not the OS version actually running on the device, so it can't stop a
      crash on iOS 16.</p>`,
  },
  {
    id: "tz6",
    category: "arch",
    categoryLabel: "Architecture",
    question: "The cleanest way to share logic across iOS/watchOS/macOS targets is:",
    options: ["Copy-paste files", "Shared Swift packages guarded with #if where needed", "One giant target", "Duplicate repos"],
    answer: 1,
    explanationHtml: `<p>Platform-agnostic Swift packages (model + logic) consumed by each app target, with
      <code>#if</code>/<code>@available</code> for the few platform differences. Copy-paste feels faster in the
      moment but guarantees the copies silently drift apart the first time one target gets a bug fix and the others
      don't.</p>`,
  },
];

export const ADVANCED13_STUDY: StudySection[] = [
  {
    id: "st-adv-33",
    num: "48",
    title: "48 · watchOS: glanceable apps, complications & connectivity",
    html: `<p><b>What it is.</b> The watch's battery and screen size force a different design contract than iOS:
      short, glance-and-go interactions instead of long sessions. SwiftUI-first apps (WatchKit is legacy).
      <b>Complications</b> use WidgetKit accessory families on the watch face; <b>Watch Connectivity</b>
      (<code>WCSession</code>) syncs with the phone (live <code>sendMessage</code> or queued context/file transfer).
      Handle the <b>Digital Crown</b> and <b>Always-On</b> dimmed state, and remember the watch suspends apps
      aggressively — sustained background work generally needs an <b>HKWorkoutSession</b>.</p>
    <div class="callout tip"><span class="lbl">Design</span> One task per screen, instant cold launch from synced
      state, and avoid showing rapidly-updating or sensitive content in the Always-On state.</div>
    <p><b>Say this:</b> "I design watch screens for cold launch and one task at a time — the runtime budget doesn't
      allow anything else."</p>`,
  },
  {
    id: "st-adv-34",
    num: "49",
    title: "49 · Multiplatform: one codebase across Apple's platforms",
    html: `<p><b>What it is.</b> Maintaining a separate app per Apple platform multiplies bugs and drift, so the
      goal is one shared core that adapts. SwiftUI runs on iOS, iPadOS, macOS, watchOS, visionOS, and tvOS, so you
      share a <code>View</code> layer and (especially) the model/logic in <b>Swift packages</b>, branching with
      <code>#if os(...)</code> and gating new APIs with <code>#available</code>/<code>@available</code>. For the
      Mac, choose <b>Catalyst</b> (fast reuse of an iPad app) or <b>native macOS SwiftUI</b> (more Mac-true);
      <b>visionOS</b> runs iPad apps for free and adds spatial windows/volumes/immersive spaces with RealityKit;
      <b>tvOS</b> centers on the focus engine.</p>
    <p>The App Store ships one app with per-platform binaries and <b>universal purchase</b>. Adapt UI with size
      classes and reflowing containers (<code>NavigationSplitView</code>) rather than forking screens.</p>
    <div class="callout tip"><span class="lbl">Principle</span> Share the core, adapt the presentation — don't
      maintain parallel apps.</div>
    <p><b>Say this:</b> "I treat each new Apple platform as an adaptation of one shared codebase, not a new app to
      build from scratch."</p>`,
  },
];
