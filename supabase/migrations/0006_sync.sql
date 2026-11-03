-- 0006_sync.sql — the server half of the offline sync contract.
--
-- Two tables, two different jobs:
--   * `sync_mutations` is the idempotency ledger. It is what makes a retry safe.
--   * `sync_conflicts` is the audit trail for decisions the engine could not make
--     on its own. A conflict that nobody can see is indistinguishable from data
--     loss, which is exactly the reputation offline-first apps have earned.

-- The ledger. `mutation_id` is the client-generated UUID, so a replay is a
-- primary-key hit, not a second write. `result` stores what the first attempt
-- returned, so the replay can return the same body instead of a different one.
create table sync_mutations (
  mutation_id uuid primary key,
  org_id uuid not null references organizations (id) on delete cascade,
  member_id uuid not null references members (id) on delete cascade,
  entity sync_entity not null,
  entity_id uuid not null,
  op sync_op not null,
  result jsonb not null,
  applied_at timestamptz not null default now()
);

create index sync_mutations_member_idx on sync_mutations (member_id, applied_at desc);

comment on table sync_mutations is 'Idempotency ledger. A mutation_id is applied at most once; replays return the stored result.';

-- Conflicts are per field group, not per row: two reps can legitimately edit
-- different fields of the same lead. `policy` records which rule was applied, so a
-- reviewer can tell a bug from a decision.
create table sync_conflicts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations (id) on delete cascade,
  entity sync_entity not null,
  entity_id uuid not null,
  field_group text not null,
  policy text not null,
  state conflict_state not null default 'open',
  -- Both snapshots: without the losing side nobody can explain what happened.
  local_value jsonb not null,
  remote_value jsonb not null,
  resolved_value jsonb,
  resolved_by uuid references members (id) on delete set null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index sync_conflicts_open_idx on sync_conflicts (org_id, state, created_at desc);

comment on table sync_conflicts is 'Unresolved or resolved field-level conflicts. `manual` policy rows need a human decision on the Sync screen.';
