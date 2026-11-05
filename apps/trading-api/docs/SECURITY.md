# Security

This is the threat model and control inventory for the paper-trading API. It is
a living document: update it when a trust boundary changes.

## Assets and boundaries

| Asset | Why it matters | Boundary |
| --- | --- | --- |
| Password hashes | Reuse by users across sites | `users.password_hash`, never serialized |
| Refresh tokens | Long-lived session material | Stored as SHA-256 hashes, rotated |
| Access tokens | 15-minute bearer authority | Signed HS256, verified per request |
| Account balance and positions | The economic truth of the product | Postgres, mutated only inside transactions |
| Idempotency keys | Retry safety for money movement | Per-user unique row, claimed atomically |
| Audit events | Who did what | Append-only table |

Trust boundaries: the public internet → axum; axum → Postgres; the mobile app →
keychain/SecureStore. Nothing else talks to the database.

## Controls in place

- **Passwords**: Argon2id with default parameters, random per-password salt,
  constant-time verification, hashing offloaded to the blocking pool. Login always
  pays a hash, so response time does not reveal whether an email exists.
- **Tokens**: HS256 access tokens with `exp`, `iat`, `jti`, and a type claim;
  algorithm pinned to HS256; 5s clock leeway. Refresh tokens are opaque, 256 bits,
  stored hashed, rotated on every use. Presenting a revoked token revokes every
  session for that user (reuse detection).
- **Authorization**: every order and portfolio query is scoped by `user_id`.
  Another user's order returns `404`, never `403`, so ids are not an oracle.
- **Input validation**: one boundary validator per request type; `deny_unknown_fields`
  on every body; symbol allow-list; quantity scale and notional caps; 16 KiB body
  limit.
- **SQL**: every value is bound as a parameter. The only dynamic SQL is a keyset
  `QueryBuilder` with bound values; no identifier interpolation.
- **Money safety**: `NUMERIC(20,8)` + `Decimal`, no floats; atomic transactions;
  row locks in a fixed order; unique index on `trades.order_id`.
- **Idempotency**: atomic claim by unique constraint, payload fingerprint, replay
  returns the original order, mismatched payload returns `422`.
- **Rate limiting**: fixed window per IP and scope; auth endpoints are the
  tightest. `429` carries `Retry-After`.
- **CORS**: disabled unless `CORS_ORIGINS` is configured. Native clients do not
  need it; a wildcard would expose the API to browsers.
- **Secrets**: `JWT_SECRET` is required, minimum 32 characters, placeholder
  values are rejected at startup, and its `Debug` implementation is redacted.
  Configuration is never logged wholesale.
- **Errors**: 5xx responses never include database or crypto messages; the
  underlying error is logged with the request id.
- **Container**: multi-stage build, non-root user, no shell tooling in the runtime
  image.

## Known gaps (tracked in `docs/PLAN.md`)

1. **Proxy-aware rate limiting.** The limiter keys on the TCP peer. Behind a load
   balancer every client shares one key. Options: enforce limits at the edge, or
   parse trusted `Forwarded` headers from a configured proxy CIDR.
2. **No account lockout or CAPTCHA.** Rate limits blunt credential stuffing but do
   not stop a distributed attack.
3. **No email verification or password reset.** Deliberate: the product is a
   paper-trading demo and both require an email provider.
4. **No RBAC.** One role today; support tooling will need scoped access.
5. **Tokens are not revocable before expiry.** Access tokens live 15 minutes;
   refresh rotation is the revocation lever. A `token_version` column would allow
   immediate access-token revocation.
6. **Audit events are not tamper-evident.** A production ledger would use
   append-only storage with hash chaining or a WORM sink.
7. **No dependency scanning in CI yet.** Add `cargo deny check advisories` plus
   `npm audit --omit=dev` for the mobile app.

## Reporting

Do not open a public issue for a vulnerability. Send a private report with the
affected endpoint, a minimal reproduction, and the impact you observed. Never
include real credentials or personal data.

## Operational rules

- Rotate `JWT_SECRET` only with an overlap window; rotating it invalidates every
  access token immediately.
- Migrations are forward-only. A destructive change ships as expand → migrate →
  contract, never as a single drop.
- Never enable `CORS_ORIGINS=*`. The parser rejects a bare `*` because it does not
  start with `http://`.
- Backups must include `users`, `accounts`, `orders`, `trades`, and `positions`.
  They are the ledger.
