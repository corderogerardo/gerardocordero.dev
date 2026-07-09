window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "http-first-server",
  title: "HTTP From the Ground Up",
  emoji: "🌐",
  lang: "ts",
  lessons: [
    {
      id: "anatomy",
      title: "What an HTTP request really is",
      steps: [
        {
          type: "text",
          md: [
            "## Under the URL",
            "Every screen in the PawWalk app worked by sending an **HTTP request** and reading an **HTTP response**. Before you reach for a framework, it's worth seeing what those two things actually are — because a framework's whole job is to hide this, and you can't reason about what you can't see.",
            "An HTTP **request** is four things, in plain text over a socket:",
            "- **method** — the verb: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`. *What do you want to do?*\n- **path** — the resource: `/walkers`, `/bookings/42`. *To what?*\n- **headers** — key/value metadata: `Content-Type: application/json`, `Authorization: Bearer …`. *How, and who's asking?*\n- **body** — the optional payload (JSON for a `POST`). *With what data?*",
          ],
        },
        {
          type: "text",
          md: [
            "## The response is the mirror image",
            "The server answers with three things:",
            "- **status code** — a three-digit verdict the client reads *before* the body: `200`, `404`, `500`. It says how it went.\n- **headers** — metadata about the answer, above all `Content-Type: application/json` so the client knows to parse JSON.\n- **body** — the payload: the JSON list of walkers, or an error object.",
            "> The status code is the part beginners skip and seniors obsess over. The app decided whether to render your bookings or an error screen from that number alone — so getting it right is not cosmetic, it's the contract.",
          ],
        },
        {
          type: "code",
          title: "server.ts — a raw node:http server",
          source: String.raw`import { createServer } from "node:http";

const walkers = [
  { id: "1", name: "Mochi", pricePer30MinCents: 2500 },
  { id: "2", name: "Biscuit", pricePer30MinCents: 3000 },
];

const server = createServer((req, res) => {
  if (req.method === "GET" && req.url === "/walkers") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(walkers));
    return;
  }
  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ error: "not found" }));
});

server.listen(3000);`,
          caption: "No framework — just the standard library. `createServer` hands you `req` (method, url, headers) and `res`. You match the method and path yourself, set the status, set a header, and `res.end` the body. Everything a framework does starts here.",
        },
        {
          type: "quiz",
          q: "In the raw server above, what happens if you call `res.end(...)` without ever setting `res.statusCode`?",
          choices: [
            "Node sends 200 OK for you — the status defaults to 200",
            "The request hangs forever with no status",
            "Node throws an error at runtime",
            "The client receives a 500",
          ],
          answer: 0,
          explain: "`res.statusCode` defaults to `200`. That's a convenience, and also a trap: forget to set `404` on a missing walker and the client happily treats an error as success. Setting the status deliberately on every branch is the habit that separates a toy from an API.",
          nudge: "Think about the friendliest default a server could pick when you don't say otherwise.",
        },
        {
          type: "text",
          md: [
            "## What a framework hides",
            "Look at what you had to do by hand: check `req.method`, compare `req.url` as a raw string, remember to set `Content-Type`, remember to `JSON.stringify`, and fall through to a `404` yourself. Now imagine twenty endpoints, path parameters like `/walkers/:id`, query strings, and body parsing.",
            "That boilerplate is exactly what **Express** (next lesson) and then **NestJS** exist to remove. But you've now felt the machine underneath — so when a framework 'magically' returns JSON, you know it's just `setHeader` + `JSON.stringify` + `res.end` with a nicer face.",
          ],
        },
        {
          type: "exercise",
          title: "Answer GET /walkers by hand",
          prompt: [
            "Fill in the `createServer` callback so it returns the walkers as JSON. Set `res.statusCode` to `200`, set the `Content-Type` header to `application/json`, then end the response with `JSON.stringify(walkers)`.",
          ],
          starter: String.raw`import { createServer } from "node:http";

const walkers = [{ id: "1", name: "Mochi" }];

const server = createServer((req, res) => {
  // your code here
});`,
          solution: String.raw`import { createServer } from "node:http";

const walkers = [{ id: "1", name: "Mochi" }];

const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(walkers));
});`,
          checks: [
            { re: /res\.statusCode=200/, hint: "Set the verdict first: `res.statusCode = 200`." },
            { re: /res\.setHeader\("Content-Type","application\/json"\)/, hint: "Tell the client it's JSON: `res.setHeader(\"Content-Type\", \"application/json\")`." },
            { re: /res\.end\(JSON\.stringify\(walkers\)\)/, hint: "Serialize and send the body: `res.end(JSON.stringify(walkers))`." },
          ],
          success: "That's a real HTTP endpoint with zero dependencies. Everything from here is ergonomics on top of these three lines.",
        },
      ],
    },
    {
      id: "rest",
      title: "REST conventions & status codes",
      steps: [
        {
          type: "text",
          md: [
            "## Resources and verbs",
            "A **REST API** is a discipline for shaping endpoints: you expose **resources** (walkers, bookings) at noun paths, and act on them with HTTP **verbs**. The verb says *what*; the path names *the thing*.",
            "- `GET /walkers` — read the list\n- `GET /walkers/42` — read one walker\n- `POST /walkers` — create a walker\n- `PUT /walkers/42` — replace walker 42 wholesale\n- `PATCH /walkers/42` — update part of walker 42\n- `DELETE /walkers/42` — remove it",
            "> Red flag in an interview: `POST /getWalkers` or `GET /deleteBooking?id=42`. Putting the verb in the path, or using `GET` to change data, tells a senior you haven't internalized REST. The method *is* the verb.",
          ],
        },
        {
          type: "text",
          md: [
            "## The status codes that carry their weight",
            "You don't need all sixty. You need these, cold, and to reach for the right one without thinking:",
            "- **200 OK** — a read (or update) succeeded, body attached.\n- **201 Created** — a `POST` brought a new resource into existence.\n- **204 No Content** — success, but nothing to return (a `DELETE`).\n- **400 Bad Request** — the body/params are malformed. Client's fault.\n- **401 Unauthorized** — no valid credentials (you're not logged in).\n- **404 Not Found** — no resource at that path.\n- **422 Unprocessable Entity** — well-formed but *semantically* wrong (a booking in the past, `minutes: -5`).\n- **500 Internal Server Error** — your code threw. Server's fault.",
            "The 400-vs-422 line trips people up: `400` means \"I couldn't even parse this\"; `422` means \"I parsed it fine, but the values don't make sense.\" Say that distinction out loud and you sound senior.",
          ],
        },
        {
          type: "code",
          title: "server.ts — routing by method and status",
          source: String.raw`const server = createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.method === "GET" && req.url === "/walkers") {
    res.statusCode = 200;
    res.end(JSON.stringify(walkers));
    return;
  }

  if (req.method === "POST" && req.url === "/walkers") {
    res.statusCode = 201;
    res.end(JSON.stringify({ id: "3", name: "Pepper" }));
    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ error: "not found" }));
});`,
          caption: "Same resource, `/walkers`, two verbs, two success codes: `200` for the read, `201` for the create. Anything that doesn't match falls through to `404`. This is REST in its rawest form — the framework will make it prettier, not different.",
        },
        {
          type: "quiz",
          q: "A `POST /bookings` arrives with valid JSON, but it books a walk for yesterday. Which status code is the precise answer?",
          choices: [
            "422 Unprocessable Entity",
            "400 Bad Request",
            "404 Not Found",
            "500 Internal Server Error",
          ],
          answer: 0,
          explain: "The JSON parsed fine, so it isn't `400`. Nothing is missing at that path, so it isn't `404`. Your code didn't crash, so it isn't `500`. The request is *well-formed but semantically invalid* — that's exactly what `422` means. Reaching for it instead of a lazy `400` signals you know the difference.",
          nudge: "The body parsed cleanly — the problem is the meaning of the values, not their shape.",
        },
        {
          type: "exercise",
          title: "Return 404 when the walker is missing",
          prompt: [
            "The lookup is done for you — `walker` is either a found object or `undefined`. If it's missing, set `res.statusCode` to `404` and end with an `{ error: \"walker not found\" }` object, then `return`. Otherwise set `res.statusCode` to `200` and end with the `walker`.",
          ],
          starter: String.raw`const server = createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  const walker = walkers.find((w) => w.id === "2");
  // your code here
});`,
          solution: String.raw`const server = createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  const walker = walkers.find((w) => w.id === "2");
  if (!walker) {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "walker not found" }));
    return;
  }
  res.statusCode = 200;
  res.end(JSON.stringify(walker));
});`,
          checks: [
            { re: /if\(!walker\)\{/, hint: "Guard the missing case first: `if (!walker) {`." },
            { re: /res\.statusCode=404/, hint: "A missing resource is a `404`: `res.statusCode = 404`." },
            { re: /res\.statusCode=200/, hint: "The found case succeeds: `res.statusCode = 200`." },
            { re: /res\.end\(JSON\.stringify\(walker\)\)/, hint: "Send the found walker as the body: `res.end(JSON.stringify(walker))`." },
          ],
          mustNot: [
            { re: /res\.statusCode=500/, hint: "A missing walker is the client asking for something that isn't there — that's `404`, not a server error." },
          ],
          success: "Guard the error path, return early, answer the happy path last. That shape — check, 404, return, 200 — repeats in every endpoint you'll write.",
        },
      ],
    },
    {
      id: "express",
      title: "The same endpoint in Express",
      steps: [
        {
          type: "text",
          md: [
            "## The ergonomic jump",
            "Now the same `GET /walkers`, in **Express** — the minimal, unopinionated web framework that most Node backends start from. Watch how much of the raw boilerplate disappears:",
            "- No manual `req.method === \"GET\"` / `req.url === \"/walkers\"` matching — you register `app.get(\"/walkers\", …)` and Express routes it.\n- No `setHeader` + `JSON.stringify` + `res.end` — `res.json(walkers)` sets `Content-Type: application/json`, serializes, and sends in one call.\n- Path parameters like `/walkers/:id` are parsed for you into `req.params.id`.",
          ],
        },
        {
          type: "code",
          title: "server.ts — GET /walkers in Express",
          source: String.raw`import express from "express";

const app = express();

const walkers = [
  { id: "1", name: "Mochi", pricePer30MinCents: 2500 },
  { id: "2", name: "Biscuit", pricePer30MinCents: 3000 },
];

app.get("/walkers", (req, res) => {
  res.json(walkers);
});

app.get("/walkers/:id", (req, res) => {
  const walker = walkers.find((w) => w.id === req.params.id);
  if (!walker) {
    res.status(404).json({ error: "walker not found" });
    return;
  }
  res.json(walker);
});

app.listen(3000);`,
          caption: "`res.json(...)` is the raw lesson's three lines collapsed into one. `res.status(404).json(...)` chains the status and body together. Same HTTP on the wire — a fraction of the code.",
        },
        {
          type: "text",
          md: [
            "## Reading a JSON body",
            "Express doesn't parse request bodies unless you tell it to. One line of middleware — `app.use(express.json())` — reads the raw bytes of any `application/json` request and hands you the parsed object as `req.body`. Without it, `req.body` is `undefined` and every `POST` handler quietly breaks — a classic first-day Express bug.",
          ],
        },
        {
          type: "code",
          title: "server.ts — a POST that parses and validates",
          source: String.raw`app.use(express.json());

app.post("/walkers", (req, res) => {
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }
  res.status(201).json({ id: "3", name });
});`,
          caption: "`express.json()` fills `req.body`; you destructure `name` off it, reject missing input with `400`, and answer a successful create with `201`. Decode, validate, respond — the same three beats as the raw server, minus the ceremony.",
        },
        {
          type: "quiz",
          q: "You add a `POST /walkers` handler, but `req.body` is always `undefined`. What's the fix?",
          choices: [
            "Add `app.use(express.json())` so Express parses JSON bodies",
            "Change the route to `app.get`",
            "Set `res.statusCode` before reading the body",
            "Return `res.json()` with no argument",
          ],
          answer: 0,
          explain: "Express ships with no body parser wired up — `req.body` stays `undefined` until you mount `express.json()`. It's the single most common 'why is my POST empty' bug, and the fix is one line of middleware before your routes.",
          nudge: "Something has to turn the raw request bytes into a JavaScript object before `req.body` exists.",
        },
        {
          type: "text",
          md: [
            "## Why NestJS next",
            "Express got you here fast, but it hands you nothing above the route. Where do services live? How do you inject a database? Validate a DTO? Wire twenty controllers without one 800-line file? Express shrugs — those are your problem, and every team invents a different answer.",
            "**NestJS** is Express (or Fastify) with the structure decided for you: controllers, providers, dependency injection, modules, DTO validation — the scaffolding a codebase needs to stay maintainable past its first ten endpoints. You felt the raw machine, then the ergonomic jump; the next module is the jump to *structure at scale*.",
            "> The pitch: \"Express is a router; Nest is an architecture.\" You reach for raw `http` to understand, Express to prototype, and Nest when a team has to live in the codebase for years. One last exercise, then module 05 makes it real.",
          ],
        },
        {
          type: "exercise",
          title: "Write an Express route returning a walker",
          prompt: [
            "Register a `GET` route at `/walkers` on `app`. Give it an arrow handler taking `(req, res)`, and inside it send the `walkers` array with `res.json(walkers)`.",
          ],
          starter: String.raw`import express from "express";

const app = express();
const walkers = [{ id: "1", name: "Mochi", pricePer30MinCents: 2500 }];

// your code here`,
          solution: String.raw`import express from "express";

const app = express();
const walkers = [{ id: "1", name: "Mochi", pricePer30MinCents: 2500 }];

app.get("/walkers", (req, res) => {
  res.json(walkers);
});`,
          checks: [
            { re: /app\.get\("\/walkers",/, hint: "Register a read route on the resource: `app.get(\"/walkers\", ...)`." },
            { re: /\(req,res\)=>/, hint: "The handler is an arrow taking the request and response: `(req, res) => { ... }`." },
            { re: /res\.json\(walkers\)/, hint: "One call sets the JSON header, serializes, and sends: `res.json(walkers)`." },
          ],
          success: "That single route replaces the whole raw callback from lesson 1. This is why teams reach for a framework — the HTTP is identical, the code is half the size.",
        },
      ],
    },
  ],
});
