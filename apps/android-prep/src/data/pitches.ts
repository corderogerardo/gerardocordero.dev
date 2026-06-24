// Spoken interview pitches for Android roles. Typed modules are the source of truth — edit directly.
export type Pitch = {
  id: string;
  num: string;
  title: string;
  metaHtml: string;
  scriptHtml: string;
  tipsHtml: string;
};

export const PITCHES_INTRO_HTML = "<span class=\"lbl\">How to practice</span>\n      Don't memorize word-for-word — it sounds robotic. Learn the <b>shape</b> of each answer (the beats), then say it\n      in your own words and swap in your real projects. Record, watch once, fix one thing, record again. Three takes beats thirty re-reads.";

export const PITCHES: Pitch[] = [
  {
    "id": "p1",
    "num": "Pitch 01",
    "title": "The 30-second intro",
    "metaHtml": "<span class=\"pill\">“Tell me about yourself” — short</span><span class=\"pill accent\">~30 sec</span>",
    "scriptHtml": "<p>Hi, I'm an Android engineer with several years building production apps in Kotlin. My focus is modern Android — Jetpack Compose, coroutines and Flow, and a clean MVVM architecture backed by Hilt and Room.</p>\n        <p>Most recently I led a Compose migration and an offline-first rebuild: I owned the architecture, the performance work, and the release pipeline.</p>\n        <p>I'm drawn to this role because it's senior, Kotlin-first, and the kind of mature product where architecture and performance actually matter.</p>",
    "tipsHtml": "<span class=\"lbl\">Delivery &amp; English tips</span>\n        Keep it light and confident — this is a handshake, not your life story. Land on three nouns: <b>Compose, coroutines, architecture</b>.\n        Pronounce <i>Kotlin</i> as “COT-lin”, <i>coroutines</i> as “co-ROO-teens”, and <i>Hilt</i> clearly. Smile on the last line — it signals genuine interest."
  },
  {
    "id": "p2",
    "num": "Pitch 02",
    "title": "The 60-second intro",
    "metaHtml": "<span class=\"pill\">“Tell me about yourself” — standard</span><span class=\"pill accent\">~60–75 sec</span>",
    "scriptHtml": "<p>Sure. I'm a senior Android engineer. I've spent the last several years shipping Kotlin apps to Google Play, and I specialize in modern Android: Jetpack Compose for UI, coroutines and Flow for async and state, and MVVM with a clean data layer.</p>\n        <p>On my last team I was the technical lead for a screen-heavy consumer app. I drove the migration from the View system to Compose, rebuilt the data layer to be offline-first with Room as the single source of truth and Retrofit syncing in the background, and wired the whole graph with Hilt.</p>\n        <p>A big part of my work was performance: I tracked down recomposition and jank issues with Perfetto and Macrobenchmark, added Baseline Profiles, and cut cold start measurably. I also owned releases — CI with instrumented tests, staged rollouts, and watching the crash-free rate.</p>\n        <p>I'm looking for a senior, Kotlin-first role on a mature product where I can go deep on architecture and performance — which is exactly what this looks like.</p>",
    "tipsHtml": "<span class=\"lbl\">Delivery &amp; English tips</span>\n        Structure = <b>who I am → what I shipped → my best story → what I want</b>. Pause briefly between paragraphs; those pauses read as confidence.\n        Watch <i>Macrobenchmark</i> (“MACRO-bench-mark”), <i>Retrofit</i> (“RETRO-fit”), and <i>Gradle</i> (“GRAY-dul”). Don't rush the last sentence — it's your “I want this job” line."
  },
  {
    "id": "p3",
    "num": "Pitch 03",
    "title": "The 2-minute career story",
    "metaHtml": "<span class=\"pill\">“Walk me through your background”</span><span class=\"pill accent\">~2 min</span>",
    "scriptHtml": "<p>I'll give you the short arc. I started in Android back in the Java and XML days — Activities, Fragments, RxJava — building features and learning the platform the hard way: lifecycle bugs, configuration changes, and memory leaks.</p>\n        <p>When Kotlin became first-class I moved over fully, and that changed how I write code: null-safety, sealed classes for state, and coroutines instead of callback chains. I rebuilt async flows around structured concurrency and Flow, which made cancellation and testing genuinely simple for the first time.</p>\n        <p>The last few years were my deepest chapter. I led a Compose adoption on a large app — not a rewrite, an incremental migration screen by screen — and re-architected the data layer to be offline-first: Room as the source of truth, a repository owning sync, and the UI just observing state. I introduced Hilt, modularized the codebase by feature for faster builds, and set up Baseline Profiles and Macrobenchmark to defend startup and scroll performance.</p>\n        <p>What ties it together is that I care about the boring fundamentals — lifecycle, threading, and state — because that's what makes an app feel fast and not crash. A senior, Kotlin-first role on a mature product is exactly the next step I want.</p>",
    "tipsHtml": "<span class=\"lbl\">Delivery &amp; English tips</span>\n        Tell it as a <b>journey with one turning point</b> (“when Kotlin became first-class I moved over fully”). That single line makes the story feel intentional.\n        Hard words: <i>coroutines</i>, <i>structured concurrency</i>, <i>modularized</i> (“MOD-yoo-ler-ized”). End on the words <b>“next step”</b> — it frames you as moving toward them."
  },
  {
    "id": "p4",
    "num": "Pitch 04",
    "title": "Why Android / Kotlin",
    "metaHtml": "<span class=\"pill\">“Why this stack?”</span><span class=\"pill accent\">~45 sec</span>",
    "scriptHtml": "<p>Two reasons. First, the craft: Android forces you to respect constraints — the lifecycle, limited memory, a single main thread, real network variability. Getting an app to feel instant on a mid-range phone with a flaky connection is a genuinely hard, satisfying problem.</p>\n        <p>Second, Kotlin and Jetpack made the platform a joy. Coroutines turned async into something you can read top to bottom; Compose made UI declarative and state-driven; and the type system catches a whole class of bugs before they ship. I like that modern Android rewards engineers who think about state and threading clearly.</p>",
    "tipsHtml": "<span class=\"lbl\">Delivery &amp; English tips</span>\n        Two-part answers (“First… Second…”) sound organized and confident. Land on <b>constraints</b> and <b>state &amp; threading</b> — they signal seniority.\n        Avoid bashing other platforms; speak to what you love. Keep it under a minute."
  },
  {
    "id": "p5",
    "num": "Pitch 05",
    "title": "Why this company",
    "metaHtml": "<span class=\"pill\">“Why us?”</span><span class=\"pill accent\">~45 sec</span>",
    "scriptHtml": "<p>This is the one to tailor — so here's the shape. Open with something specific about their product or engineering culture (a feature you admire, their scale, their Compose adoption, an engineering blog post). Then connect it to you: “That's exactly the kind of problem I want to work on, and it lines up with my depth in X.”</p>\n        <p>Close on the team and the level: “A senior, Kotlin-first role on a product this mature is where I do my best work — I want to own architecture and performance, mentor through reviews, and ship things that hold up.”</p>",
    "tipsHtml": "<span class=\"lbl\">Delivery &amp; English tips</span>\n        Always research one concrete thing: their app's standout feature, a tech-blog post, or a recent launch. Genericity here is the most common miss.\n        Name the <b>level</b> and <b>what you'll own</b> — it shows you're thinking like a hire, not a candidate."
  },
  {
    "id": "p6",
    "num": "Pitch 06",
    "title": "Hardest technical project — deep-dive",
    "metaHtml": "<span class=\"pill\">“Walk me through a hard project”</span><span class=\"pill accent\">~2 min</span>",
    "scriptHtml": "<p>The shape: pick one project and tell it as a problem, a design, and a result. My go-to is the offline-first rebuild.</p>\n        <p><b>Problem:</b> the app showed spinners constantly and lost user work on a dropped connection, because each screen fetched directly from the network and held its own copy of the data.</p>\n        <p><b>Design:</b> I made the local Room database the single source of truth. The UI observes <code>Flow</code> from the DAO, so it always renders local data instantly. A repository owns synchronization — it writes optimistic updates locally, enqueues mutations, and reconciles with the server via WorkManager when connectivity returns, with a last-write-wins policy per record type. Everything is wired through Hilt and runs in <code>viewModelScope</code> so it cancels cleanly.</p>\n        <p><b>Result:</b> the app worked fully offline, the spinner-on-every-screen problem disappeared because of stale-while-revalidate reads, and our crash-free rate went up because we stopped doing fragile network work on the main thread. I added Turbine tests around the sync logic so it couldn't regress.</p>",
    "tipsHtml": "<span class=\"lbl\">Delivery &amp; English tips</span>\n        Use the <b>Problem → Design → Result</b> spine and pause between them. Drop two or three precise nouns (<i>single source of truth</i>, <i>WorkManager</i>, <i>stale-while-revalidate</i>) — specificity is what reads as senior.\n        Have one diagram in your head you could sketch if they share a whiteboard."
  },
  {
    "id": "p7",
    "num": "Pitch 07",
    "title": "STAR · the performance / jank bug",
    "metaHtml": "<span class=\"pill\">“Hardest bug / performance win”</span><span class=\"pill accent\">~90 sec</span>",
    "scriptHtml": "<p><b>Situation:</b> our main feed stuttered while scrolling on mid-range devices, and users noticed.</p>\n        <p><b>Task:</b> I owned making it smooth without a rewrite.</p>\n        <p><b>Action:</b> I profiled instead of guessing — a Macrobenchmark scroll test plus Perfetto traces and the Layout Inspector's recomposition counts. Two culprits: a list item took an unstable <code>List</code> parameter, so every item recomposed on any change; and we decoded a full-size image on the main thread. I made the model an immutable type, added stable <code>key</code>s, moved image loading off the main thread with a proper loader, and generated a Baseline Profile for the feed.</p>\n        <p><b>Result:</b> jank dropped to near-zero in the benchmark, cold-start-to-first-scroll improved, and I left a Macrobenchmark test in CI so it can't regress. The team adopted “profile first, then fix the proven hotspot” as a habit.</p>",
    "tipsHtml": "<span class=\"lbl\">Delivery &amp; English tips</span>\n        Say the four STAR words quietly as signposts. The memorable line is <b>“I profiled instead of guessing.”</b> End on the <b>lesson and the regression test</b>, not just the fix.\n        Practice <i>recomposition</i> (“re-com-po-ZISH-un”) and <i>Baseline Profile</i> until they're smooth."
  },
  {
    "id": "p8",
    "num": "Pitch 08",
    "title": "STAR · ownership of a release",
    "metaHtml": "<span class=\"pill\">“A time you owned something”</span><span class=\"pill accent\">~90 sec</span>",
    "scriptHtml": "<p><b>Situation:</b> we were shipping a significant feature and our release process was ad-hoc and risky.</p>\n        <p><b>Task:</b> I took ownership of the release path end to end.</p>\n        <p><b>Action:</b> I set up CI to run unit and instrumented tests on every PR, automated signing and the Play Console upload, and moved us to a <b>staged rollout</b> — 5% to 20% to 100% — gated on the crash-free rate. I put the risky part of the feature behind a feature flag with a kill switch, and wrote a short runbook for rollback.</p>\n        <p><b>Result:</b> at 5% we caught a crash on a specific OEM, halted, root-caused it, shipped the fix with a regression test, and re-rolled cleanly. The feature reached 100% with a healthy crash-free rate, and the staged-rollout process became our default.</p>",
    "tipsHtml": "<span class=\"lbl\">Delivery &amp; English tips</span>\n        Emphasize the word <b>“I owned.”</b> Name the guardrail metric — <i>crash-free rate</i> — and the safety nets (<i>kill switch</i>, <i>staged rollout</i>). Those are senior signals.\n        Keep the failure beat short and end on “the process became our default.”"
  },
  {
    "id": "p9",
    "num": "Pitch 09",
    "title": "STAR · adaptability / ramping fast",
    "metaHtml": "<span class=\"pill\">“Learning something new fast”</span><span class=\"pill accent\">~75 sec</span>",
    "scriptHtml": "<p><b>Situation:</b> I joined a team mid-flight on a large, unfamiliar modular codebase using patterns I hadn't used before.</p>\n        <p><b>Task:</b> get productive quickly without breaking things.</p>\n        <p><b>Action:</b> I read the <b>data flow before the files</b> — the DI graph, the navigation graph, and the repositories — to build a mental model. Then I shipped the smallest safe change with a test to learn the feedback loop, and I followed the existing conventions instead of importing my own. I asked a few targeted questions early rather than guessing.</p>\n        <p><b>Result:</b> I had a meaningful PR merged in my first week and was owning a feature within a month. The phrase I live by is “the smallest safe change that unblocks the next feature.”</p>",
    "tipsHtml": "<span class=\"lbl\">Delivery &amp; English tips</span>\n        “Data flow before files” and “smallest safe change” are clean, memorable phrases — use them verbatim.\n        Show humility plus speed: asking good questions early is a strength, not a weakness."
  },
  {
    "id": "p10",
    "num": "Pitch 10",
    "title": "Closing + questions to ask them",
    "metaHtml": "<span class=\"pill\">“Anything you want to ask us?”</span><span class=\"pill accent\">~60 sec</span>",
    "scriptHtml": "<p>Always have three or four sharp questions ready — it signals you're evaluating them too. Good ones for an Android role:</p>\n        <ul>\n          <li>How far along is your Compose adoption, and what's still on the View system?</li>\n          <li>How is the codebase modularized, and what's the build time like day to day?</li>\n          <li>What does your release process look like — staged rollouts, and what crash-free bar do you hold?</li>\n          <li>How do you balance feature work against performance and tech-debt paydown?</li>\n        </ul>\n        <p>Close warmly: “This has been great — the work lines up exactly with what I want to go deep on, and I'd be excited to join.”</p>",
    "tipsHtml": "<span class=\"lbl\">Delivery &amp; English tips</span>\n        Pick questions whose answers you actually care about — your follow-ups will sound genuine. Avoid asking anything answered on their careers page.\n        End on one confident, warm sentence. Don't trail off — finish on “excited to join.”"
  }
];
