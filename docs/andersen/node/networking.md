# Networking and protocols

### REST principles and resource design
**They ask:** "What actually makes an API RESTful, beyond 'uses HTTP verbs'?"

The core idea is modeling the domain as **resources** (nouns, addressed by URLs) manipulated through a fixed, uniform set of HTTP methods, rather than an endpoint per action (`/getUser`, `/updateUser`). REST is also meant to be **stateless** — each request carries everything needed to process it, with no server-side session tied to a specific connection, which is exactly what makes REST APIs trivially horizontally scalable behind a load balancer. Resource design means nouns for URLs (`/orders/42/items`), verbs for methods (`GET`/`POST`/`PATCH`/`DELETE`), and status codes that mean something specific, not just 200 for everything.

```
GET    /orders/42        -- fetch
POST   /orders           -- create
PATCH  /orders/42        -- partial update
DELETE /orders/42        -- remove
```

**Say it:** "REST models the domain as stateless resources addressed by URL, manipulated through a uniform verb set — statelessness is the part people forget, and it's exactly what lets you scale horizontally without sticky sessions."
**Red flag:** Designing endpoints as RPC-style actions (`/api/updateUserEmail`) while calling it REST. That's an RPC API wearing REST's clothes — actual REST models the noun and lets the verb do the work.

### Idempotency and HTTP methods
**They ask:** "Which HTTP methods are idempotent, and why does that matter for retries?"

Idempotent means calling it once has the same net effect as calling it N times. `GET`, `PUT`, `DELETE` are idempotent by spec — `PUT`ting the same full resource twice leaves it in the same state either time; deleting an already-deleted resource is still "deleted." `POST` is *not* idempotent — calling it twice typically creates two resources. This matters directly for retry safety: a client (or a proxy) can safely auto-retry a timed-out `GET`/`PUT`/`DELETE` without risking a duplicate side effect, but blindly retrying a `POST` (e.g. "create order") risks double-charging or double-creating unless the API adds explicit idempotency-key support.

```
PUT /orders/42 {...}   -- safe to retry; same end state either way
POST /orders {...}     -- retry risks creating a second order
```

**Say it:** "Idempotency is what makes a method safe to auto-retry — GET/PUT/DELETE are idempotent by contract, POST isn't, which is exactly why payment/order-creation APIs need an explicit idempotency key if clients are going to retry on timeout."
**Red flag:** Blindly retrying a `POST` request on timeout without an idempotency key. If the first request actually succeeded server-side and only the response was lost, the retry creates a duplicate.

### GraphQL vs REST
**They ask:** "What problem does GraphQL solve over REST, and what does it cost you?"

REST's fixed resource shapes force two common inefficiencies: **over-fetching** (an endpoint returns fields the client doesn't need) and **under-fetching** (the client needs data from multiple endpoints and has to make several round trips). GraphQL lets the client specify exactly the fields and nested relations it needs in one query, resolved server-side in one round trip. The cost: caching is much harder (REST's URL-based HTTP caching doesn't map to a single `/graphql` POST endpoint), and a naive resolver implementation reintroduces the N+1 problem at the field-resolution level unless you batch with something like DataLoader.

```graphql
query { user(id: "1") { name, orders { total, items { name } } } }
```

**Say it:** "GraphQL trades REST's over/under-fetching for exact client-specified queries in one round trip, but it moves the N+1 problem into resolver design and loses REST's free HTTP-cache-by-URL — so I reach for it when clients genuinely have varied, nested data needs, not as a default."
**Red flag:** Adopting GraphQL for a simple CRUD API with uniform client needs. It adds real complexity (schema, resolvers, N+1 mitigation) for a benefit — flexible field selection — that a matching set of REST endpoints wouldn't have needed to solve in the first place.

### GraphQL resolvers and the N+1 problem
**They ask:** "How does the N+1 problem show up specifically in GraphQL, and how do you fix it?"

