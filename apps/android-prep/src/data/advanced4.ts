// Batch 4 — Dependency injection (Hilt/Dagger) and the data layer (Room, DataStore, Paging 3).
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED4_FLASHCARD_FILTERS: { value: string; label: string }[] = [
  { value: "di", label: "DI (Hilt)" },
  { value: "data", label: "Data & Room" },
];

export const ADVANCED4_FLASHCARDS: Flashcard[] = [
  {
    "id": "di-1",
    "category": "di",
    "categoryLabel": "DI",
    "question": "@Binds vs @Provides — when do you use each?",
    "answerHtml": "<code>@Binds</code> tells Hilt which implementation to use for an interface — it's an abstract method, generates no code, and is the efficient choice for interface→impl. <code>@Provides</code> is a concrete function that <i>constructs</i> something you can't annotate with <code>@Inject</code> (a third-party type like <code>Retrofit</code>, or something needing builder logic). Rule: <code>@Binds</code> for your own interfaces, <code>@Provides</code> for objects you don't own or must build."
  },
  {
    "id": "di-2",
    "category": "di",
    "categoryLabel": "DI",
    "question": "Name the main Hilt components/scopes and their lifetimes.",
    "answerHtml": "<code>SingletonComponent</code> (<code>@Singleton</code>, app lifetime), <code>ActivityRetainedComponent</code> (<code>@ActivityRetainedScoped</code>, survives config change — where ViewModels live), <code>ViewModelComponent</code> (<code>@ViewModelScoped</code>), <code>ActivityComponent</code>, <code>FragmentComponent</code>, <code>ViewComponent</code>, <code>ServiceComponent</code>. A binding's scope sets how long the single instance lives; unscoped bindings create a new instance per injection."
  },
  {
    "id": "di-3",
    "category": "di",
    "categoryLabel": "DI",
    "question": "How do you inject a ViewModel with Hilt?",
    "answerHtml": "Annotate the ViewModel <code>@HiltViewModel</code> with an <code>@Inject constructor</code>, mark the host <code>@AndroidEntryPoint</code>, and retrieve it with <code>hiltViewModel()</code> in Compose (or <code>by viewModels()</code> in Views). Hilt supplies the dependencies and the <code>SavedStateHandle</code> automatically. You never call the constructor yourself."
  },
  {
    "id": "di-4",
    "category": "di",
    "categoryLabel": "DI",
    "question": "You need two OkHttpClients (one pinned, one not). How do you disambiguate?",
    "answerHtml": "Use <b>qualifiers</b>. Define annotations (<code>@Pinned</code>, <code>@Plain</code>) with <code>@Qualifier</code>, annotate each <code>@Provides</code>, and request the right one at the injection site. Without a qualifier Hilt sees two bindings of the same type and fails the build with a duplicate-binding error — which is the point: it's caught at compile time, not runtime."
  },
  {
    "id": "di-5",
    "category": "di",
    "categoryLabel": "DI",
    "question": "What does @InstallIn control?",
    "answerHtml": "It declares which Hilt component a module's bindings live in, setting their scope/visibility. <code>@InstallIn(SingletonComponent::class)</code> makes the bindings app-wide; <code>@InstallIn(ViewModelComponent::class)</code> scopes them to a ViewModel's lifetime. Installing in the wrong component is a common cause of 'binding not found' or unintended singletons."
  },
  {
    "id": "di-6",
    "category": "di",
    "categoryLabel": "DI",
    "question": "Why is constructor injection preferred over field injection?",
    "answerHtml": "Constructor injection makes dependencies explicit, allows <code>val</code> (immutable) fields, and means you can construct the class in a test with plain fakes — no DI framework needed. Field injection (<code>@Inject lateinit var</code>) is only for framework types you don't construct (Activity, Fragment, Service, BroadcastReceiver). Prefer constructor injection everywhere you control instantiation."
  },
  {
    "id": "di-7",
    "category": "di",
    "categoryLabel": "DI",
    "question": "How do you swap a fake in tests with Hilt?",
    "answerHtml": "Use <code>@TestInstallIn</code> (or <code>@UninstallModules</code>) to replace a production module with a test module that binds the fake, and run with <code>@HiltAndroidTest</code> + <code>HiltAndroidRule</code>. For pure unit tests you skip Hilt entirely and pass the fake into the constructor — the whole reason constructor injection is worth it."
  },
  {
    "id": "di-8",
    "category": "di",
    "categoryLabel": "DI",
    "question": "What problem does dependency inversion (the 'D' in SOLID) solve here?",
    "answerHtml": "High-level policy (a ViewModel) shouldn't depend on a low-level detail (Retrofit). By depending on a <code>Repository</code> <b>interface</b> and letting DI provide the concrete <code>RepositoryImpl</code>, you can swap implementations (fake, cached, remote) without touching the ViewModel. DI is the mechanism; dependency inversion is the design principle that makes code testable and modular."
  },
  {
    "id": "da-1",
    "category": "data",
    "categoryLabel": "DATA",
    "question": "Why have Room DAOs return Flow?",
    "answerHtml": "A <code>@Query</code> returning <code>Flow&lt;List&lt;T&gt;&gt;</code> emits the current rows and re-emits automatically whenever the underlying tables change. That makes the database a reactive single source of truth: write once (from a network refresh) and every observer updates. <code>suspend</code> one-shot queries are for reads you don't need to observe; never use blocking queries on the main thread."
  },
  {
    "id": "da-2",
    "category": "data",
    "categoryLabel": "DATA",
    "question": "How do Room migrations work and why export the schema?",
    "answerHtml": "On a version bump you supply a <code>Migration(from, to)</code> with the SQL to transform the schema; without it Room throws (or wipes data with <code>fallbackToDestructiveMigration</code>, rarely acceptable in prod). Exporting the schema JSON (<code>room.schemaLocation</code>) lets you write <b>migration tests</b> that verify the upgrade path against real historical schemas — essential to avoid shipping a crash-on-update."
  },
  {
    "id": "da-3",
    "category": "data",
    "categoryLabel": "DATA",
    "question": "DataStore vs SharedPreferences — the real difference?",
    "answerHtml": "SharedPreferences exposes a synchronous API; even <code>apply()</code> (which defers the disk write) does the in-memory commit on the calling thread, and <code>commit()</code> blocks on disk — both risk main-thread jank/ANR. <b>DataStore</b> is fully asynchronous (coroutines + Flow), transactional, and type-safe (Proto DataStore). It also surfaces read errors instead of silently failing. Migrate preferences to DataStore for correctness, not just style."
  },
  {
    "id": "da-4",
    "category": "data",
    "categoryLabel": "DATA",
    "question": "Preferences DataStore vs Proto DataStore?",
    "answerHtml": "<b>Preferences</b> DataStore is untyped key-value (like SharedPreferences but async) — quick for a few flags. <b>Proto</b> DataStore stores a typed object defined by a protobuf schema, giving compile-time type safety and a clear migration story for structured settings. Use Proto when the settings are a real object with several fields; Preferences for a handful of simple values."
  },
  {
    "id": "da-5",
    "category": "data",
    "categoryLabel": "DATA",
    "question": "What does Paging 3 give you, and what is RemoteMediator?",
    "answerHtml": "Paging 3 loads large lists incrementally: a <code>PagingSource</code> produces pages, the library exposes <code>Flow&lt;PagingData&gt;</code> with built-in load states, retry, and Compose support (<code>collectAsLazyPagingItems()</code>). <b>RemoteMediator</b> implements offline-first paging — it pages from the Room DB as the source of truth and fetches+persists the next network page when the user nears the end, so scrolling works offline."
  },
  {
    "id": "da-6",
    "category": "data",
    "categoryLabel": "DATA",
    "question": "Which pagination strategy for an infinite feed, and why?",
    "answerHtml": "<b>Cursor/keyset</b> pagination (an opaque 'next' token or <code>WHERE id &lt; lastSeen</code>) is the right default. Offset/limit breaks under inserts (items shift, you get duplicates or gaps) and gets slow on large tables. Cursor pagination is stable under concurrent writes and efficient — the standard answer for social feeds."
  },
  {
    "id": "da-7",
    "category": "data",
    "categoryLabel": "DATA",
    "question": "How do you keep DTOs out of the UI layer?",
    "answerHtml": "Map network/DB models to clean <b>domain models</b> inside the repository (e.g. <code>UserDto.toDomain()</code> / <code>UserEntity.toDomain()</code>). The UI and ViewModel only ever see domain types. This decouples the UI from server JSON shape changes and DB columns, keeps mapping in one place, and makes the boundary testable. Leaking DTOs into Compose is a frequent code-review flag."
  },
  {
    "id": "da-8",
    "category": "data",
    "categoryLabel": "DATA",
    "question": "How do you implement optimistic updates with Room as source of truth?",
    "answerHtml": "Write the new value to Room immediately (the UI updates via its Flow), enqueue the network mutation, and on failure revert the row (or mark it failed) and surface an error. Keep the previous value to roll back, and use an idempotency key so a retried mutation isn't applied twice. Because the UI observes the DB, the optimistic value and the rollback both render automatically."
  },
  {
    "id": "di-9",
    "category": "di",
    "categoryLabel": "DI",
    "question": "What is assisted injection (@AssistedInject) for?",
    "answerHtml": "When a class needs both DI-provided dependencies <i>and</i> a runtime parameter (e.g. an <code>itemId</code> only known at the call site). You mark the runtime arg <code>@Assisted</code>, generate a factory with <code>@AssistedFactory</code>, and Hilt wires the rest. Common for a ViewModel/worker that needs a specific id. It avoids the anti-pattern of passing the id through a setter after construction or making everything a field."
  },
  {
    "id": "di-10",
    "category": "di",
    "categoryLabel": "DI",
    "question": "How does Hilt inject into a WorkManager Worker?",
    "answerHtml": "Annotate the worker <code>@HiltWorker</code> with an <code>@AssistedInject</code> constructor taking <code>@Assisted Context</code> and <code>@Assisted WorkerParameters</code> plus your real deps, and configure a <code>HiltWorkerFactory</code> via <code>Configuration.Provider</code> in the Application. Then WorkManager can construct the worker with its dependencies injected — the standard pattern for testable, dependency-rich workers."
  },
  {
    "id": "da-9",
    "category": "data",
    "categoryLabel": "DATA",
    "question": "How do you model relations in Room, and what does @Transaction guard?",
    "answerHtml": "Use <code>@Relation</code> on a POJO to fetch a parent with its children in one typed result (Room runs the joins/extra query for you). Wrap multi-step reads/writes in <code>@Transaction</code> so they're atomic and consistent — important when a <code>@Relation</code> query issues several statements, or when you upsert a parent and its children together. Without <code>@Transaction</code> a concurrent write could interleave and produce an inconsistent snapshot."
  },
  {
    "id": "da-10",
    "category": "data",
    "categoryLabel": "DATA",
    "question": "How do you do a type-safe migration with Proto DataStore?",
    "answerHtml": "Define the schema in a <code>.proto</code>, supply a <code>Serializer</code> with a default instance, and bump fields additively (protobuf is forward/backward compatible if you only add fields and never reuse tag numbers). For moving <i>from</i> SharedPreferences, register a <code>SharedPreferencesMigration</code> so existing keys are copied on first read. The typed object plus protobuf's compatibility rules make settings migrations safe."
  },
  {
    "id": "da-11",
    "category": "data",
    "categoryLabel": "DATA",
    "question": "What does Paging 3 give you for UI states and headers/separators?",
    "answerHtml": "<code>LazyPagingItems</code> exposes <code>loadState</code> (refresh/append/prepend: Loading/NotLoading/Error) so you render spinners, retry, and empty states per edge. You can transform the stream with <code>map</code>/<code>insertSeparators</code> to add date headers or section dividers between items. Combined with <code>cachedIn(viewModelScope)</code>, the paged data survives configuration changes without re-fetching."
  }
];

