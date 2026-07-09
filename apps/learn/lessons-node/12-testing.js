window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "testing",
  title: "Testing the API",
  emoji: "🧪",
  lang: "ts",
  lessons: [
    {
      id: "unit-in-isolation",
      title: "The pyramid, and a unit test in isolation",
      steps: [
        {
          type: "text",
          md: [
            "## Shape your tests like a pyramid, not an ice-cream cone",
            "You've built the whole PawWalk backend — walkers, bookings, auth, a job queue. Now you have to trust it under change. The senior move is deciding *where* to spend test effort, because not all tests cost the same. The **test pyramid** is the standard answer: a wide base of **unit** tests (many, fast, no I/O), a thinner middle of **integration** tests (a few real wirings — a service plus its database), and a tiny cap of **end-to-end** tests (fewest, slowest, boot the whole app).",
            "- **Unit** — one class, its dependencies mocked. Milliseconds each. Run thousands on every save.\n- **Integration** — a couple of real pieces together (a service against a test database).\n- **E2E** — a real HTTP request through the whole Nest app, top to bottom.",
            "> The senior pitch: `Fast tests you run constantly catch bugs while the code is still in your head; slow ones you run rarely catch them after you've moved on. I invest at the base of the pyramid so the feedback loop stays tight.`",
          ],
        },
        {
          type: "text",
          md: [
            "## The common mistake: over-investing in e2e",
            "The tempting trap is the **ice-cream cone** — mostly e2e, barely any unit tests. It feels thorough: every test drives the real app, so surely it's realistic. In practice it's the worst place to live. E2e tests are slow (each boots the app and hits a database), flaky (timing, network, shared state), and when one fails it tells you *something* broke across dozens of files — not *which line*.",
            "A unit test that fails names the exact method and branch. A hundred of them run in the time one e2e test takes. So the rule: **push each test as far down the pyramid as it will go.** Only test at e2e what you genuinely can't prove lower — that the routing, guards, and serialization actually connect end to end.",
            "> Red flag in an interview: `we test everything through the UI / through real HTTP.` It signals a slow, flaky suite nobody trusts. Say instead: `I unit-test the logic in isolation and keep a thin e2e layer to prove the wiring.`",
          ],
        },
        {
          type: "text",
          md: [
            "## Unit-testing a Nest provider: mock at the boundary",
            "To test `WalkersService` in isolation you must cut it off from the real database. The service depends on `PrismaService` (injected in the constructor). In the test you build a tiny Nest module that provides the *real* service but a *fake* Prisma — a plain object whose methods are `jest.fn()` stand-ins. That's mocking **at the boundary**: everything inside the service runs for real; only the edge that would hit Postgres is faked.",
            "The tool is `Test.createTestingModule(...)` from `@nestjs/testing`. It's the same DI container Nest uses at runtime, but you decide what goes in the `providers` list — so you swap the dependency you don't want to touch:",
            "- `{ provide: PrismaService, useValue: prismaMock }` — 'when something asks for `PrismaService`, hand it this object instead.'\n- `jest.fn()` — a recording stub. It remembers every call, and `.mockResolvedValue(x)` makes it return a resolved promise of `x` (Prisma methods are async).",
          ],
        },
        {
          type: "code",
          title: "src/walkers/walkers.service.spec.ts",
          source: String.raw`import { Test } from "@nestjs/testing";
import { WalkersService } from "./walkers.service";
import { PrismaService } from "../prisma/prisma.service";

describe("WalkersService", () => {
  let service: WalkersService;
  const prisma = {
    walker: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        WalkersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = moduleRef.get(WalkersService);
  });

  it("returns the walkers the database hands back", async () => {
    const rows = [{ id: "1", name: "Mochi", pricePer30MinCents: 2000 }];
    prisma.walker.findMany.mockResolvedValue(rows);

    const result = await service.findAll();

    expect(result).toEqual(rows);
    expect(prisma.walker.findMany).toHaveBeenCalled();
  });
});`,
          caption: "The real WalkersService, a fake Prisma. beforeEach compiles a fresh module so each test starts clean. The test controls what the boundary returns (mockResolvedValue) and then asserts both the output (toEqual) and that the service actually asked the db (toHaveBeenCalled).",
        },
        {
          type: "quiz",
          q: "Why mock PrismaService with `jest.fn()` instead of pointing the unit test at a real test database?",
          choices: [
            "So the test exercises only WalkersService's logic — fast, deterministic, and failing only when the service itself is wrong",
            "Because Nest forbids real database access inside any spec file",
            "So the test can run WalkersService on a separate thread",
            "Because jest.fn() is faster to type than a database connection string",
          ],
          answer: 0,
          explain: "A unit test isolates one unit. Mocking at the boundary keeps the test in milliseconds and deterministic — no Postgres to boot, no shared rows, no network. If it fails, the bug is in WalkersService, not in the database or its data. Testing against a real db is a valid *integration* test, one rung up the pyramid, where you accept the cost on purpose.",
          nudge: "Think about what a failing test should point at, and how long a thousand of them should take.",
        },
        {
          type: "exercise",
          title: "Build the mock and prove it was called",
          prompt: [
            "Two things make this an isolated unit test: a fake boundary and proof the service used it. Set `findMany` to a `jest.fn()` in the `prisma` mock, and after `findAll()` runs, assert the mock was hit with `expect(prisma.walker.findMany).toHaveBeenCalled()`.",
          ],
          starter: String.raw`const prisma = { walker: { findMany: /* your code here */ } };

it("asks the database for every walker", async () => {
  prisma.walker.findMany.mockResolvedValue([]);
  await service.findAll();
  // your code here
});`,
          solution: String.raw`const prisma = { walker: { findMany: jest.fn() } };

it("asks the database for every walker", async () => {
  prisma.walker.findMany.mockResolvedValue([]);
  await service.findAll();
  expect(prisma.walker.findMany).toHaveBeenCalled();
});`,
          checks: [
            { re: /findMany:jest\.fn\(\)/, hint: "Make the boundary a recording stub: `findMany: jest.fn()`. Only a jest.fn() can carry `.mockResolvedValue()` and be asserted on." },
            { re: /expect\(prisma\.walker\.findMany\)\.toHaveBeenCalled\(\)/, hint: "Assert the service reached the boundary: `expect(prisma.walker.findMany).toHaveBeenCalled()`." },
          ],
          mustNot: [
            { re: /new PrismaService/, hint: "Don't construct a real PrismaService — the whole point is to replace it with the `jest.fn()` mock so no database is touched." },
          ],
          success: "That's an isolated unit test: a faked boundary plus a `toHaveBeenCalled` that proves the service actually used it. `jest.fn()` is a spy and a stub in one.",
        },
        {
          type: "exercise",
          title: "Assert on the returned value",
          prompt: [
            "Now check the *output*, not just the interaction. `findMany` is already stubbed to resolve to `rows`. Run the service with `const result = await service.findAll()`, then assert the whole value with `expect(result).toEqual(rows)`.",
          ],
          starter: String.raw`it("returns the walkers the db hands back", async () => {
  const rows = [{ id: "1", name: "Mochi", pricePer30MinCents: 2000 }];
  prisma.walker.findMany.mockResolvedValue(rows);

  // your code here
});`,
          solution: String.raw`it("returns the walkers the db hands back", async () => {
  const rows = [{ id: "1", name: "Mochi", pricePer30MinCents: 2000 }];
  prisma.walker.findMany.mockResolvedValue(rows);

  const result = await service.findAll();
  expect(result).toEqual(rows);
});`,
          checks: [
            { re: /const result=await service\.findAll\(\)/, hint: "Run the code under test and capture the value: `const result = await service.findAll()` — `await` because the method is async." },
            { re: /expect\(result\)\.toEqual\(rows\)/, hint: "Compare the whole structure with `expect(result).toEqual(rows)` — `toEqual` is a deep, by-value comparison." },
          ],
          mustNot: [
            { re: /\.toBe\(rows\)/, hint: "Use `toEqual`, not `toBe`, for objects and arrays. `toBe` checks reference identity (===) and gives confusing failures the moment the value is rebuilt rather than the same instance." },
          ],
          success: "`toEqual` for structural equality, `toHaveBeenCalled` for interaction — the two assertions that cover almost every service test. In an interview: `I assert on the return value with toEqual, and on the collaborator with the spy — output and behavior.`",
        },
      ],
    },
    {
      id: "e2e-supertest",
      title: "End-to-end tests with Supertest",
      steps: [
        {
          type: "text",
          md: [
            "## The thin cap: prove the wiring end to end",
            "Unit tests proved the logic. But do the *pieces* connect? Does `GET /walkers` actually route to the controller, run the guard, call the service, and serialize JSON? That's what a single e2e test earns its keep proving — the wiring you can't see from any one unit.",
            "The tool is **Supertest**, and the trick is that it needs **no real port**. You boot the Nest app in memory, hand Supertest the app's underlying HTTP server object, and it fires requests straight at it. No `app.listen(3000)`, no sockets, no 'port already in use' flakiness — just a fast, real request through the whole stack.",
          ],
        },
        {
          type: "text",
          md: [
            "## Bootstrapping the app in a test",
            "The setup mirrors the unit test but imports the whole `AppModule` instead of listing providers by hand, then turns it into a running (but unlistened) application:",
            "- `Test.createTestingModule({ imports: [AppModule] })` — build the real module graph, exactly as production does.\n- `.createNestApplication()` — get an `INestApplication` (the same object `main.ts` calls `.listen()` on).\n- `await app.init()` — run startup: instantiate providers, apply middleware and guards. **Init, don't listen** — no port is bound.\n- `request(app.getHttpServer())` — `getHttpServer()` returns the raw Node HTTP server; Supertest drives it directly.\n- `await app.close()` in `afterAll` — tear down so the next suite starts clean.",
          ],
        },
        {
          type: "text",
          md: [
            "## Overriding a provider for the test",
            "Booting the *whole* app would normally drag in the real database. You don't want an e2e test to depend on live Postgres data — it should assert the wiring, with data you control. So you **override the provider** at the boundary, same idea as the unit mock but on the full module:",
            "```\nTest.createTestingModule({ imports: [AppModule] })\n  .overrideProvider(PrismaService)\n  .useValue(prismaMock)\n  .compile();\n```",
            "`.overrideProvider(X).useValue(fake)` tells Nest: 'build the entire AppModule, but wherever `X` would be injected, use this instead.' Now the request travels the real routing, guards, and pipes, but reads from your controlled fake. Override the boundary, keep the rest real.",
          ],
        },
        {
          type: "code",
          title: "test/walkers.e2e-spec.ts",
          source: String.raw`import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Walkers (e2e)", () => {
  let app: INestApplication;
  const prisma = {
    walker: {
      findMany: jest.fn().mockResolvedValue([
        { id: "1", name: "Mochi", pricePer30MinCents: 2000 },
      ]),
    },
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /walkers returns 200 and the list", () => {
    return request(app.getHttpServer())
      .get("/walkers")
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(1);
      });
  });
});`,
          caption: "One e2e test through the real stack: routing, guards, controller, service, serialization — only Prisma is overridden. Note the test returns the Supertest chain so Jest waits for it; .expect(200) checks the status, the callback asserts on the body.",
        },
        {
          type: "quiz",
          q: "Why pass `app.getHttpServer()` to Supertest and call `app.init()` rather than `app.listen(3000)`?",
          choices: [
            "Supertest drives the in-memory HTTP server directly, so no real port is bound — the request goes through the whole app but nothing is flaky about sockets or ports",
            "app.listen() doesn't exist on INestApplication",
            "getHttpServer() skips the controllers and calls the service directly",
            "listen() would make the test synchronous",
          ],
          answer: 0,
          explain: "`init()` fully starts the app (providers, guards, pipes) without binding a port; `getHttpServer()` exposes the underlying Node server object, and Supertest sends requests to it in-process. You get a real request through the entire stack with none of the port-conflict and networking flakiness that make e2e tests fragile.",
          nudge: "What does binding a real TCP port add to a test besides a chance to fail?",
        },
        {
          type: "exercise",
          title: "Write the Supertest request",
          prompt: [
            "The app is booted and the Prisma boundary is overridden. Finish the request: from `request(app.getHttpServer())`, chain `.get(\"/walkers\")` to hit the route and `.expect(200)` to assert the status code.",
          ],
          starter: String.raw`it("GET /walkers returns 200", () => {
  return request(app.getHttpServer())
    // your code here
});`,
          solution: String.raw`it("GET /walkers returns 200", () => {
  return request(app.getHttpServer())
    .get("/walkers")
    .expect(200);
});`,
          checks: [
            { re: /request\(app\.getHttpServer\(\)\)/, hint: "Point Supertest at the in-memory server: `request(app.getHttpServer())`." },
            { re: /\.get\("\/walkers"\)/, hint: "Choose the method and path: `.get(\"/walkers\")` — a relative route, no host or port." },
            { re: /\.expect\(200\)/, hint: "Assert the status right in the chain: `.expect(200)`. Supertest's `.expect(status)` fails the test if the code differs." },
          ],
          mustNot: [
            { re: /app\.listen/, hint: "No real port — Supertest talks to `app.getHttpServer()` in process. Don't call `app.listen`." },
          ],
          success: "That's the e2e shape: `request(server).get(path).expect(status)`. Returning the chain lets Jest await it. One thin test like this proves the whole request path is wired — the rest belongs in fast unit tests.",
        },
      ],
    },
    {
      id: "coverage-async-flaky",
      title: "What to cover, async pitfalls, and flaky tests",
      steps: [
        {
          type: "text",
          md: [
            "## Coverage is a spotlight, not a scoreboard",
            "Jest prints a coverage number (`jest --coverage`), and it's easy to chase it as a target. Don't. 100% line coverage can still miss every important branch; 60% can be fine on a glue file. Coverage is useful for one thing: **finding code no test touches at all.** Read it as a map of blind spots, not a grade.",
            "A sane bar for the PawWalk API: aim for roughly **70–80% line coverage** overall, and demand **high branch coverage on the code that hurts when it's wrong** — auth (does the guard actually reject a bad token?), billing (is the Stripe amount right on every path?), and any **write** (create/update/cancel a booking). A getter that formats a price can stay lightly covered; the branch that decides whether a walk gets charged cannot.",
            "> The senior line: `I don't chase a coverage percentage — I make sure every branch in auth, billing, and writes is exercised, because those are the paths that lose money or leak data when they're wrong.`",
          ],
        },
        {
          type: "text",
          md: [
            "## Async tests: await the assertion, or you get a false green",
            "Every service method here is `async`, and that's where the sneakiest bug in a test suite lives. If you forget to `await` (or `return`) the promise, the test function finishes *before* the assertion runs. Jest sees no error and prints a green check — for a test that never actually checked anything.",
            "Two safe shapes:",
            "- `expect(await service.findAll()).toEqual(rows)` — `await` the call, then assert on the resolved value.\n- For a rejection: `await expect(service.findOne(\"nope\")).rejects.toThrow(NotFoundException)` — note the leading `await`; without it the `rejects` matcher is a dangling promise and the test passes regardless.",
            "> Red flag: a test that passes but, when you break the code on purpose, *still* passes. Nine times out of ten it's a missing `await` on an async assertion. A test that can't fail is worse than no test — it's false confidence.",
          ],
        },
        {
          type: "text",
          md: [
            "## Flaky tests are bugs — fix them, don't retry them",
            "A **flaky** test passes and fails on the same code with no changes. The tempting reaction is to add a retry, or `.skip` it 'for now.' Both are how a suite dies: once one test is allowed to lie, nobody trusts a red run, and real failures get waved through as 'probably just flaky.'",
            "Treat every flake as a real bug — because it usually is one hiding: a race condition, a test that depends on another test's leftover data, a real clock or timezone, an unmocked network call. The fix is to make the test **deterministic**: reset mocks between tests (`jest.clearAllMocks()` in `beforeEach`), never share mutable state across tests, and mock time and I/O instead of hoping they're fast enough.",
            "> The senior stance: `A flaky test is a defect in the test or the code, not noise to retry past. I fix the nondeterminism — usually shared state or an unmocked clock — because a suite you can't trust red is a suite nobody reads.`",
          ],
        },
        {
          type: "quiz",
          q: "A booking test passes reliably on its own but fails intermittently in the full suite. What's the senior first move?",
          choices: [
            "Find the nondeterminism — usually leaked state between tests or an unmocked clock/network — and make the test deterministic",
            "Wrap it in a retry so CI goes green",
            "Add `.skip` until someone has time to look",
            "Increase the timeout and move on",
          ],
          answer: 0,
          explain: "Passing alone but failing in the suite is the classic signature of shared state — one test leaves data or a mock dirty and the next depends on order. That's a real bug in the tests (or a race in the code). Retries and skips just hide it and erode trust in the whole suite. Reset mocks in `beforeEach`, isolate state, mock time and I/O, and the flake goes away for good.",
          nudge: "The clue is 'alone vs. in the suite' — what could one test be leaving behind for another?",
        },
      ],
    },
  ],
});
