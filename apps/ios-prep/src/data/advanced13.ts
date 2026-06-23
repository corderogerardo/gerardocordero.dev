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
    answerHtml: `<p>watchOS apps are <b>SwiftUI-first</b> (WatchKit is legacy). An <b>independent</b> watch app
      installs and runs without the iPhone app; a <b>dependent</b> one ships only alongside it. Independent is the
      modern default — the watch app talks to the network and HealthKit on its own.</p>`,
    level: "senior",
  },
  {
    id: "t2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you build watch complications now?",
    answerHtml: `<p>With <b>WidgetKit</b> (ClockKit is deprecated): the same <code>TimelineProvider</code> +
      accessory widget families (<code>.accessoryCircular</code>, <code>.accessoryRectangular</code>,
      <code>.accessoryInline</code>, <code>.accessoryCorner</code>) you use for Lock Screen widgets render on the
      watch face. One WidgetKit codebase covers both.</p>`,
    level: "senior",
  },
  {
    id: "t3",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do the iPhone and Watch apps communicate?",
    answerHtml: `<p>Via <b>Watch Connectivity</b> (<code>WCSession</code>): <code>sendMessage</code> for live
      interactive messaging (both reachable), <code>transferUserInfo</code>/<code>updateApplicationContext</code>
      for queued background sync, and file transfers. Activate a session on both sides and handle the delegate
      callbacks.</p>`,
    level: "senior",
  },
  {
    id: "t4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What watch-specific UX must you handle?",
    answerHtml: `<p>The <b>Digital Crown</b> (<code>.digitalCrownRotation</code> for precise scrolling/values),
      the <b>Always-On display</b> (your UI dims to a low-luminance state — avoid showing seconds-ticking or
      sensitive data), tiny screens (one task per screen), and quick glance-and-go interactions.</p>`,
    level: "senior",
  },
  {
    id: "t5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do workout apps keep running on the watch?",
    answerHtml: `<p>An <b>HKWorkoutSession</b> (HealthKit) grants extended background runtime so you can keep
      reading heart rate/motion and updating during a workout — one of the few ways a watch app runs continuously
      in the background. Pair it with the workout background mode.</p>`,
    level: "architect",
  },
  {
    id: "t6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How does the watch app lifecycle differ from iOS?",
    answerHtml: `<p>Runtime is much more constrained — apps are suspended aggressively, background time is
      scarce (mostly via complications, notifications, workouts, and background refresh). Design for "launch,
      show the one thing, done", and keep state synced so a cold launch is instant.</p>`,
    level: "senior",
  },
  {
    id: "t7",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What are the core visionOS scene types?",
    answerHtml: `<p><b>Windows</b> (flat 2D content, like an iPad window in space), <b>volumes</b> (bounded 3D
      content you can walk around), and <b>immersive spaces</b> (your content fills the surroundings, mixed or
      fully immersive). You compose them with SwiftUI scenes plus RealityKit for 3D.</p>`,
    level: "senior",
  },
  {
    id: "t8",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How does input work on visionOS?",
    answerHtml: `<p>Primarily <b>eyes + hands</b>: the user looks at a control and pinches to "tap" — there's no
      cursor. So make tap targets generous, rely on standard SwiftUI controls (they get this for free), use hover
      effects, and avoid tiny or densely packed interactive elements.</p>`,
    level: "senior",
  },
  {
    id: "t9",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Do existing iOS apps run on visionOS?",
    answerHtml: `<p>Yes — most iPad/iPhone apps run as "Designed for iPad" in a visionOS window with no changes,
      a free baseline. A true spatial experience (volumes, immersive spaces, glass materials, RealityKit) is opt-in
      work on top. Built with SwiftUI + RealityKit.</p>`,
    level: "senior",
  },
  {
    id: "t10",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Mac Catalyst vs native macOS SwiftUI — when each?",
    answerHtml: `<p><b>Catalyst</b> brings an existing UIKit/iPad app to the Mac quickly (UIKit translated to AppKit
      under the hood) — fastest path if you already have an iPad app. <b>Native macOS</b> (SwiftUI multiplatform)
      gives a more Mac-true app and shares a SwiftUI codebase with iOS. Choose Catalyst for reuse speed, native for
      polish.</p>`,
    level: "architect",
  },
  {
    id: "t11",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How does one SwiftUI codebase serve multiple platforms?",
    answerHtml: `<p>SwiftUI is largely cross-platform, so a single <code>View</code> often works on iOS, iPadOS,
      macOS, watchOS, and visionOS. Branch on differences with <code>#if os(macOS)</code> /
      <code>#if os(watchOS)</code> and adapt layout to size classes/idioms. Share the model + business logic; let
      each platform tweak the presentation.</p>`,
    level: "architect",
  },
  {
    id: "t12",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How do you share code across platform targets?",
    answerHtml: `<p>Put shared model, networking, and logic in <b>Swift packages</b> that every app target (iOS,
      watch, Mac, vision) depends on. Keep the packages platform-agnostic (guard platform-specific bits with
      <code>#if</code>/<code>@available</code>), so the watch and phone apps share one tested core.</p>`,
    level: "architect",
  },
  {
    id: "t13",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How do you guard platform- and version-specific APIs?",
    answerHtml: `<p>Compile-time: <code>#if os(iOS)</code> for platform code paths. Runtime:
      <code>if #available(iOS 17, *)</code> to call newer APIs while supporting older OSes, and
      <code>@available</code> to annotate your own declarations. Set a sensible minimum deployment target and gate
      new features behind availability checks.</p>`,
    level: "senior",
  },
  {
    id: "t14",
    category: "appstore",
    categoryLabel: "App Store",
    question: "How does the App Store handle a multi-platform app?",
    answerHtml: `<p>One app record can ship binaries for iPhone, iPad, Mac, Apple Watch, Vision Pro, and Apple
      TV, and <b>universal purchase</b> means a paid app/IAP bought on one Apple platform is available on the
      others. You manage per-platform availability and screenshots in App Store Connect under the same app.</p>`,
    level: "senior",
  },
  {
    id: "t15",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you design one UI for phone, pad, and Mac?",
    answerHtml: `<p>Adapt, don't fork: use <b>size classes</b> (compact vs regular) and layout that reflows
      (<code>NavigationSplitView</code> for sidebars on big screens, stacks on phones), respect the idiom, and let
      SwiftUI's adaptive containers do the work. Test at the extremes (small phone ↔ large Mac window).</p>`,
    level: "senior",
  },
  {
    id: "t16",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What's distinctive about tvOS?",
    answerHtml: `<p>The <b>focus engine</b>: there's no touch — users move focus with the remote, and your UI must
      show a clear focused state and a sensible focus order. SwiftUI handles much of it (focusable, focus effects),
      but you design around "what's focused and where does focus go next".</p>`,
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
      same code as Lock Screen widgets.</p>`,
  },
  {
    id: "tz2",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "iPhone↔Watch communication uses:",
    options: ["URLSession to Apple's servers", "Watch Connectivity (WCSession)", "AirDrop", "iCloud only"],
    answer: 1,
    explanationHtml: `<p><code>WCSession</code> provides live messaging, queued context/userInfo sync, and file
      transfer between the paired apps.</p>`,
  },
  {
    id: "tz3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "A watch app can keep running in the background mainly during:",
    options: ["Any time it wants", "An HKWorkoutSession (workouts)", "Scrolling", "Charging"],
    answer: 1,
    explanationHtml: `<p>Watch runtime is tightly constrained; a workout session is one of the few ways to get
      sustained background execution.</p>`,
  },
  {
    id: "tz4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Primary input on visionOS is:",
    options: ["A mouse cursor", "Eyes + hands (look and pinch)", "A game controller only", "Keyboard"],
    answer: 1,
    explanationHtml: `<p>Users look at a target and pinch — no cursor — so targets should be generous and use
      standard controls/hover effects.</p>`,
  },
  {
    id: "tz5",
    category: "arch",
    categoryLabel: "Architecture",
    question: "To call an iOS 17 API while supporting iOS 16, you use:",
    options: ["#if os(iOS)", "if #available(iOS 17, *)", "a try/catch", "@MainActor"],
    answer: 1,
    explanationHtml: `<p><code>#if os()</code> is compile-time platform branching; runtime version gating uses
      <code>#available</code> / <code>@available</code>.</p>`,
  },
  {
    id: "tz6",
    category: "arch",
    categoryLabel: "Architecture",
    question: "The cleanest way to share logic across iOS/watchOS/macOS targets is:",
    options: ["Copy-paste files", "Shared Swift packages guarded with #if where needed", "One giant target", "Duplicate repos"],
    answer: 1,
    explanationHtml: `<p>Platform-agnostic Swift packages (model + logic) consumed by each app target, with
      <code>#if</code>/<code>@available</code> for the few platform differences.</p>`,
  },
];

