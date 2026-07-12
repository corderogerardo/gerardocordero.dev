# React Native — Andersen matrix, junior→middle levels

## Interview questions

### Xcode and Android Studio setup
**They ask:** "A new hire can't get the app to build on either platform. Walk me through what actually has to be in place."

You lead here by naming the split: React Native builds two real native apps, so you maintain two native toolchains, not one JS project. Missing either means one platform silently can't ship. On iOS you need Xcode plus its command-line tools and CocoaPods (`pod install` links native deps into the `.xcworkspace`). On Android you need Android Studio for the SDK, an emulator image, and a JDK, with `ANDROID_HOME`/`JAVA_HOME` on the path so Gradle resolves.

Mechanically, the fastest triage is: does `npx expo run:ios` / `run:android` build? If iOS fails at pods, it's CocoaPods; if Android fails, it's usually SDK path or JDK version. Splash screen and app icon are configured through `expo-splash-screen` and the icon fields in `app.json` (or `expo prebuild` into native projects), not by hand-editing asset catalogs.

**Say it:** "React Native ships two native apps, so I keep both toolchains healthy — Xcode plus CocoaPods for iOS, Android Studio SDK plus JDK for Android — and configure splash and icon through Expo config, not native files."
**Red flag:** "I just run `npm start`." Metro serving JS doesn't prove either native build works — the interviewer wants the native prerequisites.

### Bare workflow
**They ask:** "What is the bare workflow, and when would you choose it?"

The why: bare workflow gives you the `ios/` and `android/` native projects checked into the repo, so you control native code directly while still using Expo's libraries and modules. You reach for it when you need custom native code or a native dependency that isn't config-plugin-friendly, and you're willing to own native builds.

Mechanically it's the same Expo SDK — `expo-camera`, `expo-notifications`, etc. still work — but there's no invisible native layer: you run the native build yourself, and upgrades touch native files. Today the line is blurrier than it used to be, because Continuous Native Generation (`expo prebuild`) can regenerate those native folders from config, so many teams stay "managed" and only prebuild when needed rather than committing native folders permanently.

**Say it:** "Bare means the native projects live in the repo so I can drop into native code, at the cost of owning native builds and upgrades myself."
**Red flag:** "Bare means you can't use Expo libraries." False — the Expo SDK works in bare projects; the difference is who owns the native folders.

### Managed workflow
**They ask:** "How does the managed Expo workflow work day to day, from CLI to a running project?"

Managed workflow's value is that Expo owns the native layer, so your team works in JS/TS and configuration, and native builds happen through EAS Build in the cloud rather than on each developer's machine. That removes a whole class of "works on my machine" native-toolchain friction.

Day to day: `npx create-expo-app` scaffolds it, `npx expo start` launches Metro, and you run on a device via a development build (`expo-dev-client`) rather than Expo Go once you have custom native modules. Environment variables come through `app.config.js`/`.env` and are surfaced via `expo-constants` or `EXPO_PUBLIC_` prefixed vars; secrets belong in EAS, not the bundle. Native configuration — permissions, icons, plugins — is declared in `app.json`/`app.config.js` and applied at prebuild.

**Say it:** "Managed means I stay in JS and config while Expo generates the native layer, so I build with EAS instead of maintaining native toolchains per developer."
**Red flag:** "I test everything in Expo Go." Expo Go can't load custom native modules — for anything real you use a dev client build.

### Expo CLI commands
**They ask:** "Which CLI commands do you actually run in a normal RN/Expo day, and what does each do?"

The senior framing: the CLI is how you drive Metro, native builds, and config, and knowing the right command saves you from reaching for native tooling unnecessarily. `npx expo start` boots the Metro dev server; `--clear` resets Metro's cache when a stale transform bites. `npx expo run:ios` / `run:android` compile and install a native dev build locally. `npx expo prebuild` generates the native projects from your config.

For dependencies, `npx expo install <pkg>` is the one to use over plain `npm install` because it pins versions compatible with your Expo SDK — a subtle correctness issue people miss. Builds and submissions go through `eas build` and `eas submit`. The old `react-native link` is gone; autolinking handles native module registration now.

**Say it:** "I use `expo install` to keep native deps SDK-compatible, `expo start --clear` when Metro caches bite, and `expo run:*` for local native builds — autolinking means I never manually link."
**Red flag:** "I still run `react-native link`." It's deprecated — autolinking wires native modules automatically since RN 0.60.

### Metro bundler
**They ask:** "What is Metro, and what breaks when it misbehaves?"

Metro is React Native's JavaScript bundler and dev server — the reason it matters is that it does the fast refresh, module resolution, and transform that turn your source into the bundle the JS engine runs. When it caches a stale transform or resolves the wrong module, you get phantom errors that survive code changes.

Mechanically Metro resolves the dependency graph from your entry file, transforms each module (Babel), and serves an incrementally-updated bundle over the dev server; in production it emits a single minified bundle. Config lives in `metro.config.js` — that's where you add extra asset extensions, monorepo `watchFolders`, or SVG transformers. First move when Metro acts weird: `npx expo start --clear` to nuke the cache.

**Say it:** "Metro is the bundler and dev server that graphs, transforms, and hot-reloads my JS — so when changes don't take, I clear its cache before suspecting my code."
**Red flag:** "Metro is like Webpack for the browser." Close but it's purpose-built for RN — it handles native asset resolution and platform-specific extensions Webpack doesn't.

### React Navigation basics
**They ask:** "How do you structure navigation with React Navigation — stacks, tabs, drawers?"

React Navigation is the community-standard router, and the senior point is that navigators compose: you nest a stack inside a tab inside a drawer to model real app hierarchy, not pick one. A `NavigationContainer` wraps the tree; inside it, `createNativeStackNavigator` gives push/pop screens, `createBottomTabNavigator` gives the tab bar, `createDrawerNavigator` gives the side menu.

The common pattern is a tab navigator as the root, each tab holding its own stack so back behavior is per-tab, with a drawer or auth stack above. You pass data via `navigation.navigate('Screen', { id })` and read it with `route.params`. Use the native stack (`@react-navigation/native-stack`) over the JS stack because it renders with real platform navigation primitives — smoother transitions and correct gestures.

