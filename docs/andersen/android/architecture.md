# Architecture (MVVM, MVP, MVI, Clean)

### Why Architecture Patterns Exist
**They ask:** "What is architecture, and why is it needed? Give an example."

Architecture exists to answer one question before a line of feature code is written: when this screen's requirements change — and they will — how much of the codebase has to change with it? Without a pattern, UI code, business rules, and data access tangle together in one Activity, and every change risks breaking an unrelated concern because nothing is isolated.

A pattern like MVVM draws a boundary: the View only renders and forwards user intent, the ViewModel holds presentation state and survives rotation, and a Repository owns data access. The payoff isn't aesthetics — it's that each layer can be tested, replaced, or reasoned about without the others, and a UI-only change (say, swapping RecyclerView for Compose) never touches business logic.

**Say it:** "Architecture is a set of enforced boundaries so a change in one layer — UI, presentation state, data — doesn't ripple into the others; the real cost of skipping it is that every future change gets more expensive, not less."
**Red flag:** Describing architecture as "just folder structure." The folders are a symptom; the actual thing being enforced is which layer is allowed to depend on which, and that a business rule never lives inside an Activity.

### MVVM — How It Works, Strengths and Weaknesses
**They ask:** "How does MVVM work? What are its strengths and weaknesses?"

MVVM's job is to remove the View's knowledge of *how* to fetch or compute what it displays. The View observes a `ViewModel`'s exposed state and forwards user actions to it; the `ViewModel` calls into a Repository/UseCase layer and republishes the result as observable state — it never holds a reference to the View, which is what makes it survive Android's most disruptive event, configuration change.

```kotlin
class ProfileViewModel(private val repo: UserRepository) : ViewModel() {
    private val _state = MutableStateFlow<UiState>(UiState.Loading)
    val state: StateFlow<UiState> = _state.asStateFlow()

    fun load(userId: String) = viewModelScope.launch {
        _state.value = runCatching { repo.getUser(userId) }
            .fold(UiState::Success, UiState::Error)
    }
}
```

The strength is testability and lifecycle safety for free — the AAC `ViewModel` is retained across rotation without you writing any save/restore code. The honest weakness: a `ViewModel` can become a dumping ground for every concern on a screen ("massive ViewModel") if you don't also push business logic further down into UseCases/Repositories.

**Say it:** "MVVM works because the ViewModel never references the View, so it survives rotation and is trivially unit-testable — the failure mode to watch for is letting business logic pile up in the ViewModel instead of a UseCase layer underneath it."
**Red flag:** Injecting `Context` or a `View` reference directly into a `ViewModel`. That reintroduces the exact coupling MVVM exists to remove, and it leaks the Activity past its lifecycle.

### LiveData and AAC Components
**They ask:** "What is LiveData for, and what are Architecture Components' basic building blocks?"

`LiveData` exists to solve a narrower problem than "reactive stream": deliver state to the UI in a way that's automatically lifecycle-aware, so a background screen never gets an update it can't safely render, and a subscription never outlives its Activity/Fragment and leaks. It only delivers to an active (`STARTED`+) observer and replays the last value to a new one — which is exactly the behavior a UI layer wants and a general-purpose stream doesn't give you by default.

```kotlin
class UsersViewModel : ViewModel() {
    private val _users = MutableLiveData<List<User>>()
    val users: LiveData<List<User>> = _users
}
// in the Fragment:
viewModel.users.observe(viewLifecycleOwner) { list -> adapter.submitList(list) }
```

The other AAC pieces work together for the same reason: `ViewModel` owns state past configuration changes, `Room` persists it, `Lifecycle`/`LifecycleObserver` is the primitive both `LiveData` and `viewModelScope` build on, and `Navigation` standardizes how screens hand data to each other — none of them is useful in isolation; the value is that they all agree on the same lifecycle contract.

**Say it:** "LiveData's actual feature isn't 'observable value,' it's lifecycle-awareness — it never delivers to a dead observer and replays the latest value to a new one, which is precisely what a UI subscription needs and a generic stream doesn't give for free."
**Red flag:** Observing `LiveData` with the Fragment's own lifecycle instead of `viewLifecycleOwner`. The Fragment instance can outlive its View, so that subscription silently doubles up across `onCreateView` calls.

### MVP — How It Works, Strengths and Weaknesses
**They ask:** "How does MVP work? What are its strengths and weaknesses?"

