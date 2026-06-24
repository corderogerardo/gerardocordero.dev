"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

const EVENT = "androidprep:local-storage";

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Persistent state backed by localStorage, implemented with
 * `useSyncExternalStore` so it stays hydration-safe (the static HTML renders
 * with `initial`, then the client swaps in the stored value) and syncs across
 * tabs via the native `storage` event.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  // Freeze the first `initial` so callers can pass a fresh literal each render.
  const [initialValue] = useState(initial);

  const subscribe = useCallback(
    (onChange: () => void) => {
      const onStorage = (e: StorageEvent) => {
        if (e.key === key) onChange();
      };
      window.addEventListener("storage", onStorage);
      window.addEventListener(EVENT, onChange);
      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(EVENT, onChange);
      };
    },
    [key],
  );

  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  );

  const value = useMemo<T>(() => {
    if (raw == null) return initialValue;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return initialValue;
    }
  }, [raw, initialValue]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const current = read(key);
      const prev =
        current == null
          ? initialValue
          : (() => {
              try {
                return JSON.parse(current) as T;
              } catch {
                return initialValue;
              }
            })();
      const value = next instanceof Function ? next(prev) : next;
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
        window.dispatchEvent(new Event(EVENT));
      } catch {
        // ignore quota / unavailable storage
      }
    },
    [key, initialValue],
  );

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      window.dispatchEvent(new Event(EVENT));
    } catch {
      // ignore
    }
  }, [key]);

  return { value, set, reset } as const;
}
