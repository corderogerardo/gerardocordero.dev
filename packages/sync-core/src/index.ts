/**
 * @gerardocordero/sync-core
 *
 * Framework-free offline sync engine. It knows nothing about React, Expo, or
 * Supabase: the runtime supplies those through ports (see engine.ts).
 *
 * Read order for a newcomer: contract -> backoff -> policies -> outbox -> engine.
 */
export const SYNC_CORE_VERSION = "0.1.0";
