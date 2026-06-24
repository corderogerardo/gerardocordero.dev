// Persistence for study progress. AsyncStorage is used deliberately over MMKV: the
// portfolio also ships as a static web export (Cloudflare Pages), and AsyncStorage
// transparently backs onto localStorage on web while using native storage on device.
// All progress stays on-device — nothing is uploaded.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";

const PREFIX = "study:";

export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    return raw != null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function saveJSON<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Best-effort: ignore write failures (private mode, quota, web SSR).
  }
}

/**
 * Persisted state hook: loads the value once on mount, then write-through on every
 * update. `hydrated` flips to true after the initial load so callers can avoid
 * acting on the (empty) default before storage has been read.
 */
export function usePersistedState<T>(
  key: string,
  initial: T,
): readonly [T, (next: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  const mounted = useRef(true);
  // If the user writes before the initial load resolves, the load must NOT
  // overwrite their change — otherwise an early grade would be reverted by the
  // (older) persisted value landing late.
  const dirty = useRef(false);

  useEffect(() => {
    mounted.current = true;
    dirty.current = false;
    loadJSON<T>(key, initial).then((v) => {
      if (!mounted.current) return;
      if (!dirty.current) setValue(v);
      setHydrated(true);
    });
    return () => {
      mounted.current = false;
    };
    // `initial` is intentionally a mount-only default; re-keying re-loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      dirty.current = true;
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        void saveJSON(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, update, hydrated] as const;
}
