// Advanced batch 14 — Camera, photos & AVFoundation (mid/senior). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED14_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED14_FLASHCARDS: Flashcard[] = [
  {
    id: "u1",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What three jobs does AVFoundation cover?",
    answerHtml: `<p><b>Capture</b> (camera/mic via <code>AVCaptureSession</code>), <b>playback</b>
      (<code>AVPlayer</code>), and <b>editing/export</b> (<code>AVComposition</code>/
      <code>AVAssetExportSession</code>). It's the low-level media framework; PhotosUI and the SwiftUI
      <code>VideoPlayer</code> sit on top for common cases.</p>`,
    level: "mid",
  },
  {
    id: "u2",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What are the pieces of an AVCaptureSession?",
    answerHtml: `<p>A <code>AVCaptureSession</code> wires <b>inputs</b> (<code>AVCaptureDeviceInput</code> for a
      camera/mic) to <b>outputs</b> (<code>AVCapturePhotoOutput</code>, <code>AVCaptureMovieFileOutput</code>, or
      <code>AVCaptureVideoDataOutput</code> for frames). Set a <code>sessionPreset</code> for quality, then
      <code>startRunning()</code> on a background queue.</p>`,
    level: "senior",
  },
  {
    id: "u3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you show a live camera preview in SwiftUI?",
    answerHtml: `<p>Wrap an <code>AVCaptureVideoPreviewLayer</code> (which renders the session) in a
      <code>UIViewRepresentable</code> and host it in your SwiftUI view. SwiftUI has no native camera preview, so
      this small UIKit bridge is standard.</p>`,
    level: "senior",
  },
  {
    id: "u4",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you capture a photo?",
    answerHtml: `<p>Use <code>AVCapturePhotoOutput</code>: call <code>capturePhoto(with:delegate:)</code> with
      <code>AVCapturePhotoSettings</code> (codec like HEIF, flash, depth/RAW), and receive the result in the
      delegate's <code>didFinishProcessingPhoto</code>. Then build a <code>UIImage</code> or save the file
      data.</p>`,
    level: "senior",
  },
  {
    id: "u5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you process individual camera frames?",
    answerHtml: `<p>Add an <code>AVCaptureVideoDataOutput</code> with a delegate on a dedicated serial queue;
      you get <code>CMSampleBuffer</code>s you can feed to Vision/Core ML or analyze in real time. Keep the
      callback fast and release buffers promptly — it runs at the frame rate.</p>`,
    level: "architect",
  },
  {
    id: "u6",
    category: "security",
    categoryLabel: "Security",
    question: "What permissions does the camera/mic need?",
    answerHtml: `<p><code>NSCameraUsageDescription</code> and <code>NSMicrophoneUsageDescription</code> purpose
      strings, plus a runtime request via <code>AVCaptureDevice.requestAccess(for: .video / .audio)</code>. Ask in
      context, and handle denied/restricted by guiding the user to Settings.</p>`,
    level: "senior",
  },
  {
    id: "u7",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What's the privacy-friendly way to let users pick photos?",
    answerHtml: `<p>SwiftUI's <code>PhotosPicker</code> (PhotosUI): it runs out-of-process and returns only the
      items the user selected, so you need <b>no photo-library permission at all</b>. Load the picked
      <code>PhotosPickerItem</code> as <code>Data</code>/<code>Image</code>. Prefer it over requesting full
      library access.</p>
    <div class="code">PhotosPicker(selection: $items, matching: .images) { Text("Choose") }</div>`,
    level: "mid",
  },
  {
    id: "u8",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "PhotosPicker / PHPicker vs full PHPhotoLibrary access?",
    answerHtml: `<p><code>PhotosPicker</code> (and UIKit <code>PHPickerViewController</code>) need no permission
      because the user explicitly picks. Direct <code>PHPhotoLibrary</code> access requires authorization — and
      users can grant <b>limited</b> access (a chosen subset). Only request library access when you must enumerate
      or observe the library; otherwise use the picker.</p>`,
    level: "senior",
  },
  {
    id: "u9",
    category: "security",
    categoryLabel: "Security",
    question: "How do you save an image to the user's photo library?",
    answerHtml: `<p>Through <code>PHPhotoLibrary.performChanges</code> with a creation request. You can request
      <b>add-only</b> authorization (<code>NSPhotoLibraryAddUsageDescription</code>) — narrower than full
      read/write — when you only need to save, which is friendlier and less likely to be denied.</p>`,
    level: "senior",
  },
  {
    id: "u10",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you play video?",
    answerHtml: `<p>SwiftUI: <code>VideoPlayer(player: AVPlayer(url:))</code>. UIKit:
      <code>AVPlayerViewController</code> (full controls) or a custom <code>AVPlayerLayer</code>. The
      <code>AVPlayer</code> manages playback of an <code>AVPlayerItem</code>; observe its status/time for custom
      UI.</p>`,
    level: "mid",
  },
  {
    id: "u11",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Why does AVAudioSession matter?",
    answerHtml: `<p>It tells the system how your audio behaves: a <b>category</b>/mode
      (<code>.playback</code>, <code>.playAndRecord</code>, etc.) controls mixing, silent-switch behavior, and
      whether you keep playing in the background. You must <b>activate</b> it, and handle <b>interruptions</b>
      (calls) and <b>route changes</b> (headphones unplugged) via notifications.</p>`,
    level: "senior",
  },
  {
    id: "u12",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What plays/records audio, and what is AVAudioEngine?",
    answerHtml: `<p><code>AVAudioPlayer</code>/<code>AVAudioRecorder</code> for simple file playback/recording.
      <b>AVAudioEngine</b> is a node graph (players, mixers, effects, taps) for real-time processing, mixing
      multiple sources, applying effects, or capturing the audio stream — the tool for anything beyond "play this
      file".</p>`,
    level: "architect",
  },
  {
    id: "u13",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What's required for background audio + lock-screen controls?",
    answerHtml: `<p>Enable the <b>Audio</b> background mode, set an appropriate <code>AVAudioSession</code>
      category (<code>.playback</code>), populate <code>MPNowPlayingInfoCenter</code> (title/art/elapsed), and
      handle <code>MPRemoteCommandCenter</code> commands (play/pause/next) so the Lock Screen, Control Center, and
      AirPods controls work.</p>`,
    level: "senior",
  },
  {
    id: "u14",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What special capture types should you know?",
    answerHtml: `<p><b>Live Photos</b> (still + short motion), <b>HDR</b>/ProRAW for higher fidelity,
      <b>Cinematic</b> video (rack-focus), and <b>depth</b> data (from dual/TrueDepth cameras for portrait/AR).
      Each is enabled via <code>AVCapturePhotoSettings</code>/output configuration when the device
      supports it.</p>`,
    level: "senior",
  },
  {
    id: "u15",
    category: "perf",
    categoryLabel: "Performance",
    question: "What are the performance pitfalls in capture?",
    answerHtml: `<p>Run <code>startRunning()</code> and frame processing <b>off the main thread</b> (a dedicated
      queue), don't retain <code>CMSampleBuffer</code>s (they back the capture pipeline — copy what you need and
      release), downscale frames before heavy work, and stop the session when you leave the screen to save power
      and memory.</p>`,
    level: "senior",
  },
  {
    id: "u16",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you trim or compose video?",
    answerHtml: `<p>Build an <code>AVMutableComposition</code> (assemble/trim tracks) and export with
      <code>AVAssetExportSession</code> (pick a preset, output file type) — all asynchronous. For effects/overlays
      use an <code>AVVideoComposition</code>. Heavy exports should show progress and run off the main actor.</p>`,
    level: "architect",
  },
];

