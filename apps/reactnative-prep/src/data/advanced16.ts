// Batch 16 — EAS Build profiles & credentials, EAS Update (OTA) channels and rollback, config plugins (mods), and the dev client vs Expo Go distinction.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";

export const ADVANCED16_FLASHCARDS: Flashcard[] = [
  {
    id: "a16-expo-eas-1",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `In eas.json, build profiles can extend one another. What does \`"extends": "production"\` actually inherit, and what's the precedence when a profile also sets its own keys?`,
    answerHtml: `<p><code>extends</code> exists so shared build config — credentials, resource class, autoIncrement — lives in one profile instead of being copy-pasted across every profile and drifting out of sync. Mechanically, a profile with <code>extends</code> inherits every field from the named base profile and then the child's own keys are merged on top, overriding only the keys it explicitly sets. It's a shallow merge per top-level key, not a deep recursive merge — so if the child redefines <code>env</code>, it replaces the whole <code>env</code> object rather than merging individual variables. This is why teams chain profiles like <code>preview</code> → <code>production</code> to avoid duplicating credentials/resource-class settings while only changing <code>distribution</code> or <code>channel</code>. (Chains can go up to 5 levels deep, and circular references are rejected.)</p>
<p><b>Red flag:</b> assuming <code>extends</code> deep-merges nested objects — redefining <code>env</code> in a child profile silently drops every variable the parent set instead of adding to them.</p>
<p><b>I chain profiles with <code>extends</code> so credentials and resource-class settings live in one place, and because it's a shallow merge, overriding <code>env</code> in a child means repeating every variable the parent still needs.</b></p>`,
  },
  {
    id: "a16-expo-eas-2",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `Why does \`eas.json\` typically have separate \`ios.resourceClass\` settings, and what's the tradeoff of \`large\` vs \`medium\`?`,
    answerHtml: `<p>iOS builds run on macOS workers, which are far more expensive to provision than Linux. <code>resourceClass</code> picks the macOS tier — valid values are <code>default</code>, <code>medium</code>, and <code>large</code> — trading build minutes/cost against CPU/RAM. <code>large</code> workers cut build time for big native dependency graphs (e.g. many config plugins triggering full prebuild + CocoaPods installs) but require a paid EAS plan and consume paid build credits faster. Free-tier and most CI profiles default to <code>medium</code>; production release profiles often bump up to <code>large</code> because a stalled or OOM-killed release build blocks a ship.</p>
<p><b>I default every profile to <code>medium</code> and only bump the production/release profile to <code>large</code> — a slow build costs minutes, a blocked ship costs a day.</b></p>`,
  },
  {
    id: "a16-expo-eas-3",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `What does \`appVersionSource: "remote"\` change about how \`buildNumber\`/\`versionCode\` are determined, and why is this the recommended setting over \`local\`?`,
    answerHtml: `<p><code>remote</code> is preferred because it guarantees a unique, monotonic build number without requiring a commit per build — <code>local</code> can silently collide. <code>local</code>'s role is: the number lives in <code>app.json</code>/native files and you own bumping it by hand, which is fragile across parallel CI runs or rebuilds of the same commit (two builds could collide on the same build number). <code>remote</code>'s role is: EAS itself tracks and increments the native build number/version code server-side per platform, independent of what's committed in <code>app.json</code>. Combined with <code>autoIncrement: true</code> on a profile, every build for that profile bumps the remote counter monotonically.</p>
<p><b>I use <code>appVersionSource: "remote"</code> with <code>autoIncrement</code> so the build number is a server-side guarantee, not something a teammate can forget to bump before a retry build.</b></p>`,
  },
  {
    id: "a16-expo-eas-4",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `A build profile sets \`"channel": "production"\`. What does this channel actually bind together, and how is it different from setting \`releaseChannel\` (the legacy field)?`,
    answerHtml: `<p><code>channel</code>'s role is indirection: it's baked into the native binary at build time and tells the running app which <b>branch</b> to pull updates from via a channel→branch mapping you control on the EAS dashboard/CLI (<code>eas channel:edit</code>), independent of the build. <code>releaseChannel</code>'s role, by contrast, was direct coupling — the legacy field belonged to the deprecated Classic Updates service (SDK 49 and earlier) and tied a build directly to one fixed channel name with no separate branch indirection, so you couldn't repoint it to different content without a rebuild. Channels let you repoint which branch a channel serves (e.g. roll <code>production</code> from branch <code>v2-rollout</code> back to <code>v1-stable</code>) without shipping a new binary — that indirection is the whole reason rollback and staged rollout are possible without a new build.</p>
<p><b>Channels give me a layer of indirection between a shipped binary and the content it serves — I can repoint what production users get without a rebuild, which the legacy releaseChannel never allowed.</b></p>`,
  },
  {
    id: "a16-expo-eas-5",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `What is the actual difference between an EAS Update channel and an EAS Update branch?`,
    answerHtml: `<p>A <b>branch</b> is an ordered history of published update bundles (like a git branch of JS/asset snapshots) — its role is to hold content. A <b>channel</b> is just a named pointer that maps to exactly one branch at a time — its role is to route clients to content, and it's that channel name (compiled into the binary via the build profile) that running apps query. Multiple channels can point at the same branch, and you can repoint a channel to a different branch instantly — that's the mechanism behind both staged rollouts and rollback: you're not un-publishing an update, you're moving the channel pointer (or branch HEAD) elsewhere.</p>
<p><b>A branch stores content, a channel routes clients to content — rollback is just moving the pointer, never un-publishing anything.</b></p>`,
  },
  {
    id: "a16-expo-eas-6",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `How does \`eas update --rollback-to-embedded\` differ from \`eas update:rollback\` (re-publishing a prior published update)?`,
    answerHtml: `<p>The two commands target different failure severities. <code>--rollback-to-embedded</code>'s role is a hard reset: it publishes a special rollback directive on the branch that tells client apps to discard any OTA update and fall back to the JS/assets that shipped embedded in the binary itself — useful when even the last-known-good OTA is suspect or you need to return to exactly what app-store review approved. <code>eas update:rollback</code>'s role is a softer revert: it re-publishes the previously-published update group on that branch (or falls back to rollback-to-embedded if there isn't one), serving a specific prior <i>OTA</i> bundle — faster to roll forward again but still subject to the same native-runtime compatibility constraints (native modules, runtime version) as any other update.</p>
<p><b>If I don't trust any recent OTA, I roll back to embedded for a hard reset; if the second-to-last OTA was fine, I roll back to that specific update instead — it's a matter of how far back I need to go.</b></p>`,
  },
  {
    id: "a16-expo-eas-7",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `Why can't an EAS Update safely change a native module's version or add a new native dependency, and what \`runtimeVersion\` mechanism prevents this from corrupting clients?`,
    answerHtml: `<p>OTA updates ship only JS, assets, and other JS-evaluable bundles — they cannot relink or recompile native code. If a published update assumes a native API that isn't present in the binary that downloads it, you get a runtime crash. <code>runtimeVersion</code> is the safety valve: each build embeds a runtime version (a fixed string, an SDK-version policy, or a fingerprint hash of the native layer), and the update server only serves updates whose <code>runtimeVersion</code> exactly matches the requesting client's. A native-incompatible JS change should therefore go out as a new build (new runtime version) rather than an OTA update.</p>
<p><b>OTA is a JS-and-assets channel, not a deployment mechanism for native code — anything that touches native modules needs a new build, because <code>runtimeVersion</code> will refuse to serve it to old binaries.</b></p>`,
  },
  {
    id: "a16-expo-eas-8",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `What is \`runtimeVersion: { policy: "fingerprint" }\` and why might a senior engineer prefer it over \`"sdkVersion"\` or a manually pinned string?`,
    answerHtml: `<p>A senior engineer prefers <code>fingerprint</code> because it makes runtime-version correctness automatic instead of a process the team has to remember to follow. It computes a hash over the actual native project state — installed native modules, config plugin output, native config — so the runtime version changes precisely when something that affects native compatibility changes, and only then. <code>sdkVersion</code> policy is coarser: it only changes across Expo SDK upgrades, so adding a native module mid-SDK-cycle wouldn't bump it. A manually pinned string requires the team to remember to bump it by hand on every native change, which is error-prone. Fingerprinting trades a bit of build-time computation for that correctness.</p>
<p><b>Red flag:</b> relying on the <code>sdkVersion</code> policy or a hand-pinned string and assuming it protects you from native drift — both can silently let an incompatible OTA update reach old binaries between SDK upgrades or forgotten manual bumps.</p>
<p><b>I use the fingerprint policy so runtime-version correctness doesn't depend on someone remembering to bump a string — it's derived from the native project itself.</b></p>`,
  },
  {
    id: "a16-expo-eas-9",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `Two builds were produced from the same commit but with different config plugin output (e.g. one had a plugin added after the first build). Will they share a \`runtimeVersion\` under the fingerprint policy, and what does that imply for update targeting?`,
    answerHtml: `<p>No — because fingerprinting cares about resolved native output, not source identity. Any plugin-driven change to native config (Info.plist keys, Android manifest entries, native package list) produces a different fingerprint even from the 'same' source commit if plugin behavior or config changed between builds. That means an OTA update published against one build's runtime version will not be offered to devices running the other build; they're treated as native-incompatible siblings, each needing updates matched to their own fingerprint.</p>
<p><b>Fingerprint tracks what the native project actually compiled to, not the commit it came from — two builds from the same commit can still be native-incompatible if a plugin's output changed between them.</b></p>`,
  },
  {
    id: "a16-expo-eas-10",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `What's the practical difference between \`eas credentials\` managed (Expo-hosted) credentials and providing your own via \`credentials.json\` with \`local\` credential source?`,
    answerHtml: `<p>Managed credentials optimize for zero-maintenance signing; <code>local</code> optimizes for control. Expo-managed credentials store your distribution certificate/provisioning profile (iOS) or upload/keystore (Android) on Expo's servers, auto-renew/regenerate as needed, and require no local secret files — \`eas build\` fetches them at build time per profile. <code>local</code> source instead reads a \`credentials.json\` you commit-exclude and maintain yourself, useful when org policy mandates HSM-backed or externally rotated keys, or when integrating with an existing non-EAS signing pipeline. The build profile's \`credentialsSource\` field (or per-profile override) picks between them; mixing is allowed per-platform.</p>
<p><b>I default to Expo-managed credentials for zero-maintenance signing, and only switch to local credentials.json when a compliance requirement forces control over the keys.</b></p>`,
  },
  {
    id: "a16-expo-eas-11",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `Why does \`eas.json\`'s \`submit.production\` profile typically carry no \`appleId\` or \`serviceAccountKeyPath\` in a well-set-up project, and what replaces them?`,
    answerHtml: `<p>The point is keeping submission secrets out of the repo and CI entirely, not just tidiness. Submission credentials (App Store Connect API key for iOS, Google Play service account JSON for Android) are uploaded once to EAS via <code>eas credentials -p ios|android</code> and stored server-side, scoped to the project. This means CI only needs an <code>EXPO_TOKEN</code> to authenticate as the project, and EAS injects the stored submit credentials itself — no Apple ID password, 2FA prompt, or service-account file needs to touch the repo or CI secrets. It also avoids App Store Connect API key files leaking into git history.</p>
<p><b>Submit credentials live on EAS, not in CI — the pipeline only needs EXPO_TOKEN, so there's no Apple ID or service-account JSON that can leak into a repo or log.</b></p>`,
  },
  {
    id: "a16-expo-eas-12",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `What is a config plugin's \`mods\` system, and why can't a config plugin just edit \`Info.plist\`/\`AndroidManifest.xml\` directly the way you'd edit a normal file?`,
    answerHtml: `<p>Direct file edits don't compose when many plugins touch the same file in one prebuild pass — <code>mods</code> exist to make that composable. They're async hooks (e.g. <code>mods.ios.infoPlist</code>, <code>mods.android.manifest</code>) registered against \`expo-cli\`'s prebuild pipeline that each receive the in-memory representation of a native config file (already parsed by upstream plugins), mutate it, and return it for the next mod in the chain. Editing the file directly would race with every other plugin doing the same, since prebuild runs many plugins (Expo's own + third-party) against the same files in one pass — \`withMods\` is what makes them composable instead of each plugin clobbering the others' edits. Multiple plugins can register a mod on the same file and each sees the previous plugin's transformed result.</p>
<p><b>Mods chain plugins against one in-memory representation of a config file instead of racing on the raw file, so ten plugins touching Info.plist compose instead of clobbering each other.</b></p>`,
  },
  {
    id: "a16-expo-eas-13",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `What's the difference between a config plugin and a 'static' plugin entry (a plugin referenced just by package name with no function), in terms of when each runs?`,
    answerHtml: `<p>The two run at different points in the native-build lifecycle. A function-based config plugin's role is prebuild-time mutation: it runs at <code>prebuild</code> time (locally via <code>expo prebuild</code> or as part of EAS Build's managed workflow) to mutate the generated native project before compilation — it has no effect once native code exists outside prebuild's control. A 'static' plugin's role (just listed by name) is really shorthand for one that ships its own plugin function inside the package (resolved automatically), or in some libraries is a marker consumed by autolinking with no prebuild-time mutation at all. The key distinction senior engineers care about: prebuild-time plugin output is regenerated from scratch on every prebuild, so any native edit not expressed as a plugin mod is silently lost on the next \`expo prebuild --clean\`.</p>
<p><b>If I need the native project to look a certain way, it has to be expressed as a plugin mod — anything else gets wiped the next time prebuild regenerates from scratch.</b></p>`,
  },
  {
    id: "a16-expo-eas-14",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `Why do config plugins commonly call \`withDangerousMod\`, and what's the actual risk that name is warning you about?`,
    answerHtml: `<p><code>withDangerousMod</code> gives a plugin a callback that runs against the actual native project directory on disk (arbitrary file reads/writes) after the native project is generated but before CocoaPods install, rather than the safe, typed, in-memory mod data (parsed plist/manifest objects) that other mods operate on. It's 'dangerous' because raw file/string manipulation doesn't compose or guarantee idempotency — if one dangerous mod expects original source text that a prior dangerous mod already changed, or the same mod runs twice, results can conflict, duplicate, or break the file outright, since there's no structured merge, only execution order. It's the escape hatch for native files Expo doesn't model as typed mods.</p>
<p><b>Red flag:</b> reaching for <code>withDangerousMod</code> by default instead of checking for a typed mod first — a standard mod like <code>withInfoPlist</code> or <code>withPodfile</code> composes safely with other plugins; raw file manipulation doesn't.</p>
<p><b>I only reach for <code>withDangerousMod</code> when no typed mod exists for that file — raw string edits don't compose with whatever the next plugin in the chain does.</b></p>`,
  },
  {
    id: "a16-expo-eas-15",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `If a project uses three third-party config plugins that all touch \`Info.plist\`, what determines the final merged result, and what's a common failure mode?`,
    answerHtml: `<p>Plugin execution order is determined by the order they're listed in \`app.json\`'s \`plugins\` array (plus Expo's own built-in plugins, which generally run first to establish baseline config). Each plugin's \`infoPlist\` mod receives the output of the previous one and returns its own mutation, so the final file is the result of sequential application, not a conflict-free three-way merge.</p>
<p><b>Red flag:</b> assuming Expo merges plugin output for you. Two plugins that each unconditionally overwrite the same key (e.g. \`NSCameraUsageDescription\` or a URL scheme array) instead of appending/merging will silently resolve to whichever plugin runs last — the earlier plugin's intended config is lost with no warning.</p>
<p><b>Plugin order in the array is the merge strategy — there's no conflict detection, so I check what a plugin does to a key before assuming it'll coexist with another plugin touching the same key.</b></p>`,
  },
  {
    id: "a16-expo-eas-16",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `What does \`expo prebuild --clean\` do differently from a plain \`expo prebuild\`, and why would CI/EAS Build always effectively do the 'clean' variant?`,
    answerHtml: `<p>Plain <code>prebuild</code> tries to apply plugin mods incrementally on top of existing <code>ios/</code>/<code>android/</code> directories, which can leave stale generated files if a plugin was removed or changed. <code>--clean</code> deletes the native directories first and regenerates them fully from \`app.json\`/plugins, guaranteeing the native project is a pure function of current config. EAS Build's managed (non-bare) workflow always generates native projects from a clean slate per build.</p>
<p><b>Red flag:</b> hand-editing a file inside <code>ios/</code> or <code>android/</code> and calling it done — any manual native edit not expressed as a config plugin mod gets silently discarded on the next clean prebuild, which is exactly why "it works locally but not in EAS Build" bugs happen.</p>
<p><b>If I need a native change to survive EAS Build, it has to be a config plugin mod — a hand-edited native file only survives until the next clean prebuild.</b></p>`,
  },
  {
    id: "a16-expo-eas-17",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `What's the core distinction between Expo Go and a custom development client (\`expo-dev-client\`), in terms of what native code is actually running on the device?`,
    answerHtml: `<p>The two solve different problems. Expo Go's role is a zero-setup sandbox: it's a single prebuilt binary, published by Expo, that bundles a fixed, curated set of native modules matching one SDK version — your JS runs inside it, but you cannot add or change native code. A dev client's role is a project-specific runtime: built with <code>expo-dev-client</code>, it's your own compiled binary (via \`expo run:ios\`/\`android\` or \`eas build --profile development\`) containing exactly the native modules your project's dependencies and config plugins declare, plus a dev-client wrapper (dev menu, fast refresh, update client) baked in. Any native module not present in Expo Go's fixed set — most custom config plugins, many third-party native libraries — requires a dev client.</p>
<p><b>Red flag:</b> treating Expo Go as "how the app really runs" once the project has any custom native module or config plugin. Once you cross that line, Expo Go is a stale environment — the dev client is the only one that reflects your actual dependency tree.</p>
<p><b>Expo Go is a shared sandbox with a fixed native module set; a dev client is my own binary built from my actual dependencies — the moment a project needs any custom native code, it needs a dev client.</b></p>`,
  },
  {
    id: "a16-expo-eas-18",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `Why does adding almost any non-Expo-curated native module force a project off Expo Go, even if the JS API surface looks identical?`,
    answerHtml: `<p>Expo Go ships with a closed, version-locked set of native modules compiled in at the time Expo builds it; it cannot load arbitrary native code at runtime (no dynamic native linking from JS). A third-party library with native iOS/Android code — or a config plugin that injects native config — has no native counterpart inside Expo Go's binary, so even if the JS import resolves, the native bridge call has nothing to dispatch to and fails or no-ops. A dev client doesn't have this problem because it's compiled fresh from your actual dependency tree, including that library's native code.</p>
<p><b>The JS import succeeding tells you nothing about native — Expo Go can't dynamically link code that wasn't compiled in, so a matching native counterpart has to actually exist in the binary.</b></p>`,
  },
  {
    id: "a16-expo-eas-19",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `What development-time capability does a dev client preserve from Expo Go, and what's the actual mechanism behind it?`,
    answerHtml: `<p>Fast Refresh / JS hot reloading and the dev menu are preserved because the dev client embeds the same Expo dev-client runtime (Metro bundler client, dev menu, debugging hooks) as Expo Go — only the underlying native module set differs. The dev client connects to your local Metro server the same way Expo Go does, fetching and re-evaluating JS bundles on change; what changed is that the native binary wrapping that runtime is yours to extend, not Expo's fixed one.</p>
<p><b>\`expo-dev-client\` is Expo Go, but with your own native code — you keep the same Metro connection, Fast Refresh, and dev menu, and only the native module set becomes yours to extend.</b></p>`,
  },
  {
    id: "a16-expo-eas-20",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `In \`eas.json\`, what's the role of an \`"internal"\` distribution build profile versus \`"store"\` distribution, and how does this interact with provisioning on iOS?`,
    answerHtml: `<p><code>internal</code>'s role is fast, review-free distribution to a known set of devices; <code>store</code>'s role is public distribution gated by platform review. <code>internal</code> distribution produces an ad-hoc (or enterprise) signed iOS build / a directly-installable Android APK meant for internal testers, distributed via a link/QR code rather than App Store/TestFlight review. On iOS specifically, ad-hoc distribution requires every test device's UDID to be registered in the provisioning profile beforehand — EAS can register new device UDIDs interactively (\`eas device:create\`) and will regenerate the provisioning profile to include them. <code>store</code> distribution instead produces an App Store-signed build with no UDID allowlist, since distribution is gated by Apple/Google review and store accounts instead.</p>
<p><b>Internal distribution trades review-free speed for a UDID allowlist on iOS; store distribution trades that allowlist for going through Apple/Google review — which one I pick depends on whether the audience is my own test devices or the public.</b></p>`,
  },
  {
    id: "a16-expo-eas-21",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `Why might a senior engineer deliberately keep a \`development\` build profile's \`distribution\` as \`internal\` rather than \`store\`, separately from the \`developmentClient\` flag?`,
    answerHtml: `<p>These two flags answer unrelated questions and shouldn't be reasoned about together. <code>developmentClient: true</code>'s role is runtime capability: it controls whether the build includes the dev-client runtime (dev menu, Metro connection) at all — that's the Expo-Go-vs-custom-client axis. <code>distribution</code>'s role is delivery mechanics: how the resulting binary is signed and handed out. A development build is almost always also \`internal\` distribution because it's for the team's own devices during active development, never destined for App Store review.</p>
<p><b>Red flag:</b> conflating the two axes in eas.json — it's a common misconfiguration that produces a dev-client build accidentally signed for store submission, or a production build that still contains dev-only code paths.</p>
<p><b>developmentClient decides what runtime is inside the binary; distribution decides who can install it — I keep them independent so a debug capability never accidentally ships to the store.</b></p>`,
  },
  {
    id: "a16-expo-eas-22",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `How does EAS Update's per-update rollout percentage (\`eas update --rollout-percentage\` on publish, adjusted later with \`eas update:edit\`) actually gate which devices see a new update?`,
    answerHtml: `<p>A rollout splits traffic on a branch between the new update and the current one by percentage; the EAS Update client library on each device deterministically buckets itself (based on a stable per-install identifier) so the same device consistently stays in the same cohort as the percentage increases rather than re-rolling the dice on every check. This lets you ramp from, say, 10% to 100% by editing the percentage over time.</p>
<p><b>Red flag:</b> treating a lowered rollout percentage as a rollback. It stops <i>new</i> devices from getting the update, but it does not pull the bundle back from devices that already downloaded it — undoing it for those devices requires republishing/repointing to the prior update (e.g. \`eas update:rollback\`).</p>
<p><b>Rollout percentage only gates who gets the update next, not who keeps it — if the bad version is already on devices, lowering the percentage doesn't touch them; I have to roll back explicitly.</b></p>`,
  },
  {
    id: "a16-expo-eas-23",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `What does \`expo-updates\`' check-on-launch behavior mean for how 'instant' a rollback actually is from a user's perspective?`,
    answerHtml: `<p>By default \`expo-updates\` checks for a new update asynchronously on app launch/foreground and applies it only on the <i>next</i> cold start (the currently running JS instance keeps running on whatever it already loaded) — so repointing a channel doesn't yank the bad update out from under an active session. A user mid-session during a bad rollout stays on the bad version until they fully relaunch, and even then only if the update check completed and downloaded before they hit the broken code path. This is why rollback is 'fast' in terms of server-side propagation but not literally instantaneous across the install base, and why critical rollbacks are sometimes paired with \`Updates.reloadAsync()\`-triggering logic or a forced-update check for severity.</p>
<p><b>Rollback is instant server-side but not instant on-device — expo-updates applies on next cold start by default, so a severe-enough incident needs an explicit reload trigger, not just a repointed channel.</b></p>`,
  },
  {
    id: "a16-expo-eas-24",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `Why is publishing an EAS Update to the wrong channel a more dangerous mistake than publishing to the wrong branch with no channel pointing at it yet?`,
    answerHtml: `<p>Publishing to a branch with no channel attached is inert — no running app is configured to poll that branch, so the update sits there harmlessly until something intentionally points a channel at it. Publishing directly to a branch that a channel (especially \`production\`) already serves is live the moment any client checks for updates, with no review/approval gate built into the CLI command itself.</p>
<p><b>Red flag:</b> assuming \`eas update\` has a built-in staging step. It doesn't — there's no gate unless the team adopts one manually (e.g. publish to a \`staging\` branch/channel first, verify, then promote by republishing or repointing).</p>
<p><b>I treat 'promote' as moving a channel pointer, not re-running <code>eas update</code> against production directly — publishing straight to a branch a live channel already serves ships instantly with no review gate.</b></p>`,
  },
];

