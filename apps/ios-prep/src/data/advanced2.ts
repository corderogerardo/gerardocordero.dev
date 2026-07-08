// Advanced batch 2 — beyond / on-device AI and platform breadth. Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED2_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED2_FLASHCARDS: Flashcard[] = [
  {
    id: "b1",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "How do you get a PyTorch/TensorFlow model into an iOS app?",
    answerHtml: `<p>You convert, you don't hand-port — reimplementing a model's math in Swift is slow and
      error-prone, and it throws away Apple's hardware scheduling. Convert it to the Core ML format with
      <code>coremltools</code> (producing an <code>.mlpackage</code>), add it to the app, and Xcode generates a
      typed Swift class. Run inference via Core ML, which schedules on CPU/GPU/Neural Engine for you. Quantize or
      prune during conversion to hit size and latency budgets.</p>
      <p><b>Red flag:</b> proposing to call a cloud API instead when the requirement is on-device — that trades
      away privacy, offline support, and per-query cost for no real benefit if the model fits on the device.</p>
      <p><b>"I convert with coremltools once, then it's a typed Swift class Core ML runs locally — no server, no
      per-query cost."</b></p>`,
    level: "beyond",
  },
  {
    id: "b2",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "What does the Vision framework do?",
    answerHtml: `<p>It moves image understanding onto the device so results come back in milliseconds with no
      network round trip and no image ever leaving the phone. Mechanically: text recognition (OCR),
      face/landmark detection, object and rectangle detection, barcode reading, image classification, and
      feature-print similarity, all run as requests against a <code>VNImageRequestHandler</code>.</p>
      <p><b>"Vision gets me OCR, detection, and classification on-device — no network round trip, no image
      leaving the phone."</b></p>`,
    level: "beyond",
  },
  {
    id: "b3",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "What is the Natural Language framework used for?",
    answerHtml: `<p>It's the framework that turns text into structure and vectors on-device, which is what
      makes offline semantic search possible at all. It covers language identification, tokenization,
      part-of-speech and named entity recognition, sentiment, and word/sentence <b>embeddings</b> — those
      embeddings are exactly what you need for semantic search and clustering without a server.</p>
      <p><b>"Natural Language gives me on-device embeddings — that's the building block for offline semantic
      search."</b></p>`,
    level: "beyond",
  },
  {
    id: "b4",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "What is Create ML?",
    answerHtml: `<p>It closes the loop between "we have a model" and "we have a Core ML model" without ever
      touching Python — you train inside the Apple stack and export straight to the format the app already
      knows how to run. It covers image, text, sound, tabular, and more, via a no-code Create ML app or a
      framework for programmatic training, including some on-device personalization.</p>
      <p><b>"Create ML lets me train and export straight to Core ML, so there's no Python hand-off in the
      pipeline."</b></p>`,
    level: "beyond",
  },
  {
    id: "b5",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "What is the Neural Engine and why does it matter?",
    answerHtml: `<p>It's why heavy on-device models don't cost you battery or frame drops: a dedicated ML
      accelerator in Apple silicon, separate from the CPU and GPU. Core ML automatically dispatches supported
      models to it for fast, energy-efficient inference, freeing the CPU/GPU for everything else the app is
      doing.</p>
      <p><b>Red flag:</b> treating the Neural Engine as "just the GPU" — it's a distinct piece of silicon, and
      Core ML picks the target for you; you don't get to (or need to) hand-schedule it.</p>
      <p><b>"Core ML dispatches to the Neural Engine automatically, so heavy models run in real time without
      draining the battery."</b></p>`,
    level: "beyond",
  },
  {
    id: "b6",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "How should you think about Apple Intelligence as a developer?",
    answerHtml: `<p>Treat it as a platform capability you integrate with, not a model you build — Apple owns the
      generative layer (writing tools, image features, Siri/app intents, and on-device foundation models) and
      your job is exposing your app's data and actions to it. Adopt it through the provided APIs and App
      Intents, keep a graceful fallback for unsupported devices, and lean on its on-device nature for the
      privacy story.</p>
      <p><b>"I integrate with Apple Intelligence through App Intents and the provided APIs, with a fallback path
      for devices that don't support it."</b></p>`,
    level: "beyond",
  },
  {
    id: "b7",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How are widgets built, and what's the key constraint?",
    answerHtml: `<p>Designing a widget is designing for a snapshot, not a screen — the system, not your code,
      decides when it repaints. You build it with <b>WidgetKit</b> + SwiftUI in an app extension, and you supply
      a timeline of pre-rendered entries; the OS displays them on its own schedule. Live Activities exist
      precisely to cover the time-sensitive, frequently updating cases widgets can't.</p>
      <p><b>Red flag:</b> designing a widget like it polls or animates continuously — it doesn't; if the data is
      genuinely live, that's a Live Activity, not a widget timeline.</p>
      <p><b>"Widgets render a timeline of snapshots the system schedules — for anything truly live, I reach for
      a Live Activity instead."</b></p>`,
    level: "senior",
  },
  {
    id: "b8",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What does it take to support VoiceOver well?",
    answerHtml: `<p>VoiceOver support is a review gate and a real-user requirement, not a nice-to-have, and
      SwiftUI only gets you partway there for free. Give controls meaningful
      <code>accessibilityLabel</code>s, group/hide decorative views, expose state with traits and values, and
      ensure a logical focus order — custom controls need all of this explicitly.</p>
      <p><b>Red flag:</b> saying "SwiftUI is accessible by default" and stopping there — that's true for stock
      controls, not for anything custom you compose yourself. Test by actually turning VoiceOver on.</p>
      <p><b>"SwiftUI gives me accessibility for free on stock controls; for anything custom I add labels, traits,
      and focus order myself, and I verify it with VoiceOver on."</b></p>`,
    level: "senior",
  },
  {
    id: "b9",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is Dynamic Type and how do you respect it?",
    answerHtml: `<p>Dynamic Type is the user's preferred text size, and ignoring it is both an accessibility
      failure and a common App Review nitpick. Use semantic fonts (<code>.font(.body)</code>,
      <code>.headline</code>) so text scales automatically, avoid fixed frames that clip large text, and test at
      the accessibility sizes.</p>
      <p><b>"I use semantic fonts everywhere so text scales with Dynamic Type, and I test layout at the largest
      accessibility sizes, not just the default."</b></p>`,
    level: "mid",
  },
  {
    id: "b10",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you localize a modern SwiftUI app?",
    answerHtml: `<p>Localization done right means translators never touch code and layout never assumes
      left-to-right or a fixed string length. Use <b>String Catalogs</b> (<code>.xcstrings</code>): strings in
      code are keys that Xcode extracts automatically, and translators fill in locales, including plural
      variants — SwiftUI <code>Text</code> localizes by default. Also localize formatting (dates, numbers) via
      <code>formatted()</code> and support right-to-left layouts.</p>
      <p><b>Red flag:</b> concatenating translated fragments to build a sentence — word order varies by
      language, so that breaks in half the locales you ship. Use full format strings with placeholders
      instead.</p>
      <p><b>"String Catalogs keep translation out of my code path, and I never concatenate localized
      fragments."</b></p>`,
    level: "mid",
  },
  {
    id: "b11",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do remote push notifications work at a high level?",
    answerHtml: `<p>Your server never talks to the device directly — Apple's infrastructure is the only path
      in, which is why the flow always routes through a token. The app registers for remote notifications and
      gets a device token; your server sends a payload to <b>APNs</b> with that token; APNs delivers it. Use a
      notification service extension to mutate payloads (e.g. decrypt, add media) before display. Silent pushes
      can trigger background work.</p>
      <p><b>"Push always goes app → device token → my server → APNs → device — I never send content directly to
      a device."</b></p>`,
    level: "senior",
  },
  {
    id: "b12",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do an app and its extension share data?",
    answerHtml: `<p>An app and its extensions run in separate sandboxes, so they can't just reach into each
      other's containers — they need an explicitly shared one. That's an <b>App Group</b>: a shared container
      both targets can access, exposing a shared <code>UserDefaults(suiteName:)</code> and a shared file/database
      directory. It's how a widget or share extension reads data the main app wrote.</p>
      <p><b>"App and extension sandboxes are separate by default — an App Group is the explicit shared container
      that bridges them."</b></p>`,
    level: "senior",
  },
  {
    id: "b13",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Combine vs async/await — when would you still use Combine?",
    answerHtml: `<p>The two solve different shapes of problem, so the choice is about the data, not a
      preference: async/await is the default for one-shot async work. <b>Combine</b> still shines for
      declarative <i>streams</i> of values over time with operators (debounce, combineLatest, merge) — though
      <code>AsyncSequence</code> now covers many of those cases. Know Combine regardless, because large existing
      codebases use it heavily.</p>
      <p><b>Red flag:</b> saying Combine is "legacy, don't use it" — a mature codebase built on Combine
      publishers isn't wrong, and rewriting it wholesale for async/await is a cost with no user-facing
      benefit.</p>
      <p><b>"I reach for async/await for one-shot calls and Combine when I need operators over a stream of
      values — and I stay fluent in Combine because it's everywhere in existing code."</b></p>`,
    level: "senior",
  },
  {
    id: "b14",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What is app thinning?",
    answerHtml: `<p>It's the mechanism that keeps your download size close to what a given device actually
      needs, instead of shipping every asset for every device to everyone. The App Store delivers only what
      applies: <b>slicing</b> (device-specific assets/architectures), <b>bitcode</b> historically, and
      <b>on-demand resources</b> (download assets when needed). You get most of it for free by using asset
      catalogs and on-demand resource tags correctly.</p>
      <p><b>"App thinning means users only download the assets their device needs — I get it mostly for free by
      using asset catalogs and on-demand resources properly."</b></p>`,
    level: "senior",
  },
  {
    id: "b15",
    category: "perf",
    categoryLabel: "Performance",
    question: "What makes app launch fast, and how is it measured?",
    answerHtml: `<p>Launch is the one moment every user hits before they've formed any opinion of the app, so
      it earns its own budget and its own instrument. Minimize pre-main work (fewer dynamic libraries, less
      static init), defer non-essential setup off the launch path, and avoid synchronous I/O before first frame.
      Measure cold launch with the <b>App Launch</b> instrument locally and MetricKit launch metrics from the
      field, so you catch regressions real users hit, not just what you see on your dev device.</p>
      <p><b>"I set a launch budget, profile it with the App Launch instrument, and watch MetricKit in the field
      so device diversity doesn't hide regressions."</b></p>`,
    level: "senior",
  },
  {
    id: "b16",
    category: "test",
    categoryLabel: "Testing",
    question: "What is a test plan and why use parallel testing?",
    answerHtml: `<p>As a suite grows, CI time becomes the bottleneck teams actually feel, so both of these exist
      to keep feedback fast without cutting coverage. A <b>test plan</b> bundles which tests run with which
      configurations (locales, sanitizers, arguments) so CI can run multiple passes from one definition.
      <b>Parallel testing</b> distributes tests across simulator clones to cut wall-clock time.</p>
      <p><b>"Test plans keep multi-configuration runs declarative, and parallel testing is what keeps CI fast as
      the suite grows — not something I bolt on only after it's already slow."</b></p>`,
    level: "mid",
  },
];

