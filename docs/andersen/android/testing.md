# Testing (JUnit, Mockito, Espresso)

### Unit Testing Basics — Why, Mockito, and Mock Objects
**They ask:** "Why do you need unit tests? What is Mockito, and what is a mock object?"

Unit tests exist to answer a question refactoring otherwise can't answer with confidence: does this piece of logic still behave correctly after a change, in isolation, without spinning up the whole app? That isolation is the actual value — a fast, deterministic feedback loop that catches a broken business rule before it ships, without needing a device, a network, or a running Activity.

Isolation is the hard part in practice, though, because most real classes have collaborators (a Repository needing an API, a ViewModel needing a Repository). `Mockito` is the framework that generates fake implementations of those collaborators at test time — a **mock** is an object that mimics a real dependency's interface but returns pre-programmed responses instead of doing real work, so the class under test can be exercised without its real dependencies existing at all.

```kotlin
@Test
fun `load emits Success when repo returns data`() {
    val repo = mock<UserRepository>()
    whenever(repo.getUser("1")).thenReturn(User("1", "Ann"))

    val viewModel = ProfileViewModel(repo)
    viewModel.load("1")

    assertEquals(UiState.Success(User("1", "Ann")), viewModel.state.value)
}
```

**Say it:** "The value of a unit test isn't 'more coverage,' it's a fast, deterministic signal that a specific piece of logic still works after a change — Mockito's mocks are what make that isolation possible by faking out every real collaborator the class under test would otherwise need."
**Red flag:** Writing a "unit test" that spins up Room, hits a real (or even fake) network, and asserts on end-to-end behavior. That's an integration test wearing a unit test's name — real unit tests don't touch real collaborators at all.

### Mockito — Stubbing, Verify, and ArgumentCaptor
**They ask:** "How do you create a mock of a class or interface? What does the method of a mocked class return by default, and how do you specify a return value? What are `verify` and `ArgumentCaptor` for?"

`mock<T>()` (or `Mockito.mock(T::class.java)`) creates a fake implementation of any interface or non-final class, with no behavior wired up yet. Every method on a fresh mock returns Kotlin/Java's type-appropriate default — `null` for objects, `0`/`0.0` for numeric primitives, `false` for `Boolean`, an empty collection for collection-returning methods — until you explicitly stub it with `whenever(...).thenReturn(...)` (or `given(...).willReturn(...)`).

```kotlin
val api = mock<UserApi>()
whenever(api.getUser("1")).thenReturn(User("1", "Ann"))   // otherwise this call returns null

verify(api).getUser("1")                                    // asserts it was actually called, once by default
verify(api, times(2)).getUser("1")

val captor = argumentCaptor<User>()
verify(repo).save(captor.capture())
assertEquals("Ann", captor.firstValue.name)
```

`verify` asserts an *interaction happened* — that a mock's method was actually called, and how many times — which matters for testing side-effecting code (did we actually call `save()`?) where a return-value assertion alone can't prove the call occurred. `ArgumentCaptor` goes further: it captures the *actual argument* passed to a mocked method at call time, so you can assert on the content of what was passed, not just that something was passed.

**Say it:** "An unstubbed mock method returns the type's default — null, 0, false, empty collection — never the real behavior, so every path the test exercises needs an explicit `whenever`. `verify` proves an interaction happened, `ArgumentCaptor` proves what was actually passed to it — different questions, both often needed together."
**Red flag:** Asserting only on a return value when the thing under test is actually a side effect (saving, logging, navigating). If nothing meaningful is returned, `verify` is the only way to prove the interaction actually occurred.

### Mocking Final, Static, and Abstract Classes
**They ask:** "How do you mock a final, static, or abstract class?"

