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
    answerHtml: `<p>The distinction matters because you can only optimize the case that's actually slow —
      <b>cold</b> launch is where the system loads the binary from disk, runs pre-main, then your code, and it's
      the case a first-time or returning-after-a-while user hits. <b>Warm/resume</b> means the app is still
      resident in memory, so it just returns to the foreground quickly and there's little to tune. Target roughly
      <b>under ~400 ms</b> to first frame on cold launch to feel instant. <b>"I profile and budget cold launch,
      since warm resume is already fast — that's where pre-main and first-screen work actually cost time."</b></p>`,
    level: "senior",
  },
  {
    id: "ls2",
    category: "perf",
    categoryLabel: "Performance",
    question: "What happens during pre-main launch time?",
    answerHtml: `<p>This phase is invisible in your code but often the biggest chunk of launch time you can't
      see in a debugger breakpoint on <code>main()</code> — which is exactly why it gets ignored until launch
      time becomes a problem. <b>dyld</b> loads your dynamic libraries, rebinds/rebases symbols, and runs static
      initializers (and any <code>+load</code>) — all <i>before</i> your <code>main()</code> runs. The biggest
      lever is <b>fewer dynamic frameworks</b>: each dylib adds load/link cost, so consolidating or statically
      linking shrinks pre-main time. <b>"Pre-main cost scales with dylib count, so I audit and consolidate
      frameworks before chasing anything in my own code."</b></p>
      <p>Red flag: profiling launch time by only timing from <code>main()</code> — if pre-main is the bottleneck,
      you'll optimize the wrong half. Use the App Launch instrument, which breaks out both phases.</p>`,
    level: "architect",
  },
  {
    id: "ls3",
    category: "perf",
    categoryLabel: "Performance",
    question: "What happens between main() and the first frame?",
    answerHtml: `<p>This is the phase you actually control, so it's where discipline pays off most: app + scene
      setup, building the initial UI, and whatever work you do in init / app launch. Keep this path lean —
      construct only what's needed for the first screen, and push everything else to <i>after</i> first frame.
      <b>"I treat first-frame as a budget: anything not required to paint the first screen gets deferred, not
      just written wherever it's convenient."</b></p>`,
    level: "senior",
  },
  {
    id: "ls4",
    category: "perf",
    categoryLabel: "Performance",
    question: "Why do dynamic frameworks slow launch, and what's the fix?",
    answerHtml: `<p>Every dynamic framework you add is a tax dyld pays at every cold launch, not just at build
      time — each dylib must be found, loaded, and linked before <code>main()</code> runs, so many small dynamic
      frameworks add up to measurable pre-main cost. Fixes: prefer <b>static</b> linking where possible, merge
      frameworks, or use a mergeable-libraries setup so they collapse into the main binary in release builds.
      <b>"I treat every new dynamic dependency as a launch-time cost, not just a build-time one, and reach for
      static or mergeable linking by default."</b></p>`,
    level: "architect",
  },
  {
    id: "ls5",
    category: "perf",
    categoryLabel: "Performance",
    question: "How do you keep launch fast by deferring work?",
    answerHtml: `<p>The user perceives launch speed as time-to-first-frame, not time-to-fully-ready — so the
      goal is to get pixels on screen first and do everything else invisibly. Move non-essential setup off the
      launch path: <b>lazy-initialize</b> services, kick off analytics/SDK init and prefetch <b>after</b> the
      first frame (or on a background task), and don't do synchronous I/O or network before first render.
      <b>"Show UI first, warm up everything else in the background — the user shouldn't wait on work that isn't
      needed for the first screen."</b></p>
      <p>Red flag: initializing every SDK synchronously in <code>application(_:didFinishLaunchingWithOptions:)</code>
      "to be safe" — that's a common way teams accidentally regress launch time one SDK at a time.</p>`,
    level: "senior",
  },
  {
    id: "ls6",
    category: "perf",
    categoryLabel: "Performance",
    question: "Why are heavy static initializers a launch problem?",
    answerHtml: `<p>Static initializers run before your UI exists, so any cost hidden inside one is cost the
      user pays before seeing anything — global/static state and type initializers can run during or right
      after load. An expensive global (parsing a big file, building a large structure at <code>static let</code>)
      directly delays launch, and it's easy to add without noticing because it doesn't look like "launch code."
      Make such work <b>lazy</b> so it happens on first use, not at startup. <b>"I never let a <code>static let</code>
      do real work eagerly — if it's expensive, it becomes lazy and runs on first access instead of at
      launch."</b></p>`,
    level: "senior",
  },
  {
    id: "ls7",
    category: "perf",
    categoryLabel: "Performance",
    question: "How do you measure launch time?",
    answerHtml: `<p>Your dev device is the fastest phone in the fleet, so measuring only there hides exactly
      the regressions that hurt real users on older hardware. Locally: the <b>App Launch</b> instrument (breaks
      down pre-main vs post-main phases). In the field: <b>MetricKit</b> launch metrics and the Launch Time data
      in <b>Xcode Organizer</b> — real percentiles across devices. <b>"I set a launch-time budget and track it
      against field percentiles from MetricKit/Organizer, not just my own device."</b></p>`,
    level: "senior",
  },
  {
    id: "ls8",
    category: "perf",
    categoryLabel: "Performance",
    question: "What is launch prewarming?",
    answerHtml: `<p>Prewarming breaks the assumption most launch code implicitly relies on — that process
      start means the user just opened the app. The system may <b>pre-launch</b> your app partway (run
      dyld/pre-main) before the user actually taps it, to make the visible launch feel instant. So don't gate
      user-facing setup solely on process start; do it in scene/foreground callbacks (e.g.
      <code>willEnterForeground</code>) instead. <b>"I don't assume process start means the user is looking at
      the app — prewarming can run my launch code before they've tapped anything, so user-facing work lives in
      foreground callbacks."</b></p>
      <p>Red flag: firing session-start analytics or "user opened the app" events at process launch — prewarming
      will inflate those counts with launches nobody actually saw.</p>`,
    level: "architect",
  },
  {
    id: "ls9",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What is app thinning?",
    answerHtml: `<p>Download size directly affects install conversion, so shipping one universal binary to
      every device wastes bytes users never asked for. App thinning is the App Store tailoring the download to
      each device via <b>slicing</b> (only the assets and architecture that device needs) and <b>on-demand
      resources</b> (assets fetched later) — the result is a smaller download than the full universal app. You
      mostly enable it by using asset catalogs and ODR tags correctly, not by writing thinning logic yourself.
      <b>"Thinning is mostly free — I just make sure assets are in catalogs and non-essential content is tagged
      as ODR so the store can slice and defer it."</b></p>`,
    level: "senior",
  },
  {
    id: "ls10",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "How does slicing work and what enables it?",
    answerHtml: `<p>Slicing only works if the store can tell which asset variants belong to which device, so
      where you put an image is what determines whether it can be sliced at all. The store builds device-specific
      variants — only the needed image scales (@2x/@3x), device class assets, and CPU architecture ship to a
      given device. <b>Asset catalogs</b> are what let the store do this; loose images in the bundle can't be
      sliced. <b>"If an image needs to be sliced, it has to live in an asset catalog — loose bundle images ship
      to every device regardless of what they actually need."</b></p>
      <p>Red flag: dropping images straight into the app bundle for convenience — it works, but every device
      downloads every scale/variant, quietly inflating install size.</p>`,
    level: "senior",
  },
  {
    id: "ls11",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "When do you use On-Demand Resources?",
    answerHtml: `<p>ODR exists because the install decision happens before the user has used the app at all, so
      anything not needed for that first session is pure download weight to trim. Use it for assets not needed
      at first launch — tutorial media, later game levels, optional content. <b>Tag</b> them; the system
      downloads a tag's resources when you request them and can purge them when space is tight. It shrinks the
      <b>initial</b> download and defers the rest to when it's actually needed. <b>"Anything not needed in the
      first session is a candidate for ODR — it shrinks the number that determines whether someone installs at
      all."</b></p>`,
    level: "senior",
  },
  {
    id: "ls12",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "How do asset catalogs help size and quality?",
    answerHtml: `<p>Asset catalogs pay off on both size and quality at once, which is why they should be the
      default over loose files, not an optimization you add later. They enable slicing (per-device delivery),
      support vector PDFs/SVG that scale without shipping every raster size, compress assets, and manage
      app-icon/variants. <b>"I default to asset catalogs and vectors over loose raster files — it's smaller
      downloads and crisper images for free."</b></p>`,
    level: "mid",
  },
  {
    id: "ls13",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What reduces binary size at build time?",
    answerHtml: `<p>Binary size is usually a dependency problem more than a your-code problem, so the highest-
      leverage fix is auditing what you've pulled in, not just tuning compiler flags. <b>Dead-code stripping</b>
      and symbol stripping remove unused code/symbols, the size optimization level (<code>-Osize</code>) trades a
      little speed for smaller code, and pruning dependencies avoids dragging in large libraries.
      <b>"Before reaching for -Osize, I audit dependencies first — a single unused-but-linked SDK usually costs
      more than any compiler flag saves."</b></p>`,
    level: "senior",
  },
  {
    id: "ls14",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "How do you find out your real download/install size?",
    answerHtml: `<p>Your archive size isn't what users see, so tracking it as your size metric can hide a real
      regression behind a number that never moved. The <b>App Size Report</b> (App Store Connect, per
      build/variant) shows the <b>download</b> and <b>install</b> sizes for each device after thinning — the
      numbers users actually experience. <b>"I track the App Size Report per release, not archive size — it's
      the post-thinning number users actually feel."</b></p>`,
    level: "senior",
  },
  {
    id: "ls15",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What are the biggest contributors to app size?",
    answerHtml: `<p>Size problems concentrate in a couple of places, so a size audit should start there rather
      than scanning the whole codebase. Usually <b>assets</b> (uncompressed/oversized images, bundled video) and
      <b>dependencies</b> (large or duplicated libraries, multiple analytics SDKs). Compress/right-size media,
      move big assets to ODR, and trim or share dependencies — then re-measure with the size report to confirm
      the fix actually moved the number. <b>"I check assets and dependencies first — that's where size bloat
      almost always lives, and the size report tells me if a fix actually worked."</b></p>`,
    level: "senior",
  },
  {
    id: "ls16",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "Why does staying under the cellular download limit matter?",
    answerHtml: `<p>Apps over the over-the-air size threshold historically required Wi-Fi to download, which
      <b>hurts install conversion</b> (users won't wait for Wi-Fi). Keeping the thinned download small improves
      install rates and first impressions — size is a growth metric, not just a technical one. <b>"I treat the
      cellular download cap as a product number, not just an engineering constraint — crossing it costs
      installs."</b></p>`,
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
      linking frameworks cuts pre-main time the most. Threads, icon size, and ARC don't touch pre-main at all —
      the tempting-sounding "more threads" answer confuses runtime concurrency with a phase that happens before
      your app's runtime even starts.</p>`,
  },
  {
    id: "lsz2",
    category: "perf",
    categoryLabel: "Performance",
    question: "To keep launch fast you should:",
    options: ["Do all SDK init synchronously at launch", "Defer non-essential work until after the first frame", "Preload every screen", "Parse large files in a static let"],
    answer: 1,
    explanationHtml: `<p>Show the first screen quickly, then lazy-init services and warm up SDKs/prefetch in the
      background — never block first render. Doing SDK init synchronously "at launch" feels safe but blocks the
      exact path the user is waiting on; preloading every screen and parsing files in a <code>static let</code>
      are variations of the same mistake — front-loading work the first frame doesn't need.</p>`,
  },
  {
    id: "lsz3",
    category: "perf",
    categoryLabel: "Performance",
    question: "Launch prewarming means you should NOT assume:",
    options: ["dyld runs", "process start == the user opened the app", "the binary is loaded", "main() runs"],
    answer: 1,
    explanationHtml: `<p>The system may pre-launch the app; do user-facing setup in scene/foreground callbacks,
      not solely at process start. dyld running, the binary loading, and main() executing are all still true
      under prewarming — the misconception is assuming any of those means the user is actually looking at the
      app.</p>`,
  },
  {
    id: "lsz4",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What lets the App Store deliver only the assets/architecture a device needs?",
    options: ["On-Demand Resources", "App slicing (via asset catalogs)", "Dead-code stripping", "Prewarming"],
    answer: 1,
    explanationHtml: `<p>Slicing builds per-device variants; it requires assets to live in asset catalogs (loose
      bundle images can't be sliced). ODR is a different lever — it defers assets rather than sizing them per
      device — and dead-code stripping and prewarming don't affect asset delivery at all.</p>`,
  },
  {
    id: "lsz5",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "To shrink the initial download by deferring optional content, use:",
    options: ["Bigger asset catalogs", "On-Demand Resources (tagged, downloaded later)", "More frameworks", "PNG instead of HEIC"],
    answer: 1,
    explanationHtml: `<p>ODR tags assets so they download when requested and can be purged — reducing the initial
      install size. Bigger asset catalogs and more frameworks make the download larger, not smaller; PNG vs HEIC
      is a compression choice, not a deferral mechanism.</p>`,
  },
  {
    id: "lsz6",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "Your true per-device download size is shown by:",
    options: ["The .xcarchive size", "The App Size Report in App Store Connect", "The simulator", "Finder"],
    answer: 1,
    explanationHtml: `<p>The App Size Report gives post-thinning download/install sizes per device — the numbers
      users actually experience, unlike the archive size. The <code>.xcarchive</code> is pre-thinning and always
      overstates what a user downloads, which is the trap in picking it as your size metric.</p>`,
  },
];

