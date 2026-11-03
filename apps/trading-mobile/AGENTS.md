# AGENTS.md — trading-mobile

Rules for assisted changes in this app. Read `README.md` first.

## Loop

This app is **not** a pnpm workspace member (SDK 58 vs the monorepo's SDK 56).
Install it in isolation, once, and run every command from this directory:

```bash
pnpm install --ignore-workspace
pnpm typecheck
pnpm lint
pnpm test
```

All three gates must be green before reporting a change as done. Do not run a
plain `pnpm install` here: it walks up to the root workspace and installs the
monorepo instead. Maestro flows are a device-level gate and need a booted
simulator; say so explicitly when you did not run them.

## Invariants you must not break

1. **Money is a decimal string.** Never `parseFloat`, `Number()`, or arithmetic on
   balances. Add helpers to `src/lib/money.ts` (digit/`bigint` math) instead.
2. **Parse at the boundary.** Every new response gets a zod schema in
   `src/api/schemas.ts` and is parsed with `parseOrThrow`. A schema mismatch is an
   `ApiError` with code `INVALID_RESPONSE`, not a crash.
3. **The access token never leaves memory.** Only the refresh token is persisted,
   only under `meridian.refresh-token`, only through `src/session/secure-store.ts`.
   `SessionState.applySession` is the single writer.
4. **One refresh, one retry.** The client shares a single refresh across concurrent
   401s and replays each request at most once. Never add a retry loop.
5. **`POST /v1/orders` retries reuse the same `Idempotency-Key`.** One key per
   intent (button press); a changed form is a new intent.
6. **Theme tokens only.** No hardcoded hex values, font sizes, or spacing. Colour
   carries meaning: green/red are market direction, the accent is action.
7. **No new dependencies.** If something is missing, stop and report it.
8. **Touch targets ≥ 44pt**, and every interactive element has an accessible name.

## Conventions

- One focused file per concern: screens compose, `src/features/` holds composites,
  `src/ui/` holds primitives. Keep components under ~200 lines and screens under
  ~300.
- State: local `useState` → TanStack Query for server data → Zustand for session.
  Do not mirror server data in Zustand.
- Tests are behaviour-level and never touch the network: install a fake transport
  (`__tests__/helpers/test-api.ts`), mock the WebSocket factory, or mock the hook
  module. RNTL v14 is async — `await render`, `await fireEvent.press`.
- Comments explain *why*. Do not narrate the diff.

## What not to do

- Do not add NativeWind, styled-components, a UI kit, or a state library.
- Do not hardcode colours or sizes outside `src/ui/theme.ts`.
- Do not put credentials, tokens or request bodies in logs.
- Do not edit the root workspace, other apps, the lockfile, or the backend from
  this app.
- Do not add this package back to the pnpm workspace. Its isolated install is what
  keeps SDK 58 native modules out of the portfolio's SDK 56 tree.
