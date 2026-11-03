/* eslint-disable @typescript-eslint/no-require-imports -- each case re-imports the
   module after changing process.env, which needs a real require, not an ESM import. */
describe("supabase configuration", () => {
  const ORIGINAL_ENV = process.env;

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.resetModules();
  });

  it("points at the local stack's shifted ports by default", () => {
    jest.resetModules();
    const { supabaseUrl, isLocalStack } = require("../src/api/config") as typeof import("../src/api/config");

    expect(new URL(supabaseUrl).port).toBe("54341");
    expect(isLocalStack).toBe(true);
  });

  it("ships a JWT-shaped anon key and nothing that looks like a service key", () => {
    const { supabaseAnonKey } = require("../src/api/config") as typeof import("../src/api/config");
    const [, payload] = supabaseAnonKey.split(".");

    expect(supabaseAnonKey.split(".")).toHaveLength(3);
    expect(JSON.parse(Buffer.from(payload!, "base64").toString("utf8")).role).toBe("anon");
  });

  it("lets an explicit environment override win", () => {
    process.env = {
      ...ORIGINAL_ENV,
      EXPO_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      EXPO_PUBLIC_SUPABASE_ANON_KEY: "hosted-key",
    };
    jest.resetModules();

    const { supabaseUrl, supabaseAnonKey, isLocalStack } =
      require("../src/api/config") as typeof import("../src/api/config");

    expect(supabaseUrl).toBe("https://example.supabase.co");
    expect(supabaseAnonKey).toBe("hosted-key");
    expect(isLocalStack).toBe(false);
  });
});
