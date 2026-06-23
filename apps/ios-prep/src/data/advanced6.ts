// Advanced batch 6 — Swift macros & metaprogramming (senior/architect). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED6_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED6_FLASHCARDS: Flashcard[] = [
  {
    id: "g1",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What is a Swift macro?",
    answerHtml: `<p>Compile-time code generation. A macro takes your source as <b>syntax</b> (a SwiftSyntax tree)
      and produces more syntax that's spliced in before type-checking — so it's fully type-checked, has <b>no
      runtime cost</b>, and the expansion is visible/auditable in Xcode. Macros replaced much of what people used
      to do with runtime reflection or external codegen.</p>`,
    level: "senior",
  },
  {
    id: "g2",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "Freestanding vs attached macros?",
    answerHtml: `<p><b>Freestanding</b> macros are invoked with <code>#</code> and stand on their own —
      expressions (<code>#expect(...)</code>) or declarations. <b>Attached</b> macros use <code>@</code> and
      modify the declaration they're attached to (a type, property, function) — e.g. adding members or
      accessors. <code>@Observable</code> is attached; <code>#Preview</code> is freestanding.</p>`,
    level: "senior",
  },
  {
    id: "g3",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What does the @Observable macro actually generate?",
    answerHtml: `<p>It rewrites your class so each stored property's access is tracked: getters/setters call into
      the Observation runtime to register reads and notify on writes, plus conformance to
      <code>Observable</code>. You write a plain class; the macro adds the observation plumbing the old
      <code>@Published</code>/<code>ObservableObject</code> required by hand. <code>@Model</code> (SwiftData)
      similarly adds persistence backing.</p>`,
    level: "senior",
  },
  {
    id: "g4",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "How is a macro implemented and packaged?",
    answerHtml: `<p>As a <b>compiler plugin</b>: a separate SPM target depending on <b>swift-syntax</b> that
      implements a macro type (e.g. <code>MemberMacro</code>) by manipulating syntax nodes. A second target
      declares the public <code>macro</code> and points at that implementation. The plugin runs in the
      compiler's process during build — it never ships in your app binary.</p>`,
    level: "architect",
  },
  {
    id: "g5",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What are the attached-macro roles?",
    answerHtml: `<p><code>@attached(member)</code> adds members to a type, <code>peer</code> adds declarations
      alongside, <code>accessor</code> adds get/set to a property, <code>memberAttribute</code> applies
      attributes to members, and <code>extension</code> adds a conformance/extension. A macro can combine roles
      (e.g. <code>@Observable</code> uses member + memberAttribute + extension).</p>`,
    level: "architect",
  },
  {
    id: "g6",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "Why prefer macros over runtime reflection or codegen scripts?",
    answerHtml: `<p>Macros are <b>type-checked</b>, run at compile time (no runtime reflection cost or fragility),
      and the generated code is <b>visible and debuggable</b> (Expand Macro in Xcode). External codegen scripts
      drift from source and complicate the build; reflection (Mirror) is read-only and slow. Macros give
      compile-time guarantees with none of those downsides.</p>`,
    level: "senior",
  },
  {
    id: "g7",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "Name macros you already use from Apple's frameworks.",
    answerHtml: `<p><code>@Observable</code> and <code>@Model</code>, Swift Testing's <code>#expect</code> /
      <code>#require</code> / <code>@Test</code>, <code>#Preview</code> for SwiftUI previews, and
      <code>#Predicate</code> for type-safe SwiftData/Foundation queries. Recognizing these as macros explains
      why they feel "magic" yet stay fully typed.</p>`,
    level: "mid",
  },
  {
    id: "g8",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What are the limits of macros?",
    answerHtml: `<p>They operate only on the <b>syntax</b> they're given — no access to other files, the type
      checker's results, or runtime state. They can't change code elsewhere, and must be hygienic (not
      accidentally capture/clobber names). Expansions are deterministic and visible. For cross-cutting runtime
      behavior you still need protocols, generics, or the Observation runtime.</p>`,
    level: "architect",
  },
  {
    id: "g9",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What is Mirror (reflection) good and bad for?",
    answerHtml: `<p><code>Mirror</code> gives <b>read-only</b> runtime introspection of a value's children
      (labels + values) — handy for debugging, generic logging, or ad-hoc serialization. It's <b>slow</b>, can't
      mutate, and loses type information, so it's a last resort. Prefer <code>Codable</code> for serialization
      and macros/generics for structured needs.</p>`,
    level: "senior",
  },
  {
    id: "g10",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What are KeyPaths and where do they show up?",
    answerHtml: `<p>A <b>KeyPath</b> is a type-safe, reusable reference to a property:
      <code>\\Type.property</code> (or <code>\\.property</code> in context). They let APIs accept "which property"
      as a value — e.g. SwiftData's <code>@Query(sort: \\Task.title)</code>, SwiftUI's <code>id: \\.self</code>,
      and <code>map(\\.name)</code>. <code>WritableKeyPath</code> allows setting too.</p>`,
    level: "mid",
  },
  {
    id: "g11",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What does @dynamicMemberLookup enable?",
    answerHtml: `<p>It lets a type resolve <code>value.anything</code> at compile time through a
      <code>subscript(dynamicMember:)</code> — useful for typed wrappers over loosely-typed data (JSON, config) or
      for forwarding to a wrapped value while keeping dot syntax. Pair it with KeyPaths for a type-safe variant.</p>`,
    level: "senior",
  },
  {
    id: "g12",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What is a result builder, beyond @ViewBuilder?",
    answerHtml: `<p>A general DSL feature: implement <code>buildBlock</code>, <code>buildExpression</code>,
      <code>buildOptional</code>, <code>buildEither</code>, <code>buildArray</code>, and
      <code>buildLimitedAvailability</code> to turn a sequence of statements into one value. SwiftUI's
      <code>@ViewBuilder</code>, RegexBuilder, and many testing/DSL libraries are result builders — you can write
      your own for HTML, queries, etc.</p>`,
    level: "architect",
  },
  {
    id: "g13",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "How do property wrappers work internally?",
    answerHtml: `<p>A property wrapper is a type with a <code>wrappedValue</code> (and optional
      <code>projectedValue</code> exposed via <code>$</code>). The compiler rewrites a wrapped property into a
      stored instance of the wrapper plus computed access. SwiftUI's <code>@State</code>, <code>@Binding</code>,
      and <code>@Environment</code> are property wrappers; <code>$value</code> gives you the projected value
      (e.g. a <code>Binding</code>).</p>`,
    level: "senior",
  },
  {
    id: "g14",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "How is Codable conformance synthesized, and how do you customize it?",
    answerHtml: `<p>The compiler auto-generates <code>CodingKeys</code> and the
      <code>encode(to:)</code>/<code>init(from:)</code> methods when all members are Codable — compile-time
      metaprogramming you get for free. Customize by writing a <code>CodingKeys</code> enum (rename/skip keys) or
      implementing the methods yourself for non-trivial shapes.</p>`,
    level: "mid",
  },
  {
    id: "g15",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "Reflection vs macros vs generics — how do you choose?",
    answerHtml: `<p><b>Generics</b> for type-safe reuse at zero cost (default). <b>Macros</b> to eliminate
      boilerplate with compile-time guarantees and visible output. <b>Reflection (Mirror)</b> only for read-only,
      dynamic, debug-ish needs where the type isn't known statically. As a rule: reach for reflection last.</p>`,
    level: "architect",
  },
  {
    id: "g16",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What is #Predicate and why is it notable?",
    answerHtml: `<p>A macro that turns a Swift closure into a type-safe, introspectable <code>Predicate</code>
      that SwiftData/Foundation can translate into a query (e.g. SQL-like fetches). You write normal Swift
      (<code>#Predicate&lt;Task&gt; { $0.isDone == false }</code>) and the macro produces something the storage
      layer can analyze — metaprogramming bridging Swift and the data store.</p>`,
    level: "senior",
  },
];

