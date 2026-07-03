// Module 14 — Persistence & Offline-First. See FORMAT.md for the schema.
window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "offline-first",
  title: "Persistence & Offline-First",
  emoji: "💾",
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    {
      id: "why-offline-first",
      title: "Why offline-first",
      steps: [
        {
          type: "text",
          md: [
            "## The subway problem",
            "A dog walker is three blocks into a walk. The route drops into a subway entrance — no signal for ninety seconds. Every screen you've built so far assumes the network is *there*: `WalkersView` awaits `fetchWalkers()`, `LiveTracker` streams over a socket. What happens to the walker's app the moment the bars disappear?",
            "If the answer is \"it spins forever, or shows an error, or the last-known booking list just vanishes\" — that's not a bug you patch with a retry button. It's a design the app was never built for. **Offline-first** means the app is designed around the network being unreliable from the start, not as an edge case bolted on later.",
          ],
        },
        {
          type: "text",
          md: [
            "## The shape: local first, network refreshes it",
            "Every screen you've written until now reads straight from `APIClient` — `@Query`-shaped calls happen fresh, every time, and if the request fails the screen has nothing to show. Offline-first flips that data flow:",
            "- **Reads come from a local store.** `WalkersView` shows whatever's saved on the phone *right now*, subway or not.\n- **The network's only job is to refresh the local store.** A successful fetch updates local data; a failed one just means the screen stays stale instead of empty.\n- **Writes queue when offline.** Creating a booking underground doesn't fail — it's saved locally and sent the moment a connection comes back.",
            "That's three sentences, but it's a real architectural shift: the network stops being the source of truth. The phone is.",
          ],
        },
        {
          type: "text",
          md: [
            "## SwiftData: the local store",
            "**SwiftData** is Apple's on-device persistence framework (iOS 17+) — it's what PawWalk uses to *be* that local store. Three pieces you'll use all module:",
            "- **`@Model`** — a macro you put on a class to make it persistent. Mark a class `@Model` and SwiftData handles saving it to disk, no database code from you.\n- **`ModelContainer`** — owns the actual database file. One container per app, created once at launch.\n- **`@Query`** — a property wrapper for SwiftUI views that reads persisted models directly, live — the view updates automatically when the data changes, the same way `@State` does.",
            "No CoreData, no `.xcdatamodeld` file, no `NSManagedObject` — SwiftData is plain Swift types with one macro.",
          ],
        },
        {
          type: "code",
          title: "Models/WalkRecord.swift",
          source: String.raw`import SwiftData

@Model
final class WalkRecord {
    var id: UUID
    var walkerName: String
    var startedAt: Date
    var distanceMeters: Double

    init(id: UUID, walkerName: String, startedAt: Date, distanceMeters: Double) {
        self.id = id
        self.walkerName = walkerName
        self.startedAt = startedAt
        self.distanceMeters = distanceMeters
    }
}`,
          caption: "A first @Model. It looks like a plain class with stored properties and an init — because that's almost all it is. The @Model macro is what turns it into something SwiftData can save.",
        },
        {
          type: "quiz",
          q: "In an offline-first app, where does the UI read its data from?",
          choices: [
            "Directly from the network, every time a screen appears",
            "From a local store; the network's job is only to refresh that store",
            "From the network first, falling back to local only if the request fails",
            "It doesn't matter, as long as there's a loading spinner",
          ],
          answer: 1,
          explain: "Offline-first inverts the usual flow: the screen always reads local data first, so it has something to show with zero network latency and zero dependency on connectivity. A background refresh updates the local store when the network is there — the UI doesn't need to know or care whether that refresh succeeded.",
          nudge: "Re-read 'the shape' above. Which store does the UI read from, and what is the network's job relative to it?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "modeling-querying",
      title: "Modeling & querying with SwiftData",
      steps: [
        {
          type: "text",
          md: [
            "## @Model classes are reference types — and that's the point",
            "Every model you've written since Module 2 — `Walker`, `Booking` — has been a `struct`: a **value type**. Copy a `Walker` and you get two independent walkers; mutate one, the other is untouched. `@Model` types are different on purpose: `@Model final class WalkRecord` is a **reference type**. Copy the reference and both variables point at the *same* object — mutate it through one, the other sees the change immediately.",
            "That's not a limitation, it's why `@Query` works at all. SwiftData needs **identity**: one `WalkRecord` living in the database, with SwiftUI watching *that specific object* for mutations so it can redraw the instant a property changes. A struct copy would break that — there'd be no single object left to watch. This is why `@Model` types are classes, never structs — and by convention marked `final`, unless you specifically need a subclassable model hierarchy.",
          ],
        },
        {
          type: "text",
          md: [
            "## ModelContext: insert, delete, save",
            "If `ModelContainer` is the database file, **`ModelContext`** is your working session against it — the object you actually call to make changes. Three methods cover almost everything:",
            "- `context.insert(walkRecord)` — stage a new object to be saved.\n- `context.delete(walkRecord)` — stage an object for removal.\n- `context.save()` — commit staged changes to disk.",
            "In a SwiftUI view you don't create a `ModelContext` yourself — you read it from the environment: `@Environment(\\.modelContext) private var context`. SwiftData wires it up once, at the `ModelContainer`, and every view downstream gets the same context for free.",
          ],
        },
        {
          type: "code",
          title: "Features/History/WalkHistoryView.swift",
          source: String.raw`struct WalkHistoryView: View {
    @Query(sort: \WalkRecord.startedAt, order: .reverse)
    private var walks: [WalkRecord]

    @Environment(\.modelContext) private var context

    var body: some View {
        List(walks) { walk in
            Text(walk.walkerName)
        }
    }
}`,
          caption: "@Query(sort: \\WalkRecord.startedAt, order: .reverse) reads every saved WalkRecord straight from SwiftData, newest first — no fetch call, no loading state. Insert or delete a WalkRecord anywhere in the app and this list updates itself.",
        },
        {
          type: "quiz",
          q: "Why does @Model require a class instead of a struct?",
          choices: [
            "Classes compile faster than structs in Swift 6",
            "SwiftUI's @Query needs one object with a stable identity that it can watch for mutations — a struct copy would break that",
            "It's an arbitrary Apple restriction with no technical reason",
            "Structs can't have an init, and @Model requires one",
          ],
          answer: 1,
          explain: "@Query watches persisted objects for changes and redraws the view when they mutate. That only works if there's exactly one object in memory that represents a given row — a reference type. A struct's copy-on-write semantics would mean 'the' WalkRecord could silently fork into independent copies, and SwiftData would have nothing single to watch.",
          nudge: "Think about what @Query has to do every time a property changes — watch one object, or compare copies?",
        },
        {
          type: "exercise",
          title: "Write the WalkRecord model",
          prompt: [
            "Write `WalkRecord` as a SwiftData model with an `id`, `walkerName`, `startedAt`, `distanceMeters`, and a `synced` flag.",
            "1. `@Model final class WalkRecord { … }`\n2. Five stored `var`s: `id: UUID`, `walkerName: String`, `startedAt: Date`, `distanceMeters: Double`, `synced: Bool`.\n3. An `init` that sets all five from parameters.",
          ],
          starter: String.raw`// your code here`,
          solution: String.raw`@Model
final class WalkRecord {
    var id: UUID
    var walkerName: String
    var startedAt: Date
    var distanceMeters: Double
    var synced: Bool

    init(id: UUID, walkerName: String, startedAt: Date, distanceMeters: Double, synced: Bool) {
        self.id = id
        self.walkerName = walkerName
        self.startedAt = startedAt
        self.distanceMeters = distanceMeters
        self.synced = synced
    }
}`,
          checks: [
            { re: /@Model\s*final class WalkRecord\{/, hint: "Start with `@Model` on its own line, then `final class WalkRecord {` — @Model types are always final classes." },
            { re: /var id:UUID/, hint: "Add `var id: UUID`." },
            { re: /var walkerName:String/, hint: "Add `var walkerName: String`." },
            { re: /var synced:Bool/, hint: "Add `var synced: Bool` — this is the flag the sync engine will read later." },
          ],
          mustNot: [
            { re: /struct WalkRecord/, hint: "This must be a `class`, not a `struct` — @Model needs reference-type identity." },
          ],
          success: "That's the exact shape WalkHistoryView's @Query reads from — five stored properties, one init, marked @Model.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "repository-pattern",
      title: "The repository pattern",
      steps: [
        {
          type: "text",
          md: [
            "## Views and view models shouldn't know where data lives",
            "Every view model you've written talks straight to `APIClient.shared`. Add SwiftData and there's a second thing to talk to — `ModelContext` — and a naive view model ends up juggling both: fetch from the network, insert into the context, query the context, handle the case where one works and the other doesn't. That's a lot of concerns tangled into one type, and it's *untestable* without a real network and a real database.",
            "The fix is a seam: a **`WalkRepository`** protocol that hides both `ModelContext` and `APIClient` behind a handful of methods. The view model calls the protocol; it never imports SwiftData or knows an API exists. Two things fall out of that for free: you can swap in a fake repository in tests (no network, no database, just canned data), and you can swap the *real* backend later — REST today, GraphQL next year — without touching a single view.",
          ],
        },
        {
          type: "code",
          title: "Data/WalkRepository.swift",
          source: String.raw`protocol WalkRepository {
    func local() throws -> [WalkRecord]
    func refresh() async throws
    func record(_ walk: WalkRecord) async throws
}

final class LiveWalkRepository: WalkRepository {
    private let context: ModelContext
    private let api: APIClient

    init(context: ModelContext, api: APIClient = .shared) {
        self.context = context
        self.api = api
    }

    func local() throws -> [WalkRecord] {
        try context.fetch(FetchDescriptor<WalkRecord>())
    }

    func refresh() async throws {
        let remote = try await api.fetchWalkRecords()
        for record in remote { context.insert(record) }
        try context.save()
    }

    func record(_ walk: WalkRecord) async throws {
        context.insert(walk)
        try context.save()
        _ = try? await api.uploadWalkRecord(walk)
    }
}`,
          caption: "local() reads from SwiftData only — works offline. refresh() pulls from the network and writes into the context. record() saves locally first (so it's never lost) and only then tries the network. A view model depends on WalkRepository, never on ModelContext or APIClient directly.",
        },
        {
          type: "quiz",
          q: "What's the main reason to put WalkRepository behind a protocol instead of calling ModelContext and APIClient directly from the view model?",
          choices: [
            "Protocols make Swift code run faster",
            "It's required — SwiftUI views cannot call ModelContext directly",
            "It lets you test the view model with a fake repository (no real network or database) and swap the real backend later without touching views",
            "It reduces the number of files in the project",
          ],
          answer: 2,
          explain: "The protocol is a seam. A test can hand the view model an in-memory fake that returns canned WalkRecords instantly — no simulator database, no network flakiness. And because the view model only knows about WalkRepository's three methods, swapping LiveWalkRepository for a different backend later never touches a single view.",
          nudge: "Think about what a unit test for a view model would need if it called ModelContext and APIClient directly — versus if it only saw a protocol.",
        },
        {
          type: "exercise",
          title: "Write the WalkRepository protocol",
          prompt: [
            "Write the `WalkRepository` protocol with exactly three requirements: a throwing `local()` that returns saved walks, an `async throws refresh()`, and an `async throws record(_:)` that takes a `WalkRecord`.",
          ],
          starter: String.raw`// your code here`,
          solution: String.raw`protocol WalkRepository {
    func local() throws -> [WalkRecord]
    func refresh() async throws
    func record(_ walk: WalkRecord) async throws
}`,
          checks: [
            { re: /protocol WalkRepository\{/, hint: "Start with `protocol WalkRepository { … }`." },
            { re: /func local\(\)throws->\[WalkRecord\]/, hint: "First requirement: `func local() throws -> [WalkRecord]`." },
            { re: /func refresh\(\)async throws/, hint: "Second requirement: `func refresh() async throws` — no return value." },
            { re: /func record\(_ walk:WalkRecord\)async throws/, hint: "Third requirement: `func record(_ walk: WalkRecord) async throws`." },
          ],
          mustNot: [
            { re: /class WalkRepository/, hint: "This is a `protocol`, not a concrete `class` — the implementation is a separate type." },
          ],
          success: "Three methods, and every view model in the app can now depend on this instead of ModelContext or APIClient directly.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "sync-engine",
      title: "A sync engine, honestly",
      steps: [
        {
          type: "text",
          md: [
            "## Queued writes: a pending-operations list",
            "`WalkRepository.record(_:)` from the last lesson saves locally first, then *tries* the network — but `try?` on that upload silently drops the failure. Offline-first means that failed write can't just vanish: it needs to be retried once a connection comes back. The standard shape is a **pending-operations list** — its own persisted model, separate from `WalkRecord` — that records \"this thing still needs to reach the server.\"",
            "On reconnect, **replay in order**: walk the pending list oldest-first, retry each one, remove it once the server confirms. Order matters — replaying a cancel before its booking even reached the server would be nonsense.",
          ],
        },
        {
          type: "text",
          md: [
            "## Conflicts: server-wins for bookings",
            "What if the phone queued a change *and* the server's state moved on while it was offline — say, a walker's booking was cancelled by the owner from another device? Two common policies: **last-write-wins** (whichever change has the newer timestamp survives) and **server-wins** (the server's state always overrides the local queued change).",
            "PawWalk picks **server-wins for bookings**, deliberately. Bookings involve money and scheduling — a double-booked walker or a stale price is a real-world problem, not a cosmetic one. Last-write-wins trusts the *phone's clock*, which drifts and can't see what other devices did concurrently; server-wins trusts the one system that actually saw every device's requests in order. The tradeoff: a queued local change can be silently overridden. For bookings, that's the safer failure mode than the alternative.",
          ],
        },
        {
          type: "text",
          md: [
            "## Idempotency keys: replays can't double-create",
            "Replay has its own failure mode: the phone sends a queued \"create booking\" request, the server creates it and replies — but the reply is lost to a flaky connection before the phone marks the op done. On reconnect, the phone replays the same op and now there are *two* bookings. The fix is an **idempotency key**: a unique ID generated once, when the op is first queued, and sent with every attempt (including retries). The server remembers keys it's already processed and returns the original result instead of creating a duplicate. Same op, replayed any number of times, one booking.",
            "**`NWPathMonitor`** (from `Network`) is how the app notices reconnection in the first place — it calls a handler whenever the path's status flips between `.satisfied` and not. That handler is the trigger for \"start the replay loop.\"",
          ],
        },
        {
          type: "code",
          title: "Data/SyncEngine.swift",
          source: String.raw`@Model
final class PendingOp {
    var idempotencyKey: UUID
    var kind: String
    var payload: Data
    var createdAt: Date

    init(idempotencyKey: UUID, kind: String, payload: Data, createdAt: Date) {
        self.idempotencyKey = idempotencyKey
        self.kind = kind
        self.payload = payload
        self.createdAt = createdAt
    }
}

final class SyncEngine {
    private let context: ModelContext
    private let api: APIClient

    init(context: ModelContext, api: APIClient = .shared) {
        self.context = context
        self.api = api
    }

    func replayPending() async throws {
        let ops = try context.fetch(
            FetchDescriptor<PendingOp>(sortBy: [SortDescriptor(\.createdAt)])
        )
        for op in ops {
            try Task.checkCancellation()
            try await api.submit(op)
            context.delete(op)
            try context.save()
        }
    }
}`,
          caption: "PendingOp carries its own idempotencyKey, generated once at enqueue time and replayed unchanged on every retry. replayPending() walks the list oldest-first (sortBy: createdAt) and checks cancellation each iteration — the same Task.checkCancellation() pattern from Module 13's LiveTracker loop, so a torn-down sync no longer keeps replaying after the screen that started it is gone.",
        },
        {
          type: "exercise",
          title: "Guard the enqueue path",
          prompt: [
            "`recordWalk` should try the network first when online. Add the offline guard: if `isOnline` is `false`, append a `PendingOp` to `pending` and return immediately — never touch the network.",
            "1. `if !isOnline { pending.append(op); return }` as the first line of the function.",
          ],
          starter: String.raw`func recordWalk(_ op: PendingOp, isOnline: Bool) async throws {
    // your code here
    try await api.submit(op)
}`,
          solution: String.raw`func recordWalk(_ op: PendingOp, isOnline: Bool) async throws {
    if !isOnline {
        pending.append(op)
        return
    }
    try await api.submit(op)
}`,
          checks: [
            { re: /if!isOnline\{/, hint: "Guard on `if !isOnline { … }` as the first line." },
            { re: /pending\.append\(op\)/, hint: "Inside the guard, queue the op: `pending.append(op)`." },
            { re: /return\}/, hint: "Return right after appending — don't fall through to the network call." },
          ],
          mustNot: [
            { re: /if isOnline\{/, hint: "Guard on the offline case (`if !isOnline`), not the online one — the network call below already handles the online path." },
          ],
          success: "That's the whole enqueue guard — offline, the op is saved locally and the function returns; online, it falls through to the real submit.",
        },
        {
          type: "quiz",
          q: "Why does every queued PendingOp need its own idempotency key?",
          choices: [
            "It's required by Swift's Codable protocol for any type stored with @Model",
            "So replaying the same op after a lost server reply can't create a duplicate — the server recognizes the key and returns the original result instead of creating a second booking",
            "It lets SwiftData sort the pending list without a createdAt property",
            "It encrypts the payload so the server can't read it in transit",
          ],
          answer: 1,
          explain: "Replay's failure mode is a lost reply: the server did the work, but the phone never found out and retries. Without an idempotency key, that retry looks like a brand-new request and creates a second booking. With one, the server recognizes it's already handled that exact key and returns the original result — same op, replayed any number of times, exactly one booking.",
          nudge: "Think about what happens when the phone retries an op the server already succeeded on, but the phone never got the confirmation.",
        },
      ],
    },
  ],
});
