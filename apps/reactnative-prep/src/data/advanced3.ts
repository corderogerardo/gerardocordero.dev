// Batch 3 — native iOS/Android architecture (Callstack native deep-dives),
// mobile security, and on-device AI (Software Mansion react-native-executorch
// + Callstack react-native-ai).
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

/** New flashcard categories this batch adds (ai already exists in the base set). */
export const ADVANCED3_FLASHCARD_FILTERS: { value: string; label: string }[] = [
  { value: "native", label: "Native iOS/Android" },
  { value: "security", label: "Security" },
];

export const ADVANCED3_FLASHCARDS: Flashcard[] = [
  // ---------- Native iOS / Android (native) ----------
  {
    id: "n-1",
    category: "native",
    categoryLabel: "NATIVE",
    question: "How does memory management differ across the layers of a React Native app?",
    answerHtml:
      "Each layer of the stack uses a different memory model, and a native module that ignores the mismatch is where RN apps actually leak — JS's GC won't save you from a Swift delegate cycle. <b>JS</b> and <b>Kotlin/Java</b> use <b>garbage collection</b>; <b>Swift/Obj-C</b> (and C++ smart pointers) use <b>reference counting (ARC)</b>; raw C/C++ is <b>manual</b> (<code>new</code>/<code>delete</code>). In a native module prefer <code>std::unique_ptr</code> / <code>std::shared_ptr</code> and mark Swift delegates <code>weak</code> to avoid retain cycles. <b>I check the memory model per layer, not just React's GC, before I trust a native module is leak-free.</b>",
  },
  {
    id: "n-2",
    category: "native",
    categoryLabel: "NATIVE",
    question: "The JS profiler is clean but the app is still slow — where do you look?",
    answerHtml:
      "A clean JS profiler with real jank left on screen means the cost sits below JS — this is a native debugging problem, not a React one. 1. <b>Isolate</b>: confirm JS stays responsive to input while the jank happens, which rules out the JS thread. 2. <b>Prove it</b>: profile with <b>Xcode Instruments → Time Profiler</b> (iOS) or the <b>Android Studio Profiler</b> (CPU/memory by thread) to find the hot thread. 3. <b>Fix</b> the specific bottleneck — heavy native init, a slow native module, or a leak (Xcode <b>Leaks</b> / Android Memory Profiler). <p><b>Red flag:</b> reaching for more <code>React.memo</code> or rewriting the screen in JS when the JS profiler is already flat — that's optimizing a layer that isn't the bottleneck.</p> <b>When JS is clean, I profile native before I touch a single React component.</b>",
  },
  {
    id: "n-3",
    category: "native",
    categoryLabel: "NATIVE",
    question: "What iOS vs Android build toolchains should a senior RN engineer know?",
    answerHtml:
      "A senior RN engineer can't hand every signing failure or dependency conflict to a native specialist — that blocks the whole team on a build. <b>iOS</b>: Xcode + <b>CocoaPods</b> (<code>pod install</code>) → <code>xcodebuild</code>. <b>Android</b>: Android Studio + <b>Gradle</b> (<code>./gradlew</code>). You should comfortably open the native project, read build config, handle signing/provisioning, and run <code>pod install</code> / <code>gradlew clean</code>. <b>I stay fluent in both native projects so a broken build doesn't stall the team waiting on a native specialist.</b>",
  },
  {
    id: "n-4",
    category: "native",
    categoryLabel: "NATIVE",
    question: "How do you deliver per-device image assets without bloating the download?",
    answerHtml:
      "Bundling every density/ABI into one binary bloats the download and hurts install conversion — per-device delivery is a platform feature you should use, not hand-roll. On <b>iOS</b>, ship images through the <b>Asset Catalog</b> so the App Store does <b>app thinning</b> (per-device variants). On <b>Android</b>, ship an <b>AAB</b> — Play generates per-density / per-ABI splits and delivers only what each device needs. <b>I let the App Store and Play handle per-device asset delivery instead of bundling every variant myself.</b>",
  },
  {
    id: "n-5",
    category: "native",
    categoryLabel: "NATIVE",
    question: "How do you integrate a native SDK that has no React Native wrapper?",
    answerHtml:
      "A sloppy wrapper turns into a maintenance sinkhole — a fat, untyped JS surface that every future native SDK upgrade has to thread through. 1. <b>Define</b> a thin, typed <b>TurboModule</b> (or Expo module) spec covering only the methods you need. 2. <b>Implement</b> it natively in <b>Swift/Kotlin</b>, running heavy work <b>async on a background thread</b>. 3. <b>Bridge</b> events back to JS via an emitter. 4. <b>Wire build config</b> (Pods/Gradle, Info.plist / AndroidManifest permissions). <b>I keep the JS surface small and typed so the native SDK underneath stays swappable later.</b>",
  },
  {
    id: "n-6",
    category: "native",
    categoryLabel: "NATIVE",
    question: "What is a retain cycle, and how does it cause a native leak?",
    answerHtml:
      "Two objects holding <b>strong</b> references to each other (e.g. a view controller and its delegate or a captured <code>self</code> in a closure) never reach refcount zero, so ARC never frees them. Break it with a <code>weak</code> (or <code>unowned</code>) reference on one side — the classic Swift delegate/closure fix. <b>I default delegates and captured `self` in closures to `weak` so retain cycles don't get a chance to form.</b>",
  },
  {
    id: "n-7",
    category: "native",
    categoryLabel: "NATIVE",
    question: "Where does Yoga layout run, and why does it matter?",
    answerHtml:
      "React Native computes layout with <b>Yoga</b> (Flexbox) off the JS thread, then commits to the native UI thread. Under <b>Fabric</b> the shadow tree is shared C++, enabling synchronous layout. This is why layout-heavy trees can still be smooth, and why view <b>flattening</b> trims the native hierarchy. <b>I flatten deeply nested layout-heavy views because a smaller native tree is cheaper for both Yoga and the UI thread to walk.</b>",
  },

  // ---------- Mobile security (security) ----------
  {
    id: "s-1",
    category: "security",
    categoryLabel: "SECURITY",
    question: "Where must secrets and tokens live in a mobile app — and where can't they?",
    answerHtml:
      "Where a secret lives determines whether a compromised or rooted device exposes it — plaintext storage or a readable bundle means the secret is already gone. Tokens/keys go in the <b>iOS Keychain / Android Keystore</b> (hardware-backed, via <code>expo-secure-store</code> or <code>react-native-keychain</code>) — never <code>AsyncStorage</code> (plaintext). And <b>never</b> embed API secrets in the JS bundle: it ships to the device and is trivially readable. Server secrets stay server-side. <b>Tokens go in the Keychain/Keystore, never AsyncStorage or the JS bundle — the bundle ships to the device and is trivially readable.</b>",
  },
  {
    id: "s-2",
    category: "security",
    categoryLabel: "SECURITY",
    question: "What is certificate (SSL) pinning, and what's the catch?",
    answerHtml:
      "Pinning's role is to defeat man-in-the-middle proxies even when the attacker controls a trusted root CA — the app trusts <b>only</b> your specific server cert / public key. The catch is <b>rotation</b>: pin the wrong thing or rotate the cert without shipping an app update and you brick connectivity. <p><b>Red flag:</b> pinning without a rotation plan or backup pins — that's an outage waiting for the next cert renewal, not a security win.</p> <b>I pin a long-lived key with backup pins so a routine cert rotation never bricks connectivity.</b>",
  },
  {
    id: "s-3",
    category: "security",
    categoryLabel: "SECURITY",
    question: "What is OWASP MASVS / the Mobile Top 10, and why name it?",
    answerHtml:
      "The <b>Mobile Application Security Verification Standard</b> and the OWASP <b>Mobile Top 10</b> are the industry checklist — insecure storage, weak crypto, insecure communication, reverse-engineering, and so on. <b>I name OWASP MASVS or the Mobile Top 10 by title to signal I think in threat-model buckets, not ad-hoc fixes.</b>",
  },
  {
    id: "s-4",
    category: "security",
    categoryLabel: "SECURITY",
    question: "How do you verify an app/device is genuine (anti-tampering)?",
    answerHtml:
      "Platform <b>attestation</b>: <b>App Attest</b> / DeviceCheck on iOS and the <b>Play Integrity API</b> on Android verify the app binary and device haven't been tampered with or emulated. Pair with <b>jailbreak/root detection</b> as defense-in-depth — never a silver bullet, since it's bypassable. <b>Attestation plus root/jailbreak detection is defense-in-depth, not a guarantee — I never present it as the only control.</b>",
  },
  {
    id: "s-5",
    category: "security",
    categoryLabel: "SECURITY",
    question: "How do biometrics actually protect data, beyond a fingerprint check?",
    answerHtml:
      "Biometric auth (FaceID/TouchID, Android BiometricPrompt) gates a key stored in the <b>Secure Enclave / TEE</b> — the biometric unlocks the hardware key and the app never sees the biometric itself. So it's not just a UI gate; it binds decryption to the device's secure hardware. <b>I frame biometrics as binding decryption to Secure Enclave/TEE hardware, not just a UI gate.</b>",
  },
  {
    id: "s-6",
    category: "security",
    categoryLabel: "SECURITY",
    question: "What are the four threat-model buckets to name for mobile security?",
    answerHtml:
      "<b>Secrets</b> (don't ship them in the bundle), <b>data at rest</b> (Keychain/Keystore, encrypted DBs), <b>data in transit</b> (HTTPS/ATS + pinning), and <b>device/app integrity</b> (attestation, jailbreak/root detection, obfuscation). Walking these four out loud is the senior move. <b>I answer any mobile security question by walking secrets, data-at-rest, data-in-transit, and integrity — naming one control per bucket.</b>",
  },
  {
    id: "s-7",
    category: "security",
    categoryLabel: "SECURITY",
    question: "Why are deep links a security concern, and how do you harden them?",
    answerHtml:
      "A deep link is <b>untrusted input</b> — anything can craft <code>myapp://transfer?to=…</code>. <b>Validate and authorize</b> every parameter, prefer verified <b>Universal / App Links</b> (domain-owned, can't be hijacked by another app) over custom schemes, and never run a sensitive action from a link without an auth check. <p><b>Red flag:</b> treating a custom URL scheme as safe because \"only my app opens it\" — any app can register the same scheme and intercept it; verified Universal/App Links are domain-owned and can't be spoofed that way.</p> <b>I treat every deep-link parameter as untrusted input and re-check auth before it triggers a sensitive action.</b>",
  },
  {
    id: "s-8",
    category: "security",
    categoryLabel: "SECURITY",
    question: "What does code obfuscation buy you on each platform?",
    answerHtml:
      "On Android, <b>R8 / ProGuard</b> renames and strips symbols, raising the bar for reverse-engineering. On iOS, <b>Hermes bytecode</b> ships your JS as compiled bytecode rather than readable source. Both are <b>defense-in-depth</b>, not protection for secrets — assume a determined attacker can still read the binary. <b>Obfuscation raises the cost of reverse-engineering — I never pitch it as a substitute for keeping secrets off-device.</b>",
  },

  // ---------- On-device AI (ai) ----------
  {
    id: "ai-x1",
    category: "ai",
    categoryLabel: "AI",
    question: "What is React Native ExecuTorch and what runtime powers it?",
    answerHtml:
      "Name this when the question is how to run inference fully offline in React Native — a vague \"I'm into on-device AI\" doesn't land, the specific toolkit does. A Software Mansion / Callstack toolkit to run AI models <b>fully on-device</b> in React Native, powered by PyTorch's <b>ExecuTorch</b> edge runtime. Models ship as optimized <b>.pte</b> binaries and run through hardware backends — <b>XNNPACK</b> (CPU), <b>Core ML</b> (iOS), and <b>Vulkan</b> (GPU). <b>For on-device inference in RN, I reach for react-native-executorch — PyTorch's ExecuTorch runtime running .pte models on XNNPACK/Core ML/Vulkan.</b>",
  },
  {
    id: "ai-x2",
    category: "ai",
    categoryLabel: "AI",
    question: "What's the headline benefit of on-device inference vs a cloud LLM API?",
    answerHtml:
      "<b>Privacy</b> (user data never leaves the device), <b>no per-call cost</b> or cloud infra, lower <b>latency</b>, and <b>offline</b> operation. The trade-offs are model size/quality limits and using the device's compute and battery. <b>I pick on-device when privacy, offline use, or per-call cost rules out a cloud API — and say so explicitly rather than defaulting to whichever I used last.</b>",
  },
  {
    id: "ai-x3",
    category: "ai",
    categoryLabel: "AI",
    question: "What's the developer API shape of react-native-executorch?",
    answerHtml:
      "Knowing the hook names is what turns \"I've used it\" into evidence you've actually shipped with it. Declarative <b>hooks</b> per task: <code>useLLM</code> (chat/generation), <code>useSpeechToText</code> (Whisper), <code>useTextToSpeech</code>, <code>useObjectDetection</code> (YOLO/SAM), and <code>useImageEmbeddings</code> / <code>useTextEmbeddings</code> for semantic search. It runs models like <b>Llama 3.2</b>, <b>Qwen</b>, <b>Phi</b>, and <b>SmolLM</b>. <b>The API is one hook per task — useLLM, useSpeechToText, useObjectDetection — so adding a new model type is additive, not a rewrite.</b>",
  },
  {
    id: "ai-x4",
    category: "ai",
    categoryLabel: "AI",
    question: "What is Callstack's react-native-ai, and how does it relate to the Vercel AI SDK?",
    answerHtml:
      "Its role is to make on-device inference a drop-in swap for a cloud call, not a separate API to learn. A library of on-device AI primitives that's a <b>drop-in for the Vercel AI SDK</b> — the same <code>generateText</code> / <code>streamText</code> / <code>embed</code> APIs, but running locally. It supports <b>Apple Foundation Models</b> (built-in, iOS), <b>Llama</b> (GGUF via llama.rn), and <b>MLC LLM</b> engines. <b>Because it mirrors the Vercel AI SDK surface, swapping a cloud generateText call for an on-device one is a config change, not a rewrite.</b>",
  },
  {
    id: "ai-x5",
    category: "ai",
    categoryLabel: "AI",
    question: "How do on-device models get onto the device in react-native-ai?",
    answerHtml:
      "Apple Foundation Models are <b>built in</b> (no download). Llama and MLC models are <b>GGUF</b> files pulled from Hugging Face and initialized with <code>.download()</code> then <code>.prepare()</code> before inference — so plan for a first-run download and a real storage footprint. <p><b>Red flag:</b> assuming a non-Apple model is ready the moment you call it — GGUF models need a real download and a <code>.prepare()</code> step before first inference, so the UX has to budget for that wait.</p> <b>I always check whether a model ships with the OS (Apple Foundation Models) or needs a runtime download (GGUF) before I promise instant on-device AI.</b>",
  },
  {
    id: "ai-x6",
    category: "ai",
    categoryLabel: "AI",
    question: "When would you choose on-device AI over a cloud model in an interview answer?",
    answerHtml:
      "When <b>privacy/compliance</b> forbids sending data off-device (health, finance), when you need <b>offline</b> or <b>low-latency</b> UX, or to <b>cut inference cost</b>. Choose cloud when you need frontier-model quality or huge context. <b>I name the trade-off — privacy/offline/cost vs. quality/context — rather than giving a blanket \"always on-device\" or \"always cloud\" answer.</b>",
  },
];