**Say it:** "I compose navigators — tabs at the root, a stack per tab, an auth stack above — and prefer the native stack so transitions use real platform primitives."
**Red flag:** "I put everything in one giant stack." That flattens hierarchy and breaks per-tab back stacks; nest navigators to match the app's structure.

### React Native Navigation basics
**They ask:** "What's React Native Navigation, and how does it differ from React Navigation?"

React Native Navigation (Wix's `react-native-navigation`) is an alternative router whose distinguishing role is that navigation is fully native — each screen is a real native view controller / fragment, not a JS-managed view. That buys you native performance and platform-correct transitions out of the box, at the cost of a heavier native setup and no Expo-managed support.

Mechanically you register screens with `Navigation.registerComponent` and drive them with imperative calls like `Navigation.push` and `setRoot`, rather than React Navigation's declarative component tree. The trade-off is real: RNN's native rendering can feel snappier on complex stacks, but React Navigation with `react-native-screens` now also uses native primitives and has far broader adoption and Expo compatibility, which is why most new projects pick it.

**Say it:** "React Native Navigation renders each screen as a real native container for native-level performance, but it needs bare native setup — I default to React Navigation with native-stack unless a project specifically needs RNN."
**Red flag:** Treating them as interchangeable. RNN is imperative and native-registered; React Navigation is declarative React components.

### AsyncStorage basics
**They ask:** "What is AsyncStorage and what should you never use it for?"

AsyncStorage is the simple, unencrypted, asynchronous key-value store for persisting small bits of data across launches — its whole reason for being is lightweight persistence like a theme choice or a "seen onboarding" flag. The senior caveat leads: it is not secure and not for large or relational data.

Mechanically it's a promise-based string store, so you `JSON.stringify` on write and `JSON.parse` on read; keys and values are strings. Because it's async, you read it in an effect and hold the value in state. Never put tokens or PII in it — it's plaintext on disk; use secure storage for secrets. And don't treat it as a database; for lots of structured data reach for SQLite or MMKV.

**Say it:** "AsyncStorage is an unencrypted async key-value store for small non-sensitive data — I stringify objects, and I never keep tokens or large datasets in it."
**Red flag:** "I store the auth token in AsyncStorage." It's plaintext — tokens belong in Keychain/Keystore via secure storage.

### requestAnimationFrame
**They ask:** "When would you use requestAnimationFrame instead of setTimeout?"

The why: `requestAnimationFrame` schedules your callback to run right before the next screen repaint, so animation work is synced to the display's frame cadence instead of an arbitrary millisecond guess. That gives smoother motion and, importantly, the browser/engine pauses it when the view isn't visible, so you don't burn cycles animating offscreen.

`setTimeout(fn, 16)` looks equivalent but drifts — timers aren't aligned to frames, so you get stutter and wasted work. Use `requestAnimationFrame` for per-frame JS-driven updates (measuring, stepping a value), and cancel it with `cancelAnimationFrame` on unmount. That said, for real UI animation in RN you push work off the JS thread entirely with Reanimated or `useNativeDriver`, because even frame-aligned JS jank if the thread is busy.

**Say it:** "requestAnimationFrame runs my callback in sync with the display refresh instead of a guessed timeout, so motion is smooth and pauses when offscreen — but heavy animation still belongs off the JS thread."
**Red flag:** "They're the same thing." setTimeout isn't frame-aligned and keeps firing offscreen; rAF is tied to the repaint cycle.

### Flexbox layout
**They ask:** "How does layout work in React Native — how is it different from CSS flexbox on the web?"

React Native lays out everything with Flexbox because there's no document flow or floats — Flexbox is the layout engine, so understanding main vs. cross axis is non-negotiable. The key difference that trips people: `flexDirection` defaults to `column` in RN (web defaults to `row`), matching how phone screens are tall.

Mechanically, `flexDirection` sets the main axis, `justifyContent` distributes children along it, `alignItems` positions them on the cross axis, and `flex: 1` tells a view to fill available space. Dimensions are unitless density-independent pixels, not `px`/`rem`. There's no `grid` and no percentage-heavy float layouts — you compose nested flex containers. `flexWrap` handles multi-row layouts.

**Say it:** "RN uses Flexbox as its only layout engine, with flexDirection defaulting to column — so I think in main and cross axis, and compose nested flex containers instead of reaching for grid or floats."
**Red flag:** "flexDirection defaults to row like the web." In RN it's column — assuming row is a classic layout bug.

### Styled Components
**They ask:** "What do styled-components give you in RN, and what's the cost?"

The value is co-locating styles with components as real components, so a `<Button>` carries its own styling and variants through props — readable, themeable, and DRY across a design system. In RN it wraps `View`/`Text` and produces a `StyleSheet` under the hood.

Mechanically you write `styled.View\`...\`` with template literals, interpolate props for dynamic styles, and get a `ThemeProvider` for tokens like colors and spacing. The cost, which a senior names: there's runtime overhead parsing template strings and creating components, and it's an extra dependency versus RN's built-in `StyleSheet.create`. For high-frequency re-renders or perf-critical lists, that overhead can matter. Many teams now prefer compile-time styling (NativeWind/Tailwind or Unistyles) to keep authoring ergonomics without the per-render cost.

**Say it:** "Styled-components let me build a themeable component library with styles co-located as props, but I weigh their runtime cost against StyleSheet or a compile-time solution like NativeWind for hot paths."
**Red flag:** "It's free abstraction." There's real runtime cost — acknowledging it is the seniority signal.

### Dimensions API
**They ask:** "How do you get and respond to screen size in RN, and what's the gotcha?"

`Dimensions` reports the width/height of the screen or window, which you need for responsive layouts and percentage-of-screen sizing. The senior gotcha leads: a value read once at module load goes stale on rotation, foldables, split-screen, or font-scale changes — so you must subscribe to changes, not snapshot.

Mechanically, `Dimensions.get('window')` gives the app's drawable area and `'screen'` the physical display. The modern approach is the `useWindowDimensions` hook, which re-renders your component when dimensions change — that's preferred over `Dimensions.get()` precisely because it handles rotation automatically. If you do use `Dimensions.addEventListener`, remember to remove it. For safe-area insets specifically, use the safe-area context, not raw dimensions.

**Say it:** "I use the `useWindowDimensions` hook so layout recomputes on rotation and split-screen — a one-time `Dimensions.get()` read goes stale the moment the device rotates."
**Red flag:** "I read `Dimensions.get('window')` once and store it." It won't update on rotation — use the hook or subscribe.

### onLayout
**They ask:** "What is onLayout and why not just use Dimensions to size things?"

`onLayout` fires when a specific component's size and position are computed, giving you that element's actual measured dimensions — not the screen's. That's the point: you use it when you need a view's real size after layout (a card, a header) to drive something else, like positioning a tooltip or animating to a measured height.

Mechanically it's a prop: `onLayout={(e) => setHeight(e.nativeEvent.layout.height)}`, giving `{x, y, width, height}` relative to the parent. Because layout is asynchronous, these values aren't available on first render — which is exactly why `onLayout` exists rather than reading synchronously. It fires again on any layout change, so it stays correct across rotation and content changes.

**Say it:** "onLayout gives me a component's own measured size and position after layout resolves — I use it when I need real element dimensions, whereas Dimensions only tells me the screen size."
**Red flag:** "I calculate the view's height from Dimensions." Screen size isn't element size; onLayout measures the actual view.

### VirtualizedList vs ScrollView
**They ask:** "Why use FlatList over a ScrollView with a map for a long list?"

The core advantage is virtualization: `VirtualizedList` (which `FlatList`/`SectionList` build on) only mounts the rows near the viewport and recycles the rest, so memory and render cost stay bounded no matter how long the list is. A `ScrollView` with `.map()` mounts every row up front — a 1,000-item list renders 1,000 components immediately, blowing memory and startup time.

Mechanically, FlatList takes `data` + `renderItem`, mounts a window of rows, and unmounts them as they scroll off. Use ScrollView only for small, known-length content (a settings page). For big lists, FlatList — plus `keyExtractor`, memoized rows, and `getItemLayout` for fixed heights; for chat-scale recycling, FlashList.

**Say it:** "FlatList virtualizes — it only keeps on-screen rows mounted — so it stays flat in memory, while a ScrollView of mapped items renders everything at once and doesn't scale."
**Red flag:** "ScrollView is fine, I'll just paginate." Pagination hides the symptom; the real issue is ScrollView mounts all rows — virtualization is the fix.

### SafeAreaView
**They ask:** "How do you keep content out from under the notch and home indicator?"

Safe areas exist because modern devices have notches, dynamic islands, and gesture bars that would overlap your UI — so you inset content to the device's safe region rather than hardcoding padding per device. Hardcoding breaks the moment a new screen shape ships.

Mechanically, the reliable tool today is `react-native-safe-area-context`: `SafeAreaProvider` at the root and either `SafeAreaView` or the `useSafeAreaInsets()` hook to read top/bottom/left/right insets and apply them as padding. The hook is more flexible — you can inset only the edges you need (e.g. top for a header, bottom for a footer) instead of wrapping the whole screen. RN's built-in `SafeAreaView` is iOS-only and less capable, which is why the community package is standard.

**Say it:** "I use react-native-safe-area-context's insets to pad content into the safe region per device, applying only the edges I need — hardcoded padding breaks on the next new screen shape."
**Red flag:** "I add a fixed 44px top padding." That's a magic number that fails on the next device; read real insets.

### Animated API basics
**They ask:** "Walk me through a basic animation with RN's Animated API."

The Animated API is RN's built-in imperative animation system, and the beginner-level point is understanding the loop: you hold an `Animated.Value`, drive it with a timing/spring call, and bind it to a style. You start with a value (`useRef(new Animated.Value(0)).current`), animate it (`Animated.timing(value, { toValue: 1, duration: 300, useNativeDriver: true }).start()`), and interpolate it into a style like opacity or transform.

The one senior detail even at this level: `useNativeDriver: true`. It ships the animation to the native side so it runs on the UI thread and keeps going even if the JS thread is busy — the difference between smooth and janky. It only works for non-layout properties (opacity, transform), not width/height. Wrap the animated component in `Animated.View`.

**Say it:** "I create an Animated.Value, drive it with Animated.timing, interpolate it into a transform, and always set useNativeDriver so it runs on the UI thread and survives JS-thread work."
**Red flag:** "I animate width and height with the native driver." The native driver only supports transform and opacity — layout props fall back to the JS thread.

### Frame drops and Performance Monitor
**They ask:** "The app stutters. Using the Performance Monitor, how do you diagnose it?"

Frame drops mean the app failed to produce a frame in its budget, and the senior skill is reading which thread starved. The in-app Performance Monitor exposes exactly that: two FPS readouts — UI and JS. If UI FPS drops, the native/render side is overloaded (too many views, expensive layout). If JS FPS drops, your JavaScript thread is blocked (heavy computation, too many re-renders) and the app stops responding to taps.

The other readouts frame the cause: Views is the mounted native view count (bloat hurts UI FPS), RAM is memory pressure, and JSC is the JS engine's memory (or Hermes if you've switched). Diagnosis is: 1) open the monitor, 2) reproduce the jank, 3) note which FPS tanks, 4) profile that thread — React DevTools for JS re-renders, native profiler for UI.

