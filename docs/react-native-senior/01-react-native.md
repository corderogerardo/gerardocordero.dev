# React Native — Senior (38 skills, 12 themes)

The core category — every row of the React Native S2 matrix, answered at senior depth. Where the matrix names a dated tool (Flipper, RN Debugger, eject, CodePush-era OTA) the answer covers the classic concept *and* today's replacement; knowing both is itself a seniority signal.

> Part of the [Senior React Native study guide](README.md). Drill these with [flashcards.md](flashcards.md).

## Environment and Expo

### Xcode & Android Studio
**They ask:** "How do you test deep links on both platforms, and what do you actually configure in Xcode's Signing tab?"

Deep links and signing are where React Native engineers get exposed as web developers in disguise — both live entirely in native tooling, and a broken link or a signing mismatch ships a broken release. For deep-link testing you never need to build a special harness: on iOS, `xcrun simctl openurl booted "myapp://profile/42"` fires the URL at the booted simulator; on Android, `adb shell am start -W -a android.intent.action.VIEW -d "myapp://profile/42" com.example.app` sends an explicit VIEW intent and `-W` waits so you see which activity resolved it. In Android Studio, the App Links Assistant validates your intent filters against `AndroidManifest.xml` and generates the `assetlinks.json` for verified App Links; Logcat shows the intent resolution when a link routes to the wrong activity. On the iOS side, Xcode's Signing & Capabilities tab is the contract with Apple: bundle identifier, team, provisioning profile, and entitlements (Associated Domains is what makes universal links work at all). Automatic signing lets Xcode manage certificates and profiles — right for development; manual signing pins explicit distribution profiles — what CI and enterprise pipelines use, because "automatic" on a build server means non-deterministic.

**Say it:** "I test deep links from the terminal — `simctl openurl` and `adb shell am start` — because that exercises the same intent/URL resolution production traffic hits, before any UI test does."
**Red flag:** Saying you test deep links by tapping links in Notes or Messages — that only proves the happy path on one OS state; the CLI commands test cold-start, warm-start, and wrong-activity resolution deterministically.

### Bare workflow (Expo)
**They ask:** "When would you eject to the bare workflow, and what does ejecting look like today?"

Choosing bare means your team owns the `ios/` and `android/` directories — every Xcode project change, every Gradle upgrade, every React Native version bump becomes your maintenance burden, which is exactly what you're buying: unrestricted native access. Classically, `expo eject` generated the native projects once and you maintained them forever. That command is retired; the modern mechanism is `npx expo prebuild`, which generates (and can regenerate) the native directories from `app.json` plus config plugins — Expo calls this Continuous Native Generation. The senior distinction: prebuild is not eject. Eject was a one-way door; prebuild treats native projects as build artifacts you can delete and regenerate, so you keep the managed workflow's upgrade story while still being able to inspect or temporarily patch native code. True bare — committing `ios/` and `android/` and hand-editing them — is now the option of last resort: brownfield integrations into an existing native app, or native customizations no config plugin can express. Pros of bare: total native control, any library, any Xcode/Gradle setting. Cons: you absorb every RN upgrade by hand, lose one-command regeneration, and your native diff grows unreviewable over time.

**Say it:** "I treat native directories as build artifacts via `expo prebuild` and config plugins; I only commit them when a brownfield or native requirement genuinely can't be expressed as a plugin."
**Red flag:** Saying "we ejected because we needed a native module" — dated since config plugins and dev clients; today that answer signals you haven't touched Expo in years. Name prebuild/CNG and explain why the module couldn't be a config plugin.

### Managed workflow (Expo)
**They ask:** "Why would you choose the managed workflow for a production app — isn't it too limiting for serious work?"

The managed workflow's business case is velocity and upgrade safety: no native directories in the repo means SDK upgrades are a package-version bump plus `expo prebuild` on the build server, not a week of Xcode and Gradle archaeology. The historical objection — "you'll eventually need a native module and have to eject" — is largely obsolete: EAS Build compiles managed apps in the cloud with any native module autolinked, and config plugins let libraries mutate the native projects (Info.plist entries, Gradle settings, entitlements) declaratively at build time. Development builds (`expo-dev-client`) removed the other classic ceiling: you're not restricted to Expo Go's preinstalled module set; you build a custom dev client containing exactly your native dependencies. What remains genuinely out of reach: writing bespoke native code that no plugin API covers, and brownfield scenarios where React Native embeds into an existing native app. The trade-off pitch: you cede low-level control of the native projects; the alternative — owning them — costs you every future RN upgrade done by hand and a native layer only one or two people on the team can review. For most product teams, managed is the correct default and bare is the documented exception.

**Say it:** "Managed versus bare is no longer a binary — config plugins, dev clients, and prebuild make it a continuum, and I stay as managed as the requirements allow because upgrades are where native ownership actually bills you."
**Red flag:** Reciting the pre-2021 limitation list ("no push notifications, no Bluetooth, must eject for native modules") — those cases are covered by config plugins and EAS Build; quoting them dates your Expo knowledge badly.

### CLI
**They ask:** "Beyond `expo start`, what CLI commands and flags do you actually use to build, update, and manage credentials?"

CLI fluency is what separates an engineer who owns the release pipeline from one who only runs the dev server. Day-to-day: `npx expo start --clear` (reset Metro's cache — the first move when the bundler serves stale code), `npx expo run:ios|android` (compile and install the native app locally; `--device` targets hardware, `--variant release` builds the Android release variant), `npx expo prebuild --clean` (regenerate native dirs from config), `npx expo install --fix` (align dependency versions to the SDK's known-good set), and `npx expo-doctor` (diagnose config/dependency mismatches). Release work moves to EAS: `eas build --platform ios --profile production --non-interactive --no-wait` (CI-friendly: queue and exit), `eas submit` (push a finished binary to App Store Connect / Play Console), `eas update --channel production` (publish an OTA JS/asset update), and `eas credentials` — the certificate answer: it stores signing certs, provisioning profiles, App Store Connect API keys, and Android keystores on EAS servers so no credential ever lives in the repo and `--non-interactive` builds can sign without prompts. `eas build:version:get` inspects the remotely-managed build numbers. On bare projects without Expo, the equivalents are `npx react-native run-ios|run-android` and `start --reset-cache`.

**Say it:** "Credentials live on EAS via `eas credentials`, never in the repo — that's what makes `--non-interactive` CI builds possible, because there's nothing local for the build to prompt for."
**Red flag:** Answering "I just use `expo start`" — the matrix row is explicitly about updating, deploying, and certificates; if you can't name `eas build`, `eas submit`, and where signing credentials live, you've never shipped an Expo app.

### OTA updates
**They ask:** "What are over-the-air updates in React Native, what can they change, and what would you use today?"

OTA updates exist because a one-line JS fix should not cost you a multi-day store review: since React Native ships its JavaScript as a bundle loaded at runtime, you can replace that bundle (and assets) remotely and the app picks it up on next launch. The hard boundary: OTA can never change native code — no new native modules, no SDK upgrades, no permission changes; those always require a store release. That boundary is enforced by a runtime version: an update is only delivered to binaries whose native layer is compatible with it (`runtimeVersion` in EAS Update), because shipping JS that calls a native module the installed binary doesn't contain is a guaranteed crash. Historically the dominant tool was Microsoft's CodePush, but Microsoft retired it along with App Center in 2025 — citing CodePush as your OTA answer today is a dated answer. The mainstream successor is EAS Update: channels map to environments (production, staging), branches carry the updates, and rollback is republishing a known-good update to the channel. Store policy permits this — both Apple and Google allow interpreted-code updates that fix bugs and don't change the app's core purpose — which is why OTA is standard practice, not a gray area.

