import { createSessionStore } from "../src/data/session-store";
import type { SessionDeps } from "../src/data/session-store";
import type { MemberProfile } from "../src/data/types";

const profile: MemberProfile = {
  id: "member-1",
  orgId: "org-1",
  teamId: "team-1",
  role: "rep",
  displayName: "Marcus Bell",
};

function deps(overrides: Partial<SessionDeps> = {}): SessionDeps {
  return {
    auth: {
      getSession: async () => ({ userId: "member-1" }),
      signInWithPassword: async () => ({ userId: "member-1", failure: null }),
      signOut: async () => undefined,
    },
    fetchProfile: async () => profile,
    cache: { read: () => null, write: () => undefined },
    ...overrides,
  };
}

describe("session store: bootstrap", () => {
  it("signs out and clears the cache when there is no restored session", async () => {
    const write = jest.fn();
    const store = createSessionStore(
      deps({
        auth: { ...deps().auth, getSession: async () => ({ userId: null }) },
        cache: { read: () => null, write },
      }),
    );

    await store.getState().bootstrap();

    expect(store.getState().status).toBe("signed_out");
    expect(store.getState().profile).toBeNull();
    expect(write).toHaveBeenCalledWith(null);
  });

  it("prefers the freshly fetched profile and refreshes the cache", async () => {
    const write = jest.fn();
    const stale = { ...profile, displayName: "Old Name" };
    const store = createSessionStore(
      deps({ cache: { read: () => stale, write } }),
    );

    await store.getState().bootstrap();

    expect(store.getState().profile?.displayName).toBe("Marcus Bell");
    expect(write).toHaveBeenCalledWith(profile);
  });

  it("stays signed in on the cached profile when the network is gone", async () => {
    const store = createSessionStore(
      deps({
        cache: { read: () => profile, write: () => undefined },
        fetchProfile: async () => {
          throw new Error("offline");
        },
      }),
    );

    await store.getState().bootstrap();

    expect(store.getState().status).toBe("signed_in");
    expect(store.getState().profile).toEqual(profile);
    expect(store.getState().error).toBeNull();
  });

  it("signs out when there is no cache and no connection, instead of inventing an org", async () => {
    const store = createSessionStore(
      deps({
        fetchProfile: async () => {
          throw new Error("offline");
        },
      }),
    );

    await store.getState().bootstrap();

    expect(store.getState().status).toBe("signed_out");
    expect(store.getState().error).toMatch(/profile without a connection/i);
  });

  it("ignores a cached profile that belongs to a different user", async () => {
    const other = { ...profile, id: "member-2" };
    const store = createSessionStore(
      deps({
        cache: { read: () => other, write: () => undefined },
        fetchProfile: async () => {
          throw new Error("offline");
        },
      }),
    );

    await store.getState().bootstrap();

    expect(store.getState().profile).toBeNull();
    expect(store.getState().status).toBe("signed_out");
  });

  it("is idempotent: a second call after boot does nothing", async () => {
    const getSession = jest.fn(async () => ({ userId: "member-1" }));
    const store = createSessionStore(deps({ auth: { ...deps().auth, getSession } }));

    await store.getState().bootstrap();
    await store.getState().bootstrap();

    expect(getSession).toHaveBeenCalledTimes(1);
  });
});

describe("session store: signIn", () => {
  it("signs in, caches the profile, and clears busy", async () => {
    const write = jest.fn();
    const store = createSessionStore(deps({ cache: { read: () => null, write } }));

    await store.getState().signIn("marcus@northwind.test", "knockout123");

    expect(store.getState().status).toBe("signed_in");
    expect(store.getState().busy).toBe(false);
    expect(write).toHaveBeenCalledWith(profile);
  });

  it("explains bad credentials without leaking whether the account exists", async () => {
    const store = createSessionStore(
      deps({
        auth: {
          ...deps().auth,
          signInWithPassword: async () => ({ userId: null, failure: "invalid_credentials" }),
        },
      }),
    );

    await store.getState().signIn("nobody@test", "wrong");

    expect(store.getState().status).toBe("signed_out");
    expect(store.getState().error).toBe("That email and password do not match.");
  });

  it("reports a network failure as a connection problem", async () => {
    const store = createSessionStore(
      deps({
        auth: {
          ...deps().auth,
          signInWithPassword: async () => {
            throw new Error("timeout");
          },
        },
      }),
    );

    await store.getState().signIn("marcus@northwind.test", "knockout123");

    expect(store.getState().error).toMatch(/no connection/i);
    expect(store.getState().busy).toBe(false);
  });

  it("refuses to sign in when the profile cannot be read", async () => {
    const store = createSessionStore(deps({ fetchProfile: async () => null }));

    await store.getState().signIn("marcus@northwind.test", "knockout123");

    expect(store.getState().status).toBe("signed_out");
    expect(store.getState().error).toBe("Something went wrong. Try again.");
  });

  it("ignores a second submit while the first is in flight", async () => {
    let release: (value: { userId: string; failure: null }) => void = () => undefined;
    const pending = new Promise<{ userId: string; failure: null }>((resolve) => {
      release = resolve;
    });
    const signInWithPassword = jest.fn(() => pending);
    const store = createSessionStore(deps({ auth: { ...deps().auth, signInWithPassword } }));

    const first = store.getState().signIn("marcus@northwind.test", "knockout123");
    await store.getState().signIn("marcus@northwind.test", "knockout123");
    release({ userId: "member-1", failure: null });
    await first;

    expect(signInWithPassword).toHaveBeenCalledTimes(1);
  });
});

describe("session store: signOut", () => {
  it("clears the cached profile even when the network call fails", async () => {
    const write = jest.fn();
    const store = createSessionStore(
      deps({
        auth: {
          ...deps().auth,
          signOut: async () => {
            throw new Error("offline");
          },
        },
        cache: { read: () => profile, write },
      }),
    );
    await store.getState().bootstrap();

    await expect(store.getState().signOut()).resolves.toBeUndefined();

    expect(store.getState().status).toBe("signed_out");
    expect(write).toHaveBeenCalledWith(null);
  });
});
