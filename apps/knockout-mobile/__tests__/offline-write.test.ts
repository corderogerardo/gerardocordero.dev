import { runDrain } from "@gerardocordero/sync-core";
import type { PushRequest, PushResult } from "@gerardocordero/sync-core";

import { listKnocksSince, countUnsyncedKnocks, recordKnock } from "../src/db/knocks";
import { LATEST_SCHEMA_VERSION, migrate } from "../src/db/migrations";
import { createSqliteOutboxStore } from "../src/db/outbox-store";
import { createTestRunner } from "./support/sqljs-runner";
import type { TestRunner } from "./support/sqljs-runner";

const ORG = "org-1";
const REP = "rep-1";
const PROPERTY = "property-1";

const ids = (...values: string[]) => {
  let index = 0;
  return () => values[index++] ?? `extra-${index}`;
};

let runner: TestRunner;

beforeEach(async () => {
  runner = await createTestRunner();
  await migrate(runner);
});

afterEach(() => {
  runner.close();
});

describe("migrations", () => {
  it("creates the device schema and records the version", async () => {
    const version = await runner.first<{ user_version: number }>("PRAGMA user_version");
    expect(version?.user_version).toBe(LATEST_SCHEMA_VERSION);

    const tables = await runner.all<{ name: string }>(
      "select name from sqlite_master where type = 'table' order by name",
    );
    expect(tables.map((table) => table.name)).toEqual(
      expect.arrayContaining(["knocks", "leads", "outbox", "sync_meta"]),
    );
  });

  it("is idempotent: running it again changes nothing", async () => {
    await migrate(runner);
    const version = await runner.first<{ user_version: number }>("PRAGMA user_version");
    expect(version?.user_version).toBe(LATEST_SCHEMA_VERSION);
  });

  it("enforces the outcome vocabulary in the database, not only in TypeScript", async () => {
    await expect(
      recordKnock(
        runner,
        {
          orgId: ORG,
          repId: REP,
          propertyId: PROPERTY,
          shiftId: null,
          outcome: "maybe" as never,
          occurredAt: new Date("2026-11-03T10:00:00.000Z"),
        },
        { newId: ids("knock-x", "mutation-x") },
      ),
    ).rejects.toThrow();
  });
});

