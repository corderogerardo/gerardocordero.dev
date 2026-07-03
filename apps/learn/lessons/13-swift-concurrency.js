// Module 13 — Swift Concurrency in Anger. See FORMAT.md for the schema.
window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "swift-concurrency",
  title: "Swift Concurrency in Anger",
  emoji: "⚡",
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    {
      id: "races-main-actor",
      title: "Races, threads & the main actor",
      steps: [
        {
          type: "text",
          md: [
            "## One phone, one thread for the UI",
            "Every screen you've built since Module 5 has quietly relied on one rule: UIKit and SwiftUI only let you touch the screen from the **main thread**. That's why `LiveTracker` and every view model you've written is marked `@MainActor` — it pins the whole class to that one thread, so `body` never renders a half-updated `phase` while a background task is mid-write.",
            "But apps do plenty of work that has nothing to do with drawing: hitting the API, parsing JSON, running the haversine sum over hundreds of GPS fixes. That work runs on background threads so the UI stays smooth — and the moment more than one thread can touch the *same* mutable value, you're one careless line away from a **data race**.",
          ],
        },
        {
          type: "text",
          md: [
            "## What a data race actually is",
            "A data race needs exactly two ingredients: **two threads**, and **one mutable value** that at least one of them **writes** to, with no coordination between them. Two threads only *reading* the same value is fine. The bug shows up when reads and writes interleave in an order nobody planned — a walker's phone posting two GPS fixes at once, both racing to increment the same counter.",
            "The classic symptom is a **lost update**: thread A reads `total = 5`, thread B also reads `5`, both add 1, both write back `6` — one increment vanished. In C, Java, or pre-6 Swift, this compiles cleanly and fails maybe one run in a thousand, exactly the kind of bug that survives code review and pages you at 3am.",
          ],
        },
        {
          type: "code",
          title: "A racy WalkStats — don't ship this",
          source: String.raw`class WalkStats {
    var total = 0
}

let stats = WalkStats()
Task { for _ in 0..<1000 { stats.total += 1 } }
Task { for _ in 0..<1000 { stats.total += 1 } }
// stats.total should be 2000 — on a plain class, it usually isn't.`,
          caption: "Two Tasks, no coordination, one mutable var. This is a textbook data race — and Swift 5 would compile it without a single warning.",
        },
        {
          type: "text",
          md: [
            "## Swift 6's promise",
            "Swift 6's headline concurrency feature isn't a new API — it's a **compiler mode**. With strict concurrency checking on (the default for new Swift 6 projects, including PawWalk's), the code above **fails to build**. The compiler tracks which values can cross between threads and refuses to compile a plain, un-synchronized `class` being mutated from two `Task`s.",
            "The fix in the next lesson's territory is usually one of two shapes: pin the type to a single thread with `@MainActor`, or wrap it in an **actor** — a type the compiler guarantees only ever runs one method at a time, no matter how many threads call it. Either way, the race becomes something you see at compile time in Xcode, not something a user hits in the wild.",
          ],
        },
        {
          type: "code",
          title: "The fix — an actor instead of a class",
          source: String.raw`actor WalkStats {
    var total = 0
    func increment() { total += 1 }
}

let stats = WalkStats()
Task { for _ in 0..<1000 { await stats.increment() } }
Task { for _ in 0..<1000 { await stats.increment() } }
// Every increment is serialized — total is always 2000.`,
          caption: "Same two Tasks, same 1000 increments each — but now every call to increment() is forced through the actor one at a time. The await marks exactly where a thread hop can happen.",
        },
        {
          type: "quiz",
          q: "Which of these is a genuine data race?",
          choices: [
            "Two Tasks both calling `await stats.increment()` on an actor",
            "Two background threads both reading (never writing) the same `let` constant",
            "A plain `class Counter { var n = 0 }` mutated from two Task closures with no synchronization",
            "A `@MainActor` view model's `var phase` being read and written only from `.task {}` and button taps",
          ],
          answer: 2,
          explain: "Two threads, one mutable var, at least one write, zero coordination — that's the exact shape of a data race. The actor case is serialized by definition; read-only access is always safe; and the @MainActor case only ever touches `phase` from one thread (the main one), so there's no race to have.",
          nudge: "Go back to the two-ingredient definition: two threads, one mutable value, at least one write, no coordination. Which option is missing the 'no coordination' part — or missing a write, or missing a second thread?",
        },
        {
          type: "exercise",
          title: "Make WalkStats race-safe",
          prompt: [
            "Turn the racy `WalkStats` below into an actor so concurrent increments can't lose updates.",
            "1. Change `class WalkStats` to `actor WalkStats`.\n2. Add a method `func increment()` that does `total += 1`.",
          ],
          starter: String.raw`class WalkStats {
    var total = 0
    // your code here: increment()
}`,
          solution: String.raw`actor WalkStats {
    var total = 0
    func increment() { total += 1 }
}`,
          checks: [
            { re: /actor WalkStats\{/, hint: "Change the keyword from `class` to `actor` — that's what forces one-at-a-time access." },
            { re: /func increment\(\)\{total\+=1\}/, hint: "Add `func increment() { total += 1 }` — callers will `await` this method instead of writing `total` directly." },
          ],
          mustNot: [
            { re: /class WalkStats/, hint: "The type itself must become an `actor`, not stay a `class` with an actor somewhere inside it." },
          ],
          success: "That's the whole fix — the compiler now serializes every call to increment(), so 2000 increments from two Tasks always lands on 2000.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "structured-concurrency",
      title: "Structured concurrency: async let & TaskGroup",
      steps: [
        {
          type: "text",
          md: [
            "## Unstructured Task {} has no parent",
            "You've used `Task { }` since Module 3 — it's how synchronous code (a button's `action`, a delegate callback) jumps into `async` code. But a bare `Task { }` is **unstructured**: it starts running and nobody owns it. If the view that launched it disappears, the Task keeps going. If it throws, nothing automatically hears about it. It's a fire-and-forget bridge — fine for that job, wrong for chaining several async calls together.",
            "**Structured concurrency** flips that: child tasks can't outlive the scope that created them. If the parent is cancelled or throws, every child is cancelled too, automatically. `async let` and `TaskGroup` are the two structured tools — this lesson is about the simpler one, `async let`, which is exactly right when you know in advance how many things you're running in parallel.",
          ],
        },
        {
          type: "code",
          title: "Services/APIClient.swift-style — sequential (slow)",
          source: String.raw`func loadDashboard() async throws -> Dashboard {
    let walkers = try await APIClient.shared.fetchWalkers()
    let bookings = try await APIClient.shared.fetchBookings()
    return Dashboard(walkers: walkers, bookings: bookings)
}`,
          caption: "Nothing here is wrong Swift — it compiles and works. But it's needlessly slow: fetchBookings doesn't start until fetchWalkers has fully finished, even though the two requests don't depend on each other.",
        },
        {
          type: "text",
          md: [
            "## async let: run them at the same time",
            "`async let` starts an async call **immediately**, without waiting for you to `await` it — the await only happens at the point you actually need the value. Write two `async let`s back to back and both requests are in flight at once; the total time is however long the *slower* one takes, not the sum of both.",
            "The syntax mirrors the sequential version almost exactly — swap `let x = try await …` for `async let x = …`, and move the `try await` to wherever you first use the values.",
          ],
        },
        {
          type: "code",
          title: "Services/APIClient.swift-style — parallel with async let",
          source: String.raw`func loadDashboard() async throws -> Dashboard {
    async let walkers = APIClient.shared.fetchWalkers()
    async let bookings = APIClient.shared.fetchBookings()
    return Dashboard(walkers: try await walkers, bookings: try await bookings)
}`,
          caption: "Both fetches start on the first two lines. try await walkers and try await bookings then just wait for whichever isn't done yet — often nearly free, since both have been running the whole time.",
        },
        {
          type: "quiz",
          q: "In the async let version, fetchBookings() throws a network error. What happens to the sibling fetchWalkers() call?",
          choices: [
            "It's cancelled immediately — structured concurrency tears down every sibling the instant one throws",
            "It keeps running to completion in the background, unwatched, wasting the request",
            "It's automatically cancelled, and Swift waits for it to finish unwinding before loadDashboard's throw propagates — you never get a dangling child task",
            "The app crashes — async let requires both calls to succeed or neither can throw",
          ],
          answer: 2,
          explain: "This is the whole point of structured concurrency: async let children are scoped to the function that declared them. If one throws before you've awaited it, Swift cancels its siblings and waits for them to actually finish before the error propagates out of loadDashboard — no orphaned task is left running after the function returns.",
          nudge: "Re-read 'child tasks can't outlive the scope that created them.' If the parent function is about to exit (because of the throw), what has to happen to any child that's still in flight?",
        },
        {
          type: "exercise",
          title: "Parallelize the dashboard load",
          prompt: [
            "Convert the two sequential awaits below into `async let`, then combine them with a single `try await` on a tuple.",
            "1. Replace both `let … = try await …` lines with `async let … = …` (drop `try await` on those two lines — the `try` moves to the tuple await).\n2. Replace the two individual awaits in the `Dashboard(...)` call with one line: `let (walkers, bookings) = try await (walkers, bookings)` right before it, then pass `walkers` and `bookings` in.",
          ],
          starter: String.raw`func loadDashboard() async throws -> Dashboard {
    let walkers = try await APIClient.shared.fetchWalkers()
    let bookings = try await APIClient.shared.fetchBookings()
    return Dashboard(walkers: walkers, bookings: bookings)
}`,
          solution: String.raw`func loadDashboard() async throws -> Dashboard {
    async let walkers = APIClient.shared.fetchWalkers()
    async let bookings = APIClient.shared.fetchBookings()
    let (w, b) = try await (walkers, bookings)
    return Dashboard(walkers: w, bookings: b)
}`,
          checks: [
            { re: /async let walkers=APIClient\.shared\.fetchWalkers\(\)/, hint: "Start the first call with `async let walkers = APIClient.shared.fetchWalkers()` — no `try await` on this line, it launches immediately." },
            { re: /async let bookings=APIClient\.shared\.fetchBookings\(\)/, hint: "Same pattern for the second call: `async let bookings = APIClient.shared.fetchBookings()`." },
            { re: /=try await\(walkers,bookings\)/, hint: "Await both at once as a tuple: `let (w, b) = try await (walkers, bookings)` — this is where the two in-flight calls are actually waited on." },
          ],
          mustNot: [
            { re: /let walkers=try await APIClient/, hint: "The original sequential `let walkers = try await …` line should be gone — replaced by `async let`." },
          ],
          success: "Same two network calls, same result — but now they run concurrently instead of back to back.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "actors-sendable",
      title: "Actors & Sendable",
      steps: [
        {
          type: "text",
          md: [
            "## An actor is a class the compiler guards",
            "You met actors in lesson 1's fix for `WalkStats`. The full picture: an **actor** looks and feels like a class — properties, methods, `init` — but the compiler enforces that only one method call is running at a time, from any thread. Call a second method while the first is mid-flight and it simply waits its turn. That's **serial access**, guaranteed at compile time, with no lock you have to remember to take.",
            "`@MainActor` — the annotation on every view model you've written — is a *specific* actor: the one tied to the main thread. Marking a class `@MainActor` doesn't create a new actor, it says \"this type's methods only ever run on the *existing* main-thread actor\", which is exactly why it's safe to touch `@Published`-style properties from it and have SwiftUI redraw immediately.",
          ],
        },
        {
          type: "code",
          title: "Services/TokenStore.swift-style — a real actor",
          source: String.raw`actor TokenStore {
    private var token: String?

    func set(_ newToken: String?) {
        token = newToken
    }

    func current() -> String? {
        token
    }
}`,
          caption: "The auth token from Module 8, guarded properly: any thread can call set or current, but the actor serializes them — no race between a refresh writing a new token and a request reading the old one mid-write.",
        },
        {
          type: "code",
          title: "Features/Walkers/WalkersViewModel.swift-style — @MainActor",
          source: String.raw`@MainActor
@Observable
final class WalkersViewModel {
    private(set) var walkers: [Walker] = []

    func load() async {
        walkers = (try? await APIClient.shared.fetchWalkers()) ?? []
    }
}`,
          caption: "The same @MainActor @Observable shape from every view model since Module 5. load() is async — the network hop happens off the main thread — but the moment it resumes to assign walkers, Swift 6 guarantees you're back on the main actor.",
        },
        {
          type: "text",
          md: [
            "## Sendable: safe to hand across the boundary",
            "Actors solve races for *mutable state that lives in one place*. But plenty of values need to travel *between* actors — a `Walker` fetched off the main actor, then read by a `@MainActor` view. **`Sendable`** is the compiler's label for \"safe to pass across a concurrency boundary\": either the type is immutable, or it has its own internal locking (like an actor).",
            "A plain `struct Walker { let name: String; let ratingX10: Int }` is Sendable **automatically** — every stored property is a `let` of a Sendable type (`String` and `Int` both are), so there's no mutable state to race over in the first place. Value types with only immutable, Sendable members get this for free; you don't write anything. Swap one `let` for a `var` and the struct can still be Sendable *if nothing shares it* — but the moment two threads could hold the same mutable instance, the compiler will ask you to prove it's safe.",
          ],
        },
        {
          type: "quiz",
          q: "Which of these needs no extra work to satisfy Sendable?",
          choices: [
            "`class WalkStats { var total = 0 }`, shared between two Tasks",
            "`struct Walker { let name: String; let ratingX10: Int }`, passed between actors",
            "A closure that captures a mutable class instance and runs on a background queue",
            "`actor TokenStore`'s private var token — accessed directly from outside the actor without await",
          ],
          answer: 1,
          explain: "Walker is a struct made entirely of immutable, Sendable properties — the compiler infers Sendable for free, no annotation needed. The class with a var is exactly the race from lesson 1; a closure capturing a mutable class has the same problem; and an actor's stored properties are only reachable through its own methods, never directly from outside.",
          nudge: "Sendable-for-free applies to value types whose every stored property is itself immutable and Sendable. Which option is a struct built only from `let` String/Int?",
        },
        {
          type: "exercise",
          title: "Turn TokenStore into an actor",
          prompt: [
            "Convert this plain, race-prone `class TokenStore` into an `actor` — same two methods, same behavior, now compiler-guarded.",
            "1. Change `class TokenStore` to `actor TokenStore`.\n2. Leave `set(_:)` and `current()` exactly as they are — only the type keyword changes.",
          ],
          starter: String.raw`class TokenStore {
    private var token: String?

    func set(_ newToken: String?) {
        token = newToken
    }

    func current() -> String? {
        token
    }
}`,
          solution: String.raw`actor TokenStore {
    private var token: String?

    func set(_ newToken: String?) {
        token = newToken
    }

    func current() -> String? {
        token
    }
}`,
          checks: [
            { re: /actor TokenStore\{/, hint: "Only the keyword changes: `class TokenStore` becomes `actor TokenStore`." },
            { re: /func set\(_ newToken:String\?\)\{token=newToken\}/, hint: "Keep `set(_:)` exactly as given — the actor keyword alone is what adds the serialization." },
            { re: /func current\(\)->String\?\{token\}/, hint: "Keep `current()` exactly as given — it just returns `token`." },
          ],
          mustNot: [
            { re: /class TokenStore/, hint: "The type must be an `actor`, not a `class` — that's the entire fix." },
          ],
          success: "One keyword, and every call to set or current from any thread is now automatically serialized — no race between a token refresh and a read.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "cancellation-live-tracking",
      title: "Cancellation in Live Tracking",
      steps: [
        {
          type: "text",
          md: [
            "## Cancellation is cooperative",
            "Cancelling a `Task` doesn't yank it off the CPU like force-quitting an app. It flips a flag — `isCancelled` — and *asks nicely*. Long-running async code has to actually check that flag and stop itself; ignore it, and a \"cancelled\" task just keeps running, burning battery and network for a screen nobody's looking at anymore.",
            "That's exactly the risk in `LiveTracker`'s socket loop from Module 11: `receive()` calls itself again after every message, forever, unless something tells it to stop. `LiveTrackingView` already gives you the trigger for free — `.task { }` **automatically cancels its Task the moment the view disappears**. Combine that with a cancellation check inside the loop and the socket shuts itself down exactly when the Live screen goes away, with no manual bookkeeping.",
          ],
        },
        {
          type: "code",
          title: "Services/LiveTracker.swift-style — before: no cancellation check",
          source: String.raw`func start(bookingID: String?) async {
    phase = .connecting
    connect(bookingID: bookingID ?? "", token: currentToken)
    while true {
        try? await Task.sleep(for: .seconds(30))
        sendKeepAlive()
    }
}`,
          caption: "This keep-alive loop never stops on its own. If the view disappears mid-walk, the Task backing .task { } is cancelled — but nothing here notices, so the socket and the ping loop leak past the screen's lifetime.",
        },
        {
          type: "text",
          md: [
            "## Task.checkCancellation() — the polite stop",
            "`Task.checkCancellation()` is a static function you call from inside a loop: if the current task has been cancelled, it **throws** `CancellationError`; otherwise it does nothing and execution continues. Put it at the top of each iteration and a `for`/`while` loop unwinds itself cleanly the moment `.task { }` tears down — no flags to thread through by hand, no `while !Task.isCancelled` boilerplate to remember on every loop.",
            "The other half of the fix is teardown: when the loop exits — cancelled or not — the socket needs to actually close. A `defer` block runs no matter how the function exits (normal return, thrown error, or cancellation), which makes it the natural place to call `socket?.cancel()`.",
          ],
        },
        {
          type: "code",
          title: "Services/LiveTracker.swift-style — after: cooperative cancellation",
          source: String.raw`func start(bookingID: String?) async throws {
    phase = .connecting
    connect(bookingID: bookingID ?? "", token: currentToken)
    defer { socket?.cancel(with: .goingAway, reason: nil) }
    while true {
        try Task.checkCancellation()
        try? await Task.sleep(for: .seconds(30))
        sendKeepAlive()
    }
}`,
          caption: "Task.checkCancellation() throws the moment .task { } cancels this Task — the while loop unwinds, defer fires, and socket?.cancel(...) closes the connection. Nothing keeps running after the Live screen is gone.",
        },
        {
          type: "exercise",
          title: "Guard the keep-alive loop",
          prompt: [
            "Add a cancellation check to the top of this loop so it stops as soon as the view's Task is cancelled.",
            "1. As the first line inside `while true`, call `try Task.checkCancellation()`.",
          ],
          starter: String.raw`func runKeepAlive() async throws {
    while true {
        // your code here
        try? await Task.sleep(for: .seconds(30))
        sendKeepAlive()
    }
}`,
          solution: String.raw`func runKeepAlive() async throws {
    while true {
        try Task.checkCancellation()
        try? await Task.sleep(for: .seconds(30))
        sendKeepAlive()
    }
}`,
          checks: [
            { re: /while true\{try Task\.checkCancellation\(\)/, hint: "Call `try Task.checkCancellation()` as the very first line inside `while true { … }`." },
          ],
          mustNot: [
            { re: /while !Task\.isCancelled/, hint: "Use `Task.checkCancellation()` inside the loop body, not a `while !Task.isCancelled` condition — the exercise asks for the throwing check, which plays nicely with `defer` cleanup." },
          ],
          success: "One line, and the loop can no longer outlive the Task that owns it — exactly what keeps LiveTracker's keep-alive pings from running after the Live screen closes.",
        },
        {
          type: "quiz",
          q: "The owner backs out of the Live Tracking screen mid-walk. Why must the socket actually close, not just stop being watched?",
          choices: [
            "It doesn't matter — an open WebSocket with no listener is harmless and free",
            "The backend needs the disconnect to know this device is no longer watching; left open, the socket keeps consuming battery, network, and a server-side connection slot for a screen that no longer exists",
            "SwiftUI closes the socket automatically when the view struct is deallocated, so no code is needed",
            "Only the server can close a WebSocket — the client has no way to end it early",
          ],
          answer: 1,
          explain: "An open socket is a live resource on both ends: the phone keeps its radio active and the server keeps a connection (and often a per-connection subscription) alive for a screen the user isn't even looking at anymore. .task { }'s auto-cancellation plus a checkCancellation-guarded loop plus a defer-based socket.cancel() is what ties the connection's lifetime to the screen's lifetime.",
          nudge: "Think about both ends of the wire — what is the phone spending, and what is the server still holding onto, for a connection nobody's reading anymore?",
        },
      ],
    },
  ],
});
