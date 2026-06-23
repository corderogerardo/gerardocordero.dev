// Advanced batch 18 — Core Image & image editing (mid/senior). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED18_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED18_FLASHCARDS: Flashcard[] = [
  {
    id: "y1",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What are the three core types in Core Image?",
    answerHtml: `<p><code>CIImage</code> (an image <i>recipe</i>, not pixels), <code>CIFilter</code> (an effect
      with input/output images and parameters), and <code>CIContext</code> (renders a <code>CIImage</code> to an
      actual bitmap/<code>CGImage</code>, GPU-backed). You build a recipe and only pay when the context
      renders.</p>`,
    level: "mid",
  },
  {
    id: "y2",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you apply a Core Image filter (modern API)?",
    answerHtml: `<p>Use the typed filter API: create the filter, set its <code>inputImage</code> and parameters,
      read <code>outputImage</code>.</p>
    <div class="code">import CoreImage.CIFilterBuiltins
let f = CIFilter.gaussianBlur()
f.inputImage = ciImage
f.radius = 8
let output = f.outputImage</div>
    <p>Typed accessors beat the old stringly-typed <code>setValue(_:forKey:)</code>.</p>`,
    level: "mid",
  },
  {
    id: "y3",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you chain filters efficiently?",
    answerHtml: `<p>Feed one filter's <code>outputImage</code> into the next's input. Because <code>CIImage</code>
      is a lazy recipe, the whole chain is fused and only computed once when the <code>CIContext</code> renders —
      so a 5-filter pipeline is one GPU pass, not five intermediate bitmaps.</p>`,
    level: "senior",
  },
  {
    id: "y4",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Why reuse a CIContext?",
    answerHtml: `<p>Creating a <code>CIContext</code> is <b>expensive</b> (sets up the GPU/Metal pipeline), so
      make <b>one</b> and reuse it for all renders — never create one per frame/image. Render with
      <code>createCGImage(_:from:)</code> (or to a Metal texture for live use).</p>`,
    level: "senior",
  },
  {
    id: "y5",
    category: "perf",
    categoryLabel: "Performance",
    question: "What's the key performance mental model for Core Image?",
    answerHtml: `<p>A <code>CIImage</code> carries <b>no pixels</b> — it's a description. Nothing executes until
      you render through a context, and the renderer optimizes/fuses the chain on the GPU. So building filter
      graphs is cheap; <b>rendering</b> is the cost — render the minimum region you need and avoid redundant
      round-trips to <code>UIImage</code>/CPU.</p>`,
    level: "senior",
  },
  {
    id: "y6",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What gotchas come from CIImage extents and color spaces?",
    answerHtml: `<p>Some filters produce <b>infinite extent</b> images (e.g. a generator/tile) — crop with
      <code>cropped(to:)</code> before rendering or you'll try to render forever. And mind the <b>working color
      space</b>: render in the right space and convert deliberately to avoid washed-out or shifted colors.</p>`,
    level: "senior",
  },
  {
    id: "y7",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How does Core Image fit with the camera / Vision?",
    answerHtml: `<p>Wrap a camera <code>CVPixelBuffer</code> as <code>CIImage(cvPixelBuffer:)</code> to apply
      live filters, and hand frames to <b>Vision</b> for detection. (Old <code>CIDetector</code> face/feature
      detection is superseded by Vision.) Keep per-frame work on the GPU and off the main thread.</p>`,
    level: "senior",
  },
  {
    id: "y8",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What replaced CIDetector for faces/text?",
    answerHtml: `<p>The <b>Vision</b> framework. <code>CIDetector</code> is legacy; Vision offers better, Neural
      Engine-accelerated face/landmark/text/barcode detection and integrates cleanly with Core Image for the
      pixel work. Use Vision for analysis, Core Image for effects.</p>`,
    level: "mid",
  },
  {
    id: "y9",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "When do you use Core Graphics (Quartz) directly?",
    answerHtml: `<p>For custom <b>2D vector drawing</b> on the CPU — paths, fills, gradients, text, PDF
      generation — via a <code>CGContext</code>. It's the right tool for drawing shapes/charts/signatures or
      composing an image programmatically, as opposed to Core Image's pixel <i>filtering</i>.</p>`,
    level: "senior",
  },
  {
    id: "y10",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What's the modern way to render a UIImage off-screen?",
    answerHtml: `<p><code>UIGraphicsImageRenderer</code>: it manages a correct (color-space/scale-aware) context
      and returns a <code>UIImage</code>/PNG/JPEG from a draw closure.</p>
    <div class="code">let img = UIGraphicsImageRenderer(size: size).image { ctx in
  // CoreGraphics drawing here
}</div>
    <p>It replaced the old <code>UIGraphicsBeginImageContext</code> dance.</p>`,
    level: "mid",
  },
  {
    id: "y11",
    category: "perf",
    categoryLabel: "Performance",
    question: "What's the right way to make thumbnails from large images?",
    answerHtml: `<p>Use ImageIO: <code>CGImageSourceCreateThumbnailAtIndex</code> with
      <code>kCGImageSourceThumbnailMaxPixelSize</code> and <code>...CreateThumbnailFromImageAlways</code>. It
      decodes <b>directly to the target size</b> without ever loading the full-resolution bitmap — the key to a
      memory-safe image grid.</p>`,
    level: "senior",
  },
  {
    id: "y12",
    category: "perf",
    categoryLabel: "Performance",
    question: "Why is decoding the real cost, not file size?",
    answerHtml: `<p>A 2 MB JPEG can decode to tens of MB of <b>uncompressed pixels</b> in memory. Loading
      full-res images into small views spikes memory and stalls scrolling. <b>Downsample</b> at decode time
      (ImageIO thumbnails) to the display size — file size is irrelevant; decoded pixel count is what
      matters.</p>`,
    level: "senior",
  },
  {
    id: "y13",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is PencilKit?",
    answerHtml: `<p>Apple's drawing framework: <code>PKCanvasView</code> captures low-latency Apple Pencil/finger
      ink, <code>PKToolPicker</code> provides the system tools palette, and the result is a <code>PKDrawing</code>
      you can render to an image or persist. You get pressure, tilt, and high-frame-rate ink essentially for
      free.</p>`,
    level: "mid",
  },
  {
    id: "y14",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you encode/export an edited image?",
    answerHtml: `<p>For quick cases, <code>UIImage.jpegData(compressionQuality:)</code> /
      <code>pngData()</code>. For control (HEIC, metadata, multiple frames) use <b>ImageIO</b>
      <code>CGImageDestination</code> with the desired UTType and options. HEIC gives much smaller files than JPEG
      at similar quality.</p>`,
    level: "mid",
  },
  {
    id: "y15",
    category: "perf",
    categoryLabel: "Performance",
    question: "Can you write custom Core Image effects?",
    answerHtml: `<p>Yes — a <code>CIColorKernel</code>/<code>CIKernel</code> (Metal-backed) lets you write a
      per-pixel shader for effects no built-in filter provides. They run on the GPU within the Core Image
      pipeline. Reach for them only when the ~200 built-in filters and chaining can't do it.</p>`,
    level: "architect",
  },
  {
    id: "y16",
    category: "perf",
    categoryLabel: "Performance",
    question: "Core Image vs Core Graphics vs Metal — how to choose?",
    answerHtml: `<p><b>Core Image</b> for pixel filtering/effects on existing images (GPU, chainable).
      <b>Core Graphics</b> for custom 2D vector drawing/composition on the CPU. <b>Metal</b> for fully custom GPU
      rendering or effects beyond Core Image kernels. Match the tool to the task; don't hand-roll in Metal what a
      <code>CIFilter</code> already does.</p>`,
    level: "senior",
  },
];

