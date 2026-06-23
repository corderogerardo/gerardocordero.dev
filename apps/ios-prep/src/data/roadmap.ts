import type { Level } from "@/lib/levels";

export type RoadmapStage = {
  level: Level;
  summary: string;
  /** What you can already do at this level. */
  can: string[];
  /** What to learn to reach the next level. */
  next: string[];
  /** Where to drill in this app (rendered as rich HTML with links). */
  drillHtml: string;
};

export const ROADMAP: RoadmapStage[] = [
  {
    level: "junior",
    summary:
      "You build screens and ship features with guidance. The goal here is fluency in the fundamentals — Swift syntax, SwiftUI views, state, lists, navigation, and fetching data — so you can deliver a working screen end to end in Xcode.",
    can: [
      "Write Swift comfortably: optionals, structs vs classes, enums, closures, and value semantics.",
      "Build SwiftUI screens from views, modifiers, stacks, and List, and drive them with @State and @Binding.",
      "Navigate with NavigationStack and present sheets; pass data between screens.",
      "Call a REST API with URLSession and async/await, decode JSON with Codable, and handle loading / error / empty states.",
      "Run and debug an app on the simulator and a device from Xcode.",
    ],
    next: [
      "Observable models: @Observable / ObservableObject and where state should live (view vs model).",
      "Swift Concurrency basics — async/await, Task, and not blocking the main actor.",
      "MVVM: pull logic out of views into testable view models.",
      "Write your first unit tests with XCTest (or Swift Testing) and a UI test.",
    ],
    drillHtml:
      'Drill the <a href="/flashcards">flashcards</a> filtered to <b>Junior</b>, plus the <b>Swift</b> and <b>SwiftUI</b> categories. Read study topics <a href="/study#st-1">01</a>, <a href="/study#st-2">02</a>, <a href="/study#st-3">03</a>, and <a href="/study#st-6">06</a>.',
  },
  {
    level: "mid",
    summary:
      "You own features end to end — state, data, persistence, and tests — with little hand-holding. The goal is depth across the everyday iOS toolkit and the start of performance and concurrency awareness.",
    can: [
      "Model state cleanly with the Observation framework (@Observable), @Environment, and clear data flow.",
      "Separate UI from logic with MVVM; inject dependencies instead of hard-coding singletons.",
      "Persist data with SwiftData or Core Data, and cache network responses.",
      "Use structured concurrency: async let, task groups, and @MainActor for UI updates.",
      "Write meaningful unit tests and a few UI tests; read a crash report and a basic Instruments trace.",
    ],
    next: [
      "Swift 6 strict concurrency: actors, Sendable, isolation, and fixing data races at compile time.",
      "Performance: diffing in SwiftUI, identity, lazy stacks, image/memory budgets, and Instruments deep-dives.",
      "UIKit interop — UIViewRepresentable, hosting controllers — and when to drop down to UIKit.",
      "Architecture patterns beyond MVVM (unidirectional / TCA-style) and modularizing with SPM.",
    ],
    drillHtml:
      'Drill <b>Mid</b> + <b>Senior</b> flashcards across <b>Concurrency</b>, <b>Data & Networking</b>, and <b>Testing</b>. Read study topics <a href="/study#st-5">05</a>, <a href="/study#st-7">07</a>, <a href="/study#st-8">08</a>, and <a href="/study#st-10">10</a>, then try a <a href="/practice">coding prompt</a>.',
  },
  {
    level: "senior",
    summary:
      "You're the person who makes the hard calls: concurrency correctness, performance under load, native depth, and security. You can justify trade-offs and mentor others, and you own quality from the simulator to the App Store.",
    can: [
      "Reason about Swift 6 data-race safety: actor isolation, Sendable, @MainActor, and async boundaries.",
      "Diagnose and fix performance issues with Instruments (Time Profiler, Allocations, SwiftUI, Hangs).",
      "Bridge SwiftUI and UIKit both ways, and integrate native frameworks confidently.",
      "Set up CI/CD (Xcode Cloud or Fastlane), signing, TestFlight, and a repeatable release process.",
      "Handle security and privacy: Keychain, biometrics, App Transport Security, and privacy manifests.",
    ],
    next: [
      "System design for mobile: modular architecture, offline-first sync, and feature-flagged rollouts.",
      "Platform leverage: build tooling, SwiftLint/format, shared design systems, and reusable Swift packages.",
      "Deep release engineering: phased releases, staged rollouts, and crash/observability pipelines.",
      "Lead technical decisions and write the ADRs the team will follow.",
    ],
    drillHtml:
      'Drill <b>Senior</b> flashcards across <b>Performance</b>, <b>Security</b>, and <b>CI/CD & Tooling</b>. Read study topics <a href="/study#st-9">09</a>, <a href="/study#st-12">12</a>, <a href="/study#st-13">13</a>, and <a href="/study#st-14">14</a>, plus the <a href="/architecture">Architecture</a> deep dives, then try a <a href="/practice">system-design prompt</a>.',
  },
  {
    level: "architect",
    summary:
      "You design systems, not just features. You set the architecture, the module boundaries, and the platform decisions that give a whole team leverage — and you keep an app shippable as it scales to many engineers and millions of users.",
    can: [
      "Design a modular, multi-package app: clear boundaries, dependency direction, and feature isolation.",
      "Choose architecture (MVVM, unidirectional/TCA, Clean) per the team and product, and defend the trade-offs.",
      "Own build and release at scale: caching, parallel CI, code signing strategy, and phased rollouts.",
      "Set cross-cutting standards: observability, accessibility, localization, and security posture.",
      "Make platform bets — adopt new APIs deliberately while keeping a sane minimum-deployment target.",
    ],
    next: [
      "Push into on-device intelligence: Core ML pipelines and Apple Intelligence integration.",
      "Influence beyond the codebase: hiring bar, technical strategy, and developer experience.",
      "Contribute to the ecosystem — open source, Swift Evolution discussions, and conference talks.",
    ],
    drillHtml:
      'Live in the <a href="/architecture">Architecture</a> deep dives and the <b>Architect</b> flashcards. Read study topics <a href="/study#st-11">11</a> and <a href="/study#st-12">12</a>, and rehearse the system-design <a href="/practice">prompts</a> and <a href="/pitches">pitches</a> out loud.',
  },
  {
    level: "beyond",
    summary:
      "The frontier: pushing the platform itself. On-device AI, new modalities, and being early — and credible — on what Apple ships next, from Apple Intelligence to spatial computing.",
    can: [
      "Integrate Core ML, Vision, Natural Language, and Speech for on-device, private inference.",
      "Adopt Apple Intelligence and on-device foundation models thoughtfully, with graceful fallbacks.",
      "Profile and shrink models, and reason about latency, memory, and battery for ML on device.",
      "Prototype with new platforms and APIs early, and ship behind flags.",
    ],
    next: [
      "Stay current with each WWDC and turn new APIs into shipped, differentiated features.",
      "Share what you learn — write, speak, and open-source the hard parts.",
    ],
    drillHtml:
      'Drill the <b>Beyond</b> and <b>On-Device AI</b> flashcards, read study topic <a href="/study#st-15">15</a>, and study the on-device AI <a href="/architecture">deep dive</a>. This guide&apos;s own search runs a small model fully in your browser — a working example of the idea.',
  },
];
