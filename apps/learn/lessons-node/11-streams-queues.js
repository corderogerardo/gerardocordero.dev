window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "streams-queues",
  title: "Streams & Background Jobs",
  emoji: "🚰",
  lang: "ts",
  lessons: [
    {
      id: "streams-backpressure",
      title: "Streams: process it piece by piece",
      steps: [
        {
          type: "text",
          md: [
            "## The export that eats all your RAM",
            "An ops teammate clicks *Export all bookings* and your handler does `const rows = await bookings.findAll()` — 400,000 rows — builds one giant CSV string in memory, and sends it. On a laptop with test data it's fine. In production, on a container with 512MB, that single request allocates a few hundred megabytes, the process hits its heap limit, and Node kills it. One export takes down the box for every other request.",
            "The fix is to never hold the whole thing at once. A **stream** moves data in small chunks: read a booking, turn it into a CSV line, write that line out, drop it, read the next. Memory stays flat no matter how many rows there are, because only one chunk is in flight at a time.",
            "> The senior pitch: `Buffering is O(n) memory; streaming is O(1). If the dataset can grow, buffering is a time bomb — it works in the demo and pages you at 3am when a customer's data outgrew your heap.`",
          ],
        },
        {
          type: "text",
          md: [
            "## Three kinds of stream",
            "Node's `node:stream` module gives you three shapes, and every pipeline is some combination of them:",
            "- **Readable** — a source you pull chunks *out* of. A file on disk (`createReadStream`), an HTTP request body, a database cursor. It emits data until it's exhausted.\n- **Writable** — a sink you push chunks *into*. A file (`createWriteStream`), the HTTP response, stdout. It accepts data until you end it.\n- **Transform** — a Readable and Writable welded together: chunks flow *in* one side, you change them, changed chunks flow *out* the other. This is where a booking row becomes a CSV line.",
            "For PawWalk's export the chain is: **Readable** (booking rows from the DB) → **Transform** (row → CSV text) → **Writable** (the HTTP response). Data trickles through end to end; nothing piles up.",
          ],
        },
        {
          type: "code",
          title: "src/bookings/to-csv.transform.ts",
          source: String.raw`import { Transform } from "node:stream";

// objectMode: true means chunks are JS objects (a booking), not raw bytes.
export const toCsvRow = new Transform({
  objectMode: true,
  transform(booking, _encoding, done) {
    const line =
      booking.id + "," + booking.walkerId + "," + booking.priceCents + "\n";
    // done(error, output) — pass the transformed chunk out, or an error to abort.
    done(null, line);
  },
});`,
          caption: "A Transform is just a function: one chunk in, one chunk out via done(null, output). objectMode lets the input be a booking object while the output is a plain string. Call done(err) instead and the whole pipeline tears down with that error.",
        },
        {
          type: "quiz",
          q: "You need to turn each booking object flowing through the export into a line of CSV text. Which stream type is that?",
          choices: [
            "A Transform — chunks flow in, you reshape them, reshaped chunks flow out",
            "A Readable — it only produces data from a source",
            "A Writable — it only consumes data into a sink",
            "None; you must collect every booking into an array first",
          ],
          answer: 0,
          explain: "A Transform is a Writable and Readable joined: it accepts each booking, converts it, and emits the CSV line. Readable is pure source, Writable is pure sink. Collecting into an array is exactly the buffering you're trying to avoid.",
          nudge: "Which one sits in the middle, changing chunks as they pass through?",
        },
        {
          type: "text",
          md: [
            "## Backpressure: when the writer can't keep up",
            "Here's the trap that makes naive streaming *worse* than buffering. Suppose the Readable pulls booking rows from a fast local database, but the Writable is a slow client on hotel wifi. Chunks arrive faster than they can be sent. Where do they go? If you ignore the problem, they queue up in memory — and now you've reinvented the out-of-memory crash, just more slowly.",
            "**Backpressure** is the signal that says *stop reading, the sink is full*. A Writable's `.write()` returns `false` when its buffer is full; a well-behaved Readable pauses until the Writable emits `drain`. Wired correctly, the fast source automatically throttles to the slow sink and memory stays bounded.",
            "> Red flag in an interview: piping a fast source into a slow sink and never mentioning backpressure. Say `a stream without backpressure is just a slower memory leak` — the whole point of streaming is bounded memory, and backpressure is what bounds it.",
          ],
        },
        {
          type: "text",
          md: [
            "## `pipeline()` wires backpressure and errors for you",
            "The old way was `source.pipe(transform).pipe(dest)`. It works, but `.pipe()` has a nasty gap: if one stream in the chain errors, the others are **not** destroyed — they leak file handles and sockets. And you have to attach `error` listeners to every stream by hand.",
            "`stream.pipeline()` is the fix. It connects the streams, propagates backpressure through the whole chain, and — critically — if *any* stream errors or the client disconnects, it destroys *all* of them and calls you back with the error. The promise-based version from `node:stream/promises` lets you just `await` it.",
            "```ts\nimport { pipeline } from \"node:stream/promises\";\nawait pipeline(source, toCsvRow, dest); // backpressure + cleanup, handled\n```",
            "In Nest, a controller streams a download by returning a `StreamableFile` or by piping straight into the response — either way `pipeline` is what you reach for so a mid-export failure doesn't leak.",
          ],
        },
        {
          type: "exercise",
          title: "Pipe the export through pipeline()",
          prompt: [
            "Finish `exportBookings`. Stream `source` through the `toCsvRow` transform into `dest` using `pipeline` — pass all three in order, and `await` it so errors reject the promise and every stream is cleaned up.",
          ],
          starter: String.raw`import { pipeline } from "node:stream/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { toCsvRow } from "./to-csv.transform";

async function exportBookings() {
  const source = createReadStream("bookings.ndjson");
  const dest = createWriteStream("bookings.csv");
  // your code here
}`,
          solution: String.raw`import { pipeline } from "node:stream/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { toCsvRow } from "./to-csv.transform";

async function exportBookings() {
  const source = createReadStream("bookings.ndjson");
  const dest = createWriteStream("bookings.csv");
  await pipeline(source, toCsvRow, dest);
}`,
          checks: [
            { re: /await pipeline\(source,toCsvRow,dest\)/, hint: "Call `await pipeline(source, toCsvRow, dest)` — the three stages in reading order: source, transform, sink." },
          ],
          mustNot: [
            { re: /\.pipe\(/, hint: "Don't hand-chain with `.pipe()` — it won't destroy the other streams on an error. Let `pipeline()` wire backpressure and cleanup for you." },
            { re: /await pipeline\([^)]*\);?await pipeline/, hint: "One `pipeline()` call chains the whole thing — pass every stage as an argument, don't call it twice." },
          ],
          success: "That one line is the safe streaming primitive: bounded memory via backpressure, and if the client hangs up mid-export, all three streams are torn down and the error reaches your catch.",
        },
      ],
    },
    {
      id: "queue-producer",
      title: "Background jobs: get slow work off the request",
      steps: [
        {
          type: "text",
          md: [
            "## The request that waits on an email server",
            "A walker confirms a booking. Your handler saves it, then sends a confirmation email, then generates a PDF receipt, then returns `200`. The email provider is having a slow morning and takes 4 seconds. Your user stares at a spinner for 4 seconds — for work they don't even need to *wait* for. Worse, that request is holding a connection the whole time; enough slow emails and you run out of them and the whole API stalls.",
            "None of that work belongs on the request path. Confirming the booking is instant; the email and receipt are **background jobs** — things that must happen *eventually*, not *before the response*. Push them onto a queue, return `200` immediately, and let a separate worker process grind through them.",
            "> The senior framing: `Anything the caller doesn't need in the response — email, receipts, webhooks, thumbnails — belongs on a queue. The web process stays fast and responsive; the workers absorb the slow, flaky, retryable work.`",
          ],
        },
        {
          type: "text",
          md: [
            "## BullMQ: a queue backed by Redis",
            "**BullMQ** is the standard job queue for Node — jobs live in **Redis**, a producer pushes them on, and one or more worker processes pull them off. Nest wraps it in `@nestjs/bullmq` so a queue is just another injectable.",
            "There are two halves, and this lesson builds the first:",
            "- **Producer** — the code on the request path that says *this needs to happen later*. It injects the queue and calls `queue.add(name, data)`. That returns the instant the job is written to Redis; it does **not** wait for the job to run.\n- **Consumer / processor** — a worker that pulls jobs off and does the slow work. That's the next lesson.",
            "You register the queue once in a module, then inject it wherever you produce jobs:",
            "```ts\n// app.module.ts\nBullModule.forRoot({ connection: { host: \"localhost\", port: 6379 } }),\nBullModule.registerQueue({ name: \"emails\" }),\n```",
          ],
        },
        {
          type: "code",
          title: "src/bookings/bookings.service.ts",
          source: String.raw`import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

@Injectable()
export class BookingsService {
  // @InjectQueue names the registered queue; Nest hands you its Queue instance.
  constructor(
    @InjectQueue("emails") private readonly emailsQueue: Queue,
  ) {}

  async confirm(bookingId: string) {
    // Save the booking (fast) ... then enqueue the slow bits and return.
    await this.emailsQueue.add("booking-confirmation", { bookingId });
    return { status: "confirmed" };
  }
}`,
          caption: "queue.add(name, data) writes the job to Redis and resolves immediately — the email hasn't been sent yet, and that's the point. The caller gets confirmed in milliseconds; a worker sends the email whenever it gets to it. Keep the job data small (an id), not the whole object — the worker can re-fetch what it needs.",
        },
        {
          type: "quiz",
          q: "After `await this.emailsQueue.add(\"booking-confirmation\", { bookingId })` resolves, what has actually happened?",
          choices: [
            "The job is stored in Redis and will run later; the email has NOT been sent yet",
            "The confirmation email has been fully sent and delivered",
            "The request blocks until a worker finishes sending the email",
            "Nothing — add() only queues once the response is returned",
          ],
          answer: 0,
          explain: "add() resolves as soon as the job is persisted to Redis. Sending the email is the worker's job, and it may happen milliseconds or seconds later. That decoupling is exactly why the request stays fast — it never waits on the email provider.",
          nudge: "The whole reason to queue is so the request DOESN'T wait for the slow work.",
        },
        {
          type: "exercise",
          title: "Enqueue the confirmation instead of sending it inline",
          prompt: [
            "`confirm` currently returns without scheduling anything. Enqueue a `\"booking-confirmation\"` job carrying `{ bookingId }` on the injected `emailsQueue`, and `await` it so a failed enqueue surfaces. Don't send the email here — that's the worker's job.",
          ],
          starter: String.raw`@Injectable()
export class BookingsService {
  constructor(
    @InjectQueue("emails") private readonly emailsQueue: Queue,
  ) {}

  async confirm(bookingId: string) {
    // your code here
    return { status: "confirmed" };
  }
}`,
          solution: String.raw`@Injectable()
export class BookingsService {
  constructor(
    @InjectQueue("emails") private readonly emailsQueue: Queue,
  ) {}

  async confirm(bookingId: string) {
    await this.emailsQueue.add("booking-confirmation", { bookingId });
    return { status: "confirmed" };
  }
}`,
          checks: [
            { re: /this\.emailsQueue\.add\("booking-confirmation",\{bookingId\}\)/, hint: "Call `this.emailsQueue.add(\"booking-confirmation\", { bookingId })` — first arg is the job name, second is its data payload." },
            { re: /await this\.emailsQueue\.add/, hint: "`await` the add so a Redis hiccup rejects instead of silently dropping the job." },
          ],
          mustNot: [
            { re: /sendEmail\(|sendConfirmation\(/, hint: "Don't send the email inside `confirm` — that puts the slow work back on the request path. Enqueue it and let the worker send it." },
          ],
          success: "Now confirm() returns in milliseconds no matter how slow the email provider is. The work is safely in Redis, waiting for a worker — which you'll write next.",
        },
      ],
    },
    {
      id: "queue-consumer",
      title: "The worker: process, retry, and fail safely",
      steps: [
        {
          type: "text",
          md: [
            "## The other half: a processor pulls jobs off",
            "The producer put a job in Redis. Now something has to take it out and do the work. In `@nestjs/bullmq` that's a **processor**: a class decorated with `@Processor(\"emails\")` that extends `WorkerHost` and implements one `process(job)` method. Nest spins up a BullMQ worker bound to that queue and calls `process` for every job.",
            "One `process` method handles every job on the queue; you branch on `job.name` when a queue carries more than one kind of work. The job's payload is on `job.data` — for us, `{ bookingId }`.",
            "> Note: the older `@nestjs/bull` package used a per-method `@Process(\"name\")` decorator. Modern `@nestjs/bullmq` gives each processor a single `process()` method instead — switch on `job.name` inside it.",
          ],
        },
        {
          type: "code",
          title: "src/bookings/emails.processor.ts",
          source: String.raw`import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";

@Processor("emails")
export class EmailsProcessor extends WorkerHost {
  async process(job: Job) {
    // Branch on job.name when the queue carries several job types.
    if (job.name === "booking-confirmation") {
      await sendConfirmationEmail(job.data.bookingId);
    }
    // Throwing from here marks the job failed — BullMQ will retry it.
  }
}`,
          caption: "process() is where the slow work finally happens, off the request path. If it throws, BullMQ marks the job failed and (given an attempts setting) retries it. If it returns, the job is complete. Return values are stored on the job for inspection.",
        },
        {
          type: "text",
          md: [
            "## Retries with backoff, and the dead-letter idea",
            "Background work is flaky by nature — the email API times out, Redis blips, a third party 500s. The point of a queue is that a transient failure isn't fatal: **retry** it. You set the retry policy when you enqueue, and BullMQ handles the rest.",
            "```ts\nawait this.emailsQueue.add(\n  \"booking-confirmation\",\n  { bookingId },\n  { attempts: 3, backoff: { type: \"exponential\", delay: 1000 } },\n);\n```",
            "`attempts: 3` means try up to three times. `backoff: exponential, delay 1000` waits 1s, then 2s, then 4s between tries — so a provider that's briefly down gets room to recover instead of being hammered. A job that exhausts all attempts lands in BullMQ's **failed** set — the *dead-letter* equivalent: it's not lost, it's parked where you can inspect it, alert on it, or replay it. Watch that set with an `@OnWorkerEvent(\"failed\")` handler so a stuck queue pages you instead of failing silently.",
            "> The pitch: `Retries with exponential backoff turn a flaky dependency into a non-event; a dead-letter queue turns a permanent failure into a ticket instead of lost data. Silent job loss is the failure mode that erodes trust — always know where dead jobs go.`",
          ],
        },
        {
          type: "quiz",
          q: "A job is enqueued with `{ attempts: 3, backoff: { type: \"exponential\", delay: 1000 } }` and the email API is down for 5 seconds. What happens?",
          choices: [
            "It retries after ~1s, ~2s, ~4s; if still failing after 3 tries it lands in the failed set",
            "It retries instantly 3 times in a row, then is deleted and lost",
            "It blocks the original HTTP request until the email API recovers",
            "It retries forever until the email API comes back",
          ],
          answer: 0,
          explain: "Exponential backoff spaces the retries (~1s, ~2s, ~4s), giving the flaky provider time to recover. After the 3rd failed attempt the job moves to the failed set — parked for inspection or replay, not silently dropped. And none of this touches the original request, which returned long ago.",
          nudge: "Exponential backoff means the gaps grow; attempts is a ceiling, not infinity.",
        },
        {
          type: "exercise",
          title: "Write the process() handler",
          prompt: [
            "Give `EmailsProcessor` its worker method. Add an `async process(job: Job)` that, when `job.name` is `\"booking-confirmation\"`, calls `await sendConfirmationEmail(job.data.bookingId)`. Let it throw on failure — BullMQ turns a throw into a retry.",
          ],
          starter: String.raw`import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";

@Processor("emails")
export class EmailsProcessor extends WorkerHost {
  // your code here
}`,
          solution: String.raw`import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";

@Processor("emails")
export class EmailsProcessor extends WorkerHost {
  async process(job: Job) {
    if (job.name === "booking-confirmation") {
      await sendConfirmationEmail(job.data.bookingId);
    }
  }
}`,
          checks: [
            { re: /async process\(job:Job\)\{/, hint: "The one method BullMQ calls is `async process(job: Job) { … }` — Nest invokes it for every job on the queue." },
            { re: /if\(job\.name==="booking-confirmation"\)/, hint: "Branch on the job name: `if (job.name === \"booking-confirmation\")` so one processor can grow to handle more job types." },
            { re: /await sendConfirmationEmail\(job\.data\.bookingId\)/, hint: "Do the slow work with the payload: `await sendConfirmationEmail(job.data.bookingId)` — the id you enqueued lives on `job.data`." },
          ],
          mustNot: [
            { re: /@Process\(/, hint: "That's the legacy `@nestjs/bull` API. In `@nestjs/bullmq` you override the single `process()` method and switch on `job.name` — no per-method `@Process` decorator." },
          ],
          success: "That's the full pattern: the request enqueues in milliseconds, this worker grinds through the slow email off the request path, and a throw becomes a backed-off retry. Your web process stays responsive while the workers absorb the flaky work.",
        },
      ],
    },
  ],
});
