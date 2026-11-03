import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { apiRequestId, describeApiError } from '@/api/errors';
import { usePortfolio } from '@/api/portfolio';
import { PositionCard } from '@/features/position-card';
import { copy } from '@/config';
import { formatCurrency, formatSignedCurrency } from '@/lib/money';
import {
  Card,
  Divider,
  EmptyState,
  ErrorState,
  Screen,
  ScreenHeader,
  Skeleton,
  Stat,
  colors,
  numeric,
  spacing,
  trendOf,
  typography,
} from '@/ui';

export default function PortfolioScreen() {
  const portfolio = usePortfolio();
  const data = portfolio.data;
  const retry = () => void portfolio.refetch();

  return (
    <Screen testID="screen-portfolio">
      <ScreenHeader title="Portfolio" subtitle="Paper account · USD" />

      {portfolio.isPending ? <PortfolioLoading /> : null}

      {portfolio.isError ? (
        <ErrorState
          message={describeApiError(portfolio.error)}
          onRetry={retry}
          requestId={apiRequestId(portfolio.error)}
          testID="portfolio-error"
        />
      ) : null}

      {data ? (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              onRefresh={retry}
              refreshing={portfolio.isRefetching}
              tintColor={colors.textMuted}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <Card testID="portfolio-summary">
            <Text style={styles.equityLabel}>Equity</Text>
            <Text style={[styles.equity, numeric]}>
              {formatCurrency(data.equity, data.currency)}
            </Text>
            <Divider style={styles.divider} />
            <View style={styles.statRow}>
              <Stat label="Cash" value={formatCurrency(data.cash, data.currency)} />
              <Stat
                label="Unrealized P&L"
                tone={trendOf(data.unrealizedPnl)}
                value={formatSignedCurrency(data.unrealizedPnl, data.currency)}
              />
            </View>
            <View style={styles.statRow}>
              <Stat
                label="Realized P&L"
                tone={trendOf(data.realizedPnl)}
                value={formatSignedCurrency(data.realizedPnl, data.currency)}
              />
              <Stat label="Open positions" value={String(data.positions.length)} />
            </View>
          </Card>

          <Text style={styles.sectionTitle}>Positions</Text>

          {data.positions.length === 0 ? (
            <EmptyState
              message="Filled orders will show their quantity, average cost and P&L here."
              testID="portfolio-empty"
              title="No open positions"
            />
          ) : (
            <View style={styles.positions}>
              {data.positions.map((position) => (
                <PositionCard key={position.symbol} position={position} />
              ))}
            </View>
          )}

          <Text style={styles.disclaimer}>{copy.disclaimer}</Text>
        </ScrollView>
      ) : null}
    </Screen>
  );
}

function PortfolioLoading() {
  return (
    <View
      accessibilityLabel="Loading portfolio"
      accessibilityRole="progressbar"
      style={styles.loading}
      testID="portfolio-loading"
    >
      <Skeleton height={132} />
      <Skeleton height={96} />
      <Skeleton height={96} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  equityLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  equity: {
    ...typography.display,
    color: colors.text,
  },
  divider: {
    marginVertical: spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.sm,
  },
  positions: {
    gap: spacing.md,
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  loading: {
    gap: spacing.md,
  },
});
