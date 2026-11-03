import type { ZodType } from 'zod';

/**
 * The single error type that crosses the API boundary.
 *
 * `code` is the server's stable machine code (or a client-side code for
 * transport and parsing failures), `field` names the invalid input when the
 * server blamed exactly one, and `requestId` is the value to quote support.
 */

export const CLIENT_ERROR_CODES = {
  network: 'NETWORK_ERROR',
  timeout: 'TIMEOUT',
  aborted: 'ABORTED',
  invalidResponse: 'INVALID_RESPONSE',
} as const;

export interface ApiErrorInit {
  code: string;
  message: string;
  /** HTTP status; 0 for transport, timeout and parsing failures. */
  status?: number;
  /** `details.field` from the error envelope. */
  field?: string;
  requestId?: string;
  /** `Retry-After` in seconds for 429 responses. */
  retryAfterSeconds?: number;
  details?: unknown;
}

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly field: string | undefined;
  readonly requestId: string | undefined;
  readonly retryAfterSeconds: number | undefined;
  readonly details: unknown;

  constructor(init: ApiErrorInit) {
    super(init.message);
    this.name = 'ApiError';
    this.code = init.code;
    this.status = init.status ?? 0;
    this.field = init.field;
    this.requestId = init.requestId;
    this.retryAfterSeconds = init.retryAfterSeconds;
    this.details = init.details;
    // Keep `instanceof` working when the class is transpiled to ES5.
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

export function invalidResponse(message: string): ApiError {
  return new ApiError({
    code: CLIENT_ERROR_CODES.invalidResponse,
    message,
    status: 0,
  });
}

/**
 * Parse a payload at the boundary. A schema mismatch means the client and the
 * server disagree, which is not a user error — it surfaces as an ApiError so the
 * UI can show the retry state instead of rendering `undefined`.
 */
export function parseOrThrow<T>(schema: ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ApiError({
      code: CLIENT_ERROR_CODES.invalidResponse,
      message: 'The server sent a response the app could not read.',
      status: 0,
      details: result.error.issues,
    });
  }
  return result.data;
}

export type ApiErrorContext = 'generic' | 'signIn' | 'signUp' | 'order';

const FIELD_LABELS: Record<string, string> = {
  email: 'Email',
  password: 'Password',
  displayName: 'Display name',
  quantity: 'Quantity',
  limitPrice: 'Limit price',
  symbol: 'Symbol',
  refreshToken: 'Refresh token',
};

function sentence(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return '';
  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

function fallbackMessage(status: number): string {
  if (status === 401) return 'Your session expired. Sign in again.';
  if (status === 403) return "You don't have access to that.";
  if (status === 404) return "We couldn't find that.";
  if (status === 429) return 'Too many requests. Try again shortly.';
  if (status >= 500) return 'The server had a problem. Try again in a moment.';
  return 'Something went wrong. Try again.';
}

/**
 * User-facing copy for an error. The server message is kept where it is already
 * a complete sentence ("must be greater than zero" becomes "Quantity must be
 * greater than zero."), and transport failures get connectivity copy.
 */
export function describeApiError(
  error: unknown,
  context: ApiErrorContext = 'generic',
): string {
  if (!isApiError(error)) return fallbackMessage(0);

  if (error.status === 0) {
    if (error.code === CLIENT_ERROR_CODES.timeout) {
      return 'The request timed out. Check your connection and try again.';
    }
    if (error.code === CLIENT_ERROR_CODES.aborted) return 'The request was cancelled.';
    if (error.code === CLIENT_ERROR_CODES.invalidResponse) {
      return 'The server sent a response the app could not read. Try again.';
    }
    return "Can't reach the server. Check your connection and try again.";
  }

  if (context === 'signIn' && error.status === 401) {
    return 'Email or password is incorrect.';
  }
  if (error.code === 'EMAIL_TAKEN') {
    return 'That email is already registered. Sign in instead.';
  }
  if (error.code === 'IDEMPOTENCY_KEY_REUSED') {
    return 'This order was already sent with different values. Start the order again.';
  }

  const serverMessage = sentence(error.message);
  if (serverMessage.length === 0) return fallbackMessage(error.status);

  if (error.field) {
    const label = FIELD_LABELS[error.field];
    if (label) return `${label} ${error.message.trim().replace(/[.!?]$/, '')}.`;
  }

  return serverMessage;
}

/** The server's correlation id, when it sent one — shown on 5xx for support. */
export function apiRequestId(error: unknown): string | null {
  return isApiError(error) ? (error.requestId ?? null) : null;
}
