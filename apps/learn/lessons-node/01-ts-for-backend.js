window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "ts-for-backend",
  title: "TypeScript for the Backend",
  emoji: "🧩",
  lang: "ts",
  lessons: [
    {
      id: "values-and-types",
      title: "Values & their types",
      steps: [
        {
          type: "text",
          md: [
            "## Why a backend dev types their code",
            "The welcome module showed you the shape of a NestJS server. Before we build one, you need the language it's written in: **TypeScript** — JavaScript with a type checker bolted on. The types never run; they're erased before Node executes the code. Their whole job is to catch mistakes *while you write*, not in production at 3am.",
            "For a backend that matters more than anywhere. A booking with a `price` that's secretly a string, a `walkerId` that's `undefined` — those bugs corrupt a database or charge the wrong card. TypeScript turns a whole class of them into a red squiggle before the request ever runs.",
            "> Coming from Swift? You already think this way. Swift wouldn't let you pass a `String` where an `Int` belongs. TypeScript gives plain JavaScript that same guardrail.",
          ],
        },
        {
          type: "text",
          md: [
            "## `const`, `let`, and inference",
            "Two ways to declare a value:",
            "- **`const`** — a binding that never gets reassigned. Reach for it by default. It's Swift's `let`.\n- **`let`** — a binding you *will* reassign later. It's Swift's `var`. Use it only when you actually mutate.",
            "You rarely write the type. TypeScript **infers** it from the value: `const walksToday = 3` is inferred as `number`, `const name = \"Mochi\"` as `string`. You add an explicit type mainly at **boundaries** — function parameters, return types, the shape of data crossing the wire — where there's no value to infer from yet.",
          ],
        },
        {
          type: "code",
          title: "A first taste of inference",
          source: String.raw`// No type annotations needed — TypeScript reads the values.
const walkerName = "Mochi";     // string
let walksToday = 3;             // number (let: we'll increment it)
const isAvailable = true;       // boolean
const pricesCents = [1500, 2000, 3000]; // number[]

walksToday = walksToday + 1;    // fine — let is reassignable
// walkerName = "Luna";         // ERROR — const can't be reassigned`,
          caption: "The comments on the right are what TypeScript infers. `walksToday` is `let` because we add to it; everything else is `const`. Prices are in **cents** (integers) — never floats for money.",
        },
        {
          type: "quiz",
          q: "You have a walker's ID that is set once and never changes. Which declaration fits?",
          choices: [
            "`const walkerId = \"w_123\"` — it never gets reassigned",
            "`let walkerId = \"w_123\"` — every value should be reassignable",
            "`var walkerId = \"w_123\"` — the modern default in TypeScript",
            "It doesn't matter; `const` and `let` behave identically",
          ],
          answer: 0,
          explain: "Default to `const`; it signals 'this won't change' and the compiler enforces it. Use `let` only when you genuinely reassign. `var` is the old, function-scoped JavaScript keyword — modern TypeScript avoids it entirely.",
          nudge: "Which keyword promises the compiler the value is set once?",
        },
        {
          type: "text",
          md: [
            "## Writing the type explicitly",
            "When you *do* annotate, the type goes after a colon: `const count: number = 3`. The primitives you'll use daily on a backend:",
            "- **`string`** — a walker's name, an ID, an email.\n- **`number`** — a price in cents, a rating, a count. (One number type; no `Int` vs `Double`.)\n- **`boolean`** — `isAvailable`, `isPaid`.\n- **arrays** — `number[]` or the equivalent `Array<number>`; a list of walkers is `Walker[]`.",
            "> Rule of thumb: let inference handle local values; write the type where data enters or leaves — that's where a wrong type does real damage.",
          ],
        },
        {
          type: "exercise",
          title: "Declare a walker's stats",
          prompt: [
            "Inside the function, declare three values with **explicit types**:",
            "- `const name: string` set to `\"Mochi\"`\n- `let walksToday: number` set to `3` (it's `let` — the walker takes more walks)\n- `const pricesCents: number[]` set to the array `[1500, 2000]`",
            "> Reminder: this course builds strings with `+`, never TypeScript template-literal backticks.",
          ],
          starter: String.raw`function walkerStats() {
  // your code here
}`,
          solution: String.raw`function walkerStats() {
  const name: string = "Mochi";
  let walksToday: number = 3;
  const pricesCents: number[] = [1500, 2000];
  return name;
}`,
          checks: [
            { re: /const name:string="Mochi"/, hint: "Annotate the type after a colon: `const name: string = \"Mochi\"`." },
            { re: /let walksToday:number=3/, hint: "`walksToday` changes, so use `let`: `let walksToday: number = 3`." },
            { re: /const pricesCents:number\[\]=\[1500,2000\]/, hint: "An array of numbers is typed `number[]`: `const pricesCents: number[] = [1500, 2000]`." },
          ],
          mustNot: [
            { re: /var name/, hint: "Skip `var` — use `const` for a value that never changes." },
          ],
          success: "That's the core of TypeScript's value layer: `const` by default, `let` when you mutate, and explicit types where clarity matters.",
        },
      ],
    },
    {
      id: "describing-shapes",
      title: "Describing shapes: interface & type",
      steps: [
        {
          type: "text",
          md: [
            "## Naming the shape of your data",
            "A backend is mostly data with a shape: a walker *has* an id, a name, a price. A booking *has* a walker, a status, maybe a note. TypeScript lets you name that shape once and reuse it everywhere — the same instinct as a Swift `struct`.",
            "Two tools do this: **`interface`** and **`type`**. For describing an object's fields they're nearly interchangeable. A common convention: `interface` for object shapes you might extend, `type` for unions and aliases (you'll meet unions in a moment). Like Swift structs, these shapes are **compile-time only** — erased before Node runs.",
          ],
        },
        {
          type: "code",
          title: "src/walkers/walker.entity.ts",
          source: String.raw`// An interface names the shape of one walker.
interface Walker {
  id: string;
  name: string;
  pricePer30MinCents: number;
  isAvailable: boolean;
}

// Any object with these fields IS a Walker — no explicit "implements" needed.
const mochi: Walker = {
  id: "w_1",
  name: "Mochi",
  pricePer30MinCents: 2000,
  isAvailable: true,
};`,
          caption: "This is the Swift `struct Walker` you built in Part I, in TypeScript. `mochi` type-checks because it has exactly these fields with these types. Miss one, or use a string for the price, and the compiler stops you.",
        },
        {
          type: "text",
          md: [
            "## Optional and readonly fields",
            "Two modifiers you'll reach for constantly:",
            "- **Optional** — a `?` after the name means the field may be missing: `notes?: string`. Its type becomes `string | undefined`, so the compiler forces you to check before using it.\n- **`readonly`** — the field can be set when the object is created but never reassigned after: `readonly id: string`. Perfect for an ID or a `createdAt` — things that should never change once written.",
            "> `readonly` is compile-time only — it won't stop a determined runtime hack, but it catches the accidental `booking.id = ...` in your own code, which is what you actually want.",
          ],
        },
        {
          type: "quiz",
          q: "You want a booking's `id` to be assignable when the booking is created but never changed afterwards. Which field declaration does that?",
          choices: [
            "`readonly id: string`",
            "`id?: string`",
            "`const id: string`",
            "`id: string | never`",
          ],
          answer: 0,
          explain: "`readonly` allows the value at construction and freezes it thereafter — exactly right for an id. `?` would make it *optional* (a different meaning), and `const` declares variables, not object fields.",
          nudge: "One modifier means 'optional', another means 'set once, then frozen'. You want the second.",
        },
        {
          type: "text",
          md: [
            "## Union & literal types",
            "A **union** (`A | B`) says a value is one of several types. Combine it with **literal types** — where a specific string *is* the type — and you get something powerful: a field that can only ever be one of a fixed set of words.",
            "A booking's status is the classic case. It's never any old string; it's exactly one of three: `pending`, `confirmed`, or `cancelled`. Model that and the compiler rejects a typo like `\"confirmd\"` before it reaches the database:",
            "```ts\ntype BookingStatus = \"pending\" | \"confirmed\" | \"cancelled\";\n```",
            "> This is a senior move in interviews: 'I model the status as a union of literals so illegal states are unrepresentable' beats 'it's a string and we validate it somewhere.'",
          ],
        },
        {
          type: "code",
          title: "src/bookings/booking.entity.ts",
          source: String.raw`type BookingStatus = "pending" | "confirmed" | "cancelled";

interface Booking {
  readonly id: string;      // set once, never changes
  walkerId: string;
  status: BookingStatus;    // only the three allowed values
  notes?: string;           // optional — may be undefined
}

const booking: Booking = {
  id: "b_1",
  walkerId: "w_1",
  status: "pending",
};`,
          caption: "No `notes` field on `booking` — and that's fine, because `notes?` is optional. Try `status: \"paid\"` and the compiler rejects it: `paid` isn't in the union.",
        },
        {
          type: "exercise",
          title: "Model a Booking",
          prompt: [
            "Write two declarations:",
            "1. A `type BookingStatus` that is the union of the three string literals `\"pending\"`, `\"confirmed\"`, and `\"cancelled\"`.",
            "2. An `interface Booking` with: a `readonly id: string`, a `walkerId: string`, a `status: BookingStatus`, and an **optional** `notes: string`.",
          ],
          starter: String.raw`// Define BookingStatus and the Booking interface.
// your code here`,
          solution: String.raw`type BookingStatus = "pending" | "confirmed" | "cancelled";

interface Booking {
  readonly id: string;
  walkerId: string;
  status: BookingStatus;
  notes?: string;
}`,
          checks: [
            { re: /type BookingStatus="pending"\|"confirmed"\|"cancelled"/, hint: "A union of literals uses `|`: `type BookingStatus = \"pending\" | \"confirmed\" | \"cancelled\"`." },
            { re: /readonly id:string/, hint: "The id is set once — mark it `readonly id: string`." },
            { re: /status:BookingStatus/, hint: "Reuse your union type for the field: `status: BookingStatus`." },
            { re: /notes\?:string/, hint: "Make notes optional with `?`: `notes?: string`." },
          ],
          mustNot: [
            { re: /notes:string;/, hint: "`notes` should be optional — write `notes?: string`, not `notes: string`." },
          ],
          success: "You just wrote a real entity shape: a literal union for status, a readonly id, and an optional field. This is exactly how the PawWalk backend describes its data.",
        },
      ],
    },
    {
      id: "functions-async-generics",
      title: "Functions, async & a first generic",
      steps: [
        {
          type: "text",
          md: [
            "## Typed functions",
            "A function is a boundary — the place annotations earn their keep. You type each **parameter** and the **return** value; TypeScript checks every call site against that contract.",
            "```ts\nfunction priceLabel(cents: number): string {\n  return \"$\" + (cents / 100).toFixed(2);\n}\n```",
            "Read it as: takes a `number`, gives back a `string`. Call it with a string and the compiler stops you. Arrow-function form is the same contract: `const priceLabel = (cents: number): string => ...`.",
          ],
        },
        {
          type: "code",
          title: "A typed function and its arrow twin",
          source: String.raw`function totalCents(prices: number[]): number {
  return prices.reduce((sum, p) => sum + p, 0);
}

// Same contract, arrow style:
const isBookable = (walker: Walker): boolean => walker.isAvailable;`,
          caption: "`totalCents` takes `number[]` and returns `number`; `isBookable` takes a `Walker` and returns `boolean`. The types document the function and guard every caller at once.",
        },
        {
          type: "text",
          md: [
            "## `async` functions return a `Promise<T>`",
            "Backends spend their lives waiting — on a database, on another API. TypeScript handles that with `async`/`await`, almost exactly like Swift.",
            "Mark a function `async` and its return type is wrapped in a **`Promise<T>`**: a value that isn't ready yet. Inside, `await` pauses until it resolves. A function that eventually yields a `Walker` is typed `Promise<Walker>`:",
            "```ts\nasync function loadWalker(id: string): Promise<Walker> { ... }\n```",
            "> We'll go deep on the event loop and `await` in module 02. For now, just read the shape: `async` in front, `Promise<...>` around the return.",
          ],
        },
        {
          type: "code",
          title: "Reading async off the signature",
          source: String.raw`// async in front, Promise<Walker[]> around the return type.
async function fetchWalkers(): Promise<Walker[]> {
  const res = await fetch("/walkers");   // await pauses until the reply lands
  return res.json();
}`,
          caption: "`fetch` returns a Promise, so we `await` it. The function is `async`, so its return type is `Promise<Walker[]>` — the caller `await`s it in turn. That's the whole rhythm of a Node backend.",
        },
        {
          type: "quiz",
          q: "A function is declared `async function findWalker(id: string)` and its body returns a `Walker`. What is its actual return type?",
          choices: [
            "`Promise<Walker>` — every `async` function wraps its return in a Promise",
            "`Walker` — `async` has no effect on the return type",
            "`Walker | undefined`, always",
            "`void` — async functions can't return a value",
          ],
          answer: 0,
          explain: "`async` always wraps the return type in `Promise<T>`. Even `return walker` (a plain `Walker`) becomes `Promise<Walker>` to the caller, who must `await` it. That's why module 02 spends its time on how those Promises are scheduled.",
          nudge: "What does `async` do to whatever a function returns?",
        },
        {
          type: "text",
          md: [
            "## A gentle first generic",
            "You've already seen one generic: `Array<Walker>` (the long form of `Walker[]`) — `Array` is a type that takes another type in the angle brackets, `Promise<Walker>` too. That `<T>` is a **generic**: a placeholder filled in per use.",
            "You can write your own. A `findById` helper works the same whether the list holds walkers or bookings — the only thing that changes is the element type. Capture that with a type parameter `T`, and constrain it to shapes that *have* an `id`:",
            "```ts\nfunction findById<T extends { id: string }>(items: T[], id: string): T | undefined {\n  return items.find((item) => item.id === id);\n}\n```",
            "Call it with `Walker[]` and you get back `Walker | undefined`; call it with `Booking[]` and you get `Booking | undefined`. One function, fully typed for both — no duplication, no `any`.",
          ],
        },
        {
          type: "exercise",
          title: "Write a generic finder",
          prompt: [
            "Write a generic function `findById`:",
            "- Type parameter `<T extends { id: string }>` — any shape that has a string `id`.",
            "- Parameters `items: T[]` and `id: string`.",
            "- Return type `T | undefined`.",
            "- Body: `return items.find((item) => item.id === id)`.",
          ],
          starter: String.raw`function findById(items, id) {
  // your code here
}`,
          solution: String.raw`function findById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}`,
          checks: [
            { re: /function findById<T extends\{id:string\}>/, hint: "Declare the constrained type parameter: `findById<T extends { id: string }>`." },
            { re: /\(items:T\[\],id:string\):T\|undefined/, hint: "Parameters are `(items: T[], id: string)` and the return type is `T | undefined`." },
            { re: /items\.find\(\(item\)=>item\.id===id\)/, hint: "Search the array: `items.find((item) => item.id === id)` — note the strict `===`." },
          ],
          mustNot: [
            { re: /:any/, hint: "Don't fall back to `any` — the whole point of the generic `T` is to stay fully typed." },
          ],
          success: "That's a real, reusable, fully typed generic — the same helper the PawWalk services lean on to look up any entity by id. You now have every TypeScript building block module 02 assumes.",
        },
      ],
    },
  ],
});
