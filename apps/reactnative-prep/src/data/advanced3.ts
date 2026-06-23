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
      "<b>JS</b> and <b>Kotlin/Java</b> use <b>garbage collection</b>; <b>Swift/Obj-C</b> (and C++ smart pointers) use <b>reference counting (ARC)</b>; raw C/C++ is <b>manual</b> (<code>new</code>/<code>delete</code>). In a native module prefer <code>std::unique_ptr</code> / <code>std::shared_ptr</code> and mark Swift delegates <code>weak</code> to avoid retain cycles.",
  },
  {
    id: "n-2",
    category: "native",
    categoryLabel: "NATIVE",
    question: "The JS profiler is clean but the app is still slow — where do you look?",
    answerHtml:
      "The <b>native</b> side. Profile with <b>Xcode Instruments → Time Profiler</b> (iOS) or the <b>Android Studio Profiler</b> (CPU/memory by thread). Heavy native init, a slow native module, or battery drain hide there. For native leaks use Xcode <b>Leaks</b> / the Android Memory Profiler.",
  },
  {
    id: "n-3",
    category: "native",
    categoryLabel: "NATIVE",
    question: "What iOS vs Android build toolchains should a senior RN engineer know?",
    answerHtml:
      "<b>iOS</b>: Xcode + <b>CocoaPods</b> (<code>pod install</code>) → <code>xcodebuild</code>. <b>Android</b>: Android Studio + <b>Gradle</b> (<code>./gradlew</code>). You should comfortably open the native project, read build config, handle signing/provisioning, and run <code>pod install</code> / <code>gradlew clean</code>.",
  },
  {
    id: "n-4",
    category: "native",
    categoryLabel: "NATIVE",
    question: "How do you deliver per-device image assets without bloating the download?",
    answerHtml:
      "On <b>iOS</b>, ship images through the <b>Asset Catalog</b> so the App Store does <b>app thinning</b> (per-device variants). On <b>Android</b>, ship an <b>AAB</b> — Play generates per-density / per-ABI splits and delivers only what each device needs.",
  },
  {
    id: "n-5",
    category: "native",
    categoryLabel: "NATIVE",
    question: "How do you integrate a native SDK that has no React Native wrapper?",
    answerHtml:
      "Write a thin <b>TurboModule</b> (or Expo module): define a typed spec, implement it in <b>Swift/Kotlin</b>, expose only the methods you need, bridge events via an emitter, and wire build config (Pods/Gradle, Info.plist / AndroidManifest permissions). Keep the JS surface small and typed, and run heavy work <b>async on a background thread</b>.",
  },
  {
    id: "n-6",
    category: "native",
    categoryLabel: "NATIVE",
    question: "What is a retain cycle, and how does it cause a native leak?",
    answerHtml:
      "Two objects holding <b>strong</b> references to each other (e.g. a view controller and its delegate or a captured <code>self</code> in a closure) never reach refcount zero, so ARC never frees them. Break it with a <code>weak</code> (or <code>unowned</code>) reference on one side — the classic Swift delegate/closure fix.",
  },
  {
    id: "n-7",
    category: "native",
    categoryLabel: "NATIVE",
    question: "Where does Yoga layout run, and why does it matter?",
    answerHtml:
      "React Native computes layout with <b>Yoga</b> (Flexbox) off the JS thread, then commits to the native UI thread. Under <b>Fabric</b> the shadow tree is shared C++, enabling synchronous layout. This is why layout-heavy trees can still be smooth, and why view <b>flattening</b> trims the native hierarchy.",
  },

  // ---------- Mobile security (security) ----------
  {
    id: "s-1",
    category: "security",
    categoryLabel: "SECURITY",
    question: "Where must secrets and tokens live in a mobile app — and where can't they?",
    answerHtml:
      "Tokens/keys go in the <b>iOS Keychain / Android Keystore</b> (hardware-backed, via <code>expo-secure-store</code> or <code>react-native-keychain</code>) — never <code>AsyncStorage</code> (plaintext). And <b>never</b> embed API secrets in the JS bundle: it ships to the device and is trivially readable. Server secrets stay server-side.",
  },
  {
    id: "s-2",
    category: "security",
    categoryLabel: "SECURITY",
    question: "What is certificate (SSL) pinning, and what's the catch?",
    answerHtml:
      "The app trusts <b>only</b> your specific server cert / public key (or CA), defeating man-in-the-middle proxies even with a malicious trusted root. The catch is <b>rotation</b>: pin the wrong thing or rotate the cert without shipping an app update and you brick connectivity — so pin a long-lived key and keep backup pins.",
  },
  {
    id: "s-3",
    category: "security",
    categoryLabel: "SECURITY",
    question: "What is OWASP MASVS / the Mobile Top 10, and why name it?",
    answerHtml:
      "The <b>Mobile Application Security Verification Standard</b> and the OWASP <b>Mobile Top 10</b> are the industry checklist — insecure storage, weak crypto, insecure communication, reverse-engineering, and so on. Naming the framework signals you think in <b>threat-model buckets</b>, not ad-hoc fixes.",
  },
  {
    id: "s-4",
    category: "security",
    categoryLabel: "SECURITY",
    question: "How do you verify an app/device is genuine (anti-tampering)?",
    answerHtml:
      "Platform <b>attestation</b>: <b>App Attest</b> / DeviceCheck on iOS and the <b>Play Integrity API</b> on Android verify the app binary and device haven't been tampered with or emulated. Pair with <b>jailbreak/root detection</b> as defense-in-depth — never a silver bullet, since it's bypassable.",
  },
  {
    id: "s-5",
    category: "security",
    categoryLabel: "SECURITY",
    question: "How do biometrics actually protect data, beyond a fingerprint check?",
    answerHtml:
      "Biometric auth (FaceID/TouchID, Android BiometricPrompt) gates a key stored in the <b>Secure Enclave / TEE</b> — the biometric unlocks the hardware key and the app never sees the biometric itself. So it's not just a UI gate; it binds decryption to the device's secure hardware.",
  },
  {
    id: "s-6",
    category: "security",
    categoryLabel: "SECURITY",
    question: "What are the four threat-model buckets to name for mobile security?",
    answerHtml:
      "<b>Secrets</b> (don't ship them in the bundle), <b>data at rest</b> (Keychain/Keystore, encrypted DBs), <b>data in transit</b> (HTTPS/ATS + pinning), and <b>device/app integrity</b> (attestation, jailbreak/root detection, obfuscation). Walking these four out loud is the senior move.",
  },
  {
    id: "s-7",
    category: "security",
    categoryLabel: "SECURITY",
    question: "Why are deep links a security concern, and how do you harden them?",
    answerHtml:
      "A deep link is <b>untrusted input</b> — anything can craft <code>myapp://transfer?to=…</code>. <b>Validate and authorize</b> every parameter, prefer verified <b>Universal / App Links</b> (domain-owned, can't be hijacked by another app) over custom schemes, and never run a sensitive action from a link without an auth check.",
  },
  {
    id: "s-8",
    category: "security",
    categoryLabel: "SECURITY",
    question: "What does code obfuscation buy you on each platform?",
    answerHtml:
      "On Android, <b>R8 / ProGuard</b> renames and strips symbols, raising the bar for reverse-engineering. On iOS, <b>Hermes bytecode</b> ships your JS as compiled bytecode rather than readable source. Both are <b>defense-in-depth</b>, not protection for secrets — assume a determined attacker can still read the binary.",
  },

  // ---------- On-device AI (ai) ----------
  {
    id: "ai-x1",
    category: "ai",
    categoryLabel: "AI",
    question: "What is React Native ExecuTorch and what runtime powers it?",
    answerHtml:
      "A Software Mansion / Callstack toolkit to run AI models <b>fully on-device</b> in React Native, powered by PyTorch's <b>ExecuTorch</b> edge runtime. Models ship as optimized <b>.pte</b> binaries and run through hardware backends — <b>XNNPACK</b> (CPU), <b>Core ML</b> (iOS), and <b>Vulkan</b> (GPU).",
  },
  {
    id: "ai-x2",
    category: "ai",
    categoryLabel: "AI",
    question: "What's the headline benefit of on-device inference vs a cloud LLM API?",
    answerHtml:
      "<b>Privacy</b> (user data never leaves the device), <b>no per-call cost</b> or cloud infra, lower <b>latency</b>, and <b>offline</b> operation. The trade-offs are model size/quality limits and using the device's compute and battery.",
  },
  {
    id: "ai-x3",
    category: "ai",
    categoryLabel: "AI",
    question: "What's the developer API shape of react-native-executorch?",
    answerHtml:
      "Declarative <b>hooks</b> per task: <code>useLLM</code> (chat/generation), <code>useSpeechToText</code> (Whisper), <code>useTextToSpeech</code>, <code>useObjectDetection</code> (YOLO/SAM), and <code>useImageEmbeddings</code> / <code>useTextEmbeddings</code> for semantic search. It runs models like <b>Llama 3.2</b>, <b>Qwen</b>, <b>Phi</b>, and <b>SmolLM</b>.",
  },
  {
    id: "ai-x4",
    category: "ai",
    categoryLabel: "AI",
    question: "What is Callstack's react-native-ai, and how does it relate to the Vercel AI SDK?",
    answerHtml:
      "A library of on-device AI primitives that's a <b>drop-in for the Vercel AI SDK</b> — the same <code>generateText</code> / <code>streamText</code> / <code>embed</code> APIs, but running locally. It supports <b>Apple Foundation Models</b> (built-in, iOS), <b>Llama</b> (GGUF via llama.rn), and <b>MLC LLM</b> engines.",
  },
  {
    id: "ai-x5",
    category: "ai",
    categoryLabel: "AI",
    question: "How do on-device models get onto the device in react-native-ai?",
    answerHtml:
      "Apple Foundation Models are <b>built in</b> (no download). Llama and MLC models are <b>GGUF</b> files pulled from Hugging Face and initialized with <code>.download()</code> then <code>.prepare()</code> before inference — so plan for a first-run download and a real storage footprint.",
  },
  {
    id: "ai-x6",
    category: "ai",
    categoryLabel: "AI",
    question: "When would you choose on-device AI over a cloud model in an interview answer?",
    answerHtml:
      "When <b>privacy/compliance</b> forbids sending data off-device (health, finance), when you need <b>offline</b> or <b>low-latency</b> UX, or to <b>cut inference cost</b>. Choose cloud when you need frontier-model quality or huge context. A senior answer names the <b>trade-off</b>, not a blanket rule.",
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
      "When JS is clean, the cost is native — profile with Instruments (Time Profiler) or the Android Studio Profiler to see CPU/memory by thread.",
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
      "A mutual strong reference never reaches refcount zero under ARC. A <code>weak</code> delegate breaks the cycle so it can be freed.",
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
      "An <b>AAB</b> lets Google Play generate and deliver per-density / per-ABI splits, so each device downloads only what it needs.",
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
      "The Keychain/Keystore are hardware-backed secure storage. AsyncStorage is plaintext, and the JS bundle ships to (and can be read on) the device.",
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
      "If you rotate or mis-pin the certificate/key without shipping an update, clients can no longer connect. Pin a long-lived key and keep backup pins.",
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
      "Attestation — App Attest/DeviceCheck and the Play Integrity API — verifies the app binary and device integrity. The others protect data, not app authenticity.",
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
      "It uses the <b>.pte</b> (PyTorch ExecuTorch) format on the <b>ExecuTorch</b> runtime, accelerated by XNNPACK / Core ML / Vulkan.",
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
      "Data never leaves the device (privacy), it works offline with low latency, and there's no cloud API bill — at the cost of model size/quality and device compute.",
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
