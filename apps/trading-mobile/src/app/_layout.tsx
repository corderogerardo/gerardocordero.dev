import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { isApiError } from '@/api/errors';
import { useSession } from '@/session/store';
import { Badge, colors, spacing, typography } from '@/ui';

/**
 * Root layout: providers, session bootstrap, and the auth guard.
 *
 * The guard is an effect on `useSegments()` + `router.replace` (not
 * `Stack.Protected`), and the navigator always renders on the first frame —
 * expo-router cannot navigate before the root navigator mounts.
 */

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5_000,
        retry: (failureCount, error) =>
          failureCount < 1 &&
          isApiError(error) &&
          (error.status === 0 || error.status >= 500),
      },
      mutations: { retry: 0 },
    },
  });
}

function BootSplash() {
  return (
    <View accessibilityLabel="Loading Meridian" style={styles.splash} testID="boot-splash">
      <Text style={styles.wordmark}>Meridian</Text>
      <Badge label="PAPER" tone="warning" />
      <ActivityIndicator color={colors.textMuted} style={styles.spinner} />
    </View>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(createQueryClient);
  const status = useSession((state) => state.status);
  const segments = useSegments();
  const inAuthGroup = segments[0] === '(auth)';

  useEffect(() => {
    void useSession.getState().bootstrap();
  }, []);

  useEffect(() => {
    if (status === 'signedOut' && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
      return;
    }
    if (status === 'signedIn' && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [status, inAuthGroup]);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {status === 'bootstrapping' ? (
          <BootSplash />
        ) : (
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: styles.stack,
            }}
          >
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="market/[symbol]" />
          </Stack>
        )}
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  stack: {
    backgroundColor: colors.background,
  },
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  wordmark: {
    ...typography.display,
    color: colors.text,
    letterSpacing: 1,
  },
  spinner: {
    marginTop: spacing.lg,
  },
});