**Say it:** "OTA replaces the JS bundle and assets only — never native code — gated by runtime version compatibility so an update can't reach a binary that can't run it."
**Red flag:** Naming CodePush as the current solution — it was retired with App Center in 2025; say EAS Update and mention `runtimeVersion` gating to show you've operated it, not just read about it.

### Metro bundler
**They ask:** "Walk me through how Metro works — what happens between saving a file and seeing the change on the device."

Metro is the piece that determines both your dev-loop speed and your app's startup cost, so understanding its pipeline is understanding where those seconds go. It has three phases. **Resolve:** starting from the entry file, Metro builds the full dependency graph, resolving each `import`/`require` to a file — including platform-specific extensions (`.ios.tsx`, `.android.tsx`) and, in monorepos, extra roots declared via `watchFolders` (symlinked workspace packages are the classic monorepo pain point). **Transform:** each module is compiled (Babel) in parallel worker processes; results are aggressively cached, keyed by file content and transform configuration — which is why a stale cache produces "I fixed it but the old code still runs," and why `--clear` fixes it. **Serialize:** the transformed modules are concatenated into a single JS bundle (or Hermes bytecode for release). In development Metro doesn't re-serialize the world on every save: Watchman reports file changes, only affected modules are re-transformed, and Fast Refresh pushes just those module deltas over the HMR channel while preserving component state. For startup performance, inline requires defer module execution until first use, so the bundle parses fast and expensive modules initialize lazily.

**Say it:** "Metro is a resolve–transform–serialize pipeline: Watchman feeds it changed files, per-module caching plus Fast Refresh deltas keep the dev loop incremental, and inline requires keep the serialized bundle from executing everything at startup."
**Red flag:** Describing Metro as "basically Webpack for React Native" — the interviewer wants the pipeline; Metro's design center is different (single bundle, on-demand graph, aggressive caching for the dev loop), and the Webpack analogy signals you've never had to debug a cache or resolution problem.

## Animation

### React Native Animated
**They ask:** "What does `useNativeDriver: true` actually do, and why can an Animated animation still stutter or leak memory?"

`useNativeDriver` decides whether your animation survives a busy JS thread — that is the difference between smooth micro-interactions during data loads and visible jank. Without it, Animated ticks on the JS thread: every frame, JS computes the next value and sends an update across the bridge. Any JS work — a heavy render, a JSON parse, a navigation transition — starves those ticks and frames drop. With `useNativeDriver: true`, the full animation description (curve, duration, target node) is serialized and sent to the native side **once** at start; the UI thread then drives every frame independently, so JS-thread stalls no longer matter.

The trade-off: the native driver only supports non-layout props — `transform` and `opacity`. `width`, `height`, `left`, flex properties trigger layout and cannot be driven natively; animating those needs `LayoutAnimation` or Reanimated. Passing an unsupported prop throws at runtime, so decide the animated property up front.

Memory and time leaks come from two patterns: `Animated.loop(...).start()` that is never `.stop()`ed on unmount (the native animation keeps running), and `animatedValue.addListener` callbacks never removed with `removeListener`/`removeAllListeners` — listeners also force a per-frame JS round-trip, silently defeating the native driver. Stop animations and detach listeners in the effect cleanup.

**Say it:** "I default to `useNativeDriver: true` so the animation is serialized once and driven on the UI thread, immune to JS-thread stalls — and I restrict myself to transform and opacity, which is what it supports."
**Red flag:** Saying "useNativeDriver makes animations faster" — it doesn't speed anything up, it decouples them from the JS thread; per-frame cost is the same, the win is that a blocked JS thread can no longer drop your frames.

### React Native Reanimated
**They ask:** "How does Reanimated achieve gesture-driven animations that Animated can't, and what are worklets and shared values under the hood?"

Reanimated exists because interactive, gesture-driven UI cannot tolerate a bridge round-trip per frame — it moves your animation *logic*, not just a pre-serialized description, onto the UI thread. Worklets are the mechanism: JS functions the babel plugin extracts and runs on a second JS runtime living on the UI thread, so arbitrary logic (spring physics, gesture math, conditionals) executes synchronously with each frame.

