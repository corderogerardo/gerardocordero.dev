// Advanced batch 29 — Core ML & on-device AI, deep (beyond/architect). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED29_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED29_FLASHCARDS: Flashcard[] = [
  {
    id: "ml1",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "How does a Core ML model integrate into the project?",
    answerHtml: `<p>Drop in an <code>.mlpackage</code>/<code>.mlmodel</code> and Xcode generates a <b>typed Swift
      class</b> with strongly-typed input/output. At build time the model is compiled to <code>.mlmodelc</code>.
      You instantiate the class and call its prediction methods — no manual parsing of model metadata.</p>`,
    level: "beyond",
  },
  {
    id: "ml2",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "How do you run a prediction?",
    answerHtml: `<p>Call the generated <code>model.prediction(input:)</code> with the typed input (or an
      <code>MLFeatureProvider</code>) and read the typed output. Wrap it in an async task off the main thread for
      anything non-trivial, and reuse the loaded model instance rather than recreating it per call.</p>`,
    level: "beyond",
  },
  {
    id: "ml3",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "What is MLMultiArray?",
    answerHtml: `<p>Core ML's tensor type — a typed, shaped numeric array used for models that take/return raw
      arrays (embeddings, logits, audio frames) rather than images or text. You set its <code>shape</code> and
      <code>dataType</code> and fill it; mismatched shape/dtype is a common integration bug.</p>`,
    level: "beyond",
  },
  {
    id: "ml4",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "What does MLModelConfiguration.computeUnits control?",
    answerHtml: `<p>Where inference runs: <code>.all</code> (CPU + GPU + Neural Engine, default),
      <code>.cpuAndNeuralEngine</code>, or <code>.cpuOnly</code>. Use it to force determinism for tests, avoid the
      GPU when it's busy with rendering, or benchmark each backend. Default <code>.all</code> lets Core ML pick
      per op.</p>`,
    level: "architect",
  },
  {
    id: "ml5",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "What is the Neural Engine and its caveat?",
    answerHtml: `<p>The <b>Apple Neural Engine (ANE)</b> is a dedicated accelerator that runs supported ML ops
      very fast and power-efficiently. Caveat: not every operation is ANE-compatible — unsupported layers fall
      back to GPU/CPU, so a model's real speed depends on how much of it the ANE can take. Profile to confirm.</p>`,
    level: "architect",
  },
  {
    id: "ml6",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "Why use batch prediction?",
    answerHtml: `<p>Running <code>predictions(from:)</code> over a batch is far faster than looping single
      <code>prediction</code> calls — Core ML amortizes setup and parallelizes on the hardware. Whenever you have
      many inputs (a feed of images, a list of texts to embed), batch them.</p>`,
    level: "beyond",
  },
  {
    id: "ml7",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "What's the right way to load a model?",
    answerHtml: `<p>Loading/compiling a model is relatively slow, so load it <b>once</b>, off the main thread
      (async), and <b>cache</b> the instance for the app's lifetime. Don't construct the model per prediction;
      that re-pays the load cost and stutters the UI.</p>`,
    level: "beyond",
  },
  {
    id: "ml8",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "What is on-device personalization (updatable models)?",
    answerHtml: `<p>Some Core ML models are <b>updatable</b>: you fine-tune them <i>on device</i> with the user's
      own data via <code>MLUpdateTask</code>, producing a personalized model that never leaves the device. Great
      for private adaptation (handwriting, preferences) without sending data to a server.</p>`,
    level: "architect",
  },
  {
    id: "ml9",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "How do you shrink a Core ML model?",
    answerHtml: `<p>Compress with <code>coremltools</code> optimization: <b>quantization</b> (lower-precision
      weights, e.g. 8-bit), <b>palettization</b> (cluster weights into a small palette), and <b>pruning</b>
      (zero out small weights). These cut size and often speed up inference with minimal accuracy loss — measure
      the trade-off.</p>`,
    level: "architect",
  },
  {
    id: "ml10",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "How do you convert a PyTorch/TensorFlow model to Core ML?",
    answerHtml: `<p>Use <code>coremltools</code> (<code>ct.convert</code>) — typically trace/export the source
      model, convert to an <code>.mlpackage</code>, set input/output types and compute precision, then
      <b>validate parity</b> (compare outputs against the original on sample inputs). Don't assume the conversion
      is exact; verify accuracy on device.</p>`,
    level: "architect",
  },
  {
    id: "ml11",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "What does Create ML offer?",
    answerHtml: `<p>Training without leaving Apple's stack: the <b>Create ML app</b> (drag in data, train image/
      text/sound/tabular/action models, export Core ML) and the <b>Create ML framework</b> for programmatic
      training. Good for custom classifiers when you don't need a full PyTorch pipeline.</p>`,
    level: "beyond",
  },
  {
    id: "ml12",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "How do Vision and Core ML work together?",
    answerHtml: `<p>Wrap a Core ML image model in a <code>VNCoreMLRequest</code> and run it via
      <code>VNImageRequestHandler</code> — Vision handles the <b>preprocessing</b> (resizing, color, orientation,
      cropping to regions) that the model expects, so you don't hand-massage pixel buffers. Ideal for
      classification/detection on camera frames.</p>`,
    level: "beyond",
  },
  {
    id: "ml13",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "How do you do semantic similarity without a server?",
    answerHtml: `<p><code>NLEmbedding</code> (Natural Language) gives word/sentence <b>vectors</b> on device;
      embed your content and a query, then rank by cosine similarity — fully offline, private semantic search. For
      richer embeddings, run a small Core ML embedding model. (This guide's browser search uses the same idea.)</p>`,
    level: "beyond",
  },
  {
    id: "ml14",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "What do Speech and Sound Analysis provide on device?",
    answerHtml: `<p><b>Speech</b> (<code>SFSpeechRecognizer</code>) transcribes audio — increasingly on-device
      (request on-device recognition; respect the speech-recognition permission). <b>Sound Analysis</b>
      (<code>SNClassifySoundRequest</code>) classifies audio events (built-in or your Create ML sound model).
      Both run locally for privacy and offline use.</p>`,
    level: "beyond",
  },
  {
    id: "ml15",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "What is the Translation framework?",
    answerHtml: `<p>A system framework for <b>on-device translation</b> — present the system translation UI with
      a SwiftUI modifier, or use the API to translate text in-app (downloading language assets as needed). It lets
      you add translation without a cloud service or your own model.</p>`,
    level: "beyond",
  },
  {
    id: "ml16",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "How should you think about Apple Intelligence / on-device foundation models?",
    answerHtml: `<p>It's Apple's <b>on-device-first generative</b> layer — system writing tools, image features,
      Siri/App Intents, and access to on-device foundation models. Adopt it through the provided system APIs and
      <b>App Intents</b>, lean on its on-device nature for privacy, and always provide a <b>graceful fallback</b>
      for devices/regions where it isn't available. Treat capabilities as evolving and feature-gate
      accordingly.</p>`,
    level: "beyond",
  },
];

