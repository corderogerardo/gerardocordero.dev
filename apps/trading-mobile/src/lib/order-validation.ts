import type { CreateOrderRequest, OrderSide, OrderType } from '@/api/schemas';

import {
  basisPointsOf,
  compareDecimal,
  decimalPlaces,
  formatDecimal,
  isDecimal,
  isPositiveDecimal,
  multiplyDecimal,
} from './money';

/**
 * Client-side mirror of the server's order validation.
 *
 * The server is the authority; these checks exist so an obvious mistake costs a
 * keystroke instead of a round-trip. Messages match the server wording where the
 * rule is identical, and every value stays a decimal string.
 */

/** Mirrors the server default (`MAX_ORDER_NOTIONAL`). */
export const MAX_ORDER_NOTIONAL = '1000000';
/** The API charges 10 bps of notional. Estimates only; the server is authoritative. */
export const FEE_BPS = 10;
export const MONEY_DECIMALS = 8;

export interface OrderDraft {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: string;
  /** Raw input. Ignored for market orders, except to reject it. */
  limitPrice: string;
}

export interface OrderValidationContext {
  /** Live price used to estimate notional for market orders. */
  referencePrice?: string | null;
  maxNotional?: string;
}

export type OrderField = 'quantity' | 'limitPrice' | 'form';
export type OrderFieldErrors = Partial<Record<OrderField, string>>;

function scaleError(label: string): string {
  return `${label} must have at most ${MONEY_DECIMALS} decimal places.`;
}

function validateQuantity(raw: string): string | undefined {
  const value = raw.trim();
  if (value.length === 0) return 'Enter a quantity.';
  if (!isDecimal(value)) return 'Quantity must be a number.';
  if (!isPositiveDecimal(value)) return 'Quantity must be greater than zero.';
  if ((decimalPlaces(value) ?? 0) > MONEY_DECIMALS) return scaleError('Quantity');
  return undefined;
}

export function validateOrderDraft(
  draft: OrderDraft,
  context: OrderValidationContext = {},
): OrderFieldErrors {
  const errors: OrderFieldErrors = {};

  const quantityError = validateQuantity(draft.quantity);
  if (quantityError) errors.quantity = quantityError;

  const limitPrice = draft.limitPrice.trim();

  if (draft.type === 'MARKET') {
    if (limitPrice.length > 0) {
      errors.limitPrice = 'Limit price must be omitted for market orders.';
    }
  } else if (limitPrice.length === 0) {
    errors.limitPrice = 'Enter a limit price for limit orders.';
  } else if (!isDecimal(limitPrice)) {
    errors.limitPrice = 'Limit price must be a number.';
  } else if (!isPositiveDecimal(limitPrice)) {
    errors.limitPrice = 'Limit price must be greater than zero.';
  } else if ((decimalPlaces(limitPrice) ?? 0) > MONEY_DECIMALS) {
    errors.limitPrice = scaleError('Limit price');
  }

  if (hasOrderErrors(errors)) return errors;

  const price = draft.type === 'LIMIT' ? limitPrice : (context.referencePrice ?? '').trim();
  if (price.length === 0 || !isPositiveDecimal(price)) return errors;

  const notional = multiplyDecimal(draft.quantity.trim(), price, MONEY_DECIMALS);
  if (!notional) return errors;

  const cap = context.maxNotional ?? MAX_ORDER_NOTIONAL;
  if (compareDecimal(notional, cap) === 1) {
    errors.quantity = `Order notional ${formatDecimal(notional)} exceeds the ${formatDecimal(cap)} limit per order.`;
  }

  return errors;
}

export function hasOrderErrors(errors: OrderFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Request body for `POST /v1/orders`; `limitPrice` is absent for market orders. */
export function buildOrderPayload(draft: OrderDraft): CreateOrderRequest {
  const base = {
    symbol: draft.symbol,
    side: draft.side,
    quantity: draft.quantity.trim(),
  };

  if (draft.type === 'LIMIT') {
    return { ...base, type: 'LIMIT', limitPrice: draft.limitPrice.trim() };
  }

  return { ...base, type: 'MARKET' };
}

/** Exact notional and 10 bps fee estimates at money scale; `null` when incomplete. */
export function estimateOrder(
  draft: OrderDraft,
  referencePrice: string,
): { notional: string | null; fee: string | null } {
  const quantity = draft.quantity.trim();
  const price = (draft.type === 'LIMIT' ? draft.limitPrice : referencePrice).trim();

  if (!isPositiveDecimal(quantity) || !isPositiveDecimal(price)) {
    return { notional: null, fee: null };
  }

  const notional = multiplyDecimal(quantity, price, MONEY_DECIMALS);
  return { notional, fee: notional ? basisPointsOf(notional, FEE_BPS, MONEY_DECIMALS) : null };
}
