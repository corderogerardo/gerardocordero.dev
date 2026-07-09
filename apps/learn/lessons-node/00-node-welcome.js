window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "node-welcome",
  title: "Welcome to Node & NestJS",
  emoji: "🟢",
  lang: "ts",
  lessons: [
    {
      id: "welcome",
      title: "Why Node & NestJS",
      steps: [
        {
          type: "text",
          md: [
            "## The server behind the app",
            "In the iOS course you built the PawWalk app. Every screen — the walker list, the booking form, login — worked by **asking a server for data** over HTTP. This course builds that server in **TypeScript on Node.js**, using **NestJS**: the other side of the URL. (Never written Node? Perfect — this course assumes zero backend experience and explains as it goes.)",
            "**Node.js** runs JavaScript/TypeScript outside the browser on a single-threaded, event-driven, non-blocking I/O model — one thread juggling thousands of connections by never sitting idle waiting on the network or disk. **NestJS** is the framework on top: it gives that runtime real structure — modules, dependency injection, decorators — the kind of scaffolding a team needs so a codebase stays maintainable past its first ten files.",
          ],
        },
        {
          type: "text",
          md: [
            "## The course map",
            "- **The language & the runtime** (modules 01–03) — TypeScript for the backend, the event loop and async/await, and how modules and npm work.\n- **HTTP, then Nest** (04–06) — a raw `node:http` server, then NestJS: controllers, providers, dependency injection, DTOs and validation.\n- **Rebuild the PawWalk backend** (07–11) — Prisma and a database, the walkers API, JWT auth, bookings with transactions, and streams + a job queue.\n- **Prove it & ship it** (12–13) — testing with Jest/Supertest, then security hardening, graceful shutdown, Docker, and graduation.",
            "> The senior bar in Node interviews is not syntax — it's **judgment**: the event loop, backpressure, idempotency, and trade-offs said out loud. This course teaches the how *and* the why so you can explain your decisions, not just make them.",
          ],
        },
        {
          type: "code",
          title: "src/walkers/walkers.controller.ts (a taste)",
          source: String.raw`import { Controller, Get, Param } from "@nestjs/common";
import { WalkersService } from "./walkers.service";

@Controller("walkers")
export class WalkersController {
  constructor(private readonly walkers: WalkersService) {}

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.walkers.findOne(id);
  }
}`,
          caption: "Real code you'll build. The iOS app called `GET /walkers/:id`; this is the code that answers it. The `@Controller`/`@Get` decorators map HTTP to methods, and the service arrives by dependency injection through the constructor — the big idea of module 05.",
        },
        {
          type: "quiz",
          q: "What makes Node.js well suited to backend web services?",
          choices: [
            "A single-threaded, non-blocking event loop that handles many concurrent connections without a thread per request",
            "It compiles to a GPU kernel for parallel math",
            "It runs only in the browser, so no server is needed",
            "It blocks on each request until the database replies, keeping order simple",
          ],
          answer: 0,
          explain: "Node's event loop lets one thread start thousands of I/O operations and react as each completes, instead of parking a thread on every slow database or network call. That's why it excels at I/O-heavy APIs — and why blocking the loop (module 02) is the cardinal sin.",
          nudge: "Think about what a server does all day: wait on the network and database for many clients at once.",
        },
        {
          type: "text",
          md: [
            "## How TypeScript reads, coming from Swift",
            "- **`const`/`let` declare** — `const name = \"Mochi\"` is Swift's `let name = \"Mochi\"`; `let` is the reassignable `var`. Types are inferred; you write them at boundaries.\n- **`interface` and `type`** describe shapes — like a Swift `struct`'s stored properties, but erased at runtime.\n- **`async`/`await`** work almost exactly as in Swift — an `async` function returns a `Promise` (Swift's `Task` result).\n- **Decorators** (`@Controller`, `@Injectable`) attach metadata Nest reads at startup — there's nothing quite like them in Swift, and module 05 unpacks them.",
            "> The exercises check your TypeScript right here in the browser, exactly like Part I. Same rules: type it, don't paste it.",
          ],
        },
        {
          type: "exercise",
          title: "Your first TypeScript",
          prompt: [
            "Declare `name` as `\"Mochi\"` with `const`, then declare a `greeting` of type `string` that concatenates `\"Welcome, \"` and `name` using `+`.",
            "> Heads up: this course avoids TypeScript template literals (backticks) in typed exercises — build strings with `+` instead.",
          ],
          starter: String.raw`function welcome() {
  // your code here
}`,
          solution: String.raw`function welcome() {
  const name = "Mochi";
  const greeting: string = "Welcome, " + name;
  return greeting;
}`,
          checks: [
            { re: /const name="Mochi"/, hint: "Declare it with `const name = \"Mochi\"` — `const` for a value that never changes." },
            { re: /const greeting:string=/, hint: "Annotate the type: `const greeting: string = ...`." },
            { re: /"Welcome,"\+name/, hint: "Concatenate with `+`: `\"Welcome, \" + name`. (Normalization drops the space inside the check, but keep it in your string.)" },
          ],
          mustNot: [
            { re: /var greeting/, hint: "Prefer `const` here — the value doesn't change. Reach for `let` only when you reassign." },
          ],
          success: "That's real TypeScript: `const`, a type annotation, and string concatenation. Next module you'll see why Node runs it without a browser.",
        },
      ],
    },
    {
      id: "toolchain",
      title: "Set up your toolchain",
      steps: [
        {
          type: "text",
          md: [
            "## One runtime, one package manager",
            "Swift needed Xcode. Node needs the Node runtime and npm (which ships with it):",
            "1. **Node 24 LTS** — the runtime plus `npm` (macOS: `brew install node`, or the installer from nodejs.org). Use an LTS version for anything real.\n2. **The Nest CLI**, once you reach module 05: `npm i -g @nestjs/cli`.",
            "A Node project is defined by a **`package.json`** at its root — the equivalent of `Package.swift`. It names the project, lists dependencies, and defines the `scripts` you run. You create it with `npm init`.",
          ],
        },
        {
          type: "text",
          md: [
            "## The commands you'll live in",
            "- **`npm install`** (or `npm i`) — download dependencies into `node_modules` and write `package-lock.json`.\n- **`npm run dev`** — start the app in watch mode (Nest rebuilds on save). Your inner-loop command.\n- **`npm test`** — run the test suite (Jest).\n- **`npm run build`** — compile TypeScript to JavaScript for production.\n- **`npx <tool>`** — run a package's CLI without a global install (e.g. `npx nest generate`).",
          ],
        },
        {
          type: "xcode",
          label: "Over to the terminal",
          title: "Create and run your first Node project",
          intro: ["Get the toolchain working end to end. Keep this workflow — every module in the course starts from a `package.json`."],
          items: [
            "Install Node (skip if `node --version` already prints v24 or newer): `brew install node`",
            "Make a scratch project: `mkdir pawwalk-api && cd pawwalk-api`",
            "`npm init -y` — creates `package.json`, marking this folder a Node project",
            "Save `console.log(\"Welcome, Mochi\")` as `index.js`",
            "`node index.js` — should print `Welcome, Mochi`",
            "Add a script: in `package.json` set `\"scripts\": { \"start\": \"node index.js\" }`, then run `npm start`",
          ],
        },
        {
          type: "quiz",
          q: "What is `package.json`'s role in a Node project?",
          choices: [
            "It names the project, pins its dependencies, and defines the scripts you run",
            "It is the compiled output that ships to production",
            "It stores your database rows",
            "It is required only for front-end projects, not backends",
          ],
          answer: 0,
          explain: "`package.json` is the manifest: metadata, the dependency list (which `npm install` resolves into `node_modules` and locks in `package-lock.json`), and the `scripts` map that gives you `npm run dev`, `npm test`, and friends. Every module in this course lives inside one.",
          nudge: "Think about the single file that tells npm what to install and what commands exist.",
        },
      ],
    },
  ],
});
