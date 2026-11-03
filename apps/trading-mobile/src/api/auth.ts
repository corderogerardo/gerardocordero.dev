import { API_PATHS } from '@/config';

import { getApiClient } from './client';
import { parseOrThrow } from './errors';
import {
  authSessionSchema,
  meResponseSchema,
  type AuthSession,
  type Me,
} from './schemas';

/**
 * Auth endpoints. These are pure functions — the session store owns state, so
 * nothing here imports the store (that keeps the dependency direction one-way).
 */

export interface Credentials {
  email: string;
  password: string;
}

export interface Registration extends Credentials {
  displayName: string;
}

export async function login(credentials: Credentials): Promise<AuthSession> {
  const raw = await getApiClient().requestPublic<unknown>(API_PATHS.login, {
    method: 'POST',
    body: {
      email: credentials.email.trim(),
      password: credentials.password,
    },
  });

  return parseOrThrow(authSessionSchema, raw);
}

export async function register(input: Registration): Promise<AuthSession> {
  const raw = await getApiClient().requestPublic<unknown>(API_PATHS.register, {
    method: 'POST',
    body: {
      email: input.email.trim(),
      password: input.password,
      displayName: input.displayName.trim(),
    },
  });

  return parseOrThrow(authSessionSchema, raw);
}

/** Rotates the refresh token: the presented one is revoked by the server. */
export async function refreshTokens(refreshToken: string): Promise<AuthSession> {
  const raw = await getApiClient().requestPublic<unknown>(API_PATHS.refresh, {
    method: 'POST',
    body: { refreshToken },
  });

  return parseOrThrow(authSessionSchema, raw);
}

export async function logout(refreshToken: string): Promise<void> {
  await getApiClient().request<void>(API_PATHS.logout, {
    method: 'POST',
    body: { refreshToken },
  });
}

export async function fetchMe(): Promise<Me> {
  const raw = await getApiClient().request<unknown>(API_PATHS.me);
  return parseOrThrow(meResponseSchema, raw);
}
