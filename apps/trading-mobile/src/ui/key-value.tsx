import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from './theme';

export interface KeyValueProps {
  label: string;
  value: string;
  /** Colour the value, e.g. for a P&L row. */
  valueColor?: string;
  testID?: string;
}

/** One labelled figure per row: label muted on the left, number on the right. */
export function KeyValue({ label, value, valueColor = colors.text, testID }: KeyValueProps) {
  return (
    <View style={styles.row} testID={testID}>
      <Text style={styles.label}>{label}</Text>
      <Text
        accessibilityLabel={`${label}: ${value}`}
        style={[styles.value, { color: valueColor }]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 24,
  },
  label: {
    ...typography.label,
    color: colors.textMuted,
    flexShrink: 1,
  },
  value: {
    ...typography.label,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
});
