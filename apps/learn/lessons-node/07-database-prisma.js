window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "database-prisma",
  title: "Persistence with Prisma",
  emoji: "🗄️",
  lang: "ts",
  lessons: [
    {
      id: "why-a-database",
      title: "Why a real database, and the schema",
      steps: [
        {
          type: "text",
          md: [
            "## The array that forgets everything",
            "Every service so far has held its data in a plain array — `private readonly walkers: Walker[] = [ ... ]` from module 05. It works in a demo and lies about production. The moment the Node process restarts — a deploy, a crash, an autoscaler killing a pod — every walker, every booking, every GPS fix is gone. Run two instances behind a load balancer and each one has its *own* array, so a booking created on instance A is invisible to instance B.",
            "A real backend keeps its data in a **database** — for PawWalk, PostgreSQL — that survives restarts and is the single shared source of truth all your instances read and write.",
            "> The senior framing: `an in-memory array is a cache with no backing store. The question is never whether you need a database — it's whether you've admitted it yet.`",
          ],
        },
        {
          type: "text",
          md: [
            "## Prisma: the schema is the source of truth",
            "You could talk to Postgres with raw SQL strings, but on a TypeScript team the standard tool is **Prisma** — an ORM whose whole selling point is *type safety*. You describe your data once in a `schema.prisma` file, and Prisma generates a fully-typed client from it. Autocomplete on every field, a red squiggle the instant you misspell `pricePer30MinCents`, and query results whose types Prisma *inferred from your schema* — not types you hand-wrote and have to keep in sync.",
            "The schema file is the contract. It defines your **models** (tables), their fields and types, and the **relations** between them. Change the schema, run a migration, and both your database and your client types move together.",
            "> Why Prisma over hand-rolled SQL in an interview: `raw SQL gives you control but zero compile-time safety — a typo in a column name is a runtime 500. Prisma trades a little control for a client that makes the whole data layer type-checked. On a team, that's the trade I take.`",
          ],
        },
        {
          type: "code",
          title: "prisma/schema.prisma",
          source: String.raw`generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Walker {
  id                 String    @id @default(cuid())
  name               String
  pricePer30MinCents Int
  bookings           Booking[]
  createdAt          DateTime  @default(now())
}

model Booking {
  id              String   @id @default(cuid())
  walker          Walker   @relation(fields: [walkerId], references: [id])
  walkerId        String
  dogName         String
  durationMinutes Int
  priceCents      Int
  createdAt       DateTime @default(now())
}`,
          caption: "This is NOT TypeScript — it's Prisma's own schema language. Two models become two Postgres tables. Note the relation: a Walker has many bookings (Booking[]), and each Booking points back with a walker relation plus a walkerId foreign key. The connection string lives in DATABASE_URL, never hard-coded.",
        },
        {
          type: "text",
          md: [
            "## Money is an Int, and the relation goes both ways",
            "Two design decisions in that schema are worth stopping on — they're the ones interviewers poke at.",
            "- **Prices are `Int`, in cents.** `pricePer30MinCents` and `priceCents` store whole cents, never dollars as a `Float`. The same rule the in-memory data followed in module 05, now made permanent in the table. Floats can't represent most decimals exactly, so money math drifts; integer cents stay exact and you divide by 100 only when you display.\n- **The relation is declared on both sides.** `Walker.bookings` is a `Booking[]`; `Booking.walker` is a single `Walker` backed by the `walkerId` foreign key. Prisma reads both halves to generate typed navigation — `walker.bookings` and `booking.walker` — and to enforce the foreign key in the database.",
            "> Red flag: a `price` column typed `Float` or `Decimal(10,2)` used for arithmetic in JS. Say `store money as integer minor units — cents — and format at the edge` and you've flagged a whole class of rounding bugs.",
          ],
        },
        {
          type: "quiz",
          q: "The schema stores `pricePer30MinCents Int` instead of a float of dollars. Why?",
          choices: [
            "Integer cents avoid floating-point rounding errors that corrupt money math",
            "Prisma doesn't support decimal or float column types at all",
            "Int is the only column type PostgreSQL can put an index on",
            "It just makes the numbers shorter to type in tests",
          ],
          answer: 0,
          explain: "Floats can't represent many decimals exactly — `0.1 + 0.2` is `0.30000000000000004` in JS — so summing dollar amounts drifts over time. Storing whole cents as an Int keeps every amount exact; you divide by 100 only at the display edge. It's the same choice the in-memory `pricePer30MinCents` made in module 05, now enforced by the table.",
          nudge: "Think about what `0.1 + 0.2` actually prints in JavaScript.",
        },
      ],
    },
    {
      id: "migrations-and-client",
      title: "Migrations and the type-safe client",
      steps: [
        {
          type: "text",
          md: [
            "## A migration turns a schema edit into versioned SQL",
            "You just wrote a schema, but the database doesn't know about it yet. **Migrations** are how a schema change reaches the actual tables — and how that change becomes a reproducible, checked-in artifact instead of an ALTER TABLE someone typed once and forgot.",
            "The command is `npx prisma migrate dev`. It compares your `schema.prisma` against the migration history, writes a timestamped SQL file under `prisma/migrations/`, applies it to your dev database, and then regenerates the client. You commit that SQL file to git, so every teammate and your CI pipeline rebuilds the exact same database by replaying the same migrations.",
            "> The one-liner: `a migration is a schema change under version control. Editing the database by hand is a change nobody can reproduce and nobody reviewed.`",
          ],
        },
        {
          type: "text",
          md: [
            "## The generated client knows your schema",
            "After a migration (or a bare `npx prisma generate`), Prisma writes a client into `node_modules/@prisma/client` that is shaped *exactly* like your models. You import `PrismaClient` and get `prisma.walker` and `prisma.booking` — one property per model — each with `findUnique`, `findMany`, `create`, `update`, `delete`, and more.",
            "The payoff is that the return types are inferred, not declared. `prisma.walker.findUnique(...)` gives you back `Walker | null` — Prisma generated the `Walker` type from the schema, so it always matches the columns. Pass a field that doesn't exist and it won't compile.",
          ],
        },
        {
          type: "code",
          title: "A first query against the generated client",
          source: String.raw`import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const walker = await prisma.walker.findUnique({
  where: { id: "1" },
});
// walker is typed Walker | null — Prisma inferred it from the schema.
// walker.pricePer30MinCents autocompletes; walker.priceInDollars won't compile.`,
          caption: "One import, and the whole data layer is typed. You never wrote the Walker type by hand — it's generated from schema.prisma, so it can never drift from the real columns. (This bare `new PrismaClient()` is fine for a script; inside Nest you wrap it as a provider — next lesson.)",
        },
        {
          type: "quiz",
          q: "You add a `pricePer30MinCents` field to the Walker model in `schema.prisma`. What does running `npx prisma migrate dev` do?",
          choices: [
            "Writes a timestamped SQL migration file, applies it to the dev database, and regenerates the type-safe client",
            "Only edits the database directly, leaving no record of the change",
            "Renames your TypeScript interfaces to match the current database",
            "Starts the NestJS server with the new schema loaded into memory",
          ],
          answer: 0,
          explain: "`migrate dev` diffs the schema against the migration history, generates a timestamped SQL file under `prisma/migrations/`, applies it, and re-runs `generate` so `PrismaClient`'s types match the new column. That SQL file is committed to git — the schema history is reproducible on every machine and in CI, which a raw ALTER TABLE never is.",
          nudge: "Think about what a 'migration' leaves behind in your repo that a hand-typed ALTER TABLE doesn't.",
        },
        {
          type: "text",
          md: [
            "## In Nest, PrismaClient becomes a provider",
            "A bare `new PrismaClient()` opens a connection pool. If every service `new`-ed its own, you'd have a dozen pools fighting over the database's connection limit — the exact bug DI exists to prevent. So in Nest you wrap the client in an `@Injectable()` **PrismaService** and let the container share one instance everywhere (providers are singletons — module 05).",
            "The wrapper does one more job: it opens the connection when the app boots. `PrismaService` extends `PrismaClient` and implements **`OnModuleInit`**, a Nest lifecycle hook. Nest calls `onModuleInit()` once, after the module is wired but before the first request — the right place to `await this.$connect()` so the pool is warm and any connection failure crashes startup loudly instead of failing the first user.",
          ],
        },
        {
          type: "code",
          title: "src/prisma/prisma.service.ts + prisma.module.ts",
          source: String.raw`import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}

// prisma.module.ts
import { Module } from "@nestjs/common";

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}`,
          caption: "PrismaService IS a PrismaClient (it extends it) plus Nest lifecycle. The module marks it a provider AND exports it, so any feature module that imports PrismaModule can inject the one shared client. `$connect()` in onModuleInit warms the pool at boot.",
        },
        {
          type: "exercise",
          title: "Connect on module init",
          prompt: [
            "This `PrismaService` extends `PrismaClient` and declares `implements OnModuleInit`, but the hook is missing. Add an `async onModuleInit()` method that `await`s `this.$connect()` — that's what opens the pool when Nest boots the module.",
          ],
          starter: String.raw`@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // your code here
}`,
          solution: String.raw`@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}`,
          checks: [
            { re: /async onModuleInit\(\)\{/, hint: "Declare the lifecycle hook as `async onModuleInit() {` — Nest calls it once, right after the module is initialized." },
            { re: /await this\.\$connect\(\)/, hint: "Inside it, open the pool with `await this.$connect()` — the method is `$connect`, inherited from PrismaClient." },
          ],
          mustNot: [
            { re: /constructor\(/, hint: "Don't connect in the constructor — Nest may build the provider before the module is ready. Use the `onModuleInit` hook, which fires at the right time." },
          ],
          success: "That's the whole PrismaService: a singleton PrismaClient that connects at boot. Now every service can inject it and run typed queries.",
        },
      ],
    },
    {
      id: "queries-in-the-service",
      title: "Queries in the service layer",
      steps: [
        {
          type: "text",
          md: [
            "## The service owns the queries — controllers never see Prisma",
            "Inject `PrismaService` into `WalkersService` the same way you injected any provider: a constructor parameter. Now the service's methods run real queries instead of poking an array — but the boundary from module 05 holds firm. The **controller still never touches Prisma**. It calls `this.walkers.findAll()`; whether that answer comes from an array or a database is the service's private business.",
            "That line — controllers talk to services, only services talk to Prisma — is the repository boundary. Keep it and you can swap the data layer, mock the service in a controller test, or move a query to a cache without the HTTP layer noticing.",
            "> Red flag in a review: a `PrismaService` injected straight into a controller, with `prisma.walker.findMany()` inside a `@Get()`. Say `the controller is the HTTP adapter; persistence lives behind the service` and keep the query out of the route.",
          ],
        },
        {
          type: "code",
          title: "src/walkers/walkers.service.ts",
          source: String.raw`import { Injectable } from "@nestjs/common";
import { Walker } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class WalkersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Walker[]> {
    return this.prisma.walker.findMany();
  }

  findOne(id: string): Promise<Walker | null> {
    return this.prisma.walker.findUnique({ where: { id } });
  }

  create(data: { name: string; pricePer30MinCents: number }): Promise<Walker> {
    return this.prisma.walker.create({ data });
  }
}`,
          caption: "Three real queries. `Walker` is imported from @prisma/client — the generated type — so `findMany` returns `Promise<Walker[]>` and `findUnique` returns `Promise<Walker | null>` (null when no row matches). Every method returns a Promise because the database call is async; the controller just `return`s it.",
        },
        {
          type: "exercise",
          title: "List all walkers with findMany",
          prompt: [
            "The service has the injected `prisma` client. Add a `findAll` method that returns every walker. Type its return as `Promise<Walker[]>` and return `this.prisma.walker.findMany()`.",
          ],
          starter: String.raw`@Injectable()
export class WalkersService {
  constructor(private readonly prisma: PrismaService) {}

  // your code here
}`,
          solution: String.raw`@Injectable()
export class WalkersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Walker[]> {
    return this.prisma.walker.findMany();
  }
}`,
          checks: [
            { re: /findAll\(\):Promise<Walker\[\]>\{/, hint: "Declare it as `findAll(): Promise<Walker[]> {` — a list of walkers is an array, and the query is async so the return type is a Promise." },
            { re: /return this\.prisma\.walker\.findMany\(\)/, hint: "Return `this.prisma.walker.findMany()` — `walker` is the model accessor Prisma generated, `findMany()` with no argument fetches every row." },
          ],
          success: "That's the read-all query, fully typed end to end: `findMany()` returns `Walker[]` and TypeScript knows it. Now the single-row lookup.",
        },
        {
          type: "text",
          md: [
            "## One row: `findUnique`, and the `null` you must handle",
            "`findMany` returns an array — empty if nothing matches, never null. A single-row lookup is different. **`findUnique`** takes a `where` clause selecting by a unique field and returns `Walker | null` — `null` when no walker has that id. That `null` is not an error; it's the 'not found' case, and the `| null` in the type forces you to handle it (turn it into a 404 upstream) instead of dereferencing undefined.",
            "The shape is `findUnique({ where: { id } })` — an options object with a `where`, not the raw id. **`create`** follows the same object-argument style: `create({ data })`, where `data` matches the model's fields.",
          ],
        },
        {
          type: "exercise",
          title: "Fetch one walker with findUnique",
          prompt: [
            "Add a `findOne(id: string)` method below `findAll`. Type its return as `Promise<Walker | null>` — Prisma returns `null` when no row matches. Return `this.prisma.walker.findUnique({ where: { id } })`.",
          ],
          starter: String.raw`@Injectable()
export class WalkersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Walker[]> {
    return this.prisma.walker.findMany();
  }

  // your code here
}`,
          solution: String.raw`@Injectable()
export class WalkersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Walker[]> {
    return this.prisma.walker.findMany();
  }

  findOne(id: string): Promise<Walker | null> {
    return this.prisma.walker.findUnique({ where: { id } });
  }
}`,
          checks: [
            { re: /findOne\(id:string\):Promise<Walker\|null>\{/, hint: "Declare it as `findOne(id: string): Promise<Walker | null> {` — the `| null` is Prisma's 'no row matched' case, and it's part of the contract." },
            { re: /this\.prisma\.walker\.findUnique\(\{where:\{id\}\}\)/, hint: "Call `this.prisma.walker.findUnique({ where: { id } })` — findUnique takes an options object with a `where` clause." },
          ],
          mustNot: [
            { re: /findUnique\(id\)/, hint: "Don't pass the id directly — `findUnique` takes an options object: `findUnique({ where: { id } })`." },
          ],
          success: "Both reads now come from Postgres, fully typed, with the not-found case baked into the return type. Two ideas left: pooling and N+1.",
        },
        {
          type: "text",
          md: [
            "## One pool, and the N+1 trap",
            "Two things separate a service that survives production from one that falls over under load.",
            "- **Connection pooling — one client, shared.** Because `PrismaService` is a singleton provider, there's exactly one `PrismaClient`, and it manages a pool of connections behind it. Every query borrows a connection and returns it. You never `new PrismaClient()` per request — that spawns a fresh pool each time and exhausts the database's connection limit in minutes. The DI singleton *is* the pooling strategy.\n- **N+1 — eager `include` vs lazy.** Say you list walkers and then, in a loop, query each walker's bookings separately. That's `1` query for the list plus `N` for the bookings — `1 + N` round-trips that grow with your data. Prisma's fix is to eager-load the relation in the first query: `findUnique({ where: { id }, include: { bookings: true } })` fetches the walker and its bookings together. Lazy loading (a separate query when you happen to need the relation) is fine when you rarely do; reach for `include` the moment you're looping to fetch it.",
            "> The senior pitch on N+1: `one query per row is invisible with ten rows and fatal with ten thousand. When I'm iterating to load a relation, I eager-load it with include and turn 1 + N round-trips into two.`",
          ],
        },
        {
          type: "quiz",
          q: "A `GET /walkers` handler lists every walker, then loops over them running a separate query per walker to load that walker's bookings. What's the problem, and Prisma's fix?",
          choices: [
            "It's the N+1 query problem; add `include: { bookings: true }` so Prisma loads walkers and their bookings together instead of one query per row",
            "Nothing — one query per walker is the most efficient possible approach",
            "The fix is to construct a new PrismaClient per walker to parallelize the loads",
            "Add `await` to each query so they run strictly one at a time",
          ],
          answer: 0,
          explain: "One query for the list plus one per row is 1 + N round-trips — latency that scales with your data. Eager-loading the relation with `include` lets Prisma resolve the bookings in one additional query instead of N. Spinning up a client per walker would only multiply pools and exhaust connections; the shared singleton client is what makes pooling work.",
          nudge: "Count the database round-trips as the walker list grows from 10 rows to 10,000.",
        },
      ],
    },
  ],
});
