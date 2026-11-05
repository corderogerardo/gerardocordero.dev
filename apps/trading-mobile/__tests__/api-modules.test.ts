import { QueryClient } from '@tanstack/react-query';

import { fetchMe } from '@/api/auth';
import { ApiError } from '@/api/errors';
import { fetchHistory, fetchMarket, fetchMarkets } from '@/api/markets';
import {
  createOrder,
  fetchOrders,
  invalidateTradingData,
  orderKeys,
} from '@/api/orders';
import { fetchPortfolio, portfolioKey } from '@/api/portfolio';

import { installApi, jsonResponse } from './helpers/test-api';

const MARKET = {
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

const PORTFOLIO_USER = {
  id: 'd975aba8-9ab6-4321-b89d-594e18ef141f',
  email: 'trader@example.test',
  displayName: 'Smoke Tester',
  createdAt: '2026-11-03T15:28:50.865242Z',
};

const ORDER = {
  id: '8c02fca2-afce-40c7-b03c-cb00cafec180',
  symbol: 'BTC-USD',
  side: 'BUY',
  type: 'MARKET',
  status: 'FILLED',
  quantity: '0.50000000',
  limitPrice: null,
  filledQuantity: '0.50000000',
  averageFillPrice: '66208.74501568',
  fee: '33.10437251',
  rejectionReason: null,
  createdAt: '2026-11-03T15:28:56.167401Z',
  updatedAt: '2026-11-03T15:28:56.167401Z',
};

const PORTFOLIO = {
  cash: '66862.52311965',
  currency: 'USD',
  equity: '99990.06868825',
  realizedPnl: '0',
  unrealizedPnl: '23.17306076',
  positions: [
    {
      symbol: 'BTC-USD',
      quantity: '0.50000000',
      averageCost: '66208.74501568',
      marketPrice: '66255.09113719',
      marketValue: '33127.54556860',
      unrealizedPnl: '23.17306076',
      unrealizedPnlPercent: '0.0700',
    },
  ],
  environment: 'development',
};

describe('auth API', () => {
  it('loads the current user and cash balance', async () => {
    const { calls } = installApi(() =>
      jsonResponse({ user: PORTFOLIO_USER, cash: '100000.00000000', currency: 'USD' }),
    );

    const me = await fetchMe();

    expect(calls[0]?.path).toBe('/v1/me');
    expect(me.cash).toBe('100000.00000000');
    expect(me.user.email).toBe('trader@example.test');
  });
});

describe('markets API', () => {
  it('parses the snapshot and keeps money as exact decimal strings', async () => {
    const { calls } = installApi(() => jsonResponse({ data: [MARKET], environment: 'test' }));

    const response = await fetchMarkets();

    expect(calls[0]?.path).toBe('/v1/markets');
    expect(calls[0]?.headers.authorization).toBe('Bearer test-access-token');
    expect(response.data[0]?.lastPrice).toBe('226.74804771');
    expect(typeof response.data[0]?.lastPrice).toBe('string');
  });

  it('rejects a payload that does not match the contract', async () => {
    installApi(() => jsonResponse({ data: [{ ...MARKET, lastPrice: 226.75 }], environment: 'test' }));

    await expect(fetchMarkets()).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
      status: 0,
    });
  });

  it('requests a single market and its history with the documented paths', async () => {
    const { calls } = installApi((call) =>
      call.path.includes('/history')
        ? jsonResponse({
            symbol: 'AAPL',
            interval: '1m',
            points: [{ t: '2026-11-03T14:29:00Z', p: '64250.00000000' }],
          })
        : jsonResponse({ market: MARKET, environment: 'test' }),
    );

    const detail = await fetchMarket('AAPL');
    const history = await fetchHistory('AAPL', 30);

    expect(calls.map((call) => call.path)).toEqual([
      '/v1/markets/AAPL',
      '/v1/markets/AAPL/history?points=30',
    ]);
    expect(detail.market.symbol).toBe('AAPL');
    expect(history.points[0]?.p).toBe('64250.00000000');
  });
});

describe('portfolio API', () => {
  it('parses balances and positions without converting to numbers', async () => {
    const { calls } = installApi(() => jsonResponse(PORTFOLIO));

    const portfolio = await fetchPortfolio();

    expect(calls[0]?.path).toBe('/v1/portfolio');
    expect(portfolio.equity).toBe('99990.06868825');
    expect(portfolio.positions[0]?.averageCost).toBe('66208.74501568');
  });

  it('rejects a numeric balance, which would lose precision', async () => {
    installApi(() => jsonResponse({ ...PORTFOLIO, equity: 99990.07 }));

    await expect(fetchPortfolio()).rejects.toBeInstanceOf(ApiError);
  });
});

describe('orders API', () => {
  it('posts the order with an Idempotency-Key and parses the fill', async () => {
    const { calls } = installApi(() => jsonResponse(ORDER, 201));

    const order = await createOrder(
      { symbol: 'BTC-USD', side: 'BUY', type: 'MARKET', quantity: '0.5' },
      'intent-key-1',
    );

    expect(calls[0]?.path).toBe('/v1/orders');
    expect(calls[0]?.init.method).toBe('POST');
    expect(calls[0]?.headers['idempotency-key']).toBe('intent-key-1');
    expect(calls[0]?.body).toBe(
      JSON.stringify({ symbol: 'BTC-USD', side: 'BUY', type: 'MARKET', quantity: '0.5' }),
    );
    expect(order.status).toBe('FILLED');
    expect(order.averageFillPrice).toBe('66208.74501568');
  });

  it('builds the keyset pagination query', async () => {
    const { calls } = installApi(() => jsonResponse({ data: [ORDER], nextCursor: 'cursor-2' }));

    const page = await fetchOrders({ status: 'OPEN', cursor: 'abc|123', limit: 5 });

    expect(calls[0]?.path).toBe('/v1/orders?status=OPEN&limit=5&cursor=abc%7C123');
    expect(page.nextCursor).toBe('cursor-2');
  });

  it('omits the status filter for the ALL tab', async () => {
    const { calls } = installApi(() => jsonResponse({ data: [], nextCursor: null }));

    await fetchOrders({});

    expect(calls[0]?.path).toBe('/v1/orders?limit=20');
  });
});

describe('invalidateTradingData', () => {
  it('marks both the order lists and the portfolio stale', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(portfolioKey, PORTFOLIO);
    queryClient.setQueryData(orderKeys.list('ALL'), { pages: [], pageParams: [] });
    queryClient.setQueryData(orderKeys.list('OPEN'), { pages: [], pageParams: [] });

    await invalidateTradingData(queryClient);

    expect(queryClient.getQueryState(portfolioKey)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(orderKeys.list('ALL'))?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(orderKeys.list('OPEN'))?.isInvalidated).toBe(true);

    queryClient.clear();
  });
});
