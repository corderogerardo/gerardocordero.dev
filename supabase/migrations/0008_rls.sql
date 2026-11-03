-- 0008_rls.sql — Row-Level Security.
--
-- The anon key ships inside the app bundle; anyone can extract it. RLS is the only
-- thing between that key and another contractor's customer list, so the rules live
-- here and are tested in `supabase/tests/` rather than trusted by inspection.
--
-- Pattern for every table:
--   * one `using` clause that decides what you may *see*,
--   * one `with check` clause that decides what you may *write*.
-- Writing only `using` is the classic mistake: it filters reads and lets an insert
-- through with someone else's org_id.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
-- `security definer` is required: a policy on `members` that queried `members`
-- would recurse. Definer functions run as the owner (bypassing RLS) so the lookup
-- is one hash join and terminates. Every one of them pins `search_path`, because a
-- definer function with an attacker-controlled search_path is privilege escalation.

create or replace function app.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select org_id from members where id = auth.uid()
$$;

comment on function app.current_org_id() is 'Org of the caller, or null. SECURITY DEFINER to avoid policy recursion on members.';

create or replace function app.current_role()
returns member_role
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select role from members where id = auth.uid()
$$;

create or replace function app.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce((select role from members where id = auth.uid()) in ('manager', 'admin'), false)
$$;

