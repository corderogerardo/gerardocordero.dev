# apps/android — PawWalk (Compose reference app)

The real Android app behind [PawWalk Academy's Android/Kotlin
course](../learn/lessons-android/) (`apps/learn/lessons-android/00`…`12`). Every
lesson in that course teaches the learner to retype a real piece of this app —
this directory is what those pieces assemble into. Same domain as the iOS/Ruby
courses: dog owners find walkers, book and pay for walks, and watch the walk
live on a map via GPS over a WebSocket.

Package: `com.pawwalk.android`. Single module (`app/`), Jetpack Compose, no
XML layouts. Talks to a FastAPI backend over HTTP/JSON per
`docs/API-CONTRACT.md` referenced throughout the lessons (that backend is
illustrative in this repo — see "Backend" below).

## Compile gate is CI, not local

**This dev environment has no local Android SDK / Android-configured JDK**, so
this app was never built with a local IDE run. The compile gate is the
`android-build` job in `.github/workflows/ci.yml` (path-filtered on
`apps/android/`, same change-detection idiom as `validate-learn`) — it runs
`./gradlew assembleDebug --no-daemon` on a GitHub-hosted `ubuntu-latest`
runner, which ships the Android SDK. That job passing on this PR **is** the
compile proof for everything below.

## Running it (with Android Studio)

