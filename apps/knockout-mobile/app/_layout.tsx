import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useSessionStore } from "../src/data/session";
import { useProtectedRoute } from "../src/features/auth/use-protected-route";
import { colors } from "../src/ui/tokens";

/**
 * Root layout. It owns the provider stack and the auth gate, nothing else:
 *
 *   * `bootstrap()` runs once, restoring the session and the cached profile;
 *   * `useProtectedRoute` moves the user between the auth group and the tabs;
 *   * the query client and the sync runtime join this stack in T8 and T9.
 */
export default function RootLayout() {
  const status = useSessionStore((state) => state.status);
  const bootstrap = useSessionStore((state) => state.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useProtectedRoute(status);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
