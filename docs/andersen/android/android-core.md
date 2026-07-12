# Android Core

### Context — What It Is and the Two Flavors
**They ask:** "What is `Context`, and what's the difference between Application context and Activity context?"

`Context` is the interface to the Android system — it's how a component reaches resources, launches other components, inflates layouts, and accesses system services. The reason it's worth grilling candidates on is that picking the wrong flavor is a classic leak and crash source, not a style preference.

Application context lives as long as the process and has no UI theme or window attached — use it for anything that must outlive a screen (a singleton, a repository, a background worker). Activity context is tied to that Activity's lifecycle and carries its theme — required for anything visually themed (inflating a themed dialog, starting an Activity with a transition).

```kotlin
class MyRepository(private val appContext: Context) {   // pass applicationContext here, never `this` from an Activity
    fun cacheDir() = appContext.cacheDir
}
```

**Say it:** "I use Application context for anything that outlives the screen — it has no theme and can't leak an Activity — and Activity context for anything that needs the visual theme, like inflating a dialog."
**Red flag:** Holding an Activity context in a singleton or a static field. The Activity can never be garbage collected while that reference is alive — a textbook memory leak that survives configuration changes.

### dp, sp, and px — Density-Independent Sizing
**They ask:** "What are `dp`, `sp`, and `px`, and why does Android need two of the three?"

`px` is a raw pixel — the same `100px` button looks tiny on a high-density screen and huge on a low-density one, because pixel density varies wildly across devices. `dp` (density-independent pixel) scales with the screen's density so the same `dp` value renders at roughly the same physical size everywhere — Android converts it to pixels at runtime using the device's density factor. `sp` is `dp` plus the user's font-scale accessibility setting layered on top, which is why text sizes use `sp` and everything else uses `dp` — a user who bumped their system font size expects text (and only text) to grow.

**Say it:** "`dp` gives consistent physical sizing across densities, and `sp` adds the user's accessibility font scale on top — which is exactly why layout dimensions use `dp` but text sizes use `sp`."
**Red flag:** Using `sp` for a fixed-size icon or spacing value. That ties non-text layout to the user's font-scale setting, which breaks the layout for anyone who's bumped their system text size up.

### The res Folder and Resource Qualifier Resolution
**They ask:** "What is the `res` folder for, and how does Android decide which qualified variant to apply?"

`res` holds everything that isn't code but varies by device or configuration — layouts, strings, drawables, dimensions — split into subfolders like `values`, `drawable`, `layout`, `mipmap`. Qualifiers (`values-es`, `drawable-night`, `layout-land`, `values-w600dp`) let you ship variants for language, theme, orientation, or screen size, and the system picks the best match at runtime rather than you branching in code.

The resolution order matters when multiple qualifiers could apply: Android matches the *most specific applicable* combination, following a fixed precedence (MCC/MNC, locale, layout direction, screen size, orientation, density, and so on, in that order) — a `values-en-rUS-w600dp` beats a plain `values-w600dp` when both match, because locale outranks screen width in the precedence chain.

**Say it:** "Resource qualifiers let the system pick the right variant for locale, night mode, or screen size at resolution time — precedence is fixed (locale before screen size before density, for example), so I don't need runtime branching for most config-driven UI differences."
**Red flag:** Branching in code (`if (isNightMode) loadDarkDrawable()`) for something a `-night` resource qualifier already handles declaratively. That's reinventing what the resource system is designed to do for free.

### The Manifest File and Merging
**They ask:** "What does the Manifest consist of, and how do conflicts get resolved when multiple manifests merge?"

`AndroidManifest.xml` declares the app's components (activities, services, receivers, providers), permissions, hardware/feature requirements, and the target/min SDK — it's the contract the OS reads before it will run anything in your app. In a real project there's more than one manifest: your app module, every library dependency, and build-variant-specific manifests all get merged into one final manifest at build time.

Merging follows explicit rules, not "last one wins": each attribute can be marked with merge tools like `tools:node="replace"` or `tools:node="remove"` to override what a library manifest declares, and by default the app module's manifest wins over library manifests for the same element. Gradle's manifest merger reports genuine conflicts (two libraries declaring incompatible `minSdkVersion`, say) as a build error rather than silently picking one.

**Say it:** "The final manifest is a merge of the app module and every dependency's manifest, with the app module winning by default — `tools:node` attributes are how I explicitly override a library's declaration when the defaults don't do what I need."
**Red flag:** Not knowing manifest merging exists at all, and being surprised when a library silently adds a permission or an exported component to the final APK.

### Activity Lifecycle Methods
**They ask:** "Walk me through the Activity lifecycle methods and their order."

The lifecycle exists to answer one question at each transition: is this UI visible, focused, both, or neither — and the callbacks are where you allocate or release resources to match. Full sequence on first launch: `onCreate` → `onStart` → `onResume` (now visible and interactive). Pressing home: `onPause` → `onStop` (still exists, not visible). Returning: `onRestart` → `onStart` → `onResume`. Finishing normally, or a config change: `onPause` → `onStop` → `onDestroy`. That `onDestroy` isn't guaranteed, though — if the system kills the process to reclaim memory while stopped, it skips straight past every remaining callback, `onDestroy` included. That's why `onSaveInstanceState`/`ViewModel` state, not `onDestroy`, is where you protect against data loss — you can't rely on cleanup code there ever running.

The two easiest to mix up: `onPause` fires the moment the Activity loses foreground focus (even if partially visible, like a dialog appearing over it) — do only fast work here, since the next screen is waiting on it to return. `onStop` fires once it's fully hidden — heavier cleanup belongs here instead.

```kotlin
override fun onPause() { super.onPause(); player.pause() }         // fast, may still be partially visible
override fun onStop() { super.onStop(); locationUpdates.stop() }   // fully hidden, safe for heavier work
```

**Say it:** "`onPause` is for fast work because it blocks the next screen from becoming interactive, `onStop` is for heavier cleanup once you're fully hidden — mixing those up is the classic cause of janky transitions."
**Red flag:** Doing a blocking database write or network call inside `onPause`. It delays the incoming Activity/Fragment from becoming interactive, which the user feels as lag on every screen transition.

### Fragment Lifecycle
**They ask:** "Walk me through a Fragment's lifecycle."

A Fragment layers its own view lifecycle on top of its host Activity's lifecycle, and that's the source of most Fragment bugs: the Fragment *instance* can outlive its *view*. Order: `onAttach` → `onCreate` → `onCreateView` (inflate the layout) → `onViewCreated` → `onStart` → `onResume` → … → `onPause` → `onStop` → `onDestroyView` (view torn down, Fragment instance still alive) → `onDestroy` → `onDetach`.

`onDestroyView` is the one Activity has no equivalent for — the Fragment can be kept in the back stack with its view destroyed but the instance retained, ready to recreate the view later without recreating the Fragment.

```kotlin
private var _binding: FragmentHomeBinding? = null
private val binding get() = _binding!!

override fun onDestroyView() {
    super.onDestroyView()
    _binding = null   // release the view binding — the Fragment instance survives, the view doesn't
}
```

**Say it:** "A Fragment's view can be destroyed and recreated independently of the Fragment instance itself — `onDestroyView` is where I null out view bindings, because holding onto the old view past that point is a leak."
**Red flag:** Holding a strong reference to a view binding without clearing it in `onDestroyView` — one of the most common Fragment memory leaks in real Android codebases.

### Adding Fragments: Static vs Dynamic, add vs replace
**They ask:** "How do you add fragments — static and dynamic — and what's the difference between `add` and `replace`?"

