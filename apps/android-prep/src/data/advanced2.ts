// Batch 2 — Jetpack Compose internals, side-effects, stability & testing.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

// Compose chip already lives in the base flashcard filters; no new chip here.
export const ADVANCED2_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED2_FLASHCARDS: Flashcard[] = [
  {
    "id": "cm-1",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "What are the three Compose phases and why do they matter?",
    "answerHtml": "<b>Composition</b> (what to show — run composables, build the tree), <b>Layout</b> (measure + place), <b>Drawing</b> (render). Reads of state are tracked per phase, so if you read a fast-changing value (scroll offset) only in <i>layout</i> or <i>draw</i> — e.g. <code>Modifier.offset { IntOffset(x, 0) }</code> with a lambda — you skip recomposition entirely and only re-layout/redraw. Knowing which phase reads what is how you kill animation jank."
  },
  {
    "id": "cm-2",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "What does the @Stable contract actually promise?",
    "answerHtml": "<code>@Stable</code>/<code>@Immutable</code> tell the compiler it may assume: (1) <code>equals</code> is consistent for the same instances, (2) public properties won't change without notifying Compose, and (3) all public properties are themselves stable. With that promise Compose can <b>skip</b> a composable when the param is equal to last time. Lying (mutating a field of a supposedly-immutable object) causes stale UI — a subtle bug."
  },
  {
    "id": "cm-3",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "Why is a plain List<T> parameter 'unstable', and how do you fix it?",
    "answerHtml": "The Compose compiler can't prove a <code>List</code> (interface) is immutable — the runtime instance could be a <code>MutableList</code> — so it marks composables taking one as unstable and won't skip them. Fix with <code>kotlinx.collections.immutable</code> (<code>ImmutableList</code>/<code>PersistentList</code>) or wrap the param in an <code>@Immutable</code> data class. The strong-skipping mode in recent Compose relaxes this, but immutable types are still the clean answer."
  },
  {
    "id": "cm-4",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "remember(key) — what happens when the key changes?",
    "answerHtml": "<code>remember(key) { compute() }</code> caches the value and recomputes it only when <code>key</code> changes (by equals). It's how you tie a remembered object's lifetime to an input — e.g. <code>remember(userId) { Repository(userId) }</code> recreates when the user changes. Forgetting the key gives you a stale object from a previous input; using the wrong key recreates too often."
  },
  {
    "id": "cm-5",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "When do you need derivedStateOf?",
    "answerHtml": "When a value is computed from <i>frequently-changing</i> state but you only care about a coarse result. Example: <code>val showFab by remember { derivedStateOf { listState.firstVisibleItemIndex &gt; 0 } }</code>. The scroll index changes constantly, but <code>showFab</code> flips rarely — <code>derivedStateOf</code> caches and only triggers recomposition when the boolean actually changes, instead of on every scroll pixel."
  },
  {
    "id": "cm-6",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "LaunchedEffect vs rememberCoroutineScope — when each?",
    "answerHtml": "<code>LaunchedEffect(key)</code> runs a coroutine tied to composition — it starts on enter, cancels on leave, restarts on key change. Use it for work driven by composition/state (load on appear, react to a key). <code>rememberCoroutineScope()</code> gives a scope you launch from <b>event callbacks</b> (a button's <code>onClick</code>) — outside the composition flow. Don't launch from <code>onClick</code> with <code>LaunchedEffect</code>; you can't, and that's the tell."
  },
  {
    "id": "cm-7",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "What is DisposableEffect for?",
    "answerHtml": "For effects that need cleanup. It runs on enter (or key change) and its <code>onDispose</code> runs on leave/key-change — perfect for registering and unregistering listeners, observers, or callbacks.\n      <div class=\"code\">DisposableEffect(lifecycleOwner) {\n  val obs = LifecycleEventObserver { _, e -&gt; /* ... */ }\n  lifecycleOwner.lifecycle.addObserver(obs)\n  onDispose { lifecycleOwner.lifecycle.removeObserver(obs) }\n}</div>"
  },
  {
    "id": "cm-8",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "rememberUpdatedState — what problem does it solve?",
    "answerHtml": "When a long-lived effect (keyed on something stable) must call the <i>latest</i> version of a lambda/callback without restarting. Wrap the callback in <code>rememberUpdatedState</code> and read it inside the effect — the effect keeps running, but always sees the current callback. It's the Compose equivalent of the 'latest ref' pattern, used in things like a delayed timeout that should call today's <code>onTimeout</code>."
  },
  {
    "id": "cm-9",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "What is produceState used for?",
    "answerHtml": "To convert a non-Compose async source (a suspend call, a Flow) into Compose <code>State</code>. It launches a coroutine, exposes a <code>value</code> you set as results arrive, and cancels when it leaves composition:\n      <div class=\"code\">val user by produceState&lt;User?&gt;(initialValue = null, id) {\n  value = repository.fetchUser(id)\n}</div>\n      It's <code>remember</code> + <code>LaunchedEffect</code> + a state holder in one."
  },
  {
    "id": "cm-10",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "What is CompositionLocal and when should you use it?",
    "answerHtml": "An implicit way to pass data down the tree without threading it through every parameter — e.g. <code>LocalContext</code>, <code>LocalConfiguration</code>, theme values via <code>MaterialTheme</code>. Create one with <code>compositionLocalOf</code>/<code>staticCompositionLocalOf</code> and provide via <code>CompositionLocalProvider</code>. Use sparingly: it's for cross-cutting, ambient data (theme, density), not for passing your screen's business state — that hides data flow and hurts testability."
  },
  {
    "id": "cm-11",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "compositionLocalOf vs staticCompositionLocalOf?",
    "answerHtml": "<code>compositionLocalOf</code> tracks reads, so changing the provided value recomposes only the readers — use it for values that change (e.g. a theme toggle). <code>staticCompositionLocalOf</code> does <b>not</b> track reads; changing it recomposes the entire content under the provider — use it for values that rarely or never change, because it's cheaper when stable."
  },
  {
    "id": "cm-12",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "Why does Modifier order matter?",
    "answerHtml": "Modifiers form an ordered chain applied outside-in for layout: <code>Modifier.padding(16.dp).background(Blue)</code> pads then draws background inside the padding, whereas <code>.background(Blue).padding(16.dp)</code> draws background first (full size) then pads the content within. Same with <code>clip</code>, <code>border</code>, <code>clickable</code> (where you place it changes the touch target). Reordering modifiers is a common source of 'why is my padding wrong' bugs."
  },
  {
    "id": "cm-13",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "How does state hoisting enable a single source of truth?",
    "answerHtml": "A stateless composable takes <code>value</code> and <code>onValueChange</code>, so the owner above it holds the state — usually the ViewModel exposing <code>StateFlow</code>. UI becomes a pure function of state (state down, events up), which makes it reusable, previewable, and testable, and prevents two widgets holding conflicting copies of the same data."
  },
  {
    "id": "cm-14",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "What does the key() composable do in a loop?",
    "answerHtml": "<code>key(id) { ItemRow(item) }</code> gives a piece of composition a stable identity so Compose preserves its state and <code>remember</code>ed values across reorders/insertions. In a <code>LazyColumn</code> you instead pass <code>key = { it.id }</code> to <code>items()</code>. Without stable keys, internal state (an expanded toggle, an animation) jumps to the wrong row when the list changes."
  },
  {
    "id": "cm-15",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "How do you handle one-off events (navigate, snackbar) in Compose + ViewModel?",
    "answerHtml": "Don't model them as state (they re-fire on recomposition/rotation). Expose them as a <code>SharedFlow</code>/<code>Channel</code> of events and collect once with a lifecycle-aware <code>LaunchedEffect</code>, or fold a one-shot 'effect consumed' flag into state. Many teams use a <code>Channel(Channel.BUFFERED).receiveAsFlow()</code> for events so each is delivered exactly once."
  },
  {
    "id": "cm-16",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "How do you test a Composable's behavior?",
    "answerHtml": "Use a compose test rule and drive the <b>semantics</b> tree:\n      <div class=\"code\">@get:Rule val rule = createComposeRule()\n\n@Test fun submitsForm() {\n  rule.setContent { LoginForm(onSubmit = { submitted = it }) }\n  rule.onNodeWithText(\"Email\").performTextInput(\"a@b.com\")\n  rule.onNodeWithText(\"Submit\").performClick()\n  assertEquals(\"a@b.com\", submitted)\n}</div>\n      Assert via semantics (<code>assertIsDisplayed</code>, <code>assertIsEnabled</code>); add <code>testTag</code> for nodes without text."
  },
  {
    "id": "cm-17",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "How do you animate state simply, and what's the difference between animate*AsState and Animatable?",
    "answerHtml": "<code>animateColorAsState</code>/<code>animateDpAsState</code>/<code>animateFloatAsState</code> are fire-and-forget: give a target, Compose animates toward it on recomposition — great for simple state-driven transitions. <code>Animatable</code> gives imperative control (you <code>animateTo</code>/<code>snapTo</code> inside a coroutine, can cancel and read velocity) — use it for gestures and choreographed sequences. <code>updateTransition</code> coordinates several values for one state change."
  },
  {
    "id": "cm-18",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "Why is LazyColumn not just a Column in a scroll?",
    "answerHtml": "<code>Column(Modifier.verticalScroll())</code> composes and measures <b>every</b> child up front — fine for a handful, fatal for a long list. <code>LazyColumn</code> only composes the items in (and near) the viewport and recycles as you scroll, like RecyclerView. Use Lazy layouts for any list that can grow; pass stable <code>key</code>s and optional <code>contentType</code> for efficient reuse."
  },
  {
    "id": "cm-19",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "How does Compose theming (Material 3) work?",
    "answerHtml": "<code>MaterialTheme</code> provides <code>colorScheme</code>, <code>typography</code>, and <code>shapes</code> via CompositionLocals; components read them by default. You build light/dark <code>colorScheme</code>s (optionally from <b>dynamic color</b> on Android 12+), and read tokens with <code>MaterialTheme.colorScheme.primary</code> rather than hardcoding. Centralizing design tokens in the theme is what makes a dark-mode or rebrand a one-place change."
  },
  {
    "id": "cm-20",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "What is SideEffect and when do you need it?",
    "answerHtml": "<code>SideEffect { }</code> runs after <b>every successful recomposition</b> and is used to publish Compose state to non-Compose code that isn't lifecycle-scoped — e.g. updating an analytics property or a third-party controller with the latest value. Unlike <code>LaunchedEffect</code>, it's not a coroutine and has no keys; it just fires post-composition. Use it rarely, for one-way sync to external objects."
  },
  {
    "id": "cm-21",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "How do you expose ViewModel state to Compose correctly?",
    "answerHtml": "Expose an immutable <code>StateFlow&lt;UiState&gt;</code> from the ViewModel and read it with <code>val state by viewModel.uiState.collectAsStateWithLifecycle()</code> — that stops collection below STARTED and respects the lifecycle. Avoid <code>collectAsState()</code> for long-lived screens (no lifecycle awareness) and avoid passing the whole ViewModel deep into children — hoist state and pass values + callbacks so inner composables stay stateless and previewable."
  },
  {
    "id": "cm-22",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "What's the cost of reading a MutableState in a large composable?",
    "answerHtml": "Every composable that <b>reads</b> a state becomes part of that state's recomposition scope, so reading a frequently-changing state high in a big composable re-runs the whole thing. Mitigations: read the state as low as possible (extract a small child that reads it), wrap derived results in <code>derivedStateOf</code>, or defer the read to layout/draw. The principle: scope the read to the smallest subtree that actually needs it."
  }
];

