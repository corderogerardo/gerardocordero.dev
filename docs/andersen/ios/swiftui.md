# SwiftUI

### Property Wrappers
**They ask:** "Walk me through `@State`, `@Binding`, `@ObservedObject`, `@StateObject`, and `@Published` — what does each one actually own?"

The question underneath all five is *who owns this value's storage, and when does it get created or destroyed*. `@State` is for value-type storage a view itself owns and drives its own re-renders — SwiftUI persists it outside the struct's lifetime across recomputation. `@Binding` doesn't own anything; it's a two-way reference to state owned *elsewhere*, which is how a child view can both read and write a parent's `@State` without owning a copy.

```swift
struct Parent: View {
    @State private var isOn = false
    var body: some View { Toggle("On", isOn: $isOn) }   // $isOn projects a Binding<Bool>
}

class ViewModel: ObservableObject {
    @Published var items: [String] = []    // publishes a change whenever items is reassigned
}

struct List: View {
    @StateObject private var vm = ViewModel()   // this view OWNS the object's lifetime
}
struct Row: View {
    @ObservedObject var vm: ViewModel            // this view just OBSERVES an object owned upstream
}
```

`@StateObject` vs `@ObservedObject` is the interview trap: use `@StateObject` at the point where a reference type is *created* — SwiftUI guarantees it survives view recomputation — and `@ObservedObject` everywhere that same object is *passed down*. Getting this backwards (creating a class with `@ObservedObject`) means the object gets recreated on every parent re-render, silently losing state.

**Say it:** "`@StateObject` is where I create and own a reference type's lifetime; `@ObservedObject` is where I observe one owned upstream — swap them and the object gets silently recreated on every re-render."
**Red flag:** Instantiating an `ObservableObject` with `@ObservedObject` instead of `@StateObject`. It compiles fine and then loses state on the next parent redraw — a bug that only shows up under specific re-render conditions.

### Stacks and Layout Containers
**They ask:** "What do `VStack`, `HStack`, `ZStack`, `Group`, `Spacer`, and `AnyView` each actually do?"

`VStack`/`HStack` lay children out vertically/horizontally and size themselves to fit their content, distributing extra space per child's layout priority. `ZStack` overlays children back-to-front with no inherent size contribution of its own beyond the union of its children. `Group` is *not* a layout container at all — it applies no layout, it exists purely to attach a modifier to multiple sibling views at once or to satisfy the "single root view" requirement without adding a real container.

```swift
VStack(alignment: .leading, spacing: 8) {
    Text("Title")
    HStack {
        Text("Left")
        Spacer()               // pushes siblings apart, consumes available space
        Text("Right")
    }
}
```

`Spacer()` is a flexible, invisible view that expands to consume all available space along its stack's axis, which is how you push content to the edges without hardcoded padding. `AnyView` is a type-erasing box for `some View` — reach for it *only* when you genuinely need to store heterogeneous view types in one variable (an array of mixed views), because it disables the compiler's ability to diff and optimize that subtree the way a concrete `some View` type can.

**Say it:** "`Group` applies no layout at all — it's for attaching one modifier to several siblings — and I reach for `AnyView` only when I actually need heterogeneous view storage, because it costs SwiftUI's diffing optimization on that subtree."
**Red flag:** Wrapping views in `AnyView` reflexively to "fix" a type error instead of restructuring with `@ViewBuilder` or a `some View`-returning helper — it's a performance cost you're opting into, not a free fix.

### Modifier Order and the Builder Pattern
**They ask:** "Why does modifier order matter — `background()` before `padding()` versus after — and what design pattern is this?"

Every SwiftUI modifier doesn't mutate the view in place — it *wraps* the view in a new view that adds behavior, returning a new `some View` each time. That's the builder pattern (more precisely, a decorator applied fluently): each `.modifier()` call produces a new, wrapped type, so `view.a().b()` is a different composed type than `view.b().a()`, and order changes what gets wrapped around what.

