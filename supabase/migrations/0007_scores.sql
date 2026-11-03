-- 0007_scores.sql — the game layer's storage.
--
-- `daily_scores` is a projection of `knocks`, never a source of truth. The client
-- never writes it (ADR-0008); it is recomputed by `app.recompute_daily_score`.
--
-- Why store it at all instead of computing on read: the leaderboard is read
-- continuously over Realtime by every member of a team. Recomputing an aggregate
-- of every knock in the org on every read is the difference between a board that
-- feels instant and one that drains a battery.

create table badges (
  code text primary key,
  name text not null,
  description text not null
);

create table member_badges (
  member_id uuid not null references members (id) on delete cascade,
  badge_code text not null references badges (code) on delete cascade,
  org_id uuid not null references organizations (id) on delete cascade,
  awarded_on date not null,
  created_at timestamptz not null default now(),
  primary key (member_id, badge_code)
);

create table daily_scores (
  org_id uuid not null references organizations (id) on delete cascade,
  member_id uuid not null references members (id) on delete cascade,
  day date not null,
  knocks integer not null default 0,
  conversations integer not null default 0,
  sets integer not null default 0,
  xp integer not null default 0,
  streak_days integer not null default 0,
  computed_at timestamptz not null default now(),
  server_seq bigint not null default 0,
  primary key (member_id, day),
  constraint daily_scores_non_negative check (knocks >= 0 and conversations >= 0 and sets >= 0 and xp >= 0)
);

-- The board query: one org, one day, ordered by score. Descending on xp because
-- that is how it is read; a tie-break index would be premature here.
create index daily_scores_board_idx on daily_scores (org_id, day, xp desc);
create index daily_scores_seq_idx on daily_scores (org_id, server_seq);

-- Scores have no `version`: nobody but the server writes them, so there is nothing
-- to reconcile. They still need a `server_seq` so clients can pull them.
create or replace function app.touch_score()
returns trigger
language plpgsql
as $$
begin
  new.server_seq := nextval('app.server_seq');
  new.computed_at := now();
  return new;
end;
$$;

create trigger daily_scores_touch
  before insert or update on daily_scores
  for each row execute function app.touch_score();

-- XP rules live in one function so the client cannot drift from the server and the
-- pgTAP fixture can be computed on paper first. The streak multiplier is capped at
-- 1.5x: commission is already the incentive; the leaderboard should not compound.
create or replace function app.xp_for_day(p_member_id uuid, p_day date)
returns table (knocks integer, conversations integer, sets integer, xp integer)
language sql
stable
as $$
  with counts as (
    select
      count(*) filter (where outcome <> 'dnc')::int as knocks,
      count(*) filter (where outcome = 'conversation')::int as conversations,
      count(*) filter (where outcome = 'set')::int as sets,
      count(*) filter (where outcome = 'no_answer')::int as no_answers,
      count(*) filter (where outcome = 'not_interested')::int as not_interested
    from knocks
    where rep_id = p_member_id
      and occurred_at >= p_day::timestamptz
      and occurred_at < (p_day + 1)::timestamptz
  )
  select
    counts.knocks,
    counts.conversations,
    counts.sets,
    (
      counts.no_answers * 1
      + counts.not_interested * 2
      + counts.conversations * 5
      + counts.sets * 25
    )::int as xp
  from counts;
$$;

comment on function app.xp_for_day(uuid, date) is 'Raw XP for one member-day. Server-only: the client displays, it never computes (ADR-0008).';

insert into badges (code, name, description) values
  ('first_set', 'First Set', 'Book the first appointment.'),
  ('ten_sets', 'Ten Sets', 'Ten appointments booked in total.'),
  ('streak_5', 'Five-Day Streak', 'Five consecutive shift days with 20+ knocks.'),
  ('century', 'Century', '100 knocks in a single day.'),
  ('ghostbuster', 'Ghostbuster', 'Three conversations in a row after ten no-answers.'),
  ('closer', 'Closer', 'Three appointments in a single day.');