export const ADVANCED13_STUDY: StudySection[] = [
  {
    id: "st-adv-33",
    num: "48",
    title: "48 · watchOS: glanceable apps, complications & connectivity",
    html: `<p><b>What it is.</b> SwiftUI-first apps (WatchKit is legacy), built for short, glance-and-go
      interactions. <b>Complications</b> use WidgetKit accessory families on the watch face; <b>Watch
      Connectivity</b> (<code>WCSession</code>) syncs with the phone (live <code>sendMessage</code> or queued
      context/file transfer). Handle the <b>Digital Crown</b> and <b>Always-On</b> dimmed state, and remember the
      watch suspends apps aggressively — sustained background work generally needs an <b>HKWorkoutSession</b>.</p>
    <div class="callout tip"><span class="lbl">Design</span> One task per screen, instant cold launch from synced
      state, and avoid showing rapidly-updating or sensitive content in the Always-On state.</div>`,
  },
  {
    id: "st-adv-34",
    num: "49",
    title: "49 · Multiplatform: one codebase across Apple's platforms",
    html: `<p><b>What it is.</b> SwiftUI runs on iOS, iPadOS, macOS, watchOS, visionOS, and tvOS, so you share a
      <code>View</code> layer and (especially) the model/logic in <b>Swift packages</b>, branching with
      <code>#if os(...)</code> and gating new APIs with <code>#available</code>/<code>@available</code>. For the
      Mac, choose <b>Catalyst</b> (fast reuse of an iPad app) or <b>native macOS SwiftUI</b> (more Mac-true);
      <b>visionOS</b> runs iPad apps for free and adds spatial windows/volumes/immersive spaces with RealityKit;
      <b>tvOS</b> centers on the focus engine.</p>
    <p>The App Store ships one app with per-platform binaries and <b>universal purchase</b>. Adapt UI with size
      classes and reflowing containers (<code>NavigationSplitView</code>) rather than forking screens.</p>
    <div class="callout tip"><span class="lbl">Principle</span> Share the core, adapt the presentation — don't
      maintain parallel apps.</div>`,
  },
];
