/**
 * Exact decimal helpers.
 *
 * Money on this API is always a decimal string, and balances can exceed
 * `Number.MAX_SAFE_INTEGER` in cents. Every function here therefore works on the
 * digits: no `parseFloat`, no `Number()`, no implicit rounding. `bigint` is used
 * for arithmetic and `null` is returned for input that is not a plain decimal so
 * callers can show a validation message instead of crashing.
 */

const DECIMAL_PATTERN = /^([+-]?)(\d*)(?:\.(\d*))?$/;
const TEN = BigInt(10);

export interface DecimalParts {
  negative: boolean;
  /** Integer digits with leading zeros collapsed. Never empty. */
  integer: string;
  /** Fraction digits with trailing zeros trimmed. Empty when integral. */
  fraction: string;
}

export interface DecimalFormatOptions {
  /** Fixed number of fraction digits. Defaults to 2. */
  decimals?: number;
  /** Insert thousands separators. Defaults to true. */
  grouping?: boolean;
}

/** Placeholder rendered when a value is not a decimal. */
export const NOT_AVAILABLE = '—';

function isZeroDigits(integer: string, fraction: string): boolean {
  return /^0*$/.test(integer) && /^0*$/.test(fraction);
}

export function parseDecimal(value: string): DecimalParts | null {
  if (typeof value !== 'string' || value.length === 0) return null;

  const match = DECIMAL_PATTERN.exec(value);
  if (!match) return null;

  const sign = match[1] ?? '';
  const whole = match[2] ?? '';
  const rawFraction = match[3] ?? '';
  if (whole === '' && rawFraction === '') return null;

  const integer = whole === '' ? '0' : whole.replace(/^0+(?=\d)/, '');
  const fraction = rawFraction.replace(/0+$/, '');
  const negative = sign === '-' && !isZeroDigits(integer, fraction);

  return { negative, integer, fraction };
}

export function isDecimal(value: string): boolean {
  return parseDecimal(value) !== null;
}

/** Effective scale: decimal places once trailing zeros are dropped. */
export function decimalPlaces(value: string): number | null {
  const parsed = parseDecimal(value);
  return parsed ? parsed.fraction.length : null;
}

function magnitudeUnits(parsed: DecimalParts): { units: bigint; scale: number } {
  return {
    units: BigInt(`${parsed.integer}${parsed.fraction}`),
    scale: parsed.fraction.length,
  };
}

/** Round a non-negative fixed-scale integer to `to` fraction digits. */
function roundUnits(units: bigint, from: number, to: number): bigint {
  if (from === to) return units;
  if (from < to) return units * TEN ** BigInt(to - from);

  const divisor = TEN ** BigInt(from - to);
  const quotient = units / divisor;
  const remainder = units % divisor;
  return remainder * BigInt(2) >= divisor ? quotient + BigInt(1) : quotient;
}

function decimalString(units: bigint, scale: number): string {
  const digits = units.toString();
  if (scale === 0) return digits;

  const padded = digits.padStart(scale + 1, '0');
  const split = padded.length - scale;
  return `${padded.slice(0, split)}.${padded.slice(split)}`;
}

