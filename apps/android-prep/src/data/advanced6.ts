// Batch 6 — Security and release engineering (CI/CD, signing, rollout, observability).
import type { Flashcard } from "./flashcards";
import type { StudySection } from "./study";

export const ADVANCED6_FLASHCARD_FILTERS: { value: string; label: string }[] = [
  { value: "security", label: "Security" },
  { value: "release", label: "Releases" },
];

export const ADVANCED6_FLASHCARDS: Flashcard[] = [
  {
    "id": "se-1",
    "category": "security",
    "categoryLabel": "SECURITY",
    "question": "Where do you store an auth token, and where do you NOT?",
    "answerHtml": "Store it encrypted: <b>EncryptedSharedPreferences</b> / Jetpack Security, with the key in the <b>Android Keystore</b> (hardware-backed where available). <b>Never</b> in plain SharedPreferences, in code, in logs, or in the APK — all are trivially extractable. For high-value actions, gate access behind <code>BiometricPrompt</code>. Treat the access token as short-lived and refresh it server-side."
  },
  {
    "id": "se-2",
    "category": "security",
    "categoryLabel": "SECURITY",
    "question": "What does the Android Keystore actually protect?",
    "answerHtml": "It stores cryptographic <b>keys</b> such that the key material can't be exported from the device — ideally inside a hardware security module / StrongBox / TEE. You ask the Keystore to encrypt/sign on your behalf; the app never sees the raw key. You can require user authentication (biometric) to unlock a key. It protects keys, not arbitrary data — you use those keys to encrypt your data."
  },
  {
    "id": "se-3",
    "category": "security",
    "categoryLabel": "SECURITY",
    "question": "Why can't you hide a secret in the APK, even obfuscated?",
    "answerHtml": "The APK ships to the device and can be decompiled; strings, native libs, and resources are all extractable, and R8 obfuscation only renames symbols — it doesn't encrypt embedded secrets. Anything in the binary is effectively public. Keep secrets server-side, use short-lived tokens, and use attestation (Play Integrity) to gate sensitive endpoints rather than trusting a client secret."
  },
  {
    "id": "se-4",
    "category": "security",
    "categoryLabel": "SECURITY",
    "question": "What is the Network Security Config used for?",
    "answerHtml": "An XML config that declaratively controls TLS trust: enforce HTTPS (disable cleartext), restrict trusted CAs per domain, configure <b>certificate pinning</b>, and set debug-only overrides (e.g. trust a local proxy in debug builds only). It centralizes network trust policy so you're not threading it through OkHttp everywhere, and it's the recommended place to declare pins on modern Android."
  },
  {
    "id": "se-5",
    "category": "security",
    "categoryLabel": "SECURITY",
    "question": "Certificate pinning: the benefit and the footgun?",
    "answerHtml": "Benefit: it blocks man-in-the-middle even if a CA is compromised, by trusting only your cert/public key. Footgun: if you pin a single cert and rotate it, every installed client breaks until they update. Mitigate by pinning the <b>public key (SPKI)</b> rather than the leaf cert, always including a <b>backup pin</b>, and shipping the next pin ahead of rotation."
  },
  {
    "id": "se-6",
    "category": "security",
    "categoryLabel": "SECURITY",
    "question": "What does the Play Integrity API give you?",
    "answerHtml": "A signed verdict that the request comes from a <b>genuine, unmodified app</b> on a <b>genuine Android device</b> with a legitimate Play install — useful to gate sensitive backend actions against bots, tampered apps, and emulators. You verify the verdict server-side. It's attestation (is this a real app/device?), not a replacement for auth; combine it with proper authn/authz."
  },
  {
    "id": "se-7",
    "category": "security",
    "categoryLabel": "SECURITY",
    "question": "What is OWASP MASVS / Mobile Top 10, and why name it?",
    "answerHtml": "MASVS (Mobile App Security Verification Standard) and the Mobile Top 10 are the industry vocabulary for mobile risk: insecure data storage, weak cryptography, insecure communication, insufficient binary protection, etc. Naming them in an interview signals you think in a <b>threat model</b> — secrets-in-bundle, data at rest, data in transit, and device integrity as distinct buckets — rather than ad-hoc fixes."
  },
  {
    "id": "se-8",
    "category": "security",
    "categoryLabel": "SECURITY",
    "question": "How should BiometricPrompt be used securely?",
    "answerHtml": "Use the AndroidX <code>BiometricPrompt</code> for the UI and, for sensitive operations, tie it to a <b>Keystore key that requires user authentication</b> (a <code>CryptoObject</code>), so a successful biometric actually unlocks a crypto operation rather than just returning a boolean you could bypass. Always provide a device-credential fallback and handle lockout. Biometrics gate access to a key; they aren't the secret themselves."
  },
  {
    "id": "rl-1",
    "category": "release",
    "categoryLabel": "RELEASE",
    "question": "What does a solid Android CI pipeline run on every PR?",
    "answerHtml": "Lint + ktlint/detekt, the unit test suite, an assemble of debug (and often a release build to catch R8 issues), and increasingly a subset of instrumented/Compose tests on an emulator (e.g. Gradle Managed Devices). Caching (Gradle build cache) keeps it fast. The point: never merge red, and catch release-only failures (R8, manifest) before they reach users."
  },
  {
    "id": "rl-2",
    "category": "release",
    "categoryLabel": "RELEASE",
    "question": "Explain app signing and Play App Signing.",
    "answerHtml": "Your build is signed with an <b>upload key</b>; with <b>Play App Signing</b>, Google holds the real <b>app signing key</b> and re-signs the artifact for distribution. Benefits: Google can optimize delivery (per-device splits from the AAB), and you can reset a lost upload key without bricking updates. Losing the app signing key (pre-Play-signing) meant you could never update the app — Play App Signing removes that single point of failure."
  },
  {
    "id": "rl-3",
    "category": "release",
    "categoryLabel": "RELEASE",
    "question": "Why ship an Android App Bundle (AAB) instead of an APK?",
    "answerHtml": "From an AAB, Play generates and serves <b>optimized split APKs</b> per device — only the density, ABI, and language resources that device needs — cutting download/install size meaningfully versus a universal APK. It's required for new Play apps. It also enables dynamic feature modules delivered on demand."
  },
  {
    "id": "rl-4",
    "category": "release",
    "categoryLabel": "RELEASE",
    "question": "What is a staged rollout and how do you gate it?",
    "answerHtml": "You release to a small percentage (e.g. 5% → 20% → 50% → 100%) and watch <b>release health</b> — crash-free users/sessions and ANR rate — before widening. If a metric regresses, you <b>halt</b> the rollout (or roll back / ship a fix). Pair it with a server-controlled <b>feature flag + kill switch</b> for risky features so you can disable without a new release."
  },
  {
    "id": "rl-5",
    "category": "release",
    "categoryLabel": "RELEASE",
    "question": "What's the headline metric for release health, and what tools?",
    "answerHtml": "<b>Crash-free users (and sessions) %</b>, plus the <b>ANR rate</b> — both visible in Play Console (Android Vitals) and in Crashlytics/Sentry. Vitals also flags excessive wakeups, slow rendering, and frozen frames. Treat a deploy as 'done' only when these hold across the rollout; wire alerts so a regression pages you, not your users."
  },
  {
    "id": "rl-6",
    "category": "release",
    "categoryLabel": "RELEASE",
    "question": "How do you map a crash back to source after R8 obfuscation?",
    "answerHtml": "R8 renames symbols, so stack traces are obfuscated. Upload the <b>mapping file</b> (<code>mapping.txt</code>) for each release to Play Console / Crashlytics so traces are <b>de-obfuscated</b> automatically. Without it, a release crash is unreadable. Keep mapping files archived per version code; symbolication is part of a complete release process."
  },
  {
    "id": "rl-7",
    "category": "release",
    "categoryLabel": "RELEASE",
    "question": "Can you do over-the-air updates on Android like CodePush?",
    "answerHtml": "Native Android can't hot-swap compiled code the way JS bundles can. The supported levers are: <b>staged rollouts</b> and fast follow-up releases via the Play track system, <b>in-app updates</b> (Play Core: flexible or immediate) to prompt users to update, server-driven <b>feature flags</b> for config/behavior changes without a release, and dynamic feature modules. So you design for flag-controlled behavior and a quick release pipeline rather than code OTA."
  },
  {
    "id": "se-9",
    "category": "security",
    "categoryLabel": "SECURITY",
    "question": "What R8 keep rules do reflection-based libraries need?",
    "answerHtml": "Anything resolved by name at runtime survives only if kept. Gson/Moshi reflective adapters need their model classes and fields kept (or use codegen adapters to avoid reflection); <code>kotlinx.serialization</code> needs its generated serializers kept (its consumer rules usually handle this); enums used by name, classes loaded via <code>Class.forName</code>, and JNI-referenced members need explicit <code>-keep</code>/<code>-keepclassmembers</code>. Always smoke-test the <b>release</b> build — a release-only crash is almost always a missing keep rule."
  },
  {
    "id": "se-10",
    "category": "security",
    "categoryLabel": "SECURITY",
    "question": "What is tapjacking and how do you defend against it?",
    "answerHtml": "Tapjacking tricks the user into tapping your UI through a malicious overlay drawn on top. Defenses: set <code>android:filterTouchesWhenObscured=\"true\"</code> (or check <code>MotionEvent.FLAG_WINDOW_IS_OBSCURED</code>) on sensitive controls so taps are ignored when another window covers yours, and require secure surfaces for high-value confirmations. It's part of treating the screen itself as an untrusted channel for sensitive actions."
  },
  {
    "id": "se-11",
    "category": "security",
    "categoryLabel": "SECURITY",
    "question": "How do you handle a secret you must use at runtime (e.g. a third-party API key)?",
    "answerHtml": "Accept that nothing in the binary is truly secret. Mitigations in order of strength: proxy the third-party call through <b>your backend</b> so the key never ships; if it must be on-device, restrict it server-side (per-app, per-package-signature, rate-limited) and rotate it; obfuscate and store via the NDK only as a speed bump. The senior answer is 'move it server-side and gate with Play Integrity,' not 'hide it better.'"
  },
  {
    "id": "rl-8",
    "category": "release",
    "categoryLabel": "RELEASE",
    "question": "What are the Play tracks and how do you use them?",
    "answerHtml": "Play has <b>internal</b> (instant, small tester list), <b>closed</b> (alpha — invited testers), <b>open</b> (beta — public opt-in), and <b>production</b> tracks. The flow: validate on internal/closed, widen to open beta for real-world coverage, then production with a <b>staged rollout</b>. Pre-launch reports run your app on real devices automatically. Tracks let you de-risk a release before it reaches everyone."
  },
  {
    "id": "rl-9",
    "category": "release",
    "categoryLabel": "RELEASE",
    "question": "How do in-app updates work, and flexible vs immediate?",
    "answerHtml": "The Play Core In-App Updates API lets you prompt users to update without leaving the app. <b>Flexible</b> downloads in the background while the user keeps using the app, then you complete on the user's cue — good for optional updates. <b>Immediate</b> is a blocking full-screen flow — for critical updates you require before continuing (e.g. a breaking API change or a security fix). Pair with a server min-version check."
  }
];