Shared values (`useSharedValue`) are the state bridge: mutating `.value` is visible to both runtimes and never triggers a React render — animation state lives entirely outside the render cycle. `useAnimatedStyle` and `useDerivedValue` declare reactive worklets that recompute when their shared-value dependencies change and apply styles directly to the native view. Gesture and scroll events (via `react-native-gesture-handler`'s `Gesture` API and `useAnimatedScrollHandler`) are delivered straight to worklets on the UI thread, so a pan-to-dismiss tracks the finger even while JS is blocked.

```js
const x = useSharedValue(0);
const style = useAnimatedStyle(() => ({
  transform: [{ translateX: x.value }],
}));
```

Compared to Animated: Reanimated animates layout props too, and ships layout/entering transitions. Costs: a babel plugin and native runtime to maintain across upgrades, and worklets can't touch ordinary JS closures without `runOnJS`. On web there is no second runtime — Reanimated falls back to running on the main JS thread, so the API is portable but the isolation guarantee is native-only.

**Say it:** "Worklets run my animation logic on a UI-thread JS runtime and shared values mutate without rendering — so gestures track the finger frame-perfectly even when the JS thread is busy."
**Red flag:** Describing Reanimated as "Animated but faster" — the differentiator is *where logic runs*: Animated's native driver replays a fixed, pre-declared curve, while Reanimated executes arbitrary per-frame logic responding to live gesture input on the UI thread.

### Gesture Responder System
**They ask:** "Walk me through how React Native decides which view handles a touch — the responder negotiation — and where PanResponder fits."

The responder system is RN's built-in answer to the hardest touch problem — arbitration: exactly one view owns a gesture at a time, and the negotiation rules decide whether your button or the scroll view wrapping it wins. A touch triggers two negotiation passes: the **capture** phase descends from the root toward the target, asking each view `onStartShouldSetResponderCapture` (a parent returning `true` here claims the touch before children ever see it); then the **bubble** phase ascends from the target upward via `onStartShouldSetResponder`, where the deepest willing view wins. `onMoveShouldSetResponder`(+Capture) re-runs this on every move, which is how a ScrollView steals a touch from a child once the finger travels.

Once granted, the lifecycle is: `onResponderGrant` (gesture begins) → `onResponderMove` → `onResponderRelease` (success) or `onResponderTerminate` (another view took it — you must cancel and reset state); `onResponderTerminationRequest` lets the current owner refuse the handoff.

`PanResponder` is the ergonomic wrapper: same handlers, plus a computed `gestureState` (`dx`, `dy`, `vx`, `vy`, `numberActiveTouches`) so drag logic doesn't hand-track deltas.

The senior caveat: every one of these callbacks runs on the JS thread, so recognition itself stalls when JS is busy. Production gesture code today uses `react-native-gesture-handler`, which runs recognition natively on the UI thread and composes with Reanimated worklets — the responder system remains the right mental model and the fallback for simple cases.

**Say it:** "Capture descends so parents can intercept, bubble ascends so the deepest willing child wins, and grant/move/release/terminate is the ownership lifecycle — PanResponder just wraps that with gestureState."
**Red flag:** Forgetting `onResponderTerminate` — a candidate who only handles release ships gestures that freeze mid-drag when a ScrollView steals the touch; naming termination handling is what separates having read the docs from having shipped gestures.

## Routing

### React Navigation
**They ask:** "How would you build a custom transition animation between two screens in React Navigation, and how do you make it work with SSR on web?"

Custom transitions are only fully scriptable in the JS-based stack — choosing the navigator is choosing how much animation control you keep. React Navigation runs navigation state in JS, so `@react-navigation/stack` renders each screen as a card whose animation you own: `cardStyleInterpolator` maps gesture/transition progress to styles (translate, fade, scale) and `transitionSpec` defines the timing/spring config per open/close. `@react-navigation/native-stack` delegates to `UINavigationController` and Fragment transitions, so you get platform fidelity but only preset `animation` options — for a bespoke transition you either drop to the JS stack for that flow or animate shared content yourself (e.g. Reanimated).

```js
const forSlide = ({ current, layouts }) => ({
  cardStyle: {
    transform: [{
      translateX: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [layouts.screen.width, 0],
      }),
    }],
  },
});
```

For SSR, the server has no navigation state — you reconstruct it from the request URL: render inside `ServerContainer`, pass the request `location`, and let the `linking` config resolve the initial state so the server responds with the correct screen (and can set title/meta via the container ref). Expo Router is a file-based layer on top of React Navigation, so this same machinery is what it configures for you.

**Say it:** "I use the JS stack's `cardStyleInterpolator` plus `transitionSpec` when I need a bespoke transition, native-stack when platform fidelity matters more, and on web SSR I resolve initial navigation state from the request URL via `ServerContainer` and the linking config."
**Red flag:** Saying "I'd customize the transition in native-stack" — native-stack delegates animation to the OS and only exposes presets; name the JS stack (or Reanimated shared elements) as the place custom interpolators live.

### React Native Navigation
**They ask:** "Why would a team pick Wix's React Native Navigation over React Navigation, and how do you add a custom transition there?"

RNN's core bet is native fidelity: every screen is a real native container — a `UIViewController` on iOS, an Activity/Fragment-backed container on Android — so pushes, pops, and back gestures are the platform's own transitions by construction, not JS re-implementations. That also means the API is imperative and lives outside the React tree: `Navigation.setRoot(...)` defines the layout (stacks, tabs, side menus) and `Navigation.push(componentId, ...)` drives it, rather than a navigator component rendering children.

Additional transitions are declared as animation options on the command: the `options.animations` block lets you animate the pushed screen's content (alpha, translation, scale, timing per property), and shared-element transitions bind an element on the source screen to one on the destination by `nativeID`-style tags so the platform animates it across the boundary.

The trade-off pitch: you pay real setup cost — native project integration, no Expo managed workflow, a smaller ecosystem, and navigation state that React DevTools can't see. The alternative cost is that JS-driven transitions can stutter when the JS thread is busy and never perfectly match platform behavior. For products where navigation feel is a differentiator, RNN's native-by-construction model is the investment; for most apps, React Navigation's flexibility and ecosystem win.

**Say it:** "RNN makes every screen a real native ViewController or Fragment, so transitions are native by construction — I trade JS-level flexibility and setup simplicity for platform-perfect navigation feel."
**Red flag:** Presenting RNN as simply "the faster one" — the senior answer names the concrete costs (native setup, no Expo, imperative API outside React) and frames it as a fidelity-versus-flexibility trade, not a performance verdict.

## Publishing and Distribution

### Provisioning profile
**They ask:** "What is a provisioning profile, what does it contain, and why do signing builds fail when it's wrong?"

The provisioning profile is Apple's authorization artifact — without a valid one, iOS refuses to install or run your binary, which is why "it builds locally but the archive fails" is almost always a profile problem, not a code problem. Mechanically it is a signed plist (`.mobileprovision`) embedded in the app bundle that binds four things together: the App ID (bundle identifier), one or more signing certificates, the entitlements the app is allowed to claim (push, App Groups, associated domains), and — for development and ad-hoc profiles — an explicit list of device UDIDs. There are four types: development (debug on registered devices), ad-hoc (release builds on registered devices, e.g. for QA), App Store (no device list — the store is the distribution channel), and enterprise (in-house distribution under the Apple Developer Enterprise Program). Every classic signing failure is a mismatch inside that binding: certificate not in the profile, entitlement claimed in code but absent from the profile, device not registered, or profile expired. On a modern React Native/Expo team the senior move is to stop hand-managing this: EAS (or fastlane match) stores and regenerates profiles centrally, so CI and every developer sign from the same source of truth instead of exporting profiles by email.

**Say it:** "A provisioning profile is a signed plist binding App ID, certificates, entitlements, and — for dev/ad-hoc — device UDIDs; nearly every signing failure is a mismatch in that binding, so I let EAS manage credentials centrally."
**Red flag:** Describing it as "just a file Xcode needs" — the interviewer wants you to enumerate what it binds together, because that's what lets you diagnose signing failures instead of clicking "Fix Issue" and hoping.

### Distribution certificate
**They ask:** "Walk me through how Apple code-signing certificates work — how you generate one and what the private key means for the team."

Certificates are the identity half of code signing — they prove *who* built the binary, and losing control of the private key blocks the entire team's release pipeline, which is why key custody is a team-process question, not a Keychain trivia question. Generation: you create a Certificate Signing Request (CSR) in Keychain Access, which generates a public/private key pair locally; you upload the CSR to the Apple Developer portal; Apple's certificate authority issues the certificate against your public key. Critically, **the private key never leaves your machine** — Apple only ever has the public half. To share the identity (CI, a teammate) you export the certificate plus private key as a `.p12`. Two families matter: development certificates (sign debug builds for registered devices) and distribution certificates (sign release builds). One distribution certificate serves multiple channels — pairing it with an ad-hoc profile gives registered-device releases, with an App Store profile gives store submission, and an enterprise account's distribution certificate enables in-house distribution. Expiry stops you from *making new* signed builds; revocation is more serious — for enterprise-distributed apps it kills installed apps, while App Store apps keep running because Apple re-signs store binaries. Modern practice: store the distribution identity on EAS or in fastlane match so no single laptop is the point of failure.

**Say it:** "The CSR generates the key pair locally and Apple only signs the public half — so the private key is the asset to protect, and I keep it on EAS or in match rather than on someone's laptop."
**Red flag:** Saying "if the certificate is lost you just download it again from the portal" — the portal only has the certificate, not the private key; without the exported `.p12` you must revoke and re-issue.

### App validation
**They ask:** "Before you upload a build to App Store Connect, how do you validate it, and what does validation actually check?"

Validation exists to convert a days-long App Review rejection into a minutes-long local failure — catching a whole class of problems before they cost you a review cycle. The primary path is Xcode Organizer: after archiving, **Validate App** runs the archive through App Store checks without uploading — signing and provisioning correctness, entitlements, required app icons and asset catalog completeness, `Info.plist` requirements (usage-description strings for camera, location, photos), bundle version conflicts with builds already in App Store Connect, and use of private or disallowed APIs. For CI, the same checks run headlessly: `xcodebuild -exportArchive` plus upload tooling — the deprecated `altool` gave way to `notarytool` for notarization and to Transporter / the App Store Connect API for uploads; on an Expo/EAS pipeline, `eas submit` wraps this. The senior framing: validation catches the *mechanical* rejection class (missing icon, missing `NSCameraUsageDescription`, bad signing) — it cannot catch *policy* rejections (guideline 4.2.2 minimal functionality, misleading metadata), so a clean validation pass means "uploadable," not "approvable." Budget review time for the policy class separately.

**Say it:** "Validate App catches the mechanical rejection class — signing, entitlements, icons, Info.plist keys, private API use — in minutes instead of losing a review cycle; policy rejections still need their own preparation."
**Red flag:** Treating a successful validation as a guarantee of App Review approval — validation is static and mechanical; reviewers reject on functionality and policy grounds validation never sees.

### App Store distribution
**They ask:** "Take me through the full path from a finished build to users running it from the App Store."

The App Store pipeline is a gated release train, and the senior skill is knowing where the human gates are so you can plan release dates around them. The sequence: 1. Archive the release build in Xcode (or `eas build` on Expo) and upload to App Store Connect. 2. Apple processes the binary (minutes to hours) — it then appears under TestFlight, where internal testers get it immediately and external testers require a lighter beta review. 3. In App Store Connect you attach the build to a version with complete metadata: screenshots per device class, description, privacy nutrition labels, and — critically — **review notes** with a demo account and anything non-obvious the reviewer needs (offline features, hardware requirements). 4. Submit for App Review — the human gate, typically within a day or two but never guaranteed; an expedited review exists for critical fixes but is a favor, not a lever to plan around. 5. On approval, release manually, automatically, or via **phased release**, which rolls out to increasing percentages of users over seven days and can be paused if crash rates spike. Common rejection to pre-empt for portfolio-style or thin-client apps: guideline 4.2.2 minimal functionality — the app must do something interactive, not just present content.

**Say it:** "Archive, upload, processing, TestFlight, review, release — App Review is the only gate I can't control, so I front-load good review notes and use phased release as my rollback lever."
**Red flag:** Presenting expedited review as a normal planning tool — it's an exception Apple grants sparingly for critical issues; a release plan that depends on it is not a plan.

### Google Play distribution
**They ask:** "How does releasing on Google Play differ from the App Store — tracks, signing, rollout?"

Play's model trades Apple's single review gate for a progression of tracks and an automated rollout system — so your process design, not a reviewer's calendar, is the main risk control. Packaging: Google Play requires the **Android App Bundle (AAB)**, not a raw APK — Play generates optimized per-device APKs from it. Signing: under **Play App Signing**, Google holds the app signing key and you sign uploads with a separate upload key; this is what makes AAB splitting possible, and it means a compromised upload key is recoverable (Google can reset it) whereas the release key never sat on your laptop at all. Distribution moves through tracks: **internal testing** (up to 100 testers, near-instant) → **closed testing** → **open testing** → **production**. In production you use **staged rollouts** — release to a percentage of users, watch crash and ANR rates in Android Vitals, then increase or halt; a halted rollout is the closest thing mobile has to a rollback. Before any of that, the **pre-launch report** runs the build on real devices and flags crashes, accessibility and performance issues. One compliance item seniors track: Google enforces **target API level deadlines** — updates must target a recent Android API level by an annual deadline, so OS-target upgrades belong on the roadmap, not in a panic.

**Say it:** "AAB with Play App Signing, promote through internal → closed → open → production, then staged rollout watching Vitals — the halt button on a staged rollout is my rollback strategy."
**Red flag:** Claiming you'd "roll back" a bad Android release — Play has no version rollback; the real answer is halt the staged rollout and ship a fixed version, which is exactly why you stage in the first place.

## Push Notifications

### APNs certificates
**They ask:** "Walk me through how APNs works end to end, and how you configure the credentials that let your server send pushes."

APNs is the mandatory gateway for iOS pushes — you never deliver to a device directly, so the reliability and security of your notification pipeline hinges on how your backend authenticates to Apple. The flow: the device keeps a single persistent, OS-managed connection to APNs (shared by all apps on the device); your app registers and receives a device token; your backend sends `{token, payload}` to Apple's HTTP/2 provider API; APNs routes it to the device, which wakes your app.

Authentication is where the dated-versus-current split lives. The classic mechanism is per-app SSL certificates — a `.p12` exported from a CSR in the Developer portal, one certificate per app (historically separate sandbox/production certs), expiring annually, so rotation is a recurring operational chore. The current best practice is token-based auth: a `.p8` signing key that never expires, works for every app under the team, and is used to sign short-lived JWTs (ES256, with your Key ID and Team ID) sent as a bearer header on each HTTP/2 request. Apple retired the legacy binary protocol; the HTTP/2 provider API is the only supported path, and it returns per-request status codes — including `410 Unregistered` for dead tokens — replacing the old feedback service.

Trade-off: the `.p8` key is a broader-scoped secret (it can push to all your apps), so vault it and restrict access; in exchange you eliminate annual expiry incidents.

**Say it:** "I use token-based auth — one non-expiring `.p8` key signing ES256 JWTs over the HTTP/2 provider API — instead of per-app `.p12` certificates, because it removes annual certificate-expiry outages from the operational surface."
**Red flag:** Describing `.p12` certificate setup as the current standard reads as outdated knowledge — name it as the legacy option and state that `.p8` token-based auth over HTTP/2 is what you'd configure today.

### Device token
**They ask:** "What exactly is a device token, and how do you handle it correctly on the backend?"

The device token is the addressing primitive of the entire push system — mishandle its lifecycle and notifications silently stop arriving for a slice of your users with no client-side error to debug. Mechanically, it's an opaque identifier minted by APNs for one app on one device: the app calls `registerForRemoteNotifications`, APNs returns the token via `didRegisterForRemoteNotificationsWithDeviceToken`, and your app ships it to your backend, which stores it against the user. Your server then targets that token through the HTTP/2 provider API. FCM's registration token is the direct Android analog (and FCM also fronts APNs if you use it cross-platform).

The senior point is that the token is not stable. It can change on app reinstall, restore to a new device, or OS-level resets — so treat it as a rotating credential, not a permanent ID:

1. Register on every launch and re-send the token whenever it differs from the last one you uploaded.
2. Store tokens per device, not per user — one user, several devices, several tokens.
3. Prune: when APNs returns `410 Unregistered` (the HTTP/2 replacement for the old feedback service), delete that token, or Apple may throttle a provider that keeps hitting dead tokens.

Never parse or dedupe by token contents — it's opaque by contract; Apple can change its format and length.

**Say it:** "A device token is an opaque, per-app-per-device address minted by APNs — I register on every launch, sync changes to the backend, and prune tokens on `410 Unregistered` responses."
**Red flag:** Saying you register once at signup and store the token forever is the classic trap — tokens rotate on reinstall/restore, so the correct answer is register every launch and prune on APNs error responses.

## Storages

### Async Storage
**They ask:** "Would you store an auth token in AsyncStorage? What are its vulnerabilities?"

Treating AsyncStorage as a safe place for secrets is a data-breach waiting for a rooted device — it is an unencrypted, plaintext key-value store, so anything in it must be considered readable by an attacker with device access. Mechanically, the community package `@react-native-async-storage/async-storage` (the RN core module was deprecated and extracted) persists strings only: on Android it writes to a SQLite database in the app's data directory, on iOS to serialized files plus a manifest under the app's sandbox. Neither layer adds encryption — the OS sandbox is the only barrier, and that barrier disappears on rooted/jailbroken devices and can leak through device backups.

Concrete limits that shape architecture: Android ships a ~6 MB default database cap (raisable via config, but hitting it means you are misusing the tool), all APIs are async and promise-based, and there is no TTL or expiry — stale cache invalidation is your job. So its correct role is non-sensitive app state: feature flags, onboarding-seen booleans, cached JSON you can afford to lose or leak. Tokens, PII, and encryption keys go to Keychain/Keystore-backed secure storage instead.

**Say it:** "AsyncStorage is plaintext and sandbox-protected only, so I use it for non-sensitive state and cache; tokens and PII always go to Keychain- or Keystore-backed storage."
**Red flag:** Saying "it's fine for tokens because the app sandbox protects it" — root/jailbreak and backup extraction defeat the sandbox; the senior answer is that sensitivity, not convenience, decides the storage tier.

### Secure Storage
**They ask:** "How do you store credentials securely in React Native, and how does the iOS Keychain actually protect them?"

Secure storage is where you delegate encryption and key management to the OS instead of rolling your own — hand-rolled crypto with a key stored in JS is security theater. On iOS the Keychain is an encrypted system database whose keys are protected by the Secure Enclave; each item carries a `kSecAttrAccessible` class that defines *when* it is decryptable: `WhenUnlocked` (strictest common choice), `AfterFirstUnlock` (needed if background processes read the item), and the `ThisDeviceOnly` variants, which exclude the item from backups and keychain sync. Access groups share items across apps of the same team, and Keychain items have historically survived app deletion — so treat a stored token as long-lived state, not something reinstalling clears. On Android the equivalent is Keystore-backed encryption: a hardware-backed master key encrypts data at rest, e.g. via `EncryptedSharedPreferences` (Google has since deprecated that Jetpack wrapper; the Keystore itself remains the primitive).

In React Native: `react-native-keychain` exposes accessibility classes and biometric access control (Face ID/Touch ID gating a read); `expo-secure-store` is the Expo-managed option, suited to small values (around 2 KB per entry). Store the token in secure storage, keep it in memory while the app runs — do not mirror it into Redux persistence or AsyncStorage.

**Say it:** "I store tokens with react-native-keychain using WhenUnlocked/ThisDeviceOnly accessibility, add biometric access control for high-value credentials, and never mirror secrets into AsyncStorage or persisted state."
**Red flag:** Proposing to encrypt data yourself and keep the key in AsyncStorage or JS constants — that just relocates the plaintext problem; the key must live in Keychain/Keystore, which is exactly what these libraries do for you.

## Layout

### Flex
**They ask:** "How does flexbox in React Native differ from the web, and what does `flex: 1` actually mean?"

Layout bugs that only reproduce on one platform usually come from assuming web flexbox defaults — RN implements flexbox through the Yoga engine, and its defaults are deliberately mobile-first. Three differences matter: `flexDirection` defaults to `column` (web: `row`), every view is `position: relative` and `display: flex` by default, and `alignContent` defaults to `flex-start` (web: `stretch`). The three primitives: `flexBasis` is the starting size along the main axis, `flexGrow` distributes leftover space proportionally, `flexShrink` distributes overflow. In RN, `flex: 1` expands to `flexGrow: 1, flexShrink: 1, flexBasis: 0` — the child ignores its content size and fills its share of the parent. Yoga computes this in a single-direction data flow: constraints flow down from parent to child, resolved sizes flow back up, and the final frames are handed to the native views. That one-way flow is why layout is predictable and why a child can never resize its parent mid-pass — the same unidirectional principle React applies to data. Trade-off: Yoga implements a flexbox subset (no `grid`, no `float`), which keeps the layout pass fast enough to run on every render, including on the UI-thread path under Fabric.

**Say it:** "React Native flexbox is Yoga, not CSS — column by default, relative by default, and `flex: 1` means grow 1, shrink 1, basis 0, so the view fills its parent's leftover space regardless of content."
**Red flag:** Saying "it's the same flexbox as the web" — the interviewer is checking whether you've been burned by the different defaults; name `flexDirection: column` explicitly.

### Styled components
**They ask:** "Would you use styled-components in a React Native project? Defend the choice against `StyleSheet.create`."

The decision is a build-time vs run-time trade: `StyleSheet.create` builds style objects once at module load and references them by ID, while styled-components resolves tagged template literals into style objects at render time — a per-render cost that scales with how dynamic your props are.

```js
const Card = styled.View`
  padding: 16px;
  background: ${({ theme }) => theme.surface};
`;
```

Advantages: first-class theming via `ThemeProvider`, prop-driven dynamic styles without inline-style sprawl, styles co-located with the component, and one styling dialect shared between React web and React Native — a real win for teams shipping both. Disadvantages: the runtime interpolation work per render, an extra dependency to keep aligned with RN versions, and a string-based DSL that bypasses TypeScript checking of style objects unless typed carefully. Three-beat pitch: yes, I pay a runtime cost per dynamic style; the alternative — hand-rolled theme plumbing and conditionally merged StyleSheet objects — costs more in inconsistency and review time on a large team; so I treat styled-components as an investment in a shared design language, and I keep hot paths (list rows, animated views) on `StyleSheet.create`. Current alternatives shift the work to compile time: NativeWind compiles Tailwind classes ahead of render, Tamagui uses an optimizing compiler.

**Say it:** "StyleSheet.create is created once and referenced by ID; styled-components pays a per-render interpolation cost — I accept it for theming and cross-platform sharing, but keep list rows on StyleSheet."
**Red flag:** Answering with only pros ("cleaner syntax") — a senior answer must name the runtime cost versus StyleSheet's create-once model, unprompted.

### onLayout
**They ask:** "When does `onLayout` fire, and what's the classic mistake teams make with it?"

`onLayout` is asynchronous by design, and that single fact drives every correct use of it: the first frame renders *before* your measurement callback runs, so any UI positioned from `onLayout` data will visibly jump unless you plan for it. Mechanics: after Yoga finishes a layout pass, each view whose frame actually changed fires `onLayout` with `{x, y, width, height}` — coordinates relative to the parent, not the screen. It does not re-fire on every render, only when the computed layout differs from the previous pass, which makes it cheap enough to leave attached. The flicker mitigation pattern: render the dependent view at `opacity: 0` (or with an estimated size) until the first measurement lands, then reveal — never block render waiting for it. Alternatives with different contracts: `ref.measure()`/`measureInWindow()` when you need screen-absolute coordinates on demand (e.g. anchoring a tooltip), and `useWindowDimensions` when the answer is really "viewport size", which needs no measurement round-trip at all — that's the reframe: most `onLayout` code I review is measuring a view whose size is derivable from the window, and deriving is synchronous.

**Say it:** "`onLayout` fires after Yoga computes the frame and only when it changed — it's async, so the first frame paints before I have numbers, and I design for that instead of fighting it."
**Red flag:** Treating `onLayout` values as available on first render — the measured-then-jump flicker is the tell; say you render hidden or estimated until the callback lands.

### Lists
**They ask:** "How does FlatList stay fast with ten thousand items, and why does `keyExtractor` matter?"

Rendering ten thousand rows would blow both memory and the JS thread, so FlatList (a `VirtualizedList` wrapper) mounts only a *window* of items around the viewport — roughly `windowSize` viewport-lengths (default 21: the visible screen plus 10 above and below) — and replaces everything outside it with blank space of the correct height. The tuning surface: `initialNumToRender` (first-paint batch — keep it to one screen), `maxToRenderPerBatch` and `updateCellsBatchingPeriod` (how aggressively off-screen items fill in), `removeClippedSubviews` (detaches off-screen native views). `keyExtractor` is the identity contract that makes windowing safe: stable keys let React diff and reuse row instances as the window slides. Index-as-key breaks the moment you insert or reorder — every downstream row's key shifts, React treats them as new items, and row state (inputs, animations) attaches to the wrong data. `getItemLayout` removes the async measurement step entirely for fixed-height rows, enabling accurate scrollbars and instant `scrollToIndex`. The core trade-off is blank areas during fast scrolls: widen the window and you trade memory and batch work for fewer blanks. FlashList changes the model — it recycles cell views instead of unmounting them, which is why its rows must be written stateless-by-key.

**Say it:** "FlatList virtualizes — only a window of items is mounted, and `keyExtractor` gives rows stable identity so that window can slide without remounting; index keys break on insert."
**Red flag:** Suggesting `ScrollView` with `.map()` for long lists, or shrugging at index keys — say "index keys misattach row state on insert" instead.

### SafeAreaView
**They ask:** "How do you handle notches and home indicators correctly on both iOS and Android?"

The core `SafeAreaView` component is iOS-only — on Android it renders as a plain `View` — so shipping it as your cross-platform answer means Android users get content under the status bar or display cutout. The production answer on *both* platforms is `react-native-safe-area-context`: wrap the app in `SafeAreaProvider` and consume `useSafeAreaInsets()` (or `SafeAreaView` from the library) where padding is needed. It wins even on iOS-only apps for two mechanical reasons: it can deliver insets synchronously on first render via `initialWindowMetrics` (core SafeAreaView applies insets natively and can misbehave during navigation transitions and inside modals), and insets-as-numbers compose — you can add them to a tab bar height or feed them into an animated header, which a wrapper component can't do. On Android the library reads the display cutout and system bar geometry, which matters more now that the platform pushes apps toward edge-to-edge rendering: once your content draws behind the system bars, insets are the only correct way to keep touch targets reachable. Reframe: the senior question isn't "which component" but "where do insets apply" — apply them per-edge at the screen level (e.g. top on headers, bottom on footers), not blanket padding on every screen, or scrollable content loses the full-bleed look.

**Say it:** "Core SafeAreaView is iOS-only; I standardize on react-native-safe-area-context — `SafeAreaProvider` plus `useSafeAreaInsets` — because it covers Android cutouts and gives me composable inset numbers instead of a wrapper."
**Red flag:** Presenting the built-in `SafeAreaView` as the cross-platform solution — it's a no-op wrapper on Android; name the safe-area-context library unprompted.

## Native Modules

### Communication between native and RN
**They ask:** "Walk me through how JavaScript talks to native in React Native — old architecture and new."

How JS reaches native defines every performance ceiling in a React Native app — the entire new architecture exists to remove one bottleneck: serialization. In the old architecture, JS and native communicate over an asynchronous, batched bridge: every call is JSON-serialized onto a message queue, flushed in batches, and deserialized on the other side. Three threads cooperate — the JS thread runs your app code, the shadow thread computes layout (Yoga), and the main/UI thread renders. The bridge's costs are structural: everything is async (no synchronous reads of native state), everything is copied (serialize/deserialize on each hop), and congestion under load causes dropped frames and delayed touch responses.

The new architecture replaces the bridge with JSI: JavaScript holds references to C++ HostObjects and invokes native methods directly — synchronously when appropriate — with no serialization. On top of JSI, TurboModules lazy-load native modules on first use instead of eagerly at startup, and codegen generates type-safe C++ glue from TypeScript specs, so the JS↔native contract is checked at build time rather than failing at runtime.

**Say it:** "The old bridge was async and JSON-serialized on every call; the new architecture replaces it with JSI, where JS holds C++ host objects and calls native directly — TurboModules add lazy loading and codegen adds compile-time type safety."
**Red flag:** Describing the batched bridge as the current architecture — the new architecture is the default in modern React Native; frame the bridge as the legacy model you migrated away from, and explain what JSI fixed.

### Native UI components
**They ask:** "You need a native view RN doesn't provide — say a camera preview or a map. How do you expose it to JavaScript?"

Wrapping a native view is how you keep platform-grade performance and platform APIs while staying inside one React codebase — the alternative is forking the whole screen into native. In the legacy architecture you write a `ViewManager` (Android) or `RCTViewManager` (iOS) that creates the platform view and exports props (`@ReactProp` / `RCT_EXPORT_VIEW_PROPERTY`) and events back to JS, then bind it with `requireNativeComponent`. Prop updates cross the bridge asynchronously, which is why fast-changing props on legacy native views can lag.

Under Fabric, the component starts from a codegen spec: you declare props and events in TypeScript, codegen emits typed native interfaces, and a C++ `ComponentDescriptor` integrates the view into the shared shadow tree — enabling synchronous measurement and direct manipulation without bridge hops.

For day-to-day work, the Expo Modules API is the strongest DX: a Swift/Kotlin DSL that defines views, props, and events in a few declarative lines and supports Fabric out of the box.

```kotlin
class MyModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MyView")
    View(MyPlatformView::class) {
      Prop("color") { view: MyPlatformView, color: String ->
        view.setColor(color)
      }
    }
  }
}
```

**Say it:** "Legacy native views are ViewManagers exporting props and events over the bridge; under Fabric the component is a codegen spec plus a C++ ComponentDescriptor in the shared shadow tree — and for new work I reach for the Expo Modules API."

### Hermes
**They ask:** "Why does React Native ship its own JS engine, and how does Hermes differ from JSC or V8?"

Hermes exists because mobile startup economics are the opposite of a browser's: you control the bundle at build time, so parsing and compiling JS on the device is pure waste. Hermes compiles JavaScript to bytecode ahead of time during the build; on launch the device memory-maps precompiled bytecode instead of parse → compile → execute, which is why Hermes cuts time-to-interactive and memory footprint — the two metrics that dominate mobile UX and app-store vitals.

The deliberate trade-off: Hermes has no JIT. JSC and V8 profile hot code at runtime and compile it to optimized machine code, so long-running CPU-bound JS loops can run faster there. Hermes bets that a mobile app's profile is dominated by startup and short interactions, not sustained compute — and gains steadier, more predictable performance without JIT warm-up. Garbage collection is Hades, a concurrent collector that moves most GC work off the critical path to reduce pauses.

Hermes is the default engine in modern React Native, and it powers the modern debugging story: React Native DevTools speaks Chrome DevTools Protocol directly to Hermes, debugging the real engine on device instead of a browser stand-in. The forward direction is Static Hermes, which uses type information to compile toward native code.

**Say it:** "Hermes trades a JIT for ahead-of-time bytecode compilation — lower TTI and memory, steadier performance — because a mobile app's profile is startup-dominated, not compute-dominated."
**Red flag:** Claiming Hermes is simply "faster than V8" — for sustained CPU-bound work a JIT engine can win; Hermes wins where mobile is measured: startup time, memory, and predictability.

### Headless JS
**They ask:** "How do you run JavaScript in the background when the app has no UI — a data-only push or a geofence event, for example?"

Headless JS lets you reuse your existing JS business logic for background work on Android instead of duplicating it in Kotlin — one sync or push-handling implementation instead of two. Mechanically, it is Android-only: a `HeadlessJsTaskService` starts a JS runtime with no attached UI and runs a task you registered:

```js
AppRegistry.registerHeadlessTask(
  'BackgroundSync',
  () => async (taskData) => {
    await syncPendingChanges(taskData);
  },
);
```

Typical triggers are data-only FCM pushes, geofence transitions, and periodic sync. The constraints are what a senior answer covers: by default the task will not run while the app is in the foreground (you handle the event through normal app code instead, or opt in explicitly); each task runs under a timeout budget you configure; and Doze plus vendor battery optimizations can defer or kill background execution entirely — so background work must be idempotent and resumable, never assumed to complete.

iOS has no Headless JS equivalent. Background execution there goes through platform mechanisms — `BGTaskScheduler` for deferred work and silent push (`content-available`) handled in native code — with iOS deciding when, and whether, your app gets CPU time.

**Say it:** "Headless JS is Android-only — a HeadlessJsTaskService running a JS task with no UI, bounded by a timeout and Doze; on iOS the same requirement means BGTaskScheduler or silent push handled natively."
**Red flag:** Presenting Headless JS as a cross-platform background solution — proposing it for iOS shows you haven't shipped background features; name the iOS-native path unprompted.

### Fabric
**They ask:** "What is Fabric, and what does it actually change compared to the old renderer?"

Fabric is the new architecture's rendering system, and its core move is architectural: the shadow tree — React's representation of the UI — now lives in C++ and is shared across iOS and Android, instead of being duplicated per platform behind the bridge. That single change unlocks the rest. Because JS, the C++ renderer, and the host platform share memory through JSI, the renderer can create, lay out, and commit views synchronously when a scenario demands it — measuring a view before first paint, or rendering urgent updates without a frame of async lag. The shadow tree is immutable and can be prepared off the main thread, which is what makes React 18's concurrent features (transitions, interruptible rendering) work in React Native rather than being web-only.

Fabric also carries renderer-level optimizations such as view flattening — collapsing layout-only intermediate views so the native hierarchy stays shallow — and it renders host components described by codegen specs, pairing with TurboModules and JSI as the three pillars of the new architecture. The new architecture, with Fabric as its renderer, became the default with React Native 0.76.

**Say it:** "Fabric moves the shadow tree into shared C++ and connects it to JS via JSI, so the renderer can commit synchronously when needed and support concurrent React — that's the difference, not just 'a faster renderer.'"
**Red flag:** Answering "Fabric makes rendering faster" with no mechanism — name the C++ shared shadow tree and synchronous commit capability, or the interviewer reads it as blog-post knowledge.

### JSI
**They ask:** "What is JSI, what problems does it solve, and where have you seen it used in production?"

JSI is the foundation the entire new architecture stands on: a thin C++ abstraction over the JavaScript engine that lets JS and native hold direct references to each other's objects — HostObjects and host functions — instead of exchanging serialized messages. Its benefits are exactly the bridge's costs inverted: calls can be synchronous, there is zero serialization (large payloads like frames or query results are accessed by reference, not copied), the same C++ core is shared across iOS and Android, and it is engine-agnostic — Hermes or JSC behind the same interface, which is what made the Hermes rollout possible without rewriting modules.

The production proof points are the libraries every senior RN engineer has touched: Reanimated runs worklets on the UI thread through JSI so animations survive a busy JS thread; react-native-mmkv reads and writes storage synchronously — viable only because there's no bridge round-trip; VisionCamera frame processors hand camera frames to JS-driven logic without copying megabytes per frame through JSON.

The discipline JSI demands: synchronous calls execute on the JS thread, so a slow synchronous native call now blocks React directly. Synchronous is a capability to use deliberately — fast reads, not heavy work.

**Say it:** "JSI replaces serialized bridge messages with direct references — synchronous, zero-copy, engine-agnostic — and it's what makes Reanimated worklets, MMKV's sync storage, and VisionCamera frame processors possible."
**Red flag:** Concluding "so everything should be synchronous now" — a slow sync call blocks the JS thread harder than the bridge ever did; reserve synchronous JSI calls for cheap reads and keep heavy work async or off-thread.

## Debugging

### React Native Debugger
**They ask:** "You've used React Native Debugger — walk me through how it worked, and what you'd use today. How do you handle a non-default Metro port?"

Answering this with only the standalone app signals a stale toolchain — the entire mechanism it depended on has been removed from React Native. The standalone React Native Debugger was an Electron shell combining Chrome DevTools, React DevTools, and Redux DevTools in one window. It rode on **remote JS debugging**: your JavaScript stopped executing on the device engine and ran instead in a desktop V8 via a WebSocket proxy. That architecture was the tool's fatal flaw — timing, available APIs, and JIT behavior differed from Hermes/JSC on-device, so bugs disappeared (or appeared) only while debugging. React Native deprecated remote debugging and removed it entirely in 0.79, which killed the standalone app's connection model.

The current answer is **React Native DevTools**, the default since RN 0.76: Hermes speaks the Chrome DevTools Protocol directly, so breakpoints, the profiler, and React DevTools all attach to the *real* on-device engine — zero-fidelity-loss debugging. Ports: Metro defaults to `8081`; run `npx expo start --port 8082` (or `npx react-native start --port 8082`) for a custom port, and for a physical Android device map it back with `adb reverse tcp:8081 tcp:8081`. DevTools discovers debug targets through Metro's endpoint, so the Metro port is the only port that matters.

**Say it:** "React Native Debugger depended on remote debugging — JS ran in desktop V8, not the device engine — which is why RN removed it; today I use React Native DevTools, which debugs Hermes on-device over CDP with full fidelity."
**Red flag:** Presenting the standalone RN Debugger as your current daily tool — remote debugging no longer exists in modern RN; name React Native DevTools as your primary and the old app as historical context.

### Flipper
**They ask:** "Teams still have Flipper in their setup docs. What did it give you, how did the device connection and certificates work, and what replaces it now?"

Flipper matters in interviews as a migration question: it was Meta's extensible desktop debugger, it's deprecated, and a senior candidate should know both its plugin model and its replacements. Flipper was a desktop app with a **plugin architecture** — network inspector, layout/view-hierarchy inspector, shared preferences and database viewers, crash reporter — where each plugin paired a desktop UI with a small native client in the app. The connection was its distinctive engineering: the app discovered the desktop over the platform bridge (ADB on Android, idb on iOS simulators) and performed a **certificate-exchange handshake** — the app generated a signing request, shipped it through the device bridge, and Flipper returned a signed client certificate so all subsequent traffic ran over mutually-authenticated TLS. When connections failed, the fix was usually re-running that cert exchange (clearing the app's Flipper certs) or ensuring the ADB/idb bridge could reach the desktop's listening ports.

Meta deprecated the React Native integration and RN 0.74's new-project template shipped without Flipper. Today the stack is split by concern: **React Native DevTools** for JS/React debugging, **Reactotron** for app-level event/state timelines, and a proxy — Charles, Proxyman, or mitmproxy — for network inspection, which also covers native-layer requests Flipper's JS-side network plugin missed.

**Say it:** "Flipper's value was its plugin model over a cert-exchanged TLS channel via ADB/idb; since its deprecation and removal from the RN template, I split those concerns across RN DevTools, Reactotron, and a TLS proxy like Proxyman."
**Red flag:** Recommending Flipper for a new project in 2026 — it's unmaintained as an RN default; show you know the deprecation and name the per-concern replacements instead.

### Logcat
**They ask:** "A native Android module misbehaves only in the release build. How do you debug it with Logcat, and how does that differ from a debug build?"

Logcat is the ground truth on Android: it's the one stream that keeps talking after the JS console, the debugger, and dev menus are all gone — which is exactly the release-build scenario. Fluency means filtering, because raw logcat is firehose. The core moves:

```bash
# JS-side logs only (tag ReactNativeJS, silence everything else)
adb logcat ReactNativeJS:I *:S
# Everything from just your app's process
adb logcat --pid=$(adb shell pidof -s com.yourapp)
# Native crash context
adb logcat *:E
```

Tag filters take `tag:priority` (V/D/I/W/E/F, `S` = silent); Android Studio's Logcat window gives the same per-process filtering with a UI. The debug/release distinction is where seniority shows: in release, your JS is minified so `console.log` output and stack traces become near-useless — but **native `Log.d`/`Log.e` calls in your module still emit** (unless R8/ProGuard rules strip them), so instrumenting the native side is how you see into a release build. For hard failures, go below Logcat's live stream: native crashes write **tombstones** (signal, faulting address, native stack), and ANRs dump main-thread traces — both surface in the crash buffer (`adb logcat -b crash`) and via `adb bugreport`.

Framework for the release-only bug: 1. Reproduce on a release build with `adb logcat --pid` attached. 2. Add temporary `Log.e` instrumentation in the native module (it survives minification). 3. If it's a crash, read the tombstone stack; if an ANR, read the main-thread trace. 4. Fix, then remove or gate the instrumentation.

**Say it:** "In release builds the JS console is minified away, so I debug native modules through Logcat — pid-scoped filters, native Log calls that survive R8, and tombstones or ANR traces for hard failures."
**Red flag:** Saying you'd reproduce the bug in a debug build and assume the fix transfers — release-only bugs are usually *caused* by the release configuration (R8 stripping, missing keep rules), so you must observe the release build itself via Logcat.

## Timers

### requestAnimationFrame
**They ask:** "Why would you drive a JS-side animation with requestAnimationFrame instead of setInterval with a 16ms delay? Aren't they the same thing?"

They are not the same, and choosing wrong is a direct cause of dropped frames and wasted work on a loaded JS thread. `requestAnimationFrame` is frame-synchronized: React Native's polyfill schedules the callback to run exactly once per frame tick of the JS thread, right before the frame is produced, and passes a timestamp you can use for time-based interpolation. If the JS thread stalls and frames are not being produced, RAF simply fires less often — one callback per actual frame, never a backlog.

`setInterval(fn, 16)` is wall-clock scheduling with no knowledge of frames. Three failure modes follow: (1) 16ms is not 16.67ms, so it drifts against the 60Hz refresh — callbacks land mid-frame and their visual result waits for the next one; (2) when the JS thread is busy, queued timer callbacks pile up and then fire in a burst, doing several updates for a single rendered frame — pure wasted computation; (3) on 120Hz displays the mismatch doubles. RAF coalesces all of this to real frame boundaries for free.

The senior reframe: any per-frame JS callback — RAF included — still competes with the rest of the JS thread, so for animations the real fix is moving them off that thread entirely (Reanimated worklets on the UI thread, or the Animated native driver). RAF is the correct primitive when frame-synced JS work is genuinely required.

**Say it:** "setInterval fires on wall-clock time and queues behind a busy JS thread; requestAnimationFrame coalesces to actual frame boundaries — one callback per rendered frame, never a backlog."
**Red flag:** Saying "they're equivalent because 16ms is one frame" — that ignores drift, queueing under load, and refresh rates above 60Hz; state that RAF is frame-synchronized while setInterval is time-based.

### InteractionManager
**They ask:** "A screen janks during its navigation transition because it fetches and renders heavy data on mount. How does InteractionManager solve this, and how does it know when the transition is over?"

The failure mode is architectural: expensive JS work scheduled during a transition competes with the animation's frame callbacks on the single JS thread, so the transition stutters. `InteractionManager.runAfterInteractions(fn)` defers that work until all active interactions have finished — keeping the transition at 60fps and running the heavy work immediately after.

Mechanically, it is a handle-based registry, not magic: an animation or gesture registers itself with `createInteractionHandle()` and releases the handle via `clearInteractionHandle()` when done (the Animated API does this internally). While any handle is open, deferred callbacks wait; when the count hits zero, the queue flushes. The classic pattern:

```js
useEffect(() => {
  const task = InteractionManager.runAfterInteractions(() => {
    loadHeavyData();
  });
  return () => task.cancel();
}, []);
```

The current-state nuance a senior should add: Reanimated worklets and native-driver animations run on the UI thread and do not register interaction handles, so `runAfterInteractions` may resolve while such a transition is still visually running — it only tracks JS-side handles. For navigation specifically, React Navigation's transition-end events (`useFocusEffect` plus its transition lifecycle) are the more precise deferral point. InteractionManager remains the general-purpose answer for "defer JS-thread work until JS-side interactions finish."

**Say it:** "runAfterInteractions defers expensive JS work until every registered interaction handle is released — it protects the transition's frame budget on the JS thread."
**Red flag:** Claiming InteractionManager detects animations automatically — it only sees handles explicitly registered on it, so UI-thread animations (Reanimated, native driver) are invisible to it; name that limitation and offer transition-end events as the precise alternative.

## Permissions

### App Permissions
**They ask:** "Walk me through how you handle a camera or location permission in React Native — what differs between iOS and Android, and how do you deal with a user who denied it?"

Permissions are a one-shot UX resource: mishandle the first request and the platform locks you out of asking again, so the architecture is check → explain → request, never request-on-launch. On iOS every protected API needs a purpose string in `Info.plist` (`NSCameraUsageDescription`, etc.) — accessing the API without one kills the app. The system prompt appears once; after a denial only the user flipping it in Settings can recover, so deep-link there with `Linking.openSettings()`. iOS also has partial grants: limited photo-library access, provisional (quiet) notifications, and approximate vs precise location — code must treat "granted" as a spectrum, not a boolean. On Android, dangerous permissions moved from install-time to runtime at API 23; `shouldShowRequestPermissionRationale` tells you when to show an explainer, and repeated denials become permanent denial with no further prompt. Since API 30 the OS auto-resets permissions of unused apps (hibernation), and API 33 made notifications an explicit runtime permission (`POST_NOTIFICATIONS`). `react-native-permissions` normalizes all this into one status model — `unavailable / denied / blocked / granted / limited` — where `denied` means "can still ask" and `blocked` means "only Settings can fix it."

**Say it:** "I always `check` before I `request`, ask in context right before the feature needs it, and treat `blocked` as a Settings deep-link, not another prompt."
**Red flag:** Saying you'd request all permissions at app launch — that burns the one system prompt without context and inflates denial rates; request lazily, at the moment the feature is invoked, with a rationale first when the platform signals one is needed.

## Network

### TLS Pinning
**They ask:** "How would you implement certificate pinning in a React Native app on both platforms, and what operational risks does it introduce?"

Pinning exists because TLS alone trusts every CA on the device — a compromised CA or a user-installed root (corporate proxy, malware) lets an attacker MITM your API traffic; pinning narrows trust to keys you control. Pin the **SPKI public-key hash**, not the leaf certificate: certificates rotate on renewal, but if you re-key with the same key pair the SPKI pin survives, so you don't ship an app update for every cert renewal.

Mechanically, RN's networking rides on the native stacks, so you pin there: on Android, OkHttp's `CertificatePinner` or the Network Security Config XML (`<pin-set>`); on iOS, `URLSession`'s `didReceiveChallenge` trust evaluation or a library like TrustKit. Community wrappers such as `react-native-ssl-pinning` package this, and in Expo you apply the native config through a config plugin — the library's own, or a custom plugin that writes the Network Security Config / TrustKit setup — rather than ejecting. (`expo-build-properties` won't do it: it only adjusts build-time Gradle/Pod settings, it never touches certificate validation.)

The trade-off is operational: pinning is a self-imposed availability risk. Always ship at least one **backup pin** for a key held offline, and plan rotation before the pinned key changes — otherwise a routine certificate change bricks every installed client until users update. Pinning also breaks MITM-proxy debugging (Charles/Proxyman), so teams typically disable it in debug builds.

**Say it:** "I pin the SPKI public-key hash at the native layer — OkHttp CertificatePinner on Android, URLSession challenge handling or TrustKit on iOS — and I always ship a backup pin, because pinning without a rotation plan is a self-inflicted outage."
**Red flag:** Saying you'd pin the leaf certificate — that couples the app binary to a cert's expiry date; pin the public key (SPKI hash) with a backup pin so renewals and rotations don't brick deployed clients.
