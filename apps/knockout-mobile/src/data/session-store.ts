import { create } from "zustand";

import type { MemberProfile } from "./types";

/**
 * The session store.
 *
 * It is built by a factory, not exported as a singleton, because the interesting
 * behaviour is "what happens when the network is gone at the worst moment" — and
 * that is only testable if the auth client, the profile fetcher, and the cache can
 * be replaced. The app wires the real ones in `session.ts`.
 */

export type AuthFailure = "invalid_credentials" | "network" | "unknown";

const MESSAGES: Record<AuthFailure, string> = {
  invalid_credentials: "That email and password do not match.",
  network: "No connection. Sign in again when you are back online.",
  unknown: "Something went wrong. Try again.",
};

export const authFailureMessage = (failure: AuthFailure): string => MESSAGES[failure];

export type SessionDeps = {
  auth: {
    /** The user id of a restored session, or null. Must never throw when offline. */
    getSession(): Promise<{ userId: string | null }>;
    signInWithPassword(input: {
      email: string;
      password: string;
    }): Promise<{ userId: string | null; failure: AuthFailure | null }>;
    signOut(): Promise<void>;
  };
  fetchProfile(userId: string): Promise<MemberProfile | null>;
  cache: {
    read(): MemberProfile | null;
    write(profile: MemberProfile | null): void;
  };
};

export type SessionStatus = "booting" | "signed_out" | "signed_in";

export type SessionState = {
  status: SessionStatus;
  profile: MemberProfile | null;
  /** Plain-language sentence for the sign-in screen, or null. */
  error: string | null;
  busy: boolean;
  bootstrap(): Promise<void>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  clearError(): void;
};

export function createSessionStore(deps: SessionDeps) {
  return create<SessionState>()((set, get) => ({
    status: "booting",
    profile: null,
    error: null,
    busy: false,

    /**
     * Runs once at startup. Order matters for a field app:
     *
     * 1. A restored Supabase session is the permission to be here at all.
     * 2. The cached profile is applied immediately, so the app is usable with no
     *    signal before any request is attempted.
     * 3. A fresh profile replaces it when the network answers. If the network does
     *    not answer, the cached one stands — that is the whole point of caching it.
     *
     * No cached profile and no network means `signed_out`: there is nothing to show
     * and guessing an org id would be worse than asking for a password again.
     */
    async bootstrap() {
      if (get().status !== "booting") return;

      let userId: string | null = null;
      try {
        ({ userId } = await deps.auth.getSession());
      } catch {
        userId = null;
      }

      if (!userId) {
        deps.cache.write(null);
        set({ status: "signed_out", profile: null, error: null });
        return;
      }

      const cached = deps.cache.read();
      const usableCache = cached && cached.id === userId ? cached : null;
      if (usableCache) set({ status: "signed_in", profile: usableCache });

      try {
        const fresh = await deps.fetchProfile(userId);
        if (fresh) {
          deps.cache.write(fresh);
          set({ status: "signed_in", profile: fresh, error: null });
          return;
        }
      } catch {
        // Offline is the normal case here, not an error worth a screen.
      }

      if (usableCache) return;

      deps.cache.write(null);
      set({
        status: "signed_out",
        profile: null,
        error: "We could not load your profile without a connection.",
      });
    },

    async signIn(email, password) {
      if (get().busy) return;
      set({ busy: true, error: null });

      try {
        const { userId, failure } = await deps.auth.signInWithPassword({ email, password });
        if (failure || !userId) {
          set({ busy: false, status: "signed_out", error: MESSAGES[failure ?? "unknown"] });
          return;
        }

        const profile = await deps.fetchProfile(userId);
        if (!profile) {
          set({
            busy: false,
            status: "signed_out",
            error: MESSAGES.unknown,
          });
          return;
        }

        deps.cache.write(profile);
        set({ busy: false, status: "signed_in", profile, error: null });
      } catch {
        set({ busy: false, status: "signed_out", error: MESSAGES.network });
      }
    },

    async signOut() {
      try {
        await deps.auth.signOut();
      } catch {
        // Signing out locally must never depend on the network: the tokens are
        // discarded on this device either way, and the server session expires on
        // its own. Surfacing "could not sign out" here would trap the user in the app.
      } finally {
        deps.cache.write(null);
        set({ status: "signed_out", profile: null, error: null, busy: false });
      }
    },

    clearError() {
      set({ error: null });
    },
  }));
}

export type SessionStore = ReturnType<typeof createSessionStore>;