MVP splits the same responsibilities as MVVM but wires them differently: the View defines an interface (`showLoading()`, `showUsers(list)`), the Presenter holds a *direct reference* to that View interface and calls its methods imperatively to update it, and the Model is the data layer underneath. The distinction that matters: MVVM's View observes state passively; MVP's Presenter actively pushes to the View.

```kotlin
interface UsersView { fun showUsers(list: List<User>); fun showError(msg: String) }

class UsersPresenter(private val view: UsersView, private val repo: UserRepository) {
    fun load() {
        repo.getUsers(
            onSuccess = { view.showUsers(it) },
            onError = { view.showError(it.message.orEmpty()) }
        )
    }
}
```

The strength is a very explicit, easy-to-trace contract per screen — you can see every method the View exposes in one interface. The weakness is exactly that direct reference: the Presenter must be told about the View's lifecycle by hand (attach/detach), or it leaks the View or crashes calling a method on a destroyed one — MVVM's observer pattern sidesteps this by construction.

**Say it:** "MVP's Presenter holds a direct reference to the View and pushes updates imperatively, which makes the contract explicit but means I own attach/detach by hand — MVVM avoids that whole class of leak because the View observes instead of being called into."
**Red flag:** Calling a Presenter method on the View after `onDestroyView` without a null-check or detach guard. That's the MVP-specific crash MVVM's observer model doesn't have to defend against.

### Clean Architecture — Origins and Layers
**They ask:** "Why did Uncle Bob come up with Clean Architecture, and what are its layers?"

Clean Architecture exists to solve a problem neither MVVM nor MVP addresses on their own: both describe *presentation-layer* wiring, but say nothing about protecting business rules from framework churn. Robert Martin's actual complaint was that business logic kept getting coupled to whatever database, UI framework, or web framework was fashionable at the time — so replacing any of them meant rewriting the rules, not just the plumbing around them.

The fix is the Dependency Rule: source code dependencies only point *inward*. **Entities** (core business objects) know nothing about anything. **Use Cases** orchestrate entities and define the app's actual behavior, independent of UI or data source. **Interface Adapters** (presenters, ViewModels, repository implementations) translate between use cases and the outside world. **Frameworks & Drivers** (Android, Room, Retrofit) sit at the outer edge and depend inward, never the reverse.

```kotlin
// domain layer — no Android import in sight
class GetUserUseCase(private val repo: UserRepository) {
    suspend operator fun invoke(id: String): User = repo.getUser(id)
}
```

**Say it:** "Clean Architecture's Dependency Rule — dependencies only point inward, toward business rules — is what MVVM and MVP alone don't give you: it protects the actual logic from framework churn, so swapping Room for something else never touches a use case."
**Red flag:** Putting an Android import (`Context`, `LiveData`) inside the domain/use-case layer. The moment a framework type leaks inward, the entire dependency-inversion guarantee is gone.

### MVVM vs MVP
**They ask:** "What's the difference between MVVM and MVP?"

The core difference is *who initiates the update, and how tightly coupled the View reference is*. MVP's Presenter holds a direct reference to a View interface and calls it imperatively — the Presenter must know the View exists and be told when it goes away. MVVM's ViewModel exposes observable state (`LiveData`/`StateFlow`) and holds *no* reference to the View at all — the View subscribes and unsubscribes itself, so the ViewModel is agnostic to whether anyone is even listening.

That structural difference cascades: MVP needs manual lifecycle bookkeeping (attach/detach, often via a library like Moxy to avoid boilerplate) and is harder to unit test in isolation because tests need a fake View. MVVM's ViewModel can be fully unit-tested by asserting on emitted state, with zero View involved, and gets rotation-survival for free via the AAC `ViewModel` class.

**Say it:** "MVP pushes to a View it holds a reference to; MVVM exposes state a View pulls from without the ViewModel knowing who's listening — that's why MVVM tests cleaner and survives rotation without extra bookkeeping, while MVP needs explicit attach/detach."
**Red flag:** Claiming MVVM and MVP are "basically the same pattern with different names." The direction of the reference — pushed-to vs. observed — is the actual architectural difference, not naming convention.

### MVI — State, Actions, SideEffect, Store
**They ask:** "How does MVI work — what are State, Actions/Intents, SideEffect, and Store?"

MVI's premise is that MVVM's mutable `LiveData`/`StateFlow` fields, updated from multiple places in a ViewModel, can drift into inconsistent partial states (loading *and* an error shown at once, because two separate fields were each updated independently). MVI forces the entire screen to be represented as **one immutable State object**, and the *only* way to change it is by reducing an **Action/Intent** against the current state — never a direct field mutation.

