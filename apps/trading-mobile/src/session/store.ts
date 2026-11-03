import { create } from 'zustand';

import { login, logout as logoutRequest, refreshTokens, register } from '@/api/auth';
import { getApiClient } from '@/api/client';
import { ApiError, isApiError } from '@/api/errors';
import type { AuthSession, User } from '@/api/schemas';

import { refreshTokenStorage } from './secure-store';

/**
 * Session state.
 *
 * - `status` drives the router guard in the root layout.
 * - The access token lives in memory only; the refresh token lives in the
 *   keychain and is written by exactly one function (`applySession`).
 * - The API client owns single-flight refresh; this store supplies the hooks.
 */

export type SessionStatus = 'bootstrapping' | 'signedOut' | 'signedIn';

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput extends SignInInput {
  displayName: string;
}

interface SessionState {
  status: SessionStatus;
  user: User | null;
  accessToken: string | null;
  /** Persist the refresh token, then expose the session. The only writer. */
  applySession: (session: AuthSession) => Promise<void>;
  bootstrap: () => Promise<void>;
  signIn: (input: SignInInput) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
  clearSession: () => Promise<void>;
}

export const useSession = create<SessionState>((set, get) => ({
  status: 'bootstrapping',
  user: null,
  accessToken: null,

  async applySession(session) {
    await refreshTokenStorage.write(session.refreshToken);
    set({
      status: 'signedIn',
      user: session.user,
      accessToken: session.accessToken,
    });
  },

  async bootstrap() {
    if (get().status !== 'bootstrapping') return;

    const stored = await refreshTokenStorage.read();
    if (!stored) {
      set({ status: 'signedOut', user: null, accessToken: null });
      return;
    }

    try {
      await get().applySession(await refreshTokens(stored));
    } catch (error) {
      // A revoked or expired token is gone for good. A transport failure keeps it:
      // an offline launch must not force the user to type their password again.
      const offline = isApiError(error) && error.status === 0;
      if (!offline) await refreshTokenStorage.clear();
      set({ status: 'signedOut', user: null, accessToken: null });
    }
  },

  async signIn(input) {
    await get().applySession(await login(input));
  },

  async signUp(input) {
    await get().applySession(await register(input));
  },

  async signOut() {
    const stored = await refreshTokenStorage.read();

    if (stored) {
      try {
        await logoutRequest(stored);
      } catch {
        // The local session is cleared even when the server call fails.
      }
    }

    await refreshTokenStorage.clear();
    set({ status: 'signedOut', user: null, accessToken: null });
  },

  async clearSession() {
    await refreshTokenStorage.clear();
    set({ status: 'signedOut', user: null, accessToken: null });
  },
}));

/**
 * Called by the API client when a 401 cannot be recovered. Rotating the refresh
 * token means the presented one is revoked, so it must be persisted immediately.
 *
 * Rejections propagate: a 401 ends the session, a transport failure (status 0)
 * keeps it so an offline moment does not force a re-login.
 */
async function rotateSession(): Promise<string> {
  const stored = await refreshTokenStorage.read();
  if (!stored) {
    throw new ApiError({
      code: 'UNAUTHORIZED',
      message: 'Your session expired. Sign in again.',
      status: 401,
    });
  }

  const session = await refreshTokens(stored);
  await useSession.getState().applySession(session);
  return session.accessToken;
}

getApiClient().setAuthHooks({
  getAccessToken: () => useSession.getState().accessToken,
  refreshAccessToken: rotateSession,
  onRefreshFailed: () => {
    void useSession.getState().clearSession();
  },
});
