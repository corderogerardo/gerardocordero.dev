-- 0003_territory.sql — properties, territories, and their join table.
--
-- The territory boundary is a JSON array of [lng, lat] pairs, not a PostGIS
-- polygon. Trade-off, stated plainly: PostGIS gives containment queries in SQL
-- ("which properties are inside this polygon?"), but it adds an extension to every
-- environment for a query the phone can do in one pure function (`pointInPolygon`).
-- The rep is the one who needs the answer, and the rep is offline. If ops ever
-- needs server-side containment, this is the migration that changes.
--
-- The JSON shape is validated on write, because a polygon that is not a polygon
-- renders as a broken map and wastes an afternoon.

create table properties (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations (id) on delete cascade,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  lat double precision not null,
  lng double precision not null,
  -- County parcel number, the identifier the contractor already uses.
  parcel_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  server_seq bigint not null default 0,
  version integer not null default 1,
  constraint properties_lat_range check (lat between -90 and 90),
  constraint properties_lng_range check (lng between -180 and 180),
  -- One address per org. Two reps knocking the same house must land on the same row.
  constraint properties_address_per_org unique (org_id, address_line1, postal_code)
);

create index properties_org_seq_idx on properties (org_id, server_seq);

create trigger properties_touch
  before insert or update on properties
  for each row execute function app.touch();

create table territories (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations (id) on delete cascade,
  team_id uuid references teams (id) on delete set null,
  name text not null,
  -- [[lng, lat], …] — closed ring is not required; point-in-polygon closes it.
  boundary jsonb not null,
  -- Inclusive date range the zone is assigned for. A zone is not forever.
  starts_on date not null,
  ends_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  server_seq bigint not null default 0,
  version integer not null default 1,
  constraint territories_boundary_is_ring check (
    jsonb_typeof(boundary) = 'array'
    and jsonb_array_length(boundary) >= 3
  ),
  constraint territories_range_order check (ends_on is null or ends_on >= starts_on)
);

create index territories_org_seq_idx on territories (org_id, server_seq);

create trigger territories_touch
  before insert or update on territories
  for each row execute function app.touch();

create table territory_properties (
  territory_id uuid not null references territories (id) on delete cascade,
  property_id uuid not null references properties (id) on delete cascade,
  org_id uuid not null references organizations (id) on delete cascade,
  primary key (territory_id, property_id)
);

create index territory_properties_org_idx on territory_properties (org_id);

comment on column territories.boundary is '[[lng, lat], …]. Point-in-polygon runs on the device; see src/features/territory/geo.ts.';
