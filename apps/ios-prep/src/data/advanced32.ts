// Advanced batch 32 — Generics & advanced type system (senior/architect). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED32_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED32_FLASHCARDS: Flashcard[] = [
  {
    id: "gn1",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What do generics give you?",
    answerHtml: `<p>Generics let you write one implementation that the compiler specializes per call site, so you get
      reuse without paying for it — no boxing, no dynamic dispatch, and the type checker still catches misuse at
      compile time. Mechanically: a generic function/type takes a type parameter
      (<code>func first&lt;T&gt;(_ xs: [T]) -&gt; T?</code>, <code>struct Stack&lt;Element&gt;</code>) and the
      compiler keeps full type information through it. It's how <code>Array</code>, <code>Optional</code>, and
      most of the stdlib are built. <b>Generics buy you reuse with zero runtime cost — that's why the stdlib is
      built on them instead of "any Object" containers.</b></p>`,
    level: "senior",
  },
  {
    id: "gn2",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What are generic constraints?",
    answerHtml: `<p>Without constraints a generic parameter has no capabilities — you couldn't even compare two
      values — so constraints are what let generic code call real methods while staying generic. Mechanically:
      <code>func max&lt;T: Comparable&gt;(...)</code> means "T must be Comparable", unlocking <code>&lt;</code>
      inside. Constraints can be protocols (<code>T: Collection</code>), classes, or compositions
      (<code>T: A &amp; B</code>). <b>Constraints are the contract that lets a generic function use behavior
      without giving up genericity.</b></p>`,
    level: "senior",
  },
  {
    id: "gn3",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What do where clauses add?",
    answerHtml: `<p>Some requirements aren't "T conforms to P" — they're relationships between types, like "this
      collection's element must be Numeric" — and the simple <code>:</code> syntax can't express that, so
      <code>where</code> exists to. Mechanically:
      <code>func f&lt;C: Collection&gt;(_ c: C) where C.Element: Numeric</code>, or
      <code>where T == U.Element</code> for equality between associated types. <b>where is how you constrain
      an associated type, not just the top-level generic parameter.</b></p>`,
    level: "senior",
  },
  {
    id: "gn4",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What is an associated type?",
    answerHtml: `<p>Associated types let a protocol stay abstract over "what element/storage type" without the
      protocol author committing to one — each conformer fills in its own. Mechanically: a placeholder declared
      inside the protocol (<code>associatedtype Element</code>, like <code>Collection.Element</code>). A protocol
      <i>with</i> associated types has "Self/associated-type requirements", so historically you couldn't use it as
      a plain type — you needed a generic constraint, <code>some</code>, or <code>any</code>.
      <b>Associated types are how a protocol says "I need a type here" without saying which one.</b></p>
      <p>Red flag: writing <code>[Collection]</code> and being surprised it doesn't compile — that's exactly the
      Self/associated-type limitation this card is about.</p>`,
    level: "senior",
  },
  {
    id: "gn5",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What are primary associated types (Swift 5.7)?",
    answerHtml: `<p>Before Swift 5.7, constraining a collection's element type meant a verbose <code>where</code>
      clause just to say "elements are Int" — primary associated types collapse that into the signature itself.
      Mechanically: <code>some Collection&lt;Int&gt;</code> or <code>any Sequence&lt;String&gt;</code>, declared on
      the protocol as <code>protocol Collection&lt;Element&gt;</code>. <b>Primary associated types turn a
      where-clause constraint into part of the type's spelling.</b></p>`,
    level: "architect",
  },
  {
    id: "gn6",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "some vs any — the deeper distinction?",
    answerHtml: `<p>The distinction is performance and identity, not just syntax: <code>some P</code> (opaque) is
      <b>one specific, fixed</b> underlying type the compiler knows at compile time, so it preserves type identity
      and can be specialized/inlined at near-zero cost. <code>any P</code> (existential) is a <b>box</b> that can
      hold different conforming types at runtime — flexible but adds indirection and may heap-allocate. <b>I default
      to some for performance and identity, and reach for any only when I actually need heterogeneous storage.</b></p>
      <p>Red flag: reaching for <code>any</code> out of habit "because it's more flexible" — that flexibility is
      paid for in indirection and lost specialization on every call.</p>`,
    level: "senior",
  },
  {
    id: "gn7",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What is type erasure and why do it?",
    answerHtml: `<p>Without type erasure, a protocol with associated types can't be stored heterogeneously — you
      need a common concrete wrapper so unrelated conforming types become interchangeable. Mechanically: hide the
      concrete/associated type behind a wrapper — <code>AnyView</code>, <code>AnyHashable</code>,
      <code>AnySequence</code> — built as an <code>AnyFoo</code> that forwards to a stored closure/box.
      <code>any P</code> now does this for you automatically in most cases; hand-rolled erasers remain useful for
      custom forwarding or pre-5.7 patterns. <b>Type erasure trades a known static type for the ability to
      store different conformers side by side.</b></p>`,
    level: "architect",
  },
  {
    id: "gn8",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What is conditional conformance?",
    answerHtml: `<p>Conditional conformance exists so a generic container doesn't have to promise a capability it
      can't deliver — <code>[Int]</code> can be Equatable, but a wrapper around a non-Equatable element genuinely
      can't be. Mechanically: <code>extension Array: Equatable where Element: Equatable</code> — the conformance
      only applies when the constraint holds. The stdlib uses it pervasively (<code>Optional</code>/<code>Array</code>
      become Codable/Hashable when their contents are). <b>Conditional conformance lets a generic type's
      capabilities scale with what its parameter can actually do.</b></p>`,
    level: "senior",
  },
  {
    id: "gn9",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "How do constrained extensions add behavior?",
    answerHtml: `<p>Constrained extensions let you add an API surface to a generic type without weakening the type
      for everyone — <code>sum()</code> only makes sense when addition is defined, so it should only exist there.
      Mechanically: <code>extension Stack where Element: Numeric { func sum() -&gt; Element { … } }</code> — the
      method exists on <code>Stack&lt;Int&gt;</code> but not <code>Stack&lt;String&gt;</code>. <b>Constrained
      extensions add capabilities exactly where the type parameter supports them, and nowhere else.</b></p>`,
    level: "senior",
  },
  {
    id: "gn10",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What's special about protocols with Self requirements?",
    answerHtml: `<p>A protocol with a <code>Self</code> requirement can't be boxed as a plain existential because
      the compiler can't know, at the call site, which concrete type "Self" refers to — so it has to be resolved
      generically instead. Protocols that reference <code>Self</code> (like <code>Equatable</code>, or a method
      returning <code>Self</code>) couldn't be used as a bare existential before Swift 5.7. You use them as
      <b>generic constraints</b> (<code>func f&lt;T: Equatable&gt;</code>) or, where appropriate,
      <code>some</code>/<code>any</code>. <b>This is exactly why you write <code>&lt;T: Equatable&gt;</code>
      instead of reaching for <code>[Equatable]</code>.</b></p>`,
    level: "architect",
  },
  {
    id: "gn11",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What are phantom types?",
    answerHtml: `<p>Phantom types push a whole class of bugs — passing a user ID where a product ID belongs — from
      runtime to compile time, for free, with no stored representation change. Mechanically: a generic parameter
      used only at <b>compile time</b> for tagging, storing no value but making otherwise-identical types distinct.
      Example: <code>Measurement&lt;Unit&gt;</code>, or a <code>Tagged&lt;User, Int&gt;</code> ID that can't be
      mixed up with a <code>Tagged&lt;Product, Int&gt;</code>. <b>Phantom types make a whole class of ID-mixup bugs
      a compile error instead of a runtime one.</b></p>`,
    level: "architect",
  },
  {
    id: "gn12",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What are parameter packs / variadic generics (Swift 5.9)?",
    answerHtml: `<p>Before parameter packs, supporting "any number of arguments generically" meant hand-writing N
      overloads (one for 2 types, one for 3, …) — packs let the compiler generate that family from a single
      declaration. Mechanically: a generic abstracts over an <b>arbitrary number of type parameters</b> using
      <code>each</code> (<code>(repeat each T)</code>). It's how APIs like SwiftUI's tuple-based
      <code>TupleView</code> / view builders and <code>zip</code>-style functions avoid N hand-written overloads.
      <b>Parameter packs replace a wall of arity overloads with one generic declaration.</b></p>`,
    level: "architect",
  },
  {
    id: "gn13",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What is generic specialization and why does it matter?",
    answerHtml: `<p>It matters because it's the reason "generic" doesn't mean "slow" in Swift — the abstraction is
      compiled away, not paid at runtime. Mechanically: the compiler can generate a <b>concrete, inlined</b>
      version of generic code for a specific type (especially with <code>@inlinable</code>/whole-module
      optimization), removing the abstraction cost. So generics are typically as fast as hand-written code —
      whereas <code>any</code> existentials keep dynamic dispatch. <b>In hot paths I reach for generics over
      existentials specifically because specialization removes the dispatch cost.</b></p>`,
    level: "architect",
  },
  {
    id: "gn14",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "How do protocol composition and multiple constraints combine?",
    answerHtml: `<p>Require several protocols at once with <code>&amp;</code>:
      <code>func f&lt;T: Codable &amp; Identifiable&gt;(_ x: T)</code> or a parameter of type
      <code>some Codable &amp; Identifiable</code>. Combine with <code>where</code> for associated-type
      constraints. This expresses "I need a value that is both X and Y" without inventing a new protocol.</p>`,
    level: "senior",
  },
  {
    id: "gn15",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What is the opaque-parameter shorthand?",
    answerHtml: `<p>It exists to cut boilerplate for the common case where you need one constrained parameter and
      never reference its type again — writing out <code>&lt;T: P&gt;</code> for that is pure ceremony.
      Mechanically: <code>func f(_ x: some P)</code> is sugar for <code>func f&lt;T: P&gt;(_ x: T)</code>. Switch
      to explicit <code>&lt;T&gt;</code> the moment you need to reference the type elsewhere in the signature — the
      shorthand can't express relationships between parameters. <b>Opaque-parameter shorthand is for one-off
      constraints; explicit generics are for when the type has to show up more than once.</b></p>`,
    level: "senior",
  },
  {
    id: "gn16",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What are common generics pitfalls?",
    answerHtml: `<p>Generics are a readability cost you pay to remove duplication — when there's no real duplication
      to remove, the abstraction is pure overhead for the next reader. The recurring pitfalls: <b>over-engineering</b>
      (a generic with one ever-used type — just use the concrete type), <b>over-constraining</b> (demanding more
      than the algorithm needs), and fighting the type checker with deeply nested constraints when a simple
      <b>protocol</b> or a <b>closure</b> parameter would be clearer. <b>I reach for generics to remove real
      duplication, never as a default for "might need it later."</b></p>
      <p>Red flag: introducing a generic parameter that's only ever instantiated with one concrete type — that's
      speculative abstraction, not reuse.</p>`,
    level: "senior",
  },
];

