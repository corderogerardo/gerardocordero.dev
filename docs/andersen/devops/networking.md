# DevOps — Networking (part 1)

### OSI Model And Protocol Layers
**They ask:** "Walk me through the OSI model and where a couple of real protocols actually sit."

The OSI model matters for one practical reason: when something breaks, "which layer" tells you which tool to reach for. A DNS failure and a routing failure both look like "the site is down" to a user, but you debug them with completely different commands — `dig` versus `traceroute`. Thinking in layers is what turns a panicked incident into a systematic elimination.

Layer 3 (network) is IP and routing — where an address gets from A to B. Layer 4 (transport) is TCP/UDP — where you decide reliable-ordered delivery versus fire-and-forget. Layer 7 (application) is HTTP, DNS, SSH — where your actual protocol logic lives. A load balancer terminating TLS and inspecting HTTP headers is doing L7 work; one that just forwards packets by IP:port is doing L4.

**Say it:** "I use the OSI model as a debugging map — if DNS resolves but the connection times out, that's a layer 3/4 problem; if the connection succeeds but the response is wrong, that's layer 7."
**Red flag:** Reciting all seven layer names from memory without being able to say which layer a given tool (`ping`, `dig`, `curl`, `netstat`) actually operates at.

### CIDR Blocks And Subnetting
**They ask:** "Given `10.0.0.0/16`, how many usable hosts, and how would you carve it into subnets for three availability zones?"

CIDR matters because every cloud VPC design starts with it — get the block sizing wrong on day one and you either run out of IPs or waste a huge chunk of address space you can never get back without re-architecting. The `/n` is the prefix length: bits fixed for the network, the rest available for hosts.

`/16` fixes 16 bits, leaving 16 for hosts — 65,536 addresses, minus network/broadcast. Splitting for 3 AZs, you'd carve three `/18`s (16,384 each) or match subnet size to expected load per AZ rather than splitting evenly by habit.

```
10.0.0.0/16   → VPC:        65,536 addresses
10.0.0.0/20   → AZ-a subnet: 4,096 addresses
10.0.16.0/20  → AZ-b subnet: 4,096 addresses
10.0.32.0/20  → AZ-c subnet: 4,096 addresses
```

**Say it:** "I size CIDR blocks for headroom, not just today's count — resizing a VPC after services are wired to specific ranges is a migration, not a config change."
**Red flag:** Sizing a subnet to exactly today's instance count. The first scaling event becomes an emergency re-IP.

### NAT And NAT Types
**They ask:** "What is NAT, and why do full-cone, restricted, and symmetric NAT matter for something like WebRTC or VoIP?"

NAT exists because IPv4 address space is scarce: it lets a whole private network share one public IP by rewriting source addresses/ports on the way out and reversing the mapping on the way in. That's transparent for client-initiated request/response traffic like HTTP — but it becomes the actual bug for anything that needs an *inbound* connection to a private host, which is where the NAT *type* stops being trivia.

Full-cone NAT reuses the same external port for any external host once a mapping exists — easiest to traverse. Symmetric NAT assigns a *different* external port per destination, which breaks naive peer-to-peer connection setup and is exactly why STUN alone fails and you fall back to a TURN relay.

**Say it:** "Basic NAT is address translation for outbound traffic; the NAT *type* determines whether peer-to-peer protocols like WebRTC can traverse it with STUN alone or need a TURN relay."
**Red flag:** Treating "it's behind NAT" as one fact. Symmetric NAT on either side of a call is the actual root cause of "STUN worked in testing, fails for some users in production."

### DNS Resolution
**They ask:** "Walk me through what happens between typing a URL and the browser getting an IP address."

DNS is the internet's phone book, but the interview-worthy part is the *resolution chain* and where caching lives, because that's what you're debugging when a DNS change "isn't propagating." The browser checks its own cache, then the OS resolver, then a recursive resolver (often the ISP's or `1.1.1.1`), which walks root → TLD → authoritative nameservers if nothing is cached.

Each record has a TTL that controls how long every layer in that chain is allowed to cache it — which is why lowering a TTL *before* a planned cutover is a standard runbook step, not an afterthought.

**Say it:** "DNS propagation delay is really TTL-controlled caching at multiple layers — I drop the TTL well before a cutover so the old record actually expires everywhere in time."
**Red flag:** Blaming "DNS propagation" for a change that hasn't taken effect after 5 minutes, without checking whether the previous TTL was 24 hours.

