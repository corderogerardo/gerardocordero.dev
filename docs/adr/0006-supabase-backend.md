# ADR-0006: Supabase as the backend, not a bespoke API

## Status
Accepted

## Date
2026-11-03

## Context

The product needs: a relational store, multi-tenant authorisation, a realtime channel, a place to keep
secrets that the device must not hold (the HubSpot token), file storage for lead photos, and scheduled
work. The target role states this stack explicitly: "Integrates mobile applications with Supabase
(Postgres, Row-Level Security, Realtime subscriptions)".

Building a bespoke Node or Rust service would demonstrate a different skill set. It would also be a
worse portfolio artefact for this specific job: an interviewer would ask "why didn't you use
Supabase?" and the honest answer would be "to show I can build a CRUD API", which is not what the role
is hiring for.

## Decision

Supabase, used for what it is good at, with the backend logic written as SQL and Edge Functions:

- **Postgres** for schema, constraints, indexes, scoring functions, and the `server_seq` trigger.
- **RLS** for authorisation, with `security definer` helpers and a pgTAP isolation matrix.
- **PostgREST** for reads (`select` through `supabase-js`), which keeps the client simple and typed.
- **Realtime** for the leaderboard only; treated as a hint, never as the source of truth.
- **Edge Functions (Deno)** for `sync-push` (atomic batch + idempotency) and `hubspot-sync` (secret
  token, retry policy).
- **Storage** for lead photos, with RLS-scoped buckets.

Local development uses the Supabase CLI (`supabase start`), so the entire backend is reproducible from
`supabase/migrations` + `supabase/seed.sql` with one command, and CI runs the same image set.

## Consequences

- The anon key ships inside the app; every table therefore *must* have RLS. That is a constraint we
  accept and test, not a detail we hope holds.
- Deno is not Node. Edge Functions use `npm:` specifiers, `Deno.env.get`, and `Deno.serve`; shared
  client code cannot be imported by path across package boundaries, so the wire contract exists in two
  small copies (client Zod schema, server Zod schema) and the *database* types are generated
  (`supabase gen types`) rather than duplicated.
- Ports are shifted away from the CLI defaults (54341–54347) because a second local Supabase stack on
  this machine owns 54321–54327.
- A future custom production-management system plugs in as another Edge Function plus an adapter,
  mirroring the HubSpot shape.

## Alternatives Considered

- **Bespoke Node/NestJS API.** More code, more deployment, and it answers a question the role did not
  ask. Rejected for this artefact, not in general.
- **Firebase.** No relational model, no SQL RLS, and the job does not mention it.
- **PocketBase / Appwrite.** Fine products; neither demonstrates Postgres or RLS, which are named.

## References

- `supabase/migrations/`, `supabase/functions/`, `supabase/tests/`
- `ARCHITECTURE.md §1`, `§6`, `§7`
