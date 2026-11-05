import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { describeApiError, isApiError } from '@/api/errors';
import { useCreateOrder } from '@/api/orders';
import type { Market, Order, OrderSide, OrderType } from '@/api/schemas';
import { newIdempotencyKey } from '@/lib/ids';
import { formatCurrency, formatQuantity } from '@/lib/money';
import {
  FEE_BPS,
  buildOrderPayload,
  estimateOrder,
  hasOrderErrors,
  validateOrderDraft,
  type OrderDraft,
  type OrderFieldErrors,
} from '@/lib/order-validation';
import { formatTimestamp } from '@/lib/datetime';
import {
  Badge,
  Button,
  Card,
  Divider,
  KeyValue,
  SegmentedControl,
  TextField,
  colors,
  spacing,
  typography,
} from '@/ui';

export interface OrderTicketProps {
  market: Pick<Market, 'symbol' | 'lastPrice' | 'tickSize'>;
  onSubmitted?: (order: Order) => void;
  testID?: string;
}

const SIDE_OPTIONS = [
  { value: 'BUY' as const, label: 'Buy', testID: 'order-side-buy' },
  { value: 'SELL' as const, label: 'Sell', testID: 'order-side-sell' },
];

const TYPE_OPTIONS = [
  { value: 'MARKET' as const, label: 'Market', testID: 'order-type-market' },
  { value: 'LIMIT' as const, label: 'Limit', testID: 'order-type-limit' },
];

interface Intent {
  key: string;
  fingerprint: string;
}

function notifySuccess(): void {
  try {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => undefined,
    );
  } catch {
    // Haptics are a nicety; a device without them still gets the confirmation.
  }
}

function fingerprintOf(draft: OrderDraft): string {
  return JSON.stringify([
    draft.symbol,
    draft.side,
    draft.type,
    draft.quantity.trim(),
    draft.type === 'LIMIT' ? draft.limitPrice.trim() : '',
  ]);
}

/**
 * Order entry.
 *
 * Idempotency contract: one key per submission intent. Retrying after a failure
 * reuses the key while the form is unchanged; editing any field starts a new
 * intent with a new key; a successful order ends the intent.
 */
export function OrderTicket({ market, onSubmitted, testID = 'order-ticket' }: OrderTicketProps) {
  const createOrder = useCreateOrder();

  const [side, setSide] = useState<OrderSide>('BUY');
  const [type, setType] = useState<OrderType>('MARKET');
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [errors, setErrors] = useState<OrderFieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Order | null>(null);

  const intent = useRef<Intent | null>(null);

  const draft: OrderDraft = { symbol: market.symbol, side, type, quantity, limitPrice };
  const estimate = estimateOrder(draft, market.lastPrice);
  const pending = createOrder.isPending;

  function changeType(next: OrderType) {
    setType(next);
    // The limit field is hidden for market orders; clear it so a stale value
    // cannot silently block the submission.
    if (next === 'MARKET') setLimitPrice('');
    setErrors({});
    setApiError(null);
  }

  async function submit() {
    const validation = validateOrderDraft(draft, { referencePrice: market.lastPrice });
    setErrors(validation);
    setApiError(null);
    // A new submission replaces the previous confirmation.
    setConfirmation(null);

    if (hasOrderErrors(validation)) return;

    const fingerprint = fingerprintOf(draft);
    const key =
      intent.current?.fingerprint === fingerprint ? intent.current.key : newIdempotencyKey();
    intent.current = { key, fingerprint };

    try {
      const order = await createOrder.mutateAsync({
        order: buildOrderPayload(draft),
        idempotencyKey: key,
      });

      intent.current = null;
      setConfirmation(order);
      setErrors({});
      setApiError(null);
      setQuantity('');
      notifySuccess();
      onSubmitted?.(order);
    } catch (error) {
      const message = describeApiError(error, 'order');
      setApiError(message);

      const field = isApiError(error) ? error.field : undefined;
      if (field === 'quantity' || field === 'limitPrice') {
        setErrors({ [field]: message });
      }
    }
  }

  return (
    <View style={styles.container} testID={testID}>
      {confirmation ? <OrderConfirmation order={confirmation} /> : null}

      <Card>
        <Text style={styles.heading}>Order ticket</Text>

        <SegmentedControl
          accessibilityLabel="Order side"
          onChange={setSide}
          options={SIDE_OPTIONS}
          testID="order-side"
          value={side}
        />

        <SegmentedControl
          accessibilityLabel="Order type"
          onChange={changeType}
          options={TYPE_OPTIONS}
          testID="order-type"
          value={type}
        />

        <TextField
          autoCapitalize="none"
          autoCorrect={false}
          error={errors.quantity}
          keyboardType="decimal-pad"
          label="Quantity"
          onChangeText={setQuantity}
          placeholder="0.00"
          testID="order-quantity"
          value={quantity}
        />

        {type === 'LIMIT' ? (
          <TextField
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.limitPrice}
            keyboardType="decimal-pad"
            label="Limit price"
            onChangeText={setLimitPrice}
            placeholder={formatCurrency(market.lastPrice)}
            testID="order-limit-price"
            value={limitPrice}
          />
        ) : null}

        <Divider style={styles.divider} />

        <KeyValue
          label="Estimated notional"
          testID="order-estimate-notional"
          value={estimate.notional ? formatCurrency(estimate.notional) : '—'}
        />
        <KeyValue
          label={`Estimated fee (${FEE_BPS} bps)`}
          testID="order-estimate-fee"
          value={estimate.fee ? formatCurrency(estimate.fee) : '—'}
        />

        {apiError && !errors.quantity && !errors.limitPrice ? (
          <Text accessibilityLiveRegion="polite" style={styles.apiError} testID="order-error">
            {apiError}
          </Text>
        ) : null}

        <Button
          disabled={pending}
          label={`${side === 'BUY' ? 'Buy' : 'Sell'} ${market.symbol}`}
          loading={pending}
          onPress={() => void submit()}
          testID="order-submit"
        />

        <Text style={styles.note}>Market orders fill immediately at the simulated price.</Text>
      </Card>
    </View>
  );
}

function OrderConfirmation({ order }: { order: Order }) {
  return (
    <Card style={styles.confirmation} testID="order-confirmation">
      <View style={styles.confirmationHeader}>
        <Text style={styles.heading}>Order {order.status.toLowerCase()}</Text>
        <Badge label={order.status} tone={order.status === 'FILLED' ? 'up' : 'accent'} />
      </View>
      <Text style={styles.confirmationLine}>
        {order.side} {formatQuantity(order.quantity)} {order.symbol}
        {order.averageFillPrice ? ` at ${formatCurrency(order.averageFillPrice)}` : ''}
      </Text>
      <Text style={styles.note}>
        Fee {formatCurrency(order.fee)} · {formatTimestamp(order.createdAt)}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  heading: {
    ...typography.title,
    color: colors.text,
  },
  divider: {
    marginVertical: spacing.xs,
  },
  apiError: {
    ...typography.label,
    color: colors.danger,
  },
  note: {
    ...typography.caption,
    color: colors.textMuted,
  },
  confirmation: {
    borderColor: colors.up,
    gap: spacing.xs,
  },
  confirmationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  confirmationLine: {
    ...typography.body,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
});
