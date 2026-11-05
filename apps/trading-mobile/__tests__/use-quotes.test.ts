import { QueryClient } from '@tanstack/react-query';

import { marketKeys } from '@/api/markets';
import type {
  Market,
  MarketDetailResponse,
  MarketsResponse,
  Quote,
} from '@/api/schemas';
import { applyQuotes } from '@/stream/use-quotes';

const MARKET_A: Market = {
  symbol: 'AAPL',
  name: 'Apple Inc.',
  kind: 'EQUITY',
  currency: 'USD',
  tickSize: '0.01000000',
  lastPrice: '226.74804771',
  changePercent: '0.1537',
  high: '230.11406441',
  low: '224.00866644',
  updatedAt: '2026-11-03T15:28:50.206492Z',
};

const MARKET_B: Market = {
  symbol: 'BTC-USD',
  name: 'Bitcoin',
  kind: 'CRYPTO',
  currency: 'USD',
  tickSize: '0.01000000',
  lastPrice: '64250.00000000',
  changePercent: '-0.4200',
  high: '64800.00000000',
  low: '63900.00000000',
  updatedAt: '2026-11-03T15:28:50.206492Z',
};

function quote(market: Market, price: string): Quote {
  return {
    symbol: market.symbol,
    price,
    changePercent: '1.2500',
    sessionOpen: '100.00000000',
    high: '999.00000000',
    low: '1.00000000',
    updatedAt: '2026-11-03T16:00:00.000000Z',
  };
}

const clients: QueryClient[] = [];

/** Cached data holds GC timers; clear every client so jest can exit. */
function newClient(): QueryClient {
  const client = new QueryClient({ defaultOptions: { queries: { gcTime: 0 } } });
  clients.push(client);
  return client;
}

function listClient(): QueryClient {
  const client = newClient();
  client.setQueryData<MarketsResponse>(marketKeys.list(), {
    data: [MARKET_A, MARKET_B],
    environment: 'test',
  });
  return client;
}

afterEach(() => {
  for (const client of clients.splice(0)) client.clear();
});

describe('applyQuotes', () => {
  it('patches only the price fields of the matching market', () => {
    const client = listClient();
    const before = client.getQueryData<MarketsResponse>(marketKeys.list());

    applyQuotes(client, [quote(MARKET_A, '230.00000000')]);

    const after = client.getQueryData<MarketsResponse>(marketKeys.list());
    expect(after).not.toBe(before);
    expect(after?.data[0]).toMatchObject({
      symbol: 'AAPL',
      name: 'Apple Inc.',
      lastPrice: '230.00000000',
      changePercent: '1.2500',
      high: '999.00000000',
      low: '1.00000000',
      updatedAt: '2026-11-03T16:00:00.000000Z',
    });
    // Unrelated markets keep their identity, so their rows do not re-render.
    expect(after?.data[1]).toBe(MARKET_B);
    expect(after?.environment).toBe('test');
  });

  it('patches an open market detail cache too', () => {
    const client = newClient();
    client.setQueryData<MarketDetailResponse>(marketKeys.detail('BTC-USD'), {
      market: MARKET_B,
      environment: 'test',
    });

    applyQuotes(client, [quote(MARKET_B, '64000.00000000')]);

    const detail = client.getQueryData<MarketDetailResponse>(marketKeys.detail('BTC-USD'));
    expect(detail?.market.lastPrice).toBe('64000.00000000');
    expect(detail?.market.name).toBe('Bitcoin');
  });

  it('does nothing for an empty batch', () => {
    const client = listClient();
    const before = client.getQueryData<MarketsResponse>(marketKeys.list());

    applyQuotes(client, []);

    expect(client.getQueryData(marketKeys.list())).toBe(before);
  });

  it('leaves a cache entry untouched when no quote matches', () => {
    const client = listClient();
    const before = client.getQueryData<MarketsResponse>(marketKeys.list());

    const unknown: Quote = { ...quote(MARKET_A, '1.00000000'), symbol: 'SOL-USD' };
    applyQuotes(client, [unknown]);

    expect(client.getQueryData(marketKeys.list())).toBe(before);
  });

  it('ignores a symbol that is not cached yet', () => {
    const client = newClient();

    expect(() => applyQuotes(client, [quote(MARKET_A, '1.00000000')])).not.toThrow();
    expect(client.getQueryData(marketKeys.list())).toBeUndefined();
  });
});
