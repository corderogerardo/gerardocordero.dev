import { within } from '@testing-library/react-native';

import { copy } from '@/config';
import { usePortfolio } from '@/api/portfolio';
import PortfolioScreen from '@/app/(tabs)/portfolio';

import { renderScreen } from './helpers/test-render';

jest.mock('@/api/portfolio', () => ({ usePortfolio: jest.fn() }));

const usePortfolioMock = usePortfolio as jest.MockedFunction<typeof usePortfolio>;

const POSITION = {
  symbol: 'BTC-USD',
  quantity: '0.50000000',
  averageCost: '66208.74501568',
  marketPrice: '66255.09113719',
  marketValue: '33127.54556860',
  unrealizedPnl: '23.17306076',
  unrealizedPnlPercent: '0.0700',
};

const SUMMARY = {
  cash: '66862.52311965',
  currency: 'USD',
  equity: '99990.06868825',
  realizedPnl: '0',
  unrealizedPnl: '23.17306076',
  environment: 'development',
};

type PortfolioQuery = ReturnType<typeof usePortfolio>;

function portfolioQuery(overrides: Partial<PortfolioQuery>): PortfolioQuery {
  return {
    data: undefined,
    error: null,
    isPending: false,
    isError: false,
    isRefetching: false,
    refetch: jest.fn(),
    ...overrides,
  } as unknown as PortfolioQuery;
}

afterEach(() => {
  jest.clearAllMocks();
});

describe('PortfolioScreen', () => {
  it('shows balances and an empty state when nothing is held', async () => {
    usePortfolioMock.mockReturnValue(
      portfolioQuery({
        data: { ...SUMMARY, positions: [] },
      }),
    );

    const { getByTestId, getByText } = await renderScreen(<PortfolioScreen />);

    expect(getByTestId('portfolio-summary')).toBeTruthy();
    expect(getByText('$99,990.07')).toBeTruthy();
    expect(getByText('$66,862.52')).toBeTruthy();
    expect(getByTestId('portfolio-empty')).toBeTruthy();
    expect(getByText('No open positions')).toBeTruthy();
  });

  it('renders a position card with quantity, average cost and P&L', async () => {
    usePortfolioMock.mockReturnValue(
      portfolioQuery({
        data: { ...SUMMARY, positions: [POSITION] },
      }),
    );

    const { getByTestId } = await renderScreen(<PortfolioScreen />);

    const card = within(getByTestId('position-BTC-USD'));
    expect(card.getByText('0.5 units')).toBeTruthy();
    expect(card.getByText('$66,208.75')).toBeTruthy();
    expect(card.getByText('$33,127.55')).toBeTruthy();
    expect(card.getByText('+$23.17 (+0.07%)')).toBeTruthy();
    expect(card.getByText('+$23.17')).toBeTruthy();
    expect(card.getByText('$66,255.09')).toBeTruthy();
  });

  it('always shows the paper-trading disclaimer', async () => {
    usePortfolioMock.mockReturnValue(
      portfolioQuery({ data: { ...SUMMARY, positions: [] } }),
    );

    const { getByText } = await renderScreen(<PortfolioScreen />);

    expect(getByText(copy.disclaimer)).toBeTruthy();
  });

  it('shows an error with a retry action', async () => {
    const refetch = jest.fn();
    usePortfolioMock.mockReturnValue(
      portfolioQuery({ isError: true, error: new Error('offline'), refetch }),
    );

    const { getByTestId } = await renderScreen(<PortfolioScreen />);

    expect(getByTestId('portfolio-error')).toBeTruthy();
    expect(getByTestId('portfolio-error-retry')).toBeTruthy();
  });
});