export const ADVANCED29_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED29_QUIZ: QuizQuestion[] = [
  {
    id: "mlz1",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "Adding a .mlpackage to an Xcode project gives you:",
    options: ["A REST endpoint", "A generated, strongly-typed Swift model class", "Nothing until runtime download", "A Python script"],
    answer: 1,
    explanationHtml: `<p>Xcode generates a typed class with typed inputs/outputs and compiles the model to
      <code>.mlmodelc</code> at build time.</p>`,
  },
  {
    id: "mlz2",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "To run many inferences efficiently you should:",
    options: ["Loop single prediction() calls", "Use batch predictions(from:)", "Recreate the model each time", "Force cpuOnly"],
    answer: 1,
    explanationHtml: `<p>Batch prediction amortizes setup and parallelizes on hardware — much faster than a loop
      of single predictions.</p>`,
  },
  {
    id: "mlz3",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "A model runs partly on CPU even with .all because:",
    options: ["computeUnits is ignored", "Not every op is Neural Engine-compatible (fallback to GPU/CPU)", "The ANE is disabled by default", "Core ML never uses the ANE"],
    answer: 1,
    explanationHtml: `<p>Unsupported layers fall back from the ANE to GPU/CPU, so real speed depends on how much
      of the model the ANE can run — profile to see.</p>`,
  },
  {
    id: "mlz4",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "Fine-tuning a model on the user's own data, privately, uses:",
    options: ["A server", "Updatable models / MLUpdateTask on device", "coremltools at runtime", "Create ML in the cloud"],
    answer: 1,
    explanationHtml: `<p>Updatable Core ML models train on-device via <code>MLUpdateTask</code>, personalizing
      without sending data off the device.</p>`,
  },
  {
    id: "mlz5",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "To shrink a Core ML model you'd use coremltools to:",
    options: ["Add layers", "Quantize / palettize / prune the weights", "Convert to JSON", "Increase precision"],
    answer: 1,
    explanationHtml: `<p>Quantization, palettization, and pruning reduce size (and often speed up inference)
      with measured, usually small accuracy loss.</p>`,
  },
  {
    id: "mlz6",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "Running an image classification Core ML model is easiest with:",
    options: ["Manual CVPixelBuffer resizing", "Vision's VNCoreMLRequest (handles preprocessing)", "Metal shaders", "URLSession"],
    answer: 1,
    explanationHtml: `<p>Vision performs the resizing/cropping/orientation the model expects, so
      <code>VNCoreMLRequest</code> avoids hand-massaging pixel buffers.</p>`,
  },
];

