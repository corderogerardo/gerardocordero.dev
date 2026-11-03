import { useQuery } from '@tanstack/react-query';

import { API_PATHS } from '@/config';

import { getApiClient } from './client';
import { parseOrThrow } from './errors';
import {
  marketDetailResponseSchema,
  marketHistoryResponseSchema,
  marketsResponseSchema,
  type MarketDetailResponse,
  type MarketHistoryResponse,
  type MarketsResponse,
} from './schemas';

/**
 * Market data. Quotes arrive over the WebSocket; these queries are the
 * authoritative snapshot and the fallback when the socket is down.
 */

export const DEFAULT_HISTORY_POINTS = 60;

export const marketKeys = {
  all: ['markets'] as const,
  list: () => [...marketKeys.all, 'list'] as const,
  detail: (symbol: string) => [...marketKeys.all, 'detail', symbol] as const,
  history: (symbol: string, points: number) =>
    [...marketKeys.all, 'history', symbol, points] as const,
};

export async function fetchMarkets(): Promise<MarketsResponse> {
  const raw = await getApiClient().request<unknown>(API_PATHS.markets);
  return parseOrThrow(marketsResponseSchema, raw);
}

export async function fetchMarket(symbol: string): Promise<MarketDetailResponse> {
  const raw = await getApiClient().request<unknown>(API_PATHS.market(symbol));
  return parseOrThrow(marketDetailResponseSchema, raw);
}

export async function fetchHistory(
  symbol: string,
  points = DEFAULT_HISTORY_POINTS,
): Promise<MarketHistoryResponse> {
  const raw = await getApiClient().request<unknown>(API_PATHS.history(symbol, points));
  return parseOrThrow(marketHistoryResponseSchema, raw);
}

export function useMarkets() {
  return useQuery({
    queryKey: marketKeys.list(),
    queryFn: fetchMarkets,
    staleTime: 10_000,
  });
}

export function useMarket(symbol: string) {
  return useQuery({
    queryKey: marketKeys.detail(symbol),
    queryFn: () => fetchMarket(symbol),
    staleTime: 10_000,
    enabled: symbol.length > 0,
  });
}

export function useHistory(symbol: string, points = DEFAULT_HISTORY_POINTS) {
  return useQuery({
    queryKey: marketKeys.history(symbol, points),
    queryFn: () => fetchHistory(symbol, points),
    staleTime: 60_000,
    enabled: symbol.length > 0,
  });
}