function groupDigits(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

interface RenderOptions extends DecimalFormatOptions {
  /** `always` prefixes `+` for non-zero positive values. */
  sign?: 'none' | 'always';
}

function renderDecimal(value: string, options: RenderOptions = {}): string {
  const parsed = parseDecimal(value);
  if (!parsed) return NOT_AVAILABLE;

  const decimals = Math.max(0, Math.trunc(options.decimals ?? 2));
  const grouping = options.grouping ?? true;
  const { units, scale } = magnitudeUnits(parsed);
  const rounded = roundUnits(units, scale, decimals);

  const [integerPart = '0', fractionPart = ''] = decimalString(rounded, decimals).split('.');
  const body = grouping ? groupDigits(integerPart) : integerPart;
  const rendered = fractionPart ? `${body}.${fractionPart}` : body;

  if (rounded === BigInt(0)) return rendered;
  if (parsed.negative) return `-${rendered}`;
  if (options.sign === 'always') return `+${rendered}`;
  return rendered;
}

export function formatDecimal(value: string, options: DecimalFormatOptions = {}): string {
  return renderDecimal(value, options);
}

/** `+12.50`, `-12.50`, `0.00` — for P&L figures where direction is the point. */
export function formatSignedDecimal(value: string, options: DecimalFormatOptions = {}): string {
  return renderDecimal(value, { ...options, sign: 'always' });
}

/** API percent values are already percentage points: `"0.0700"` is 0.07%. */
export function formatPercent(value: string, options: DecimalFormatOptions = {}): string {
  return `${formatDecimal(value, options)}%`;
}

export function formatSignedPercent(value: string, options: DecimalFormatOptions = {}): string {
  return `${formatSignedDecimal(value, options)}%`;
}

/** Quantities keep their significant digits and drop schema padding. */
export function formatQuantity(value: string): string {
  const parsed = parseDecimal(value);
  if (!parsed) return NOT_AVAILABLE;

  const sign = parsed.negative ? '-' : '';
  const fraction = parsed.fraction ? `.${parsed.fraction}` : '';
  return `${sign}${parsed.integer}${fraction}`;
}

export function formatCurrency(
  value: string,
  currency = 'USD',
  options: DecimalFormatOptions = {},
): string {
  const rendered = formatDecimal(value, options);
  if (rendered === NOT_AVAILABLE) return rendered;

  const prefix = currency === 'USD' ? '$' : `${currency} `;
  return rendered.startsWith('-') ? `-${prefix}${rendered.slice(1)}` : `${prefix}${rendered}`;
}

/** `+$23.17` / `-$5.00` / `$0.00` — for P&L figures. */
export function formatSignedCurrency(
  value: string,
  currency = 'USD',
  options: DecimalFormatOptions = {},
): string {
  const rendered = formatSignedDecimal(value, options);
  if (rendered === NOT_AVAILABLE) return rendered;

  const prefix = currency === 'USD' ? '$' : `${currency} `;
  if (rendered.startsWith('-')) return `-${prefix}${rendered.slice(1)}`;
  if (rendered.startsWith('+')) return `+${prefix}${rendered.slice(1)}`;
  return `${prefix}${rendered}`;
}

/** Multiplication rounded to `decimals` places, half away from zero. */
export function multiplyDecimal(a: string, b: string, decimals = 8): string | null {
  const left = parseDecimal(a);
  const right = parseDecimal(b);
  if (!left || !right) return null;

  const l = magnitudeUnits(left);
  const r = magnitudeUnits(right);
  const units = roundUnits(l.units * r.units, l.scale + r.scale, decimals);
  const negative = units !== BigInt(0) && left.negative !== right.negative;
  return `${negative ? '-' : ''}${decimalString(units, decimals)}`;
}

/** `value * bps / 10_000`, rounded to `decimals` places. */
export function basisPointsOf(value: string, bps: number, decimals = 8): string | null {
  const parsed = parseDecimal(value);
  if (!parsed || !Number.isInteger(bps) || bps < 0) return null;

  const { units, scale } = magnitudeUnits(parsed);
  const product = units * BigInt(bps);
  const negative = product !== BigInt(0) && parsed.negative;
  const rounded = roundUnits(product, scale + 4, decimals);
  return `${negative ? '-' : ''}${decimalString(rounded, decimals)}`;
}

/**
 * Exact minor units (e.g. cents when `scale` is 2). Useful for thresholds and
 * equality checks that must not go through a float.
 */
export function toMinorUnits(value: string, scale = 2): bigint | null {
  const parsed = parseDecimal(value);
  if (!parsed) return null;

  const { units, scale: sourceScale } = magnitudeUnits(parsed);
  const rounded = roundUnits(units, sourceScale, Math.max(0, Math.trunc(scale)));
  return parsed.negative ? -rounded : rounded;
}

/** -1, 0 or 1; `null` when either side is not a decimal. */
export function compareDecimal(a: string, b: string): -1 | 0 | 1 | null {
  const left = parseDecimal(a);
  const right = parseDecimal(b);
  if (!left || !right) return null;

  const l = magnitudeUnits(left);
  const r = magnitudeUnits(right);
  const lSign = l.units === BigInt(0) ? 0 : left.negative ? -1 : 1;
  const rSign = r.units === BigInt(0) ? 0 : right.negative ? -1 : 1;
  if (lSign !== rSign) return lSign < rSign ? -1 : 1;

  // Compare on a shared scale so 1.10 and 1.1 are equal.
  const scaledLeft = l.units * TEN ** BigInt(r.scale);
  const scaledRight = r.units * TEN ** BigInt(l.scale);
  if (scaledLeft === scaledRight) return 0;

  const magnitude = scaledLeft < scaledRight ? -1 : 1;
  return (lSign < 0 ? -magnitude : magnitude) as -1 | 1;
}

export function isPositiveDecimal(value: string): boolean {
  const parsed = parseDecimal(value);
  if (!parsed || parsed.negative) return false;
  return !isZeroDigits(parsed.integer, parsed.fraction);
}
