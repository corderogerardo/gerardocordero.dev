import { Platform } from 'react-native';

/**
 * Runtime configuration.
 *
 * The API base URL comes from `EXPO_PUBLIC_API_URL` when set (EAS profiles, CI,
 * a physical device on your LAN). Otherwise we pick the address that reaches the
 * host machine from each simulator: iOS shares the host loopback, the Android
 * emulator exposes the host as 10.0.2.2.
 */
function defaultApiUrl(): string {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080';
  }
  return 'http://127.0.0.1:8080';
}

export const env = {
  apiBaseUrl: (process.env.EXPO_PUBLIC_API_URL ?? defaultApiUrl()).replace(/\/+$/, ''),
  /** Paper trading is a product boundary, not a build flag. */
  tradingEnvironment: 'paper' as const,
} as const;

export const copy = {
  disclaimer:
    'Simulated prices and paper trading only. No real money or orders are involved.',
  apiVersion: 'v1',
} as const;

export const API_PATHS = {
  register: '/v1/auth/register',
  login: '/v1/auth/login',
  refresh: '/v1/auth/refresh',
  logout: '/v1/auth/logout',
  me: '/v1/me',
  markets: '/v1/markets',
  market: (symbol: string) => `/v1/markets/${encodeURIComponent(symbol)}`,
  history: (symbol: string, points: number) =>
    `/v1/markets/${encodeURIComponent(symbol)}/history?points=${points}`,
  orders: '/v1/orders',
  order: (id: string) => `/v1/orders/${encodeURIComponent(id)}`,
  cancelOrder: (id: string) => `/v1/orders/${encodeURIComponent(id)}/cancel`,
  portfolio: '/v1/portfolio',
  stream: (symbols: readonly string[]) =>
    `/v1/stream${symbols.length > 0 ? `?symbols=${symbols.map(encodeURIComponent).join(',')}` : ''}`,
} as const;
