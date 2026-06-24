// Batch 7 — On-device generative AI on Android (Gemini Nano / AICore, MediaPipe LLM, LiteRT).
import type { Flashcard } from "./flashcards";
import type { StudySection } from "./study";
import type { Prompt } from "./prompts";

export const ADVANCED7_FLASHCARDS: Flashcard[] = [
  {
    "id": "oai-1",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "How does Gemini Nano run on-device, and how do apps reach it?",
    "answerHtml": "Gemini Nano runs inside <b>AICore</b>, a system service that hosts the model so multiple apps share one copy (no per-app weights). Apps call it through high-level <b>ML Kit GenAI APIs</b> (summarization, proofreading, rewrite, image description) or the AICore/Edge SDK for raw prompting. It's gated to capable devices (e.g. Pixel 8+/select flagships), and the model may need to be downloaded by the system before first use."
  },
  {
    "id": "oai-2",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "When would you choose MediaPipe LLM Inference over Gemini Nano?",
    "answerHtml": "Use <b>MediaPipe LLM Inference</b> when you need a <i>specific</i> open model (Gemma, Phi, etc.), broader device reach than AICore allows, or full control over the model file and backend (CPU/GPU). You bundle or download a quantized <code>.task</code> model and manage it yourself. Gemini Nano (AICore) is simpler and shares the system model but is limited to supported devices and Google's model."
  },
  {
    "id": "oai-3",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "What is LiteRT (TensorFlow Lite) best for?",
    "answerHtml": "<b>LiteRT</b> (the renamed TensorFlow Lite) runs classic ML models on-device — image classification, object detection, OCR, audio, pose — efficiently, with hardware delegates (GPU, NNAPI/NPU). It's the right tool for vision/audio inference and smaller task-specific models, where a full LLM is overkill. For text generation you'd use Gemini Nano or MediaPipe LLM; for perception tasks, LiteRT."
  },
  {
    "id": "oai-4",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "How do you size an on-device LLM to the device?",
    "answerHtml": "Budget RAM and storage and check the device tier at runtime. A ~1–2B-parameter model quantized to int4/int8 needs roughly 1–2GB RAM while running; larger models need flagship-class memory. Prefer <b>quantized</b> weights, cap context window and generation length, run on the GPU delegate where available, and feature-detect — falling back to a server model on unsupported or low-memory devices."
  },
  {
    "id": "oai-5",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "Why and how do you stream tokens from an on-device LLM into Compose?",
    "answerHtml": "Streaming gives perceived speed (text appears as it's generated). Expose the inference as a <code>Flow&lt;String&gt;</code> of partial text, collect it in the ViewModel into a <code>StateFlow</code>, and render with <code>collectAsStateWithLifecycle()</code>. <b>Batch</b> emissions (don't emit per token at 60+ tok/s) or you trigger a recomposition storm — coalesce every ~10 tokens / frame to protect the UI thread."
  },
  {
    "id": "oai-6",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "How do you keep on-device inference off the main thread and cancellable?",
    "answerHtml": "Run generation in a coroutine on a background dispatcher inside <code>viewModelScope</code>, exposing a Flow. Tie cancellation to the scope so leaving the screen stops generation (and free/close the inference session in <code>onCleared</code>/<code>DisposableEffect onDispose</code>). Never block the main thread on model load or generation — large model loads should show progress and be interruptible."
  },
  {
    "id": "oai-7",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "Bundle the model in the APK or download it?",
    "answerHtml": "<b>Download</b> large models on first use (with a progress UI, Wi-Fi preference, and opt-in) and cache them in app storage — bundling multi-hundred-MB weights bloats the install and hits delivery limits. AICore's Gemini Nano is even better: the <b>system</b> manages the model, so your app ships no weights at all. Bundling is only reasonable for small LiteRT task models."
  },
  {
    "id": "oai-8",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "What's the senior framing of the on-device vs server trade-off?",
    "answerHtml": "On-device wins on <b>privacy</b> (data never leaves), <b>offline</b>, and <b>no per-call cost</b>, with low latency for small models — but loses on model capability, and pays in RAM, thermals, battery, and device fragmentation. The mature approach is a <b>hybrid</b>: run on-device where it's available and good enough (summaries, classification, redaction), feature-detect, and fall back to a server model for heavy or unsupported cases."
  },
  {
    "id": "oai-9",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "How do you bound an on-device LLM's memory and latency?",
    "answerHtml": "Use a <b>sliding-window</b> context strategy so the prompt+history can't grow unbounded, cap <code>maxTokens</code> for the response (e.g. ~256 for short answers), reuse a single warmed session instead of re-loading the model per request, and quantize. Keep only one active LLM instance, and release it under memory pressure. These bounds keep generation fast and avoid OOM on mid-range devices."
  },
  {
    "id": "oai-10",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "How does on-device AI change your privacy and permissions story?",
    "answerHtml": "Because inference is local, sensitive input (messages, photos, health data) never leaves the device — a strong privacy posture you can advertise and that can simplify compliance. But you still handle the model's <b>output</b> responsibly (don't log prompts/results, respect the same data-handling rules), keep any cached model and conversation encrypted at rest, and be transparent that processing is on-device. On-device isn't a license to ignore data hygiene."
  }
];

