window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "nest-kickoff",
  title: "NestJS: Modules, Controllers, Services",
  emoji: "🪺",
  lang: "ts",
  lessons: [
    {
      id: "why-nest",
      title: "Why Nest, and the three building blocks",
      steps: [
        {
          type: "text",
          md: [
            "## Express got you a server. Now what?",
            "Last module you answered `GET /walkers` with raw `node:http` and Express. For one route that's perfect. But a real PawWalk backend has walkers, bookings, auth, payments, and a job queue — dozens of routes, each needing the same database, the same logger, the same auth check. With bare Express you wire all of that by hand: pass the db into every handler, `require` files in the right order, and hope nobody imports a circular mess.",
            "**NestJS** is Express (or Fastify) underneath, plus the structure a *team* needs so the codebase survives past its first ten files. It gives you three things Express leaves you to invent: a way to **group** related code (modules), a way to **map HTTP to methods** (controllers), and a way to **hand dependencies to the code that needs them** (dependency injection). This lesson meets all three.",
            "> The senior pitch: `Express is a library — you assemble the architecture. Nest is a framework — the architecture is the product. On a team, that shared structure is worth more than the few lines of freedom you give up.`",
          ],
        },
        {
          type: "text",
          md: [
            "## The three building blocks",
            "Every Nest feature is the same trio. Learn it once for walkers and every other resource looks identical:",
            "- **Module** — a `@Module` class that groups a feature's pieces and declares what it exposes. `WalkersModule` owns everything walker-related. The root `AppModule` imports the feature modules.\n- **Controller** — a `@Controller` class whose methods are HTTP endpoints. `@Get`, `@Post`, `@Param`, `@Body` map a request to a method. Controllers are thin: they read the request and delegate.\n- **Provider / Service** — an `@Injectable` class holding the real work: business logic, database calls. `WalkersService.findAll()` is where the answer actually comes from.",
            "The flow of a request: **Controller** catches the HTTP call → calls a **Service** method → the Service does the work → the answer flows back out. The **Module** is the wiring diagram that connects them.",
          ],
        },
        {
          type: "text",
          md: [
            "## The CLI writes the boilerplate for you",
            "You almost never type a module or controller from scratch — the Nest CLI scaffolds them. Install it once, then generate:",
            "- `npm i -g @nestjs/cli` — the `nest` command.\n- `nest new pawwalk-api` — a fresh project with `AppModule`, testing, and `npm run dev` wired up.\n- `nest g module walkers` — creates `walkers.module.ts` and registers it in `AppModule`.\n- `nest g controller walkers` — creates `walkers.controller.ts` (plus a `.spec.ts` test) and adds it to `WalkersModule`.\n- `nest g service walkers` — creates `walkers.service.ts` and registers it as a provider.",
            "> `g` is short for `generate`. Three generate commands give you the whole trio, each already wired into the module. The CLI's job is to remove the excuse to skip the structure.",
          ],
        },
        {
          type: "quiz",
          q: "In Nest's three building blocks, where does the actual business logic — fetching walkers, checking a booking is valid — belong?",
          choices: [
            "In a provider/service (an @Injectable class)",
            "In the controller, right inside the @Get method",
            "In the @Module class",
            "In the main.ts bootstrap file",
          ],
          answer: 0,
          explain: "Controllers stay thin — they translate HTTP to a method call and nothing more. The real work lives in an @Injectable service, which is testable on its own and reusable by other controllers or services. A module just wires the two together.",
          nudge: "One of the three exists specifically to hold logic, separate from the HTTP layer.",
        },
        {
          type: "code",
          title: "src/walkers/walkers.service.ts",
          source: String.raw`import { Injectable } from "@nestjs/common";

export interface Walker {
  id: string;
  name: string;
  pricePer30MinCents: number;
}

@Injectable()
export class WalkersService {
  private readonly walkers: Walker[] = [
    { id: "1", name: "Mochi", pricePer30MinCents: 2000 },
    { id: "2", name: "Biscuit", pricePer30MinCents: 2500 },
  ];

  findAll(): Walker[] {
    return this.walkers;
  }

  findOne(id: string): Walker | undefined {
    return this.walkers.find((w) => w.id === id);
  }
}`,
          caption: "The @Injectable() decorator is the whole point: it marks this class as a provider Nest can construct and hand to whoever asks. No @Injectable, and Nest won't know how to inject it. (In-memory array for now — module 07 swaps in a real database behind the same two methods.)",
        },
        {
          type: "exercise",
          title: "Mark the service injectable",
          prompt: [
            "This service is missing the one thing that makes Nest willing to inject it. Add the `@Injectable()` decorator directly above `export class WalkersService`. The import is already there.",
          ],
          starter: String.raw`import { Injectable } from "@nestjs/common";

export class WalkersService {
  findAll() {
    return ["Mochi", "Biscuit"];
  }
}`,
          solution: String.raw`import { Injectable } from "@nestjs/common";

@Injectable()
export class WalkersService {
  findAll() {
    return ["Mochi", "Biscuit"];
  }
}`,
          checks: [
            { re: /@Injectable\(\)export class WalkersService\{/, hint: "Put `@Injectable()` on its own line directly above `export class WalkersService {` — the decorator has to sit on the class it marks." },
          ],
          mustNot: [
            { re: /@Injectable[^(]/, hint: "It's a decorator call — write `@Injectable()` with the parentheses, not a bare `@Injectable`." },
          ],
          success: "That decorator is Nest's green light: WalkersService is now a provider the container can build and inject. Next lesson, a controller asks for it.",
        },
      ],
    },
    {
      id: "controllers",
      title: "Controllers map HTTP to methods",
      steps: [
        {
          type: "text",
          md: [
            "## A controller is a routing table made of methods",
            "In Express you called `app.get(\"/walkers/:id\", handler)`. In Nest the route lives *on the method* as a decorator, and the class groups every route under one path prefix:",
            "- `@Controller(\"walkers\")` — every method in this class hangs off `/walkers`.\n- `@Get()` on a method → `GET /walkers`. `@Get(\":id\")` → `GET /walkers/:id`.\n- `@Post()` → `POST /walkers`.\n- `@Param(\"id\")` pulls `:id` out of the path into a method argument. `@Body()` gives you the parsed JSON body.",
            "The method's return value becomes the response body — Nest serializes it to JSON and sends `200` (or `201` for a `@Post`) for you. No `res.json()`, no `res.status()` in the common case.",
          ],
        },
        {
          type: "code",
          title: "src/walkers/walkers.controller.ts",
          source: String.raw`import { Controller, Get, Post, Param, Body } from "@nestjs/common";
import { WalkersService } from "./walkers.service";

@Controller("walkers")
export class WalkersController {
  constructor(private readonly walkers: WalkersService) {}

  @Get()
  findAll() {
    return this.walkers.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.walkers.findOne(id);
  }

  @Post()
  create(@Body() body: { name: string }) {
    return { created: body.name };
  }
}`,
          caption: "Four routes, zero boilerplate: the decorators are the routing table, and each method just delegates to the injected service. `this.walkers` arrives through the constructor — the next lesson is all about how.",
        },
        {
          type: "quiz",
          q: "Given `@Controller(\"walkers\")` on the class and `@Get(\":id\")` on a method, which HTTP request hits that method?",
          choices: [
            "GET /walkers/42",
            "GET /id",
            "POST /walkers",
            "GET /walkers",
          ],
          answer: 0,
          explain: "The controller prefix `walkers` and the method path `:id` combine into `/walkers/:id`. A GET to `/walkers/42` matches, and `@Param(\"id\")` hands the method `\"42\"`. `@Get()` with no argument would be the bare `/walkers` list.",
          nudge: "Concatenate the class prefix with the method's path segment.",
        },
        {
          type: "text",
          md: [
            "## Read the request, then delegate — don't do the work here",
            "The controller's whole job is translation: turn an HTTP request into a plain method call, and turn the return value back into a response. The moment you find yourself writing a database query or a price calculation inside a `@Get` method, it belongs in the service instead.",
            "> Red flag in an interview: a controller method with twenty lines of logic. Say `the controller is the HTTP adapter; the service is the logic` and keep them apart. Thin controllers are what make the logic unit-testable without spinning up HTTP.",
          ],
        },
        {
          type: "exercise",
          title: "Add the GET /walkers/:id endpoint",
          prompt: [
            "The controller already has an injected `walkers` service. Add a `findOne` method for `GET /walkers/:id`: decorate it with `@Get(\":id\")`, take the id with `@Param(\"id\") id: string`, and return `this.walkers.findOne(id)`.",
          ],
          starter: String.raw`@Controller("walkers")
export class WalkersController {
  constructor(private readonly walkers: WalkersService) {}

  // your code here
}`,
          solution: String.raw`@Controller("walkers")
export class WalkersController {
  constructor(private readonly walkers: WalkersService) {}

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.walkers.findOne(id);
  }
}`,
          checks: [
            { re: /@Get\(":id"\)/, hint: "Map the route with `@Get(\":id\")` on the line above the method." },
            { re: /findOne\(@Param\("id"\)id:string\)/, hint: "Pull the path param into an argument: `findOne(@Param(\"id\") id: string)`." },
            { re: /return this\.walkers\.findOne\(id\)/, hint: "Delegate to the service: `return this.walkers.findOne(id)` — the controller doesn't do the lookup itself." },
          ],
          mustNot: [
            { re: /\.find\(\(/, hint: "Don't search the array in the controller — hand the id to `this.walkers.findOne(id)` and let the service do it." },
          ],
          success: "That's a real Nest endpoint: the decorator is the route, `@Param` is the input, and the service does the work. Now let's see how `this.walkers` got there.",
        },
      ],
    },
    {
      id: "dependency-injection",
      title: "Dependency injection: the big idea",
      steps: [
        {
          type: "text",
          md: [
            "## Where did `this.walkers` come from?",
            "The controller used `this.walkers.findOne(id)` — but it never wrote `new WalkersService()`. That's **dependency injection (DI)**, and it's the single idea that makes Nest worth using.",
            "You *declare* what you need as a constructor parameter, and Nest's container *provides* it. The controller says `I need a WalkersService`; Nest builds one (once) and passes it in. The class never reaches out for its dependencies — they're handed to it. That inversion is the whole trick.",
            "```ts\nconstructor(private readonly walkers: WalkersService) {}\n```",
          ],
        },
        {
          type: "text",
          md: [
            "## Constructor injection, and the `private readonly` shorthand",
            "`private readonly walkers: WalkersService` is TypeScript doing two jobs at once. Because it's a constructor parameter with an access modifier, TS automatically creates a `this.walkers` field and assigns the argument to it — no `this.walkers = walkers` line needed. `readonly` means nobody can swap it out later.",
            "Nest reads the parameter's **type** (`WalkersService`) to know what to inject. It looks up that type in the module's provider list, constructs it if it hasn't already, and passes the instance in. That's why the service needed `@Injectable()` last lesson — it's how Nest knows the class is a thing it's allowed to build.",
          ],
        },
        {
          type: "text",
          md: [
            "## Providers are singletons — and that's why DI beats `new`",
            "By default Nest creates **one** instance of each provider and shares it everywhere it's injected. The `WalkersService` the controller gets is the *same* object the bookings service gets. One database pool, one cache, shared correctly — no bug from accidentally holding two.",
            "The payoff shows up in tests. If the controller did `new WalkersService()`, that real service — real database and all — is welded in; you can't test the controller without it. With DI you hand the controller a fake in the test and a real one in production, because it only ever asked for *a* `WalkersService`, not a specific instance:",
            "```ts\nconst controller = new WalkersController({\n  findOne: () => ({ id: \"1\", name: \"Mochi\" }),\n} as any);\n```",
            "> The one-liner that lands DI in an interview: `new couples a class to a concrete implementation; injection couples it to a type. Swapping the implementation — a stub in a test, a different db in staging — costs nothing because the class never named the instance.`",
          ],
        },
        {
          type: "quiz",
          q: "Why is constructor injection preferred over calling `new WalkersService()` inside the controller?",
          choices: [
            "The controller depends on the type, so you can swap in a fake service in tests without touching the controller",
            "`new` is not valid TypeScript inside a class",
            "Injection makes the service run on a separate thread",
            "It lets you skip the @Injectable() decorator on the service",
          ],
          answer: 0,
          explain: "`new` hard-wires one concrete implementation into the class — the real database comes along for the ride in every test. Injection means the class only asks for the type; production supplies the real singleton, a test supplies a stub. Decoupling from the concrete instance is the entire benefit.",
          nudge: "Think about writing a unit test for the controller without a real database attached.",
        },
        {
          type: "code",
          title: "src/walkers/walkers.module.ts",
          source: String.raw`import { Module } from "@nestjs/common";
import { WalkersController } from "./walkers.controller";
import { WalkersService } from "./walkers.service";

@Module({
  controllers: [WalkersController],
  providers: [WalkersService],
})
export class WalkersModule {}`,
          caption: "The wiring diagram. `controllers` lists the classes that handle HTTP; `providers` lists the injectables Nest may construct and hand out. Because WalkersService is a provider here, Nest can satisfy the controller's constructor. Forget to list it and you get the classic 'Nest can't resolve dependencies of WalkersController' error at startup.",
        },
        {
          type: "exercise",
          title: "Inject the service through the constructor",
          prompt: [
            "Give this controller its dependency. Add a constructor that injects `WalkersService` as `private readonly walkers` — the `private readonly` shorthand creates the `this.walkers` field for you, and the type tells Nest what to inject.",
          ],
          starter: String.raw`@Controller("walkers")
export class WalkersController {
  // your code here

  @Get()
  findAll() {
    return this.walkers.findAll();
  }
}`,
          solution: String.raw`@Controller("walkers")
export class WalkersController {
  constructor(private readonly walkers: WalkersService) {}

  @Get()
  findAll() {
    return this.walkers.findAll();
  }
}`,
          checks: [
            { re: /constructor\(private readonly walkers:WalkersService\)\{\}/, hint: "Declare it as `constructor(private readonly walkers: WalkersService) {}` — the access modifier makes the `this.walkers` field automatically." },
          ],
          mustNot: [
            { re: /new WalkersService/, hint: "Don't `new` it — declare it as a constructor parameter and let Nest inject the shared instance." },
          ],
          success: "That constructor is the ask; the module's provider list is the supply. Nest matches them at startup and `this.walkers` is ready before the first request. You've now built the full trio: module, controller, service.",
        },
      ],
    },
  ],
});
