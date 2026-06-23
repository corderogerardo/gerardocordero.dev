// Batch 4 — shipping & releases (EAS Build/Submit/Update, OTA, release health),
// native module authoring (Expo Modules API), migrations/upgrades (Callstack
// brownfield + rn-diff-purge), and Reanimated/NativeTabs polish.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

/** New flashcard category this batch adds (native/arch/expo already exist). */
export const ADVANCED4_FLASHCARD_FILTERS: { value: string; label: string }[] = [
  { value: "release", label: "Releases & CI/CD" },
];

export const ADVANCED4_FLASHCARDS: Flashcard[] = [
  // ---------- Releases & CI/CD (release) ----------
  {
    id: "r-1",
    category: "release",
    categoryLabel: "RELEASE",
    question: "How do you build and submit an Expo app to the stores with EAS?",
    answerHtml:
      "Install <code>eas-cli</code>, <code>eas login</code>, then <code>eas init</code> creates <code>eas.json</code> with build <b>profiles</b>. Build + submit in one go: <code>eas build -p ios --profile production --submit</code> (and <code>-p android</code>). EAS builds in the cloud and uploads to App Store Connect / Play.",
  },
  {
    id: "r-2",
    category: "release",
    categoryLabel: "RELEASE",
    question: "What can — and can't — an EAS Update (OTA) ship?",
    answerHtml:
      "OTA ships <b>JS + assets</b> over the air, skipping store review. It <b>cannot</b> change native code, native config, or native deps — those need a new store build. So a new native module or permission means a rebuild, not an update.",
  },
  {
    id: "r-3",
    category: "release",
    categoryLabel: "RELEASE",
    question: "What gates whether an OTA update is compatible with an installed build?",
    answerHtml:
      "The <b><code>runtimeVersion</code></b>. An update only reaches builds with a matching runtime version — that's how you avoid shipping JS that calls native code the installed binary doesn't have. Bump the runtime version whenever the native layer changes.",
  },
  {
    id: "r-4",
    category: "release",
    categoryLabel: "RELEASE",
    question: "What do channels and branches do in EAS Update?",
    answerHtml:
      "A <b>branch</b> is a line of updates; a <b>channel</b> (e.g. <code>production</code>) is what a build subscribes to and maps to a branch. You point a build at a channel, publish to a branch, and <b>promote</b> updates between channels (staging → production) for staged rollout.",
  },
  {
    id: "r-5",
    category: "release",
    categoryLabel: "RELEASE",
    question: "How do you tell if a rollout is healthy?",
    answerHtml:
      "Watch <b>release health</b>: failed-launch / crash rate, unique users, and the <b>embedded-vs-OTA</b> user split per channel — via <code>eas update:insights</code> / <code>channel:insights</code> (same data as expo.dev). Gate or roll back the rollout if the crash rate spikes vs the prior version.",
  },
  {
    id: "r-6",
    category: "release",
    categoryLabel: "RELEASE",
    question: "How is an Expo app versioned across layers?",
    answerHtml:
      "The marketing <b>version</b> lives in <code>app.json</code> (<code>expo.version</code>); the native <b>build number</b> (iOS <code>buildNumber</code> / Android <code>versionCode</code>) is owned by EAS remotely with <code>autoIncrement</code>. A git tag mirrors the version, and <code>runtimeVersion</code> governs OTA compatibility.",
  },
  {
    id: "r-7",
    category: "release",
    categoryLabel: "RELEASE",
    question: "What's the idiomatic CI/CD for an Expo app?",
    answerHtml:
      "<b>EAS Workflows</b> — pipelines defined as YAML in <code>.eas/workflows/</code> that run build / submit / update / e2e on Expo infra (triggered by PRs or pushes) — often alongside a <b>GitHub Actions</b> lint/typecheck/test gate. The classic split: PR previews + an e2e gate, then a manual production deploy.",
  },

  // ---------- Native module authoring (native) ----------
  {
    id: "nm-1",
    category: "native",
    categoryLabel: "NATIVE",
    question: "What's the Expo Modules API DSL, and how do sync vs async functions differ?",
    answerHtml:
      "A declarative Swift/Kotlin DSL: <code>Name</code>, <code>Constant</code>, <code>Function</code>, <code>AsyncFunction</code>, <code>Property</code>, <code>Events</code>, <code>View</code>, <code>SharedObject</code>. <b><code>Function</code></b> is synchronous — it <b>blocks the JS thread</b> (≤ 8 args). <b><code>AsyncFunction</code></b> returns a Promise and runs on a <b>background thread</b> by default (<code>.runOnQueue(.main)</code> for UI; Kotlin uses coroutines).",
  },
  {
    id: "nm-2",
    category: "native",
    categoryLabel: "NATIVE",
    question: "How do you scaffold a native module, and what are config plugins for?",
    answerHtml:
      "Use <code>create-expo-module</code> (local for one app, standalone for reuse/publishing) — it sets up <code>expo-module.config.json</code>, podspec/Gradle, TS bindings, and an example app. <b>Config plugins</b> programmatically edit native project files (Info.plist, AndroidManifest) at prebuild so native setup stays in your JS config.",
  },
  {
    id: "nm-3",
    category: "native",
    categoryLabel: "NATIVE",
    question: "Expo Modules API vs TurboModules — when would you reach for which?",
    answerHtml:
      "<b>TurboModules</b> are RN core's codegen path (typed JSI spec → native). The <b>Expo Modules API</b> is a higher-level Swift/Kotlin DSL with autolinking, lifecycle hooks, config plugins, and native <code>View</code> support — ideal for app-specific native code and wrapping SDKs in an Expo app. Both run on JSI under the New Architecture.",
  },

  // ---------- Migrations & upgrades (arch) ----------
  {
    id: "m-1",
    category: "arch",
    categoryLabel: "ARCH",
    question: "How do you migrate an existing native app to React Native incrementally?",
    answerHtml:
      "Brownfield adoption with <b><code>@callstack/react-native-brownfield</code></b>: package the RN app as an <b>XCFramework</b> (iOS) / <b>AAR</b> (Android), embed it, and integrate <b>one RN surface</b> (screen) into the host — then repeat feature by feature. Use a <b>facade</b> so the host stays isolated from direct RN APIs. Strangle the legacy app screen-by-screen, never big-bang.",
  },
  {
    id: "m-2",
    category: "arch",
    categoryLabel: "ARCH",
    question: "What's the canonical React Native upgrade workflow?",
    answerHtml:
      "Use the <b>Upgrade Helper</b> / <code>rn-diff-purge</code> template diff between your versions (e.g. <code>0.76.9..0.78.2</code>), apply the native iOS/Android changes, update dependencies, align React (and the Expo SDK if used), then <code>pod install</code> and confirm <b>both platforms build</b>. Go one or two minors at a time, not a giant leap.",
  },
  {
    id: "m-3",
    category: "arch",
    categoryLabel: "ARCH",
    question: "Why prefer incremental migration over a big-bang rewrite?",
    answerHtml:
      "A rewrite freezes feature work and risks a never-shipping mega-PR. Incremental adoption keeps the app shippable: each migrated screen is validated for startup/runtime in isolation, risk is bounded per surface, and you can stop or reprioritize anytime. It's the senior, lower-risk path.",
  },

  // ---------- Motion & native chrome (expo) ----------
  {
    id: "ea-1",
    category: "expo",
    categoryLabel: "EXPO",
    question: "How do you add declarative enter/exit/reorder animations in Reanimated v4?",
    answerHtml:
      "Use the <code>entering</code>, <code>exiting</code>, and <code>layout</code> props on <code>Animated.View</code>: <code>entering={FadeIn}</code>, <code>exiting={FadeOut}</code>, <code>layout={LinearTransition}</code>. They animate mount, unmount, and list reorders on the UI thread — no manual <code>Animated.timing</code> wiring.",
  },
  {
    id: "ea-2",
    category: "expo",
    categoryLabel: "EXPO",
    question: "How do you build a smooth scroll-driven animation (e.g. a fading header)?",
    answerHtml:
      "Keep it on the UI thread: <code>const ref = useAnimatedRef(); const scroll = useScrollViewOffset(ref);</code> then map it in <code>useAnimatedStyle</code> with <code>interpolate(scroll.value, [0, 30], [0, 1], 'clamp')</code>, on an <code>Animated.ScrollView</code>. No JS-thread <code>onScroll</code> round-trips.",
  },
  {
    id: "ea-3",
    category: "expo",
    categoryLabel: "EXPO",
    question: "What do NativeTabs give you beyond JS bottom-tabs?",
    answerHtml:
      "The <b>real platform tab bar</b> (from <code>expo-router/unstable-native-tabs</code>) with native feel: per-trigger <code>Icon</code> (<code>sf:</code> for SF Symbols, <code>md:</code> for Material), <code>Label</code>, <code>Badge</code>, a <code>role=&quot;search&quot;</code> tab, and behaviors like <code>minimizeBehavior=&quot;onScrollDown&quot;</code>.",
  },
];

