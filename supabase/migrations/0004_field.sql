-- 0004_field.sql — shifts, knocks, and the do-not-contact list.
--
-- These three tables are the reason the app exists. A knock is the atomic fact the
-- rest of the product derives from: the rep's pay, the leaderboard, the CRM deal.

create table shifts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations (id) on delete cascade,
  rep_id uuid not null references members (id) on delete cascade,
  territory_id uuid references territories (id) on delete set null,
  -- Local calendar day, computed on the device and sent once. Streaks are counted
  -- in the rep's day, not UTC's: a 9pm knock belongs to today.
  day date not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  server_seq bigint not null default 0,
  version integer not null default 1,
  constraint shifts_end_after_start check (ended_at is null or ended_at >= started_at)
);

-- One open shift per rep. Two open shifts make "today's knocks" ambiguous. A
-- partial unique index says exactly that, without pulling in btree_gist for an
-- EXCLUDE constraint.
create unique index shifts_one_open_per_rep on shifts (rep_id) where ended_at is null;

create index shifts_org_seq_idx on shifts (org_id, server_seq);
create index shifts_rep_day_idx on shifts (rep_id, day desc);

create trigger shifts_touch
  before insert or update on shifts
  for each row execute function app.touch();

create table knocks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations (id) on delete cascade,
  rep_id uuid not null references members (id) on delete cascade,
  property_id uuid not null references properties (id) on delete cascade,
  shift_id uuid references shifts (id) on delete set null,
  outcome knock_outcome not null,
  note text,
  occurred_at timestamptz not null,
  -- Where the rep actually stood. Nullable: location permission is opt-in and a
  -- knock must never be blocked by a denied permission.
  lat double precision,
  lng double precision,
  /**
   * Client-generated idempotency key. UNIQUE at the row level is the last line of
   * defence: even if the sync ledger has a bug, Postgres refuses to store the same
   * knock twice. That is cheaper than finding duplicate commission rows in a ledger.
   */
  client_mutation_id uuid not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  server_seq bigint not null default 0,
  version integer not null default 1
);

-- The board query: today's knocks for one org. The screen query: a rep's own.
create index knocks_org_rep_time_idx on knocks (org_id, rep_id, occurred_at desc);
create index knocks_org_seq_idx on knocks (org_id, server_seq);
create index knocks_property_idx on knocks (property_id, occurred_at desc);

create trigger knocks_touch
  before insert or update on knocks
  for each row execute function app.touch();

create table dnc_entries (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations (id) on delete cascade,
  property_id uuid not null references properties (id) on delete cascade,
  reason text,
  created_by uuid references members (id) on delete set null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  server_seq bigint not null default 0,
  version integer not null default 1,
  constraint dnc_once_per_property unique (org_id, property_id)
);

create index dnc_org_seq_idx on dnc_entries (org_id, server_seq);

create trigger dnc_touch
  before insert or update on dnc_entries
  for each row execute function app.touch();

-- A knock that records outcome `dnc` must leave a DNC entry behind, in the same
-- transaction. Doing this in a trigger rather than in the edge function means the
-- rule holds even if a future client writes knocks through a different path.
create or replace function app.propagate_dnc()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.outcome = 'dnc' then
    insert into dnc_entries (org_id, property_id, reason, created_by, occurred_at)
    values (new.org_id, new.property_id, 'knock outcome', new.rep_id, new.occurred_at)
    on conflict (org_id, property_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger knocks_propagate_dnc
  after insert on knocks
  for each row execute function app.propagate_dnc();
