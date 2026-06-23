export type Pitch = {
  id: string;
  num: string;
  title: string;
  metaHtml: string;
  scriptHtml: string;
  tipsHtml: string;
};

export const PITCHES_INTRO_HTML = `<span class="lbl">How to practice</span>
  Don't memorize word-for-word — it sounds robotic. Learn the <b>shape</b> of each answer (the beats), then say
  it in your own words. These are spoken explanations of core iOS topics — exactly what an interviewer means by
  “walk me through X”. Record, watch once, fix one thing, record again.`;

export const PITCHES: Pitch[] = [
  {
    id: "p1",
    num: "Pitch 01",
    title: "Explain value vs reference types",
    metaHtml: `<span class="pill">“What's the difference between a struct and a class?”</span><span class="pill accent">~45 sec</span>`,
    scriptHtml: `<p>In Swift the big distinction is value types versus reference types. Structs and enums are
        value types — when you assign or pass them, you get a copy, so there's no shared mutable state to worry
        about. Classes are reference types: every reference points at the same instance, and they're managed by
        automatic reference counting.</p>
      <p>My default is a struct, especially for models and SwiftUI views, because value semantics make code
        easier to reason about. I reach for a class when I genuinely need shared identity or reference behavior —
        for example an observable model object. And the cost of copying is usually a non-issue because Swift's
        collections use copy-on-write: they only actually copy when you mutate a second reference.</p>`,
    tipsHtml: `<span class="lbl">Delivery tips</span> Land the one-liner first — “values are copied, references
      are shared” — then give the “when I choose each” part. Say <i>enum</i> as “ee-num”, and don't rush
      “copy-on-write”; pause before it so it lands as the senior detail.`,
  },
  {
    id: "p2",
    num: "Pitch 02",
    title: "Walk me through SwiftUI's data flow",
    metaHtml: `<span class="pill">“How does state work in SwiftUI?”</span><span class="pill accent">~60 sec</span>`,
    scriptHtml: `<p>SwiftUI is declarative: a view is a function of state, so I describe what the UI should look
        like for the current state and the framework diffs and updates the screen when that state changes.</p>
      <p>The skill is choosing the right ownership. <code>@State</code> is for state a view owns itself.
        <code>@Binding</code> is a two-way reference to state owned somewhere else, so a child can edit a
        parent's value. For shared model objects I use the Observation framework — an <code>@Observable</code>
        class that I hold with <code>@State</code> and bind into with <code>@Bindable</code>. And
        <code>@Environment</code> is SwiftUI's built-in dependency injection for things passed down the tree.</p>
      <p>The principle underneath all of it is a single source of truth: state lives in one place and flows down
        as bindings, so the UI is always a consistent reflection of that state.</p>`,
    tipsHtml: `<span class="lbl">Delivery tips</span> Structure it as “declarative → who owns the state → one
      source of truth.” If they want depth, mention that <code>@Observable</code> tracks reads per-property, so
      only views that read a changed value re-render. Say “binding,” “observable,” “environment” crisply.`,
  },
  {
    id: "p3",
    num: "Pitch 03",
    title: "Explain Swift concurrency and actors",
    metaHtml: `<span class="pill">“How do you handle concurrency?”</span><span class="pill accent">~90 sec</span>`,
    scriptHtml: `<p>Modern Swift is built on async/await and structured concurrency. An async function can suspend
        without blocking a thread, so I write asynchronous code that reads top-to-bottom instead of nesting
        completion handlers. For parallel work I use <code>async let</code> or a task group — children run
        concurrently and are awaited, and cancelled, together as a unit.</p>
      <p>For shared mutable state I use actors. An actor serializes access to its state, so concurrent callers
        can't race — it replaces manual locks and queues. And <code>@MainActor</code> guarantees code runs on
        the main thread, which is where I keep UI and view models, instead of sprinkling dispatch-to-main
        everywhere.</p>
      <p>What ties it together now is Swift 6, which checks all of this at compile time: types crossing
        concurrency boundaries have to be <code>Sendable</code>, and the compiler enforces actor isolation. So a
        whole class of data races becomes a build error instead of a crash in production.</p>`,
    tipsHtml: `<span class="lbl">Delivery tips</span> Three beats: “async/await + structured concurrency → actors
      for shared state → Swift 6 makes it compile-time safe.” Say <i>actor</i>, <i>Sendable</i> (“SEND-a-bull”),
      and <i>isolation</i> clearly — these are the words that signal senior depth.`,
  },
  {
    id: "p4",
    num: "Pitch 04",
    title: "How do you think about app architecture?",
    metaHtml: `<span class="pill">“How would you architect a large iOS app?”</span><span class="pill accent">~90 sec</span>`,
    scriptHtml: `<p>I start from the team and the product, not a favorite pattern. For most apps I use MVVM with
        the Observation framework — thin views, an observable view model with the logic, and dependencies
        injected behind protocols so everything is testable. When an app gets large and logic-heavy, I'll move
        toward a unidirectional architecture like TCA, where state lives in one place and changes flow through
        actions, which makes behavior exhaustively testable.</p>
      <p>The decision I care most about at scale is modularization. I split the app into local Swift packages —
        feature modules that depend on shared Core, DesignSystem, and Networking packages, never on each other.
        That enforces boundaries, parallelizes builds, and lets features be tested and previewed in isolation.</p>
      <p>And I treat production readiness as part of architecture: a router so navigation is just data,
        observability and crash reporting, and feature flags with phased rollout so I can ship safely and turn
        something off without a new build.</p>`,
    tipsHtml: `<span class="lbl">Delivery tips</span> Lead with “it depends on the team and product” — that's the
      senior tell. Then give the modularization answer as your strongest point. Pronounce <i>TCA</i> as the
      letters, and don't over-claim — frame patterns as trade-offs.`,
  },
  {
    id: "p5",
    num: "Pitch 05",
    title: "How do you approach performance?",
    metaHtml: `<span class="pill">“An screen is janky — what do you do?”</span><span class="pill accent">~60 sec</span>`,
    scriptHtml: `<p>Rule one: measure before I optimize, because the bottleneck is usually not where I'd guess. I
        reach for Instruments — Time Profiler for CPU, Allocations and Leaks for memory, the SwiftUI instrument
        for view-body counts, and Hangs for main-thread stalls.</p>
      <p>In SwiftUI most wins come from doing less: keep the view body cheap and pure, give views stable
        identity so they're reused, use lazy stacks and List for long content, and let the Observation framework
        re-render only the views that read a changed property. For an image feed specifically, I downsample off
        the main thread and cache decoded thumbnails — decoding full-resolution images in a small cell is the
        classic cause of dropped frames and memory spikes.</p>`,
    tipsHtml: `<span class="lbl">Delivery tips</span> Open with “measure first, with Instruments” — it instantly
      sounds senior. Then give one concrete example (the image feed). Say <i>Instruments</i> as the tool, not
      “instruments” the generic word — emphasize it.`,
  },
  {
    id: "p6",
    num: "Pitch 06",
    title: "Walk me through your release process",
    metaHtml: `<span class="pill">“How do you ship to the App Store?”</span><span class="pill accent">~75 sec</span>`,
    scriptHtml: `<p>I want shipping to be boring and repeatable. On every pull request, CI builds the app and
        runs unit and UI tests plus lint. When something merges to main, CI archives, signs, and uploads a
        TestFlight build automatically, auto-incrementing the build number.</p>
      <p>For a release I promote a TestFlight build to the App Store and use a phased rollout, so the update
        reaches a growing percentage of users over about a week — if crash rates spike, I can pause it. I use
        either Xcode Cloud for tight App Store Connect integration, or Fastlane lanes on a CI like GitHub
        Actions when I want more control, and I manage code signing reproducibly so it's not a person's laptop.</p>
      <p>The safety net is crash monitoring plus a feature-flag kill switch, so a bad release can be turned off
        without waiting for a new build to clear review.</p>`,
    tipsHtml: `<span class="lbl">Delivery tips</span> Beats: “PR runs tests → main ships TestFlight → release is a
      phased rollout with a rollback plan.” Distinguish version from build number if they probe. Say
      <i>TestFlight</i>, <i>Xcode Cloud</i>, and <i>Fastlane</i> as proper product names.`,
  },
  {
    id: "p7",
    num: "Pitch 07",
    title: "How do you keep an app secure and private?",
    metaHtml: `<span class="pill">“How do you handle sensitive data?”</span><span class="pill accent">~60 sec</span>`,
    scriptHtml: `<p>Secrets like tokens and passwords go in the Keychain, which is encrypted and hardware-backed
        — never in UserDefaults, which is just an unencrypted plist. Sensitive flows get gated with biometrics
        through the LocalAuthentication framework, always with a passcode fallback.</p>
      <p>On the network side I keep App Transport Security on, so connections are HTTPS with modern TLS by
        default. And on privacy, I declare a privacy manifest with the data the app and its SDKs collect and the
        required-reason APIs it uses, and I request tracking permission before touching the advertising
        identifier. The mindset is data minimization — the safest data is the data you never collect, which is
        also an argument for doing processing on device.</p>`,
    tipsHtml: `<span class="lbl">Delivery tips</span> One crisp rule each: Keychain for secrets, biometrics for
      sensitive flows, ATS for the network, privacy manifest for the store. Say <i>Keychain</i> and
      <i>biometrics</i> clearly, and end on “data minimization” — it sounds principled.`,
  },
  {
    id: "p8",
    num: "Pitch 08",
    title: "Why on-device AI?",
    metaHtml: `<span class="pill">“Why run ML on device?”</span><span class="pill accent">~60 sec</span>`,
    scriptHtml: `<p>On-device inference wins on four things: privacy, because the data never leaves the device;
        latency, because there's no network round-trip; offline support; and cost, because there's no per-call
        bill. Apple accelerates it with the Neural Engine.</p>
      <p>The toolbox is Core ML to run trained models, Create ML to train them, and task frameworks like Vision
        for images, Natural Language for text, and Speech for transcription — and Apple Intelligence is pushing
        on-device generative features further. My rule is to run on device whenever the task fits, and fall back
        to a server model only when the work genuinely exceeds what the device can do. A concrete example is
        semantic search: embed content with a small model, store the vectors locally, and rank by similarity —
        completely private and offline.</p>`,
    tipsHtml: `<span class="lbl">Delivery tips</span> Lead with the four-word list — “privacy, latency, offline,
      cost.” Then name the frameworks. Say <i>Core ML</i> as “core M-L” and <i>Neural Engine</i> as a proper
      name. Close with the semantic-search example to show you've actually built with it.`,
  },
];
