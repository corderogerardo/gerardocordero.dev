# Meridian — trading mobile

Paper-trading client for `apps/trading-api`. Expo / React Native, expo-router,
Zustand + TanStack Query, zod at the boundary, decimal strings end to end.

## Install (read this first)

This app is deliberately **not** a pnpm workspace member: the monorepo runs Expo
SDK 56 (portfolio) and this app runs SDK 58. Sharing the hoisted `node_modules`
would mix both SDKs and break native autolinking, so the app installs in
isolation with its own lockfile:

```bash
cd apps/trading-mobile
pnpm install --ignore-workspace
```

Run every command from this directory (no `--filter`). The root `pnpm install`
does not install this app.

```bash
pnpm typecheck
pnpm lint
pnpm test
```

## Layout

| Path | What lives there |
| --- | --- |
| `src/app/` | expo-router routes: `(auth)` sign-in/sign-up, `(tabs)` markets/portfolio/orders/settings, `market/[symbol]`, `+not-found`. `_layout.tsx` owns providers, bootstrap and the auth guard. |
| `src/api/` | `schemas` (zod, one per response), `client` (fetch + timeout + single-flight refresh), `errors` (`ApiError`, envelope mapping, user copy), `auth` / `markets` / `orders` / `portfolio` (functions + query hooks). |
| `src/session/` | Keychain adapter (`meridian.refresh-token`) and the Zustand session store. Access token in memory only. |
| `src/stream/` | Public quote WebSocket: backoff + jitter, heartbeat/staleness, resubscribe, injectable socket and timers. `use-quotes` patches the query cache. |
| `src/lib/` | `money` (exact decimal strings), `order-validation`, `auth-validation`, `ids`, `datetime`, `version`. |
| `src/ui/` | Focused primitives on `StyleSheet` + `theme` tokens. No UI kit, no NativeWind. |
| `src/features/` | Composite pieces: market row, position card, order row, order ticket. |

## Conventions

- All numbers use the `numeric` token (tabular figures). Prices are the hero.
- Money is a **string** everywhere. `src/lib/money.ts` is the only place that does
  arithmetic, and it does it on digits with `bigint`. No `parseFloat`, no `Number()`
  for balances.
- `theme.ts` is the only source of colours, spacing, radii and type sizes.
- Screens handle loading, empty, error + retry. Lists are `FlatList` with
  `RefreshControl`; skeletons are decorative and the container carries the
  `progressbar` label.
- Touch targets are at least 44pt (`theme.touchTarget`).
- One idempotency key per order **intent** (`expo-crypto` `randomUUID`): retrying
  after a failure reuses it, editing the form starts a new one, success ends it.

## testIDs (shared by unit tests and Maestro)

- Screens: `screen-markets`, `screen-portfolio`, `screen-orders`, `screen-settings`,
  `screen-market-detail`, `screen-sign-in`, `screen-sign-up`, `screen-not-found`.
- Tabs: `tab-markets`, `tab-portfolio`, `tab-orders`, `tab-settings`.
- Auth: `sign-in-email|password|submit`, `sign-up-display-name|email|password|submit`.
- Markets: `market-row-<SYMBOL>`, `markets-loading|empty|error`.
- Order ticket: `order-side-buy|sell`, `order-type-market|limit`, `order-quantity`,
  `order-limit-price`, `order-submit`, `order-error`, `order-confirmation`.
- Orders: `orders-filter-all|open|filled|cancelled`, `orders-load-more`,
  `cancel-order-<id>`, `orders-loading|empty|error`.

## Maestro (needs a booted simulator + a dev build)

```bash
cd apps/trading-mobile
npx expo run:ios
maestro -p ios test .maestro/smoke.yml -e MAESTRO_EMAIL=... -e MAESTRO_PASSWORD=...
maestro -p ios test .maestro/sign-in.yml -e MAESTRO_EMAIL=... -e MAESTRO_PASSWORD=...
maestro -p ios test .maestro/place-order.yml
```

`smoke.yml` accepts an existing keychain session or signs in when credentials are
passed. `place-order.yml` expects a signed-in device.

Pass `-p ios` when an Android emulator is also attached: Maestro otherwise picks
the Android device and fails to find the iOS bundle id. The flows were verified on
an iPhone 17e simulator (iOS 27) with a dev build; they dismiss the native
"Save Password?" sheet and erase autofilled fields before typing.

## Notes

- API base URL: `EXPO_PUBLIC_API_URL`, otherwise the host loopback (iOS) or
  `10.0.2.2` (Android emulator). See `src/config.ts`.
- Estimated fee is 10 bps of notional, labelled as an estimate — the server is the
  authority. The client caps a single order at `1,000,000.00` notional to match the
  API default.
- The isolated install (above) is load-bearing: it is what makes expo-doctor pass
  its duplicate-native-module check and keeps the portfolio's SDK 56 packages out
  of this app's runtime.
