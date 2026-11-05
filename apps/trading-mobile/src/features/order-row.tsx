import { StyleSheet, Text, View } from 'react-native';

import type { Order, OrderStatus } from '@/api/schemas';
import { formatQuantity, formatCurrency } from '@/lib/money';
import { formatTimestamp } from '@/lib/datetime';
import { Badge, Button, Card, colors, type BadgeTone, spacing, typography } from '@/ui';

export interface OrderRowProps {
  order: Order;
  onCancel?: (id: string) => void;
  cancelling?: boolean;
}

const STATUS_TONE: Record<OrderStatus, BadgeTone> = {
  OPEN: 'accent',
  FILLED: 'up',
  CANCELLED: 'neutral',
  REJECTED: 'down',
};

function detail(order: Order): string {
  const parts = [order.type === 'MARKET' ? 'Market' : 'Limit', `${formatQuantity(order.quantity)} units`];
  if (order.limitPrice) parts.push(`limit ${formatCurrency(order.limitPrice)}`);
  if (order.averageFillPrice) parts.push(`filled at ${formatCurrency(order.averageFillPrice)}`);
  return parts.join(' · ');
}

export function OrderRow({ order, onCancel, cancelling = false }: OrderRowProps) {
  return (
    <Card testID={`order-${order.id}`}>
      <View style={styles.header}>
        <Text style={styles.symbol}>{order.symbol}</Text>
        <Badge label={order.status} tone={STATUS_TONE[order.status]} />
      </View>

      <Text style={styles.detail}>
        <Text style={order.side === 'BUY' ? styles.buy : styles.sell}>{order.side}</Text>
        {`  ${detail(order)}`}
      </Text>

      <View style={styles.meta}>
        <Text style={styles.timestamp}>{formatTimestamp(order.createdAt)}</Text>
        <Text style={styles.fee}>Fee {formatCurrency(order.fee)}</Text>
      </View>

      {order.status === 'OPEN' && onCancel ? (
        <Button
          label="Cancel order"
          variant="secondary"
          loading={cancelling}
          onPress={() => onCancel(order.id)}
          testID={`cancel-order-${order.id}`}
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  symbol: {
    ...typography.title,
    color: colors.text,
  },
  detail: {
    ...typography.label,
    color: colors.textMuted,
  },
  buy: {
    color: colors.up,
    fontWeight: '700',
  },
  sell: {
    color: colors.down,
    fontWeight: '700',
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  timestamp: {
    ...typography.caption,
  },
  fee: {
    ...typography.caption,
  },
});
