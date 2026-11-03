import { SYNC_CORE_VERSION } from "@gerardocordero/sync-core";

/**
 * T0's proof: the app can import the framework-free engine package across the
 * workspace boundary. This is the seam the whole architecture rests on, and it
 * fails loudly (module resolution, transform, or version mismatch) if the
 * monorepo wiring is wrong.
 */
describe("workspace wiring", () => {
  it("resolves @gerardocordero/sync-core from the app", () => {
    expect(SYNC_CORE_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