**Say it:** "The Performance Monitor splits UI FPS from JS FPS — UI drops point at too many views or layout cost, JS drops point at a blocked JS thread, and Views/RAM/JSC tell me where the pressure is."
**Red flag:** "The phone is just slow." The monitor tells you exactly which thread starved — name it and profile that one.

### Provisioning profile
**They ask:** "What is a provisioning profile and what problem does it solve?"

A provisioning profile is Apple's answer to "is this specific build allowed to run on these devices with these capabilities?" — it's the glue that ties together your App ID, a signing certificate, entitlements (push, associated domains), and, for non-store builds, the list of allowed device UDIDs. Without a matching profile embedded in the app, iOS refuses to install it.

Mechanically it lives in the Apple Developer portal and gets embedded at build time. There are flavors: development (specific devices, debugging), ad-hoc (specific devices, no debugger), and App Store (distribution, no device list). The senior reality: you rarely hand-manage these — Xcode's automatic signing or EAS Build manages certificates and profiles for you, and most "it won't install" errors are a profile that doesn't include the device or the right entitlement.

**Say it:** "A provisioning profile authorizes a signed build to run with specific entitlements on specific devices — it links App ID, certificate, and capabilities, and I let Xcode or EAS manage it rather than hand-editing."
**Red flag:** "It's the same as the certificate." The certificate proves who signed; the profile authorizes what runs where — different jobs.