export const ADVANCED6_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED6_QUIZ: QuizQuestion[] = [
  {
    id: "gz1",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "Swift macros run:",
    options: ["At runtime via reflection", "At compile time on the syntax tree", "Only in tests", "On the server"],
    answer: 1,
    explanationHtml: `<p>Macros transform SwiftSyntax at compile time before type-checking — no runtime cost,
      and the expansion is visible in Xcode.</p>`,
  },
  {
    id: "gz2",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "@Observable and #Preview are, respectively:",
    options: ["Both freestanding", "Attached and freestanding macros", "Both attached", "Property wrappers"],
    answer: 1,
    explanationHtml: `<p><code>@</code> = attached (modifies the declaration); <code>#</code> = freestanding
      (stands alone). So <code>@Observable</code> is attached, <code>#Preview</code> is freestanding.</p>`,
  },
  {
    id: "gz3",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "A macro implementation depends on:",
    options: ["UIKit", "swift-syntax, in a separate compiler-plugin target", "the app's main target", "Foundation only"],
    answer: 1,
    explanationHtml: `<p>Macros are compiler plugins built on swift-syntax in their own SPM target; they run
      during build and never ship in the app binary.</p>`,
  },
  {
    id: "gz4",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "A type-safe reference to a property like \\Type.name is a:",
    options: ["Selector", "KeyPath", "Mirror", "Macro"],
    answer: 1,
    explanationHtml: `<p>KeyPaths reference properties as values; APIs like <code>@Query(sort:)</code> and
      <code>map(\\.name)</code> consume them.</p>`,
  },
  {
    id: "gz5",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "Mirror (reflection) is best described as:",
    options: ["Fast and writable", "Read-only runtime introspection, best used sparingly", "A macro", "A property wrapper"],
    answer: 1,
    explanationHtml: `<p>Mirror reads children at runtime but can't mutate and is slow — a last resort behind
      generics, Codable, and macros.</p>`,
  },
  {
    id: "gz6",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "The $ prefix on a property wrapper gives you its:",
    options: ["wrappedValue", "projectedValue", "memory address", "KeyPath"],
    answer: 1,
    explanationHtml: `<p><code>$value</code> exposes the wrapper's <code>projectedValue</code> — e.g.
      <code>$state</code> yields a <code>Binding</code> in SwiftUI.</p>`,
  },
];

