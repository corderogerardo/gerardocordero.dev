import {
  createApiClient,
  setApiClient,
  type ApiClient,
  type ApiResponseLike,
  type FetchLike,
} from '@/api/client';
import { ApiError } from '@/api/errors';

export const API_BASE = 'http://api.test';

export interface RecordedCall {
  path: string;
  init: RequestInit;
  headers: Record<string, string>;
  body: string | undefined;
}

export function jsonResponse(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
): ApiResponseLike {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => headers[name.toLowerCase()] ?? null },
    text: async () => JSON.stringify(body),
  };
}

export function rawResponse(text: string, status = 200): ApiResponseLike {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => null },
    text: async () => text,
  };
}

export interface TestApi {
  client: ApiClient;
  calls: RecordedCall[];
}

/** Install a client whose transport is a function — no network, ever. */
export function installApi(
  handler: (call: RecordedCall) => ApiResponseLike | Promise<ApiResponseLike>,
  options: { token?: string | null } = {},
): TestApi {
  const calls: RecordedCall[] = [];

  const fetchImpl: FetchLike = async (url, init) => {
    const headers = Object.fromEntries(
      Object.entries((init.headers ?? {}) as Record<string, string>).map(([key, value]) => [
        key.toLowerCase(),
        value,
      ]),
    );
    const call: RecordedCall = {
      path: url.startsWith(API_BASE) ? url.slice(API_BASE.length) : url,
      init,
      headers,
      body: typeof init.body === 'string' ? init.body : undefined,
    };
    calls.push(call);
    return handler(call);
  };

  const client = createApiClient({
    baseUrl: API_BASE,
    fetchImpl,
    getAccessToken: () => options.token ?? 'test-access-token',
    // Fails closed: tests that need a refresh install their own hook.
    refreshAccessToken: async () => {
      throw new ApiError({
        code: 'UNAUTHORIZED',
        message: 'test session expired',
        status: 401,
      });
    },
  });

  setApiClient(client);
  return { client, calls };
}