export const ADVANCED29_STUDY: StudySection[] = [
  {
    id: "st-adv-65",
    num: "80",
    title: "80 · Core ML in depth: models, compute & compression",
    html: `<p><b>What it is.</b> Running trained models on device. Add an <code>.mlpackage</code> → Xcode
      generates a typed class; predict with the typed input (or <code>MLFeatureProvider</code>/
      <code>MLMultiArray</code>), <b>batch</b> when you can, and <b>load once / off-main / cache</b>.
      <code>MLModelConfiguration.computeUnits</code> steers CPU/GPU/<b>Neural Engine</b> (remember unsupported ops
      fall back). Convert third-party models with <b>coremltools</b> (and validate parity), <b>compress</b> them
      (quantize/palettize/prune), and use <b>updatable models</b> (<code>MLUpdateTask</code>) for private
      on-device personalization.</p>
    <div class="callout tip"><span class="lbl">Profile</span> Real speed = how much of the model the ANE runs +
      whether you batch + not reloading the model. Measure on device, not the simulator.</div>`,
  },
  {
    id: "st-adv-66",
    num: "81",
    title: "81 · The on-device ML toolbox",
    html: `<p><b>What it is.</b> Task frameworks layered on the same on-device, private, offline philosophy.
      <b>Vision</b> (<code>VNCoreMLRequest</code> + detectors) for images, <b>Natural Language</b>
      (<code>NLEmbedding</code> for semantic similarity/search, taggers) for text, <b>Speech</b> for transcription,
      <b>Sound Analysis</b> for audio events, and the <b>Translation</b> framework for on-device translation.
      Above them, <b>Apple Intelligence</b> brings system generative features and on-device foundation models —
      adopt via system APIs and App Intents, with graceful fallback and a privacy-first posture.</p>
    <div class="callout tip"><span class="lbl">Default</span> Run on device when the task fits (private, offline,
      no per-call cost); fall back to a server only when the workload genuinely exceeds the device.</div>`,
  },
];