```swift
Text("Hi")
    .padding()
    .background(.blue)     // background is applied to the ALREADY-PADDED frame — blue extends under the padding

Text("Hi")
    .background(.blue)
    .padding()              // background is applied to the TEXT ONLY — padding adds transparent space outside it
```

This is the single most common SwiftUI layout gotcha in interviews because it looks like CSS but isn't — there's no cascade or specificity, just literal sequential wrapping, so reading modifier order top-to-bottom as "the frame this modifier sees" is the correct mental model.

**Say it:** "Every modifier returns a new wrapped view rather than mutating in place — it's a fluent builder/decorator, so `.background().padding()` and `.padding().background()` wrap fundamentally different frames, not just a stylistic order preference."
**Red flag:** Explaining modifier order as "like CSS specificity." There's no specificity model at all — it's literal, sequential composition, and that's a meaningfully different mental model to communicate.

### Environment
**They ask:** "What is `@Environment`, and when do you reach for it over passing a value down explicitly?"

`@Environment` is SwiftUI's dependency-injection mechanism — a value set once (often near the app root, via `.environment(\.keyPath, value)` or `.environmentObject(obj)`) and implicitly available to every descendant view without threading it through every initializer in between. It solves prop-drilling for cross-cutting values: color scheme, locale, a shared auth session, a theme.

```swift
struct RootView: View {
    var body: some View {
        ContentView()
            .environment(\.colorScheme, .dark)
            .environmentObject(session)          // available to ANY descendant, any depth
    }
}

struct DeepChild: View {
    @Environment(\.colorScheme) var scheme
    @EnvironmentObject var session: Session
}
```

The trade-off is implicit coupling: a view reading `@EnvironmentObject` has an invisible dependency that isn't visible in its initializer signature, and forgetting to inject it crashes at runtime rather than failing to compile. Reach for it for genuinely app-wide, rarely-changing values — for anything view-specific, explicit `@Binding`/init parameters keep the dependency visible and testable.

**Say it:** "Environment is implicit DI for cross-cutting, app-wide values — I use it for things like theme or session, and pass everything view-specific explicitly, because an environment dependency is invisible until it crashes at runtime."
**Red flag:** Threading every piece of state through `@EnvironmentObject` "because it's convenient" — it hides real dependencies and makes a view impossible to preview or test in isolation without standing up the whole environment.

### UIKit and SwiftUI Interop
**They ask:** "How do UIKit and SwiftUI talk to each other — `UIHostingController`, `UIViewRepresentable`, `UIViewControllerRepresentable`?"

Real apps are rarely pure SwiftUI, so interop is a practical necessity, not an edge case. `UIHostingController` wraps a SwiftUI view tree so it can be pushed/presented inside a UIKit navigation stack — it's the SwiftUI-inside-UIKit direction. `UIViewRepresentable`/`UIViewControllerRepresentable` go the other way: they wrap an existing `UIView`/`UIViewController` so it can be embedded inside a SwiftUI view tree, with `makeUIView`/`updateUIView` bridging SwiftUI's state changes into imperative UIKit updates.

```swift
struct MapViewRepresentable: UIViewRepresentable {
    func makeUIView(context: Context) -> MKMapView { MKMapView() }
    func updateUIView(_ view: MKMapView, context: Context) {
        view.setRegion(region, animated: true)   // SwiftUI state change → imperative UIKit call
    }
}
```

`updateUIView` is called every time SwiftUI re-renders the enclosing view, so it needs to be cheap and idempotent — it's not a one-time setup hook, it's re-invoked constantly. A `Coordinator` (via `makeCoordinator`) is the standard pattern for handling delegate callbacks *from* the UIKit view back into SwiftUI, since the representable struct itself can't hold delegate conformance across re-creates.

**Say it:** "`UIHostingController` embeds SwiftUI inside UIKit; `UIViewRepresentable` embeds UIKit inside SwiftUI — and `updateUIView` runs on every re-render, so it has to be cheap, not just a one-time setup."
**Red flag:** Doing expensive work inside `updateUIView` without guarding against redundant calls — since SwiftUI invokes it on every parent re-render, not just when the relevant state actually changed.

