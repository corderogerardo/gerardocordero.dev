window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "bookings-transactions",
  title: "Bookings: Transactions, Idempotency & Locking",
  emoji: "🔐",
  lang: "ts",
  lessons: [
    {
      id: "create-booking",
      title: "Creating a booking",
      steps: [
        {
          type: "text",
          md: [
            "## The record everything else hangs off",
            "PawWalk sells one thing: a walk. A **booking** is the record of one — *this user* hired *this walker*, at *this time*, for *this price*. Payments, GPS tracking, the chat thread — every other feature points back at a booking row. So `POST /bookings` is the most important write in the backend, and it's the one where getting it wrong costs real money.",
            "The request carries `walkerId`, `userId`, and a `scheduledAt` timestamp. But two fields are **not** the client's to send: the `priceCents` and the `status`. The server owns those. Trust a client-sent price and a walker posts `priceCents: 1` for a free hour; trust a client-sent status and a booking is `confirmed` before anyone paid.",
            "> The senior instinct, same as module 06's DTO lesson: the client says *who* and *when*; the server decides *how much* and *what state*. Money and state are server-owned, always.",
          ],
        },
        {
          type: "text",
          md: [
            "## A booking's life is a small state machine",
            "A booking is never just \"a booking\" — it's always in one of a fixed set of states, and it moves between them in one direction:",
            "- **pending** — created, waiting on the walker (and the charge). Every new booking starts here.\n- **confirmed** — the walker accepted and the card was charged. The walk is on.\n- **cancelled** — called off by either side.",
            "Model that set as a **typed union**, not a bare `string`. `type BookingStatus = \"pending\" | \"confirmed\" | \"cancelled\"` means the compiler rejects `status = \"confrimed\"` (a typo) and `status = \"paid\"` (a state that doesn't exist) at build time, and every function that takes a `BookingStatus` documents the only three values it can ever see.",
            "> The reframe: a bare `string` says \"any text\"; a union says \"one of exactly these\". A typo becomes a compile error instead of a corrupt row you find in production.",
          ],
        },
        {
          type: "code",
          title: "src/bookings/bookings.service.ts",
          source: String.raw`import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBookingDto } from "./dto/create-booking.dto";

export type BookingStatus = "pending" | "confirmed" | "cancelled";

const PRICE_BY_DURATION: Record<number, number> = {
  30: 1500,
  45: 2000,
  60: 2500,
};

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBookingDto) {
    return this.prisma.booking.create({
      data: {
        walkerId: dto.walkerId,
        userId: dto.userId,
        scheduledAt: dto.scheduledAt,
        priceCents: PRICE_BY_DURATION[dto.durationMinutes],
        status: "pending",
      },
    });
  }
}`,
          caption: "The DTO (from module 06) already validated the shape; here the service fills in what it owns. `priceCents` is looked up from a server-side table, never read off the body, and `status` is stamped `pending`. `PrismaService` arrives by constructor injection — the same DI you wired for WalkersService in module 05.",
        },
        {
          type: "text",
          md: [
            "## Prices are cents, and cents are integers",
            "`priceCents: 1500` is $15.00 stored as the integer `1500`. Never store money as a floating-point dollar amount — `0.1 + 0.2` is `0.30000000000000004` in IEEE-754, and that rounding drift on a payment is a support ticket at best and a lawsuit at worst.",
            "> The one-liner: `store money as an integer count of the smallest unit — cents — and only divide by 100 at the very edge, when you render it to a human.`",
          ],
        },
        {
          type: "quiz",
          q: "A booking's `status` field can only ever be `pending`, `confirmed`, or `cancelled`. Why model it as `type BookingStatus = \"pending\" | \"confirmed\" | \"cancelled\"` instead of a plain `string`?",
          choices: [
            "The compiler rejects any value outside the three, so a typo like \"confrimed\" is caught at build time instead of writing a broken row",
            "A union type is stored more compactly in the database than a string",
            "Plain strings cannot be saved by Prisma",
            "A union makes the query run faster",
          ],
          answer: 0,
          explain: "A bare `string` accepts any text — a typo or an invented state sails straight into the database. A union pins the field to exactly three legal values, so the compiler flags a misspelling or a state that doesn't exist before the code ever runs. It also documents, everywhere a `BookingStatus` is passed, the only values it can hold.",
          nudge: "Think about what the compiler can catch when the set of legal values is written into the type itself.",
        },
        {
          type: "exercise",
          title: "Type the booking status",
          prompt: [
            "Give the status field a real type. Declare `export type BookingStatus` as the union of the three states `pending`, `confirmed`, and `cancelled` (double-quoted strings joined with `|`). Then declare `const DEFAULT_STATUS: BookingStatus = \"pending\"` — a new booking always starts pending.",
          ],
          starter: String.raw`// Declare the BookingStatus union and the default state.
// your code here`,
          solution: String.raw`export type BookingStatus = "pending" | "confirmed" | "cancelled";

const DEFAULT_STATUS: BookingStatus = "pending";`,
          checks: [
            { re: /export type BookingStatus="pending"\|"confirmed"\|"cancelled"/, hint: "Write the union with `|` between the three double-quoted states: `export type BookingStatus = \"pending\" | \"confirmed\" | \"cancelled\"`." },
            { re: /const DEFAULT_STATUS:BookingStatus="pending"/, hint: "Type the constant with your union: `const DEFAULT_STATUS: BookingStatus = \"pending\"`." },
          ],
          mustNot: [
            { re: /DEFAULT_STATUS:string=/, hint: "Type it as `BookingStatus`, not `string` — the whole point is to narrow it to the three legal states." },
          ],
          success: "That union is the booking's whole vocabulary. Anywhere a `BookingStatus` is passed, the compiler now guarantees it's one of exactly three values.",
        },
      ],
    },
    {
      id: "transactions",
      title: "Why a booking needs a transaction",
      steps: [
        {
          type: "text",
          md: [
            "## One booking, several writes",
            "The service above wrote a single row. A *real* booking write touches more than one: you insert the booking, you insert a **hold** on the walker's slot so nobody else can grab it, and (next module) you record the charge. Three writes that must all succeed or all fail — together.",
            "Picture them running one at a time and the process crashing between write two and write three: the booking exists, the slot is held, but no charge was recorded. Or worse, the charge went through and the booking insert failed — you took the money and have nothing to show for it. A **half-written** booking is the exact bug that turns into an angry customer and a manual refund.",
            "> The rule for anything money-shaped: writes that belong together must be **atomic** — all-or-nothing. There is no valid state where two of the three landed.",
          ],
        },
        {
          type: "text",
          md: [
            "## A transaction is the all-or-nothing wrapper",
            "A database **transaction** groups writes so the database applies **all** of them or **none** of them. Commit and every write lands together; throw at any point and the database **rolls back** — it's as if none of them ran. That's the **A** in ACID, atomicity, and it's the tool built for exactly this problem.",
            "Prisma gives you two shapes:",
            "- **Sequential** — `prisma.$transaction([queryA, queryB])`: hand it an array of independent queries, they run in one transaction. Simple, but each query can't see the others' results.\n- **Interactive** — `prisma.$transaction(async (tx) => { ... })`: you get a scoped client `tx` and run real logic inside — read a row, branch on it, then write. **This is the one you want for bookings**, because the hold depends on the booking you just created.",
            "Inside the callback you use `tx.booking.create(...)`, **not** `this.prisma.booking.create(...)`. The `tx` client is the one enrolled in the transaction; reach for the outer `this.prisma` by mistake and that write escapes the atomic boundary — it commits on its own and won't roll back with the rest.",
          ],
        },
        {
          type: "code",
          title: "src/bookings/bookings.service.ts (create, transactional)",
          source: String.raw`async create(dto: CreateBookingDto) {
  return this.prisma.$transaction(async (tx) => {
    const booking = await tx.booking.create({
      data: {
        walkerId: dto.walkerId,
        userId: dto.userId,
        scheduledAt: dto.scheduledAt,
        priceCents: PRICE_BY_DURATION[dto.durationMinutes],
        status: "pending",
      },
    });

    await tx.slotHold.create({
      data: {
        walkerId: dto.walkerId,
        scheduledAt: dto.scheduledAt,
        bookingId: booking.id,
      },
    });

    return booking;
  });
}`,
          caption: "Both writes use `tx`, so they share one transaction. If the second `create` throws, the first is rolled back — the booking never existed. The callback's return value becomes the transaction's result once it commits.",
        },
        {
          type: "text",
          md: [
            "## Double-booking: let the database say no",
            "Two users can try to book the same walker for the same 3pm slot at nearly the same instant. You *could* check \"is this slot free?\" in code first — but between your check and your write, the other request slips in. That gap is a **race condition**, and app-level checks can't close it.",
            "The database can. Put a **unique constraint** on `(walkerId, scheduledAt)` in the `slotHold` table. Now the *second* insert for that pair fails at the database level — atomically, no gap. Prisma surfaces it as error code **`P2002`** (unique constraint violation). Catch it and translate: a well-formed request that clashes with an existing booking is a **`409 Conflict`**, not a `400`.",
            "> The senior framing: `don't check-then-write for uniqueness — declare the constraint and let the database enforce it inside the transaction. The DB is the only thing that sees all writers at once.`",
          ],
        },
        {
          type: "quiz",
          q: "Inside `this.prisma.$transaction(async (tx) => { ... })`, the booking insert succeeds but the slot-hold insert throws because the slot is already taken. What is the state of the database afterward?",
          choices: [
            "Neither write survives — the booking insert is rolled back, so it's as if nothing ran",
            "The booking row stays, only the slot-hold is discarded",
            "Both writes are kept and the error is ignored",
            "The booking is saved with status set to cancelled",
          ],
          answer: 0,
          explain: "Throwing anywhere inside the interactive callback rolls the whole transaction back. The booking insert that already ran is undone with the failed hold — the database returns to exactly the state it was in before `create` was called. That atomic all-or-nothing guarantee is the entire reason to wrap the writes in a transaction.",
          nudge: "What does a transaction do to already-executed writes when a later write throws?",
        },
        {
          type: "exercise",
          title: "Wrap the two writes in one transaction",
          prompt: [
            "The booking insert and the slot-hold insert must land together or not at all. Wrap them in an **interactive** transaction: call `this.prisma.$transaction(async (tx) => { ... })`, create the booking with `tx.booking.create({ data: bookingData })`, then the hold with `tx.slotHold.create({ data: holdData })`, and `return booking`.",
            "> Use `tx` for both writes, never `this.prisma` — only the `tx` client is enrolled in the transaction.",
          ],
          starter: String.raw`async create(dto: CreateBookingDto) {
  const bookingData = this.buildBooking(dto);
  const holdData = this.buildHold(dto);
  // your code here
}`,
          solution: String.raw`async create(dto: CreateBookingDto) {
  const bookingData = this.buildBooking(dto);
  const holdData = this.buildHold(dto);
  return this.prisma.$transaction(async (tx) => {
    const booking = await tx.booking.create({ data: bookingData });
    await tx.slotHold.create({ data: holdData });
    return booking;
  });
}`,
          checks: [
            { re: /this\.prisma\.\$transaction\(async\(tx\)=>\{/, hint: "Open an interactive transaction: `this.prisma.$transaction(async (tx) => {`." },
            { re: /tx\.booking\.create\(\{data:bookingData\}\)/, hint: "Create the booking on the transaction client: `tx.booking.create({ data: bookingData })`." },
            { re: /tx\.slotHold\.create\(\{data:holdData\}\)/, hint: "Create the hold on the same client: `tx.slotHold.create({ data: holdData })`." },
          ],
          mustNot: [
            { re: /this\.prisma\.booking\.create/, hint: "Don't use `this.prisma.booking.create` inside the callback — that write escapes the transaction. Use the `tx` client." },
          ],
          success: "Both writes now share one atomic boundary: the slot-hold failing takes the booking down with it. No more half-written bookings.",
        },
      ],
    },
    {
      id: "idempotency",
      title: "Idempotency: surviving the retry",
      steps: [
        {
          type: "text",
          md: [
            "## The retry that charges twice",
            "The app fires `POST /bookings`. The server creates the booking, charges the card, and sends `201`... but the response is lost on a flaky subway connection. The app never hears back, so it does the sensible thing and **retries**. Now you have *two* bookings and *two* charges for one walk.",
            "This isn't a rare edge case — it's how networks work. Any client that retries (and every good one does) will eventually send you a duplicate. For a read that's harmless; for a write that moves money, it's a double charge. The property you need is **idempotency**: the same request sent twice has the same effect as sending it once.",
            "> The senior line: `at-least-once delivery is the only honest assumption about a network. So any money-moving POST has to be idempotent — the second attempt must be a no-op that returns the first result.`",
          ],
        },
        {
          type: "text",
          md: [
            "## The Idempotency-Key pattern",
            "The fix is a contract between client and server, the same one Stripe uses:",
            "1. The client generates a unique **key** (a UUID) for the operation and sends it in an `Idempotency-Key` header. A retry reuses the *same* key.\n2. On arrival, the server looks the key up in a table. **Seen before?** Return the stored response and do nothing else. **New?** Do the work, then store `key → response` — inside the same transaction as the booking, so the key is saved if and only if the booking committed.\n3. The retry carries the same key, hits the stored row, and gets the original `201` back — no second booking, no second charge.",
            "The key is the client's promise that \"this is the same operation.\" The server's job is to remember keys it has honored and short-circuit the repeats.",
            "```ts\n// the client sends the same key on every attempt of one booking\nheaders: { \"Idempotency-Key\": \"b1f9c3a2-...\" }\n```",
          ],
        },
        {
          type: "code",
          title: "src/bookings/bookings.controller.ts + service",
          source: String.raw`@Post()
create(
  @Headers("idempotency-key") key: string,
  @Body() dto: CreateBookingDto,
) {
  return this.bookings.create(key, dto);
}

// in BookingsService
async create(key: string, dto: CreateBookingDto) {
  const seen = await this.prisma.idempotencyKey.findUnique({
    where: { key },
  });
  if (seen) {
    return seen.response;
  }
  return this.writeBooking(key, dto);
}`,
          caption: "`@Headers(\"idempotency-key\")` binds the header to a parameter, just like `@Param` and `@Body` bind their sources. The service checks the key first and short-circuits on a hit — the expensive work in `writeBooking` (the transaction plus the charge) only runs for a genuinely new request.",
        },
        {
          type: "quiz",
          q: "A client sends `POST /bookings` with `Idempotency-Key: abc`, the booking is created, but the response is lost and the client retries with the same `Idempotency-Key: abc`. With the pattern above, what happens on the retry?",
          choices: [
            "The server finds key `abc` already stored, returns the original booking's response, and creates nothing new",
            "The server creates a second booking because each POST is independent",
            "The retry is rejected with a 400 because the key was already used",
            "The server charges the card again but reuses the first booking row",
          ],
          answer: 0,
          explain: "The stored key is the memory of work already done. On the retry the `findUnique` hits the existing row, so the server returns the first response and skips creation and charging entirely. One booking, one charge — the second identical request is a safe no-op, which is exactly what idempotency guarantees.",
          nudge: "The key was saved the first time. What does the lookup find on the second, and what does the code do when it finds it?",
        },
        {
          type: "exercise",
          title: "Bind the Idempotency-Key header",
          prompt: [
            "The controller can't dedupe a key it never reads. In the `create` handler, bind the header with `@Headers(\"idempotency-key\") key: string` as the first parameter, keep `@Body() dto: CreateBookingDto`, and pass both to the service: `return this.bookings.create(key, dto)`.",
          ],
          starter: String.raw`@Post()
create(@Body() dto: CreateBookingDto) {
  // your code here
}`,
          solution: String.raw`@Post()
create(
  @Headers("idempotency-key") key: string,
  @Body() dto: CreateBookingDto,
) {
  return this.bookings.create(key, dto);
}`,
          checks: [
            { re: /@Headers\("idempotency-key"\)key:string/, hint: "Bind the header to a parameter: `@Headers(\"idempotency-key\") key: string`." },
            { re: /@Body\(\)dto:CreateBookingDto/, hint: "Keep binding the validated body: `@Body() dto: CreateBookingDto`." },
            { re: /return this\.bookings\.create\(key,dto\)/, hint: "Hand both to the service: `return this.bookings.create(key, dto)`." },
          ],
          success: "The key is now in the handler's hands. Next the service has to actually remember it.",
        },
        {
          type: "exercise",
          title: "Short-circuit a repeated key",
          prompt: [
            "In the service, dedupe before doing any work. Look the key up with `this.prisma.idempotencyKey.findUnique({ where: { key } })` into `const seen`. If `seen` exists, `return seen.response` immediately. Otherwise fall through to `return this.writeBooking(key, dto)`.",
          ],
          starter: String.raw`async create(key: string, dto: CreateBookingDto) {
  // your code here
  return this.writeBooking(key, dto);
}`,
          solution: String.raw`async create(key: string, dto: CreateBookingDto) {
  const seen = await this.prisma.idempotencyKey.findUnique({
    where: { key },
  });
  if (seen) {
    return seen.response;
  }
  return this.writeBooking(key, dto);
}`,
          checks: [
            { re: /this\.prisma\.idempotencyKey\.findUnique\(\{where:\{key\},?\}\)/, hint: "Look the key up: `this.prisma.idempotencyKey.findUnique({ where: { key } })`." },
            { re: /if\(seen\)\{/, hint: "Guard on the lookup result: `if (seen) {`." },
            { re: /return seen\.response/, hint: "Return the stored response and stop: `return seen.response`." },
          ],
          success: "That guard is the whole idempotency payoff: a repeated key never reaches `writeBooking`, so it can't create a second booking or fire a second charge.",
        },
      ],
    },
    {
      id: "locking",
      title: "Optimistic vs pessimistic locking",
      steps: [
        {
          type: "text",
          md: [
            "## When two writers touch the same row",
            "Idempotency handles the *same* client retrying. Locking handles *different* clients colliding on one row. Say a walker confirms a booking in the app while an admin cancels it in the dashboard — both read the `pending` booking, both decide to write, and the second write silently stomps the first. Whoever saves last wins, and the loser's change vanishes with no error. This is the **lost update** problem.",
            "The trap is that plain \"read it, decide, write it back\" (check-then-act) has a gap between the read and the write where the other writer sneaks in. Two strategies close that gap, and knowing when to reach for each is a real interview signal.",
          ],
        },
        {
          type: "text",
          md: [
            "## Optimistic: assume no conflict, verify at write",
            "**Optimistic locking** bets that collisions are rare. You don't hold any lock; you add a `version` column and *check it at write time*. Read the booking and its version, then update **conditionally**: \"set status = confirmed **where** id = X **and** version = 5, and bump version to 6.\" If someone else already wrote (version is now 6), your `WHERE` matches **zero rows** — the update no-ops, you detect the `count === 0`, and you either retry or throw a `409`.",
            "- **Cost when there's no conflict:** nothing — no lock was ever held.\n- **Cost when there is one:** you redo the work.\n- **Reach for it when:** conflicts are rare (most bookings are touched by one person). This is the default for web apps.",
          ],
        },
        {
          type: "text",
          md: [
            "## Pessimistic: take the lock up front",
            "**Pessimistic locking** assumes a collision *will* happen, so it grabs the row's lock before touching it — `SELECT ... FOR UPDATE` inside a transaction. Any other writer that wants the same row **blocks and waits** until your transaction commits. No lost update is possible because the second writer literally can't proceed until you're done.",
            "- **Cost:** other writers wait; hold the lock too long and you get contention, or worse, a **deadlock** if two transactions grab each other's rows.\n- **Reach for it when:** conflicts are frequent and a retry is expensive or the operation absolutely must not be redone (think inventory of the last concert ticket).",
            "> The 3-beat trade-off pitch: `Optimistic locking is cheap when writes rarely collide — no lock, just a version check, retry on the rare clash. Pessimistic locking is safe when they collide often — take the row lock and make others wait. I default to optimistic for bookings and reach for pessimistic only when contention is real, because holding locks invites deadlocks.`",
          ],
        },
        {
          type: "code",
          title: "src/bookings/bookings.service.ts (optimistic confirm)",
          source: String.raw`async confirm(id: string, version: number) {
  const result = await this.prisma.booking.updateMany({
    where: { id, version },
    data: { status: "confirmed", version: version + 1 },
  });

  if (result.count === 0) {
    throw new ConflictException("booking changed, refetch and retry");
  }
}`,
          caption: "`updateMany` (not `update`) is the trick: it returns a `count` instead of throwing when nothing matches. Matching on both `id` and `version` means a stale version updates zero rows — that's your conflict signal. Bumping `version` in the same statement is what makes the next writer's stale check fail.",
        },
        {
          type: "quiz",
          q: "PawWalk bookings are almost always edited by a single person; a genuine two-writer collision on the same booking is rare. Which locking strategy fits, and why?",
          choices: [
            "Optimistic locking — no lock is held in the common case, and the rare conflict is caught by a version check and retried",
            "Pessimistic locking — always take a row lock so no write can ever collide",
            "Neither — a global lock around the whole bookings table",
            "Both at once, applied to every update for safety",
          ],
          answer: 0,
          explain: "When conflicts are rare, optimistic locking is nearly free: you hold no lock and just verify the version at write time. The occasional clash costs one retry — far cheaper than making every writer wait on a lock they'll almost never contend for. Pessimistic locking earns its cost only when collisions are frequent or a redo is unacceptable.",
          nudge: "If collisions almost never happen, is it worth paying the cost of a held lock on every single write?",
        },
        {
          type: "exercise",
          title: "Confirm a booking with an optimistic check",
          prompt: [
            "Write the version-checked update. Call `this.prisma.booking.updateMany` with `where: { id, version }` and `data: { status: \"confirmed\", version: version + 1 }`, storing it in `const result`. Then, if `result.count === 0`, `throw new ConflictException(...)` — a zero count means someone else already changed the row.",
          ],
          starter: String.raw`async confirm(id: string, version: number) {
  // your code here
}`,
          solution: String.raw`async confirm(id: string, version: number) {
  const result = await this.prisma.booking.updateMany({
    where: { id, version },
    data: { status: "confirmed", version: version + 1 },
  });
  if (result.count === 0) {
    throw new ConflictException("booking changed, refetch and retry");
  }
}`,
          checks: [
            { re: /updateMany\(\{where:\{id,version\}/, hint: "Match on both id and version: `updateMany({ where: { id, version }, ... })`." },
            { re: /data:\{status:"confirmed",version:version\+1\}/, hint: "Set the status and bump the version in the same write: `data: { status: \"confirmed\", version: version + 1 }`." },
            { re: /result\.count===0/, hint: "A stale version matches nothing: check `if (result.count === 0)`." },
            { re: /throw new ConflictException\(/, hint: "Signal the lost-update as a conflict: `throw new ConflictException(...)`." },
          ],
          mustNot: [
            { re: /booking\.update\(/, hint: "Use `updateMany`, not `update` — `update` throws when no row matches; `updateMany` returns a `count` of 0 you can check." },
          ],
          success: "That's optimistic locking in eight lines: no held lock, a version guard on the write, and a clean 409 on the rare clash. You now have the full safe-booking toolkit — transaction, idempotency, and locking.",
        },
      ],
    },
  ],
});
