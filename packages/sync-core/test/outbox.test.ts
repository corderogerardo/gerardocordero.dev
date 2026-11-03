import { describe, expect, it } from "vitest";

import { createMemoryOutbox } from "../src/outbox";
import { mutation } from "./factories";

const iso = (second: number) => new Date(Date.UTC(2026, 0, 1, 12, 0, second)).toISOString();

describe("memory outbox", () => {
  it("orders by createdAt then id, regardless of insert order", () => {
    const late = mutation({ id: "00000000-0000-4000-8000-000000000002", createdAt: iso(20) });
    const early = mutation({ id: "00000000-0000-4000-8000-000000000001", createdAt: iso(10) });
    const tieA = mutation({ id: "00000000-0000-4000-8000-00000000000a", createdAt: iso(15) });
    const tieB = mutation({ id: "00000000-0000-4000-8000-00000000000b", createdAt: iso(15) });

    const outbox = createMemoryOutbox([late, early, tieB, tieA]);

    return outbox.listPending(10, Date.UTC(2026, 0, 1, 13)).then((batch) => {
      expect(batch.map((m) => m.id)).toEqual([early.id, tieA.id, tieB.id, late.id]);
    });
  });

  it("holds a deferred mutation until its nextAttemptAt", async () => {
    const now = Date.UTC(2026, 0, 1, 12, 0, 0);
    const row = mutation();
    const outbox = createMemoryOutbox([row]);
    await outbox.defer(row.id, now + 5_000, "boom");

    expect(await outbox.listPending(10, now)).toHaveLength(0);
    expect(await outbox.listPending(10, now + 5_000)).toHaveLength(1);
    expect(await outbox.queueDepth()).toBe(1);
  });

  it("increments the attempt counter on every defer", async () => {
    const row = mutation();
    const outbox = createMemoryOutbox([row]);
    await outbox.defer(row.id, 1, "first");
    await outbox.defer(row.id, 2, "second");
    expect(outbox.all()[0]?.attempt).toBe(2);
    expect(outbox.all()[0]?.lastError).toBe("second");
  });

  it("removes applied and quarantined rows from the queue depth", async () => {
    const applied = mutation();
    const quarantined = mutation();
    const outbox = createMemoryOutbox([applied, quarantined]);

    await outbox.markApplied(applied.id);
    await outbox.quarantine(quarantined.id, "rejected");

    expect(await outbox.queueDepth()).toBe(0);
    expect(await outbox.listPending(10, Number.MAX_SAFE_INTEGER)).toHaveLength(0);
  });

  it("reclaims rows left inflight by a crash", async () => {
    const a = mutation();
    const b = mutation();
    const outbox = createMemoryOutbox([a, b]);
    await outbox.markInflight([a.id, b.id]);

    expect(await outbox.resetStaleInflight()).toBe(2);
    expect(await outbox.queueDepth()).toBe(2);
  });

  it("hands out copies, so a caller cannot mutate the queue by accident", async () => {
    const row = mutation();
    const outbox = createMemoryOutbox([row]);
    const [batchRow] = await outbox.listPending(1, Number.MAX_SAFE_INTEGER);
    batchRow!.state = "applied";
    expect(outbox.all()[0]?.state).toBe("pending");
  });
});
