# UIKit

### Frame vs Bounds and the View Hierarchy
**They ask:** "What's the actual difference between `frame` and `bounds`, and how does the subview/superview hierarchy work?"

`frame` describes a view's position and size in its **superview's** coordinate system — where the view sits relative to its parent. `bounds` describes the view's position and size in its **own** coordinate system — for a non-transformed view, `bounds.origin` is `(0, 0)` and `bounds.size` equals `frame.size`, but `frame` is only well-defined for an identity `transform`: the moment you apply a rotation or scale, `frame` is documented as **undefined** and UIKit just hands back the axis-aligned bounding box of the transformed view, which is rarely what you want — `bounds` stays the view's own untransformed coordinate space regardless. `bounds.origin` also matters directly for scroll views — `contentOffset` *is* `bounds.origin`.

```swift
view.frame = CGRect(x: 20, y: 40, width: 100, height: 50)   // where it sits in its superview
view.bounds.size                                              // (100, 50) — its own drawing space
view.transform = CGAffineTransform(rotationAngle: .pi / 4)
view.frame                                                      // undefined once transform isn't identity — don't read this
view.bounds                                                     // unchanged — still (100, 50), the value to trust
view.center                                                     // still meaningful — reposition rotated views via center, not frame
```

Every `UIView` owns an array of `subviews` and a single, optional `superview` — that parent-child tree *is* the view hierarchy, and it drives both rendering order (later subviews draw on top) and hit-testing (touches are routed down the tree via `hitTest(_:with:)`). `addSubview(_:)` both adds to that array and inserts the view's layer into the superview's `CALayer` tree.

**Say it:** "`frame` is position and size in the *parent's* coordinate space; `bounds` is the view's *own* coordinate space — `frame` is flat-out undefined once a `transform` is non-identity, so after a rotation I reposition with `center` and read `bounds`/`transform` instead, never `frame`."
**Red flag:** Reading `view.frame` after applying a rotation or scale `transform`. It's not just "different," it's undefined — the fix is `center` plus `bounds`/`transform`, or coordinate conversion via `convert(_:to:)`.

### ViewController Lifecycle
**They ask:** "Walk me through the `UIViewController` lifecycle — what happens, in order, and where do you put what?"

