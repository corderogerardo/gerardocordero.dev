import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    environment: "node",
    // The engine is pure: no network, no timers, no DOM. If a test needs to
    // wait, the test is wrong — inject a clock instead.
    testTimeout: 5_000,
  },
});
