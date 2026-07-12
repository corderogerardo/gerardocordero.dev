# Go — networking: HTTP, APIs, WebSocket, gRPC

### the OSI model, the layers that matter day-to-day
**They ask:** "Walk through the OSI model — which layers does a backend Go engineer actually reason about?"

The seven layers exist to separate concerns so each layer can evolve independently — a NIC swap shouldn't require rewriting your HTTP handler. In practice, a Go backend engineer lives mostly at three: **Layer 3 (Network)** — IP addressing and routing, relevant when debugging connectivity or designing VPC/subnet layouts; **Layer 4 (Transport)** — TCP's reliable, ordered byte stream (or UDP's unordered, unreliable one) underlying every `net.Dial`; **Layer 7 (Application)** — HTTP, gRPC, WebSocket, the protocols your code actually speaks.

The senior signal is knowing *where a problem lives*: a connection refused is Layer 4 (nothing listening on the port); a 502 from a load balancer is often Layer 7 (the app crashed or timed out, but the TCP handshake succeeded); packet loss under load might be Layer 3 routing or Layer 2 physical.

**Say it:** "Day to day I reason at Layer 3 for routing/addressing, Layer 4 for TCP's reliability guarantees, and Layer 7 for the actual protocol — knowing which layer a symptom lives at is what turns 'the API is slow' into an actual diagnosis."
**Red flag:** Reciting all seven OSI layers by rote without connecting any of them to a real debugging scenario. The model is a diagnostic map, not trivia.

### HTTP/1.1 vs HTTP/2
**They ask:** "What problem does HTTP/2 actually solve over HTTP/1.1, and does Go's `net/http` give it to you for free?"

HTTP/1.1 serializes requests per TCP connection — browsers work around this by opening multiple parallel connections (head-of-line blocking at the connection level), which is wasteful and still limited. HTTP/2's core fix is **multiplexing**: multiple request/response streams share one TCP connection concurrently, plus binary framing (faster to parse than text) and header compression (HPACK, since HTTP headers repeat heavily across requests).

Go's `net/http` server automatically negotiates HTTP/2 over TLS (via ALPN) with zero extra code — if you serve HTTPS with the standard library, you likely already have it. Plaintext HTTP/2 ("h2c") requires explicit setup since there's no TLS handshake to negotiate over.

```go
srv := &http.Server{Addr: ":443", Handler: mux}
srv.ListenAndServeTLS("cert.pem", "key.pem") // HTTP/2 negotiated automatically
```

**Say it:** "HTTP/2's real win is multiplexing multiple streams over one TCP connection instead of opening several — and Go's `net/http` gets you that for free over TLS, no extra config, because ALPN negotiation is built in."
**Red flag:** Saying HTTP/2 "is just faster HTTP/1.1." The speedup is architectural — multiplexing and header compression — not a generic optimization; know the mechanism, not just the outcome.

### HTTP/3 and QUIC, briefly
**They ask:** "What does HTTP/3 change that HTTP/2 couldn't fix?"

HTTP/2 still runs over TCP, so a single lost packet blocks *every* multiplexed stream on that connection until it's retransmitted (TCP head-of-line blocking, just moved up a layer). HTTP/3 replaces TCP with **QUIC**, a UDP-based transport where each stream's loss recovery is independent, so one dropped packet only stalls the stream it belongs to. QUIC also folds the TLS handshake into the transport handshake, shaving round trips on connection setup.

The pragmatic answer for a Go interview: know it exists and why it matters (mobile/lossy networks where TCP head-of-line blocking hurts most), without needing production QUIC server experience — it's a newer, less universally deployed layer than HTTP/2.

**Say it:** "HTTP/3 swaps TCP for QUIC over UDP so stream-level loss recovery is independent — it fixes the head-of-line blocking that HTTP/2 still has at the TCP layer, which matters most on lossy mobile networks."
**Red flag:** Claiming HTTP/3 is "just HTTP/2 but faster" without mentioning the transport change. The win is specifically about independent loss recovery per stream, not general speed.

### Go's net/http server concurrency model
**They ask:** "How does Go's `net/http` server handle thousands of concurrent connections without threads blowing up?"

Each accepted connection gets its own goroutine, and because goroutines are cheap (a few KB of stack, M:N-multiplexed onto OS threads by the Go scheduler), the server can hold thousands of concurrent, mostly-idle connections without the thread-per-connection cost that would sink a traditional threaded server. A blocking call inside a handler (a slow DB query) blocks only that one goroutine — the scheduler keeps other goroutines running on the same OS threads.

```go
// conceptually, what net/http does per accepted connection:
go func(conn net.Conn) {
    handleConnection(conn) // this goroutine can block; others aren't affected
}(conn)
```

The corollary senior engineers must plan for: without a bound (a semaphore, a worker pool, `http.Server.MaxHeaderBytes`/timeouts), a slow or malicious client population can still spawn unbounded goroutines — the model is cheap, not free.

**Say it:** "One goroutine per connection is affordable because goroutines are cheap and the scheduler multiplexes them onto real threads — but 'cheap' isn't 'free,' so I still set server timeouts and bound concurrency for endpoints doing real work per request."
**Red flag:** Assuming goroutine-per-connection means you never need to think about concurrency limits. Slow-client attacks (Slowloris-style) and unbounded fan-out inside a handler both still need explicit timeouts and limits.

### REST API design: versioning, pagination, idempotency
**They ask:** "What are the concrete design decisions that separate a maintainable REST API from one that breaks clients every release?"

**Versioning** exists because you can't avoid breaking changes forever — the decision is where the version lives (`/v1/users` in the path vs an `Accept` header) and the path wins in practice for discoverability and cache-friendliness, at the cost of URL churn. **Pagination** on any list endpoint is non-negotiable at scale — offset pagination (`?page=2&limit=20`) is simple but degrades on large offsets and shifts under concurrent writes; cursor pagination (`?after=<opaque-token>`) stays stable and fast regardless of dataset size.

```go
type Page struct {
    Items      []Item `json:"items"`
    NextCursor string `json:"next_cursor,omitempty"`
}
```

**Idempotency keys** protect mutating endpoints (`POST /orders`) from duplicate processing on client retry — the client sends a unique key, the server returns the original result on a repeat instead of creating a second order.

```go
// idempotency key stored keyed to the response, replayed on retry
if resp, ok := idempotencyStore.Get(ctx, key); ok {
    return resp // don't reprocess, return what already happened
}
```

**Say it:** "Versioning is inevitable, so I put it in the URL path for discoverability; pagination defaults to cursor-based once a list can grow large, since offset pagination shifts under writes; and mutating endpoints get an idempotency key so a client's retry-after-timeout doesn't double-create the resource."
**Red flag:** Building a `POST` endpoint with no idempotency story and calling client-side retry logic "the client's problem." A network timeout doesn't tell the client whether the write actually landed — the server has to make retries safe.

### REST API design: status codes and error responses
**They ask:** "What makes an API's error responses actually usable by the client calling it?"

The senior standard is a *consistent, machine-parseable* error shape across every endpoint — not `200 OK` with `{"error": "..."}` buried in the body (which breaks every HTTP-level client, cache, and monitoring tool that keys off status codes), and not a different error JSON shape per endpoint. Status codes should be semantically correct: `400` for a client-side validation failure, `401` for missing/invalid auth, `403` for authenticated-but-forbidden, `404` for a real missing resource, `409` for a conflicting state (double-submit, version mismatch), `422` for a well-formed request that fails business validation, `5xx` reserved for the server's own failures.

```go
type APIError struct {
    Code    string `json:"code"`    // machine-readable: "validation_failed"
    Message string `json:"message"` // human-readable
    Fields  map[string]string `json:"fields,omitempty"`
}
```

**Say it:** "Errors get real HTTP status codes plus a consistent, machine-parseable body shape with a stable error code — so a client can branch on `err.Code` without string-matching a human message that might change wording."
**Red flag:** Returning `200 OK` for every response and putting success/failure entirely in the JSON body. That breaks HTTP semantics for every proxy, cache, retry policy, and monitoring dashboard that keys off status codes.

### WebSocket in Go
**They ask:** "How do you implement a WebSocket server in Go, and what's the concurrency contract you must respect per connection?"

A WebSocket starts as a normal HTTP request that gets **upgraded** — the server responds with `101 Switching Protocols` and the TCP connection stays open for full-duplex, bidirectional frames, which is why you need it for server-push use cases (chat, live prices, notifications) that plain request/response can't do efficiently. Go's standard library doesn't include a WebSocket implementation; `gorilla/websocket` or `nhooyr.io/websocket` are the standard choices.

```go
conn, err := upgrader.Upgrade(w, r, nil)
if err != nil { return }
defer conn.Close()

for {
    _, msg, err := conn.ReadMessage()
    if err != nil { break } // connection closed or errored
    // process msg
}
```

The concurrency contract that trips people up: a single `*websocket.Conn` supports **one concurrent reader and one concurrent writer** — calling `WriteMessage` from two goroutines on the same connection without a mutex corrupts the frame stream, so a fan-out broadcaster needs a per-connection write lock or a dedicated writer goroutine fed by a channel.

**Say it:** "A WebSocket connection allows exactly one concurrent reader and one concurrent writer — I serialize writes through a per-connection channel and a single writer goroutine rather than calling `WriteMessage` from multiple goroutines directly."
**Red flag:** Broadcasting to a WebSocket connection from multiple goroutines with direct `WriteMessage` calls. That's a data race on the connection's write buffer, and it corrupts frames under concurrent load.

### WebSocket vs long polling vs Server-Sent Events
**They ask:** "When do you actually need WebSocket, versus SSE or long polling?"

The deciding factor is directionality. **Long polling** (client holds a request open, server responds when there's data, client immediately reopens) works over plain HTTP with no special infra, but costs a request round trip per update and doesn't scale well past moderate update frequency. **SSE** (Server-Sent Events) gives efficient one-way server-to-client streaming over a single long-lived HTTP connection — simpler than WebSocket, works through most proxies/load balancers unmodified, but the client can't push data back on the same connection. **WebSocket** is the only one of the three that gives true bidirectional, low-latency push in both directions — the right tool when the client also needs to send frequent updates (chat, collaborative editing, live cursor positions).

**Say it:** "If it's server-to-client only, I reach for SSE first — it's plain HTTP and simpler to operate through proxies; WebSocket earns its complexity specifically when the client needs to push back just as often as the server."
**Red flag:** Reaching for WebSocket for a notifications feed that's purely server-to-client. SSE gets the same push behavior with less infrastructure complexity and better compatibility with standard HTTP tooling.

### gRPC and protobuf
**They ask:** "Why would you choose gRPC over a REST/JSON API for service-to-service communication?"

gRPC's advantages compound: it runs over HTTP/2 (multiplexing, header compression), serializes with Protocol Buffers instead of JSON (a compact binary format that's faster to encode/decode and enforces a schema via `.proto` files, catching contract mismatches at compile time instead of at runtime), and code-generates typed client/server stubs in every supported language — so you're calling a real Go function, not hand-building an HTTP request and unmarshaling JSON.

```protobuf
service UserService {
  rpc GetUser (GetUserRequest) returns (User);
}
```

The trade-off: it's a worse fit for public-facing browser APIs (needs gRPC-Web or a gateway to bridge), and the schema-first workflow adds ceremony that's overkill for a simple internal CRUD endpoint. gRPC earns its place specifically for internal, high-throughput, polyglot service-to-service calls where the schema discipline and performance actually matter.

**Say it:** "gRPC's win over REST/JSON is the compile-time schema contract via `.proto` plus HTTP/2 transport and binary serialization — I reach for it on internal service-to-service calls where throughput and a typed contract matter, and stick with REST/JSON for public or browser-facing APIs."
**Red flag:** Proposing gRPC for a public API consumed directly by browser JavaScript. Browsers can't speak raw gRPC — you'd need gRPC-Web plus a proxy, which often isn't worth it over just exposing REST/JSON.

### gRPC unary vs streaming RPCs
**They ask:** "What are the four RPC types in gRPC, and when does streaming actually earn its complexity over unary?"

**Unary** is one request, one response — the default, same shape as a REST call. **Server streaming** is one request, a stream of responses (a live feed of price updates after a single subscribe call). **Client streaming** is a stream of requests, one final response (uploading a large file in chunks, server acks once at the end). **Bidirectional streaming** is both sides streaming independently over the same connection (a chat session, real-time collaborative editing).

```go
// server streaming
func (s *server) SubscribePrices(req *PriceRequest, stream PriceService_SubscribePricesServer) error {
    for update := range s.priceFeed {
        if err := stream.Send(update); err != nil { return err }
    }
    return nil
}
```

Streaming earns its complexity when the interaction is genuinely ongoing, not request/response — reaching for it for a single value fetch just adds connection-lifecycle complexity (managing the stream, handling mid-stream errors) for no benefit over unary.

**Say it:** "I default to unary — it's the simplest to reason about and matches REST's mental model — and reach for streaming only when the interaction is genuinely ongoing: a live feed, a chunked upload, or a two-way session like chat."
**Red flag:** Using a server-streaming RPC to return a single value "because streaming is more modern." That adds stream lifecycle management for zero benefit over a plain unary call.

### gRPC deadlines and cancellation propagation
**They ask:** "How does a deadline set by a gRPC client propagate through a chain of service calls?"

gRPC deadlines are carried on `context.Context`, and — critically — they propagate automatically across service boundaries: if service A calls B with a 2-second deadline and B is 500ms in when it calls C, C inherits a deadline of roughly 1.5 seconds remaining, not a fresh 2 seconds. This prevents a slow downstream chain from silently exceeding the caller's actual patience, and lets every service in the chain fail fast instead of doing wasted work after the caller has already given up.

```go
ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
defer cancel()
resp, err := client.GetUser(ctx, req) // deadline rides along in gRPC metadata
```

If a service ignores the incoming deadline and sets its own longer one for a downstream call, it breaks this chain — the caller gives up and the server keeps working on a request nobody's waiting for anymore.

**Say it:** "gRPC deadlines ride on `context.Context` and propagate automatically across hops, shrinking as time passes — so a downstream service naturally fails fast instead of finishing work the original caller already gave up on."
**Red flag:** A downstream service setting its own generous timeout instead of respecting the inherited deadline. That decouples the chain's actual time budget from what each hop enforces, and you end up doing work for callers who already disconnected.

### TLS and mTLS for service-to-service auth
**They ask:** "What does mutual TLS add over regular TLS, and why do service meshes lean on it for service-to-service auth?"

Regular TLS authenticates the *server* to the client (the client verifies the server's certificate) but leaves the server with no cryptographic proof of who's calling — that's usually patched with an API key or bearer token layered on top. **Mutual TLS** has both sides present certificates, so the server also cryptographically verifies the client's identity as part of the handshake itself, before any application-layer request is even processed.

```go
// server requiring client certs
tlsConfig := &tls.Config{
    ClientAuth: tls.RequireAndVerifyClientCert,
    ClientCAs:  certPool,
}
```

This is why service meshes (Istio, Linkerd) default to mTLS for service-to-service traffic: every call is authenticated at the transport layer without each service having to implement its own token validation, and it's much harder to spoof than a bearer token that could leak into a log line.

**Say it:** "mTLS authenticates both directions at the handshake — the server verifies the client's cert too — so service identity is established before the request even reaches application code, which is why service meshes default to it instead of bearer tokens for internal traffic."
**Red flag:** Relying solely on network-level trust ("it's inside our VPC, so it's safe") for service-to-service auth. Network perimeter isn't identity — mTLS or signed tokens are what actually prove which service is calling.
