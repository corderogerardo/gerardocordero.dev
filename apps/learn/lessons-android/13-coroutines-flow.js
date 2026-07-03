// Module 13 — Coroutines & Flow in Anger (Android track). See ../lessons/FORMAT.md and
// ./FORMAT-KOTLIN.md for the schema and Kotlin-specific traps.
window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "coroutines-flow-android",
  title: "Coroutines & Flow in Anger",
  emoji: "🌊",
  lang: "kotlin",
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    {
      id: "structured-concurrency",
      title: "Structured concurrency & scopes",
      steps: [
        {
          type: "text",
          md: [
            "## Every coroutine has a parent",
            "Module 3 taught you `viewModelScope.launch { ... }` as a fire-and-forget way to start a coroutine. It isn't really fire-and-forget — every coroutine you `launch` becomes a **child** of the scope that started it, and `viewModelScope` is itself backed by a `Job` that lives exactly as long as the `ViewModel` does. When the `ViewModel` is cleared, its `Job` is cancelled, and every coroutine hanging off it — direct child or grandchild — is cancelled too. That's **structured concurrency**: no coroutine can outlive the scope that owns it.",
            "That parent-child relationship is a real tree, and it matters most when something goes wrong. Launch two children under the *same* parent `Job` and let one of them throw — by default, the exception propagates up to the parent, the parent cancels, and **every sibling gets cancelled with it**. One bad walker photo download shouldn't be able to kill an unrelated booking refresh, so knowing when that blast radius is too wide is the whole point of this lesson.",
          ],
        },
        {
          type: "code",
          title: "One failure takes both down",
          source: String.raw`fun loadDashboard() = viewModelScope.launch {
    launch { walkers = repo.fetchWalkers() }       // throws: 500 from the server
    launch { bookings = repo.fetchBookings() }      // never gets to finish
}`,
          caption: "Both inner `launch` calls are children of the same `viewModelScope.launch` coroutine — which makes them siblings of each other too. The moment the walkers fetch throws, its parent Job cancels, and that cancellation propagates to the bookings child, whether or not the bookings fetch has already completed.",
        },
        {
          type: "quiz",
          q: "In the snippet above, `repo.fetchWalkers()` throws inside the first `launch`. What happens to the second `launch { bookings = ... }`?",
          choices: [
            "Nothing — the two `launch` blocks are fully independent",
            "It keeps running to completion, but its result is discarded",
            "It gets cancelled too — the exception propagates to their shared parent Job, which cancels every child, including siblings that hadn't failed",
            "It retries automatically",
          ],
          answer: 2,
          explain: "Plain `launch` blocks under the same parent share that parent's fate. One child's unhandled exception cancels the parent Job, and a cancelled parent cancels all of its children — siblings included, even ones still mid-flight.",
          nudge: "Structured concurrency means a coroutine can't outlive its parent. If a sibling's failure cancels the parent, what happens to every other child hanging off that same parent?",
        },
        {
          type: "text",
          md: [
            "## supervisorScope: when siblings should be independent",
            "Sometimes that blast radius is exactly wrong — the walkers list and the bookings list are unrelated fetches that happen to run at the same time; one failing shouldn't blank out the other. **`supervisorScope`** changes the failure rule for direct children launched inside it: a child's exception is reported (so you can still catch and handle it), but it does **not** cancel its siblings.",
            "The catch has to move *inside* each child, though — `supervisorScope` stops a failure from spreading sideways, but an uncaught exception inside one child still fails that child. Wrap each `launch` body in its own `try/catch` (or store a `Result`) if you want the dashboard to show partial data instead of crashing.",
          ],
        },
        {
          type: "code",
          title: "Independent siblings with supervisorScope",
          source: String.raw`fun loadDashboard() = viewModelScope.launch {
    supervisorScope {
        launch {
            walkers = try { repo.fetchWalkers() } catch (e: Exception) { emptyList() }
        }
        launch {
            bookings = try { repo.fetchBookings() } catch (e: Exception) { emptyList() }
        }
    }
}`,
          caption: "Same two fetches, but launched inside `supervisorScope { ... }` instead of directly under `viewModelScope.launch`. Now a failed walkers fetch can't cancel the bookings child — each `launch` also catches its own exception so a failure resolves to an empty list instead of propagating at all.",
        },
        {
          type: "exercise",
          title: "Swap in supervisorScope",
          prompt: [
            "Rewrite `refreshBoth()` so a failure in `loadReviews()` can't cancel `loadPhotos()`, and vice versa.",
            "1. Wrap the two `launch` calls in `supervisorScope { ... }`.\n2. Keep both `launch { ... }` calls exactly as they are, just nested one level deeper inside the new block.",
          ],
          starter: String.raw`fun refreshBoth() = viewModelScope.launch {
    // your code here: wrap these two in supervisorScope
    launch { reviews = repo.loadReviews() }
    launch { photos = repo.loadPhotos() }
}`,
          solution: String.raw`fun refreshBoth() = viewModelScope.launch {
    supervisorScope {
        launch { reviews = repo.loadReviews() }
        launch { photos = repo.loadPhotos() }
    }
}`,
          checks: [
            { re: /supervisorScope\{/, hint: "Wrap the body in `supervisorScope { ... }` — that's what changes the sibling-cancellation rule." },
            { re: /launch\{reviews=repo\.loadReviews\(\)\}/, hint: "Keep `launch { reviews = repo.loadReviews() } ` unchanged, just nested inside `supervisorScope`." },
            { re: /launch\{photos=repo\.loadPhotos\(\)\}/, hint: "Keep `launch { photos = repo.loadPhotos() }` unchanged too, as the second child inside `supervisorScope`." },
          ],
          mustNot: [
            { re: /coroutineScope\{/, hint: "`coroutineScope` keeps the fail-together behavior — you want `supervisorScope`, which isolates sibling failures." },
          ],
          success: "That's the fix: two fetches that used to take each other down on failure now fail independently.",
        },
        {
          type: "quiz",
          q: "You wrap two `launch` calls in `supervisorScope`, but forget to add a `try/catch` inside either one. `loadReviews()` throws. What actually happens?",
          choices: [
            "Nothing — supervisorScope silently swallows all child exceptions",
            "`loadPhotos()`'s coroutine is still cancelled, because supervisorScope doesn't help without a catch",
            "The reviews coroutine fails (its exception surfaces, e.g. crashing or logging depending on your CoroutineExceptionHandler), but the photos coroutine is unaffected and keeps running",
            "Both coroutines fail together, identical to plain coroutineScope",
          ],
          answer: 2,
          explain: "supervisorScope only changes whether a child's failure cancels its *siblings* — it doesn't make the failure disappear. Without a catch, the failing child still fails (and that exception still needs handling, e.g. via a CoroutineExceptionHandler), but the other child is left alone to finish normally.",
          nudge: "supervisorScope's job is stopping cancellation from spreading sideways — it was never about hiding the exception from the coroutine that actually threw it.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "stateflow-sharedflow-statein",
      title: "StateFlow, SharedFlow & stateIn",
      steps: [
        {
          type: "text",
          md: [
            "## Cold flows re-run for every collector",
            "A plain `Flow` (Module 7's `repo.fetchWalkers()` world, but imagine it returning a `Flow<List<Walker>>` instead of a one-shot `List<Walker>`) is **cold**: nothing happens until something collects it, and the whole producer block runs again, from scratch, for *each* new collector. Two screens collecting the same repository `Flow` means two separate network calls, two separate DB queries — whatever the producer does, it does it twice.",
            "That's rarely what a `ViewModel` wants to expose. `StateFlow` is different: it's **hot** and **stateful** — it always holds exactly one current value (`.value`), new collectors get that value immediately instead of triggering a fresh run, and every collector shares the *same* underlying work. It's the same private-`MutableStateFlow`-public-`StateFlow` shape you've used since Module 6, just now built from an upstream `Flow` instead of assigned to directly.",
          ],
        },
        {
          type: "code",
          title: "data/WalkerRepository.kt — the cold Flow",
          source: String.raw`class WalkerRepository(private val api: PawWalkApi) {
    fun walkers(): Flow<List<Walker>> = flow {
        while (true) {
            emit(api.fetchWalkers())
            delay(30_000)
        }
    }
}`,
          caption: "A polling Flow: every collector that starts collecting kicks off its own `while (true)` loop and its own network calls every 30 seconds, completely independent of any other collector. Fine as a building block, wasteful as something a screen collects directly.",
        },
        {
          type: "text",
          md: [
            "## stateIn: turning cold into hot, once",
            "`stateIn` converts that cold `Flow` into a `StateFlow` that's shared across every collector, computed just once no matter how many screens observe it. It takes three things: the `CoroutineScope` that owns the sharing (almost always `viewModelScope`), a `SharingStarted` policy that decides *when* the upstream producer runs, and an `initialValue` to hand out before the first real emission arrives.",
            "`SharingStarted.WhileSubscribed(5000)` is the policy you'll reach for by default: keep the upstream flow running while there's at least one active collector, and — this is the important part — **keep it running for another 5000 milliseconds after the last collector disappears** before actually cancelling it. That grace window is what survives a configuration change (a screen rotation briefly has zero collectors while the old Compose tree tears down and the new one hasn't subscribed yet) without needlessly killing and restarting the upstream polling loop — and without leaking it forever if the screen really is gone for good.",
          ],
        },
        {
          type: "code",
          title: "ui/screens/WalkersViewModel.kt — stateIn",
          source: String.raw`class WalkersViewModel(private val repo: WalkerRepository) : ViewModel() {
    val walkers: StateFlow<List<Walker>> = repo.walkers()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList(),
        )
}`,
          caption: "One `stateIn` call, three named arguments. `walkers` is now a `StateFlow` any number of composables can `collectAsState()` (Module 5) without triggering their own separate polling loop — they all share the one upstream subscription scoped to `viewModelScope`.",
        },
        {
          type: "quiz",
          q: "Why `SharingStarted.WhileSubscribed(5000)` instead of `SharingStarted.Eagerly` (start immediately, never stop until the scope itself is cancelled)?",
          choices: [
            "WhileSubscribed(5000) is always faster to compute",
            "Eagerly is deprecated and no longer available",
            "Eagerly keeps the upstream flow (and its polling, network calls, or open connections) running for the ViewModel's entire lifetime even when no screen is observing it; WhileSubscribed(5000) stops the work shortly after the last collector goes away, while still surviving brief gaps like a configuration change",
            "WhileSubscribed(5000) caches the result for exactly 5000 items",
          ],
          answer: 2,
          explain: "Eagerly trades correctness of \"is anyone even watching\" for simplicity — the upstream flow runs the whole time the ViewModel exists, burning battery and data on a screen the user isn't looking at. WhileSubscribed(5000) only pays that cost while a collector is actually present, with a 5-second buffer so a rotation's brief collector gap doesn't restart the whole polling loop.",
          nudge: "Think about what 'Eagerly' commits to running for, versus what a rotated screen's old and new composables look like a few hundred milliseconds apart.",
        },
        {
          type: "exercise",
          title: "Expose the walkers StateFlow",
          prompt: [
            "`WalkersViewModel` has `private val repo: WalkerRepository`. Write the `walkers` property: expose `repo.walkers()` as a `StateFlow<List<Walker>>` scoped to `viewModelScope`, using the config-change-safe `WhileSubscribed(5000)` policy and an empty list as the initial value.",
          ],
          starter: String.raw`class WalkersViewModel(private val repo: WalkerRepository) : ViewModel() {
    // your code here: val walkers: StateFlow<List<Walker>> = ...
}`,
          solution: String.raw`class WalkersViewModel(private val repo: WalkerRepository) : ViewModel() {
    val walkers: StateFlow<List<Walker>> = repo.walkers()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList(),
        )
}`,
          checks: [
            { re: /val walkers:StateFlow<List<Walker>>=repo\.walkers\(\)/, hint: "Declare `val walkers: StateFlow<List<Walker>> = repo.walkers()` as the start of the chain." },
            { re: /scope=viewModelScope/, hint: "Pass `scope = viewModelScope` — sharing should be tied to this view model's lifetime." },
            { re: /started=SharingStarted\.WhileSubscribed\(5000\)/, hint: "Pass `started = SharingStarted.WhileSubscribed(5000)` for the config-change-safe policy." },
            { re: /initialValue=emptyList\(\)/, hint: "Pass `initialValue = emptyList()` so collectors have something to render before the first real emission." },
          ],
          mustNot: [
            { re: /SharingStarted\.Eagerly/, hint: "Eagerly keeps the upstream flow running for the whole ViewModel lifetime, even with no collectors — use WhileSubscribed(5000) instead." },
          ],
          success: "That's the exact stateIn call that turns a polling repository Flow into one shared StateFlow every screen can collect for free.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "callbackflow-sockets",
      title: "callbackFlow: taming the socket",
      steps: [
        {
          type: "text",
          md: [
            "## Bridging a callback API into a Flow",
            "Module 11's `LiveViewModel` opened an OkHttp `WebSocket` and handled incoming frames with a `WebSocketListener` — a classic callback API: you override `onMessage`, `onFailure`, and the OS calls them whenever something happens. That's a fine shape for a one-off side effect, but if you want the rest of your code to treat those frames as just another `Flow` — filterable, mappable, collectible with `collectAsState()` — you need a bridge. **`callbackFlow`** is that bridge: a flow builder purpose-built for wrapping callback-based APIs.",
            "Inside a `callbackFlow { ... }` block you get a `ProducerScope` — call `trySend(value)` from any callback to push a value downstream, non-suspending, safe to call from someone else's callback thread. Buffering is automatic: `trySend` doesn't block, so a burst of fixes arriving faster than the collector processes them queues up (using the channel's default buffer) instead of getting silently dropped or blocking the network thread.",
          ],
        },
        {
          type: "code",
          title: "ui/screens/LiveViewModel.kt — the socket as a Flow",
          source: String.raw`fun trackFixes(bookingId: String, token: String): Flow<Fix> = callbackFlow {
    val url = "${"$"}wsBase/ws/track/${"$"}bookingId?token=${"$"}token"
    val request = Request.Builder().url(url).build()
    val socket = OkHttpClient().newWebSocket(request, object : WebSocketListener() {
        override fun onMessage(webSocket: WebSocket, text: String) {
            parseFix(text)?.let { trySend(it) }
        }
        override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
            close(t)
        }
    })
    awaitClose { socket.close(1000, null) }
}`,
          caption: "onMessage parses each incoming frame and pushes it downstream with trySend — the same fixes that used to flow straight into a mutable state now flow through anything collecting this Flow. onFailure calls close(t) to end the flow with an error instead of hanging forever. awaitClose is what makes the whole thing safe.",
        },
        {
          type: "quiz",
          q: "What is `awaitClose { socket.close(1000, null) }` actually doing at the end of the `callbackFlow` block?",
          choices: [
            "It's optional cleanup — the flow works fine without it",
            "It suspends until the flow's collector cancels or the channel closes, and only then runs the cleanup lambda — this is mandatory, since without it the block would return immediately and tear the channel down before any callback ever fires",
            "It closes the socket immediately when callbackFlow starts",
            "It's a timeout — the flow auto-closes after `close` milliseconds",
          ],
          answer: 1,
          explain: "A callbackFlow block is just a suspend function body — if it returns (falls off the end) right after registering the WebSocketListener, the flow completes immediately and the socket callbacks are firing into a channel nobody's listening to anymore. awaitClose suspends the block open until the collector goes away, keeping the socket alive for the flow's whole lifetime, and its lambda is exactly where you release the underlying resource.",
          nudge: "Without something suspending at the bottom of the block, what would the callbackFlow body do right after `newWebSocket(...)` returns?",
        },
        {
          type: "exercise",
          title: "Finish the callbackFlow skeleton",
          prompt: [
            "`openSocket` builds `socket` above the marker. Finish `trackFixes`:",
            "1. Inside `onMessage`, forward every parsed fix downstream: `parseFix(text)?.let { trySend(it) }`.\n2. After the `WebSocketListener` block, call `awaitClose { socket.close(1000, null) }` so the socket is released when the collector goes away.",
          ],
          starter: String.raw`fun trackFixes(bookingId: String, token: String): Flow<Fix> = callbackFlow {
    val socket = openSocket(bookingId, token, listener = object : WebSocketListener() {
        override fun onMessage(webSocket: WebSocket, text: String) {
            // your code here: forward the parsed fix
        }
    })
    // your code here: awaitClose
}`,
          solution: String.raw`fun trackFixes(bookingId: String, token: String): Flow<Fix> = callbackFlow {
    val socket = openSocket(bookingId, token, listener = object : WebSocketListener() {
        override fun onMessage(webSocket: WebSocket, text: String) {
            parseFix(text)?.let { trySend(it) }
        }
    })
    awaitClose { socket.close(1000, null) }
}`,
          checks: [
            { re: /parseFix\(text\)\?\.let\{trySend\(it\)\}/, hint: "Forward each parsed fix with `parseFix(text)?.let { trySend(it) }` — the safe call skips frames that don't parse." },
            { re: /awaitClose\{socket\.close\(1000,null\)\}/, hint: "Close out the block with `awaitClose { socket.close(1000, null) }` — this is mandatory, not optional cleanup." },
          ],
          mustNot: [
            { re: /channel\.close\(\)\}$/, hint: "Clean up the socket itself in awaitClose, not the channel — the channel is managed by callbackFlow for you." },
          ],
          success: "That's the real bridge: every WebSocket frame now flows through a Flow, and the socket always gets closed when collection stops.",
        },
        {
          type: "quiz",
          q: "Suppose you write a `callbackFlow` for the socket but forget `awaitClose` entirely — the block just ends right after `newWebSocket(...)`. What actually breaks?",
          choices: [
            "Nothing — Kotlin adds an implicit awaitClose automatically",
            "The flow completes immediately (before any message ever arrives), and — since nothing closes it — the underlying WebSocket and its callback keep running in the background with no collector left to receive anything, a resource leak",
            "It throws a compile error — callbackFlow requires awaitClose to build",
            "It works identically, just with worse performance",
          ],
          answer: 1,
          explain: "Missing awaitClose is a runtime leak, not a compile error: the callbackFlow block finishes right after registering the listener, the flow reports \"done\" to its collector, but the WebSocketListener itself was never told to stop — it keeps receiving frames and calling trySend into a channel that's already closed, and the socket itself never gets shut down.",
          nudge: "callbackFlow's block is a normal function body. If nothing in it suspends past 'register the callback', when does the block return?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "testing-runtest-turbine",
      title: "Testing with runTest & Turbine",
      steps: [
        {
          type: "text",
          md: [
            "## Virtual time: runTest",
            "Coroutine code is full of `delay(30_000)` and 5-second `WhileSubscribed` windows — real ones would make every test glacial. `runTest` (from `kotlinx-coroutines-test`) runs suspending test bodies on a **virtual clock**: a `delay` inside code launched from `runTest` advances that virtual clock instantly instead of actually pausing the test thread, so a test exercising a 30-second polling loop finishes in milliseconds.",
            "`runTest { ... }` replaces the `runBlocking { ... }` you might reach for by instinct — same job (give a suspend-capable body to run), but with the virtual-time scheduler wired in, and it also surfaces uncaught exceptions from any coroutine launched inside it as a test failure, instead of them silently vanishing.",
          ],
        },
        {
          type: "text",
          md: [
            "## Turbine: asserting on a Flow's emissions in order",
            "A `StateFlow` like `LiveViewModel.state` never completes on its own, which makes it awkward to assert against with plain `collect { ... }` — you'd need to manually cancel after N items. **Turbine** is a small testing library built for exactly this: `flow.test { ... }` gives you a block where `awaitItem()` suspends until the next emission arrives and returns it, so you can assert on a Flow's emissions one at a time, in order, the same way you'd read log lines.",
            "The block also auto-cancels the collection when it ends, so you never need a manual `.take(n)` or timeout just to stop a `StateFlow` test from hanging forever.",
          ],
        },
        {
          type: "code",
          title: "test/LiveViewModelTest.kt — CONNECTING to TRACKING",
          source: String.raw`@Test
fun stateMovesFromConnectingToTracking() = runTest {
    val viewModel = LiveViewModel(fakeApp, fakeSocketFactory)

    viewModel.state.test {
        assertEquals(Phase.CONNECTING, awaitItem().phase)

        viewModel.connect("booking-1")
        fakeSocketFactory.emitFix(lat = 37.77, lng = -122.41)

        assertEquals(Phase.TRACKING, awaitItem().phase)
    }
}`,
          caption: "Every collected `State` shows up as one `awaitItem()` call, in emission order. The test reads like a script: start CONNECTING, trigger a fix, expect TRACKING — with `runTest` making any delays inside `connect` or the socket setup resolve instantly.",
        },
        {
          type: "quiz",
          q: "Why does `viewModel.state.test { ... }` need Turbine at all — what's wrong with `viewModel.state.collect { state -> ... }` directly in the test?",
          choices: [
            "collect doesn't work with StateFlow, only regular Flow",
            "collect is deprecated",
            "StateFlow never completes on its own, so a bare `collect` suspends forever — the test would hang. Turbine's `test { }` block gives you `awaitItem()` to pull emissions one at a time and auto-cancels the collection when the block ends",
            "collect can only be called once per test file",
          ],
          answer: 2,
          explain: "A StateFlow is a hot, infinite stream — collect never returns on its own. Without Turbine you'd need to manually launch the collection in a separate coroutine, capture N values, then cancel it yourself. `test { }` packages that pattern: awaitItem() pulls one emission at a time and the block's end handles cancellation for you.",
          nudge: "If a Flow never completes, what does a plain `collect { ... }` call do to the coroutine that calls it?",
        },
        {
          type: "exercise",
          title: "Assert the first two phases",
          prompt: [
            "Inside `runTest`, write a Turbine block on `viewModel.state` that asserts, in order:",
            "1. The first emission's `phase` is `Phase.CONNECTING` — via `assertEquals(Phase.CONNECTING, awaitItem().phase)`.\n2. Call `viewModel.connect(\"booking-1\")`.\n3. The next emission's `phase` is `Phase.TRACKING` — via `assertEquals(Phase.TRACKING, awaitItem().phase)`.",
          ],
          starter: String.raw`@Test
fun connectMovesThePhaseForward() = runTest {
    // your code here
}`,
          solution: String.raw`@Test
fun connectMovesThePhaseForward() = runTest {
    viewModel.state.test {
        assertEquals(Phase.CONNECTING, awaitItem().phase)
        viewModel.connect("booking-1")
        assertEquals(Phase.TRACKING, awaitItem().phase)
    }
}`,
          checks: [
            { re: /viewModel\.state\.test\{/, hint: "Open a Turbine block on the state flow: `viewModel.state.test { ... }`." },
            { re: /assertEquals\(Phase\.CONNECTING,awaitItem\(\)\.phase\)/, hint: "First assertion: `assertEquals(Phase.CONNECTING, awaitItem().phase)`." },
            { re: /assertEquals\(Phase\.TRACKING,awaitItem\(\)\.phase\)/, hint: "Second assertion, after calling connect: `assertEquals(Phase.TRACKING, awaitItem().phase)`." },
          ],
          mustNot: [
            { re: /\.collect\{/, hint: "Use Turbine's `.test { }` block, not a raw `.collect { }` — a bare collect on a StateFlow never returns." },
          ],
          success: "That's a real Turbine assertion sequence — the exact shape you'd use to pin down LiveViewModel's phase transitions.",
        },
        {
          type: "quiz",
          q: "You add a third `awaitItem()` call at the end of the test above, but the view model only ever emits two states during the test body. What happens?",
          choices: [
            "awaitItem() returns null",
            "The test hangs until Turbine's default timeout is hit, then fails — awaitItem() suspends waiting for an emission that never comes",
            "It silently returns the last item again",
            "Turbine skips the assertion automatically",
          ],
          answer: 1,
          explain: "awaitItem() suspends until the next emission — if none is coming, there's nothing to return immediately. Turbine enforces a timeout so the test fails loudly instead of hanging the whole suite forever, but it's still a real wait, which is why asserting only on the emissions you actually expect matters.",
          nudge: "awaitItem doesn't poll or peek — it suspends for the *next* item. What if there isn't one?",
        },
      ],
    },
  ],
});
