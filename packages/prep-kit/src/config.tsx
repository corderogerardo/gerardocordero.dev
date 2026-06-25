"use client";

// The one place each app differs: brand strings, nav, the AI tutor's subject
// framing, the localStorage namespace, and the aggregated content the /today and
// /search views read. Everything else in the kit is generic and prop-driven.
import { createContext, useContext } from "react";
import type { NavItem } from "./types";
import { useLocalStorage } from "./lib/use-local-storage";

// Lightweight, app-wide config. Bulk content (flashcards/prompts/quiz/study) is
// deliberately NOT here — it's passed as route-scoped props to <DailySession>
// and <SearchView> so it stays in the route chunk instead of bloating every
// page's RSC payload.
export type PrepConfig = {
  /** localStorage namespace, e.g. "iosprep" -> keys become "iosprep:srs". */
  storagePrefix: string;
  /** Stable id used for the progress export filename, e.g. "ios-prep". */
  appId: string;
  brand: {
    /** Tiny logo glyph, e.g. "iOS" / "AND" / "RN". */
    logoText: string;
    /** Header title shown next to the logo. */
    title: string;
    /** Footer tagline. */
    footerText: string;
  };
  ai: {
    /** System prompt that frames the on-device tutor for this subject. */
    systemPrompt: string;
    /** Default input placeholder. */
    placeholder: string;
  };
  nav: NavItem[];
};

const PrepContext = createContext<PrepConfig | null>(null);

export function PrepProvider({
  config,
  children,
}: {
  config: PrepConfig;
  children: React.ReactNode;
}) {
  return <PrepContext.Provider value={config}>{children}</PrepContext.Provider>;
}

export function usePrepConfig(): PrepConfig {
  const config = useContext(PrepContext);
  if (!config) {
    throw new Error("usePrepConfig must be used within a <PrepProvider>");
  }
  return config;
}

/**
 * localStorage state namespaced by the app's `storagePrefix`.
 * `usePersisted("srs", {})` in the iOS app reads/writes `"iosprep:srs"`.
 */
export function usePersisted<T>(key: string, initial: T) {
  const { storagePrefix } = usePrepConfig();
  return useLocalStorage<T>(`${storagePrefix}:${key}`, initial);
}
