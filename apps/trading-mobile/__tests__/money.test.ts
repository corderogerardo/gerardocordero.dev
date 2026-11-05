import {
  compareDecimal,
  formatCurrency,
  formatDecimal,
  formatPercent,
  formatQuantity,
  formatSignedCurrency,
  formatSignedDecimal,
  formatSignedPercent,
  isPositiveDecimal,
  multiplyDecimal,
  parseDecimal,
  toMinorUnits,
} from '@/lib/money';

describe('parseDecimal', () => {
  it('splits sign, integer and fraction without touching floating point', () => {
    expect(parseDecimal('-0012.3400')).toEqual({
      negative: true,
      integer: '12',
      fraction: '34',
    });
    expect(parseDecimal('0.00000001')).toEqual({
      negative: false,
      integer: '0',
      fraction: '00000001',
    });
    expect(parseDecimal('.5')).toEqual({ negative: false, integer: '0', fraction: '5' });
  });

  it('normalizes negative zero to zero', () => {
    expect(parseDecimal('-0.00000000')).toEqual({
      negative: false,
      integer: '0',
      fraction: '',
    });
  });

  it('rejects anything that is not a plain decimal', () => {
    for (const value of ['', 'abc', '1,000.00', '1e5', ' 1 ', '1.2.3', '.', '-', '+']) {
      expect(parseDecimal(value)).toBeNull();
    }
  });
});

describe('formatDecimal', () => {
  it('formats positive values with grouping and fixed decimals', () => {
    expect(formatDecimal('1234567.891')).toBe('1,234,567.89');
    expect(formatDecimal('226.74804771')).toBe('226.75');
    expect(formatDecimal('1234.5', { grouping: false })).toBe('1234.50');
  });

  it('formats negative values', () => {
    expect(formatDecimal('-1234.5')).toBe('-1,234.50');
    expect(formatDecimal('-0.005')).toBe('-0.01');
  });

  it('keeps every digit of huge values that a float would round', () => {
    expect(formatDecimal('9007199254740993.12345678', { decimals: 8 })).toBe(
      '9,007,199,254,740,993.12345678',
    );
  });

  it('formats tiny values at the requested precision', () => {
    expect(formatDecimal('0.00000001', { decimals: 8 })).toBe('0.00000001');
    expect(formatDecimal('0.00000001')).toBe('0.00');
  });

  it('rounds half away from zero using decimal digits, not floats', () => {
    expect(formatDecimal('2.675')).toBe('2.68');
    expect(formatDecimal('0.005')).toBe('0.01');
    expect(formatDecimal('1.005')).toBe('1.01');
    expect(formatDecimal('226.74804771', { decimals: 0 })).toBe('227');
  });

  it('supports zero fraction digits', () => {
    expect(formatDecimal('999.9', { decimals: 0 })).toBe('1,000');
  });
});

describe('formatSignedDecimal', () => {
  it('prefixes a plus for gains, a minus for losses and nothing for zero', () => {
    expect(formatSignedDecimal('12.5')).toBe('+12.50');
    expect(formatSignedDecimal('-12.5')).toBe('-12.50');
    expect(formatSignedDecimal('0')).toBe('0.00');
  });
});

describe('percent formatting', () => {
  it('treats API percent strings as percentage points', () => {
    expect(formatPercent('0.1537')).toBe('0.15%');
    expect(formatPercent('0.0700', { decimals: 2 })).toBe('0.07%');
    expect(formatSignedPercent('0.1537')).toBe('+0.15%');
    expect(formatSignedPercent('-1.2')).toBe('-1.20%');
  });
});

describe('formatQuantity', () => {
  it('drops trailing zeros but keeps the significant digits', () => {
    expect(formatQuantity('0.50000000')).toBe('0.5');
    expect(formatQuantity('1.00000000')).toBe('1');
    expect(formatQuantity('0.00000001')).toBe('0.00000001');
    expect(formatQuantity('-2.25000000')).toBe('-2.25');
  });
});

describe('formatCurrency', () => {
  it('uses the currency symbol for USD and the code otherwise', () => {
    expect(formatCurrency('66862.52311965')).toBe('$66,862.52');
    expect(formatCurrency('-12.5')).toBe('-$12.50');
    expect(formatCurrency('10', 'EUR')).toBe('EUR 10.00');
  });

  it('formats signed amounts for P&L', () => {
    expect(formatSignedCurrency('23.17306076')).toBe('+$23.17');
    expect(formatSignedCurrency('-5', 'EUR')).toBe('-EUR 5.00');
    expect(formatSignedCurrency('0')).toBe('$0.00');
  });
});

describe('exact decimal arithmetic', () => {
  it('multiplies without losing precision', () => {
    expect(multiplyDecimal('0.5', '66208.74501568')).toBe('33104.37250784');
    expect(multiplyDecimal('3', '0.333333333')).toBe('1.00000000');
    expect(multiplyDecimal('-2', '1.5')).toBe('-3.00000000');
    expect(multiplyDecimal('-2', '1.5', 2)).toBe('-3.00');
  });

  it('converts to minor units with decimal rounding', () => {
    expect(toMinorUnits('12.345', 2)).toBe(BigInt(1235));
    expect(toMinorUnits('-0.005', 2)).toBe(BigInt(-1));
    expect(toMinorUnits('1000000', 2)).toBe(BigInt(100000000));
  });

  it('compares decimals by value', () => {
    expect(compareDecimal('1.10', '1.1')).toBe(0);
    expect(compareDecimal('0.9', '1')).toBe(-1);
    expect(compareDecimal('-2', '1')).toBe(-1);
    expect(compareDecimal('2', '1.99999999')).toBe(1);
  });

  it('detects strictly positive decimals', () => {
    expect(isPositiveDecimal('0.00000001')).toBe(true);
    expect(isPositiveDecimal('0')).toBe(false);
    expect(isPositiveDecimal('0.00000000')).toBe(false);
    expect(isPositiveDecimal('-1')).toBe(false);
    expect(isPositiveDecimal('nope')).toBe(false);
  });
});
