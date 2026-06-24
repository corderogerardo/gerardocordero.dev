// Android system-design guide. Typed modules are the source of truth — edit directly.
export type ArchSection = { id: string; num: string; title: string; html: string };
export type DeepDive = { id: string; pill: string; title: string; html: string };

export const ARCH_INTRO = "A senior-level tour of mobile system design mapped onto modern Android — Compose, MVVM/MVI, Clean Architecture, and offline-first. This is the “how do you think about building an Android app at scale” material.";

export const ARCH_SECTIONS: ArchSection[] = [
  {
    "id": "arch-1",
    "num": "01",
    "title": "01 · The mobile system-design framework",
    "html": "<p>Use a repeatable spine so you don't freeze: <b>Clarify → High-level design → Deep dive → Trade-offs → Summary</b>.</p>\n      <ul>\n        <li><b>Clarify</b> for a few minutes first: functional requirements, scale, offline expectations, real-time needs, min SDK, and which screens matter. Resist designing until you've scoped.</li>\n        <li><b>HLD</b>: sketch the layers — UI (Compose + ViewModel), domain (use-cases), data (repository + remote/local sources).</li>\n        <li><b>Deep dive</b> one component they care about (e.g. the sync engine or the feed).</li>\n        <li><b>Trade-offs</b>: say them out loud — every choice costs something.</li>\n        <li><b>Summarize</b> and handle follow-ups.</li>\n      </ul>\n      <div class=\"callout tip\"><span class=\"lbl\">Senior tell</span> Clarify before designing, and narrate the trade-off on every decision. Interviewers grade your <i>process</i> more than the final boxes-and-arrows.</div>"
  },
  {
    "id": "arch-2",
    "num": "02",
    "title": "02 · Layered architecture & unidirectional data flow",
    "html": "<p>Three layers, dependencies pointing inward:</p>\n      <ul>\n        <li><b>UI layer</b> — Composables render an immutable <code>UiState</code>; the ViewModel exposes it as <code>StateFlow</code> and receives events as function calls.</li>\n        <li><b>Domain layer</b> (optional) — pure-Kotlin use-cases holding business rules, no Android dependencies, the most testable layer.</li>\n        <li><b>Data layer</b> — repositories own a single source of truth and coordinate remote (Retrofit) + local (Room/DataStore) sources, mapping DTOs to domain models.</li>\n      </ul>\n      <p><b>Unidirectional data flow</b>: state flows up from the data layer as Flows; events flow down as calls. The UI is a function of state, so it's predictable and testable.</p>"
  },
  {
    "id": "arch-3",
    "num": "03",
    "title": "03 · The networking layer",
    "html": "<p>A robust client separates concerns: <b>OkHttp</b> (engine, pool, cache, interceptors) under <b>Retrofit</b> (typed API) with <b>Moshi/kotlinx.serialization</b> for JSON.</p>\n      <ul>\n        <li><b>Interceptors</b>: application-level for auth headers and logging; network-level for cache-control. An <code>Authenticator</code> handles 401 token refresh in one place.</li>\n        <li><b>Result modeling</b>: wrap calls in a <code>sealed</code> success/error type; never let raw <code>HttpException</code>/<code>IOException</code> reach Compose.</li>\n        <li><b>Resilience</b>: sane timeouts, retry-with-backoff on idempotent calls only, and cancellation tied to the caller's coroutine scope.</li>\n      </ul>\n      <div class=\"map\"><span class=\"lbl\">Trade-off</span> A normalized cache (per-entity) reflects one update everywhere but adds complexity; a simpler per-request cache plus Room as the source of truth is usually enough on mobile.</div>"
  },
  {
    "id": "arch-4",
    "num": "04",
    "title": "04 · Storage, caching & invalidation",
    "html": "<p>Pick storage by shape: <b>Room</b> for structured/relational data and reactive reads; <b>DataStore</b> for key-value/typed preferences; <b>EncryptedSharedPreferences</b>/Keystore for secrets; files/<code>MediaStore</code> for blobs.</p>\n      <ul>\n        <li><b>Cache eviction</b> (free space): LRU or TTL. <b>Cache invalidation</b> (correctness): time-based, event-based (a mutation busts a key), or version-based.</li>\n        <li><b>Stale-while-revalidate</b>: show cached data instantly, refresh in the background, reconcile — the reason good apps feel fast.</li>\n        <li>Room DAOs returning <code>Flow</code> make the cache reactive: write once, every observer updates.</li>\n      </ul>"
  },
  {
    "id": "arch-5",
    "num": "05",
    "title": "05 · Offline-first & sync",
    "html": "<p>The <b>local database is the source of truth</b>; the network only syncs it. The UI always reads local data, so it works with no signal.</p>\n      <ul>\n        <li><b>Optimistic updates</b>: apply the change locally and render immediately; keep the previous value to roll back on failure.</li>\n        <li><b>Sync queue</b>: enqueue offline mutations and replay them (via WorkManager) when connectivity returns, with idempotency keys.</li>\n        <li><b>Conflict resolution</b>: choose per data type — last-write-wins, server-wins, or a merge. Name the policy explicitly.</li>\n      </ul>\n      <div class=\"map\"><span class=\"lbl\">Trade-off</span> Optimistic UX feels instant but needs rollback and conflict handling; for money/inventory you may prefer pessimistic confirmation. Say which and why.</div>"
  },
  {
    "id": "arch-6",
    "num": "06",
    "title": "06 · Real-time — WebSocket, SSE, polling & push",
    "html": "<p>Match the transport to the need and the battery:</p>\n      <ul>\n        <li><b>WebSocket</b> for two-way, low-latency (chat, presence). Manage reconnect/backoff and lifecycle.</li>\n        <li><b>SSE / long-poll</b> for one-way server→client streams (feeds, live scores).</li>\n        <li><b>Polling</b> for simple, low-frequency updates without socket infra.</li>\n        <li><b>FCM push</b> when the app is backgrounded or killed — the only reliable way to wake it.</li>\n      </ul>\n      <div class=\"map\"><span class=\"lbl\">Trade-off</span> Holding a socket open for occasional updates drains battery (radio tail energy). Don't keep a live connection when periodic push or polling would do.</div>"
  },
  {
    "id": "arch-7",
    "num": "07",
    "title": "07 · Pagination at scale (Paging 3)",
    "html": "<p>For large lists, page lazily. <b>Paging 3</b> provides a <code>PagingSource</code> (or <code>RemoteMediator</code> for network+DB), exposes <code>Flow&lt;PagingData&gt;</code>, and handles load states and retries.</p>\n      <ul>\n        <li><b>Cursor/keyset</b> pagination is the right default for feeds — stable under inserts, unlike offset/limit.</li>\n        <li><code>RemoteMediator</code> implements offline-first paging: page from Room, fetch + persist the next page from the network.</li>\n        <li>Collect with <code>collectAsLazyPagingItems()</code> in Compose and render placeholders + append-load spinners.</li>\n      </ul>"
  },
  {
    "id": "arch-8",
    "num": "08",
    "title": "08 · Performance & security essentials",
    "html": "<p>Bake both in from the start:</p>\n      <ul>\n        <li><b>Performance</b>: main-thread discipline, Compose stability, Baseline Profiles, and Macrobenchmark gates in CI. Measure cold start and jank on release builds.</li>\n        <li><b>Security</b>: Keystore for keys, EncryptedSharedPreferences for secrets, Network Security Config + pinning in transit, Play Integrity for attestation, R8 for obfuscation.</li>\n        <li><b>Observability</b>: crash reporting (crash-free rate as the headline metric), ANR tracking, and release-health gating on staged rollouts.</li>\n      </ul>\n      <div class=\"callout tip\"><span class=\"lbl\">Senior tell</span> Treat a deploy as “done” only when the crash-free rate holds across the rollout — monitoring is part of shipping.</div>"
  }
];

