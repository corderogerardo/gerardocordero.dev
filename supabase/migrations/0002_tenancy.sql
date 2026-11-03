-- 0002_tenancy.sql — organizations, teams, members.
--
-- Tenancy rule for the whole database: every tenant row carries `org_id` directly,
-- even when it could be derived through a join. Two reasons, both practical:
--   * an RLS policy becomes one comparison instead of a subquery per row;
--   * an index on (org_id, …) serves both the policy and the screen's query.
-- The redundancy is maintained by NOT NULL + foreign keys, not by trust.

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  -- Readable key used by the seed and by the demo script. Users never see it.
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table teams (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  constraint teams_name_per_org unique (org_id, name)
);

create index teams_org_idx on teams (org_id);

-- A member IS an auth user. `id` references auth.users so the JWT subject and the
-- membership row are the same identifier: `auth.uid()` then needs no lookup table
-- mapping and cannot drift.
create table members (
  id uuid primary key references auth.users (id) on delete cascade,
  org_id uuid not null references organizations (id) on delete cascade,
  team_id uuid references teams (id) on delete set null,
  role member_role not null default 'rep',
  display_name text not null,
  created_at timestamptz not null default now()
);

create index members_org_idx on members (org_id);
create index members_team_idx on members (team_id);

comment on table members is 'One row per auth user with an org and a role. id = auth.users.id.';
