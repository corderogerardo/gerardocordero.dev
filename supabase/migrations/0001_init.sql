-- 0001_init.sql — foundations: schemas, enums, and the two triggers every synced
-- table depends on.
--
-- Why a schema called `app`: Supabase exposes `public` through PostgREST. Helper
-- functions (membership lookups, triggers) must NOT be reachable as REST endpoints
-- or callable by `anon`. Keeping them in `app` means the API surface is exactly the
-- tables we intend to publish.

create schema if not exists app;

comment on schema app is 'Internal helpers: policy lookups and triggers. Not exposed through PostgREST.';

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
-- Enums, not text+check: the database then rejects a typo at the boundary instead
-- of letting it become a row that the client's Zod schema will choke on later.

create type member_role as enum ('rep', 'manager', 'admin');
create type knock_outcome as enum ('no_answer', 'not_interested', 'conversation', 'dnc', 'set');
create type lead_stage as enum ('new', 'contacted', 'appointment', 'won', 'lost');
create type sync_op as enum ('create', 'update');
create type sync_entity as enum ('knock', 'lead', 'dnc');
create type conflict_state as enum ('open', 'resolved');
create type crm_status as enum ('pending', 'sent', 'failed');

-- ---------------------------------------------------------------------------
-- The sync watermark
-- ---------------------------------------------------------------------------
-- One global sequence, not a per-table one. The client stores a single cursor and
-- pulls `where server_seq > cursor order by server_seq`. A timestamp would be
-- wrong here: two rows committed in the same millisecond get skipped by `>`, and
-- device clocks are not comparable to the server's.

create sequence if not exists app.server_seq;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
-- `touch` does three things every synced row needs, in one place:
--   1. stamps `server_seq` so the row is visible to pullers,
--   2. stamps `updated_at` from the server clock (never the device's),
--   3. bumps `version` on update, which is what a push compares to detect a
--      concurrent edit. A stale version is a 409, not a silent overwrite.
--
-- `security definer` is not needed here: it runs as the statement's role, and an
-- authenticated member already has the row-level grant to update the row.
create or replace function app.touch()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    new.version := old.version + 1;
  end if;
  new.server_seq := nextval('app.server_seq');
  new.updated_at := now();
  return new;
end;
$$;

comment on function app.touch() is 'Stamps server_seq, updated_at, and bumps version on update. Attached to every synced table.';

-- ---------------------------------------------------------------------------
-- Sanity helpers used by the migrations that follow
-- ---------------------------------------------------------------------------
create or replace function app.epoch_ms(ts timestamptz)
returns bigint
language sql
immutable
as $$ select (extract(epoch from ts) * 1000)::bigint $$;

comment on function app.epoch_ms(timestamptz) is 'Milliseconds since epoch, the unit the sync engine uses for nextAttemptAt.';
