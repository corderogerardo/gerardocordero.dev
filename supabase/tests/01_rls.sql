-- 01_rls.sql — the isolation matrix.
--
-- What this file is for: RLS bugs are silent. A policy that is one comparison too
-- loose returns 200 with someone else's customer list, and nothing in the app looks
-- wrong. So every table gets the same three questions asked in SQL:
--
--   1. can a member of org A READ a row of org B?          (must be no)
--   2. can a member of org A WRITE a row claiming org B?    (must be no)
--   3. can a member touch a row that is not theirs?         (must be no, unless manager)
--
-- Run with: `supabase test db` (or `pnpm test:db` once the Makefile exists).

begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions, pg_temp;

-- Known ids from supabase/seed.sql.
--   marcus = Northwind rep      noah = Summit rep
--   dana   = Northwind manager  priya = Summit manager
select plan(22);

-- ---------------------------------------------------------------------------
-- Identity
-- ---------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims = '{"sub":"20000000-0000-4000-8000-000000000001","role":"authenticated"}';

select is(
  app.current_org_id(),
  (select id from organizations where slug = 'northwind'),
  'a member resolves to their own org'
);

select is(
  app.is_manager(),
  false,
  'a rep is not a manager'
);

-- ---------------------------------------------------------------------------
-- Cross-org reads
-- ---------------------------------------------------------------------------
select is_empty(
  $$ select 1 from knocks where org_id = (select id from organizations where slug = 'summit') $$,
  'org A cannot read org B knocks'
);

select is_empty(
  $$ select 1 from leads where org_id = (select id from organizations where slug = 'summit') $$,
  'org A cannot read org B leads'
);

select is_empty(
  $$ select 1 from properties where org_id = (select id from organizations where slug = 'summit') $$,
  'org A cannot read org B properties'
);

select is_empty(
  $$ select 1 from members where org_id = (select id from organizations where slug = 'summit') $$,
  'org A cannot read org B members'
);

select is_empty(
  $$ select 1 from daily_scores where org_id = (select id from organizations where slug = 'summit') $$,
  'org A cannot read org B scores'
);

select is_empty(
  $$ select 1 from territories where org_id = (select id from organizations where slug = 'summit') $$,
  'org A cannot read org B territories'
);

-- Positive control: reading your own org must work, otherwise the empty results
-- above could just mean the query is broken.
select cmp_ok(
  (select count(*) from knocks),
  '>',
  0::bigint,
  'org A can read its own knocks'
);

-- ---------------------------------------------------------------------------
-- Cross-org writes
-- ---------------------------------------------------------------------------
select throws_ok(
  $$ insert into knocks (org_id, rep_id, property_id, outcome, occurred_at, client_mutation_id)
     values (
       (select id from organizations where slug = 'summit'),
       '20000000-0000-4000-8000-000000000001',
       (select id from properties where org_id = (select id from organizations where slug = 'northwind') limit 1),
       'no_answer', now(), gen_random_uuid()
     ) $$,
  '42501', null,
  'a knock claiming another org is rejected by the insert policy'
);

select throws_ok(
  $$ insert into leads (org_id, property_id, rep_id, name, client_mutation_id)
     values (
       (select id from organizations where slug = 'northwind'),
       (select id from properties where org_id = (select id from organizations where slug = 'northwind') limit 1),
       '20000000-0000-4000-8000-000000000008',
       'Spoofed Owner', gen_random_uuid()
     ) $$,
  '42501', null,
  'a lead owned by another rep is rejected'
);

select throws_ok(
  $$ insert into dnc_entries (org_id, property_id, created_by)
     values (
       (select id from organizations where slug = 'northwind'),
       (select id from properties where org_id = (select id from organizations where slug = 'northwind') limit 1),
       '20000000-0000-4000-8000-000000000005'
     ) $$,
  '42501', null,
  'a DNC entry attributed to someone else is rejected'
);

-- ---------------------------------------------------------------------------
-- Score forgery
-- ---------------------------------------------------------------------------
-- There is no insert policy on daily_scores at all. The error is the *absence of a
-- grant*, not a conditional check, which is why it cannot be bypassed by a clever
-- payload (ADR-0008).
select throws_ok(
  $$ insert into daily_scores (org_id, member_id, day, xp)
     values (
       (select id from organizations where slug = 'northwind'),
       '20000000-0000-4000-8000-000000000001',
       current_date, 999999
     ) $$,
  '42501', null,
  'a client cannot write its own score'
);

select throws_ok(
  $$ update daily_scores set xp = 999999 $$,
  '42501', null,
  'a client cannot update a score either'
);

-- ---------------------------------------------------------------------------
-- Row ownership within the org
-- ---------------------------------------------------------------------------
-- Updating a teammate's knock must affect zero rows. RLS filters silently on
-- UPDATE ... USING, so the assertion is on the returned row count, not on an error.
with touched as (
  update knocks set note = 'edited by a teammate'
  where rep_id <> auth.uid()
  returning 1
)
select is(
  (select count(*) from touched),
  0::bigint,
  'a rep cannot update a teammate knock'
);

with touched as (
  delete from dnc_entries where org_id = app.current_org_id() returning 1
)
select is(
  (select count(*) from touched),
  0::bigint,
  'a rep cannot delete a DNC entry (manager only)'
);

with touched as (
  delete from leads where org_id = app.current_org_id() returning 1
)
select is(
  (select count(*) from touched),
  0::bigint,
  'a rep cannot delete a lead (manager only)'
);

-- ---------------------------------------------------------------------------
-- Reference data and the manager boundary
-- ---------------------------------------------------------------------------
select cmp_ok(
  (select count(*) from badges),
  '>',
  0::bigint,
  'badge definitions are readable by any authenticated member'
);

-- Become the Northwind manager: the org boundary still holds, but the org-wide
-- read that a rep was denied now succeeds.
reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"20000000-0000-4000-8000-000000000005","role":"authenticated"}';

select is(app.is_manager(), true, 'the manager resolves as a manager');

select is_empty(
  $$ select 1 from leads where org_id = (select id from organizations where slug = 'summit') $$,
  'a manager still cannot read another org'
);

select cmp_ok(
  (select count(*) from knocks),
  '>',
  (select count(*) from knocks where rep_id = auth.uid()),
  'a manager sees more knocks than their own'
);

-- ---------------------------------------------------------------------------
-- The anon key is the key that ships in the bundle. It must reach nothing.
-- ---------------------------------------------------------------------------
reset role;
set local role anon;

select throws_ok(
  $$ select 1 from knocks limit 1 $$,
  '42501', null,
  'the anon role has no grant on knocks'
);

reset role;
select * from finish();
rollback;
