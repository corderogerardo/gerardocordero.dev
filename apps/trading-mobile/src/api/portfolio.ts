import { useQuery } from '@tanstack/react-query';

import { API_PATHS } from '@/config';

import { getApiClient } from './client';
import { parseOrThrow } from './errors';
import { portfolioSchema, type Portfolio } from './schemas';

/** Balances are decimal strings end to end; nothing here converts them. */

export const portfolioKey = ['portfolio'] as const;

export async function fetchPortfolio(): Promise<Portfolio> {
  const raw = await getApiClient().request<unknown>(API_PATHS.portfolio);
  return parseOrThrow(portfolioSchema, raw);
}

export function usePortfolio() {
  return useQuery({
    queryKey: portfolioKey,
    queryFn: fetchPortfolio,
    staleTime: 5_000,
  });
}