export const ADVANCED6_STUDY: StudySection[] = [
  {
    id: "st-adv-18",
    num: "33",
    title: "33 · Swift macros: how they work & when to write one",
    html: `<p><b>What it is.</b> Compile-time code generation over the <b>syntax tree</b> (SwiftSyntax). A macro
      receives your code as syntax and returns more syntax, spliced in before type-checking — fully typed, zero
      runtime cost, and inspectable via Expand Macro. Two shapes: <b>freestanding</b> (<code>#foo</code>) and
      <b>attached</b> (<code>@Foo</code>), with roles like <code>member</code>, <code>peer</code>,
      <code>accessor</code>, and <code>extension</code>.</p>
    <p>You implement one as a <b>compiler plugin</b>: an SPM target on swift-syntax that manipulates nodes, plus a
      target declaring the public <code>macro</code>. Apple's own <code>@Observable</code>, <code>@Model</code>,
      <code>#Predicate</code>, and Swift Testing's <code>#expect</code> are macros.</p>
    <div class="callout tip"><span class="lbl">When to write one</span> To kill repetitive boilerplate with
      compile-time guarantees and visible output — not for cross-file or runtime behavior (macros only see the
      syntax handed to them). Reach for it after generics and protocols, before codegen scripts or reflection.</div>`,
  },
  {
    id: "st-adv-19",
    num: "34",
    title: "34 · Metaprogramming toolbox: KeyPaths, reflection, builders, wrappers",
    html: `<p><b>What it is.</b> The language features that let code talk about code. <b>KeyPaths</b>
      (<code>\\Type.property</code>) are type-safe property references that power
      <code>@Query(sort: \\Task.title)</code>, <code>id: \\.self</code>, and <code>map(\\.name)</code>.
      <b>Property wrappers</b> (<code>wrappedValue</code> + <code>$projectedValue</code>) underlie
      <code>@State</code>/<code>@Binding</code>. <b>Result builders</b> generalize <code>@ViewBuilder</code> into
      any DSL. <b>@dynamicMemberLookup</b> gives dot-access over dynamic data.</p>
    <p><b>Reflection</b> (<code>Mirror</code>) is the runtime, read-only escape hatch — slow and type-erased, so
      it's a last resort. The modern trend is to move metaprogramming from runtime reflection to <b>compile-time
      macros</b> wherever possible.</p>
    <div class="callout warn"><span class="lbl">Heuristic</span> Generics for reuse → macros for boilerplate →
      reflection only when the type genuinely isn't known until runtime.</div>`,
  },
];
