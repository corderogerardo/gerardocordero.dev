// Module 19 — Performance & Instruments. See FORMAT.md for the schema.
window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "performance-ios",
  title: "Performance & Instruments",
  emoji: "⏱️",
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    {
      id: "measure-do-not-guess",
      title: "Measure, do not guess",
      steps: [
        {
          type: "text",
          md: [
            "## Performance work starts with a measurement",
            "PawWalk feels fast today, but \"feels fast on my phone\" is not evidence. Every module so far has been about making something *work* — this module is about making it work **without wasting the learner's time or battery**. The rule that separates real performance work from guessing: measure first, then fix the heaviest thing you found. Optimizing code you *assume* is slow, without a profiler telling you so, routinely makes the wrong line faster while the actual bottleneck sits untouched.",
            "**Instruments** (part of Xcode) is where that measuring happens. Three templates you'll reach for constantly: **Time Profiler** (where does CPU time actually go?), **Allocations** (what's using memory, and how much?), and the **Hangs / Animation Hitches** template (is the UI freezing or stuttering?). Each attaches to a running build — simulator or device — and samples it while you use the app.",
          ],
        },
        {
          type: "text",
          md: [
            "## The main-thread rule, again",
            "Module 13 introduced the main actor: SwiftUI updates, gestures, and animations all run on the **main thread**, and that thread has a budget — roughly the length of one screen refresh — to stay smooth. Anything that blocks it (parsing a big JSON response, resizing a photo, running the haversine math over a long GPS history) steals from that budget. The fix is the same one from module 13: push the heavy work onto a background `Task` or actor, and only hop back to `@MainActor` to hand SwiftUI the finished result.",
            "This module is about *finding* which piece of code is doing that stealing, and building the habit of checking before you touch it.",
          ],
        },
        {
          type: "code",
          title: "BookingSummary.swift — blocking vs. offloaded",
          source: String.raw`// Blocks the main thread — every keystroke in the search field
// re-runs this over the full booking history.
var filteredBookings: [Booking] {
    bookingHistory.filter { $0.notes.localizedCaseInsensitiveContains(searchText) }
}

// Off the main thread — computed once in the background,
// the view just reads the finished result.
func refreshFilteredBookings() {
    Task.detached(priority: .userInitiated) {
        let matches = await self.bookingHistory.filter {
            $0.notes.localizedCaseInsensitiveContains(self.searchText)
        }
        await MainActor.run { self.filteredBookings = matches }
    }
}`,
          caption: "The first version re-filters the entire array synchronously on the main thread every time SwiftUI re-evaluates the view — with a few hundred bookings that's still fast, but the pattern doesn't scale, and Time Profiler is how you'd notice before it becomes a user-visible stutter.",
        },
        {
          type: "quiz",
          q: "Why measure with Instruments before optimizing a slow-feeling screen?",
          choices: [
            "Instruments is required by App Store Review before submission",
            "Without a profiler, you're guessing which code is actually slow — you can easily speed up a line that wasn't the bottleneck while the real one stays untouched",
            "Optimizing without Instruments always crashes the app",
            "Time Profiler automatically rewrites slow code for you",
          ],
          answer: 1,
          explain: "A hunch about what's slow is often wrong. Time Profiler shows the heaviest stack — the actual place CPU time is going — so your fix targets the real cost instead of a plausible-looking guess.",
          nudge: "Think about what happens if your guess about the slow code is wrong — where does the effort you spent optimizing go?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "time-profiler-and-hangs",
      title: "Time Profiler & hangs",
      steps: [
        {
          type: "text",
          md: [
            "## Time Profiler: where CPU time actually goes",
            "**Time Profiler** samples every thread many times a second and builds a call tree from those samples — the more samples land inside a function, the more CPU time it's costing. Sort by **heaviest stack** and you get a ranked list of \"what PawWalk is actually spending its CPU on\" instead of a guess. It's the tool for \"why does this screen feel sluggish,\" whether the cost is on the main thread or a background one.",
            "A **hang** is a specific, user-visible case: the main thread blocked long enough that the UI stops responding — taps don't register, animations freeze. Apple's guidance flags anything past roughly 250ms of main-thread unresponsiveness as a hang; Instruments' Hangs (and Animation Hitches) templates surface these automatically while you use the app, with an adjustable threshold.",
          ],
        },
        {
          type: "text",
          md: [
            "## Recompute vs. cache: the live-tracking route",
            "Module 11's `LiveTracker` draws the walk route on a `Canvas` as GPS fixes stream in. Picture a walk with a thousand fixes: if the view **recomputes** something expensive from all thousand fixes on every redraw — total distance, a smoothed path, anything O(n) or worse — that cost repeats on every single frame, even the frames where nothing changed. **Caching** the result in a stored property, and only recalculating when new data actually arrives, turns an O(n) do it every frame problem into an O(n) do it once problem.",
            "This is exactly the kind of cost Time Profiler makes visible: a function that shows up as a heavy stack on every scroll or redraw, when it should only run once per update.",
          ],
        },
        {
          type: "code",
          title: "RouteMapView.swift — recomputed vs. cached",
          source: String.raw`// Recomputed on every redraw — SwiftUI re-evaluates body
// far more often than the fixes actually change.
struct RouteMapView: View {
    let fixes: [GPSFix]
    var body: some View {
        Canvas { context, size in
            let total = LiveTracker.distanceMeters(fixes) // walks the whole array, every frame
            drawRoute(fixes, totalDistance: total, in: context, size: size)
        }
    }
}

// Cached — computed once when fixes last changed, not on every redraw.
struct RouteMapView: View {
    let fixes: [GPSFix]
    private let distance: Double

    init(fixes: [GPSFix]) {
        self.fixes = fixes
        self.distance = LiveTracker.distanceMeters(fixes) // computed once, stored
    }

    var body: some View {
        Canvas { context, size in
            drawRoute(fixes, totalDistance: distance, in: context, size: size)
        }
    }
}`,
          caption: "`distanceMeters` walks every fix to sum the haversine distance — cheap for ten fixes, not cheap for a thousand recomputed every frame. Storing it once in `init` (or updating it only when a new fix arrives) is the fix Time Profiler would point you toward.",
        },
        {
          type: "exercise",
          title: "Cache the expensive computation",
          prompt: [
            "`RouteMapView` recomputes `LiveTracker.distanceMeters(fixes)` inline inside `body` on every redraw. Replace that with a cached property: add `private let distance = LiveTracker.distanceMeters(fixes)` so it's computed once, and use `distance` inside the `Canvas` closure instead of recomputing it.",
          ],
          starter: String.raw`struct RouteMapView: View {
    let fixes: [GPSFix]
    // your code here

    var body: some View {
        Canvas { context, size in
            drawRoute(fixes, totalDistance: LiveTracker.distanceMeters(fixes), in: context, size: size)
        }
    }
}`,
          solution: String.raw`struct RouteMapView: View {
    let fixes: [GPSFix]
    private let distance = LiveTracker.distanceMeters(fixes)

    var body: some View {
        Canvas { context, size in
            drawRoute(fixes, totalDistance: distance, in: context, size: size)
        }
    }
}`,
          checks: [
            { re: /private let distance=LiveTracker\.distanceMeters\(fixes\)/, hint: "Declare `private let distance = LiveTracker.distanceMeters(fixes)` as a stored property, computed once — not inside `body`." },
            { re: /drawRoute\(fixes,totalDistance:distance,in:context,size:size\)/, hint: "Inside the `Canvas` closure, pass the cached `distance` property to `drawRoute`, not a fresh call to `LiveTracker.distanceMeters(fixes)`." },
            { re: /Canvas\{context,size in/, hint: "Keep the `Canvas { context, size in … }` closure — only what's inside changes." },
          ],
          mustNot: [
            { re: /Canvas\{context,size in\s*drawRoute\(fixes,totalDistance:LiveTracker\.distanceMeters\(fixes\)/, hint: "Don't call `LiveTracker.distanceMeters(fixes)` inside the `Canvas` closure — that's the recompute-every-frame bug you're fixing." },
          ],
          success: "That's the exact fix Time Profiler would lead you to: the heavy call moved from \"runs every redraw\" to \"runs once, in init.\"",
        },
        {
          type: "quiz",
          q: "What is a hang, specifically?",
          choices: [
            "Any time the app takes more than a second to launch",
            "The main thread blocked long enough that the UI stops responding to input — Apple's tools generally flag it past roughly 250ms",
            "A crash caused by running out of memory",
            "A background Task that never completes",
          ],
          answer: 1,
          explain: "A hang is main-thread unresponsiveness past a threshold (around 250ms in Apple's own tooling) — taps stop registering, animations freeze. It's a main-thread problem specifically, which is why offloading heavy work (module 13) is the usual fix.",
          nudge: "Which thread has to be blocked for the whole UI to stop responding to a tap?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "memory-and-retain-cycles",
      title: "Memory & retain cycles",
      steps: [
        {
          type: "text",
          md: [
            "## ARC frees objects when the last strong reference goes",
            "Swift manages memory with **ARC** (Automatic Reference Counting): every class instance keeps a count of how many **strong** references point to it, and when that count hits zero, ARC deallocates it. No garbage collector pausing the app to scan memory — just counting, done at compile time by inserted retain/release calls.",
            "The count only hits zero if nothing still holds a strong reference. A **strong reference cycle** (also called a retain cycle) is two objects each strongly holding the other — most commonly a **closure** that captures `self` strongly, stored on a property of that same `self`. Neither side's count ever reaches zero, so neither is ever freed: a leak.",
          ],
        },
        {
          type: "text",
          md: [
            "## The classic leak: a closure that captures self",
            "A `BookingViewModel` that stores a completion closure — say, one handed to `APIClient` and kept around for retry logic — leaks if that closure captures `self` strongly and the view model also holds the closure. The fix is a **capture list**: `[weak self]` at the top of the closure makes the capture weak, so it doesn't keep `self` alive. Since a weak reference can turn nil (the object might already be gone by the time the closure runs), you unwrap it first, typically with `guard let self else { return }`.",
          ],
        },
        {
          type: "code",
          title: "BookingViewModel.swift — leaking vs. weak self",
          source: String.raw`final class BookingViewModel: ObservableObject {
    @Published var status: String = "pending"
    private var onRetry: (() -> Void)?

    // Leaks: this closure captures self strongly, and self.onRetry
    // holds the closure — a cycle. Neither is ever deallocated.
    func scheduleRetryLeaky() {
        onRetry = {
            self.status = "retrying"
            self.submitBooking()
        }
    }

    // Fixed: [weak self] breaks the cycle. guard-let unwraps the
    // optional and bails out early if the view model is already gone.
    func scheduleRetry() {
        onRetry = { [weak self] in
            guard let self else { return }
            self.status = "retrying"
            self.submitBooking()
        }
    }

    func submitBooking() { /* … */ }
}`,
          caption: "The Leaks and Allocations instruments in Xcode are how you'd actually catch this in a real app — a memory graph showing `BookingViewModel` and its closure keeping each other alive, never reaching zero references.",
        },
        {
          type: "exercise",
          title: "Break the retain cycle",
          prompt: [
            "Fix `scheduleRetry()`: add a `[weak self]` capture list to the closure, then start the closure body with `guard let self else { return }` before using `self`.",
          ],
          starter: String.raw`final class BookingViewModel: ObservableObject {
    @Published var status: String = "pending"
    private var onRetry: (() -> Void)?

    func scheduleRetry() {
        onRetry = {
            // your code here
            self.status = "retrying"
            self.submitBooking()
        }
    }

    func submitBooking() { }
}`,
          solution: String.raw`final class BookingViewModel: ObservableObject {
    @Published var status: String = "pending"
    private var onRetry: (() -> Void)?

    func scheduleRetry() {
        onRetry = { [weak self] in
            guard let self else { return }
            self.status = "retrying"
            self.submitBooking()
        }
    }

    func submitBooking() { }
}`,
          checks: [
            { re: /onRetry=\{\[weak self\]in/, hint: "Add the capture list right after the opening brace: `onRetry = { [weak self] in`." },
            { re: /guard let self else\{return\}/, hint: "Unwrap the weak reference with `guard let self else { return }` before touching `self`." },
            { re: /guard let self else\{return\}self\.status="retrying"/, hint: "The guard must come first, immediately followed by `self.status = \"retrying\"` — unwrap before you use `self`." },
          ],
          mustNot: [
            { re: /onRetry=\{self\.status/, hint: "That's the leaky version — the closure needs `[weak self]`, not a plain strong capture of `self`." },
          ],
          success: "That capture list is the difference between this view model getting freed normally and it leaking for the lifetime of the app.",
        },
        {
          type: "quiz",
          q: "What actually creates a strong reference cycle here?",
          choices: [
            "Any closure at all, whether or not it captures self",
            "A closure that captures `self` strongly, while `self` also holds a strong reference to that closure — each keeps the other's count above zero",
            "Using `@Published` on a property",
            "Calling `submitBooking()` from inside a closure",
          ],
          answer: 1,
          explain: "The cycle needs both directions: the closure strongly holds self, AND self (via the stored `onRetry` property) strongly holds the closure. Break either direction — usually with `[weak self]` on the closure's side — and ARC can free both when nothing else references them.",
          nudge: "A cycle needs two references pointing at each other — which two objects are holding on to which, here?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "launch-time-and-metrickit",
      title: "Launch time & MetricKit",
      steps: [
        {
          type: "text",
          md: [
            "## Cold vs. warm launch",
            "A **cold launch** is starting PawWalk from nothing — the OS hasn't got any of its code or data in memory, so it has to map the binary, run everything before `main()` (loading dynamic libraries, running static initializers — the **pre-main** phase), then build and show the first frame. A **warm launch** (the app was already recently in memory, e.g. resumed from the background) skips most of that and is much faster. Users mostly notice cold launches — it's the wait before the very first thing they see.",
            "The budget that matters is time-to-first-frame: work that isn't needed to draw that first screen — an analytics SDK's full setup, prefetching data the learner won't see for a few taps, non-essential background registrations — should be deferred until just after, not done inline during launch.",
          ],
        },
        {
          type: "text",
          md: [
            "## MetricKit: performance data from real users, not just your device",
            "Instruments shows you performance on **your** device, in **your** hands, during a profiling session. **MetricKit** (`import MetricKit`) is different: it's an Apple framework that collects performance and diagnostic data — launch time, hangs, memory, disk writes, energy — directly on **users' own devices**, running the app in the wild, and delivers a summarized report to your app roughly once a day.",
            "You subscribe by conforming to `MXMetricManagerSubscriber` and registering with `MXMetricManager.shared.add(self)`, typically at launch. The system then calls `didReceive(_ payloads: [MXMetricPayload])` with aggregated field data whenever a report is ready — no user prompt, no dashboard to build; Xcode Organizer can also show MetricKit data if you don't want to build your own pipeline.",
          ],
        },
        {
          type: "code",
          title: "PawWalkKit/PerformanceMonitor.swift",
          source: String.raw`import MetricKit

final class PerformanceMonitor: NSObject, MXMetricManagerSubscriber {
    static let shared = PerformanceMonitor()

    func start() {
        MXMetricManager.shared.add(self)
    }

    func didReceive(_ payloads: [MXMetricPayload]) {
        for payload in payloads {
            if let launch = payload.applicationLaunchMetrics {
                print("Launch metrics from a real device: \(launch)")
            }
        }
    }
}`,
          caption: "`MXMetricManagerSubscriber` conformance needs `NSObject` under the hood. Call `PerformanceMonitor.shared.start()` once at app launch — after that, MetricKit delivers reports on its own schedule, from whatever devices PawWalk is actually installed on.",
        },
        {
          type: "exercise",
          title: "Subscribe to MetricKit",
          prompt: [
            "Write `start()` on `PerformanceMonitor`: register `self` as a subscriber by calling `MXMetricManager.shared.add(self)`.",
          ],
          starter: String.raw`import MetricKit

final class PerformanceMonitor: NSObject, MXMetricManagerSubscriber {
    func start() {
        // your code here
    }
}`,
          solution: String.raw`import MetricKit

final class PerformanceMonitor: NSObject, MXMetricManagerSubscriber {
    func start() {
        MXMetricManager.shared.add(self)
    }
}`,
          checks: [
            { re: /func start\(\)\{MXMetricManager\.shared\.add\(self\)/, hint: "Put the registration INSIDE `start()`: `func start() { MXMetricManager.shared.add(self) }` — that's the call that turns on delivery of `didReceive` reports. Registering it from some other method doesn't count." },
          ],
          success: "That one call is enough to start receiving real field data from wherever PawWalk actually runs — not just your dev device.",
        },
        {
          type: "quiz",
          q: "Why does MetricKit's field data beat profiling only on your own device?",
          choices: [
            "MetricKit runs faster than Instruments, so it finds more bugs",
            "It reports performance from real users' devices in real conditions (older hardware, poor networks, background apps competing for memory) — the range Instruments on your dev device can't cover",
            "Instruments cannot measure launch time at all, only MetricKit can",
            "MetricKit replaces the need for Instruments entirely",
          ],
          answer: 1,
          explain: "Your dev device is one data point — usually a fast, recently-restarted phone on good Wi-Fi. MetricKit aggregates from the actual mix of devices, OS versions, and conditions your users are really in, surfacing problems (like slow launches on older hardware) that never show up in your own testing.",
          nudge: "Whose device is Instruments measuring, and whose devices is MetricKit measuring?",
        },
      ],
    },
  ],
});
