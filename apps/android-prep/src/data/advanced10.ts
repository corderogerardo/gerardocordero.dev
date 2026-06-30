// Batch 10 — Hilt component hierarchy and scopes, @AssistedInject, multibindings (@IntoSet/@IntoMap), Dagger modules vs Hilt entry points, and testing with Hilt (HiltAndroidRule, @TestInstallIn).
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";

export const ADVANCED10_FLASHCARDS: Flashcard[] = [
  {
    id: "a10-di-1",
    category: "di",
    categoryLabel: "DI",
    question: `Why does Hilt require an Application class annotated with @HiltAndroidApp, and what does it actually generate?`,
    answerHtml: `<p><code>@HiltAndroidApp</code> triggers generation of a base class (e.g. <code>Hilt_MyApplication</code>) that the real <code>Application</code> extends. That generated class creates and owns the <b>SingletonComponent</b> at <code>Application.onCreate()</code>/attach time, making it the root of the entire component tree. Without it, there's no top-level component for every other generated component (Activity, Fragment, ViewModel, etc.) to parent off of, so none of Hilt's injection works anywhere in the app.</p>`,
  },
  {
    id: "a10-di-2",
    category: "di",
    categoryLabel: "DI",
    question: `Order the standard Hilt component hierarchy from root to leaf, and note which ones can have multiple live instances simultaneously.`,
    answerHtml: `<p><code>SingletonComponent</code> (Application) → <code>ActivityRetainedComponent</code> (survives config change) → <code>ActivityComponent</code> → <code>FragmentComponent</code>/<code>ViewComponent</code> → <code>ViewWithFragmentComponent</code>. Separately, <code>ServiceComponent</code> and <code>ViewModelComponent</code> (used by Hilt-generated ViewModels, child of <code>ActivityRetainedComponent</code>) also hang off that tree. Only one <code>SingletonComponent</code> exists per process, but multiple <code>ActivityComponent</code>s can be alive at once (e.g. two activities in split-screen or one finishing while another starts), each with its own instance graph.</p>`,
  },
  {
    id: "a10-di-3",
    category: "di",
    categoryLabel: "DI",
    question: `An Activity is destroyed and recreated for a configuration change. What happens to bindings scoped @ActivityScoped vs scoped to ActivityRetainedComponent?`,
    answerHtml: `<p><code>@ActivityScoped</code> instances are recreated — they live in <code>ActivityComponent</code>, which is destroyed and rebuilt with the Activity. Bindings installed in <code>ActivityRetainedComponent</code> (annotated <code>@ActivityRetainedScoped</code>) survive the recreation: that component is backed by a non-configuration-instance retained via a hidden <code>ViewModel</code> internally, so it outlives the Activity instance across rotation and is only destroyed when the Activity actually finishes.</p>`,
  },
  {
    id: "a10-di-4",
    category: "di",
    categoryLabel: "DI",
    question: `Why can't a binding scoped to ActivityComponent be injected into a ViewModel?`,
    answerHtml: `<p>Hilt-generated <code>ViewModel</code>s are created via <code>HiltViewModelFactory</code>/<code>@HiltViewModel</code> against <code>ViewModelComponent</code> (a child of <code>ActivityRetainedComponent</code>, not of <code>ActivityComponent</code>). Since a ViewModel can outlive any single Activity instance across configuration changes, it structurally cannot depend on a narrower-scoped component — Dagger enforces this at compile time: you simply cannot request an <code>@ActivityScoped</code> binding from a component that isn't a descendant of <code>ActivityComponent</code> in that direction.</p>`,
  },
  {
    id: "a10-di-5",
    category: "di",
    categoryLabel: "DI",
    question: `What's the practical difference between @Singleton and @ActivityRetainedScoped for a repository that should persist across the whole user session but be recreated per login?`,
    answerHtml: `<p><code>@Singleton</code> ties the instance to the process — it lives as long as the app process does, with no built-in way to discard it except killing the process. <code>@ActivityRetainedScoped</code> ties it to the lifetime of a 'logical' activity session (survives rotation, dies with the activity/task). Neither maps cleanly to 'per login session' — that's a manual scope you build yourself (e.g. a custom <code>@LoginScoped</code> component via Hilt's custom-component support, or simply clearing/recreating a singleton's internal state on logout) since login lifetime doesn't correspond to any built-in Android component lifecycle.</p>`,
  },
  {
    id: "a10-di-6",
    category: "di",
    categoryLabel: "DI",
    question: `What problem does @AssistedInject solve that constructor injection alone cannot?`,
    answerHtml: `<p>Constructor injection requires every parameter to be resolvable from the dependency graph at graph-build time. <code>@AssistedInject</code> lets a class take a mix of graph-provided dependencies and runtime-only values (e.g. an item ID passed into a ViewModel, a view passed into a custom adapter) by marking the runtime values <code>@Assisted</code> and generating a factory interface (annotated <code>@AssistedFactory</code>) whose <code>create()</code> method takes only the assisted params and returns the fully-constructed object.</p>`,
  },
  {
    id: "a10-di-7",
    category: "di",
    categoryLabel: "DI",
    question: `Write the shape of an @AssistedFactory for a class needing both a Repository (injected) and an itemId: String (runtime).`,
    answerHtml: `<pre><code>class ItemViewModel @AssistedInject constructor(
    private val repo: ItemRepository,
    @Assisted private val itemId: String
) : ViewModel() {

    @AssistedFactory
    interface Factory {
        fun create(itemId: String): ItemViewModel
    }
}</code></pre><p>Hilt generates the implementation of <code>Factory</code>; you inject the <code>Factory</code> itself (it's available in whatever component the class would normally live in) and call <code>create(itemId)</code> at the call site to get the instance.</p>`,
  },
  {
    id: "a10-di-8",
    category: "di",
    categoryLabel: "DI",
    question: `If a class has two @Assisted parameters of the same type (e.g. two Strings), what breaks and how do you fix it?`,
    answerHtml: `<p>Dagger can't disambiguate two assisted params of the same type by type alone — it errors at compile time ('duplicate binding' style conflict within the assisted factory). Fix: give each <code>@Assisted</code> annotation a string value, e.g. <code>@Assisted("userId") userId: String</code> and <code>@Assisted("itemId") itemId: String</code>, and match those identifiers on the corresponding factory method parameters (parameter names/annotation values must align, not just types).</p>`,
  },
  {
    id: "a10-di-9",
    category: "di",
    categoryLabel: "DI",
    question: `Can an @AssistedInject constructor be scoped (e.g. @ActivityScoped)?`,
    answerHtml: `<p>No. Assisted-injected types are inherently 'new instance per <code>create()</code> call' — scoping would contradict that, since a scope means Dagger caches and reuses a single instance per component instance. Applying a scope annotation to an <code>@AssistedInject</code> constructor is a Dagger/Hilt compile error. If you need a cached instance, scope the <i>factory</i>'s consumer logic yourself (e.g. cache the created object in a scoped class) rather than the assisted type itself.</p>`,
  },
  {
    id: "a10-di-10",
    category: "di",
    categoryLabel: "DI",
    question: `How does @IntoSet differ from @ElementsIntoSet, and when do you actually need the latter?`,
    answerHtml: `<p><code>@IntoSet</code> contributes one element per <code>@Provides</code>/<code>@Binds</code> method into a multibound <code>Set&lt;T&gt;</code>. <code>@ElementsIntoSet</code> contributes an entire <code>Set&lt;T&gt;</code> (or collection) at once — useful when a single provider naturally produces multiple elements together, e.g. reading a list of feature-flag-gated analytics trackers from a config object and dumping them all into the multibinding in one method, rather than writing N separate <code>@IntoSet</code> providers.</p>`,
  },
  {
    id: "a10-di-11",
    category: "di",
    categoryLabel: "DI",
    question: `Design a multibound Set<AppInitializer> where each module independently contributes its own startup task, none of which know about each other. Sketch two contributing modules and the consumer.`,
    answerHtml: `<pre><code>@Module @InstallIn(SingletonComponent::class)
abstract class CrashModule {
  @Binds @IntoSet
  abstract fun bindCrashInit(impl: CrashReportingInitializer): AppInitializer
}

@Module @InstallIn(SingletonComponent::class)
abstract class AnalyticsModule {
  @Binds @IntoSet
  abstract fun bindAnalyticsInit(impl: AnalyticsInitializer): AppInitializer
}

class AppStartup @Inject constructor(
  private val initializers: Set<@JvmSuppressWildcards AppInitializer>
) {
  fun runAll() = initializers.forEach { it.init() }
}</code></pre><p>This is the core trick for plugin-style, open-for-extension startup/feature registration in a modularized app — new feature modules add themselves without touching <code>AppStartup</code>.</p>`,
  },
  {
    id: "a10-di-12",
    category: "di",
    categoryLabel: "DI",
    question: `What does @JvmSuppressWildcards do in a multibinding injection site like Set<@JvmSuppressWildcards AppInitializer>, and why is it needed?`,
    answerHtml: `<p>Kotlin generates Java generics with wildcards (<code>Set&lt;? extends AppInitializer&gt;</code>) for covariant-looking types by default. Dagger's generated Java code does exact type matching against the multibinding contribution types, and a mismatched wildcard signature causes the injection to fail to resolve at compile time ('cannot find a way to provide'). <code>@JvmSuppressWildcards</code> forces Kotlin to emit the exact non-wildcard signature Dagger expects, so the consumer's <code>Set&lt;AppInitializer&gt;</code> matches the contributed bindings.</p>`,
  },
  {
    id: "a10-di-13",
    category: "di",
    categoryLabel: "DI",
    question: `Compare @IntoMap with @StringKey vs a custom @MapKey annotation backed by an enum or annotation class. Why would you reach for the custom one?`,
    answerHtml: `<p><code>@StringKey</code>/<code>@IntKey</code>/<code>@ClassKey</code> are built-in, fine for simple lookups (e.g. route-name → ViewModel factory). A custom <code>@MapKey</code> (annotated with <code>@MapKey</code> on your own annotation, often wrapping an enum) buys type safety: the map key space is closed and exhaustive (compiler/\`when\` can warn on missing cases), avoids stringly-typed typos, and documents intent — e.g. <code>@PaymentMethodKey(PaymentMethod.CARD)</code> contributing into <code>Map&lt;PaymentMethod, PaymentProcessor&gt;</code> is safer than <code>@StringKey("card")</code>.</p>`,
  },
  {
    id: "a10-di-14",
    category: "di",
    categoryLabel: "DI",
    question: `You have Map<String, @JvmSuppressWildcards Provider<Fragment>> built via @IntoMap for a bottom-nav factory. Why use Provider<Fragment> instead of Fragment directly as the map's value type?`,
    answerHtml: `<p>If the map held raw <code>Fragment</code> instances, all of them would be eagerly constructed when the map itself is injected/built, even though typically only the currently-selected tab's fragment is needed. Wrapping in <code>Provider&lt;Fragment&gt;</code> makes each entry lazy — Dagger only instantiates the specific fragment when you call <code>.get()</code> on its provider, avoiding wasted construction (and side effects) for tabs the user never visits.</p>`,
  },
  {
    id: "a10-di-15",
    category: "di",
    categoryLabel: "DI",
    question: `What's the difference between a Hilt module (@Module @InstallIn) and a Hilt entry point (@EntryPoint), and when is an entry point the only option?`,
    answerHtml: `<p>A module <i>provides</i> bindings into a component's graph. An entry point <i>retrieves</i> bindings from a component graph at a point Hilt doesn't control injection for — e.g. inside a <code>ContentProvider</code> (which Hilt can't inject directly because providers are instantiated before <code>Application.onCreate</code>), a custom <code>WorkManager</code> Worker factory, or third-party library callback classes you can't annotate. You declare an <code>@EntryPoint</code> interface with accessor methods, install it on the relevant component, then call <code>EntryPointAccessors.fromApplication(context, MyEntryPoint::class.java)</code> to manually pull bindings out.</p>`,
  },
  {
    id: "a10-di-16",
    category: "di",
    categoryLabel: "DI",
    question: `Why can't @AndroidEntryPoint be used on a ContentProvider, and what's the actual workaround?`,
    answerHtml: `<p><code>ContentProvider.onCreate()</code> runs before <code>Application.onCreate()</code> completes in the documented startup order (<code>Application.attachBaseContext()</code> → <code>ContentProvider.onCreate()</code> → <code>Application.onCreate()</code>), so the Hilt-generated dependency graph isn't guaranteed ready yet — Hilt explicitly disallows <code>@AndroidEntryPoint</code> on <code>ContentProvider</code> for this reason. The workaround is an <code>@EntryPoint</code> interface installed in <code>SingletonComponent</code>, retrieved lazily inside the provider's query/insert methods (not in <code>onCreate</code>) via <code>EntryPointAccessors.fromApplication(context.applicationContext, ...)</code>, deferring the lookup until the graph is guaranteed to exist.</p>`,
  },
  {
    id: "a10-di-17",
    category: "di",
    categoryLabel: "DI",
    question: `What does @InstallIn actually control, and what error do you get if you forget it on a @Module?`,
    answerHtml: `<p><code>@InstallIn(SingletonComponent::class)</code> (or another component) tells Hilt which generated component's Dagger graph this module's bindings get merged into — it's the bridge between a plain Dagger module and Hilt's component hierarchy. Omitting it on a module used anywhere in a Hilt app is a compile-time error from the Hilt processor ('Hilt Modules must be annotated with @InstallIn') — Hilt requires every module to declare its target component explicitly; there's no implicit default.</p>`,
  },
  {
    id: "a10-di-18",
    category: "di",
    categoryLabel: "DI",
    question: `What does @TestInstallIn do, and how does it differ from just writing a second @Module with the same @InstallIn target?`,
    answerHtml: `<p><code>@TestInstallIn(components = [...], replaces = [ProdModule::class])</code> marks a module as a test-only replacement that Hilt's test processor automatically swaps in for <code>ProdModule</code> across every test in that source set (e.g. all of <code>androidTest/</code> or all of <code>test/</code>) — no per-test wiring needed. A second plain <code>@Module</code> with the same <code>@InstallIn</code> target would cause a duplicate-binding compile error (Dagger doesn't know which one wins); <code>@TestInstallIn</code>'s <code>replaces</code> attribute is what tells Hilt to exclude the original module in test builds so there's no conflict.</p>`,
  },
  {
    id: "a10-di-19",
    category: "di",
    categoryLabel: "DI",
    question: `In an instrumented test using HiltAndroidRule, why must @Inject fields be populated by calling hiltRule.inject() rather than relying on automatic injection?`,
    answerHtml: `<p>Unlike a real Activity launched by the framework, the test class itself (annotated <code>@HiltAndroidTest</code>) isn't instantiated through Hilt's normal injection-trigger path — Hilt can't hook into JUnit's test-runner instantiation automatically. <code>HiltAndroidRule</code> sets up the test's component but injection into the test class's own <code>@Inject</code> fields is deferred until you explicitly call <code>hiltRule.inject()</code>, typically in an <code>@Before</code> method, after any <code>@BindValue</code> fields and <code>@TestInstallIn</code> modules are already configured so they're present in the graph being injected from.</p>`,
  },
  {
    id: "a10-di-20",
    category: "di",
    categoryLabel: "DI",
    question: `What does @BindValue do in a Hilt test, and what's the catch with its scope/visibility requirements?`,
    answerHtml: `<p><code>@BindValue</code> on a field in a <code>@HiltAndroidTest</code> class binds that field's runtime value directly into the test's Dagger graph, replacing whatever real binding existed — handy for injecting a fake/mock instance without writing a whole <code>@TestInstallIn</code> module. Catch: the field can't be <code>private</code> (Hilt's generated code needs to read it — in Kotlin this typically means <code>@JvmField</code> or a non-private property), and the declared field type must exactly match (or be assignable to) the type other classes inject — e.g. binding a <code>FakeRepository</code> field typed as <code>FakeRepository</code> won't satisfy an injection site expecting the <code>Repository</code> interface unless the field itself is typed <code>Repository</code>.</p>`,
  },
  {
    id: "a10-di-21",
    category: "di",
    categoryLabel: "DI",
    question: `Why does a Hilt instrumented test require a custom test Application (e.g. HiltTestApplication) configured via a custom test runner, instead of reusing the app's real Application class?`,
    answerHtml: `<p>Hilt generates a fresh component tree rooted in a dedicated test application so each test run gets an isolated graph that can be augmented with <code>@TestInstallIn</code>/<code>@BindValue</code> overrides without touching production code. This requires swapping the manifest's <code>android:name</code> Application at test time, done via a <code>CustomTestRunner</code> extending <code>AndroidJUnitRunner</code> that overrides <code>newApplication()</code> to instantiate <code>HiltTestApplication</code>, wired into Gradle via <code>testInstrumentationRunner</code>. Reusing the real Application would mean test fakes leak risk into prod wiring and you couldn't cleanly swap modules per test.</p>`,
  },
  {
    id: "a10-di-22",
    category: "di",
    categoryLabel: "DI",
    question: `Two @TestInstallIn modules in the same test source set both replace the same production module with different fakes. What happens, and how do you actually scope an override to a single test class?`,
    answerHtml: `<p>If both are visible to the same compilation/test APK, Dagger reports a duplicate-binding error — <code>@TestInstallIn</code> replacement applies across the whole test source set it's compiled into, not automatically per-test. To scope an override to one test class, either (a) put that <code>@TestInstallIn</code> module in a source set/flavor only that test compiles against, or (b) skip <code>@TestInstallIn</code> entirely and use <code>@BindValue</code> / a local nested <code>@Module @InstallIn(...)</code> combined with <code>@UninstallModules(ProdModule::class)</code> declared on that specific test class, which removes the prod module only for tests annotated with it.</p>`,
  },
  {
    id: "a10-di-23",
    category: "di",
    categoryLabel: "DI",
    question: `What does @UninstallModules do, and why is it usually paired with a per-test inner @Module rather than @TestInstallIn?`,
    answerHtml: `<p><code>@UninstallModules(ProdModule::class)</code>, placed on a specific <code>@HiltAndroidTest</code> class, removes that production module's bindings from the graph for that test class only (and its subclasses), without affecting other tests. It's commonly paired with a small nested <code>@Module @InstallIn(SingletonComponent::class)</code> declared inside the same test file to supply the replacement bindings — this keeps the override local and readable, vs. <code>@TestInstallIn</code> which applies across the whole test source set it's part of by default.</p>`,
  },
  {
    id: "a10-di-24",
    category: "di",
    categoryLabel: "DI",
    question: `A @Provides method in a SingletonComponent module returns a new Retrofit instance every call but the class isn't annotated @Singleton. What actually happens at each injection site, and how would you confirm it without adding logging?`,
    answerHtml: `<p>Without <code>@Singleton</code> on the provider method, Dagger calls it fresh every time the binding is requested — every injection site (and every call if injected as <code>Provider&lt;Retrofit&gt;</code>) gets a distinct <code>Retrofit</code> instance, defeating connection-pooling/interceptor-state reuse. To confirm without logging, inject two <code>Retrofit</code> fields into the same scoped consumer and assert <code>field1 !== field2</code> (referential inequality) in a quick test — that's the cheapest non-logging signal that the binding isn't cached.</p>`,
  },
];

