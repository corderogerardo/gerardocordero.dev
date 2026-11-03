/**
 * Conflict policies, one per field group (see docs/adr/0007).
 *
 * The table is deliberately small and boring. Every entry answers "who is right
 * when two devices disagree?", which is a product decision, not a technical one.
 */

export const FIELD_GROUPS = [
  "property",
  "territory",
  "dnc",
  "knock",
  "lead-contact",
  "lead-owner",
  "lead-stage",
  "score",
  "crm-link",
] as const;
export type FieldGroup = (typeof FIELD_GROUPS)[number];

export const CONFLICT_POLICIES = [
  "server-wins",
  "client-wins",
  "field-merge",
  "manual",
] as const;
export type ConflictPolicy = (typeof CONFLICT_POLICIES)[number];

/**
 * `score` and `crm-link` are server-owned: the policy is `server-wins` for display,
 * and the actual enforcement is in SQL (no client grant exists), because a policy
 * the client can choose is not a policy.
 */
export const POLICIES: Record<FieldGroup, ConflictPolicy> = {
  property: "server-wins",
  territory: "server-wins",
  dnc: "server-wins",
  knock: "client-wins",
  "lead-contact": "field-merge",
  "lead-owner": "manual",
  "lead-stage": "manual",
  score: "server-wins",
  "crm-link": "server-wins",
};

export function policyFor(group: FieldGroup): ConflictPolicy {
  return POLICIES[group];
}

/** A field value plus the server timestamp of its last write. */
export type VersionedValue = { value: unknown; updatedAt: string };

export type ConflictInput = {
  policy: ConflictPolicy;
  local: Record<string, VersionedValue>;
  remote: Record<string, VersionedValue>;
  base?: Record<string, VersionedValue>;
  /** Restrict the merge to these keys. Defaults to every key on either side. */
  fields?: readonly string[];
};

export type Resolution =
  | { kind: "use-remote" }
  | { kind: "use-local" }
  | { kind: "merged"; value: Record<string, unknown> }
  | { kind: "needs-human" };

const sameValue = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

export function resolveConflict(input: ConflictInput): Resolution {
  switch (input.policy) {
    case "server-wins":
      return { kind: "use-remote" };
    case "client-wins":
      return { kind: "use-local" };
    case "manual":
      return { kind: "needs-human" };
    case "field-merge": {
      const base = input.base ?? {};
      const keys =
        input.fields ??
        [...new Set([...Object.keys(input.local), ...Object.keys(input.remote), ...Object.keys(base)])];

      const merged: Record<string, unknown> = {};
      for (const key of keys) {
        const local = input.local[key];
        const remote = input.remote[key];
        const baseEntry = base[key];
        const baseValue = baseEntry?.value;

        const localChanged = local !== undefined && !sameValue(local.value, baseValue);
        const remoteChanged = remote !== undefined && !sameValue(remote.value, baseValue);

        if (localChanged && !remoteChanged) {
          merged[key] = local.value;
        } else if (!localChanged && remoteChanged) {
          merged[key] = remote.value;
        } else if (localChanged && remoteChanged) {
          // Both sides moved: later server-stamped write wins, ties go to the server
          // because the server has already accepted that write.
          const localAt = local?.updatedAt ?? "";
          const remoteAt = remote?.updatedAt ?? "";
          const winner = remoteAt >= localAt ? remote : local;
          merged[key] = winner.value;
        } else {
          merged[key] = baseValue ?? local?.value ?? remote?.value;
        }
      }
      return { kind: "merged", value: merged };
    }
  }
}
