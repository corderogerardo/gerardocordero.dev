import { API_PATHS } from '@/config';
import { streamFrameSchema, type Quote, type StreamFrame } from '@/api/schemas';

/**
 * WebSocket quote client.
 *
 * The socket is public (no token in the URL), so the only failure modes are
 * connection ones: reconnect with exponential backoff plus jitter, re-send
 * subscriptions after every reconnect, and treat a silent connection as dead.
 * The socket factory and every timer are injectable so tests never open a real
 * connection or wait on real time.
 */

export type StreamStatus = 'idle' | 'connecting' | 'open' | 'reconnecting' | 'closed';

export interface WebSocketLike {
  readyState: number;
  send(data: string): void;
  close(code?: number, reason?: string): void;
  onopen: ((event: unknown) => void) | null;
  onmessage: ((event: { data: unknown }) => void) | null;
  onclose: ((event: unknown) => void) | null;
  onerror: ((event: unknown) => void) | null;
}

export type WebSocketFactory = (url: string) => WebSocketLike;

/** Opaque: the caller supplies `setTimeoutFn`/`clearTimeoutFn` as a pair. */
export type TimerHandle = unknown;

export interface MarketStreamOptions {
  /** Absolute `ws://` or `wss://` URL, including the symbol query. */
  url: string;
  onQuotes: (quotes: Quote[]) => void;
  onStatus?: (status: StreamStatus) => void;
  symbols?: readonly string[];
  createSocket?: WebSocketFactory;
  baseDelayMs?: number;
  maxDelayMs?: number;
  /** Fraction of the delay that may be added or removed, e.g. 0.2 => 80%–120%. */
  jitterRatio?: number;
  heartbeatIntervalMs?: number;
  /** Reconnect when nothing (not even a pong) arrives inside this window. */
  staleAfterMs?: number;
  random?: () => number;
  now?: () => number;
  setTimeoutFn?: (fn: () => void, milliseconds: number) => TimerHandle;
  clearTimeoutFn?: (handle: TimerHandle) => void;
  setIntervalFn?: (fn: () => void, milliseconds: number) => TimerHandle;
  clearIntervalFn?: (handle: TimerHandle) => void;
}

type ClientFrame =
  | { type: 'subscribe'; symbols: string[] }
  | { type: 'unsubscribe'; symbols: string[] }
  | { type: 'ping' };

type ResolvedOptions = {
  url: string;
  onQuotes: (quotes: Quote[]) => void;
  onStatus?: (status: StreamStatus) => void;
  symbols?: readonly string[];
  createSocket: WebSocketFactory;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterRatio: number;
  heartbeatIntervalMs: number;
  staleAfterMs: number;
  random: () => number;
  now: () => number;
  setTimeoutFn: (fn: () => void, milliseconds: number) => TimerHandle;
  clearTimeoutFn: (handle: TimerHandle) => void;
  setIntervalFn: (fn: () => void, milliseconds: number) => TimerHandle;
  clearIntervalFn: (handle: TimerHandle) => void;
};

const SOCKET_OPEN = 1;

const DEFAULTS = {
  baseDelayMs: 500,
  maxDelayMs: 15_000,
  jitterRatio: 0.2,
  heartbeatIntervalMs: 20_000,
  staleAfterMs: 45_000,
} as const;

export function streamUrl(baseUrl: string, symbols: readonly string[]): string {
  const base = baseUrl.replace(/\/+$/, '').replace(/^http/, 'ws');
  return `${base}${API_PATHS.stream(symbols)}`;
}

function defaultSocketFactory(url: string): WebSocketLike {
  return new WebSocket(url) as unknown as WebSocketLike;
}

export class MarketStream {
  private readonly options: ResolvedOptions;

  private socket: WebSocketLike | null = null;
  private symbols: Set<string>;
  private status: StreamStatus = 'idle';
  private attempt = 0;
  private closed = false;
  private reconnectTimer: TimerHandle | null = null;
  private heartbeatTimer: TimerHandle | null = null;
  private lastActivity = 0;

  constructor(options: MarketStreamOptions) {
    this.options = {
      ...options,
      baseDelayMs: options.baseDelayMs ?? DEFAULTS.baseDelayMs,
      maxDelayMs: options.maxDelayMs ?? DEFAULTS.maxDelayMs,
      jitterRatio: options.jitterRatio ?? DEFAULTS.jitterRatio,
      heartbeatIntervalMs: options.heartbeatIntervalMs ?? DEFAULTS.heartbeatIntervalMs,
      staleAfterMs: options.staleAfterMs ?? DEFAULTS.staleAfterMs,
      createSocket: options.createSocket ?? defaultSocketFactory,
      random: options.random ?? Math.random,
      now: options.now ?? Date.now,
      setTimeoutFn:
        options.setTimeoutFn ??
        ((fn, milliseconds) => setTimeout(fn, milliseconds) as TimerHandle),
      clearTimeoutFn:
        options.clearTimeoutFn ??
        ((handle) => clearTimeout(handle as ReturnType<typeof setTimeout>)),
      setIntervalFn:
        options.setIntervalFn ??
        ((fn, milliseconds) => setInterval(fn, milliseconds) as TimerHandle),
      clearIntervalFn:
        options.clearIntervalFn ??
        ((handle) => clearInterval(handle as ReturnType<typeof setInterval>)),
    };
    this.symbols = new Set((options.symbols ?? []).map((symbol) => symbol.toUpperCase()));
  }