describe("recordKnock", () => {
  it("writes the knock and its outbox mutation together", async () => {
    const result = await recordKnock(
      runner,
      {
        orgId: ORG,
        repId: REP,
        propertyId: PROPERTY,
        shiftId: "shift-1",
        outcome: "conversation",
        note: "wants a quote",
        occurredAt: new Date("2026-11-03T10:00:00.000Z"),
        lat: 30.5,
        lng: -97.68,
      },
      { newId: ids("knock-1", "mutation-1"), now: () => new Date("2026-11-03T10:00:01.000Z") },
    );

    const knock = await runner.first<{ id: string; client_mutation_id: string; outcome: string }>(
      "select id, client_mutation_id, outcome from knocks",
    );
    expect(knock).toEqual({
      id: "knock-1",
      client_mutation_id: "mutation-1",
      outcome: "conversation",
    });
    expect(result).toEqual({ knockId: "knock-1", mutationId: "mutation-1" });

    const outbox = createSqliteOutboxStore(runner);
    const pending = await outbox.listPending(10, Date.parse("2026-11-03T10:00:02.000Z"));
    expect(pending).toHaveLength(1);
    expect(pending[0]).toMatchObject({
      id: "mutation-1",
      entity: "knock",
      entityId: "knock-1",
      op: "create",
      state: "pending",
      attempt: 0,
    });
    expect(pending[0]?.payload).toMatchObject({ outcome: "conversation", note: "wants a quote" });
  });

  it("leaves nothing behind when the row is rejected mid-transaction", async () => {
    // The check constraint rejects the outcome, so the transaction rolls back after
    // the knocks insert would have succeeded — exactly the crash window that must
    // never produce a synced knock without a local one, or the reverse.
    await expect(
      recordKnock(
        runner,
        {
          orgId: ORG,
          repId: REP,
          propertyId: PROPERTY,
          shiftId: null,
          outcome: "bogus" as never,
          occurredAt: new Date("2026-11-03T10:00:00.000Z"),
        },
        { newId: ids("knock-bad", "mutation-bad") },
      ),
    ).rejects.toThrow();

    const knocks = await runner.all("select id from knocks");
    const outbox = await runner.all("select id from outbox");
    expect(knocks).toHaveLength(0);
    expect(outbox).toHaveLength(0);
  });

  it("stores the payload as JSON that round-trips", async () => {
    await recordKnock(
      runner,
      {
        orgId: ORG,
        repId: REP,
        propertyId: PROPERTY,
        shiftId: null,
        outcome: "no_answer",
        occurredAt: new Date("2026-11-03T09:00:00.000Z"),
      },
      { newId: ids("knock-2", "mutation-2") },
    );

    const row = await runner.first<{ payload: string }>("select payload from outbox");
    expect(JSON.parse(row!.payload)).toEqual({
      id: "knock-2",
      orgId: ORG,
      repId: REP,
      propertyId: PROPERTY,
      shiftId: null,
      outcome: "no_answer",
      note: null,
      occurredAt: "2026-11-03T09:00:00.000Z",
      lat: null,
      lng: null,
    });
  });

  it("lists today's knocks newest first and counts what is unsynced", async () => {
    const make = (id: string, hour: number, outcome = "no_answer") =>
      recordKnock(
        runner,
        {
          orgId: ORG,
          repId: REP,
          propertyId: PROPERTY,
          shiftId: null,
          outcome: outcome as never,
          occurredAt: new Date(`2026-11-03T${hour}:00:00.000Z`),
        },
        { newId: ids(id, `mutation-${id}`) },
      );

    await make("knock-a", "09");
    await make("knock-b", "11");
    await make("knock-c", "10");

    const todays = await listKnocksSince(runner, REP, new Date("2026-11-03T00:00:00.000Z"));
    expect(todays.map((knock) => knock.id)).toEqual(["knock-b", "knock-c", "knock-a"]);
    expect(await countUnsyncedKnocks(runner, REP)).toBe(3);

    const outbox = createSqliteOutboxStore(runner);
    await outbox.markApplied("mutation-knock-b");
    expect(await countUnsyncedKnocks(runner, REP)).toBe(2);
  });
});

describe("sqlite outbox store", () => {
  const seed = async () => {
    await recordKnock(
      runner,
      {
        orgId: ORG,
        repId: REP,
        propertyId: PROPERTY,
        shiftId: null,
        outcome: "no_answer",
        occurredAt: new Date("2026-11-03T09:00:00.000Z"),
      },
      { newId: ids("knock-a", "mutation-a"), now: () => new Date("2026-11-03T09:00:01.000Z") },
    );
    await recordKnock(
      runner,
      {
        orgId: ORG,
        repId: REP,
        propertyId: PROPERTY,
        shiftId: null,
        outcome: "set",
        occurredAt: new Date("2026-11-03T09:05:00.000Z"),
      },
      { newId: ids("knock-b", "mutation-b"), now: () => new Date("2026-11-03T09:05:01.000Z") },
    );
    return createSqliteOutboxStore(runner);
  };

  it("returns due mutations in send order and respects the limit", async () => {
    const outbox = await seed();
    const first = await outbox.listPending(1, Date.parse("2026-11-03T12:00:00.000Z"));
    expect(first.map((mutation) => mutation.id)).toEqual(["mutation-a"]);

    const all = await outbox.listPending(10, Date.parse("2026-11-03T12:00:00.000Z"));
    expect(all.map((mutation) => mutation.id)).toEqual(["mutation-a", "mutation-b"]);
  });

  it("holds a deferred mutation until its nextAttemptAt", async () => {
    const outbox = await seed();
    await outbox.defer("mutation-a", Date.parse("2026-11-03T13:00:00.000Z"), "network down");

    const now = Date.parse("2026-11-03T12:00:00.000Z");
    const due = await outbox.listPending(10, now);
    expect(due.map((mutation) => mutation.id)).toEqual(["mutation-b"]);

    const later = await outbox.listPending(10, Date.parse("2026-11-03T13:00:00.000Z"));
    expect(later.map((mutation) => mutation.id)).toEqual(["mutation-a", "mutation-b"]);
  });

  it("increments the attempt counter in SQL, not in the caller", async () => {
    const outbox = await seed();
    await outbox.defer("mutation-a", 1, "first");
    await outbox.defer("mutation-a", 2, "second");

    const row = await runner.first<{ attempt: number; last_error: string }>(
      "select attempt, last_error from outbox where id = ?",
      ["mutation-a"],
    );
    expect(row).toEqual({ attempt: 2, last_error: "second" });
  });

  it("counts only what still has to be sent", async () => {
    const outbox = await seed();
    expect(await outbox.queueDepth()).toBe(2);

    await outbox.markInflight(["mutation-a"]);
    expect(await outbox.queueDepth()).toBe(1);

    await outbox.markApplied("mutation-b");
    expect(await outbox.queueDepth()).toBe(0);
  });

  it("reclaims rows left inflight by a crash", async () => {
    const outbox = await seed();
    await outbox.markInflight(["mutation-a", "mutation-b"]);

    expect(await outbox.resetStaleInflight()).toBe(2);
    expect(await outbox.queueDepth()).toBe(2);
  });

  it("quarantines without blocking the rest of the queue", async () => {
    const outbox = await seed();
    await outbox.quarantine("mutation-a", "rejected by server");

    expect(await outbox.queueDepth()).toBe(1);
    const due = await outbox.listPending(10, Date.parse("2026-11-03T12:00:00.000Z"));
    expect(due.map((mutation) => mutation.id)).toEqual(["mutation-b"]);
  });
});