export const ADVANCED4_QUIZ_FILTERS: { value: string; label: string }[] = [
  { value: "di", label: "DI (Hilt)" },
  { value: "data", label: "Data & Room" },
];

export const ADVANCED4_QUIZ: QuizQuestion[] = [
  {
    "id": "zd1",
    "category": "di",
    "categoryLabel": "DI",
    "question": "Which Hilt annotation efficiently binds an interface to its implementation?",
    "options": [
      "@Provides",
      "@Binds",
      "@Inject",
      "@Singleton"
    ],
    "answer": 1,
    "explanationHtml": "<code>@Binds</code> (abstract, no generated body) is the efficient interface→impl binding. <code>@Provides</code> is for constructing types you don't own."
  },
  {
    "id": "zd2",
    "category": "di",
    "categoryLabel": "DI",
    "question": "Two bindings of the same type cause a Hilt build error. The fix?",
    "options": [
      "Use reflection",
      "Add a @Qualifier annotation to disambiguate",
      "Make both @Singleton",
      "Move them to different files"
    ],
    "answer": 1,
    "explanationHtml": "Qualifiers (<code>@Qualifier</code> annotations) distinguish multiple bindings of the same type at the injection site, resolving the ambiguity at compile time."
  },
  {
    "id": "zd3",
    "category": "di",
    "categoryLabel": "DI",
    "question": "Why prefer constructor injection over field injection?",
    "options": [
      "It's required by Compose",
      "Explicit, immutable deps and you can construct the class in tests without a DI framework",
      "It runs faster at startup",
      "It avoids needing modules"
    ],
    "answer": 1,
    "explanationHtml": "Constructor injection makes dependencies explicit and lets you pass fakes directly in unit tests. Field injection is only for framework types you don't construct."
  },
  {
    "id": "zd4",
    "category": "data",
    "categoryLabel": "Data",
    "question": "A Room @Query returning Flow<List<T>> does what when the table changes?",
    "options": [
      "Nothing until you re-query",
      "Throws an exception",
      "Re-emits the updated rows automatically",
      "Clears the cache"
    ],
    "answer": 2,
    "explanationHtml": "Flow-returning DAOs observe the tables and re-emit on change — making Room a reactive single source of truth."
  },
  {
    "id": "zd5",
    "category": "data",
    "categoryLabel": "Data",
    "question": "Main reason DataStore is preferred over SharedPreferences?",
    "options": [
      "It uses XML",
      "It's fully asynchronous (coroutines/Flow) and transactional, avoiding main-thread I/O",
      "It's smaller on disk",
      "It supports more keys"
    ],
    "answer": 1,
    "explanationHtml": "SharedPreferences does synchronous in-memory/disk work on the calling thread; DataStore is async, transactional, and type-safe."
  },
  {
    "id": "zd6",
    "category": "data",
    "categoryLabel": "Data",
    "question": "Which Paging 3 component implements offline-first network+DB paging?",
    "options": [
      "PagingSource alone",
      "RemoteMediator",
      "LivePagedListBuilder",
      "PagedList"
    ],
    "answer": 1,
    "explanationHtml": "<code>RemoteMediator</code> pages from the DB (source of truth) and fetches+persists the next network page as the user nears the end."
  }
];

