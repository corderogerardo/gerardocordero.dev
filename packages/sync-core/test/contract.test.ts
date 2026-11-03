import { describe, expect, it } from "vitest";

import { MutationSchema, PushResultSchema, parsePushResult } from "../src/contract";
import { mutation } from "./factories";

describe("MutationSchema", () => {
  it("accepts a well-formed mutation", () => {
    expect(MutationSchema.safeParse(mutation()).success).toBe(true);
  });

  it("rejects an unknown outcome inside the payload envelope", () => {
    const broken = { ...mutation(), state: "done" };
    expect(MutationSchema.safeParse(broken).success).toBe(false);
  });

  it("rejects a non-uuid id, because the id is the idempotency key", () => {
    const broken = { ...mutation(), id: "mutation-1" };
    expect(MutationSchema.safeParse(broken).success).toBe(false);
  });

  it("rejects a negative attempt", () => {
    expect(MutationSchema.safeParse({ ...mutation(), attempt: -1 }).success).toBe(false);
  });
});

describe("PushResultSchema", () => {
  it("rejects a negative cursor", () => {
    expect(PushResultSchema.safeParse({ results: [], cursor: -1 }).success).toBe(false);
  });

  it("parses a real-shaped response and keeps the status union narrow", () => {
    const parsed = parsePushResult({
      results: [{ id: "a", status: "conflict", serverVersion: 3, conflictSnapshot: { x: 1 } }],
      cursor: 7,
    });
    expect(parsed.results[0]?.status).toBe("conflict");
    expect(parsed.cursor).toBe(7);
  });
});