### ViewBuilder
**They ask:** "What does `@ViewBuilder` do, and why can't you put arbitrary logic inside a SwiftUI view body?"

`@ViewBuilder` is a specific `@resultBuilder` that turns a sequence of view expressions in a closure into one composed view value — it's the mechanism that makes `var body: some View { Text(...); if cond { Text(...) } }` compile at all, by rewriting that block into `buildBlock`/`buildEither` calls under the hood rather than executing it as literal imperative statements.

```swift
@ViewBuilder
func statusView(isOnline: Bool) -> some View {
    if isOnline {
        Label("Online", systemImage: "circle.fill")
    } else {
        Label("Offline", systemImage: "circle")
    }
}
```

Because it's a compile-time rewrite of *view expressions*, not a general-purpose scripting environment, it constrains what you can write: no `for` loops (use `ForEach`, which is itself a `View`), branches must resolve to view types the builder can unify via `buildEither`, and there's a practical sibling-count limit before you need to group children — all consequences of the transform being a type-level tree construction, not runtime control flow.

**Say it:** "`@ViewBuilder` compiles a block of view expressions into a composed tree via `buildBlock`/`buildEither` — it's why `if`/`switch` work in a body but a `for` loop doesn't; that's `ForEach`'s job because it's a real `View`, not builder syntax."
**Red flag:** Writing a custom `@ViewBuilder` function and then being surprised a `for` loop inside it won't compile — the fix is `ForEach`, not restructuring around the limitation with `AnyView`.

### Layout System: GeometryReader and PreferenceKey
**They ask:** "Walk me through SwiftUI's layout process — how do `ViewModifier`, `GeometryReader`, `PreferenceKey`, and `alignmentGuide` fit together?"

SwiftUI's layout is a negotiation, not a fixed algorithm: a parent proposes a size to each child, the child returns the size it actually wants (which may differ), and the parent positions children based on those returned sizes — that's fundamentally different from UIKit's constraint-solving. A `ViewModifier` participates in this by wrapping a view and potentially changing what size/position it reports upstream.

`GeometryReader` is the escape hatch when you need a view's *actual* available size — it reports the proposed size from its parent as a `GeometryProxy`, but it's a blunt instrument: it always greedily accepts all offered space, which can silently break the layout of anything nested inside it.

```swift
GeometryReader { proxy in
    Text("Width: \(proxy.size.width)")
}
```

`PreferenceKey` is the *only* clean way to pass data **up** the view tree — from child to ancestor — since normal data flow (`@State`/props) only goes down. A child reports a value via `.preference(key:value:)`, and an ancestor reads it via `.onPreferenceChange`, most commonly used to measure a child's size and react to it from a parent. `alignmentGuide` lets a view override where it aligns relative to its siblings' default `HStack`/`VStack` alignment guides, for custom alignment that the built-in `.leading`/`.center`/`.trailing` don't cover.

**Say it:** "Layout in SwiftUI is a size negotiation, parent proposes, child decides — `PreferenceKey` is the one sanctioned way to send data back up that tree, which is exactly why I reach for it instead of `GeometryReader` gymnastics when a parent needs to react to a child's measured size."
**Red flag:** Nesting `GeometryReader` deep in a view tree "just to get a size" — it greedily fills all offered space and frequently produces surprising, hard-to-debug layout collapses in siblings.

### List vs ForEach and Lazy Containers
**They ask:** "What's the real difference between `List` and `ForEach`, and when do `LazyVStack`/`LazyVGrid` matter?"

`ForEach` is a data-driven view *generator* — it produces a view for each element of a collection but isn't itself a scrollable container or a list chrome; it needs to live inside something that actually lays things out, like a `VStack` or `List`. `List` is a genuine scrollable, cell-reusing container with built-in platform chrome (swipe actions, section headers, separators) — under the hood it's backed by `UITableView`/`UICollectionView` on the relevant platform, so it inherits real cell reuse for free.