```kotlin
sealed class ListState {
    object Loading : ListState()
    data class Content(val items: List<Item>) : ListState()
    data class Error(val message: String) : ListState()
}
sealed class Action { object Load : Action(); data class Loaded(val items: List<Item>) : Action() }

fun reduce(state: ListState, action: Action): ListState = when (action) {
    Action.Load -> ListState.Loading
    is Action.Loaded -> ListState.Content(action.items)
}
```

The **Store** holds the current State and runs the reducer on every incoming Action, emitting the new State to the View — a single, traceable pipeline. **SideEffect** is for the one-shot events a State snapshot can't represent well (navigate away, show a toast) — they're emitted alongside State changes rather than baked into it, so they don't get accidentally re-triggered on a state replay (e.g. after rotation).

**Say it:** "MVI collapses screen state into one immutable object that only changes through a reducer, which makes impossible-state combinations actually impossible — SideEffect is the separate channel for one-shot events like navigation that shouldn't replay when state gets re-emitted."
**Red flag:** Putting a one-shot navigation event directly into the State object. On rotation or process restoration, that state gets re-emitted and the navigation fires again — SideEffect exists specifically to avoid that class of bug.

### Repository Pattern and Data Caching
**They ask:** "What is the Repository pattern? How do you organize data caching with it?"

A Repository's job is to give the rest of the app *one* interface for "get this data," while hiding whether it actually came from network, disk cache, or memory — callers (ViewModels, UseCases) never know or care which source served the request. That indirection is what makes caching a Repository-internal decision instead of something every call site has to reimplement.

```kotlin
class UserRepository(private val api: UserApi, private val dao: UserDao) {
    fun getUser(id: String): Flow<User> = flow {
        dao.getUser(id)?.let { emit(it) }         // emit cache first if present
        val fresh = api.fetchUser(id)
        dao.upsert(fresh)
        emit(fresh)                                // then emit the network result
    }
}
```

The senior nuance is picking a caching strategy deliberately: cache-then-network (shown above) gives instant stale data plus an eventual fresh update; network-only-with-fallback is simpler but slower on every load; a `NetworkBoundResource`-style single-source-of-truth pattern (always read from Room, let network writes update Room, let Room's Flow drive the UI) is the most robust but the most machinery.

**Say it:** "A Repository's real value is that callers ask for data without knowing or caring where it came from — that's what lets me change or layer the caching strategy in one place instead of touching every call site."
**Red flag:** Letting a ViewModel talk to both a Room DAO and a Retrofit API directly for the same entity. That's the exact duplication a Repository exists to collapse into one source of truth.

### Clean Architecture — Modularity, DTO vs Entity, Interactor vs UseCase
**They ask:** "How do you keep weak cohesion between Clean Architecture layers, and what's the difference between DTO and Entity, and between Interactor and UseCase?"

Weak coupling between layers is enforced two ways: interfaces defined in the inner layer and *implemented* by the outer one (the domain layer defines `UserRepository`, the data layer implements `UserRepositoryImpl` against Retrofit/Room — dependency inversion in practice), and, at scale, splitting each layer into its own Gradle module so the dependency rule is enforced by the build graph, not just convention — a `:domain` module simply can't import `:data`.

`DTO` and `Entity` look similar but exist for different boundaries: a DTO is the network/API response shape, coupled to serialization concerns (`@SerializedName`, nullable fields the backend might omit); an Entity is the domain's own model, shaped around what business rules actually need. Mapping DTO → Entity at the data layer's edge is what stops a backend field rename from rippling into UI code.

`Interactor` and `UseCase` are largely the same concept under two names — a single, named unit of business logic (`GetUserUseCase`) — the difference is mostly historical/library convention (older Clean Architecture writing favored "Interactor"; modern Android favors "UseCase," often as an `operator fun invoke()` for call-site brevity).

**Say it:** "DTO models the wire format, Entity models the domain — mapping between them at the data layer's edge is what keeps a backend rename from leaking into the UI — and Interactor/UseCase are the same idea under different naming conventions, just a single named unit of business logic."
**Red flag:** Passing a Retrofit DTO straight through to the UI layer without mapping to a domain Entity. That couples every screen to the API's serialization shape, which is exactly what the DTO/Entity split exists to prevent.
