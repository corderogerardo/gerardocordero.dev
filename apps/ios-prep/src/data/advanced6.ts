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
    answerHtml: `<p>Macros exist so you stop hand-writing boilerplate that used to require runtime reflection or an
      external codegen step — the compiler expands a macro's <b>syntax</b> (a SwiftSyntax tree) into more syntax
      before type-checking, so the result is fully type-checked, has <b>no runtime cost</b>, and the expansion is
      visible/auditable in Xcode (Expand Macro). <b>I think of macros as compile-time codegen with the compiler's
      blessing — same boilerplate reduction as reflection or external scripts, none of the runtime cost or
      fragility.</b></p>`,
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
      accessors. <code>@Observable</code> is attached; <code>#Preview</code> is freestanding. <b>Rule of thumb:
      # stands alone, @ attaches to and changes something.</b></p>`,
    level: "senior",
  },
  {
    id: "g3",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What does the @Observable macro actually generate?",
    answerHtml: `<p>@Observable exists to kill the <code>@Published</code>/<code>ObservableObject</code>
      boilerplate while keeping SwiftUI updates granular — it rewrites your class so each stored property's
      access is tracked: synthesized getters/setters call into the Observation runtime to register reads and
      notify on writes, plus conformance to <code>Observable</code>. You write a plain class; the macro adds the
      observation plumbing you used to write by hand. <code>@Model</code> (SwiftData) similarly adds persistence
      backing. Red flag: saying you still need <code>@Published</code> inside an <code>@Observable</code> class —
      that's the old pattern; @Observable already tracks every stored property automatically. <b>@Observable
      gives me property-level SwiftUI updates for free — no @Published, no manual conformance.</b></p>`,
    level: "senior",
  },
  {
    id: "g4",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "How is a macro implemented and packaged?",
    answerHtml: `<p>Macros ship as a <b>compiler plugin</b> so the expansion logic never bloats your app binary or
      runs on-device: a separate SPM target depending on <b>swift-syntax</b> implements a macro type (e.g.
      <code>MemberMacro</code>) by manipulating syntax nodes, and a second target declares the public
      <code>macro</code> that points at it. The plugin runs in the compiler's process during build only. <b>Macros
      are a build-time dependency, not a runtime one — nothing in the plugin target ships to users.</b></p>`,
    level: "architect",
  },
  {
    id: "g5",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What are the attached-macro roles?",
    answerHtml: `<p>Each attached-macro role exists for a different kind of edit, so you reach for the narrowest
      one that does the job: <code>@attached(member)</code> adds members to a type, <code>peer</code> adds a
      sibling declaration, <code>accessor</code> adds get/set to a property, <code>memberAttribute</code> applies
      attributes to members, and <code>extension</code> adds a conformance/extension. A macro can combine roles
      (e.g. <code>@Observable</code> uses member + memberAttribute + extension together). <b>Pick the narrowest
      role that produces the code you need — combining roles is for macros that genuinely touch a type from
      multiple angles.</b></p>`,
    level: "architect",
  },
  {
    id: "g6",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "Why prefer macros over runtime reflection or codegen scripts?",
    answerHtml: `<p>Macros win because they're <b>type-checked</b> at compile time — no runtime reflection cost or
      fragility — and the generated code is <b>visible and debuggable</b> (Expand Macro in Xcode). External
      codegen scripts drift from source and complicate the build; reflection (Mirror) is read-only and slow. Red
      flag: reaching for a codegen script or Mirror-based solution before considering a macro — both give up
      compile-time guarantees a macro keeps. <b>Macros get you the boilerplate reduction of codegen with the
      safety of the type checker — that's the trade nothing else makes.</b></p>`,
    level: "senior",
  },
  {
    id: "g7",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "Name macros you already use from Apple's frameworks.",
    answerHtml: `<p>Recognizing built-in "magic" as macros explains why it stays fully typed instead of relying on
      runtime tricks: <code>@Observable</code> and <code>@Model</code>, Swift Testing's <code>#expect</code> /
      <code>#require</code> / <code>@Test</code>, <code>#Preview</code> for SwiftUI previews, and
      <code>#Predicate</code> for type-safe SwiftData/Foundation queries. <b>Apple's own APIs already prove
      macros scale to production — @Observable and #Predicate aren't demos, they're what SwiftData ships
      with.</b></p>`,
    level: "mid",
  },
  {
    id: "g8",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What are the limits of macros?",
    answerHtml: `<p>Macros only see the <b>syntax</b> they're handed — no access to other files, the type checker's
      results, or runtime state — so they can't reach across your codebase or react to what happens at runtime,
      and must stay hygienic (never accidentally capture or clobber names). Expansions are deterministic and
      visible. Red flag: pitching a macro as a fix for cross-file or runtime behavior — that's still a job for
      protocols, generics, or the Observation runtime. <b>A macro only ever transforms the syntax in front of
      it — for anything cross-cutting or runtime-driven, reach for protocols and generics instead.</b></p>`,
    level: "architect",
  },
  {
    id: "g9",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What is Mirror (reflection) good and bad for?",
    answerHtml: `<p>Mirror exists for the one case nothing else covers — introspecting a value's shape when the
      type isn't known until runtime — but it's a last resort, not a default: <code>Mirror</code> gives
      <b>read-only</b> runtime introspection of a value's children (labels + values), handy for debugging,
      generic logging, or ad-hoc serialization. It's <b>slow</b>, can't mutate, and loses type information. Red
      flag: reaching for Mirror to implement serialization — <code>Codable</code> is faster, type-safe, and does
      the job Mirror can only approximate. <b>Mirror is for read-only debugging and last-resort introspection —
      Codable and macros handle the structured cases.</b></p>`,
    level: "senior",
  },
  {
    id: "g10",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What are KeyPaths and where do they show up?",
    answerHtml: `<p>KeyPaths exist so APIs can accept "which property" as a type-safe value instead of a string or
      selector: a <b>KeyPath</b> is a reusable reference to a property — <code>\\Type.property</code> (or
      <code>\\.property</code> in context). They show up wherever an API needs "which property" as a value —
      SwiftData's <code>@Query(sort: \\Task.title)</code>, SwiftUI's <code>id: \\.self</code>, and
      <code>map(\\.name)</code>. <code>WritableKeyPath</code> allows setting too. <b>KeyPaths let me pass "the
      property itself" around as a value — type-safe, no stringly-typed selectors.</b></p>`,
    level: "mid",
  },
  {
    id: "g11",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What does @dynamicMemberLookup enable?",
    answerHtml: `<p>@dynamicMemberLookup exists to keep dot syntax working over data whose shape the compiler can't
      see up front — it lets a type resolve <code>value.anything</code> at compile time through a
      <code>subscript(dynamicMember:)</code>, useful for typed wrappers over loosely-typed data (JSON, config) or
      for forwarding to a wrapped value while keeping dot syntax. Pair it with KeyPaths for a type-safe variant
      instead of stringly-typed member names. <b>I reach for @dynamicMemberLookup when I want dot syntax over
      data the compiler can't statically type — pairing it with KeyPaths keeps it safe.</b></p>`,
    level: "senior",
  },
  {
    id: "g12",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What is a result builder, beyond @ViewBuilder?",
    answerHtml: `<p>Result builders exist so a sequence of statements can be turned into one value without the
      caller writing an array/reduce by hand — implement <code>buildBlock</code>, <code>buildExpression</code>,
      <code>buildOptional</code>, <code>buildEither</code>, <code>buildArray</code>, and
      <code>buildLimitedAvailability</code> to define the DSL's rules. SwiftUI's <code>@ViewBuilder</code>,
      RegexBuilder, and many testing/DSL libraries are result builders — the same mechanism is available for your
      own DSLs (HTML, queries, etc.). <b>@ViewBuilder isn't SwiftUI magic — it's one instance of the general
      result-builder feature, and I can write my own.</b></p>`,
    level: "architect",
  },
  {
    id: "g13",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "How do property wrappers work internally?",
    answerHtml: `<p>Property wrappers exist to package "storage + access behavior" into a reusable type instead of
      repeating boilerplate on every property — a wrapper is a type with a <code>wrappedValue</code> (and
      optional <code>projectedValue</code> exposed via <code>$</code>), and the compiler rewrites a wrapped
      property into a stored instance of the wrapper plus computed access. SwiftUI's <code>@State</code>,
      <code>@Binding</code>, and <code>@Environment</code> are property wrappers; <code>$value</code> gives you
      the projected value (e.g. a <code>Binding</code>). <b>A property wrapper is just a type with wrappedValue —
      the compiler does the rewriting, the wrapper does the behavior.</b></p>`,
    level: "senior",
  },
  {
    id: "g14",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "How is Codable conformance synthesized, and how do you customize it?",
    answerHtml: `<p>Codable synthesis exists so the common case — every member is already Codable — costs zero
      code: the compiler auto-generates <code>CodingKeys</code> and the <code>encode(to:)</code>/<code>init(from:)</code>
      methods for free. Customize by writing a <code>CodingKeys</code> enum (rename/skip keys) or implementing
      the methods yourself for non-trivial shapes. Red flag: expecting synthesis to still work once one member
      isn't Codable — it just fails to compile, and you write the methods by hand from that point. <b>Synthesis
      is free until a member breaks Codable — then I write CodingKeys or the methods myself, not fight the
      compiler.</b></p>`,
    level: "mid",
  },
  {
    id: "g15",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "Reflection vs macros vs generics — how do you choose?",
    answerHtml: `<p>Order the decision by cost, cheapest first: <b>1. Generics</b> for type-safe reuse at zero
      runtime cost — the default. <b>2. Macros</b> to eliminate boilerplate with compile-time guarantees and
      visible expansion, when generics alone can't remove the repetition. <b>3. Reflection (Mirror)</b> only for
      read-only, dynamic, debug-ish needs where the type genuinely isn't known statically — the last resort.
      <b>I reach for reflection last, not first — generics and macros both keep the compiler in the loop; Mirror
      gives that up.</b></p>`,
    level: "architect",
  },
  {
    id: "g16",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "What is #Predicate and why is it notable?",
    answerHtml: `<p>#Predicate exists to give SwiftData/Foundation a query it can analyze and translate (e.g. into
      a SQL-like fetch) without you hand-writing a query string — it's a macro that turns a Swift closure into a
      type-safe, introspectable <code>Predicate</code>. You write normal Swift
      (<code>#Predicate&lt;Task&gt; { $0.isDone == false }</code>) and the macro produces something the storage
      layer can analyze. <b>#Predicate lets me write a normal Swift closure and still get a query the store can
      optimize — no hand-rolled query strings.</b></p>`,
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
    explanationHtml: `<p>Macros transform SwiftSyntax at compile time, before type-checking — no runtime cost,
      and the expansion is visible in Xcode. The tempting wrong answer, "at runtime via reflection," describes
      Mirror, not macros — Mirror is a separate, read-only, slower feature.</p>`,
  },
  {
    id: "gz2",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "@Observable and #Preview are, respectively:",
    options: ["Both freestanding", "Attached and freestanding macros", "Both attached", "Property wrappers"],
    answer: 1,
    explanationHtml: `<p><code>@</code> = attached (modifies the declaration); <code>#</code> = freestanding
      (stands alone). So <code>@Observable</code> is attached and <code>#Preview</code> is freestanding — the
      sigil alone tells you which. "Both attached" or "both freestanding" ignores that the sigil, not the
      framework, decides the category.</p>`,
  },
  {
    id: "gz3",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "A macro implementation depends on:",
    options: ["UIKit", "swift-syntax, in a separate compiler-plugin target", "the app's main target", "Foundation only"],
    answer: 1,
    explanationHtml: `<p>Macros are compiler plugins built on swift-syntax in their own SPM target; they run
      during build and never ship in the app binary. "The app's main target" is the tempting wrong answer because
      it assumes macro code ships to users — it doesn't, only the expanded syntax it produces ends up in your
      compiled code.</p>`,
  },
  {
    id: "gz4",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "A type-safe reference to a property like \\Type.name is a:",
    options: ["Selector", "KeyPath", "Mirror", "Macro"],
    answer: 1,
    explanationHtml: `<p>KeyPaths reference properties as type-safe values; APIs like <code>@Query(sort:)</code>
      and <code>map(\\.name)</code> consume them. "Selector" is the tempting wrong answer because it's the
      Objective-C runtime's stringly-typed equivalent — a KeyPath is compile-time checked and carries type
      information a Selector doesn't.</p>`,
  },
  {
    id: "gz5",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "Mirror (reflection) is best described as:",
    options: ["Fast and writable", "Read-only runtime introspection, best used sparingly", "A macro", "A property wrapper"],
    answer: 1,
    explanationHtml: `<p>Mirror reads children at runtime but can't mutate and is slow — a last resort behind
      generics, Codable, and macros. "Fast and writable" is the misconception: Mirror trades away both speed and
      mutation for the ability to introspect a type it doesn't know statically.</p>`,
  },
  {
    id: "gz6",
    category: "swift",
    categoryLabel: "Swift Language",
    question: "The $ prefix on a property wrapper gives you its:",
    options: ["wrappedValue", "projectedValue", "memory address", "KeyPath"],
    answer: 1,
    explanationHtml: `<p><code>$value</code> exposes the wrapper's <code>projectedValue</code> — e.g.
      <code>$state</code> yields a <code>Binding</code> in SwiftUI. <code>wrappedValue</code> is the tempting
      wrong answer because that's what plain <code>value</code> already gives you without the <code>$</code> —
      the prefix specifically switches you to the projected value, not the wrapped one.</p>`,
  },
];

