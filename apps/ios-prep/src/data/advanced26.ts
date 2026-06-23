// Advanced batch 26 — App size & launch optimization (senior/architect). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED26_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED26_FLASHCARDS: Flashcard[] = [
  {
    id: "ls1",
    category: "perf",
    categoryLabel: "Performance",
    question: "Cold vs warm launch — what's the difference?",
    answerHtml: `<p><b>Cold</b>: the app isn't in memory — the system loads the binary, runs pre-main, then your
      code (the slow, important case). <b>Warm/resume</b>: the app is still resident, so it returns quickly. You
      optimize for <b>cold</b> launch, and the target is roughly <b>under ~400 ms</b> to first frame to feel
      instant.</p>`,
    level: "senior",
  },
  {
    id: "ls2",
    category: "perf",
    categoryLabel: "Performance",
    question: "What happens during pre-main launch time?",
    answerHtml: `<p><b>dyld</b> loads your dynamic libraries, rebinds/rebases symbols, and runs static
      initializers (and any <code>+load</code>) — all <i>before</i> your <code>main()</code>. The biggest lever is
      <b>fewer dynamic frameworks</b>: each dylib adds load/link cost, so consolidating or statically linking
      shrinks pre-main time.</p>`,
    level: "architect",
  },
  {
    id: "ls3",
    category: "perf",
    categoryLabel: "Performance",
    question: "What happens between main() and the first frame?",
    answerHtml: `<p>App + scene setup, building the initial UI, and any work you do in init / app launch. Keep this
      path lean: construct only what's needed for the first screen, and push everything else to <i>after</i> first
      frame. This is the part you most directly control.</p>`,
    level: "senior",
  },
  {
    id: "ls4",
    category: "perf",
    categoryLabel: "Performance",
    question: "Why do dynamic frameworks slow launch, and what's the fix?",
    answerHtml: `<p>Each dynamic framework (dylib) must be found, loaded, and linked by dyld at launch. Many
      small dynamic frameworks = measurable pre-main cost. Fixes: prefer <b>static</b> linking where possible,
      merge frameworks, or use a mergeable-libraries setup so they collapse into the main binary in release
      builds.</p>`,
    level: "architect",
  },
  {
    id: "ls5",
    category: "perf",
    categoryLabel: "Performance",
    question: "How do you keep launch fast by deferring work?",
    answerHtml: `<p>Move non-essential setup off the launch path: <b>lazy-initialize</b> services, kick off
      analytics/SDK init and prefetch <b>after</b> the first frame (or on a background task), and don't do
      synchronous I/O or network before first render. Show UI first; warm up the rest in the background.</p>`,
    level: "senior",
  },
  {
    id: "ls6",
    category: "perf",
    categoryLabel: "Performance",
    question: "Why are heavy static initializers a launch problem?",
    answerHtml: `<p>Global/static state and type initializers can run during or right after load, before your UI —
      so an expensive global (parsing a big file, building a large structure at <code>static let</code>) directly
      delays launch. Make such work <b>lazy</b> so it happens on first use, not at startup.</p>`,
    level: "senior",
  },
  {
    id: "ls7",
    category: "perf",
    categoryLabel: "Performance",
    question: "How do you measure launch time?",
    answerHtml: `<p>Locally: the <b>App Launch</b> instrument (breaks down pre-main vs post-main phases). In the
      field: <b>MetricKit</b> launch metrics and the Launch Time data in <b>Xcode Organizer</b> — real percentiles
      across devices. Set a budget and watch the field numbers, not just your fast dev device.</p>`,
    level: "senior",
  },
  {
    id: "ls8",
    category: "perf",
    categoryLabel: "Performance",
    question: "What is launch prewarming?",
    answerHtml: `<p>The system may <b>pre-launch</b> your app partway (run dyld/pre-main) before the user taps,
      to make the visible launch feel instant. So don't assume launch == user opened the app; do user-facing setup
      in scene/foreground callbacks (e.g. <code>willEnterForeground</code>), not just at process start.</p>`,
    level: "architect",
  },
  {
    id: "ls9",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What is app thinning?",
    answerHtml: `<p>The App Store tailors the download to each device via <b>slicing</b> (only the assets and
      architecture that device needs) and <b>on-demand resources</b> (assets fetched later). Result: a smaller
      download than the full universal app. You mostly enable it by using asset catalogs and ODR tags
      correctly.</p>`,
    level: "senior",
  },
  {
    id: "ls10",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "How does slicing work and what enables it?",
    answerHtml: `<p>The store builds device-specific variants — only the needed image scales (@2x/@3x), device
      class assets, and CPU architecture ship to a given device. <b>Asset catalogs</b> are what let the store slice
      images; loose images in the bundle can't be sliced, so put images in catalogs.</p>`,
    level: "senior",
  },
  {
    id: "ls11",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "When do you use On-Demand Resources?",
    answerHtml: `<p>For assets not needed at first launch — tutorial media, later game levels, optional content.
      <b>Tag</b> them; the system downloads a tag's resources when you request it and can purge them when space is
      tight. It shrinks the <b>initial</b> download and defers the rest to when it's actually needed.</p>`,
    level: "senior",
  },
  {
    id: "ls12",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "How do asset catalogs help size and quality?",
    answerHtml: `<p>They enable slicing (per-device delivery), support vector PDFs/SVG that scale without
      shipping every raster size, compress assets, and manage app-icon/variants. Prefer catalog assets (and
      vectors where sensible) over loose files — smaller downloads and crisper images.</p>`,
    level: "mid",
  },
  {
    id: "ls13",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What reduces binary size at build time?",
    answerHtml: `<p><b>Dead-code stripping</b> and symbol stripping remove unused code/symbols, the size
      optimization level (<code>-Osize</code>) trades a little speed for smaller code, and pruning dependencies
      avoids dragging in large libraries. Audit what each dependency actually adds.</p>`,
    level: "senior",
  },
  {
    id: "ls14",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "How do you find out your real download/install size?",
    answerHtml: `<p>The <b>App Size Report</b> (App Store Connect, per build/variant) shows the <b>download</b>
      and <b>install</b> sizes for each device after thinning — the numbers users actually experience, which
      differ from your archive size. Use it to track size regressions across releases.</p>`,
    level: "senior",
  },
  {
    id: "ls15",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What are the biggest contributors to app size?",
    answerHtml: `<p>Usually <b>assets</b> (uncompressed/oversized images, bundled video) and <b>dependencies</b>
      (large or duplicated libraries, multiple analytics SDKs). Compress/right-size media, move big assets to ODR,
      and trim or share dependencies. Measure with the size report before and after.</p>`,
    level: "senior",
  },
  {
    id: "ls16",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "Why does staying under the cellular download limit matter?",
    answerHtml: `<p>Apps over the over-the-air size threshold historically required Wi-Fi to download, which
      <b>hurts install conversion</b> (users won't wait for Wi-Fi). Keeping the thinned download small improves
      install rates and first impressions — size is a growth metric, not just a technical one.</p>`,
    level: "architect",
  },
];