### Static Vs Dynamic Routing
**They ask:** "When would you use static routes versus a dynamic routing protocol like BGP or OSPF?"

Static routes are hand-written entries — predictable and simple, but they don't react to a link going down; traffic just black-holes until someone fixes the table. Dynamic routing protocols exchange reachability information between routers so the network self-heals around a failure, at the cost of real operational complexity (route flapping, convergence time, protocol tuning).

The senior call is scale and failure tolerance: a two-site VPN with a single path is fine with static routes; a multi-region network with redundant paths needs dynamic routing so a link failure reroutes automatically instead of paging someone at 3am.

**Say it:** "Static routing is fine when the topology is small and stable; the moment I need automatic failover across redundant paths, I need a dynamic protocol that converges without a human in the loop."
**Red flag:** Proposing static routes for a network with redundant paths "because it's simpler" — simpler until the primary path dies and nothing reroutes.

### VPNs And SDN Overlay Networks
**They ask:** "How does a site-to-site VPN differ from an SDN overlay network, and why would you reach for the latter?"

A VPN's job is confidentiality and integrity over an untrusted network — it encrypts traffic between two endpoints (IPsec, WireGuard) so a shared/public link behaves like a private one. An SDN overlay solves a *different* problem: decoupling the logical network topology from the physical one, so you can build flat, software-defined L2/L3 networks across nodes that aren't physically adjacent (VXLAN is the common encapsulation).

They compose: Kubernetes CNI plugins like Calico or Cilium build an overlay network for pod-to-pod traffic across nodes, and that overlay can itself run over an encrypted transport for multi-cloud or hybrid connectivity.

**Say it:** "A VPN secures a link; an SDN overlay abstracts the topology — Kubernetes pod networking is the overlay case I hit daily, VXLAN encapsulating pod traffic across nodes regardless of the physical network underneath."
**Red flag:** Conflating "VPN" and "overlay network" as the same concept — one is about trust, the other is about topology abstraction.

## Web Protocols & Security

### HTTP Methods And HTTPS TLS
**They ask:** "Explain the TLS handshake, and what a certificate chain is actually verifying."

HTTPS is HTTP over TLS, and the handshake exists to solve two problems at once: agree on a shared symmetric key without ever sending it in the clear, and prove the server is who it claims to be. In TLS 1.3, those two jobs are split across different mechanisms: an **ephemeral** Diffie-Hellman key exchange derives the shared symmetric session key (fresh per session, which is also what gives you forward secrecy), while the server's certificate keypair authenticates *identity* — it signs the handshake transcript (`CertificateVerify`) to prove the server holds the private key matching the cert it presented. The certificate doesn't hand you the session key directly; it vouches for who you're key-exchanging with.

The certificate chain is what makes the identity claim trustworthy: your browser doesn't trust `example.com`'s cert directly — it verifies a signature chain up to a root CA it already trusts, through zero or more intermediates. Break any link (expired intermediate, wrong hostname, self-signed leaf) and the whole chain of trust is invalid, not just that one certificate.

```bash
openssl s_client -connect example.com:443 -showcerts
```

**Say it:** "TLS 1.3 derives the session key through an ephemeral key exchange, and the certificate's job is authentication — CertificateVerify proves the server holding that cert also holds the matching private key, and the chain is what lets my browser trust the cert belongs to the domain I typed. Identity and key exchange are separate mechanisms working together."
**Red flag:** Saying HTTPS "just encrypts the connection" without mentioning that certificate validation is the identity half of the guarantee — encryption to an impersonator is still a breach.

### CORS And Cross Origin Defense
**They ask:** "Why does CORS exist, and what actually stops a malicious site from reading your API's response?"

The browser's same-origin policy already blocks a script on `evil.com` from reading responses from `bank.com` — CORS is the *relaxation* mechanism, not the restriction. A server opts in to being read cross-origin by sending `Access-Control-Allow-Origin`, and for anything beyond a simple GET the browser first sends a preflight `OPTIONS` request to check the server actually allows the method/headers being used.