The core sequence, in order: `loadView()` (creates the view if you're not using a storyboard/nib — rarely overridden directly), `viewDidLoad()` (called exactly **once**, when the view hierarchy is first loaded into memory — the right place for one-time setup like data source assignment), `viewWillAppear(_:)` (called **every** time the view is about to become visible, including returning from a pushed screen — the right place to refresh data that might be stale), `viewDidAppear(_:)` (view is now on screen — start animations, analytics), then the mirror pair on the way out: `viewWillDisappear(_:)` and `viewDidDisappear(_:)`.

```swift
override func viewDidLoad() {
    super.viewDidLoad()
    tableView.dataSource = self          // one-time setup
}
override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    refreshData()                          // runs every time this screen becomes visible again
}
```

The recurring interview trap is `viewDidLoad` vs `viewWillAppear`: put anything that should only happen once (wiring delegates, building the view hierarchy programmatically) in `viewDidLoad`; put anything that needs to reflect the *current* state every time the screen reappears (a badge count, a list that changed while a detail screen was pushed) in `viewWillAppear`. Always call `super` first in `will*` methods and last isn't required, but calling it is mandatory — skipping it breaks the chain for any custom base class behavior.

**Say it:** "`viewDidLoad` runs exactly once per view-hierarchy load; `viewWillAppear` runs every time the screen becomes visible again — data that can go stale while the user was elsewhere belongs in `viewWillAppear`, not `viewDidLoad`."
**Red flag:** Putting data-refresh logic in `viewDidLoad` and wondering why a list looks stale after the user backs out of a detail screen and returns — `viewDidLoad` never fires again for that same instance.

### AutoLayout and Intrinsic Content Size
**They ask:** "How does AutoLayout resolve conflicting constraints, and what are intrinsic content size, hugging, and compression resistance for?"

AutoLayout is a **constraint solver** (a constraint-solving algorithm in the spirit of Cassowary runs under the hood — the exact implementation is a private detail, not something to lean on in an answer): you declare relationships (`leading = superview.leading + 16`), not absolute frames, and the system solves for concrete positions and sizes every layout pass. Every constraint carries a `priority` (1–1000, `.required` = 1000); when constraints conflict — including two *required* ones — the solver logs an "Unable to simultaneously satisfy constraints" warning and breaks the lowest-priority (or, among equal-priority required constraints, an arbitrarily-chosen) one at runtime. It does **not** crash the app; layout just ends up wrong, which is exactly why that console warning is easy to miss in a busy log and ship with a broken screen.

**Intrinsic content size** is a view's natural, content-driven size — a `UILabel` knows how big it needs to be for its text and font; a plain `UIView` has none. That intrinsic size participates in the constraint system through two more priorities: **content hugging** (how strongly the view resists growing *past* its intrinsic size — "don't stretch me if you don't have to") and **compression resistance** (how strongly it resists shrinking *below* its intrinsic size — "don't clip me").

```swift
label.setContentHuggingPriority(.defaultLow, for: .horizontal)       // OK to stretch this one
label.setContentCompressionResistancePriority(.required, for: .horizontal)  // never clip this one
```

The classic use: two labels side by side where one should truncate/wrap and the other should keep its natural size — you raise compression resistance on the one that must never clip, and lower hugging on the one that's allowed to expand into extra space.

**Say it:** "Every constraint has a priority, and a conflict — even between two *required* ones — doesn't crash the app: the solver logs 'unable to simultaneously satisfy' and breaks the lowest-priority loser at runtime, so layout goes wrong silently unless you're watching the console. That's exactly why hugging and compression resistance are how you resolve ambiguity between two labels competing for space instead of leaving it to chance."
**Red flag:** Setting every constraint to `.required` and assuming a conflict will crash and get caught in QA. It won't — it's a silent console warning and a broken layout, which is worse, not better, than a crash you'd actually notice.

### Cell Reuse and Scroll Performance
**They ask:** "Explain the cell reuse mechanism in `UITableView`/`UICollectionView`, and how do you debug stuttering or visual artifacts?"

Reuse exists because instantiating a full cell view hierarchy is expensive, and a scrolling list only ever needs to render roughly what fits on screen plus a small buffer — not one cell per data row. `dequeueReusableCell(withIdentifier:for:)` pulls a cell that's scrolled *off* screen out of a reuse pool instead of allocating a new one, and you re-configure its content for the new row before returning it.

```swift
func tableView(_ tv: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    let cell = tv.dequeueReusableCell(withIdentifier: "Cell", for: indexPath) as! MyCell
    cell.configure(with: items[indexPath.row])   // MUST reset every piece of state you set
    return cell
}
```

The classic visual artifact — stale content flashing before the correct row loads, or a checkmark/image that "belongs" to the wrong row — happens because reuse means a cell's leftover state from its *previous* row is still sitting there until you overwrite it. `configure(with:)` has to be exhaustive: reset every property you might have set conditionally (image, accessory type, background color), or implement `prepareForReuse()` to reset before the new configuration runs. Stuttering is usually a symptom of doing expensive work — layout, image decoding, network calls — synchronously inside `cellForRowAt` instead of off the main thread with async image loading and pre-computed cell heights.

**Say it:** "Reuse recycles off-screen cells instead of allocating new ones, which means every conditional piece of state I set has to be reset on configure or in `prepareForReuse` — stale-looking cells are almost always a forgotten reset, not a reuse-pool bug."
**Red flag:** Only setting a cell property inside an `if` branch (e.g. only setting an accessory image when a condition is true) without an `else` that clears it — the recycled cell's previous state leaks through.

### Responder Chain and UIView vs CALayer
**They ask:** "What is the responder chain, and how does `UIView` relate to `CALayer`?"

The responder chain is how UIKit routes an event (touch, shake, remote-control) up the view hierarchy when the object that received it doesn't handle it: from the hit-tested view, up through its superviews, to the view controller, up to the window, and finally the app delegate. `UIResponder` is the base class for anything in that chain — `UIView`, `UIViewController`, `UIApplication` all inherit from it. This is the actual mechanism behind things like `resignFirstResponder()`-triggered keyboard dismissal and `touchesBegan`/`touchesMoved` bubbling.

`UIView` and `CALayer` are a deliberate split of responsibilities: `UIView` is the UIKit-facing object handling touches, the responder chain, and AutoLayout — it does **not** draw anything itself. Every `UIView` is backed by a `CALayer` (accessible via `view.layer`), which is the Core Animation object that actually owns the rendered bitmap, handles compositing, and is what animations actually animate. That's why layer-level properties (`cornerRadius`, `shadowPath`, a custom `CAShapeLayer` for a `UIBezierPath`) exist on `.layer`, not on the view directly.

```swift
view.layer.cornerRadius = 8
view.layer.shadowPath = UIBezierPath(rect: view.bounds).cgPath   // pre-computed = cheaper than auto-calculated shadow
```

**Say it:** "`UIView` owns interaction and layout; `CALayer` owns the actual rendered bitmap and animation — that split is why `cornerRadius` and `shadowPath` live on `.layer`, and why animating layer properties directly bypasses the UIKit event-handling layer entirely."
**Red flag:** Letting `shadowPath` go uncomputed on a view with many instances (a table of cards, say) — Core Animation has to calculate the shadow's shape from the layer's contents every frame, which is a real, measurable scroll-performance cost versus supplying a precomputed `CGPath`.

### Gesture Recognizers and Container View Controllers
**They ask:** "How do you combine multiple `UIGestureRecognizer`s, and how does parent/child view controller containment work?"

`UIGestureRecognizer` is a state machine attached to a view that interprets a raw touch sequence into a recognized gesture (tap, pan, pinch) instead of you parsing `touchesBegan`/`touchesMoved` by hand. Multiple recognizers on overlapping views compete by default — only one usually wins — but `gestureRecognizer(_:shouldRecognizeSimultaneouslyWith:)` (via a delegate) lets two recognize together, and `require(toFail:)` lets you sequence them (a double-tap recognizer typically requires a single-tap one to fail first).

```swift
let pan = UIPanGestureRecognizer(target: self, action: #selector(handlePan))
let tap = UITapGestureRecognizer(target: self, action: #selector(handleTap))
tap.require(toFail: pan)          // don't fire tap until we're sure it isn't the start of a pan
view.addGestureRecognizer(pan)
view.addGestureRecognizer(tap)
```

Parent/child containment (`addChild(_:)`, `child.view` added as a subview, `child.didMove(toParent:)`) is how you compose independent view controllers into one screen — a container manages the lifecycle and layout of children it doesn't own the internals of, which is the pattern behind custom tab bars, page view controllers, and any "embed this reusable screen inside another" design. Forgetting `didMove(toParent:)` after adding the child view leaves the child's lifecycle callbacks (`viewWillAppear` etc.) unreliable.

**Say it:** "Gesture recognizers are state machines that compete by default — `require(toFail:)` and the simultaneous-recognition delegate method are how you resolve that — and container view controllers are the standard way to compose independently-owned screens without one controller doing everything."
**Red flag:** Forgetting to call `didMove(toParent:)` after `addChild`/`addSubview` when building custom containment — the child's own lifecycle events become unreliable, a subtle bug that only shows up later.

### Safe Area and Custom Transitions
**They ask:** "How does Safe Area Layout work, and how would you build a custom view controller transition?"

Safe Area Layout Guide exists to keep content clear of hardware and system chrome that varies by device — the notch/Dynamic Island, home indicator, status bar, navigation/tab bars — without hardcoding per-device offsets. `view.safeAreaLayoutGuide` gives you anchors (`.topAnchor`, `.leadingAnchor`, etc.) that automatically account for whatever the current device and presented chrome require, and it's the layout-guide-based successor to the old, brittle `topLayoutGuide`/`bottomLayoutGuide` from pre-notch iOS.

```swift
contentView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor).isActive = true
```

A custom transition replaces UIKit's default push/present animation with your own. The pieces: a `UIViewControllerAnimatedTransitioning` conformer implementing `transitionDuration` and `animateTransition(using:)`, where you manipulate the `fromView`/`toView` from the transition context directly (Core Animation/UIView animation on their layers); a `UIViewControllerTransitioningDelegate` (for `.custom` modal presentation) or `UINavigationControllerDelegate` (for push/pop) that supplies your animator object; and, for interactive transitions (swipe-to-dismiss), a `UIPercentDrivenInteractiveTransition` driven by a pan gesture's translation percentage.

**Say it:** "Safe area anchors abstract away device-specific chrome so I never hardcode a notch offset — and a custom transition is `UIViewControllerAnimatedTransitioning` plus a transitioning delegate telling UIKit to use it instead of the default push/present animation."
**Red flag:** Hardcoding a top inset for the status bar or notch instead of anchoring to `safeAreaLayoutGuide` — it silently breaks on the next device with a different safe-area shape.

### The Delegate Pattern
**They ask:** "What is the delegate pattern, and why is a delegate usually `weak`?"

Delegation is how one object hands off decisions or events to another without hard-coding who that other object is — it's the backbone of UIKit (a `UITableView` doesn't know what to display, so it asks its delegate/dataSource). You define a protocol, the "delegating" object holds a reference typed as that protocol, and another object conforms and does the work. The reference is declared `weak` because it's a **non-owning** reference — its whole purpose is to keep the delegating object from retaining its delegate. A common pattern is the delegate *owning* the delegating object (a view controller owns a table view, and the table view points back at the controller as its delegate), but ownership direction isn't what makes `weak` correct — avoiding a retain cycle is. Two objects holding each other strongly, either way, is a leak.

