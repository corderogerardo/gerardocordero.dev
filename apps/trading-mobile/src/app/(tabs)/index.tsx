import { useRouter } from 'expo-router';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { apiRequestId, describeApiError } from '@/api/errors';
import { useMarkets } from '@/api/markets';
import { MarketRow } from '@/features/market-row';
import { useQuotes } from '@/stream/use-quotes';
import {
  EmptyState,
  ErrorState,
  Screen,
  ScreenHeader,
  Skeleton,
  colors,
  spacing,
} from '@/ui';

export default function MarketsScreen() {
  const router = useRouter();
  const markets = useMarkets();
  const rows = markets.data?.data ?? [];

  // Live prices for whatever is on screen; the REST snapshot rendered first.
  useQuotes(rows.map((market) => market.symbol));

  const retry = () => void markets.refetch();

  return (
    <Screen testID="screen-markets">
      <ScreenHeader title="Markets" subtitle={`${rows.length} instruments · PAPER`} />

      {markets.isPending ? <MarketsLoading /> : null}

      {markets.isError ? (
        <ErrorState
          message={describeApiError(markets.error)}
          onRetry={retry}
          requestId={apiRequestId(markets.error)}
          testID="markets-error"
        />
      ) : null}

      {markets.isSuccess && rows.length === 0 ? (
        <EmptyState
          actionLabel="Refresh"
          message="The paper market simulator has not published any instruments yet."
          onAction={retry}
          testID="markets-empty"
          title="No markets"
        />
      ) : null}

      {markets.isSuccess && rows.length > 0 ? (
        <FlatList
          contentContainerStyle={styles.list}
          data={rows}
          keyExtractor={(item) => item.symbol}
          refreshControl={
            <RefreshControl
              onRefresh={retry}
              refreshing={markets.isRefetching}
              tintColor={colors.textMuted}
            />
          }
          renderItem={({ item }) => (
            <MarketRow market={item} onPress={() => router.push(`/market/${item.symbol}`)} />
          )}
          showsVerticalScrollIndicator={false}
        />
      ) : null}
    </Screen>
  );
}

function MarketsLoading() {
  return (
    <View
      accessibilityLabel="Loading markets"
      accessibilityRole="progressbar"
      style={styles.skeletonList}
      testID="markets-loading"
    >
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <Skeleton key={index} height={56} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: spacing.xl,
  },
  skeletonList: {
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
});
