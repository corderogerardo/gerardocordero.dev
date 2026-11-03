/**
 * @gerardocordero/sync-core — the offline sync engine, as a library.
 *
 * Read order for a newcomer: `contract` → `backoff` → `policies` → `outbox` →
 * `engine`. Each file is one decision, and each decision has a test.
 *
 * The rule that keeps this package valuable: it must never import React, React
 * Native, Expo, or Supabase. Those are the app's adapters; this is the logic.
 */
export { SYNC_CORE_VERSION } from "./version";
export * from "./backoff";
export * from "./contract";
export * from "./engine";
export * from "./outbox";
export * from "./policies";