/** New quiz categories this batch adds (ai already exists in the base set). */
export const ADVANCED3_QUIZ_FILTERS: { value: string; label: string }[] = [
  { value: "native", label: "Native" },
  { value: "security", label: "Security" },
];

export const ADVANCED3_QUIZ: QuizQuestion[] = [
  {
    id: "b3-z1",
    category: "native",
    categoryLabel: "Native",
    question: "The JS profiler shows nothing but the app is slow. Best next step?",
    options: [
      "Add more React.memo everywhere",
      "Profile the native side with Xcode Instruments / Android Studio Profiler",
      "Disable Hermes",
      "Rewrite the screen in plain JS",
    ],
    answer: 1,
    explanationHtml:
      "The JS profiler already came back clean, so the cost isn't in React re-renders — more <code>React.memo</code> won't move the needle, and disabling Hermes or rewriting the screen don't target native costs either. Profile with Instruments (Time Profiler) or the Android Studio Profiler to see CPU/memory by thread.",
  },
  {
    id: "b3-z2",
    category: "native",
    categoryLabel: "Native",
    question: "How do you avoid a retain cycle with a Swift delegate?",
    options: [
      "Make the delegate a strong reference",
      "Mark the delegate weak (or unowned)",
      "Make it a static property",
      "Annotate it @objc",
    ],
    answer: 1,
    explanationHtml:
      "A mutual strong reference never reaches refcount zero under ARC — that's the cycle. Making the delegate <code>static</code> or adding <code>@objc</code> doesn't break that reference at all, it just changes storage or visibility; only a <code>weak</code> (or <code>unowned</code>) reference lets ARC free the object.",
  },
  {
    id: "b3-z3",
    category: "native",
    categoryLabel: "Native",
    question: "How does Android deliver the right asset density efficiently?",
    options: [
      "Bundle every density in the APK",
      "Ship an AAB; Play delivers per-device splits",
      "Use the iOS asset catalog",
      "Download all assets at runtime",
    ],
    answer: 1,
    explanationHtml:
      "Bundling every density bloats the APK, and downloading assets at runtime adds latency Android already avoids for you — and the iOS Asset Catalog is an iOS-only mechanism, it doesn't exist on Android. An <b>AAB</b> lets Google Play generate and deliver per-density / per-ABI splits, so each device downloads only what it needs.",
  },
  {
    id: "b3-z4",
    category: "security",
    categoryLabel: "Security",
    question: "Where should auth tokens live in a mobile app?",
    options: [
      "AsyncStorage",
      "A Redux/Zustand store",
      "iOS Keychain / Android Keystore",
      "Inlined in the JS bundle",
    ],
    answer: 2,
    explanationHtml:
      "AsyncStorage is plaintext on disk, a Redux/Zustand store is just JS memory (and any persistence middleware for it typically writes straight to AsyncStorage), and the JS bundle ships to and can be read on the device. The Keychain/Keystore are hardware-backed secure storage — the only safe home for tokens.",
  },
  {
    id: "b3-z5",
    category: "security",
    categoryLabel: "Security",
    question: "Certificate pinning prevents MITM — what's its main operational risk?",
    options: [
      "It slows the app down",
      "Rotating the cert without an app update can brick connectivity",
      "It leaks the private key",
      "It disables HTTPS",
    ],
    answer: 1,
    explanationHtml:
      "Pinning doesn't touch HTTPS or expose any private key, and it costs essentially nothing in perf — the real risk is operational: rotating or mis-pinning the certificate/key without shipping an app update leaves clients unable to connect. Pin a long-lived key and keep backup pins.",
  },
  {
    id: "b3-z6",
    category: "security",
    categoryLabel: "Security",
    question: "Which verifies that a genuine, untampered app is running?",
    options: [
      "Certificate pinning",
      "Keychain storage",
      "App Attest (iOS) / Play Integrity (Android)",
      "Biometric login",
    ],
    answer: 2,
    explanationHtml:
      "Certificate pinning and Keychain storage protect data in transit and at rest, and biometric login authenticates the user — none of them prove the app binary or device haven't been tampered with. Attestation — App Attest/DeviceCheck and the Play Integrity API — is what verifies app and device integrity.",
  },
  {
    id: "b3-z7",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "react-native-executorch runs models in which format, on which runtime?",
    options: [
      ".gguf on llama.cpp",
      ".pte on PyTorch ExecuTorch",
      ".onnx on ONNX Runtime",
      ".tflite on TensorFlow Lite",
    ],
    answer: 1,
    explanationHtml:
      "GGUF on llama.cpp is the format used by react-native-ai's Llama path, not react-native-executorch — and ONNX/TFLite aren't part of this stack at all. react-native-executorch uses the <b>.pte</b> (PyTorch ExecuTorch) format on the <b>ExecuTorch</b> runtime, accelerated by XNNPACK / Core ML / Vulkan.",
  },
  {
    id: "b3-z8",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "The main benefit of on-device LLM inference is…",
    options: [
      "It always beats GPT-4 on quality",
      "Privacy, offline use, and no per-call cost",
      "Unlimited context length",
      "Zero storage footprint",
    ],
    answer: 1,
    explanationHtml:
      "On-device models trade away frontier-model quality for locality — they don't \"beat GPT-4,\" context length is typically smaller rather than unlimited, and the model files still take a real chunk of on-device storage. The actual win is data never leaving the device (privacy), offline operation with low latency, and no per-call cloud bill.",
  },
];

