window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "modules-npm",
  title: "Modules & npm",
  emoji: "📦",
  lang: "ts",
  lessons: [
    {
      id: "import-export",
      title: "Splitting the app with import/export",
      steps: [
        {
          type: "text",
          md: [
            "## One file is where backends go to die",
            "The PawWalk backend has walkers, bookings, auth, payments. Pour all of that into one `index.ts` and every change means scrolling a 2,000-line file, every merge is a conflict, and nobody can find anything. The fix is **modules**: one file, one job. A `walkers` module owns walker code; a `bookings` module owns booking code; each **exports** what others may use and keeps the rest private.",
            "> A module's exports are its public API. Everything you *don't* export is private by default — the module's implementation detail. That single rule is how a backend stays understandable at 50 files instead of 5.",
          ],
        },
        {
          type: "code",
          title: "src/walkers/walkers.module.ts",
          source: String.raw`export interface Walker {
  id: string;
  name: string;
  pricePer30MinCents: number;
}

// A named export: imported by its exact name, { dollars }.
export function dollars(cents: number): number {
  return cents / 100;
}

// The default export: one per file, imported under any name.
export default class WalkersService {
  private walkers: Walker[] = [];

  findAll(): Walker[] {
    return this.walkers;
  }
}`,
          caption: "Two flavours of export. `dollars` and `Walker` are **named** exports — the caller must ask for them by name. `WalkersService` is the **default** export — the file's headline thing, and a file gets at most one.",
        },
        {
          type: "text",
          md: [
            "## Named vs default — when to reach for which",
            "- **Named export** (`export function dollars`) — for a file that offers several things. The import must match the name, which makes the whole codebase greppable: search `dollars` and you find every use.\n- **Default export** (`export default class WalkersService`) — for a file whose whole point is one thing. The importer picks the local name, so it's easy to rename by accident and harder to grep.",
            "Most teams — and Nest itself — lean on **named exports** for exactly that greppability. Reach for a default only when the file truly is one class or one function.",
            "> Red flag in an interview: renaming a default import to something unrelated (`import Foo from \"./walkers.module\"`). It compiles, but the next reader has no idea `Foo` is the walkers service. Named exports make the code say what it is.",
          ],
        },
        {
          type: "code",
          title: "src/bookings/bookings.service.ts",
          source: String.raw`import WalkersService, { dollars, Walker } from "../walkers/walkers.module";

export class BookingsService {
  constructor(private readonly walkers: WalkersService) {}

  quote(walker: Walker, minutes: number): number {
    return dollars(walker.pricePer30MinCents) * (minutes / 30);
  }
}`,
          caption: "One import line pulls both flavours: the default (`WalkersService`, no braces) and the named ones (`{ dollars, Walker }`, in braces). The relative path `../walkers/walkers.module` points at the file — no `.ts` extension needed for the module specifier here.",
        },
        {
          type: "quiz",
          q: "You wrote `export function dollars(cents: number)` in `walkers.module.ts`. How does `bookings.service.ts` import it?",
          choices: [
            "import { dollars } from \"../walkers/walkers.module\" — a named import, braces required",
            "import dollars from \"../walkers/walkers.module\" — named imports don't use braces",
            "It's automatic; anything in another file is globally visible",
            "import * dollars — the star form is how you import one function",
          ],
          answer: 0,
          explain: "A **named** export is imported by wrapping its exact name in braces: `import { dollars } from \"...\"`. No braces is the syntax for the **default** export. And nothing crosses a file boundary unless it's exported — there are no implicit globals.",
          nudge: "Named exports and default exports use different import syntax. Which one needs braces?",
        },
        {
          type: "exercise",
          title: "Export a helper from the walkers module",
          prompt: [
            "In `walkers.module.ts`, add a **named** export: a function `dollars` that takes `cents: number` and returns a `number` — the cents divided by 100. Other modules will import it by name.",
            "> Use ESM `export`, not `module.exports` — this course is ES modules throughout.",
          ],
          starter: String.raw`export interface Walker {
  id: string;
  name: string;
  pricePer30MinCents: number;
}

// your code here`,
          solution: String.raw`export interface Walker {
  id: string;
  name: string;
  pricePer30MinCents: number;
}

export function dollars(cents: number): number {
  return cents / 100;
}`,
          checks: [
            { re: /export function dollars\(cents:number\):number\{/, hint: "Start with the `export` keyword so other files can import it: `export function dollars(cents: number): number {`." },
            { re: /return cents\/100/, hint: "Return the cents divided by 100: `return cents / 100;`." },
          ],
          mustNot: [
            { re: /module\.exports/, hint: "Use the ESM `export` keyword, not CommonJS `module.exports` — this project is ES modules." },
          ],
          success: "That's a named export. Any module can now `import { dollars } from \"./walkers.module\"` — you just widened this file's public API by exactly one function.",
        },
      ],
    },
    {
      id: "esm-vs-cjs",
      title: "ESM vs CommonJS (and the singleton hiding inside)",
      steps: [
        {
          type: "text",
          md: [
            "## Node has two module systems — know both",
            "You just wrote **ES Modules** (ESM): `import` / `export`. It's the modern standard and what this course uses. But Node ran for a decade on an older system, **CommonJS** (CJS): `require()` / `module.exports`. You'll meet CJS in older packages and legacy code, so you need to read it.",
            "The difference an interviewer wants to hear:\n- **ESM is static** — `import`s are resolved before the code runs, so tools can see the whole dependency graph. That enables **tree-shaking** (dropping unused exports from a bundle) and top-level `await`.\n- **CJS is dynamic and synchronous** — `require()` is a function call that runs at that line and blocks until the module is loaded. Flexible, but nothing can analyse it ahead of time.",
          ],
        },
        {
          type: "code",
          title: "walkers.cjs — the same idea in CommonJS",
          source: String.raw`// Define exports by assigning to module.exports:
function dollars(cents) {
  return cents / 100;
}

module.exports = { dollars };

// Consume them with require() — a synchronous function call:
// const { dollars } = require("./walkers.cjs");`,
          caption: "CJS in one screen: `module.exports` is the object a file hands back, and `require(...)` runs right there and returns it. Compare to ESM's `export` / `import` — same goal, different mechanics, and the mechanics are the whole interview question.",
        },
        {
          type: "text",
          md: [
            "## The require cache makes every module a singleton",
            "Here's the fact that trips people up. The **first** time any file is imported, Node runs it top to bottom and **caches** the result. Every later import of the same file gets that **same cached object back** — the file's top-level code never runs a second time.",
            "So a module is a de-facto **singleton**. If `walkers.module.ts` creates one `WalkersService` at the top level, every importer shares that one instance and its state:",
            "```ts\n// walkers.module.ts\nexport const service = new WalkersService(); // runs once, shared everywhere\n```",
            "> This is the mental model behind **NestJS providers** (module 05). Nest formalises what the module cache does informally: one instance, created once, injected everywhere. Say *\"a module is cached, so a top-level instance is effectively a singleton\"* and you've explained half of dependency injection before you've written a decorator.",
          ],
        },
        {
          type: "text",
          md: [
            "## Circular imports and how resolution works",
            "**Circular dependency:** `walkers` imports `bookings` and `bookings` imports `walkers`. Because a module is cached mid-load, one side can be left half-initialised: in **CommonJS** it receives `undefined` where a class should be and crashes at runtime; in **ES modules**, live bindings mean you instead hit a `ReferenceError: Cannot access 'X' before initialization` if you touch the export too early. Two fixes: **restructure** so the shared thing lives in a third module both import, or **lazy-import** inside the function that needs it instead of at the top. Restructuring is the senior move — a cycle is usually a design smell.",
            "**Module resolution** — how Node turns `import x from \"y\"` into a file. It checks, in order:\n1. **Core modules** — a bare name like `node:fs` or `http` is Node's own built-in.\n2. **`node_modules`** — a bare name like `@nestjs/common` is an installed dependency; Node walks up the folder tree looking in each `node_modules`.\n3. **A file path** — a specifier starting with `./` or `../` (like `./walkers.module`) is one of your own files, resolved relative to the importer.",
          ],
        },
        {
          type: "quiz",
          q: "A module imported in ten different files — how many times does its top-level code run?",
          choices: [
            "Once — Node caches the module, and every later import returns the same cached object",
            "Ten times, once per importing file",
            "Once per function that uses it",
            "Never, until you call a function from it",
          ],
          answer: 0,
          explain: "Node runs a module's top-level code exactly **once**, on first import, then caches the result. All ten importers share that one object — which is precisely why a top-level instance behaves like a singleton, and the foundation Nest's providers build on.",
          nudge: "Think about the require/import cache. Does importing the same file twice re-run it?",
        },
      ],
    },
    {
      id: "package-json-npm",
      title: "package.json, npm, and scripts",
      steps: [
        {
          type: "text",
          md: [
            "## The manifest at the root of every project",
            "You met `package.json` in the welcome module — it's the project's manifest, the equivalent of Swift's `Package.swift`. It names the project, declares which packages it depends on, and defines the `scripts` you run. Every command in this course runs from a folder that has one.",
            "The `\"type\": \"module\"` line is the one to remember: it tells Node to treat every `.js` file as **ESM** (`import`/`export`). Without it, Node defaults to **CommonJS** (`require`). That single field is why the `import` syntax from lesson 1 just works.",
          ],
        },
        {
          type: "code",
          title: "package.json",
          source: String.raw`{
  "name": "pawwalk-api",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "test": "jest"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "typescript": "^5.6.0"
  }
}`,
          caption: "The four fields that matter early: `type` (module system), `scripts` (your commands), `dependencies` (what ships to production), and `devDependencies` (build- and test-only tools like `jest` and `typescript`, never bundled into the running server).",
        },
        {
          type: "text",
          md: [
            "## install, the lockfile, and node_modules",
            "- **`npm install`** (or `npm i`) reads `package.json`, downloads every dependency (and their dependencies) into the **`node_modules`** folder, and writes a **`package-lock.json`**.\n- **`package-lock.json`** pins the *exact* version of every package in the whole tree. `package.json` says `^11.0.0` (a range); the lockfile says `11.0.3` (a fact). Commit it — it's what makes `npm ci` on CI install byte-for-byte what you tested.\n- **`node_modules`** is the installed output — huge, machine-specific, and **never committed** (it's in `.gitignore`). Delete it and `npm install` rebuilds it from the lockfile.",
            "> Red flag: committing `node_modules` or `.gitignore`-ing `package-lock.json`. The lockfile is the reproducibility contract; the folder is disposable build output. Interviewers ask which you commit — the answer is the lockfile, not the folder.",
          ],
        },
        {
          type: "text",
          md: [
            "## scripts and npx",
            "The `scripts` map turns long commands into short verbs you run with **`npm run <name>`** (`start` and `test` are so common you can drop the `run`):",
            "- **`npm run dev`** → `nest start --watch` — your inner loop, rebuilds on save.\n- **`npm run build`** → compile TypeScript to JavaScript for production.\n- **`npm test`** → run the Jest suite.",
            "**`npx <tool>`** runs a package's CLI **without installing it globally** — it uses a local copy or fetches it on the fly. `npx nest generate service walkers` scaffolds a service; `npx prisma migrate` (module 07) runs migrations. It keeps one-off tools out of your global install and pinned to the project's version.",
          ],
        },
        {
          type: "quiz",
          q: "Your teammate clones the repo and runs `npm install`. Why does committing `package-lock.json` matter here?",
          choices: [
            "It pins the exact version of every package, so they install byte-for-byte the tree you tested",
            "It contains the downloaded packages, so they don't need a network connection",
            "It is the compiled JavaScript that ships to production",
            "It lists only your direct dependencies and ignores their dependencies",
          ],
          answer: 0,
          explain: "`package.json` records version *ranges* (`^11.0.0`); `package-lock.json` records the *resolved* version of every package in the entire dependency tree. Commit it and everyone — teammates and CI — installs an identical tree, so \"works on my machine\" stops being a debugging session. The packages themselves live in `node_modules`, which is not committed.",
          nudge: "One file says 'roughly this version', the other says 'exactly this version, top to bottom'. Which gives reproducible installs?",
        },
        {
          type: "exercise",
          title: "Import from the walkers module",
          prompt: [
            "In `bookings.service.ts`, write the import line that pulls **three** things from `../walkers/walkers.module`: the default export as `WalkersService`, and the named exports `dollars` and `Walker`.",
            "> The default (no braces) comes first, then the named ones in braces: `import Default, { a, b } from \"...\"`.",
          ],
          starter: String.raw`// bookings.service.ts
// your code here

export class BookingsService {}`,
          solution: String.raw`// bookings.service.ts
import WalkersService, { dollars, Walker } from "../walkers/walkers.module";

export class BookingsService {}`,
          checks: [
            { re: /import WalkersService,/, hint: "The default export comes first with no braces, then a comma: `import WalkersService, ...`." },
            { re: /\{dollars,Walker\}/, hint: "List the named imports in braces, comma-separated: `{ dollars, Walker }`." },
            { re: /from"\.\.\/walkers\/walkers\.module"/, hint: "End with the relative path: `from \"../walkers/walkers.module\"`." },
          ],
          mustNot: [
            { re: /require\(/, hint: "Use an ESM `import`, not CommonJS `require()` — the project sets `\"type\": \"module\"`." },
          ],
          success: "That one line mixes a default and named imports from the same file — the exact shape you'll write in every Nest module that leans on another. Next module: the raw HTTP server underneath it all.",
        },
      ],
    },
  ],
});
