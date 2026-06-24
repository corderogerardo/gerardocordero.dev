// Batch 3 — Android framework: lifecycle, ViewModel, process death, services & WorkManager.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

// framework chip already lives in the base flashcard filters.
export const ADVANCED3_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED3_FLASHCARDS: Flashcard[] = [
  {
    "id": "fr-1",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "Why is onSaveInstanceState not a substitute for a database?",
    "answerHtml": "The saved-state <code>Bundle</code> is for <b>small, transient UI state</b> (scroll position, a draft input) — it's parcelled into the system and has a soft size limit (a <code>TransactionTooLargeException</code> if you abuse it). Durable or large data belongs in Room/DataStore. The rule: <code>onSaveInstanceState</code>/<code>SavedStateHandle</code> for 'where the user was', a database for 'what the user has'."
  },
  {
    "id": "fr-2",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "Exactly what does a ViewModel survive, and what clears it?",
    "answerHtml": "A ViewModel is retained across <b>configuration changes</b> (rotation, dark-mode, etc.) because it's scoped to the <code>ViewModelStoreOwner</code>, not the Activity instance. It's cleared (<code>onCleared()</code>) when the owner is <b>permanently finished</b> — the Activity is finishing, or the back stack entry is popped. It does <b>not</b> survive process death; pair it with <code>SavedStateHandle</code> for that."
  },
  {
    "id": "fr-3",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "How does SavedStateHandle bridge process death?",
    "answerHtml": "It's a key-value map backed by saved instance state, injected into the ViewModel. Values you put there are written to the bundle and restored after the OS recreates the process. Expose them reactively:\n      <div class=\"code\">@HiltViewModel\nclass SearchVM @Inject constructor(\n  private val state: SavedStateHandle,\n) : ViewModel() {\n  val query: StateFlow&lt;String&gt; = state.getStateFlow(\"q\", \"\")\n  fun setQuery(q: String) { state[\"q\"] = q }\n}</div>\n      Now the query survives both rotation and a background process kill."
  },
  {
    "id": "fr-4",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "Why must you use viewLifecycleOwner (not 'this') in a Fragment?",
    "answerHtml": "A Fragment instance can outlive its View (e.g. when on the back stack the view is destroyed but the fragment isn't). Observing with the fragment as the owner means observers survive the view and, when the view is recreated, you get duplicate observers updating a destroyed view → leaks and crashes. <code>viewLifecycleOwner</code> ties observation to the view's lifecycle, so it's torn down with the view."
  },
  {
    "id": "fr-5",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "What is the saved-state library's role with Navigation?",
    "answerHtml": "Navigation gives each destination its own <code>ViewModelStore</code> and <code>SavedStateHandle</code>, scoped to the back-stack entry. So a screen's ViewModel is created when you navigate to it and cleared when you pop it — and nav arguments arrive in the <code>SavedStateHandle</code> automatically. You can also pass results back via the previous entry's <code>SavedStateHandle</code>."
  },
  {
    "id": "fr-6",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "When is a foreground Service required, and what changed in Android 14?",
    "answerHtml": "Use a foreground Service for user-visible, must-run-now work (media playback, navigation, an active workout) — it shows an ongoing notification and resists being killed. Android 14 requires you to declare a <code>foregroundServiceType</code> in the manifest and call <code>startForeground</code> with that type; certain types need runtime permissions. Misusing foreground services for background work is a common policy rejection."
  },
  {
    "id": "fr-7",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "WorkManager: OneTime vs Periodic, and what are constraints?",
    "answerHtml": "<code>OneTimeWorkRequest</code> runs once; <code>PeriodicWorkRequest</code> repeats on a minimum 15-minute interval (the OS batches for battery, so timing is approximate). <b>Constraints</b> gate execution — <code>NetworkType.UNMETERED</code>, charging, battery-not-low, device-idle — so sync runs under good conditions. WorkManager persists requests across reboot and respects Doze."
  },
  {
    "id": "fr-8",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "How do you guarantee unique, non-duplicated background work?",
    "answerHtml": "Use unique work with a policy: <code>enqueueUniqueWork(name, ExistingWorkPolicy.KEEP|REPLACE|APPEND, request)</code> (or <code>enqueueUniquePeriodicWork</code>). <code>KEEP</code> ignores a new request if one with that name is pending; <code>REPLACE</code> swaps it. This prevents queuing ten sync jobs when the user taps refresh repeatedly — a common WorkManager interview point."
  },
  {
    "id": "fr-9",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "How does a Worker return success/retry/failure, and how is retry controlled?",
    "answerHtml": "A <code>CoroutineWorker.doWork()</code> returns <code>Result.success()</code>, <code>Result.retry()</code>, or <code>Result.failure()</code>. <code>retry()</code> re-runs later using the request's <b>backoff policy</b> (<code>LINEAR</code> or <code>EXPONENTIAL</code>, min 10s). Use <code>retry</code> for transient errors (network), <code>failure</code> for permanent ones (bad input). You can also surface progress with <code>setProgress</code> and run as an expedited/foreground worker for urgent jobs."
  },
  {
    "id": "fr-10",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "Why are implicit broadcasts restricted, and what do you use instead?",
    "answerHtml": "Since Android 8, most <b>implicit</b> broadcasts can't be declared in the manifest (to stop apps waking up en masse), so a manifest-registered receiver won't fire for them. Use context-registered receivers while running, <code>JobScheduler</code>/<b>WorkManager</b> for deferrable triggers, and <code>FCM</code> for server-initiated wakeups. Explicit broadcasts and a few exempt system ones still work via the manifest."
  },
  {
    "id": "fr-11",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "What problem do ContentProviders solve today?",
    "answerHtml": "A <code>ContentProvider</code> exposes structured data across <b>process boundaries</b> via a content URI — used for sharing data between apps (Contacts, MediaStore) and as the hook some libraries use to auto-initialize (the App Startup library replaced the old 'one provider per SDK' startup hack). Within a single app you rarely need one; Room is your data layer. Know it for interop and for why startup providers slow cold start."
  },
  {
    "id": "fr-12",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "What is Doze mode and App Standby, and how do they affect background work?",
    "answerHtml": "<b>Doze</b> kicks in when the device is unused/unplugged: the system batches background work into maintenance windows, defers jobs/alarms, and restricts network. <b>App Standby</b> buckets apps by usage and throttles infrequently-used ones. Implication: don't rely on precise timing for background sync — use WorkManager (Doze-aware) and FCM high-priority messages for truly time-sensitive wakeups."
  },
  {
    "id": "fr-13",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "How does the back stack and 'up' vs 'back' work?",
    "answerHtml": "<b>Back</b> is temporal (the system back stack — where you came from); <b>Up</b> is hierarchical (the app's parent screen). In Navigation-Compose the <code>NavController</code> owns the back stack: <code>navigate()</code> pushes, <code>popBackStack()</code> pops, and <code>launchSingleTop</code>/<code>popUpTo</code> control duplicates and stack trimming. Predictive back (Android 13+/14) animates the gesture and needs you to opt in."
  },
  {
    "id": "fr-14",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "What's the difference between Activity and Application context?",
    "answerHtml": "<b>Activity context</b> is tied to the Activity's lifecycle and is themed/UI-capable — use it for inflating views, dialogs, starting activities. <b>Application context</b> lives for the whole process — use it for things that must outlive any screen (singletons, WorkManager, app-wide singletons). Holding an Activity context in a long-lived object leaks the whole Activity; default to application context for non-UI singletons."
  },
  {
    "id": "fr-15",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "How do runtime permissions work in modern Android?",
    "answerHtml": "Dangerous permissions are requested at runtime via the Activity Result API (<code>registerForActivityResult(RequestPermission())</code>); you check with <code>checkSelfPermission</code> and show rationale when <code>shouldShowRequestPermissionRationale</code> is true. Newer platforms add granular media permissions (photo picker, partial access), one-time grants, and auto-reset for unused apps. Always handle the denied-permanently case by guiding the user to settings."
  },
  {
    "id": "fr-16",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "What is the Activity Result API and why did it replace startActivityForResult?",
    "answerHtml": "<code>registerForActivityResult(contract) { result -&gt; }</code> replaced <code>onActivityResult</code>/<code>requestCode</code> plumbing. It's lifecycle-safe (registration is restored after process death), type-safe via contracts (<code>TakePicture</code>, <code>GetContent</code>, <code>RequestPermission</code>), and decouples the caller from result codes. You must register during initialization (not inside a callback) so the result can be redelivered after recreation."
  },
  {
    "id": "fr-17",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "What are Activity launch modes for?",
    "answerHtml": "They control how an Activity instance relates to the task back stack: <code>standard</code> (new instance each time), <code>singleTop</code> (reuse if already on top — avoids duplicate top), <code>singleTask</code> (one instance, brought to front, clearing above it), <code>singleInstance</code> (alone in its own task). Most apps use <code>standard</code>/<code>singleTop</code>; the others are for launchers/entry points. In Compose-single-Activity apps you rarely touch these — the NavController manages the in-app stack instead."
  },
  {
    "id": "fr-18",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "What is a PendingIntent and why must it be mutable/immutable-flagged?",
    "answerHtml": "A <code>PendingIntent</code> is a token that lets another process (the system, a notification, an alarm) execute an Intent <i>as your app</i> later. Since Android 12 you must explicitly flag it <code>FLAG_IMMUTABLE</code> (or <code>FLAG_MUTABLE</code> if a component like a direct-reply needs to fill it in) — immutable by default prevents other apps from tampering with the wrapped Intent, a real security fix."
  },
  {
    "id": "fr-19",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "How do notifications work on modern Android (channels + permission)?",
    "answerHtml": "Every notification must belong to a <b>channel</b> (since Android 8) that the user controls (importance, sound). Since Android 13 you must request the runtime <code>POST_NOTIFICATIONS</code> permission. Create channels at startup, target them when posting, and handle the permission gracefully (degrade if denied). High-importance channels can show heads-up notifications; respect the user's per-channel settings."
  },
  {
    "id": "fr-20",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "AlarmManager vs WorkManager — when do you actually need AlarmManager?",
    "answerHtml": "WorkManager covers nearly all deferrable background work. Reach for <b>AlarmManager</b> only when you need to run at an <i>exact wall-clock time</i> regardless of app state — an alarm clock, a calendar reminder. Exact alarms now require the <code>SCHEDULE_EXACT_ALARM</code>/<code>USE_EXACT_ALARM</code> permission and are scrutinized by Play. For 'eventually, under constraints,' it's WorkManager."
  },
  {
    "id": "fr-21",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "What is the single-Activity architecture and why is it common now?",
    "answerHtml": "One <code>Activity</code> hosts a Compose (or Navigation) graph; 'screens' are composables/destinations, not Activities. Benefits: a single, app-owned back stack and shared element transitions; simpler lifecycle (one Activity); easier state sharing; and cleaner deep-link handling. Multiple Activities are reserved for genuinely separate entry points (a share target, a widget action) — within the app, navigation lives in the graph."
  }
];