describe("engine over the real database", () => {
  it("drains the queue, marks rows applied, and survives a retryable failure", async () => {
    const outbox = await seedTwoKnocks();

    let call = 0;
    const sent: PushRequest[] = [];
    const transport = {
      async push(request: PushRequest): Promise<PushResult> {
        sent.push(request);
        call += 1;
        if (call === 1) throw new Error("no signal");
        return {
          results: request.mutations.map((mutation) => ({
            id: mutation.id,
            status: "applied" as const,
            serverVersion: 1,
            conflictSnapshot: null,
          })),
          cursor: 10,
        };
      },
    };

    const ctx = {
      outbox,
      transport,
      clock: { now: () => Date.parse("2026-11-03T12:00:00.000Z") },
      random: () => 0,
      log: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
      deviceId: "device-1",
    };

    const failed = await runDrain(ctx);
    expect(failed.stoppedReason).toBe("retryable");
    expect(failed.deferred).toBe(2);
    expect(await outbox.queueDepth()).toBe(2);

    // The engine deferred with a backoff, so move the clock past it.
    const later = await runDrain({
      ...ctx,
      clock: { now: () => Date.parse("2026-11-03T12:01:00.000Z") },
    });
    expect(later.applied).toBe(2);
    expect(later.stoppedReason).toBe("empty");
    expect(await outbox.queueDepth()).toBe(0);

    const states = await runner.all<{ state: string }>("select state from outbox order by id");
    expect(states.map((row) => row.state)).toEqual(["applied", "applied"]);
    expect(sent).toHaveLength(2);
  });
});

async function seedTwoKnocks() {
  await recordKnock(
    runner,
    {
      orgId: ORG,
      repId: REP,
      propertyId: PROPERTY,
      shiftId: null,
      outcome: "no_answer",
      occurredAt: new Date("2026-11-03T09:00:00.000Z"),
    },
    { newId: ids("knock-a", "mutation-a"), now: () => new Date("2026-11-03T09:00:01.000Z") },
  );
  await recordKnock(
    runner,
    {
      orgId: ORG,
      repId: REP,
      propertyId: PROPERTY,
      shiftId: null,
      outcome: "not_interested",
      occurredAt: new Date("2026-11-03T09:05:00.000Z"),
    },
    { newId: ids("knock-b", "mutation-b"), now: () => new Date("2026-11-03T09:05:01.000Z") },
  );
  return createSqliteOutboxStore(runner);
}
