// Module 20 — Play Release & Graduation (Android track, FINAL). See
// ../lessons/FORMAT.md and ./FORMAT-KOTLIN.md for the schema and Kotlin-specific traps.
window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "play-release-graduation",
  title: "Play Release & Graduation",
  emoji: "🚀",
  lang: "kotlin",
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    {
      id: "app-bundles-and-signing",
      title: "App Bundles & signing",
      steps: [
        {
          type: "text",
          md: [
            "## You don't upload an APK anymore",
            "Every APK you've installed so far in this course — via `Shift+F10`, straight onto an emulator — is a single file containing every resource for every device: every screen density, every CPU architecture. That's fine for local testing, wasteful for a real download.",
            "What you upload to the Play Console instead is an **Android App Bundle** (`.aab`) — a publishing format that bundles all of that, unsplit, and hands the splitting job to Google. Play's servers generate **optimized, per-device APKs** from your one `.aab`: a Pixel gets only the `arm64` native code and `xxhdpi` images it needs, an older phone gets a smaller, different slice. Same bundle in, a leaner download out for whoever's actually installing it.",
            "One consequence worth knowing: because Play generates the final APK, **you can't hand a `.aab` to a tester and have them just install it** the way they could an APK — it has to go through a Play track first (more on tracks in lesson 2), or through `bundletool` locally for advanced testing.",
          ],
        },
        {
          type: "text",
          md: [
            "## Play App Signing: two keys, one you never touch",
            "Every release build is cryptographically signed — Android refuses to install an update whose signature doesn't match the one already on the device, which is what stops someone else from shipping a fake update to your users. Historically that meant guarding one signing key forever: lose it, and you can never update your app again under the same package name.",
            "**Play App Signing** splits that into two keys. Google generates and holds the **app signing key** — the one that actually signs what real users download — inside its own secure infrastructure, so you never handle it and can't lose it. You keep a separate **upload key**, which you use to sign the `.aab` you send to Play; Play verifies that upload signature, strips it, and re-signs the bundle with the app signing key before it reaches a device. If your upload key ever leaks or gets lost, you can ask Google to reset it — something that was simply impossible under the old single-key model.",
          ],
        },
        {
          type: "text",
          md: [
            "## versionCode vs. versionName",
            "Two version fields live in `defaultConfig`, and they answer different questions. **`versionCode`** is an integer, invisible to users, that Play uses to order releases — every new release's `versionCode` must be strictly higher than the last one, full stop, or Play rejects the upload. **`versionName`** is the human-readable string shown on the Play Store listing and in Settings — `\"1.1.0\"`, following whatever scheme you like (often SemVer, same idea as this portfolio's own release script).",
          ],
        },
        {
          type: "code",
          title: "app/build.gradle.kts",
          source: String.raw`android {
    defaultConfig {
        applicationId = "com.pawwalk.android"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"
    }
}`,
          caption: "This is the exact shape shipping in apps/android/app/build.gradle.kts today — versionCode 1, versionName \"1.0\", PawWalk's first release. Bumping either field for the next release means editing these two lines and nothing else.",
        },
        {
          type: "exercise",
          title: "Set the release version",
          prompt: [
            "PawWalk is shipping its first update. Inside `defaultConfig`, bump the two version fields:",
            "1. `versionCode = 2` — one higher than the `1` already on Play.\n2. `versionName = \"1.1.0\"` — the string testers and users will actually see.",
          ],
          starter: String.raw`defaultConfig {
    applicationId = "com.pawwalk.android"
    minSdk = 26
    targetSdk = 36
    // your code here
}`,
          solution: String.raw`defaultConfig {
    applicationId = "com.pawwalk.android"
    minSdk = 26
    targetSdk = 36
    versionCode = 2
    versionName = "1.1.0"
}`,
          checks: [
            { re: /versionCode=2/, hint: "Set `versionCode = 2` — it must be strictly higher than the previous release's code, or Play rejects the upload." },
            { re: /versionName="1\.1\.0"/, hint: "Set `versionName = \"1.1.0\"` — the human-readable string shown on the Play listing." },
          ],
          mustNot: [
            { re: /versionCode=1/, hint: "Don't leave `versionCode` at `1` — Play requires each new upload's versionCode to be strictly greater than the last one." },
          ],
          success: "That's a real version bump — versionCode tells Play this release is newer, versionName is what a user sees on the listing.",
        },
        {
          type: "quiz",
          q: "Why upload an `.aab` instead of a single universal `.apk`?",
          choices: [
            "An .aab is just a renamed .apk — there's no real difference",
            "Play splits the .aab into smaller, device-optimized APKs at download time, so each user gets only the code and resources their specific device needs",
            ".aab files can't be signed, so they're only for internal testing",
            ".apk files are no longer supported by Android at all",
          ],
          answer: 1,
          explain: "The .aab bundles everything unsplit and defers the splitting decision to Play's servers, which generate a leaner, device-specific APK for each download — different CPU architecture, screen density, and language resources per device, instead of one bloated universal file.",
          nudge: "Think about who does the work of picking \"just the arm64 code, just the xxhdpi images\" — you, at build time, or Play, at download time?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "tracks-and-staged-rollout",
      title: "Tracks & staged rollout",
      steps: [
        {
          type: "text",
          md: [
            "## Four rooms, each bigger than the last",
            "The Play Console doesn't let you go straight from your laptop to every Android phone on Earth — it makes you walk through **testing tracks**, each one widening the audience:",
            "- **Internal testing** — up to 100 testers you list by email, live within minutes. No review wait. This is where a build lands the moment it's ready.\n- **Closed testing** — a named list of testers (or Google Groups), bigger than internal, still invite-only. Good for a beta group of real dog walkers before the public sees anything.\n- **Open testing** — anyone can join via a public opt-in link, no invite needed. Your biggest pre-release audience, still clearly labeled as a beta.\n- **Production** — the real Play Store listing, live for anyone to install.",
            "Each track is a separate, smaller bet before the big one — a crash that only shows up on one obscure device model gets caught by 40 internal testers instead of 40,000 production users.",
          ],
        },
        {
          type: "text",
          md: [
            "## Staged rollout: production, but with a dimmer switch",
            "Even production releases don't have to go to 100% of users on day one. A **staged rollout** ships a new version to a chosen **percentage** of your production users first — say 10% — and lets you watch Android vitals (crash rate, ANR rate — covered next lesson) before deciding to ramp up to 50%, then 100%, or **halt** the rollout entirely if something's wrong. Halting doesn't touch the users already on the new version, but stops it from spreading further while you ship a fix.",
            "Before any of that, the **pre-launch report** runs automatically: Play installs and exercises your app on a fleet of real Google-hosted devices, crawling the UI and flagging crashes, accessibility issues, and performance problems — all before a single real user ever sees the build. It's a free smoke test across hardware you almost certainly don't own.",
          ],
        },
        {
          type: "xcode",
          label: "Over in the Play Console",
          title: "Publish an internal test release",
          intro: [
            "Walk PawWalk's first `.aab` through the lowest rung of the ladder:",
          ],
          items: [
            "Build the release bundle: `./gradlew bundleRelease` — output lands in `app/build/outputs/bundle/release/app-release.aab`.",
            "In the Play Console, open your app → **Testing → Internal testing** → **Create new release**.",
            "Upload the `.aab`. Play will validate the signing and versionCode automatically.",
            "Add your own email (or a teammate's) to the internal tester list, and share the opt-in link.",
            "Install the build from that link on a real device and confirm it launches — that's the whole loop: build, upload, distribute, verify.",
          ],
        },
        {
          type: "quiz",
          q: "Your team ships a production update, staged at 10%. Within an hour, crash reports spike sharply for users on that new version. What's the right move?",
          choices: [
            "Wait it out — staged rollouts always have some early noise",
            "Immediately bump the rollout to 100% so the bug gets found faster",
            "Halt the rollout — it's already limited to 10% of users, so halting caps the damage while you fix the bug and ship a new release",
            "Delete the app from the Play Store entirely",
          ],
          answer: 2,
          explain: "This is exactly the scenario staged rollout exists for: catching a bad release while it's still contained to a small slice of production, then halting before it reaches everyone. Ramping up would make things worse, not better.",
          nudge: "The whole point of shipping to 10% first is having an option other than \"all the way\" or \"nothing\" once you see a problem — what's that middle option?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "crash-triage-with-vitals",
      title: "Crash triage with Android vitals",
      steps: [
        {
          type: "text",
          md: [
            "## Android vitals is watching two numbers",
            "**Android vitals**, inside the Play Console, tracks how your released app behaves on real user devices — the two headline metrics are **crash rate** (the app terminates unexpectedly) and **ANR rate** (Application Not Responding — the main thread is blocked long enough that Android itself offers to force-close the app, roughly **5 seconds** of no response to input). Both have Google-enforced **bad-behavior thresholds**: cross them, and your app can lose visibility in the Play Store — demoted in search and recommendations, sometimes with a warning shown to installers. This isn't just a dashboard for your own curiosity; it's tied to your app's actual reach.",
            "You've seen the ANR-causing failure mode before, back in module 19: block the main thread with something slow — a heavy computation, a synchronous disk read — and Android eventually gives up waiting.",
          ],
        },
        {
          type: "text",
          md: [
            "## R8 obfuscates your crashes too — mapping.txt un-does it",
            "Module 19 introduced R8 as the release-build shrinker that also **renames classes, methods, and fields** to shorter, obfuscated names. That's great for APK size, terrible for reading a crash: a stack trace from a real user's obfuscated release build shows meaningless names like `a.b.c` instead of `WalkRepository.refresh`.",
            "R8 writes a **`mapping.txt`** file for every release build — the Rosetta Stone between obfuscated names and your real ones. Upload that exact `mapping.txt` (matched to the exact `versionCode` that produced it) to the Play Console, and Android vitals **de-obfuscates crash stack traces automatically**, showing you the real class and method names instead of gibberish. Skip the upload, and every crash report from that release stays unreadable.",
          ],
        },
        {
          type: "code",
          title: "A crash trace, before and after mapping.txt",
          source: String.raw`// Obfuscated — what Play shows without mapping.txt uploaded:
Fatal Exception: java.lang.NullPointerException
  at a.b.c.a(Unknown Source:14)
  at a.b.d.onCreate(Unknown Source:3)

// De-obfuscated — the same crash, after mapping.txt for this versionCode:
Fatal Exception: java.lang.NullPointerException
  at com.pawwalk.android.data.WalkRepository.refresh(WalkRepository.kt:14)
  at com.pawwalk.android.ui.MainActivity.onCreate(MainActivity.kt:3)`,
          caption: "Same crash, same device, same user — the only difference is whether Play had the mapping.txt for that exact release. Without it, \"a.b.c.a\" tells you nothing; with it, you're looking straight at WalkRepository.refresh, line 14.",
        },
        {
          type: "quiz",
          q: "What does uploading mapping.txt to the Play Console actually do?",
          choices: [
            "It prevents your app from crashing",
            "It stops R8 from obfuscating the next release",
            "It lets Android vitals translate obfuscated class/method names in crash stack traces back into your real Kotlin names, for that specific versionCode's build",
            "It reduces your app's APK size further",
          ],
          answer: 2,
          explain: "mapping.txt is purely a translation table — generated once per release build by R8, tied to that build's exact versionCode. Upload it and Play can show you `WalkRepository.refresh` instead of `a.b.c.a` in crash reports. It has no effect on whether crashes happen or how big the app is.",
          nudge: "R8 renamed things going one direction (real name → short obfuscated name) when it built the release. What file lets you go back the other way?",
        },
        {
          type: "quiz",
          q: "A dog walker reports the app \"freezes\" mid-walk and Android eventually offers to close it. What is this, and what's the likely cause?",
          choices: [
            "A crash — caused by an uncaught exception on a background thread",
            "An ANR — the main thread has been blocked (not responding to input) for roughly 5 seconds, likely from slow work running where it shouldn't (a heavy computation or synchronous I/O on the main thread)",
            "Normal behavior — Android always asks before closing any app",
            "A network timeout, unrelated to the main thread",
          ],
          answer: 1,
          explain: "\"Freezes, then Android offers to force-close it\" is the textbook ANR dialog, not a crash (a crash just terminates, no dialog with a choice). The main thread — the one drawing frames and handling touch, same one from module 19's frame budget — got blocked for around 5 seconds by something that should have been off the main thread.",
          nudge: "A crash just closes the app immediately. This scenario describes Android itself offering a choice after a delay — what's that specific behavior called, and which thread does it watch?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "graduation",
      title: "Graduation & the system-design interview",
      steps: [
        {
          type: "text",
          md: [
            "## From `val name = \"Mochi\"` to a shipped app",
            "Trace the whole arc. Module 1 was a single `val` and a `print` statement. Now: a **feature-modularized**, **offline-first** Compose app — Room as the single source of truth, WorkManager syncing queued writes through process death, a **foreground GPS service** tracking a live walk even with the screen off, **Hilt** wiring every dependency without a single `new SomeRepository(...)` by hand, a test pyramid (module 18) catching regressions before a user ever sees them, a Baseline Profile making the very first launch feel fast (module 19) — and now, in this module, a real `.aab` moving through Play's tracks with a staged rollout and Android vitals watching its health in production.",
            "That's not a toy app anymore. That's the same shape as the real, professional Android codebases this course was built to prepare you for.",
          ],
        },
        {
          type: "text",
          md: [
            "## A primer: the mobile system-design interview",
            "Senior Android interviews increasingly include a **system-design** round — not \"reverse a linked list,\" but \"design the architecture for a feature like Instagram's feed\" or \"design an offline-first note-taking app.\" You already own every pattern these questions are built around:",
            "- **\"How would you handle no network?\"** → single-source-of-truth repository (module 14): the UI reads a local database, a sync layer's only job is to keep that database fresh. You answer with Room + a repository, not a spinner and a prayer.\n- **\"How would you page a huge list without loading it all into memory?\"** → **pagination** — fetch a page at a time, keyed by a cursor or offset, same shape as any `LazyColumn` backed by paged network calls.\n- **\"How would you avoid hammering the network for data that barely changes?\"** → **caching** — exactly what the Room table already gives you for free, since reads never touch the network directly.\n- **\"What if the write needs to survive the app closing?\"** → **WorkManager** (module 14) — durable, constraint-aware, retryable background work.\n- **\"How do you keep tracking a walk if the user locks their phone?\"** → a **foreground service** (module 17) — the only way Android lets you keep doing meaningful work, with a visible notification, while backgrounded.\n- **\"How do you keep the codebase sane as the team and app grow?\"** → **modularization** (module 16) — feature modules with clear boundaries, so ten engineers aren't all editing the same 4,000-line file.",
            "Walking into that kind of interview, you're not memorizing buzzwords — you're describing decisions you already made and justified, module by module, in a real app.",
          ],
        },
        {
          type: "quiz",
          q: "An interviewer asks: \"Design a note-taking app that has to work with no internet connection, syncing changes whenever connectivity comes back.\" Which pair of tools from this course is the core of a strong answer?",
          choices: [
            "A single giant Activity with all logic inline, plus a 30-second polling loop",
            "Room as the local single source of truth (the UI reads it, never the network directly) plus WorkManager for durable, constraint-gated sync of pending writes",
            "Just cache everything in a mutable list in the ViewModel — no persistence needed",
            "Retrofit alone, with a longer timeout so slow connections still work",
          ],
          answer: 1,
          explain: "This is module 14's whole thesis restated as an interview question: a local database (Room) as the single source of truth for reads, so the UI works offline, and a durable, network-constrained work queue (WorkManager) for writes that must survive process death and retry once connectivity returns. Every other option either has no offline story or no durability story.",
          nudge: "Which two systems, together, gave PawWalk both \"the UI still shows something with no network\" AND \"a pending write survives the app getting killed\"?",
        },
        {
          type: "text",
          md: [
            "## Where to go next",
            "This course drew one deliberately narrow path through Android so every module had a clear reason to exist. To go deeper from here:",
            "- **[Android Developers — Modern Android Development](https://developer.android.com/modern-android-development)** — Google's own architecture and best-practices guidance, the same guidance modules 14–16 pulled from.\n- **[Now in Android](https://github.com/android/nowinandroid)** — a real, current, open-source sample app built at a scale bigger than PawWalk, applying every pattern from this course and more.\n- **`docs/learning/android.md`** in this repo — the original plan this course grew from, with stretch goals worth chasing next: richer Compose animations, a second foreground-service use case, a full mobile system-design mock interview.",
            "> **Challenge:** pick one system-design prompt above — pagination, or a from-scratch offline note app — and actually build a tiny version of it in a scratch project. Reading the pattern got you this far; building it once, unassisted, is what makes it yours in an interview.",
          ],
        },
        {
          type: "quiz",
          q: "Last question of the whole course. What actually changed between module 1's `val name = \"Mochi\"` and the app you have now?",
          choices: [
            "Nothing fundamental — it's still just Kotlin syntax, only with more files",
            "You went from writing isolated language syntax to combining it into deliberate architecture: where state lives, how data flows offline-to-online, how work survives the app dying, and how a team of modules stays maintainable",
            "The app just has more screens; the underlying skill is unchanged since module 1",
            "You memorized more Jetpack library APIs, which is the whole of what \"senior\" means",
          ],
          answer: 1,
          explain: "Every module after the first few stopped teaching new syntax and started teaching decisions: where does truth live (Room), how does a write survive death (WorkManager), how does tracking survive backgrounding (a foreground service), how does the codebase survive growth (modularization). That shift — from syntax to architecture — is exactly what separates knowing a language from being able to design with it. Congratulations, graduate.",
          nudge: "Think about what modules 14 through 20 were actually teaching — new Kotlin keywords, or new answers to \"where does this responsibility belong\"?",
        },
      ],
    },
  ],
});
