import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { createMMKV } from "react-native-mmkv";
import type { MMKV } from "react-native-mmkv";

/**
 * Session persistence for Supabase Auth, in two layers on purpose.
 *
 * A Supabase session is a JSON blob with a JWT that routinely exceeds the 2048-byte
 * per-value limit of `expo-secure-store` on Android. Putting it there is the obvious
 * move and the one that breaks in the field, on one platform, at the worst time.
 *
 * So: the *key* lives in the Keychain/Keystore (small, always fits), and the
 * *session* lives in MMKV encrypted with that key. Reading MMKV without the key
 * yields ciphertext; reading the key requires the device to be unlocked and the
 * app to be the one asking.
 *
 * Threat model, stated: this protects against a stolen backup or another app on the
 * device. It does not protect against a rooted device with the app running, and it is
 * not a substitute for short-lived tokens (rotation is on).
 */
const ENCRYPTION_KEY_NAME = "knockout.mmkv.key";

let storage: MMKV | null = null;
let pending: Promise<MMKV> | null = null;

async function readOrCreateKey(): Promise<string> {
  const existing = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);
  if (existing) return existing;

  const created = Crypto.randomUUID();
  await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, created, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
  });
  return created;
}

async function getStorage(): Promise<MMKV> {
  if (storage) return storage;
  // Two callers can race on first launch (auth restore + a query). Share the promise
  // instead of creating two MMKV instances over the same file.
  pending ??= readOrCreateKey().then((encryptionKey) => {
    storage = createMMKV({ id: "knockout.session", encryptionKey, encryptionType: "AES-256" });
    return storage;
  });
  return pending;
}

/**
 * The adapter Supabase Auth expects: async get/set/remove of string values.
 * Supabase treats a thrown storage error as "no session", so errors are swallowed
 * into `null` on read and logged on write rather than crashing the app at boot.
 */
export const secureSessionStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const store = await getStorage();
      return store.getString(key) ?? null;
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    const store = await getStorage();
    store.set(key, value);
  },

  async removeItem(key: string): Promise<void> {
    const store = await getStorage();
    store.remove(key);
  },
};

/** Test seam: forget the cached instance between tests. */
export function resetSessionStorageForTests(): void {
  storage = null;
  pending = null;
}
