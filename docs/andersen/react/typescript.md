# TypeScript

### Basic types
**They ask:** "Walk me through TypeScript's special types — `void`, `never`, `unknown` — and when you reach for union and literal types."

These types exist to make *impossible states unrepresentable* — that's the payoff over plain JS. `unknown` is the type-safe top type: anything is assignable to it, but you can't use it until you narrow, so it's the correct landing spot for `JSON.parse` or API payloads instead of `any`, which silently disables checking. `never` is the bottom type — a value that can't exist — used for functions that never return and for exhaustiveness checks. `void` means "the return value is ignored."

Union types (`A | B`) model "one of several shapes," and literal types (`"admin" | "user"`) narrow a `string` down to an exact set, which is where TypeScript starts catching real bugs.

```ts
function assertNever(x: never): never {
  throw new Error(`Unexpected: ${x}`);
}
type Role = "admin" | "user";
function label(r: Role) {
  switch (r) {
    case "admin": return "Admin";
    case "user": return "User";
    default: return assertNever(r); // compile error if Role grows
  }
}
```

**Say it:** "`unknown` is the safe `any` — you must narrow before use; `never` is the impossible value I use for exhaustiveness; and literal unions turn stringly-typed code into a closed set the compiler checks."
**Red flag:** using `any` for uncertain data. Say `unknown` instead — it forces a narrowing step, so the type system still has your back.

### Interface vs class
**They ask:** "How does an `interface` differ from a `class`, and how do optional, readonly, and function-typed members work?"

The distinction is compile-time versus runtime: an `interface` is erased — it's a pure contract with zero JS output — while a `class` emits real code and creates both a value and a type. So I reach for an `interface` to describe a shape without shipping any runtime cost, and a `class` when I need actual construction and behavior.

Within a shape, `?` marks a property optional (its type becomes `T | undefined`), `readonly` blocks reassignment after construction (compile-time only, not `Object.freeze`), and you can type members as functions or use call signatures.

```ts
interface User {
  readonly id: string;
  name: string;
  nickname?: string;
  greet(prefix: string): string; // method/function-typed member
}
```

**Say it:** "An interface is a compile-time contract that disappears at runtime; a class emits code and gives you a value plus a type — I use interfaces for shapes and classes when I need construction and behavior."
**Red flag:** thinking `readonly` deep-freezes an object at runtime. It's a compile-time guarantee only — nested objects stay mutable, and it vanishes after compilation.

### Typing functions
**They ask:** "How do you type a function's parameters and return, including rest and optional params?"

Typing functions is where TypeScript pays off most, because call sites are where mistakes happen. Annotate each parameter and let the return type infer unless you want it enforced at the definition. Optional params use `?` and must come after required ones; a rest param collects the tail into a typed array.

```ts
function format(
  label: string,
  precision = 2,          // default → inferred optional
  ...values: number[]     // rest, typed as array
): string {
  return `${label}: ${values.map(v => v.toFixed(precision)).join(", ")}`;
}
type Formatter = (label: string, ...values: number[]) => string;
```

Prefer letting the return type infer for internal functions, but annotate exported API boundaries explicitly so a refactor that changes the return is caught at the definition, not only at call sites.

**Say it:** "Optional and rest params are positional rules — optionals and the single rest go last — and I annotate return types on public boundaries so a breaking change surfaces at the definition."
**Red flag:** putting an optional parameter before a required one. TypeScript rejects it; use a default value or reorder so required params come first.

### Access modifiers
**They ask:** "What do `public`, `private`, and `protected` do, and what are parameter properties?"

Access modifiers document intent and enforce encapsulation at compile time. `public` (the default) is open, `protected` is visible to subclasses, and `private` is class-only. Note that TS `private` is a *compile-time* check — for true runtime hiding you use JS `#fields`. Parameter properties are the lazy win: prefix a constructor parameter with a modifier and TypeScript declares and assigns the field for you, killing the boilerplate.

```ts
class Account {
  // parameter properties: declared + assigned automatically
  constructor(
    public readonly id: string,
    private balance: number,
  ) {}
  deposit(n: number) { this.balance += n; }
}
```

Without parameter properties you'd write the field declaration, the constructor param, and `this.x = x` — three lines saying the same thing.

**Say it:** "Parameter properties collapse declare-plus-assign into the constructor signature, and I remember TS `private` is compile-time only — for hard runtime privacy I use `#fields`."
**Red flag:** claiming TS `private` hides data at runtime. It's erased after compilation; anyone can reach the field in plain JS. Use ECMAScript `#private` when runtime enforcement matters.

### Enums
**They ask:** "Explain numeric versus string enums, and computed versus constant members."

