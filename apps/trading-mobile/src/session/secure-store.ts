import * as SecureStore from 'expo-secure-store';

/**
 * Refresh-token storage.
 *
 * Only the refresh token is persisted, and only in the platform keychain. The
 * access token never leaves memory. On platforms without a keychain (web) the
 * value lives in a module variable for the lifetime of the tab instead of
 * silently landing in localStorage.
 */

export const REFRESH_TOKEN_KEY = 'meridian.refresh-token';

export interface RefreshTokenStorage {
  read(): Promise<string | null>;
  write(token: string): Promise<void>;
  clear(): Promise<void>;
}

let memoryFallback: string | null = null;
let availability: Promise<boolean> | null = null;

function keychainAvailable(): Promise<boolean> {
  availability ??= Promise.resolve()
    .then(() => SecureStore.isAvailableAsync())
    .catch(() => false);
  return availability;
}

export const refreshTokenStorage: RefreshTokenStorage = {
  async read() {
    if (!(await keychainAvailable())) return memoryFallback;

    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      // A read failure is indistinguishable from a missing token to the caller.
      return null;
    }
  },

  async write(token: string) {
    if (!(await keychainAvailable())) {
      memoryFallback = token;
      return;
    }

    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },

  async clear() {
    memoryFallback = null;
    if (!(await keychainAvailable())) return;

    try {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      // Best effort: the in-memory session is cleared regardless.
    }
  },
};

/** Test hook: forget the memoized availability probe. */
export function resetRefreshTokenStorageForTests(): void {
  memoryFallback = null;
  availability = null;
}
