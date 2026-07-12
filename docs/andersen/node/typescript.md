# TypeScript

### Union and intersection types
**They ask:** "What's the difference between a union and an intersection type, and how do you narrow a union?"

A **union** (`A | B`) means a value could be *either* type — the compiler only lets you access members common to all members of the union until you narrow it. An **intersection** (`A & B`) means a value must satisfy *both* types simultaneously — used to merge shapes, like combining a base entity type with a set of extra fields. Narrowing a union down to one branch is done with a type guard: `typeof`, `instanceof`, an `in` check, or a discriminant property check — after the guard, TypeScript knows which branch applies for the rest of that code path.

```ts
type Result = { status: 'ok'; data: string } | { status: 'error'; message: string };
function handle(r: Result) {
  if (r.status === 'ok') return r.data;   // narrowed to the 'ok' branch
  return r.message;                        // narrowed to 'error'
}
type Timestamped = { createdAt: Date };
type User = { name: string } & Timestamped; // intersection merges both shapes
```

**Say it:** "A union means 'one of these,' an intersection means 'all of these at once' — and I always model API responses as a discriminated union with a status field, because it forces every consumer to handle both branches at compile time instead of a runtime null check."
**Red flag:** Modeling optional/error state as an `any`-typed field or a loosely-optional property instead of a proper discriminated union. It pushes the branching decision to runtime instead of the compiler catching a missed case.

### Type narrowing
**They ask:** "Beyond a basic `typeof` check, what are the ways TypeScript narrows types?"

Narrowing is how TypeScript progressively reduces a broader type to a more specific one within a branch, based on runtime checks it can statically follow: `typeof x === 'string'`, `x instanceof Error`, `'prop' in obj`, equality checks against literal values, `Array.isArray`, and truthiness checks all narrow. **Discriminated unions** (a shared literal `type`/`kind` field) are the most reliable pattern because a `switch` over the discriminant lets TypeScript narrow exhaustively — and with `never` in the `default` case, the compiler flags any future branch you forget to handle.

```ts
type Shape = { kind: 'circle'; r: number } | { kind: 'square'; side: number };
function area(s: Shape): number {
  switch (s.kind) {
    case 'circle': return Math.PI * s.r ** 2;
    case 'square': return s.side ** 2;
    default: const _exhaustive: never = s; return _exhaustive; // compile error if a case is added and unhandled
  }
}
```

**Say it:** "I lean on discriminated unions with a `switch` and a `never`-typed default, because that turns 'forgot to handle a new case' into a compile-time error the moment someone adds a variant, instead of a runtime bug months later."
**Red flag:** Narrowing with a custom type-predicate function (`function isX(v): v is X`) that doesn't actually verify what it claims. A wrong type guard lies to the compiler and produces false confidence — it's worse than no guard because it silences legitimate errors.

### interface vs type alias
**They ask:** "When do you reach for `interface` vs `type`, and does it actually matter?"

For plain object shapes, they're largely interchangeable, but the distinguishing capabilities matter for the choice: `interface` supports **declaration merging** — reopening the same interface name adds to it, which is exactly how you extend third-party library types (augmenting `Express.Request`, for example). `type` can express things `interface` can't: unions, intersections, mapped/conditional types, tuples. A common convention: `interface` for public object shapes/contracts meant to be extended, `type` for everything else — unions, utility-type compositions, function signatures.

```ts
// interface: declaration merging works
interface Request { user?: User; }
declare global { namespace Express { interface Request { user?: User; } } }

// type: unions/mapped types interfaces can't express
type Status = 'idle' | 'loading' | 'error';
```

**Say it:** "Interface for object shapes meant to be extended or merged — especially augmenting library types — type for unions, tuples, and mapped/conditional types that interface syntax can't express at all."
**Red flag:** Insisting one is "always better" as a blanket rule. They overlap for plain shapes; the real decision is which capability (merging vs union/conditional types) the specific case actually needs.

### Extending and merging interfaces
**They ask:** "How does interface extension differ from declaration merging, and where do you use each?"

`extends` is explicit, single-purpose inheritance — `interface B extends A` composes `A`'s members into `B` at the point you write it, and multiple `extends` clauses combine several interfaces. **Declaration merging** is different: defining the same interface name *twice* in different files automatically merges their members into one — this isn't inheritance, it's how TypeScript lets you augment a type you don't own, which is the standard pattern for adding custom fields to `Express.Request` or ambient globals without forking the library's types.

```ts
interface Animal { name: string; }
interface Dog extends Animal { breed: string; } // explicit extension

// declaration merging — augmenting a library's type from your own file
declare namespace Express { interface Request { userId?: string; } }
```

