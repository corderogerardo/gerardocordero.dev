// jest-expo wires the React Native test environment and globals. React Native
// Testing Library's matchers (toBeOnTheScreen, toHaveTextContent, …) register on
// import, so no extend-expect package is needed (RNTL >= 12.4).

// --- expo-sqlite -------------------------------------------------------------
// The device database is a native module. Tests inject a fake DAO/store instead;
// this mock only exists so a screen that imports the db module can render.
jest.mock("expo-sqlite", () => ({
  openDatabaseAsync: jest.fn(async () => ({
    execAsync: jest.fn(async () => undefined),
    runAsync: jest.fn(async () => ({ changes: 0, lastInsertRowId: 0 })),
    getFirstAsync: jest.fn(async () => null),
    getAllAsync: jest.fn(async () => []),
    withTransactionAsync: jest.fn(async (fn: () => Promise<void>) => fn()),
  })),
  openDatabaseSync: jest.fn(),
}));

// --- react-native-mmkv -------------------------------------------------------
// Backed by native code; an in-memory Map keeps the persisted-store tests honest
// about synchronous reads without needing the native module.
jest.mock("react-native-mmkv", () => {
  const store = new Map<string, string>();
  class MMKV {
    getString(key: string) {
      return store.get(key);
    }
    set(key: string, value: string) {
      store.set(key, value);
    }
    delete(key: string) {
      store.delete(key);
    }
    clearAll() {
      store.clear();
    }
    contains(key: string) {
      return store.has(key);
    }
  }
  return { MMKV, useMMKVStorage: jest.fn() };
});

// --- expo-secure-store -------------------------------------------------------
jest.mock("expo-secure-store", () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (k: string) => store.get(k) ?? null),
    setItemAsync: jest.fn(async (k: string, v: string) => {
      store.set(k, v);
    }),
    deleteItemAsync: jest.fn(async (k: string) => {
      store.delete(k);
    }),
    isAvailableAsync: jest.fn(async () => true),
  };
});
