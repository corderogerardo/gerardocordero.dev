import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { apiRequestId, describeApiError } from '@/api/errors';
import { useCancelOrder, useOrders, type OrderFilter } from '@/api/orders';
import type { Order } from '@/api/schemas';
import { OrderRow } from '@/features/order-row';
import {
  Button,
  EmptyState,
  ErrorState,
  Screen,
  ScreenHeader,
  SegmentedControl,
  Skeleton,
  colors,
  spacing,
  typography,
} from '@/ui';

const FILTERS = [
  { value: 'ALL' as const, label: 'All', testID: 'orders-filter-all' },
  { value: 'OPEN' as const, label: 'Open', testID: 'orders-filter-open' },
  { value: 'FILLED' as const, label: 'Filled', testID: 'orders-filter-filled' },
  { value: 'CANCELLED' as const, label: 'Cancelled', testID: 'orders-filter-cancelled' },
];

export default function OrdersScreen() {
  const [filter, setFilter] = useState<OrderFilter>('ALL');
  const [actionError, setActionError] = useState<string | null>(null);
  const orders = useOrders(filter);
  const cancel = useCancelOrder();

  const rows = orders.data?.pages.flatMap((page) => page.data) ?? [];
  const retry = () => void orders.refetch();

  async function onCancel(id: string) {
    setActionError(null);
    try {
      await cancel.mutateAsync(id);
    } catch (error) {
      // Cancelling is idempotent server-side, so the user can simply try again.
      setActionError(describeApiError(error));
    }
  }

  return (
    <Screen testID="screen-orders">
      <ScreenHeader title="Orders" subtitle="Newest first · PAPER" />

      <SegmentedControl
        accessibilityLabel="Filter orders by status"
        onChange={setFilter}
        options={FILTERS}
        testID="orders-filter"
        value={filter}
      />

      {orders.isPending ? <OrdersLoading /> : null}

      {orders.isError ? (
        <ErrorState
          message={describeApiError(orders.error)}
          onRetry={retry}
          requestId={apiRequestId(orders.error)}
          testID="orders-error"
        />
      ) : null}

      {actionError ? (
        <Text accessibilityLiveRegion="polite" style={styles.actionError} testID="orders-action-error">
          {actionError}
        </Text>
      ) : null}

      {orders.isSuccess ? (
        <FlatList
          contentContainerStyle={styles.list}
          data={rows}
          keyExtractor={(order: Order) => order.id}
          ListEmptyComponent={
            <EmptyState
              message={
                filter === 'ALL'
                  ? 'Submit an order from any market to see it here.'
                  : `No ${filter.toLowerCase()} orders yet.`
              }
              testID="orders-empty"
              title="No orders"
            />
          }
          ListFooterComponent={
            <OrdersFooter
              hasNextPage={orders.hasNextPage}
              loadingMore={orders.isFetchingNextPage}
              onLoadMore={() => void orders.fetchNextPage()}
              total={rows.length}
            />
          }
          refreshControl={
            <RefreshControl
              onRefresh={retry}
              refreshing={orders.isRefetching && !orders.isFetchingNextPage}
              tintColor={colors.textMuted}
            />
          }
          renderItem={({ item }) => (
            <OrderRow
              cancelling={cancel.isPending && cancel.variables === item.id}
              onCancel={(id) => void onCancel(id)}
              order={item}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      ) : null}
    </Screen>
  );
}

function OrdersFooter({
  hasNextPage,
  loadingMore,
  onLoadMore,
  total,
}: {
  hasNextPage: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  total: number;
}) {
  if (total === 0) return null;

  if (!hasNextPage) {
    return (
      <View style={styles.end}>
        <View style={styles.endRule} />
        <Text style={styles.endLabel}>End of history</Text>
      </View>
    );
  }

  return (
    <View style={styles.footer}>
      <Button
        disabled={loadingMore}
        label="Load more"
        loading={loadingMore}
        onPress={onLoadMore}
        testID="orders-load-more"
        variant="secondary"
      />
    </View>
  );
}

function OrdersLoading() {
  return (
    <View
      accessibilityLabel="Loading orders"
      accessibilityRole="progressbar"
      style={styles.loading}
      testID="orders-loading"
    >
      {[0, 1, 2].map((index) => (
        <Skeleton key={index} height={112} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  loading: {
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  footer: {
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  end: {
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  endRule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  endLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  actionError: {
    ...typography.label,
    color: colors.danger,
    paddingTop: spacing.sm,
  },
});
