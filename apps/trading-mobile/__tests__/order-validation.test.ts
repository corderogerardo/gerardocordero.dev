import {
  MAX_ORDER_NOTIONAL,
  buildOrderPayload,
  estimateOrder,
  validateOrderDraft,
  type OrderDraft,
} from '@/lib/order-validation';

function draft(overrides: Partial<OrderDraft> = {}): OrderDraft {
  return {
    symbol: 'BTC-USD',
    side: 'BUY',
    type: 'MARKET',
    quantity: '0.5',
    limitPrice: '',
    ...overrides,
  };
}

describe('validateOrderDraft quantity rules', () => {
  it('accepts a positive quantity', () => {
    expect(validateOrderDraft(draft())).toEqual({});
  });

  it('rejects a missing quantity', () => {
    expect(validateOrderDraft(draft({ quantity: '  ' })).quantity).toBe('Enter a quantity.');
  });

  it('rejects non-numeric input', () => {
    expect(validateOrderDraft(draft({ quantity: 'abc' })).quantity).toBe(
      'Quantity must be a number.',
    );
  });

  it('rejects zero and negative quantities', () => {
    expect(validateOrderDraft(draft({ quantity: '0' })).quantity).toBe(
      'Quantity must be greater than zero.',
    );
    expect(validateOrderDraft(draft({ quantity: '-1' })).quantity).toBe(
      'Quantity must be greater than zero.',
    );
  });

  it('allows at most eight decimal places', () => {
    expect(validateOrderDraft(draft({ quantity: '0.12345678' })).quantity).toBeUndefined();
    expect(validateOrderDraft(draft({ quantity: '0.123456789' })).quantity).toBe(
      'Quantity must have at most 8 decimal places.',
    );
  });

  it('ignores trailing zeros when counting decimals, matching the server', () => {
    expect(validateOrderDraft(draft({ quantity: '1.500000000' })).quantity).toBeUndefined();
  });
});

describe('validateOrderDraft limit price rules', () => {
  it('requires a limit price on limit orders', () => {
    expect(validateOrderDraft(draft({ type: 'LIMIT' })).limitPrice).toBe(
      'Enter a limit price for limit orders.',
    );
  });

  it('requires the limit price to be positive', () => {
    expect(validateOrderDraft(draft({ type: 'LIMIT', limitPrice: '0' })).limitPrice).toBe(
      'Limit price must be greater than zero.',
    );
    expect(validateOrderDraft(draft({ type: 'LIMIT', limitPrice: '-5' })).limitPrice).toBe(
      'Limit price must be greater than zero.',
    );
  });

  it('requires the limit price to be numeric with at most eight decimals', () => {
    expect(validateOrderDraft(draft({ type: 'LIMIT', limitPrice: 'abc' })).limitPrice).toBe(
      'Limit price must be a number.',
    );
    expect(
      validateOrderDraft(draft({ type: 'LIMIT', limitPrice: '1.123456789' })).limitPrice,
    ).toBe('Limit price must have at most 8 decimal places.');
  });

  it('rejects a limit price on market orders', () => {
    expect(validateOrderDraft(draft({ limitPrice: '70000' })).limitPrice).toBe(
      'Limit price must be omitted for market orders.',
    );
  });
});

describe('validateOrderDraft notional cap', () => {
  it('reports the cap in money terms when the estimate exceeds it', () => {
    const errors = validateOrderDraft(draft({ quantity: '10' }), {
      referencePrice: '200000',
    });

    expect(errors.quantity).toBe(
      'Order notional 2,000,000.00 exceeds the 1,000,000.00 limit per order.',
    );
  });

  it('uses the limit price when one is set', () => {
    const errors = validateOrderDraft(draft({ type: 'LIMIT', quantity: '2', limitPrice: '600000' }));

    expect(errors.quantity).toContain('exceeds the 1,000,000.00 limit');
  });

  it('accepts an order exactly at the cap', () => {
    const errors = validateOrderDraft(draft({ quantity: '1' }), {
      referencePrice: MAX_ORDER_NOTIONAL,
    });

    expect(errors).toEqual({});
  });

  it('skips the cap when no reference price is known yet', () => {
    expect(validateOrderDraft(draft({ quantity: '10' }))).toEqual({});
  });
});

describe('buildOrderPayload', () => {
  it('omits limitPrice for market orders', () => {
    expect(buildOrderPayload(draft({ side: 'SELL', quantity: '0.5' }))).toEqual({
      symbol: 'BTC-USD',
      side: 'SELL',
      type: 'MARKET',
      quantity: '0.5',
    });
  });

  it('includes limitPrice for limit orders and trims input', () => {
    expect(
      buildOrderPayload(draft({ type: 'LIMIT', quantity: ' 1.25 ', limitPrice: ' 70000.00 ' })),
    ).toEqual({
      symbol: 'BTC-USD',
      side: 'BUY',
      type: 'LIMIT',
      quantity: '1.25',
      limitPrice: '70000.00',
    });
  });
});

describe('estimateOrder', () => {
  it('estimates notional and the 10 bps fee without floats', () => {
    expect(estimateOrder(draft({ quantity: '0.5' }), '66208.74501568')).toEqual({
      notional: '33104.37250784',
      fee: '33.10437251',
    });
  });

  it('uses the limit price for limit orders', () => {
    expect(
      estimateOrder(draft({ type: 'LIMIT', quantity: '2', limitPrice: '100' }), '50'),
    ).toEqual({ notional: '200.00000000', fee: '0.20000000' });
  });

  it('returns null estimates when the draft is incomplete', () => {
    expect(estimateOrder(draft({ quantity: '' }), '100')).toEqual({ notional: null, fee: null });
  });
});
