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
    answerHtml: `<p>Convert it to the Core ML format with <code>coremltools</code> (producing an
      <code>.mlpackage</code>), add it to the app, and Xcode generates a typed Swift class. Then run inference
      via Core ML, which schedules on CPU/GPU/Neural Engine. Quantize or prune during conversion to hit size and
      latency budgets.</p>`,
    level: "beyond",
  },
  {
    id: "b2",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "What does the Vision framework do?",
    answerHtml: `<p>On-device image analysis: text recognition (OCR), face/landmark detection, object and
      rectangle detection, barcode reading, image classification, and feature-print similarity. You run requests
      against a <code>VNImageRequestHandler</code> — no network, results in milliseconds.</p>`,
    level: "beyond",
  },
  {
    id: "b3",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "What is the Natural Language framework used for?",
    answerHtml: `<p>On-device text processing: language identification, tokenization, part-of-speech and named
      entity recognition, sentiment, and word/sentence <b>embeddings</b>. Those embeddings are exactly what you
      need for semantic search and clustering without a server.</p>`,
    level: "beyond",
  },
  {
    id: "b4",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "What is Create ML?",
    answerHtml: `<p>Apple's tool/framework for <b>training</b> models without leaving the Apple stack — image,
      text, sound, tabular, and more — exported straight to Core ML. There's a Create ML app for no-code
      training and a framework for programmatic training, including some on-device personalization.</p>`,
    level: "beyond",
  },
  {
    id: "b5",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "What is the Neural Engine and why does it matter?",
    answerHtml: `<p>A dedicated ML accelerator in Apple silicon. Core ML automatically dispatches supported
      models to it for fast, energy-efficient inference, freeing the CPU/GPU. It's why heavy on-device models can
      run in real time without draining the battery.</p>`,
    level: "beyond",
  },
  {
    id: "b6",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "How should you think about Apple Intelligence as a developer?",
    answerHtml: `<p>It's Apple's on-device-first generative layer (writing tools, image features, Siri/app
      intents, and on-device foundation models). Adopt it through the provided APIs and App Intents, keep a
      graceful fallback for unsupported devices, and lean on its on-device nature for privacy.</p>`,
    level: "beyond",
  },
  {
    id: "b7",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How are widgets built, and what's the key constraint?",
    answerHtml: `<p>With <b>WidgetKit</b> + SwiftUI, in an app extension. The key constraint: widgets are
      <b>not live</b> — you supply a timeline of pre-rendered entries and the system displays them, so design
      around periodic snapshots, not continuous updates. Live Activities cover time-sensitive, frequently
      updating cases.</p>`,
    level: "senior",
  },
  {
    id: "b8",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What does it take to support VoiceOver well?",
    answerHtml: `<p>Give controls meaningful <code>accessibilityLabel</code>s, group/hide decorative views,
      expose state with traits and values, and ensure a logical focus order. SwiftUI provides a lot for free, but
      custom controls need explicit accessibility. Test by actually turning VoiceOver on.</p>`,
    level: "senior",
  },
  {
    id: "b9",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is Dynamic Type and how do you respect it?",
    answerHtml: `<p>The user's preferred text size. Use semantic fonts (<code>.font(.body)</code>,
      <code>.headline</code>) so text scales automatically, avoid fixed frames that clip large text, and test at
      the accessibility sizes. It's both an accessibility requirement and a common review nitpick.</p>`,
    level: "mid",
  },
  {
    id: "b10",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you localize a modern SwiftUI app?",
    answerHtml: `<p>Use <b>String Catalogs</b> (<code>.xcstrings</code>): strings in code are keys that Xcode
      extracts automatically; translators fill in locales, including plural variants. SwiftUI <code>Text</code>
      localizes by default. Also localize formatting (dates, numbers) via <code>formatted()</code> and support
      right-to-left layouts.</p>`,
    level: "mid",
  },
  {
    id: "b11",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do remote push notifications work at a high level?",
    answerHtml: `<p>The app registers for remote notifications and gets a device token; your server sends a
      payload to <b>APNs</b> with that token; APNs delivers it. Use a notification service extension to mutate
      payloads (e.g. decrypt, add media) before display. Silent pushes can trigger background work.</p>`,
    level: "senior",
  },
  {
    id: "b12",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do an app and its extension share data?",
    answerHtml: `<p>Via an <b>App Group</b>: a shared container both targets can access — a shared
      <code>UserDefaults(suiteName:)</code> and a shared file/database directory. It's how a widget or share
      extension reads data the main app wrote.</p>`,
    level: "senior",
  },
  {
    id: "b13",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Combine vs async/await — when would you still use Combine?",
    answerHtml: `<p>async/await is the default for one-shot async work. <b>Combine</b> still shines for
      declarative <i>streams</i> of values over time with operators (debounce, combineLatest, merge) — though
      <code>AsyncSequence</code> now covers many of those cases. Know Combine because large existing codebases
      use it heavily.</p>`,
    level: "senior",
  },
  {
    id: "b14",
    category: "appstore",
    categoryLabel: "App Store",
    question: "What is app thinning?",
    answerHtml: `<p>The App Store delivers only what a given device needs: <b>slicing</b> (device-specific
      assets/architectures), <b>bitcode</b> historically, and <b>on-demand resources</b> (download assets when
      needed). Result: smaller downloads. You enable most of it by using asset catalogs and on-demand resource
      tags correctly.</p>`,
    level: "senior",
  },
  {
    id: "b15",
    category: "perf",
    categoryLabel: "Performance",
    question: "What makes app launch fast, and how is it measured?",
    answerHtml: `<p>Minimize pre-main work (fewer dynamic libraries, less static init), defer non-essential
      setup off the launch path, and avoid synchronous I/O before first frame. Measure cold launch with the
      <b>App Launch</b> instrument and MetricKit launch metrics from the field; set a budget and watch it.</p>`,
    level: "senior",
  },
  {
    id: "b16",
    category: "test",
    categoryLabel: "Testing",
    question: "What is a test plan and why use parallel testing?",
    answerHtml: `<p>A <b>test plan</b> bundles which tests run with configurations (locales, sanitizers,
      arguments) so CI can run multiple passes. <b>Parallel testing</b> distributes tests across simulator
      clones to cut wall-clock time — essential as a suite grows.</p>`,
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
      wrapper and Core ML runs it on CPU/GPU/Neural Engine.</p>`,
  },
  {
    id: "bz2",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "Which framework gives you on-device text embeddings for semantic search?",
    options: ["Vision", "Natural Language", "StoreKit", "WidgetKit"],
    answer: 1,
    explanationHtml: `<p>Natural Language provides word/sentence embeddings (and tokenization, NER, sentiment)
      on device — ideal for similarity and clustering.</p>`,
  },
  {
    id: "bz3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "A home-screen widget's content is:",
    options: ["A live, continuously updating view", "Driven by a timeline of pre-rendered entries", "A web view", "Only static text"],
    answer: 1,
    explanationHtml: `<p>WidgetKit renders a timeline of entries the system shows over time; widgets aren't
      continuously live. Live Activities handle frequently updating cases.</p>`,
  },
  {
    id: "bz4",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "An app and its widget share stored data through:",
    options: ["iCloud only", "An App Group container", "The pasteboard", "A global variable"],
    answer: 1,
    explanationHtml: `<p>An App Group gives both targets a shared UserDefaults suite and file container — the
      standard way to share data between an app and its extensions.</p>`,
  },
  {
    id: "bz5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "To respect Dynamic Type you should:",
    options: ["Hard-code font sizes", "Use semantic fonts and avoid clipping frames", "Disable accessibility", "Only support the default size"],
    answer: 1,
    explanationHtml: `<p>Semantic fonts (<code>.body</code>, <code>.headline</code>) scale with the user's
      setting; fixed frames that clip large text fail accessibility and review.</p>`,
  },
  {
    id: "bz6",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "The Neural Engine's role is to:",
    options: ["Store the Keychain", "Accelerate ML inference efficiently", "Render SwiftUI", "Manage networking"],
    answer: 1,
    explanationHtml: `<p>It's a dedicated accelerator; Core ML dispatches supported models to it for fast,
      low-power inference, leaving the CPU/GPU free.</p>`,
  },
];

export const ADVANCED2_STUDY: StudySection[] = [
  {
    id: "st-adv-5",
    num: "20",
    title: "20 · Building an on-device ML pipeline",
    html: `<p><b>What it is.</b> Wiring Apple's ML stack into a feature without a server. The shape: pick or
      train a model (Create ML, or convert one with <code>coremltools</code>), run it through <b>Core ML</b>,
      and use a task framework — <b>Vision</b> for images, <b>Natural Language</b> for text, <b>Speech</b> for
      audio — to do the heavy lifting. Optimize the model (quantize/prune) to fit memory and latency, and run
      inference off the main actor.</p>
    <p>A concrete pattern is semantic search: embed each item with a small model, store the normalized vectors
      locally, and at query time embed the query and rank by cosine similarity (top-k). It's private, offline,
      and free per query — and it's exactly what this guide's in-browser search demonstrates.</p>
    <div class="callout tip"><span class="lbl">Rule of thumb</span> Inference on device when it fits; server
      only when the task genuinely exceeds the device. Always degrade gracefully on older hardware.</div>`,
  },
  {
    id: "st-adv-6",
    num: "21",
    title: "21 · Accessibility & localization",
    html: `<p><b>What it is.</b> Making the app usable for everyone, everywhere — and it's table stakes for
      review and for many enterprises. <b>Accessibility:</b> meaningful <code>accessibilityLabel</code>s and
      traits, logical focus order, support for <b>Dynamic Type</b> (semantic fonts, no clipping), sufficient
      contrast, and reduced-motion respect. Test with VoiceOver actually on.</p>
    <p><b>Localization:</b> use <b>String Catalogs</b> so strings are extracted automatically and translated per
      locale (with plurals); localize date/number formatting via <code>formatted()</code>; and support
      right-to-left layouts. Don't concatenate localized fragments — use full format strings with
      placeholders.</p>
    <div class="callout tip"><span class="lbl">Level</span> Mid: semantic fonts and basic labels. Senior:
      full VoiceOver support for custom controls, RTL, and a localization workflow that scales.</div>`,
  },
  {
    id: "st-adv-7",
    num: "22",
    title: "22 · Extensions, widgets & background execution",
    html: `<p><b>What it is.</b> iOS apps extend beyond the main process. <b>App extensions</b> (share,
      notification service, action) run in their own sandbox and share data with the app via an <b>App Group</b>.
      <b>Widgets</b> (WidgetKit + SwiftUI) render a <i>timeline</i> of entries — design for periodic snapshots,
      not live updates — while <b>Live Activities</b> cover time-sensitive updates on the Lock Screen and
      Dynamic Island.</p>
    <p><b>Background execution</b> is OS-governed: <code>BGTaskScheduler</code> for refresh/processing,
      background <code>URLSession</code> for long transfers, and silent push to nudge updates. You declare the
      capability and the system decides when to run it — never assume precise timing.</p>
    <div class="callout warn"><span class="lbl">Constraint</span> Extensions and widgets are memory- and
      time-limited. Keep them lightweight, do heavy work in the app, and share results through the App Group
      container.</div>`,
  },
];
