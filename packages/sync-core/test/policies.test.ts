import { describe, expect, it } from "vitest";

import { POLICIES, policyFor, resolveConflict } from "../src/policies";

const at = (iso: string) => ({
  value: iso,
  updatedAt: `2026-01-01T00:00:0${iso}.000Z`,
});

describe("POLICIES", () => {
  it("covers every field group, so a new group cannot silently default to server-wins", () => {
    for (const group of Object.keys(POLICIES)) {
      expect(policyFor(group as keyof typeof POLICIES)).toBeDefined();
    }
  });

  it("keeps DNC server-owned: a stale client must never resurrect a knocked door", () => {
    expect(policyFor("dnc")).toBe("server-wins");
  });

  it("keeps the rep's own observation: only they were at the door", () => {
    expect(policyFor("knock")).toBe("client-wins");
  });

  it("refuses to guess a lead owner", () => {
    expect(policyFor("lead-owner")).toBe("manual");
  });
});

describe("resolveConflict", () => {
  it("server-wins ignores the local value entirely", () => {
    expect(
      resolveConflict({ policy: "server-wins", local: { a: at("1") }, remote: { a: at("2") } }),
    ).toEqual({ kind: "use-remote" });
  });

  it("client-wins keeps the local value", () => {
    expect(
      resolveConflict({ policy: "client-wins", local: { a: at("1") }, remote: { a: at("2") } }),
    ).toEqual({ kind: "use-local" });
  });

  it("manual escalates instead of picking a side", () => {
    expect(resolveConflict({ policy: "manual", local: {}, remote: {} })).toEqual({
      kind: "needs-human",
    });
  });

  it("field-merge takes the side that changed, when only one did", () => {
    const resolution = resolveConflict({
      policy: "field-merge",
      base: { phone: { value: "555", updatedAt: "2026-01-01T00:00:00.000Z" } },
      local: { phone: { value: "555-0100", updatedAt: "2026-01-01T00:00:05.000Z" } },
      remote: { phone: { value: "555", updatedAt: "2026-01-01T00:00:00.000Z" } },
    });
    expect(resolution).toEqual({ kind: "merged", value: { phone: "555-0100" } });
  });

  it("field-merge resolves both-changed fields by the later server stamp", () => {
    const resolution = resolveConflict({
      policy: "field-merge",
      local: {
        phone: { value: "local", updatedAt: "2026-01-01T00:00:09.000Z" },
        email: { value: "local@x", updatedAt: "2026-01-01T00:00:01.000Z" },
      },
      remote: {
        phone: { value: "remote", updatedAt: "2026-01-01T00:00:02.000Z" },
        email: { value: "remote@x", updatedAt: "2026-01-01T00:00:08.000Z" },
      },
    });
    expect(resolution).toEqual({
      kind: "merged",
      value: { phone: "local", email: "remote@x" },
    });
  });

  it("field-merge gives a tie to the server", () => {
    const same = "2026-01-01T00:00:05.000Z";
    const resolution = resolveConflict({
      policy: "field-merge",
      local: { name: { value: "local", updatedAt: same } },
      remote: { name: { value: "remote", updatedAt: same } },
    });
    expect(resolution).toEqual({ kind: "merged", value: { name: "remote" } });
  });

  it("field-merge keeps the base value when neither side moved", () => {
    const resolution = resolveConflict({
      policy: "field-merge",
      base: { name: { value: "unchanged", updatedAt: "2026-01-01T00:00:00.000Z" } },
      local: { name: { value: "unchanged", updatedAt: "2026-01-01T00:00:00.000Z" } },
      remote: { name: { value: "unchanged", updatedAt: "2026-01-01T00:00:00.000Z" } },
    });
    expect(resolution).toEqual({ kind: "merged", value: { name: "unchanged" } });
  });

  it("field-merge honours a restricted field list", () => {
    const resolution = resolveConflict({
      policy: "field-merge",
      fields: ["phone"],
      local: {
        phone: { value: "555-0100", updatedAt: "2026-01-01T00:00:05.000Z" },
        email: { value: "local@x", updatedAt: "2026-01-01T00:00:05.000Z" },
      },
      remote: { phone: { value: "555", updatedAt: "2026-01-01T00:00:00.000Z" } },
    });
    expect(resolution).toEqual({ kind: "merged", value: { phone: "555-0100" } });
  });
});
