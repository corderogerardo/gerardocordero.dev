import type { Mutation } from "@gerardocordero/sync-core";
import { MUTATION_ENTITIES, MUTATION_OPS, MUTATION_STATES } from "@gerardocordero/sync-core";

import type { SqliteRunner } from "./runner";

/**
 * The SQLite implementation of `sync-core`'s `OutboxStore` port.
 *
 * The engine decides *what* to do; this decides *where it is written*. Keeping them
 * apart is what lets the engine be tested with a fake clock and this layer be tested
 * with real SQL — see `__tests__/offline-write.test.ts`.
 */

type OutboxRow = {
  id: string;
  entity: string;
  entity_id: string;
  op: string;
  payload: string;
  created_at: string;
  attempt: number;
  state: string;
  next_attempt_at: number | null;
  last_error: string | null;
};

const toMutation = (row: OutboxRow): Mutation => ({
  id: row.id,
  entity: MUTATION_ENTITIES.includes(row.entity as Mutation["entity"])
    ? (row.entity as Mutation["entity"])
    : "knock",
  entityId: row.entity_id,
  op: MUTATION_OPS.includes(row.op as Mutation["op"]) ? (row.op as Mutation["op"]) : "create",
  payload: JSON.parse(row.payload) as Record<string, unknown>,
  createdAt: row.created_at,
  attempt: row.attempt,
  state: MUTATION_STATES.includes(row.state as Mutation["state"])
    ? (row.state as Mutation["state"])
    : "pending",
  nextAttemptAt: row.next_attempt_at,
  lastError: row.last_error,
});

export function createSqliteOutboxStore(runner: SqliteRunner) {
  return {
    async listPending(limit: number, now: number): Promise<Mutation[]> {
      const rows = await runner.all<OutboxRow>(
        `select * from outbox
          where state = 'pending'
             or (state = 'deferred' and next_attempt_at is not null and next_attempt_at <= ?)
          order by created_at asc, id asc
          limit ?`,
        [now, limit],
      );
      return rows.map(toMutation);
    },

    async markInflight(ids: readonly string[]): Promise<void> {
      if (ids.length === 0) return;
      const placeholders = ids.map(() => "?").join(", ");
      await runner.run(`update outbox set state = 'inflight' where id in (${placeholders})`, [
        ...ids,
      ]);
    },

    async markApplied(id: string): Promise<void> {
      await runner.run("update outbox set state = 'applied', last_error = null where id = ?", [id]);
    },

    async defer(id: string, nextAttemptAt: number, error: string): Promise<void> {
      // `attempt = attempt + 1` in SQL, not read-then-write: two drains racing on the
      // same row must not both read 2 and both write 3.
      await runner.run(
        `update outbox
            set state = 'deferred', attempt = attempt + 1, next_attempt_at = ?, last_error = ?
          where id = ?`,
        [nextAttemptAt, error, id],
      );
    },

    async quarantine(id: string, error: string): Promise<void> {
      await runner.run("update outbox set state = 'quarantined', last_error = ? where id = ?", [
        error,
        id,
      ]);
    },

    async resetStaleInflight(): Promise<number> {
      const row = await runner.first<{ total: number }>(
        "select count(*) as total from outbox where state = 'inflight'",
      );
      await runner.run("update outbox set state = 'pending' where state = 'inflight'");
      return row?.total ?? 0;
    },

    async queueDepth(): Promise<number> {
      const row = await runner.first<{ total: number }>(
        "select count(*) as total from outbox where state in ('pending','deferred')",
      );
      return row?.total ?? 0;
    },
  };
}

export type SqliteOutboxStore = ReturnType<typeof createSqliteOutboxStore>;
