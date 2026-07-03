# apps/ios — PawWalk (SwiftUI reference app)

The real iOS app built by PawWalk Academy's iOS course
(`apps/learn/lessons/00-welcome.js` … `12-assistant-graduation.js`). The
lessons are the spec: every file here is assembled from the `code` steps and
exercise `solution`s the course shows as "the real, shipping" PawWalk code —
a dog-walking app with a walker list, booking flow, email/password auth,
live GPS walk tracking (Canvas-drawn route, WebSocket), and a small
on-device-adjacent chat assistant that books through the same API.

XcodeGen-based (`project.yml`), Swift 6 with strict concurrency, iOS 17+
deployment target. Talks to the FastAPI backend in `apps/backend` (the
course's Terminal instructions), defaulting to `http://localhost:8000`.

## Generate, build, run

```bash
brew install xcodegen   # if not already installed
cd apps/ios
xcodegen generate
open PawWalk.xcodeproj  # or: xcodebuild -scheme PawWalk -destination 'platform=iOS Simulator,name=iPhone 16' build
```

`PawWalk.xcodeproj/` and `DerivedData/` are gitignored — xcodegen regenerates
the project from `project.yml` + the `PawWalk/` source tree every time.

Verified locally: `xcodebuild -project PawWalk.xcodeproj -scheme PawWalk
-destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build`
→ **BUILD SUCCEEDED**, zero errors, zero warnings.

The backend base URL is a build setting (`PAWWALK_API_BASE_URL` in
`project.yml`, default `http://localhost:8000`), threaded through
`Info.plist`'s `PawWalkAPIBaseURL` key and read once by `APIClient.init()`.
Override it per-scheme/config without touching source.

## Structure

```
PawWalk/
  PawWalkApp.swift, ContentView.swift   — entry point + auth-gated root
  Models/Models.swift                   — the whole API contract as Codable structs
  Services/                             — APIClient, TokenStore, AuthSession, LiveTracker
  Theme/                                — Brand.swift design tokens, Font.dm/.mono
  Components/HUD.swift                  — MonoCaption, PulsingDot
  Features/
    Auth/          — AuthView (login + signup, one screen, two modes)
    Home/          — HomeView, HomeViewModel, ProfileView, PetsView
    Walkers/       — WalkersView, WalkersViewModel
    Bookings/      — CreateBookingView, BookingsView, BookingsViewModel
    Walker/        — WalkerHomeView (the walker-side dashboard + state machine)
    Live/          — LiveTrackingView (Canvas map, WebSocket + CoreLocation HUD)
    Assistant/     — AssistantView, AssistantViewModel (chat → suggested walkers → booking)
```

## Deviations from the course

The lessons teach files through incremental snippets and excerpts, not
always full-file dumps, and a handful of symbols are referenced in prose or
usage sites without their body ever appearing on screen. Where snippets from
different lessons disagreed, the **latest / most complete version won**.
Every gap below was filled with the smallest reconciling code; each is also
marked `// ponytail:` at its definition site.

- **`APIClient` base URL.** The lessons hardcode
  `URL(string: "http://localhost:8000")!` in every exercise. The task asked
  for a build-setting/Info.plist override with that same default, so
  `APIClient.init()` reads `Info.plist`'s `PawWalkAPIBaseURL` (sourced from
  the `PAWWALK_API_BASE_URL` build setting in `project.yml`) and falls back
  to `http://localhost:8000` if unset/empty.
- **`APIClient` class shell.** `@MainActor final class APIClient` with
  `static let shared` is inferred from call sites (`APIClient.shared.…`
  appears in every networking/auth/live-tracking lesson) and from Module 3's
  "`APIClient` is marked `@MainActor`" — never shown as a single top-to-bottom
  file. Assembled from every `Services/APIClient.swift` fragment across
  Modules 7, 8, and 11 (decoder, encoder, `attachAuthorization`, `get`/`post`
  generics, `checkStatus`, `APIError`), in the order those fragments landed.
