// Batch 24 — Senior TypeScript: generics with constraints, conditional types with infer, mapped types & modifiers, utility types tied to real DTO/PATCH use-cases, template literal types, narrowing (guards/in/discriminated unions/assertion functions), declaration files, strict tsconfig flags, interface vs type, and encoding business invariants with branded types instead of any.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";

export const ADVANCED24_FLASHCARDS: Flashcard[] = [
  {
    id: "a24-generics-constraints-1",
    category: "ts",
    categoryLabel: "TypeScript",
    question: `What does a generic constraint like <code>&lt;T extends { length: number }&gt;</code> buy you over a plain <code>&lt;T&gt;</code>?`,
    answerHtml: `<p>A bare <code>&lt;T&gt;</code> is a black box — inside the function you know nothing about it, so <code>x.length</code> won't compile. <code>&lt;T extends { length: number }&gt;</code> says "T can be anything, <b>as long as</b> it has a numeric <code>length</code>" — so strings, arrays, and any custom shape with <code>length</code> are accepted, and inside the body <code>x.length</code> is fully typed while the caller still keeps the concrete return type.</p><p>The senior framing: a constraint is how you widen input (accept many shapes) without widening output (lose the specific type). <b>Red flag:</b> reaching for <code>any</code> the moment you need a property — that throws away the guarantee the constraint would have enforced. Pitch it as "constrain, don't cast: the constraint is a promise the compiler checks at every call site, a cast is a promise nobody checks."</p>`,
  },
  {
    id: "a24-conditional-infer-2",
    category: "ts",
    categoryLabel: "TypeScript",
    question: `Explain conditional types and the <code>infer</code> keyword using a <code>ReturnType</code>-style extractor.`,
    answerHtml: `<p>A conditional type is a type-level ternary: <code>T extends U ? X : Y</code>. <code>infer</code> lets you <b>capture</b> a piece of a matched shape into a fresh type variable. The canonical example:</p><pre><code>type ReturnType&lt;T&gt; = T extends (...args: any[]) =&gt; infer R ? R : never;</code></pre><p>Read it as: "if T is a function, bind its return type to <code>R</code> and give me <code>R</code>; otherwise <code>never</code>." <code>infer R</code> is a hole the compiler solves by unification. This is how you extract the element type of an array (<code>T extends (infer E)[] ? E : never</code>), the resolved type of a Promise, or a handler's payload without the author restating it.</p><p>Senior signal: you use <code>infer</code> to <b>derive</b> types from existing values instead of hand-maintaining a parallel type that silently drifts. "One source of truth — the function's return type IS the API response type."</p>`,
  },
  {
    id: "a24-mapped-types-3",
    category: "ts",
    categoryLabel: "TypeScript",
    question: `What is a mapped type, and what do the <code>-readonly</code> and <code>-?</code> modifiers do?`,
    answerHtml: `<p>A mapped type transforms every property of a type by iterating its keys: <code>{ [K in keyof T]: F&lt;T[K]&gt; }</code>. It's the machinery behind most utility types. You can layer <b>modifiers</b> on the mapped property:</p><ul><li><code>readonly [K in keyof T]</code> adds <code>readonly</code>; <code>-readonly</code> strips it (this is how <code>Mutable&lt;T&gt;</code> is built).</li><li><code>[K in keyof T]?</code> makes every property optional; <code>-?</code> removes optionality (this is how <code>Required&lt;T&gt;</code> is built — it forces every key present).</li></ul><p>So <code>type Mutable&lt;T&gt; = { -readonly [K in keyof T]: T[K] }</code> and <code>type Required&lt;T&gt; = { [K in keyof T]-?: T[K] }</code>. The <code>-</code> prefix is the "remove this modifier" operator. Senior point: mapped types let you express "same shape, different guarantees" once, instead of copy-pasting an interface with tweaks that rot out of sync.</p>`,
  },
  {
    id: "a24-partial-patch-4",
    category: "ts",
    categoryLabel: "TypeScript",
    question: `Why is <code>Partial&lt;T&gt;</code> the natural type for a PATCH payload, and where does it bite you?`,
    answerHtml: `<p>PATCH means "update <i>some</i> fields" — every field is optional by definition. <code>Partial&lt;T&gt;</code> is exactly <code>{ [K in keyof T]?: T[K] }</code>, so an <code>UpdateUserDto = Partial&lt;CreateUserDto&gt;</code> models a PATCH body precisely: send <code>{ email }</code> to change just the email. In Nest, this is why <code>PartialType()</code> from <code>@nestjs/mapped-types</code> exists — it produces a PATCH DTO from a create DTO <i>and</i> re-applies validation decorators as optional.</p><p><b>Red flag:</b> using raw <code>Partial&lt;T&gt;</code> as a Nest DTO and expecting validation — a bare type has no <code>class-validator</code> decorators, so nothing gets validated at runtime. Use <code>PartialType()</code> (a class) for DTOs, and reserve the <code>Partial&lt;T&gt;</code> utility type for internal, already-trusted data. Second bite: <code>Partial</code> can't express "at least one field required" — that's a validation-layer concern, not a type-system one.</p>`,
  },
  {
    id: "a24-pick-omit-dto-5",
    category: "ts",
    categoryLabel: "TypeScript",
    question: `How do <code>Pick</code> and <code>Omit</code> keep your DTOs honest, and what's the durability difference between them?`,
    answerHtml: `<p><code>Pick&lt;T, K&gt;</code> selects a subset of keys; <code>Omit&lt;T, K&gt;</code> removes some. Both let you derive a DTO from a single canonical model instead of hand-writing a near-duplicate. Classic pair: a <code>PublicUser = Omit&lt;User, "passwordHash" | "internalNotes"&gt;</code> guarantees you never serialize secrets, and a <code>LoginDto = Pick&lt;User, "email" | "password"&gt;</code> exposes only what login needs.</p><p>The durability difference is the senior point: <b>Omit fails safe, Pick fails open — in reverse.</b> If someone adds a new sensitive field to <code>User</code>, an <code>Omit</code>-based public DTO will <i>leak it</i> by default (you didn't omit what didn't exist yet), whereas a <code>Pick</code>-based DTO stays locked to its explicit whitelist. So for anything exposed to the outside world, prefer <code>Pick</code> (allowlist) over <code>Omit</code> (denylist). Nest mirrors this with <code>PickType()</code> / <code>OmitType()</code> as class-producing DTO helpers that carry validation forward.</p>`,
  },
  {
    id: "a24-record-6",
    category: "ts",
    categoryLabel: "TypeScript",
    question: `When is <code>Record&lt;K, V&gt;</code> the right tool, and what does it force you to handle?`,
    answerHtml: `<p><code>Record&lt;K, V&gt;</code> builds an object type whose keys are <code>K</code> and values are <code>V</code> — e.g. <code>Record&lt;"read" | "write" | "admin", boolean&gt;</code> for a permission flag set, or <code>Record&lt;HttpStatus, string&gt;</code> for a status-to-message map. When <code>K</code> is a finite union, the real payoff is <b>exhaustiveness</b>: forget a key and the compiler complains, so adding a new role can't silently skip its config.</p><p>The catch it forces you to handle: <code>Record&lt;string, V&gt;</code> claims <i>every</i> string key exists, so <code>map[userInput].foo</code> type-checks even when the key is missing at runtime. That's why <code>noUncheckedIndexedAccess</code> matters — it re-adds the <code>| undefined</code> that <code>Record&lt;string, V&gt;</code> pretends away. Senior move: use a union key when the domain is closed, and turn on the strict flag when it's open.</p>`,
  },
  {
    id: "a24-exclude-extract-nonnullable-7",
    category: "ts",
    categoryLabel: "TypeScript",
    question: `What do <code>Exclude</code>, <code>Extract</code>, and <code>NonNullable</code> each do to a union type?`,
    answerHtml: `<p>All three are conditional types that filter <b>unions</b> (they distribute over each member):</p><ul><li><code>Exclude&lt;T, U&gt;</code> — drop the members of T assignable to U. <code>Exclude&lt;"a" | "b" | "c", "c"&gt;</code> is <code>"a" | "b"</code>. Use it to derive a subset like "all events except internal ones."</li><li><code>Extract&lt;T, U&gt;</code> — keep only the members assignable to U. <code>Extract&lt;Shape, { kind: "circle" }&gt;</code> narrows a discriminated union to one variant.</li><li><code>NonNullable&lt;T&gt;</code> — <code>Exclude&lt;T, null | undefined&gt;</code>. It's how you type the result of a guard that already filtered out nullish values.</li></ul><p>Senior signal: these are how you <b>derive related types from one master union</b> instead of maintaining several hand-listed unions that drift apart. Add a new variant to the source union and the derived subsets update for free.</p>`,
  },
  {
    id: "a24-template-literal-8",
    category: "ts",
    categoryLabel: "TypeScript",
    question: `Give a concrete backend use for template literal types.`,
    answerHtml: `<p>Template literal types let you build string types from other types: <code>type EventName = \`user.\${"created" | "updated" | "deleted"}\`</code> yields exactly <code>"user.created" | "user.updated" | "user.deleted"</code>. Two high-value uses on a Node/Nest backend:</p><ul><li><b>Typed event names</b> for an event emitter or message bus — the emitter and every listener are constrained to the same literal set, so a typo like <code>"user.crated"</code> fails to compile instead of silently never firing.</li><li><b>Typed route params</b> — <code>type ExtractParams&lt;T&gt;</code> over a path like <code>"/users/:id/posts/:postId"</code> can infer <code>{ id: string; postId: string }</code>, so the handler's params object is checked against the actual route string.</li></ul><p>The pitch: "template literal types move an entire class of stringly-typed bugs — event-name typos, missing route params — from a 2am incident to a red squiggle in the editor."</p>`,
  },
  {
    id: "a24-discriminated-union-9",
    category: "ts",
    categoryLabel: "TypeScript",
    question: `What is a discriminated union, and why is the literal <code>kind</code> field the whole trick?`,
    answerHtml: `<p>A discriminated (tagged) union is a union of object types that all share one property holding a <b>literal</b> value — the discriminant, conventionally <code>kind</code> or <code>type</code>:</p><pre><code>type Result =
  | { kind: "ok"; data: User }
  | { kind: "error"; message: string };</code></pre><p>The literal is the whole trick: when you <code>switch (r.kind)</code>, inside <code>case "ok"</code> the compiler <b>narrows</b> <code>r</code> to the <code>ok</code> variant, so <code>r.data</code> is available and <code>r.message</code> is a type error — no manual casting. It models "one of these mutually exclusive states" precisely, which is why it's the idiomatic way to type API results, WebSocket messages, and reducer actions.</p><p>Senior signal: pair it with an exhaustive <code>switch</code> and a <code>never</code> default (assertion function below) so adding a third variant forces you to handle it everywhere. "Make illegal states unrepresentable" — a discriminated union is the everyday form of that principle.</p>`,
  },
  {
    id: "a24-narrowing-guards-10",
    category: "ts",
    categoryLabel: "TypeScript",
    question: `Compare the narrowing tools: <code>typeof</code>/<code>in</code>, user-defined type guards, and assertion functions.`,
    answerHtml: `<p>All three teach the compiler something it can't infer alone:</p><ul><li><b>Built-in narrowing</b> — <code>typeof x === "string"</code>, <code>"id" in obj</code>, <code>Array.isArray(x)</code>, or a discriminant check. Cheap, no custom code, works for primitives and property presence.</li><li><b>User-defined type guard</b> — a function returning <code>x is Cat</code>: <code>function isCat(a: Animal): a is Cat { return "meow" in a; }</code>. After <code>if (isCat(a))</code>, <code>a</code> is a <code>Cat</code>. Use it to package a reusable, named narrowing (validating an unknown API payload into a typed shape).</li><li><b>Assertion function</b> — returns <code>void</code> but is typed <code>asserts x is Cat</code> (or <code>asserts x</code>): it <i>throws</i> if the condition fails, and after the call the compiler treats <code>x</code> as narrowed for the rest of the scope. This is the pattern behind exhaustiveness checks: <code>function assertNever(x: never): never { throw new Error(\`unhandled \${x}\`); }</code> in a switch <code>default</code>.</li></ul><p><b>Red flag:</b> a type guard whose body doesn't actually verify what it claims (<code>return true</code>) — it's a cast wearing a costume and will lie to every caller downstream.</p>`,
  },
  {
    id: "a24-declare-module-11",
    category: "ts",
    categoryLabel: "TypeScript",
    question: `A dependency ships no types and has no <code>@types/*</code> package. What are your options, cheapest first?`,
    answerHtml: `<p>Climb the ladder — do the least that unblocks you:</p><ol><li><b>Check DefinitelyTyped first:</b> <code>npm i -D @types/the-lib</code>. Community types exist for a huge share of untyped libs; don't hand-write what's already published.</li><li><b>Minimal ambient stub</b> — a <code>.d.ts</code> in your project with <code>declare module "the-lib";</code> makes the import resolve as <code>any</code>. Zero safety, but it silences the error and lets you ship. Fine for a rarely-touched utility.</li><li><b>Typed ambient declaration</b> — in the same <code>.d.ts</code>, <code>declare module "the-lib" { export function doThing(x: string): Promise&lt;Result&gt;; }</code> — type only the surface you actually call. This is the senior sweet spot: real safety on the API you use, no obligation to type the whole library.</li></ol><p><b>Red flag:</b> jumping straight to <code>// @ts-ignore</code> at every call site — that scatters unsafety across the codebase instead of containing it in one declaration file you can improve later. Contain the <code>any</code> at the boundary; keep the rest of the code honest.</p>`,
  },
  {
    id: "a24-strict-tsconfig-12",
    category: "ts",
    categoryLabel: "TypeScript",
    question: `Which tsconfig flags separate a serious codebase, and what does each catch?`,
    answerHtml: `<ul><li><code>"strict": true</code> — the master switch: <code>strictNullChecks</code>, <code>noImplicitAny</code>, <code>strictFunctionTypes</code>, and more. This is the non-negotiable baseline; the biggest win is <code>strictNullChecks</code>, which forces you to handle <code>null</code>/<code>undefined</code> instead of eating billion-dollar-mistake NPEs at runtime.</li><li><code>noUncheckedIndexedAccess</code> — makes <code>arr[i]</code> and <code>record[key]</code> return <code>T | undefined</code>, catching the "assumed the key exists" bug that <code>strict</code> alone misses.</li><li><code>noImplicitReturns</code> — every code path in a function must return, so a forgotten branch can't silently return <code>undefined</code>.</li><li><code>skipLibCheck</code> — skips type-checking <code>.d.ts</code> files in <code>node_modules</code>. This one is about <b>build speed</b>, not safety: it trades a class of cross-library type conflicts for much faster compiles, which is usually the right call on a large project.</li></ul><p>Senior framing: "<code>strict</code> is table stakes; <code>noUncheckedIndexedAccess</code> is the flag that tells me a team takes null-safety seriously beyond the defaults." Profile heavy type-checking with <code>tsc --extendedDiagnostics</code> when builds get slow.</p>`,
  },
  {
    id: "a24-interface-vs-type-13",
    category: "ts",
    categoryLabel: "TypeScript",
    question: `<code>interface</code> vs <code>type</code> — when does each win, and what can only one of them do?`,
    answerHtml: `<p>They overlap for plain object shapes, but each has an exclusive capability:</p><ul><li><b><code>interface</code></b> — best for extendable object shapes and public API surfaces. Only interfaces support <b>declaration merging</b>: two <code>interface Foo</code> declarations combine, which is how you augment third-party types (e.g. adding a <code>user</code> field to Express's <code>Request</code>) or extend library globals. Prefer it for the shapes other code will <code>extends</code>.</li><li><b><code>type</code></b> — required for anything that isn't a plain object shape: <b>unions</b> (<code>type Result = Ok | Err</code>), <b>intersections</b>, <b>mapped</b> and <b>conditional</b> types, tuples, and template literal types. You cannot express a union with an interface.</li></ul><p>Practical rule most senior codebases land on: "<code>interface</code> for object shapes and things meant to be extended/merged; <code>type</code> for unions and any computed/derived type." The distinction that actually matters in an interview is knowing declaration merging is interface-only and unions/mapped/conditional are type-only — the rest is style.</p>`,
  },
  {
    id: "a24-branded-types-14",
    category: "ts",
    categoryLabel: "TypeScript",
    question: `What is a branded type, and why is it a stronger senior signal than sprinkling <code>any</code>?`,
    answerHtml: `<p>A branded (nominal) type attaches a phantom tag to a structural type so two otherwise-identical types stop being interchangeable:</p><pre><code>type UserId = string & { readonly __brand: "UserId" };
type OrderId = string & { readonly __brand: "OrderId" };</code></pre><p>Both are strings at runtime, but the compiler now refuses to pass a <code>UserId</code> where an <code>OrderId</code> is expected — killing the "swapped two string args in the same call" bug that structural typing can't see. You mint one through a validating constructor (<code>function toUserId(s: string): UserId { /* validate */ return s as UserId; }</code>), so the brand also encodes "this string has been checked."</p><p>The senior signal, straight from the source material: <b>use the compiler to express business invariants — branded types, state machines — instead of scattering <code>any</code>.</b> <code>any</code> is a surrender that removes checking; a branded type <i>adds</i> a rule the compiler enforces at zero runtime cost. "Make the illegal call not compile" beats "hope the code review catches it." That contrast — encoding invariants in types vs. reaching for <code>any</code> — is exactly what separates a senior TS answer from a mid-level one.</p>`,
  },
];

