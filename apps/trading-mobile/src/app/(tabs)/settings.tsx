import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { copy, env } from '@/config';
import { versionLabel } from '@/lib/version';
import { useSession } from '@/session/store';
import {
  Badge,
  Button,
  Card,
  Divider,
  KeyValue,
  Screen,
  ScreenHeader,
  colors,
  spacing,
  typography,
} from '@/ui';

export default function SettingsScreen() {
  const queryClient = useQueryClient();
  const user = useSession((state) => state.user);
  const signOut = useSession((state) => state.signOut);
  const [pending, setPending] = useState(false);

  async function onSignOut() {
    setPending(true);
    try {
      await signOut();
      queryClient.clear();
    } finally {
      setPending(false);
    }
  }

  return (
    <Screen scroll testID="screen-settings">
      <ScreenHeader title="Settings" />

      <View style={styles.stack}>
        <Card testID="settings-account">
          <Text style={styles.label}>Signed in as</Text>
          <Text style={styles.email}>{user?.email ?? '—'}</Text>
          {user?.displayName ? <Text style={styles.muted}>{user.displayName}</Text> : null}
        </Card>

        <Card>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Environment</Text>
            <Badge label="PAPER" testID="settings-environment" tone="warning" />
          </View>
          <Divider style={styles.divider} />
          <Text style={styles.muted}>{copy.disclaimer}</Text>
        </Card>

        <Card>
          <KeyValue label="App version" value={versionLabel()} />
          <KeyValue label="API" testID="settings-api" value={env.apiBaseUrl} />
          <KeyValue label="API version" value={copy.apiVersion} />
        </Card>

        <Button
          label="Sign out"
          loading={pending}
          onPress={() => void onSignOut()}
          testID="settings-sign-out"
          variant="secondary"
        />

        <Text style={styles.footer}>
          Paper trading only. Balances, fills and fees are simulated and reset with the
          environment.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  email: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  muted: {
    ...typography.caption,
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    minHeight: 28,
  },
  rowLabel: {
    ...typography.label,
    color: colors.text,
  },
  divider: {
    marginVertical: spacing.sm,
  },
  footer: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