Enums give a named, self-documenting set of related constants. Numeric enums auto-increment from 0 and — importantly — build a *reverse mapping* (`Direction[0] === "Up"`), which string enums do not. String enums trade that away for readable, debuggable values that survive serialization, which is why I default to them for anything that crosses a wire or shows up in logs.

Members are either constant (evaluated at compile time — a literal or an expression of other constant members) or computed (evaluated at runtime, like a function call).

```ts
enum Status {           // string enum: stable, readable values
  Active = "ACTIVE",
  Closed = "CLOSED",
}
enum FileAccess {
  Read = 1 << 1,        // constant expression
  Write = 1 << 2,
  Length = "rw".length, // computed member
}
```

**Say it:** "I default to string enums because they serialize to readable values and survive logs; numeric enums are worth it only when I want the reverse mapping."
**Red flag:** using numeric enums for values that get persisted or sent to an API. Reordering members silently changes the stored numbers — string enums pin the value to the name.

### Declaration files
**They ask:** "Why do declaration files exist, and what does the `declare` keyword do?"

Declaration files (`.d.ts`) are how types travel without implementation — they describe the shape of code whose JS already exists elsewhere: a library written in plain JS, a global from a `<script>` tag, or a non-code import. They ship no runtime output; they're pure type information the compiler consults and then erases.

The `declare` keyword is "trust me, this exists at runtime" — it introduces an *ambient* declaration with no implementation, so you can type a global that some other layer provides.

```ts
// globals.d.ts
declare const __API_URL__: string;      // injected by the bundler
declare function gtag(cmd: string, ...args: unknown[]): void;

declare module "*.svg" {                 // typing a non-code import
  const src: string;
  export default src;
}
```

**Say it:** "A `.d.ts` is types without implementation, and `declare` asserts that something exists at runtime so I can type globals and non-JS imports the compiler otherwise can't see."
**Red flag:** putting real logic in a `.d.ts` or after `declare`. Ambient declarations are type-only — an implementation there won't compile or won't ship; the code must live in a real module.

### Type casting and generics
**They ask:** "How does type casting work, and how do you write simple and class generics?"

Casting (assertions) is you overriding the compiler — `as T` or `<T>value` — so it's a promise, not a conversion; no runtime check happens, which makes it a place bugs hide. I lean on narrowing (`typeof`, `instanceof`, guards) first and only assert when I genuinely know more than the compiler, like right after reading a DOM node.

Generics are the opposite: they *preserve* type information across a function or class instead of throwing it away with `any`.

```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];              // T flows in and back out
}
class Box<T> {
  constructor(private value: T) {}
  get(): T { return this.value; }
}
const n = first([1, 2, 3]);   // inferred number | undefined
const el = document.getElementById("app") as HTMLCanvasElement;
```

**Say it:** "A cast is a compile-time promise with no runtime check, so I prefer narrowing; generics are how I keep type information flowing instead of erasing it with `any`."
**Red flag:** reaching for `as` to silence an error. Assertions can lie and cause runtime crashes — narrow with a guard, and treat a cast as a last resort you can justify.

### Indexable types
**They ask:** "What are indexable types, and what does it mean to use a class as an interface?"

Indexable types describe objects accessed by arbitrary keys — dictionaries, lookups — via an index signature, so you type the *shape of access* rather than every key. That's how you model an object whose keys aren't known ahead of time while keeping the value type checked.

A class produces a type as well as a value, so you can `implements` it *or* reference its instance type in an interface. `implements` checks that a class satisfies a contract without changing its implementation.

```ts
interface StringMap {
  [key: string]: number;   // index signature
}
interface Comparable {
  compareTo(other: this): number;
}
class Money implements Comparable {   // class satisfies the contract
  constructor(public cents: number) {}
  compareTo(o: Money) { return this.cents - o.cents; }
}
```

**Say it:** "An index signature types access by unknown keys so a dictionary stays type-checked, and `implements` verifies a class meets an interface without touching its implementation."
**Red flag:** giving a fixed-shape object an index signature just to quiet a key error. It widens the type and lets any key through — declare the real properties, or use `Record<Keys, V>` for a bounded key set.

### Typing this
**They ask:** "How do you type `this` in a function, and why would you need to?"

You need it because in JS `this` is set by *how a function is called*, not where it's defined — so a callback can arrive with the wrong `this` and crash. TypeScript lets you declare `this` as a fake first parameter (erased at compile time) so the compiler enforces the calling context.

```ts
interface UIElement {
  addClickListener(cb: (this: void, e: Event) => void): void;
}
function toHex(this: number): string {
  return this.toString(16);
}
// enforced binding site
const hex = toHex.call(255);
```