```swift
protocol PickerDelegate: AnyObject { func didPick(_ value: String) }
class Picker { weak var delegate: PickerDelegate? }   // weak breaks the cycle
```

**Say it:** "Delegation lets an object delegate behavior to another through a protocol, so it stays reusable and doesn't know its owner's type — and I make the delegate `weak` because it's meant to be a non-owning reference; if the delegating object held it strongly too, that's a retain cycle."
**Red flag:** Declaring a delegate `strong` (or forgetting `weak`). It silently leaks both objects; the giveaway in an interview is not knowing *why* delegates are weak.

### UIViewController vs UIView
**They ask:** "What's the difference between a UIView and a UIViewController?"

A `UIView` draws something and handles touches inside its own rectangle — a button, a label, a container. A `UIViewController` manages a *screen's worth* of views plus its lifecycle and navigation: it owns a root view (`self.view`), responds to lifecycle events (`viewDidLoad`, `viewWillAppear`), and is what you push/present when moving between screens. So views are the visual building blocks; the controller is the coordinator that assembles them and connects them to data and navigation.

**Say it:** "A UIView is a single visual/touch element; a UIViewController manages a screen — it owns a root view, gets lifecycle callbacks, and is the unit I navigate between."
**Red flag:** Putting networking, business logic, and data all inside a `UIViewController` because "that's where the code goes." That's the Massive-View-Controller anti-pattern — the controller should coordinate, not do everything.