export const DEEPDIVES_INTRO = "The senior playbook in a concept → example → problem → solution shape, so each idea sticks as a real engineering decision rather than a definition.";

export const DEEP_DIVES: DeepDive[] = [
  {
    "id": "dd-1",
    "pill": "State",
    "title": "Lifecycle-safe Flow collection",
    "html": "<p><b>Concept:</b> collecting a Flow keeps the upstream working as long as the collector is active.</p>\n      <p><b>Problem:</b> collecting in <code>onCreate</code> with a bare <code>lifecycleScope.launch</code> keeps collecting in the background — wasted work and stale UI updates.</p>\n      <p><b>Solution:</b> bound collection to the lifecycle.</p>\n      <div class=\"code\">// Compose\nval ui by viewModel.uiState.collectAsStateWithLifecycle()\n\n// Views\nlifecycleScope.launch {\n  repeatOnLifecycle(Lifecycle.State.STARTED) {\n    viewModel.uiState.collect { render(it) }\n  }\n}</div>\n      <p>Collection now stops below STARTED and restarts on return — no background churn.</p>"
  },
  {
    "id": "dd-2",
    "pill": "State",
    "title": "StateFlow caching with stateIn(WhileSubscribed)",
    "html": "<p><b>Concept:</b> a cold Flow restarts per collector; you want one shared, cached state stream.</p>\n      <p><b>Problem:</b> on rotation the subscriber briefly drops, and a naive share tears down and re-fetches.</p>\n      <p><b>Solution:</b> share with a stop-timeout so a config change doesn't restart the upstream.</p>\n      <div class=\"code\">val uiState: StateFlow&lt;UiState&gt; =\n  repository.observeItems()\n    .map { UiState(items = it) }\n    .stateIn(\n      scope = viewModelScope,\n      started = SharingStarted.WhileSubscribed(5_000),\n      initialValue = UiState(loading = true),\n    )</div>\n      <p>The 5s window keeps the cached value across rotation while still stopping work when the screen is truly gone.</p>"
  },
  {
    "id": "dd-3",
    "pill": "Flow",
    "title": "Search with flatMapLatest + debounce",
    "html": "<p><b>Concept:</b> a search box should cancel the previous query when the user keeps typing.</p>\n      <p><b>Problem:</b> firing a request per keystroke wastes the network and can render stale results out of order.</p>\n      <p><b>Solution:</b> debounce the query and switch to the latest with <code>flatMapLatest</code>.</p>\n      <div class=\"code\">val results = queryFlow\n  .debounce(300)\n  .distinctUntilChanged()\n  .flatMapLatest { q -&gt;\n    if (q.isBlank()) flowOf(emptyList())\n    else repository.search(q) // cancelled when q changes\n  }\n  .flowOn(Dispatchers.Default)</div>\n      <p><code>flatMapLatest</code> cancels the in-flight inner flow the moment a new query arrives — no race, no stale list.</p>"
  },
  {
    "id": "dd-4",
    "pill": "Compose",
    "title": "Fixing over-recomposition with stability",
    "html": "<p><b>Concept:</b> Compose skips a composable only when its parameters are stable and unchanged.</p>\n      <p><b>Problem:</b> a list item takes <code>items: List&lt;Item&gt;</code>; <code>List</code> is treated as unstable, so every item recomposes on any change.</p>\n      <p><b>Solution:</b> use an immutable collection (or annotate the model) so Compose can skip.</p>\n      <div class=\"code\">// build.gradle: implementation(\"org.jetbrains.kotlinx:kotlinx-collections-immutable:...\")\n\n@Immutable\ndata class Item(val id: String, val title: String)\n\n@Composable\nfun Feed(items: ImmutableList&lt;Item&gt;) {\n  LazyColumn {\n    items(items, key = { it.id }) { ItemRow(it) }\n  }\n}</div>\n      <p>Verify with Layout Inspector recomposition counts or the Compose compiler metrics report.</p>"
  },
  {
    "id": "dd-5",
    "pill": "Concurrency",
    "title": "Main-safety with withContext",
    "html": "<p><b>Concept:</b> a <code>suspend</code> function should be safe to call from the main thread.</p>\n      <p><b>Problem:</b> doing blocking I/O (disk, JSON parse) on <code>Dispatchers.Main</code> drops frames or triggers an ANR.</p>\n      <p><b>Solution:</b> switch dispatchers <i>inside</i> the function, and inject the dispatcher for testability.</p>\n      <div class=\"code\">class Repo(private val io: CoroutineDispatcher = Dispatchers.IO) {\n  suspend fun load(id: String): Model = withContext(io) {\n    val dto = api.fetch(id)   // blocking-safe on IO\n    dto.toModel()\n  }\n}\n// test: Repo(StandardTestDispatcher())</div>\n      <p>Callers stay on Main; the function owns its threading. Injecting <code>io</code> lets tests control it.</p>"
  },
  {
    "id": "dd-6",
    "pill": "Jetpack",
    "title": "Guaranteed background work with WorkManager",
    "html": "<p><b>Concept:</b> some work must complete even across process death and reboot.</p>\n      <p><b>Problem:</b> a coroutine in <code>viewModelScope</code> dies with the screen; a raw Service is heavy and fragile for a deferrable sync.</p>\n      <p><b>Solution:</b> enqueue a constrained <code>CoroutineWorker</code>.</p>\n      <div class=\"code\">class SyncWorker(c: Context, p: WorkerParameters) : CoroutineWorker(c, p) {\n  override suspend fun doWork(): Result =\n    try { repo.sync(); Result.success() }\n    catch (e: IOException) { Result.retry() }\n}\n\nval req = OneTimeWorkRequestBuilder&lt;SyncWorker&gt;()\n  .setConstraints(Constraints(requiredNetworkType = NetworkType.CONNECTED))\n  .build()\nWorkManager.getInstance(ctx)\n  .enqueueUniqueWork(\"sync\", ExistingWorkPolicy.KEEP, req)</div>"
  },
  {
    "id": "dd-7",
    "pill": "DI",
    "title": "Hilt scopes & @Binds vs @Provides",
    "html": "<p><b>Concept:</b> Hilt generates a dependency graph tied to Android lifecycles.</p>\n      <p><b>Problem:</b> you need an interface→impl binding and a third-party object you don't own, with the right lifetimes.</p>\n      <p><b>Solution:</b> <code>@Binds</code> for interfaces, <code>@Provides</code> for owned-elsewhere types, scoped correctly.</p>\n      <div class=\"code\">@Module @InstallIn(SingletonComponent::class)\nabstract class DataModule {\n  @Binds @Singleton\n  abstract fun bindRepo(impl: RepoImpl): Repo\n\n  companion object {\n    @Provides @Singleton\n    fun retrofit(): Retrofit = Retrofit.Builder()\n      .baseUrl(BASE).addConverterFactory(/* ... */).build()\n  }\n}\n\n@HiltViewModel\nclass FeedViewModel @Inject constructor(private val repo: Repo) : ViewModel()</div>\n      <p>A missing binding is a <b>build error</b>, not a runtime crash — a real advantage to name.</p>"
  },
  {
    "id": "dd-8",
    "pill": "Data",
    "title": "Room as the single source of truth",
    "html": "<p><b>Concept:</b> the UI observes the database; the network only updates it.</p>\n      <p><b>Problem:</b> fetching directly into the UI gives spinners everywhere and divergent copies of the data.</p>\n      <p><b>Solution:</b> read from a <code>Flow</code> DAO; refresh writes back to Room, which re-emits.</p>\n      <div class=\"code\">@Dao interface ItemDao {\n  @Query(\"SELECT * FROM items ORDER BY updatedAt DESC\")\n  fun observeAll(): Flow&lt;List&lt;ItemEntity&gt;&gt;\n  @Upsert suspend fun upsertAll(items: List&lt;ItemEntity&gt;)\n}\n\nfun observeItems(): Flow&lt;List&lt;Item&gt;&gt; = dao.observeAll().map { it.toDomain() }\nsuspend fun refresh() { dao.upsertAll(api.fetch().toEntities()) }</div>\n      <p>The screen renders instantly from cache and updates the moment <code>refresh()</code> writes — stale-while-revalidate, built in.</p>"
  },
  {
    "id": "dd-9",
    "pill": "Security",
    "title": "Certificate pinning (and its rotation risk)",
    "html": "<p><b>Concept:</b> pinning trusts only your server's certificate/public key, blocking man-in-the-middle via a rogue CA.</p>\n      <p><b>Problem:</b> if you pin a single cert and rotate it, every old client breaks.</p>\n      <p><b>Solution:</b> pin with OkHttp, include a backup pin, and ship pins ahead of rotation.</p>\n      <div class=\"code\">val pinner = CertificatePinner.Builder()\n  .add(\"api.example.com\", \"sha256/AAAA…\") // current\n  .add(\"api.example.com\", \"sha256/BBBB…\") // backup / next\n  .build()\nval client = OkHttpClient.Builder().certificatePinner(pinner).build()</div>\n      <p>Prefer pinning the SPKI (public key) over the leaf cert, and always keep a backup pin to survive rotation.</p>"
  },
  {
    "id": "dd-10",
    "pill": "Performance",
    "title": "Baseline Profiles for cold start",
    "html": "<p><b>Concept:</b> a Baseline Profile lists hot code so ART AOT-compiles it at install instead of interpreting on first run.</p>\n      <p><b>Problem:</b> the first launch and first scroll are slow because that code is JIT-compiled cold.</p>\n      <p><b>Solution:</b> generate a profile with a Macrobenchmark journey and ship it.</p>\n      <div class=\"code\">@Test fun generate() = baselineRule.collect(\n  packageName = \"com.example.app\",\n) {\n  startActivityAndWait()\n  // scroll the feed so the hot path is captured\n  device.findObject(By.res(\"feed\")).fling(Direction.DOWN)\n}</div>\n      <p>Measure the before/after with a separate Macrobenchmark and keep it in CI so the win can't regress.</p>"
  }
];
