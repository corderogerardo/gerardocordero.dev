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
    answerHtml: `<p>Xcode treats the model as a first-class type instead of an opaque blob, so integration mistakes
      surface as compile errors, not runtime crashes. Drop in an <code>.mlpackage</code>/<code>.mlmodel</code> and
      Xcode generates a <b>typed Swift class</b> with strongly-typed input/output; at build time it's compiled to
      <code>.mlmodelc</code>. You instantiate the class and call its prediction methods — no manual parsing of
      model metadata. <b>The model's input/output contract is checked at compile time, the same as any other Swift
      type.</b></p>`,
    level: "beyond",
  },
  {
    id: "ml2",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "How do you run a prediction?",
    answerHtml: `<p>Inference has real latency, so treating it like a synchronous getter on the main thread is
      how you get dropped frames. Call the generated <code>model.prediction(input:)</code> with the typed input (or
      an <code>MLFeatureProvider</code>) and read the typed output. Wrap it in an async task off the main thread for
      anything non-trivial, and reuse the loaded model instance rather than recreating it per call. <b>I run
      prediction off the main thread and reuse one loaded model instance for the app's lifetime.</b></p>`,
    level: "beyond",
  },
  {
    id: "ml3",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "What is MLMultiArray?",
    answerHtml: `<p>Not every model speaks image or text — plenty take raw tensors, and Core ML needs a typed
      container for those so the shape/dtype contract is enforced instead of guessed. <code>MLMultiArray</code> is
      that typed, shaped numeric array, used for models that take/return raw arrays (embeddings, logits, audio
      frames). You set its <code>shape</code> and <code>dataType</code> and fill it. <b>Mismatched shape or dtype
      on an MLMultiArray is the most common Core ML integration bug — I check both before debugging further.</b></p>`,
    level: "beyond",
  },
  {
    id: "ml4",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "What does MLModelConfiguration.computeUnits control?",
    answerHtml: `<p>It exists because "run wherever is fastest" isn't always what you want — sometimes you need
      determinism or need to stay off hardware another feature is using. <code>computeUnits</code> controls where
      inference runs: <code>.all</code> (CPU + GPU + Neural Engine, default), <code>.cpuAndNeuralEngine</code>, or
      <code>.cpuOnly</code>. Use it to force determinism for tests, avoid the GPU when it's busy with rendering, or
      benchmark each backend. <b>Default .all lets Core ML pick per op — I only override it when I have a concrete
      reason.</b></p>`,
    level: "architect",
  },
  {
    id: "ml5",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "What is the Neural Engine and its caveat?",
    answerHtml: `<p>The <b>Apple Neural Engine (ANE)</b> is a dedicated accelerator that runs supported ML ops very
      fast and power-efficiently. Caveat: not every operation is ANE-compatible — unsupported layers fall back to
      GPU/CPU, so a model's real speed depends on how much of it the ANE can take. <b>I never assume ANE speed from
      the spec sheet — I profile the actual model on device to see how much of it lands on the ANE.</b> Red flag:
      quoting a model's theoretical ANE throughput as its real-world speed without profiling.</p>`,
    level: "architect",
  },
  {
    id: "ml6",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "Why use batch prediction?",
    answerHtml: `<p>Each single <code>prediction</code> call pays fixed setup cost, so looping it over many inputs
      wastes most of your time on overhead instead of compute. Running <code>predictions(from:)</code> over a
      batch is far faster — Core ML amortizes setup and parallelizes on the hardware. <b>Whenever I have many
      inputs — a feed of images, a list of texts to embed — I batch them instead of looping single
      predictions.</b></p>`,
    level: "beyond",
  },
  {
    id: "ml7",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "What's the right way to load a model?",
    answerHtml: `<p>Model load/compile cost is fixed per instantiation, so paying it repeatedly turns a one-time
      cost into a recurring one that stutters the UI. Load it <b>once</b>, off the main thread (async), and
      <b>cache</b> the instance for the app's lifetime. Don't construct the model per prediction. <b>I load the
      model once at startup, off the main thread, and reuse that instance for every prediction.</b> Red flag:
      instantiating the model class inside the prediction call site — it works in a demo and stutters in
      production.</p>`,
    level: "beyond",
  },
  {
    id: "ml8",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "What is on-device personalization (updatable models)?",
    answerHtml: `<p>Personalization normally means shipping user data to a server to retrain a model — updatable
      models remove that trade-off entirely. Some Core ML models are <b>updatable</b>: you fine-tune them <i>on
      device</i> with the user's own data via <code>MLUpdateTask</code>, producing a personalized model that never
      leaves the device. Great for private adaptation (handwriting, preferences). <b>Updatable models let me
      personalize per-user without the user's data ever touching a server.</b></p>`,
    level: "architect",
  },
  {
    id: "ml9",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "How do you shrink a Core ML model?",
    answerHtml: `<p>A large model download hurts app size and cold-start load time, so shrinking the model is
      often a bigger UX win than optimizing the code around it. Compress with <code>coremltools</code>:
      <b>quantization</b> (lower-precision weights, e.g. 8-bit), <b>palettization</b> (cluster weights into a
      small palette), and <b>pruning</b> (zero out small weights). These cut size and often speed up inference.
      <b>I quantize or palettize first, then measure the accuracy trade-off on real inputs before shipping.</b> Red
      flag: assuming compression is free — always validate accuracy after, not just size.</p>`,
    level: "architect",
  },
  {
    id: "ml10",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "How do you convert a PyTorch/TensorFlow model to Core ML?",
    answerHtml: `<p>Conversion changes the op graph and sometimes precision, so an unvalidated port can silently
      degrade accuracy while still "running." Use <code>coremltools</code> (<code>ct.convert</code>) — trace/export
      the source model, convert to an <code>.mlpackage</code>, set input/output types and compute precision, then
      <b>validate parity</b> against the original on sample inputs. <b>I never ship a converted model without
      comparing its outputs to the source model on real inputs.</b> Red flag: treating "it converted without
      errors" as proof the model is correct.</p>`,
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
    answerHtml: `<p>Server-side embedding search means sending user queries and content off-device — for private
      or offline search you need the whole pipeline local. <code>NLEmbedding</code> (Natural Language) gives word/
      sentence <b>vectors</b> on device; embed your content and a query, then rank by cosine similarity. For richer
      embeddings, run a small Core ML embedding model. <b>I do semantic search fully on device with NLEmbedding
      plus cosine similarity — no server round trip, no data leaving the device.</b></p>`,
    level: "beyond",
  },
  {
    id: "ml14",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "What do Speech and Sound Analysis provide on device?",
    answerHtml: `<p>Audio is sensitive data — running transcription and classification locally instead of
      streaming audio to a server is the difference in the privacy pitch. <b>Speech</b>
      (<code>SFSpeechRecognizer</code>) transcribes audio — increasingly on-device (request on-device recognition;
      respect the speech-recognition permission). <b>Sound Analysis</b> (<code>SNClassifySoundRequest</code>)
      classifies audio events (built-in or your Create ML sound model). <b>Both run locally, so I can offer
      transcription or sound detection without the audio ever leaving the device.</b></p>`,
    level: "beyond",
  },
  {
    id: "ml15",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "What is the Translation framework?",
    answerHtml: `<p>Shipping translation used to mean either a cloud API dependency or bundling your own model — the
      Translation framework removes both. It's a system framework for <b>on-device translation</b>: present the
      system translation UI with a SwiftUI modifier, or use the API to translate text in-app, downloading language
      assets as needed. <b>I reach for the system Translation framework before building a cloud translation
      dependency.</b></p>`,
    level: "beyond",
  },
  {
    id: "ml16",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "How should you think about Apple Intelligence / on-device foundation models?",
    answerHtml: `<p>Treat it as a platform capability with uneven availability, not a guaranteed feature — device,
      OS version, and region all gate it. It's Apple's <b>on-device-first generative</b> layer: system writing
      tools, image features, Siri/App Intents, and access to on-device foundation models. Adopt it through the
      provided system APIs and <b>App Intents</b>, lean on its on-device nature for privacy, and always provide a
      <b>graceful fallback</b> for devices/regions where it isn't available. <b>I feature-gate Apple Intelligence
      and always ship a working fallback path — I never assume it's present.</b> Red flag: building a feature that
      hard-requires Apple Intelligence with no fallback.</p>`,
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
      <code>.mlmodelc</code> at build time — the model behaves like any other Swift type. "Nothing until runtime
      download" describes a remote config or CloudKit asset, not a bundled Core ML model, which is compiled and
      typed at build time.</p>`,
  },
  {
    id: "mlz2",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "To run many inferences efficiently you should:",
    options: ["Loop single prediction() calls", "Use batch predictions(from:)", "Recreate the model each time", "Force cpuOnly"],
    answer: 1,
    explanationHtml: `<p>Batch prediction amortizes setup and parallelizes on hardware — much faster than a loop
      of single predictions. Looping <code>prediction()</code> feels correct because each call works, but it pays
      per-call overhead N times over; forcing <code>cpuOnly</code> or recreating the model doesn't address that
      overhead at all.</p>`,
  },
  {
    id: "mlz3",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "A model runs partly on CPU even with .all because:",
    options: ["computeUnits is ignored", "Not every op is Neural Engine-compatible (fallback to GPU/CPU)", "The ANE is disabled by default", "Core ML never uses the ANE"],
    answer: 1,
    explanationHtml: `<p>Unsupported layers fall back from the ANE to GPU/CPU, so real speed depends on how much
      of the model the ANE can run — profile to see. It's a common misconception that <code>.all</code> forces
      everything onto the Neural Engine; in reality Core ML routes per op, and any unsupported op silently falls
      back rather than erroring.</p>`,
  },
  {
    id: "mlz4",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "Fine-tuning a model on the user's own data, privately, uses:",
    options: ["A server", "Updatable models / MLUpdateTask on device", "coremltools at runtime", "Create ML in the cloud"],
    answer: 1,
    explanationHtml: `<p>Updatable Core ML models train on-device via <code>MLUpdateTask</code>, personalizing
      without sending data off the device. "coremltools at runtime" is the misconception — coremltools is a
      developer-side conversion/optimization tool, not something you run in the shipped app to update weights.</p>`,
  },
  {
    id: "mlz5",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "To shrink a Core ML model you'd use coremltools to:",
    options: ["Add layers", "Quantize / palettize / prune the weights", "Convert to JSON", "Increase precision"],
    answer: 1,
    explanationHtml: `<p>Quantization, palettization, and pruning reduce size (and often speed up inference), but
      the accuracy loss should be measured, not assumed to be small — "increase precision" moves the model in the
      opposite direction, growing it.</p>`,
  },
  {
    id: "mlz6",
    category: "ai",
    categoryLabel: "On-Device AI",
    question: "Running an image classification Core ML model is easiest with:",
    options: ["Manual CVPixelBuffer resizing", "Vision's VNCoreMLRequest (handles preprocessing)", "Metal shaders", "URLSession"],
    answer: 1,
    explanationHtml: `<p>Vision performs the resizing/cropping/orientation the model expects, so
      <code>VNCoreMLRequest</code> avoids hand-massaging pixel buffers. Manual <code>CVPixelBuffer</code> resizing
      works but reimplements what Vision already does correctly, including edge cases like orientation metadata
      that are easy to get wrong by hand.</p>`,
  },
];

export const ADVANCED29_STUDY: StudySection[] = [
  {
    id: "st-adv-65",
    num: "80",
    title: "80 · Core ML in depth: models, compute & compression",
    html: `<p><b>Why it matters.</b> On-device inference removes the server round trip and the data-off-device
      privacy cost — but only if you load and run the model efficiently, or the app pays the latency back in
      stutter. Add an <code>.mlpackage</code> → Xcode generates a typed class; predict with the typed input (or
      <code>MLFeatureProvider</code>/<code>MLMultiArray</code>), <b>batch</b> when you can, and <b>load once /
      off-main / cache</b>. <code>MLModelConfiguration.computeUnits</code> steers CPU/GPU/<b>Neural Engine</b>
      (remember unsupported ops fall back). Convert third-party models with <b>coremltools</b> (and validate
      parity), <b>compress</b> them (quantize/palettize/prune), and use <b>updatable models</b>
      (<code>MLUpdateTask</code>) for private on-device personalization.</p>
    <div class="callout tip"><span class="lbl">Profile</span> Real speed = how much of the model the ANE runs +
      whether you batch + not reloading the model. Measure on device, not the simulator. In an interview, say:
      "I load the model once, batch inputs when I can, and profile on device before trusting any spec-sheet
      throughput number."</div>`,
  },
  {
    id: "st-adv-66",
    num: "81",
    title: "81 · The on-device ML toolbox",
    html: `<p><b>Why it matters.</b> Each of these frameworks exists so you don't build a server dependency for a
      task the device can already do privately and for free. <b>Vision</b> (<code>VNCoreMLRequest</code> +
      detectors) for images, <b>Natural Language</b> (<code>NLEmbedding</code> for semantic similarity/search,
      taggers) for text, <b>Speech</b> for transcription, <b>Sound Analysis</b> for audio events, and the
      <b>Translation</b> framework for on-device translation. Above them, <b>Apple Intelligence</b> brings system
      generative features and on-device foundation models — adopt via system APIs and App Intents, with graceful
      fallback and a privacy-first posture.</p>
    <div class="callout tip"><span class="lbl">Default</span> Run on device when the task fits (private, offline,
      no per-call cost); fall back to a server only when the workload genuinely exceeds the device. In an
      interview, say: "I default to the on-device framework for the task and only reach for a server when the
      workload genuinely outgrows the device."</div>`,
  },
];
