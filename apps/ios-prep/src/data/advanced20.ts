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
    answerHtml: `<p>It's Swift code using <code>PackageDescription</code>: a <code>Package</code> with a
      <code>name</code>, <b>products</b> (what consumers import), <b>targets</b> (your modules/test targets), and
      <b>dependencies</b> (other packages). Targets list their own dependencies, forming the package's internal
      graph.</p>
    <div class="code">let package = Package(
  name: "Feature",
  products: [.library(name: "Feature", targets: ["Feature"])],
  dependencies: [],
  targets: [
    .target(name: "Feature"),
    .testTarget(name: "FeatureTests", dependencies: ["Feature"]),
  ]
)</div>`,
    level: "senior",
  },
  {
    id: "l2",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What target types does SPM support?",
    answerHtml: `<p><code>.target</code> (library code), <code>.testTarget</code>, <code>.executableTarget</code>
      (a CLI/<code>@main</code>), <code>.binaryTarget</code> (a prebuilt XCFramework), <code>.plugin</code> (build
      tool / command plugins), and <code>.macro</code> (a compiler-plugin macro implementation). Pick the type to
      match what the code is.</p>`,
    level: "senior",
  },
  {
    id: "l3",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What are products, and static vs dynamic libraries?",
    answerHtml: `<p>A <b>product</b> is what other packages/apps consume — a <code>.library</code> or
      <code>.executable</code>. A library can be <code>.static</code>, <code>.dynamic</code>, or <b>automatic</b>
      (let SPM decide — usually best). Too many dynamic frameworks slow app launch; prefer automatic/static unless
      you need dynamic.</p>`,
    level: "senior",
  },
  {
    id: "l4",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "How do you declare dependency version requirements?",
    answerHtml: `<p><code>.package(url:, from: "1.2.0")</code> allows up to the next major (SemVer-compatible);
      other rules include <code>.upToNextMinor</code>, <code>exact</code>, a range, or a <code>branch</code>/
      <code>revision</code>. For local modules use <code>.package(path: "../Core")</code>. SPM resolves and pins
      everything in <code>Package.resolved</code>.</p>`,
    level: "senior",
  },
  {
    id: "l5",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "How do you bundle and access resources in a package?",
    answerHtml: `<p>Declare them on the target: <code>.process(...)</code> (optimizes/relocates, the default) or
      <code>.copy(...)</code> (verbatim, e.g. a folder you index yourself). Access them at runtime via
      <code>Bundle.module</code> (SPM generates it), not <code>Bundle.main</code>.</p>`,
    level: "senior",
  },
  {
    id: "l6",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "How do you set the deployment target / platforms for a package?",
    answerHtml: `<p>The <code>platforms:</code> parameter on <code>Package</code>, e.g.
      <code>.iOS(.v16)</code>, declares the minimum OS versions the package supports. Combine with
      <code>#available</code> in code for finer runtime gating. Keep the minimum sensible — too new excludes
      users, too old blocks modern APIs.</p>`,
    level: "senior",
  },
  {
    id: "l7",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How do local packages enable modular architecture?",
    answerHtml: `<p><code>.package(path:)</code> brings a <b>local</b> package into the app. Splitting features
      and shared layers into local packages enforces boundaries (a feature can't import another), parallelizes and
      caches builds, and lets each module be tested/previewed in isolation — the "modular monolith". This is the
      highest-leverage structural decision in a large app.</p>`,
    level: "architect",
  },
  {
    id: "l8",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What is a binary target / XCFramework?",
    answerHtml: `<p>A <code>.binaryTarget</code> ships a prebuilt <b>XCFramework</b> (multi-platform/arch
      bundle) instead of source — used to distribute closed-source SDKs or speed up builds. Reference it by path or
      a URL + <b>checksum</b> (SPM verifies integrity). You lose source debuggability and must rebuild for new
      toolchains.</p>`,
    level: "architect",
  },
  {
    id: "l9",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What are SPM plugins?",
    answerHtml: `<p><b>Build tool plugins</b> run during the build (e.g. code generation, linting like SwiftLint,
      protobuf) wired into a target; <b>command plugins</b> are invoked on demand (<code>swift package &lt;cmd&gt;</code>)
      for tasks like formatting or docs. They standardize tooling without manual run-script setup.</p>`,
    level: "architect",
  },
  {
    id: "l10",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What differs between Debug and Release builds?",
    answerHtml: `<p>Debug: no optimization (<code>-Onone</code>), assertions on, debug symbols, faster builds —
      for development. Release: optimized (<code>-O</code>), assertions stripped, dead-code stripping, slower to
      build, fast to run — for shipping and <b>profiling</b>. Never benchmark a Debug build.</p>`,
    level: "senior",
  },
  {
    id: "l11",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What is a scheme and why share it?",
    answerHtml: `<p>A <b>scheme</b> defines what gets built and how each action (Run, Test, Profile, Archive)
      behaves — which targets, build configuration, environment variables, launch arguments, and test plan.
      <b>Share</b> schemes (check them into git) so CI and teammates build the app identically.</p>`,
    level: "senior",
  },
  {
    id: "l12",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What do xcconfig files give you?",
    answerHtml: `<p>They externalize build settings into versioned text files (per configuration), so settings
      live in readable diffs instead of the binary <code>.pbxproj</code> — far fewer merge conflicts. You can
      <code>#include</code> a base config and override per environment (Debug/Staging/Release), and reference
      other settings with <code>$(SETTING)</code>.</p>`,
    level: "senior",
  },
  {
    id: "l13",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What are build phases and run-script phases?",
    answerHtml: `<p>An ordered list per target: Compile Sources, Link, Copy Bundle Resources, plus custom
      <b>Run Script</b> phases (SwiftLint, codegen, dSYM upload). Declare each script's <b>input/output files</b>
      so Xcode can skip it when nothing changed — otherwise it runs every build and slows you down.</p>`,
    level: "senior",
  },
  {
    id: "l14",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "How does conditional compilation work?",
    answerHtml: `<p><code>#if DEBUG ... #endif</code> compiles code only in a configuration that defines the flag.
      Flags come from <b>Active Compilation Conditions</b> (Swift) / preprocessor macros, set per build config.
      Use it for debug-only tooling, staging endpoints, or feature toggles baked at build time.</p>`,
    level: "senior",
  },
  {
    id: "l15",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What knobs affect optimized build size/speed?",
    answerHtml: `<p>Swift optimization level (<code>-O</code> for speed, <code>-Osize</code> for size),
      whole-module optimization, <b>dead-code stripping</b>, and link-time optimization. App size also benefits
      from asset catalogs, on-demand resources, and app thinning. Measure before tuning — defaults are sane for
      most apps.</p>`,
    level: "senior",
  },
  {
    id: "l16",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "How do build settings and Info.plist relate?",
    answerHtml: `<p>Build settings are variables (e.g. <code>PRODUCT_BUNDLE_IDENTIFIER</code>,
      <code>MARKETING_VERSION</code>) referenced from the <code>Info.plist</code> with <code>$(VARIABLE)</code>,
      so one setting (often per-config via xcconfig) drives the generated plist. Entitlements work similarly via a
      <code>.entitlements</code> file referenced by a build setting.</p>`,
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
      targets are the internal modules that build them.</p>`,
  },
  {
    id: "lz2",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "Bundled package resources are accessed at runtime via:",
    options: ["Bundle.main", "Bundle.module", "FileManager only", "URLSession"],
    answer: 1,
    explanationHtml: `<p>SPM generates <code>Bundle.module</code> for a target's resources; <code>Bundle.main</code>
      is the app bundle, not the package's.</p>`,
  },
  {
    id: "lz3",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "What does a dependency rule of from: 1.2.0 allow?",
    options: ["Exactly 1.2.0", "Up to the next major (SemVer-compatible)", "Any version", "The main branch"],
    answer: 1,
    explanationHtml: `<p><code>from:</code> allows updates up to (but not including) the next major version,
      following Semantic Versioning.</p>`,
  },
  {
    id: "lz4",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Local Swift packages mainly help by:",
    options: ["Reducing app size", "Enforcing module boundaries + parallel/cached builds", "Encrypting code", "Avoiding tests"],
    answer: 1,
    explanationHtml: `<p>They modularize the app: compiler-enforced boundaries, parallel/incremental builds, and
      isolated tests/previews.</p>`,
  },
  {
    id: "lz5",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "Putting build settings in xcconfig files primarily:",
    options: ["Speeds up the app at runtime", "Externalizes them into versioned text (fewer .pbxproj conflicts)", "Encrypts settings", "Is required by SPM"],
    answer: 1,
    explanationHtml: `<p>xcconfig moves settings into readable, per-config text files, avoiding binary
      project-file merge conflicts and enabling includes/overrides.</p>`,
  },
  {
    id: "lz6",
    category: "cicd",
    categoryLabel: "CI/CD & Tooling",
    question: "A custom Run Script phase that runs on every build (even when nothing changed) is missing:",
    options: ["A scheme", "Declared input/output files", "An xcconfig", "A product"],
    answer: 1,
    explanationHtml: `<p>Without input/output file declarations Xcode can't tell the phase is up to date, so it
      re-runs every build — declare them so it's skipped when unchanged.</p>`,
  },
];

