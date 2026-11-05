import { createApiClient, type ApiResponseLike, type FetchLike } from '@/api/client';
import { ApiError } from '@/api/errors';

interface Call {
  url: string;
  init: RequestInit;
  headers: Record<string, string>;
  body: string | undefined;
}

function jsonResponse(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
): ApiResponseLike {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (name: string) => headers[name.toLowerCase()] ?? null,
    },
    text: async () => (body === undefined ? '' : JSON.stringify(body)),
  };
}

function emptyResponse(status = 204, headers: Record<string, string> = {}): ApiResponseLike {
  return jsonResponse(undefined, status, headers);
}

function recordingFetch(
  handler: (call: Call) => ApiResponseLike | Promise<ApiResponseLike>,
): { fetchImpl: FetchLike; calls: Call[] } {
  const calls: Call[] = [];

  return {
    calls,
    fetchImpl: async (url, init) => {
      const headers = Object.fromEntries(
        Object.entries((init.headers ?? {}) as Record<string, string>).map(([key, value]) => [
          key.toLowerCase(),
          value,
        ]),
      );
      const call: Call = {
        url,
        init,
        headers,
        body: typeof init.body === 'string' ? init.body : undefined,
      };
      calls.push(call);
      return handler(call);
    },
  };
}

function unauthorized(): ApiResponseLike {
  return jsonResponse(
    { error: { code: 'UNAUTHORIZED', message: 'access token expired', details: null } },
    401,
  );
}

describe('ApiClient request shape', () => {
  it('prefixes the base URL, sends the bearer token, a request id and returns JSON', async () => {
    const { fetchImpl, calls } = recordingFetch(() =>
      jsonResponse({ data: [], environment: 'test' }),
    );
    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetchImpl,
      requestId: () => 'req-1',
      getAccessToken: () => 'access-1',
    });

    const body = await client.request<{ data: unknown[]; environment: string }>('/v1/markets');

    expect(body).toEqual({ data: [], environment: 'test' });
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe('http://api.test/v1/markets');
    expect(calls[0]?.headers.authorization).toBe('Bearer access-1');
    expect(calls[0]?.headers['x-request-id']).toBe('req-1');
    expect(calls[0]?.headers.accept).toBe('application/json');
    expect(calls[0]?.init.method).toBe('GET');
  });

  it('serializes a JSON body and the Idempotency-Key header', async () => {
    const { fetchImpl, calls } = recordingFetch(() => jsonResponse({ id: 'order-1' }, 201));
    const client = createApiClient({ baseUrl: 'http://api.test', fetchImpl });
    const payload = {
      symbol: 'BTC-USD',
      side: 'BUY',
      type: 'MARKET',
      quantity: '0.5',
    };

    await client.request('/v1/orders', {
      method: 'POST',
      body: payload,
      idempotencyKey: 'intent-1',
    });

    expect(calls[0]?.headers['content-type']).toBe('application/json');
    expect(calls[0]?.headers['idempotency-key']).toBe('intent-1');
    expect(calls[0]?.body).toBe(JSON.stringify(payload));
  });

  it('does not attach a bearer token to public requests', async () => {
    const { fetchImpl, calls } = recordingFetch(() =>
      jsonResponse({ accessToken: 'a', refreshToken: 'r' }),
    );
    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetchImpl,
      getAccessToken: () => 'access-1',
    });

    await client.requestPublic('/v1/auth/login', {
      method: 'POST',
      body: { email: 'a@b.co', password: 'secret' },
    });

    expect(calls[0]?.headers.authorization).toBeUndefined();
  });

  it('returns undefined for 204 responses', async () => {
    const { fetchImpl } = recordingFetch(() => emptyResponse(204));
    const client = createApiClient({ baseUrl: 'http://api.test', fetchImpl });

    await expect(client.request<void>('/v1/auth/logout', { method: 'POST' })).resolves.toBeUndefined();
  });
});

describe('ApiClient error mapping', () => {
  it('maps the error envelope to a typed ApiError with field and request id', async () => {
    const { fetchImpl } = recordingFetch(() =>
      jsonResponse(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'must be greater than zero',
            details: { field: 'quantity' },
          },
        },
        422,
        { 'x-request-id': 'srv-42' },
      ),
    );
    const client = createApiClient({ baseUrl: 'http://api.test', fetchImpl });

    const failure = client.request('/v1/orders', { method: 'POST', body: {} });

    await expect(failure).rejects.toBeInstanceOf(ApiError);
    await expect(failure).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'must be greater than zero',
      status: 422,
      field: 'quantity',
      requestId: 'srv-42',
    });
  });

  it('keeps a null details object from becoming a field error', async () => {
    const { fetchImpl } = recordingFetch(() =>
      jsonResponse(
        { error: { code: 'INSUFFICIENT_FUNDS', message: 'not enough cash', details: null } },
        422,
      ),
    );
    const client = createApiClient({ baseUrl: 'http://api.test', fetchImpl });

    await expect(client.request('/v1/orders', { method: 'POST', body: {} })).rejects.toMatchObject({
      code: 'INSUFFICIENT_FUNDS',
      field: undefined,
    });
  });

  it('falls back to a status message when the body is not the envelope', async () => {
    const { fetchImpl } = recordingFetch(() => jsonResponse({ unexpected: true }, 500));
    const client = createApiClient({ baseUrl: 'http://api.test', fetchImpl });

    await expect(client.request('/v1/portfolio')).rejects.toMatchObject({
      code: 'INTERNAL_ERROR',
      status: 500,
    });
  });

  it('turns a transport failure into a network ApiError', async () => {
    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetchImpl: async () => {
        throw new TypeError('Network request failed');
      },
    });

    await expect(client.request('/v1/markets')).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      status: 0,
    });
  });

  it('aborts a request that exceeds the timeout', async () => {
    const client = createApiClient({
      baseUrl: 'http://api.test',
      timeoutMs: 5,
      fetchImpl: (_url, init) =>
        new Promise<ApiResponseLike>((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => {
            const error = new Error('aborted');
            error.name = 'AbortError';
            reject(error);
          });
        }),
    });

    await expect(client.request('/v1/markets')).rejects.toMatchObject({
      code: 'TIMEOUT',
      status: 0,
    });
  });

  it('rejects a 2xx body that is not JSON as an invalid response', async () => {
    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        headers: { get: () => null },
        text: async () => '<html>proxy error</html>',
      }),
    });

    await expect(client.request('/v1/markets')).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
    });
  });
});