export const ADVANCED26_STUDY: StudySection[] = [
  {
    id: "st-adv-59",
    num: "74",
    title: "74 · Launch-time optimization",
    html: `<p><b>Why it matters.</b> Cold launch is the first impression an app makes, and it's measured in
      hard milliseconds, not vibes — a slow first frame reads as a slow app even if everything after is fast.
      The target is roughly &lt;400 ms to first frame. It splits into <b>pre-main</b> (dyld loads/links your
      dynamic libraries and runs static initializers — minimize by using <b>fewer dynamic frameworks</b> and
      avoiding heavy global init) and <b>main → first frame</b> (build only the first screen; <b>defer</b> SDKs,
      analytics, and prefetch until after first render). Beware <b>prewarming</b> — do user-facing setup in
      foreground/scene callbacks, not just at process start.</p>
    <div class="callout tip"><span class="lbl">Measure</span> App Launch instrument locally; MetricKit + Xcode
      Organizer for field percentiles. Set a budget and watch real devices, not just your fast one. In an
      interview, say: <b>"I split launch into pre-main and first-frame, budget each, and validate against field
      percentiles — not my own dev device."</b></div>`,
  },
  {
    id: "st-adv-60",
    num: "75",
    title: "75 · App size: thinning, assets & dependencies",
    html: `<p><b>Why it matters.</b> Download size is a growth metric before it's an engineering one — smaller
      downloads mean better install conversion, and the fix is usually organizational (asset catalogs, ODR
      tagging, dependency hygiene) rather than a clever build flag. <b>App thinning</b> = <b>slicing</b>
      (per-device assets/arch — requires <b>asset catalogs</b>) + <b>On-Demand Resources</b> (tagged assets fetched
      later). Cut size by compressing/right-sizing media, using vector assets, pruning or sharing
      <b>dependencies</b> (the other big contributor), and enabling <b>dead-code/symbol stripping</b> and
      <code>-Osize</code> where size matters.</p>
    <p>Track the real numbers with the <b>App Size Report</b> (download vs install, per device) and watch for
      regressions release to release. Staying under the cellular download cap keeps installs frictionless. In an
      interview, say: <b>"I treat the App Size Report as a release-to-release metric, and I audit assets and
      dependencies first — that's where almost all size bloat lives."</b></p>
    <div class="callout warn"><span class="lbl">Common bloat</span> Loose (un-sliceable) images, oversized media,
      and multiple overlapping SDKs. Catalog assets, move big content to ODR, and audit every dependency's size
      cost.</div>`,
  },
];
