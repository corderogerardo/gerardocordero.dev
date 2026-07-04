// Module 16 — Modularize by Feature (Android track). See ../lessons/FORMAT.md
// and ./FORMAT-KOTLIN.md for the schema and Kotlin-specific traps.
window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "feature-modules-android",
  title: "Modularize by Feature",
  emoji: "🧱",
  lang: "kotlin",
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    {
      id: "one-module-hurts",
      title: "One module hurts",
      steps: [
        {
          type: "text",
          md: [
            "## Everything in `:app` means everything rebuilds",
            "PawWalk has grown a lot since module 4: Compose screens, coroutines and `Flow`, a Room cache, Hilt wiring. If all of that still lives in one Gradle module — `:app` — then changing one line in the bookings screen forces Gradle to recompile the *entire* app: auth, tracking, the design system, all of it. On a small app that's a few seconds. On a real app, that's minutes, every time, for every developer.",
            "A single module also has no enforced boundaries. Nothing stops the bookings screen from reaching directly into auth's internals, or the design system from quietly depending on the network layer. Over time those shortcuts turn the codebase into a ball of mud where nothing can change without touching everything else.",
          ],
        },
        {
          type: "text",
          md: [
            "## The Now in Android layering",
            "Google's Now in Android sample app splits into three kinds of Gradle modules, stacked in layers:",
            "- **`:app`** — the thin top layer. Wires everything together: navigation, DI setup, the `Application` class. Almost no feature logic of its own.\n- **`:feature:*`** — one module per user-facing feature. `:feature:bookings`, `:feature:auth`, `:feature:tracking` — each owns its own screens, ViewModels, and feature-specific logic.\n- **`:core:*`** — shared foundations at the base. `:core:data` (repositories), `:core:network` (Retrofit/API client), `:core:designsystem` (shared Compose components, colors, typography).",
            "**A module only depends downward.** `:app` depends on `:feature:*` and `:core:*`. A `:feature:*` module depends on `:core:*` modules it needs. `:core:*` modules depend on other `:core:*` modules at most — never on a `:feature:*` module, and never on `:app`. Draw the dependency arrows and they only ever point down the stack, never up or sideways between features.",
          ],
        },
        {
          type: "code",
          title: "settings.gradle.kts",
          source: String.raw`rootProject.name = "PawWalk"

include(
    ":app",
    ":feature:bookings",
    ":feature:auth",
    ":feature:tracking",
    ":core:data",
    ":core:network",
    ":core:designsystem",
)`,
          caption: "Every module in the build has to be listed here once — this is the map Gradle uses to find each module's own `build.gradle.kts`.",
        },
        {
          type: "quiz",
          q: "Which direction are dependencies allowed to point in this layering?",
          choices: [
            "Core modules depend on feature modules, since features are more specific",
            "Feature modules depend downward on core modules — never the other way, and never feature-to-feature",
            "It doesn't matter, as long as everything eventually compiles",
            ":app depends on nothing; every module depends on :app",
          ],
          answer: 1,
          explain: "Dependencies point down the stack: :app depends on :feature:* and :core:*, :feature:* depends on :core:*, and :core:* modules depend on other :core:* modules at most. A core module never depends on a feature module.",
          nudge: "Which layer is described as \"shared foundations at the base\" — and would a foundation ever depend on something built on top of it?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "api-vs-implementation",
      title: "api vs implementation",
      steps: [
        {
          type: "text",
          md: [
            "## Two ways to declare a module dependency",
            "Splitting into modules only pays off if changing one module doesn't force every *other* module to recompile too. That's what Gradle's two dependency configurations control:",
            "- **`implementation(project(...))`** — the dependency is used internally but hidden from anything that depends on *you*. If `:feature:bookings` uses `implementation(project(\":core:network\"))`, then `:app` (which depends on `:feature:bookings`) has no idea `:core:network` even exists — and can't accidentally reach into it.\n- **`api(project(...))`** — the dependency leaks through. Anything that depends on you can also see and use it directly, transitively.",
            "**Default to `implementation`.** It gives Gradle a smaller, more precise picture of what actually needs rebuilding when something changes — change `:core:network` and only the modules that `implementation`-depend on it (plus anything whose *public* API changed) need to recompile, not every module transitively downstream. Reach for `api` only when a type from that dependency appears in your own module's public function signatures — otherwise everyone downstream pays for a dependency they never asked for.",
          ],
        },
        {
          type: "code",
          title: "feature/bookings/build.gradle.kts",
          source: String.raw`plugins {
    id("pawwalk.android.feature")
}

dependencies {
    implementation(project(":core:data"))
    implementation(project(":core:designsystem"))

    // BookingSummary appears in a public function signature below,
    // so anything using this module needs to see :core:model too.
    api(project(":core:model"))
}`,
          caption: "`fun bookingRow(summary: BookingSummary)` being public means `BookingSummary`'s defining module (`:core:model`) has to be `api`, or callers can't even name the type they're passing in.",
        },
        {
          type: "exercise",
          title: "Depend on the network core",
          prompt: [
            "`:feature:auth` needs `:core:network` internally to make login calls, but never exposes any network type in its own public API. Add the dependency:",
            "1. Inside the `dependencies { }` block.\n2. `implementation(project(\":core:network\"))`.",
          ],
          starter: String.raw`dependencies {
    implementation(project(":core:designsystem"))
    // your code here
}`,
          solution: String.raw`dependencies {
    implementation(project(":core:designsystem"))
    implementation(project(":core:network"))
}`,
          checks: [
            { re: /implementation\(project\(":core:network"\)\)/, hint: "Use `implementation(project(\":core:network\"))` — a project dependency, wrapped in `project(...)`." },
          ],
          mustNot: [
            { re: /api\(project\(":core:network"\)\)/, hint: "Use `implementation`, not `api` — auth doesn't put any network type in its own public signatures, so there's nothing to leak through." },
          ],
          success: "That's a correctly-scoped module dependency — :core:network stays hidden from anything that depends on :feature:auth.",
        },
        {
          type: "quiz",
          q: "When should you reach for api(...) instead of implementation(...)?",
          choices: [
            "Whenever the dependency is important to how the module works internally",
            "Only when a type from that dependency shows up in your own module's public function signatures, so callers need to see it too",
            "Always — api is the modern default and implementation is deprecated",
            "Never — api(...) is only for the :app module",
          ],
          answer: 1,
          explain: "api leaks a dependency transitively to anyone who depends on you — worth it only when your own public API exposes a type from that dependency. Everything else should be implementation, so changes stay contained to the smallest possible set of modules.",
          nudge: "Think about the BookingSummary example — why did that one specifically need api instead of implementation?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "convention-plugins",
      title: "Convention plugins",
      steps: [
        {
          type: "text",
          md: [
            "## Every module repeats the same config",
            "With a dozen-plus modules, each `build.gradle.kts` needs roughly the same boilerplate: `compileSdk`, `minSdk`, Kotlin compiler options, the Compose compiler setup, common test dependencies. Copy-pasting that into every module means when it needs to change — bumping `compileSdk`, say — you're hand-editing a dozen files and hoping you didn't miss one.",
            "**Convention plugins** solve this: write the shared config *once*, as a Gradle plugin, then have each module apply it by id. The plugin lives in a special included build — by convention, a directory named **`build-logic`** — which Gradle builds first and makes available to the rest of the project as if it were a published plugin.",
          ],
        },
        {
          type: "code",
          title: "build-logic/convention/src/.../AndroidFeatureConventionPlugin.kt",
          source: String.raw`class AndroidFeatureConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) {
        with(target) {
            pluginManager.apply("com.android.library")
            pluginManager.apply("org.jetbrains.kotlin.android")

            extensions.configure<LibraryExtension> {
                compileSdk = 35
                defaultConfig.minSdk = 26
            }

            dependencies {
                add("implementation", project(":core:designsystem"))
                add("testImplementation", "junit:junit:4.13.2")
            }
        }
    }
}`,
          caption: "This is a normal Kotlin class implementing Gradle's `Plugin<Project>` — the `Project` it's handed is the module that applies it, so `compileSdk = 35` here means \"every feature module gets `compileSdk = 35`\" without repeating that line anywhere else.",
        },
        {
          type: "code",
          title: "feature/bookings/build.gradle.kts",
          source: String.raw`plugins {
    id("pawwalk.android.feature")
}

dependencies {
    implementation(project(":core:data"))
}`,
          caption: "One `id(...)` line and the module inherits everything the convention plugin configures — `compileSdk`, `minSdk`, the shared test dependency, all of it — with zero of that config actually written in this file.",
        },
        {
          type: "exercise",
          title: "Apply the feature convention plugin",
          prompt: [
            "`:feature:tracking`'s `build.gradle.kts` needs to apply the `pawwalk.android.feature` convention plugin so it inherits the shared Android/Kotlin setup:",
            "1. A `plugins { }` block.\n2. `id(\"pawwalk.android.feature\")` inside it.",
          ],
          starter: String.raw`// your code here

dependencies {
    implementation(project(":core:data"))
}`,
          solution: String.raw`plugins {
    id("pawwalk.android.feature")
}

dependencies {
    implementation(project(":core:data"))
}`,
          checks: [
            { re: /plugins\{/, hint: "Add a `plugins { }` block at the top of the file." },
            { re: /id\("pawwalk\.android\.feature"\)/, hint: "Apply the plugin by its id: `id(\"pawwalk.android.feature\")`." },
          ],
          success: "That's the whole file — one plugin id replaces a dozen lines of repeated Android/Kotlin config.",
        },
        {
          type: "quiz",
          q: "What does a convention plugin remove from every module that applies it?",
          choices: [
            "The need to declare any dependencies at all",
            "The repeated boilerplate config (compileSdk, Kotlin options, common test deps) that would otherwise be copy-pasted into every module's build.gradle.kts",
            "The ability to add module-specific dependencies",
            "The requirement to list the module in settings.gradle.kts",
          ],
          answer: 1,
          explain: "A convention plugin centralizes the shared setup — compileSdk, minSdk, compiler options, common dependencies — into one place. Modules still declare their own module-specific dependencies; they just skip re-writing the boilerplate every one of them needs anyway.",
          nudge: "Compare the two code blocks above — what did applying the plugin let the module's build file skip writing?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "wiring-features-into-app",
      title: "Wiring features into :app",
      steps: [
        {
          type: "text",
          md: [
            "## :app is the thinnest module in the project",
            "`:app` sits at the top of the stack and depends on every `:feature:*` module. Its job is small on purpose: hold the `Application` class (`@HiltAndroidApp`, from module 15), host the navigation graph, and wire feature screens together. It should contain almost no feature logic of its own — that all lives one layer down.",
            "For `:app` to build a nav graph, each feature module has to expose a **public API**: typically a screen composable and a nav route, both meant to be called from outside the module. Everything else inside a feature module — its ViewModels, its internal composables, its Hilt modules — stays `internal` or simply undeclared in any other module's dependencies, so nothing outside can reach in and depend on implementation details that are free to change.",
            "This ties back to Hilt (module 15): each `:feature:*` module can define its own `@Module`/`@InstallIn` bindings, and Hilt merges all of them into one graph at the `:app` level — no module needs to know about any other feature's DI setup.",
          ],
        },
        {
          type: "code",
          title: "app/build.gradle.kts",
          source: String.raw`plugins {
    id("pawwalk.android.application")
}

dependencies {
    implementation(project(":feature:bookings"))
    implementation(project(":feature:auth"))
    implementation(project(":feature:tracking"))

    implementation(project(":core:designsystem"))
}`,
          caption: "`:app` never depends on a feature's *internals* — only on the public screen composable and route each feature module exposes, wired together in a `NavHost` inside `:app` itself.",
        },
        {
          type: "exercise",
          title: "Wire the bookings feature into :app",
          prompt: [
            "Add `:feature:bookings` as a dependency of `:app` so its screen can be added to the nav graph:",
            "1. Inside the `dependencies { }` block.\n2. `implementation(project(\":feature:bookings\"))`.",
          ],
          starter: String.raw`dependencies {
    implementation(project(":feature:auth"))
    // your code here
}`,
          solution: String.raw`dependencies {
    implementation(project(":feature:auth"))
    implementation(project(":feature:bookings"))
}`,
          checks: [
            { re: /implementation\(project\(":feature:bookings"\)\)/, hint: "Use `implementation(project(\":feature:bookings\"))` — a project dependency on the bookings feature module." },
          ],
          success: "That's :app wired up to bookings — its screen composable and nav route are now visible for the nav graph to use.",
        },
        {
          type: "quiz",
          q: "Why should a feature module never depend on another feature module directly?",
          choices: [
            "Gradle doesn't technically allow feature-to-feature dependencies",
            "It would couple two features together and force one to rebuild whenever the other changes — defeating the whole point of splitting them apart; shared needs belong in a :core module both can depend on downward",
            "Feature modules can only ever depend on :app",
            "It would make the app's APK larger",
          ],
          answer: 1,
          explain: "The entire benefit of feature modules is that changing bookings shouldn't force auth or tracking to recompile. A direct feature-to-feature dependency reintroduces exactly the coupling modularization was meant to remove. If two features need the same thing, that thing belongs in a :core module both depend on downward — never sideways between features.",
          nudge: "Think back to the one-module problem from the first lesson — what did splitting into modules set out to fix, and what would a feature-to-feature dependency bring back?",
        },
      ],
    },
  ],
});
