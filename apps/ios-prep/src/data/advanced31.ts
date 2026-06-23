// Advanced batch 31 — Drag and drop (mid/senior). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED31_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED31_FLASHCARDS: Flashcard[] = [
  {
    id: "dr1",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you add drag and drop in SwiftUI?",
    answerHtml: `<p><code>.draggable(item)</code> to make a view a drag source and
      <code>.dropDestination(for:)</code> to receive — both keyed on a <code>Transferable</code> type.</p>
    <div class="code">CardView(card).draggable(card)

ZStack { ... }
  .dropDestination(for: Card.self) { cards, location in
    add(cards); return true
  }</div>`,
    level: "mid",
  },
  {
    id: "dr2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What carries the dragged data?",
    answerHtml: `<p>A <code>Transferable</code> type — the same conformance used by <code>ShareLink</code> and
      copy/paste. You declare its representations (e.g. a <code>CodableRepresentation</code> or a data/file
      representation), and the system serializes it for the drag and reconstructs it at the drop. One conformance,
      many transfer surfaces.</p>`,
    level: "senior",
  },
  {
    id: "dr3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "When do you use the lower-level .onDrop?",
    answerHtml: `<p>When you need to accept arbitrary system types via <code>NSItemProvider</code> rather than a
      single <code>Transferable</code> — <code>.onDrop(of: [.image, .url], ...)</code> hands you providers you load
      manually. Use <code>.dropDestination</code> for your own typed payloads; <code>.onDrop</code> for
      mixed/system content (images, URLs, text from other apps).</p>`,
    level: "senior",
  },
  {
    id: "dr4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you let users reorder a List?",
    answerHtml: `<p>Add <code>.onMove { from, to in items.move(fromOffsets: from, toOffset: to) }</code> and an
      edit affordance (<code>EditButton</code> or bind <code>EditMode</code>). For drag-reorder without edit mode,
      newer APIs allow direct dragging; <code>.moveDisabled</code> excludes specific rows.</p>`,
    level: "mid",
  },
  {
    id: "dr5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you customize the drag preview?",
    answerHtml: `<p>Provide a preview view to <code>.draggable</code> (the trailing closure) — e.g. a smaller or
      badged representation that lifts under the finger. A good preview makes the drag feel intentional and shows
      what's being moved (useful for multi-item drags).</p>`,
    level: "senior",
  },
  {
    id: "dr6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How does a drop target decide copy vs move, or reject a drop?",
    answerHtml: `<p>The drop delegate/closure inspects the session and returns a <b>proposal</b>
      (<code>.copy</code>, <code>.move</code>, or <code>.forbidden</code>) so the cursor shows the right badge and
      invalid drops are refused. Validate the dragged types/content before accepting, and only mutate state in the
      actual perform/drop step.</p>`,
    level: "senior",
  },
  {
    id: "dr7",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "How do you make a UIKit view draggable?",
    answerHtml: `<p>Attach a <code>UIDragInteraction</code> with a <code>UIDragInteractionDelegate</code>;
      implement <code>itemsForBeginning(_:session:)</code> to return <code>UIDragItem</code>s (each wrapping an
      <code>NSItemProvider</code>). The interaction handles the lift/move gesture; you supply the payload and an
      optional preview.</p>`,
    level: "senior",
  },
  {
    id: "dr8",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "How does a UIKit view accept drops?",
    answerHtml: `<p>Add a <code>UIDropInteraction</code> + <code>UIDropInteractionDelegate</code>: implement
      <code>canHandle</code> (which types you accept), <code>sessionDidUpdate</code> to return a
      <code>UIDropProposal</code> (copy/move/forbidden as the user hovers), and <code>performDrop</code> to load
      the items and apply them.</p>`,
    level: "senior",
  },
  {
    id: "dr9",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "What role do NSItemProvider and UTType play?",
    answerHtml: `<p><code>NSItemProvider</code> is the <b>data-exchange currency</b> for drag/drop (and share/
      paste): it advertises the <b>uniform type identifiers</b> (<code>UTType</code>, e.g.
      <code>.image</code>, <code>.plainText</code>) it can provide and lazily loads each representation on
      request. Drop targets pick the best type they understand and load it.</p>`,
    level: "senior",
  },
  {
    id: "dr10",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "How do table/collection views support drag and drop?",
    answerHtml: `<p>Adopt the drag and drop delegates (<code>UICollectionViewDragDelegate</code>/
      <code>UITableViewDropDelegate</code>, etc.): provide drag items per index path and handle drops with the
      destination index path — the system animates <b>reordering</b> within the view and <b>inserting</b> items
      dragged from elsewhere.</p>`,
    level: "senior",
  },
  {
    id: "dr11",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "How does drag and drop work between apps?",
    answerHtml: `<p>On iPad (and via Stage Manager), a drag session can cross app boundaries — the source app's
      <code>NSItemProvider</code>/<code>Transferable</code> is delivered to the destination app. Data is
      transferred only on a successful drop, and apps just declare the types they vend/accept; the system
      brokers it.</p>`,
    level: "senior",
  },
  {
    id: "dr12",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "How do you drag multiple items?",
    answerHtml: `<p>Return multiple drag items to begin a session, and implement
      <code>itemsForAddingTo(_:session:)</code> so the user can <b>tap to add</b> more items to an in-progress
      drag (and combine selections). The destination then receives the whole set in one drop.</p>`,
    level: "architect",
  },
  {
    id: "dr13",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How should a target accepting several types behave?",
    answerHtml: `<p>List the accepted types in priority order and, on drop, pick the <b>richest</b> one the item
      offers (e.g. prefer a file URL over plain text). Load each provider's representation, and handle the case
      where an item can't supply your preferred type by falling back gracefully.</p>`,
    level: "senior",
  },
  {
    id: "dr14",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Why is loading dropped data asynchronous?",
    answerHtml: `<p>The data may be large or generated on demand (or fetched from another app/process), so
      <code>loadTransferable</code>/<code>loadObject</code> is <b>async</b>. Don't block the drop handler — kick
      off the load, show progress for big items, and update the UI when it completes. The drop can "succeed"
      before the bytes finish arriving.</p>`,
    level: "senior",
  },
  {
    id: "dr15",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "What is spring-loading?",
    answerHtml: `<p>Hovering a drag over a control (a tab, a folder, a navigation item) for a moment
      <b>activates</b> it — e.g. opening a folder so you can drop inside it. UIKit controls support it via
      spring-loaded interactions; it lets users navigate <i>during</i> a drag without dropping first.</p>`,
    level: "architect",
  },
  {
    id: "dr16",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "When should you rely on drag and drop in your UX?",
    answerHtml: `<p>As an <b>accelerator</b>, not the only path — it's powerful but low-discoverability and
      hard for some users. Provide an explicit alternative (a move/share button, a context menu), make targets
      obvious during a drag, and ensure the feature is reachable without precise dragging for
      accessibility.</p>`,
    level: "senior",
  },
];

