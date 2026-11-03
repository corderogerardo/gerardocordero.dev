import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from './theme';

export type BadgeTone = 'accent' | 'up' | 'down' | 'neutral' | 'warning';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  testID?: string;
}

const tones: Record<BadgeTone, { background: string; text: string }> = {
  accent: { background: colors.surfaceElevated, text: colors.accent },
  up: { background: colors.upSoft, text: colors.up },
  down: { background: colors.downSoft, text: colors.down },
  neutral: { background: colors.surfaceElevated, text: colors.textMuted },
  warning: { background: colors.surfaceElevated, text: colors.warning },
};

export function Badge({ label, tone = 'neutral', testID }: BadgeProps) {
  const palette = tones[tone];

  return (
    <View style={[styles.badge, { backgroundColor: palette.background }]} testID={testID}>
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});
