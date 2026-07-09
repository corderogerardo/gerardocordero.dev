// Advanced batch 20 — SPM authoring & build settings (senior/architect). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED20_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED20_FLASHCARDS: Flashcard[] = [
  {
    id: "l1",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What's the structure of a Package.swift manifest?",
    answerHtml: `<p>The manifest exists to make a package's public surface and internal graph explicit and
      machine-resolvable — that's what lets SPM build, cache, and version it like any other dependency. It's Swift
      code using <code>PackageDescription</code>: a <code>Package</code> with a <code>name</code>, <b>products</b>
      (what consumers import), <b>targets</b> (your modules/test targets), and <b>dependencies</b> (other packages).
      Targets list their own dependencies, forming the package's internal graph.</p>
    <div class="code">let package = Package(
  name: "Feature",
  products: [.library(name: "Feature", targets: ["Feature"])],
  dependencies: [],
  targets: [
    .target(name: "Feature"),
    .testTarget(name: "FeatureTests", dependencies: ["Feature"]),
  ]
)</div>
    <p><b>Products are the contract, targets are the implementation — I keep that distinction explicit so consumers
      only ever see what I intend to expose.</b></p>`,
    level: "senior",
  },
  {
    id: "l2",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What target types does SPM support?",
    answerHtml: `<p>SPM needs to know what a target <i>is</i> before it can decide how to build, link, and expose it —
      that's what the target type encodes. Options: <code>.target</code> (library code), <code>.testTarget</code>,
      <code>.executableTarget</code> (a CLI/<code>@main</code>), <code>.binaryTarget</code> (a prebuilt XCFramework),
      <code>.plugin</code> (build tool / command plugins), and <code>.macro</code> (a compiler-plugin macro
      implementation).</p>
    <p><b>I pick the target type to match what the code actually is, not what's convenient to declare — that's what
      keeps the build graph honest.</b></p>`,
    level: "senior",
  },
  {
    id: "l3",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What are products, and static vs dynamic libraries?",
    answerHtml: `<p>Linkage type is a launch-time performance decision disguised as a build setting — it's worth
      understanding, not just copying defaults. A <b>product</b> is what other packages/apps consume — a
      <code>.library</code> or <code>.executable</code>. A library can be <code>.static</code>,
      <code>.dynamic</code>, or <b>automatic</b> (let SPM decide). Too many dynamic frameworks add per-launch dyld
      loading cost; prefer automatic/static unless you specifically need dynamic (e.g. a shared framework loaded by
      multiple targets/extensions).</p>
    <p>Red flag: defaulting every internal module to <code>.dynamic</code> "to be safe" — that's the opposite of
      safe once the app has a dozen local packages. <b>I default to automatic and only reach for dynamic when I have
      a concrete sharing requirement.</b></p>`,
    level: "senior",
  },
  {
    id: "l4",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "How do you declare dependency version requirements?",
    answerHtml: `<p>Version rules are how you trade update freedom for stability — too loose and a transitive
      dependency's breaking change ships silently; too strict and you never get security fixes. <code>.package(url:,
      from: "1.2.0")</code> allows up to the next major (SemVer-compatible); other rules include
      <code>.upToNextMinor</code>, <code>exact</code>, a range, or a <code>branch</code>/<code>revision</code>. For
      local modules use <code>.package(path: "../Core")</code>. SPM resolves and pins everything in
      <code>Package.resolved</code>.</p>
    <p><b>I commit Package.resolved so the whole team and CI build against the exact same dependency graph, not
      whatever SemVer resolved to today.</b></p>`,
    level: "senior",
  },
  {
    id: "l5",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "How do you bundle and access resources in a package?",
    answerHtml: `<p>Packages don't share the app's main bundle, so SPM gives each target its own resource bundle and
      accessor — mixing that up is the most common package-resource bug. Declare resources on the target:
      <code>.process(...)</code> (optimizes/relocates, the default) or <code>.copy(...)</code> (verbatim, e.g. a
      folder you index yourself). Access them at runtime via <code>Bundle.module</code> (SPM generates it), not
      <code>Bundle.main</code>.</p>
    <p>Red flag: reaching for <code>Bundle.main</code> inside a package and getting "resource not found" at runtime
      — <b>package resources live in Bundle.module, always.</b></p>`,
    level: "senior",
  },
  {
    id: "l6",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "How do you set the deployment target / platforms for a package?",
    answerHtml: `<p>The package's minimum OS is a business trade-off between reach and API access, declared once so
      the compiler enforces it everywhere the package is used. The <code>platforms:</code> parameter on
      <code>Package</code>, e.g. <code>.iOS(.v16)</code>, declares the minimum OS versions the package supports.
      Combine with <code>#available</code> in code for finer runtime gating.</p>
    <p><b>I set the deployment target from the adoption data, not from "whatever's newest" — too new excludes real
      users, too old blocks APIs the rest of the team already assumes.</b></p>`,
    level: "senior",
  },
  {
    id: "l7",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How do local packages enable modular architecture?",
    answerHtml: `<p>Modularization is the highest-leverage structural decision in a large app — it's how you get
      compiler-enforced boundaries and parallel builds instead of relying on convention and code review to keep
      layers separate. <code>.package(path:)</code> brings a <b>local</b> package into the app. Splitting features
      and shared layers into local packages enforces boundaries (a feature can't import another), parallelizes and
      caches builds, and lets each module be tested/previewed in isolation — the "modular monolith".</p>
    <p><b>I split by feature and shared-layer boundaries, not by file type — the goal is a dependency graph the
      compiler enforces, not folders that just look organized.</b></p>`,
    level: "architect",
  },
  {
    id: "l8",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What is a binary target / XCFramework?",
    answerHtml: `<p>Binary targets exist for the cases where you can't or don't want to ship source — closed-source
      SDKs, or a large module you'd rather distribute prebuilt to cut CI build time. A <code>.binaryTarget</code>
      ships a prebuilt <b>XCFramework</b> (multi-platform/arch bundle) instead of source. Reference it by path or a
      URL + <b>checksum</b> (SPM verifies integrity).</p>
    <p>Red flag: treating a binary target as a free build-speed win with no trade-off — you lose source
      debuggability and must rebuild/re-publish for every new toolchain. <b>I reach for binary targets only when
      the source can't be shared or the build-time win is measured, not assumed.</b></p>`,
    level: "architect",
  },
  {
    id: "l9",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What are SPM plugins?",
    answerHtml: `<p>Plugins exist so tooling (codegen, linting, formatting) is declared alongside the code it acts on
      instead of living as fragile, undocumented run-script phases only one person understands. <b>Build tool
      plugins</b> run during the build (e.g. code generation, linting like SwiftLint, protobuf) wired into a target;
      <b>command plugins</b> are invoked on demand (<code>swift package &lt;cmd&gt;</code>) for tasks like
      formatting or docs.</p>
    <p><b>I move ad-hoc run-script tooling into plugins so it's versioned with the package and runs the same way
      for every consumer, not just whoever set up the Xcode project.</b></p>`,
    level: "architect",
  },
  {
    id: "l10",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What differs between Debug and Release builds?",
    answerHtml: `<p>The two configurations optimize for opposite things — fast iteration vs. fast execution — and
      conflating them is how "it's slow" bugs get chased in the wrong build entirely. Debug: no optimization
      (<code>-Onone</code>), assertions on, debug symbols, faster builds — for development. Release: optimized
      (<code>-O</code>), assertions stripped, dead-code stripping, slower to build, fast to run — for shipping and
      <b>profiling</b>.</p>
    <p>Red flag: profiling or benchmarking a Debug build — unoptimized code makes every measurement meaningless.
      <b>I always profile Release (or a Release-like configuration), never Debug.</b></p>`,
    level: "senior",
  },
  {
    id: "l11",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What is a scheme and why share it?",
    answerHtml: `<p>A scheme is what makes "it builds on my machine" reproducible across the team and CI — without a
      shared one, every action is implicitly configured by whoever last touched their local Xcode settings. A
      <b>scheme</b> defines what gets built and how each action (Run, Test, Profile, Archive) behaves — which
      targets, build configuration, environment variables, launch arguments, and test plan.</p>
    <p><b>I share schemes and check them into git on day one — an unshared scheme is a silent source of "works for
      me" bugs.</b></p>`,
    level: "senior",
  },
  {
    id: "l12",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What do xcconfig files give you?",
    answerHtml: `<p>xcconfig exists to get build settings out of the binary, merge-conflict-prone
      <code>.pbxproj</code> and into something a team can actually review in a diff. They externalize build
      settings into versioned text files (per configuration), so settings live in readable diffs. You can
      <code>#include</code> a base config and override per environment (Debug/Staging/Release), and reference other
      settings with <code>$(SETTING)</code>.</p>
    <p><b>I push settings out of the project file into xcconfig as soon as a config diverges per environment —
      that's what turns a merge conflict into a one-line diff.</b></p>`,
    level: "senior",
  },
  {
    id: "l13",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What are build phases and run-script phases?",
    answerHtml: `<p>Build phases exist so extra steps (linting, codegen, dSYM upload) happen deterministically as
      part of the build instead of as a manual "don't forget to run X" step. It's an ordered list per target:
      Compile Sources, Link, Copy Bundle Resources, plus custom <b>Run Script</b> phases.</p>
    <p>Red flag: a run-script phase with no declared input/output files — Xcode can't tell it's up to date, so it
      re-runs on every single build and quietly taxes every developer's iteration speed. <b>I always declare
      input/output files so a script only runs when its inputs actually changed.</b></p>`,
    level: "senior",
  },
  {
    id: "l14",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "How does conditional compilation work?",
    answerHtml: `<p>Conditional compilation lets you bake environment-specific behavior into the binary itself, so
      debug tooling or staging endpoints can never accidentally ship to production — there's no code path for them
      to take. <code>#if DEBUG ... #endif</code> compiles code only in a configuration that defines the flag. Flags
      come from <b>Active Compilation Conditions</b> (Swift) / preprocessor macros, set per build config.</p>
    <p><b>I use build-time flags for anything that must never exist in a shipping binary — a runtime feature flag
      can be flipped by mistake, a compile-time one physically isn't there.</b></p>`,
    level: "senior",
  },
  {
    id: "l15",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What knobs affect optimized build size/speed?",
    answerHtml: `<p>These knobs trade build time for runtime speed/size, so tuning them blind can slow your CI for a
      win you can't prove. Swift optimization level (<code>-O</code> for speed, <code>-Osize</code> for size),
      whole-module optimization, <b>dead-code stripping</b>, and link-time optimization. App size also benefits
      from asset catalogs, on-demand resources, and app thinning.</p>
    <p><b>I measure before tuning any of these — the defaults are sane for most apps, and I only touch a knob once
      a profiler or size report points at it.</b></p>`,
    level: "senior",
  },
  {
    id: "l16",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "How do build settings and Info.plist relate?",
    answerHtml: `<p>This indirection exists so one source of truth (often an xcconfig) can drive values across every
      config instead of hand-editing the plist per environment. Build settings are variables (e.g.
      <code>PRODUCT_BUNDLE_IDENTIFIER</code>, <code>MARKETING_VERSION</code>) referenced from the
      <code>Info.plist</code> with <code>$(VARIABLE)</code>, so one setting drives the generated plist. Entitlements
      work similarly via a <code>.entitlements</code> file referenced by a build setting.</p>
    <p><b>I keep bundle id and version as build settings, not hardcoded plist values — that's what lets Debug,
      Staging, and Release point at different bundle ids from the same source.</b></p>`,
    level: "senior",
  },
];