Static means declaring a `<fragment>` tag directly in an XML layout — simple, but fixed for the lifetime of that layout; you can't swap it at runtime. Dynamic means using a `FragmentContainerView` as a placeholder and adding/replacing fragments into it via `FragmentManager` at runtime — the standard approach for any screen that needs to swap content.

```kotlin
supportFragmentManager.commit {
    replace(R.id.container, DetailFragment())   // destroys any fragment currently in the container
    addToBackStack(null)
}
```

`add` stacks a new fragment on top of whatever's already in the container — the old one isn't destroyed, just potentially hidden underneath. `replace` is effectively `remove` the existing fragment(s) in that container plus `add` the new one — it destroys the previous fragment's view. Most single-container navigation uses `replace`; `add` is for genuinely overlaying content (like a dialog-style fragment) on top of what's there.

**Say it:** "`replace` tears down whatever's in the container first, `add` stacks on top of it without touching what's already there — single-pane navigation almost always wants `replace`."
**Red flag:** Using `add` repeatedly for normal screen-to-screen navigation. Every previous fragment's view stays alive underneath, silently piling up memory and overlapping touch targets.

### startActivityForResult and the Activity Result API
**They ask:** "What's the essence of `startActivityForResult`, and how does the modern Activity Result API replace it, including for Fragments?"

The old API (`startActivityForResult` + overriding `onActivityResult`) worked by request codes — an integer you chose and matched by hand in a growing `if/else` or `when` in `onActivityResult`, shared across every caller in that Activity. It's fragile: colliding request codes, no type safety on the returned data, and results delivered to a method with no idea which call site originated the request.

The Activity Result API replaces request codes with a typed `ActivityResultContract` and a callback registered up front, resolved automatically to the call site that launched it — no manual code matching, and it works identically for Fragments via `registerForActivityResult` on the Fragment itself.

```kotlin
private val pickImage = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
    uri?.let { handleImage(it) }
}
// later: pickImage.launch("image/*")
```

**Say it:** "The Activity Result API replaces hand-matched request codes with a typed contract and a callback tied directly to the call site — it removes an entire class of request-code collision bugs, and Fragments get the same API without any Activity-side wiring."
**Red flag:** Still reaching for `startActivityForResult` in new code. It's deprecated for a reason — request-code collisions across a growing Activity are a real, recurring bug class.

### Task and Back Stack, Launch Modes and Flags
**They ask:** "What are Task and back stack, and how do launch modes like `singleTop` and `clearTop` change the behavior?"

A Task is a stack of Activities the user navigates through as one coherent unit (what you see when you long-press the recents/overview button) — the back stack is that stack's ordering, and pressing back pops the top Activity off it. Launch mode controls what happens when you start an Activity that might already be on the stack, instead of always pushing a fresh instance.

`standard` (default): always creates a new instance, even if one already exists on top. `singleTop`: reuses the existing instance via `onNewIntent` if it's already at the *top* of the stack — otherwise behaves like `standard`. `singleTask`: at most one instance in the whole Task; launching it clears everything above it in that Task. `clearTop` (a launch *flag*, not a mode) removes every Activity above the target instance in the stack so it becomes the top again, reusing it via `onNewIntent`.

```kotlin
val intent = Intent(this, HomeActivity::class.java).apply {
    flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK
}
```

**Say it:** "Launch mode decides whether starting an Activity that might already exist creates a new instance or reuses one — `singleTop` reuses only if it's already on top, `singleTask` caps it at one instance for the whole Task, and `clearTop` clears the stack down to that instance."
**Red flag:** Using `singleTask` on a regular content screen to "fix" a back-stack bug without understanding it collapses everything above it — it's meant for entry points like a home screen, not general navigation.

### Application vs Activity Context, and Two Activity Contexts
**They ask:** "What's the difference between Application context and Activity context, and how do two Activity contexts differ from each other?"

Application context is a single instance shared across the whole process, with no theme, tied to the process's lifetime — safe to hold long-term. Activity context is one instance per Activity, carries that Activity's theme, and is only valid while that Activity is alive.

Two different Activity contexts differ mainly in theme and in which window they belong to — `ActivityA`'s context can't be used to inflate a themed dialog meant for `ActivityB`'s window, and starting a new Activity from one versus the other affects things like transition animations tied to the originating window. The practical rule: default to Application context unless you specifically need the theme or window association, and never let an Activity context outlive its Activity.

**Say it:** "Two Activity contexts are different instances with different themes and windows — they're not interchangeable — which is exactly why the default choice, absent a UI-theming need, is Application context."
**Red flag:** Passing an arbitrary Activity's context into a utility that inflates themed views for a *different* screen. The theme mismatch shows up as subtly wrong styling that's hard to trace back to the context source.

### Fragment Transactions: commit, commitAllowingStateLoss, and FragmentFactory
**They ask:** "Is `commit` synchronous or asynchronous, what's `commitAllowingStateLoss` for, and what's `FragmentFactory`?"

`commit` is asynchronous — it schedules the transaction on the main thread's message queue rather than executing immediately, which is why reading `findFragmentById` right after `commit()` can return the *previous* fragment. `commitNow` forces synchronous execution when you genuinely need the result immediately.

`commit` throws `IllegalStateException` if called after the Activity's state has already been saved (`onSaveInstanceState` has run) — because a transaction committed after that point can silently vanish on process recreation, losing user-visible state. `commitAllowingStateLoss` suppresses that exception and accepts the data loss risk — it's an escape hatch for cases where losing that particular transaction is genuinely acceptable, not a routine fix for the exception.

`FragmentFactory` solves a different problem: instantiating fragments with constructor arguments. The system normally recreates fragments via a no-arg constructor using reflection; `FragmentFactory` lets you inject dependencies (a repository, a ViewModel factory) into a fragment's actual constructor instead of relying on a bundle-based `newInstance()` convention.

**Say it:** "`commit` is async and throws if it runs after state's already saved — `commitAllowingStateLoss` is the deliberate escape hatch for when losing that transaction is fine, not a blanket fix — and `FragmentFactory` is how I get constructor-injected dependencies into a fragment instead of a no-arg-constructor-plus-bundle pattern."
**Red flag:** Reaching for `commitAllowingStateLoss` reflexively whenever the `IllegalStateException` shows up. That's silencing a real signal that the transaction is racing the Activity's saved-state boundary — it deserves a fix, not a suppression.

### What Happens on Screen Rotation
**They ask:** "What actually happens when I rotate the screen?"

By default, a configuration change like rotation destroys and recreates the Activity (and its fragments) from scratch — `onDestroy` then a fresh `onCreate`. The reasoning: many resources are configuration-dependent (layout, drawables, string pluralization for locale), so the framework's default answer is "reload everything as if the app just launched into this new configuration," rather than trying to patch the running UI in place.

That's precisely why any state living only in the Activity/Fragment instance — a plain field, not persisted anywhere — is gone after rotation unless you explicitly save and restore it, or hold it somewhere that survives (a `ViewModel`, `onSaveInstanceState`).

**Say it:** "Rotation is a full destroy-and-recreate by default because so many resources are configuration-dependent — which is exactly why any state that isn't in a ViewModel or `onSaveInstanceState` is gone the moment the screen rotates."
**Red flag:** Being surprised that a plain instance variable reset to its default after rotation. That's the expected, documented behavior — the fix is `ViewModel` or saved state, not surprise.

### Saving and Restoring UI State
**They ask:** "How do you save data across a configuration change without a full reload?"

