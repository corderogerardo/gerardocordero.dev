import { useState } from 'react';

import type { CreateOrderRequest, Order } from '@/api/schemas';

/**
 * Controllable replacement for `useCreateOrder`.
 *
 * The real hook only wraps a mutation, so the ticket test supplies the same
 * shape while keeping full control of when the request resolves, rejects or is
 * still pending. The request itself is still asserted on `createOrderMock`,
 * which is the API contract the ticket must produce.
 */
export const createOrderMock = jest.fn<Promise<Order>, [{ order: CreateOrderRequest; idempotencyKey: string }]>();

export interface FakeCreateOrder {
  mutateAsync: (input: { order: CreateOrderRequest; idempotencyKey: string }) => Promise<Order>;
  isPending: boolean;
  variables: { order: CreateOrderRequest; idempotencyKey: string } | undefined;
}

export function useCreateOrderMock(): FakeCreateOrder {
  const [isPending, setIsPending] = useState(false);
  const [variables, setVariables] = useState<FakeCreateOrder['variables']>(undefined);

  async function mutateAsync(input: {
    order: CreateOrderRequest;
    idempotencyKey: string;
  }): Promise<Order> {
    setVariables(input);
    setIsPending(true);
    try {
      return await createOrderMock(input);
    } finally {
      setIsPending(false);
    }
  }

  return { mutateAsync, isPending, variables };
}
