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
    answerHtml: `<p>AVFoundation exists because SwiftUI's high-level APIs (PhotosUI, <code>VideoPlayer</code>)
      only cover the common cases — anything custom (raw capture, real-time frame processing, precise
      editing) needs the framework underneath. It covers three jobs: <b>capture</b> (camera/mic via
      <code>AVCaptureSession</code>), <b>playback</b> (<code>AVPlayer</code>), and <b>editing/export</b>
      (<code>AVComposition</code>/<code>AVAssetExportSession</code>).</p>
    <p><b>I default to PhotosUI/VideoPlayer for standard media flows and drop to AVFoundation the moment I
      need custom capture, real-time processing, or trimming/export.</b></p>`,
    level: "mid",
  },
  {
    id: "u2",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What are the pieces of an AVCaptureSession?",
    answerHtml: `<p>Every capture feature — stills, video, live frame analysis — routes through one
      <code>AVCaptureSession</code> because it's the single pipeline that owns the hardware; getting its
      inputs/outputs wrong is why capture code silently produces black frames or hitches on
      <code>startRunning()</code>. It wires <b>inputs</b> (<code>AVCaptureDeviceInput</code> for a camera/mic) to
      <b>outputs</b> (<code>AVCapturePhotoOutput</code>, <code>AVCaptureMovieFileOutput</code>, or
      <code>AVCaptureVideoDataOutput</code> for frames). Set a <code>sessionPreset</code> for quality, then call
      <code>startRunning()</code> on a background queue.</p>
    <p>Red flag: calling <code>startRunning()</code> on the main thread — it's a blocking call and will hitch
      the UI every time the camera screen appears.</p>
    <p><b>I treat AVCaptureSession as a pipeline: wire inputs to outputs, set the preset, then start it off
      the main thread.</b></p>`,
    level: "senior",
  },
  {
    id: "u3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you show a live camera preview in SwiftUI?",
    answerHtml: `<p>SwiftUI has no native camera preview view because previewing a live capture session is an
      AVFoundation/UIKit-level concern, not a declarative-view concern — so this is one of the few places a
      small UIKit bridge is standard, not a smell. Wrap an <code>AVCaptureVideoPreviewLayer</code> (which
      renders the session) in a <code>UIViewRepresentable</code> and host it in your SwiftUI view.</p>
    <p><b>I bridge AVCaptureVideoPreviewLayer through UIViewRepresentable — SwiftUI doesn't reinvent camera
      preview, it borrows UIKit's.</b></p>`,
    level: "senior",
  },
  {
    id: "u4",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you capture a photo?",
    answerHtml: `<p>Photo capture is asynchronous and delegate-based because the pipeline has to negotiate
      codec, flash, and depth/RAW settings with the hardware before it can return a result — there's no
      synchronous "get the image" call. Use <code>AVCapturePhotoOutput</code>: call
      <code>capturePhoto(with:delegate:)</code> with <code>AVCapturePhotoSettings</code> (codec like HEIF,
      flash, depth/RAW), and receive the result in the delegate's <code>didFinishProcessingPhoto</code>. Then
      build a <code>UIImage</code> or save the file data.</p>
    <p><b>Photo capture is a settings object plus a delegate callback, not a single function call — the
      settings model is what lets one API cover HEIF, flash, and RAW.</b></p>`,
    level: "senior",
  },
  {
    id: "u5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you process individual camera frames?",
    answerHtml: `<p>Real-time analysis (Vision, Core ML, custom filters) needs the raw frame stream, not just a
      rendered preview — that's what <code>AVCaptureVideoDataOutput</code> exists for. Add it with a delegate
      on a dedicated serial queue; you get <code>CMSampleBuffer</code>s you can feed to Vision/Core ML or
      analyze in real time. Keep the callback fast and release buffers promptly — it runs at the frame rate,
      so any backlog drops frames or stalls the pipeline.</p>
    <p>Red flag: holding onto a <code>CMSampleBuffer</code> past the callback — it backs the capture
      pipeline's limited buffer pool, so retaining it stalls or drops subsequent frames.</p>
    <p><b>I copy what I need out of the sample buffer and let it go immediately — the callback runs at frame
      rate, so it has to be fast.</b></p>`,
    level: "architect",
  },
  {
    id: "u6",
    category: "security",
    categoryLabel: "Security",
    question: "What permissions does the camera/mic need?",
    answerHtml: `<p>Camera/mic access is gated twice — a static Info.plist string for App Review and a runtime
      prompt for the user — because Apple treats "explains itself" and "user actually consented" as separate
      guarantees. You need <code>NSCameraUsageDescription</code> and <code>NSMicrophoneUsageDescription</code>
      purpose strings, plus a runtime request via <code>AVCaptureDevice.requestAccess(for: .video / .audio)</code>.
      Ask in context, and handle denied/restricted by guiding the user to Settings rather than failing silently.</p>
    <p><b>I request camera access right before the feature that needs it, and if it's denied I deep-link to
      Settings instead of leaving a dead camera screen.</b></p>`,
    level: "senior",
  },
  {
    id: "u7",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What's the privacy-friendly way to let users pick photos?",
    answerHtml: `<p>SwiftUI's <code>PhotosPicker</code> is the default choice because it runs out-of-process —
      your app never sees the library, only the items the user explicitly picked — which is why it needs
      <b>no photo-library permission at all</b>. Load the picked <code>PhotosPickerItem</code> as
      <code>Data</code>/<code>Image</code>. Prefer it over requesting full library access.</p>
    <div class="code">PhotosPicker(selection: $items, matching: .images) { Text("Choose") }</div>
    <p><b>I reach for PhotosPicker first — no permission dialog, no App Review privacy question, and it's
      what users already expect from Photos/Messages.</b></p>`,
    level: "mid",
  },
  {
    id: "u8",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "PhotosPicker / PHPicker vs full PHPhotoLibrary access?",
    answerHtml: `<p>The permission model splits on who chooses the photos: if the user picks via the system UI,
      the app never touches the library and needs nothing; if the app itself needs to browse or watch the
      library, that's a privacy-sensitive capability and requires authorization. <code>PhotosPicker</code> (and
      UIKit <code>PHPickerViewController</code>) need no permission because the user explicitly picks. Direct
      <code>PHPhotoLibrary</code> access requires authorization — and users can grant <b>limited</b> access (a
      chosen subset). Only request library access when you must enumerate or observe the library; otherwise use
      the picker.</p>
    <p>Red flag: requesting full <code>PHPhotoLibrary</code> access "just in case" — it's a bigger ask in the
      permission prompt and in review, for a capability most features don't actually need.</p>
    <p><b>I ask myself whether the user is picking or the app is browsing — picking means PhotosPicker and
      zero permission, browsing means PHPhotoLibrary scoped to what I actually enumerate.</b></p>`,
    level: "senior",
  },
  {
    id: "u9",
    category: "security",
    categoryLabel: "Security",
    question: "How do you save an image to the user's photo library?",
    answerHtml: `<p>Saving is a narrower need than reading, so iOS offers a narrower permission for it — asking
      for less makes the prompt friendlier and less likely to be denied. Save through
      <code>PHPhotoLibrary.performChanges</code> with a creation request. You can request <b>add-only</b>
      authorization (<code>NSPhotoLibraryAddUsageDescription</code>) — narrower than full read/write — when you
      only need to save.</p>
    <p><b>If a feature only ever writes to the library, I request add-only access, not full read/write — a
      smaller ask and a smaller attack surface.</b></p>`,
    level: "senior",
  },
  {
    id: "u10",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you play video?",
    answerHtml: `<p>Video playback has both a SwiftUI-native path and a UIKit path because <code>AVPlayer</code>
      is the actual playback engine underneath both — the UI layer is just how much control you want. SwiftUI:
      <code>VideoPlayer(player: AVPlayer(url:))</code>. UIKit: <code>AVPlayerViewController</code> (full
      controls) or a custom <code>AVPlayerLayer</code>. Observe the <code>AVPlayerItem</code>'s status/time for
      custom UI.</p>
    <p><b>I start with VideoPlayer for standard playback and only drop to AVPlayerLayer when I need a fully
      custom transport UI.</b></p>`,
    level: "mid",
  },
  {
    id: "u11",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Why does AVAudioSession matter?",
    answerHtml: `<p>AVAudioSession matters because your app doesn't own the audio hardware — every app on the
      device negotiates for it through this session, and getting the category wrong is why "my audio doesn't
      play" or "it stops the moment a call comes in" bugs happen. It tells the system how your audio behaves: a
      <b>category</b>/mode (<code>.playback</code>, <code>.playAndRecord</code>, etc.) controls mixing,
      silent-switch behavior, and whether you keep playing in the background. You must <b>activate</b> it, and
      handle <b>interruptions</b> (calls) and <b>route changes</b> (headphones unplugged) via notifications.</p>
    <p>Red flag: shipping without an interruption handler — playback just goes silent after a phone call with
      no way to resume.</p>
    <p><b>Most "audio doesn't play" bugs are audio-session misconfiguration, not a bug in the player — I check
      the category and activation before anything else.</b></p>`,
    level: "senior",
  },
  {
    id: "u12",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What plays/records audio, and what is AVAudioEngine?",
    answerHtml: `<p>The moment a requirement goes past "play this file" — mixing several sources, real-time
      effects, tapping the raw stream — a simple player object can't express it, because it has no graph to route
      audio through. <code>AVAudioPlayer</code>/<code>AVAudioRecorder</code> handle simple file
      playback/recording. <b>AVAudioEngine</b> is a node graph (players, mixers, effects, taps) for real-time
      processing, mixing multiple sources, applying effects, or capturing the audio stream.</p>
    <p><b>I reach for AVAudioEngine the moment "play this file" becomes "mix/process/tap this audio" —
      AVAudioPlayer can't express a graph.</b></p>`,
    level: "architect",
  },
  {
    id: "u13",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What's required for background audio + lock-screen controls?",
    answerHtml: `<p>Lock-screen/Control-Center controls exist as a separate system because they're driven by a
      shared registry, not by your view hierarchy — the system has no idea what's playing unless you tell it.
      Enable the <b>Audio</b> background mode, set an appropriate <code>AVAudioSession</code> category
      (<code>.playback</code>), populate <code>MPNowPlayingInfoCenter</code> (title/art/elapsed), and handle
      <code>MPRemoteCommandCenter</code> commands (play/pause/next) so the Lock Screen, Control Center, and
      AirPods controls work.</p>
    <p><b>Background audio is three separate contracts — background mode, session category, and now-playing
      info/remote commands — and missing any one of them breaks Lock Screen controls silently.</b></p>`,
    level: "senior",
  },
  {
    id: "u14",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "What special capture types should you know?",
    answerHtml: `<p>Beyond basic stills, the camera stack exposes several fidelity/creative modes worth
      knowing by name because interviewers use them to probe whether you know AVFoundation past "capture a
      JPEG". <b>Live Photos</b> (still + short motion), <b>HDR</b>/ProRAW for higher fidelity, <b>Cinematic</b>
      video (rack-focus), and <b>depth</b> data (from dual/TrueDepth cameras for portrait/AR). Each is enabled
      via <code>AVCapturePhotoSettings</code>/output configuration when the device supports it.</p>
    <p><b>I always gate these on a device capability check first — Live Photos, ProRAW, and depth aren't
      available on every camera.</b></p>`,
    level: "senior",
  },
  {
    id: "u15",
    category: "perf",
    categoryLabel: "Performance",
    question: "What are the performance pitfalls in capture?",
    answerHtml: `<p>Capture code sits directly on the camera's frame rate and the main thread's render loop, so
      any mistake here shows up as dropped frames or a frozen UI, not a subtle slowdown. Run
      <code>startRunning()</code> and frame processing <b>off the main thread</b> (a dedicated queue), don't
      retain <code>CMSampleBuffer</code>s (they back the capture pipeline — copy what you need and release),
      downscale frames before heavy work, and stop the session when you leave the screen to save power and
      memory.</p>
    <p>Red flag: leaving the session running after the user navigates away — it keeps draining battery and
      holding the camera lock other apps might need.</p>
    <p><b>Capture performance is really four habits: off the main thread, don't retain buffers, downscale
      before heavy work, stop the session on exit.</b></p>`,
    level: "senior",
  },
  {
    id: "u16",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "How do you trim or compose video?",
    answerHtml: `<p>Editing is modeled as a separate composition object rather than mutating the source file,
      because exports are async and potentially expensive — you build a plan, then render it. Build an
      <code>AVMutableComposition</code> (assemble/trim tracks) and export with <code>AVAssetExportSession</code>
      (pick a preset, output file type) — all asynchronous. For effects/overlays use an
      <code>AVVideoComposition</code>. Heavy exports should show progress and run off the main actor.</p>
    <p><b>I treat AVMutableComposition as the edit plan and AVAssetExportSession as the async render of that
      plan — never block the UI on an export.</b></p>`,
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
    explanationHtml: `<p><code>AVCaptureSession</code> connects device inputs to photo/video/data outputs — it's
      the actual capture pipeline. <code>AVPlayer</code> is the tempting wrong pick because it's the other AV*
      class candidates know well, but it only handles playback of existing media, never capturing new media.</p>`,
  },
  {
    id: "uz2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "To let users pick photos WITHOUT any library permission, use:",
    options: ["PHPhotoLibrary directly", "PhotosPicker / PHPickerViewController", "AVCaptureSession", "a file importer"],
    answer: 1,
    explanationHtml: `<p>The system picker runs out-of-process and returns only chosen items, so no
      photo-library authorization is required. <code>PHPhotoLibrary</code> directly is the tempting wrong
      answer — it's the "obvious" photos API, but going straight to it requires full library authorization
      even when all you need is one picked image.</p>`,
  },
  {
    id: "uz3",
    category: "security",
    categoryLabel: "Security",
    question: "Using the camera requires:",
    options: ["Nothing", "NSCameraUsageDescription + runtime AVCaptureDevice.requestAccess", "Only a background mode", "Full photo library access"],
    answer: 1,
    explanationHtml: `<p>You need the Info.plist purpose string and a runtime authorization request for video
      (and microphone, if recording audio). "Only a background mode" is the tempting wrong answer because
      background modes govern what your app can do while suspended — they have nothing to do with the
      camera's privacy gate.</p>`,
  },
  {
    id: "uz4",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "Background audio + Lock Screen controls require populating:",
    options: ["URLCache", "MPNowPlayingInfoCenter and handling MPRemoteCommandCenter", "a widget", "Core Data"],
    answer: 1,
    explanationHtml: `<p>With the Audio background mode and a playback AVAudioSession, set now-playing info and
      handle remote commands so system controls work. A widget is the tempting wrong answer because it's the
      other "system surface" candidates know, but widgets don't drive Lock Screen transport controls — that's
      exclusively MPNowPlayingInfoCenter/MPRemoteCommandCenter.</p>`,
  },
  {
    id: "uz5",
    category: "data",
    categoryLabel: "Data & Networking",
    question: "For real-time effects and mixing multiple audio sources, use:",
    options: ["AVAudioPlayer", "AVAudioEngine (node graph)", "AVPlayer", "AVCapturePhotoOutput"],
    answer: 1,
    explanationHtml: `<p><code>AVAudioEngine</code>'s node graph handles mixing, effects, and taps.
      <code>AVAudioPlayer</code> is the tempting wrong answer because it's the simpler, more familiar API —
      but it only plays a single file and has no graph to route multiple sources through.</p>`,
  },
  {
    id: "uz6",
    category: "perf",
    categoryLabel: "Performance",
    question: "When processing camera frames you should:",
    options: ["Retain every CMSampleBuffer", "Work off the main thread and not hold sample buffers", "Run on the main queue", "Upscale each frame"],
    answer: 1,
    explanationHtml: `<p>Sample buffers back the capture pipeline; process on a dedicated queue and release them
      promptly (copy what you need) to avoid stalls and memory growth. Retaining every buffer is the tempting
      wrong answer — it sounds like "keep data safe," but the buffer pool is finite, so holding onto them
      stalls or drops the next incoming frames.</p>`,
  },
];