export const ADVANCED7_STUDY: StudySection[] = [
  {
    "id": "st-oai-1",
    "num": "G1",
    "title": "G1 · On-device GenAI on Android — the landscape",
    "html": "<p>Three layers, chosen by task and reach:</p>\n      <ul>\n        <li><b>Gemini Nano via AICore + ML Kit GenAI</b> — easiest path for text tasks (summarize, rewrite, proofread, image description). The system hosts the model, so your app ships no weights; limited to capable devices.</li>\n        <li><b>MediaPipe LLM Inference</b> — run a specific open model (Gemma, etc.) you manage, across more devices, with CPU/GPU backends and token streaming.</li>\n        <li><b>LiteRT (TF Lite)</b> — classic on-device ML for vision/audio with hardware delegates.</li>\n      </ul>\n      <p>Engineering concerns that recur: feature-detect capability and fall back to server; quantize and size to RAM; stream tokens but batch emissions; run off the main thread in a lifecycle scope and release the session; download (don't bundle) large models with progress.</p>\n      <div class=\"map\"><span class=\"lbl\">In practice</span> \"I'd ship the summarize feature with Gemini Nano where AICore is available, batch the streamed tokens into a StateFlow, and fall back to our server model on unsupported devices — keeping the data on-device when we can.\"</div>"
  }
];