Each field in a GraphQL query can have its own resolver function, called independently per object in a list — so a query for 50 users, each resolving their own `orders` field, triggers 50 separate database calls for orders, exactly the N+1 pattern, just hidden inside the resolver graph instead of an obvious loop. **DataLoader** (or an equivalent batching utility) fixes it by deferring and batching: within a single event-loop tick, it collects all the individual `orders(userId)` calls and issues one batched `WHERE user_id IN (...)` query, then distributes results back to each waiting resolver.

```js
const orderLoader = new DataLoader(async (userIds) => {
  const orders = await db.orders.findMany({ where: { userId: { in: userIds } } });
  return userIds.map(id => orders.filter(o => o.userId === id));
});
// resolver: orderLoader.load(user.id) — batched automatically across the tick
```

**Say it:** "GraphQL's per-object resolver model hides N+1 inside the resolver graph instead of an obvious loop — DataLoader fixes it by batching all the individual `.load()` calls within one tick into a single `WHERE IN` query."
**Red flag:** Writing a GraphQL resolver that queries the database directly per parent object, with no batching layer. It works in a demo with a handful of records and silently becomes a performance disaster in production at real list sizes.

### AJAX and XMLHttpRequest vs fetch
**They ask:** "What is AJAX, and how does the modern `fetch` API relate to the older `XMLHttpRequest`?"