export const ADVANCED18_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED18_QUIZ: QuizQuestion[] = [
  {
    id: "yz1",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "A CIImage represents:",
    options: ["A decoded bitmap in memory", "A lazy image recipe, rendered later by a CIContext", "A UIView", "A file on disk"],
    answer: 1,
    explanationHtml: `<p><code>CIImage</code> is a description; pixels are produced only when a
      <code>CIContext</code> renders it, which fuses the filter chain on the GPU.</p>`,
  },
  {
    id: "yz2",
    category: "perf",
    categoryLabel: "Performance",
    question: "You should create a CIContext:",
    options: ["Per image/frame", "Once and reuse it", "Never", "On the main thread only"],
    answer: 1,
    explanationHtml: `<p>Contexts are expensive to build (GPU pipeline setup) — make one and reuse it for all
      renders.</p>`,
  },
  {
    id: "yz3",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Chaining five CIFilters results in:",
    options: ["Five intermediate bitmaps", "One fused GPU pass when rendered", "A crash", "CPU-only processing"],
    answer: 1,
    explanationHtml: `<p>The lazy recipe is optimized and computed once on render — not five separate
      bitmaps.</p>`,
  },
  {
    id: "yz4",
    category: "perf",
    categoryLabel: "Performance",
    question: "To show many large photos without blowing memory, you should:",
    options: ["Load full-res UIImages", "Decode downsized thumbnails (ImageIO) at the display size", "Use AnyView", "Increase the cache"],
    answer: 1,
    explanationHtml: `<p><code>CGImageSourceCreateThumbnailAtIndex</code> decodes straight to the target size —
      file size is irrelevant; decoded pixels are the cost.</p>`,
  },
  {
    id: "yz5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "The modern way to render a UIImage off-screen is:",
    options: ["UIGraphicsBeginImageContext", "UIGraphicsImageRenderer", "CIContext", "drawRect"],
    answer: 1,
    explanationHtml: `<p><code>UIGraphicsImageRenderer</code> manages a correct context and returns the image
      from a draw closure, replacing the old begin/end dance.</p>`,
  },
  {
    id: "yz6",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "For face detection today you use:",
    options: ["CIDetector", "The Vision framework", "Core Graphics", "PencilKit"],
    answer: 1,
    explanationHtml: `<p>Vision supersedes the legacy <code>CIDetector</code>, with better, Neural
      Engine-accelerated detection; Core Image still handles the pixel effects.</p>`,
  },
];