export const ADVANCED6_STUDY: StudySection[] = [
  {
    "id": "st-se-1",
    "num": "F1",
    "title": "F1 · Mobile security as a threat model",
    "html": "<p>Answer security questions by naming the buckets, then the control for each:</p>\n      <ul>\n        <li><b>Secrets in the bundle</b> — don't. Keep them server-side; use short-lived tokens and Play Integrity attestation to gate endpoints.</li>\n        <li><b>Data at rest</b> — Keystore-backed keys; EncryptedSharedPreferences/EncryptedFile; SQLCipher for Room when needed.</li>\n        <li><b>Data in transit</b> — HTTPS only via Network Security Config; certificate/SPKI pinning with a backup pin.</li>\n        <li><b>Device integrity</b> — Play Integrity for genuine app/device; BiometricPrompt tied to a Keystore CryptoObject; R8 obfuscation and root detection as defense-in-depth, not guarantees.</li>\n      </ul>\n      <div class=\"callout tip\"><span class=\"lbl\">Vocabulary</span> Reference OWASP MASVS / Mobile Top 10 — it shows you reason about classes of risk, not one-off fixes.</div>"
  },
  {
    "id": "st-rl-1",
    "num": "F2",
    "title": "F2 · Release engineering & production health",
    "html": "<p>Shipping doesn't end at upload — it ends when the new version is healthy:</p>\n      <ul>\n        <li><b>CI</b>: lint/detekt, unit + a slice of instrumented tests, debug <i>and</i> release builds (to catch R8), all cached and gating merges.</li>\n        <li><b>Signing</b>: upload key + Play App Signing so a lost key isn't fatal; ship an <b>AAB</b> for per-device delivery.</li>\n        <li><b>Rollout</b>: staged percentages gated on <b>crash-free rate</b> and <b>ANR rate</b> (Android Vitals); a feature flag + kill switch for risky features.</li>\n        <li><b>Observability</b>: upload <code>mapping.txt</code> for de-obfuscated traces; alert on regressions; use Play in-app updates to nudge upgrades.</li>\n      </ul>\n      <div class=\"map\"><span class=\"lbl\">Senior tell</span> \"Native Android has no JS-style code OTA, so I design behavior behind server flags and keep the release pipeline fast — and I treat the rollout's crash-free rate as the definition of done.\"</div>"
  }
];
