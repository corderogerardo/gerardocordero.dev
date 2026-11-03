import type { Outcome } from "@gerardocordero/sync-core";

import type { SqliteRunner } from "./runner";

/**
 * Recording a knock — the write path the whole product rests on.
 *
 * One rule, and everything else follows from it: the knock row and its outbox
 * mutation are inserted **in the same transaction**. If the process dies between
 * them, SQLite rolls back and the rep sees a knock that did not happen; it never
 * sees a knock that happened but will never sync.
 */

export type KnockInput = {
  orgId: string;
  repId: string;
  propertyId: string;
  shiftId: string | null;
  outcome: Outcome;
  note?: string | null;
  occurredAt: Date;
  lat?: number | null;
  lng?: number | null;
};

export type RecordKnockResult = {
  knockId: string;
  mutationId: string;
};

type Clock = () => Date;

const defaultClock: Clock = () => new Date();

/** UUID v4 from the platform RNG; injectable so tests can assert exact ids. */
const defaultId = (): string => {
  const cryptoLike = globalThis.crypto as { randomUUID?: () => string } | undefined;
  if (cryptoLike?.randomUUID) return cryptoLike.randomUUID();
  // Hermes without the web-crypto polyfill: good enough shape for a local key that
  // is later replaced by the server's row id.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
};

export type RecordKnockDeps = {
  now?: Clock;
  newId?: () => string;
};

export async function recordKnock(
  runner: SqliteRunner,
  input: KnockInput,
  deps: RecordKnockDeps = {},
): Promise<RecordKnockResult> {
  const now = deps.now ?? defaultClock;
  const newId = deps.newId ?? defaultId;

  const knockId = newId();
  const mutationId = newId();
  const occurredAt = input.occurredAt.toISOString();
  const createdAt = now().toISOString();

  const payload = {
    id: knockId,
    orgId: input.orgId,
    repId: input.repId,
    propertyId: input.propertyId,
    shiftId: input.shiftId,
    outcome: input.outcome,
    note: input.note ?? null,
    occurredAt,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
  };

  await runner.transaction(async (tx) => {
    await tx.run(
      `insert into knocks
        (id, org_id, rep_id, property_id, shift_id, outcome, note, occurred_at, lat, lng,
         client_mutation_id, created_at)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        knockId,
        input.orgId,
        input.repId,
        input.propertyId,
        input.shiftId,
        input.outcome,
        input.note ?? null,
        occurredAt,
        input.lat ?? null,
        input.lng ?? null,
        mutationId,
        createdAt,
      ],
    );

    await tx.run(
      `insert into outbox
        (id, entity, entity_id, op, payload, created_at, attempt, state, next_attempt_at, last_error)
       values (?, 'knock', ?, 'create', ?, ?, 0, 'pending', null, null)`,
      [mutationId, knockId, JSON.stringify(payload), createdAt],
    );
  });

  return { knockId, mutationId };
}

export type KnockRow = {
  id: string;
  property_id: string;
  outcome: Outcome;
  occurred_at: string;
};

/** Today's knocks for the shift screen, newest first. */
export async function listKnocksSince(
  runner: SqliteRunner,
  repId: string,
  since: Date,
): Promise<KnockRow[]> {
  return runner.all<KnockRow>(
    `select id, property_id, outcome, occurred_at
       from knocks
      where rep_id = ? and occurred_at >= ?
      order by occurred_at desc`,
    [repId, since.toISOString()],
  );
}

/** How many of a rep's knocks are still waiting to reach the server. */
export async function countUnsyncedKnocks(runner: SqliteRunner, repId: string): Promise<number> {
  const row = await runner.first<{ total: number }>(
    `select count(*) as total
       from outbox o
       join knocks k on k.id = o.entity_id
      where o.entity = 'knock' and o.state in ('pending','deferred') and k.rep_id = ?`,
    [repId],
  );
  return row?.total ?? 0;
}