export const ADVANCED32_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED32_QUIZ: QuizQuestion[] = [
  {
    id: "gnz1",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "some P (opaque) differs from any P (existential) in that some P:",
    options: ["Holds any type at runtime", "Is one fixed underlying type, enabling specialization", "Always heap-allocates", "Can't be returned"],
    answer: 1,
    explanationHtml: `<p>Opaque types fix one concrete type the compiler knows (low/zero cost); existentials box
      a runtime-varying type with indirection. "Holds any type at runtime" is the tempting wrong answer because
      that's actually what <code>any P</code> does — swapping the two is the most common mix-up with this pair.</p>`,
  },
  {
    id: "gnz2",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "A protocol with an associatedtype historically couldn't be used as:",
    options: ["A generic constraint", "A bare existential type directly", "A return type via some", "An extension target"],
    answer: 1,
    explanationHtml: `<p>Self/associated-type requirements meant you used it as a generic constraint or via
      some/any — not as a plain type like <code>[Collection]</code>. "A generic constraint" is a trap answer here:
      that's a use it always <i>could</i> do, not the thing it historically couldn't.</p>`,
  },
  {
    id: "gnz3",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "some Collection<Int> (Swift 5.7) is enabled by:",
    options: ["Type erasure", "Primary associated types", "Phantom types", "@inlinable"],
    answer: 1,
    explanationHtml: `<p>Primary associated types let you constrain the element in angle brackets instead of a
      verbose where clause. Type erasure is the tempting wrong pick because it also touches associated types, but
      it solves a different problem — storing heterogeneous conformers — not constraining one.</p>`,
  },
  {
    id: "gnz4",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "Array is Equatable only when its Element is — this is:",
    options: ["Type erasure", "Conditional conformance", "A phantom type", "Specialization"],
    answer: 1,
    explanationHtml: `<p>Conditional conformance: <code>extension Array: Equatable where Element: Equatable</code>
      grants the conformance based on the generic parameter. Specialization is the tempting wrong pick because it's
      also a compiler behavior tied to generics, but it's about code generation for performance, not conformance.</p>`,
  },
  {
    id: "gnz5",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "A generic parameter used only for compile-time tagging (no stored value) is a:",
    options: ["Existential", "Phantom type", "Opaque type", "Associated type"],
    answer: 1,
    explanationHtml: `<p>Phantom types distinguish otherwise-identical types (e.g. a typed ID) so the compiler
      prevents mixing them up. "Existential" is the tempting wrong pick because both involve type parameters, but
      an existential stores a runtime value — a phantom type stores nothing, it's purely compile-time.</p>`,
  },
  {
    id: "gnz6",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "In a hot path, prefer generics over `any` existentials because generics:",
    options: ["Are easier to read", "Can be specialized/inlined (no dynamic dispatch)", "Use less code", "Avoid protocols"],
    answer: 1,
    explanationHtml: `<p>The compiler can generate concrete, inlined versions of generic code; existentials keep
      dynamic dispatch and boxing. "Easier to read" is the tempting wrong pick because it's often true, but it's not
      why they're faster — the performance win is specialization, not style.</p>`,
  },
];