export const ADVANCED4_STUDY: StudySection[] = [
  {
    "id": "st-di-1",
    "num": "D1",
    "title": "D1 · Hilt as a compile-time dependency graph",
    "html": "<p>Hilt generates and validates the dependency graph at <b>compile time</b>, so a missing or ambiguous binding is a build error — not a production crash. The pieces:</p>\n      <ul>\n        <li><b>@HiltAndroidApp</b> on the Application bootstraps the graph; <b>@AndroidEntryPoint</b> enables injection into Activities/Fragments/Services.</li>\n        <li><b>Modules</b> (<code>@Module @InstallIn(component)</code>) provide bindings; <b>@Binds</b> for interfaces, <b>@Provides</b> for constructed/third-party types.</li>\n        <li><b>Scopes</b> (<code>@Singleton</code>, <code>@ViewModelScoped</code>, …) control instance lifetime; unscoped = new instance per request.</li>\n        <li><b>Qualifiers</b> disambiguate same-type bindings.</li>\n      </ul>\n      <p>Frame DI around <b>dependency inversion</b>: the ViewModel depends on a repository interface, DI supplies the impl, and tests swap a fake — the testability win is the point, not the object creation.</p>"
  },
  {
    "id": "st-da-1",
    "num": "D2",
    "title": "D2 · The data layer & offline-first",
    "html": "<p>The repository owns a single source of truth and the cache strategy. A canonical offline-first read:</p>\n      <div class=\"code\">fun observeItems(): Flow&lt;List&lt;Item&gt;&gt; =\n  dao.observeAll().map { it.toDomain() }\n\nsuspend fun refresh() = withContext(io) {\n  val fresh = api.fetchItems()           // network\n  dao.upsertAll(fresh.toEntities())      // write-through to Room\n}                                         // UI updates via the Flow above</div>\n      <ul>\n        <li><b>Room</b>: Flow DAOs, tested migrations, exported schema.</li>\n        <li><b>DataStore</b>: async typed preferences (Proto for structured settings).</li>\n        <li><b>Paging 3</b>: <code>RemoteMediator</code> for network+DB paging; cursor pagination for stable feeds.</li>\n        <li><b>Mapping</b>: DTO/Entity → domain model in the repo; the UI never sees transport types.</li>\n      </ul>"
  }
];
