# Android Academy Plan

## Summary

The Android course teaches Kotlin & Jetpack Compose from zero by building the PawWalk dog-walking app: walker list display, booking form submission, authentication, live location tracking on walks, and an on-device AI assistant. The course shell is at `apps/learn/android.html`, lessons live in `apps/learn/lessons-android/`, progress is stored under the key `pawwalk-academy-android-v1`, and validation runs via `node tools/validate.mjs lessons-android` — exercises must have solutions that pass embedded checks.

## Modules

| # | File | Title | Focus |
|---|---|---|---|
| 00 | `00-welcome.js` | Welcome & Setup | First Android project; Android Studio tour; how the course works |
| 01 | `01-kotlin-basics.js` | Kotlin Basics | Variables, types, functions, control flow fundamentals |
| 02 | `02-kotlin-deeper.js` | Kotlin, One Level Deeper | Null safety, sealed classes, scopes, extension functions |
| 03 | `03-kotlin-for-apps.js` | Kotlin for Real Apps: Serialization & Coroutines | JSON parsing, coroutines intro, async/await |
| 04 | `04-compose-first-steps.js` | Jetpack Compose: First Steps | Composables, modifiers, layout, preview, state recomposition |
| 05 | `05-state.js` | State & Data Flow | remember, mutableState, state hoisting, ViewModel |
| 06 | `06-design-system.js` | The PawWalk Design System | Material 3 theming, components, typography, app bar |
| 07 | `07-networking.js` | Networking with Retrofit | HTTP client setup, service interfaces, interceptors |
| 08 | `08-auth.js` | Auth & Secure Storage | JWT tokens, EncryptedSharedPreferences, session persistence |
| 09 | `09-lists-navigation.js` | Lists & Navigation | LazyColumn, NavController, screen routing, transitions |
| 10 | `10-bookings.js` | Bookings & Forms | Form fields, validation, request submission, error states |
| 11 | `11-live-tracking.js` | Live Walk Tracking | LocationManager, permissions, coroutine scope, WebSocket updates |
| 12 | `12-assistant-graduation.js` | The AI Assistant & Graduation | LLM API integration, streaming, UI chat interface; certificate |
| 13 | `13-coroutines-flow.js` | Coroutines & Flow in Anger | Scope, launch vs async, Flow patterns, cancellation — landed |
| 14 | `14-room-offline.js` | Room & Offline-First | Room database, migrations, offline sync, query optimization |
| 15 | `15-hilt-di.js` | Dependency Injection with Hilt | Hilt DI, HiltViewModel, scopes, test modules |
| 16 | `16-feature-modules.js` | Modularize by Feature | Gradle multi-module, api vs implementation, convention plugins |
| 17 | `17-foreground-gps.js` | Foreground Location Service | Foreground service, FusedLocationProvider, permissions, Doze |
| 18 | `18-testing-pyramid.js` | The Testing Pyramid | JUnit, Turbine, Robolectric, Compose UI + Roborazzi screenshots |

## Reference App

`apps/android` is a Jetpack Compose reference implementation extracted from the lessons. The build gate is the `android-build` CI job (no local Android SDK on this machine). Lessons are the spec: the app demonstrates every pattern students build, with the same API contracts and data structures. Sync the app when lessons update to keep examples aligned.

## Senior Tier

| # | Title | Focus |
|---|---|---|
| 13 | Coroutines & Flow in Anger ✅ | Scope, launch vs async, Flow patterns, structured concurrency — landed |
| 14 | Room & Offline-First ✅ | Room database, migrations, offline sync, conflict resolution — landed |
| 15 | Hilt DI ✅ | Hilt DI, HiltViewModel, scopes, test modules — landed |
| 16 | Modularize by Feature ✅ | Gradle multi-module, api vs implementation, convention plugins — landed |
| 17 | Foreground Location Service ✅ | Foreground service, FusedLocationProvider, permissions, Doze — landed |
| 18 | The Testing Pyramid ✅ | JUnit, Turbine, Robolectric, Compose UI + Roborazzi screenshots — landed |
| 19 | Performance (Baseline Profiles) | Startup profiling, baseline profiles, macrobenchmark, R8 optimization |
| 20 | Play Release & Graduation | Version bumping, Play Console submission, staged rollout mechanics |