/** New quiz category this batch adds. */
export const ADVANCED4_QUIZ_FILTERS: { value: string; label: string }[] = [
  { value: "release", label: "Releases" },
];

export const ADVANCED4_QUIZ: QuizQuestion[] = [
  {
    id: "b4-z1",
    category: "release",
    categoryLabel: "Releases",
    question: "An EAS Update (OTA) can ship…",
    options: [
      "Any change, including native code",
      "JS and assets only — not native code",
      "Only iOS changes",
      "Only new native modules",
    ],
    answer: 1,
    explanationHtml:
      "OTA delivers JS + assets and skips store review, but native code/config/deps require a new store build.",
  },
  {
    id: "b4-z2",
    category: "release",
    categoryLabel: "Releases",
    question: "What gates whether an OTA update is compatible with an installed build?",
    options: [
      "The marketing app version",
      "The runtimeVersion",
      "The channel name",
      "The git tag",
    ],
    answer: 1,
    explanationHtml:
      "An update only lands on builds with a matching <code>runtimeVersion</code>, preventing JS from calling native code the binary lacks.",
  },
  {
    id: "b4-z3",
    category: "release",
    categoryLabel: "Releases",
    question: "How do you assess whether a rollout is healthy?",
    options: [
      "Read App Store reviews",
      "eas update:insights — crash rate, users, embedded-vs-OTA split",
      "Restart the app a few times",
      "Check the build logs",
    ],
    answer: 1,
    explanationHtml:
      "<code>eas update:insights</code> / <code>channel:insights</code> expose failed-launch/crash rate, unique users, and the embedded-vs-OTA split so you can gate or roll back.",
  },
  {
    id: "b4-z4",
    category: "native",
    categoryLabel: "Native",
    question: "In the Expo Modules API, an AsyncFunction…",
    options: [
      "Runs synchronously on the JS thread",
      "Returns a Promise and runs on a background thread",
      "Always runs on the UI/main thread",
      "Is only for constants",
    ],
    answer: 1,
    explanationHtml:
      "<code>AsyncFunction</code> returns a Promise and runs off the JS thread by default; <code>Function</code> is the synchronous one that blocks JS.",
  },
  {
    id: "b4-z5",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Callstack's brownfield approach packages the RN app as…",
    options: [
      "A full native rewrite",
      "XCFramework (iOS) / AAR (Android) embedded in the host",
      "A WebView",
      "A published npm package only",
    ],
    answer: 1,
    explanationHtml:
      "<code>@callstack/react-native-brownfield</code> ships RN as an XCFramework/AAR you embed and integrate one surface at a time, behind a facade.",
  },
  {
    id: "b4-z6",
    category: "arch",
    categoryLabel: "Architecture",
    question: "The canonical React Native upgrade diff comes from…",
    options: [
      "npm audit",
      "the Upgrade Helper / rn-diff-purge",
      "pod outdated",
      "git bisect",
    ],
    answer: 1,
    explanationHtml:
      "The Upgrade Helper (rn-diff-purge) gives the template diff between two RN versions for the native iOS/Android changes.",
  },
  {
    id: "b4-z7",
    category: "expo",
    categoryLabel: "Expo",
    question: "Declarative enter/exit animations in Reanimated v4 use…",
    options: [
      "Animated.timing().start()",
      "entering / exiting / layout props on Animated.View",
      "the legacy LayoutAnimation API",
      "CSS transitions",
    ],
    answer: 1,
    explanationHtml:
      "<code>entering={FadeIn}</code>, <code>exiting={FadeOut}</code>, and <code>layout={LinearTransition}</code> animate mount/unmount/reorder on the UI thread.",
  },
  {
    id: "b4-z8",
    category: "release",
    categoryLabel: "Releases",
    question: "Which is owned by EAS remotely with autoIncrement?",
    options: [
      "expo.version (marketing version)",
      "The native build number (iOS buildNumber / Android versionCode)",
      "The runtimeVersion",
      "The channel",
    ],
    answer: 1,
    explanationHtml:
      "EAS owns the monotonic native build number remotely (<code>autoIncrement</code>); the marketing version lives in <code>app.json</code>.",
  },
];

