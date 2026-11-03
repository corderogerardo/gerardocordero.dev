import { supabase } from "../api/client";
import { createSessionStore } from "./session-store";
import { appStorage } from "./storage";
import { MEMBER_ROLES } from "./types";
import type { MemberProfile, MemberRole } from "./types";

const PROFILE_KEY = "knockout.profile";

/**
 * The app's single session store, wired to Supabase and to MMKV.
 *
 * Everything specific to Supabase lives here; `session-store.ts` knows only the
 * ports. That is why the store's tests do not need a mocked SDK.
 */
export const useSessionStore = createSessionStore({
  auth: {
    async getSession() {
      // getSession reads from storage and refreshes only if a token is near expiry.
      // With no connection it returns the stored session instead of throwing.
      const { data, error } = await supabase.auth.getSession();
      if (error) return { userId: null };
      return { userId: data.session?.user.id ?? null };
    },

    async signInWithPassword({ email, password }) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          // Supabase answers 400 for bad credentials; anything else is a real fault.
          const failure = error.status === 400 ? "invalid_credentials" : "unknown";
          return { userId: null, failure };
        }
        return { userId: data.user?.id ?? null, failure: null };
      } catch {
        return { userId: null, failure: "network" };
      }
    },

    async signOut() {
      await supabase.auth.signOut();
    },
  },

  async fetchProfile(userId) {
    const { data, error } = await supabase
      .from("members")
      .select("id, org_id, team_id, role, display_name")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) return null;
    return {
      id: data.id,
      orgId: data.org_id,
      teamId: data.team_id,
      role: isMemberRole(data.role) ? data.role : "rep",
      displayName: data.display_name,
    };
  },

  cache: {
    read(): MemberProfile | null {
      const raw = appStorage.getString(PROFILE_KEY);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as MemberProfile;
      } catch {
        // A corrupt cache is not worth crashing over: drop it and fetch again.
        appStorage.remove(PROFILE_KEY);
        return null;
      }
    },
    write(profile) {
      if (profile) appStorage.set(PROFILE_KEY, JSON.stringify(profile));
      else appStorage.remove(PROFILE_KEY);
    },
  },
});

const isMemberRole = (value: string): value is MemberRole =>
  (MEMBER_ROLES as readonly string[]).includes(value);
