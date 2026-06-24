// jest-expo wires the RN test environment + globals. React Native Testing Library's
// Jest matchers (toBeOnTheScreen, toHaveTextContent, toHaveStyle, …) auto-register on
// import, so no @testing-library/jest-native / extend-expect is needed (RNTL >= 12.4).

// --- Reanimated 4 / Worklets -------------------------------------------------
// Reanimated 4 moved its worklets engine into the separate `react-native-worklets`
// package. Mock THAT (not the old react-native-reanimated/mock path). Guarded so a
// missing mock subpath degrades gracefully instead of failing every test file.
jest.mock('react-native-worklets', () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- jest mock factory
    return require('react-native-worklets/src/mock');
  } catch {
    return jest.requireActual('react-native-worklets');
  }
});

// --- expo-font: don't load real fonts in tests -------------------------------
jest.mock('expo-font', () => ({
  ...jest.requireActual('expo-font'),
  useFonts: () => [true, null],
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(() => Promise.resolve()),
}));

// --- @expo-google-fonts/* hooks: short-circuit the async load ----------------
jest.mock('@expo-google-fonts/dm-sans', () => ({ useFonts: () => [true, null] }));
jest.mock('@expo-google-fonts/jetbrains-mono', () => ({ useFonts: () => [true, null] }));
jest.mock('@expo-google-fonts/plus-jakarta-sans', () => ({ useFonts: () => [true, null] }));

// --- AsyncStorage: in-memory mock so the Study screen's persisted state works --
jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- jest mock factory
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// NativeWind ~4.1: no mock by default — className -> style is resolved by its Babel
// plugin, which jest-expo runs. If a component throws on cssInterop in tests, add a
// minimal jest.mock('nativewind', () => ({ ...jest.requireActual('nativewind') })) here.
