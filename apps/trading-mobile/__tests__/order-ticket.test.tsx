import { fireEvent, waitFor } from '@testing-library/react-native';

import { ApiError } from '@/api/errors';
import { OrderTicket } from '@/features/order-ticket';

import { createOrderMock } from './helpers/order-mutation';
import { renderScreen } from './helpers/test-render';

jest.mock('@/api/orders', () => ({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  useCreateOrder: () => require('./helpers/order-mutation').useCreateOrderMock(),
}));

jest.mock('expo-crypto', () => {
  let counter = 0;
  return {
    randomUUID: jest.fn(() => {
      counter += 1;
      return `intent-${counter}`;
    }),
  };
});

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(async () => undefined),
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

const MARKET = {
  symbol: 'BTC-USD',
  lastPrice: '64250.00000000',
  tickSize: '0.01000000',
};

const ORDER = {
  id: '8c02fca2-afce-40c7-b03c-cb00cafec180',
  symbol: 'BTC-USD',
  side: 'BUY' as const,
  type: 'MARKET' as const,
  status: 'FILLED' as const,
  quantity: '0.50000000',
  limitPrice: null,
  filledQuantity: '0.50000000',
  averageFillPrice: '66208.74501568',
  fee: '33.10437251',
  rejectionReason: null,
  createdAt: '2026-11-03T15:28:56.167401Z',
  updatedAt: '2026-11-03T15:28:56.167401Z',
};

beforeEach(() => {
  createOrderMock.mockReset();
});