export const ADVANCED26_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED26_QUIZ: QuizQuestion[] = [
  {
    id: "lsz1",
    category: "perf",
    categoryLabel: "Performance",
    question: "The biggest single lever on pre-main launch time is usually:",
    options: ["More threads", "Fewer dynamic frameworks (less dyld work)", "A bigger app icon", "Disabling ARC"],
    answer: 1,
    explanationHtml: `<p>Each dylib must be loaded/linked by dyld before main(); consolidating or statically
      linking frameworks cuts pre-main time the most.</p>`,
  },
  {
    id: "lsz2",
    category: "perf",
    categoryLabel: "Performance",
    question: "To keep launch fast you should:",
    options: ["Do all SDK init synchronously at launch", "Defer non-essential work until after the first frame", "Preload every screen", "Parse large files in a static let"],
    answer: 1,
    explanationHtml: `<p>Show the first screen quickly, then lazy-init services and warm up SDKs/prefetch in the
      background — never block first render.</p>`,
  },
  {
    id: "lsz3",
    category: "perf",
    categoryLabel: "Performance",
    question: "Launch prewarming means you should NOT assume:",
    options: ["dyld runs", "process start == the user opened the app", "the binary is loaded", "main() runs"],
    answer: 1,
    explanationHtml: `<p>The system may pre-launch the app; do user-facing setup in scene/foreground callbacks,
      not solely at process start.</p>`,
  },
  {
    id: "lsz4",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What lets the App Store deliver only the assets/architecture a device needs?",
    options: ["On-Demand Resources", "App slicing (via asset catalogs)", "Dead-code stripping", "Prewarming"],
    answer: 1,
    explanationHtml: `<p>Slicing builds per-device variants; it requires assets to live in asset catalogs (loose
      bundle images can't be sliced).</p>`,
  },
  {
    id: "lsz5",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "To shrink the initial download by deferring optional content, use:",
    options: ["Bigger asset catalogs", "On-Demand Resources (tagged, downloaded later)", "More frameworks", "PNG instead of HEIC"],
    answer: 1,
    explanationHtml: `<p>ODR tags assets so they download when requested and can be purged — reducing the initial
      install size.</p>`,
  },
  {
    id: "lsz6",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "Your true per-device download size is shown by:",
    options: ["The .xcarchive size", "The App Size Report in App Store Connect", "The simulator", "Finder"],
    answer: 1,
    explanationHtml: `<p>The App Size Report gives post-thinning download/install sizes per device — the numbers
      users actually experience, unlike the archive size.</p>`,
  },
];

export const ADVANCED26_STUDY: StudySection[] = [
  {
    id: "st-adv-59",
    num: "74",
    title: "74 · Launch-time optimization",
    html: `<p><b>What it is.</b> Making cold launch feel instant (target ~&lt;400 ms to first frame). It splits
      into <b>pre-main</b> (dyld loads/links your dynamic libraries and runs static initializers — minimize by
      using <b>fewer dynamic frameworks</b> and avoiding heavy global init) and <b>main → first frame</b> (build
      only the first screen; <b>defer</b> SDKs, analytics, and prefetch until after first render). Beware
      <b>prewarming</b> — do user-facing setup in foreground/scene callbacks, not just at process start.</p>
    <div class="callout tip"><span class="lbl">Measure</span> App Launch instrument locally; MetricKit + Xcode
      Organizer for field percentiles. Set a budget and watch real devices, not just your fast one.</div>`,
  },
  {
    id: "st-adv-60",
    num: "75",
    title: "75 · App size: thinning, assets & dependencies",
    html: `<p><b>What it is.</b> Smaller downloads → better install conversion. <b>App thinning</b> = <b>slicing</b>
      (per-device assets/arch — requires <b>asset catalogs</b>) + <b>On-Demand Resources</b> (tagged assets fetched
      later). Cut size by compressing/right-sizing media, using vector assets, pruning or sharing
      <b>dependencies</b> (the other big contributor), and enabling <b>dead-code/symbol stripping</b> and
      <code>-Osize</code> where size matters.</p>
    <p>Track the real numbers with the <b>App Size Report</b> (download vs install, per device) and watch for
      regressions release to release. Staying under the cellular download cap keeps installs frictionless.</p>
    <div class="callout warn"><span class="lbl">Common bloat</span> Loose (un-sliceable) images, oversized media,
      and multiple overlapping SDKs. Catalog assets, move big content to ODR, and audit every dependency's size
      cost.</div>`,
  },
];
