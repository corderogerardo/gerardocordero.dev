// Module 15 — Dependency Injection with Hilt (Android track). See ../lessons/FORMAT.md
// and ./FORMAT-KOTLIN.md for the schema and Kotlin-specific traps.
window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "hilt-di-android",
  title: "Dependency Injection with Hilt",
  emoji: "🧩",
  lang: "kotlin",
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    {
      id: "wiring-by-hand",
      title: "Wiring by hand does not scale",
      steps: [
        {
          type: "text",
          md: [
            "## Every object needs its parts handed to it",
            "A `WalkersViewModel` needs a `WalkerRepository`. That repository needs a `PawWalkApi`. The API needs an `OkHttpClient`. None of these build themselves — something, somewhere, has to construct each one and pass it down to the next. That's **dependency injection (DI)**: a class receives (is \"injected with\") the things it depends on, instead of constructing them itself.",
            "You've been doing DI by hand since module 10 — passing a repository into a ViewModel's constructor is already DI. The problem isn't the idea, it's the bookkeeping. Add a screen, and you need a new ViewModel, which needs the same repository, which needs the same API and client. Multiply that by every screen in PawWalk and you're hand-writing (and hand-maintaining) a factory function for the whole object graph.",
          ],
        },
        {
          type: "code",
          title: "By hand vs. constructor injection",
          source: String.raw`// By hand: a factory function you write and maintain yourself
object AppContainer {
    val client = OkHttpClient()
    val api = Retrofit.Builder().client(client).build().create(PawWalkApi::class.java)
    val repository = WalkerRepository(api)
    fun makeWalkersViewModel() = WalkersViewModel(repository)
}

// Constructor injection: the class just DECLARES what it needs
class WalkersViewModel(
    private val repository: WalkerRepository,
) : ViewModel() {
    // ...
}`,
          caption: "The ViewModel's constructor never changes between the two approaches — it always just asks for a `WalkerRepository`. What changes is who builds that repository and hands it over. `AppContainer` is code you write once and then keep editing forever; Hilt generates the equivalent wiring at compile time from annotations alone.",
        },
        {
          type: "text",
          md: [
            "## What Hilt actually is",
            "**Hilt** is Android's DI library, built on top of **Dagger**. You annotate a class to say \"I need one of these,\" and Hilt generates the factory code that builds it and hands it to whoever asked — at compile time, so a missing dependency is a build error, not a crash three taps into a demo.",
            "Nothing here is magic at runtime: Hilt reads your annotations once, during compilation, and writes plain Kotlin classes that do exactly what `AppContainer` did by hand above. You get the hand-written factory's behavior without hand-writing (or hand-maintaining) it.",
          ],
        },
        {
          type: "quiz",
          q: "What does \"dependency injection\" mean?",
          choices: [
            "A class constructs all of its own dependencies internally",
            "Something outside the class supplies its dependencies — the class just declares what it needs, usually via its constructor",
            "A design pattern for injecting bugs during testing",
            "A way to inject SQL queries into a Room database",
          ],
          answer: 1,
          explain: "DI flips construction around: instead of a class saying \"give me a WalkerRepository, so let me build a PawWalkApi, so let me build an OkHttpClient...\", it just declares a WalkerRepository parameter and trusts something else to supply one.",
          nudge: "Look at the ViewModel in the code above — does it build its own repository, or does it just ask for one in its constructor?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "hiltandroidapp-inject-module",
      title: "HiltAndroidApp, Inject, Module",
      steps: [
        {
          type: "text",
          md: [
            "## Three annotations turn on the whole system",
            "**`@HiltAndroidApp`** goes on your `Application` subclass — exactly one, app-wide. It's the switch that turns Hilt on: it triggers the code generation for the app-level container everything else hangs off of.",
            "**`@Inject` on a constructor** is for classes you **own** — your own Kotlin source, like `WalkerRepository` or a ViewModel. Annotate the constructor, and Hilt knows how to build one whenever something asks for it, automatically supplying whatever *its* constructor asks for in turn.",
            "**`@Module` + `@Provides`** is for classes you do **not** own — `Retrofit`, `OkHttpClient`, the Room `Database` — third-party or SDK types you can't add an `@Inject` annotation to because you don't control their source. A `@Module` is a Kotlin object holding `@Provides` functions that build those types by hand, once, and hand the result to Hilt. Every module needs `@InstallIn(SingletonComponent::class)` telling Hilt which container the bindings live in.",
          ],
        },
        {
          type: "code",
          title: "di/NetworkModule.kt",
          source: String.raw`@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    fun provideOkHttpClient(): OkHttpClient =
        OkHttpClient.Builder().build()

    @Provides
    fun provideRetrofit(client: OkHttpClient): Retrofit =
        Retrofit.Builder()
            .baseUrl("https://api.pawwalk.example/")
            .client(client)
            .addConverterFactory(MoshiConverterFactory.create())
            .build()
}`,
          caption: "Each `@Provides` function's parameters are themselves resolved by Hilt — `provideRetrofit` asks for an `OkHttpClient` and gets the one `provideOkHttpClient` just built, no wiring code required on your part.",
        },
        {
          type: "exercise",
          title: "Provide the PawWalk API",
          prompt: [
            "Add a third `@Provides` function to `NetworkModule` that builds a `PawWalkApi` from a `Retrofit` parameter:",
            "1. Annotate it `@Provides`.\n2. `fun providePawWalkApi(retrofit: Retrofit): PawWalkApi`.\n3. Body: `retrofit.create(PawWalkApi::class.java)`.",
          ],
          starter: String.raw`@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    fun provideRetrofit(client: OkHttpClient): Retrofit =
        Retrofit.Builder().client(client).build()

    // your code here
}`,
          solution: String.raw`@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    fun provideRetrofit(client: OkHttpClient): Retrofit =
        Retrofit.Builder().client(client).build()

    @Provides
    fun providePawWalkApi(retrofit: Retrofit): PawWalkApi =
        retrofit.create(PawWalkApi::class.java)
}`,
          checks: [
            { re: /@Provides\s*fun providePawWalkApi\(retrofit:Retrofit\):PawWalkApi/, hint: "Declare `@Provides fun providePawWalkApi(retrofit: Retrofit): PawWalkApi`." },
            { re: /retrofit\.create\(PawWalkApi::class\.java\)/, hint: "Build it with `retrofit.create(PawWalkApi::class.java)`." },
          ],
          mustNot: [
            { re: /class NetworkModule/, hint: "Keep the module as `object NetworkModule` — modules with only `@Provides` functions don't need instance state." },
          ],
          success: "That's a real Hilt provider — Hilt now knows how to build a PawWalkApi for anything that asks.",
        },
        {
          type: "quiz",
          q: "You've written a plain Kotlin class `WalkerRepository(api: PawWalkApi)` in your own module. Do you need a `@Provides` function for it?",
          choices: [
            "Yes, every type needs a @Provides function somewhere",
            "No — annotate its constructor with @Inject instead; @Provides is only for types you don't own and can't annotate directly",
            "No, Hilt only injects ViewModels",
            "Yes, but only if it has more than one constructor parameter",
          ],
          answer: 1,
          explain: "You own WalkerRepository's source, so `@Inject constructor(...)` is enough — Hilt reads that annotation directly and knows how to build it. @Provides exists specifically for the cases where you can't add an annotation to the class itself: Retrofit, OkHttpClient, Room's Database, anything from a library.",
          nudge: "Provides functions build things you can't put an @Inject annotation on. Can you edit WalkerRepository's source? Then can you edit Retrofit's?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "scopes-hiltviewmodel",
      title: "Scopes & HiltViewModel",
      steps: [
        {
          type: "text",
          md: [
            "## One instance for the app, or a fresh one each time",
            "By default, every `@Inject` or `@Provides` binding gives out a **brand-new instance** every time something asks. That's fine for something cheap and stateless — but `WalkerRepository` holds the `Flow` the whole app reads walk data from (module 14); if every ViewModel got its *own* repository instance, they'd each be watching a different in-memory object and could disagree.",
            "**`@Singleton`** fixes that: one instance for the lifetime of the whole app, shared by everyone who asks. Put `@Singleton` next to `@Inject constructor` on `WalkerRepository` itself, or on a `@Provides` function, and Hilt builds it once and hands out that same instance forever after.",
          ],
        },
        {
          type: "text",
          md: [
            "## Why the ViewModel is NOT a Singleton",
            "A ViewModel is scoped to a screen, not the whole app — `WalkersViewModel` should die when the walkers screen is popped off the back stack, not live forever. Hilt handles this with a dedicated annotation instead of a scope: **`@HiltViewModel`** on the class, plus `@Inject constructor` as usual. Jetpack ViewModel's own lifecycle (survives rotation, dies with the screen) still applies — Hilt just handles building it with its dependencies already filled in.",
            "In a composable, you never construct a `@HiltViewModel` with `WalkersViewModel(repository)` — you ask for one with **`hiltViewModel()`**, and Hilt resolves the whole chain (repository, api, client) for you.",
          ],
        },
        {
          type: "code",
          title: "ui/walkers/WalkersViewModel.kt",
          source: String.raw`@HiltViewModel
class WalkersViewModel @Inject constructor(
    private val repository: WalkerRepository,
) : ViewModel() {
    val walkers: StateFlow<List<Walker>> = repository.walkers
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
}

@Composable
fun WalkersScreen(viewModel: WalkersViewModel = hiltViewModel()) {
    val walkers by viewModel.walkers.collectAsState()
    // ...
}`,
          caption: "`@Inject` goes on the constructor itself, not just the class — that's what tells Hilt which constructor to call. `hiltViewModel()` is the Compose-side counterpart: it's how a composable asks Hilt for the fully-wired instance instead of building one by hand.",
        },
        {
          type: "exercise",
          title: "Wire up WalkersViewModel",
          prompt: [
            "Annotate a `WalkersViewModel` class for Hilt, taking a `WalkerRepository`:",
            "1. `@HiltViewModel` on the class.\n2. `class WalkersViewModel @Inject constructor(private val repository: WalkerRepository) : ViewModel() { }`.",
          ],
          starter: String.raw`// your code here
class WalkersViewModel(
    private val repository: WalkerRepository,
) : ViewModel() {
}`,
          solution: String.raw`@HiltViewModel
class WalkersViewModel @Inject constructor(
    private val repository: WalkerRepository,
) : ViewModel() {
}`,
          checks: [
            { re: /@HiltViewModel/, hint: "Annotate the class with `@HiltViewModel`." },
            { re: /@Inject constructor\(/, hint: "Put `@Inject` directly on the constructor: `@Inject constructor(...)`." },
            { re: /private val repository:WalkerRepository/, hint: "Keep the constructor parameter `private val repository: WalkerRepository`." },
          ],
          mustNot: [
            { re: /@Singleton/, hint: "Don't scope the ViewModel with @Singleton — it should be screen-scoped, not one-per-app. @HiltViewModel already handles its lifecycle." },
          ],
          success: "That's a real Hilt-managed ViewModel — hiltViewModel() in a composable now knows how to build one.",
        },
        {
          type: "quiz",
          q: "What does @Singleton guarantee?",
          choices: [
            "The class can only ever have one property",
            "Exactly one instance of that binding is created and shared for the whole app's lifetime, instead of a fresh instance per injection site",
            "The class runs on the main thread only",
            "Only one screen at a time can use that class",
          ],
          answer: 1,
          explain: "@Singleton tells Hilt to build the instance once (the first time it's asked for) and hand that same instance to every subsequent injection — exactly what you want for a repository backing a Flow that multiple screens read from.",
          nudge: "Think about WalkerRepository specifically — what would go wrong if two ViewModels each got a *different* instance of it?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "swapping-fakes-in-tests",
      title: "Swapping fakes in tests",
      steps: [
        {
          type: "text",
          md: [
            "## Fakes over mocks",
            "Module 14 built `WalkerRepository` behind an interface — the ViewModel only ever calls `repository.walks`, never anything Room- or Retrofit-specific. That interface is what makes testing easy: instead of a mocking library faking method calls one by one, you write one small **`FakeWalkerRepository`** class implementing the interface with canned, in-memory data. A fake is real code that really runs — closer to production behavior, and far less brittle than a mock rebuilt every time a method signature changes.",
            "**`@HiltAndroidTest`** on a test class turns on Hilt's test support, generating a test-specific version of the app's dependency graph. From there, `@TestInstallIn` lets you swap one `@Module` for another *for the whole test source set* — so any test that would otherwise pull in the real `NetworkModule` gets your fake instead, with zero changes to `WalkersViewModel` or the composable.",
          ],
        },
        {
          type: "code",
          title: "androidTest/di/FakeRepositoryModule.kt",
          source: String.raw`@Module
@TestInstallIn(
    components = [SingletonComponent::class],
    replaces = [RepositoryModule::class],
)
object FakeRepositoryModule {
    @Provides
    @Singleton
    fun provideWalkerRepository(): WalkerRepository = FakeWalkerRepository(
        seed = listOf(Walker(id = "w1", name = "Sam", pricePer30MinCents = 2500)),
    )
}`,
          caption: "`replaces = [RepositoryModule::class]` names the production module this test module stands in for — Hilt refuses to build the graph if both are installed at once, which is exactly the guardrail you want.",
        },
        {
          type: "exercise",
          title: "Provide the fake repository",
          prompt: [
            "Fill in the `@Provides` function inside `FakeRepositoryModule` (already annotated `@Module`/`@TestInstallIn`):",
            "1. `@Provides` on the function.\n2. `fun provideWalkerRepository(): WalkerRepository = FakeWalkerRepository()`.",
          ],
          starter: String.raw`object FakeRepositoryModule {
    // your code here
}`,
          solution: String.raw`object FakeRepositoryModule {
    @Provides
    fun provideWalkerRepository(): WalkerRepository = FakeWalkerRepository()
}`,
          checks: [
            { re: /@Provides\s*fun provideWalkerRepository\(\):WalkerRepository/, hint: "Declare `@Provides fun provideWalkerRepository(): WalkerRepository`." },
            { re: /=FakeWalkerRepository\(\)/, hint: "Return a `FakeWalkerRepository()` instance." },
          ],
          mustNot: [
            { re: /RealWalkerRepository|WalkerRepositoryImpl/, hint: "Return the fake, not a real implementation — the whole point of the swap is to avoid hitting Room or the network in tests." },
          ],
          success: "That's the fake wired in — every test in this source set now gets canned data instead of a real database or network call.",
        },
        {
          type: "quiz",
          q: "Why does building WalkerRepository behind an interface (module 14) make this test swap trivial?",
          choices: [
            "It doesn't matter — Hilt can swap any class regardless of whether it implements an interface",
            "WalkersViewModel depends on the WalkerRepository type, not on a concrete Room/Retrofit-backed class — so any implementation, real or fake, satisfies it as long as Hilt is told which one to hand over",
            "Interfaces run faster than classes in tests",
            "Fakes only work with interfaces for syntax reasons",
          ],
          answer: 1,
          explain: "WalkersViewModel's constructor asks for a WalkerRepository — it has never known or cared whether that's backed by Room and Retrofit or by an in-memory list. Swapping which @Provides function answers that request is all @TestInstallIn has to do; the ViewModel and composable stay untouched.",
          nudge: "What type does WalkersViewModel's constructor actually declare for its dependency — the interface, or a specific Room/Retrofit-backed class?",
        },
      ],
    },
  ],
});
