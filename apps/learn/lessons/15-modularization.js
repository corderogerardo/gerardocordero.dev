// Module 15 — Modularize with SPM. See FORMAT.md for the schema.
window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "modularization",
  title: "Modularize with SPM",
  emoji: "📦",
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    {
      id: "one-giant-target-hurts",
      title: "One giant target hurts",
      steps: [
        {
          type: "text",
          md: [
            "## Everything can see everything",
            "PawWalk started as a single app target — every `.swift` file dropped into one Xcode target, `Models`, `Services`, `Features`, `Data`, all compiled together. That was fine at ten files. Fourteen modules later it's a few hundred, and one giant target has a quiet cost: **any file can import any other file.** `WalkHistoryView` can reach straight into `SyncEngine`'s internals. A view in `Features/Booking` can construct a `LiveWalkRepository` directly instead of going through the protocol from Module 14. Nothing in the project structure stops it — the only boundary is developer discipline, and discipline erodes under a deadline.",
            "There's a build-time cost too: change one file in a single-target app and Swift may need to re-typecheck the *whole target* before it can build again, because nothing tells the compiler which files actually depend on which. Xcode can't parallelize work across a target — a target is the unit it schedules around.",
          ],
        },
        {
          type: "text",
          md: [
            "## The fix: local Swift packages with explicit dependencies",
            "The fix isn't more folders — folders are just organization, not enforcement. It's splitting the app into **local Swift packages**, each with a `Package.swift` that declares, in code, exactly what it depends on. A package that doesn't list `PawWalkKit` as a dependency *cannot* import it — the compiler rejects it, not a code reviewer. Real apps built this way lean on the same shape: **Ice Cubes** (an open-source Mastodon client) splits into packages per feature — `Timeline`, `Account`, `Status` — each with its own `Package.swift`. **Point-Free**'s apps go further, often one package per *type* of concern (models, clients, feature logic) composed by a thin app target.",
            "Same idea, different granularity: draw the boundaries as packages, and the compiler enforces them for free.",
          ],
        },
        {
          type: "code",
          title: "Package.swift",
          source: String.raw`// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "PawWalkKit",
    platforms: [.iOS(.v17)],
    products: [
        .library(name: "PawWalkKit", targets: ["PawWalkKit"]),
    ],
    targets: [
        .target(name: "PawWalkKit"),
    ]
)`,
          caption: "A first Package.swift skeleton. `name` identifies the package. `products` is what other packages (or the app) are allowed to depend on — here, one library called PawWalkKit. `targets` is where the actual source files live; a target's name doesn't have to match the package name, but keeping them aligned for a package's main target is a common convention.",
        },
        {
          type: "text",
          md: [
            "## What PawWalk's split will look like",
            "By the end of this module the app is four local packages plus a thin app shell: **`PawWalkKit`** (models, `APIClient` — the shared core everything else builds on), **`DesignSystem`** (colors, fonts, shared components), and two feature packages, **`Bookings`** and **`Live`**, each depending on the first two but not on each other. The app target itself shrinks to almost nothing — just enough code to wire the packages together at launch.",
            "One module, four short lessons: extract the core package, add a feature package and see why the dependency graph can't have cycles, then look at what's left in the app target once everything else has moved out.",
          ],
        },
        {
          type: "quiz",
          q: "What does splitting an app into local Swift packages with explicit dependencies actually buy you, that folders inside one target don't?",
          choices: [
            "Nothing — it's purely cosmetic organization, same as folders",
            "Compiler-enforced boundaries (a package can't import what it doesn't declare as a dependency) plus parallel builds, since Xcode can build independent packages concurrently",
            "It makes the app run faster at runtime",
            "It removes the need for access control like `public` and `internal`",
          ],
          answer: 1,
          explain: "A folder is a suggestion; a package dependency is a rule the compiler enforces. Declare PawWalkKit as a dependency or the import fails to compile — no reviewer required. And because packages have explicit, declared dependencies, Xcode can see which ones are independent and build them in parallel instead of re-typechecking one giant target serially.",
          nudge: "Think about what actually stops a file from importing another file today — is it enforced, or just convention?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "first-package-pawwalkkit",
      title: "Your first package: PawWalkKit",
      steps: [
        {
          type: "text",
          md: [
            "## Extracting the shared core",
            "The first split is usually the easiest: pull out the code every feature needs — `Models` (`Walker`, `Booking`, `WalkRecord`) and `APIClient` — into a package called **`PawWalkKit`**. It has no UI, no `SwiftUI` imports, just types and networking. Every feature package and the app itself will depend on it, so it has to depend on nothing feature-specific in return.",
            "A package's **`products`** array is its public face — what a `Package.swift` in a *different* package can request with `.product(name:package:)`. A package's **`targets`** array is where the code actually lives; a product just points at one or more targets and says \"these are what I'm exposing.\" The app target then adds `PawWalkKit` as a dependency and imports it like any other module: `import PawWalkKit`.",
          ],
        },
        {
          type: "text",
          md: [
            "## Access control becomes real",
            "Inside one giant target, marking something `internal` (the default — no keyword needed) barely mattered, because everything lived in the same target anyway and could see it regardless. Cross a package boundary and `internal` suddenly *means something*: a type or method declared `internal` inside `PawWalkKit` is invisible outside the package, full stop. Only what's explicitly marked **`public`** escapes.",
            "That forces a real design decision for every type: is this part of `PawWalkKit`'s public API — the contract other packages build on — or is it an internal implementation detail that should stay hidden and free to change? `Walker` and `APIClient` need `public`. A private helper that formats a cache key doesn't.",
          ],
        },
        {
          type: "code",
          title: "PawWalkKit/Package.swift",
          source: String.raw`// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "PawWalkKit",
    platforms: [.iOS(.v17)],
    products: [
        .library(name: "PawWalkKit", targets: ["PawWalkKit"]),
    ],
    targets: [
        .target(name: "PawWalkKit"),
        .testTarget(name: "PawWalkKitTests", dependencies: ["PawWalkKit"]),
    ]
)`,
          caption: "The .library product exposes the PawWalkKit target under the same name. A .testTarget depends on the library target the same way an external package would — a nudge that the tests should exercise PawWalkKit through its public API, not its internals.",
        },
        {
          type: "exercise",
          title: "Write the .library product",
          prompt: [
            "Write the `.library` product line for `PawWalkKit`: it exposes a product named `\"PawWalkKit\"` built from a target also named `\"PawWalkKit\"`.",
          ],
          starter: String.raw`products: [
    // your code here
],`,
          solution: String.raw`products: [
    .library(name: "PawWalkKit", targets: ["PawWalkKit"]),
],`,
          checks: [
            { re: /\.library\(/, hint: "Use `.library(...)` — that's the product type for code other packages can import." },
            { re: /name:"PawWalkKit"/, hint: "Name the product `\"PawWalkKit\"`." },
            { re: /targets:\["PawWalkKit"\]/, hint: "Point `targets:` at the array `[\"PawWalkKit\"]` — the target that actually has the code." },
          ],
          mustNot: [
            { re: /\.executable/, hint: "This is a library other packages import, not a standalone executable." },
          ],
          success: "That's the exact product line PawWalkKit ships — one library, pointing at one target.",
        },
        {
          type: "quiz",
          q: "A type inside PawWalkKit is declared with no access modifier (so it defaults to `internal`). What happens when the app target tries to use it after `import PawWalkKit`?",
          choices: [
            "It works exactly like before — access control only matters within a single file",
            "It fails to compile — internal is invisible outside the package it's declared in; only public API crosses the boundary",
            "It works, but only in Debug builds",
            "It works, but triggers a deprecation warning",
          ],
          answer: 1,
          explain: "internal means 'visible anywhere in this module' — and a package is its own module. Once PawWalkKit is a separate package, internal types are invisible to the app target entirely. Only types and members marked public are part of the package's exported API.",
          nudge: "Where did 'internal' used to draw its line — the whole app, or just this module? What changed once PawWalkKit became a separate package?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "feature-packages-acyclic-graph",
      title: "Feature packages & an acyclic graph",
      steps: [
        {
          type: "text",
          md: [
            "## DesignSystem, then features",
            "Next comes **`DesignSystem`** — colors, fonts, reusable components like the booking-price label — its own package, depended on by anyone who needs UI. Then feature packages: **`Bookings`**, **`Live`** (the live-tracking screens from Module 13), each depending on `PawWalkKit` (for models and networking) and `DesignSystem` (for UI), but crucially **not on each other.**",
            "`Bookings` never imports `Live`, and `Live` never imports `Bookings`. If a booking confirmation needs to show a live map, that's not `Bookings` reaching into `Live` — it's a shared piece pulled down into `PawWalkKit` or a new small package both depend on, or a protocol `Bookings` defines that something above it satisfies.",
          ],
        },
        {
          type: "text",
          md: [
            "## Why the graph has to be acyclic",
            "Draw an arrow from every package to what it depends on and you get a **dependency graph**. SPM requires that graph to be **acyclic** — no cycles, meaning nothing can (even indirectly) depend on itself. `Bookings → PawWalkKit` is fine. `Bookings → Live → Bookings` is not, and SwiftPM will refuse to build it.",
            "That restriction is a feature, not a limitation. An acyclic graph is what makes **parallel builds** possible — Xcode can build `PawWalkKit` and `DesignSystem` at the same time since neither needs the other, then build `Bookings` and `Live` in parallel once their shared dependencies are ready. It's also what makes **isolated tests** possible: a test target for `Bookings` never has to spin up anything from `Live`. And it's what rules out spaghetti: if `Live` could import `Bookings` and `Bookings` could import `Live`, there'd be no way to build, reason about, or test either one alone — they'd really just be one tangled package wearing two names.",
          ],
        },
        {
          type: "code",
          title: "Bookings/Package.swift",
          source: String.raw`// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "Bookings",
    platforms: [.iOS(.v17)],
    products: [
        .library(name: "Bookings", targets: ["Bookings"]),
    ],
    dependencies: [
        .package(path: "../PawWalkKit"),
        .package(path: "../DesignSystem"),
    ],
    targets: [
        .target(
            name: "Bookings",
            dependencies: [
                .product(name: "PawWalkKit", package: "PawWalkKit"),
                .product(name: "DesignSystem", package: "DesignSystem"),
            ]
        ),
    ]
)`,
          caption: "`.package(path:)` is how a LOCAL package (living in a sibling folder, not a git URL) gets pulled in as a dependency — the path is relative to this Package.swift. Listing it in `dependencies` isn't enough on its own: the target also needs `.product(name:package:)` naming exactly which product, from which package, it wants to import.",
        },
        {
          type: "exercise",
          title: "Depend on PawWalkKit",
          prompt: [
            "`Live`'s `Package.swift` needs to depend on `PawWalkKit`, which lives one folder up. Add the path-dependency line to the `dependencies` array.",
          ],
          starter: String.raw`dependencies: [
    // your code here
],`,
          solution: String.raw`dependencies: [
    .package(path: "../PawWalkKit"),
],`,
          checks: [
            { re: /\.package\(/, hint: "Use `.package(...)` to declare a dependency on another package." },
            { re: /path:"\.\.\/PawWalkKit"/, hint: "Point `path:` at `\"../PawWalkKit\"` — one folder up, a sibling to this package." },
          ],
          mustNot: [
            { re: /url:/, hint: "This is a LOCAL package on disk — use `path:`, not `url:` (url: is for remote git dependencies)." },
          ],
          success: "That's the line that makes `import PawWalkKit` legal inside Live's target — after you also add it as a target dependency.",
        },
        {
          type: "quiz",
          q: "Why must Bookings and Live avoid importing each other, even though both are 'features' that might occasionally need something the other has?",
          choices: [
            "Apple's App Store review rejects apps with circular package dependencies",
            "SwiftPM requires the dependency graph to be acyclic — a cycle can't build, breaks parallel builds and isolated tests, and signals the two 'features' are really one tangled package",
            "Feature packages are only allowed to depend on DesignSystem, nothing else",
            "It's a style preference with no technical consequence",
          ],
          answer: 1,
          explain: "SwiftPM enforces an acyclic dependency graph — Bookings → Live → Bookings can't resolve. Beyond the hard build error, it's a warning sign: two packages that need each other aren't really separate concerns, and whatever they both need belongs in something lower in the graph that both can depend on instead (like PawWalkKit, or a new shared package).",
          nudge: "What does SwiftPM require of the shape of the whole dependency graph — and what would a Bookings-to-Live-to-Bookings arrow do to that shape?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "composition-root",
      title: "The composition root",
      steps: [
        {
          type: "text",
          md: [
            "## The app target shrinks to a shell",
            "After `PawWalkKit`, `DesignSystem`, `Bookings`, and `Live` are all packages, what's left in the actual Xcode app target? Almost nothing — a thin shell whose only job is to **wire the packages together.** It doesn't define models, doesn't define views, doesn't contain business logic. It imports every package it needs and assembles them into a running app.",
            "That shell has a name: the **composition root** — the one place, at the top of the app, where concrete types get chosen and dependencies get injected into whatever needs them. Everywhere else in the app talks to protocols (`WalkRepository` from Module 14, not `LiveWalkRepository` directly); the composition root is the one place that says \"here's the *real* implementation, use this one.\"",
          ],
        },
        {
          type: "text",
          md: [
            "## Ties back to Module 14's repository protocol",
            "Remember `WalkRepository` and its concrete `LiveWalkRepository`? Every feature package's view models should depend on the `WalkRepository` *protocol* — imported from `PawWalkKit`, where the protocol lives — and never construct a `LiveWalkRepository` themselves. Something has to build the real one and hand it down, exactly once. That something is the `@main App` struct: it creates the `ModelContainer`, builds a `LiveWalkRepository` from its `ModelContext`, and injects it into the view hierarchy — with `.environment(...)` or by passing it into a feature package's root view initializer.",
            "That's the payoff of modularizing: `Bookings` never imports `PawWalkKit`'s concrete networking code and never constructs a repository — it just receives one, already built, from the composition root above it.",
          ],
        },
        {
          type: "code",
          title: "PawWalkApp.swift",
          source: String.raw`import SwiftUI
import SwiftData
import PawWalkKit
import Bookings
import Live

@main
struct PawWalkApp: App {
    let container: ModelContainer

    init() {
        container = try! ModelContainer(for: WalkRecord.self, PendingOp.self)
    }

    var body: some Scene {
        WindowGroup {
            let repository = LiveWalkRepository(context: container.mainContext)
            BookingsRootView(repository: repository)
        }
        .modelContainer(container)
    }
}`,
          caption: "The whole app in one file: create the ModelContainer, build the ONE real LiveWalkRepository from its context, and hand it to BookingsRootView (exported by the Bookings package). Bookings only ever sees the WalkRepository protocol — it has no idea LiveWalkRepository, ModelContext, or SwiftData exist.",
        },
        {
          type: "exercise",
          title: "Declare the app target's package dependencies",
          prompt: [
            "The app target's `Package.swift`-equivalent target entry needs `dependencies` naming the products it wires together: `PawWalkKit`, `Bookings`, and `Live` (each `.product(name:package:)`, package name matching product name).",
          ],
          starter: String.raw`.target(
    name: "PawWalkApp",
    dependencies: [
        // your code here
    ]
),`,
          solution: String.raw`.target(
    name: "PawWalkApp",
    dependencies: [
        .product(name: "PawWalkKit", package: "PawWalkKit"),
        .product(name: "Bookings", package: "Bookings"),
        .product(name: "Live", package: "Live"),
    ]
),`,
          checks: [
            { re: /\.product\(name:"PawWalkKit",package:"PawWalkKit"\)/, hint: "First: `.product(name: \"PawWalkKit\", package: \"PawWalkKit\")`." },
            { re: /\.product\(name:"Bookings",package:"Bookings"\)/, hint: "Second: `.product(name: \"Bookings\", package: \"Bookings\")`." },
            { re: /\.product\(name:"Live",package:"Live"\)/, hint: "Third: `.product(name: \"Live\", package: \"Live\")`." },
          ],
          mustNot: [
            { re: /\.package\(path:/, hint: "This is the app TARGET's dependency list (which products it uses) — the `.package(path:)` entries belong in the package's top-level `dependencies:`, not here." },
          ],
          success: "That's the composition root's full ingredient list — three products, wired together in PawWalkApp.swift.",
        },
        {
          type: "quiz",
          q: "A new requirement needs to reach into both Bookings and Live to coordinate a feature. Where should that coordination code live?",
          choices: [
            "Inside Bookings, which then imports Live directly",
            "Inside Live, which then imports Bookings directly",
            "At the composition root (or a package both already depend on) — never as a direct import between two sibling feature packages",
            "Duplicated in both packages so neither has to import the other",
          ],
          answer: 2,
          explain: "Cross-cutting wiring — anything that needs to know about more than one feature — belongs at the composition root (or in a shared package lower in the graph, like PawWalkKit), not buried inside a feature package. That's exactly what keeps the Bookings-Live boundary acyclic: neither ever needs to import the other, because coordination happens above both, not between them.",
          nudge: "Which package in this course's dependency graph is allowed to know about BOTH Bookings and Live at once?",
        },
      ],
    },
  ],
});
