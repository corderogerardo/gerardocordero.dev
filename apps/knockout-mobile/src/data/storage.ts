import { createMMKV } from "react-native-mmkv";

/**
 * Plain key-value storage for non-secret app state (the cached member profile,
 * UI preferences). Session tokens do NOT live here — they live in
 * `src/api/storage.ts`, which encrypts them with a key held in the Keychain.
 */
export const appStorage = createMMKV({ id: "knockout.app" });
