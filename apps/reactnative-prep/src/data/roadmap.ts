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
      "You build screens and ship features with guidance. The goal here is fluency in the fundamentals — components, state, lists, navigation, and data — so you can deliver a working screen end to end.",
    can: [
      "Build screens from components, props, and state, and compose hooks (useState, useEffect).",
      "Render long lists with FlatList instead of mapping inside a ScrollView.",
      "Navigate between screens with Expo Router (file-based routes).",
      "Fetch data and handle loading / error / empty states.",
      "Style with flexbox and StyleSheet, and run the app in Expo Go.",
    ],
    next: [
      "TypeScript fluency: typed props/state, discriminated unions, typing API responses.",
      "State beyond useState — Context and Zustand — and React Query for server state.",
      "Re-render basics: stable keys, when memo/useMemo actually help.",
      "Write your first unit tests with Jest + React Native Testing Library.",
    ],
    drillHtml:
      'Drill the <a href="/flashcards">flashcards</a> filtered to <b>Junior</b>, plus the <b>State &amp; Data</b> and <b>Data &amp; Networking</b> categories. Read study topics <a href="/study#st-1">01</a>, <a href="/study#st-3">03</a>, <a href="/study#st-4">04</a>, and <a href="/study#st-7">07</a>.',
  },
  {
    level: "mid",
    summary:
      "You own features end to end — data, state, tests, and polish — and need little hand-holding. The goal is depth across the everyday RN toolkit and the start of performance awareness.",
    can: [
      "Separate client vs server state (Zustand/Context vs React Query/SWR) and use caching + optimistic updates.",
      "Build forms, handle errors and offline, and cancel in-flight requests.",
      "Write unit and integration tests and keep components testable.",
      "Use native UI components and add basic animations.",
      "Ship through CI and respect a re-render budget.",
    ],
    next: [
      "The New Architecture — Fabric, JSI, TurboModules, Codegen, Hermes — cold.",
      "Performance profiling: find and fix re-renders, run animations on the UI thread (Reanimated).",
      "Accessibility, and the release path (EAS Build, OTA, runtimeVersion).",
    ],
    drillHtml:
      'Filter flashcards to <b>Mid</b> and the <b>React Patterns</b>, <b>Native UI</b>, and <b>Expo &amp; Tooling</b> categories. Work study topics <a href="/study#st-3">03</a>–<a href="/study#st-10">10</a> and <a href="/study#st-13">13</a>–<a href="/study#st-15">15</a>.',
  },
  {
    level: "senior",
    summary:
      "You bring architecture, performance, native, and security depth, and you raise the team around you. The goal is to be the person who profiles instead of guessing and isn't afraid of the native side.",
    can: [
      "Explain the New Architecture and the threading model cold.",
      "Profile and fix jank, memory leaks, and slow startup (TTI) with real instruments.",
      "Write or patch native modules and integrate unwrapped SDKs.",
      "Reason about security in threat-model buckets (Keychain/Keystore, pinning, MASVS, attestation).",
      "Own releases, OTA, and release health, and mentor through reviews.",
    ],
    next: [
      "System design at scale: CRDDS, the 4-layer architecture, offline-first, real-time.",
      "Migration & upgrade strategy (brownfield, rn-diff-purge) and observability/SLOs.",
      "Platform and tooling decisions, and multiplying a team via shared packages.",
    ],
    drillHtml:
      'Filter flashcards to <b>Senior</b> and the <b>Performance</b>, <b>Native iOS/Android</b>, <b>Security</b>, and <b>Releases</b> categories. Read study topics <a href="/study#st-2">02</a>, <a href="/study#st-11">11</a>, <a href="/study#st-16">16</a>–<a href="/study#st-31">31</a>, and the full <a href="/architecture">Architecture guide</a>.',
  },
  {
    level: "architect",
    summary:
      "You design mobile systems end to end and make platform decisions that move a whole team. The goal is decision-making before code — for the worst phone, worst network, and worst moment.",
    can: [
      "Design a mobile system end to end and justify the architecture, state, navigation, and data strategy.",
      "Plan incremental migrations and version upgrades with bounded risk.",
      "Stand up build/release infrastructure, CI/CD, and production observability.",
      "Define the security posture and the testing strategy across the org.",
      "Multiply a team through shared packages, conventions, and code review.",
    ],
    next: [
      "Org-level platform strategy and cross-platform reach (web, desktop, brownfield hosts).",
      "Build infrastructure at scale, cost/perf budgets, and evaluating emerging tech.",
    ],
    drillHtml:
      'Filter flashcards to <b>Architect</b> and the <b>Architecture</b> category. Work the <a href="/architecture">Architecture guide + Deep dives</a> and study topics <a href="/study#st-6">06</a>, <a href="/study#st-24">24</a>, <a href="/study#st-26">26</a>, <a href="/study#st-27">27</a>, <a href="/study#st-29">29</a>, <a href="/study#st-30">30</a>.',
  },
  {
    level: "beyond",
    summary:
      "The frontier — where you push what a React Native app can do. The goal is to bring genuinely new capability on-device and pioneer patterns the rest of the team will adopt.",
    can: [
      "Run AI models on-device with react-native-executorch / react-native-ai and reason about the privacy/cost/latency trade-off.",
      "Bring web-only capability into native incrementally with DOM components.",
      "Push the platform: new internals, WebGPU, and deep native interop.",
    ],
    next: [
      "Contribute upstream, prototype with new RN/Expo internals, and set the team's direction on emerging tech.",
    ],
    drillHtml:
      'Filter flashcards to <b>Beyond</b> and the <b>On-Device AI</b> category, and read study topic <a href="/study#st-28">28</a>.',
  },
];
