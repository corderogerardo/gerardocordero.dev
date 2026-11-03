import { fireEvent } from '@testing-library/react-native';

import MarketsScreen from '@/app/(tabs)/index';
import { useMarkets } from '@/api/markets';
import type { ApiError } from '@/api/errors';

import { renderScreen } from './helpers/test-render';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: () => undefined,
    replace: () => undefined,
    back: () => undefined,
    canGoBack: () => false,
  }),
}));

jest.mock('@/stream/use-quotes', () => ({ useQuotes: jest.fn() }));

jest.mock('@/api/markets', () => ({ useMarkets: jest.fn() }));

const useMarketsMock = useMarkets as jest.MockedFunction<typeof useMarkets>;

const MARKETS = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    kind: 'EQUITY' as const,
    currency: 'USD',
    tickSize: '0.01000000',
    lastPrice: '226.74804771',
    changePercent: '0.1537',
    high: '230.11406441',
    low: '224.00866644',
    updatedAt: '2026-11-03T15:28:50.206492Z',
  },
  {
    symbol: 'BTC-USD',
    name: 'Bitcoin',
    kind: 'CRYPTO' as const,
    currency: 'USD',
    tickSize: '0.01000000',
    lastPrice: '64250.00000000',
    changePercent: '-0.4200',
    high: '64800.00000000',
    low: '63900.00000000',
    updatedAt: '2026-11-03T15:28:50.206492Z',
  },
];

type MarketsQuery = ReturnType<typeof useMarkets>;

function marketsQuery(overrides: Partial<MarketsQuery>): MarketsQuery {
  return {
    data: undefined,
    error: null,
    isPending: false,
    isError: false,
    isSuccess: false,
    isRefetching: false,
    refetch: jest.fn(),
    ...overrides,
  } as unknown as MarketsQuery;
}

afterEach(() => {
  jest.clearAllMocks();
});

describe('MarketsScreen', () => {
  it('shows the loading skeleton while the snapshot is in flight', async () => {
    useMarketsMock.mockReturnValue(marketsQuery({ isPending: true }));

    const { getByTestId, queryByTestId } = await renderScreen(<MarketsScreen />);

    expect(getByTestId('markets-loading')).toBeTruthy();
    expect(queryByTestId('market-row-AAPL')).toBeNull();
  });

  it('renders each market with its price and change', async () => {
    useMarketsMock.mockReturnValue(
      marketsQuery({
        data: { data: MARKETS, environment: 'test' },
        isSuccess: true,
      }),
    );

    const { getByTestId, getByText } = await renderScreen(<MarketsScreen />);

    expect(getByTestId('market-row-AAPL')).toBeTruthy();
    expect(getByText('AAPL')).toBeTruthy();
    expect(getByText('$226.75')).toBeTruthy();
    expect(getByText('+0.15%')).toBeTruthy();
    expect(getByText('-0.42%')).toBeTruthy();
  });

  it('shows an error with a working retry', async () => {
    const refetch = jest.fn();
    useMarketsMock.mockReturnValue(
      marketsQuery({ isError: true, error: new Error('offline') as ApiError, refetch }),
    );

    const { getByTestId, queryByTestId } = await renderScreen(<MarketsScreen />);

    expect(getByTestId('markets-error')).toBeTruthy();
    expect(queryByTestId('market-row-AAPL')).toBeNull();

    await fireEvent.press(getByTestId('markets-error-retry'));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('shows an empty state when the simulator publishes nothing', async () => {
    useMarketsMock.mockReturnValue(
      marketsQuery({ data: { data: [], environment: 'test' }, isSuccess: true }),
    );

    const { getByTestId } = await renderScreen(<MarketsScreen />);

    expect(getByTestId('markets-empty')).toBeTruthy();
  });
});
