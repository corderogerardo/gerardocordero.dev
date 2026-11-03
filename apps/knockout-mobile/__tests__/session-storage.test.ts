import { secureSessionStorage, resetSessionStorageForTests } from "../src/api/storage";

describe("secure session storage", () => {
  beforeEach(() => {
    resetSessionStorageForTests();
  });

  it("round-trips a value", async () => {
    await secureSessionStorage.setItem("sb-session", '{"access_token":"abc"}');
    await expect(secureSessionStorage.getItem("sb-session")).resolves.toBe(
      '{"access_token":"abc"}',
    );
  });

  it("returns null for a key that was never written", async () => {
    await expect(secureSessionStorage.getItem("missing")).resolves.toBeNull();
  });

  it("removes a value", async () => {
    await secureSessionStorage.setItem("sb-session", "value");
    await secureSessionStorage.removeItem("sb-session");
    await expect(secureSessionStorage.getItem("sb-session")).resolves.toBeNull();
  });

  it("survives being called concurrently on first launch", async () => {
    const [a, b] = await Promise.all([
      secureSessionStorage.getItem("a"),
      secureSessionStorage.getItem("b"),
    ]);

    expect(a).toBeNull();
    expect(b).toBeNull();
  });
});