```swift
List(users) { user in                 // List: scrollable, reuses cells, gets swipe-to-delete free
    Text(user.name)
}

ScrollView {
    LazyVStack {                       // LazyVStack: only builds visible rows, but no built-in chrome
        ForEach(users) { user in Text(user.name) }
    }
}
```

The performance trap is a *plain* `VStack`/`HStack` inside a `ScrollView`: those eagerly build **every** child view up front regardless of visibility, which is fine for a dozen rows and a real problem at a thousand. `LazyVStack`/`LazyHStack`/`LazyVGrid`/`LazyHGrid` only instantiate children as they scroll into view — closer to `List`'s cell-reuse behavior, without List's platform chrome and identity/selection semantics.

**Say it:** "`List` is a real reusing scroll container with platform chrome baked in; a plain `VStack` inside `ScrollView` builds every row eagerly, so past a small count I reach for `LazyVStack`, which only materializes what's actually visible."
**Red flag:** Putting a thousand-row `ForEach` inside a plain `VStack`/`ScrollView` and being surprised by the memory spike and stutter — that container has no laziness at all.

### Drawing, Animation, and Gestures
**They ask:** "Walk me through SwiftUI's drawing and animation primitives — `Path`, `Shape`, `Canvas` — and the difference between `onAppear` and `.task`."

`Shape` is a protocol for anything that draws a resolution-independent vector path (`Rectangle`, `Circle`, or your own custom shape implementing `path(in:)`); `Path` is the actual sequence of drawing commands (`move`, `addLine`, `addCurve`) a `Shape` produces. `Canvas` is the immediate-mode escape hatch for when declarative `Shape` composition gets unwieldy — you get a raw `GraphicsContext` and draw imperatively, which is dramatically faster for scenarios with hundreds of dynamically-changing drawn elements, since it skips SwiftUI's view-diffing machinery entirely.

```swift
struct Triangle: Shape {
    func path(in rect: CGRect) -> Path {
        Path { p in
            p.move(to: CGPoint(x: rect.midX, y: rect.minY))
            p.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
            p.addLine(to: CGPoint(x: rect.minX, y: rect.maxY))
            p.closeSubpath()
        }
    }
}

Text("Tap")
    .onTapGesture { }
    .task { await loadData() }        // async-aware, tied to view lifetime, auto-cancels
    .onAppear { legacySetup() }        // fire-and-forget, no cancellation, no async support
```

