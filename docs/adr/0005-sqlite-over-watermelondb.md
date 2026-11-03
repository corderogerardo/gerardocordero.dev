# ADR-0005: SQLite with an explicit outbox, not WatermelonDB

## Status
Accepted

## Date
2026-11-03

## Context

The job names three local storage options: SQLite, MMKV, and WatermelonDB. The product needs a device
database that (a) survives process death, (b) supports transactional writes, (c) can be inspected and
repaired from a diagnostics screen, and (d) makes conflict resolution a decision we make on purpose.

WatermelonDB is a serious option: reactive queries, lazy loading, and a synchronisation protocol with
`pullChanges`/`pushChanges`, `_status`/`_changed` columns, and conflict detection already built. Its
weaknesses in this context are the mirror of its strengths: the sync semantics are the framework's,
not ours. When a lead is not syncing, the answer becomes "because WatermelonDB decided so", which is
useless in an interview, on a support call, and in a post-mortem.

The New Architecture support is also newer than SQLite's, and MMKV is needed anyway for the
synchronous session path.

## Decision

Use **expo-sqlite** as the single device database, with `PRAGMA user_version` migrations, typed DAOs,
and an **outbox** table written in the same transaction as the business row. `react-native-mmkv`
holds only the three synchronous, tiny values that must be readable without an `await` (session
envelope, sync cursor, offline flag). WatermelonDB is not a dependency.

The sync protocol (ordering, idempotency keys, backoff, quarantine, per-field policies) lives in
`packages/sync-core` and is framework-free, so it can be tested with a fake clock and no device.

## Consequences

- Roughly 600 extra lines of engine and DAO code that WatermelonDB would have provided.
- In exchange: every sync decision is greppable, documented, unit-tested, and explainable; the
  diagnostics screen can show the literal queue; and the engine can be reused by a future web console.
- SQLite needs the app to own migrations. That is a feature here — the query shapes are the schema's
  shape, and both are reviewed together.
- If the team later standardises on WatermelonDB, the seam is `src/sync/sqlite-outbox.ts` plus the
  DAOs; `sync-core` survives unchanged.

## Alternatives Considered

- **WatermelonDB.** Best fit for a large app with many tables and a team that has already agreed on
  the semantics and does not want to own them. Rejected here because owning them is the point.
- **AsyncStorage + JSON.** No transactions, no query, no indexes; an OOM kill during a write loses
  the queue.
- **Realm / expo-sqlite + Drizzle.** Drizzle is a fine ORM, but the codegen and migration story adds a
  build step for a schema this small; raw SQL with typed DAOs is fewer moving parts.

## References

- `ARCHITECTURE.md §3–§5`, `packages/sync-core/src/outbox.ts`
- `apps/knockout-mobile/docs/GLOSSARY.md` (expo-sqlite, MMKV, WatermelonDB)
