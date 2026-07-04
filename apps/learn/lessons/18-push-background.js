// Module 18 — Push & Background Work. See FORMAT.md for the schema.
window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "push-background",
  title: "Push & Background Work",
  emoji: "🔔",
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    {
      id: "remote-notifications",
      title: "Remote notifications",
      steps: [
        {
          type: "text",
          md: [
            "## A push starts outside your app",
            "Everything so far runs because the learner opened PawWalk. A **push notification** is different: your server tells Apple's **APNs** (Apple Push Notification service) to deliver a message to a specific device, and it shows up whether PawWalk is running or not — \"Your walker is 5 minutes away\" while the phone is in a pocket.",
            "Getting there takes three steps: (1) ask the learner for permission, (2) register with APNs to get a **device token** — an address for this one install of the app on this one device, (3) send that token to your server so it knows where to push.",
          ],
        },
        {
          type: "text",
          md: [
            "## The permission ask",
            "`UNUserNotificationCenter` (from the `UserNotifications` framework) is the API for both local and remote notifications. Call `requestAuthorization(options:)` with the pieces you want — `.alert` (banner text), `.badge` (the little number on the app icon), `.sound` — and the system shows the OS permission sheet **once**. If the learner grants it, call `UIApplication.shared.registerForRemoteNotifications()` to kick off the APNs handshake.",
          ],
        },
        {
          type: "code",
          title: "PawWalkKit/PushSetup.swift",
          source: String.raw`import UserNotifications
import UIKit

func requestPushPermission() async throws {
    let granted = try await UNUserNotificationCenter.current()
        .requestAuthorization(options: [.alert, .badge, .sound])

    if granted {
        await UIApplication.shared.registerForRemoteNotifications()
    }
}`,
          caption: "requestAuthorization is async and throwing — it can fail (rare, but possible) and it suspends until the learner taps Allow or Don't Allow. Only register for remote notifications once permission is actually granted.",
        },
        {
          type: "text",
          md: [
            "## Getting the device token",
            "If registration succeeds, UIKit's app delegate gets `application(_:didRegisterForRemoteNotificationsWithDeviceToken:)` with a `Data` blob — the device token. Convert it to a hex string and POST it to your server so a booking confirmation can trigger a real push later. If registration fails (no network, simulator without push entitlement, etc.), `didFailToRegisterForRemoteNotificationsWithError` fires instead.",
          ],
        },
        {
          type: "code",
          title: "PawWalkKit/AppDelegate.swift",
          source: String.raw`func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
) {
    let token = deviceToken.map { String(format: "%02x", $0) }.joined()
    Task { await APIClient.shared.registerDeviceToken(token) }
}

func application(
    _ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error
) {
    print("Push registration failed: \(error)")
}`,
          caption: "The device token identifies THIS app install on THIS device — it can change (reinstall, restore from backup), so your server should expect to receive a fresh one occasionally and overwrite the old.",
        },
        {
          type: "exercise",
          title: "Request notification permission",
          prompt: [
            "Write an `async throws` function `requestPushPermission` that asks `UNUserNotificationCenter.current()` for authorization with `.alert`, `.badge`, and `.sound`.",
          ],
          starter: String.raw`import UserNotifications

// your code here`,
          solution: String.raw`import UserNotifications

func requestPushPermission() async throws {
    let granted = try await UNUserNotificationCenter.current()
        .requestAuthorization(options: [.alert, .badge, .sound])
}`,
          checks: [
            { re: /func requestPushPermission\(\)async throws\{/, hint: "Declare it as `func requestPushPermission() async throws { … }` — an async, throwing function, exactly as asked." },
            { re: /UNUserNotificationCenter\.current\(\)/, hint: "Get the shared center with `UNUserNotificationCenter.current()`." },
            { re: /\.requestAuthorization\(options:\[\.alert,\.badge,\.sound\]\)/, hint: "Call `.requestAuthorization(options: [.alert, .badge, .sound])` — that array is the exact set of permissions PawWalk needs." },
            { re: /try await/, hint: "requestAuthorization is `async throws` — call it with `try await`." },
          ],
          success: "That's the real permission ask — grant it, and PawWalk can move on to registering for remote notifications.",
        },
        {
          type: "quiz",
          q: "What does a device token actually identify?",
          choices: [
            "The learner's Apple ID, usable to push to any of their devices",
            "This specific install of the app on this specific device — the address APNs uses to route a push there",
            "A permanent identifier that never changes for the lifetime of the device",
            "The learner's push notification preferences (which categories they've allowed)",
          ],
          answer: 1,
          explain: "A device token is APNs' address for one install of one app on one device — not a person, not an account. It can change (reinstalls, restores), which is why the app re-sends it to your server on every successful registration.",
          nudge: "Think about what breaks the token — reinstalling the app — and what that tells you about what it's attached to.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "enriching-a-push",
      title: "Enriching a push",
      steps: [
        {
          type: "text",
          md: [
            "## Foreground vs. background presentation",
            "When a push arrives while PawWalk is in the **foreground**, iOS doesn't automatically show a banner — your app gets first say. The `UNUserNotificationCenterDelegate` method `userNotificationCenter(_:willPresent:withCompletionHandler:)` fires, and you call its `completionHandler` with the presentation options you want (`.banner`, `.sound`, `.badge`, or `[]` for none). Skip this delegate method and foreground pushes are silent by default — a common \"why isn't my push showing\" bug.",
            "When the app is backgrounded or not running, the system shows the banner itself — no delegate call needed for that part.",
          ],
        },
        {
          type: "code",
          title: "PawWalkKit/PushSetup.swift — foreground presentation",
          source: String.raw`extension AppDelegate: UNUserNotificationCenterDelegate {
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        completionHandler([.banner, .sound])
    }
}`,
          caption: "Set `UNUserNotificationCenter.current().delegate = self` at launch so this fires. Returning `[.banner, .sound]` means \"show it like normal\" even though PawWalk is already open.",
        },
        {
          type: "text",
          md: [
            "## Mutating a push before it's shown",
            "A **Notification Service Extension** is a separate mini-target (`UNNotificationServiceExtension`) that gets a shot at a push **before** the OS displays it — but only if the payload's `aps` dictionary sets `\"mutable-content\": 1`. Inside `didReceive(_:withContentHandler:)`, take a mutable copy of the content (`request.content.mutableCopy() as! UNMutableNotificationContent`), change whatever you need — decrypt sensitive text, attach an image the payload only linked to, rewrite the body — and hand the mutated copy back to `contentHandler`. You get roughly 30 seconds before the OS gives up and shows the original.",
          ],
        },
        {
          type: "code",
          title: "NotificationService/NotificationService.swift",
          source: String.raw`import UserNotifications

class NotificationService: UNNotificationServiceExtension {
    var contentHandler: ((UNNotificationContent) -> Void)?

    override func didReceive(
        _ request: UNNotificationRequest,
        withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void
    ) {
        self.contentHandler = contentHandler
        guard let mutableContent = request.content.mutableCopy() as? UNMutableNotificationContent else {
            contentHandler(request.content)
            return
        }

        mutableContent.title = "🐾 \(mutableContent.title)"
        contentHandler(mutableContent)
    }
}`,
          caption: "This runs in its own process, separate from both PawWalk and the main notification pipeline — it can't reach PawWalk's in-memory state any more than a widget extension could (module 17).",
        },
        {
          type: "exercise",
          title: "Control foreground presentation",
          prompt: [
            "Implement `userNotificationCenter(_:willPresent:withCompletionHandler:)` so a push arriving while PawWalk is open still shows a banner and plays a sound.",
          ],
          starter: String.raw`func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
) {
    // your code here
}`,
          solution: String.raw`func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
) {
    completionHandler([.banner, .sound])
}`,
          checks: [
            { re: /func userNotificationCenter\(.*willPresent.*withCompletionHandler.*\{/, hint: "Match the delegate method's exact signature: `willPresent notification:` and `withCompletionHandler completionHandler:`." },
            { re: /completionHandler\(\[\.banner,\.sound\]\)|completionHandler\(\[\.sound,\.banner\]\)/, hint: "Call `completionHandler([.banner, .sound])` — that's what tells iOS to show the banner and play a sound even though the app is foreground (either order is fine — it's an option set)." },
          ],
          success: "Without this call, foreground pushes go silent — you just fixed the #1 \"my push isn't showing\" bug.",
        },
        {
          type: "quiz",
          q: "What can a Notification Service Extension do that a normal push can't do on its own?",
          choices: [
            "Show the notification instantly without any APNs round trip",
            "Modify the push's content (decrypt text, attach a downloaded image) before the OS displays it, as long as the payload sets mutable-content",
            "Read PawWalk's in-memory app state directly, since it runs inside the same process",
            "Guarantee delivery even if the device is offline",
          ],
          answer: 1,
          explain: "A Notification Service Extension is a short-lived separate process that gets first crack at a mutable-content push, letting you decrypt or enrich the content (like attaching an image) before display — it doesn't share memory with the app any more than a widget extension does.",
          nudge: "It runs in its own process, on a strict ~30-second clock, and only for pushes flagged a specific way — what does that let it change?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "background-refresh",
      title: "Background refresh",
      steps: [
        {
          type: "text",
          md: [
            "## Deferred work the OS schedules for you",
            "Push notifications are reactive — something happens, APNs delivers it. **`BGTaskScheduler`** (from the `BackgroundTasks` framework) is the opposite: proactive, periodic work you ask the OS to run later, like \"sync the walk journal every so often even if the learner hasn't opened PawWalk.\" That ties straight back to module 14's offline-first sync engine — background refresh is what keeps the local walk journal from going stale between opens.",
            "Two steps: **register** a task identifier's handler at launch (so the OS knows what code to run), then **schedule** a request for that identifier whenever you want a future run queued.",
          ],
        },
        {
          type: "text",
          md: [
            "## You propose, the OS decides",
            "A `BGAppRefreshTaskRequest` carries an `earliestBeginDate` — the earliest the OS **may** run it, never a guarantee it will run then. The system weighs battery level, network, how often the learner actually opens PawWalk, and how many other apps are asking for the same slice of time, then picks a moment. It might run late. It might not run at all if conditions never look good enough. Design the sync so a missed refresh is a non-event — the next app launch (or the next successful refresh) catches up.",
          ],
        },
        {
          type: "code",
          title: "PawWalkKit/BackgroundSync.swift — registering",
          source: String.raw`import BackgroundTasks

let walkJournalRefreshID = "dev.gerardocordero.pawwalk.refresh-journal"

func registerBackgroundRefresh() {
    BGTaskScheduler.shared.register(
        forTaskWithIdentifier: walkJournalRefreshID,
        using: nil
    ) { task in
        handleJournalRefresh(task: task as! BGAppRefreshTask)
    }
}`,
          caption: "Register at app launch, before `application(_:didFinishLaunchingWithOptions:)` returns — the identifier must also be listed in Info.plist under \"Permitted background task scheduler identifiers\".",
        },
        {
          type: "code",
          title: "PawWalkKit/BackgroundSync.swift — scheduling",
          source: String.raw`func scheduleJournalRefresh() {
    let request = BGAppRefreshTaskRequest(identifier: walkJournalRefreshID)
    request.earliestBeginDate = .now.addingTimeInterval(15 * 60)

    try? BGTaskScheduler.shared.submit(request)
}`,
          caption: "Call this whenever a refresh finishes (or the app backgrounds) to queue the next one — each request is used up after one run, so there's no \"repeat every 15 minutes\" setting to flip on.",
        },
        {
          type: "exercise",
          title: "Schedule a background refresh",
          prompt: [
            "Write `scheduleJournalRefresh()`: build a `BGAppRefreshTaskRequest` for `walkJournalRefreshID`, set its `earliestBeginDate` to 15 minutes from now, then submit it to `BGTaskScheduler.shared`.",
          ],
          starter: String.raw`import BackgroundTasks

func scheduleJournalRefresh() {
    // your code here
}`,
          solution: String.raw`import BackgroundTasks

func scheduleJournalRefresh() {
    let request = BGAppRefreshTaskRequest(identifier: walkJournalRefreshID)
    request.earliestBeginDate = .now.addingTimeInterval(15 * 60)
    try? BGTaskScheduler.shared.submit(request)
}`,
          checks: [
            { re: /BGAppRefreshTaskRequest\(identifier:walkJournalRefreshID\)/, hint: "Build the request with `BGAppRefreshTaskRequest(identifier: walkJournalRefreshID)`." },
            { re: /\.earliestBeginDate=\.now\.addingTimeInterval\(15\*60\)/, hint: "Set `request.earliestBeginDate = .now.addingTimeInterval(15 * 60)` — the earliest the OS may run it, not a guarantee." },
            { re: /BGTaskScheduler\.shared\.submit\(request\)/, hint: "Hand it off with `BGTaskScheduler.shared.submit(request)`." },
          ],
          success: "That's a real request queued with the OS — whether it runs at exactly 15 minutes is now the system's call, not yours.",
        },
        {
          type: "quiz",
          q: "Why can't you rely on a background refresh task running at an exact time?",
          choices: [
            "BGTaskScheduler is deprecated and doesn't actually run tasks anymore",
            "earliestBeginDate is only the earliest the OS may run it — the system weighs battery, network, and usage patterns and decides the actual moment, or may skip it entirely",
            "Background refresh only runs while the app is in the foreground",
            "It always runs exactly at earliestBeginDate, but only on devices plugged into power",
          ],
          answer: 1,
          explain: "earliestBeginDate is a floor, not a schedule — BGTaskScheduler weighs system conditions (battery, network, how often the learner opens the app) and picks its own moment, which might be much later than requested or might not happen at all. Design your sync to tolerate a missed run.",
          nudge: "The property is called \"earliest\" — what does that word rule out about the rest of the timing?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "silent-push-and-finishing",
      title: "Silent push & finishing the task",
      steps: [
        {
          type: "text",
          md: [
            "## A push that wakes the app instead of showing a banner",
            "A **silent push** — an `aps` payload with `\"content-available\": 1` and no `alert`/`sound`/`badge` — doesn't show anything. It briefly wakes PawWalk in the background so `application(_:didReceiveRemoteNotification:fetchCompletionHandler:)` can run, fetch something new, and call the fetch completion handler with `.newData`, `.noData`, or `.failed`. It's APNs used as a *nudge to go check*, not as a message for the learner. iOS also throttles and coalesces silent pushes it judges too frequent — a burst of them can get merged into one wakeup or dropped, so don't lean on them for anything time-critical.",
          ],
        },
        {
          type: "text",
          md: [
            "## The completion call is not optional",
            "Whether the work was kicked off by a `BGAppRefreshTask` or a silent push's fetch handler, the OS is timing you. For a `BGAppRefreshTask`, you **must** call `task.setTaskCompleted(success:)` when done — pass `true` if the sync worked, `false` if it didn't. Forget to call it (or run past the time budget) and the OS logs it against PawWalk: future background time gets **throttled**, on the theory that an app that doesn't finish its work isn't using the budget responsibly.",
            "Always set an `expirationHandler` on the task too — it fires if you're about to run out of time, so you can cancel in-flight work and call `setTaskCompleted(success: false)` before the OS forces you.",
          ],
        },
        {
          type: "code",
          title: "PawWalkKit/BackgroundSync.swift — handling the refresh",
          source: String.raw`func handleJournalRefresh(task: BGAppRefreshTask) {
    scheduleJournalRefresh() // queue the next one before this one finishes

    let syncTask = Task {
        await WalkJournalStore.shared.syncPendingWalks() // module 14's sync engine
        task.setTaskCompleted(success: true)
    }

    task.expirationHandler = {
        syncTask.cancel()
        task.setTaskCompleted(success: false)
    }
}`,
          caption: "Re-scheduling up front means a missed or failed run still leaves a future request queued — the sync never permanently stops just because one attempt didn't finish.",
        },
        {
          type: "exercise",
          title: "Finish the background task",
          prompt: [
            "At the end of the refresh handler, after the sync `await`s, call `task.setTaskCompleted(success: true)` to tell the OS the work finished.",
          ],
          starter: String.raw`func handleJournalRefresh(task: BGAppRefreshTask) {
    Task {
        await WalkJournalStore.shared.syncPendingWalks()
        // your code here
    }
}`,
          solution: String.raw`func handleJournalRefresh(task: BGAppRefreshTask) {
    Task {
        await WalkJournalStore.shared.syncPendingWalks()
        task.setTaskCompleted(success: true)
    }
}`,
          checks: [
            { re: /syncPendingWalks\(\)task\.setTaskCompleted\(success:true\)/, hint: "Call `task.setTaskCompleted(success: true)` AFTER the `await syncPendingWalks()` finishes — completing before the work is done defeats the point." },
          ],
          success: "That call is what keeps PawWalk's background time budget healthy — skip it and future refreshes get throttled.",
        },
        {
          type: "quiz",
          q: "What happens if a background task never calls its completion handler (setTaskCompleted, or a fetch completion handler)?",
          choices: [
            "Nothing — the OS assumes success after a short delay",
            "The app crashes immediately",
            "The OS eventually kills the task when its time budget runs out, and penalizes the app with less generous background time in the future",
            "The next scheduled background task runs immediately to compensate",
          ],
          answer: 2,
          explain: "The OS is watching the clock on your behalf. If you never call setTaskCompleted (or a fetch completion handler), it force-stops the task when time runs out and treats the app as unreliable with its background budget — future background opportunities get throttled.",
          nudge: "The OS hands out a limited, trust-based budget — what would it do with an app that never reports back?",
        },
      ],
    },
  ],
});