export const ADVANCED20_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED20_QUIZ: QuizQuestion[] = [
  {
    id: "lz1",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "In Package.swift, a 'product' is:",
    options: ["A test file", "What consumers import (library/executable)", "A build setting", "A resource"],
    answer: 1,
    explanationHtml: `<p>Products (<code>.library</code>/<code>.executable</code>) are the public surface;
      targets are the internal modules that build them. Picking "a build setting" is the tempting wrong answer
      because products live in the same manifest as build config — but a product is a consumption contract, not a
      compiler flag; that distinction is what keeps a package's public surface intentional.</p>`,
  },
  {
    id: "lz2",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "Bundled package resources are accessed at runtime via:",
    options: ["Bundle.main", "Bundle.module", "FileManager only", "URLSession"],
    answer: 1,
    explanationHtml: `<p>SPM generates <code>Bundle.module</code> for a target's resources; <code>Bundle.main</code>
      is the app bundle, not the package's. Reaching for <code>Bundle.main</code> is the natural instinct if you're
      used to app-target code, but a package doesn't share the app's bundle — that assumption is exactly what
      produces a "resource not found" crash at runtime instead of a compile error.</p>`,
  },
  {
    id: "lz3",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What does a dependency rule of from: 1.2.0 allow?",
    options: ["Exactly 1.2.0", "Up to the next major (SemVer-compatible)", "Any version", "The main branch"],
    answer: 1,
    explanationHtml: `<p><code>from:</code> allows updates up to (but not including) the next major version,
      following Semantic Versioning. Treating it as "exactly 1.2.0" is the misconception — that's what
      <code>.exact</code> does; <code>from:</code> deliberately leaves room for minor/patch updates so you get fixes
      without waiting on a manual bump, at the cost of trusting the dependency's SemVer discipline.</p>`,
  },
  {
    id: "lz4",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Local Swift packages mainly help by:",
    options: ["Reducing app size", "Enforcing module boundaries + parallel/cached builds", "Encrypting code", "Avoiding tests"],
    answer: 1,
    explanationHtml: `<p>They modularize the app: compiler-enforced boundaries, parallel/incremental builds, and
      isolated tests/previews. "Reducing app size" is the tempting distractor because splitting code sounds like
      trimming it — but a local package doesn't remove code from the binary, it just draws a hard boundary around
      it so a feature literally can't import another feature's internals.</p>`,
  },
  {
    id: "lz5",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "Putting build settings in xcconfig files primarily:",
    options: ["Speeds up the app at runtime", "Externalizes them into versioned text (fewer .pbxproj conflicts)", "Encrypts settings", "Is required by SPM"],
    answer: 1,
    explanationHtml: `<p>xcconfig moves settings into readable, per-config text files, avoiding binary
      project-file merge conflicts and enabling includes/overrides. It's not a runtime optimization and SPM doesn't
      require it — the payoff is purely for the team: a setting change becomes a reviewable one-line diff instead
      of a silent edit buried in <code>.pbxproj</code>.</p>`,
  },
  {
    id: "lz6",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "A custom Run Script phase that runs on every build (even when nothing changed) is missing:",
    options: ["A scheme", "Declared input/output files", "An xcconfig", "A product"],
    answer: 1,
    explanationHtml: `<p>Without input/output file declarations Xcode can't tell the phase is up to date, so it
      re-runs every build — declare them so it's skipped when unchanged. Blaming the scheme or xcconfig is the wrong
      lead because neither controls per-phase caching; the up-to-date check is scoped to that one Run Script phase's
      declared files.</p>`,
  },
];