export const ADVANCED16_QUIZ: QuizQuestion[] = [
  {
    id: "a16q-expo-eas-1",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `A team builds two app binaries from the exact same git commit, but Build B was produced after a teammate added a new config plugin to app.json (no other code changes). Under \`runtimeVersion: { policy: "fingerprint" }\`, what happens when an OTA update built against Build A's runtime version is published?`,
    options: [`It is served to both builds since they share the same commit hash`, `It is served only to devices running Build A; Build B gets a different fingerprint and is excluded`, `It is served only to devices running Build B since plugins always increment the runtime version forward`, `EAS Update ignores runtimeVersion entirely when using the fingerprint policy`],
    answer: 1,
    explanationHtml: `<p>The fingerprint policy hashes the resolved native project output (including config plugin effects), not the git commit. Adding a config plugin changes native config and therefore the fingerprint, even with no other source changes — so Build A and Build B get different runtime versions and an update published for one will not be offered to the other. The tempting first option assumes runtime version tracks source identity (the commit) — it tracks compiled native output instead, so 'same commit' doesn't guarantee 'same runtime version.'</p>`,
  },
  {
    id: "a16q-expo-eas-2",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `What is the key functional difference between an EAS Update \`channel\` and a \`branch\`?`,
    options: [`A branch is a build-time concept and a channel is a runtime-only concept with no relation to builds`, `A channel is a named pointer to one branch at a time, configurable independently of any build; a branch is the ordered history of published update bundles`, `They are interchangeable aliases for the same underlying object in EAS Update`, `A branch can only be changed by publishing a new build, while a channel can be changed by publishing an update`],
    answer: 1,
    explanationHtml: `<p>A branch holds the actual sequence of published JS/asset bundles. A channel is baked into the binary at build time and is just a pointer that resolves to a branch; repointing which branch a channel serves (or which branch a rollback targets) is how staged rollout and rollback work without rebuilding the app. The tempting distractor treats the two as unrelated concepts with no relationship — the actual relationship (pointer → content) is exactly what makes rollback and rollout possible without a new build.</p>`,
  },
  {
    id: "a16q-expo-eas-3",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `Why does a well-configured \`eas.json\` \`submit.production\` profile typically omit \`appleId\` and \`serviceAccountKeyPath\`?`,
    options: [`Because EAS Submit doesn't support automated submission and requires manual upload via Transporter/Play Console`, `Because those fields are deprecated and submission now always uses anonymous uploads`, `Because submit credentials are uploaded once to EAS via \`eas credentials\` and stored server-side, so CI only needs EXPO_TOKEN to trigger an authenticated submission`, `Because \`appleId\` and \`serviceAccountKeyPath\` are only required for development builds, not production`],
    answer: 2,
    explanationHtml: `<p>Once submit credentials (App Store Connect API key, Google Play service account) are uploaded via \`eas credentials -p ios|android\`, they live on EAS's servers scoped to the project. CI needs only \`EXPO_TOKEN\` to authenticate as the project and trigger \`--auto-submit\`; no Apple ID, 2FA, or service-account JSON needs to be present in the repo or CI secrets. The tempting distractor assumes automated submission isn't possible at all — EAS Submit is fully automatable, it's just that the credentials live server-side rather than in eas.json.</p>`,
  },
  {
    id: "a16q-expo-eas-4",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `Two third-party config plugins both register a mod on \`mods.ios.infoPlist\` and both unconditionally set the same key to different values. What determines the final value in the generated Info.plist?`,
    options: [`Expo automatically merges both values into an array`, `Whichever plugin is listed later in app.json's \`plugins\` array wins, since mods apply sequentially and each receives the prior plugin's output`, `The build fails with a merge conflict error at prebuild time`, `Both values are written, and iOS picks the first one encountered at runtime`],
    answer: 1,
    explanationHtml: `<p>Mods are composable and apply in the order plugins are listed; each mod receives the previously-mutated in-memory file representation and returns its own version. There's no automatic conflict detection for plugins that overwrite the same key, so plugin order silently determines the outcome — a common source of subtle bugs when adding a new plugin changes ordering. The tempting distractor assumes Expo intelligently merges conflicting plugin output into an array — it doesn't; mods only compose sequentially, they don't reconcile.</p>`,
  },
  {
    id: "a16q-expo-eas-5",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `A library exposes a native iOS/Android module but the project is currently running in Expo Go. What's the underlying reason the native functionality won't work, even if the JS import succeeds?`,
    options: [`Expo Go blocks all third-party npm packages from being imported`, `Expo Go is a fixed prebuilt binary with a closed set of native modules compiled in; it can't dynamically load native code that wasn't included when Expo built it`, `Expo Go requires a paid Expo account to enable third-party native modules`, `Expo Go only supports native modules written in JavaScript, not Swift/Kotlin`],
    answer: 1,
    explanationHtml: `<p>Expo Go is compiled once by Expo with a curated, version-locked set of native modules. It has no mechanism for dynamically linking new native code at runtime, so a library's native iOS/Android implementation simply isn't present in the binary — the JS bridge call has nothing to dispatch to. A custom dev client, built from the project's actual native dependency tree, doesn't have this limitation. The tempting distractor assumes Expo Go blocks the npm package itself — it doesn't; the JS import resolves fine, it's the native counterpart on the other side of the bridge that's missing.</p>`,
  },
  {
    id: "a16q-expo-eas-6",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `After a bad EAS Update rollout, an engineer immediately repoints the \`production\` channel back to the last-known-good branch. Why might some users still see the broken version for a while afterward?`,
    options: [`Channel repointing requires a new app store submission to take effect`, `expo-updates checks for updates on launch/foreground and applies a new update only on the next cold start, so already-running sessions keep executing what they already loaded`, `EAS Update propagation to CDN edge nodes takes up to 24 hours regardless of client behavior`, `Repointing a channel only affects new installs, never existing ones`],
    answer: 1,
    explanationHtml: `<p>The rollback is effectively instant on the server side, but \`expo-updates\`'s default check-and-apply-on-next-launch behavior means a user already running the bad JS in an active session won't be interrupted mid-session; they'll get the fix on their next full relaunch (assuming the update check completes before hitting the broken path). The tempting distractor assumes rollback requires app-store review, conflating OTA repointing (server-side, instant) with a native binary release (review-gated) — they're different mechanisms entirely.</p>`,
  },
  {
    id: "a16q-expo-eas-7",
    category: "expo",
    categoryLabel: "EXPO SDK",
    question: `What does setting \`appVersionSource: "remote"\` with \`autoIncrement: true\` on a build profile avoid, compared to \`local\` version source?`,
    options: [`It avoids needing an EXPO_TOKEN for CI builds`, `It avoids native build number/version code collisions across parallel or repeated builds, since EAS tracks and increments the counter server-side instead of relying on a value committed in app.json`, `It avoids the need for a config plugin to set the bundle identifier`, `It avoids App Store Connect requiring a unique build number per submission`],
    answer: 1,
    explanationHtml: `<p>With \`local\` source, the build/version number lives in committed config and must be hand-maintained, which is fragile if two builds run concurrently or a build is retried without a new commit. \`remote\` plus \`autoIncrement\` lets EAS own a server-side monotonic counter per platform, guaranteeing uniqueness without requiring a commit per build. The tempting distractor conflates this setting with authentication (\`EXPO_TOKEN\`) — \`appVersionSource\` is purely about where the counter lives, unrelated to how CI authenticates.</p>`,
  },
];