export const ADVANCED14_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED14_QUIZ: QuizQuestion[] = [
  {
    id: "uz1",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "A camera capture pipeline is built around:",
    options: ["AVPlayer", "AVCaptureSession (inputs → outputs)", "PhotosPicker", "URLSession"],
    answer: 1,
    explanationHtml: `<p><code>AVCaptureSession</code> connects device inputs to photo/video/data outputs;
      <code>AVPlayer</code> is for playback, not capture.</p>`,
  },
  {
    id: "uz2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "To let users pick photos WITHOUT any library permission, use:",
    options: ["PHPhotoLibrary directly", "PhotosPicker / PHPickerViewController", "AVCaptureSession", "a file importer"],
    answer: 1,
    explanationHtml: `<p>The system picker runs out-of-process and returns only chosen items, so no
      photo-library authorization is required.</p>`,
  },
  {
    id: "uz3",
    category: "security",
    categoryLabel: "Security",
    question: "Using the camera requires:",
    options: ["Nothing", "NSCameraUsageDescription + runtime AVCaptureDevice.requestAccess", "Only a background mode", "Full photo library access"],
    answer: 1,
    explanationHtml: `<p>You need the Info.plist purpose string and a runtime authorization request for video
      (and microphone, if recording audio).</p>`,
  },
  {
    id: "uz4",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Background audio + Lock Screen controls require populating:",
    options: ["URLCache", "MPNowPlayingInfoCenter and handling MPRemoteCommandCenter", "a widget", "Core Data"],
    answer: 1,
    explanationHtml: `<p>With the Audio background mode and a playback AVAudioSession, set now-playing info and
      handle remote commands so system controls work.</p>`,
  },
  {
    id: "uz5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "For real-time effects and mixing multiple audio sources, use:",
    options: ["AVAudioPlayer", "AVAudioEngine (node graph)", "AVPlayer", "AVCapturePhotoOutput"],
    answer: 1,
    explanationHtml: `<p><code>AVAudioEngine</code>'s node graph handles mixing, effects, and taps;
      <code>AVAudioPlayer</code> just plays a file.</p>`,
  },
  {
    id: "uz6",
    category: "perf",
    categoryLabel: "Performance",
    question: "When processing camera frames you should:",
    options: ["Retain every CMSampleBuffer", "Work off the main thread and not hold sample buffers", "Run on the main queue", "Upscale each frame"],
    answer: 1,
    explanationHtml: `<p>Sample buffers back the capture pipeline; process on a dedicated queue and release them
      promptly (copy what you need) to avoid stalls and memory growth.</p>`,
  },
];

