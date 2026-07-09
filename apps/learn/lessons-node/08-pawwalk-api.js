window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "pawwalk-api",
  title: "The Walkers API, End to End",
  emoji: "🐕",
  lang: "ts",
  lessons: [
    {
      id: "list-pagination",
      title: "GET /walkers — listing with pagination",
      steps: [
        {
          type: "text",
          md: [
            "## The capstone: one real REST resource",
            "You have all the pieces now — a module, a controller, an injectable service, DTOs behind a `ValidationPipe`, and a Prisma-backed database. This module bolts them into the thing every backend interview circles back to: **a working CRUD resource**. By the end you'll have a `WalkersModule` that answers `GET /walkers` (paginated), `GET /walkers/:id` (with a real `404`), and `POST /walkers` (validated, `201`) — the exact shape the PawWalk app talks to.",
            "> The senior framing: `A REST resource isn't three clever endpoints — it's three boring ones that agree on a response shape, honest status codes, and a clean boundary between what the database stores and what the API returns.`",
          ],
        },
        {
          type: "code",
          title: "src/walkers/walkers.module.ts",
          source: String.raw`import { Module } from "@nestjs/common";
import { WalkersController } from "./walkers.controller";
import { WalkersService } from "./walkers.service";
import { PrismaService } from "../prisma/prisma.service";

@Module({
  controllers: [WalkersController],
  providers: [WalkersService, PrismaService],
})
export class WalkersModule {}`,
          caption: "The wiring is exactly the trio from module 05, plus PrismaService in `providers` so Nest can inject the database client into the service. Import WalkersModule into AppModule and the whole resource is live. (In a bigger app PrismaService lives in a shared, `@Global()` PrismaModule instead of being re-listed here — same effect, less repetition.)",
        },
        {
          type: "text",
          md: [
            "## Never return the whole table",
            "`GET /walkers` sounds harmless until PawWalk has 40,000 walkers and one request tries to serialize every row. **Pagination** is the fix: the client asks for a `page` and a `limit`, and you return one slice plus enough metadata to fetch the next.",
            "Prisma speaks this in two words: **`skip`** (how many rows to jump over) and **`take`** (how many to return). The client thinks in pages; the database thinks in offsets. Your job is the one line of arithmetic between them:",
            "```ts\nconst skip = (page - 1) * limit;\n```",
            "Page 1 skips 0, page 2 skips `limit`, page 3 skips `2 * limit`. `take` is just the `limit`.",
          ],
        },
        {
          type: "code",
          title: "src/walkers/dto/pagination.dto.ts",
          source: String.raw`import { IsInt, Min, Max, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}`,
          caption: "Query params arrive as strings, so `@Type(() => Number)` coerces before `@IsInt()` checks. `@IsOptional()` lets the defaults (`= 1`, `= 20`) stand in. `@Max(100)` on `limit` is a real defense: without it a caller sends `?limit=999999` and asks your database to hand back the whole table anyway.",
        },
        {
          type: "code",
          title: "src/walkers/walkers.controller.ts + walkers.service.ts",
          source: String.raw`// controller
@Get()
findAll(@Query() pagination: PaginationDto) {
  return this.walkers.findAll(pagination);
}

// service
async findAll(pagination: PaginationDto) {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;
  const data = await this.prisma.walker.findMany({ skip, take: limit });
  const total = await this.prisma.walker.count();
  return { data, total, page, limit };
}`,
          caption: "`@Query()` binds the pagination DTO the same way `@Body()` binds a POST body — the global ValidationPipe validates it identically. The service returns `{ data, total, page, limit }`: the slice plus the total count, so the client can compute how many pages exist. That envelope is a contract — every list endpoint in the API returns the same four keys.",
        },
        {
          type: "quiz",
          q: "A client requests `GET /walkers?page=3&limit=20`. What `skip` and `take` does Prisma receive?",
          choices: [
            "skip 40, take 20",
            "skip 60, take 20",
            "skip 3, take 20",
            "skip 20, take 3",
          ],
          answer: 0,
          explain: "`skip = (page - 1) * limit = (3 - 1) * 20 = 40`, and `take` is just the limit, `20`. So page 3 jumps the first 40 rows and returns the next 20. Page 1 would skip 0 — the off-by-one that `(page - 1)` prevents is the classic pagination bug.",
          nudge: "Plug into `skip = (page - 1) * limit`, and remember `take` is the page size itself.",
        },
        {
          type: "exercise",
          title: "Write the paginated findAll",
          prompt: [
            "Fill in the service's `findAll`. Compute `skip` from `page` and `limit`, fetch the slice with `findMany({ skip, take: limit })`, get the `total` with `this.prisma.walker.count()`, and return the `{ data, total, page, limit }` envelope.",
          ],
          starter: String.raw`async findAll(pagination: PaginationDto) {
  const { page, limit } = pagination;
  // your code here
}`,
          solution: String.raw`async findAll(pagination: PaginationDto) {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;
  const data = await this.prisma.walker.findMany({ skip, take: limit });
  const total = await this.prisma.walker.count();
  return { data, total, page, limit };
}`,
          checks: [
            { re: /const skip=\(page-1\)\*limit/, hint: "Turn the page into an offset: `const skip = (page - 1) * limit;`." },
            { re: /findMany\(\{skip,take:limit\}\)/, hint: "Fetch one slice with `this.prisma.walker.findMany({ skip, take: limit })`." },
            { re: /this\.prisma\.walker\.count\(\)/, hint: "Get the row count for the metadata: `this.prisma.walker.count()`." },
            { re: /return\{data,total,page,limit\}/, hint: "Return the envelope every list endpoint shares: `return { data, total, page, limit };`." },
          ],
          mustNot: [
            { re: /findMany\(\)/, hint: "A bare `findMany()` returns the whole table — pass `{ skip, take: limit }` so you only fetch one page." },
          ],
          success: "That's a production list endpoint: bounded, counted, and returning a stable envelope. Next, reading a single walker — and what happens when it isn't there.",
        },
      ],
    },
    {
      id: "get-one-404",
      title: "GET /walkers/:id — 404 when missing",
      steps: [
        {
          type: "text",
          md: [
            "## The `:id` is a string until you make it a number",
            "`GET /walkers/42` carries `42` in the path — but every path param arrives as the **string** `\"42\"`. Prisma's `id` column is an `Int`, so you must convert, and you want to reject `GET /walkers/banana` before it ever reaches the database.",
            "Nest ships exactly that as a pipe: **`ParseIntPipe`**. Attach it to the param and Nest converts the string to a number, or throws a `400 Bad Request` if it isn't one — so your method always receives a real `number`.",
            "```ts\n@Get(\":id\")\nfindOne(@Param(\"id\", ParseIntPipe) id: number) {\n  return this.walkers.findOne(id);\n}\n```",
          ],
        },
        {
          type: "text",
          md: [
            "## Missing row, honest status code",
            "When the walker exists you return it with `200`. When it doesn't, the wrong move is to return `200` with a `null` body — the app can't tell 'no such walker' from 'something broke', and now every client writes a null-check. The right move is a **`404 Not Found`**.",
            "In Nest you don't hand-build that response. You **throw** one of the built-in HTTP exceptions and an exception filter (from the lifecycle in module 06) turns it into the right status and JSON body:",
            "- `throw new NotFoundException(msg)` → `404`\n- `throw new BadRequestException(msg)` → `400`\n- `throw new ForbiddenException(msg)` → `403`",
            "> The senior instinct: `A missing resource is a 404, not a 200 with an empty body. Throw NotFoundException and let the framework shape the response — the status code is part of your API's contract, not an afterthought.`",
          ],
        },
        {
          type: "code",
          title: "src/walkers/walkers.service.ts",
          source: String.raw`import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class WalkersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: number) {
    const walker = await this.prisma.walker.findUnique({ where: { id } });
    if (!walker) {
      throw new NotFoundException("Walker " + id + " not found");
    }
    return walker;
  }
}`,
          caption: "`findUnique` returns the row or `null` — never a throw of its own, so the guard is on you. The moment `walker` is null we throw `NotFoundException`; Nest's default exception filter turns it into `404` with `{ statusCode: 404, message: \"Walker 42 not found\" }`. The controller stays a one-liner because the service owns the 'does it exist?' decision.",
        },
        {
          type: "quiz",
          q: "`findUnique` returns `null` for a walker that doesn't exist. Why throw `NotFoundException` instead of just returning that `null` to the controller?",
          choices: [
            "Returning null sends a 200 with an empty body; throwing NotFoundException produces a real 404, so the client can tell 'missing' from 'broken'",
            "Returning null would crash the Prisma client",
            "NotFoundException runs faster than returning a value",
            "Nest forbids a service method from returning null",
          ],
          answer: 0,
          explain: "A returned `null` serializes to a `200 OK` with an empty-ish body — indistinguishable from a genuine result to the client. Throwing `NotFoundException` lets Nest's exception filter emit a `404` with a message. The status code is the API's contract: `404` means 'this resource doesn't exist', and honoring it keeps every client from inventing its own null-handling.",
          nudge: "Think about what status code the client sees in each case, and whether it can distinguish 'not found' from 'success with nothing'.",
        },
        {
          type: "exercise",
          title: "Throw NotFoundException when the walker is missing",
          prompt: [
            "Finish `findOne`. Load the row with `findUnique({ where: { id } })`. If `walker` is falsy, `throw new NotFoundException(...)` (the import is already there). Otherwise return the walker.",
          ],
          starter: String.raw`async findOne(id: number) {
  const walker = await this.prisma.walker.findUnique({ where: { id } });
  // your code here
  return walker;
}`,
          solution: String.raw`async findOne(id: number) {
  const walker = await this.prisma.walker.findUnique({ where: { id } });
  if (!walker) {
    throw new NotFoundException("Walker " + id + " not found");
  }
  return walker;
}`,
          checks: [
            { re: /if\(!walker\)\{/, hint: "Guard the null case: `if (!walker) {`." },
            { re: /throw new NotFoundException\(/, hint: "Raise the 404: `throw new NotFoundException(\"Walker \" + id + \" not found\")`." },
            { re: /return walker/, hint: "On the happy path, return the row: `return walker;`." },
          ],
          mustNot: [
            { re: /return null/, hint: "Don't return null for a missing row — that's a 200 with nothing. Throw `NotFoundException` so the client gets a real 404." },
          ],
          success: "That's an honest read endpoint: 200 with the walker, or 404 when there isn't one. One more verb to go — creating a walker.",
        },
      ],
    },
    {
      id: "create-and-map",
      title: "POST /walkers — create, and mapping the response",
      steps: [
        {
          type: "text",
          md: [
            "## Create returns 201, not 200",
            "`POST /walkers` brings a new walker into existence, so the honest status code is **`201 Created`**, not `200`. Nest already knows this: a `@Post()` handler defaults to `201` when it returns normally — you get the right code for free. (Reach for `@HttpCode(200)` only when you deliberately want to override it.)",
            "The body is validated by the same DTO-plus-`ValidationPipe` pattern from module 06. Define what a *create* accepts — note it does **not** accept `id`, `rating`, or `createdAt`; those are the database's to assign, never the client's:",
          ],
        },
        {
          type: "code",
          title: "src/walkers/dto/create-walker.dto.ts",
          source: String.raw`import { IsString, IsInt, Min } from "class-validator";

export class CreateWalkerDto {
  @IsString()
  name: string;

  @IsString()
  city: string;

  @IsInt()
  @Min(1)
  pricePer30MinCents: number;
}`,
          caption: "Three fields, each with a rule. Leaving `id`, `rating`, and timestamps off the DTO isn't laziness — with `whitelist: true` it's a security control: a client that sneaks `\"rating\": 5` into the body gets it stripped, so nobody can self-assign a perfect rating on the way in.",
        },
        {
          type: "code",
          title: "src/walkers/walkers.controller.ts + walkers.service.ts",
          source: String.raw`// controller
@Post()
create(@Body() dto: CreateWalkerDto) {
  return this.walkers.create(dto);
}

// service
async create(dto: CreateWalkerDto) {
  return this.prisma.walker.create({ data: dto });
}`,
          caption: "The handler is two lines because everything hard happened upstream: the pipe validated and whitelisted the body, so `dto` is exactly the three allowed fields. `prisma.walker.create({ data: dto })` inserts the row and returns it with its freshly assigned `id` and defaults. Nest serializes that to JSON and sends `201`.",
        },
        {
          type: "exercise",
          title: "Write the @Post create handler",
          prompt: [
            "Add the create endpoint to `WalkersController`. Mark it `@Post()`, bind the validated body as `@Body() dto: CreateWalkerDto`, and return `this.walkers.create(dto)`.",
          ],
          starter: String.raw`@Controller("walkers")
export class WalkersController {
  constructor(private readonly walkers: WalkersService) {}

  // your code here
}`,
          solution: String.raw`@Controller("walkers")
export class WalkersController {
  constructor(private readonly walkers: WalkersService) {}

  @Post()
  create(@Body() dto: CreateWalkerDto) {
    return this.walkers.create(dto);
  }
}`,
          checks: [
            { re: /@Post\(\)/, hint: "Map the verb with `@Post()` above the method." },
            { re: /create\(@Body\(\)dto:CreateWalkerDto\)/, hint: "Bind the validated body: `create(@Body() dto: CreateWalkerDto)`." },
            { re: /return this\.walkers\.create\(dto\)/, hint: "Delegate to the service: `return this.walkers.create(dto);`." },
          ],
          mustNot: [
            { re: /@Get\(\)/, hint: "This creates a resource — use `@Post()`, not `@Get()`." },
          ],
          success: "Three verbs done. But the create just returned the raw Prisma row — and that's a leak waiting to happen. Last step: control what actually goes out.",
        },
        {
          type: "text",
          md: [
            "## The database entity is not the API response",
            "Returning `prisma.walker` straight out works — until the schema grows an `internalNotes` column, a `stripeAccountId`, or a soft-delete flag, and now every one of those leaks to every client the day it's added. **The row your database stores and the object your API returns are two different shapes**, and the boundary between them is a mapping function.",
            "A mapper does two jobs: **drop** the fields that shouldn't leave the building, and **add** computed ones the client actually wants. PawWalk stores a raw `pricePer30MinCents` (integer cents — the only sane way to store money), but the app wants a display string. That `priceLabel` is computed at the boundary, not stored:",
            "> The senior pitch: `Money lives as integer cents in the database and becomes a formatted string only at the API edge. Never store a float for money, and never hand the client your raw table — map to a response so the schema can evolve without leaking.`",
          ],
        },
        {
          type: "code",
          title: "src/walkers/walker.response.ts",
          source: String.raw`import { Walker } from "@prisma/client";

export function toWalkerResponse(walker: Walker) {
  return {
    id: walker.id,
    name: walker.name,
    city: walker.city,
    priceLabel: "$" + walker.pricePer30MinCents / 100 + " / 30 min",
  };
}`,
          caption: "An allow-list, not a deny-list: the response names exactly the fields that go out, so a new column is invisible until you choose to expose it. `priceLabel` turns `2000` cents into `$20 / 30 min` right here — the same computed field the Rails PawWalk API exposes. (Nest's `ClassSerializerInterceptor` + `@Exclude()` is the heavier alternative; a plain mapper is the honest starting point.)",
        },
        {
          type: "quiz",
          q: "Why map the Prisma `Walker` entity to a separate response object instead of returning the row directly?",
          choices: [
            "The mapper is an allow-list: it exposes only chosen fields (so new/internal columns never leak) and can add computed fields like priceLabel",
            "Prisma rows can't be serialized to JSON without a mapper",
            "Mapping makes the database query run faster",
            "Nest requires every response to be a plain function's return value",
          ],
          answer: 0,
          explain: "Returning the raw row couples your public API to your table: the day someone adds `internalNotes` or `stripeAccountId`, it ships to every client automatically. A mapper is an explicit allow-list — only the fields you name leave the server — and it's where computed values like `priceLabel` (cents into a display string) belong. The schema can then evolve freely behind that boundary.",
          nudge: "Think about what happens the day a sensitive column is added to the table, if the API just returns the whole row.",
        },
        {
          type: "exercise",
          title: "Map the entity and compute priceLabel",
          prompt: [
            "Finish `toWalkerResponse`. Return an object with `id`, `name`, and `city` copied from `walker`, plus a computed `priceLabel` string: `\"$\"` + `walker.pricePer30MinCents / 100` + `\" / 30 min\"`. Leave every other column off — this is the allow-list.",
          ],
          starter: String.raw`export function toWalkerResponse(walker: Walker) {
  return {
    // your code here
  };
}`,
          solution: String.raw`export function toWalkerResponse(walker: Walker) {
  return {
    id: walker.id,
    name: walker.name,
    city: walker.city,
    priceLabel: "$" + walker.pricePer30MinCents / 100 + " / 30 min",
  };
}`,
          checks: [
            { re: /id:walker\.id/, hint: "Copy the id through: `id: walker.id,`." },
            { re: /name:walker\.name/, hint: "Copy the name: `name: walker.name,`." },
            { re: /priceLabel:"\$"\+walker\.pricePer30MinCents\/100/, hint: "Compute the label from cents: `priceLabel: \"$\" + walker.pricePer30MinCents / 100 + \" / 30 min\"`." },
          ],
          mustNot: [
            { re: /rating/, hint: "Don't pass `rating` through — the response is an allow-list of only the fields you name, so internal columns stay internal." },
          ],
          success: "That's the whole CRUD arc assembled: a paginated list, a 404-honest read, a validated 201 create, and a response boundary that hides internals and computes what the client needs. That's a resource you can defend in an interview line by line.",
        },
      ],
    },
  ],
});