Three layers, for three different survival guarantees. `onSaveInstanceState(Bundle)` persists small, transient UI state (scroll position, a form field the user was mid-typing) into a `Bundle` that survives both configuration changes *and* process death, restored via `onCreate`'s bundle or `onRestoreInstanceState` — but it's serialized, so it's meant for small primitives, not large objects. `ViewModel` survives configuration changes automatically (it's retained across the Activity recreation) but is cleared when the Activity finishes for good or the process dies — the right home for in-memory state like a loaded list. `SavedStateHandle` inside a `ViewModel` combines both: it survives configuration changes *and* process death, backed by the same `Bundle` mechanism, without you manually wiring `onSaveInstanceState`.

```kotlin
class MyViewModel(private val savedState: SavedStateHandle) : ViewModel() {
    var query: String
        get() = savedState["query"] ?: ""
        set(value) { savedState["query"] = value }
}
```

**Say it:** "`ViewModel` alone survives rotation but not process death, `onSaveInstanceState` survives both but only for small serializable data — `SavedStateHandle` gets me both guarantees without hand-wiring the bundle myself."
**Red flag:** Putting a large object (a bitmap, a big list) into `onSaveInstanceState`'s bundle. It's transported through Binder with a size limit — that's a `TransactionTooLargeException` waiting to happen.

### Why Not to Handle Configuration Changes Yourself
**They ask:** "Why is it not recommended to handle configuration changes yourself?"

`android:configChanges` in the manifest tells the system "don't recreate this Activity for these config changes, just call `onConfigurationChanged` and let me handle it" — it looks like a shortcut around the recreate-and-reload cost, but it makes *you* responsible for correctly reloading every configuration-dependent resource (locale strings, orientation-specific layouts, density-specific drawables) by hand, for every config change you opted out of, forever.

The framework's default recreate-from-scratch approach is what guarantees correctness across every resource type automatically; opting out trades that guarantee for a performance shortcut that's easy to get subtly wrong — and it doesn't even help with the process-death case, which `configChanges` has no effect on at all.

**Say it:** "`android:configChanges` shifts the responsibility of reloading every configuration-dependent resource onto me, for every future config change — the default recreate path is what guarantees correctness for free, and `configChanges` doesn't even help with process death."
**Red flag:** Reaching for `configChanges="orientation|screenSize"` as the first fix for "rotation is slow." The actual fix in almost every real case is moving expensive work into a `ViewModel` so it doesn't repeat on recreation — not opting out of recreation.

### Process Death vs Configuration Change
**They ask:** "What happens when a user returns to a system-killed app? Is the Activity stack restored?"

Process death is different from a configuration change: the OS can kill your entire process while it's in the background under memory pressure, well after `onStop`. When the user navigates back, Android *does* restore the Activity back stack — it recreates each Activity in the stack and feeds each one the `Bundle` it last saved via `onSaveInstanceState`, so from the user's perspective the app looks like it never left, as long as your state was actually captured in that bundle.

This is exactly why `ViewModel` alone isn't a complete state-survival story: it's wiped on process death because the whole process (and everything in memory) is gone. Anything that needs to survive process death has to go through `onSaveInstanceState`/`SavedStateHandle`, or persistent storage.

**Say it:** "The back stack does get restored after process death, Activity by Activity, using whatever each one saved in `onSaveInstanceState` — which is why `ViewModel`-only state silently vanishes on process death even though it survives rotation."
**Red flag:** Testing state restoration only by rotating the device. Rotation never triggers process death, so it can hide bugs that only show up when the OS actually kills the background process — test with "Don't keep activities" in developer options for the real signal.

### Service, IntentService, and Why AsyncTask Was Removed
**They ask:** "What is a Service, and what execution thread does it run on? Why was AsyncTask deprecated?"

A `Service` is a component for work with no UI — but the critical, commonly-missed fact is that a plain `Service` runs on the **main thread** by default, exactly like an Activity. It gives you a lifecycle and a way to keep work alive independent of any screen, not automatic background threading — you still have to move real work off the main thread yourself (a coroutine, a background thread).

`IntentService` (deprecated) existed to fix that: it queued incoming intents and processed them one at a time on a dedicated worker thread automatically, stopping itself when the queue was empty — convenient, but strictly sequential, which was often the wrong shape for concurrent work.

`AsyncTask` (removed in API 30) was deprecated because its lifecycle wasn't tied to any component's lifecycle — a task kept running (and could leak the Activity that started it) after the Activity was destroyed, and its threading model (a shared thread pool with confusing serial-vs-parallel `execute` variants across API levels) caused subtle, hard-to-reproduce bugs. Coroutines and `WorkManager` replaced both patterns with lifecycle-aware, cancellable alternatives.

**Say it:** "A plain `Service` doesn't give you a background thread for free — it runs on the main thread just like an Activity — and `AsyncTask` was removed because its lifecycle wasn't tied to the component that started it, which is a classic leak and crash source that coroutines fix by being scope-bound."
**Red flag:** Assuming `Service` automatically means "runs off the main thread." Doing blocking work in a plain `Service.onStartCommand` without dispatching to a background thread will ANR just like doing it in an Activity.

### WorkManager — Constraints, Periodicity, and What It Uses Under the Hood
**They ask:** "What's WorkManager for, how do you set constraints on a task, how often can it run, and what does it use internally on different Android versions?"

WorkManager is for **deferrable, guaranteed** background work — work that should run even if the app closes or the device reboots, but doesn't need to run *immediately* (syncing analytics, uploading a queued file). It's not for work that needs to start the instant it's requested — that's what a foreground service or a direct coroutine is for.

Constraints describe when the work is *allowed* to run — network connectivity, charging state, battery level, storage availability — and WorkManager waits until they're satisfied before executing, retrying automatically per your backoff policy on failure.

```kotlin
val request = PeriodicWorkRequestBuilder<SyncWorker>(15, TimeUnit.MINUTES)
    .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
    .build()
WorkManager.getInstance(context).enqueue(request)
```

Periodic work has a **15-minute minimum interval** — the system won't run it more frequently than that, by design, to protect battery. Under the hood, WorkManager doesn't reinvent scheduling: it delegates to `JobScheduler` on API 23+, `Firebase JobDispatcher` as a fallback on older versions without Google Play Services (largely obsolete now), or `AlarmManager` + a `BroadcastReceiver` as the last-resort fallback — WorkManager is a unified API over whichever mechanism is actually available.

**Say it:** "WorkManager is for deferrable, guaranteed work with constraints, not urgent work — periodic tasks have a 15-minute floor by design — and under the hood it picks `JobScheduler` or falls back through `AlarmManager`, so I get one API regardless of OS version."
**Red flag:** Reaching for WorkManager for something that needs to start immediately and visibly, like an active file upload with a progress notification. That's a foreground service's job — WorkManager can *trigger* one, but WorkManager itself isn't built for immediacy.

### Handler, Looper, and HandlerThread
**They ask:** "How do Handler and Looper work, and what is HandlerThread?"

Every thread that wants to process a queue of messages/tasks needs a `Looper` — an infinite loop that pulls from a `MessageQueue` and dispatches each item. The main thread already has one (`Looper.getMainLooper()`), which is *why* posting to it works out of the box — `Handler(Looper.getMainLooper()).post { updateUi() }` queues work to run on the main thread from anywhere.

A background thread has no `Looper` by default — `Thread { ... }` alone can't receive posted messages. `HandlerThread` is a `Thread` subclass that sets up and starts a `Looper` for you, so you get a background thread you can repeatedly post work to via a `Handler`, instead of spinning up a new thread per task.