Mockito's classic mocking mechanism works by generating a subclass proxy at runtime that overrides each method — which is exactly why it historically *couldn't* mock `final` classes or methods (nothing to subclass/override) or static methods (there's no instance to proxy at all). `abstract` classes were always mockable in the classic sense, since Mockito just implements the abstract methods on the generated subclass.

Modern Mockito (via `mockito-inline`, and the default mock maker since Mockito 5) uses bytecode manipulation instead of subclassing, which unlocked mocking `final` classes/methods directly with the same `mock<T>()` call — no extra ceremony for that case anymore on a current Mockito version.

```kotlin
// static methods still need the explicit static-mocking API, not plain mock()
mockStatic(TimeUtils::class.java).use { mocked ->
    mocked.`when`<Long> { TimeUtils.now() }.thenReturn(1_700_000_000_000L)
    assertEquals(1_700_000_000_000L, TimeUtils.now())
}
```

Static methods still need the dedicated `Mockito.mockStatic(...)` API (`try`/`use`-scoped, since it globally intercepts calls to that class for the block's duration) — you can't `mock()` a static method the way you mock an instance method, because there's no object to substitute.

**Say it:** "Modern Mockito mocks final classes and methods directly via bytecode manipulation, no extra setup — static methods are the one case that still needs the dedicated `mockStatic` API, since there's no instance to proxy in the first place."
**Red flag:** Assuming an old blanket rule that "Mockito can't mock final classes" without checking the Mockito version in the project. That's true for the legacy subclassing mock maker but not the current default — a senior answer knows which mechanism is actually in play.

### Mock vs Stub vs Spy
**They ask:** "What are the differences between Mock, Stub, and Spy?"

These terms describe different roles a test double plays, and mixing them up muddies what a test is actually asserting. A **stub** is a fake that returns canned answers to calls it receives — it exists purely to feed the class under test with predetermined data; you never assert *against* a stub, only use its output. A **mock** is a stub plus behavior verification — you assert that specific interactions happened (`verify(mock).save(...)`), so a mock test is checking *how* the code under test behaved, not just what it returned. A **spy** wraps a *real* object, delegating to real method implementations by default while letting you selectively override or verify specific calls — useful when you want most of the real behavior but need to stub or observe one method.

```kotlin
val realRepo = UserRepositoryImpl(realApi, realDao)
val spyRepo = spy(realRepo)
doReturn(cachedUser).whenever(spyRepo).getUser("1")   // override just this one method
spyRepo.deleteAll()                                     // still calls the REAL deleteAll()
```

**Say it:** "A stub just feeds canned data and is never itself asserted against, a mock adds interaction verification on top of that, and a spy wraps a real object so most calls hit real code while I selectively override or watch specific ones — picking the wrong one for the job is what makes a test either brittle or unclear about what it's actually checking."
**Red flag:** Calling every test double a "mock" regardless of whether it's actually a stub, mock, or spy. The distinction isn't pedantry — it changes what the test is actually verifying (data vs. behavior vs. real-with-overrides).

### Unit Tests vs UI Tests — Espresso and Robolectric
**They ask:** "What's the difference between Unit tests and UI tests? How do you use Robolectric and Espresso, in principle?"

Unit tests run on the JVM, in isolation, with fake collaborators — fast (milliseconds), no device/emulator, no real Android framework classes available unless something provides them. UI/instrumented tests run *on* a real device or emulator, exercising the real Android framework end to end — slower, but they're the only way to genuinely verify what the user sees and taps actually works, since a unit test can't render a real View or dispatch a real touch event.

`Robolectric` sits in between: it provides *simulated* Android framework classes (Activities, Views, Context) that run on the plain JVM, so tests that touch Android APIs can still run fast, in a unit-test-style runner, without a device — the trade-off is that "simulated" isn't "real," so some framework edge cases (real rendering, real touch dispatch, certain OEM-specific behavior) genuinely can't be caught this way.

`Espresso` is the real instrumented-UI testing framework — it runs the actual app on a device/emulator and drives real View interactions (`onView(withId(...)).perform(click())`), with built-in synchronization that waits for the main thread and any tracked async work to go idle before each action, which is what makes Espresso tests reliable instead of full of manual `sleep()` calls.

```kotlin
@Test
fun clickingLogin_navigatesToHome() {
    onView(withId(R.id.loginButton)).perform(click())
    onView(withId(R.id.homeScreenRoot)).check(matches(isDisplayed()))
}
```

**Say it:** "Unit tests are fast and isolated but can't touch real Android framework behavior; Robolectric simulates that framework on the JVM for speed at the cost of not being 'real'; Espresso runs on an actual device and is the only one that proves the real UI actually works — and its built-in idling sync is why it doesn't need manual sleeps."
**Red flag:** Relying only on Robolectric tests and skipping real instrumented tests entirely "because they're slow." Robolectric's simulated framework can diverge from real device behavior — critical user-facing flows still need real Espresso coverage.

### Espresso Matchers and UIAutomator
**They ask:** "What are Espresso Matchers? What is UIAutomator for, and how is it different from Espresso?"

Espresso's `onView(matcher)` needs a **Matcher** to locate the target View in the current hierarchy — `withId`, `withText`, `withHint`, `hasSibling`, `isDisplayed`, and they compose (`allOf(withId(...), withText(...))`) to pinpoint a specific View among many that might otherwise match ambiguously. The same matcher vocabulary is reused for assertions (`check(matches(...))`) and for the target of an action (`perform(click())`), which is why understanding matchers well is most of learning Espresso.

```kotlin
onView(allOf(withId(R.id.title), withText("Welcome"))).check(matches(isDisplayed()))
```

`UIAutomator` operates at a fundamentally different scope: it's a black-box testing framework that can interact with *any* app on the device, including system UI (notifications, permission dialogs, the launcher, another app entirely) — Espresso is deliberately scoped to *your own app's* View hierarchy and has no visibility outside it. The practical split: Espresso for testing your app's own screens with fine-grained View assertions; UIAutomator for cross-app flows your app doesn't control, like verifying a permission dialog appears and tapping "Allow" on it, or testing a deep link that opens from another app.

**Say it:** "Espresso's Matcher vocabulary is how you pinpoint a View inside your own app's hierarchy for both actions and assertions — UIAutomator operates outside that boundary entirely, at the whole-device level, which is why it's the right tool for permission dialogs or cross-app flows Espresso simply can't see."
**Red flag:** Trying to use Espresso to interact with a system permission dialog. Espresso only sees your app's own View hierarchy — that's exactly the boundary UIAutomator exists to cross.
