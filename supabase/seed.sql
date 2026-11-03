-- seed.sql — two orgs, two teams each, eight reps, two managers, and enough field
-- history for every screen to be non-empty on first launch.
--
-- Why two orgs: a single-org seed cannot prove that RLS isolates anything. The
-- second org exists so `supabase/tests/01_rls.sql` has something to fail against.
--
-- Deterministic on purpose: `setseed` makes the pseudo-random outcomes reproducible,
-- so a screenshot of the board is comparable between runs.

set seed = 0.42;

-- ---------------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------------
create temp table seed_people (
  seq integer primary key,
  id uuid not null,
  email text not null,
  org_slug text not null,
  team_name text not null,
  role member_role not null,
  display_name text not null
);

insert into seed_people (seq, id, email, org_slug, team_name, role, display_name) values
  (1, '20000000-0000-4000-8000-000000000001', 'marcus@northwind.test',  'northwind', 'Alpha', 'rep',     'Marcus Bell'),
  (2, '20000000-0000-4000-8000-000000000002', 'lena@northwind.test',    'northwind', 'Alpha', 'rep',     'Lena Ortiz'),
  (3, '20000000-0000-4000-8000-000000000003', 'tomas@northwind.test',   'northwind', 'Bravo', 'rep',     'Tomas Reyes'),
  (4, '20000000-0000-4000-8000-000000000004', 'aisha@northwind.test',   'northwind', 'Bravo', 'rep',     'Aisha Khan'),
  (5, '20000000-0000-4000-8000-000000000005', 'dana@northwind.test',    'northwind', 'Alpha', 'manager', 'Dana Whitfield'),
  (6, '20000000-0000-4000-8000-000000000006', 'priya@summit.test',      'summit',    'Delta', 'manager', 'Priya Raman'),
  (7, '20000000-0000-4000-8000-000000000007', 'noah@summit.test',       'summit',    'Delta', 'rep',     'Noah Fischer'),
  (8, '20000000-0000-4000-8000-000000000008', 'sofia@summit.test',      'summit',    'Delta', 'rep',     'Sofia Duarte'),
  (9, '20000000-0000-4000-8000-000000000009', 'eli@summit.test',        'summit',    'Echo',  'rep',     'Eli Novak'),
  (10,'20000000-0000-4000-8000-00000000000a', 'grace@summit.test',      'summit',    'Echo',  'rep',     'Grace Lim');

insert into organizations (name, slug) values
  ('Northwind Exteriors', 'northwind'),
  ('Summit Roofing & Windows', 'summit');

insert into teams (org_id, name)
select o.id, t.name
from organizations o
join (values ('Alpha'), ('Bravo'), ('Delta'), ('Echo')) as t(name)
  on (o.slug = 'northwind' and t.name in ('Alpha', 'Bravo'))
  or (o.slug = 'summit' and t.name in ('Delta', 'Echo'));

-- Auth users. Password for every demo account: knockout123
-- The identity row is what makes email+password sign-in work in GoTrue.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select
  '00000000-0000-0000-0000-000000000000', p.id, 'authenticated', 'authenticated',
  p.email, crypt('knockout123', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(),
  '', '', '', ''
from seed_people p;

insert into auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at)
select p.email, p.id, jsonb_build_object('sub', p.id, 'email', p.email), 'email', now(), now()
from seed_people p;

insert into members (id, org_id, team_id, role, display_name)
select p.id, o.id, t.id, p.role, p.display_name
from seed_people p
join organizations o on o.slug = p.org_slug
join teams t on t.org_id = o.id and t.name = p.team_name;

-- ---------------------------------------------------------------------------
-- Territory
-- ---------------------------------------------------------------------------
-- Two blocks per org: one assigned to each team. Coordinates are real streets in
-- Austin and Denver, close enough to plot plausibly on a map.
insert into properties (org_id, address_line1, city, state, postal_code, lat, lng, parcel_id)
select
  o.id,
  (100 + g)::text || ' ' ||
    (array['Maple', 'Cedar', 'Birch', 'Willow', 'Juniper'])[1 + (g % 5)] || ' St',
  case o.slug when 'northwind' then 'Round Rock' else 'Lakewood' end,
  case o.slug when 'northwind' then 'TX' else 'CO' end,
  case o.slug when 'northwind' then '78664' else '80226' end,
  case o.slug when 'northwind' then 30.5080 else 39.7070 end + (g % 12) * 0.0006,
  case o.slug when 'northwind' then -97.6880 else -105.0810 end + (g / 12) * 0.0006,
  'P-' || o.slug || '-' || lpad(g::text, 3, '0')
from organizations o
cross join generate_series(1, 120) as g;

insert into territories (org_id, team_id, name, boundary, starts_on, ends_on)
select
  t.org_id,
  t.id,
  'Zone ' || t.name,
  case t.name
    when 'Alpha' then '[[-97.6895,30.5068],[-97.6862,30.5068],[-97.6862,30.5104],[-97.6895,30.5104]]'::jsonb
    when 'Bravo' then '[[-97.6862,30.5068],[-97.6829,30.5068],[-97.6829,30.5104],[-97.6862,30.5104]]'::jsonb
    when 'Delta' then '[[-105.0825,39.7058],[-105.0792,39.7058],[-105.0792,39.7094],[-105.0825,39.7094]]'::jsonb
    else '[[-105.0792,39.7058],[-105.0759,39.7058],[-105.0759,39.7094],[-105.0792,39.7094]]'::jsonb
  end,
  current_date - 30,
  null
