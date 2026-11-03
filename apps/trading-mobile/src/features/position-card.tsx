import { StyleSheet, Text, View } from 'react-native';

import type { Position } from '@/api/schemas';
import {
  formatCurrency,
  formatQuantity,
  formatSignedCurrency,
  formatSignedPercent,
} from '@/lib/money';
import { Card, Divider, KeyValue, colors, numeric, spacing, trendColor, trendOf, typography } from '@/ui';

export interface PositionCardProps {
  position: Position;
}

export function PositionCard({ position }: PositionCardProps) {
  const trend = trendOf(position.unrealizedPnl);
  const pnlColor = trendColor(trend);

  return (
    <Card testID={`position-${position.symbol}`}>
      <View style={styles.header}>
        <View style={styles.identity}>
          <Text style={styles.symbol}>{position.symbol}</Text>
          <Text style={styles.quantity}>{formatQuantity(position.quantity)} units</Text>
        </View>
        <View style={styles.value}>
          <Text style={[styles.marketValue, numeric]}>
            {formatCurrency(position.marketValue)}
          </Text>
          <Text style={[styles.pnl, { color: pnlColor }]}>
            {formatSignedCurrency(position.unrealizedPnl)} (
            {formatSignedPercent(position.unrealizedPnlPercent)})
          </Text>
        </View>
      </View>

      <Divider style={styles.divider} />

      <KeyValue label="Average cost" value={formatCurrency(position.averageCost)} />
      <KeyValue label="Market price" value={formatCurrency(position.marketPrice)} />
      <KeyValue
        label="Unrealized P&L"
        value={formatSignedCurrency(position.unrealizedPnl)}
        valueColor={pnlColor}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  identity: {
    flex: 1,
    gap: 2,
  },
  symbol: {
    ...typography.title,
    color: colors.text,
  },
  quantity: {
    ...typography.caption,
  },
  value: {
    alignItems: 'flex-end',
    gap: 2,
  },
  marketValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  pnl: {
    ...typography.caption,
    fontWeight: '600',
  },
  divider: {
    marginVertical: spacing.xs,
  },
});