export const ADVANCED2_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED2_QUIZ: QuizQuestion[] = [
  {
    id: "bz1",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "To run a third-party trained model on iOS you typically:",
    options: ["Call a cloud API", "Convert it to Core ML with coremltools", "Rewrite it in Swift by hand", "Use UserDefaults"],
    answer: 1,
    explanationHtml: `<p>Convert to the Core ML format with <code>coremltools</code>; Xcode generates a typed
      wrapper and Core ML runs it on CPU/GPU/Neural Engine. "Call a cloud API" is the tempting wrong answer when
      the question doesn't rule it out explicitly — but it throws away the on-device win entirely (offline
      support, privacy, no per-query cost), and it isn't how you'd run a model you specifically want on-device.</p>`,
  },
  {
    id: "bz2",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "Which framework gives you on-device text embeddings for semantic search?",
    options: ["Vision", "Natural Language", "StoreKit", "WidgetKit"],
    answer: 1,
    explanationHtml: `<p>Natural Language provides word/sentence embeddings (and tokenization, NER, sentiment)
      on device — ideal for similarity and clustering. Vision is the tempting wrong pick if you conflate "Apple
      ML framework" with "the one I need" — it's for images (OCR, detection, classification), not text
      embeddings.</p>`,
  },
  {
    id: "bz3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "A home-screen widget's content is:",
    options: ["A live, continuously updating view", "Driven by a timeline of pre-rendered entries", "A web view", "Only static text"],
    answer: 1,
    explanationHtml: `<p>WidgetKit renders a timeline of entries the system shows over time; widgets aren't
      continuously live. "A live, continuously updating view" is the misconception worth naming explicitly — if
      the content is genuinely time-sensitive and frequently updating, that's what Live Activities are for, not
      a widget timeline.</p>`,
  },
  {
    id: "bz4",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "An app and its widget share stored data through:",
    options: ["iCloud only", "An App Group container", "The pasteboard", "A global variable"],
    answer: 1,
    explanationHtml: `<p>An App Group gives both targets a shared UserDefaults suite and file container — the
      standard way to share data between an app and its extensions. "iCloud only" is the tempting wrong answer
      because iCloud does sync data across devices, but it's not the local, low-latency mechanism a widget uses
      to read what the main app just wrote on the same device.</p>`,
  },
  {
    id: "bz5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "To respect Dynamic Type you should:",
    options: ["Hard-code font sizes", "Use semantic fonts and avoid clipping frames", "Disable accessibility", "Only support the default size"],
    answer: 1,
    explanationHtml: `<p>Semantic fonts (<code>.body</code>, <code>.headline</code>) scale with the user's
      setting; fixed frames that clip large text fail accessibility and review. "Only support the default size"
      is the tempting shortcut that feels like scope control, but Dynamic Type support is expected baseline
      behavior, not an optional feature to defer.</p>`,
  },
  {
    id: "bz6",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "The Neural Engine's role is to:",
    options: ["Store the Keychain", "Accelerate ML inference efficiently", "Render SwiftUI", "Manage networking"],
    answer: 1,
    explanationHtml: `<p>It's a dedicated accelerator; Core ML dispatches supported models to it for fast,
      low-power inference, leaving the CPU/GPU free. The misconception worth flagging: the Neural Engine isn't
      "the GPU with a new name" — it's separate silicon purpose-built for ML, and Core ML — not your code —
      decides when to use it.</p>`,
  },
];