export const ADVANCED14_STUDY: StudySection[] = [
  {
    id: "st-adv-35",
    num: "50",
    title: "50 · Capture: camera, photos & permissions",
    html: `<p><b>Why it's structured this way.</b> Capture is modeled as one session wiring inputs to outputs
      because the same pipeline has to serve stills, recording, and live frame analysis without three separate
      APIs. <code>AVCaptureSession</code> connects <b>inputs</b> (<code>AVCaptureDeviceInput</code>) to
      <b>outputs</b> — <code>AVCapturePhotoOutput</code> for stills, <code>AVCaptureMovieFileOutput</code> for
      recording, <code>AVCaptureVideoDataOutput</code> for live frames (feed Vision/Core ML). Show the feed via
      an <code>AVCaptureVideoPreviewLayer</code> wrapped in <code>UIViewRepresentable</code>; run the session
      and frame work off the main thread.</p>
    <p><b>Permissions</b>: camera/mic usage strings + <code>AVCaptureDevice.requestAccess</code>. For picking
      existing media, prefer <b>PhotosPicker</b> (no permission needed); request <code>PHPhotoLibrary</code> access
      (possibly <b>limited</b>, or add-only to save) only when you must enumerate/observe the library.</p>
    <div class="callout warn"><span class="lbl">Memory</span> Don't retain <code>CMSampleBuffer</code>s; downscale
      before heavy processing and stop the session when off-screen.</div>
    <p><b>Say this:</b> "I wire inputs to outputs on one AVCaptureSession, keep it off the main thread, and
      default to PhotosPicker over full library access wherever the user is just picking a photo."</p>`,
  },
  {
    id: "st-adv-36",
    num: "51",
    title: "51 · Media playback & audio",
    html: `<p><b>Why it's structured this way.</b> Playback and audio routing are split into separate concerns
      — a player object for "what's playing" and a session for "how audio behaves system-wide" — because the
      same <code>AVPlayer</code> has to coexist with calls, other apps, and Lock Screen controls it doesn't
      own. Playback via <code>AVPlayer</code> — SwiftUI <code>VideoPlayer</code> or UIKit
      <code>AVPlayerViewController</code>/<code>AVPlayerLayer</code> — observing the <code>AVPlayerItem</code>'s
      status/time for custom UI. Audio routing/behavior is governed by <b>AVAudioSession</b> (category/mode,
      activation, interruptions, route changes). Use <code>AVAudioPlayer</code>/<code>Recorder</code> for simple
      cases and <b>AVAudioEngine</b> for real-time graphs/effects.</p>
    <p><b>Background audio</b> needs the Audio background mode, a <code>.playback</code> session,
      <code>MPNowPlayingInfoCenter</code>, and <code>MPRemoteCommandCenter</code> handlers for Lock Screen/AirPods
      controls. Editing/export uses <code>AVComposition</code> + <code>AVAssetExportSession</code>.</p>
    <div class="callout tip"><span class="lbl">Always</span> Configure and activate the audio session for the
      experience you want (mix vs solo, background vs not) — many "audio doesn't play" bugs are session
      misconfiguration.</div>
    <p><b>Say this:</b> "Most 'audio doesn't play' bugs I've debugged were audio-session misconfiguration, not
      a broken player — I check category and activation first."</p>`,
  },
];
