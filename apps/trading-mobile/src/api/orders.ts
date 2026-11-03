import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';

import { API_PATHS } from '@/config';

import { getApiClient } from './client';
import { parseOrThrow } from './errors';
import { portfolioKey } from './portfolio';
import {
  orderSchema,
  ordersPageSchema,
  type CreateOrderRequest,
  type Order,
  type OrdersPage,
  type OrderStatus,
} from './schemas';

/**
 * Orders. `POST /v1/orders` is retried only by the user, and only with the same
 * `Idempotency-Key` — so the mutation never retries on its own.
 */

export const ORDERS_PAGE_SIZE = 20;

export type OrderFilter = 'ALL' | OrderStatus;

export const orderKeys = {
  all: ['orders'] as const,
  list: (filter: OrderFilter) => [...orderKeys.all, 'list', filter] as const,
};

function ordersPath(options: {
  status?: OrderStatus;
  cursor?: string | null;
  limit?: number;
}): string {
  const limit = options.limit ?? ORDERS_PAGE_SIZE;
  const query = [`limit=${limit}`];
  if (options.status) query.unshift(`status=${options.status}`);
  if (options.cursor) query.push(`cursor=${encodeURIComponent(options.cursor)}`);
  return `${API_PATHS.orders}?${query.join('&')}`;
}

export async function fetchOrders(options: {
  status?: OrderStatus;
  cursor?: string | null;
  limit?: number;
} = {}): Promise<OrdersPage> {
  const raw = await getApiClient().request<unknown>(ordersPath(options));
  return parseOrThrow(ordersPageSchema, raw);
}

export async function createOrder(
  order: CreateOrderRequest,
  idempotencyKey: string,
): Promise<Order> {
  const raw = await getApiClient().request<unknown>(API_PATHS.orders, {
    method: 'POST',
    body: order,
    idempotencyKey,
  });

  return parseOrThrow(orderSchema, raw);
}

export async function cancelOrder(id: string): Promise<Order> {
  const raw = await getApiClient().request<unknown>(API_PATHS.cancelOrder(id), {
    method: 'POST',
    body: {},
  });

  return parseOrThrow(orderSchema, raw);
}

export function useOrders(filter: OrderFilter) {
  const status = filter === 'ALL' ? undefined : filter;

  return useInfiniteQuery({
    queryKey: orderKeys.list(filter),
    queryFn: ({ pageParam }) =>
      fetchOrders({
        status,
        cursor: pageParam,
        limit: ORDERS_PAGE_SIZE,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 5_000,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { order: CreateOrderRequest; idempotencyKey: string }) =>
      createOrder(input.order, input.idempotencyKey),
    onSuccess: () => {
      void invalidateTradingData(queryClient);
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelOrder(id),
    onSuccess: () => {
      void invalidateTradingData(queryClient);
    },
  });
}

/**
 * An order changes both the order book and the balance sheet, so both queries
 * are refreshed together after any successful order mutation.
 */
export async function invalidateTradingData(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: orderKeys.all }),
    queryClient.invalidateQueries({ queryKey: portfolioKey }),
  ]);
}