### IBOutlet and IBAction
**They ask:** "What are IBOutlet and IBAction?"

They're the two connections between a Storyboard/XIB and your code. An `@IBOutlet` is a reference *from* code *to* a view laid out in Interface Builder, so you can read or change it at runtime (`label.text = ...`). An `@IBAction` is a method the UI calls *back* when an event happens (a button tap), wired up in Interface Builder. Outlets are usually `weak` because the view hierarchy already holds the view strongly. Mechanically they're just target-action and a property reference with a special attribute so Interface Builder can see them.

**Say it:** "An IBOutlet is a code reference to a view built in Interface Builder so I can update it; an IBAction is a method Interface Builder calls on an event like a tap. Outlets are weak because the view hierarchy already owns the view."
**Red flag:** A crash like "this class is not key value coding-compliant for the key…" — it almost always means an outlet/action is still wired in the Storyboard to a property you renamed or deleted. Knowing that connection is where a junior earns trust.

### UINavigationController — push and pop
**They ask:** "How does navigation between screens work with a UINavigationController?"

A `UINavigationController` manages a **stack** of view controllers — the classic drill-in/back flow. You `pushViewController(_:animated:)` to go deeper (new screen slides in, a back button appears automatically), and `popViewController` (or the back button) to return. Presenting modally (`present(_:animated:)`) is the other model — a screen that comes up over everything for a self-contained task, dismissed with `dismiss`. So: push/pop for hierarchical navigation, present/dismiss for a modal interruption.

**Say it:** "A navigation controller is a stack of view controllers — I push to drill in and pop to go back, with the back button managed for me — while present/dismiss is for modal screens that sit on top for a focused task."
**Red flag:** Trying to push onto a view controller that isn't inside a navigation controller (nothing happens, `navigationController` is nil). Knowing a VC needs to be *embedded* in a nav controller to push is basic but commonly missed.

### Storyboard vs XIB vs programmatic UI
**They ask:** "What are the ways to build a UIKit screen, and what's the trade-off?"

Three options. **Storyboards** lay out multiple screens and their segues visually — fast to start, but they merge badly in git and hide layout logic from code review. **XIBs** are a single reusable view/cell in Interface Builder — good for a custom cell you reuse. **Programmatic** UI writes views and Auto Layout constraints in Swift — more verbose, but it's diff-friendly, reviewable, and easy to make dynamic. Teams often mix: programmatic for anything shared or complex, XIBs for reusable cells.

**Say it:** "Storyboards are visual and fast but merge-conflict badly; XIBs are good for a reusable cell; programmatic UI is more code but diff-friendly and reviewable — I lean programmatic for shared/complex views and reach for Interface Builder for quick or reusable pieces."
**Red flag:** Insisting one approach is universally "correct." The senior signal is naming the git-merge and code-review trade-off, not picking a side dogmatically.