**Say it:** "Extension is explicit inheritance I write; merging is implicit and automatic when the same interface name appears twice — that's specifically how I add fields to a third-party type like `Express.Request` without touching its source."
**Red flag:** Trying to declaration-merge a `type` alias. Only `interface` supports merging — attempting it on a `type` throws a duplicate-identifier compile error, which is exactly the tell for "doesn't know the distinction."

### Function overloads
**They ask:** "What are function overloads for, and how do they differ from a union-typed parameter?"

Overloads let one function name have multiple distinct call signatures, where the *return type* (or parameter shape) depends on which signature matched — something a single union parameter type can't express cleanly, because a union parameter still forces one shared return type for every call shape. You write several signature declarations followed by one implementation whose body must satisfy all of them; TypeScript picks the matching signature based on the caller's actual argument types.

```ts
function parse(input: string): object;
function parse(input: Buffer): string;
function parse(input: string | Buffer): object | string {
  return typeof input === 'string' ? JSON.parse(input) : input.toString();
}
const a = parse('{}');       // typed as object
const b = parse(Buffer.from('x')); // typed as string
```

**Say it:** "Overloads let the return type vary by which call shape matched — a union parameter alone can't do that, since the return type would have to be the same union for every call, losing precision at the call site."
**Red flag:** Reaching for overloads when a single well-typed union parameter and return type would work just as well. Overloads add real complexity — use them only when different input shapes genuinely need different, more precise output types.

### Generics in functions
**They ask:** "Write a generic function and explain what problem generics solve over `any`."

`any` throws away type information entirely — a function typed to take and return `any` gives zero compile-time guarantee that the output relates to the input. A generic captures the *relationship* between input and output types without committing to a specific concrete type: `function first<T>(arr: T[]): T` tells the compiler "the return type is whatever element type went in," which `any` can't express and which lets the caller keep full type safety after the call.

```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
const n = first([1, 2, 3]); // inferred as number | undefined
const s = first(['a', 'b']); // inferred as string | undefined
```

Constraints (`<T extends { id: string }>`) narrow what `T` can be while keeping it generic, useful when the function needs to access a specific shape without locking down the exact type.

**Say it:** "Generics preserve the relationship between input and output types — `any` erases it entirely — so a caller passing in a `string[]` still gets `string` back with full type safety, not an unchecked `any`."
**Red flag:** Reaching for `any` to "make the generic error go away" instead of fixing the actual type constraint. That silences the compiler exactly where it was catching something real.

### Access modifiers: public, private, protected
**They ask:** "How do TypeScript's `public`/`private`/`protected` differ from JS's `#private` fields, and does the distinction matter at runtime?"

TypeScript's access modifiers are a **compile-time-only** check — `private`/`protected` members are erased during compilation and exist as completely normal, accessible properties in the emitted JS at runtime; nothing stops reflection or a `// @ts-ignore` cast from reaching them. JS's native `#private` fields are enforced by the *runtime* itself — genuinely inaccessible outside the class, even via `Object.keys` or bracket-notation hacks. For real security/encapsulation boundaries (not just team-convention discipline), `#private` is the actual guarantee; TypeScript modifiers are a linting-strength tool for API design within a trusted team.

```ts
class Account {
  private balance: number = 0;      // compile-time only — visible at runtime
  #realBalance: number = 0;         // runtime-enforced — actually inaccessible
}
```

**Say it:** "TypeScript's `private` is a compile-time contract that's fully erased at runtime, while `#private` fields are a real runtime boundary — I use TS modifiers for API design discipline, and `#private` when I actually need enforcement, like protecting invariants a determined caller could otherwise bypass."
**Red flag:** Claiming `private` in TypeScript prevents runtime access to the property. It doesn't — `(instance as any).privateField` reaches it trivially, since the check never existed in the compiled JS.

### readonly and parameter properties
**They ask:** "What does `readonly` guarantee, and what are parameter properties?"

`readonly` on a property blocks reassignment *after initialization*, checked at compile time — like `const` for object fields — it prevents accidental mutation, but like `const`, it's shallow: a `readonly` array/object property can still have its contents mutated unless the type itself is also immutable (`ReadonlyArray<T>`). **Parameter properties** are a constructor shorthand: prefixing a constructor parameter with `public`/`private`/`readonly` declares *and* assigns the class field in one step, eliminating the usual `this.x = x` boilerplate.

```ts
class Point {
  constructor(
    public readonly x: number,
    public readonly y: number,
  ) {} // no manual this.x = x needed
}
```

**Say it:** "`readonly` blocks reassignment of the binding, not deep mutation of its contents — same shallow caveat as `const` — and parameter properties collapse constructor boilerplate into the signature itself, which is why you see them everywhere in Nest's constructor-injected services."
**Red flag:** Assuming `readonly string[]` prevents `.push()` on that array. Plain `readonly` doesn't change the array's own type — you need `ReadonlyArray<string>`/`readonly string[]` (the array type itself, not just the property) to block mutating methods.