from teams t;

insert into territory_properties (territory_id, property_id, org_id)
select t.id, p.id, p.org_id
from territories t
join properties p on p.org_id = t.org_id
where (t.name in ('Alpha', 'Delta') and p.parcel_id like '%-0%')
   or (t.name in ('Bravo', 'Echo') and p.parcel_id like '%-1%');

-- ---------------------------------------------------------------------------
-- Shifts, knocks, leads
-- ---------------------------------------------------------------------------
insert into shifts (org_id, rep_id, territory_id, day, started_at, ended_at)
select m.org_id, m.id, null, d::date, d + interval '9 hours', d + interval '17 hours'
from members m
cross join generate_series(current_date - 9, current_date - 1, interval '1 day') as d
where m.role = 'rep';

-- 60 knocks per rep per day for the last ten days: a plausible canvasser workload,
-- and enough for the 20-knock streak rule to be satisfiable.
insert into knocks (org_id, rep_id, property_id, shift_id, outcome, note, occurred_at, lat, lng, client_mutation_id)
select
  m.org_id,
  m.id,
  p.id,
  meta.shift_id,
  (array['no_answer', 'no_answer', 'no_answer', 'not_interested', 'conversation', 'conversation', 'dnc', 'set'])[1 + ((k + d + meta.ri * 3) % 8)]::knock_outcome,
  case when (k + d + meta.ri * 3) % 8 in (5, 7) then 'Homeowner mentioned a leaking gutter.' else null end,
  (current_date - d) + interval '9 hours' + k * interval '7 minutes' + meta.ri * interval '1 minute',
  p.lat,
  p.lng,
  gen_random_uuid()
from members m
-- meta gives each rep a stable index, so their shifts, outcomes, and routes differ.
-- Without it every rep produces an identical distribution and the board is a tie.
join lateral (
  select
    (select id from shifts sh where sh.rep_id = m.id order by sh.day desc limit 1) as shift_id,
    (select count(*) from members m2
      where m2.role = 'rep' and m2.org_id = m.org_id and m2.id <= m.id) as ri
) meta on true
cross join generate_series(0, 9) as d
cross join generate_series(1, 60) as k
join lateral (
  select id, lat, lng
  from properties p2
  where p2.org_id = m.org_id
  order by p2.parcel_id
  offset ((k * 3 + d * 7 + meta.ri * 11) % 120) limit 1
) p on true
where m.role = 'rep';

insert into leads (
  org_id, property_id, rep_id, name, phone, email, stage, appointment_at, notes,
  qr_code, estimated_value, client_mutation_id
)
select
  k.org_id,
  k.property_id,
  k.rep_id,
  (array['Rachel Adler', 'Ben Cortez', 'Mia Fontaine', 'Owen Pratt', 'Hana Sato'])[1 + (row_number() over (order by k.id)) % 5],
  '+1512555' || lpad(((row_number() over (order by k.id)) % 9000 + 1000)::text, 4, '0'),
  null,
  case when (row_number() over (order by k.id)) % 4 = 0 then 'appointment' else 'contacted' end::lead_stage,
  case when (row_number() over (order by k.id)) % 4 = 0
       then k.occurred_at + interval '2 days' else null end,
  'Roof age unknown; wants a quote before the storm season.',
  'DH-' || substr(k.id::text, 1, 8),
  8000 + ((row_number() over (order by k.id)) % 12) * 1500,
  gen_random_uuid()
from knocks k
where k.outcome in ('conversation', 'set')
  -- One lead per property per rep keeps the list readable instead of comic.
  and k.id in (select distinct on (k2.rep_id, k2.property_id) k2.id from knocks k2 order by k2.rep_id, k2.property_id, k2.occurred_at);

-- ---------------------------------------------------------------------------
-- Scores
-- ---------------------------------------------------------------------------
insert into daily_scores (org_id, member_id, day, knocks, conversations, sets, xp, streak_days)
select
  m.org_id, m.id, d::date, coalesce(s.knocks, 0), coalesce(s.conversations, 0),
  coalesce(s.sets, 0), coalesce(s.xp, 0),
  case when coalesce(s.knocks, 0) >= 20 then 1 else 0 end
from members m
cross join generate_series(current_date - 9, current_date, interval '1 day') as d
left join lateral app.xp_for_day(m.id, d::date) s on true
where m.role = 'rep';

drop table if exists seed_people;

-- Sanity: leave a marker in the log so `supabase db reset` output is readable.
do $$
declare
  n_knocks integer;
  n_leads integer;
begin
  select count(*) into n_knocks from knocks;
  select count(*) into n_leads from leads;
  raise notice 'Seeded % knocks and % leads across 2 orgs.', n_knocks, n_leads;
end $$;
