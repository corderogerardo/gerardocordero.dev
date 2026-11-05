import { StyleSheet, Text, View } from 'react-native';

import { formatPercent, formatSignedPercent } from '@/lib/money';

import { trendBackground, trendColor, typography, radius, spacing } from './theme';
import { trendOf } from './trend';

export interface ChangeBadgeProps {
  /** Percentage points, as the API sends them: `"0.1537"` is 0.15%. */
  changePercent: string;
  /** Optional context, e.g. the symbol, for the spoken label. */
  context?: string;
  testID?: string;
}

/**
 * Direction is encoded three ways — sign, colour and the accessibility label —
 * so it never depends on colour alone.
 */
export function ChangeBadge({ changePercent, context, testID }: ChangeBadgeProps) {
  const trend = trendOf(changePercent);
  const spoken =
    trend === 'up'
      ? `Up ${formatPercent(changePercent)}`
      : trend === 'down'
        ? `Down ${formatPercent(changePercent)}`
        : 'Unchanged';

  return (
    <View
      accessibilityLabel={context ? `${context}: ${spoken}` : spoken}
      style={[styles.badge, { backgroundColor: trendBackground(trend) }]}
      testID={testID}
    >
      <Text style={[styles.value, { color: trendColor(trend) }]}>
        {formatSignedPercent(changePercent)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  value: {
    ...typography.label,
    fontWeight: '600',
  },
});