export const ADVANCED6_STUDY: StudySection[] = [
  {
    id: "st-adv-18",
    num: "33",
    title: "33 · Swift macros: how they work & when to write one",
    html: `<p><b>Why it exists.</b> Macros exist so boilerplate that used to require runtime reflection or an
      external codegen script can be generated at <b>compile time</b> instead — over the <b>syntax tree</b>
      (SwiftSyntax). A macro receives your code as syntax and returns more syntax, spliced in before
      type-checking — fully typed, zero runtime cost, and inspectable via Expand Macro. Two shapes:
      <b>freestanding</b> (<code>#foo</code>) and <b>attached</b> (<code>@Foo</code>), with roles like
      <code>member</code>, <code>peer</code>, <code>accessor</code>, and <code>extension</code>.</p>
    <p>You implement one as a <b>compiler plugin</b>: an SPM target on swift-syntax that manipulates nodes, plus a
      target declaring the public <code>macro</code> — the plugin runs only during build, never in the shipped
      app. Apple's own <code>@Observable</code>, <code>@Model</code>, <code>#Predicate</code>, and Swift
      Testing's <code>#expect</code> are macros.</p>
    <div class="callout tip"><span class="lbl">When to write one</span> To kill repetitive boilerplate with
      compile-time guarantees and visible output — not for cross-file or runtime behavior (macros only see the
      syntax handed to them). Reach for it after generics and protocols, before codegen scripts or reflection.</div>
    <p><b>Say this:</b> "Macros give me codegen with the compiler's guarantees — type-checked, zero runtime cost,
      and the expansion is visible in Xcode."</p>`,
  },
  {
    id: "st-adv-19",
    num: "34",
    title: "34 · Metaprogramming toolbox: KeyPaths, reflection, builders, wrappers",
    html: `<p><b>Why it matters.</b> Swift gives you several ways for code to talk about code, each trading away a
      different amount of the compiler's guarantees — knowing which one costs the least for a given job is what
      separates a senior answer from a name-drop. <b>KeyPaths</b> (<code>\\Type.property</code>) are type-safe
      property references that power <code>@Query(sort: \\Task.title)</code>, <code>id: \\.self</code>, and
      <code>map(\\.name)</code>. <b>Property wrappers</b> (<code>wrappedValue</code> + <code>$projectedValue</code>)
      underlie <code>@State</code>/<code>@Binding</code>. <b>Result builders</b> generalize
      <code>@ViewBuilder</code> into any DSL. <b>@dynamicMemberLookup</b> gives dot-access over dynamic data.</p>
    <p><b>Reflection</b> (<code>Mirror</code>) is the runtime, read-only escape hatch — slow and type-erased, so
      it's a last resort. The modern trend is to move metaprogramming from runtime reflection to <b>compile-time
      macros</b> wherever possible.</p>
    <div class="callout warn"><span class="lbl">Heuristic</span> Generics for reuse → macros for boilerplate →
      reflection only when the type genuinely isn't known until runtime.</div>
    <p><b>Say this:</b> "I reach for the cheapest tool first — generics, then macros, then reflection only when
      the type genuinely isn't known until runtime."</p>`,
  },
];
