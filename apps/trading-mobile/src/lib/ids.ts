import { randomUUID } from 'expo-crypto';

/**
 * Idempotency keys are per **intent**, not per attempt: the caller keeps the key
 * while retrying the same submission and drops it once the intent succeeds.
 */
export function newIdempotencyKey(): string {
  return randomUUID();
}