### Distribution certificate
**They ask:** "What's a distribution certificate and how does it differ from a development one?"

A distribution certificate is the cryptographic identity that proves your team signed an app for release — the App Store and users trust the binary because it carries a signature Apple issued to your account. It's the "who is publishing this" proof, distinct from the provisioning profile's "what may run where."

The distinction: a development certificate signs debug builds for your own registered devices; a distribution certificate signs release builds destined for the App Store or ad-hoc/enterprise distribution. The private key lives on your machine (or on EAS), and losing it means revoking and reissuing. The senior note: certificates are shared team assets — you store them centrally (EAS-managed credentials) rather than trapping the only copy on one laptop, which is a classic team-bus-factor failure.

**Say it:** "A distribution certificate is the signing identity that proves my team published the release build, versus a development cert that only signs debug builds for registered devices — and I keep it in EAS so it's not trapped on one machine."
**Red flag:** "Each developer makes their own distribution cert." Distribution signing is a shared team credential — decentralizing it causes signing conflicts.

### App validation
**They ask:** "What does 'validating' an app before submission actually check?"

Validation is the pre-flight gate that catches store-rejection issues before you burn a review cycle — it verifies the binary is well-formed and store-compliant so you don't wait days only to be bounced for something mechanical. It checks signing (valid certificate and profile), required Info.plist keys, entitlements matching the profile, supported architectures, asset catalog/icon completeness, and bundle-ID/version correctness.

Mechanically on iOS this is the Validate step in Xcode Organizer or `xcrun altool`/Transporter before upload; the App Store also re-validates on ingestion. On Android, Play Console validates the AAB signing and target-SDK requirements. The senior framing: validation catches the mechanical rejections (missing usage-description strings, wrong signing) — it does not catch content/guideline rejections, which are a human review. So a clean validation is necessary but not sufficient.

**Say it:** "Validation is the mechanical pre-flight — signing, entitlements, required plist keys, architectures — so I catch structural rejections before review, but it won't catch guideline or content issues, which are a separate human review."
**Red flag:** "If it validates, it'll pass review." Validation is structural only; content guidelines are reviewed separately.

### App Store distribution
**They ask:** "Walk me through getting an iOS app from build to the App Store."

The senior framing is that distribution is a pipeline with a human gate in the middle, so you design for iteration: build → upload → TestFlight → review → release. You archive a signed release build, upload it to App Store Connect (via Xcode, Transporter, or `eas submit`), where it lands in TestFlight for internal/external testing first — that's how you catch issues before the public sees them.

Then you attach the build to an App Store version, fill metadata (screenshots, description, privacy nutrition labels, age rating), and submit for review. Apple's human review checks guideline compliance; approval lets you release manually, on a schedule, or via phased rollout. The senior detail: build numbers must be monotonically increasing, and you separate "submitted to TestFlight" (automatic) from "pushed to public review" (deliberate) — auto-submit doesn't publish.

**Say it:** "iOS distribution is build → upload → TestFlight → human review → phased release, with monotonic build numbers — and I treat TestFlight as the safety net before anything reaches public review."
**Red flag:** "You upload and it's live." There's a mandatory human review, and TestFlight sits between upload and public release.

### Google Play distribution
**They ask:** "How does publishing to Google Play differ from the App Store?"

The key difference that leads: Play uses staged tracks (internal → closed → open → production) and Google signs the final app for you via Play App Signing, whereas Apple centers on TestFlight and one review. You upload an Android App Bundle (AAB, not APK) to Play Console; Google generates optimized per-device APKs from it.

Mechanically you promote a build up the tracks — internal testing is near-instant for the team, closed/open are beta cohorts, production is public. Review exists but is typically faster than Apple's and increasingly automated. With Play App Signing, you upload with an upload key and Google holds the app signing key, which decouples your key from the distributed binary. `versionCode` must increase monotonically. `eas submit` automates upload to a chosen track.

**Say it:** "Play distribution is AAB upload with staged tracks — internal to production — and Google re-signs via Play App Signing, versus Apple's single TestFlight-then-review flow with one distribution cert I control."
**Red flag:** "You upload an APK." Play requires an AAB now; Google generates device-specific APKs from it.

### APNs certificate
**They ask:** "What role does the APNs certificate play in iOS push notifications?"

The APNs certificate (or, better, an APNs auth key) is what authenticates your push server to Apple Push Notification service — Apple won't accept a push for your app unless the sender proves it's authorized for that bundle ID. It's the trust anchor between your backend and Apple's push infrastructure.

Mechanically your server holds the credential and connects to APNs to send a payload addressed to a device token; APNs then delivers to the device. The senior distinction: the older per-app `.p12` certificate expires yearly and is app-specific, while the newer `.p8` auth key (token-based) doesn't expire and works across all your apps — so you prefer the key. With Expo, `expo-notifications` plus EAS manages the APNs credential for you, so you rarely touch the raw file.

**Say it:** "The APNs credential authenticates my push server to Apple for a bundle ID — I use a token-based .p8 auth key over the legacy expiring certificate, and let EAS manage it."
**Red flag:** "The certificate goes in the app." It lives on your push server, not in the client — the app only holds a device token.