- **`login`/`signup` request bodies.** Only the *signatures* are shown
  (Module 1's teaser). Bodies POST a `[String: String]` dictionary of the
  obvious fields (`email`, `password`, and for signup `name`/`role`) through
  the existing generic `post` helper — the smallest correct implementation
  consistent with `AuthResponse` being the decoded reply.
- **`pets()`, `ownerStats()`, `walkerProfile()`, `assignedBookings()`,
  `transitionBooking(id:action:)`, `cancelBooking(id:)`.** Named and used
  throughout Modules 9–10 ("two more APIClient helpers built exactly the same
  one-line way") but never shown as code. Implemented as one-line `get`/`post`
  calls following the established pattern and the REST paths stated in prose
  (`/bookings/{id}/{action}`, `/bookings/assigned`, etc).
- **`addPet` / `deletePet`.** `PetsView` is described only in prose ("an
  add-pet sheet built on Form, and swipe-to-delete via `.onDelete`"); the
  APIClient methods it needs were never named. Added as `POST /pets` and
  `POST /pets/{id}/delete` following the same convention as the rest of the
  client.
- **`OwnerStats` / `RecentWalk`.** Only a two-field decoding *excerpt* of
  `RecentWalk` is shown (Module 7, illustrating `.iso8601`), plus call sites
  (`stats.recentWalks`, `walk.dogName`, `walk.walkerName`, `walk.sparkline`,
  `walk.durationMinutes` via `walkMeta`). The full struct shapes here are the
  smallest superset that satisfies every call site across Modules 7 and 9.
- **`DraftBooking`.** Described as "walker, time, duration" (Module 12) and
  referenced as a field on `AssistantReply`, never shown as Swift. Modeled
  with exactly those three fields, `CodingKeys` following the file's
  established snake_case convention.
- **`CreateBookingRequest`.** The memberwise init's parameter order is given
  verbatim (Module 10: "`walkerID`, `dogName`, `startTime`, `durationMinutes`,
  `notes` — in that order"); the struct declaration itself (types,
  `CodingKeys`) is inferred from that order plus `CreateBookingView`'s usage.
- **`Brand` tokens `onInverse`, `inverse`, `inverse2`, `surface`,
  `surfaceDeep`, `border`, `subtleInk`.** The lessons name "four more
  theme-aware tokens plus four fixed signal colors" without listing every
  hex value, and separately use `Brand.onInverse`/`Brand.inverse2` at call
  sites (auth submit button, live-tracking HUD, assistant bubbles) without
  ever defining them on screen. Hex values chosen to fit the documented
  Subtle-HUD palette (indigo accent, cool paper canvas); the four *named*
  fixed signal colors (`signalGreen`, `signalGreenSoft`, `pinAmber`,
  `pinBlue`) use the one hex the course does give (`pinAmber = 0xC68A1E`,
  from the Module 6 exercise) and reasonable companions for the rest.
- **DM Sans / JetBrains Mono font files.** The course says the fonts "already
  ship inside the app" via project config the learner never edits — no font
  binaries are distributed with the lessons content. `Font.custom` degrades
  to the system font when a named font isn't bundled, so the app still
  builds and runs; no `.ttf`/`.otf` files are checked in here. Add them under
  `PawWalk/Resources/Fonts/` + `UIAppFonts` in `Info.plist` + `project.yml`
  if/when the real assets are available.
- **`NextWalkCard`, `EmptyWalkCard`, `RecentWalkRow`, `sparklinePoints`,
  `HomeView`'s tab bar, `ProfileView`, `PetsView`.** Referenced or shown only
  as trimmed excerpts (e.g. `NextWalkCard(booking:walker:onTrack:onChat:)`'s
  call site, but never its `body`). Rebuilt as small, Brand-styled views that
  satisfy every call site and prop the lessons show; the sparkline itself is
  omitted (`RecentWalkRow` shows dog/walker/duration/distance text only) —
  add it if the course later shows the real drawing code.
- **App icon artwork.** `Resources/Assets.xcassets/AppIcon.appiconset`
  declares the 1024×1024 universal slot but ships no image — fine for
  simulator debug builds (confirmed above), needed before an App Store
  submission.
- **Swift Package for CoreLocation/WebSocket etc.** No third-party
  dependencies were needed — everything used (`URLSession`,
  `URLSessionWebSocketTask`, `CoreLocation`, `Security`, `Observation`) is a
  system framework, matching the course's "zero third-party dependencies"
  framing of `TokenStore`.
