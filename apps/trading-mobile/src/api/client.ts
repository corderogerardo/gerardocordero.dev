import { env } from '@/config';

import { ApiError, CLIENT_ERROR_CODES, invalidResponse, isApiError } from './errors';
import { errorEnvelopeSchema } from './schemas';

/**
 * HTTP client for the v1 API.
 *
 * Responsibilities, in order: attach the bearer token, correlate with
 * `x-request-id`, bound every request with a timeout, and turn the error
 * envelope into an `ApiError`. On a 401 it refreshes **once**; concurrent
 * failures share the same refresh promise, and each request replays at most
 * once. A failed refresh clears the session.
 */

export interface ApiResponseLike {
  ok: boolean;
  status: number;
  headers: { get(name: string): string | null };
  text(): Promise<string>;
}

export type FetchLike = (url: string, init: RequestInit) => Promise<ApiResponseLike>;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  /** Send the bearer token and allow one refresh-and-retry. Defaults to true. */
  auth?: boolean;
  idempotencyKey?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export interface ApiClientAuthHooks {
  getAccessToken?: () => string | null;
  /**
   * Must return the new access token. Throws `ApiError` when the session cannot
   * be renewed; a transport failure (status 0) keeps the session, a rejection
   * (401) ends it.
   */
  refreshAccessToken?: () => Promise<string>;
  onRefreshFailed?: () => void;
}

export interface ApiClientOptions extends ApiClientAuthHooks {
  baseUrl: string;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
  requestId?: () => string;
}

const DEFAULT_TIMEOUT_MS = 15_000;

const STATUS_CODES: Record<number, { code: string; message: string }> = {
  400: { code: 'BAD_REQUEST', message: 'The request was rejected.' },
  401: { code: 'UNAUTHORIZED', message: 'Your session expired. Sign in again.' },
  403: { code: 'FORBIDDEN', message: "You don't have access to that." },
  404: { code: 'NOT_FOUND', message: "We couldn't find that." },
  409: { code: 'CONFLICT', message: 'That action conflicts with the current state.' },
  422: { code: 'VALIDATION_ERROR', message: 'Check the values and try again.' },
  429: { code: 'RATE_LIMITED', message: 'Too many requests. Try again shortly.' },
  500: { code: 'INTERNAL_ERROR', message: 'The server had a problem. Try again in a moment.' },
};

function statusFallback(status: number): { code: string; message: string } {
  const known = STATUS_CODES[status];
  if (known) return known;
  if (status >= 500) {
    return { code: 'INTERNAL_ERROR', message: 'The server had a problem. Try again in a moment.' };
  }
  return { code: 'HTTP_ERROR', message: 'Something went wrong. Try again.' };
}

function parseRetryAfter(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const seconds = Number.parseInt(raw, 10);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : undefined;
}

function isAbortError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('name' in error)) return false;
  return (error as { name?: unknown }).name === 'AbortError';
}