### Enums vs union literal types
**They ask:** "When do you use a TypeScript `enum` vs a union of string literals, and why do many teams avoid `enum`?"

A union of string literals (`type Status = 'active' | 'inactive'`) is purely a compile-time construct — it compiles away entirely, has no runtime representation, and serializes naturally as the plain string it already is. A numeric `enum` generates real runtime code (a bidirectional lookup object) and, unless you use `const enum` or a string enum, numeric enum members are structurally unsafe — any number is assignable to them, defeating the type safety enum syntax implies. Many teams standardize on literal unions because they're simpler, serialize cleanly to JSON, and avoid the enum-specific runtime footguns entirely.

```ts
enum Status { Active, Inactive } // generates real runtime object, numeric — weakly typed
type Status2 = 'active' | 'inactive'; // no runtime cost, safer, serializes as-is
```

**Say it:** "Literal unions compile away to nothing and serialize as the plain value they already are; numeric enums generate real runtime code and are structurally weaker than they look — most teams I've worked with standardize on string literal unions for exactly that reason."
**Red flag:** Using a numeric `enum` for a value that gets serialized to JSON and sent to another service. The consumer sees a number, not the readable label, unless you specifically used a string enum.

### const enum
**They ask:** "What does `const enum` do differently from a regular `enum`?"

A `const enum` is fully inlined at every usage site during compilation and produces **no runtime object at all** — `Status.Active` in your source becomes the literal value directly in the compiled output, eliminating both the runtime lookup object and its associated bundle size. The trade-off: because there's no runtime object, you can't iterate its members, and it's incompatible with `isolatedModules` (used by most modern transpilers like esbuild/swc/Babel) since those compile files independently and can't see across files to inline the enum's values — which is exactly why many toolchains reject `const enum` outright.

```ts
const enum Direction { Up, Down } // fully inlined, zero runtime cost
let d = Direction.Up; // compiles to: let d = 0;
```

**Say it:** "`const enum` inlines to a plain literal with zero runtime cost, but it needs whole-program type information to do that inlining safely — which is exactly why isolatedModules-based toolchains like esbuild and swc reject it, and why I default to literal unions instead when the build uses one of those."
**Red flag:** Using `const enum` in a codebase built with esbuild, swc, or Babel's TS transform. Those transpile file-by-file with no cross-file type info, so `const enum` either fails outright or silently produces wrong output depending on the tool.

### Declaration files (.d.ts)
**They ask:** "What is a `.d.ts` file, and when do you write one yourself?"

A declaration file describes the *shape* of JS code — types with no implementation — so TypeScript can type-check against code it can't see the TS source for: a plain-JS npm package, a global injected by a bundler, or your own compiled library's public API (`tsc --declaration` generates these automatically for a TS package so its *consumers* get types without needing the original source). You write one by hand when consuming an untyped JS library with no `@types/*` package available, or when exposing a stable public type surface for a library independent of its internal implementation types.

```ts
// mylib.d.ts
declare module 'untyped-lib' {
  export function doThing(x: string): number;
}
```

**Say it:** "A `.d.ts` file separates the type contract from the implementation — I write one by hand only when a JS dependency has no types at all, and otherwise let `tsc --declaration` generate one automatically so my library's consumers get types for free."
**Red flag:** Hand-writing and maintaining `.d.ts` files for your own TypeScript source instead of letting the compiler generate them. That's a manual sync burden the compiler already solves — hand-written `.d.ts` is for code TypeScript can't see the source of.

### declare module and ambient types
**They ask:** "What does `declare module`/`declare global` do, and where do ambient types live?"

`declare` introduces a type-only declaration with no corresponding runtime value — it tells the compiler "trust me, this exists," without generating any JS. `declare module 'some-lib'` supplies types for an untyped package; `declare global` augments the global scope (adding a property to `window`, or a custom env var to `process.env`). These live in **ambient** `.d.ts` files with no top-level `import`/`export` (which would make them a module and scope their declarations locally instead of globally) — usually a project-root `global.d.ts` picked up automatically via `tsconfig`'s `include`.

```ts
// global.d.ts — no import/export, so this is ambient (global scope)
declare global {
  interface Window { analytics: Analytics; }
}
declare module '*.svg' { const src: string; export default src; } // for bundler asset imports
```

**Say it:** "`declare` introduces a type with no runtime output — ambient files stay import/export-free specifically so their declarations apply globally instead of being scoped to that one module, which is how you type things like SVG imports or a global `window` property."
**Red flag:** Adding an `import` statement to an ambient declaration file "just in case" and then wondering why `declare global` augmentations stop applying. Any top-level import/export turns the file into a module, scoping everything inside it locally.

