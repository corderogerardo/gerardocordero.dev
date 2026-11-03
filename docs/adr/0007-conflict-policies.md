# ADR-0007: Explicit conflict policies, not CRDTs

## Status
Accepted

## Date
2026-11-03

## Context

Several reps edit overlapping data offline. The product needs a rule for every field group so that a
drain never silently destroys someone's work. The candidate mechanisms are:

1. **CRDTs** (Yjs/Automerge-style): convergent by construction, no coordination.
2. **Vector clocks / version vectors**: detect concurrent edits, then ask a human.
3. **Per-field explicit policies** with a version integer and `updated_at`.
4. **Last-write-wins on the whole row** using device clocks.

The data is small and boring: five knock outcomes, a handful of contact fields, a stage, an owner.
But two of those fields have money attached (stage and owner) and one has safety attached (DNC).

## Decision

Per-field policies, declared in one place (`packages/sync-core/src/policies.ts`) and enforced
server-side in `sync-push`:

| Group | Policy |
| --- | --- |
| Properties, territories, DNC | `server-wins` |
| Knock outcome, note, timestamp | `client-wins` |
| Lead contact fields | `field-merge` (per-field last-write-wins by `updated_at`) |
| Lead owner, contested stage | `manual` — surfaced to the user, never guessed |
| Scores, CRM links | server-only |

Every row carries `version` and `updated_at`. A push with a stale version returns `409` **with the
server snapshot**, so the client can apply the policy locally or hand the decision to a human.

## Consequences

- A conflict is a first-class, visible event (`sync_conflicts`), not an invisible overwrite. The Sync
  screen exists partly because of this decision.
- `client-wins` on a knock is safe because knocks are append-only in practice: the same rep does not
  knock the same door twice with two different outcomes.
- Device clocks are never trusted for ordering; only `updated_at` from the server is compared, and
  pulls use a sequence cursor.
- A `manual` conflict blocks that one lead until resolved — deliberately. Commission disputes should
  not be settled by a tie-break function.
- CRDTs would have made convergence automatic and the product semantics unreadable; that trade is the
  wrong way round for four fields and one owner.

## Alternatives Considered

- **Automerge/Yjs.** Correct, but the payloads, storage, and debugging story are a project of their
  own, and "why did my commission disappear" has no crisp answer.
- **Whole-row LWW on device clocks.** A phone with a wrong clock wins every edit.
- **Server always wins.** Loses the rep's observation — the only data nobody else can reconstruct.

## References

- `packages/sync-core/src/policies.ts`, `supabase/functions/sync-push/index.ts`
- `ARCHITECTURE.md §5` (conflict matrix)