AJAX (Asynchronous JavaScript and XML — despite the name, it's used with any format, mostly JSON now) is the technique of making an async HTTP request from the browser without a full page reload — the pattern, not a specific API. `XMLHttpRequest` was the original browser API implementing it: event-based (`onload`, `onerror`), verbose, and predates promises entirely. `fetch` is the modern, promise-based replacement covered elsewhere in this deck — same underlying capability, cleaner async composition, streaming-capable body handling.

```js
// XHR — event-based, pre-promise era
const xhr = new XMLHttpRequest();
xhr.open('GET', url);
xhr.onload = () => console.log(xhr.responseText);
xhr.send();
```

**Say it:** "AJAX is the technique — async requests without a full reload — `XMLHttpRequest` and `fetch` are two API implementations of it, and `fetch`'s promise-based model is why virtually all new code uses it over XHR's callback/event style."
**Red flag:** Using "AJAX" and "XMLHttpRequest" interchangeably as if they're the same thing. AJAX is the pattern; XHR is one (now largely legacy) API for it — `fetch` implements the same pattern too.

### CORS: what it protects and preflight requests
**They ask:** "What problem does CORS solve, and what triggers a preflight request?"

CORS exists because browsers enforce the **same-origin policy** by default — a script on `siteA.com` can't *read* a response from `apiB.com` unless `apiB.com` explicitly opts in via CORS headers (`Access-Control-Allow-Origin`). Crucially, CORS only gates whether the browser lets the script read the response — for a "simple" request it doesn't stop the request from being *sent*, cookies and all; the browser blocks the script from seeing what comes back. That's why CORS alone doesn't protect state-changing endpoints from cross-site request forgery — CSRF tokens and `SameSite` cookie settings are the actual defense against a forged request being *acted on*, since the malicious page can still fire the request even if it can't read the reply. A **preflight** (`OPTIONS` request sent automatically by the browser before the real one) fires for "non-simple" requests — a custom header, a method other than GET/POST/HEAD, or a `Content-Type` other than form-encoded/plain-text/multipart — asking the server to confirm it allows that specific request before the browser sends the real one; this is the one case where CORS *does* stop the real request from going out at all.

```
OPTIONS /api/data
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: content-type

-- server responds with what it allows, then the browser sends the real PUT
```

**Say it:** "CORS is the server explicitly opting in to cross-origin *reads* that the same-origin policy blocks by default — it doesn't stop a simple cross-origin request from being sent, just from being read, so I don't rely on it to protect state-changing endpoints; that's what CSRF tokens and `SameSite` cookies are for. A preflight fires for anything beyond a 'simple' request so the server can confirm it allows it before the real request goes out at all."
**Red flag:** Saying CORS is a server-side security feature that stops attackers from calling your API, or that it prevents CSRF. It's a browser-enforced restriction on *reading* cross-origin responses — a non-browser client (curl, another server) ignores CORS headers entirely and can call the API directly, and even a browser can still fire a simple cross-origin state-changing request; CORS just stops the page from seeing the response.

### CORS misconfigurations
**They ask:** "What's the most common dangerous CORS misconfiguration you see in real APIs?"

Setting `Access-Control-Allow-Origin: *` alongside `Access-Control-Allow-Credentials: true` — the spec explicitly forbids this combination and most servers/browsers will reject or ignore it, precisely because a wildcard origin plus cookie/credential sharing would let *any* website read authenticated responses on behalf of a logged-in user. The safe pattern for credentialed cross-origin requests is an explicit, validated allowlist of origins, reflecting only origins you actually trust back in the header rather than a wildcard or an unchecked reflection of whatever `Origin` header the request sent.

```js
// dangerous: reflects any origin, unconditionally
res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
res.setHeader('Access-Control-Allow-Credentials', 'true');

// safe: explicit allowlist check
if (ALLOWED_ORIGINS.includes(req.headers.origin)) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
}
```

**Say it:** "Reflecting any request's `Origin` header back unconditionally with credentials enabled defeats the entire point of CORS — I always validate against an explicit allowlist before echoing an origin back, especially on any endpoint that reads cookies or auth headers."
**Red flag:** Copying `req.headers.origin` straight into `Access-Control-Allow-Origin` without validating it against an allowlist. That's functionally the same as a wildcard for any attacker who controls the request's Origin header.

### Long polling
**They ask:** "How does long polling work, and why was it used before WebSockets were widely available?"

Long polling is a workaround for HTTP's fundamentally request-response, client-initiated model when you need server-push: the client sends a request, and the server *holds it open* without responding until new data is available (or a timeout elapses), then responds, and the client immediately opens a new request to keep the cycle going. It approximates real-time push without a persistent bidirectional connection, at the cost of holding open connections/threads server-side and the latency of a new request cycle after each response.

```js
async function poll() {
  const res = await fetch('/updates?since=' + lastSeen); // server holds this open
  handle(await res.json());
  poll(); // immediately re-open
}
```

**Say it:** "Long polling simulates server push on top of request-response HTTP by holding the connection open until there's something to say — it works everywhere HTTP works, but it costs a held connection per client and a request-cycle gap between each push, which is exactly what WebSockets and SSE were built to remove."
**Red flag:** Defaulting to long polling for a new feature today without considering WebSocket or SSE. It's still a legitimate fallback for restrictive proxies/firewalls, but it's rarely the first choice when the client environment supports better options.

### WebSocket handshake and protocol
**They ask:** "How does a WebSocket connection get established, and how is it different from HTTP after that?"

A WebSocket connection starts as a normal HTTP request with an `Upgrade: websocket` header — the server responds `101 Switching Protocols`, and from that point the *same TCP connection* stops speaking HTTP and switches to the WebSocket framing protocol: a lightweight binary frame format supporting full-duplex messages either side can send at any time, with none of HTTP's per-message header overhead or request-response pairing requirement.

```
GET /chat HTTP/1.1
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: ...

HTTP/1.1 101 Switching Protocols
Upgrade: websocket
```

Once upgraded, either side can push a message at any time — there's no "request" concept anymore, just a persistent, bidirectional message stream over the one connection.

**Say it:** "The handshake is a normal HTTP request that upgrades the same TCP connection to a different framing protocol — after the 101 response it's a persistent, full-duplex message stream with no request-response pairing left, which is the actual mechanism behind real-time push."
**Red flag:** Describing WebSocket as "HTTP requests, but faster." After the handshake it isn't HTTP at all anymore — no headers per message, no request-response semantics, just framed messages over the open socket.

### WebSocket vs HTTP polling
**They ask:** "For a real-time feature, how do you decide between WebSocket, polling, long polling, and SSE?"

The decision hinges on direction and frequency. Plain polling (repeated `GET` on an interval) is simplest and fine for infrequent, non-urgent updates where a few seconds of staleness is acceptable. Long polling reduces latency at the cost of held connections. **Server-Sent Events** fit one-directional, frequent server-to-client push (live feeds, notifications) with automatic reconnection built in and simpler infrastructure than WebSockets (plain HTTP, works through most proxies). **WebSocket** is the right call specifically when you need genuine bidirectional, low-latency, high-frequency communication — chat, collaborative editing, live gameplay — where the client also needs to push frequently, not just receive.

**Say it:** "I pick based on direction and frequency, not just 'real-time sounds fancy' — SSE for frequent one-way server push, WebSocket only when the client also needs to push frequently and low latency in both directions actually matters, plain polling when a few seconds of staleness is genuinely fine."
**Red flag:** Reaching for WebSocket by default for any live-update feature, including ones that are purely server-to-client. SSE covers that case with less infrastructure (no separate protocol upgrade, works with plain HTTP/2 multiplexing, auto-reconnects natively).

### Server-Sent Events
**They ask:** "What is SSE, and what does it give you for free that a hand-rolled solution wouldn't?"

Server-Sent Events is a one-directional, server-to-client push protocol built directly on plain HTTP — the server keeps a response stream open and writes `data: ...\n\n`-formatted events over it, and the browser's built-in `EventSource` API consumes them, automatically reconnecting (with the last-received event ID sent back) if the connection drops, no reconnect logic to hand-write. Because it's plain HTTP, it works through standard proxies/load balancers and HTTP/2 multiplexing without the upgrade dance WebSocket needs.

```js
// server
res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });
res.write(`data: ${JSON.stringify(update)}\n\n`);

// browser
const es = new EventSource('/stream');
es.onmessage = (e) => handle(JSON.parse(e.data)); // reconnects automatically on drop
```

**Say it:** "SSE is plain HTTP with a long-lived response stream — I get automatic reconnection and last-event-id resumption for free from `EventSource`, with none of WebSocket's protocol-upgrade or infrastructure overhead, as long as the feature is genuinely one-directional."
**Red flag:** Building a live notifications feed on WebSocket and hand-writing reconnection logic. SSE gives that reconnection behavior natively and needs a fraction of the infrastructure for a purely server-to-client use case.

### HTTP/1.1 vs HTTP/2 vs HTTP/3
**They ask:** "What actually changed between HTTP/1.1, HTTP/2, and HTTP/3, and why does it matter for a backend engineer?"

HTTP/1.1 opens a limited number of TCP connections per origin and processes requests on each one head-of-line: one request blocks the next on that connection, which is why browsers historically domain-sharded assets and bundlers concatenated files to reduce request count. **HTTP/2** multiplexes many requests over one TCP connection with binary framing, removing that per-connection head-of-line blocking and header compression (HPACK) — which is why bundling/sharding tricks became less necessary. **HTTP/3** replaces TCP with QUIC (built on UDP), which removes head-of-line blocking *at the transport layer* too — a lost packet on HTTP/2 stalls every multiplexed stream on that TCP connection, since TCP itself is ordered; QUIC's independent streams mean one lost packet only stalls the stream it belongs to.

**Say it:** "Each version attacks head-of-line blocking at a different layer — HTTP/2 fixes it at the application layer by multiplexing over one connection, HTTP/3 fixes the layer HTTP/2 still couldn't by replacing TCP with QUIC, so a lost packet no longer stalls every stream on the connection."
**Red flag:** Assuming HTTP/2's multiplexing means bundling/code-splitting strategy no longer matters at all. It changes the trade-offs — fewer requests still has value for compression and caching granularity — but the "many small requests are always slow" assumption from HTTP/1.1 is outdated.

### API versioning strategies
**They ask:** "How do you version a public API without breaking existing clients?"

The core discipline is distinguishing additive (safe) changes from breaking ones: adding a new optional field or endpoint is safe and needs no version bump; renaming/removing a field or changing its type is breaking and needs a strategy. Common approaches: **URL versioning** (`/v1/users`, `/v2/users`) — explicit and cache-friendly, but duplicates routes. **Header versioning** (`Accept: application/vnd.api+json;version=2`) — keeps URLs stable, less discoverable. Whichever scheme, the actual engineering discipline is running old and new versions *in parallel* with a deprecation timeline communicated to consumers, not a hard cutover that breaks anyone still on the old version.

```
GET /v1/users   -- old clients keep working
GET /v2/users   -- new shape, opt-in
```

**Say it:** "Versioning strategy matters less than the discipline behind it — I distinguish additive from breaking changes rigorously, and any breaking change ships as a new version running in parallel with the old one on a published deprecation timeline, never a hard cutover."
**Red flag:** Making a breaking change to an existing, unversioned endpoint "because it's a small tweak." Any field rename or type change is breaking for someone's integration regardless of how small it looks from the server side.

### Webhooks
**They ask:** "How do webhooks work, and what makes an endpoint that receives them trustworthy and safe?"

A webhook inverts the usual request direction — instead of your service polling a third party for updates, the third party sends an HTTP `POST` to a URL you registered the moment an event happens, which is far more efficient than polling for infrequent events. The receiving endpoint has real responsibilities most people skip: **verify the signature against the raw request body** (most providers sign the payload with a shared secret via an `X-Signature` header — you must hash the exact bytes received, so capture the raw body, not a re-serialized JSON object), **durably enqueue then ack** (persist the event to a queue *before* returning `200`, so a broker hiccup can't drop it — only ack once it's safely stored, and let the sender retry otherwise), and **handle retries idempotently**, since providers retry on any non-2xx response or timeout.

```js
// express.raw so the signature verifies against the exact bytes received
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const valid = verifySignature(req.body, req.headers['stripe-signature'], secret);
  if (!valid) return res.status(400).send('invalid signature');
  try {
    await queue.publish('stripe.event', req.body); // durably enqueue FIRST
    res.status(200).send('ok');                    // ack only after it's safely stored
  } catch {
    res.status(503).send('retry later');           // never ack an event you failed to persist
  }
});
```

**Say it:** "A webhook endpoint has to verify the signature — otherwise anyone who finds the URL can forge events — acknowledge fast so the sender doesn't retry into duplicate processing, and treat every handler as idempotent, since retries on timeout are the norm, not the exception."
**Red flag:** Processing a webhook's full business logic synchronously before responding, with no signature verification. Slow processing invites duplicate-delivery retries, and skipping verification means anyone who discovers the endpoint URL can send forged events.

### gRPC vs REST
**They ask:** "When would you reach for gRPC over a REST/JSON API?"

gRPC uses Protocol Buffers (a binary, strongly-typed schema format) over HTTP/2, which gives smaller payloads and faster serialization than JSON, a strict contract both client and server generate code from (eliminating a whole class of "the field is actually a string, not a number" integration bugs), and native support for streaming (client, server, or bidirectional) built on HTTP/2 multiplexing. The trade-off: it's not natively browser-friendly (needs gRPC-Web plus a proxy), payloads aren't human-readable for quick debugging the way JSON is, and it commits both sides to code generation tooling. It's the strong choice for internal service-to-service communication where both ends are under your control and performance/type-safety matter more than human-readability; REST/JSON remains the better fit for public APIs and browser clients.

**Say it:** "I reach for gRPC for internal service-to-service calls where both ends are mine and performance plus a strict shared contract matter — for public APIs and anything a browser calls directly, REST/JSON's human-readability and universal client support still win."
**Red flag:** Choosing gRPC for a public-facing API consumed directly by third-party browser clients. It needs gRPC-Web plus a proxy to work in a browser at all, which is exactly the kind of friction a public API shouldn't impose on integrators.