1. Install **Android Studio** ([developer.android.com/studio](https://developer.android.com/studio)).
2. Open `apps/android/` in Android Studio (**File → Open**) and let Gradle sync.
   You do **not** need to install Gradle yourself — the committed wrapper
   (`gradlew`, `gradle/wrapper/`) downloads the pinned version automatically.
3. Create a Pixel emulator (API 36) via **Device Manager**, or plug in a
   device with USB debugging on.
4. Run a backend that implements `docs/API-CONTRACT.md` — or just run the app
   without one; every screen catches its own load error, so a dead backend
   shows an in-place error state rather than crashing.
5. Point the app at your backend: `API_BASE_URL` is a `buildConfigField` in
   `app/build.gradle.kts` defaulting to `http://localhost:8000`. From an
   **emulator**, the host machine is reachable at `10.0.2.2`, not `localhost`
   — either edit that field or pass `-PapiBaseUrl=http://10.0.2.2:8000`
   (see the field's own comment).
6. Click **Run** (▶ / Shift+F10).

## Versions (verified, not guessed — see Deviations)

- Android Gradle Plugin **8.13.2**, Kotlin **2.1.20**, Gradle **8.14.4**
  (wrapper committed).
- `compileSdk` / `targetSdk` **36**, `minSdk` **26**.
- Compose BOM **2026.06.00**.

## Deviations from the course

The lessons teach this app in small, real fragments (a method here, a
composable there) — not full files end to end. Assembling those fragments
into a compiling app required a few judgment calls. Every one is also marked
`// ponytail:` at its point of use in the source.

- **AGP/Gradle major version.** The task asked for "current-stable as of
  mid-2026" and a Gradle wrapper on "current 8.x". As of this bootstrap,
  Android Gradle Plugin has moved to **9.x** (9.2.0) which requires
  **Gradle 9.1+** and a different Kotlin-integration model (built-in Kotlin,
  no separate `org.jetbrains.kotlin.android` plugin). That combination is
  materially riskier to get right without a local build to verify against.
  AGP **8.13.2** is the last 8.x release (Sept 2025) — still genuinely
  "current" in the sense of being the newest release on the well-trodden,
  widely-documented 8.x line the task's own wrapper instruction pointed at —
  so that's what's pinned. **This was locally verified**: `./gradlew
  assembleDebug` was run once against the real Android SDK already present
  on this machine (see next point) and succeeded before this PR was opened.
- **"No local Android SDK" turned out to be stale.** The task briefing said
  this Mac has no Android SDK. It actually has a full one at
  `~/Library/Android/sdk` (Android Studio is installed) — discovered while
  trying to verify the Gradle wrapper. That let this app be **locally
  compiled and verified once** (`assembleDebug` succeeded, `app-debug.apk`
  produced) before relying on CI. The stated policy — CI is the durable
  compile gate, not a one-off local run — still holds; local build artifacts
  were deleted before committing (`.gitignore` covers `/build`,
  `/app/build`, `.gradle/`, `.kotlin/`).
- **Fields/methods referenced by name but never fully shown.** Several
  classes are called by name from a lesson's code excerpt but never printed
  in full anywhere in the course: `Pet`, `User`, `AuthResponse`, `OwnerStats`,
  `WalkerProfileUpdate`, `CreateBookingRequest`/`CreatePetRequest`,
  `AuthRepository`, `BookingRepository`, `PetRepository`,
  `Throwable.toUserMessage()`, `validate(...)` in `AuthScreen.kt`,
  `HomeViewModel` (and its `State.upcoming`/`.pets`), `WalkerViewModel`, and
  a few small composables (`DmText`, `ChevronRightIcon`, `HomeIcon`,
  `CalendarIcon`, `LocationArrowIcon`, `PawIcon`, `WalkCard`,
  `EditProfileDialog`, `MessageBubble`). All filled in minimally, following
  the exact patterns the course *does* teach (the same
  loading/try-catch/`UiState` shape every shown ViewModel uses; the same
  Canvas + `strokePath` recipe every shown icon uses).
- **`PetRepository` method names disagree across lessons.** Module 07 calls
  it `fetchPets()`; modules 10 and 12 call it `.list()` / `.create()`. Kept
  the later (`.list()`/`.create()`) convention per "latest wins."
- **`Screen.Live` / `HomeScreen.onTrack` carried a dog name, not a booking
  id.** `MainActivity.kt`'s nav fragment (`09-lists-navigation.js`) defines
  `data class Live(val dogName: String? = null)`, fed by
  `onTrack(state.upcoming?.booking?.dogName ?: ...)`. But `LiveViewModel`
  (`11-live-tracking.js`) opens its WebSocket at `/ws/track/$bookingId` — a
  dog's name can't open that socket. Reconciled on `bookingId` throughout
  (`Screen.Live`, `HomeScreen`'s `onTrack` signature, `WalkerScreen`'s
  `onTrack`), since that's the only value that makes `LiveScreen` work.
- **Walker-role home isn't wired in the course's own `MainActivity`
  fragment.** The lesson literally elides it (`// …the rest of the cases…`).
  Since the app models two roles (owner, walker) and ships a full
  `WalkerScreen.kt`, `MainActivity` now branches `Screen.Home` on
  `currentUser?.role` — walkers land on `WalkerScreen`, everyone else on the
  owner `HomeScreen`.
- **No bundled JetBrains Mono font.** `ui/theme/Theme.kt`'s `MonoText`
  references a `JetBrainsMono` family; no lesson ships the actual `.ttf`
  (that's not something a `code` step can teach). `JetBrainsMono` is
  currently `FontFamily.Monospace` (the platform fallback) — swap in a real
  bundled font under `app/src/main/res/font/` if the visual match matters.
- **Launcher icon is a flat brand-color placeholder**, not real artwork —
  out of scope for a from-lessons bootstrap.
- **`apps/backend` (FastAPI) and `apps/ios` are referenced throughout the
  lessons** (`docs/API-CONTRACT.md`, "the same backend the iOS app talks
  to") but don't exist in this repo — the Android course was written as a
  parallel, illustrative spec, not against a checked-in backend here. This
  app is a client with no live backend dependency; every screen degrades to
  an in-place error state when a call fails.
- **Module 13 ("Coroutines & Flow in Anger") landed on `main` mid-bootstrap**
  and teaches a **different, incompatible architecture** for
  `WalkerRepository`/`WalkersViewModel`/`LiveViewModel` — constructor-injected
  (`class WalkerRepository(private val api: PawWalkApi)`,
  `class WalkersViewModel(private val repo: WalkerRepository) : ViewModel()`)
  and Flow-based (`Flow<List<Walker>>.stateIn(...)`, `callbackFlow` for the
  socket), plus a Turbine-based `test/LiveViewModelTest.kt`. Wiring
  constructor injection in cleanly needs a factory or DI (Hilt) the course
  never sets up elsewhere, and every other screen in this app calls these
  ViewModels via the no-arg `viewModel()` composable — rearchitecting the
  whole data layer for one new module was out of scope for this bootstrap.
  **Not implemented here.** If a future pass adopts it: add a
  `ViewModelProvider.Factory` (or Hilt), convert `WalkerRepository` and
  `WalkersViewModel`/`LiveViewModel` to the constructor-injected Flow shape
  module 13 teaches, and add the Turbine dependency
  (`app.cash.turbine:turbine`) plus `kotlinx-coroutines-test` for
  `test/LiveViewModelTest.kt`.
