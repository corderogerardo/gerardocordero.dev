import { StyleSheet, Text, View } from 'react-native';

import { colors, trendColor, typography } from './theme';

export type StatTone = 'default' | 'up' | 'down' | 'flat';

export interface StatProps {
  label: string;
  value: string;
  hint?: string;
  tone?: StatTone;
  testID?: string;
}

/** Label above, number below — the number is the hero. */
export function Stat({ label, value, hint, tone = 'default', testID }: StatProps) {
  const valueColor = tone === 'default' ? colors.text : trendColor(tone);

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.label}>{label}</Text>
      <Text accessibilityLabel={`${label}: ${value}`} style={[styles.value, { color: valueColor }]}>
        {value}
      </Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 2,
    minWidth: 96,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  value: {
    ...typography.title,
    fontVariant: ['tabular-nums'],
  },
  hint: {
    ...typography.caption,
  },
});
