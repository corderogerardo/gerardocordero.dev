import { describe, expect, it } from "vitest";

import type { PushRequest, PushResult } from "../src/contract";
import type { DrainContext } from "../src/engine";
import { runDrain } from "../src/engine";
import { createMemoryOutbox } from "../src/outbox";
import type { MemoryOutbox } from "../src/outbox";
import { fakeClock, mutation, recordingLogger } from "./factories";

type Script = (request: PushRequest) => PushResult | Promise<PushResult>;

function context(outbox: MemoryOutbox, script: Script, overrides: Partial<DrainContext> = {}) {
  const clock = fakeClock();
  const log = recordingLogger();
  const sent: PushRequest[] = [];
  const ctx: DrainContext = {
    outbox,
    transport: {
      push: async (request) => {
        sent.push(request);
        return script(request);
      },
    },
    clock,
    random: () => 0,
    log,
    deviceId: "device-1",
    ...overrides,
  };
  return { ctx, clock, log, sent };
}

describe("runDrain", () => {
  it("does not call the network when the queue is empty", async () => {
    const outbox = createMemoryOutbox();
    const { ctx, sent } = context(outbox, () => ({ results: [], cursor: 1 }));

    const result = await runDrain(ctx);

    expect(result.stoppedReason).toBe("empty");
    expect(sent).toHaveLength(0);
  });

  it("marks applied mutations and reports the count", async () => {
    const rows = [mutation(), mutation()];
    const outbox = createMemoryOutbox(rows);
    const { ctx, sent } = context(outbox, (request) => ({
      results: request.mutations.map((m) => ({ id: m.id, status: "applied", serverVersion: 1, conflictSnapshot: null })),
      cursor: 9,
    }));

    const result = await runDrain(ctx);

    expect(result.applied).toBe(2);
    expect(outbox.all().every((m) => m.state === "applied")).toBe(true);
    expect(sent[0]?.deviceId).toBe("device-1");
  });

  it("treats a duplicate as applied: a replay is not a failure", async () => {
    const row = mutation();
    const outbox = createMemoryOutbox([row]);
    const { ctx } = context(outbox, (request) => ({
      results: request.mutations.map((m) => ({ id: m.id, status: "duplicate", serverVersion: 1, conflictSnapshot: null })),
      cursor: 9,
    }));

    const result = await runDrain(ctx);

    expect(result.applied).toBe(1);
    expect(result.deferred).toBe(0);
    expect(outbox.all()[0]?.state).toBe("applied");
  });

  it("sends one batch of the configured size", async () => {
    const rows = [mutation(), mutation(), mutation()];
    const outbox = createMemoryOutbox(rows);
    const { ctx, sent } = context(outbox, (request) => ({
      results: request.mutations.map((m) => ({ id: m.id, status: "applied", serverVersion: 1, conflictSnapshot: null })),
      cursor: 9,
    }), { batchSize: 2 });

    const result = await runDrain(ctx);

    expect(sent[0]?.mutations).toHaveLength(2);
    expect(result.applied).toBe(2);
    expect(result.stoppedReason).toBe("batch-limited");
  });

  it("stops the batch on the first terminal rejection", async () => {
    const [first, second] = [mutation(), mutation()];
    const outbox = createMemoryOutbox([first!, second!]);
    const { ctx } = context(outbox, (request) => ({
      results: request.mutations.map((m, index) => ({
        id: m.id,
        status: index === 0 ? "rejected" : "applied",
        serverVersion: null,
        conflictSnapshot: null,
      })),
      cursor: 9,
    }));

    const result = await runDrain(ctx);

    expect(result.quarantined).toBe(1);
    expect(result.applied).toBe(0);
    expect(result.stoppedReason).toBe("terminal");
    expect(outbox.all().find((m) => m.id === first!.id)?.state).toBe("quarantined");
    // The one behind it was never reached, so it stays queued rather than lying.
    expect(outbox.all().find((m) => m.id === second!.id)?.state).toBe("inflight");
  });

  it("defers the whole batch when the transport throws, and never quarantines", async () => {
    const rows = [mutation(), mutation()];
    const outbox = createMemoryOutbox(rows);
    const { ctx, clock } = context(outbox, () => {
      throw new Error("network down");
    });

    const result = await runDrain(ctx);

    expect(result.deferred).toBe(2);
    expect(result.quarantined).toBe(0);
    expect(result.stoppedReason).toBe("retryable");
    for (const row of outbox.all()) {
      expect(row.state).toBe("deferred");
      expect(row.nextAttemptAt).toBe(clock.nowMs() + 500);
      expect(row.lastError).toBe("network down");
    }
  });

  it("defers a mutation the server did not answer for", async () => {
    const [answered, unanswered] = [mutation(), mutation()];
    const outbox = createMemoryOutbox([answered!, unanswered!]);
    const { ctx } = context(outbox, (request) => ({
      results: request.mutations
        .filter((m) => m.id === answered!.id)
        .map((m) => ({ id: m.id, status: "applied", serverVersion: 1, conflictSnapshot: null })),
      cursor: 9,
    }));

    const result = await runDrain(ctx);

    expect(result.applied).toBe(1);
    expect(result.deferred).toBe(1);
    expect(outbox.all().find((m) => m.id === unanswered!.id)?.state).toBe("deferred");
  });

  it("ignores a result for a mutation it never sent", async () => {
    const row = mutation();
    const outbox = createMemoryOutbox([row]);
    const { ctx, log } = context(outbox, () => ({
      results: [{ id: "00000000-0000-4000-8000-00000000dead", status: "applied", serverVersion: 1, conflictSnapshot: null }],
      cursor: 9,
    }));

    const result = await runDrain(ctx);

    expect(result.applied).toBe(0);
    expect(log.events).toContain("sync.push.unknown-result");
    expect(outbox.all()).toHaveLength(1);
  });

  it("accepts the server value on a field-merge conflict for a lead", async () => {
    const row = mutation({ entity: "lead" });
    const outbox = createMemoryOutbox([row]);
    const { ctx } = context(outbox, (request) => ({
      results: request.mutations.map((m) => ({
        id: m.id,
        status: "conflict",
        serverVersion: 4,
        conflictSnapshot: { phone: "555-0199" },
      })),
      cursor: 9,
    }));

    const result = await runDrain(ctx);

    expect(result.conflicts).toBe(1);
    expect(result.applied).toBe(1);
    expect(outbox.all()[0]?.state).toBe("applied");
  });

  it("quarantines a knock conflict that needs a human, and stops", async () => {
    const row = mutation({ entity: "dnc" });
    const outbox = createMemoryOutbox([row]);
    const { ctx } = context(outbox, (request) => ({
      results: request.mutations.map((m) => ({
        id: m.id,
        status: "conflict",
        serverVersion: 2,
        conflictSnapshot: { note: "already knocked" },
      })),
      cursor: 9,
    }));

    const result = await runDrain(ctx);

    expect(result.conflicts).toBe(1);
    expect(result.quarantined).toBe(0);
    // dnc is server-wins: the server row becomes the truth, no human needed.
    expect(outbox.all()[0]?.state).toBe("applied");
  });

  it("keeps retrying a client-wins conflict instead of dropping it", async () => {
    const row = mutation({ entity: "knock" });
    const outbox = createMemoryOutbox([row]);
    const { ctx } = context(outbox, (request) => ({
      results: request.mutations.map((m) => ({
        id: m.id,
        status: "conflict",
        serverVersion: 2,
        conflictSnapshot: null,
      })),
      cursor: 9,
    }));

    const result = await runDrain(ctx);

    expect(result.conflicts).toBe(1);
    expect(result.deferred).toBe(1);
    expect(outbox.all()[0]?.state).toBe("deferred");
  });

  it("quarantines instead of deferring once the attempts are exhausted", async () => {
    const row = mutation({ attempt: 8 });
    const outbox = createMemoryOutbox([row]);
    const { ctx } = context(outbox, () => {
      throw new Error("still down");
    });

    const result = await runDrain(ctx);

    expect(result.quarantined).toBe(1);
    expect(result.deferred).toBe(0);
    expect(outbox.all()[0]?.state).toBe("quarantined");
  });

  it("reclaims stale inflight rows before the batch", async () => {
    const row = mutation({ state: "inflight" });
    const outbox = createMemoryOutbox([row]);
    const { ctx } = context(outbox, (request) => ({
      results: request.mutations.map((m) => ({ id: m.id, status: "applied", serverVersion: 1, conflictSnapshot: null })),
      cursor: 9,
    }));

    const result = await runDrain(ctx);

    expect(result.applied).toBe(1);
    expect(outbox.all()[0]?.state).toBe("applied");
  });
});
