import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Market } from '@/api/schemas';
import { formatCurrency, formatSignedPercent } from '@/lib/money';
import { ChangeBadge, colors, numeric, spacing, typography } from '@/ui';

export interface MarketRowProps {
  market: Market;
  onPress: () => void;
}

export function MarketRow({ market, onPress }: MarketRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${market.symbol}, ${market.name}, last price ${formatCurrency(
        market.lastPrice,
      )}, ${formatSignedPercent(market.changePercent)} since open`}
      accessibilityHint="Opens the market and the order ticket"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      testID={`market-row-${market.symbol}`}
    >
      <View style={styles.identity}>
        <Text style={styles.symbol}>{market.symbol}</Text>
        <Text numberOfLines={1} style={styles.name}>
          {market.name}
        </Text>
      </View>

      <View style={styles.quote}>
        <Text style={[styles.price, numeric]}>{formatCurrency(market.lastPrice)}</Text>
        <ChangeBadge changePercent={market.changePercent} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 64,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.surface,
  },
  identity: {
    flex: 1,
    gap: 2,
  },
  symbol: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
  },
  name: {
    ...typography.caption,
  },
  quote: {
    alignItems: 'flex-end',
    gap: 2,
  },
  price: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
});
