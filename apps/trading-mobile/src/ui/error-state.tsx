import { StyleSheet, Text, View } from 'react-native';

import { Button } from './button';
import { colors, spacing, typography } from './theme';

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  /** Server request id for support, shown only when present. */
  requestId?: string | null;
  testID?: string;
}

export function ErrorState({
  message,
  onRetry,
  retryLabel = 'Try again',
  requestId,
  testID,
}: ErrorStateProps) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.container} testID={testID}>
      <Text style={styles.title}>{message}</Text>
      {requestId ? <Text style={styles.reference}>Reference {requestId}</Text> : null}
      {onRetry ? (
        <Button
          label={retryLabel}
          onPress={onRetry}
          variant="secondary"
          style={styles.action}
          testID={testID ? `${testID}-retry` : undefined}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
  },
  reference: {
    ...typography.caption,
    color: colors.textMuted,
  },
  action: {
    marginTop: spacing.md,
  },
});