export const ADVANCED10_QUIZ: QuizQuestion[] = [
  {
    id: "a10q-di-1",
    category: "di",
    categoryLabel: "DI",
    question: `A binding is declared @Binds @IntoSet inside a module installed in ActivityComponent, contributing to Set<Validator>. A ViewModel (scoped to ActivityRetainedComponent) tries to inject Set<Validator>. What happens?`,
    options: [`It compiles and works, since multibindings merge across all components automatically`, `Compile error: ActivityRetainedComponent cannot see bindings installed in the narrower-scoped ActivityComponent`, `It compiles but the set is empty at runtime`, `Runtime crash with MissingBinding only on first access`],
    answer: 1,
    explanationHtml: `Hilt's component hierarchy is directional: a parent component (<code>ActivityRetainedComponent</code>) cannot access bindings installed in a child component (<code>ActivityComponent</code>) — only children can see their ancestors' bindings, never the reverse. This is a Dagger compile-time graph-validation error, not a runtime issue.`,
  },
  {
    id: "a10q-di-2",
    category: "di",
    categoryLabel: "DI",
    question: `Which statement correctly distinguishes @AssistedInject from plain @Inject constructor injection?`,
    options: [`@AssistedInject classes can be scoped with @Singleton just like normal injected classes`, `@AssistedInject lets a constructor mix Dagger-provided params with runtime-only params, resolved via a generated @AssistedFactory`, `@AssistedInject is required for every class that has more than one constructor parameter`, `@AssistedInject replaces the need for @InstallIn on the containing module`],
    answer: 1,
    explanationHtml: `<code>@AssistedInject</code> exists specifically to mix graph-resolvable dependencies with values only known at runtime (like a navigation argument). It cannot be scoped — every call to the generated factory's <code>create()</code> produces a new instance by design.`,
  },
  {
    id: "a10q-di-3",
    category: "di",
    categoryLabel: "DI",
    question: `What is the correct fix when Dagger reports it cannot resolve Set<Tracker> at an injection site, even though multiple modules contribute @Binds @IntoSet bindings for Tracker, all written in Kotlin?`,
    options: [`Switch every contributing module to @Provides instead of @Binds`, `Annotate the injection site's Set<Tracker> with @JvmSuppressWildcards on the type parameter`, `Add @ElementsIntoSet to each contributing binding`, `Move all contributing modules into SingletonComponent regardless of where they're used`],
    answer: 1,
    explanationHtml: `This is the classic Kotlin/Dagger wildcard mismatch: Kotlin emits <code>Set&lt;? extends Tracker&gt;</code> in bytecode by default, which doesn't structurally match Dagger's generated exact-type multibinding signature. <code>Set&lt;@JvmSuppressWildcards Tracker&gt;</code> at the consumption site fixes the mismatch without touching the providers.`,
  },
  {
    id: "a10q-di-4",
    category: "di",
    categoryLabel: "DI",
    question: `Why does Hilt forbid @AndroidEntryPoint on a ContentProvider, requiring @EntryPoint + EntryPointAccessors instead?`,
    options: [`ContentProviders cannot have any annotations applied to them by Android's build tooling`, `ContentProvider.onCreate() can run before the Hilt-managed Application's component graph is fully initialized`, `@EntryPoint is strictly faster at runtime than @AndroidEntryPoint`, `ContentProviders are not part of the Android four-component model Hilt supports`],
    answer: 1,
    explanationHtml: `Content providers are instantiated very early in process startup — before <code>Application.onCreate()</code> completes — so the Hilt-managed <code>SingletonComponent</code> graph may not be ready. Hilt sidesteps this ordering hazard by disallowing direct injection there; you manually pull bindings later (e.g. inside <code>query()</code>) via an <code>@EntryPoint</code> interface and <code>EntryPointAccessors.fromApplication(...)</code>, once the graph is guaranteed ready.`,
  },
  {
    id: "a10q-di-5",
    category: "di",
    categoryLabel: "DI",
    question: `In a Hilt instrumented test, you add @BindValue lateinit var fakeRepo: FakeRepository = FakeRepository() to replace the real Repository binding used elsewhere via constructor injection of \`repository: Repository\`. The override silently has no effect at injection sites expecting Repository. What's the most likely cause?`,
    options: [`@BindValue only works for @Singleton-scoped bindings`, `The field is typed FakeRepository instead of Repository, so it doesn't satisfy the Repository injection site`, `HiltAndroidRule.inject() was never called`, `@BindValue requires the field to be declared in a @TestInstallIn module, not directly on the test class`],
    answer: 1,
    explanationHtml: `<code>@BindValue</code> binds the field using its <i>declared</i> type. If consumers inject the <code>Repository</code> interface but the field's static type is the concrete <code>FakeRepository</code>, Dagger doesn't automatically widen it — declare the field as <code>Repository</code> (holding a <code>FakeRepository</code> instance) so it matches the binding type consumers actually request.`,
  },
  {
    id: "a10q-di-6",
    category: "di",
    categoryLabel: "DI",
    question: `What does @TestInstallIn's \`replaces\` attribute do that a plain second @Module with the same @InstallIn target cannot?`,
    options: [`It increases the priority of the new module so Dagger merges both bindings, picking the last one declared`, `It tells Hilt to exclude the original production module from the test compilation, avoiding a duplicate-binding error`, `It allows the test module to be scoped differently than the original`, `It automatically generates a HiltAndroidRule for the test class`],
    answer: 1,
    explanationHtml: `Without <code>replaces</code>, having two modules provide the same binding type into the same component is a Dagger duplicate-binding compile error. <code>@TestInstallIn(..., replaces = [ProdModule::class])</code> explicitly tells the Hilt test processor to drop <code>ProdModule</code> from the graph wherever this test module is present, so there's exactly one binding.`,
  },
  {
    id: "a10q-di-7",
    category: "di",
    categoryLabel: "DI",
    question: `A class needs an OkHttpClient with custom interceptors built from a Config object that itself comes from the graph. Which approach is correct and idiomatic?`,
    options: [`Add @Inject constructor directly to OkHttpClient since Hilt can inject any class`, `Write a @Provides method in a Hilt module that takes Config as a parameter and returns the built OkHttpClient`, `Use @AssistedInject since OkHttpClient.Builder requires runtime configuration`, `Annotate OkHttpClient.Builder with @EntryPoint`],
    answer: 1,
    explanationHtml: `You don't own <code>OkHttpClient</code>'s constructor (it's built via a fluent <code>Builder</code>, not a constructor Hilt can annotate), so <code>@Provides</code> in a module is the correct tool — Dagger supplies the already-resolved <code>Config</code> parameter and you do the imperative build logic inside the method body. <code>@AssistedInject</code> is for runtime-only values mixed into a constructor you own, not for third-party builder patterns.`,
  },
];