export const ADVANCED14_STUDY: StudySection[] = [
  {
    id: "st-adv-35",
    num: "50",
    title: "50 · Capture: camera, photos & permissions",
    html: `<p><b>What it is.</b> <code>AVCaptureSession</code> connects <b>inputs</b>
      (<code>AVCaptureDeviceInput</code>) to <b>outputs</b> — <code>AVCapturePhotoOutput</code> for stills,
      <code>AVCaptureMovieFileOutput</code> for recording, <code>AVCaptureVideoDataOutput</code> for live frames
      (feed Vision/Core ML). Show the feed via an <code>AVCaptureVideoPreviewLayer</code> wrapped in
      <code>UIViewRepresentable</code>; run the session and frame work off the main thread.</p>
    <p><b>Permissions</b>: camera/mic usage strings + <code>AVCaptureDevice.requestAccess</code>. For picking
      existing media, prefer <b>PhotosPicker</b> (no permission needed); request <code>PHPhotoLibrary</code> access
      (possibly <b>limited</b>, or add-only to save) only when you must enumerate/observe the library.</p>
    <div class="callout warn"><span class="lbl">Memory</span> Don't retain <code>CMSampleBuffer</code>s; downscale
      before heavy processing and stop the session when off-screen.</div>`,
  },
  {
    id: "st-adv-36",
    num: "51",
    title: "51 · Media playback & audio",
    html: `<p><b>What it is.</b> Playback via <code>AVPlayer</code> — SwiftUI <code>VideoPlayer</code> or UIKit
      <code>AVPlayerViewController</code>/<code>AVPlayerLayer</code> — observing the <code>AVPlayerItem</code>'s
      status/time for custom UI. Audio routing/behavior is governed by <b>AVAudioSession</b> (category/mode,
      activation, interruptions, route changes). Use <code>AVAudioPlayer</code>/<code>Recorder</code> for simple
      cases and <b>AVAudioEngine</b> for real-time graphs/effects.</p>
    <p><b>Background audio</b> needs the Audio background mode, a <code>.playback</code> session,
      <code>MPNowPlayingInfoCenter</code>, and <code>MPRemoteCommandCenter</code> handlers for Lock Screen/AirPods
      controls. Editing/export uses <code>AVComposition</code> + <code>AVAssetExportSession</code>.</p>
    <div class="callout tip"><span class="lbl">Always</span> Configure and activate the audio session for the
      experience you want (mix vs solo, background vs not) — many "audio doesn't play" bugs are session
      misconfiguration.</div>`,
  },
];