describe('OrderTicket', () => {
  it('submits the API contract shape with a generated idempotency key', async () => {
    createOrderMock.mockResolvedValue(ORDER);

    const { getByTestId } = await renderScreen(<OrderTicket market={MARKET} />);

    await fireEvent.changeText(getByTestId('order-quantity'), '0.5');
    await fireEvent.press(getByTestId('order-submit'));

    await waitFor(() => expect(createOrderMock).toHaveBeenCalledTimes(1));
    expect(createOrderMock.mock.calls[0]?.[0]).toEqual({
      order: {
        symbol: 'BTC-USD',
        side: 'BUY',
        type: 'MARKET',
        quantity: '0.5',
      },
      idempotencyKey: expect.stringMatching(/^intent-\d+$/),
    });
  });

  it('reuses the same idempotency key when retrying the same intent', async () => {
    createOrderMock.mockRejectedValueOnce(
      new ApiError({ code: 'INTERNAL_ERROR', message: 'boom', status: 500 }),
    );
    createOrderMock.mockResolvedValueOnce(ORDER);

    const { getByTestId, findByTestId } = await renderScreen(<OrderTicket market={MARKET} />);

    await fireEvent.changeText(getByTestId('order-quantity'), '0.5');
    await fireEvent.press(getByTestId('order-submit'));
    expect(await findByTestId('order-error')).toBeTruthy();

    await fireEvent.press(getByTestId('order-submit'));
    await waitFor(() => expect(createOrderMock).toHaveBeenCalledTimes(2));

    const firstKey = createOrderMock.mock.calls[0]?.[0].idempotencyKey;
    const retryKey = createOrderMock.mock.calls[1]?.[0].idempotencyKey;
    expect(retryKey).toBe(firstKey);
  });

  it('uses a new idempotency key when the order changes', async () => {
    createOrderMock.mockRejectedValueOnce(
      new ApiError({ code: 'INTERNAL_ERROR', message: 'boom', status: 500 }),
    );
    createOrderMock.mockResolvedValueOnce(ORDER);

    const { getByTestId, findByTestId } = await renderScreen(<OrderTicket market={MARKET} />);

    await fireEvent.changeText(getByTestId('order-quantity'), '0.5');
    await fireEvent.press(getByTestId('order-submit'));
    expect(await findByTestId('order-error')).toBeTruthy();

    await fireEvent.changeText(getByTestId('order-quantity'), '0.75');
    await fireEvent.press(getByTestId('order-submit'));
    await waitFor(() => expect(createOrderMock).toHaveBeenCalledTimes(2));

    expect(createOrderMock.mock.calls[0]?.[0].idempotencyKey).not.toBe(
      createOrderMock.mock.calls[1]?.[0].idempotencyKey,
    );
    expect(createOrderMock.mock.calls[1]?.[0].order.quantity).toBe('0.75');
  });

  it('disables the submit button while the request is pending', async () => {
    let resolve: (order: typeof ORDER) => void = () => undefined;
    createOrderMock.mockImplementation(
      () =>
        new Promise((resolveOrder) => {
          resolve = resolveOrder;
        }),
    );

    const { getByTestId } = await renderScreen(<OrderTicket market={MARKET} />);

    await fireEvent.changeText(getByTestId('order-quantity'), '0.5');
    await fireEvent.press(getByTestId('order-submit'));

    await waitFor(() => expect(getByTestId('order-submit')).toBeDisabled());

    resolve(ORDER);

    await waitFor(() => expect(getByTestId('order-confirmation')).toBeTruthy());
    expect(getByTestId('order-submit')).not.toBeDisabled();
  });

  it('shows the API field error inline and keeps the intent', async () => {
    createOrderMock.mockRejectedValue(
      new ApiError({
        code: 'VALIDATION_ERROR',
        message: 'must be greater than zero',
        status: 422,
        field: 'quantity',
      }),
    );

    const { getByTestId, findByText } = await renderScreen(<OrderTicket market={MARKET} />);

    await fireEvent.changeText(getByTestId('order-quantity'), '0.5');
    await fireEvent.press(getByTestId('order-submit'));

    expect(await findByText('Quantity must be greater than zero.')).toBeTruthy();
    expect(getByTestId('order-quantity-error')).toBeTruthy();
  });

  it('validates locally before calling the API', async () => {
    const { getByTestId, findByText } = await renderScreen(<OrderTicket market={MARKET} />);

    await fireEvent.press(getByTestId('order-submit'));

    expect(await findByText('Enter a quantity.')).toBeTruthy();
    expect(createOrderMock).not.toHaveBeenCalled();
  });

  it('requires a limit price for limit orders', async () => {
    const { getByTestId, findByText } = await renderScreen(<OrderTicket market={MARKET} />);

    await fireEvent.press(getByTestId('order-type-limit'));
    await fireEvent.changeText(getByTestId('order-quantity'), '1');
    await fireEvent.press(getByTestId('order-submit'));

    expect(await findByText('Enter a limit price for limit orders.')).toBeTruthy();
    expect(createOrderMock).not.toHaveBeenCalled();
  });

  it('sends limitPrice only for limit orders and confirms the fill', async () => {
    createOrderMock.mockResolvedValue(ORDER);
    const haptics = jest.requireMock('expo-haptics') as { notificationAsync: jest.Mock };

    const { getByTestId, findByTestId } = await renderScreen(<OrderTicket market={MARKET} />);

    await fireEvent.press(getByTestId('order-type-limit'));
    await fireEvent.changeText(getByTestId('order-quantity'), '1');
    await fireEvent.changeText(getByTestId('order-limit-price'), '70000.00');
    await fireEvent.press(getByTestId('order-submit'));

    await waitFor(() => expect(createOrderMock).toHaveBeenCalledTimes(1));
    expect(createOrderMock.mock.calls[0]?.[0].order).toEqual({
      symbol: 'BTC-USD',
      side: 'BUY',
      type: 'LIMIT',
      quantity: '1',
      limitPrice: '70000.00',
    });

    expect(await findByTestId('order-confirmation')).toBeTruthy();
    expect(haptics.notificationAsync).toHaveBeenCalled();
  });

  it('switches the button label with the side', async () => {
    const { getByTestId } = await renderScreen(<OrderTicket market={MARKET} />);

    expect(getByTestId('order-submit')).toHaveTextContent('Buy BTC-USD');

    await fireEvent.press(getByTestId('order-side-sell'));

    expect(getByTestId('order-submit')).toHaveTextContent('Sell BTC-USD');
  });
});