export const ADVANCED3_QUIZ_FILTERS: { value: string; label: string }[] = [
  { value: "framework", label: "Framework" },
];

export const ADVANCED3_QUIZ: QuizQuestion[] = [
  {
    "id": "zf1",
    "category": "framework",
    "categoryLabel": "Framework",
    "question": "A ViewModel survives rotation but loses state after the OS kills the backgrounded app. The fix?",
    "options": [
      "Use android:configChanges",
      "Store the state in SavedStateHandle",
      "Move it to a companion object",
      "Use GlobalScope"
    ],
    "answer": 1,
    "explanationHtml": "ViewModels don't survive process death. <code>SavedStateHandle</code> is backed by saved instance state, so its values are restored when the process is recreated."
  },
  {
    "id": "zf2",
    "category": "framework",
    "categoryLabel": "Framework",
    "question": "Why observe LiveData/Flow with viewLifecycleOwner in a Fragment?",
    "options": [
      "It's faster",
      "The fragment can outlive its view, so using 'this' double-subscribes and leaks the old view",
      "It enables data binding",
      "It's required for Hilt"
    ],
    "answer": 1,
    "explanationHtml": "The view lifecycle is separate; <code>viewLifecycleOwner</code> removes observers when the view is destroyed, avoiding leaks and duplicate updates."
  },
  {
    "id": "zf3",
    "category": "framework",
    "categoryLabel": "Framework",
    "question": "Which work API guarantees execution across process death and reboot with constraints?",
    "options": [
      "A coroutine in viewModelScope",
      "A bare Thread",
      "WorkManager",
      "Handler.postDelayed"
    ],
    "answer": 2,
    "explanationHtml": "WorkManager persists requests, respects constraints and Doze, and retries with backoff — the right tool for deferrable, guaranteed background work."
  },
  {
    "id": "zf4",
    "category": "framework",
    "categoryLabel": "Framework",
    "question": "User taps Refresh 10 times. How do you avoid 10 queued sync jobs?",
    "options": [
      "Use enqueueUniqueWork with ExistingWorkPolicy.KEEP",
      "Run them on Dispatchers.IO",
      "Increase the backoff",
      "Use a PeriodicWorkRequest"
    ],
    "answer": 0,
    "explanationHtml": "Unique work with <code>KEEP</code> ignores new requests while one with the same name is pending, de-duplicating the queue."
  },
  {
    "id": "zf5",
    "category": "framework",
    "categoryLabel": "Framework",
    "question": "When is a foreground Service the right choice?",
    "options": [
      "For a one-off background sync",
      "For user-visible ongoing work like media playback (with a notification)",
      "To avoid asking for permissions",
      "For all network calls"
    ],
    "answer": 1,
    "explanationHtml": "Foreground services are for must-run-now, user-visible work and require a notification (and a declared foregroundServiceType on Android 14+). Deferrable work belongs in WorkManager."
  },
  {
    "id": "zf6",
    "category": "framework",
    "categoryLabel": "Framework",
    "question": "Why won't a manifest-registered receiver fire for most implicit broadcasts on modern Android?",
    "options": [
      "Manifest receivers were removed entirely",
      "Background execution limits restrict most implicit broadcasts from launching apps",
      "They require Hilt",
      "Receivers only work in foreground services"
    ],
    "answer": 1,
    "explanationHtml": "Since Android 8, most implicit broadcasts can't start manifest-declared receivers. Use context-registered receivers, WorkManager, or FCM instead."
  }
];

