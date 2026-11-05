import { useEffect, useMemo } from 'react';

import { useQueryClient, type QueryClient } from '@tanstack/react-query';

import { marketKeys } from '@/api/markets';
import type { MarketDetailResponse, MarketsResponse, Quote } from '@/api/schemas';
import { env } from '@/config';

import { createMarketStream, streamUrl } from './market-stream';

/**
 * Quote fan-out into the query cache.
 *
 * The REST snapshot renders first; socket frames then patch the cached price
 * fields so the list and the open detail screen update in place without a
 * refetch. Only quote-derived fields are overwritten.
 */

function patchMarket<T extends { lastPrice: string; changePercent: string; high: string; low: string; updatedAt: string }>(
  market: T,
  quote: Quote,
): T {
  return {
    ...market,
    lastPrice: quote.price,
    changePercent: quote.changePercent,
    high: quote.high,
    low: quote.low,
    updatedAt: quote.updatedAt,
  };
}

export function applyQuotes(queryClient: QueryClient, quotes: Quote[]): void {
  if (quotes.length === 0) return;

  const bySymbol = new Map(quotes.map((quote) => [quote.symbol, quote]));

  queryClient.setQueryData<MarketsResponse>(marketKeys.list(), (previous) => {
    if (!previous) return previous;

    let changed = false;
    const data = previous.data.map((market) => {
      const quote = bySymbol.get(market.symbol);
      if (!quote) return market;
      changed = true;
      return patchMarket(market, quote);
    });

    return changed ? { ...previous, data } : previous;
  });

  for (const [symbol, quote] of bySymbol) {
    queryClient.setQueryData<MarketDetailResponse>(marketKeys.detail(symbol), (previous) =>
      previous ? { ...previous, market: patchMarket(previous.market, quote) } : previous,
    );
  }
}

/**
 * Subscribe to public quotes for `symbols` while the calling screen is mounted.
 * Re-subscribes automatically after a reconnect; see `market-stream.ts`.
 */
export function useQuotes(symbols: readonly string[]): void {
  const queryClient = useQueryClient();
  const signature = symbols.join(',');

  const stableSymbols = useMemo(
    () => [...signature.split(',')].filter((symbol) => symbol.length > 0).sort(),
    [signature],
  );

  useEffect(() => {
    if (stableSymbols.length === 0) return;

    const stream = createMarketStream({
      url: streamUrl(env.apiBaseUrl, stableSymbols),
      symbols: stableSymbols,
      onQuotes: (quotes) => applyQuotes(queryClient, quotes),
    });

    stream.start();
    return () => stream.close();
  }, [queryClient, stableSymbols]);
}