export const ADVANCED2_QUIZ_FILTERS: { value: string; label: string }[] = [
  { value: "compose", label: "Compose" },
];

export const ADVANCED2_QUIZ: QuizQuestion[] = [
  {
    "id": "zm1",
    "category": "compose",
    "categoryLabel": "Compose",
    "question": "Reading scroll offset only inside Modifier.offset { } lambda avoids what?",
    "options": [
      "Layout",
      "Recomposition (the read happens in the layout phase)",
      "Drawing",
      "Garbage collection"
    ],
    "answer": 1,
    "explanationHtml": "Deferring the state read to the layout phase via the lambda overload skips recomposition — you only re-layout/redraw, which is how you keep scroll/animation smooth."
  },
  {
    "id": "zm2",
    "category": "compose",
    "categoryLabel": "Compose",
    "question": "Why might a Composable taking List<T> never be skipped?",
    "options": [
      "Lists are always large",
      "List is treated as unstable, so Compose can't assume it's unchanged",
      "Lists can't be remembered",
      "It must be a var"
    ],
    "answer": 1,
    "explanationHtml": "The compiler can't prove a List instance is immutable, so it's unstable and defeats skipping. Use ImmutableList or an @Immutable wrapper."
  },
  {
    "id": "zm3",
    "category": "compose",
    "categoryLabel": "Compose",
    "question": "You need the latest onClick lambda inside a long-running keyed effect without restarting it. Use…",
    "options": [
      "rememberUpdatedState",
      "derivedStateOf",
      "produceState",
      "staticCompositionLocalOf"
    ],
    "answer": 0,
    "explanationHtml": "<code>rememberUpdatedState</code> keeps a ref to the freshest value so the effect sees the current callback without re-keying/restarting."
  },
  {
    "id": "zm4",
    "category": "compose",
    "categoryLabel": "Compose",
    "question": "derivedStateOf is the right tool when…",
    "options": [
      "You fetch data from the network",
      "A value is derived from frequently-changing state but changes rarely itself",
      "You need to register a listener",
      "You want to pass data down implicitly"
    ],
    "answer": 1,
    "explanationHtml": "It caches a computed result and only recomposes readers when the result changes (e.g. showFab from scroll index), avoiding recomposition on every input tick."
  },
  {
    "id": "zm5",
    "category": "compose",
    "categoryLabel": "Compose",
    "question": "Which launches a coroutine from a button's onClick?",
    "options": [
      "LaunchedEffect",
      "rememberCoroutineScope().launch { }",
      "produceState",
      "SideEffect"
    ],
    "answer": 1,
    "explanationHtml": "Event callbacks are outside composition; use a scope from <code>rememberCoroutineScope()</code>. <code>LaunchedEffect</code> is for composition-driven work, not click handlers."
  },
  {
    "id": "zm6",
    "category": "compose",
    "categoryLabel": "Compose",
    "question": "Modifier.padding(16.dp).background(Blue) vs .background(Blue).padding(16.dp) differ because…",
    "options": [
      "They are identical",
      "Modifier order is applied as an ordered chain, so padding-then-background insets the background",
      "background ignores padding",
      "Only the first modifier runs"
    ],
    "answer": 1,
    "explanationHtml": "Modifiers form an ordered chain. Padding before background draws the background inside the padding; reversing draws it full-size then pads the content."
  },
  {
    "id": "zm7",
    "category": "compose",
    "categoryLabel": "Compose",
    "question": "Which collects ViewModel StateFlow with lifecycle awareness in Compose?",
    "options": [
      "collectAsState()",
      "collectAsStateWithLifecycle()",
      "observeAsState()",
      "remember { flow }"
    ],
    "answer": 1,
    "explanationHtml": "<code>collectAsStateWithLifecycle()</code> stops collection below STARTED, avoiding background work and stale updates. <code>collectAsState()</code> ignores lifecycle."
  },
  {
    "id": "zm8",
    "category": "compose",
    "categoryLabel": "Compose",
    "question": "Why prefer LazyColumn over Column(verticalScroll) for a long list?",
    "options": [
      "It looks different",
      "LazyColumn only composes visible items and recycles; Column composes them all",
      "Column can't scroll",
      "LazyColumn disables recomposition"
    ],
    "answer": 1,
    "explanationHtml": "A scrolling Column composes/measures every child up front; LazyColumn composes only what's near the viewport and recycles — essential for large lists."
  }
];

