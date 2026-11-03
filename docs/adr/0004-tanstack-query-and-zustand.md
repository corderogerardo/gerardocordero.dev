# ADR-0004: TanStack Query for server state, Zustand for the rest

## Status
Accepted

## Date
2026-11-03

## Context

Knockout has two kinds of state that are constantly confused with each other:

1. **Server state** — properties, leads, knocks, scores. It is owned by Postgres, may be stale, may be
   fetched by three screens at once, and must be refetched when the app returns to the foreground.
2. **Local state** — the current shift id, the sync status, the offline simulator flag, the session.
   It is owned by the device, and it must survive a navigation but not a reinstall.

The job description lists TanStack Query as "strongly preferred" and Zustand among the preferred
libraries. A single store for both kinds is the standard mistake: it forces you to hand-write
caching, deduplication, invalidation, and retries for data that already has a server.

## Decision

- **TanStack Query owns every read that comes from Postgres.** Query keys include `orgId`. Offline,
  the cached value is served and marked stale; `onlineManager` is wired to the app's single
  connectivity source so it stops attempting refetches with no signal.
- **Zustand owns three slices** — `session`, `shift`, `sync` — with `persist` over a MMKV adapter for
  `shift` and `sync`, and SecureStore for tokens.
- **No business data in Zustand.** No lead objects, no knock arrays, no scores.
- **No server state in React `useState`.** If two screens can show it, it is a query.
- **Writes go through a single helper** that performs the SQLite transaction from
  `ARCHITECTURE.md §3`, then updates the query cache optimistically.

## Consequences

- One source of truth per kind of state, so "two screens disagree" becomes structurally impossible.
- The cache is not a database: it does not survive an app kill. Anything that must survive goes to
  SQLite, and the query hook reads through the DAO rather than hitting HTTP directly when offline.
- A new screen must answer one question first: *is this server state or device state?* That is a
  feature, not overhead.

## Alternatives Considered

- **Redux Toolkit + RTK Query.** Correct, heavier, and it would make the offline path (a local SQLite
  read) fight the cache layer.
- **Context + `useReducer`.** Re-renders the subtree on every sync-status change during a drain.
- **TanStack Query only.** Session and sync status are not fetched from anywhere; modelling them as
  queries is a lie that shows up as an infinite `staleTime`.

## References

- `apps/knockout-mobile/src/data/queries/`, `apps/knockout-mobile/src/data/stores/`
- `ARCHITECTURE.md §2`, `apps/knockout-mobile/docs/GLOSSARY.md` (TanStack Query, Zustand)
