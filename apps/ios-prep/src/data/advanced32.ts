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
    answerHtml: `<p>Reuse with <b>type safety and zero overhead</b>: a generic function/type works over a type
      parameter (<code>func first&lt;T&gt;(_ xs: [T]) -&gt; T?</code>, <code>struct Stack&lt;Element&gt;</code>)
      while the compiler keeps full type information and can specialize. It's how <code>Array</code>,
      <code>Optional</code>, and most of the stdlib are built.</p>`,
    level: "senior",
  },
  {
    id: "gn2",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What are generic constraints?",
    answerHtml: `<p>Requirements a type parameter must satisfy: <code>func max&lt;T: Comparable&gt;(...)</code>
      means "T must be Comparable", unlocking <code>&lt;</code> inside. Constraints can be protocols
      (<code>T: Collection</code>), classes, or compositions (<code>T: A &amp; B</code>) — they let generic code
      use capabilities while staying generic.</p>`,
    level: "senior",
  },
  {
    id: "gn3",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What do where clauses add?",
    answerHtml: `<p>Finer constraints, especially on <b>associated types</b> and relationships:
      <code>func f&lt;C: Collection&gt;(_ c: C) where C.Element: Numeric</code>, or
      <code>where T == U.Element</code>. They express requirements the simple <code>:</code> syntax can't,
      including equality between associated types.</p>`,
    level: "senior",
  },
  {
    id: "gn4",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What is an associated type?",
    answerHtml: `<p>A placeholder type inside a protocol (<code>associatedtype Element</code>, like
      <code>Collection.Element</code>) that conforming types fill in. A protocol <i>with</i> associated types has
      "Self/associated-type requirements", so historically you couldn't use it as a plain type — you needed a
      generic constraint, <code>some</code>, or <code>any</code>.</p>`,
    level: "senior",
  },
  {
    id: "gn5",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What are primary associated types (Swift 5.7)?",
    answerHtml: `<p>They let you name a protocol's key associated type in angle brackets:
      <code>some Collection&lt;Int&gt;</code> or <code>any Sequence&lt;String&gt;</code> — constraining the
      element without a verbose <code>where</code> clause. Declared as
      <code>protocol Collection&lt;Element&gt;</code>. Much more ergonomic generic signatures.</p>`,
    level: "architect",
  },
  {
    id: "gn6",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "some vs any — the deeper distinction?",
    answerHtml: `<p><code>some P</code> (opaque) = <b>one specific, fixed</b> underlying type the compiler knows
      — preserves type identity and allows specialization (zero/low cost). <code>any P</code> (existential) = a
      <b>box</b> that can hold different conforming types at runtime — flexible but adds indirection (and may
      heap-allocate). Use <code>some</code> by default; <code>any</code> when you truly need heterogeneity.</p>`,
    level: "senior",
  },
  {
    id: "gn7",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What is type erasure and why do it?",
    answerHtml: `<p>Hiding a concrete/associated type behind a wrapper so values become interchangeable —
      e.g. <code>AnyView</code>, <code>AnyHashable</code>, <code>AnySequence</code>. You build an
      <code>AnyFoo</code> that forwards to a stored closure/box. Often <code>any P</code> now does this for you;
      hand-rolled erasers remain useful for custom forwarding or older patterns.</p>`,
    level: "architect",
  },
  {
    id: "gn8",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What is conditional conformance?",
    answerHtml: `<p>A type conforms to a protocol <i>only when</i> its generic parameter does:
      <code>extension Array: Equatable where Element: Equatable</code>. So <code>[Int]</code> is Equatable but
      <code>[SomeNonEquatable]</code> isn't. The stdlib uses it pervasively
      (<code>Optional</code>/<code>Array</code> become Codable/Hashable when their contents are).</p>`,
    level: "senior",
  },
  {
    id: "gn9",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "How do constrained extensions add behavior?",
    answerHtml: `<p>A <code>where</code>-constrained extension adds methods only for qualifying generics:
      <code>extension Stack where Element: Numeric { func sum() -&gt; Element { … } }</code>. <code>sum()</code>
      exists on <code>Stack&lt;Int&gt;</code> but not <code>Stack&lt;String&gt;</code> — capabilities that appear
      exactly when the element supports them.</p>`,
    level: "senior",
  },
  {
    id: "gn10",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What's special about protocols with Self requirements?",
    answerHtml: `<p>Protocols that reference <code>Self</code> (like <code>Equatable</code>, or a method
      returning <code>Self</code>) couldn't be used as a bare existential before Swift 5.7. You use them as
      <b>generic constraints</b> (<code>func f&lt;T: Equatable&gt;</code>) or, where appropriate,
      <code>some</code>/<code>any</code>. This is why you write generics rather than
      <code>[Equatable]</code>.</p>`,
    level: "architect",
  },
  {
    id: "gn11",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What are phantom types?",
    answerHtml: `<p>A generic parameter that's used only at <b>compile time</b> for tagging — it stores no value
      but makes otherwise-identical types distinct. Example: <code>Measurement&lt;Unit&gt;</code>, or a
      <code>Tagged&lt;User, Int&gt;</code> ID that can't be mixed up with a <code>Tagged&lt;Product, Int&gt;</code>.
      The compiler prevents passing the wrong "kind" of value even though both wrap an <code>Int</code>.</p>`,
    level: "architect",
  },
  {
    id: "gn12",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What are parameter packs / variadic generics (Swift 5.9)?",
    answerHtml: `<p>They let a generic abstract over an <b>arbitrary number of type parameters</b> — e.g. a
      function or type generic over <code>each</code> of several types (<code>(repeat each T)</code>). It's how
      APIs like SwiftUI's tuple-based <code>TupleView</code> / view builders and <code>zip</code>-style functions
      can be written generically instead of N hand-written overloads.</p>`,
    level: "architect",
  },
  {
    id: "gn13",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What is generic specialization and why does it matter?",
    answerHtml: `<p>The compiler can generate a <b>concrete, inlined</b> version of generic code for a specific
      type (especially with <code>@inlinable</code>/whole-module optimization), removing the abstraction cost. So
      generics are typically as fast as hand-written code — whereas <code>any</code> existentials keep dynamic
      dispatch. In hot paths, prefer generics over existentials.</p>`,
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
    answerHtml: `<p><code>func f(_ x: some P)</code> is sugar for <code>func f&lt;T: P&gt;(_ x: T)</code> — a
      lightweight way to write a generic when you don't need to name the type or relate it to others. For one-off
      constraints it's the cleanest spelling; switch to explicit <code>&lt;T&gt;</code> when you must reference
      the type elsewhere in the signature.</p>`,
    level: "senior",
  },
  {
    id: "gn16",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What are common generics pitfalls?",
    answerHtml: `<p><b>Over-engineering</b> (a generic with one ever-used type — just use the concrete type),
      <b>over-constraining</b> (demanding more than the algorithm needs), and fighting the type checker with deeply
      nested constraints when a simple <b>protocol</b> or a <b>closure</b> parameter would be clearer. Reach for
      generics to remove real duplication, not for their own sake.</p>`,
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
      a runtime-varying type with indirection.</p>`,
  },
  {
    id: "gnz2",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "A protocol with an associatedtype historically couldn't be used as:",
    options: ["A generic constraint", "A bare existential type directly", "A return type via some", "An extension target"],
    answer: 1,
    explanationHtml: `<p>Self/associated-type requirements meant you used it as a generic constraint or via
      some/any — not as a plain type like <code>[Collection]</code>.</p>`,
  },
  {
    id: "gnz3",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "some Collection<Int> (Swift 5.7) is enabled by:",
    options: ["Type erasure", "Primary associated types", "Phantom types", "@inlinable"],
    answer: 1,
    explanationHtml: `<p>Primary associated types let you constrain the element in angle brackets instead of a
      verbose where clause.</p>`,
  },
  {
    id: "gnz4",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "Array is Equatable only when its Element is — this is:",
    options: ["Type erasure", "Conditional conformance", "A phantom type", "Specialization"],
    answer: 1,
    explanationHtml: `<p>Conditional conformance: <code>extension Array: Equatable where Element: Equatable</code>
      grants the conformance based on the generic parameter.</p>`,
  },
  {
    id: "gnz5",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "A generic parameter used only for compile-time tagging (no stored value) is a:",
    options: ["Existential", "Phantom type", "Opaque type", "Associated type"],
    answer: 1,
    explanationHtml: `<p>Phantom types distinguish otherwise-identical types (e.g. a typed ID) so the compiler
      prevents mixing them up.</p>`,
  },
  {
    id: "gnz6",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "In a hot path, prefer generics over `any` existentials because generics:",
    options: ["Are easier to read", "Can be specialized/inlined (no dynamic dispatch)", "Use less code", "Avoid protocols"],
    answer: 1,
    explanationHtml: `<p>The compiler can generate concrete, inlined versions of generic code; existentials keep
      dynamic dispatch and boxing.</p>`,
  },
];

export const ADVANCED32_STUDY: StudySection[] = [
  {
    id: "st-adv-71",
    num: "86",
    title: "86 · Generics, constraints & associated types",
    html: `<p><b>What it is.</b> Type-safe, zero-overhead reuse. Generic functions/types take type parameters;
      <b>constraints</b> (<code>T: Comparable</code>, <code>T: A &amp; B</code>) unlock capabilities;
      <b>where clauses</b> express finer requirements, especially over <b>associated types</b>
      (<code>where C.Element: Numeric</code>). Protocols declare <code>associatedtype</code>s (like
      <code>Collection.Element</code>); <b>primary associated types</b> (Swift 5.7,
      <code>some Collection&lt;Int&gt;</code>) make constraining them ergonomic. <b>Conditional conformance</b>
      and <b>constrained extensions</b> add behavior exactly when the generic parameter qualifies.</p>
    <div class="callout tip"><span class="lbl">Mental model</span> Generics describe "works for any type that can
      do X" — and the compiler specializes them to concrete, fast code.</div>`,
  },
  {
    id: "st-adv-72",
    num: "87",
    title: "87 · some vs any, type erasure & advanced features",
    html: `<p><b>What it is.</b> The modern type-system toolkit. <b>some</b> (opaque) fixes one underlying type
      for performance and identity; <b>any</b> (existential) boxes a runtime-varying type for heterogeneity at a
      cost — prefer <code>some</code>, reach for <code>any</code> when you need mixed types. <b>Type erasure</b>
      (<code>AnyView</code>, custom <code>AnyFoo</code>) hides associated types; <b>phantom types</b> tag values
      at compile time; <b>parameter packs</b> (5.9) abstract over arbitrary arity; and <b>specialization</b>
      makes generics as fast as concrete code.</p>
    <div class="callout warn"><span class="lbl">Restraint</span> Don't over-abstract — a generic with one forever
      type, or constraints beyond what the algorithm needs, is harder to read than the concrete version. Use
      generics to remove real duplication.</div>`,
  },
];
