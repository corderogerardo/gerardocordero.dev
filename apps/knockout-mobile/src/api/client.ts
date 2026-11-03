import type { Database } from "@gerardocordero/sync-core/database.types";
import { createClient } from "@supabase/supabase-js";

import { supabaseAnonKey, supabaseUrl } from "./config";
import { secureSessionStorage } from "./storage";

/**
 * The single Supabase client.
 *
 * `Database` is generated from the local schema (`supabase gen types typescript
 * --local`). That is what makes a column rename a compile error instead of a blank
 * screen in the field — the closest thing this stack has to a type-safe API contract.
 *
 * `detectSessionInUrl` is off because this is not a browser: there is no URL to
 * parse, and leaving it on makes the client look for a hash that never exists.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureSessionStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: { "x-application-name": "knockout-mobile" },
  },
});

export type Session = Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"];