### Device token
**They ask:** "What is a device token and how does the push flow use it?"

A device token is the unique, per-app-per-install address that the OS's push service hands you so your backend knows where to deliver a notification — without it, there's no destination. The senior point: it's issued and owned by the platform (APNs on iOS, FCM on Android), not something you invent, and it can change, so you re-register and sync it.

The flow: on launch the app asks the OS to register for push; the OS returns a token; you send that token to your backend and store it against the user. To push, your server hands the token plus payload to APNs/FCM, which delivers to that device. Because tokens rotate (reinstall, restore, OS refresh), you must update the server on every launch and prune dead tokens when the service reports them invalid — otherwise you accumulate stale addresses.

**Say it:** "A device token is the platform-issued delivery address for one app install — I register it on launch, sync it to my backend every time, and prune it when APNs/FCM report it invalid, because tokens rotate."
**Red flag:** "Register the token once at signup." Tokens change on reinstall and OS refresh — sync on every launch or you'll push to dead addresses.

### React Native Debugger
**They ask:** "How do you inspect component state and network traffic while debugging RN?"

The senior framing is matching the tool to the layer: for JS-level inspection you want a debugger that shows the React component tree, props/state, and network requests in one place. React Native Debugger (the standalone app) bundled React DevTools, Redux DevTools, and a network inspector, so you could watch component re-renders and API calls together.

Mechanically you connect it to the Metro dev server, then use the Components tab to inspect the tree and the Network tab to see requests/responses. The important current-state caveat a senior adds: with the New Architecture and the move to Hermes, debugging has shifted toward the built-in React Native DevTools (launched from the dev menu, Chrome-DevTools-based) and the standalone React Native Debugger app is effectively legacy. So I name the tool but note DevTools is the going-forward path.

**Say it:** "I inspect the component tree and network in one debugger connected to Metro — historically React Native Debugger, but on the New Architecture I use the built-in React Native DevTools from the dev menu."
**Red flag:** Presenting the standalone React Native Debugger as the current standard. It's legacy now — the built-in DevTools superseded it.

### Flipper
**They ask:** "What was Flipper used for, and where does it stand now?"

Flipper was Meta's desktop debugging platform whose value was pluggable inspectors — network, layout, logs, databases, and crash reporting — all in one app attached to a running build. Teams used it to inspect AsyncStorage, watch network calls, and view the native layout hierarchy without separate tools.

The senior point is current context: Flipper was deprecated as the default in React Native (removed from the default template) as the ecosystem moved to the New Architecture and the built-in React Native DevTools / Hermes debugging. So I describe Flipper's model — extensible native+JS inspection via plugins — but flag that new projects shouldn't build their debugging story around it. It still exists and can be added back, but it's no longer the recommended path.

**Say it:** "Flipper was a plugin-based desktop inspector for network, layout, and storage, but it's been deprecated from the RN default — I reach for the built-in React Native DevTools now."
**Red flag:** "I'd set up Flipper as the primary debugger." It's no longer the default or recommended tool — mention the built-in DevTools instead.

### Logcat
**They ask:** "How do you debug a native Android crash or log output?"

Logcat is Android's system log stream, and the senior reason to reach for it is that JS-side tools go blind at the native boundary — when the app crashes in native code or a native module misbehaves, the JS console shows nothing, but Logcat shows the native stack trace and system messages. It's your window into the Android runtime.

Mechanically you view it with `adb logcat` or in Android Studio, and you filter — by package, by tag, by level (Error/Warn) — because the stream is noisy. For an RN crash, you grep for your package name and the fatal exception. The senior detail: debug a debug build first — a release build is minified/obfuscated by R8, so its native traces are unreadable without mapping files. Start with debug + Logcat, use mapping files only for release-only crashes.

**Say it:** "Logcat is Android's native log stream — I use `adb logcat` filtered to my package to see native stack traces the JS console can't, and I debug the debug build first because R8 obfuscates release traces."
**Red flag:** "I'd read the release crash trace directly." R8 obfuscates it — start with a debug build or you'll stare at unreadable frames.

### Animated composition and imperative animations
**They ask:** "Beyond a single fade, how do you compose complex animations with the Animated API?"

At this level the value is orchestration: the Animated API composes primitives so you can sequence and coordinate motion instead of chaining callbacks. `Animated.parallel` runs animations together, `Animated.sequence` runs them in order, `Animated.stagger` offsets their starts, and `Animated.spring`/`timing`/`decay` are the driving functions — spring for physical bounce, timing for duration-based, decay for momentum after a gesture.

Writing high-performance imperative animations means keeping work off the JS thread: set `useNativeDriver: true` (transform/opacity only), drive a single `Animated.Value` and `interpolate` it into multiple styles rather than animating many values, and use `Animated.event` to map gesture/scroll input straight to a value natively. The trade-off a senior names: Animated is capable but JS-thread-bound for layout properties, which is exactly why Reanimated exists — so I reach for Reanimated when animations must survive a busy JS thread or react to gestures on the UI thread.

**Say it:** "I compose with parallel, sequence, and stagger over spring/timing/decay, driving one interpolated value with the native driver — and I move to Reanimated when the animation must run on the UI thread regardless of JS load."
**Red flag:** "Animated always runs on the native thread." Only transform/opacity with useNativeDriver do; layout-property animations run on the JS thread and jank under load.

### Reanimated declarative API
**They ask:** "Why Reanimated over the Animated API, and how does its model differ?"

Reanimated's whole reason to exist is that animations run on the UI thread via worklets, so they stay smooth even when the JS thread is busy — the Animated API can't guarantee that for layout properties. It shifts you from imperative "start this animation" to a declarative model: shared values hold state, and the UI reacts to them automatically.

Mechanically, `useSharedValue` creates a value that lives on the UI thread; `useAnimatedStyle` declares a style derived from it; `withTiming`/`withSpring` animate it; and worklets (functions marked to run on the UI runtime) let gesture and animation logic execute natively without crossing the bridge each frame. That's the "nodes/declarative" model — you describe the relationship between value and style, and Reanimated keeps them in sync on the UI thread. Pair it with Gesture Handler and gestures drive animations with zero JS-thread involvement.

