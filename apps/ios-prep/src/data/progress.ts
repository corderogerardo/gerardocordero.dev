export type ChecklistItem = { id: string; label: string };
export type ChecklistGroup = { title: string; items: ChecklistItem[] };

export const PROGRESS_INTRO =
  "A readiness checklist across the whole iOS stack — language, frameworks, shipping, and interview prep. Tick items as you feel solid on them; progress is saved in this browser.";

export const CHECKLIST_GROUPS: ChecklistGroup[] = [
  {
    title: "🧱 Swift & language fundamentals",
    items: [
      { id: "c-sw-1", label: "Value vs reference types, and when to use each" },
      { id: "c-sw-2", label: "Optionals, safe unwrapping, no needless force-unwraps" },
      { id: "c-sw-3", label: "Enums with associated values to model state" },
      { id: "c-sw-4", label: "Protocol-oriented design and generics" },
      { id: "c-sw-5", label: "ARC: strong/weak/unowned and breaking retain cycles" },
    ],
  },
  {
    title: "🎨 SwiftUI & UIKit",
    items: [
      { id: "c-ui-1", label: "Build screens with views, modifiers, stacks, and List" },
      { id: "c-ui-2", label: "State ownership: @State, @Binding, @Observable, @Environment" },
      { id: "c-ui-3", label: "Stable identity in ForEach; lazy stacks for long content" },
      { id: "c-ui-4", label: "UIViewController lifecycle and Auto Layout basics" },
      { id: "c-ui-5", label: "Bridge SwiftUI ↔ UIKit (representable / hosting controller)" },
    ],
  },
  {
    title: "⚙️ Concurrency, data & testing",
    items: [
      { id: "c-co-1", label: "async/await and structured concurrency (async let, task groups)" },
      { id: "c-co-2", label: "Actors, @MainActor, Sendable, and Swift 6 isolation" },
      { id: "c-co-3", label: "URLSession + Codable; map messy JSON cleanly" },
      { id: "c-co-4", label: "Persistence: SwiftData / Core Data; Keychain for secrets" },
      { id: "c-co-5", label: "Unit + UI tests; design for testability via injection" },
    ],
  },
  {
    title: "🏛 Architecture & performance",
    items: [
      { id: "c-ar-1", label: "MVVM in SwiftUI; know when unidirectional/TCA fits" },
      { id: "c-ar-2", label: "Modularize with local Swift packages" },
      { id: "c-ar-3", label: "Repository pattern and a clean data layer" },
      { id: "c-ar-4", label: "Profile with Instruments; fix a real hotspot" },
      { id: "c-ar-5", label: "Offline-first sync and conflict resolution" },
    ],
  },
  {
    title: "🚢 Shipping: CI/CD, App Store, security",
    items: [
      { id: "c-sh-1", label: "CI runs tests; understand code signing" },
      { id: "c-sh-2", label: "TestFlight, version vs build number, phased release" },
      { id: "c-sh-3", label: "Avoid common App Store review rejections" },
      { id: "c-sh-4", label: "ATS, privacy manifest, App Tracking Transparency" },
    ],
  },
  {
    title: "🎯 Interview readiness",
    items: [
      { id: "c-iv-1", label: "Drilled the flashcards down to a small Due pile" },
      { id: "c-iv-2", label: "Passed the quiz with explanations understood" },
      { id: "c-iv-3", label: "Solved several coding prompts without peeking" },
      { id: "c-iv-4", label: "Rehearsed every pitch out loud on camera" },
      { id: "c-iv-5", label: "Can place myself on the roadmap and name my next level" },
    ],
  },
];