create or replace function app.is_member_of(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (select 1 from members where id = auth.uid() and org_id = p_org)
$$;

-- `execute` is useless without `usage`: a member gets "permission denied for schema
-- app" until both are granted. Revoking from `public` first is deliberate — anon must
-- never reach a helper, even if a future default grant appears.
grant usage on schema app to authenticated;

revoke all on function app.current_org_id() from public;
revoke all on function app.current_role() from public;
revoke all on function app.is_manager() from public;
revoke all on function app.is_member_of(uuid) from public;
grant execute on function app.current_org_id() to authenticated;
grant execute on function app.current_role() to authenticated;
grant execute on function app.is_manager() to authenticated;
grant execute on function app.is_member_of(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Tenancy
-- ---------------------------------------------------------------------------

alter table organizations enable row level security;
create policy organizations_read_own on organizations
  for select to authenticated
  using (id = app.current_org_id());

alter table teams enable row level security;
create policy teams_read_own on teams
  for select to authenticated
  using (org_id = app.current_org_id());

alter table members enable row level security;
-- A rep may see their own row and their teammates'; a manager sees the org.
create policy members_read_org on members
  for select to authenticated
  using (org_id = app.current_org_id());
-- Only a manager may change a member's team or role. Self-updates of display_name
-- are allowed so a rep can fix their own name.
create policy members_update_self_or_manager on members
  for update to authenticated
  using (id = auth.uid() or app.is_manager())
  with check (
    org_id = app.current_org_id()
    and (id = auth.uid() or app.is_manager())
  );

-- ---------------------------------------------------------------------------
-- Territory
-- ---------------------------------------------------------------------------

alter table properties enable row level security;
create policy properties_read_org on properties
  for select to authenticated
  using (org_id = app.current_org_id());
-- A rep may add a property they are standing in front of, but only in their org.
create policy properties_insert_org on properties
  for insert to authenticated
  with check (org_id = app.current_org_id());
create policy properties_update_manager on properties
  for update to authenticated
  using (org_id = app.current_org_id() and app.is_manager())
  with check (org_id = app.current_org_id());

alter table territories enable row level security;
create policy territories_read_org on territories
  for select to authenticated
  using (org_id = app.current_org_id());
-- Territories are assigned by ops. A rep must never redraw their own zone.
create policy territories_write_manager on territories
  for all to authenticated
  using (org_id = app.current_org_id() and app.is_manager())
  with check (org_id = app.current_org_id() and app.is_manager());

alter table territory_properties enable row level security;
create policy territory_properties_read_org on territory_properties
  for select to authenticated
  using (org_id = app.current_org_id());
create policy territory_properties_write_manager on territory_properties
  for all to authenticated
  using (org_id = app.current_org_id() and app.is_manager())
  with check (org_id = app.current_org_id() and app.is_manager());

-- ---------------------------------------------------------------------------
-- Field work
-- ---------------------------------------------------------------------------

alter table shifts enable row level security;
create policy shifts_read_own_or_manager on shifts
  for select to authenticated
  using (org_id = app.current_org_id() and (rep_id = auth.uid() or app.is_manager()));
create policy shifts_insert_own on shifts
  for insert to authenticated
  with check (org_id = app.current_org_id() and rep_id = auth.uid());
create policy shifts_update_own on shifts
  for update to authenticated
  using (org_id = app.current_org_id() and rep_id = auth.uid())
  with check (org_id = app.current_org_id() and rep_id = auth.uid());

alter table knocks enable row level security;
-- Reps see their own knocks; managers see the org's. The leaderboard reads
-- `daily_scores`, not `knocks`, so a rep never needs to see a teammate's raw rows.
create policy knocks_read_own_or_manager on knocks
  for select to authenticated
  using (org_id = app.current_org_id() and (rep_id = auth.uid() or app.is_manager()));
create policy knocks_insert_own on knocks
  for insert to authenticated
  with check (org_id = app.current_org_id() and rep_id = auth.uid());
-- Appending a note after the fact is allowed; changing the outcome is not, because
-- the outcome is what commission and the board are computed from.
create policy knocks_update_note_own on knocks
  for update to authenticated
  using (org_id = app.current_org_id() and rep_id = auth.uid())
  with check (org_id = app.current_org_id() and rep_id = auth.uid());

alter table dnc_entries enable row level security;
-- Everyone in the org may read the DNC list: that is the point of it.
create policy dnc_read_org on dnc_entries
  for select to authenticated
  using (org_id = app.current_org_id());
create policy dnc_insert_own on dnc_entries
  for insert to authenticated
  with check (org_id = app.current_org_id() and created_by = auth.uid());
-- Lifting a DNC entry is a manager decision.
create policy dnc_delete_manager on dnc_entries
  for delete to authenticated
  using (org_id = app.current_org_id() and app.is_manager());

-- ---------------------------------------------------------------------------
-- Leads
-- ---------------------------------------------------------------------------

alter table leads enable row level security;
create policy leads_read_own_or_manager on leads
  for select to authenticated
  using (org_id = app.current_org_id() and (rep_id = auth.uid() or app.is_manager()));
create policy leads_insert_own on leads
  for insert to authenticated
  with check (org_id = app.current_org_id() and rep_id = auth.uid());
-- A rep may edit their lead; a manager may take it over (reassignment is the
-- `manual` conflict policy, so it never happens silently).
create policy leads_update_own_or_manager on leads
  for update to authenticated
  using (org_id = app.current_org_id() and (rep_id = auth.uid() or app.is_manager()))
  with check (org_id = app.current_org_id());
create policy leads_delete_manager on leads
  for delete to authenticated
  using (org_id = app.current_org_id() and app.is_manager());

-- ---------------------------------------------------------------------------
-- Integration and sync state
-- ---------------------------------------------------------------------------

alter table crm_outbox enable row level security;
-- Ops visibility only; the queue is written by triggers and drained by the
-- service role, neither of which is subject to RLS.
create policy crm_outbox_read_manager on crm_outbox
  for select to authenticated
  using (org_id = app.current_org_id() and app.is_manager());

alter table hubspot_links enable row level security;
create policy hubspot_links_read_manager on hubspot_links
  for select to authenticated
  using (org_id = app.current_org_id() and app.is_manager());

alter table sync_mutations enable row level security;
create policy sync_mutations_read_own on sync_mutations
  for select to authenticated
  using (org_id = app.current_org_id() and member_id = auth.uid());

alter table sync_conflicts enable row level security;
-- Everyone in the org may see conflicts: they are a product signal, and hiding
-- them from the rep whose data is in dispute is how trust in the app dies.
create policy sync_conflicts_read_org on sync_conflicts
  for select to authenticated
  using (org_id = app.current_org_id());
create policy sync_conflicts_resolve_manager on sync_conflicts
  for update to authenticated
  using (org_id = app.current_org_id() and app.is_manager())
  with check (org_id = app.current_org_id());

-- ---------------------------------------------------------------------------
-- Scores
-- ---------------------------------------------------------------------------

alter table badges enable row level security;
create policy badges_read_all on badges
  for select to authenticated
  using (true);

alter table member_badges enable row level security;
create policy member_badges_read_org on member_badges
  for select to authenticated
  using (org_id = app.current_org_id());

alter table daily_scores enable row level security;
-- Team-visible: that is what a leaderboard is. No client write policy exists at
-- all, so a forged score is rejected by the absence of a grant, not by a check.
create policy daily_scores_read_org on daily_scores
  for select to authenticated
  using (org_id = app.current_org_id());

-- ---------------------------------------------------------------------------
-- Table-level grants
-- ---------------------------------------------------------------------------
-- RLS filters rows; it does not grant access, and nowadays Supabase ships *permissive*
-- default grants on `public` (that is how a new table is reachable from PostgREST at
-- all). Those defaults are why an UPDATE with no policy still does not raise on its own.
-- So: strip every default, then grant exactly the surface the app needs. The pgTAP
-- suite asserts both directions — the reads that must work and the writes that must not.
revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;

grant select on organizations, teams, members to authenticated;
grant select, insert, update on properties to authenticated;
grant select on territories, territory_properties to authenticated;
grant select, insert, update on shifts, knocks to authenticated;
grant select, insert, delete on dnc_entries to authenticated;
grant select, insert, update, delete on leads to authenticated;
grant select on crm_outbox, hubspot_links to authenticated;
grant select on sync_mutations, sync_conflicts to authenticated;
grant update on sync_conflicts to authenticated;
grant select on badges, member_badges, daily_scores to authenticated;
