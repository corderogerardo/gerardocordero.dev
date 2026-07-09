window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "dtos-validation",
  title: "DTOs, Validation & the Request Lifecycle",
  emoji: "🛂",
  lang: "ts",
  lessons: [
    {
      id: "create-dto",
      title: "DTOs: shaping the request",
      steps: [
        {
          type: "text",
          md: [
            "## The untyped body problem",
            "In module 05 your `BookingsController` took a booking and handed it to a service. But look at what actually arrives on a `POST /bookings`: `@Body()` gives you **whatever JSON the client sent** — and the client can send anything. A missing `walkerId`, a `durationMinutes` of `-999`, a `status` of `\"free please\"`, or fifty fields you never asked for.",
            "TypeScript types don't save you here. Types are a **compile-time** promise; at runtime the body is just a parsed object. If you trust it and pass it to the database, you've built the classic injection-shaped bug: garbage in, corrupted rows out.",
            "> The senior instinct: **never trust the request body.** A DTO is where you turn an unknown blob into a known, validated shape before a single line of business logic runs.",
          ],
        },
        {
          type: "text",
          md: [
            "## A DTO must be a CLASS, not an interface",
            "A **DTO** (Data Transfer Object) declares the exact shape you accept for one operation. In Nest you write it as a **class** — and this is the detail that trips people in interviews.",
            "Why not an `interface`? Because **interfaces are erased at runtime.** TypeScript compiles them away entirely — there is nothing left for Nest to inspect. Nest's `ValidationPipe` needs the DTO's *metatype* (a real class reference it reads at runtime via `reflect-metadata`) to know which validation rules to run. An interface leaves the pipe with `Object`, no metadata, and nothing to validate.",
            "A **class survives compilation** as a real value. Decorators like `@IsInt()` attach validation metadata to it, and that metadata is what the pipe reads on every request.",
            "> In an interview, say: \"DTOs are classes, not interfaces, because interfaces are erased at runtime — the ValidationPipe needs a real metatype with attached decorator metadata to validate against.\"",
          ],
        },
        {
          type: "code",
          title: "src/bookings/dto/create-booking.dto.ts",
          source: String.raw`import { IsInt, IsString, IsIn, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateBookingDto {
  @IsInt()
  walkerId: number;

  @IsString()
  dogName: string;

  @IsInt()
  @Min(15)
  @Type(() => Number)
  durationMinutes: number;

  @IsIn(["pending", "confirmed", "cancelled"])
  status: string;
}`,
          caption: "Each decorator is one rule. `@IsInt()` + `@Min(15)` say durationMinutes must be a whole number of at least 15. `@IsIn([...])` pins status to a known set — an enum guard in one line. `@Type(() => Number)` from class-transformer coerces a value that arrives as a string (query params, form posts) into a number *before* `@IsInt()` checks it.",
        },
        {
          type: "text",
          md: [
            "## The decorator vocabulary",
            "These come from the `class-validator` and `class-transformer` packages (`npm i class-validator class-transformer`). The ones you'll reach for constantly:",
            "- **`@IsInt()` / `@IsString()`** — the value must be a whole number / a string.\n- **`@Min(15)` / `@Max(240)`** — numeric bounds. A 15-minute floor, a 4-hour ceiling on a walk.\n- **`@IsIn([\"pending\", \"confirmed\", \"cancelled\"])`** — the value must be one of a fixed set. Cheaper and clearer than a hand-written check.\n- **`@Type(() => Number)`** — a *transform*, not a validation: it coerces the incoming value to a Number so the numeric checks have something real to test.",
            "Stack as many as you need on one field — they run top to bottom, and every failure is collected into one clear `400` response listing exactly what was wrong.",
          ],
        },
        {
          type: "quiz",
          q: "Why must a Nest DTO be a class rather than a TypeScript interface?",
          choices: [
            "Interfaces are erased at compile time, so the ValidationPipe has no runtime metatype or decorator metadata to validate against",
            "Classes are faster to instantiate than interfaces at runtime",
            "Interfaces cannot have properties, only methods",
            "Nest forbids interfaces anywhere in the project",
          ],
          answer: 0,
          explain: "TypeScript compiles interfaces away completely — at runtime nothing remains. The ValidationPipe relies on reflect-metadata to read the DTO's metatype (a real class) and the decorators attached to it. An interface leaves the pipe with `Object` and no rules, so validation silently does nothing. A class survives compilation as a value that decorators can annotate.",
          nudge: "Think about what actually exists at runtime after TypeScript compiles. Which one leaves something behind for the pipe to inspect?",
        },
        {
          type: "exercise",
          title: "Validate a booking field",
          prompt: [
            "The `durationMinutes` field has no rules yet, so a client could send `-5` or `\"soon\"`. Stack two decorators directly above it: `@IsInt()` so it must be a whole number, then `@Min(15)` so a walk is at least 15 minutes.",
          ],
          starter: String.raw`export class CreateBookingDto {
  @IsInt()
  walkerId: number;

  // your code here
  durationMinutes: number;
}`,
          solution: String.raw`export class CreateBookingDto {
  @IsInt()
  walkerId: number;

  @IsInt()
  @Min(15)
  durationMinutes: number;
}`,
          checks: [
            { re: /@IsInt\(\)@Min\(15\)durationMinutes/, hint: "Stack both decorators right above the field: `@IsInt()` on one line, then `@Min(15)`, then `durationMinutes`." },
            { re: /@Min\(15\)/, hint: "Add `@Min(15)` so a walk can't be shorter than 15 minutes." },
          ],
          mustNot: [
            { re: /@Min\(15\)@IsInt\(\)durationMinutes/, hint: "Put `@IsInt()` first, then `@Min(15)` — check the type before the bound." },
          ],
          success: "That's a real DTO field: two rules, and any body that violates them is rejected with a 400 before your service ever runs.",
        },
      ],
    },
    {
      id: "validation-pipe",
      title: "The global ValidationPipe",
      steps: [
        {
          type: "text",
          md: [
            "## Pipes are the transform-and-validate stage",
            "Decorators on a DTO are just *metadata* — inert until something reads them. That something is a **pipe**. In Nest, a **pipe** runs on the argument bound to a handler parameter, and does one of two jobs (often both): **transform** it (a string `\"42\"` into the number `42`) or **validate** it (reject it if it breaks the rules).",
            "The built-in **`ValidationPipe`** is the one you wire up once and forget. On every request it takes the raw body, instantiates your DTO **class**, runs its `class-validator` decorators, and either hands your handler a clean typed object or throws a `400 Bad Request` with the list of failures.",
            "> The reframe: you don't validate inside each handler. You register one pipe globally and every DTO in the app is validated the same way, for free.",
          ],
        },
        {
          type: "code",
          title: "src/main.ts",
          source: String.raw`import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();`,
          caption: "One registration in `main.ts` covers every route. `transform: true` turns the plain parsed body into a real instance of your DTO class (and applies `@Type` coercions). `whitelist: true` strips any property your DTO didn't declare.",
        },
        {
          type: "text",
          md: [
            "## Why `transform` and `whitelist` earn their keep",
            "- **`transform: true`** — without it, `@Body()` hands you a plain object that only *looks* like your DTO; with it, Nest returns a genuine instance of the class and runs `@Type()` coercions (so `durationMinutes` arrives as a real `number`, not the string `\"30\"`).",
            "- **`whitelist: true`** — strips any field not declared on the DTO. A client sending `{ walkerId: 1, isAdmin: true }` gets `isAdmin` silently dropped before it reaches your code. This is a real security control: it's how you stop **mass-assignment** attacks where a caller sneaks in a field you never meant to accept.",
            "> Red flag: relying only on TypeScript types to keep bad data out. Types vanish at runtime — a request with an extra `role: \"admin\"` field sails straight through unless `whitelist` strips it. Say: \"I enable `whitelist` globally so undeclared fields can't ride in on the body.\" (Reach for `forbidNonWhitelisted: true` when you'd rather 400 than silently drop.)",
          ],
        },
        {
          type: "quiz",
          q: "A client POSTs `{ walkerId: 1, dogName: \"Mochi\", isAdmin: true }` and your DTO never declares `isAdmin`. With `whitelist: true`, what happens?",
          choices: [
            "`isAdmin` is stripped out before the handler runs, so your code never sees it",
            "The whole request is rejected with a 500 error",
            "`isAdmin` is passed through untouched to your service",
            "Nest converts `isAdmin` into a validated boolean field automatically",
          ],
          answer: 0,
          explain: "`whitelist: true` removes any property the DTO didn't declare, so the extra `isAdmin` is dropped and your handler receives only the fields you defined. That's the guard against mass-assignment — an attacker can't inject fields you never intended to accept. If you'd rather reject such requests outright, add `forbidNonWhitelisted: true` to turn the strip into a 400.",
          nudge: "The DTO is the allow-list. What does 'whitelist' do to a field that isn't on the list?",
        },
        {
          type: "text",
          md: [
            "## The handler on the clean side of the pipe",
            "Once the pipe is global, a handler just names the DTO type on `@Body()` and Nest does the rest — validate, transform, then inject a clean instance. Your method body assumes the data is already good:",
            "```ts\n@Post()\ncreate(@Body() dto: CreateBookingDto) {\n  return this.bookings.create(dto);\n}\n```",
            "No `if (!dto.walkerId)` clutter, no manual number parsing. If the body was bad, the request never reached this line — the pipe already sent the `400`.",
          ],
        },
        {
          type: "exercise",
          title: "Write the create handler",
          prompt: [
            "In `BookingsController`, add a `create` handler for `POST /bookings`. Mark it with `@Post()`, take the validated body as `@Body() dto: CreateBookingDto`, and return `this.bookings.create(dto)`.",
            "> The global ValidationPipe already ran by the time this method executes — `dto` is a clean, validated instance, so you can pass it straight through.",
          ],
          starter: String.raw`@Controller("bookings")
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Post()
  create() {
    // your code here
  }
}`,
          solution: String.raw`@Controller("bookings")
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookings.create(dto);
  }
}`,
          checks: [
            { re: /@Post\(\)/, hint: "Mark the handler for POST with `@Post()`." },
            { re: /create\(@Body\(\)dto:CreateBookingDto\)/, hint: "Bind the validated body: `create(@Body() dto: CreateBookingDto)`." },
            { re: /return this\.bookings\.create\(dto\)/, hint: "Pass the clean DTO to the service: `return this.bookings.create(dto)`." },
          ],
          success: "That's the whole point of the pipe: your handler stays a two-liner because validation happened upstream, before the method ran.",
        },
      ],
    },
    {
      id: "request-lifecycle",
      title: "The request lifecycle",
      steps: [
        {
          type: "text",
          md: [
            "## The order every request travels",
            "The pipe didn't run by magic — it runs at a fixed point in Nest's **request lifecycle**. Every incoming request flows through the same ordered pipeline, and knowing the order is what lets you put logic in the right place:",
            "1. **Middleware** — runs first, before Nest even knows the route (raw `req`/`res`; good for logging, CORS, body parsing).\n2. **Guards** — answer one yes/no question: *is this request allowed?* (auth, roles). A `false` here stops everything with a `403`.\n3. **Interceptors (pre)** — wrap the handler; the code *before* `next` runs on the way in.\n4. **Pipes** — transform and validate the handler's arguments. **This is where your `ValidationPipe` lives.**\n5. **The route handler** — your controller method, finally running on clean, authorized input.\n6. **Interceptors (post)** — the code *after* `next`, on the way out (reshape the response, log timing).\n7. **Exception filters** — catch anything thrown at any stage and turn it into an HTTP response.",
            "> In an interview, say: \"Guards decide *if* the request runs, pipes decide *whether the input is valid* — so authorization is settled before validation, and both before my handler sees anything.\"",
          ],
        },
        {
          type: "text",
          md: [
            "## Three tools, three jobs — don't confuse them",
            "These arrive in later modules, but pin the *roles* now so you never reach for the wrong one:",
            "- **Guard** — a gatekeeper returning `true`/`false`: *should this request proceed?* Auth and role checks live here. It runs **before** pipes, so an unauthenticated caller is turned away before you waste effort validating their body.\n- **Interceptor** — wraps the handler to add behavior **around** it: transform the response, add caching, measure latency. It's the only tool that runs code both before *and* after the handler.\n- **Exception filter** — the safety net: it catches thrown errors from any stage and shapes the client-facing error response (status code + JSON body).",
            "> Red flag: putting auth logic in a pipe or a service. Say: \"Authorization belongs in a guard — it runs before pipes and short-circuits the whole pipeline, so an unauthorized request never reaches validation or my handler.\"",
          ],
        },
        {
          type: "code",
          title: "src/auth/authenticated.guard.ts (a taste)",
          source: String.raw`import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return Boolean(request.headers["authorization"]);
  }
}`,
          caption: "A guard implements `canActivate` and returns a boolean. Return `false` and Nest never runs the pipes, the handler, or anything downstream — the request is rejected with a 403 immediately. Real auth (module 09) verifies a JWT here instead of just checking the header exists.",
        },
        {
          type: "quiz",
          q: "An unauthenticated request hits `POST /bookings` with a malformed body. In Nest's lifecycle, which rejects it first — and why does that ordering matter?",
          choices: [
            "The guard rejects it with 403 before the ValidationPipe ever runs, so you don't spend work validating a request that was never allowed",
            "The ValidationPipe rejects it with 400 first, then the guard would have run",
            "The exception filter runs first and decides both auth and validation",
            "The route handler runs first and checks auth itself",
          ],
          answer: 0,
          explain: "Guards run at step 2, pipes at step 4 — authorization is settled before validation. The unauthenticated request is stopped with a 403 at the guard, and the ValidationPipe never even inspects the body. That ordering is deliberate: there's no point validating (or processing) input for a caller who was never allowed through the door.",
          nudge: "Walk the numbered pipeline: which comes first, the yes/no gate or the transform-and-validate stage?",
        },
        {
          type: "text",
          md: [
            "## Where this leaves you",
            "You can now describe a Nest request end to end: it passes middleware, gets past a guard, its body is validated and transformed by a pipe against a **class** DTO, your handler runs on clean input, an interceptor can reshape the response, and a filter catches anything that blew up.",
            "The pieces you only tasted here — guards for auth, interceptors for cross-cutting behavior, filters for errors — each get their own module. But the DTO-plus-`ValidationPipe` pattern is the one you'll write on nearly every endpoint from here on.",
          ],
        },
        {
          type: "quiz",
          q: "At which stage does your global ValidationPipe transform and validate the `@Body()` argument?",
          choices: [
            "After guards have allowed the request, but before the route handler runs",
            "Before any middleware, as the very first thing",
            "After the route handler returns, on the way out",
            "Only inside the exception filter, if something throws",
          ],
          answer: 0,
          explain: "Pipes are step 4: they run after middleware and guards (the request is already allowed) and immediately before the handler (step 5), so your controller method always receives a validated, transformed argument. Response-shaping happens later in interceptors; error-shaping happens last in filters.",
          nudge: "Recall the numbered order: guards decide if it runs, then pipes ready the arguments, then the handler executes.",
        },
      ],
    },
  ],
});