export const ADVANCED24_QUIZ: QuizQuestion[] = [
  {
    id: "a24-qz-1",
    category: "ts",
    categoryLabel: "TypeScript",
    question: `Which definition correctly extracts a function's return type using a conditional type with <code>infer</code>?`,
    options: [
      `type RT&lt;T&gt; = T extends (...a: any[]) =&gt; R ? R : never;`,
      `type RT&lt;T&gt; = T extends (...a: any[]) =&gt; infer R ? R : never;`,
      `type RT&lt;T&gt; = infer R extends (...a: any[]) =&gt; T ? R : never;`,
      `type RT&lt;T&gt; = T extends infer (...a: any[]) =&gt; R ? R : never;`,
    ],
    answer: 1,
    explanationHtml: `<p><code>infer R</code> must sit in the position you want to capture — here the return position — so the compiler unifies <code>R</code> with the actual return type. Without <code>infer</code>, <code>R</code> is an undeclared name and won't compile; <code>infer</code> elsewhere is a syntax error.</p>`,
  },
  {
    id: "a24-qz-2",
    category: "ts",
    categoryLabel: "TypeScript",
    question: `You're building a <code>PublicUser</code> DTO that must never leak secret fields, even ones added to <code>User</code> later. Which is the safer derivation?`,
    options: [
      `Omit&lt;User, "passwordHash"&gt; — deny-list the known secret`,
      `Pick&lt;User, "id" | "name" | "email"&gt; — allow-list the safe fields`,
      `Partial&lt;User&gt; — make every field optional`,
      `Record&lt;keyof User, string&gt; — remap all keys`,
    ],
    answer: 1,
    explanationHtml: `<p><code>Pick</code> is an allow-list: if a new sensitive field lands on <code>User</code>, it's simply not in the picked set, so it can't leak. <code>Omit</code> is a deny-list — a newly added secret you forgot to omit would be exposed by default. For anything crossing a trust boundary, allow-list beats deny-list.</p>`,
  },
  {
    id: "a24-qz-3",
    category: "ts",
    categoryLabel: "TypeScript",
    question: `Which tsconfig flag makes <code>arr[i]</code> and <code>record[key]</code> resolve to <code>T | undefined</code>, catching "assumed the key exists" bugs?`,
    options: [
      `"strict": true`,
      `noImplicitReturns`,
      `noUncheckedIndexedAccess`,
      `skipLibCheck`,
    ],
    answer: 2,
    explanationHtml: `<p><code>noUncheckedIndexedAccess</code> adds <code>| undefined</code> to indexed access, forcing you to handle the missing-key case. Plain <code>"strict": true</code> does <i>not</i> include it. <code>noImplicitReturns</code> is about return-path coverage, and <code>skipLibCheck</code> is a build-speed flag that skips checking <code>.d.ts</code> files.</p>`,
  },
  {
    id: "a24-qz-4",
    category: "ts",
    categoryLabel: "TypeScript",
    question: `In an exhaustive <code>switch</code> over a discriminated union, what goes in the <code>default</code> branch to force a compile error when a new variant is added?`,
    options: [
      `A type guard: if (isKnown(x)) return;`,
      `An assertion function on a never parameter: assertNever(x) where function assertNever(x: never): never`,
      `A cast: return x as never;`,
      `A Partial&lt;T&gt; fallback object`,
    ],
    answer: 1,
    explanationHtml: `<p>In a fully-handled switch, the <code>default</code> value narrows to <code>never</code>. Passing it to <code>assertNever(x: never)</code> compiles today; add an unhandled variant and <code>x</code> is no longer <code>never</code>, so the call becomes a type error — the compiler now forces you to handle it. A plain cast to <code>never</code> silences that safety instead of using it.</p>`,
  },
  {
    id: "a24-qz-5",
    category: "ts",
    categoryLabel: "TypeScript",
    question: `Which statement about <code>interface</code> vs <code>type</code> is correct?`,
    options: [
      `Only type can describe object shapes; interface is for primitives`,
      `Only interface supports declaration merging; only type can express unions and mapped/conditional types`,
      `interface and type are fully interchangeable with no exclusive capabilities`,
      `Only interface can be used in a class implements clause`,
    ],
    answer: 1,
    explanationHtml: `<p>Declaration merging (two same-named declarations combining, used to augment library types) is <b>interface-only</b>. Unions, intersections beyond object merging, and mapped/conditional types are <b>type-only</b> — you can't write a union with an interface. Both can describe object shapes and both can be implemented by a class, so those options are wrong.</p>`,
  },
];
