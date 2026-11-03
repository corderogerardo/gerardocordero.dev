import { useSegments, useRouter } from "expo-router";
import { useEffect } from "react";

import type { SessionStatus } from "../../data/session-store";

/**
 * Sends the user to the right group of screens for their session state.
 *
 * This lives in one place on purpose: a redirect duplicated in two screens is how
 * an app ends up bouncing between sign-in and home after a token refresh.
 */
export function useProtectedRoute(status: SessionStatus) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === "booting") return;

    const inAuthGroup = segments[0] === "(auth)";

    if (status === "signed_out" && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
      return;
    }
    if (status === "signed_in" && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [status, segments, router]);
}