The defense that matters operationally: browsers already refuse to honor `Access-Control-Allow-Origin: *` on a credentialed request (one sending cookies or auth headers) — the fetch fails client-side, so a bare wildcard isn't itself the open door. The real danger is a server that *reflects* whatever `Origin` header it receives back as the allowed origin, or an over-broad allowlist (`*.example.com` when only one subdomain should qualify) — either one defeats the same-origin protection just as completely as a wildcard would if credentials were allowed through.

It's also worth saying what CORS does *not* do: it's a browser-enforced read restriction on the response, not a request blocker — a form POST or a `<img src>`-style cross-origin request still reaches the server and executes, CORS just stops the attacker's page from reading the JSON back. That's why CSRF tokens or `SameSite` cookies are still required; CORS doesn't substitute for them.

```http
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Credentials: true
```

**Say it:** "CORS relaxes the same-origin policy on purpose, and browsers already block wildcard origins on credentialed requests — the actual risk is origin reflection or an over-broad allowlist. CORS also isn't a CSRF defense: it stops a malicious page from *reading* the response, not from firing the state-changing request in the first place, so I still need CSRF tokens or `SameSite` cookies."
**Red flag:** Treating a working CORS config as proof a state-changing endpoint is CSRF-safe — CORS never blocked the request from reaching the server, only from reading the response.

### Authentication Mechanisms
**They ask:** "Compare basic auth, API keys, OAuth2, and mTLS — when do you actually reach for each?"

The axis that decides this isn't "which is more secure" in the abstract — it's who the caller is and what they can prove. Basic auth (username:password on every request) is fine for a quick internal tool but has no revocation story and ships credentials on every call. API keys identify a *service*, not a user, and are simple but static — leak one and it's valid until someone rotates it.

OAuth2/OIDC is the right call when a human user needs to grant a third-party app scoped, revocable access without handing over their password — token expiry and refresh give you a real revocation story. mTLS flips the model: both sides present certificates, which is the standard for service-to-service auth inside a mesh where you want cryptographic identity, not shared secrets.

**Say it:** "I pick the auth mechanism by who's authenticating and how revocation needs to work — API keys for service identity, OAuth2 for delegated user access, mTLS for service-to-service inside a trust boundary."
**Red flag:** Using long-lived API keys for user-facing auth "because OAuth is complicated" — you've traded a revocation and scoping story for convenience.

### Load Balancing Concepts
**They ask:** "Explain the difference between L4 and L7 load balancing, and how does health checking actually detect a bad node?"

An L4 load balancer distributes by IP/port without looking at payload — fast, protocol-agnostic, but it can't route by URL path or make decisions on HTTP content. An L7 load balancer terminates the connection, reads the HTTP request, and can route `/api/*` to one backend and `/static/*` to another, do TLS termination, and inject headers — at the cost of more CPU per request.

Health checks are what make either one safe: an active check (the LB polls a `/healthz` endpoint on an interval) removes a node *before* real traffic hits it, versus a passive check that only reacts after live requests start failing — the trade-off is detection speed versus extra load on backends.

**Say it:** "I default to L7 when routing needs to be content-aware, and I always pair the load balancer with active health checks — passive-only detection means real users are the ones who discover the outage."
**Red flag:** Relying on passive health checks alone in a latency-sensitive service — that's users acting as your monitoring system.

### Web Vulnerabilities WebSockets And gRPC
**They ask:** "Name the web vulnerabilities you actively defend against, and explain why long-lived connections like WebSockets or gRPC streams complicate that."

XSS, SQL/command injection, path traversal, and DoS share a root cause: untrusted input reaching a context that trusts it too much — a browser DOM, a SQL parser, a filesystem path, or an unbounded resource loop. The fix in every case is the same shape: validate/sanitize at the boundary and never build the interpreted string (HTML, SQL, path) by concatenating user input.

WebSockets and gRPC streams add a wrinkle: a normal HTTP request is naturally rate-limited by connection churn, but a long-lived connection can be held open and abused for slow, sustained load that standard per-request rate limiting misses — you need connection-level limits (max concurrent streams, idle timeouts, per-connection message rate) on top of the usual request-level defenses.

**Say it:** "The standard web vulnerabilities are all input-trust failures at a boundary, and long-lived connections need their own defenses — connection and message-rate limits — because request-based rate limiting doesn't see them."
**Red flag:** Applying only request-per-second rate limiting to a WebSocket/gRPC-streaming service and assuming that covers abuse — one open connection can flood messages all day under that limit.
