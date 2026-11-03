-- 02_scoring.sql — the scoring rule, pinned with numbers computed on paper.
--
-- The point of this file is not coverage. It is that the leaderboard is the one
-- feature where a wrong number is worth cheating for, so the rule is asserted
-- against a hand-computed fixture rather than against the implementation.

begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions, pg_temp;

select plan(6);

-- A dedicated org and rep, so the fixture cannot drift when the seed changes.
insert into organizations (id, name, slug)
values ('9a000000-0000-4000-8000-000000000001', 'Scoring Fixture', 'scoring-fixture');

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values (
  '00000000-0000-0000-0000-000000000000',
  '9a000000-0000-4000-8000-0000000000a1',
  'authenticated', 'authenticated', 'fixture@scoring.test',
  crypt('knockout123', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()
);

insert into members (id, org_id, role, display_name)
values ('9a000000-0000-4000-8000-0000000000a1', '9a000000-0000-4000-8000-000000000001', 'rep', 'Fixture Rep');

insert into properties (id, org_id, address_line1, city, state, postal_code, lat, lng)
values ('9a000000-0000-4000-8000-0000000000b1', '9a000000-0000-4000-8000-000000000001', '1 Test Way', 'Round Rock', 'TX', '78664', 30.5, -97.68);

-- Fixture day: 2026-01-15. Hand-computed XP:
--   no_answer      1
--   no_answer      1
--   not_interested 2
--   conversation   5
--   conversation   5
--   set           25
--   dnc            0   (never rewarded)
--   -------------------
--   knocks: 6 (dnc excluded)   conversations: 2   sets: 1   xp: 39
insert into knocks (org_id, rep_id, property_id, outcome, occurred_at, client_mutation_id)
select
  '9a000000-0000-4000-8000-000000000001',
  '9a000000-0000-4000-8000-0000000000a1',
  '9a000000-0000-4000-8000-0000000000b1',
  outcome::knock_outcome,
  timestamptz '2026-01-15 10:00:00+00' + (n * interval '5 minutes'),
  gen_random_uuid()
from (values
  (1, 'no_answer'),
  (2, 'no_answer'),
  (3, 'not_interested'),
  (4, 'conversation'),
  (5, 'conversation'),
  (6, 'set'),
  (7, 'dnc')
) as v(n, outcome);

select results_eq(
  $$ select knocks, conversations, sets, xp from app.xp_for_day('9a000000-0000-4000-8000-0000000000a1', date '2026-01-15') $$,
  $$ values (6, 2, 1, 39) $$,
  'xp_for_day matches the hand-computed fixture'
);

-- A knock that records dnc must create the DNC entry in the same transaction.
select is(
  (select count(*) from dnc_entries where property_id = '9a000000-0000-4000-8000-0000000000b1'),
  1::bigint,
  'a dnc knock leaves exactly one DNC entry'
);

-- The trigger must be idempotent for a repeated dnc on the same property.
insert into knocks (org_id, rep_id, property_id, outcome, occurred_at, client_mutation_id)
values (
  '9a000000-0000-4000-8000-000000000001',
  '9a000000-0000-4000-8000-0000000000a1',
  '9a000000-0000-4000-8000-0000000000b1',
  'dnc', timestamptz '2026-01-15 11:00:00+00', gen_random_uuid()
);

select is(
  (select count(*) from dnc_entries where property_id = '9a000000-0000-4000-8000-0000000000b1'),
  1::bigint,
  'a second dnc knock does not duplicate the DNC entry'
);

-- A lead that becomes an appointment must be queued for CRM, once.
insert into leads (id, org_id, property_id, rep_id, name, stage, client_mutation_id)
values (
  '9a000000-0000-4000-8000-0000000000c1',
  '9a000000-0000-4000-8000-000000000001',
  '9a000000-0000-4000-8000-0000000000b1',
  '9a000000-0000-4000-8000-0000000000a1',
  'Fixture Lead', 'contacted', gen_random_uuid()
);

update leads set stage = 'appointment' where id = '9a000000-0000-4000-8000-0000000000c1';

select is(
  (select count(*) from crm_outbox where lead_id = '9a000000-0000-4000-8000-0000000000c1'),
  1::bigint,
  'an appointment queues exactly one CRM job'
);

update leads set stage = 'won' where id = '9a000000-0000-4000-8000-0000000000c1';
update leads set stage = 'appointment' where id = '9a000000-0000-4000-8000-0000000000c1';

select is(
  (select count(*) from crm_outbox where lead_id = '9a000000-0000-4000-8000-0000000000c1'),
  1::bigint,
  're-entering the appointment stage reuses the same CRM job'
);

-- The ledger is what makes a retry safe: the same mutation id cannot apply twice.
insert into sync_mutations (mutation_id, org_id, member_id, entity, entity_id, op, result)
values (
  '9a000000-0000-4000-8000-0000000000d1',
  '9a000000-0000-4000-8000-000000000001',
  '9a000000-0000-4000-8000-0000000000a1',
  'knock',
  '9a000000-0000-4000-8000-0000000000b1',
  'create',
  '{"status":"applied"}'::jsonb
);

select throws_ok(
  $$ insert into sync_mutations (mutation_id, org_id, member_id, entity, entity_id, op, result)
     values (
       '9a000000-0000-4000-8000-0000000000d1',
       '9a000000-0000-4000-8000-000000000001',
       '9a000000-0000-4000-8000-0000000000a1',
       'knock', '9a000000-0000-4000-8000-0000000000b1', 'create', '{}'::jsonb
     ) $$,
  '23505', null,
  'a replayed mutation id is a primary-key conflict, not a second write'
);

select * from finish();
rollback;