export const ADVANCED2_STUDY: StudySection[] = [
  {
    "id": "st-cm-1",
    "num": "B1",
    "title": "B1 · Recomposition, scopes & stability",
    "html": "<p>Compose's performance model is simple to state and easy to get wrong: it re-invokes the <b>smallest scope that read the changed state</b>, and it <b>skips</b> composables whose parameters are stable and equal to last time.</p>\n      <ul>\n        <li><b>Read low</b>: read state as deep in the tree as possible so recomposition stays local (donut-hole skipping).</li>\n        <li><b>Stability</b>: primitives, <code>String</code>, functional types, and <code>@Stable</code>/<code>@Immutable</code> types are stable. Plain <code>List</code>/<code>Map</code> and types from modules without Compose info are not — wrap or use immutable collections.</li>\n        <li><b>Strong skipping</b> (recent Compose) auto-remembers lambdas and lets unstable params still be compared by instance — but designing for stability remains best practice.</li>\n        <li><b>Diagnose</b>: enable the Compose compiler metrics report and the Layout Inspector recomposition counts; find the unstable param instead of guessing.</li>\n      </ul>"
  },
  {
    "id": "st-cm-2",
    "num": "B2",
    "title": "B2 · The side-effect APIs, chosen correctly",
    "html": "<p>Composition must be side-effect-free; effects belong in effect handlers, keyed correctly:</p>\n      <ul>\n        <li><b>LaunchedEffect(key)</b> — suspend work tied to composition; restart on key change.</li>\n        <li><b>rememberCoroutineScope()</b> — launch from event callbacks.</li>\n        <li><b>DisposableEffect(key)</b> — register/unregister with <code>onDispose</code>.</li>\n        <li><b>SideEffect</b> — publish Compose state to non-Compose code after every successful composition.</li>\n        <li><b>derivedStateOf</b> — cache a coarse result from noisy state.</li>\n        <li><b>produceState</b> / <b>snapshotFlow</b> — bridge to/from Flows.</li>\n        <li><b>rememberUpdatedState</b> — capture the latest callback inside a long-lived effect.</li>\n      </ul>\n      <div class=\"map\"><span class=\"lbl\">In practice</span> The most common mistake is launching a coroutine in the composable body (fires every recomposition). The senior answer names the right handler and its key.</div>"
  }
];
