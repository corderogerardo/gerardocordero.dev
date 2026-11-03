import { DEFAULT_BACKOFF, nextDelay, shouldQuarantine } from "./backoff";
import type { BackoffOptions } from "./backoff";
import type { Mutation, PushRequest, PushResult } from "./contract";
import type { OutboxStore } from "./outbox";
import { policyFor } from "./policies";
import type { FieldGroup } from "./policies";

export type Clock = { now(): number };
export type Random = () => number;

export type Logger = {
  info(event: string, data?: Record<string, unknown>): void;
  warn(event: string, data?: Record<string, unknown>): void;
  error(event: string, data?: Record<string, unknown>): void;
};

export type Transport = {
  push(request: PushRequest): Promise<PushResult>;
};

export type DrainContext = {
  outbox: OutboxStore;
  transport: Transport;
  clock: Clock;
  random: Random;
  log: Logger;
  /** Stable per-install id; lets the server attribute a batch without trusting the body. */
  deviceId: string;
  batchSize?: number;
  backoff?: BackoffOptions;
};

export type DrainStopReason = "empty" | "batch-limited" | "retryable" | "terminal";

export type DrainResult = {
  applied: number;
  deferred: number;
  quarantined: number;
  conflicts: number;
  stoppedReason: DrainStopReason;
};

/**
 * Which conflict policy governs an entity. Kept explicit: the mapping is a product
 * decision, and a wrong default here silently overwrites a rep's work.
 */
export function groupForEntity(entity: Mutation["entity"]): FieldGroup {
  switch (entity) {
    case "knock":
      return "knock";
    case "lead":
      return "lead-contact";
    case "dnc":
      return "dnc";
  }
}

/**
 * One bounded pass over the outbox.
 *
 * Rules, in the order they fire:
 *   1. Reclaim rows left `inflight` by a crash before doing anything else.
 *   2. Send at most one batch. Order is `(createdAt, id)`; later mutations may
 *      depend on earlier ones, so a non-retryable failure stops the batch.
 *   3. A thrown transport error is *retryable* and never quarantines: a network
 *      failure says nothing about the payload.
 *   4. A `rejected` result is terminal and stops the batch; a `conflict` follows
 *      its field-group policy.
 */
export async function runDrain(ctx: DrainContext): Promise<DrainResult> {
  const batchSize = ctx.batchSize ?? 25;
  const backoff = ctx.backoff ?? DEFAULT_BACKOFF;

  const result: DrainResult = {
    applied: 0,
    deferred: 0,
    quarantined: 0,
    conflicts: 0,
    stoppedReason: "empty",
  };

  const reclaimed = await ctx.outbox.resetStaleInflight();
  ctx.log.info("sync.drain.start", { reclaimed, queueDepth: await ctx.outbox.queueDepth() });

  const depth = await ctx.outbox.queueDepth();
  if (depth === 0) {
    ctx.log.info("sync.drain.end", { ...result });
    return result;
  }

  const batch = await ctx.outbox.listPending(batchSize, ctx.clock.now());
  if (batch.length === 0) {
    ctx.log.info("sync.drain.end", { ...result });
    return result;
  }

  await ctx.outbox.markInflight(batch.map((m) => m.id));

  const deferOne = async (mutation: Mutation, error: string): Promise<void> => {
    if (shouldQuarantine(mutation.attempt, backoff)) {
      await ctx.outbox.quarantine(mutation.id, `${error} (attempts exhausted)`);
      result.quarantined += 1;
      return;
    }
    const delay = nextDelay(mutation.attempt, ctx.random(), backoff);
    await ctx.outbox.defer(mutation.id, ctx.clock.now() + delay, error);
    result.deferred += 1;
  };

  let push: PushResult;
  try {
    push = await ctx.transport.push({ deviceId: ctx.deviceId, mutations: batch });
  } catch (error) {
    const message = error instanceof Error ? error.message : "transport error";
    ctx.log.error("sync.push.error", { message, batch: batch.length });
    for (const mutation of batch) await deferOne(mutation, message);
    result.stoppedReason = "retryable";
    ctx.log.info("sync.drain.end", { ...result });
    return result;
  }

  const byId = new Map(push.results.map((entry) => [entry.id, entry]));
  for (const id of byId.keys()) {
    if (!batch.some((m) => m.id === id)) {
      // The server answered about something we did not send. Ignore it: inventing a
      // row from an unknown id is how a client corrupts its own queue.
      ctx.log.warn("sync.push.unknown-result", { id });
    }
  }

  let stopped = false;
  for (const mutation of batch) {
    const entry = byId.get(mutation.id);
    if (!entry) {
      // Silent drops are worse than retries: defer so it comes back.
      await deferOne(mutation, "no result returned for this mutation");
      continue;
    }

    switch (entry.status) {
      case "applied":
      case "duplicate":
        // A duplicate is a replay of an already-applied mutation: same end state.
        await ctx.outbox.markApplied(mutation.id);
        result.applied += 1;
        break;

      case "rejected":
        await ctx.outbox.quarantine(mutation.id, "rejected by server");
        result.quarantined += 1;
        stopped = true;
        break;

      case "conflict": {
        const policy = policyFor(groupForEntity(mutation.entity));
        const resolution =
          policy === "client-wins"
            ? "retry"
            : policy === "manual"
              ? "human"
              : "accept-remote";

        result.conflicts += 1;
        if (resolution === "human") {
          await ctx.outbox.quarantine(mutation.id, "conflict requires a human decision");
          result.quarantined += 1;
          stopped = true;
        } else if (resolution === "retry") {
          await deferOne(mutation, "conflict: client wins, retrying");
        } else {
          // Server-wins or field-merge: the server's row is now the truth for the
          // fields it owns; the next pull brings the merged result down.
          await ctx.outbox.markApplied(mutation.id);
          result.applied += 1;
        }
        ctx.log.warn("sync.conflict", {
          id: mutation.id,
          entity: mutation.entity,
          policy,
          resolution,
        });
        break;
      }
    }

    if (stopped) break;
  }

  if (stopped) {
    result.stoppedReason = "terminal";
  } else {
    result.stoppedReason = batch.length === batchSize ? "batch-limited" : "empty";
  }

  ctx.log.info("sync.drain.end", { ...result });
  return result;
}
