import { Platform } from "react-native";

/**
 * Where the app talks to Supabase.
 *
 * Two platform facts worth knowing cold:
 *   * the iOS simulator shares the Mac's loopback, so `127.0.0.1` works;
 *   * the Android emulator is a virtual machine, so the host is `10.0.2.2`.
 *
 * The ports are 54341–54347, not the CLI defaults, because this repository's
 * `supabase/config.toml` shifts them to run beside another local stack. If you
 * change them here, change them there.
 */
const localApiUrl = Platform.select({
  android: "http://10.0.2.2:54341",
  default: "http://127.0.0.1:54341",
});

/**
 * The default anon key that `supabase start` prints for a **local** stack.
 *
 * Committing it is safe and intentional: it is the same on every machine, it is
 * already inside every local bundle, and it grants nothing on a hosted project.
 * A real deployment must set `EXPO_PUBLIC_SUPABASE_ANON_KEY`; the service-role key
 * must never appear in this repository or in the bundle.
 */
const LOCAL_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || (localApiUrl as string);
export const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || LOCAL_ANON_KEY;

/** True when the app is pointed at the machine's own Supabase stack. */
export const isLocalStack =
  supabaseUrl.includes("127.0.0.1") ||
  supabaseUrl.includes("10.0.2.2") ||
  supabaseUrl.includes("localhost");