export const ADVANCED31_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED31_QUIZ: QuizQuestion[] = [
  {
    id: "drz1",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "SwiftUI drag and drop for your own typed payload uses:",
    options: [".onDrag with a string", ".draggable + .dropDestination on a Transferable type", "UIDragInteraction", "onTapGesture"],
    answer: 1,
    explanationHtml: `<p><code>.draggable</code>/<code>.dropDestination(for:)</code> work with a
      <code>Transferable</code> type — the same conformance behind share and paste.</p>`,
  },
  {
    id: "drz2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "To reorder rows in a List you add:",
    options: [".onMove (with edit mode / drag)", ".onDelete", ".refreshable", ".searchable"],
    answer: 0,
    explanationHtml: `<p><code>.onMove</code> + an edit affordance reorders the underlying collection (use
      <code>move(fromOffsets:toOffset:)</code>).</p>`,
  },
  {
    id: "drz3",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "The currency for exchanging drag/drop data is:",
    options: ["UIView", "NSItemProvider (advertising UTTypes)", "Data only", "JSON"],
    answer: 1,
    explanationHtml: `<p><code>NSItemProvider</code> declares the uniform type identifiers it can vend and loads
      each representation lazily; targets pick the best type.</p>`,
  },
  {
    id: "drz4",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "As the user hovers a drag over a UIKit target, the delegate returns a:",
    options: ["Bool only", "UIDropProposal (copy/move/forbidden)", "UIView", "UTType"],
    answer: 1,
    explanationHtml: `<p><code>sessionDidUpdate</code> returns a <code>UIDropProposal</code> so the cursor shows
      the right badge and invalid drops are refused before <code>performDrop</code>.</p>`,
  },
  {
    id: "drz5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Loading dropped data is asynchronous because:",
    options: ["It's encrypted", "Items can be large or generated on demand (possibly cross-app)", "SwiftUI requires it", "Drops always fail first"],
    answer: 1,
    explanationHtml: `<p><code>loadTransferable</code>/<code>loadObject</code> is async; don't block the handler —
      show progress for big items and update when it completes.</p>`,
  },
  {
    id: "drz6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Good drag-and-drop UX should:",
    options: ["Be the only way to do the action", "Be an accelerator with an explicit alternative", "Hide all other affordances", "Require precise dragging"],
    answer: 1,
    explanationHtml: `<p>Drag-and-drop is low-discoverability; offer a button/menu alternative and keep the
      feature reachable for accessibility.</p>`,
  },
];

export const ADVANCED31_STUDY: StudySection[] = [
  {
    id: "st-adv-69",
    num: "84",
    title: "84 · Drag and drop in SwiftUI & UIKit",
    html: `<p><b>What it is.</b> In SwiftUI, <code>.draggable(item)</code> + <code>.dropDestination(for:)</code>
      move a <code>Transferable</code> payload, with a customizable drag preview; drop the level to
      <code>.onDrop(of:)</code> + <code>NSItemProvider</code> for arbitrary system types. In UIKit,
      <code>UIDragInteraction</code>/<code>UIDropInteraction</code> (and the collection/table drag-drop delegates)
      do the same, exchanging <code>UIDragItem</code>s wrapping <code>NSItemProvider</code>s and returning a
      <code>UIDropProposal</code> as the user hovers.</p>
    <div class="callout tip"><span class="lbl">Reorder</span> A List reorders with <code>.onMove</code>;
      collection/table views animate reorder + insert through their drag/drop delegates.</div>`,
  },
  {
    id: "st-adv-70",
    num: "85",
    title: "85 · Data exchange, reordering & cross-app drag",
    html: `<p><b>What it is.</b> The plumbing and the polish. <b>NSItemProvider</b> + <b>UTType</b> are the
      exchange currency — sources advertise types and load representations lazily; targets pick the richest type
      they understand and load it <b>asynchronously</b> (show progress for big items). On iPad, a drag can cross
      <b>app boundaries</b> (data delivered only on a successful drop). Support <b>multi-item</b> drags, return a
      <b>proposal</b> (copy/move/forbidden) to validate, and use spring-loading to navigate mid-drag.</p>
    <div class="callout warn"><span class="lbl">UX</span> Treat drag-and-drop as an accelerator: make targets
      obvious during a drag and always provide a non-drag alternative for discoverability and accessibility.</div>`,
  },
];