export const ADVANCED20_STUDY: StudySection[] = [
  {
    id: "st-adv-47",
    num: "62",
    title: "62 · Authoring Swift packages",
    html: `<p><b>What it is.</b> <code>Package.swift</code> (using <code>PackageDescription</code>) declares
      <b>products</b> (what consumers import), <b>targets</b> (<code>.target</code>, <code>.testTarget</code>,
      <code>.executableTarget</code>, <code>.binaryTarget</code>, <code>.plugin</code>, <code>.macro</code>), and
      <b>dependencies</b> (SemVer rules via <code>from:</code>/<code>exact</code>/ranges, or local
      <code>path:</code>). Bundle resources with <code>.process</code>/<code>.copy</code> and read them via
      <code>Bundle.module</code>; set <code>platforms:</code> for deployment targets.</p>
    <p>The big win is <b>local packages</b> for modularization — feature + shared packages with enforced
      boundaries, parallel builds, and isolated tests. Distribute closed-source via a checksummed
      <code>binaryTarget</code> (XCFramework), and automate tooling with build/command plugins.</p>
    <div class="callout tip"><span class="lbl">Library type</span> Prefer <b>automatic</b> linkage; too many
      dynamic frameworks slows app launch.</div>`,
  },
  {
    id: "st-adv-48",
    num: "63",
    title: "63 · Build settings, configs & schemes",
    html: `<p><b>What it is.</b> How a build is parameterized. <b>Configurations</b> (Debug vs Release) flip
      optimization, assertions, and stripping — never profile Debug. <b>Schemes</b> define what each action
      builds/runs/tests (share them so CI matches local). <b>xcconfig</b> files externalize settings into
      versioned text (fewer <code>.pbxproj</code> conflicts; <code>#include</code> + <code>$(VAR)</code>
      references). <b>Run-script build phases</b> need declared input/output files or they run every build.</p>
    <p><b>Conditional compilation</b> (<code>#if DEBUG</code>, Active Compilation Conditions) bakes per-config
      behavior; build-setting variables drive the generated <code>Info.plist</code> and entitlements
      (<code>$(MARKETING_VERSION)</code>, bundle id). Tune optimization/size only with measurement.</p>
    <div class="callout warn"><span class="lbl">Reproducibility</span> Shared schemes + xcconfig + a pinned
      toolchain are what make "builds on my machine" also build in CI.</div>`,
  },
];
