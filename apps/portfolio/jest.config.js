/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  // pnpm with node-linker=hoisted still materializes packages under
  // node_modules/.pnpm/<pkg>@<ver>/... — the (?:\.pnpm/)? guard lets RN / Expo /
  // NativeWind / Reanimated ESH/Flow source get transformed by babel-jest instead
  // of skipped. Add a package name to this allowlist if a test throws
  // "Unexpected token 'export'" / "Cannot use import statement" for it.
  transformIgnorePatterns: [
    'node_modules/(?!(?:\\.pnpm/)?(' +
      '(jest-)?react-native|@react-native(-community)?|@react-native/.*|' +
      'expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|' +
      'react-navigation|@react-navigation/.*|expo-router|expo-modules-core|' +
      'nativewind|react-native-css-interop|' +
      'react-native-reanimated|react-native-worklets|' +
      'react-native-gesture-handler|react-native-safe-area-context|' +
      'react-native-screens|react-native-svg' +
      '))',
  ],
};
