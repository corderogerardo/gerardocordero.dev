import type { Level } from "@/lib/levels";

export type PromptKind = "coding" | "design";

export type Prompt = {
  id: string;
  kind: PromptKind;
  title: string;
  level: Level;
  tags: string[];
  /** The question / scenario (rich HTML). */
  promptHtml: string;
  /** Progressively revealed sections (e.g. Approach -> Solution). */
  reveal: { label: string; html: string }[];
};

// Android coding + system-design practice prompts.
export const PROMPTS: Prompt[] = [
  {
    "id": "code-1",
    "kind": "coding",
    "title": "Debounce a Flow (search input)",
    "level": "mid",
    "tags": ["flow", "coroutines", "operators"],
    "promptHtml": "<p>Given a <code>Flow&lt;String&gt;</code> of search-box text, produce a stream that only emits after the user pauses typing for 300ms and skips duplicate consecutive queries. Then explain why <code>flatMapLatest</code> is the right way to run the actual search.</p>",
    "reveal": [
      {
        "label": "Approach",
        "html": "<ul><li><code>debounce(300)</code> waits for a quiet period before emitting the latest value.</li><li><code>distinctUntilChanged()</code> drops repeated queries (e.g. trailing whitespace toggles).</li><li><code>flatMapLatest</code> cancels the in-flight search when a new query arrives, so stale results never render.</li></ul>"
      },
      {
        "label": "Solution",
        "html": "<div class=\"code\">val results: Flow&lt;List&lt;Item&gt;&gt; = queryFlow\n  .debounce(300)\n  .distinctUntilChanged()\n  .flatMapLatest { q -&gt;\n    if (q.isBlank()) flowOf(emptyList())\n    else repository.search(q)   // cancelled if q changes again\n  }\n  .flowOn(Dispatchers.Default)</div><p>Each new keystroke restarts the debounce window; <code>flatMapLatest</code> guarantees only the newest query's results survive. <code>flowOn</code> keeps the upstream off the main thread.</p>"
      }
    ]
  },
  {
    "id": "code-2",
    "kind": "coding",
    "title": "Coroutine retry with exponential backoff",
    "level": "senior",
    "tags": ["coroutines", "resilience"],
    "promptHtml": "<p>Write a generic <code>suspend fun &lt;T&gt; retry(times, initialDelay, maxDelay, factor, block)</code> that retries a suspend <code>block</code> on failure with exponential backoff, gives up after <code>times</code> attempts, and never swallows cancellation.</p>",
    "reveal": [
      {
        "label": "Approach",
        "html": "<ul><li>Loop <code>times - 1</code> attempts, returning on success.</li><li>On failure, <code>delay</code> then grow the delay by <code>factor</code>, capped at <code>maxDelay</code>.</li><li>Let <code>CancellationException</code> propagate (don't catch it).</li><li>Do the final attempt outside the catch so the last exception surfaces.</li></ul>"
      },
      {
        "label": "Solution",
        "html": "<div class=\"code\">suspend fun &lt;T&gt; retry(\n  times: Int = 3,\n  initialDelay: Long = 200,\n  maxDelay: Long = 5_000,\n  factor: Double = 2.0,\n  block: suspend () -&gt; T,\n): T {\n  var delayMs = initialDelay\n  repeat(times - 1) {\n    try {\n      return block()\n    } catch (e: CancellationException) {\n      throw e\n    } catch (e: Exception) {\n      delay(delayMs)\n      delayMs = (delayMs * factor).toLong().coerceAtMost(maxDelay)\n    }\n  }\n  return block() // last attempt; throws if it fails\n}</div><p>Only retry idempotent operations. Because <code>delay</code> is cancellable and we rethrow cancellation, the retry loop respects structured concurrency.</p>"
      }
    ]
  },
  {
    "id": "code-3",
    "kind": "coding",
    "title": "Thread-safe LRU cache in Kotlin",
    "level": "senior",
    "tags": ["kotlin", "data-structures", "concurrency"],
    "promptHtml": "<p>Implement a fixed-capacity LRU cache with O(1) get/put. Make it safe for concurrent coroutine access. What evicts, and how do you keep it O(1)?</p>",
    "reveal": [
      {
        "label": "Approach",
        "html": "<ul><li>A <code>LinkedHashMap</code> with <code>accessOrder = true</code> gives LRU ordering and O(1) ops; override <code>removeEldestEntry</code> to cap size.</li><li>Guard mutations with a <code>Mutex</code> (suspending) rather than blocking locks inside coroutines.</li><li>Eviction removes the least-recently-accessed entry when over capacity.</li></ul>"
      },
      {
        "label": "Solution",
        "html": "<div class=\"code\">class LruCache&lt;K, V&gt;(private val capacity: Int) {\n  private val mutex = Mutex()\n  private val map = object : LinkedHashMap&lt;K, V&gt;(\n    capacity, 0.75f, /* accessOrder = */ true,\n  ) {\n    override fun removeEldestEntry(e: Map.Entry&lt;K, V&gt;) = size &gt; capacity\n  }\n\n  suspend fun get(key: K): V? = mutex.withLock { map[key] }\n  suspend fun put(key: K, value: V) = mutex.withLock { map[key] = value }\n}</div><p>Access-ordered <code>LinkedHashMap</code> moves touched entries to the tail; <code>removeEldestEntry</code> evicts the head when full. The <code>Mutex</code> serializes access without blocking a dispatcher thread.</p>"
      }
    ]
  },
  {
    "id": "code-4",
    "kind": "coding",
    "title": "MVI reducer with a sealed Intent",
    "level": "senior",
    "tags": ["mvi", "state", "kotlin"],
    "promptHtml": "<p>Model a counter screen with MVI: an immutable <code>UiState</code>, a <code>sealed</code> <code>Intent</code>, and a pure <code>reduce(state, intent): state</code>. Show why purity and immutability help testing.</p>",
    "reveal": [
      {
        "label": "Approach",
        "html": "<ul><li>One immutable <code>data class</code> for state, updated with <code>copy()</code>.</li><li>A <code>sealed interface</code> for intents so <code>when</code> is exhaustive.</li><li><code>reduce</code> is a pure function — same inputs, same output, trivially unit-testable.</li></ul>"
      },
      {
        "label": "Solution",
        "html": "<div class=\"code\">data class UiState(val count: Int = 0, val loading: Boolean = false)\n\nsealed interface Intent {\n  data object Increment : Intent\n  data object Decrement : Intent\n  data class Set(val value: Int) : Intent\n}\n\nfun reduce(state: UiState, intent: Intent): UiState = when (intent) {\n  Intent.Increment -&gt; state.copy(count = state.count + 1)\n  Intent.Decrement -&gt; state.copy(count = state.count - 1)\n  is Intent.Set    -&gt; state.copy(count = intent.value)\n}</div><p>The ViewModel just folds intents into state (<code>state = reduce(state, intent)</code>) and emits via <code>StateFlow</code>. Adding a new intent is a compile error until you handle it.</p>"
      }
    ]
  },
  {
    "id": "code-5",
    "kind": "coding",
    "title": "StateFlow counter ViewModel that survives process death",
    "level": "mid",
    "tags": ["viewmodel", "savedstatehandle", "state"],
    "promptHtml": "<p>Write a ViewModel exposing a counter as <code>StateFlow&lt;Int&gt;</code> that survives both rotation and process death, with increment/decrement. Which APIs guarantee each?</p>",
    "reveal": [
      {
        "label": "Approach",
        "html": "<ul><li>ViewModel survives rotation by itself.</li><li>For process death, back the value with <code>SavedStateHandle.getStateFlow</code>.</li><li>Mutate through the handle so the new value is persisted.</li></ul>"
      },
      {
        "label": "Solution",
        "html": "<div class=\"code\">@HiltViewModel\nclass CounterViewModel @Inject constructor(\n  private val state: SavedStateHandle,\n) : ViewModel() {\n  val count: StateFlow&lt;Int&gt; = state.getStateFlow(\"count\", 0)\n\n  fun increment() { state[\"count\"] = count.value + 1 }\n  fun decrement() { state[\"count\"] = count.value - 1 }\n}</div><p><code>getStateFlow</code> reads/writes the saved-state bundle, so the count restores after the OS kills the process — and rotation is covered because the ViewModel is retained.</p>"
      }
    ]
  },
  {
    "id": "code-6",
    "kind": "coding",
    "title": "Offline-first repository (Room + network)",
    "level": "senior",
    "tags": ["architecture", "room", "flow"],
    "promptHtml": "<p>Implement a repository where the UI observes Room (source of truth) and a <code>refresh()</code> updates it from the network. Why does this give stale-while-revalidate for free?</p>",
    "reveal": [
      {
        "label": "Approach",
        "html": "<ul><li>Expose <code>observeX(): Flow</code> backed by a Flow DAO — emits instantly from cache and re-emits on change.</li><li><code>refresh()</code> fetches and write-throughs to Room; the observed Flow updates automatically.</li><li>Map entities to domain models so DTOs/entities don't leak to the UI.</li></ul>"
      },
      {
        "label": "Solution",
        "html": "<div class=\"code\">class ItemRepository @Inject constructor(\n  private val dao: ItemDao,\n  private val api: ItemApi,\n  private val io: CoroutineDispatcher,\n) {\n  fun observeItems(): Flow&lt;List&lt;Item&gt;&gt; =\n    dao.observeAll().map { rows -&gt; rows.map { it.toDomain() } }\n\n  suspend fun refresh() = withContext(io) {\n    val fresh = api.getItems()                 // network\n    dao.upsertAll(fresh.map { it.toEntity() }) // write-through\n  }\n}</div><p>The screen renders cached data immediately and updates the moment <code>refresh()</code> writes new rows — the database, not the network call, drives the UI.</p>"
      }
    ]
  },
  {
    "id": "code-7",
    "kind": "coding",
    "title": "Safe JSON parsing with kotlinx.serialization",
    "level": "mid",
    "tags": ["kotlin", "serialization", "error-handling"],
    "promptHtml": "<p>Parse an API response into a typed model with <code>kotlinx.serialization</code>, tolerating unknown/extra fields, and return a <code>Result</code> rather than throwing into the UI. Why validate at the boundary?</p>",
    "reveal": [
      {
        "label": "Approach",
        "html": "<ul><li>Annotate the model <code>@Serializable</code>; configure <code>Json { ignoreUnknownKeys = true }</code> so a new server field doesn't crash you.</li><li>Wrap decoding in try/catch and return <code>Result</code>; never let a malformed payload throw into Compose.</li><li>Parse at the network boundary so the rest of the app trusts its types.</li></ul>"
      },
      {
        "label": "Solution",
        "html": "<div class=\"code\">@Serializable data class UserDto(val id: String, val name: String)\n\nval json = Json { ignoreUnknownKeys = true; coerceInputValues = true }\n\nfun parseUser(body: String): Result&lt;UserDto&gt; = runCatching {\n  json.decodeFromString&lt;UserDto&gt;(body)\n}</div><p>Types are compile-time only — a bad payload still crashes at runtime unless you validate it. Parsing into a <code>Result</code> at the edge contains the failure and keeps the UI total.</p>"
      }
    ]
  },
  {
    "id": "code-8",
    "kind": "coding",
    "title": "Custom Compose Modifier: deferred-read offset",
    "level": "senior",
    "tags": ["compose", "performance", "modifier"],
    "promptHtml": "<p>You animate an element's horizontal position from a fast-changing state. Show the version that recomposes every frame and the version that doesn't, and explain why.</p>",
    "reveal": [
      {
        "label": "Approach",
        "html": "<ul><li>Reading the state in the composition phase (passing a value to <code>offset(x.dp)</code>) recomposes on every change.</li><li>Reading it inside the <code>offset { }</code> lambda defers the read to the <b>layout</b> phase — no recomposition, just re-layout.</li></ul>"
      },
      {
        "label": "Solution",
        "html": "<div class=\"code\">// Recomposes every frame (state read in composition):\nBox(Modifier.offset(x = scrollX.value.dp))\n\n// Skips recomposition (state read deferred to layout):\nBox(Modifier.offset { IntOffset(scrollX.value, 0) })</div><p>The lambda overload is invoked in the layout phase, so changing <code>scrollX</code> only re-lays-out and redraws — the composable function never re-runs. This is the core trick for smooth scroll/animation in Compose.</p>"
      }
    ]
  },
  {
    "id": "design-1",
    "kind": "design",
    "title": "Design a real-time chat feature",
    "level": "senior",
    "tags": ["architecture", "real-time", "offline-first"],
    "promptHtml": "<p>Design 1:1 chat: real-time delivery, message history, offline send, and read receipts. Cover transport, the data layer, ordering, and trade-offs.</p>",
    "reveal": [
      {
        "label": "Clarify & transport",
        "html": "<ul><li>Clarify: scale, group vs 1:1, media, delivery/read receipts, retention.</li><li><b>WebSocket</b> for live two-way messages + presence; <b>FCM</b> push to wake a backgrounded/killed app and trigger a sync.</li><li>Manage socket lifecycle with the screen/app; reconnect with backoff.</li></ul>"
      },
      {
        "label": "Data & ordering",
        "html": "<ul><li><b>Room is the source of truth</b>; the UI observes a Flow of messages, so history loads instantly and offline.</li><li>Outgoing messages are written locally as 'sending' (optimistic), enqueued, and reconciled on ack — failures retry via WorkManager.</li><li>Order by a server timestamp/sequence; use client temp-ids reconciled to server-ids to avoid duplicates.</li></ul>"
      },
      {
        "label": "Trade-offs",
        "html": "<ul><li>Holding a socket drains battery — close it when backgrounded and rely on push, accepting slightly higher latency for resumed delivery.</li><li>Read receipts add chattiness; batch them.</li><li>Paginate history with cursor paging; lazy-load media.</li></ul>"
      }
    ]
  },
  {
    "id": "design-2",
    "kind": "design",
    "title": "Design reliable image upload with an offline queue",
    "level": "senior",
    "tags": ["workmanager", "offline", "resilience"],
    "promptHtml": "<p>Users pick photos that must upload reliably even if the app is killed or offline. Design the queue, retries, progress, and constraints.</p>",
    "reveal": [
      {
        "label": "Approach",
        "html": "<ul><li>Persist each upload as a row (URI, status) so it survives process death — Room as the queue.</li><li>Enqueue a <b>WorkManager</b> chain (compress → upload) with constraints (network connected, maybe unmetered) and unique work per image.</li><li>Use a <b>CoroutineWorker</b>: <code>Result.retry()</code> with exponential backoff for transient failures, <code>failure()</code> for permanent.</li><li>Report progress with <code>setProgress</code>; run as expedited/foreground for user-initiated uploads.</li></ul>"
      },
      {
        "label": "Trade-offs",
        "html": "<ul><li>WorkManager timing is approximate (Doze) — fine for uploads, not for instant needs.</li><li>Idempotency: send a client-generated upload id so retries don't duplicate on the server.</li><li>Clean up local copies after success; cap retries and surface a 'failed, tap to retry' state.</li></ul>"
      }
    ]
  },
  {
    "id": "design-3",
    "kind": "design",
    "title": "Design a feature-flag / experiment system",
    "level": "architect",
    "tags": ["architecture", "experimentation", "release"],
    "promptHtml": "<p>Design client-side feature flags and A/B experiments: how flags are fetched, cached, evaluated, and kept consistent — plus kill switches and analytics. Trade-offs?</p>",
    "reveal": [
      {
        "label": "Approach",
        "html": "<ul><li>Fetch flags at startup from a remote config service; <b>cache</b> them (DataStore) so the app works offline with the last known values + sane defaults.</li><li>Assign a variant deterministically (hash of userId + experiment) so a user stays in one bucket; expose a typed <code>FlagProvider</code> behind an interface for testability.</li><li>Fire an 'exposure' analytics event when a variant is actually shown; read guardrail metrics.</li><li>Each flag is a <b>kill switch</b> — disable a risky feature server-side without a release.</li></ul>"
      },
      {
        "label": "Trade-offs",
        "html": "<ul><li>Evaluate flags consistently within a session (snapshot at launch) so the UI doesn't flip mid-use.</li><li>Defaults must be safe — if config fails, the app still works.</li><li>Flag hygiene: clean up stale flags or they become permanent tech debt.</li><li>Native has no code OTA, so flags are how you change behavior between releases.</li></ul>"
      }
    ]
  },
  {
    "id": "design-4",
    "kind": "design",
    "title": "Design analytics / event tracking on the client",
    "level": "senior",
    "tags": ["architecture", "analytics", "batching"],
    "promptHtml": "<p>Design a client analytics pipeline: capture events, batch them, survive offline and process death, and avoid blocking the UI or draining battery. Trade-offs?</p>",
    "reveal": [
      {
        "label": "Approach",
        "html": "<ul><li>A thin <code>Analytics</code> interface; events written to a <b>Room</b> buffer table (durable, survives kill) off the main thread.</li><li>A <b>WorkManager</b> periodic/triggered job uploads batches on a good network and clears sent rows; retry with backoff.</li><li>Add session/context (app version, locale) centrally; respect consent/opt-out.</li></ul>"
      },
      {
        "label": "Trade-offs",
        "html": "<ul><li><b>Batch</b> rather than per-event POSTs — the radio tail energy of many small calls is a battery killer.</li><li>Cap buffer size and drop oldest if unbounded; ensure at-least-once delivery with dedupe ids if exactness matters.</li><li>Never block UI — enqueue and return immediately; sample high-volume events.</li></ul>"
      }
    ]
  },
  {
    "id": "design-5",
    "kind": "design",
    "title": "Design a token-bucket rate limiter for API calls",
    "level": "mid",
    "tags": ["concurrency", "resilience", "kotlin"],
    "promptHtml": "<p>You must cap outgoing requests to N per second across the app, coroutine-safe. Sketch a token-bucket and how it integrates with OkHttp/coroutines. Trade-offs vs server-side limiting?</p>",
    "reveal": [
      {
        "label": "Approach",
        "html": "<ul><li>A token bucket refills at a fixed rate; a request must <code>acquire()</code> a token (suspending until one is available) before proceeding.</li><li>Guard the bucket with a <code>Mutex</code>; compute available tokens from elapsed time on each acquire.</li><li>Integrate as an OkHttp interceptor or a wrapper around the API call that awaits a token.</li></ul>"
      },
      {
        "label": "Trade-offs",
        "html": "<ul><li>Client limiting smooths bursts and protects the backend, but it can't enforce a global limit across devices — the server must still rate-limit authoritatively (429 + Retry-After).</li><li>Suspending acquire is better than blocking; bound the wait or fail fast for time-sensitive calls.</li><li>Pair with backoff on 429s so client and server cooperate.</li></ul>"
      }
    ]
  }
];