**Say it:** "Reanimated runs animations and gesture logic on the UI thread through worklets and shared values, so motion stays at 60fps even when JS is blocked — I declare a style derived from a shared value instead of imperatively starting animations."
**Red flag:** "Reanimated is just a faster Animated." The model is different — UI-thread worklets and declarative shared values, not imperative JS-thread driving.

### Gesture Responder System
**They ask:** "How do gestures work in RN, and how do you combine them with animation?"

The Gesture Responder System is RN's built-in negotiation for who owns a touch — the senior point is that touches are a shared resource and the system decides which component becomes the responder as a gesture moves. Views opt in via `onStartShouldSetResponder`/`onMoveShouldSetResponder` and then receive `onResponderMove`/`onResponderRelease`, so a parent and child can contend and hand off.

For real apps you rarely wire the raw responder callbacks; you use `react-native-gesture-handler`, which runs gesture recognition on the UI thread and composes cleanly with Reanimated. You drive a shared value from a `Gesture.Pan()` and feed it into `useAnimatedStyle`, so a drag updates position without touching the JS thread. The trade-off a senior names: the built-in system is fine for simple taps, but Gesture Handler is what makes swipe/drag animations smooth and interruptible.

**Say it:** "The responder system negotiates which view owns a touch, but I use Gesture Handler so recognition runs on the UI thread and drives Reanimated shared values directly — that's how drags stay smooth and interruptible."
**Red flag:** "I use PanResponder for everything." PanResponder runs on the JS thread and janks under load — Gesture Handler plus Reanimated is the performant path.

### Cross-platform animation optimization
**They ask:** "An animation is smooth on iOS but janky on Android. How do you approach it?"

The senior instinct is that iOS and Android have different rendering and thread characteristics, so "smooth on my iPhone" doesn't mean smooth everywhere — Android's wider device range and historically weaker mid-tier make it the harder target. The framework: 1) confirm which thread drops frames (UI vs JS via the Performance Monitor) on the failing device, 2) prove the cause — overdraw and shadow rendering are notoriously expensive on Android, as is animating layout props; 3) fix specifically.

Concretely: move animations to the UI thread (Reanimated/native driver), replace `elevation`/shadow-heavy layers, avoid animating width/height (use transform/scale), reduce overdraw and mounted view count, and enable Hermes for faster JS. Test on a real low-end Android device, not just a flagship or the simulator, because that's where the jank actually lives.

**Say it:** "I profile on the failing platform's real device, isolate UI-vs-JS frame drops, then fix the platform-specific cost — usually Android shadow/overdraw or layout-property animation — by moving to transform-based, UI-thread animation."
**Red flag:** "It works on my iPhone, ship it." Android's device range is where jank hides — test a real low-end Android before calling it done.

### React Navigation on web
**They ask:** "How do you make React Navigation work properly on the web?"

The senior framing is that on web, URLs are the contract — users bookmark, share, and hit back, so navigation state must map to real paths, not just an in-memory stack. React Navigation supports this through linking configuration: you define a `linking` object mapping screen names to URL patterns, and the container syncs navigation state with the browser address bar.

Mechanically you pass `linking={{ prefixes, config }}` to `NavigationContainer`; deep-link config translates `/users/:id` to a screen + params in both directions, so the back button and direct URL entry work. You also handle web-specific concerns: document title per screen, and choosing native-stack vs. a web-appropriate presentation. The senior note: get the linking config right and the same navigation tree serves mobile deep links and web routing from one source — which is the real payoff of the config-driven approach. (Expo Router builds on exactly this, file-based.)

**Say it:** "On web I drive React Navigation with a linking config so screens map to real URLs bidirectionally — the browser back button and shareable links only work if navigation state syncs to the address bar."
**Red flag:** "It just works on web." Without linking config the URL never changes, so back button, refresh, and shareable links break.

### react-native-screens and modals
**They ask:** "What does react-native-screens do, and how do modals and overlays fit in?"

The core win of `react-native-screens` is that it makes each screen a real native container (UIViewController / Fragment) instead of a plain JS-managed View — so off-screen screens are detached from the native view hierarchy, cutting memory and giving native transition performance. React Navigation enables it by default now, which is why native-stack feels native.

