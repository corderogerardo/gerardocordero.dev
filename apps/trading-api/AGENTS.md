# AGENTS.md — trading-api

Instructions for AI coding assistants (Claude, Cursor, Copilot, Codex) working in
this directory. Humans should read `README.md` first; this file is the contract
for assisted changes.

## Loop

```bash
make db-up                      # Postgres on 127.0.0.1:5433
make verify                     # fmt + clippy + unit + integration
mise exec -- cargo test --lib   # fast domain loop, no database
```

`make verify` must be green before you report a task as complete. If you cannot
run Postgres, say so explicitly; never claim a passing suite you did not run.

## Invariants you must not break

1. **Money is `Decimal` and `NUMERIC(20, 8)`.** Never introduce `f64`, never do
   money math in JSON numbers, never let a client parse balances with floats.
2. **Every economic effect is one transaction.** Cash, position, order, trade,
   audit, and idempotency commit together.
3. **Lock order is order → account → position.** If you add a lock, place it in
   that order and document why.
4. **Idempotency is a unique constraint**, not a select-then-insert. The
   fingerprint covers the normalized intent; the same key with a different payload
   is an error.
5. **Every order/portfolio query is scoped by `user_id`.** Another user's resource
   is `404`, never `403`.
6. **5xx responses never leak internals.** Log the cause with the request id.
7. **No token or password hash in logs, URLs, or responses.** Refresh tokens are
   stored as SHA-256 hashes; access tokens are short-lived HS256.

## Conventions

- Test-first for behavior: observe RED, then implement, then refactor. The domain
  layer is pure and cheap to test — start there.
- SQL lives only in `src/store/`. Handlers never write queries.
- Handlers return `AppResult<T>` and construct errors with the existing helpers so
  the error contract stays uniform.
- New endpoints get: handler, route registration, `docs/api.md` update, and an
  integration test that covers auth, happy path, and one failure.
- Migrations are forward-only and numbered. Never edit an applied migration.
- Comments explain *why*, not *what*. Do not narrate the diff.
- No `unwrap`/`expect` in request paths; `expect` is acceptable in tests and at
  startup where a failure is unrecoverable.

## What not to do

- Do not add a dependency for something the standard library or an existing crate
  already does. Justify any new crate in the PR.
- Do not widen `CORS_ORIGINS` or add `allow_origin(Any)`.
- Do not put tokens in query strings.
- Do not make matching faster by dropping the order-row lock; correctness first.
- Do not "fix" the deterministic price seed. Tests depend on it.
- Do not commit `.env`, credentials, or generated `target/` artifacts.

## Definition of done

`make verify` green, docs updated when the contract changed, one conventional
commit, and a short report that names the tests you ran and anything you could not
run.