```kotlin
val handlerThread = HandlerThread("worker").apply { start() }
val handler = Handler(handlerThread.looper)
handler.post { /* runs sequentially on the worker thread */ }
```

**Say it:** "`Looper` is the message loop a thread needs to receive posted work, the main thread has one automatically, and `HandlerThread` is how I give a background thread that same capability instead of firing off unmanaged one-off threads."
**Red flag:** Trying to post to a `Handler` built on a plain `Thread` with no `Looper` prepared. It throws immediately — `Looper.prepare()` (or `HandlerThread`) has to run first.

### Foreground Services and Service Start Types
**They ask:** "How do you start a Service in Android 8+ (Oreo), what is a foreground service, and what do the `START_STICKY`/`START_NOT_STICKY`/`START_REDELIVER_INTENT` flags mean?"

Android 8 introduced background execution limits: apps in the background can't freely start regular background services anymore — you use `startForegroundService()`, and the service must call `startForeground()` with a persistent notification within a few seconds or the system kills it. That trade — a visible, user-facing notification — is the price for guaranteed continued execution while the app isn't in the foreground; it's how music playback and active location tracking stay alive legitimately.

The return value of `onStartCommand` tells the system what to do if it kills the service under memory pressure: `START_STICKY` restarts the service with a null intent (fine when you don't need the original command re-delivered — a music player that can just resume). `START_NOT_STICKY` doesn't restart it at all (fine for one-shot work that's safe to just drop). `START_REDELIVER_INTENT` restarts it *and* redelivers the last intent — for work where losing the original request data would be wrong, like a file download that needs the URL again.

```kotlin
override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    startForeground(NOTIFICATION_ID, buildNotification())
    return START_REDELIVER_INTENT
}
```

**Say it:** "Since Oreo, background-started services need `startForeground()` with a notification within seconds or the system kills them — and the start-type flag tells the system what to do on a kill: drop it, restart with no data, or restart with the original intent redelivered."
**Red flag:** Calling `startForegroundService()` and never calling `startForeground()` inside the service in time. That throws `ForegroundServiceDidNotStartInTimeException` and crashes the app — a real, commonly-hit bug in Oreo+ background work.

### Passing Data Between a Service and the UI
**They ask:** "What are the ways to transfer data from a Service to the UI, and how do `startService` and `bindService` differ?"

`startService`/`startForegroundService` launches a Service with no ongoing connection back to the caller — it's fire-and-forget from the caller's perspective, so getting data back requires a separate channel: a `LocalBroadcastManager`-style broadcast (deprecated in favor of other event buses now), a `Messenger` for cross-process message passing, `AIDL` for a full cross-process interface, or, for same-process work, exposing a `Flow`/`LiveData` from a shared singleton the UI also observes.

`bindService` is different: it establishes a live connection and returns an `IBinder` the caller can use to call methods on the Service directly (via a custom `Binder` subclass, for same-process work) — that's the natural fit when the UI needs to actively query or control the Service, not just receive occasional updates.

```kotlin
inner class LocalBinder : Binder() { fun getService(): MyService = this@MyService }
override fun onBind(intent: Intent) = LocalBinder()
```

**Say it:** "`startService` is fire-and-forget, so getting data back needs its own channel — broadcast, Messenger, AIDL, or a shared observable — while `bindService` gives me a live `IBinder` connection when the UI needs to actively call into the Service, not just listen."
**Red flag:** Reaching for AIDL for a same-process Service-to-UI connection. AIDL exists for cross-process (or cross-app) communication — a same-process `Binder` subclass is simpler and does the job with none of the marshalling overhead.

### RecyclerView and ViewHolder
**They ask:** "How is RecyclerView better than the old ListView, and why does ViewHolder matter for memory?"

`ListView` recycled views but left view-lookup (`findViewById`) up to you on every bind, which meant either repeated lookups (slow) or a manually-implemented view holder pattern that was easy to skip. `RecyclerView` makes recycling and the view holder pattern mandatory and built-in — you can't bypass it — plus it decouples layout from the list itself via a pluggable `LayoutManager` (linear, grid, staggered grid), which `ListView` never supported.

`ViewHolder` caches the result of `findViewById` once per view, at creation time — `onBindViewHolder` reuses that cached reference on every subsequent bind instead of re-walking the view tree, which is the actual memory/performance win: fewer object allocations and no repeated tree traversal as the user scrolls.

```kotlin
class ItemViewHolder(view: View) : RecyclerView.ViewHolder(view) {
    val title: TextView = view.findViewById(R.id.title)   // looked up once
}
override fun onBindViewHolder(holder: ItemViewHolder, position: Int) {
    holder.title.text = items[position].title              // reused, no lookup
}
```

**Say it:** "ViewHolder caches `findViewById` results once instead of on every bind, and RecyclerView makes that pattern mandatory plus adds a pluggable LayoutManager — that's the real gap between it and ListView, not just 'it's newer.'"
**Red flag:** Calling `findViewById` inside `onBindViewHolder` instead of the ViewHolder's constructor. That reintroduces the exact per-bind lookup cost ViewHolder exists to eliminate.

### ConstraintLayout Essentials
**They ask:** "What's the core idea of ConstraintLayout, and what are baseline, guideline, and chain for?"

ConstraintLayout's whole premise is flattening view hierarchies: instead of nesting `LinearLayout`s inside `RelativeLayout`s to achieve a complex screen (each nested layout costs a real measure/layout pass), you position every view relative to siblings, the parent, or invisible helper lines within a single flat layout — fewer layout passes, shallower hierarchy, generally better performance on complex screens.

A **guideline** is an invisible line (fixed position or percentage) you can constrain views to, useful for consistent margins without repeating a magic number everywhere. **Baseline** constraints align text baselines across views of different sizes/fonts, which margin-based alignment can't do correctly. A **chain** links a group of views together so they distribute space as a unit (`spread`, `spread_inside`, `packed`, `weighted`) — the ConstraintLayout equivalent of a `LinearLayout`'s `weight`, but without the nesting cost.

**Say it:** "ConstraintLayout's real win is flattening deep nested layouts into one pass — guidelines give me consistent invisible anchor lines, baseline constraints align text properly across different font sizes, and chains distribute space across a group the way `weight` does in LinearLayout, without the extra nesting."
**Red flag:** Nesting ConstraintLayouts inside each other the same way you'd nest LinearLayouts. That throws away the entire flat-hierarchy performance argument for using it.

### View Lifecycle, invalidate vs requestLayout, and Custom View Drawing
**They ask:** "What is a View's lifecycle, what's the difference between `invalidate()` and `requestLayout()`, and what shouldn't you do in `onDraw`?"

A View goes through construction → attached to window → measure → layout → draw, and can cycle back through measure/layout/draw repeatedly as things change. `invalidate()` schedules a **redraw only** — use it when the View's appearance changed but its size/position didn't (a color or a progress value). `requestLayout()` schedules a full **measure + layout + draw** pass — use it when the View's size or position might have changed (new text that changes width). Calling the wrong one either wastes a full layout pass on a pure visual change, or fails to reflect a size change because you only asked for a redraw.

`onDraw` is called potentially many times per second during animation or scrolling — the hard rule is **never allocate objects inside it**. A `new Paint()` or `new Rect()` per frame creates constant garbage-collection pressure, which is exactly the kind of thing that causes visible jank. Allocate `Paint`/`Rect`/`Path` objects once, as fields, and only mutate them inside `onDraw`.

```kotlin
private val paint = Paint().apply { color = Color.RED }   // allocated once
override fun onDraw(canvas: Canvas) {
    canvas.drawCircle(cx, cy, radius, paint)   // reused every frame, no allocation
}
```

**Say it:** "`invalidate` triggers a redraw only, `requestLayout` triggers a full measure-layout-draw pass — and the one hard rule for `onDraw` is zero allocations, because it can run dozens of times a second and every allocation there is GC pressure you'll feel as jank."
**Red flag:** Creating a `new Paint()` inside `onDraw()`. It's one of the most common, most avoidable causes of scroll/animation jank in custom views.

### Measure, Layout, Draw Pass and MeasureSpec
**They ask:** "Walk through the measure/layout/draw passes for different layouts, and what are the types of MeasureSpec?"

Every View traversal is three passes. **Measure**: each View determines its desired width/height, bottom-up — a parent tells each child its constraints via `MeasureSpec`, the child measures itself (and its own children, if it's a ViewGroup) within those constraints. **Layout**: each parent positions its children within the space granted, top-down. **Draw**: the actual pixels get painted, also top-down, respecting z-order.

`MeasureSpec` packs a size and a mode into one int, and the mode is the part that actually drives layout logic: `EXACTLY` (the parent has dictated an exact size — `match_parent` or a fixed dp value), `AT_MOST` (the child can be up to this size — `wrap_content` inside a bounded parent), `UNSPECIFIED` (no constraint at all — rare, mostly inside `ScrollView`s or custom measurement). A custom `ViewGroup` overriding `onMeasure` has to honor these modes correctly, or children misbehave inside certain parents (classically: a `wrap_content` custom view that ignores `AT_MOST` and just returns its intrinsic size, overflowing its bounds).

**Say it:** "Measure determines desired size bottom-up via MeasureSpec, layout positions children top-down, draw paints top-down — and the MeasureSpec mode, not just the size, is what a custom `onMeasure` has to respect or `wrap_content` breaks inside certain parents."
**Red flag:** Writing a custom `onMeasure` that ignores the `MeasureSpec` mode entirely and always returns a fixed intrinsic size. It'll look fine in isolation and then overflow or clip the moment it's placed inside a constrained parent.

### Jetpack Compose — Why It Exists
**They ask:** "What was Jetpack Compose created for?"

The View system is imperative: you mutate a mutable View tree by hand (`textView.text = newValue`) and it's on you to keep every UI element in sync with the underlying state as it changes — which scales badly, since the surface area of "things that could be out of sync" grows with every added View. Compose is declarative: you describe the UI as a function of state, and the framework diffs and recomposes only the parts that depend on state that actually changed — closer to how React or SwiftUI approach the same problem, and it's Google's answer to the same maintainability pain that pushed other platforms toward declarative UI.

```kotlin
@Composable
fun Counter() {
    var count by remember { mutableStateOf(0) }
    Button(onClick = { count++ }) { Text("Clicked $count times") }
}
```

Practically, it also collapses the layout-XML-plus-Kotlin-controller split into one Kotlin file, removes `findViewById`/ViewBinding entirely, and interops with the existing View system (`ComposeView`, `AndroidView`) so migration can be incremental rather than a rewrite.

**Say it:** "Compose exists because the View system requires manually keeping mutable views in sync with state — Compose flips that to declarative: describe the UI as a function of state, and recomposition handles staying in sync, closer to React's model than to imperative View mutation."
**Red flag:** Describing Compose as "just a new way to write XML layouts." The actual shift is imperative-to-declarative state management, not a syntax swap — missing that is missing the point of why it exists.

### Broadcast Receivers — Local vs Global, Registration Lifecycle, and Manifest Restrictions
**They ask:** "What's the difference between local and global broadcasts, in which lifecycle methods do you register/unregister a receiver, and why are many system broadcasts restricted from manifest declaration?"

A global broadcast goes through the system (`sendBroadcast`) and any app with a matching registered receiver can see it — useful for reacting to system events (connectivity change, battery low) but expensive and a potential privacy/security surface for app-internal events. `LocalBroadcastManager` (now deprecated in favor of things like a shared `Flow`/`SharedFlow` or an event bus) restricted delivery to receivers within your own process — faster and private, since it never left the app.

Registration has two paths: manifest-declared (`<receiver>` in `AndroidManifest.xml`) works even if the app isn't running, for broadcasts that must always be caught, but starting in Android 8 most **implicit** system broadcasts (like connectivity change) were **removed from manifest-declared reach entirely** — the reasoning was battery: every app registering for every system broadcast meant apps waking up constantly in the background for events most of them didn't act on. Runtime-registered receivers (`registerReceiver`/`unregisterReceiver`, typically paired in `onStart`/`onStop` or `onResume`/`onPause`) only receive broadcasts while that registration is active — call `registerReceiver` without a matching `unregisterReceiver` and you leak the receiver (and often the Activity/Fragment holding it).

**Say it:** "Local broadcasts stay in-process and are cheaper and private, global ones go through the system — and since Oreo most implicit system broadcasts were stripped out of manifest-declared receivers specifically to stop apps waking up in the background for events they don't need, which is a battery-life fix, not an arbitrary restriction."
**Red flag:** Registering a receiver in `onStart` and forgetting the matching `unregisterReceiver` in `onStop`. That's both a leak and, for repeated register calls without unregistering, a receiver that fires multiple times per broadcast.

### Content Providers — When You Actually Need One
**They ask:** "What are Content Providers for, and when is writing a custom one actually mandatory?"

A `ContentProvider` exposes structured data behind a URI-based interface (`content://...`) with a permission model layered on top — its entire reason to exist is **cross-app data sharing** (contacts, media store, calendar) under Android's sandboxing, since apps can't otherwise reach into each other's private storage.

If your data never leaves your own app, a `ContentProvider` is the wrong tool — Room/SQLite directly, or a repository over local storage, is simpler and has none of the URI/permission ceremony. Writing a custom `ContentProvider` becomes mandatory in a narrow set of cases: sharing structured data with other apps you don't control, integrating with Android components that specifically expect the `ContentProvider` interface (like a `SyncAdapter`, or exposing a searchable dictionary to the system search), or exposing data through a `DocumentsProvider` for the system file picker.

`ContentResolver` is the client-side counterpart — the caller never talks to a `ContentProvider` directly, always through `context.contentResolver.query(uri, ...)`, which is what lets the provider live in a completely different app/process transparently.

**Say it:** "A ContentProvider exists specifically for cross-app data sharing under Android's sandboxing — if the data never leaves my app, Room or plain local storage is the right tool, and `ContentResolver` is always the client-side entry point regardless of which process actually owns the data."
**Red flag:** Building a custom `ContentProvider` purely as an internal data-access layer within a single app. That's real, unnecessary overhead (URI matching, permission declarations) for a problem Room already solves more simply.

### ANR — What Causes It and How to Avoid It
**They ask:** "What is an ANR, and how do you fight it?"

ANR (Application Not Responding) fires when the main thread is blocked past a system-defined threshold — roughly 5 seconds for input dispatch, shorter for a `BroadcastReceiver`'s `onReceive`, and it also fires for Service execution timeouts. The system watches the main thread's ability to process input events and forcibly kills or offers to kill the app when it can't.

The cause is always the same shape: blocking work on the main thread — a synchronous network call, a large synchronous DB query, a heavy computation, or a deadlock/long-held lock on the main thread. The fix is equally consistent: never do I/O or heavy computation synchronously on the main thread — dispatch it via coroutines (`Dispatchers.IO`/`Default`), `WorkManager` for deferrable work, or a background thread, and keep `BroadcastReceiver.onReceive` implementations trivially fast (dispatch real work elsewhere, like a coroutine or `WorkManager`, rather than doing it inline).

**Say it:** "An ANR is the system detecting the main thread can't process input within its timeout — it's always caused by blocking work on the main thread, so the fix is always the same: move I/O and heavy computation off it, with coroutines or WorkManager."
**Red flag:** Treating ANRs as random or device-specific flakiness instead of tracing them to a specific blocking call on the main thread. StrictMode and the ANR trace (`traceview`/`am_anr` in logs) point directly at the offending call — there's no such thing as an unexplainable ANR.

### APK/App Bundle, ProGuard/R8, and Signing
**They ask:** "What's an APK, what's an App Bundle, and what does ProGuard/R8 do — why do you need to retest thoroughly after enabling it?"

An APK is the actual installable package — compiled code (DEX), resources, assets, and the manifest, zipped and signed. An **App Bundle** (`.aab`) is a *publishing* format, not installable directly — it's uploaded to Play Console, and Play delivers device-specific APKs generated from it (only the resources/native libs/language files that device actually needs), which is why bundles produce meaningfully smaller downloads than a universal APK.

R8 (the modern successor to ProGuard, doing the same job with better optimization) does three things at build time: **shrinking** (removes unused code and resources), **obfuscation** (renames classes/methods/fields to short meaningless names, making reverse-engineering harder), and **optimization** (inlining, dead-code elimination at the bytecode level). The reason it demands a full retest pass: shrinking can remove code it *thinks* is unused but is actually reached only via reflection (common with libraries like Gson, Retrofit interfaces, or anything reflection-based) — without an explicit `keep` rule, that class or method silently disappears from the release build and crashes only in release, never in debug.

**Say it:** "R8 shrinks, obfuscates, and optimizes at build time — the reason release builds need real retesting isn't paranoia, it's that shrinking can strip code only reachable via reflection unless a keep rule protects it, and that failure mode never shows up in a debug build."
**Red flag:** Shipping a first release with R8 enabled and no manual QA pass on the release build specifically. Reflection-based crashes from over-aggressive shrinking are a real, common release-only failure mode.

### Doze Mode, App Standby, and Background Restrictions
**They ask:** "How does Doze Mode work, and what does it affect? What is App Standby for?"

Doze Mode kicks in when the device has been stationary, unplugged, and screen-off for a while — the system periodically suspends network access, ignores wakelocks, and defers jobs/alarms/syncs for all apps, waking briefly for short maintenance windows to let queued work flush. It exists purely for battery: without it, background apps would keep the radio and CPU active indefinitely while the device sits idle in a pocket.

App Standby is the per-app counterpart: apps the user hasn't interacted with recently get their network access and background jobs restricted independently, on a rolling per-app basis, regardless of overall device Doze state. Together they're why `AlarmManager`'s exact alarms, plain `Service` background starts, and unconstrained network calls became unreliable in the background over time — and precisely why WorkManager (which respects and works around Doze/Standby via `JobScheduler`) became the recommended abstraction instead of hand-rolling scheduling.

**Say it:** "Doze suspends network and defers jobs system-wide when the device is idle, App Standby does the same per-app based on recent usage — both exist purely for battery, and they're the real reason ad-hoc background scheduling stopped being reliable, which is what pushed WorkManager to the front as the recommended tool."
**Red flag:** Debugging "my background sync stopped working" without considering Doze/Standby as a cause. On a real device, that's often exactly what's happening — and it's testable directly via `adb shell dumpsys deviceidle force-idle`.

### ART vs Dalvik, and JIT vs AOT
**They ask:** "What's the difference between ART and Dalvik, and between JIT and AOT compilation?"

Dalvik (pre-Lollipop) was the original Android runtime — it JIT-compiled (Just-In-Time) app bytecode to native code *at runtime*, on every launch, trading slower startup and more runtime CPU overhead for a simpler, faster build/install step. ART (Android RunTime) replaced it starting with Lollipop and originally leaned the opposite way: AOT (Ahead-Of-Time) compilation happened once, at install time, turning bytecode into native code up front — faster subsequent app launches and execution, at the cost of slower installs and more storage for the compiled artifact.

Modern ART is actually hybrid: it profiles which code paths run hot and JIT-compiles those at runtime for fast iteration, then uses background AOT compilation (typically while the device is idle and charging) to bake the profiled hot paths into native code for future launches — combining AOT's steady-state performance with JIT's adaptability, instead of committing fully to either extreme.

**Say it:** "Dalvik JIT-compiled on every run; ART started as pure AOT at install time and evolved into a hybrid — JIT for fast iteration on hot paths, background AOT to bake those paths in permanently — getting AOT's runtime performance without JIT's startup-every-time cost."
**Red flag:** Describing ART as "just AOT" without mentioning the hybrid JIT-plus-background-AOT model current versions actually use — that's the more senior, currently-accurate answer.

### Process Priorities and the Zygote
**They ask:** "What are process priorities in Android, and what is Zygote?"

Android ranks running processes by importance to decide what to kill first under memory pressure: foreground/active (visible, interacting) at the top, visible-but-not-focused next, background service, then cached/empty processes at the bottom — the ones killed first, with essentially zero user-visible cost since nothing was showing anyway. This is *why* a backgrounded app can be silently killed and later relaunched fresh — it's not a bug, it's the system reclaiming memory from the lowest-priority processes first.

**Zygote** is the process every app process forks from — it's a pre-warmed process with the core Android framework classes and common libraries already loaded and JIT-warmed, sitting ready at boot. Forking a new app process from Zygote (copy-on-write) is dramatically faster than starting a fresh process and loading the entire framework from scratch — it's the mechanism that makes app launch feel near-instant despite the framework being enormous.

**Say it:** "Process priority is why background apps get silently killed under memory pressure — lowest-importance processes go first, with no visible cost — and Zygote is the pre-warmed template process every app forks from, which is what makes launching a new app fast despite loading the entire framework."
**Red flag:** Treating a backgrounded app being killed as an app bug to "fix" by preventing it. The system reclaiming a cached process is expected behavior — the actual fix is making sure state survives that kill via saved state, not fighting the OS to stay alive.

### Gradle Essentials: buildType vs productFlavor, implementation vs api
**They ask:** "What's the difference between `buildType` and `productFlavor`, and between the `implementation` and `api` dependency configurations?"

`buildType` (`debug`, `release`, …) controls *how* the app is built — debuggability, signing, minification — orthogonal to *what* the app is. `productFlavor` (`free`, `paid`, `staging`, `production`, …) controls *what* gets built — different feature sets, API endpoints, branding — and Gradle combines every flavor with every build type into a build variant (`freeDebug`, `paidRelease`, …) automatically.

`implementation` vs `api` is about dependency leakage across modules: a dependency declared `implementation` in module A is compiled into A but hidden from anything that depends on A — a module depending on A can't see it transitively. `api` exposes it transitively, so a downstream module gets that dependency's classes on its own compile classpath too. `implementation` is the default choice almost everywhere, because `api` widens the compile-time surface area and slows incremental builds across a multi-module project — a change to an `api` dependency forces recompilation of every downstream module, where `implementation` contains that blast radius to the module itself.

```groovy
dependencies {
    implementation("com.squareup.retrofit2:retrofit:2.11.0")   // hidden from downstream modules
    api(project(":core-models"))                                // downstream modules see this too
}
```

**Say it:** "`buildType` controls how it's built, `productFlavor` controls what's built, and they multiply into variants — `implementation` hides a dependency from downstream modules while `api` leaks it transitively, which is why `implementation` is the default in any multi-module project that cares about build time."
**Red flag:** Defaulting every dependency to `api` "to be safe." That widens the transitive compile classpath for every consuming module and directly slows incremental builds across the project — it should be a deliberate exception, not the default.

### The R Class — Generated Resource IDs
**They ask:** "What is `R`?"

`R` is a class the build system generates automatically — it's not something you write. Every resource under `res/` (a layout, a string, a drawable, an ID) gets a matching integer constant in `R`, organized into nested classes by type: `R.layout.activity_main`, `R.string.app_name`, `R.id.submit_button`. That's what lets code reference resources by a compile-time-checked name instead of a hand-typed string or magic number — a typo in `R.string.wlecome` fails the build, where a typo in a raw string key would just silently fail to find the resource at runtime.

```kotlin
setContentView(R.layout.activity_main)
val name = getString(R.string.app_name)
```

Because `R` is regenerated from the actual `res/` contents on every build, renaming or deleting a resource shows up immediately as a compile error everywhere it's referenced — that traceability is the entire reason resources go through `R` instead of raw strings.

**Say it:** "`R` is generated from `res/` at build time, so every resource reference is compile-time checked — rename or delete a resource and every reference to it fails the build instead of silently breaking at runtime."
**Red flag:** Hardcoding a resource's raw string path or numeric ID instead of referencing `R`. That throws away the entire compile-time safety net `R` exists to provide.

### What Is an Intent — Explicit vs Implicit, and Passing Data
**They ask:** "What is an `Intent`, what's the difference between explicit and implicit, and how do you pass data with one?"

An `Intent` is a messaging object — it's how one component asks the system to start another component, or broadcasts that something happened, without the caller needing a direct reference to the target. That decoupling is the whole point: your Activity doesn't need to know `DetailActivity`'s implementation, just its name (or, for implicit intents, not even that).

An **explicit** intent names the exact component class to start — used for navigation within your own app, where you know precisely what you're launching. An **implicit** intent describes an action to perform (`ACTION_VIEW`, `ACTION_SEND`) plus data, and lets the system resolve which installed app (yours or someone else's) can handle it — that's how "open this URL" or "share this text" work without your app knowing which browser or messaging app is installed.

```kotlin
// explicit — you know exactly which component
startActivity(Intent(this, DetailActivity::class.java).apply {
    putExtra("userId", "42")
})

// implicit — the system resolves a handler
startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://example.com")))
```

Data travels as key-value **extras** (`putExtra`/`getStringExtra`, etc.), which are ultimately just a `Bundle` attached to the Intent — small, serializable values only, the same size constraints that apply to any `Bundle` passed through Binder.

**Say it:** "Explicit intents name the exact component — that's normal in-app navigation — implicit intents describe an action and let the system resolve a handler, which is how cross-app actions like sharing or opening a link work without hardcoding which app receives them."
**Red flag:** Using an implicit intent for ordinary in-app navigation "just in case." That adds resolution overhead and ambiguity for a case where you already know exactly which Activity should handle it — explicit is the right default within your own app.

### What Is a Bundle, and How Do You Work With It
**They ask:** "What is a `Bundle`, and how do you work with it?"

A `Bundle` is a key-value container built to travel across process boundaries efficiently — it's what carries Intent extras, saved instance state, and Fragment arguments. The reason it exists instead of just using a `Map` is that it's designed to be parceled through Binder IPC: every value you put in has to be a primitive, a `String`, or something `Parcelable`/`Serializable` — arbitrary objects aren't allowed, because the whole `Bundle` has to be serializable to cross a process boundary.

```kotlin
val bundle = Bundle().apply {
    putString("name", "Ann")
    putInt("age", 25)
}
val name = bundle.getString("name")   // typed getters, with a default if the key is absent

// Fragment arguments — the standard way to pass data into a Fragment
val fragment = DetailFragment().apply {
    arguments = Bundle().apply { putString("itemId", "42") }
}
```

Typed getters (`getString`, `getInt`, …) return a sensible default (empty string, 0) if the key is missing, rather than throwing — which makes a silent typo in a key name a real bug class worth being deliberate about (constants for keys, not repeated string literals).

**Say it:** "A `Bundle` only accepts primitives, `String`, and `Parcelable`/`Serializable` because the whole thing has to survive being parceled across a process boundary — that constraint is also why it's the standard container for Intent extras, saved state, and Fragment arguments."
**Red flag:** Repeating a raw string literal as a `Bundle` key at both the put and get call sites. A typo compiles fine and just silently returns the default value — use a shared constant for the key instead.

### SharedPreferences — Simple Key-Value Persistence
**They ask:** "What is `SharedPreferences`, and when do you use it?"

`SharedPreferences` is Android's simplest persistence mechanism — a key-value store, backed by an XML file per named preferences group, meant for small settings and flags (a theme choice, "has the user seen onboarding," a feature toggle) rather than structured or relational data. Reaching for it over Room for anything list-shaped or queryable is the classic misuse — it has no query capability at all, just get/put by key.

```kotlin
val prefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)

prefs.edit().putBoolean("onboarding_done", true).apply()   // async write, fire-and-forget
prefs.edit().putString("theme", "dark").commit()            // sync write, blocks until done

val done = prefs.getBoolean("onboarding_done", false)       // default if key absent
```

`apply()` writes to the in-memory cache immediately and persists to disk asynchronously — the right default for almost every write, since you don't need to block on the disk I/O. `commit()` writes synchronously and returns a success boolean, which is only worth the blocking cost when you genuinely need to know the write completed before proceeding (rare in practice).

**Say it:** "`SharedPreferences` is for small flags and settings, not structured data — Room is the right tool once there's anything list-shaped or queryable — and `apply()` should be the default write since it doesn't block the caller on disk I/O the way `commit()` does."
**Red flag:** Calling `commit()` out of habit for every write instead of `apply()`. That blocks the calling thread on disk I/O for no reason in the common case where you don't need a synchronous success guarantee.

### What Is an Activity, and Why Does Android Need It
**They ask:** "What is an `Activity`?"

An `Activity` is a single, focused screen with a window the user can interact with — it's the entry point Android uses to present UI and route user input, and every app that shows a screen has at least one. It's not just "a screen you draw on": it's a full-blown component registered in the manifest, managed by the system's lifecycle (creation, visibility, focus, destruction), and it's the unit the system's back stack and task model operate on.

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }
}
```

Because the system owns the Activity's lifecycle rather than your code, an Activity can be created, stopped, and destroyed at times outside your control (backgrounding, low memory, rotation) — which is exactly why lifecycle-aware state handling (`ViewModel`, `onSaveInstanceState`) matters instead of treating an Activity like a plain, long-lived object you fully control.

**Say it:** "An Activity is a single UI screen that the system, not my code, owns the lifecycle of — it's registered in the manifest, participates in the back stack, and can be torn down and recreated outside my control, which is why lifecycle-aware state handling exists."
**Red flag:** Treating an Activity instance like a regular long-lived object — holding a static reference to one, or assuming it survives as long as the app process does. The system can destroy and recreate it at any time.

### What Is a Fragment, and Why Use One Instead of an Activity
**They ask:** "What is a `Fragment`, and why would you use one instead of just another Activity?"

A `Fragment` is a reusable, modular piece of UI and behavior that lives *inside* a host Activity — it exists to solve composition: instead of one Activity per screen, you build a screen from several independent, swappable Fragments, which is what makes tablet/multi-pane layouts (a list Fragment and a detail Fragment side by side) and dynamic navigation within one Activity practical.

```kotlin
class ListFragment : Fragment(R.layout.fragment_list) {
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        // set up this piece of UI independently of whatever else the host Activity shows
    }
}
```

A Fragment can't exist without a host Activity — it has no window of its own, and it inherits (and layers its own lifecycle on top of) the host's lifecycle. The practical payoff over a second Activity: swapping Fragments in and out of a container is cheaper and more flexible than launching a whole new Activity, and it's the natural unit for screens that need to be reused across different layouts or navigation flows (like Jetpack Navigation's destinations).

**Say it:** "A Fragment is a modular, reusable piece of UI that has to live inside a host Activity — I reach for one over a second Activity when a screen needs to be composed, swapped, or reused across different layouts, not just for the sake of splitting code up."
**Red flag:** Reaching for a Fragment purely to "organize code" for a screen that's really one self-contained flow with no reuse or composition need. A Fragment adds real lifecycle complexity (its own view lifecycle on top of the host's) — that cost should buy you something.

### Basic View Containers — LinearLayout, RelativeLayout, and FrameLayout
**They ask:** "What are the basic view containers/layouts in Android?"

A layout (`ViewGroup`) exists to arrange its children according to one specific positioning rule — picking the right one avoids fighting the layout to do something it wasn't designed for. `LinearLayout` arranges children in a single row or column, in the order declared, sized via `layout_weight` to distribute extra space — the simplest container, but it can't express "align this view relative to that one," and deeply nested `LinearLayout`s hurt measure/layout performance. `RelativeLayout` (now largely superseded by `ConstraintLayout`) positions each child relative to the parent or to sibling views (`layout_below`, `layout_toEndOf`) — more flexible than `LinearLayout` for complex arrangements, at the cost of `ConstraintLayout` doing the same job with a flatter hierarchy. `FrameLayout` stacks children on top of each other, z-ordered by declaration order — the right tool for overlaying content (a loading spinner over content, a badge over an icon), and it's what a single-Fragment container typically is under the hood.

```xml
<FrameLayout android:layout_width="match_parent" android:layout_height="match_parent">
    <ImageView android:id="@+id/photo" ... />
    <ProgressBar android:id="@+id/spinner" ... />  <!-- drawn on top -->
