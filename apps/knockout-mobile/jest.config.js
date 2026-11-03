/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest-setup.ts"],
  // RNTL v14 renders asynchronously and a screen test can take ~5 s on a loaded
  // machine (Turbo runs four suites in parallel). Jest's 5 s default made this suite
  // fail once and pass twice; the timeout was the flake, not the code.
  testTimeout: 15_000,
  // jest-expo's testMatch treats everything under __tests__/ as a suite. Shared
  // helpers live in __tests__/support/ and contain no tests, so they would fail with
  // "Your test suite must contain at least one test".
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/__tests__/support/"],
  // pnpm with node-linker=hoisted still materializes packages under
  // node_modules/.pnpm/<pkg>@<ver>/... — the (?:\.pnpm/)? guard lets their
  // ESM/Flow source be transformed by babel-jest instead of skipped.
  transformIgnorePatterns: [
    "node_modules/(?!(?:\\.pnpm/)?(" +
      "(jest-)?react-native|@react-native(-community)?|@react-native/.*|" +
      "expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|" +
      "expo-router|expo-modules-core|jest-expo|" +
      "react-native-mmkv|react-native-gesture-handler|react-native-safe-area-context|" +
      "react-native-screens|@supabase/.*|@tanstack/.*|@sentry/.*|@gerardocordero/.*" +
      "))",
  ],
};