Declaring `this: void` on a callback signature is the useful case: it tells callers "this handler must not rely on `this`," catching the classic bug of passing an unbound method. Arrow functions capture `this` lexically and so don't take a `this` parameter.

**Say it:** "I type `this` as a phantom first parameter so the compiler enforces the calling context — `this: void` on a callback is how I stop someone passing an unbound method."
**Red flag:** assuming a class method keeps its `this` when passed as a callback. It doesn't unless bound or an arrow — typing `this` surfaces that at compile time instead of as a runtime `undefined`.

### Abstract classes
**They ask:** "What is an abstract class and when do you use one over an interface?"

An abstract class is a partial base you can't instantiate — it exists to be extended. The reason to pick it over an interface is *shared implementation*: it can hold concrete methods and state alongside `abstract` members that subclasses must implement. So it's the template-method tool — common logic lives in the base, the varying step is abstract.

```ts
abstract class Repository<T> {
  protected abstract table: string;          // subclass supplies
  abstract find(id: string): Promise<T>;     // subclass implements
  // shared concrete behavior
  async exists(id: string): Promise<boolean> {
    return (await this.find(id)) != null;
  }
}
```

An interface is a pure contract with no implementation and supports multiple inheritance; an abstract class gives you code reuse but you get only one. I choose the abstract class only when subclasses genuinely share behavior.

**Say it:** "I use an abstract class when subclasses share real implementation, not just a shape — it's the template-method pattern; if it's a pure contract, an interface is lighter and composes better."
**Red flag:** defaulting to abstract classes for every contract. Single inheritance boxes you in — prefer an interface unless there's concrete shared code to inherit.

### Namespaces
**They ask:** "What are namespaces and should you use them in a modern codebase?"

Namespaces were TypeScript's pre-ES-modules answer to organizing code and avoiding global-scope collisions — an internal module you access with dot notation. The senior point is that they're largely legacy now: ES modules (`import`/`export`) are the standard, they play well with bundlers and tree-shaking, and namespaces don't.

```ts
namespace Validation {
  export const isEmail = (s: string) => /@/.test(s);
}
Validation.isEmail("a@b.com");
```

Where namespaces still earn their place is in `.d.ts` files — grouping the types of a global UMD library that attaches everything to one object. In application code I use modules; reaching for `namespace` there is a smell.

**Say it:** "Namespaces predate ES modules — I use modules in app code and keep namespaces to declaration files for typing global UMD libraries."
**Red flag:** structuring a new app around namespaces. They don't tree-shake and fight the module tooling; use `import`/`export` and let the bundler organize the graph.

### Generic constraints
**They ask:** "How do you constrain a generic, use class types in generics, and how do you think about `void`?"

Bare generics are too permissive — a constraint (`T extends ...`) narrows what can be passed so you can safely use members inside the function while still preserving the caller's specific type. Class types in generics let you accept a *constructor* (`new () => T`) so a factory returns the exact instance type.

On `void`: it means "the return is ignored," which is subtly different from `undefined`. A `void`-returning function *type* accepts a function that returns a value — the value is just discarded — which is what makes `arr.forEach(x => list.push(x))` type-check.

```ts
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;   // .length is safe now
}
function create<T>(Ctor: new () => T): T {
  return new Ctor();                     // class type in a generic
}
```

**Say it:** "A constraint is `T extends Shape` so I can use members while keeping the caller's exact type, and `void` means the return is ignored — not `undefined` — which is why a void callback may still return a value."
**Red flag:** treating `void` and `undefined` as identical. A `() => void` type accepts functions returning any value; relying on the return being `undefined` there is a bug the distinction is meant to prevent.

### Construct signatures and hybrid types
**They ask:** "What's a construct signature on an interface, and what are hybrid types?"

A construct signature (`new (...) => T`) types something callable with `new` — you use it to describe a class or constructor you'll pass around as a value, which pairs with the factory-generic pattern. A hybrid type is an interface that's callable *and* has properties, modeling JS values that are a function plus attached members — jQuery's `$` is the classic case.

```ts
interface CounterCtor {
  new (start: number): Counter;   // construct signature
}
interface Counter {
  (step: number): number;         // callable
  count: number;                  // and a property → hybrid
  reset(): void;
}
function makeCounter(): Counter {
  const c = ((step: number) => (c.count += step)) as Counter;
  c.count = 0;
  c.reset = () => { c.count = 0; };
  return c;
}
```

**Say it:** "A construct signature types a value you call with `new`, and a hybrid type is an interface that's both callable and has properties — how I model a function object like a configured counter or jQuery's `$`."
**Red flag:** confusing a call signature with a construct signature. `(): T` types a plain call; `new (): T` types instantiation — using the wrong one rejects a valid constructor or function.