export const ADVANCED18_STUDY: StudySection[] = [
  {
    id: "st-adv-43",
    num: "58",
    title: "58 · Core Image: filters, contexts & pipelines",
    html: `<p><b>What it is.</b> GPU image processing. A <code>CIImage</code> is a lazy <i>recipe</i>;
      <code>CIFilter</code>s (use the typed <code>CIFilterBuiltins</code> API) transform it; a <b>reused</b>
      <code>CIContext</code> renders the result to a <code>CGImage</code>/texture. Chained filters fuse into one
      pass, so building graphs is cheap and only <b>rendering</b> costs — render the minimum region and avoid
      bouncing to CPU/UIImage mid-pipeline.</p>
    <p>Mind <b>infinite extents</b> (crop generators before render) and the <b>working color space</b>. Pair with
      the camera (<code>CIImage(cvPixelBuffer:)</code>) and <b>Vision</b> for detection; write a
      <code>CIKernel</code> only for effects no built-in filter covers.</p>
    <div class="callout tip"><span class="lbl">Two rules</span> Reuse one CIContext; remember the image is a
      recipe, not pixels, until you render.</div>`,
  },
  {
    id: "st-adv-44",
    num: "59",
    title: "59 · Drawing & image performance",
    html: `<p><b>What it is.</b> Beyond filters: <b>Core Graphics</b> (<code>CGContext</code>, via
      <code>UIGraphicsImageRenderer</code>) for custom 2D vector drawing, text, and PDF; <b>PencilKit</b>
      (<code>PKCanvasView</code>/<code>PKDrawing</code>) for low-latency ink; and encoding via
      <code>UIImage</code> data methods or ImageIO destinations (HEIC for small files).</p>
    <p>The performance through-line is <b>decoding</b>: a small file decodes to large uncompressed pixels, so
      <b>downsample at decode time</b> (ImageIO thumbnails) to the display size — never load full-res into small
      views. Decoded pixel count, not file size, is what spikes memory and drops frames.</p>
    <div class="callout warn"><span class="lbl">Classic bug</span> A laggy, memory-hungry photo grid is almost
      always full-resolution decode — fix it with thumbnails.</div>`,
  },
];
