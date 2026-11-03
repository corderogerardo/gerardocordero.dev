import { setApiClient } from '@/api/client';
import {
  REFRESH_TOKEN_KEY,
  refreshTokenStorage,
  resetRefreshTokenStorageForTests,
} from '@/session/secure-store';
import { useSession } from '@/session/store';

import { installApi, jsonResponse, rawResponse } from './helpers/test-api';

// In-memory keychain; nothing in these tests may touch the device or the network.
jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    isAvailableAsync: jest.fn(async () => true),
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'whenUnlockedThisDeviceOnly',
    __store: store,
  };
});

const SECURE_STORE_KEY = REFRESH_TOKEN_KEY;

const USER = {
  id: 'd975aba8-9ab6-4321-b89d-594e18ef141f',
  email: 'trader@example.test',
  displayName: 'Ada',
  createdAt: '2026-11-03T15:28:50.865242Z',
};

const SESSION = {
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
  tokenType: 'Bearer',
  expiresIn: 900,
  user: USER,
};

function secureStoreMap(): Map<string, string> {
  const module = jest.requireMock('expo-secure-store') as { __store: Map<string, string> };
  return module.__store;
}

function seedSession(): void {
  useSession.setState({ status: 'signedIn', user: USER, accessToken: 'access-1' });
}

beforeEach(() => {
  secureStoreMap().clear();
  resetRefreshTokenStorageForTests();
  useSession.setState({ status: 'bootstrapping', user: null, accessToken: null });
});

afterEach(() => {
  setApiClient(null);
});

describe('bootstrap', () => {
  it('signs out immediately when no refresh token is stored', async () => {
    const { calls } = installApi(() => jsonResponse(SESSION));

    await useSession.getState().bootstrap();

    expect(useSession.getState().status).toBe('signedOut');
    expect(useSession.getState().accessToken).toBeNull();
    expect(calls).toHaveLength(0);
  });

  it('exchanges the stored refresh token and keeps the rotated one', async () => {
    secureStoreMap().set(SECURE_STORE_KEY, 'refresh-0');
    const { calls } = installApi(() => jsonResponse({ ...SESSION, refreshToken: 'refresh-1' }));

    await useSession.getState().bootstrap();

    expect(calls[0]?.path).toBe('/v1/auth/refresh');
    expect(calls[0]?.body).toBe(JSON.stringify({ refreshToken: 'refresh-0' }));
    expect(calls[0]?.headers.authorization).toBeUndefined();

    const state = useSession.getState();
    expect(state.status).toBe('signedIn');
    expect(state.accessToken).toBe('access-1');
    expect(state.user?.email).toBe('trader@example.test');
    expect(secureStoreMap().get(SECURE_STORE_KEY)).toBe('refresh-1');
  });

  it('never persists the access token', async () => {
    secureStoreMap().set(SECURE_STORE_KEY, 'refresh-0');
    installApi(() => jsonResponse(SESSION));

    await useSession.getState().bootstrap();

    const persisted = [...secureStoreMap().entries()];
    // Exactly one entry, and it is the rotated refresh token — never the access token.
    expect(persisted).toEqual([[SECURE_STORE_KEY, 'refresh-1']]);
    expect(JSON.stringify(persisted)).not.toContain('access-1');
  });

  it('clears a revoked refresh token', async () => {
    secureStoreMap().set(SECURE_STORE_KEY, 'revoked');
    installApi(() =>
      jsonResponse(
        { error: { code: 'UNAUTHORIZED', message: 'refresh token revoked', details: null } },
        401,
      ),
    );

    await useSession.getState().bootstrap();

    expect(useSession.getState().status).toBe('signedOut');
    expect(secureStoreMap().has(SECURE_STORE_KEY)).toBe(false);
  });

  it('keeps the token when the device is offline so the next launch can retry', async () => {
    secureStoreMap().set(SECURE_STORE_KEY, 'refresh-0');
    installApi(() => {
      throw new TypeError('Network request failed');
    });

    await useSession.getState().bootstrap();

    expect(useSession.getState().status).toBe('signedOut');
    expect(secureStoreMap().get(SECURE_STORE_KEY)).toBe('refresh-0');
  });
});

describe('sign in and sign up', () => {
  it('signs in, trims the email and stores only the refresh token', async () => {
    const { calls } = installApi(() => jsonResponse(SESSION));

    await useSession.getState().signIn({
      email: '  trader@example.test ',
      password: 'correct horse battery staple',
    });

    expect(calls[0]?.path).toBe('/v1/auth/login');
    expect(calls[0]?.body).toBe(
      JSON.stringify({
        email: 'trader@example.test',
        password: 'correct horse battery staple',
      }),
    );
    expect(useSession.getState().status).toBe('signedIn');
    expect(useSession.getState().accessToken).toBe('access-1');
    expect([...secureStoreMap().values()]).toEqual(['refresh-1']);
  });

  it('registers with the display name', async () => {
    const { calls } = installApi(() => jsonResponse(SESSION, 201));

    await useSession.getState().signUp({
      email: 'trader@example.test',
      password: 'correct horse battery staple',
      displayName: ' Ada ',
    });

    expect(calls[0]?.path).toBe('/v1/auth/register');
    expect(calls[0]?.body).toBe(
      JSON.stringify({
        email: 'trader@example.test',
        password: 'correct horse battery staple',
        displayName: 'Ada',
      }),
    );
    expect(useSession.getState().status).toBe('signedIn');
  });

  it('leaves the session untouched when sign-in fails', async () => {
    installApi(() =>
      jsonResponse(
        { error: { code: 'UNAUTHORIZED', message: 'invalid credentials', details: null } },
        401,
      ),
    );

    await expect(
      useSession.getState().signIn({ email: 'trader@example.test', password: 'wrong' }),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED', status: 401 });

    expect(useSession.getState().status).toBe('bootstrapping');
    expect(useSession.getState().accessToken).toBeNull();
    expect(secureStoreMap().size).toBe(0);
  });
});

describe('sign out', () => {
  it('revokes the refresh token, clears storage and drops the access token', async () => {
    secureStoreMap().set(SECURE_STORE_KEY, 'refresh-1');
    const api = installApi(() => rawResponse('', 204), { token: 'access-1' });
    seedSession();

    await useSession.getState().signOut();

    expect(api.calls[0]?.path).toBe('/v1/auth/logout');
    expect(api.calls[0]?.headers.authorization).toBe('Bearer access-1');
    expect(api.calls[0]?.body).toBe(JSON.stringify({ refreshToken: 'refresh-1' }));

    const state = useSession.getState();
    expect(state.status).toBe('signedOut');
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(secureStoreMap().has(SECURE_STORE_KEY)).toBe(false);
  });

  it('still signs out locally when the server call fails', async () => {
    secureStoreMap().set(SECURE_STORE_KEY, 'refresh-1');
    installApi(() => {
      throw new TypeError('offline');
    });
    seedSession();

    await useSession.getState().signOut();

    expect(useSession.getState().status).toBe('signedOut');
    expect(secureStoreMap().has(SECURE_STORE_KEY)).toBe(false);
  });
});

describe('refreshTokenStorage', () => {
  it('round-trips the refresh token through the keychain adapter', async () => {
    await refreshTokenStorage.write('refresh-9');
    expect(await refreshTokenStorage.read()).toBe('refresh-9');

    await refreshTokenStorage.clear();
    expect(await refreshTokenStorage.read()).toBeNull();
  });
});
