/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest-setup.ts"],
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