export const ADVANCED2_STUDY: StudySection[] = [
  {
    id: "st-adv-5",
    num: "20",
    title: "20 · Building an on-device ML pipeline",
    html: `<p><b>Why it matters.</b> An on-device pipeline turns "we need a server for this" into "we don't" —
      no round trip, no per-query cost, and the data never leaves the phone. The shape: pick or train a model
      (Create ML, or convert one with <code>coremltools</code>), run it through <b>Core ML</b>, and use a task
      framework — <b>Vision</b> for images, <b>Natural Language</b> for text, <b>Speech</b> for audio — to do the
      heavy lifting. Optimize the model (quantize/prune) to fit memory and latency, and run inference off the
      main actor.</p>
    <p>A concrete pattern is semantic search: embed each item with a small model, store the normalized vectors
      locally, and at query time embed the query and rank by cosine similarity (top-k). It's private, offline,
      and free per query — and it's exactly what this guide's in-browser search demonstrates.</p>
    <div class="callout tip"><span class="lbl">Rule of thumb</span> Inference on device when it fits; server
      only when the task genuinely exceeds the device. Always degrade gracefully on older hardware.</div>
    <p><b>Say this:</b> "I default to on-device inference — it's private, offline, and has zero marginal cost
      per query; I only reach for a server when the model genuinely can't fit."</p>`,
  },
  {
    id: "st-adv-6",
    num: "21",
    title: "21 · Accessibility & localization",
    html: `<p><b>Why it matters.</b> These aren't polish items — they're table stakes for App Review and for
      most enterprise customers, and retrofitting either one is far more expensive than building it in.
      <b>Accessibility:</b> meaningful <code>accessibilityLabel</code>s and traits, logical focus order, support
      for <b>Dynamic Type</b> (semantic fonts, no clipping), sufficient contrast, and reduced-motion respect.
      Test with VoiceOver actually on.</p>
    <p><b>Localization:</b> use <b>String Catalogs</b> so strings are extracted automatically and translated per
      locale (with plurals); localize date/number formatting via <code>formatted()</code>; and support
      right-to-left layouts. Don't concatenate localized fragments — use full format strings with
      placeholders.</p>
    <div class="callout tip"><span class="lbl">Level</span> Mid: semantic fonts and basic labels. Senior:
      full VoiceOver support for custom controls, RTL, and a localization workflow that scales.</div>
    <p><b>Say this:</b> "I treat accessibility and localization as baseline requirements, not follow-up work —
      they're cheaper to build in than to retrofit, and Review checks both."</p>`,
  },
  {
    id: "st-adv-7",
    num: "22",
    title: "22 · Extensions, widgets & background execution",
    html: `<p><b>Why it matters.</b> None of this runs on your schedule — the OS owns process lifetime, memory
      budget, and timing for all of it, so designing against "when I want it to run" instead of "when the system
      allows it" is where these features break. <b>App extensions</b> (share, notification service, action) run
      in their own sandbox and share data with the app via an <b>App Group</b>. <b>Widgets</b> (WidgetKit +
      SwiftUI) render a <i>timeline</i> of entries — design for periodic snapshots, not live updates — while
      <b>Live Activities</b> cover time-sensitive updates on the Lock Screen and Dynamic Island.</p>
    <p><b>Background execution</b> is OS-governed: <code>BGTaskScheduler</code> for refresh/processing,
      background <code>URLSession</code> for long transfers, and silent push to nudge updates. You declare the
      capability and the system decides when to run it — never assume precise timing.</p>
    <div class="callout warn"><span class="lbl">Constraint</span> Extensions and widgets are memory- and
      time-limited. Keep them lightweight, do heavy work in the app, and share results through the App Group
      container.</div>
    <p><b>Say this:</b> "I design extensions and background work around the fact that the OS controls timing and
      memory, not my code — the app does the heavy lifting, extensions stay thin."</p>`,
  },
];
