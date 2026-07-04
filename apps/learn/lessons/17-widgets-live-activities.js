// Module 17 — Widgets & Live Activities. See FORMAT.md for the schema.
window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "widgets-live-activities",
  title: "Widgets & Live Activities",
  emoji: "✨",
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    {
      id: "glanceable-not-interactive",
      title: "Glanceable, not interactive",
      steps: [
        {
          type: "text",
          md: [
            "## A widget is a window, not a screen",
            "Everything so far has been PawWalk the **app** — you tap it open, it runs your code, you interact with it. A **widget** is different: it's a small, read-only view that lives on the Home Screen or Lock Screen, drawn by the system on a schedule **you don't control**. No scrolling, no buttons wired to arbitrary code, no live network calls while it's on screen. Just glanceable information — think \"next walk: 3:00 PM with Mochi's Human\" at a glance, no unlocking required.",
            "**WidgetKit** is the framework for that: small views the system refreshes periodically.",
          ],
        },
        {
          type: "text",
          md: [
            "## Live Activities: a widget for something happening RIGHT NOW",
            "Module 11 built live GPS tracking — a walk in progress, updating every few seconds while the app runs. A **Live Activity** puts that same in-progress state on the **Lock Screen** and in the **Dynamic Island** (the pill-shaped cutout on Pro iPhones), without the learner unlocking the phone or opening PawWalk. It's still glanceable and read-only, but it updates **live** as the walk moves — a widget for one specific ongoing event instead of general-purpose background info.",
            "**ActivityKit** is the framework for that: start one when a walk begins, push updates as GPS fixes arrive, end it when the walk is done.",
          ],
        },
        {
          type: "text",
          md: [
            "## The budget you don't control",
            "This is the part that trips people up coming from app development: a widget doesn't refresh whenever it wants, or whenever the data changes. You hand the system a **timeline** of entries with dates, and the system decides when to actually redraw — based on a battery-conscious **refresh budget** it manages across every widget on the device. Ask for updates every second and the system will simply throttle you. Live Activities are more generous (they're built for fast-moving state) but even they update via a defined API, not by polling on their own.",
          ],
        },
        {
          type: "code",
          title: "NextWalkWidget/NextWalkEntry.swift",
          source: String.raw`import WidgetKit

struct NextWalkEntry: TimelineEntry {
    let date: Date
    let walkerName: String
    let startTime: Date
}`,
          caption: "A TimelineEntry is just a struct with (at minimum) a `date` — the point in time this entry represents — plus whatever data the widget view needs to render. WidgetKit uses `date` to decide when to swap to the next entry.",
        },
        {
          type: "quiz",
          q: "Which of these can a WidgetKit widget do?",
          choices: [
            "Scroll a long list of every upcoming walk",
            "Run arbitrary app code the instant the learner taps it, before anything else happens",
            "Refresh itself on demand the moment new data arrives",
            "Show a small, static-until-next-scheduled-update view built from data the app handed it ahead of time",
          ],
          answer: 3,
          explain: "Widgets show a snapshot from a timeline entry and wait for the system's own refresh schedule — no scrolling, no arbitrary code on tap (a tap can only open the app or trigger a narrow, declared interaction), and no refreshing on demand. The system owns the update budget.",
          nudge: "Widgets are drawn from entries the system chooses when to swap — think about what that rules out.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "next-walk-widget",
      title: "A next-walk widget",
      steps: [
        {
          type: "text",
          md: [
            "## TimelineProvider: the schedule-maker",
            "A `TimelineProvider` is the type that hands WidgetKit its `TimelineEntry` values. Three methods: `placeholder(in:)` (a generic entry shown while data loads, e.g. in the widget gallery), `getSnapshot(in:completion:)` (one entry for quick previews, like when the learner is picking a widget), and `getTimeline(in:completion:)` — the real one, returning an array of entries plus a `TimelineReloadPolicy` (`.atEnd`, `.after(date)`, or `.never`) telling the system when to ask again.",
            "The widget's SwiftUI view just renders **one** entry at a time — same idea as any other SwiftUI view, just fed by the provider instead of a view model.",
          ],
        },
        {
          type: "text",
          md: [
            "## A separate process needs a shared mailbox",
            "Here's the part that's easy to miss: the widget doesn't run inside the PawWalk app process. It's its own **extension**, launched and torn down by the system independently. That means it **cannot** just read the app's in-memory state or call a `ViewModel` living in the main app — there is no shared memory to read.",
            "The fix is an **App Group** — a shared container both the app and the widget extension are allowed to read and write, configured once in each target's capabilities. The app writes \"next walk\" data there whenever it changes; the widget's `getTimeline` reads it back. The simplest form of that shared container is `UserDefaults(suiteName:)` pointed at the App Group identifier instead of the default suite.",
          ],
        },
        {
          type: "code",
          title: "NextWalkWidget/NextWalkProvider.swift",
          source: String.raw`import WidgetKit

struct NextWalkProvider: TimelineProvider {
    func placeholder(in context: Context) -> NextWalkEntry {
        NextWalkEntry(date: .now, walkerName: "Mochi's Human", startTime: .now)
    }

    func getSnapshot(in context: Context, completion: @escaping (NextWalkEntry) -> Void) {
        completion(placeholder(in: context))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<NextWalkEntry>) -> Void) {
        let shared = UserDefaults(suiteName: "group.dev.gerardocordero.pawwalk")
        let walkerName = shared?.string(forKey: "nextWalkerName") ?? "No walk scheduled"
        let startTime = shared?.object(forKey: "nextWalkStartTime") as? Date ?? .now

        let entry = NextWalkEntry(date: .now, walkerName: walkerName, startTime: startTime)
        completion(Timeline(entries: [entry], policy: .after(startTime)))
    }
}`,
          caption: "getTimeline reads from the App Group's shared UserDefaults — the same suite name the main app writes to whenever a booking is confirmed — rather than calling into the app directly. `.after(startTime)` tells WidgetKit not to bother asking again until the walk's start time passes.",
        },
        {
          type: "exercise",
          title: "Write the NextWalkEntry struct",
          prompt: [
            "Define `struct NextWalkEntry` conforming to `TimelineEntry`, with a `let date: Date` and a `let walkerName: String` for the walker's display name.",
          ],
          starter: String.raw`import WidgetKit

// your code here`,
          solution: String.raw`import WidgetKit

struct NextWalkEntry: TimelineEntry {
    let date: Date
    let walkerName: String
}`,
          checks: [
            { re: /struct NextWalkEntry:TimelineEntry\{/, hint: "Declare `struct NextWalkEntry: TimelineEntry { … }` — conform to the protocol WidgetKit expects." },
            { re: /let date:Date/, hint: "Every TimelineEntry needs `let date: Date` — that's what WidgetKit uses to schedule the swap to the next entry." },
            { re: /let walkerName:String/, hint: "Add `let walkerName: String` for the payload the widget view will display." },
          ],
          success: "That's a real TimelineEntry — WidgetKit can now schedule it and hand it to your widget view.",
        },
        {
          type: "quiz",
          q: "The next-walk widget needs to show data from the main PawWalk app. How does it get it?",
          choices: [
            "It imports the app's ViewModel directly and reads its published properties",
            "It calls the app's APIClient itself, the same way the app's networking layer does",
            "It reads from a shared container (like UserDefaults with an App Group suite name) that the main app writes to — the widget runs in its own separate process, so there's no shared memory to read directly",
            "It doesn't need to — WidgetKit automatically syncs any @Observable data between the app and its widgets",
          ],
          answer: 2,
          explain: "The widget extension is a separate process from the app, so there's no in-memory object to reach into. An App Group gives both processes a shared container — UserDefaults(suiteName:) pointed at the group id is the simplest version — the app writes, the widget's TimelineProvider reads.",
          nudge: "The widget isn't part of the app's process — so what CAN cross a process boundary?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "live-activity-for-active-walk",
      title: "A Live Activity for the active walk",
      steps: [
        {
          type: "text",
          md: [
            "## ActivityKit's two-part shape: static vs. dynamic",
            "A Live Activity is described by one type you define, conforming to `ActivityAttributes`. It splits into two kinds of data:",
            "- **Static attributes** — set once, when the activity starts, and never change for its whole lifetime: the booking id, the walker's name. These are plain properties on the `ActivityAttributes`-conforming struct.",
            "- **Dynamic content state** — the part that updates live while the walk is happening: elapsed seconds, distance walked so far. This lives in a **nested type** named `ContentState`, conforming to `Codable` and `Hashable` (so the system can serialize and compare it, including over a push notification).",
            "The Lock Screen banner and the Dynamic Island both render from the current `ContentState` — same data, different presentation depending on where iOS shows it.",
          ],
        },
        {
          type: "text",
          md: [
            "## Why the split matters",
            "If everything were dynamic, the system would have to resend the walker's name on every single update — wasteful, and it never changes anyway. Splitting static from dynamic means each `ContentState` push only carries what's actually moving: the elapsed time and distance, not the whole booking again.",
          ],
        },
        {
          type: "code",
          title: "PawWalkWidgets/WalkActivityAttributes.swift",
          source: String.raw`import ActivityKit

struct WalkActivityAttributes: ActivityAttributes {
    struct ContentState: Codable, Hashable {
        var elapsedSeconds: Int
        var distanceMeters: Double
    }

    let bookingId: String
    let walkerName: String
}`,
          caption: "bookingId and walkerName are set once at Activity.request and never change. ContentState.elapsedSeconds and .distanceMeters are what module 11's GPS fix stream will push updates into as the walk continues.",
        },
        {
          type: "exercise",
          title: "Write the WalkActivityAttributes struct",
          prompt: [
            "Define `struct WalkActivityAttributes` conforming to `ActivityAttributes`, with a nested `struct ContentState: Codable, Hashable` holding `var elapsedSeconds: Int`.",
          ],
          starter: String.raw`import ActivityKit

// your code here`,
          solution: String.raw`import ActivityKit

struct WalkActivityAttributes: ActivityAttributes {
    struct ContentState: Codable, Hashable {
        var elapsedSeconds: Int
    }
}`,
          checks: [
            { re: /struct WalkActivityAttributes:ActivityAttributes\{/, hint: "Declare `struct WalkActivityAttributes: ActivityAttributes { … }` — conform to ActivityKit's protocol." },
            { re: /struct ContentState:Codable,Hashable\{/, hint: "Nest `struct ContentState: Codable, Hashable { … }` inside — that exact nested name is what ActivityKit looks for." },
            { re: /var elapsedSeconds:Int/, hint: "The dynamic value goes inside ContentState as a `var` (it changes) — `var elapsedSeconds: Int`." },
          ],
          success: "That's the static/dynamic split ActivityKit expects — attributes for what never changes, a nested ContentState for what does.",
        },
        {
          type: "quiz",
          q: "What's the difference between an ActivityAttributes property and a ContentState property?",
          choices: [
            "There's no real difference — both can be read the same way from the widget view",
            "ActivityAttributes properties are set once when the Live Activity starts and stay fixed (like a booking id); ContentState properties are the dynamic, live-updating part (like elapsed time) pushed as the event progresses",
            "ContentState is only used on the Lock Screen; ActivityAttributes is only used in the Dynamic Island",
            "ActivityAttributes must be a class; ContentState must be a struct",
          ],
          answer: 1,
          explain: "ActivityAttributes holds the static data fixed for the activity's whole life — set once at request time. The nested ContentState holds whatever changes while the event is ongoing, and every update you push is a new ContentState value.",
          nudge: "One of these gets set once at the start of the walk; the other gets pushed a new value every time a GPS fix comes in.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "update-as-walk-moves",
      title: "Update it as the walk moves",
      steps: [
        {
          type: "text",
          md: [
            "## Starting the activity",
            "`Activity<WalkActivityAttributes>.request(attributes:content:pushType:)` starts a new Live Activity: pass the static `WalkActivityAttributes`, an `ActivityContent` wrapping the **initial** `ContentState`, and a `pushType` (`.token` if you want to push updates remotely, `nil` if updates only ever come from the app while it's foreground/background-active). It returns the running `Activity` — hang onto it, you'll need it to push updates.",
          ],
        },
        {
          type: "code",
          title: "PawWalkKit/WalkActivityManager.swift — starting",
          source: String.raw`import ActivityKit

func startWalkActivity(bookingId: String, walkerName: String) throws -> Activity<WalkActivityAttributes> {
    let attributes = WalkActivityAttributes(bookingId: bookingId, walkerName: walkerName)
    let initialState = WalkActivityAttributes.ContentState(elapsedSeconds: 0, distanceMeters: 0)
    let content = ActivityContent(state: initialState, staleDate: nil)

    return try Activity.request(attributes: attributes, content: content, pushType: nil)
}`,
          caption: "staleDate: nil means the system doesn't consider this content \"stale\" on its own — you'll be the one pushing fresh state as the walk progresses.",
        },
        {
          type: "text",
          md: [
            "## Pushing updates, tying back to module 11's fix stream",
            "Module 11's live-tracking loop already reacts to each new GPS fix. Wiring a Live Activity in means: every time that loop computes new elapsed time and distance, build a fresh `ContentState` and call `activity.update(_:)` with it wrapped in `ActivityContent`. The Lock Screen and Dynamic Island redraw with the new numbers — no polling, no timeline entries here, just a direct push from your running code.",
            "When the walk ends, call `activity.end(_:dismissalPolicy:)` with a final `ContentState` and a policy — `.immediate` removes it right away, `.after(date)` keeps it visible a bit longer (handy so the learner sees the \"walk complete\" state before it disappears), `.default` lets the system decide.",
          ],
        },
        {
          type: "code",
          title: "PawWalkKit/WalkActivityManager.swift — updating and ending",
          source: String.raw`func pushWalkUpdate(_ activity: Activity<WalkActivityAttributes>, elapsedSeconds: Int, distanceMeters: Double) async {
    let state = WalkActivityAttributes.ContentState(elapsedSeconds: elapsedSeconds, distanceMeters: distanceMeters)
    await activity.update(ActivityContent(state: state, staleDate: nil))
}

func endWalkActivity(_ activity: Activity<WalkActivityAttributes>, finalElapsedSeconds: Int, finalDistanceMeters: Double) async {
    let finalState = WalkActivityAttributes.ContentState(elapsedSeconds: finalElapsedSeconds, distanceMeters: finalDistanceMeters)
    await activity.end(ActivityContent(state: finalState, staleDate: nil), dismissalPolicy: .after(.now.addingTimeInterval(60)))
}`,
          caption: "pushWalkUpdate is the function module 11's GPS fix handler would call on every new fix. dismissalPolicy: .after(...) keeps the finished-walk card up for a minute so the learner sees it before it's gone.",
        },
        {
          type: "text",
          md: [
            "## What happens if PawWalk gets backgrounded",
            "An app in the background has very limited runtime. If the walk needs updates to keep flowing while PawWalk is backgrounded (or fully killed), the fix is the `pushType: .token` path from the request call: ActivityKit hands you a **push token** for that specific activity, and your server sends **APNs pushes** carrying new `ContentState` payloads straight to the Live Activity — no app code running at all. Same idea as a regular push notification, just targeted at one running activity instead of the Notification Center.",
          ],
        },
        {
          type: "exercise",
          title: "Push a Live Activity update",
          prompt: [
            "Write an `async` function `pushWalkUpdate` taking `activity: Activity<WalkActivityAttributes>` and `elapsedSeconds: Int`. Build a `WalkActivityAttributes.ContentState` with that value (distanceMeters can be `0`), wrap it in `ActivityContent(state:staleDate:)` with `staleDate: nil`, and `await activity.update(...)` it.",
          ],
          starter: String.raw`func pushWalkUpdate(activity: Activity<WalkActivityAttributes>, elapsedSeconds: Int) async {
    // your code here
}`,
          solution: String.raw`func pushWalkUpdate(activity: Activity<WalkActivityAttributes>, elapsedSeconds: Int) async {
    let state = WalkActivityAttributes.ContentState(elapsedSeconds: elapsedSeconds, distanceMeters: 0)
    await activity.update(ActivityContent(state: state, staleDate: nil))
}`,
          checks: [
            { re: /ContentState\(elapsedSeconds:elapsedSeconds,distanceMeters:0\)/, hint: "Build `WalkActivityAttributes.ContentState(elapsedSeconds: elapsedSeconds, distanceMeters: 0)` from the parameter." },
            { re: /await activity\.update\(ActivityContent\(state:\w+,staleDate:nil\)\)/, hint: "Call `await activity.update(ActivityContent(state: state, staleDate: nil))` — the update goes through `activity`, wrapped in ActivityContent." },
          ],
          mustNot: [
            { re: /Activity\.request/, hint: "This function only pushes an update to an already-running activity — don't start a new one here." },
          ],
          success: "That's the exact call module 11's GPS fix handler would make on every new location update.",
        },
        {
          type: "quiz",
          q: "PawWalk is backgrounded (or the process is killed) while a walk is still in progress. How does the Live Activity keep updating?",
          choices: [
            "It doesn't — Live Activities freeze the instant the app leaves the foreground",
            "WidgetKit automatically polls the app's server every few seconds even while backgrounded",
            "It can't update at all once backgrounded; the learner has to reopen the app to see fresh numbers",
            "Via a push notification sent to the activity's push token (from requesting with pushType: .token) — APNs delivers new ContentState payloads straight to the Live Activity without any app code running",
          ],
          answer: 3,
          explain: "Requesting the activity with pushType: .token gives you a push token scoped to that specific Live Activity. Your server sends APNs pushes carrying new ContentState values to that token, and the system updates the Lock Screen / Dynamic Island directly — no foreground app process required.",
          nudge: "What did requesting the activity with `pushType: .token` give you back?",
        },
      ],
    },
  ],
});