export const ADVANCED20_STUDY: StudySection[] = [
  {
    id: "st-adv-47",
    num: "62",
    title: "62 · Authoring Swift packages",
    html: `<p>A package manifest exists to make the public surface and internal dependency graph
      machine-resolvable, so SPM (and every consumer) can build, cache, and version it like any other dependency
      instead of trusting folder conventions. <code>Package.swift</code> (using <code>PackageDescription</code>)
      declares <b>products</b> (what consumers import), <b>targets</b> (<code>.target</code>,
      <code>.testTarget</code>, <code>.executableTarget</code>, <code>.binaryTarget</code>, <code>.plugin</code>,
      <code>.macro</code>), and <b>dependencies</b> (SemVer rules via <code>from:</code>/<code>exact</code>/ranges, or
      local <code>path:</code>). Bundle resources with <code>.process</code>/<code>.copy</code> and read them via
      <code>Bundle.module</code>; set <code>platforms:</code> for deployment targets.</p>
    <p>The big win is <b>local packages</b> for modularization — feature + shared packages with enforced
      boundaries, parallel builds, and isolated tests. Distribute closed-source via a checksummed
      <code>binaryTarget</code> (XCFramework), and automate tooling with build/command plugins.</p>
    <div class="callout tip"><span class="lbl">Library type</span> Prefer <b>automatic</b> linkage; too many
      dynamic frameworks slows app launch.</div>
    <p><b>In an interview, say:</b> "I split by feature and shared-layer boundaries so the compiler enforces the
      module graph, not just code review."</p>`,
  },
  {
    id: "st-adv-48",
    num: "63",
    title: "63 · Build settings, configs & schemes",
    html: `<p>How a build is parameterized matters because every one of these knobs decides whether "it works on my
      machine" also works on a teammate's machine and in CI — get them wrong and you chase phantom bugs in the wrong
      configuration entirely. <b>Configurations</b> (Debug vs Release) flip optimization, assertions, and stripping —
      never profile Debug. <b>Schemes</b> define what each action builds/runs/tests (share them so CI matches local).
      <b>xcconfig</b> files externalize settings into versioned text (fewer <code>.pbxproj</code> conflicts;
      <code>#include</code> + <code>$(VAR)</code> references). <b>Run-script build phases</b> need declared
      input/output files or they run every build.</p>
    <p><b>Conditional compilation</b> (<code>#if DEBUG</code>, Active Compilation Conditions) bakes per-config
      behavior; build-setting variables drive the generated <code>Info.plist</code> and entitlements
      (<code>$(MARKETING_VERSION)</code>, bundle id). Tune optimization/size only with measurement.</p>
    <div class="callout warn"><span class="lbl">Reproducibility</span> Shared schemes + xcconfig + a pinned
      toolchain are what make "builds on my machine" also build in CI.</div>
    <p><b>In an interview, say:</b> "I always profile a Release build, never Debug — unoptimized code makes every
      measurement meaningless."</p>`,
  },
];
