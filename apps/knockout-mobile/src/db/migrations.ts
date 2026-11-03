import type { SqliteRunner } from "./runner";

/**
 * Device schema, applied by `PRAGMA user_version`.
 *
 * Rules that keep this maintainable:
 *   * append only — a shipped version is history, never edited;
 *   * one statement per array entry, because the runner executes them one by one;
 *   * the device tables mirror the server's names, so a sync payload reads the same
 *     on both sides and a bug is found in one vocabulary rather than two.
 */
export type Migration = { version: number; statements: readonly string[] };

export const MIGRATIONS: readonly Migration[] = [
  {
    version: 1,
    statements: [
      `create table if not exists knocks (
        id text primary key,
        org_id text not null,
        rep_id text not null,
        property_id text not null,
        shift_id text,
        outcome text not null check (outcome in ('no_answer','not_interested','conversation','dnc','set')),
        note text,
        occurred_at text not null,
        lat real,
        lng real,
        client_mutation_id text not null unique,
        created_at text not null
      )`,
      `create index if not exists knocks_rep_day on knocks (rep_id, occurred_at desc)`,
      `create table if not exists leads (
        id text primary key,
        org_id text not null,
        property_id text not null,
        rep_id text not null,
        name text,
        phone text,
        email text,
        stage text not null default 'new' check (stage in ('new','contacted','appointment','won','lost')),
        appointment_at text,
        notes text,
        photo_path text,
        qr_code text,
        estimated_value integer,
        client_mutation_id text not null unique,
        created_at text not null,
        updated_at text not null
      )`,
      `create index if not exists leads_rep on leads (rep_id, created_at desc)`,
      /**
       * The outbox is the local half of the sync contract. `id` is the idempotency
       * key AND the primary key: the same mutation cannot be enqueued twice, and a
       * replay after a crash carries the same id.
       */
      `create table if not exists outbox (
        id text primary key,
        entity text not null check (entity in ('knock','lead','dnc')),
        entity_id text not null,
        op text not null check (op in ('create','update')),
        payload text not null,
        created_at text not null,
        attempt integer not null default 0,
        state text not null default 'pending'
          check (state in ('pending','inflight','applied','deferred','quarantined')),
        next_attempt_at integer,
        last_error text
      )`,
      `create index if not exists outbox_due on outbox (state, next_attempt_at, created_at)`,
      `create table if not exists sync_meta (
        key text primary key,
        value text not null
      )`,
    ],
  },
];

const LATEST = MIGRATIONS[MIGRATIONS.length - 1]?.version ?? 0;

/**
 * Applies every migration newer than the database's `user_version`.
 *
 * `PRAGMA user_version` cannot be parameterised, so the version is interpolated —
 * it comes from this file, never from user input, and is validated to be an integer
 * before it reaches the SQL string.
 */
export async function migrate(runner: SqliteRunner): Promise<number> {
  const row = await runner.first<{ user_version: number }>("PRAGMA user_version");
  const current = row?.user_version ?? 0;

  for (const migration of MIGRATIONS) {
    if (migration.version <= current) continue;
    await runner.transaction(async (tx) => {
      for (const statement of migration.statements) await tx.run(statement);
      if (!Number.isInteger(migration.version)) {
        throw new Error(`Migration version must be an integer, got ${migration.version}`);
      }
      await tx.run(`PRAGMA user_version = ${migration.version}`);
    });
  }

  return LATEST;
}

export const LATEST_SCHEMA_VERSION = LATEST;
