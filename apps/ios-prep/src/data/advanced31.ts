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
    answerHtml: `<p>SwiftUI treats drag and drop as a data-transfer problem, not a gesture problem — the same
      <code>Transferable</code> conformance powers share sheets and copy/paste, so you write serialization once
      and every surface gets it for free. Mechanically: <code>.draggable(item)</code> makes a view a drag source
      and <code>.dropDestination(for:)</code> receives it, both keyed on that <code>Transferable</code> type.</p>
    <div class="code">CardView(card).draggable(card)

ZStack { ... }
  .dropDestination(for: Card.self) { cards, location in
    add(cards); return true
  }</div>
    <p><b>I reach for .draggable/.dropDestination first because the Transferable conformance I write there is
      reused by ShareLink and paste, not just drag and drop.</b></p>`,
    level: "mid",
  },
  {
    id: "dr2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "What carries the dragged data?",
    answerHtml: `<p>Apple unified drag, share, and paste behind one protocol so you don't write three
      serialization paths for the same model — that protocol is <code>Transferable</code>. You declare its
      representations (e.g. a <code>CodableRepresentation</code>, or a data/file representation), and the system
      serializes it for the drag and reconstructs it at the drop.</p>
    <p><b>One Transferable conformance covers drag and drop, ShareLink, and copy/paste — I only write the
      representation once.</b></p>`,
    level: "senior",
  },
  {
    id: "dr3",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "When do you use the lower-level .onDrop?",
    answerHtml: `<p><code>.dropDestination</code> only knows your own <code>Transferable</code> type — it can't
      accept whatever a random app hands you, so for arbitrary system content you drop to the lower-level
      <code>.onDrop(of: [.image, .url], ...)</code>, which hands you raw <code>NSItemProvider</code>s you load
      manually.</p>
    <p>Red flag: reaching for <code>.onDrop</code> to handle your own app's data — that's what
      <code>.dropDestination</code> is for, and skipping it means hand-rolling type checking and loading you'd get
      for free.</p>
    <p><b>.dropDestination for my own typed payloads, .onDrop for mixed or cross-app system content.</b></p>`,
    level: "senior",
  },
  {
    id: "dr4",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you let users reorder a List?",
    answerHtml: `<p>Reordering is a data-mutation problem before it's a gesture problem — SwiftUI won't guess
      your new order, so you supply the move yourself. Add <code>.onMove { from, to in
      items.move(fromOffsets: from, toOffset: to) }</code> plus an edit affordance (<code>EditButton</code> or a
      bound <code>EditMode</code>); newer APIs allow direct drag-reorder without edit mode, and
      <code>.moveDisabled</code> excludes specific rows from reordering.</p>
    <p><b>.onMove plus items.move(fromOffsets:toOffset:) — the list view just tells me the indices, I own the
      mutation.</b></p>`,
    level: "mid",
  },
  {
    id: "dr5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How do you customize the drag preview?",
    answerHtml: `<p>The default drag preview is a screenshot of the source view, which can be too large or
      ambiguous mid-drag — so you provide your own preview via <code>.draggable</code>'s trailing closure, e.g. a
      smaller or badged representation that lifts under the finger. A good preview makes the drag feel intentional
      and shows what's being moved, which matters most in multi-item drags.</p>
    <p><b>I customize the drag preview whenever the source view itself would be a confusing or oversized thing to
      drag around.</b></p>`,
    level: "senior",
  },
  {
    id: "dr6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How does a drop target decide copy vs move, or reject a drop?",
    answerHtml: `<p>Users need feedback before they commit to a drop, not just after — so the system asks the
      target to preview its intent as the drag hovers. The drop delegate/closure inspects the session and returns
      a <b>proposal</b> (<code>.copy</code>, <code>.move</code>, or <code>.forbidden</code>) so the cursor shows
      the right badge and invalid drops are refused before anything happens.</p>
    <p>Red flag: mutating state while computing the proposal — validate types/content there, but only mutate in
      the actual perform/drop step, once the user has committed.</p>
    <p><b>The proposal step is read-only validation; state only changes in perform/drop.</b></p>`,
    level: "senior",
  },
  {
    id: "dr7",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "How do you make a UIKit view draggable?",
    answerHtml: `<p>UIKit models drag as an interaction object, the same family as tap and pan gesture
      recognizers, so it composes cleanly with a view's other interactions instead of hijacking touch handling.
      Attach a <code>UIDragInteraction</code> with a <code>UIDragInteractionDelegate</code>, and implement
      <code>itemsForBeginning(_:session:)</code> to return <code>UIDragItem</code>s (each wrapping an
      <code>NSItemProvider</code>) — the interaction owns the lift/move gesture, you just supply the payload and
      an optional preview.</p>
    <p><b>UIDragInteraction + itemsForBeginning — I hand back drag items, the system drives the gesture.</b></p>`,
    level: "senior",
  },
  {
    id: "dr8",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "How does a UIKit view accept drops?",
    answerHtml: `<p>Accepting a drop is really three questions — can I handle this, what should the cursor show
      while it hovers, and what do I do once it lands — so UIKit splits it into three delegate methods instead of
      one. Add a <code>UIDropInteraction</code> + <code>UIDropInteractionDelegate</code>: <code>canHandle</code>
      says which types you accept, <code>sessionDidUpdate</code> returns a <code>UIDropProposal</code>
      (copy/move/forbidden) as the user hovers, and <code>performDrop</code> loads the items and applies them.</p>
    <p><b>canHandle gates it, sessionDidUpdate previews it, performDrop commits it.</b></p>`,
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
      request. Drop targets pick the best type they understand and load only that one.</p>
    <p><b>NSItemProvider advertises types, UTType names them — I never load a representation the target doesn't
      actually need.</b></p>`,
    level: "senior",
  },
  {
    id: "dr10",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "How do table/collection views support drag and drop?",
    answerHtml: `<p>Table and collection views don't reinvent drag/drop — they layer index-path-aware delegates on
      top of the same <code>UIDragInteraction</code>/<code>UIDropInteraction</code> machinery, so the animation
      work (reordering, inserting) comes free. Adopt the drag and drop delegates
      (<code>UICollectionViewDragDelegate</code>/<code>UITableViewDropDelegate</code>, etc.): provide drag items
      per index path and handle drops with the destination index path — the system animates <b>reordering</b>
      within the view and <b>inserting</b> items dragged from elsewhere.</p>
    <p><b>I give the delegates index paths and items; the view owns the reorder/insert animation.</b></p>`,
    level: "senior",
  },
  {
    id: "dr11",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "How does drag and drop work between apps?",
    answerHtml: `<p>Two sandboxed apps can't just read each other's memory, so cross-app drag has to go through a
      broker — that's why the OS, not either app, owns the handoff. On iPad (and via Stage Manager), a drag
      session can cross app boundaries: the source app's <code>NSItemProvider</code>/<code>Transferable</code> is
      delivered to the destination app only on a successful drop, and each app just declares the types it vends
      or accepts.</p>
    <p><b>Apps never talk to each other directly — they each declare types, and the system brokers the transfer
      only on a completed drop.</b></p>`,
    level: "senior",
  },
  {
    id: "dr12",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "How do you drag multiple items?",
    answerHtml: `<p>Multi-item drag has to support a drag that starts before the user has finished selecting, so
      the API splits "start" from "add more" instead of requiring the whole selection up front. Return multiple
      drag items to begin a session, and implement <code>itemsForAddingTo(_:session:)</code> so the user can
      <b>tap to add</b> more items to an in-progress drag — the destination then receives the whole combined set
      in one drop.</p>
    <p><b>itemsForBeginning starts the drag, itemsForAddingTo grows it — the user builds their selection
      mid-gesture.</b></p>`,
    level: "architect",
  },
  {
    id: "dr13",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "How should a target accepting several types behave?",
    answerHtml: `<p>Senders often offer the same content in several fidelities (a file URL and a plain-text
      fallback for the same image), so a good target shouldn't grab the first type that matches — it should ask
      for the best one available. List the accepted types in priority order and, on drop, pick the
      <b>richest</b> one the item offers (e.g. prefer a file URL over plain text); load that provider's
      representation and fall back gracefully when an item can't supply your preferred type.</p>
    <p><b>I order accepted types by richness and take the best one each item actually offers, not just the first
      match.</b></p>`,
    level: "senior",
  },
  {
    id: "dr14",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Why is loading dropped data asynchronous?",
    answerHtml: `<p>The data may be large, generated on demand, or coming from another app/process entirely, so
      <code>loadTransferable</code>/<code>loadObject</code> is <b>async</b> by design. Don't block the drop
      handler waiting on it — kick off the load, show progress for big items, and update the UI when it
      completes. The drop can "succeed" before the bytes finish arriving.</p>
    <p>Red flag: treating a successful drop callback as proof the data is loaded — it only proves the load
      started.</p>
    <p><b>Drop acceptance and data availability are two different events; I don't block one on the other.</b></p>`,
    level: "senior",
  },
  {
    id: "dr15",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "What is spring-loading?",
    answerHtml: `<p>Without spring-loading, a user mid-drag would have to drop somewhere neutral, navigate, then
      re-initiate the drag — so UIKit lets navigation happen inside the drag itself. Hovering a drag over a
      control (a tab, a folder, a navigation item) for a moment <b>activates</b> it, e.g. opening a folder so you
      can drop inside it; controls support this via spring-loaded interactions.</p>
    <p><b>Spring-loading lets the user navigate during a drag instead of dropping, navigating, and re-starting
      it.</b></p>`,
    level: "architect",
  },
  {
    id: "dr16",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "When should you rely on drag and drop in your UX?",
    answerHtml: `<p>Drag and drop feels magical in a demo but it's low-discoverability and physically demanding,
      so treat it as an <b>accelerator</b>, never the only path to an action. Provide an explicit alternative (a
      move/share button, a context menu), make drop targets visually obvious during a drag, and ensure the action
      is reachable without precise dragging for accessibility.</p>
    <p>Red flag: shipping drag-and-drop as the only way to move or share an item — anyone with limited motor
      control, or who simply doesn't discover the gesture, is locked out.</p>
    <p><b>Drag and drop accelerates the action for users who find it; it never replaces the button that gets
      everyone else there.</b></p>`,
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
      <code>Transferable</code> type — the same conformance behind share and paste. The tempting wrong answer,
      <code>.onDrag</code> with a plain string, is the legacy pre-Transferable API: it works for simple string
      payloads but loses type safety and doesn't reuse your model's serialization the way
      <code>Transferable</code> does.</p>`,
  },
  {
    id: "drz2",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "To reorder rows in a List you add:",
    options: [".onMove (with edit mode / drag)", ".onDelete", ".refreshable", ".searchable"],
    answer: 0,
    explanationHtml: `<p><code>.onMove</code> + an edit affordance reorders the underlying collection (use
      <code>move(fromOffsets:toOffset:)</code>). <code>.onDelete</code> is the modifier people confuse it with —
      it wires up swipe-to-delete, not reordering, since it only receives the removed offsets.</p>`,
  },
  {
    id: "drz3",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "The currency for exchanging drag/drop data is:",
    options: ["UIView", "NSItemProvider (advertising UTTypes)", "Data only", "JSON"],
    answer: 1,
    explanationHtml: `<p><code>NSItemProvider</code> declares the uniform type identifiers it can vend and loads
      each representation lazily; targets pick the best type. Plain <code>Data</code> is tempting because that's
      ultimately what gets transferred, but it can't advertise multiple type representations or load them lazily
      — that negotiation is exactly what <code>NSItemProvider</code> adds.</p>`,
  },
  {
    id: "drz4",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "As the user hovers a drag over a UIKit target, the delegate returns a:",
    options: ["Bool only", "UIDropProposal (copy/move/forbidden)", "UIView", "UTType"],
    answer: 1,
    explanationHtml: `<p><code>sessionDidUpdate</code> returns a <code>UIDropProposal</code> so the cursor shows
      the right badge and invalid drops are refused before <code>performDrop</code>. A plain <code>Bool</code>
      would tell the user whether a drop is allowed, but not what kind — the proposal is what lets the cursor
      distinguish a copy from a move from a rejection.</p>`,
  },
  {
    id: "drz5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Loading dropped data is asynchronous because:",
    options: ["It's encrypted", "Items can be large or generated on demand (possibly cross-app)", "SwiftUI requires it", "Drops always fail first"],
    answer: 1,
    explanationHtml: `<p><code>loadTransferable</code>/<code>loadObject</code> is async because the payload can
      be large, generated on demand, or coming from another app entirely — not because of encryption. Don't block
      the handler; show progress for big items and update the UI when the load completes.</p>`,
  },
  {
    id: "drz6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "Good drag-and-drop UX should:",
    options: ["Be the only way to do the action", "Be an accelerator with an explicit alternative", "Hide all other affordances", "Require precise dragging"],
    answer: 1,
    explanationHtml: `<p>Drag-and-drop is low-discoverability and physically demanding, so it should accelerate
      an action, not gate it. Making it "the only way" is the tempting wrong answer for anyone chasing a clean,
      minimal UI — but it locks out users who don't discover the gesture or can't perform precise drags.</p>`,
  },
];

export const ADVANCED31_STUDY: StudySection[] = [
  {
    id: "st-adv-69",
    num: "84",
    title: "84 · Drag and drop in SwiftUI & UIKit",
    html: `<p><b>Why it exists.</b> Drag and drop is really a data-transfer protocol wearing a gesture's clothes —
      both platforms route it through the same <code>Transferable</code>/<code>NSItemProvider</code> machinery
      that powers sharing and pasting, so you serialize your model once and reuse it everywhere. In SwiftUI,
      <code>.draggable(item)</code> + <code>.dropDestination(for:)</code> move a <code>Transferable</code>
      payload, with a customizable drag preview; drop to the lower-level <code>.onDrop(of:)</code> +
      <code>NSItemProvider</code> only for arbitrary system types. In UIKit,
      <code>UIDragInteraction</code>/<code>UIDropInteraction</code> (and the collection/table drag-drop delegates)
      do the same, exchanging <code>UIDragItem</code>s wrapping <code>NSItemProvider</code>s and returning a
      <code>UIDropProposal</code> as the user hovers.</p>
    <div class="callout tip"><span class="lbl">Reorder</span> A List reorders with <code>.onMove</code>;
      collection/table views animate reorder + insert through their drag/drop delegates.</div>
    <p><b>Say this:</b> "I default to Transferable-based APIs because the same conformance covers drag, share,
      and paste — I only drop to NSItemProvider directly when I need arbitrary system content."</p>`,
  },
  {
    id: "st-adv-70",
    num: "85",
    title: "85 · Data exchange, reordering & cross-app drag",
    html: `<p><b>Why it matters.</b> The mechanics of a single drag hide a bigger constraint: two apps (or two
      processes) are sandboxed from each other, so every piece of this — typed advertising, lazy loading,
      brokered cross-app delivery — exists to move data safely without either side trusting the other's
      internals. <b>NSItemProvider</b> + <b>UTType</b> are the exchange currency: sources advertise types and
      load representations lazily; targets pick the richest type they understand and load it
      <b>asynchronously</b> (show progress for big items). On iPad, a drag can cross <b>app boundaries</b>, with
      data delivered only on a successful drop. Support <b>multi-item</b> drags, return a <b>proposal</b>
      (copy/move/forbidden) to validate before committing, and use spring-loading to let users navigate
      mid-drag.</p>
    <div class="callout warn"><span class="lbl">UX</span> Treat drag-and-drop as an accelerator: make targets
      obvious during a drag and always provide a non-drag alternative for discoverability and accessibility.</div>
    <p><b>Say this:</b> "Cross-app drag only transfers data on a successful drop — until then, both apps just
      declare the types they vend or accept, and the system brokers the rest."</p>`,
  },
];