### Utility types
**They ask:** "Walk through `Partial`, `Pick`, `Omit`, and `Record` — what does each transform, and when do you reach for it?"

These are built-in generic type transformations that derive a new type from an existing one instead of duplicating it by hand — keeping one source of truth so the derived type stays in sync automatically when the original changes. `Partial<T>` makes every property optional (perfect for a PATCH/update payload). `Pick<T, K>` selects a subset of keys. `Omit<T, K>` excludes a subset of keys (the inverse of `Pick`). `Record<K, V>` builds an object type with keys of type `K` all mapping to value type `V` — useful for lookup maps and enums-as-keys.

```ts
type User = { id: string; name: string; email: string; role: string };
type UpdateUser = Partial<Omit<User, 'id'>>; // every field optional except id is excluded entirely
type RolePermissions = Record<User['role'], string[]>;
```

**Say it:** "I derive request/response DTO shapes from one source-of-truth type with `Pick`/`Omit`/`Partial` instead of hand-duplicating a near-identical interface — that keeps the derived shape automatically correct whenever the base type changes."
**Red flag:** Hand-writing a near-duplicate interface for a PATCH endpoint's body instead of `Partial<T>`. The duplicate silently drifts out of sync the next time someone adds a field to the base type and forgets the copy.

### Type guards and discriminated unions
**They ask:** "Write a custom type guard and explain the `is` return type."

A user-defined type guard is a function whose return type is a **type predicate** (`param is Type`) instead of a plain `boolean` — this tells the compiler that, if the function returns `true`, it should narrow the checked variable's type in every branch that called it, not just return a runtime true/false. It's the tool for narrowing when the check is more complex than `typeof`/`instanceof` can express — shape-checking an unknown value from an API response, for instance.

```ts
type ApiError = { error: string };
type ApiSuccess<T> = { data: T };

function isError<T>(res: ApiSuccess<T> | ApiError): res is ApiError {
  return 'error' in res;
}

function handle<T>(res: ApiSuccess<T> | ApiError) {
  if (isError(res)) return res.error; // narrowed to ApiError
  return res.data;                     // narrowed to ApiSuccess<T>
}
```

**Say it:** "A type predicate function tells the compiler to narrow the type at every call site, not just return a boolean — I write one whenever a shape check is too complex for `typeof`/`instanceof` alone, like validating an unknown API response."
**Red flag:** Writing a type predicate whose body doesn't actually verify what the predicate claims (`(x: unknown): x is User => true`). The compiler trusts it unconditionally — a wrong guard produces confident, silently wrong narrowing everywhere it's used.

### keyof and indexed access types
**They ask:** "What do `keyof` and indexed access types let you express that plain interfaces can't?"

`keyof T` produces a union of `T`'s property names as string-literal types — it lets you write a function generic over "any valid key of this object" with the compiler checking the key actually exists, instead of accepting `string` and hoping. Indexed access (`T[K]`) reads the *type* of a specific property, which composes with `keyof` to write fully type-safe, generic accessors — the compiler knows the exact return type based on which key was passed, not a loose union of every possible property type.

```ts
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]; // return type is exactly T[K], not `any`
}
const user = { name: 'Ann', age: 30 };
getProp(user, 'age'); // inferred as number
getProp(user, 'email'); // compile error — 'email' isn't a key of user
```

**Say it:** "`keyof` plus indexed access lets me write a generic accessor where the compiler verifies the key exists and infers the exact return type for that key — a plain `(obj, key: string) => any` accessor gives up both of those guarantees."
**Red flag:** Typing a generic object accessor's key parameter as plain `string` instead of `keyof T`. That accepts any string at compile time, including typos, and loses all type information about what comes back.

### Mapped and conditional types
**They ask:** "What are mapped types and conditional types, and where do the built-in utility types come from?"

A **mapped type** transforms every property of an existing type uniformly using a `[K in keyof T]` loop — it's literally how `Partial<T>`/`Readonly<T>`/`Record<K,V>` are implemented under the hood, not special compiler magic. A **conditional type** (`T extends U ? X : Y`) branches at the type level based on whether one type is assignable to another — combined with `infer`, it can extract a nested type from within a larger one, which is how utility types like `ReturnType<F>` pull a function's return type out of its signature.

```ts
type Nullable<T> = { [K in keyof T]: T[K] | null }; // mapped type
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T; // conditional + infer
type Result = UnwrapPromise<Promise<string>>; // string
```

**Say it:** "Mapped and conditional types are the mechanism the built-in utility types are built from, not separate compiler features — knowing that means I can write my own `Partial`-shaped transformation the moment the built-ins don't cover a specific case."
**Red flag:** Reaching for `any` to work around a type transformation a mapped or conditional type would express precisely. That's giving up type safety exactly where TypeScript's type-level programming was built to handle it.
