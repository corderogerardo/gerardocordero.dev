// Content migrated from the original single-file study guide. These typed modules are now the source of truth — edit directly.
export type ChecklistItem = { id: string; label: string };
export type ChecklistGroup = { title: string; items: ChecklistItem[] };

export const PROGRESS_INTRO = "A checklist across every requirement in the job description plus your study topics. Tick items as you feel solid on them — progress is saved in this browser.";

export const CHECKLIST_GROUPS: ChecklistGroup[] = [
  {
    "title": "🎥 Pitches recorded & reviewed",
    "items": [
      {
        "id": "p-01",
        "label": "01 · 30-second intro"
      },
      {
        "id": "p-02",
        "label": "02 · 60-second intro"
      },
      {
        "id": "p-03",
        "label": "03 · 2-minute career story"
      },
      {
        "id": "p-04",
        "label": "04 · Why React Native"
      },
      {
        "id": "p-05",
        "label": "05 · Why this company"
      },
      {
        "id": "p-06",
        "label": "06 · Valt Connect deep-dive"
      },
      {
        "id": "p-07",
        "label": "07 · STAR · performance bug"
      },
      {
        "id": "p-08",
        "label": "08 · STAR · ownership"
      },
      {
        "id": "p-09",
        "label": "09 · STAR · adaptability"
      },
      {
        "id": "p-10",
        "label": "10 · Closing + questions to ask"
      }
    ]
  },
  {
    "title": "⚙️ Technical mastery — JD essentials",
    "items": [
      {
        "id": "t-ts",
        "label": "Can speak fluently to commercial TypeScript patterns"
      },
      {
        "id": "t-newarch",
        "label": "Explain the New Architecture (Fabric, TurboModules, JSI, Codegen, Hermes) cold"
      },
      {
        "id": "t-render",
        "label": "Explain rendering, re-renders & lifecycle, and how to optimize"
      },
      {
        "id": "t-zustand",
        "label": "Zustand: store + selectors + shallow equality"
      },
      {
        "id": "t-mobx",
        "label": "MobX: observable / observer / action / computed (gap-closer)"
      },
      {
        "id": "t-server",
        "label": "Server state vs client state (React Query/SWR vs store)"
      },
      {
        "id": "t-graphql",
        "label": "GraphQL fetching + normalized vs query-key caching (gap-closer)"
      },
      {
        "id": "t-native",
        "label": "Native story: SDK integration, module patches, build config (gap-closer)"
      },
      {
        "id": "t-test",
        "label": "Testing pyramid: Jest, RNTL, Maestro/Detox, CI-gated E2E"
      },
      {
        "id": "t-cicd",
        "label": "CI/CD, store releases, OTA limits, third-party SDKs"
      },
      {
        "id": "t-refactor",
        "label": "Refactoring, tech debt & crash-rate reduction approach"
      },
      {
        "id": "t-experiment",
        "label": "Experiment-driven dev: A/B tests, feature flags, analytics"
      },
      {
        "id": "t-debug",
        "label": "Systematic debugging & profiling toolbelt"
      }
    ]
  },
  {
    "title": "🏛 Architecture guide topics",
    "items": [
      {
        "id": "a-crdds",
        "label": "CRDDS interview framework"
      },
      {
        "id": "a-layers",
        "label": "4-layer architecture & patterns"
      },
      {
        "id": "a-net",
        "label": "Networking layer & pagination"
      },
      {
        "id": "a-cache",
        "label": "Storage & caching (LRU/TTL, invalidation, SWR)"
      },
      {
        "id": "a-offline",
        "label": "Offline-first (optimistic, sync queue, conflicts)"
      },
      {
        "id": "a-realtime",
        "label": "Real-time (WebSocket / SSE / polling / push)"
      },
      {
        "id": "a-perf",
        "label": "Performance essentials"
      },
      {
        "id": "a-sec",
        "label": "Security basics (pinning, Keychain/Keystore, OAuth/PKCE)"
      }
    ]
  },
  {
    "title": "🗣 Behavioral & English readiness",
    "items": [
      {
        "id": "b-star",
        "label": "3 STAR stories rehearsed out loud (performance, ownership, adaptability)"
      },
      {
        "id": "b-qa",
        "label": "All Q&A flashcards graded “Known”"
      },
      {
        "id": "b-eng",
        "label": "Practiced the tricky words (biometric, authentication, Twilio, Hermes, Fabric)"
      },
      {
        "id": "b-pace",
        "label": "Comfortable pausing & pacing — not rushing in English"
      },
      {
        "id": "b-ask",
        "label": "Have 3–4 sharp questions ready to ask them"
      }
    ]
  },
  {
    "title": "✅ Final checks before the call",
    "items": [
      {
        "id": "f-logistics",
        "label": "Ready to confirm logistics: hours, remote, time-zone overlap"
      },
      {
        "id": "f-company",
        "label": "Researched the company's product, values & the team you'd join"
      },
      {
        "id": "f-setup",
        "label": "Camera, mic, lighting & quiet space tested"
      },
      {
        "id": "f-cv",
        "label": "CV open and reviewed; can speak to every line"
      }
    ]
  },
  {
    "title": "📱 Optimization & On-Device AI mastery",
    "items": [
      {
        "id": "o-tti",
        "label": "TTI & cold start (Hermes, lazy imports, InteractionManager)"
      },
      {
        "id": "o-render",
        "label": "Re-render discipline (memo, stable refs, store selectors)"
      },
      {
        "id": "o-lists",
        "label": "Lists at scale (FlashList vs FlatList, stable keys, getItemLayout)"
      },
      {
        "id": "o-leak",
        "label": "Memory-leak sources & useEffect cleanup"
      },
      {
        "id": "o-bundle",
        "label": "Bundle size & tree-shaking (R8/Proguard)"
      },
      {
        "id": "o-anim",
        "label": "UI-thread animations (Reanimated / useNativeDriver)"
      },
      {
        "id": "o-newarch",
        "label": "New Architecture: JSI, Fabric, TurboModules"
      },
      {
        "id": "o-profile",
        "label": "Profiling-first methodology"
      },
      {
        "id": "o-ai-why",
        "label": "On-device inference: why (privacy / offline / cost)"
      },
      {
        "id": "o-ai-setup",
        "label": "On-device AI: New Arch + init + Expo dev build"
      },
      {
        "id": "o-ai-mem",
        "label": "Model sizing, quantization & LLM crash-safety"
      },
      {
        "id": "o-quiz",
        "label": "Score 90%+ on the Quiz tab"
      }
    ]
  }
];