/** Correlation id sent on every request. Not a secret; a UUID is not required. */
function defaultRequestId(): string {
  const random = Math.random().toString(16).slice(2, 10).padEnd(8, '0');
  return `${Date.now().toString(16)}-${random}`;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: FetchLike;
  private readonly timeoutMs: number;
  private readonly requestId: () => string;

  private getAccessTokenHook: (() => string | null) | undefined;
  private refreshAccessTokenHook: (() => Promise<string>) | undefined;
  private onRefreshFailedHook: (() => void) | undefined;

  private refreshInFlight: Promise<string> | null = null;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.fetchImpl = options.fetchImpl ?? ((url, init) => fetch(url, init));
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.requestId = options.requestId ?? defaultRequestId;
    this.getAccessTokenHook = options.getAccessToken;
    this.refreshAccessTokenHook = options.refreshAccessToken;
    this.onRefreshFailedHook = options.onRefreshFailed;
  }

  setAuthHooks(hooks: ApiClientAuthHooks): void {
    if (hooks.getAccessToken) this.getAccessTokenHook = hooks.getAccessToken;
    if (hooks.refreshAccessToken) this.refreshAccessTokenHook = hooks.refreshAccessToken;
    if (hooks.onRefreshFailed) this.onRefreshFailedHook = hooks.onRefreshFailed;
  }

  /** Authenticated request: refreshes once and replays once on a 401. */
  request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.send<T>(path, { ...options, auth: options.auth ?? true });
  }

  /** No token and no refresh — `/v1/auth/login`, `/register`, `/refresh`. */
  requestPublic<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.send<T>(path, { ...options, auth: false });
  }

  private async send<T>(path: string, options: RequestOptions): Promise<T> {
    const authenticated = options.auth !== false;
    const usedToken = authenticated ? (this.getAccessTokenHook?.() ?? null) : null;
    const response = await this.dispatch(path, options, usedToken);

    if (response.status !== 401 || !authenticated) {
      return this.read<T>(response);
    }

    let refreshed: string;
    try {
      refreshed = await this.refresh(usedToken);
    } catch (error) {
      // A transport failure says nothing about the token's validity: keep the
      // session so an offline moment does not force a re-login.
      if (isApiError(error) && error.status === 0) throw error;

      this.onRefreshFailedHook?.();
      // Surface the original 401: the session is gone, the caller signs out.
      return this.read<T>(response);
    }

    const retried = await this.dispatch(path, options, refreshed);
    return this.read<T>(retried);
  }

  private dispatch(
    path: string,
    options: RequestOptions,
    token: string | null,
  ): Promise<ApiResponseLike> {
    const headers: Record<string, string> = {
      accept: 'application/json',
      'x-request-id': this.requestId(),
      ...options.headers,
    };

    if (options.body !== undefined) headers['content-type'] = 'application/json';
    if (options.idempotencyKey) headers['idempotency-key'] = options.idempotencyKey;
    if (token) headers.authorization = `Bearer ${token}`;

    return this.fetchWithTimeout(
      `${this.baseUrl}${path}`,
      {
        method: options.method ?? 'GET',
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
      },
      options.timeoutMs,
      options.signal,
    );
  }

  private async fetchWithTimeout(
    url: string,
    init: RequestInit,
    timeoutMs: number | undefined,
    externalSignal: AbortSignal | undefined,
  ): Promise<ApiResponseLike> {
    const controller = new AbortController();
    let timedOut = false;

    const abortFromCaller = () => controller.abort();
    externalSignal?.addEventListener('abort', abortFromCaller);

    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs ?? this.timeoutMs);

    try {
      return await this.fetchImpl(url, { ...init, signal: controller.signal });
    } catch (error) {
      if (timedOut) {
        throw new ApiError({
          code: CLIENT_ERROR_CODES.timeout,
          message: 'The request timed out. Try again.',
          status: 0,
        });
      }
      if (isAbortError(error) || externalSignal?.aborted) {
        throw new ApiError({
          code: CLIENT_ERROR_CODES.aborted,
          message: 'The request was cancelled.',
          status: 0,
        });
      }
      throw new ApiError({
        code: CLIENT_ERROR_CODES.network,
        message: "Can't reach the server. Check your connection and try again.",
        status: 0,
      });
    } finally {
      clearTimeout(timer);
      externalSignal?.removeEventListener('abort', abortFromCaller);
    }
  }

  private async refresh(usedToken: string | null): Promise<string> {
    // Another request already rotated the token while this one was in flight.
    const current = this.getAccessTokenHook?.() ?? null;
    if (current && current !== usedToken) return current;

    if (this.refreshInFlight) return this.refreshInFlight;

    const hook = this.refreshAccessTokenHook;
    if (!hook) {
      throw new ApiError({
        code: 'UNAUTHORIZED',
        message: 'Your session expired. Sign in again.',
        status: 401,
      });
    }

    const pending = hook().finally(() => {
      this.refreshInFlight = null;
    });
    this.refreshInFlight = pending;
    return pending;
  }

  private async read<T>(response: ApiResponseLike): Promise<T> {
    const requestId = response.headers.get('x-request-id') ?? undefined;
    const retryAfterSeconds = parseRetryAfter(response.headers.get('retry-after'));
    const text = response.status === 204 ? '' : await response.text();

    if (!response.ok) {
      throw this.toApiError(response.status, text, requestId, retryAfterSeconds);
    }

    if (text.length === 0) return undefined as T;

    try {
      return JSON.parse(text) as T;
    } catch {
      throw invalidResponse('The server sent a response the app could not read.');
    }
  }

  private toApiError(
    status: number,
    text: string,
    requestId: string | undefined,
    retryAfterSeconds: number | undefined,
  ): ApiError {
    const envelope = this.readEnvelope(text);
    const fallback = statusFallback(status);

    return new ApiError({
      code: envelope?.code ?? fallback.code,
      message: envelope?.message ?? fallback.message,
      status,
      field: envelope?.field,
      requestId,
      retryAfterSeconds,
      details: envelope?.details,
    });
  }

  private readEnvelope(
    text: string,
  ): { code: string; message: string; field?: string; details?: unknown } | null {
    if (text.length === 0) return null;

    try {
      const parsed = errorEnvelopeSchema.safeParse(JSON.parse(text));
      if (!parsed.success) return null;

      const { code, message, details } = parsed.data.error;
      return {
        code,
        message,
        field: details?.field,
        details,
      };
    } catch {
      return null;
    }
  }
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  return new ApiClient(options);
}

let activeClient: ApiClient | null = null;

/** Process-wide client; the session store installs its auth hooks on it. */
export function getApiClient(): ApiClient {
  if (!activeClient) activeClient = new ApiClient({ baseUrl: env.apiBaseUrl });
  return activeClient;
}

/** Replace the active client (tests, or a runtime base-URL change). */
export function setApiClient(client: ApiClient | null): void {
  activeClient = client;
}