`.task` is the modern choice over `.onAppear` for anything async: it's tied to the view's actual lifetime and automatically cancels the async work if the view disappears before it finishes — `.onAppear` has no such lifecycle awareness, so an async call started there keeps running (and can crash trying to update a view that's gone) even after the view is dismissed.

**Say it:** "`.task` is scoped to the view's lifetime and cancels automatically on disappearance; `.onAppear` is fire-and-forget with no cancellation, so any async work started there needs to guard `Task.isCancelled` itself or it keeps running after the view is gone."
**Red flag:** Kicking off an async fetch inside `.onAppear` instead of `.task` — it's a silent source of "updating state after the view disappeared" warnings and wasted work.

### High-Performance SwiftUI
**They ask:** "You've got a SwiftUI screen with hundreds of animating elements and it's dropping frames — what tools do you reach for?"

`.drawingGroup()` is the first lever: it flattens a subtree into a single, off-screen Metal-rendered bitmap composited as one layer, instead of SwiftUI compositing each subview separately — a large win specifically for scenes with many overlapping, blended, or animated shapes where per-view compositing is the bottleneck. It's not free — it disables some interaction/hit-testing nuance and costs a rasterization pass, so it's for genuinely heavy drawing, not a blanket "add it everywhere" fix.

The custom `Layout` protocol (iOS 16+) lets you implement arbitrary layout algorithms (`sizeThatFits`, `placeSubviews`) as a first-class SwiftUI type, replacing the old workaround of nested `GeometryReader`s for custom arrangements — and it participates correctly in the size-negotiation protocol instead of fighting it. Swift Charts gives you GPU-accelerated, declarative charting instead of a hand-rolled `Canvas` drawing loop for anything chart-shaped.

Accessibility is part of the same performance conversation in a real interview: `.accessibilityElement(children:)`, `.accessibilityLabel`, and `.accessibilityValue` aren't a checkbox — VoiceOver users navigate by accessibility tree, and a `Canvas`-drawn custom view has *zero* accessibility information unless you add it explicitly, unlike native SwiftUI views which infer sensible defaults.

**Say it:** "For a heavy, many-element animating scene I reach for `.drawingGroup()` to flatten compositing onto Metal — and anything I draw manually with `Canvas` needs explicit `.accessibilityElement` calls, because custom-drawn content has no accessibility tree by default."
**Red flag:** Slapping `.drawingGroup()` on every view "for performance" without profiling first — it has real costs (rasterization, some hit-testing changes) and is a targeted fix for compositing-bound scenes, not a universal speedup.

### What Is a SwiftUI View
**They ask:** "What is a View in SwiftUI, and how is it different from a UIView?"

A SwiftUI `View` is a lightweight **value type** (a struct) that *describes* what the UI should look like for the current state — it's not the on-screen object itself. SwiftUI takes your description, builds the real views, and re-runs your `body` to produce a fresh description whenever state changes, diffing it against the last one to update only what changed. That's the opposite of UIKit's `UIView`, a heavyweight reference-type object you mutate directly. So in SwiftUI you don't hold and poke views — you describe UI as a function of state and let the framework reconcile.

```swift
struct Greeting: View {
    let name: String
    var body: some View { Text("Hello, \(name)") }   // a description, recomputed on change
}
```

**Say it:** "A SwiftUI View is a value-type description of the UI for the current state — the framework builds and diffs the real views — whereas a UIKit UIView is a mutable object I change directly. SwiftUI is declarative: UI as a function of state."
**Red flag:** Trying to store a reference to a SwiftUI view and mutate it like a UIView. Views are recreated constantly and cheaply; state drives the UI, not direct mutation.

### @State and @Binding Basics
**They ask:** "What do `@State` and `@Binding` do, and how do they relate?"

They're how a SwiftUI view owns and shares mutable state. **`@State`** is a view's own private, source-of-truth value — when it changes, SwiftUI re-renders that view (`@State private var count = 0`). **`@Binding`** is a *reference* to state owned somewhere else, so a child view can read and write the parent's value without owning it — you pass it with the `$` prefix (`Toggle(isOn: $isOn)`). So `@State` owns; `@Binding` borrows a two-way connection to that owned value.

```swift
struct Parent: View {
    @State private var on = false
    var body: some View { Toggle("On", isOn: $on) }   // $on is a Binding
}
```

**Say it:** "`@State` is a view's private source-of-truth that triggers a re-render when it changes; `@Binding` is a two-way reference to state owned elsewhere, passed with `$`, so a child can mutate the parent's value without owning it."
**Red flag:** Marking a value `@State` in a child view when the parent should own it — you get two separate copies that drift out of sync. The fix is `@Binding` (or lifting the state up), and knowing which owns the data is the whole point.

### UIKit vs SwiftUI — When to Use Each
**They ask:** "SwiftUI or UIKit — how do you choose today?"

They're declarative vs imperative, and the honest answer is "SwiftUI first, UIKit where it's still needed." **SwiftUI** builds UI as a function of state — far less code, live previews, and it's Apple's clear direction, so it's the default for new screens. **UIKit** is the mature, imperative framework with deeper control and API coverage; you drop to it for things SwiftUI still does poorly (very complex collection layouts, some camera/text APIs, legacy code) — and the two interoperate via `UIViewRepresentable`. So: default to SwiftUI, reach for UIKit for the gaps.

**Say it:** "I default to SwiftUI for new work — declarative, less code, Apple's direction — and drop to UIKit through UIViewRepresentable where SwiftUI still lacks control, like complex list layouts or certain system APIs."
**Red flag:** Claiming SwiftUI fully replaces UIKit today, or that UIKit is obsolete. A senior names the real gaps and the interop path rather than treating it as all-or-nothing.
