import type { Mutation } from "./contract";

/**
 * The outbox port. The engine never touches SQLite; it asks this interface for the
 * next batch and tells it what happened. Everything below the seam is the app's job.
 */
export type OutboxStore = {
  /** Pending, plus deferred entries whose `nextAttemptAt` has arrived, in send order. */
  listPending(limit: number, now: number): Promise<Mutation[]>;
  markInflight(ids: readonly string[]): Promise<void>;
  markApplied(id: string): Promise<void>;
  defer(id: string, nextAttemptAt: number, error: string): Promise<void>;
  quarantine(id: string, error: string): Promise<void>;
  /** Reclaim rows left `inflight` by a crash. Returns how many were reset. */
  resetStaleInflight(): Promise<number>;
  /** Pending + deferred. The Sync screen's number. */
  queueDepth(): Promise<number>;
};

export type MemoryOutbox = OutboxStore & {
  /** Test and demo helper: a full snapshot, ordered. */
  all(): Mutation[];
};

const clone = (mutation: Mutation): Mutation => ({ ...mutation });

const isDue = (mutation: Mutation, now: number): boolean => {
  if (mutation.state === "pending") return true;
  if (mutation.state !== "deferred") return false;
  return mutation.nextAttemptAt !== null && mutation.nextAttemptAt <= now;
};

const sendOrder = (a: Mutation, b: Mutation): number =>
  a.createdAt === b.createdAt ? (a.id < b.id ? -1 : 1) : a.createdAt < b.createdAt ? -1 : 1;

/**
 * In-memory outbox. Used by the unit tests and by the app's offline simulator, so
 * the exact same engine code runs with and without a device database.
 */
export function createMemoryOutbox(seed: readonly Mutation[] = []): MemoryOutbox {
  const rows = new Map<string, Mutation>(seed.map((m) => [m.id, clone(m)]));

  const update = (id: string, patch: Partial<Mutation>): void => {
    const current = rows.get(id);
    if (!current) return;
    rows.set(id, { ...current, ...patch });
  };

  return {
    async listPending(limit, now) {
      return [...rows.values()]
        .filter((m) => isDue(m, now))
        .sort(sendOrder)
        .slice(0, limit)
        .map(clone);
    },

    async markInflight(ids) {
      for (const id of ids) update(id, { state: "inflight" });
    },

    async markApplied(id) {
      update(id, { state: "applied", lastError: null });
    },

    async defer(id, nextAttemptAt, error) {
      const current = rows.get(id);
      update(id, {
        state: "deferred",
        attempt: (current?.attempt ?? 0) + 1,
        nextAttemptAt,
        lastError: error,
      });
    },

    async quarantine(id, error) {
      update(id, { state: "quarantined", lastError: error });
    },

    async resetStaleInflight() {
      let reset = 0;
      for (const [id, mutation] of rows) {
        if (mutation.state !== "inflight") continue;
        rows.set(id, { ...mutation, state: "pending" });
        reset += 1;
      }
      return reset;
    },

    async queueDepth() {
      return [...rows.values()].filter((m) => m.state === "pending" || m.state === "deferred")
        .length;
    },

    all() {
      return [...rows.values()].sort(sendOrder).map(clone);
    },
  };
}
