-- 0005_leads.sql — leads, and the two side tables that make CRM sync and
-- conflict resolution auditable.

create table leads (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations (id) on delete cascade,
  property_id uuid not null references properties (id) on delete cascade,
  -- Owner. Reassignment is a business decision, so this field's conflict policy is
  -- `manual` (see docs/adr/0007 and packages/sync-core/src/policies.ts).
  rep_id uuid not null references members (id) on delete restrict,
  name text,
  phone text,
  email text,
  stage lead_stage not null default 'new',
  appointment_at timestamptz,
  notes text,
  /** Local device file until the photo is uploaded, then the Storage object path. */
  photo_path text,
  /** Code printed on a door hanger, scanned with expo-camera. */
  qr_code text,
  /** Rep's estimate of the job value, in whole dollars. Never used for money movement. */
  estimated_value integer,
  client_mutation_id uuid not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  server_seq bigint not null default 0,
  version integer not null default 1,
  constraint leads_contact_present check (name is not null or phone is not null or email is not null),
  constraint leads_value_positive check (estimated_value is null or estimated_value >= 0)
);

create index leads_org_rep_idx on leads (org_id, rep_id, created_at desc);
create index leads_org_stage_idx on leads (org_id, stage);
create index leads_org_seq_idx on leads (org_id, server_seq);
create index leads_property_idx on leads (property_id);

create trigger leads_touch
  before insert or update on leads
  for each row execute function app.touch();

-- ---------------------------------------------------------------------------
-- CRM integration
-- ---------------------------------------------------------------------------

-- The outbox is a table, not a queue service: it must be inspectable ("why is
-- this lead not in HubSpot?"), retryable, and idempotent across re-runs. One row
-- per lead intention, upserted, so ten edits produce one send.
create table crm_outbox (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations (id) on delete cascade,
  lead_id uuid not null references leads (id) on delete cascade,
  status crm_status not null default 'pending',
  attempts integer not null default 0,
  last_error text,
  next_attempt_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crm_outbox_one_per_lead unique (lead_id),
  constraint crm_outbox_attempts_non_negative check (attempts >= 0)
);

create index crm_outbox_due_idx on crm_outbox (status, next_attempt_at);

-- The proof of idempotency: a lead maps to exactly one contact and one deal.
-- `hubspot-sync` reads this table before calling HubSpot, and writes it after.
-- Re-running the function is a no-op, which is the only way retries are safe.
create table hubspot_links (
  lead_id uuid primary key references leads (id) on delete cascade,
  org_id uuid not null references organizations (id) on delete cascade,
  contact_id text,
  deal_id text,
  synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hubspot_links_contact_or_deal check (contact_id is not null or deal_id is not null)
);

-- A lead is queued for CRM as soon as it becomes an appointment. A trigger, not a
-- client call: the queue must be correct even when the client never comes back.
create or replace function app.queue_lead_for_crm()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.stage = 'appointment' and (tg_op = 'INSERT' or old.stage is distinct from 'appointment') then
    insert into crm_outbox (org_id, lead_id)
    values (new.org_id, new.id)
    on conflict (lead_id) do update
      set status = 'pending',
          next_attempt_at = now(),
          updated_at = now();
  end if;
  return new;
end;
$$;

create trigger leads_queue_for_crm
  after insert or update of stage on leads
  for each row execute function app.queue_lead_for_crm();