describe('ApiClient single-flight refresh', () => {
  it('shares one refresh between concurrent 401s and retries each request once', async () => {
    let token = 'expired';
    const refresh = jest.fn(async () => {
      token = 'fresh';
      return 'fresh';
    });
    const { fetchImpl, calls } = recordingFetch((call) =>
      call.headers.authorization === 'Bearer fresh'
        ? jsonResponse({ ok: true })
        : unauthorized(),
    );
    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetchImpl,
      getAccessToken: () => token,
      refreshAccessToken: refresh,
      onRefreshFailed: jest.fn(),
    });

    const [portfolio, orders] = await Promise.all([
      client.request('/v1/portfolio'),
      client.request('/v1/orders'),
    ]);

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(portfolio).toEqual({ ok: true });
    expect(orders).toEqual({ ok: true });

    const attempts = calls.map((call) => call.headers.authorization);
    expect(attempts).toEqual([
      'Bearer expired',
      'Bearer expired',
      'Bearer fresh',
      'Bearer fresh',
    ]);
  });

  it('clears the session when the refresh is rejected and never loops', async () => {
    const onRefreshFailed = jest.fn();
    const refresh = jest.fn(async () => {
      throw new ApiError({
        code: 'UNAUTHORIZED',
        message: 'refresh token revoked',
        status: 401,
      });
    });
    const { fetchImpl, calls } = recordingFetch(() => unauthorized());
    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetchImpl,
      getAccessToken: () => 'expired',
      refreshAccessToken: refresh,
      onRefreshFailed,
    });

    await expect(client.request('/v1/portfolio')).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      status: 401,
    });

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(onRefreshFailed).toHaveBeenCalledTimes(1);
    expect(calls).toHaveLength(1);
  });

  it('keeps the session when the refresh fails on the network', async () => {
    const onRefreshFailed = jest.fn();
    const refresh = jest.fn(async () => {
      throw new ApiError({
        code: 'NETWORK_ERROR',
        message: 'offline',
        status: 0,
      });
    });
    const { fetchImpl, calls } = recordingFetch(() => unauthorized());
    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetchImpl,
      getAccessToken: () => 'expired',
      refreshAccessToken: refresh,
      onRefreshFailed,
    });

    await expect(client.request('/v1/portfolio')).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      status: 0,
    });

    expect(onRefreshFailed).not.toHaveBeenCalled();
    expect(calls).toHaveLength(1);
  });

  it('does not refresh after a 401 from a public endpoint', async () => {
    const refresh = jest.fn(async () => 'fresh');
    const onRefreshFailed = jest.fn();
    const { fetchImpl, calls } = recordingFetch(() => unauthorized());
    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetchImpl,
      refreshAccessToken: refresh,
      onRefreshFailed,
    });

    await expect(
      client.requestPublic('/v1/auth/login', { method: 'POST', body: {} }),
    ).rejects.toMatchObject({ status: 401 });

    expect(refresh).not.toHaveBeenCalled();
    expect(onRefreshFailed).not.toHaveBeenCalled();
    expect(calls).toHaveLength(1);
  });

  it('refreshes again for a later 401 once the shared refresh has settled', async () => {
    let token = 'expired';
    let validToken: string | null = null;
    let refreshCount = 0;
    const refresh = jest.fn(async () => {
      refreshCount += 1;
      token = `fresh-${refreshCount}`;
      validToken = token;
      return token;
    });
    const { fetchImpl } = recordingFetch((call) =>
      (call.headers.authorization ?? '').replace('Bearer ', '') === validToken
        ? jsonResponse({ ok: true })
        : unauthorized(),
    );
    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetchImpl,
      getAccessToken: () => token,
      refreshAccessToken: refresh,
    });

    await client.request('/v1/portfolio');

    // The session expires a second time after the first refresh settled.
    token = 'expired';
    validToken = null;
    await client.request('/v1/orders');

    expect(refresh).toHaveBeenCalledTimes(2);
  });
});
