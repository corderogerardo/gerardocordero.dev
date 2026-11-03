import { compareDecimal } from '@/lib/money';

import type { Trend } from './theme';

/** Sign of a decimal string, without going through a float. */
export function trendOf(value: string): Trend {
  const order = compareDecimal(value, '0');
  if (order === null || order === 0) return 'flat';
  return order > 0 ? 'up' : 'down';
}
