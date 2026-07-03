// Module 14 — Room & Offline-First (Android track). See ../lessons/FORMAT.md and
// ./FORMAT-KOTLIN.md for the schema and Kotlin-specific traps.
window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "room-offline-android",
  title: "Room & Offline-First",
  emoji: "🗃️",
  lang: "kotlin",
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    {
      id: "single-source-of-truth",
      title: "The single source of truth",
      steps: [
        {
          type: "text",
          md: [
            "## Stop fetching. Start reading the database.",
            "Every earlier module treated the network as the source of truth: a ViewModel calls `repo.fetchWalkers()`, gets a `List<Walker>`, and stuffs it straight into a `StateFlow`. That's **fetch-and-forget** — the moment the phone loses signal, or the screen restarts, there's nothing to show until the network comes back.",
            "The Now in Android rule flips that: **the UI reads the database. The network's only job is to write the database.** A composable never talks to `PawWalkApi` directly — it collects a `Flow` off a local table. The repository's `refresh()` function fetches from the network and writes the result into that table. The UI doesn't know or care that a fetch just happened; it just re-renders because the table changed.",
            "That one rule buys you three things for free: **offline reads** (yesterday's walks are still on disk, no network required to show them), **one source of truth** (no `viewModel1` and `viewModel2` disagreeing about what the walkers list looks like — they all read the same table), and **instant restarts** (rotate the screen, kill and reopen the app — the list is on screen before any network call even starts).",
          ],
        },
        {
          type: "text",
          md: [
            "## Room's three parts",
            "**Room** is Android's local database layer — SQLite underneath, with compile-time-checked SQL on top. Three pieces, every time:",
            "- **`@Entity`** — a data class that describes one table. Each instance is one row.\n- **`@Dao`** — an interface listing the queries you're allowed to run against that table (Data Access Object). Room generates the implementation.\n- **`@Database`** — the class that ties entities and DAOs together into one database file.",
          ],
        },
        {
          type: "code",
          title: "data/local/WalkEntity.kt",
          source: String.raw`@Entity
data class WalkEntity(
    @PrimaryKey val id: String,
    val walkerName: String,
    val startedAtMs: Long,
    val distanceMeters: Double,
)`,
          caption: "One row per walk. `@PrimaryKey` marks `id` as the column Room uses to tell rows apart — the same server-issued booking ID you've been carrying since module 10, so a walk fetched twice overwrites the same row instead of duplicating it.",
        },
        {
          type: "quiz",
          q: "Under the single-source-of-truth rule, who is allowed to write to the Room database?",
          choices: [
            "Any composable that needs fresh data",
            "The ViewModel directly, whenever a screen appears",
            "The repository (or another network/sync layer) — it fetches, then writes the result into the table",
            "Room writes to itself automatically whenever the app opens",
          ],
          answer: 2,
          explain: "The repository owns the write path: fetch from the network, map to entities, write to the table. Composables and ViewModels only ever read — via a Flow off a DAO query — so there's exactly one place data enters the database.",
          nudge: "The UI's job is to read and render. Something still has to call the network and turn the response into rows — which layer has been doing the fetching all along?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "dao-flow-queries",
      title: "DAOs & Flow queries",
      steps: [
        {
          type: "text",
          md: [
            "## A Flow that re-emits itself",
            "Module 13 taught you `stateIn` for turning a cold, polling `Flow` into something a screen can collect for free. Room queries skip the polling entirely: a `@Query` DAO method that returns `Flow<List<WalkEntity>>` re-emits a brand-new list automatically **every time the underlying table changes** — no `delay(30_000)` loop, no manual refresh call. Room watches the table for you and re-runs the query the instant an insert, update, or delete touches it.",
            "That's what makes Room plug straight into the reactive pattern you already know: `dao.observeAll()` returns a `Flow`, the repository exposes it (or wraps it in `stateIn`), and the UI collects it with `collectAsState()`. Write to the table from anywhere, and every screen watching it updates itself.",
          ],
        },
        {
          type: "text",
          md: [
            "## Reads are Flow, writes are suspend fun",
            "DAO methods split cleanly by direction. **Reads** that should stay live return a `Flow` — no `suspend` keyword, since a `Flow` is already the async/lazy wrapper. **Writes** are `suspend fun` — they run once, complete, and are called from inside a coroutine (a `viewModelScope.launch` or, as you'll see in lesson 3, a repository's `refresh()`).",
            "For writes, reach for `@Upsert` over `@Insert`. `@Upsert` inserts a row if the primary key is new, or updates it in place if the key already exists — exactly the shape a sync operation needs: you don't know ahead of time whether a walk from the server is brand new or already on disk, and you don't want to write two code paths to find out.",
          ],
        },
        {
          type: "code",
          title: "data/local/WalkDao.kt",
          source: String.raw`@Dao
interface WalkDao {
    @Query("SELECT * FROM WalkEntity ORDER BY startedAtMs DESC")
    fun observeAll(): Flow<List<WalkEntity>>

    @Upsert
    suspend fun upsertAll(walks: List<WalkEntity>)
}`,
          caption: "`observeAll()` is a live view of the table, newest walk first. `upsertAll()` takes a batch — one call syncs a whole page of walks from the server, each row inserted or updated by its `id`.",
        },
        {
          type: "quiz",
          q: "Why does a screen collecting `dao.observeAll()` never need a manual \"pull to refresh triggers a re-query\" call?",
          choices: [
            "It doesn't — you still have to call observeAll() again after every write",
            "Room automatically re-runs the query and re-emits whenever a write touches the WalkEntity table, so the Flow updates itself",
            "observeAll() polls the table every few seconds internally",
            "It only works if the app is in the foreground",
          ],
          answer: 1,
          explain: "A Flow-returning @Query is invalidation-aware: Room tracks which tables a query reads, and any write to those tables (insert, update, delete, from anywhere in the app) triggers a fresh emission. The collector never asks — the table tells it.",
          nudge: "Compare this to the polling Flow from module 13, which needed its own delay loop. What's different about how a Room query decides when to produce a new value?",
        },
        {
          type: "exercise",
          title: "Write WalkDao",
          prompt: [
            "Write the `WalkDao` interface with two members:",
            "1. `observeAll()` — a live query, newest walk first: `@Query(\"SELECT * FROM WalkEntity ORDER BY startedAtMs DESC\") fun observeAll(): Flow<List<WalkEntity>>`.\n2. `upsertAll(walks: List<WalkEntity>)` — a suspend upsert: `@Upsert suspend fun upsertAll(walks: List<WalkEntity>)`.",
          ],
          starter: String.raw`@Dao
interface WalkDao {
    // your code here
}`,
          solution: String.raw`@Dao
interface WalkDao {
    @Query("SELECT * FROM WalkEntity ORDER BY startedAtMs DESC")
    fun observeAll(): Flow<List<WalkEntity>>

    @Upsert
    suspend fun upsertAll(walks: List<WalkEntity>)
}`,
          checks: [
            { re: /@Query\("SELECT\*FROM WalkEntity ORDER BY startedAtMs DESC"\)/, hint: "Match the query exactly: `SELECT * FROM WalkEntity ORDER BY startedAtMs DESC`." },
            { re: /\)fun observeAll\(\):Flow<List<WalkEntity>>/, hint: "Declare `fun observeAll(): Flow<List<WalkEntity>>` — no `suspend`, a Flow is already async." },
            { re: /@Upsert/, hint: "Annotate the write method with `@Upsert`." },
            { re: /suspend fun upsertAll\(walks:List<WalkEntity>\)/, hint: "Declare `suspend fun upsertAll(walks: List<WalkEntity>)`." },
          ],
          mustNot: [
            { re: /@Insert/, hint: "Use `@Upsert`, not `@Insert` — a sync write needs to update existing rows too, not just insert new ones." },
          ],
          success: "That's a real Room DAO: a self-updating read and a sync-friendly write.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "repository-network-db-ui",
      title: "Repository: network → DB → UI",
      steps: [
        {
          type: "text",
          md: [
            "## refresh() writes, observeAll() reads — that's the whole repository",
            "With the DAO in place, the repository's job shrinks to almost nothing: `refresh()` fetches from the API, maps each response DTO to a `WalkEntity`, and calls `upsertAll()`. The `walks` property, meanwhile, is just `dao.observeAll()` exposed as-is (or piped through `stateIn`, from module 13, if a ViewModel wants it as a `StateFlow`). Network in one direction, UI out the other, the table sitting in between as the single source of truth.",
            "The DTO-to-entity mapping happens **at the repository boundary**, and nowhere else. The API's response shape (whatever fields the server sends, possibly nested, possibly named differently) never leaks past the repository — only `WalkEntity` rows do. That's what lets the server's JSON shape change without touching a single composable.",
          ],
        },
        {
          type: "text",
          md: [
            "## When refresh() fails, you still have data",
            "This is the payoff, stated plainly: if `refresh()` throws — no signal, DNS hiccup, the server's down — the `catch` block swallows the `IOException` and `walks` keeps emitting whatever was already on disk. The user sees **yesterday's walks**, not a spinner of death and not a blank error screen. Stale-but-usable beats correct-but-empty almost every time a dog walker is standing in a driveway with one bar of signal.",
          ],
        },
        {
          type: "code",
          title: "data/WalkRepository.kt",
          source: String.raw`class WalkRepository(
    private val api: PawWalkApi,
    private val dao: WalkDao,
) {
    val walks: Flow<List<WalkEntity>> = dao.observeAll()

    suspend fun refresh() {
        try {
            val response = api.fetchWalks()
            val entities = response.map {
                WalkEntity(
                    id = it.id,
                    walkerName = it.walkerName,
                    startedAtMs = it.startedAtMs,
                    distanceMeters = it.distanceMeters,
                )
            }
            dao.upsertAll(entities)
        } catch (e: IOException) {
            // no network — dao.observeAll() still serves whatever's already on disk
        }
    }
}`,
          caption: "`walks` is a straight pass-through of the DAO's live query — the repository adds no polling, no caching layer of its own, because the table already is the cache. `refresh()` is the only place a network call or a DTO ever appears.",
        },
        {
          type: "exercise",
          title: "Write refresh()",
          prompt: [
            "Fill in `refresh()` on `WalkRepository`, which has `api: PawWalkApi` and `dao: WalkDao`:",
            "1. Fetch: `val response = api.fetchWalks()`.\n2. Map each item to a `WalkEntity` (id, walkerName, startedAtMs, distanceMeters) and upsert the list with `dao.upsertAll(entities)`.\n3. Wrap the body in `try { ... } catch (e: IOException) { }` with a one-line comment explaining the empty catch — offline reads still work because the DB already has data.",
          ],
          starter: String.raw`class WalkRepository(
    private val api: PawWalkApi,
    private val dao: WalkDao,
) {
    val walks: Flow<List<WalkEntity>> = dao.observeAll()

    suspend fun refresh() {
        // your code here
    }
}`,
          solution: String.raw`class WalkRepository(
    private val api: PawWalkApi,
    private val dao: WalkDao,
) {
    val walks: Flow<List<WalkEntity>> = dao.observeAll()

    suspend fun refresh() {
        try {
            val response = api.fetchWalks()
            val entities = response.map {
                WalkEntity(
                    id = it.id,
                    walkerName = it.walkerName,
                    startedAtMs = it.startedAtMs,
                    distanceMeters = it.distanceMeters,
                )
            }
            dao.upsertAll(entities)
        } catch (e: IOException) {
            // no network — dao.observeAll() still serves whatever's already on disk
        }
    }
}`,
          checks: [
            { re: /try\{/, hint: "Wrap the fetch-map-upsert sequence in a `try { ... }` block." },
            { re: /val response=api\.fetchWalks\(\)/, hint: "Fetch first: `val response = api.fetchWalks()`." },
            { re: /dao\.upsertAll\(entities\)/, hint: "Write the mapped list with `dao.upsertAll(entities)`." },
            { re: /catch\(e:IOException\)\{/, hint: "Catch `IOException` specifically — that's the network-down case." },
          ],
          mustNot: [
            { re: /catch\(e:Exception\)/, hint: "Catch `IOException`, not the broad `Exception` — you want network failures handled, not every possible bug silently swallowed." },
          ],
          success: "That's the full network-to-DB-to-UI loop: fetch, map, upsert, and a catch that keeps stale data on screen instead of an error.",
        },
        {
          type: "quiz",
          q: "The user's phone has no signal and taps refresh. `api.fetchWalks()` throws an `IOException`, caught and swallowed. What does the walks screen show?",
          choices: [
            "A blank screen with a loading spinner that never stops",
            "A crash",
            "Whatever walks were already in the Room database from the last successful refresh — stale, but there",
            "An empty list, since the fetch failed",
          ],
          answer: 2,
          explain: "The UI was never collecting the network response directly — it collects dao.observeAll(), and refresh() failing doesn't touch that table. The last successful upsertAll() is still sitting on disk, so the screen shows yesterday's walks instead of nothing.",
          nudge: "The UI collects the DAO's Flow, not the result of refresh() itself. If refresh() never reaches dao.upsertAll(), does the table change at all?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "sync-with-workmanager",
      title: "Sync with WorkManager",
      steps: [
        {
          type: "text",
          md: [
            "## Queued writes have to survive process death",
            "`refresh()` covers pulling data down. The other direction — a walk log the walker recorded while offline, still waiting to reach the server — is riskier: if that pending write only lives in memory (a coroutine, a `viewModelScope.launch`), the OS can kill the process before it ever sends, and the write is gone. **WorkManager** persists queued work to disk, so it survives process death, a reboot, even the app being force-closed — it resumes the work next time constraints are met.",
            "**`Constraints(NetworkType.CONNECTED)`** tells WorkManager not to even attempt the work until the device has a network connection — no point burning a retry against a phone in airplane mode. **`BackoffPolicy.EXPONENTIAL`** controls what happens between retries after a failure: each retry waits roughly double the previous delay, so a flaky connection doesn't hammer the server (or the battery) with retries every few seconds.",
          ],
        },
        {
          type: "text",
          md: [
            "## Result.success() vs Result.retry()",
            "A `CoroutineWorker`'s `doWork()` returns one of three `Result`s. `Result.success()` means done, remove from the queue. `Result.failure()` means give up, don't retry. `Result.retry()` means \"try again later\" — WorkManager reschedules the work using the backoff policy you configured.",
            "That retry matters because WorkManager's delivery guarantee is **at-least-once**, not exactly-once: a worker can run, succeed on the server, and then get re-run anyway (the app died before recording success, a retry raced a success). The fix isn't to fight WorkManager — it's to make the worker **idempotent**: upserting the same walk twice with the same ID should leave the database in exactly the state one upsert would. Sound familiar? That's the same `@Upsert` from lesson 2, doing double duty as your idempotency guarantee.",
          ],
        },
        {
          type: "code",
          title: "sync/SyncWalksWorker.kt",
          source: String.raw`class SyncWalksWorker(
    context: Context,
    params: WorkerParameters,
) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        return try {
            repository.refresh()
            Result.success()
        } catch (e: IOException) {
            Result.retry()
        }
    }
}

fun enqueueSyncWalks(workManager: WorkManager) {
    val request = OneTimeWorkRequestBuilder<SyncWalksWorker>()
        .setConstraints(
            Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()
        )
        .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 10, TimeUnit.SECONDS)
        .build()
    workManager.enqueue(request)
}`,
          caption: "`doWork()` reuses the same `repository.refresh()` from lesson 3 — an `IOException` here doesn't get silently swallowed like it does inside `refresh()`, it becomes `Result.retry()` so WorkManager schedules another attempt once the network constraint is met again.",
        },
        {
          type: "exercise",
          title: "Build the sync work request",
          prompt: [
            "Build a `OneTimeWorkRequestBuilder<SyncWalksWorker>()` in 6 lines or fewer:",
            "1. `.setConstraints(...)` with a `Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()`.\n2. `.setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 10, TimeUnit.SECONDS)`.\n3. `.build()` at the end.",
          ],
          starter: String.raw`fun enqueueSyncWalks(workManager: WorkManager) {
    val request = OneTimeWorkRequestBuilder<SyncWalksWorker>()
        // your code here
    workManager.enqueue(request)
}`,
          solution: String.raw`fun enqueueSyncWalks(workManager: WorkManager) {
    val request = OneTimeWorkRequestBuilder<SyncWalksWorker>()
        .setConstraints(
            Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()
        )
        .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 10, TimeUnit.SECONDS)
        .build()
    workManager.enqueue(request)
}`,
          checks: [
            { re: /\.setRequiredNetworkType\(NetworkType\.CONNECTED\)/, hint: "Require a connection: `.setRequiredNetworkType(NetworkType.CONNECTED)` inside the `Constraints.Builder()`." },
            { re: /\.setConstraints\(/, hint: "Attach the constraints with `.setConstraints(...)` on the request builder." },
            { re: /\.setBackoffCriteria\(BackoffPolicy\.EXPONENTIAL,10,TimeUnit\.SECONDS\)\.build\(\)/, hint: "Finish the chain with `.build()` right after `.setBackoffCriteria(...)`." },
          ],
          mustNot: [
            { re: /BackoffPolicy\.LINEAR/, hint: "Use `BackoffPolicy.EXPONENTIAL` — linear backoff retries too aggressively against a connection that's genuinely down." },
          ],
          success: "That's a real sync work request: network-gated, exponentially backed off, and durable across process death.",
        },
        {
          type: "quiz",
          q: "Why reach for WorkManager here instead of just launching a plain coroutine (`viewModelScope.launch { repository.refresh() }`) to send the pending walk?",
          choices: [
            "WorkManager is faster than a coroutine",
            "A plain coroutine is tied to the ViewModel's lifetime — if the process dies (backgrounded and killed, or the user force-closes the app) before it finishes, the pending write is lost; WorkManager persists the request and resumes it once constraints are met, even after process death",
            "Coroutines can't make network calls",
            "WorkManager runs the work instantly, coroutines are delayed",
            "There's no real difference, it's just a style preference",
          ],
          answer: 1,
          explain: "The whole reason this lesson exists: a viewModelScope coroutine dies with its ViewModel, and the ViewModel dies with the process. WorkManager's requests are written to disk, so a killed process, a reboot, or a force-close doesn't lose the pending sync — it just runs later, once the network constraint is satisfied.",
          nudge: "What happens to a viewModelScope.launch coroutine if Android kills the app's process to reclaim memory mid-request? What happens to a WorkManager request in the same situation?",
        },
      ],
    },
  ],
});