For modals and overlays, the distinction a senior draws: a modal is a screen presented over the current one (native-stack's `presentation: 'modal'` gives the platform-correct slide-up-and-dim), while an overlay is UI layered within the current screen (a toast, a bottom sheet) that doesn't participate in the navigation stack. You pick based on whether the content is a navigable destination (modal, in the stack, dismissible via back) or transient chrome (overlay, managed by component state). Mixing them up leads to back-button and focus bugs.

**Say it:** "react-native-screens backs each screen with a native container so off-screen ones detach — and I model true destinations as stack modals but transient chrome as in-screen overlays, because the difference decides back-button and focus behavior."
**Red flag:** "A modal and an overlay are the same thing." One is a navigable stack entry, the other is component-managed chrome — conflating them breaks dismissal and focus.

### AsyncStorage and state sync
**They ask:** "How do you keep AsyncStorage in sync with your React state without bugs?"

The senior framing is that AsyncStorage is async and your React state is sync, so the bug surface is the gap between them — read on mount into state, treat state as the source of truth during the session, and write back on change. If you read AsyncStorage directly in render or forget it's a Promise, you get flashes of default state or stale reads.

The pattern: on mount, `getItem` and hydrate state (guarding an initial loading flag so you don't render the wrong thing before hydration); on state change, `setItem` to persist. Debounce or batch writes for high-frequency updates so you're not hammering disk. The senior caveat: AsyncStorage isn't reactive and isn't shared across concurrent writers, so for anything beyond simple prefs you wrap it (e.g. `usePersistedState`) or move to MMKV/SQLite — and never store secrets in it.

**Say it:** "I hydrate state from AsyncStorage on mount behind a loading guard, treat state as the session source of truth, and persist changes back — debouncing writes — because the async-vs-sync gap is where the flicker and stale-read bugs live."
**Red flag:** "I read AsyncStorage directly in the component body." It returns a Promise — you'll render defaults first and it won't be reactive; hydrate into state in an effect.

### Secure Storage
**They ask:** "When do you use secure storage, and what are its trade-offs?"

Secure storage exists for one job: keeping secrets — auth tokens, refresh tokens, keys — out of plaintext by putting them in the platform's OS-protected keystore (iOS Keychain, Android Keystore/EncryptedSharedPreferences) — hardware-backed (Secure Enclave / TEE / StrongBox) when the device supports it, and software-encrypted as a fallback otherwise. The lead is the threat model: AsyncStorage is readable plaintext on a compromised or rooted device, so anything that grants account access belongs in secure storage.

The advantages: encryption at rest, OS-level access control, and optional biometric gating. The disadvantages a senior names honestly: it's slower and small-capacity (not for bulk data), the API is key-value only, values can be wiped on passcode removal or restored inconsistently across device migrations, and on a jailbroken device even the Keychain isn't absolute. In Expo you use `expo-secure-store`. So: secrets in secure storage, everything else in AsyncStorage/MMKV.

**Say it:** "Secure storage puts tokens and keys in the OS Keychain or Keystore with encryption and optional biometrics — hardware-backed when the device supports it — and I use it for anything that grants account access, keeping bulk non-secret data in AsyncStorage since secure storage is slow and small."
**Red flag:** "I'll just encrypt values myself in AsyncStorage." Rolling your own crypto with a key you also have to store is weaker than the OS vault — use secure storage.

### Linking native libraries
**They ask:** "How does linking native libraries work, and when do you link manually?"

The senior context is that linking is what registers a library's native code with the iOS and Android builds — historically manual and error-prone, now automatic. Since RN 0.60, autolinking discovers installed native modules and wires them into the build (CocoaPods on iOS, Gradle on Android), so `react-native link` is deprecated and you generally just install and rebuild.

Manual linking is the fallback you must still understand for edge cases: a library that isn't autolink-compatible, a monorepo with non-standard paths, or when you need to add a native dependency to the Podfile/Gradle by hand. Mechanically that means adding the pod/Gradle dependency, importing the native module, and registering it. In Expo, config plugins do this declaratively at prebuild instead of hand-editing native files. So: default is autolink + rebuild; manual/config-plugin only when a library needs it.

**Say it:** "Autolinking wires native modules into the iOS and Android builds automatically since 0.60, so I just install and rebuild — I only drop to manual linking or a config plugin when a library isn't autolink-compatible."
**Red flag:** "You always run react-native link after installing." It's deprecated — autolinking handles it; running it can double-register and break the build.

### JS-to-native bridge communication
**They ask:** "How does JavaScript actually communicate with native code in React Native?"

This is the architecture question, so lead with the model. Classically, JS and native ran on separate threads and talked over the asynchronous bridge: calls were serialized to JSON, batched, and passed across — which is why it was async and became a bottleneck for high-frequency work like gestures. The New Architecture replaces that with JSI (JavaScript Interface), a C++ layer letting JS hold direct references to native objects and call them synchronously, no serialization.

Mechanically: a native module exposes methods to JS; under the old bridge you'd get promises/callbacks and events via `NativeEventEmitter`; under the New Architecture, TurboModules are lazily-loaded native modules invoked through JSI, and Fabric renders views through the same layer. The senior framing: understanding the bridge-to-JSI shift explains why gestures, animations, and startup got faster — the serialization tax is gone.

**Say it:** "Classically JS and native talked over an async, JSON-serialized bridge — the New Architecture replaces it with JSI, a C++ layer that lets JS call native synchronously via direct references, which is why TurboModules and Fabric are faster."
**Red flag:** "Everything goes through the bridge." That's the old architecture — JSI removes the serialized bridge; saying it's still the only path signals you're behind on the New Architecture.

### Native UI components
**They ask:** "How do you expose a native view to React, and how do you debug it?"

A native UI component wraps a platform view (a native map, video player, or camera preview) so React can render and prop it like any component — you build one when JS-drawn views can't match native behavior or performance. On the native side you implement a view manager that creates the view and maps React props to native setters; on the JS side you get a component that takes those props.

Debugging is where the seniority shows, because the bug could be on either side. The framework: 1) confirm the layer — is the view not appearing (layout/registration) or misbehaving (prop mapping)? 2) use the native inspector — Xcode's view hierarchy debugger or Android Studio's Layout Inspector — to see if the native view even mounted and has non-zero bounds; 3) check prop bridging with native logs (Logcat / Xcode console). A common cause: a native view with zero measured size because Flexbox never gave it dimensions.

**Say it:** "A native UI component bridges a platform view through a view manager that maps React props to native setters — and I debug it with the native view-hierarchy inspector plus native logs, since a blank native view is usually zero-size layout or a prop that never bridged."
**Red flag:** "I'd debug it from React DevTools." DevTools stops at the JS boundary — native view issues need Xcode/Android Studio inspectors and native logs.

### Hermes engine
**They ask:** "What is Hermes and why would you enable it?"

Hermes is Meta's JavaScript engine purpose-built for React Native, and the reason it's now the default is startup and memory: it precompiles JavaScript to bytecode at build time, so the app skips parsing and compiling JS on the device at launch — measurably faster time-to-interactive and lower memory, especially on low-end Android.

Mechanically, instead of shipping JS source to be parsed by JavaScriptCore at runtime, the build produces Hermes bytecode that the engine executes directly. It also improves memory footprint and integrates with the New Architecture and the built-in debugger (Chrome DevTools protocol). The senior nuance: Hermes optimizes startup and memory, not raw peak throughput for long-running compute — JSC could win a tight numeric loop — but for typical app workloads the launch and memory wins dominate, which is why it's the recommended default.

