/**
 * Retry timing, as a pure function.
 *
 * Two properties matter and both are asserted in `backoff.test.ts`:
 *   * growth, so a broken endpoint is not hammered;
 *   * jitter, so a hundred phones leaving a tunnel do not retry in lockstep and
 *     knock the API over at the same millisecond.
 *
 * `random` is injected rather than `Math.random()` so a test can pin the curve.
 */

export type BackoffOptions = {
  baseMs: number;
  capMs: number;
  maxAttempts: number;
};

export const DEFAULT_BACKOFF: BackoffOptions = {
  baseMs: 1_000,
  capMs: 60_000,
  maxAttempts: 8,
};

/**
 * Delay before the next attempt. Attempt 0 waits between half and all of `baseMs`;
 * each further attempt doubles the ceiling, never past `capMs`.
 */
export function nextDelay(
  attempt: number,
  random: number,
  options: BackoffOptions = DEFAULT_BACKOFF,
): number {
  const safeAttempt = Number.isFinite(attempt) ? Math.max(0, Math.floor(attempt)) : 0;
  const ceiling = Math.min(options.capMs, options.baseMs * 2 ** safeAttempt);
  const unit = Number.isFinite(random) ? Math.min(0.999999, Math.max(0, random)) : 0;
  return Math.round(ceiling * (0.5 + unit / 2));
}

/** True once the mutation has burned its attempts and needs a human, not a retry. */
export function shouldQuarantine(
  attempt: number,
  options: BackoffOptions = DEFAULT_BACKOFF,
): boolean {
  return attempt >= options.maxAttempts;
}