/** New study sessions for batch 3. */
export const ADVANCED3_STUDY: StudySection[] = [
  {
    id: "st-26",
    num: "26",
    title: "26 · Native iOS & Android in practice",
    html: `<p><b>Core:</b> the RN engineer who isn't afraid of the native side. Know the <b>memory models</b> — GC (JS, Kotlin/Java), ARC reference counting (Swift/Obj-C, C++ smart pointers), and manual C/C++ — and the leaks each invites (retain cycles → fix with <code>weak</code> delegates and <code>std::unique_ptr</code>). When the JS profiler is clean, profile <b>native</b>.</p>
      <ul>
        <li><b>Toolchains</b>: iOS = Xcode + CocoaPods (<code>pod install</code>) + <code>xcodebuild</code>; Android = Android Studio + Gradle (<code>./gradlew</code>). Be fluent opening, configuring, and signing both.</li>
        <li><b>Profiling</b>: Xcode <b>Instruments</b> (Time Profiler, Leaks), Android Studio Profiler — CPU/memory by thread.</li>
        <li><b>Assets</b>: iOS Asset Catalog → app thinning; Android <b>AAB</b> → per-device splits.</li>
        <li><b>Bridging</b>: wrap an unwrapped SDK in a typed <b>TurboModule</b> (Swift/Kotlin), keep the JS surface small, run heavy work off the JS thread.</li>
      </ul>
      <div class="callout tip"><span class="lbl">New concept</span> <b>Profile native when JS is clean.</b> A flat React profile with real jank means the cost is below JS — in native init, a module, or layout — and only native instruments will show it.</div>
      <div class="map"><span class="lbl">Your proof</span> You shipped <b>PSPDFKit native patches</b>, custom iOS/Android <b>camera-permission hooks</b>, native deep-link handling, and owned <b>app IDs, certificates, and provisioning</b> — you already live in the native layer; this names the muscle.</div>`,
  },
  {
    id: "st-27",
    num: "27",
    title: "27 · Mobile security in depth",
    html: `<p><b>Core:</b> answer security in <b>four threat-model buckets</b> — <b>secrets</b>, <b>data at rest</b>, <b>data in transit</b>, and <b>device/app integrity</b> — and name a control for each. Never ship secrets in the JS bundle (it's readable on-device); store tokens in the <b>Keychain/Keystore</b>, not AsyncStorage; encrypt sensitive local data.</p>
      <ul>
        <li><b>In transit</b>: HTTPS/ATS everywhere, plus <b>certificate pinning</b> (mind cert rotation and keep backup pins).</li>
        <li><b>Integrity</b>: <b>App Attest</b> (iOS) / <b>Play Integrity</b> (Android) attestation; jailbreak/root detection and obfuscation (R8, Hermes bytecode) as defense-in-depth.</li>
        <li><b>Auth</b>: biometrics gate a <b>Secure Enclave / TEE</b> key — the app never sees the biometric.</li>
        <li><b>Untrusted input</b>: validate/authorize every deep-link parameter; prefer verified Universal/App Links to custom schemes.</li>
        <li><b>Vocabulary</b>: OWASP <b>MASVS</b> / Mobile Top 10.</li>
      </ul>
      <div class="callout tip"><span class="lbl">New concept</span> <b>Parse the threat model out loud.</b> Naming the four buckets and a control per bucket reads as senior security maturity, not ad-hoc patching.</div>
      <div class="map"><span class="lbl">Your proof</span> You shipped <b>FaceID/TouchID biometric auth, Google Sign-In, and Salesforce auth</b> on Valt — real auth and sensitive-data flows. You've already made the secure-storage and token-handling calls; now you can frame them.</div>`,
  },
  {
    id: "st-28",
    num: "28",
    title: "28 · On-device AI in React Native",
    html: `<p><b>Core:</b> on-device inference runs the model <b>on the phone</b> — no cloud round-trip — for privacy, offline, low latency, and zero per-call cost (trading away frontier-model quality and using device compute). The React Native ecosystem has two leading toolkits.</p>
      <ul>
        <li><b>React Native ExecuTorch</b> (Software Mansion): PyTorch's <b>ExecuTorch</b> runtime, <b>.pte</b> models, backends <b>XNNPACK / Core ML / Vulkan</b>. Declarative hooks: <code>useLLM</code>, <code>useSpeechToText</code> (Whisper), <code>useObjectDetection</code> (YOLO/SAM), <code>useTextEmbeddings</code>. Runs Llama 3.2, Qwen, Phi, SmolLM.</li>
        <li><b>react-native-ai</b> (Callstack): a <b>Vercel AI SDK drop-in</b> (<code>generateText</code> / <code>streamText</code> / <code>embed</code>) over <b>Apple Foundation Models</b> (built-in), <b>Llama</b> (GGUF), and <b>MLC LLM</b> — download + <code>.prepare()</code> non-Apple models from Hugging Face.</li>
        <li><b>The decision</b>: on-device for privacy/compliance/offline/cost; cloud for top quality or huge context. Name the trade-off.</li>
      </ul>
      <div class="callout tip"><span class="lbl">New concept</span> The <b>privacy/cost/latency case</b> for local inference — and that RN already has production-grade tooling for it — turns "I'm into on-device AI" into "I'd reach for react-native-executorch or react-native-ai because…".</div>
      <div class="map"><span class="lbl">Your proof</span> You list <b>on-device AI</b> as a differentiator — now you can name the exact stack (ExecuTorch <code>.pte</code> + hooks, or the Vercel-AI-SDK-compatible react-native-ai) and the privacy/offline argument behind it.</div>`,
  },
];