**Say it:** "Hermes precompiles JS to bytecode at build time, so the device skips parse-and-compile at launch — that's faster startup and lower memory, especially on cheap Android, which is why it's the default now."
**Red flag:** "Hermes makes all JavaScript run faster." It targets startup and memory; a heavy compute loop isn't necessarily faster — be precise about what it optimizes.

### Headless JS
**They ask:** "What is Headless JS and when is it the right tool?"

Headless JS (Android) lets you run JavaScript tasks in the background with no UI attached — the point is executing work while the app isn't in the foreground, like syncing data or handling a geofence or a background push. You register a task and the OS can run it even when no activity is visible.

Mechanically you register a JS task with `AppRegistry.registerHeadlessTask`, triggered from a native service (often started by a broadcast or a background event), and it runs your JS to completion. The senior caveats: it's Android-only (iOS has its own background-execution model with strict OS limits), and both platforms aggressively constrain background work to save battery — you can't assume long or reliable background runs. So Headless JS is right for short, event-driven background jobs, and for anything cross-platform you'd typically reach for a background-task library that abstracts both OSes' constraints.

**Say it:** "Headless JS runs a registered JS task in the background on Android with no UI — good for short event-driven jobs like a sync, but it's Android-only and the OS caps background execution, so I don't rely on it for long-running work."
**Red flag:** "I'll use Headless JS for cross-platform background work." It's Android-specific; iOS background execution is a different, more restricted model.

### Fabric renderer
**They ask:** "What is Fabric and how does it differ from the old rendering system?"

Fabric is the New Architecture's rendering system, and the reason it matters is that it removes the serialized async bridge from rendering: it's a C++ core that builds the view tree and can commit layout synchronously through JSI, so UI updates and measurements no longer round-trip as batched JSON across threads. That enables things the old renderer couldn't do well — synchronous layout, better integration with native gestures, and concurrent React features.

The old (Paper) renderer sent view operations over the bridge asynchronously, which introduced latency and made it hard to keep native and JS view state consistent. Fabric maintains a shadow tree in C++ shared between threads, supports interop with the New Architecture's TurboModules, and improves list and animation smoothness. The senior framing: Fabric plus JSI plus TurboModules plus Hermes together are "the New Architecture" — Fabric is specifically the rendering half.

**Say it:** "Fabric is the New Architecture's C++ renderer that commits layout through JSI instead of the async JSON bridge, so UI can update synchronously and stay consistent with native — that's the rendering half of the New Architecture."
**Red flag:** "Fabric is a new component library." It's the rendering engine (the renderer), not components — confusing it with UI components misses the point.

### JSI
**They ask:** "What is JSI and why is it foundational to the New Architecture?"

JSI (JavaScript Interface) is the lightweight C++ layer that lets JavaScript hold references to native (C++/host) objects and call their methods directly — the foundational shift is that it removes the serialized, asynchronous bridge. Instead of encoding calls to JSON and batching them across threads, JS invokes native functions synchronously through direct references, which is what makes TurboModules and Fabric fast.

Mechanically JSI is engine-agnostic (works with Hermes or JSC) and exposes native capabilities as "host objects" JS can interact with as if they were normal JS objects. Because there's no serialization tax, high-frequency interactions — gestures, animations driven from JS, synchronous measurements — become viable on the UI thread. The senior framing: JSI is the plumbing everything else in the New Architecture sits on. TurboModules (native modules over JSI) and Fabric (rendering over JSI) are both consequences of JSI existing.

**Say it:** "JSI is the C++ layer that lets JS call native synchronously through direct object references instead of the JSON bridge — it's the foundation TurboModules and Fabric are both built on."
**Red flag:** "JSI is just a faster bridge." It's not a bridge at all — it eliminates serialization and gives direct synchronous references; calling it a bridge misses the architectural change.

### App permissions
**They ask:** "How do you handle runtime permissions so the app is store-compliant and doesn't get rejected?"

The senior framing is that permissions are both a UX and a store-review gate: you must request only what you use, at the moment you use it, with a clear reason — request everything up front or without justification and both users deny you and reviewers reject you. iOS requires a purpose string in Info.plist for each permission (missing `NSCameraUsageDescription` is an instant rejection); Android declares permissions in the manifest and requests dangerous ones at runtime since Android 6.

Mechanically you check status, request in context (right when the user taps "take photo"), and handle the denied and "never ask again" states gracefully — routing to settings rather than dead-ending. Libraries like `expo-camera`/`expo-location` or `react-native-permissions` normalize the cross-platform flow. The senior detail: pre-prompt with your own explainer before the OS dialog, because a system denial is often permanent.

**Say it:** "I request permissions in context with a clear purpose string, pre-prompt before the OS dialog, and handle denied and never-ask-again by routing to settings — asking for everything up front gets you denied by users and rejected by review."
**Red flag:** "Request all permissions at app launch." That tanks grant rates and fails review — request each one in context, right when the feature needs it.

### TLS pinning
**They ask:** "What is TLS/certificate pinning and what threat does it stop?"

TLS pinning hardens your network layer against man-in-the-middle attacks by trusting only a specific server certificate or public key, not the whole system trust store — the threat it stops is an attacker with a rogue-but-valid CA-issued certificate (corporate proxy, compromised CA, a user tricked into installing a root cert) intercepting your HTTPS traffic. Normal TLS trusts any cert a trusted CA signed; pinning narrows that to your cert.

Mechanically you embed your server's certificate or public-key hash in the app and reject any TLS handshake that doesn't match, even if the presented cert is otherwise valid. The senior trade-off you name: pinning is a real MITM defense but a rotation hazard — if your server cert changes and the app pins the old one, you brick connectivity for shipped clients. So you pin the public key (survives cert renewal), pin a backup key, and pair it with an OTA/update path. It's for high-value apps (banking, health), not every app.

**Say it:** "TLS pinning trusts only my server's specific key instead of the whole CA store, so a rogue valid certificate can't MITM me — but I pin the public key with a backup to avoid bricking clients on cert rotation."
**Red flag:** "Pin the leaf certificate and you're done." Cert renewal then breaks every shipped client — pin the public key, include a backup pin, and plan rotation.
