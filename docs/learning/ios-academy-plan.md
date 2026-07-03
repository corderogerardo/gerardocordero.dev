# iOS Academy Plan

## Summary

The iOS course teaches Swift & SwiftUI from zero by building the PawWalk dog-walking app: walker list browsing, booking creation, authentication, live GPS tracking during walks, and an on-device AI assistant. The course shell is at `apps/learn/index.html`, lessons live in `apps/learn/lessons/`, progress is stored under the key `pawwalk-academy-ios-v1`, and validation runs via `node tools/validate.mjs lessons` — exercises must have solutions that pass embedded checks.

## Modules

| # | File | Title | Focus |
|---|---|---|---|
| 00 | `00-welcome.js` | Welcome & Setup | First Swift project; Xcode tour; how the course works |
| 01 | `01-swift-basics.js` | Swift Basics | Variables, types, functions, control flow fundamentals |
| 02 | `02-swift-deeper.js` | Swift, One Level Deeper | Optionals, error handling, structs, enums |
| 03 | `03-swift-for-apps.js` | Swift for Real Apps: Codable & Async | JSON decoding, async/await, URL loading |
| 04 | `04-swiftui-first-steps.js` | SwiftUI: First Screens | Views, modifiers, layout stacks, live preview |
| 05 | `05-state.js` | State & Data Flow | @State, @StateObject, @EnvironmentObject, binding |
| 06 | `06-design-system.js` | The HUD Design System | Colors, typography, component library, reusable views |
| 07 | `07-networking.js` | Talking to the Backend | URLSession, codable API clients, error handling |
| 08 | `08-auth.js` | Auth: Sign Up, Log In, Stay In | JWT tokens, secure storage, middleware, persisted login |
| 09 | `09-lists-navigation.js` | Lists, Navigation & View Models | NavigationStack, MVVM pattern, lazy loading |
| 10 | `10-bookings.js` | Bookings: Forms & the Full Loop | Form UI, request/response cycle, optimistic updates |
| 11 | `11-live-tracking.js` | Live GPS Tracking | CoreLocation, location updates, WebSocket streaming |
| 12 | `12-assistant-graduation.js` | The AI Assistant & Graduation | LLM integration, streaming, in-app chat; certificate |
| 13 | `13-swift-concurrency.js` | Swift Concurrency in Anger | Task trees, actors, data races, isolation, TaskGroup |
| 14 | `14-persistence.js` | Persistence & Offline-First | CoreData or SwiftData, sync strategies, offline UX |
| 15 | `15-modularization.js` | Modularize with SPM | Local Swift packages, dependency graph, composition root |

## Reference App

`apps/ios` is a SwiftUI reference implementation (built with XcodeGen) extracted from the lessons in PR #54. The lessons are the spec: the app demonstrates every pattern students build, with the same API contracts and data structures. Sync the app when lessons update to keep examples in sync.

## Senior Tier

| # | Title | Focus |
|---|---|---|
| 13 | Swift Concurrency in Anger ✅ | Task trees, actors, data races, isolation, TaskGroup — landed |
| 14 | Persistence & Offline-First ✅ | CoreData/SwiftData, change tracking, conflict resolution — landed |
| 15 | Modularize with SPM ✅ | Local Swift packages, dependency graph, composition root — landed |
| 16 | Testing Strategy | XCTest, async testing, mocking, snapshot tests, coverage |
| 17 | Widgets & Live Activities | Lock screen widgets, dynamic islands, background update API |
| 18 | Push & Background | UserNotifications, background fetch, silent push, VoIP |
| 19 | Performance & Instruments | Flame graph profiling, memory, disk I/O, battery; Xcode tools |
| 20 | Release Engineering & Graduation | TestFlight automation, version bumps, App Store review cycle |