### Function overloads
**They ask:** "How do you write overloads for a function type, and when are they worth it?"

Overloads express that a function's return type *depends on* which argument shape you pass — something a single union signature can't capture precisely. You write multiple overload signatures followed by one implementation signature that's compatible with all of them; callers only see the overloads, not the implementation.

```ts
function parse(input: string): string[];
function parse(input: number): number;
function parse(input: string | number): string[] | number {
  return typeof input === "string" ? input.split(",") : input * 2;
}
const a = parse("x,y");   // typed string[]
const b = parse(10);      // typed number
```

The senior nuance: overloads are worth it when input and output are *correlated*; if they aren't, a union or a generic is simpler and less error-prone. Overloads also don't check the implementation body against each overload as tightly as you'd hope, so keep the implementation signature honest.

**Say it:** "Overloads are for when the return type is correlated with the argument shape — callers see the specific signatures; if there's no correlation, a generic or union is cleaner."
**Red flag:** stacking overloads where a generic would do. Overloads duplicate signatures and can drift from the implementation — reach for them only when the return genuinely varies by input type.

### Private constructors
**They ask:** "What does a private constructor enable?"

A private constructor blocks `new` from outside the class, which is how you enforce controlled instantiation — singletons and factory methods. Instead of letting callers construct freely, you route them through a static method that owns the creation logic, so invariants are guaranteed at the single entry point.

```ts
class Config {
  private static instance: Config;
  private constructor(public readonly env: string) {}   // no external new

  static get(): Config {
    return (this.instance ??= new Config(process.env.NODE_ENV ?? "dev"));
  }
}
Config.get();          // ok
// new Config("prod"); // compile error
```

The same technique backs named factory methods (`User.fromJSON(...)`, `Money.zero()`) when a plain constructor can't express intent or needs to return a cached or validated instance.

**Say it:** "A private constructor forces creation through a static factory — that's how I implement a singleton or guarantee every instance passes through one validated entry point."
**Red flag:** hand-rolling a singleton with a public constructor and a comment saying "don't call this." Make the constructor `private` so the compiler enforces it instead of relying on convention.

### Enums at runtime
**They ask:** "What's the difference between how a `const enum` and a regular enum behave at runtime versus compile time?"

This is where enums surprise people: a regular enum is *not* purely a type — it compiles to a real JS object, so it has a runtime footprint and supports reverse lookups for numeric members. A `const enum`, by contrast, is fully erased: the compiler inlines each member's value at the use site and emits no object at all, which is leaner but means you can't iterate it or look it up dynamically.

```ts
enum Color { Red, Green }        // emits an object at runtime
const c = Color.Red;             // → Color.Red (object access)

const enum Size { S, M }         // erased
const s = Size.M;                // → const s = 1 (inlined)
```

The trade-off: `const enum` saves bundle size but breaks under isolated-module compilation (Babel, some bundlers) because inlining needs whole-program type info. Many teams therefore prefer plain string-literal unions, which have zero runtime cost and no tooling caveats.

**Say it:** "A regular enum emits a runtime object with reverse mappings; a `const enum` is inlined and erased — leaner, but it can't be iterated and breaks under isolated-module transpilers."
**Red flag:** assuming enums are compile-time-only like the rest of the type system. Regular enums ship real JS — if that surprises you, either use `const enum` deliberately or a literal union with no runtime output.

### Typing best practices
**They ask:** "What are your best practices for typings and declaration files in a real project?"

The guiding principle is that types are a public contract, so I treat them with the same care as an API. Prefer types that come *with* the library (bundled `.d.ts`) or the community `@types/*` packages over hand-written declarations, so they stay in sync with the implementation. When I must write ambient types, I scope them tightly and keep them out of the type-checking of unrelated code.

Concretely: enable `strict` (it's the whole point of adopting TS), avoid `any` in favor of `unknown` at boundaries, model domain values with literal unions rather than loose `string`, and colocate a module's types with the module. For globals and non-code imports, one small `.d.ts` with `declare` — not scattered assertions.

```ts
// good: narrow, boundary-typed, no any
function readConfig(raw: unknown): Config {
  if (!isConfig(raw)) throw new Error("bad config");
  return raw;                    // narrowed by the guard
}
```

**Say it:** "Types are a public contract — I lean on bundled or `@types` declarations over hand-written ones, keep `strict` on, and validate external data with guards so `unknown` becomes a real type at the boundary."
**Red flag:** littering the codebase with `any` and one-off `as` casts to make errors go away. That quietly opts out of the type system — narrow at boundaries with guards and keep ambient declarations minimal and centralized.
