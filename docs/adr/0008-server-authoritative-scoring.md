# ADR-0008: Scoring is server-authoritative

## Status
Accepted

## Date
2026-11-03

## Context

XP, streaks, badges, and the leaderboard drive recognition and — in a commission-based field team —
attention and retention. The obvious implementation is to compute XP on the device when a knock is
recorded and send the total to the server, because the device already knows the outcome and the app
must work offline.

The obvious implementation is also trivially cheatable: the anon key is in the app bundle, a rooted
device can edit SQLite or MMKV, and the leaderboard is the one feature where cheating is *worth* it.
Field sales teams have historically gamed leaderboards by exactly this route.

## Decision

- **Knocks are the only input.** A knock row is the fact; XP is a derived value.
- **The database computes scores.** `recompute_daily_score(member_id, day)` computes XP, the capped
  streak multiplier, and per-day counters from `knocks`, inside a `security definer` function with an
  explicit `search_path`, triggered on knock insert and on shift end.
- **The client never sends a score.** `daily_scores` has no client `insert`/`update` policy. A push that
  includes an XP field is ignored; the pgTAP suite asserts a forged value changes nothing.
- **The client formats, it does not compute.** `src/features/board/format.ts` is a pure function that
  turns a server row into display strings, and has its own unit tests (including tie-break order).
- **Badges are also server-derived** from the same rows, so a badge cannot be claimed.

## Consequences

- The board can lag reality by one drain. That is correct: it lags by exactly the time it takes the
  knock to become a server fact.
- Offline, the app can show a *provisional* local XP ("+25") as feedback, but it is not a score and is
  visually marked as pending until the server confirms.
- Streak multipliers must be reproducible by hand. The pgTAP tests carry a fixture with expected
  numbers, computed on paper first — the test encodes the rule, not the implementation.
- This adds a migration, a function, a trigger, a realtime publication, and a test suite. It is worth
  it: it is the one place where "never trust the client" is the entire feature.

## Alternatives Considered

- **Client-computed XP uploaded with the knock.** Simplest, and wrong for the same reason a client-side
  price is wrong.
- **Server recompute on read (materialised view).** Correct, but recomputing on every board read is a
  query the leaderboard happens to make continuously over Realtime.
- **Cryptographic signing of score payloads on device.** Solves the wrong layer: the key is also on the
  device.

## References

- `supabase/migrations/0010_scoring.sql`, `supabase/tests/02_scoring.sql`
- `apps/knockout-mobile/src/features/board/format.ts`
- `PRODUCT.md §6`
