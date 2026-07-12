# UIKit

### Frame vs Bounds and the View Hierarchy
**They ask:** "What's the actual difference between `frame` and `bounds`, and how does the subview/superview hierarchy work?"

`frame` describes a view's position and size in its **superview's** coordinate system — where the view sits relative to its parent. `bounds` describes the view's position and size in its **own** coordinate system — for a non-transformed view, `bounds.origin` is `(0, 0)` and `bounds.size` equals `frame.size`, but they diverge the moment you apply a rotation or scale `transform`: `frame` becomes the transformed bounding box, while `bounds` stays the view's own untransformed coordinate space. `bounds.origin` also matters directly for scroll views — `contentOffset` *is* `bounds.origin`.

```swift
view.frame = CGRect(x: 20, y: 40, width: 100, height: 50)   // where it sits in its superview
view.bounds.size                                              // (100, 50) — its own drawing space
view.transform = CGAffineTransform(rotationAngle: .pi / 4)
view.frame                                                      // now the rotated bounding box — bigger
view.bounds                                                     // unchanged — still (100, 50)
```

Every `UIView` owns an array of `subviews` and a single, optional `superview` — that parent-child tree *is* the view hierarchy, and it drives both rendering order (later subviews draw on top) and hit-testing (touches are routed down the tree via `hitTest(_:with:)`). `addSubview(_:)` both adds to that array and inserts the view's layer into the superview's `CALayer` tree.

**Say it:** "`frame` is position and size in the *parent's* coordinate space; `bounds` is the view's *own* coordinate space — they're identical until a `transform` is applied, and that's exactly the case where interviewers expect you to know the difference."
**Red flag:** Saying frame and bounds are "basically the same thing." They coincide by default, but conflating them breaks the moment transforms or custom drawing coordinates enter the picture.

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

AutoLayout is a **constraint solver** (Cassowary algorithm under the hood): you declare relationships (`leading = superview.leading + 16`), not absolute frames, and the system solves for concrete positions and sizes every layout pass. Every constraint carries a `priority` (1–1000, `.required` = 1000); when constraints conflict, the solver satisfies the higher-priority ones and — critically — silently breaks the lowest-priority conflicting constraint rather than crashing, unless *two required* constraints conflict, which does crash with an "Unable to satisfy constraints" log.

**Intrinsic content size** is a view's natural, content-driven size — a `UILabel` knows how big it needs to be for its text and font; a plain `UIView` has none. That intrinsic size participates in the constraint system through two more priorities: **content hugging** (how strongly the view resists growing *past* its intrinsic size — "don't stretch me if you don't have to") and **compression resistance** (how strongly it resists shrinking *below* its intrinsic size — "don't clip me").

```swift
label.setContentHuggingPriority(.defaultLow, for: .horizontal)       // OK to stretch this one
label.setContentCompressionResistancePriority(.required, for: .horizontal)  // never clip this one
```

The classic use: two labels side by side where one should truncate/wrap and the other should keep its natural size — you raise compression resistance on the one that must never clip, and lower hugging on the one that's allowed to expand into extra space.

**Say it:** "Every constraint has a priority, and when two *required* ones conflict the app crashes — everything else, the solver just breaks the lowest-priority loser silently, which is exactly why hugging and compression resistance are how you resolve ambiguity between two labels competing for space."
**Red flag:** Setting every constraint to `.required` and being surprised by a runtime crash the first time two of them genuinely can't both hold — required constraints are a hard contract, not a suggestion.

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
