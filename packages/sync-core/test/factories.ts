import type { Mutation, MutationEntity, PushResult, PushResultEntry } from "../src/contract";
import type { Clock, Logger } from "../src/engine";

let seq = 0;

/** Deterministic, readable UUIDs so a failing assertion shows which row it means. */
const uuid = (n: number): string => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

export function mutation(overrides: Partial<Mutation> = {}): Mutation {
  seq += 1;
  return {
    id: uuid(seq),
    entity: "knock" as MutationEntity,
    entityId: uuid(900 + seq),
    op: "create",
    payload: { outcome: "no_answer" },
    createdAt: new Date(Date.UTC(2026, 0, 1, 12, 0, seq)).toISOString(),
    attempt: 0,
    state: "pending",
    nextAttemptAt: null,
    lastError: null,
    ...overrides,
  };
}

export function entry(overrides: Partial<PushResultEntry> = {}): PushResultEntry {
  return {
    id: uuid(seq),
    status: "applied",
    serverVersion: 1,
    conflictSnapshot: null,
    ...overrides,
  };
}

export function result(overrides: Partial<PushResult> = {}): PushResult {
  return { results: [], cursor: 42, ...overrides };
}

export function fakeClock(startMs = Date.UTC(2026, 0, 1, 12, 0, 0)): Clock & {
  advance(ms: number): void;
  nowMs(): number;
} {
  let current = startMs;
  return {
    now: () => current,
    advance: (ms) => {
      current += ms;
    },
    nowMs: () => current,
  };
}

export function recordingLogger(): Logger & { events: string[] } {
  const events: string[] = [];
  return {
    events,
    info: (event) => {
      events.push(event);
    },
    warn: (event) => {
      events.push(event);
    },
    error: (event) => {
      events.push(event);
    },
  };
}
