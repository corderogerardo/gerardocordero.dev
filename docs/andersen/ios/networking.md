# iOS — Networking

### URLSession fundamentals and task subtypes
**They ask:** "Walk through URLSession — the session/task model, and the different task subtypes."

`URLSession` splits configuration from execution on purpose: a **session** holds shared configuration (cache policy, cookie storage, headers, timeout) and a **task** represents one in-flight request, so you can run many requests under one consistently-configured session instead of repeating setup per call. Three built-in session configurations change the *lifecycle* guarantee: `.default` (disk-backed cache, standard), `.ephemeral` (nothing persisted — no cookies, no cache, gone when the app terminates), and `.background` (survives app suspension/termination, driven by the OS, for large transfers).

```swift
let (data, response) = try await URLSession.shared.data(from: url)
guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
    throw NetworkError.badStatus
}
```

Task subtypes match the *shape* of the transfer, not just the HTTP verb: `URLSessionDataTask` for small in-memory request/response bodies (the common case, and what `async/await`'s `data(from:)` uses under the hood); `URLSessionUploadTask` for sending a file body, needed for background uploads since a data task can't run in background mode; `URLSessionDownloadTask` for receiving to a temp file directly rather than buffering the whole response in memory — critical for large downloads; `URLSessionStreamTask` for raw TCP/TLS streaming below HTTP semantics.

**Say it:** "A session holds shared config, tasks are individual requests under it — I pick `.ephemeral` for logged-out flows with no cache/cookie leakage and `.background` for large transfers that must survive suspension, and I reach for download tasks over data tasks specifically to avoid buffering a huge response in memory."
**Red flag:** Using a data task for a large file download. It buffers the entire response in memory before you get a callback — a download task streams to a temp file incrementally instead.

### Codable and JSONSerialization
**They ask:** "Codable versus JSONSerialization — why did Codable win, and what do you do when the JSON shape doesn't match your Swift model?"

`JSONSerialization` predates Swift's type system — it deserializes into `[String: Any]`/`[Any]`, so every access is a runtime cast with no compile-time guarantee the key exists or the type matches. `Codable` (really `Encodable & Decodable`) generates that mapping at compile time via synthesized conformance, so a missing or mistyped field is a decode-time error you catch in one place, not a crash three call sites later from a force-cast.

The real skill is handling mismatches without breaking the automatic synthesis. `CodingKeys` remaps snake_case JSON to camelCase Swift (or you set `decoder.keyDecodingStrategy = .convertFromSnakeCase` globally). Custom `init(from:)` handles fields that need transformation (a string date into `Date`, a polymorphic type) or truly optional/inconsistent server fields.

```swift
struct User: Decodable {
    let id: Int
    let fullName: String

    enum CodingKeys: String, CodingKey {
        case id, fullName = "full_name"
    }
}
```

**Say it:** "`JSONSerialization` gives you untyped `Any` you cast at runtime; `Codable` synthesizes the mapping at compile time so a shape mismatch is a decode error I catch in one place — `CodingKeys` and a custom `init(from:)` handle the cases where the JSON shape genuinely doesn't match the Swift model."
**Red flag:** Reaching for `JSONSerialization` on a new feature "for flexibility." That flexibility is exactly what removes compile-time safety — it's the right tool only for truly dynamic, schema-less payloads.

### Caching and authentication — URLCache, URLProtocol, OAuth2
**They ask:** "How does URLSession cache responses, and how do you handle custom headers and OAuth2 auth for every request?"

`URLCache` is a transparent, HTTP-semantics-aware cache — it honors `Cache-Control`/`ETag` headers from the server and the request's `cachePolicy` (`.useProtocolCachePolicy`, `.reloadIgnoringLocalCacheData`, etc.), storing responses in memory and on disk automatically with zero code beyond configuring size limits. `URLProtocol` is the lower-level hook: subclass it to intercept *every* request a session makes before it hits the network — the standard way to build request mocking for tests, or a custom cache/logging layer the server's headers don't already give you.

For auth, `URLSessionDelegate`'s `urlSession(_:didReceive:completionHandler:)` handles challenge-based auth (client certs, basic auth via the challenge flow) at the transport layer. Most OAuth2 flows (bearer tokens) are simpler and don't need the delegate at all — you attach the token as an `Authorization` header per request, refreshing it out-of-band when a 401 comes back, ideally centralized in one place (an interceptor-style wrapper around your session) so every call site doesn't reimplement the refresh-and-retry dance.

```swift
final class AuthorizingSession {
    func request(_ req: URLRequest, isRetry: Bool = false) async throws -> (Data, URLResponse) {
        var req = req
        req.setValue("Bearer \(tokenStore.accessToken)", forHTTPHeaderField: "Authorization")
        let (data, response) = try await session.data(for: req)
        if (response as? HTTPURLResponse)?.statusCode == 401 {
            guard !isRetry else { throw APIError.client(401, data) }   // already retried once — a bad token, stop looping
            try await tokenStore.refresh()
            return try await request(req, isRetry: true)   // retry exactly once with the new token
        }
        return (data, response)
    }
}
```

**Say it:** "`URLCache` gives me protocol-driven caching for free by honoring server cache headers; `URLProtocol` is for intercepting every request, which is how I mock the network in tests. For OAuth2 I centralize the bearer token and 401-refresh-and-retry in one wrapper so no call site reimplements it."
**Red flag:** Scattering `Authorization` header logic and token-refresh handling across every network call site. The first time the refresh logic needs to change, you're editing N places instead of one — centralize it.

### Custom APIClient — response codes, SOAP, and long polling
**They ask:** "How would you design a custom APIClient, and how do you handle non-REST protocols or long-lived connections?"

The senior framing: an `APIClient` isn't "a wrapper around `URLSession`," it's the single place that owns request building, decoding, error mapping, and retry policy — so feature code depends on a typed `Endpoint`/`Result`, never on raw `URLSession` calls it would otherwise have to error-handle inconsistently everywhere.

Response-code handling should map HTTP status ranges to a typed error, not a boolean: 2xx success, 4xx client error (400 bad request, 401 unauthorized → trigger refresh, 403 forbidden, 404, 422 validation), 5xx server error (usually retryable with backoff), distinguishing *retryable* from *terminal* failures so a caller knows whether to show "try again" or a hard error.

```swift
enum APIError: Error {
    case client(Int, Data?)
    case server(Int)
    case decoding(Error)
}
```

Not every backend is REST/JSON: **SOAP** needs an XML request/response layer (`XMLParser` or a library) instead of `Codable`, with the "endpoint" often being a single URL and the operation encoded in the XML body. **Long polling** — holding a request open until the server has new data, then immediately reopening it — is the fallback when WebSockets aren't available; you model it as a loop that re-issues the request on completion, with a timeout and backoff so a flaky connection doesn't spin-retry.

**Say it:** "My APIClient centralizes request building, typed error mapping by status-code range, and retry policy so feature code never touches `URLSession` directly — and for non-REST backends I swap the transport (XML parsing for SOAP, a re-issuing loop for long polling) without changing that contract."
**Red flag:** Treating every non-2xx response as the same generic "network error." Collapsing 401 and 500 into one case means the UI can't distinguish "log in again" from "retry later."

### Making a Basic Network Request
**They ask:** "How do you make a simple GET request and decode JSON in Swift?"

You use `URLSession` — no third-party library needed for the basics. Create a data task with a URL, and in the completion handler you get back `data`, a `response`, and an `error`; a transport-level `error` (no connection, timeout) is only one failure mode — a request can also "succeed" at the transport layer and still come back a 404 or 500 with a valid-looking body, so you gate on the `HTTPURLResponse` status code too, and decode with `do`/`catch` rather than `try?` so a malformed body surfaces instead of silently becoming `nil`. The task doesn't start until you call `.resume()`, and the completion runs on a background thread, so any UI update from it must hop to the main thread.

```swift
struct User: Codable { let id: Int; let name: String }
URLSession.shared.dataTask(with: url) { data, response, error in
    guard let data, error == nil else { return }                          // transport failure
    guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
        return   // reached the server, but not a success — e.g. 404/500
    }
    do {
        let user = try JSONDecoder().decode(User.self, from: data)
    } catch {
        print("bad JSON: \(error)")   // surfaced, not swallowed
    }
}.resume()   // nothing happens without resume()
```

**Say it:** "I make a `URLSession` data task, check the transport error, then check the HTTP status code is 2xx before treating the body as valid, and decode with `do`/`catch` so a malformed body surfaces instead of silently becoming nil — remembering `.resume()` starts it and the callback is off the main thread, so UI updates hop back to main."
**Red flag:** Forgetting `.resume()` — the request silently never fires, and the junior spends an hour wondering why no data comes back. Naming that catch shows you've actually written the code.