export const ADVANCED32_STUDY: StudySection[] = [
  {
    id: "st-adv-71",
    num: "86",
    title: "86 · Generics, constraints & associated types",
    html: `<p><b>Why it matters.</b> Generics let you remove real duplication without giving up type safety or
      runtime speed — the compiler specializes generic code per call site, so "reusable" doesn't mean "slower."
      Generic functions/types take type parameters;
      <b>constraints</b> (<code>T: Comparable</code>, <code>T: A &amp; B</code>) unlock capabilities;
      <b>where clauses</b> express finer requirements, especially over <b>associated types</b>
      (<code>where C.Element: Numeric</code>). Protocols declare <code>associatedtype</code>s (like
      <code>Collection.Element</code>); <b>primary associated types</b> (Swift 5.7,
      <code>some Collection&lt;Int&gt;</code>) make constraining them ergonomic. <b>Conditional conformance</b>
      and <b>constrained extensions</b> add behavior exactly when the generic parameter qualifies.</p>
    <div class="callout tip"><span class="lbl">Say this</span> "Generics describe 'works for any type that can do
      X,' and the compiler specializes them to concrete, fast code — that's why the stdlib is built on them
      instead of type-erased containers."</div>`,
  },
  {
    id: "st-adv-72",
    num: "87",
    title: "87 · some vs any, type erasure & advanced features",
    html: `<p><b>Why it matters.</b> Choosing some vs any is a performance and identity decision, not a style
      preference — get it backwards and you pay for indirection you didn't need. <b>some</b> (opaque) fixes one underlying type
      for performance and identity; <b>any</b> (existential) boxes a runtime-varying type for heterogeneity at a
      cost — prefer <code>some</code>, reach for <code>any</code> when you need mixed types. <b>Type erasure</b>
      (<code>AnyView</code>, custom <code>AnyFoo</code>) hides associated types; <b>phantom types</b> tag values
      at compile time; <b>parameter packs</b> (5.9) abstract over arbitrary arity; and <b>specialization</b>
      makes generics as fast as concrete code.</p>
    <div class="callout warn"><span class="lbl">Say this</span> "I default to some for performance and type
      identity, and reach for any only when I need real heterogeneity — over-abstracting with generics I never
      vary is just as much of a smell as reaching for any out of habit."</div>`,
  },
];
