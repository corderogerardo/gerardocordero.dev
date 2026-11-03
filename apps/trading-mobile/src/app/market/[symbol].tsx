import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { apiRequestId, describeApiError } from '@/api/errors';
import { useHistory, useMarket } from '@/api/markets';
import { OrderTicket } from '@/features/order-ticket';
import { formatTimestamp } from '@/lib/datetime';
import { formatCurrency } from '@/lib/money';
import { useQuotes } from '@/stream/use-quotes';
import {
  Badge,
  ChangeBadge,
  ErrorState,
  PriceChart,
  Screen,
  Skeleton,
  Stat,
  colors,
  numeric,
  spacing,
  trendOf,
  typography,
} from '@/ui';

export default function MarketDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ symbol?: string | string[] }>();
  const rawSymbol = params.symbol;
  const symbol = (Array.isArray(rawSymbol) ? (rawSymbol[0] ?? '') : (rawSymbol ?? '')).toUpperCase();

  const market = useMarket(symbol);
  const history = useHistory(symbol);
  const data = market.data?.market;

  useQuotes(symbol.length > 0 ? [symbol] : []);

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  }

  return (
    <Screen scroll edges={['top', 'bottom']} testID="screen-market-detail">
      <View style={styles.topBar}>
        <Pressable
          accessibilityLabel="Back"
          accessibilityRole="button"
          hitSlop={8}
          onPress={goBack}
          style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
          testID="market-detail-back"
        >
          <Ionicons color={colors.text} name="chevron-back" size={22} />
        </Pressable>
        <Text style={styles.topSymbol} numberOfLines={1}>
          {data?.symbol ?? (symbol || 'Market')}
        </Text>
        <View style={styles.topSpacer} />
      </View>

      {symbol.length === 0 ? (
        <ErrorState message="This market link is missing a symbol." testID="market-detail-error" />
      ) : null}

      {market.isPending && symbol.length > 0 ? <MarketLoading /> : null}

      {market.isError ? (
        <ErrorState
          message={describeApiError(market.error)}
          onRetry={() => void market.refetch()}
          requestId={apiRequestId(market.error)}
          testID="market-detail-error"
        />
      ) : null}

      {data ? (
        <View style={styles.body}>
          <View style={styles.priceBlock}>
            <View style={styles.titleRow}>
              <Text style={styles.name}>{data.name}</Text>
              <Badge label={data.kind} />
            </View>

            <Text style={[styles.price, numeric]}>{formatCurrency(data.lastPrice)}</Text>

            <View style={styles.priceMeta}>
              <ChangeBadge changePercent={data.changePercent} context={data.symbol} />
              <Text style={styles.updated}>{formatTimestamp(data.updatedAt)}</Text>
            </View>
          </View>

          <View style={styles.stats}>
            <Stat label="Session high" value={formatCurrency(data.high)} />
            <Stat label="Session low" value={formatCurrency(data.low)} />
          </View>

          {history.isError ? (
            <Text style={styles.chartError} testID="market-detail-chart-error">
              The price history is unavailable right now.
            </Text>
          ) : (
            <PriceChart
              accessibilityLabel={`${data.name} price history`}
              points={history.data?.points ?? []}
              testID="market-detail-chart"
              trend={trendOf(data.changePercent)}
            />
          )}

          <OrderTicket market={data} />
        </View>
      ) : null}
    </Screen>
  );
}

function MarketLoading() {
  return (
    <View
      accessibilityLabel="Loading market"
      accessibilityRole="progressbar"
      style={styles.loading}
      testID="market-detail-loading"
    >
      <Skeleton height={28} width="40%" />
      <Skeleton height={44} width="70%" />
      <Skeleton height={120} />
      <Skeleton height={220} />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  back: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderRadius: 8,
  },
  backPressed: {
    opacity: 0.6,
  },
  topSymbol: {
    ...typography.title,
    color: colors.text,
  },
  topSpacer: {
    width: 44,
  },
  body: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  priceBlock: {
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: {
    ...typography.body,
    color: colors.textMuted,
    flexShrink: 1,
  },
  price: {
    ...typography.display,
    color: colors.text,
  },
  priceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  updated: {
    ...typography.caption,
    color: colors.textMuted,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  chartError: {
    ...typography.label,
    color: colors.textMuted,
  },
  loading: {
    gap: spacing.md,
    paddingTop: spacing.md,
  },
});
