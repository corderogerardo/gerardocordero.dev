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
      "EAS moves build and submit off your laptop onto reproducible cloud infra — no more &ldquo;works on my machine&rdquo; Xcode/Gradle drift, and it's scriptable from CI. Mechanically: install <code>eas-cli</code>, <code>eas login</code>, then <code>eas init</code> creates <code>eas.json</code> with build <b>profiles</b>. Build + submit in one go: <code>eas build -p ios --profile production --submit</code> (and <code>-p android</code>). <b>I use EAS so releases are reproducible and CI-triggerable, not tied to one engineer's laptop.</b>",
  },
  {
    id: "r-2",
    category: "release",
    categoryLabel: "RELEASE",
    question: "What can — and can't — an EAS Update (OTA) ship?",
    answerHtml:
      "OTA exists to fix JS bugs in minutes without waiting on App Store / Play review — the point is bypassing review for JS, never for native behavior. Mechanically: it ships <b>JS + assets</b> over the air. It <b>cannot</b> change native code, native config, or native deps — those need a new store build, so a new native module or permission means a rebuild, not an update. <b>Red flag:</b> shipping a native-behavior change via OTA to dodge review — both stores can reject or pull updates that change functionality outside the reviewed binary. <b>I use OTA for JS-only fixes and route anything touching native code through a proper store build.</b>",
  },
  {
    id: "r-3",
    category: "release",
    categoryLabel: "RELEASE",
    question: "What gates whether an OTA update is compatible with an installed build?",
    answerHtml:
      "<code>runtimeVersion</code> exists so an OTA can't silently crash an installed build by calling native APIs it doesn't have — it's the compatibility contract between JS and native. Mechanically: an update only reaches builds with a <b>matching runtime version</b>; bump it whenever the native layer changes. <b>Red flag:</b> forgetting to bump <code>runtimeVersion</code> after adding a native module — old builds silently receive JS that calls native code they don't have, causing runtime crashes. <b>I bump runtimeVersion on any native change so an OTA update can never target an incompatible binary.</b>",
  },
  {
    id: "r-4",
    category: "release",
    categoryLabel: "RELEASE",
    question: "What do channels and branches do in EAS Update?",
    answerHtml:
      "Channels and branches decouple <b>where a build points</b> from <b>what code ships</b>, so you can stage a rollout without rebuilding the app. Mechanically: a <b>branch</b> is a line of updates; a <b>channel</b> (e.g. <code>production</code>) is what a build subscribes to and maps to a branch. You point a build at a channel, publish to a branch, and <b>promote</b> updates between channels (staging → production) for staged rollout. <b>I publish to a staging branch first and promote to production only after verifying release health.</b>",
  },
  {
    id: "r-5",
    category: "release",
    categoryLabel: "RELEASE",
    question: "How do you tell if a rollout is healthy?",
    answerHtml:
      "Rollout health is a monitoring problem, not a one-time check — a bad OTA regresses crash-free rate for every user on that channel instantly. 1. <b>Watch</b> failed-launch / crash rate, unique users, and the <b>embedded-vs-OTA</b> split per channel via <code>eas update:insights</code> / <code>channel:insights</code> (same data as expo.dev). 2. <b>Compare</b> against the prior version's baseline, not an absolute number. 3. <b>Gate or roll back</b> the moment crash rate spikes — don't wait for support tickets. <b>I treat release health monitoring as part of shipping, not an afterthought after submit.</b>",
  },
  {
    id: "r-6",
    category: "release",
    categoryLabel: "RELEASE",
    question: "How is an Expo app versioned across layers?",
    answerHtml:
      "Splitting version concerns avoids two engineers racing to bump the same build number across parallel branches. Mechanically: the marketing <b>version</b> lives in <code>app.json</code> (<code>expo.version</code>); the native <b>build number</b> (iOS <code>buildNumber</code> / Android <code>versionCode</code>) is owned by EAS remotely with <code>autoIncrement</code>, monotonic across builds. A git tag mirrors the version, and <code>runtimeVersion</code> governs OTA compatibility. <b>I let EAS own the build number so it's always monotonic, and keep the marketing version as the one human-facing source of truth.</b>",
  },
  {
    id: "r-7",
    category: "release",
    categoryLabel: "RELEASE",
    question: "What's the idiomatic CI/CD for an Expo app?",
    answerHtml:
      "The split exists because build/submit/e2e need mobile-specific infra (simulators, signing, app-store APIs) that a generic CI runner doesn't have. Mechanically: <b>EAS Workflows</b> — YAML in <code>.eas/workflows/</code> — run build / submit / update / e2e on Expo's mobile-aware infra (triggered by PRs or pushes), alongside a <b>GitHub Actions</b> lint/typecheck/test gate for the fast, cheap checks. The classic split: PR previews + an e2e gate, then a manual production deploy. <b>I keep fast feedback — lint/type/test — on GitHub Actions and push anything mobile-specific to EAS Workflows.</b>",
  },

  // ---------- Native module authoring (native) ----------
  {
    id: "nm-1",
    category: "native",
    categoryLabel: "NATIVE",
    question: "What's the Expo Modules API DSL, and how do sync vs async functions differ?",
    answerHtml:
      "The sync/async split exists because any JS-thread-blocking native call stalls every gesture and re-render happening on that thread, so the DSL forces a deliberate choice. Mechanically: it's a declarative Swift/Kotlin DSL — <code>Name</code>, <code>Constant</code>, <code>Function</code>, <code>AsyncFunction</code>, <code>Property</code>, <code>Events</code>, <code>View</code>, <code>SharedObject</code>. <b><code>Function</code></b> is synchronous — it <b>blocks the JS thread</b> (≤ 8 args). <b><code>AsyncFunction</code></b> returns a Promise and runs on a <b>background thread</b> by default (<code>.runOnQueue(.main)</code> for UI; Kotlin uses coroutines). <b>Red flag:</b> using a synchronous <code>Function</code> for anything slower than a trivial lookup — it blocks the JS thread and every gesture/render on it. <b>I default to AsyncFunction for anything touching disk, network, or non-trivial compute.</b>",
  },
  {
    id: "nm-2",
    category: "native",
    categoryLabel: "NATIVE",
    question: "How do you scaffold a native module, and what are config plugins for?",
    answerHtml:
      "Config plugins exist so native project setup survives a prebuild wipe — without them, every <code>expo prebuild</code> regenerates <code>ios/</code>/<code>android/</code> from scratch and silently drops hand-edited native config. Mechanically: scaffold with <code>create-expo-module</code> (local for one app, standalone for reuse/publishing) — it sets up <code>expo-module.config.json</code>, podspec/Gradle, TS bindings, and an example app. <b>Config plugins</b> programmatically edit native project files (Info.plist, AndroidManifest) at prebuild so native setup stays declared in JS, not hand-patched in native folders. <b>I keep native config in a plugin, never hand-edited in ios/android, so a clean prebuild never loses it.</b>",
  },
  {
    id: "nm-3",
    category: "native",
    categoryLabel: "NATIVE",
    question: "Expo Modules API vs TurboModules — when would you reach for which?",
    answerHtml:
      "The choice comes down to who owns the code: a library meant for the whole RN ecosystem should speak RN core's contract; app-specific glue shouldn't pay that ceremony. <b>TurboModules</b> are RN core's codegen path (typed JSI spec → native) — the right target for a cross-framework RN library. The <b>Expo Modules API</b> is a higher-level Swift/Kotlin DSL with autolinking, lifecycle hooks, config plugins, and native <code>View</code> support — ideal for app-specific native code and wrapping SDKs in an Expo app. Both run on JSI under the New Architecture. <b>I reach for the Expo Modules API for app-specific native code and TurboModules only when I need a spec-typed module consumable outside Expo.</b>",
  },

  // ---------- Migrations & upgrades (arch) ----------
  {
    id: "m-1",
    category: "arch",
    categoryLabel: "ARCH",
    question: "How do you migrate an existing native app to React Native incrementally?",
    answerHtml:
      "Brownfield adoption exists so a legacy native app can gain RN screens without a stop-the-world rewrite that freezes feature work. Framework: 1. <b>Package</b> the RN app as an <b>XCFramework</b> (iOS) / <b>AAR</b> (Android) with <code>@callstack/react-native-brownfield</code>. 2. <b>Embed</b> it in the host app. 3. <b>Integrate one RN surface</b> — a single screen — behind a <b>facade</b>, so the host never calls RN APIs directly. 4. <b>Repeat</b> screen by screen, validating each in isolation before moving on. <b>Red flag:</b> integrating RN directly into the host without a facade — every future RN API change then ripples through native call sites. <b>I strangle the legacy app screen by screen behind a facade, never big-bang.</b>",
  },
  {
    id: "m-2",
    category: "arch",
    categoryLabel: "ARCH",
    question: "What's the canonical React Native upgrade workflow?",
    answerHtml:
      "Upgrades fail when native and JS drift out of lockstep — the workflow exists to apply that drift as a reviewable diff instead of guessing. Framework: 1. <b>Diff</b> your two versions (e.g. <code>0.76.9..0.78.2</code>) via the <b>Upgrade Helper</b> / <code>rn-diff-purge</code>. 2. <b>Apply</b> the native iOS/Android changes from that diff. 3. <b>Update dependencies</b> and align React (and the Expo SDK, if used) to the target versions. 4. <b>Rebuild</b> — <code>pod install</code>, then confirm <b>both platforms build</b> before touching app code. <b>Red flag:</b> jumping several minors at once — the diff balloons and you can't isolate which native change broke the build. <b>I upgrade one or two minors at a time so a broken build points at a small, reviewable diff.</b>",
  },
  {
    id: "m-3",
    category: "arch",
    categoryLabel: "ARCH",
    question: "Why prefer incremental migration over a big-bang rewrite?",
    answerHtml:
      "Incremental migration means running two native stacks side by side for longer and paying facade/bridge overhead the whole time — that's a real cost. The alternative, a big-bang rewrite, freezes feature work for the whole migration and risks a mega-PR that never lands cleanly — ship it broken and there's no fallback. Treat incremental as the investment: each migrated screen is validated for startup/runtime in isolation, risk is bounded per surface, and you can stop or reprioritize anytime without an all-or-nothing bet. <b>Red flag:</b> pitching a full rewrite as the fix for legacy pain — it sounds decisive but is usually the higher-risk, slower path. <b>I'd choose incremental migration because it keeps the app shippable throughout, even though it means carrying bridge overhead until the last screen lands.</b>",
  },

  // ---------- Motion & native chrome (expo) ----------
  {
    id: "ea-1",
    category: "expo",
    categoryLabel: "EXPO",
    question: "How do you add declarative enter/exit/reorder animations in Reanimated v4?",
    answerHtml:
      "Declarative layout animations exist so mount/unmount/reorder transitions run on the UI thread without hand-wired <code>Animated.timing</code> callbacks that can drop frames under JS-thread load. Mechanically: use the <code>entering</code>, <code>exiting</code>, and <code>layout</code> props on <code>Animated.View</code> — <code>entering={FadeIn}</code>, <code>exiting={FadeOut}</code>, <code>layout={LinearTransition}</code>. <b>I reach for entering/exiting/layout props over manual Animated.timing so list and screen transitions stay smooth even when the JS thread is busy.</b>",
  },
  {
    id: "ea-2",
    category: "expo",
    categoryLabel: "EXPO",
    question: "How do you build a smooth scroll-driven animation (e.g. a fading header)?",
    answerHtml:
      "A scroll-driven effect that round-trips through the JS thread lags visibly on scroll, because JS is also busy with gesture recognition and re-renders. Mechanically: keep it on the UI thread — <code>const ref = useAnimatedRef(); const scroll = useScrollViewOffset(ref);</code> then map it in <code>useAnimatedStyle</code> with <code>interpolate(scroll.value, [0, 30], [0, 1], 'clamp')</code>, on an <code>Animated.ScrollView</code>. No JS-thread <code>onScroll</code> round-trips. <b>Red flag:</b> driving a scroll animation from a JS <code>onScroll</code> handler and component state — it visibly lags the moment the JS thread is busy. <b>I drive scroll effects with a UI-thread shared value, never JS state, so they stay smooth under load.</b>",
  },
  {
    id: "ea-3",
    category: "expo",
    categoryLabel: "EXPO",
    question: "What do NativeTabs give you beyond JS bottom-tabs?",
    answerHtml:
      "JS-rendered tab bars never quite match platform conventions — scroll-to-minimize, native badges, SF Symbols — and users notice the mismatch even if they can't name it. NativeTabs (<code>expo-router/unstable-native-tabs</code>) render the <b>real platform tab bar</b> instead: per-trigger <code>Icon</code> (<code>sf:</code> for SF Symbols, <code>md:</code> for Material), <code>Label</code>, <code>Badge</code>, a <code>role=&quot;search&quot;</code> tab, and behaviors like <code>minimizeBehavior=&quot;onScrollDown&quot;</code>. <b>I use NativeTabs when native tab-bar behavior — minimize on scroll, badges, platform icons — matters more than full JS styling control.</b>",
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
      "Option 0 is the classic misconception: OTA skips store review only for <b>JS + assets</b> — assuming it covers native code too is how teams accidentally try to ship native-behavior changes outside review, which stores can reject or pull.",
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
      "The marketing app version is a tempting wrong answer because it's the version users see most — but it has nothing to do with compatibility. Only <code>runtimeVersion</code> gates whether an update lands on a build, preventing JS from calling native code the binary lacks.",
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
      "App Store reviews are the tempting-but-lagging signal — by the time users are reviewing, the damage is done. <code>eas update:insights</code> / <code>channel:insights</code> expose failed-launch/crash rate, unique users, and the embedded-vs-OTA split in near real time, so you can gate or roll back before it shows up in reviews.",
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
      "&ldquo;Always runs on the UI/main thread&rdquo; is the misconception — <code>AsyncFunction</code> runs on a background thread by default and only moves to the main thread if you explicitly opt in (<code>.runOnQueue(.main)</code>) for UI work. <code>Function</code>, not <code>AsyncFunction</code>, is the synchronous one that blocks JS.",
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
      "&ldquo;A full native rewrite&rdquo; is the opposite of what brownfield adoption is for — it's specifically the incremental alternative to one. <code>@callstack/react-native-brownfield</code> ships RN as an XCFramework/AAR you embed and integrate one surface at a time, behind a facade.",
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
      "<code>npm audit</code> is a tempting wrong answer because it also flags version-related issues — but it checks for known vulnerabilities, not RN's native-side diff. The Upgrade Helper (rn-diff-purge) gives the template diff between two RN versions for the native iOS/Android changes.",
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
      "The legacy <code>LayoutAnimation</code> API is the tempting wrong answer for anyone who learned RN animation pre-Reanimated — it still exists but isn't the Reanimated v4 approach. <code>entering={FadeIn}</code>, <code>exiting={FadeOut}</code>, and <code>layout={LinearTransition}</code> animate mount/unmount/reorder declaratively on the UI thread.",
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
      "<code>expo.version</code> is the tempting wrong answer because it's also &ldquo;the version&rdquo; — but that's the human-facing marketing version in <code>app.json</code>. EAS owns the monotonic native build number remotely via <code>autoIncrement</code>.",
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
      <div class="callout tip"><span class="lbl">New concept</span> A deploy isn't &ldquo;done&rdquo; at submit — it's done when the <b>crash-free rate holds</b> across the rollout. Treat monitoring as part of shipping. <b>Say in an interview: &ldquo;I don't consider a release shipped until the crash-free rate holds across the rollout, not at submission.&rdquo;</b></div>
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
      <div class="callout tip"><span class="lbl">New concept</span> <b>Incremental over big-bang.</b> Whether adopting RN or upgrading it, ship in bounded, validated steps — never a frozen mega-PR. <b>Say in an interview: &ldquo;I migrate and upgrade in bounded, validated steps — never a frozen mega-PR.&rdquo;</b></div>
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
      <div class="callout tip"><span class="lbl">New concept</span> <b>Native motion + native chrome = native feel.</b> The details (tab minimize, peek previews, sheet detents, layout animations) are what make an RN app read as first-class. <b>Say in an interview: &ldquo;I treat native motion and native chrome as the details that make an RN app read as first-class, not afterthoughts.&rdquo;</b></div>
      <div class="map"><span class="lbl">Your proof</span> You eliminated <b>re-render flicker</b> (UI-thread thinking) and owned <b>deep-link navigation</b> on Valt — native motion and native nav are exactly your strengths, now with the current APIs to name.</div>`,
  },
];