export const ADVANCED7_PROMPTS: Prompt[] = [
  {
    "id": "and-code-1",
    "kind": "coding",
    "title": "Implement a generic Result wrapper + safeApiCall",
    "level": "mid",
    "tags": ["kotlin", "coroutines", "error-handling"],
    "promptHtml": "<p>Design a <code>sealed</code> <code>Result&lt;out T&gt;</code> type for success/error, and a <code>safeApiCall</code> helper that runs a suspend block on the IO dispatcher, returns <code>Result.Success</code> on success and <code>Result.Error</code> on failure — while correctly <b>not</b> swallowing coroutine cancellation.</p>",
    "reveal": [
      {
        "label": "Approach",
        "html": "<ul><li>Model two states with a sealed hierarchy so a <code>when</code> is exhaustive.</li><li>Wrap the call in <code>withContext(io)</code> for main-safety; inject the dispatcher for tests.</li><li>Catch <code>Exception</code> but <b>rethrow</b> <code>CancellationException</code> so structured concurrency still works.</li><li>Map the throwable to a domain error, not a raw exception in the UI.</li></ul>"
      },
      {
        "label": "Solution",
        "html": "<div class=\"code\">sealed interface Result&lt;out T&gt; {\n  data class Success&lt;T&gt;(val data: T) : Result&lt;T&gt;\n  data class Error(val cause: Throwable) : Result&lt;Nothing&gt;\n}\n\nsuspend fun &lt;T&gt; safeApiCall(\n  io: CoroutineDispatcher = Dispatchers.IO,\n  block: suspend () -&gt; T,\n): Result&lt;T&gt; = withContext(io) {\n  try {\n    Result.Success(block())\n  } catch (e: CancellationException) {\n    throw e            // never swallow cancellation\n  } catch (e: Exception) {\n    Result.Error(e)\n  }\n}</div><p>Callers <code>when</code> over the result; cancellation still propagates because we rethrow it before the generic catch.</p>"
      }
    ]
  },
  {
    "id": "and-code-2",
    "kind": "coding",
    "title": "ViewModel search with debounce + flatMapLatest",
    "level": "senior",
    "tags": ["flow", "viewmodel", "state"],
    "promptHtml": "<p>In a ViewModel, expose a <code>StateFlow&lt;SearchUiState&gt;</code> driven by a query. Debounce input, cancel the in-flight search when the query changes, handle loading/empty/error, and survive rotation without re-running on every collector.</p>",
    "reveal": [
      {
        "label": "Approach",
        "html": "<ul><li>Hold the query in a <code>MutableStateFlow</code> (or SavedStateHandle for process death).</li><li><code>debounce</code> → <code>distinctUntilChanged</code> → <code>flatMapLatest</code> to cancel stale searches.</li><li>Map results to a single immutable state; catch errors into an error state.</li><li><code>stateIn(viewModelScope, WhileSubscribed(5000), Loading)</code> to cache across rotation.</li></ul>"
      },
      {
        "label": "Solution",
        "html": "<div class=\"code\">private val query = MutableStateFlow(\"\")\nfun onQueryChange(q: String) { query.value = q }\n\nval uiState: StateFlow&lt;SearchUiState&gt; = query\n  .debounce(300)\n  .distinctUntilChanged()\n  .flatMapLatest { q -&gt;\n    if (q.isBlank()) flowOf(SearchUiState.Empty)\n    else flow {\n      emit(SearchUiState.Loading)\n      emit(SearchUiState.Success(repo.search(q)))\n    }.catch { emit(SearchUiState.Error(it.message)) }\n  }\n  .stateIn(viewModelScope,\n    SharingStarted.WhileSubscribed(5_000),\n    SearchUiState.Empty)</div><p><code>flatMapLatest</code> cancels the previous search; <code>WhileSubscribed(5000)</code> keeps the result across a rotation.</p>"
      }
    ]
  },
  {
    "id": "and-design-1",
    "kind": "design",
    "title": "Design an offline-first news feed",
    "level": "senior",
    "tags": ["architecture", "offline-first", "paging"],
    "promptHtml": "<p>Design the architecture for a news feed that must load instantly, work offline, paginate infinitely, and stay fresh. Cover layers, the source of truth, pagination, sync, and the trade-offs.</p>",
    "reveal": [
      {
        "label": "Clarify & layers",
        "html": "<ul><li>Clarify: scale of feed, freshness SLA, personalization, image weight, min SDK.</li><li>UI (Compose + ViewModel state) → Domain (optional use-cases) → Data (repository + Room + Retrofit).</li><li><b>Room is the single source of truth</b>; the UI observes a Flow/PagingData so it renders instantly from cache.</li></ul>"
      },
      {
        "label": "Pagination & sync",
        "html": "<ul><li><b>Paging 3 + RemoteMediator</b>: page from Room, fetch+persist the next network page near the end → infinite scroll that works offline.</li><li><b>Cursor pagination</b> for stability under inserts.</li><li>Refresh via pull-to-refresh and a periodic <b>WorkManager</b> sync on unmetered network; write-through to Room so the UI updates by itself (stale-while-revalidate).</li><li>Images: a caching loader (Coil), right-sized, off the main thread.</li></ul>"
      },
      {
        "label": "Trade-offs",
        "html": "<ul><li>Offline-first adds DB + sync complexity but removes spinners and survives bad networks — worth it for a feed.</li><li>Conflict policy: feed is read-mostly, so last-write-wins from the server is fine; user actions (like/save) use optimistic updates with rollback.</li><li>Guard performance with stable keys, immutable item models, and a Baseline Profile; verify with Macrobenchmark.</li></ul>"
      }
    ]
  },
  {
    "id": "and-design-2",
    "kind": "design",
    "title": "Add on-device summarization to a notes app",
    "level": "architect",
    "tags": ["on-device-ai", "privacy", "architecture"],
    "promptHtml": "<p>You want a 'summarize this note' feature that runs on-device for privacy. Design it: model choice, device support, threading/streaming, fallback, and the privacy story.</p>",
    "reveal": [
      {
        "label": "Approach",
        "html": "<ul><li><b>Model</b>: prefer Gemini Nano via AICore + ML Kit GenAI summarization where available (no bundled weights, shared system model); use MediaPipe LLM (Gemma, quantized) for broader reach.</li><li><b>Capability gate</b>: feature-detect AICore/device tier; hide or fall back to a server summarizer when unsupported or low on RAM.</li><li><b>Execution</b>: run in a coroutine on a background dispatcher in <code>viewModelScope</code>; expose a <code>Flow&lt;String&gt;</code> and stream tokens, batching emissions into a <code>StateFlow</code> to avoid recomposition storms.</li></ul>"
      },
      {
        "label": "Trade-offs & privacy",
        "html": "<ul><li><b>Privacy win</b>: note text never leaves the device; advertise it and don't log prompts/outputs; keep cached model/conversation encrypted at rest.</li><li><b>Cost</b>: RAM/thermals/battery and fragmentation — bound context (sliding window), cap generation length, reuse a warmed session, release under memory pressure.</li><li><b>Hybrid</b>: on-device by default, server fallback for long notes or unsupported devices — be transparent about which ran.</li><li>Cancel generation when the user leaves the screen; show progress on model download.</li></ul>"
      }
    ]
  }
];
