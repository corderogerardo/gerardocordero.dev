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
    answerHtml: `<p>Core Image splits <i>description</i> from <i>computation</i> so a chain of filters costs nothing
      until the last moment — that separation is the whole design. <code>CIImage</code> is an image <i>recipe</i>,
      not pixels; <code>CIFilter</code> is an effect with input/output images and parameters; <code>CIContext</code>
      is the only place pixels actually get produced (GPU-backed, renders a <code>CIImage</code> to a
      bitmap/<code>CGImage</code>).</p>
    <p><b>You build a recipe and only pay when the context renders it.</b></p>`,
    level: "mid",
  },
  {
    id: "y2",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you apply a Core Image filter (modern API)?",
    answerHtml: `<p>Use the typed filter API — it exists because the old stringly-typed
      <code>setValue(_:forKey:)</code> fails silently or crashes at runtime on a typo'd key, and typed accessors
      catch that at compile time. Create the filter, set its <code>inputImage</code> and parameters, read
      <code>outputImage</code>.</p>
    <div class="code">import CoreImage.CIFilterBuiltins
let f = CIFilter.gaussianBlur()
f.inputImage = ciImage
f.radius = 8
let output = f.outputImage</div>
    <p>Red flag: reaching for <code>setValue(_:forKey:)</code> out of habit — say you use the typed
      <code>CIFilterBuiltins</code> accessors instead.</p>
    <p><b>Typed accessors beat the old stringly-typed API — compile-time safety instead of a runtime
      crash.</b></p>`,
    level: "mid",
  },
  {
    id: "y3",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you chain filters efficiently?",
    answerHtml: `<p>Chaining is cheap because <code>CIImage</code> is a lazy recipe, not a bitmap — the whole
      chain is fused and only computed once when the <code>CIContext</code> renders. Mechanically: feed one
      filter's <code>outputImage</code> into the next's input.</p>
    <p><b>A 5-filter pipeline is one GPU pass, not five intermediate bitmaps.</b></p>`,
    level: "senior",
  },
  {
    id: "y4",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Why reuse a CIContext?",
    answerHtml: `<p>Creating a <code>CIContext</code> is <b>expensive</b> (sets up the GPU/Metal pipeline), so
      make <b>one</b> and reuse it for all renders — never create one per frame/image. Render with
      <code>createCGImage(_:from:)</code> (or to a Metal texture for live use).</p>
    <p>Red flag: instantiating a fresh <code>CIContext</code> per frame in a live filter — that's the classic way
      to turn a smooth camera preview into a stutter.</p>
    <p><b>One CIContext, created once, reused for every render.</b></p>`,
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
      round-trips to <code>UIImage</code>/CPU.</p>
    <p><b>Building the graph is free; rendering is where I pay, so I render the smallest region I actually
      need.</b></p>`,
    level: "senior",
  },
  {
    id: "y6",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What gotchas come from CIImage extents and color spaces?",
    answerHtml: `<p>These are the two ways a filter graph that looks correct blows up only at render time. Some
      filters produce <b>infinite extent</b> images (e.g. a generator/tile) — crop with <code>cropped(to:)</code>
      before rendering or you'll try to render forever. And mind the <b>working color space</b>: render in the
      right space and convert deliberately to avoid washed-out or shifted colors.</p>
    <p>Red flag: rendering a generator filter's output directly without cropping — that's an infinite-extent hang,
      not a bug in the filter.</p>
    <p><b>Crop before you render, and know which color space you're rendering in.</b></p>`,
    level: "senior",
  },
  {
    id: "y7",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How does Core Image fit with the camera / Vision?",
    answerHtml: `<p>Live camera filters are a per-frame performance trap if you round-trip through the CPU, so
      wrap the camera <code>CVPixelBuffer</code> directly as <code>CIImage(cvPixelBuffer:)</code> and hand frames
      to <b>Vision</b> for detection. (Old <code>CIDetector</code> face/feature detection is superseded by Vision.)
      Keep per-frame work on the GPU and off the main thread.</p>
    <p><b>Stay on the GPU frame-in, frame-out — the moment you touch the CPU per frame, you drop frames.</b></p>`,
    level: "senior",
  },
  {
    id: "y8",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What replaced CIDetector for faces/text?",
    answerHtml: `<p>The <b>Vision</b> framework. <code>CIDetector</code> is legacy; Vision offers better, Neural
      Engine-accelerated face/landmark/text/barcode detection and integrates cleanly with Core Image for the
      pixel work. Use Vision for analysis, Core Image for effects.</p>
    <p>Red flag: reaching for <code>CIDetector</code> because it's "already in Core Image" — say Vision instead;
      it's the current, hardware-accelerated API for the same job.</p>
    <p><b>Vision for analysis, Core Image for effects — they're not competing for the same job.</b></p>`,
    level: "mid",
  },
  {
    id: "y9",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "When do you use Core Graphics (Quartz) directly?",
    answerHtml: `<p>For custom <b>2D vector drawing</b> on the CPU — paths, fills, gradients, text, PDF
      generation — via a <code>CGContext</code>. It's the right tool for drawing shapes/charts/signatures or
      composing an image programmatically, as opposed to Core Image's pixel <i>filtering</i>.</p>
    <p><b>Core Graphics draws shapes; Core Image filters pixels — I don't ask one to do the other's job.</b></p>`,
    level: "senior",
  },
  {
    id: "y10",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What's the modern way to render a UIImage off-screen?",
    answerHtml: `<p><code>UIGraphicsImageRenderer</code>: it manages a correct (color-space/scale-aware) context
      and returns a <code>UIImage</code>/PNG/JPEG from a draw closure, so you can't forget to end the context or
      get scale wrong the way the old API let you.</p>
    <div class="code">let img = UIGraphicsImageRenderer(size: size).image { ctx in
  // CoreGraphics drawing here
}</div>
    <p>It replaced the old <code>UIGraphicsBeginImageContext</code> dance.</p>
    <p><b>UIGraphicsImageRenderer, not the manual begin/end context calls.</b></p>`,
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
      memory-safe image grid.</p>
    <p>Red flag: loading full-res <code>UIImage</code>s into a grid and letting the image view downscale for
      display — the full decode already happened and paid the memory cost by then.</p>`,
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
      matters.</p>
    <p><b>File size tells you the download cost; decoded pixel count tells you the memory cost — they're not the
      same number.</b></p>`,
    level: "senior",
  },
  {
    id: "y13",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What is PencilKit?",
    answerHtml: `<p>Apple's drawing framework — it exists because a hand-rolled low-latency ink pipeline
      (pressure, tilt, high-frame-rate sampling) is a losing battle against Apple's own hardware/software
      coupling. <code>PKCanvasView</code> captures the ink, <code>PKToolPicker</code> provides the system tools
      palette, and the result is a <code>PKDrawing</code> you can render to an image or persist.</p>
    <p><b>PencilKit gets you pressure, tilt, and low-latency ink for free — building that yourself is not a good
      use of engineering time.</b></p>`,
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
      at similar quality.</p>
    <p><b>Reach for the UIImage convenience methods for a quick export; reach for ImageIO when I need to control
      format, metadata, or file size.</b></p>`,
    level: "mid",
  },
  {
    id: "y15",
    category: "perf",
    categoryLabel: "Performance",
    question: "Can you write custom Core Image effects?",
    answerHtml: `<p>Yes — a <code>CIColorKernel</code>/<code>CIKernel</code> (Metal-backed) lets you write a
      per-pixel shader for effects no built-in filter provides. They run on the GPU within the Core Image
      pipeline. Reach for them only when the ~200 built-in filters and chaining can't do it.</p>
    <p><b>Custom kernels are the last resort after built-in filters and chaining, not the first move.</b></p>`,
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
      <code>CIFilter</code> already does.</p>
    <p><b>I default to Core Image for effects, Core Graphics for vector drawing, and only reach for Metal when
      neither can do the job.</b></p>`,
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
      <code>CIContext</code> renders it, which fuses the filter chain on the GPU. The tempting wrong answer —
      "a decoded bitmap" — confuses the recipe with the eventual render output; that confusion is exactly what
      leads people to create a new context per image instead of reusing one.</p>`,
  },
  {
    id: "yz2",
    category: "perf",
    categoryLabel: "Performance",
    question: "You should create a CIContext:",
    options: ["Per image/frame", "Once and reuse it", "Never", "On the main thread only"],
    answer: 1,
    explanationHtml: `<p>Contexts are expensive to build (GPU pipeline setup) — make one and reuse it for all
      renders. "Per image/frame" is the tempting wrong answer because it looks safer/more isolated, but it pays
      the GPU pipeline setup cost on every single render — in a live filter that's the difference between smooth
      and stuttering.</p>`,
  },
  {
    id: "yz3",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Chaining five CIFilters results in:",
    options: ["Five intermediate bitmaps", "One fused GPU pass when rendered", "A crash", "CPU-only processing"],
    answer: 1,
    explanationHtml: `<p>The lazy recipe is optimized and computed once on render — not five separate bitmaps.
      "Five intermediate bitmaps" is the mental model you'd have from imperative image editors (each step
      materializes a result); Core Image's whole value proposition is that it doesn't work that way.</p>`,
  },
  {
    id: "yz4",
    category: "perf",
    categoryLabel: "Performance",
    question: "To show many large photos without blowing memory, you should:",
    options: ["Load full-res UIImages", "Decode downsized thumbnails (ImageIO) at the display size", "Use AnyView", "Increase the cache"],
    answer: 1,
    explanationHtml: `<p><code>CGImageSourceCreateThumbnailAtIndex</code> decodes straight to the target size —
      file size is irrelevant; decoded pixels are the cost. "Increase the cache" is the tempting wrong answer
      because it treats this as a caching problem, but caching a full-resolution decode just holds the same
      memory spike longer instead of preventing it.</p>`,
  },
  {
    id: "yz5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "The modern way to render a UIImage off-screen is:",
    options: ["UIGraphicsBeginImageContext", "UIGraphicsImageRenderer", "CIContext", "drawRect"],
    answer: 1,
    explanationHtml: `<p><code>UIGraphicsImageRenderer</code> manages a correct context and returns the image
      from a draw closure, replacing the old begin/end dance. <code>UIGraphicsBeginImageContext</code> still
      compiles and runs, which is exactly why it's the tempting wrong answer — it's legacy, not incorrect syntax,
      and lets you forget scale/color-space correctness that the renderer handles for you.</p>`,
  },
  {
    id: "yz6",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "For face detection today you use:",
    options: ["CIDetector", "The Vision framework", "Core Graphics", "PencilKit"],
    answer: 1,
    explanationHtml: `<p>Vision supersedes the legacy <code>CIDetector</code>, with better, Neural
      Engine-accelerated detection; Core Image still handles the pixel effects. <code>CIDetector</code> is the
      tempting wrong answer only because it lives in the same framework you're already using for filters — but
      "same framework" isn't "current API."</p>`,
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
      recipe, not pixels, until you render.</div>
    <p>In an interview, say: <b>"I build the whole filter graph for free and only pay when I render it, once,
      through a context I reuse."</b></p>`,
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
      always full-resolution decode — fix it with thumbnails.</div>
    <p>In an interview, say: <b>"I downsample at decode time with ImageIO, so I never pay to hold pixels bigger
      than what's actually on screen."</b></p>`,
  },
];