/** New study sessions for batch 4. */
export const ADVANCED4_STUDY: StudySection[] = [
  {
    id: "st-29",
    num: "29",
    title: "29 · Shipping: EAS builds, store releases & OTA",
    html: `<p><b>Core:</b> own the path to production. <b>EAS Build</b> compiles in the cloud from <code>eas.json</code> profiles; <b>EAS Submit</b> uploads to App Store Connect / Play (<code>eas build --profile production --submit</code>). For JS-only fixes, <b>EAS Update</b> ships <b>OTA</b> — but it can't touch native code, so a new module/permission means a rebuild.</p>
      <ul>
        <li><b>Compatibility</b>: <code>runtimeVersion</code> gates which builds an update reaches; <b>channels</b> map to <b>branches</b>, and you promote updates staging → production.</li>
        <li><b>Versioning</b>: marketing <code>expo.version</code> (app.json) vs the native build number owned by EAS (<code>autoIncrement</code>).</li>
        <li><b>Release health</b>: crash/failed-launch rate, unique users, embedded-vs-OTA split via <code>eas update:insights</code> — gate or roll back on a spike.</li>
        <li><b>CI/CD</b>: EAS Workflows (YAML in <code>.eas/workflows/</code>) for build/submit/update/e2e, alongside a GitHub Actions lint/typecheck/test gate.</li>
      </ul>
      <div class="callout tip"><span class="lbl">New concept</span> A deploy isn't &ldquo;done&rdquo; at submit — it's done when the <b>crash-free rate holds</b> across the rollout. Treat monitoring as part of shipping.</div>
      <div class="map"><span class="lbl">Your proof</span> You <b>owned production releases and App Store review responses</b> on Valt and used <b>EAS, GitHub Actions, and App Center</b> — this is a clear strength; lead with it.</div>`,
  },
  {
    id: "st-30",
    num: "30",
    title: "30 · Native modules & migrations",
    html: `<p><b>Core:</b> two senior capabilities below the JS line. <b>Authoring native modules</b>: the <b>Expo Modules API</b> is a Swift/Kotlin DSL (<code>Name</code>, <code>Function</code>, <code>AsyncFunction</code>, <code>View</code>, <code>SharedObject</code>, <code>Events</code>) with autolinking, lifecycle hooks, and <b>config plugins</b> that edit Info.plist / AndroidManifest at prebuild. Scaffold with <code>create-expo-module</code>; <code>AsyncFunction</code> runs off the JS thread.</p>
      <ul>
        <li><b>Module choice</b>: Expo Modules API for app-specific native code &amp; SDK wrappers; <b>TurboModules</b> are RN core's codegen path — both on JSI.</li>
        <li><b>Brownfield migration</b>: <code>@callstack/react-native-brownfield</code> — package RN as <b>XCFramework / AAR</b>, integrate one surface, repeat per feature, behind a <b>facade</b>.</li>
        <li><b>RN upgrades</b>: the <b>Upgrade Helper</b> / <code>rn-diff-purge</code> template diff, one or two minors at a time, both platforms must build.</li>
      </ul>
      <div class="callout tip"><span class="lbl">New concept</span> <b>Incremental over big-bang.</b> Whether adopting RN or upgrading it, ship in bounded, validated steps — never a frozen mega-PR.</div>
      <div class="map"><span class="lbl">Your proof</span> You wrote <b>PSPDFKit native patches</b> and permission hooks, drove <b>RN 0.59 → 0.62</b> upgrades, and built shared packages in a <b>Turborepo</b> — module authoring and incremental migration are already your lived experience.</div>`,
  },
  {
    id: "st-31",
    num: "31",
    title: "31 · Motion & native navigation polish",
    html: `<p><b>Core:</b> a native-feeling app combines <b>native motion</b> and <b>native chrome</b>. Use Reanimated v4's declarative animations — <code>entering</code> / <code>exiting</code> / <code>layout</code> on <code>Animated.View</code> for mount/unmount/reorder, and scroll-driven effects via <code>useScrollViewOffset</code> + <code>interpolate</code> — all on the UI thread.</p>
      <ul>
        <li><b>Native tabs</b>: <code>NativeTabs</code> with per-trigger <code>Icon</code> (<code>sf:</code>/<code>md:</code>), <code>Label</code>, <code>Badge</code>, a <code>role=&quot;search&quot;</code> tab, and <code>minimizeBehavior</code>.</li>
        <li><b>Native navigation</b>: <code>Link.Preview</code> + context menus, <code>presentation: 'modal' | 'formSheet'</code>, large titles — lean on the platform, don't re-implement it.</li>
        <li>Animate <b>transform/opacity</b> only; keep gesture/scroll state in shared values.</li>
      </ul>
      <div class="callout tip"><span class="lbl">New concept</span> <b>Native motion + native chrome = native feel.</b> The details (tab minimize, peek previews, sheet detents, layout animations) are what make an RN app read as first-class.</div>
      <div class="map"><span class="lbl">Your proof</span> You eliminated <b>re-render flicker</b> (UI-thread thinking) and owned <b>deep-link navigation</b> on Valt — native motion and native nav are exactly your strengths, now with the current APIs to name.</div>`,
  },
];
