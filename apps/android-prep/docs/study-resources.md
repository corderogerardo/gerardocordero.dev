# Study content sources

External reference repos used as source material when authoring new
flashcards, quiz questions, and study-guide sections for this app. These are
curated *inspiration and fact-checking references* — content here is
original, hand-written prose/code in `src/data/`, not copied from these
repos.

| Repo | What it is | Informed |
|---|---|---|
| [skydoves/android-developer-roadmap](https://github.com/skydoves/android-developer-roadmap) | A staged roadmap of Android developer skills, junior → senior. | Structuring the new content by seniority and filling roadmap gaps (Compose testing, modularization, DI at scale) in `advanced22.ts`. |
| [androiddevnotes/awesome-android-learning-resources](https://github.com/androiddevnotes/awesome-android-learning-resources) | Curated list of Android learning resources, blogs, and sample projects. | Cross-checking topic coverage and the curated-resources framing used in the new "learning from reference apps" study section. |
| [android/nowinandroid](https://github.com/android/nowinandroid) | Google's fully-modern, fully-modular reference app (Compose, Hilt, convention plugins, offline-first). | The "Now in Android architecture" flashcards/quiz/study section (`nia*` ids) — modularization strategy, convention plugins, offline-first sync. |
| [android/compose-samples](https://github.com/android/compose-samples) | Official Jetpack Compose sample apps (Jetsnack, Jetcaster, Reply, etc.) demonstrating idiomatic Compose patterns. | The Compose architecture patterns covered alongside `nia*` cards — shared-element transitions, adaptive layouts, state-hoisting patterns drawn from real samples. |
| [android/architecture-samples](https://github.com/android/architecture-samples) | "Android Architecture Blueprints" — the same to-do app implemented across MVVM/MVI/other architectures for comparison. | The MVVM-vs-MVI comparison study section and quiz (`arch22*` ids). |
| [ankidroid/Anki-Android](https://github.com/ankidroid/Anki-Android) | Long-running open-source Android app implementing SM-2 spaced repetition, widely used as a real-world large-codebase case study. | The "reading a real open-source Android codebase" flashcards — SM-2 scheduling, WorkManager-driven reminders, and surviving process death in a mature app. |

## Adding more

Drop new source repos in the table above with a one-line description and
which file/section they informed, then author the content per the
"Study engine" / data-file conventions in the root `CLAUDE.md`.
