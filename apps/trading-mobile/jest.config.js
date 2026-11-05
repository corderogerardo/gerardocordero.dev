/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // pnpm with node-linker=hoisted still materializes packages under
  // node_modules/.pnpm/<pkg>@<ver>/… The (?:\.pnpm/)? guard lets RN/Expo ESM get
  // transformed instead of skipped. Add a package here if a test reports
  // "Unexpected token 'export'".
  transformIgnorePatterns: [
    'node_modules/(?!(?:\\.pnpm/)?(' +
      '(jest-)?react-native|@react-native(-community)?|@react-native/.*|' +
      'expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|' +
      'react-navigation|@react-navigation/.*|expo-router|expo-modules-core|' +
      'react-native-svg|react-native-gesture-handler|react-native-reanimated|' +
      'react-native-worklets|react-native-safe-area-context|react-native-screens' +
      '))',
  ],
};