  start(): void {
    if (this.closed || this.socket) return;
    this.connect();
  }

  /** Replace the subscription set, sending only the difference. */
  setSymbols(next: readonly string[]): void {
    const target = new Set(next.map((symbol) => symbol.toUpperCase()));
    const added = [...target].filter((symbol) => !this.symbols.has(symbol));
    const removed = [...this.symbols].filter((symbol) => !target.has(symbol));

    this.symbols = target;
    if (added.length > 0) this.send({ type: 'subscribe', symbols: added });
    if (removed.length > 0) this.send({ type: 'unsubscribe', symbols: removed });
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;

    this.stopReconnect();
    this.stopHeartbeat();

    const socket = this.socket;
    this.socket = null;
    if (socket) {
      this.release(socket);
      try {
        socket.close();
      } catch {
        // The socket is already gone; nothing to clean up.
      }
    }

    this.setStatus('closed');
  }

  private connect(): void {
    if (this.closed) return;

    let socket: WebSocketLike;
    try {
      socket = this.options.createSocket(this.options.url);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.socket = socket;
    this.setStatus(this.attempt === 0 ? 'connecting' : 'reconnecting');

    socket.onopen = () => {
      if (this.closed || this.socket !== socket) return;
      this.attempt = 0;
      this.lastActivity = this.options.now();
      this.setStatus('open');
      this.resubscribe();
      this.startHeartbeat();
    };

    socket.onmessage = (event) => {
      if (this.closed || this.socket !== socket) return;
      this.lastActivity = this.options.now();
      this.handleFrame(event.data);
    };

    socket.onclose = () => {
      this.handleDrop(socket);
    };

    socket.onerror = () => {
      this.handleDrop(socket);
    };
  }

  private resubscribe(): void {
    if (this.symbols.size === 0) return;
    this.send({ type: 'subscribe', symbols: [...this.symbols] });
  }

  private handleFrame(raw: unknown): void {
    if (typeof raw !== 'string') return;

    const parsed = this.parseFrame(raw);
    if (!parsed) return;

    if (parsed.type === 'snapshot') this.options.onQuotes(parsed.quotes);
    if (parsed.type === 'quote') this.options.onQuotes([parsed.quote]);
  }

  private parseFrame(raw: string): StreamFrame | null {
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      return null;
    }

    const parsed = streamFrameSchema.safeParse(json);
    return parsed.success ? parsed.data : null;
  }

  private handleDrop(socket: WebSocketLike): void {
    if (this.closed || this.socket !== socket) return;

    this.socket = null;
    this.release(socket);
    this.stopHeartbeat();
    this.scheduleReconnect();
  }

  private release(socket: WebSocketLike): void {
    socket.onopen = null;
    socket.onmessage = null;
    socket.onclose = null;
    socket.onerror = null;
  }

  private scheduleReconnect(): void {
    if (this.closed || this.reconnectTimer !== null) return;

    const delay = this.nextDelay();
    this.attempt += 1;
    this.setStatus('reconnecting');

    this.reconnectTimer = this.options.setTimeoutFn(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  /** `base * 2^attempt`, capped, then scaled by a jitter factor in [1-j, 1+j]. */
  private nextDelay(): number {
    const exponent = Math.min(this.attempt, 16);
    const raw = Math.min(
      this.options.maxDelayMs,
      this.options.baseDelayMs * 2 ** exponent,
    );
    const jitter = 1 + (this.options.random() * 2 - 1) * this.options.jitterRatio;
    return Math.max(0, Math.round(raw * jitter));
  }

  private stopReconnect(): void {
    if (this.reconnectTimer === null) return;
    this.options.clearTimeoutFn(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = this.options.setIntervalFn(() => {
      const silentFor = this.options.now() - this.lastActivity;
      if (silentFor > this.options.staleAfterMs) {
        this.forceReconnect();
        return;
      }
      this.send({ type: 'ping' });
    }, this.options.heartbeatIntervalMs);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer === null) return;
    this.options.clearIntervalFn(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }

  /** The connection looks alive at the TCP level but no frame has arrived. */
  private forceReconnect(): void {
    const socket = this.socket;
    if (!socket) return;

    this.socket = null;
    this.release(socket);
    this.stopHeartbeat();

    try {
      socket.close();
    } catch {
      // Already closed.
    }

    this.scheduleReconnect();
  }

  private send(frame: ClientFrame): void {
    const socket = this.socket;
    if (!socket || socket.readyState !== SOCKET_OPEN) return;

    try {
      socket.send(JSON.stringify(frame));
    } catch {
      // The close event will drive the reconnect.
    }
  }

  private setStatus(status: StreamStatus): void {
    if (this.status === status) return;
    this.status = status;
    this.options.onStatus?.(status);
  }
}

export function createMarketStream(options: MarketStreamOptions): MarketStream {
  return new MarketStream(options);
}