</FrameLayout>
```

**Say it:** "I pick the container by the arrangement rule I actually need — `LinearLayout` for a simple row/column, `FrameLayout` for stacking/overlaying, and for anything relative or complex, `ConstraintLayout` over `RelativeLayout` for the flatter hierarchy."
**Red flag:** Nesting several `LinearLayout`s to fake a relative arrangement `ConstraintLayout` would express in one flat layout. Each nested layout is a real extra measure/layout pass — that's a performance cost paid for a layout choice, not a necessity.

### EditText and TextWatcher — Tracking Input Changes
**They ask:** "How do you keep track of what a user types into an `EditText`?"

`EditText` is the standard text-input `View`, and reacting to what the user types happens through a `TextWatcher` — a listener you attach that fires at each stage of a text change, not just once when the whole thing is "done." That granularity is what makes live behaviors possible: character counters, real-time validation, or search-as-you-type filtering.

```kotlin
editText.addTextChangedListener(object : TextWatcher {
    override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
    override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
        viewModel.onQueryChanged(s.toString())   // fires on every keystroke
    }
    override fun afterTextChanged(s: Editable?) {}
})
```

`beforeTextChanged` fires with the old text just before the change; `onTextChanged` fires with the new text mid-change (the one most code actually cares about); `afterTextChanged` fires once the change is fully applied and is the only one where it's safe to *modify* the text without triggering infinite recursion. In Compose, the equivalent is simply observing `TextFieldValue`/`String` state directly — `TextWatcher` is a View-system-specific pattern.

**Say it:** "`TextWatcher` gives me three hooks around a text change — before, during, and after — `onTextChanged` is the one most live-validation and search-as-you-type logic hooks into, and `afterTextChanged` is the only safe place to mutate the text itself."
**Red flag:** Calling `editText.setText(...)` inside `onTextChanged` to "auto-correct" input. That re-triggers the watcher and can recurse — text mutation belongs in `afterTextChanged`, guarded against re-entrancy.

### RecyclerView Components and LayoutManager Types
**They ask:** "What are RecyclerView's basic components, and what types of `LayoutManager` are there?"

RecyclerView is deliberately split into three collaborating pieces instead of one monolithic list view, and that split is what makes it configurable. The **Adapter** owns the data and knows how to bind an item at a position to a view (`onCreateViewHolder`/`onBindViewHolder`). The **ViewHolder** caches a single item's view references. The **LayoutManager** owns positioning and scrolling — it's a separate, swappable object specifically so the same Adapter/data can be displayed as a list, a grid, or a staggered grid without touching binding logic at all.

```kotlin
recyclerView.layoutManager = LinearLayoutManager(context)                    // single column/row
recyclerView.layoutManager = GridLayoutManager(context, 2)                    // fixed-span grid
recyclerView.layoutManager = StaggeredGridLayoutManager(2, VERTICAL)          // variable-height grid
recyclerView.adapter = MyAdapter(items)
```

`LinearLayoutManager` lays items out in a single scrollable line (vertical or horizontal). `GridLayoutManager` arranges them in a fixed number of columns/rows of equal span. `StaggeredGridLayoutManager` allows items of different lengths in the scroll direction (a Pinterest-style masonry grid), at the cost of items being able to reorder slightly as content loads.

**Say it:** "Adapter owns the data-to-view binding, ViewHolder caches one item's view lookups, and LayoutManager owns positioning — splitting those apart is what lets the same Adapter drive a linear list, a grid, or a staggered grid just by swapping the LayoutManager."
**Red flag:** Putting layout/positioning logic inside the Adapter "because that's where the data is." That couples data binding to a specific layout shape — the entire reason LayoutManager is a separate, swappable object is to keep those concerns apart.

### Main Thread and Why View Access Must Happen There
**They ask:** "Why can't you touch a View from a background thread?"

Android's View system is deliberately **not thread-safe** — there's no internal locking protecting a View's state, which is a performance choice, not an oversight: adding synchronization to every View operation would slow down the single-threaded case that's actually the common one. The trade-off the framework makes instead: only the thread that created the View hierarchy (the main/UI thread) is allowed to touch it, enforced by a runtime check.

```kotlin
Thread {
    val data = fetchFromNetwork()      // fine — background work
    textView.text = data               // throws CalledFromWrongThreadException
}.start()

Thread {
    val data = fetchFromNetwork()
    runOnUiThread { textView.text = data }   // correct — hops back to main thread first
}.start()
```

Touching a View off the main thread throws `CalledFromWrongThreadException` at runtime specifically to surface the bug immediately and loudly, rather than letting it corrupt View state silently and unpredictably depending on scheduling luck — the same class of bug a real data race would cause, just made deterministic and loud instead of intermittent.

**Say it:** "Views aren't thread-safe by design — only the thread that created them can touch them — and `CalledFromWrongThreadException` exists to fail loudly and immediately instead of letting an unsynchronized View mutation corrupt state unpredictably."
**Red flag:** "Fixing" the crash by wrapping the background thread's UI update in a try/catch instead of dispatching back to the main thread. That suppresses the crash without fixing the actual thread-safety violation underneath it.
