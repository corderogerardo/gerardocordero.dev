import { z } from 'zod';

/**
 * Wire schemas for the v1 API.
 *
 * Everything the server sends is parsed here before it reaches a component.
 * Money and quantities stay decimal **strings** all the way through: coercing a
 * balance to a JS number would silently lose precision above 2^53.
 */

const decimalString = z
  .string()
  .regex(/^-?\d+(?:\.\d+)?$/, 'expected a decimal string');

const timestamp = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/,
    'expected an RFC 3339 timestamp',
  );

const environment = z.string().min(1);

export const userSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  displayName: z.string(),
  createdAt: timestamp,
});

export const authSessionSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  tokenType: z.literal('Bearer'),
  expiresIn: z.number().int().positive(),
  user: userSchema,
});

export const meResponseSchema = z.object({
  user: userSchema,
  cash: decimalString,
  currency: z.string().min(1),
});

export const marketSchema = z.object({
  symbol: z.string().min(1),
  name: z.string(),
  kind: z.enum(['CRYPTO', 'EQUITY']),
  currency: z.string().min(1),
  tickSize: decimalString,
  lastPrice: decimalString,
  changePercent: decimalString,
  high: decimalString,
  low: decimalString,
  updatedAt: timestamp,
});

export const marketsResponseSchema = z.object({
  data: z.array(marketSchema),
  environment,
});

export const marketDetailResponseSchema = z.object({
  market: marketSchema,
  environment,
});

export const pricePointSchema = z.object({
  t: timestamp,
  p: decimalString,
});

export const marketHistoryResponseSchema = z.object({
  symbol: z.string().min(1),
  interval: z.string().min(1),
  points: z.array(pricePointSchema),
});

export const quoteSchema = z.object({
  symbol: z.string().min(1),
  price: decimalString,
  changePercent: decimalString,
  sessionOpen: decimalString,
  high: decimalString,
  low: decimalString,
  updatedAt: timestamp,
});

export const orderSideSchema = z.enum(['BUY', 'SELL']);
export const orderTypeSchema = z.enum(['MARKET', 'LIMIT']);
export const orderStatusSchema = z.enum(['OPEN', 'FILLED', 'CANCELLED', 'REJECTED']);

export const orderSchema = z.object({
  id: z.uuid(),
  symbol: z.string().min(1),
  side: orderSideSchema,
  type: orderTypeSchema,
  status: orderStatusSchema,
  quantity: decimalString,
  limitPrice: decimalString.nullable(),
  filledQuantity: decimalString,
  averageFillPrice: decimalString.nullable(),
  fee: decimalString,
  rejectionReason: z.string().nullable(),
  createdAt: timestamp,
  updatedAt: timestamp,
});

export const ordersPageSchema = z.object({
  data: z.array(orderSchema),
  nextCursor: z.string().nullable(),
});

export const positionSchema = z.object({
  symbol: z.string().min(1),
  quantity: decimalString,
  averageCost: decimalString,
  marketPrice: decimalString,
  marketValue: decimalString,
  unrealizedPnl: decimalString,
  unrealizedPnlPercent: decimalString,
});

export const portfolioSchema = z.object({
  cash: decimalString,
  currency: z.string().min(1),
  equity: decimalString,
  realizedPnl: decimalString,
  unrealizedPnl: decimalString,
  positions: z.array(positionSchema),
  environment,
});

export const errorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string(),
    details: z
      .object({
        field: z.string().optional(),
      })
      .nullable()
      .optional(),
  }),
});

export const streamFrameSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('snapshot'), quotes: z.array(quoteSchema) }),
  z.object({ type: z.literal('quote'), quote: quoteSchema }),
  z.object({ type: z.literal('pong') }),
]);

export type User = z.infer<typeof userSchema>;
export type AuthSession = z.infer<typeof authSessionSchema>;
export type Me = z.infer<typeof meResponseSchema>;
export type Market = z.infer<typeof marketSchema>;
export type MarketsResponse = z.infer<typeof marketsResponseSchema>;
export type MarketDetailResponse = z.infer<typeof marketDetailResponseSchema>;
export type PricePoint = z.infer<typeof pricePointSchema>;
export type MarketHistoryResponse = z.infer<typeof marketHistoryResponseSchema>;
export type Quote = z.infer<typeof quoteSchema>;
export type OrderSide = z.infer<typeof orderSideSchema>;
export type OrderType = z.infer<typeof orderTypeSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type Order = z.infer<typeof orderSchema>;
export type OrdersPage = z.infer<typeof ordersPageSchema>;
export type Position = z.infer<typeof positionSchema>;
export type Portfolio = z.infer<typeof portfolioSchema>;
export type StreamFrame = z.infer<typeof streamFrameSchema>;

export type CreateOrderRequest =
  | { symbol: string; side: OrderSide; type: 'MARKET'; quantity: string }
  | { symbol: string; side: OrderSide; type: 'LIMIT'; quantity: string; limitPrice: string };