export const ADVANCED3_STUDY: StudySection[] = [
  {
    "id": "st-fr-1",
    "num": "C1",
    "title": "C1 · State survival: the three tiers",
    "html": "<p>Interviewers love this because it forces precision. Three independent mechanisms, three lifetimes:</p>\n      <ul>\n        <li><b>remember / ViewModel</b> — survive <b>configuration changes</b> (rotation). Lost on process death.</li>\n        <li><b>rememberSaveable / SavedStateHandle / onSaveInstanceState</b> — survive <b>process death</b> (small, parcelable state). Lost on a full swipe-away by the user (intentional).</li>\n        <li><b>Room / DataStore / files</b> — survive <b>everything</b> until explicitly cleared.</li>\n      </ul>\n      <p>Design rule: put 'where the user was' in saved state and 'what the user has' in a database. Test the path with developer options 'Don't keep activities' to force recreation, and by killing the process from Studio.</p>\n      <div class=\"callout tip\"><span class=\"lbl\">Senior tell</span> \"Rotation is just process death with more retained — if I survive process death I get rotation for free.\"</div>"
  },
  {
    "id": "st-fr-2",
    "num": "C2",
    "title": "C2 · Choosing a background-work mechanism",
    "html": "<p>Match the tool to the requirement, and name the trade-off:</p>\n      <table>\n        <tr><th>Need</th><th>Tool</th></tr>\n        <tr><td>Deferrable, guaranteed, constrained (sync/upload)</td><td>WorkManager</td></tr>\n        <tr><td>User-visible, must run now (playback, nav)</td><td>Foreground Service</td></tr>\n        <tr><td>In-app async tied to a screen</td><td>coroutine in viewModelScope</td></tr>\n        <tr><td>Server-initiated wakeup of a killed app</td><td>FCM (high priority if urgent)</td></tr>\n        <tr><td>Exact-time alarm (alarm clock)</td><td>AlarmManager (exact alarms, permission-gated)</td></tr>\n      </table>\n      <ul>\n        <li>Respect <b>Doze</b>/<b>App Standby</b>: background timing is approximate by design.</li>\n        <li>Don't hold wake locks manually — let WorkManager and foreground services manage execution.</li>\n      </ul>"
  }
];
