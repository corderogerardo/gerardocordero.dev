import { z } from "zod";

/**
 * The wire contract between the device and `sync-push`.
 *
 * Types are inferred from the schemas, never declared twice: a schema and an
 * interface that drift apart is the exact bug this file exists to prevent.
 */

export const OUTCOMES = [
  "no_answer",
  "not_interested",
  "conversation",
  "dnc",
  "set",
] as const;
export type Outcome = (typeof OUTCOMES)[number];

export const MUTATION_ENTITIES = ["knock", "lead", "dnc"] as const;
export type MutationEntity = (typeof MUTATION_ENTITIES)[number];

export const MUTATION_OPS = ["create", "update"] as const;
export type MutationOp = (typeof MUTATION_OPS)[number];

export const MUTATION_STATES = [
  "pending",
  "inflight",
  "applied",
  "deferred",
  "quarantined",
] as const;
export type MutationState = (typeof MUTATION_STATES)[number];

/**
 * One intended server change. `id` is the idempotency key: it is generated once,
 * when the user taps, and never regenerated — not on retry, not after a restart.
 */
export const MutationSchema = z.object({
  id: z.uuid(),
  entity: z.enum(MUTATION_ENTITIES),
  entityId: z.uuid(),
  op: z.enum(MUTATION_OPS),
  payload: z.record(z.string(), z.unknown()),
  /** Device clock. Used only for ordering inside this device's queue. */
  createdAt: z.iso.datetime(),
  attempt: z.number().int().min(0),
  state: z.enum(MUTATION_STATES),
  /** Epoch milliseconds. `null` means "eligible now". */
  nextAttemptAt: z.number().int().nullable(),
  lastError: z.string().nullable(),
});
export type Mutation = z.infer<typeof MutationSchema>;

export const PUSH_STATUSES = ["applied", "duplicate", "conflict", "rejected"] as const;
export type PushStatus = (typeof PUSH_STATUSES)[number];

export const PushRequestSchema = z.object({
  deviceId: z.string().min(1),
  mutations: z.array(MutationSchema).min(1),
});
export type PushRequest = z.infer<typeof PushRequestSchema>;

export const PushResultEntrySchema = z.object({
  id: z.string(),
  status: z.enum(PUSH_STATUSES),
  serverVersion: z.number().int().nullable(),
  /** The server's row when it rejected the write; the client shows this on conflict. */
  conflictSnapshot: z.record(z.string(), z.unknown()).nullable(),
});
export type PushResultEntry = z.infer<typeof PushResultEntrySchema>;

export const PushResultSchema = z.object({
  results: z.array(PushResultEntrySchema),
  /** Global watermark; the next pull asks for everything after it. */
  cursor: z.number().int().min(0),
});
export type PushResult = z.infer<typeof PushResultSchema>;

export function parsePushResult(input: unknown): PushResult {
  return PushResultSchema.parse(input);
}
