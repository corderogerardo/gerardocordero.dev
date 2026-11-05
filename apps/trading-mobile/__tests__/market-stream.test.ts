import {
  createMarketStream,
  streamUrl,
  type MarketStreamOptions,
  type WebSocketLike,
} from '@/stream/market-stream';
import type { Quote } from '@/api/schemas';

const OPEN = 1;
const CLOSED = 3;

const QUOTE: Quote = {
  symbol: 'BTC-USD',
  price: '64250.00000000',
  changePercent: '0.1537',
  sessionOpen: '64150.00000000',
  high: '64500.00000000',
  low: '63900.00000000',
  updatedAt: '2026-11-03T15:28:50.206492Z',
};

class FakeSocket implements WebSocketLike {
  readyState = 0;
  sent: string[] = [];
  closed = false;

  onopen: ((event: unknown) => void) | null = null;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onclose: ((event: unknown) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;

  constructor(readonly url: string) {}

  send(data: string): void {
    this.sent.push(data);
  }

  close(): void {
    this.closed = true;
    this.readyState = CLOSED;
  }

  open(): void {
    this.readyState = OPEN;
    this.onopen?.({});
  }

  emit(payload: unknown): void {
    this.onmessage?.({ data: typeof payload === 'string' ? payload : JSON.stringify(payload) });
  }

  drop(): void {
    this.readyState = CLOSED;
    this.onclose?.({});
  }
}

interface Harness {
  stream: ReturnType<typeof createMarketStream>;
  sockets: FakeSocket[];
  delays: number[];
  quotes: Quote[];
  statuses: string[];
  last(): FakeSocket;
  random(value: number): void;
  advance(milliseconds: number): void;
}

function harness(overrides: Partial<MarketStreamOptions> = {}): Harness {
  const sockets: FakeSocket[] = [];
  const delays: number[] = [];
  const quotes: Quote[] = [];
  const statuses: string[] = [];
  let clock = 0;
  let randomValue = 0;

  const stream = createMarketStream({
    url: 'ws://test.local/v1/stream',
    createSocket: (url) => {
      const socket = new FakeSocket(url);
      sockets.push(socket);
      return socket;
    },
    onQuotes: (batch) => quotes.push(...batch),
    onStatus: (status) => statuses.push(status),
    setTimeoutFn: (fn, milliseconds) => {
      delays.push(milliseconds);
      return setTimeout(fn, milliseconds);
    },
    clearTimeoutFn: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
    setIntervalFn: (fn, milliseconds) => setInterval(fn, milliseconds),
    clearIntervalFn: (handle) => clearInterval(handle as ReturnType<typeof setInterval>),
    now: () => clock,
    random: () => randomValue,
    baseDelayMs: 100,
    maxDelayMs: 1000,
    jitterRatio: 0.2,
    heartbeatIntervalMs: 1000,
    staleAfterMs: 3000,
    ...overrides,
  });

  return {
    stream,
    sockets,
    delays,
    quotes,
    statuses,
    last() {
      const socket = sockets[sockets.length - 1];
      if (!socket) throw new Error('no socket created');
      return socket;
    },
    random(value: number) {
      randomValue = value;
    },
    advance(milliseconds: number) {
      clock += milliseconds;
    },
  };
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('streamUrl', () => {
  it('upgrades the API base URL and encodes the symbols', () => {
    expect(streamUrl('http://127.0.0.1:8080', ['BTC-USD', 'ETH-USD'])).toBe(
      'ws://127.0.0.1:8080/v1/stream?symbols=BTC-USD,ETH-USD',
    );
    expect(streamUrl('https://api.example.test/', [])).toBe('wss://api.example.test/v1/stream');
  });
});

describe('MarketStream backoff', () => {
  it('grows exponentially and stays inside the jitter band', () => {
    const stream = harness();
    stream.stream.start();
    stream.last().drop();

    for (let index = 0; index < 5; index += 1) {
      jest.advanceTimersByTime(stream.delays[index] ?? 0);
      stream.last().drop();
    }

    // random() === 0 => factor 0.8, capped at maxDelayMs.
    expect(stream.delays.slice(0, 5)).toEqual([80, 160, 320, 640, 800]);
  });

  it('never exceeds the jitter upper bound', () => {
    const stream = harness();
    stream.random(1);
    stream.stream.start();
    stream.last().drop();

    for (let index = 0; index < 5; index += 1) {
      jest.advanceTimersByTime(stream.delays[index] ?? 0);
      stream.last().drop();
    }

    // random() === 1 => factor 1.2; the raw delay is capped at 1000 first.
    expect(stream.delays.slice(0, 5)).toEqual([120, 240, 480, 960, 1200]);
  });
});

describe('MarketStream subscriptions', () => {
  it('subscribes on open and re-sends subscriptions after a reconnect', () => {
    const stream = harness({ symbols: ['BTC-USD'] });
    stream.stream.start();
    stream.last().open();

    expect(JSON.parse(stream.last().sent[0] ?? '{}')).toEqual({
      type: 'subscribe',
      symbols: ['BTC-USD'],
    });

    stream.last().drop();
    jest.advanceTimersByTime(stream.delays[0] ?? 0);
    stream.last().open();

    expect(JSON.parse(stream.last().sent[0] ?? '{}')).toEqual({
      type: 'subscribe',
      symbols: ['BTC-USD'],
    });
  });

  it('sends incremental subscribe and unsubscribe frames', () => {
    const stream = harness({ symbols: ['BTC-USD'] });
    stream.stream.start();
    stream.last().open();

    stream.stream.setSymbols(['BTC-USD', 'ETH-USD']);
    stream.stream.setSymbols(['ETH-USD']);

    expect(stream.last().sent.slice(1).map((frame) => JSON.parse(frame))).toEqual([
      { type: 'subscribe', symbols: ['ETH-USD'] },
      { type: 'unsubscribe', symbols: ['BTC-USD'] },
    ]);
  });
});

describe('MarketStream frames', () => {
  it('emits snapshot and single-quote batches', () => {
    const stream = harness();
    stream.stream.start();
    stream.last().open();

    stream.last().emit({ type: 'snapshot', quotes: [QUOTE] });
    stream.last().emit({ type: 'quote', quote: { ...QUOTE, price: '64300.00000000' } });
    stream.last().emit({ type: 'pong' });
    stream.last().emit('not json');
    stream.last().emit({ type: 'unknown' });

    expect(stream.quotes).toEqual([QUOTE, { ...QUOTE, price: '64300.00000000' }]);
  });
});

describe('MarketStream heartbeat', () => {
  it('pings while the connection is fresh', () => {
    const stream = harness();
    stream.stream.start();
    stream.last().open();

    stream.advance(500);
    jest.advanceTimersByTime(1000);

    expect(stream.last().sent.map((frame) => JSON.parse(frame))).toContainEqual({ type: 'ping' });
  });

  it('reconnects when no frame arrives inside the staleness window', () => {
    const stream = harness();
    stream.stream.start();
    const first = stream.last();
    first.open();

    stream.advance(3001);
    jest.advanceTimersByTime(1000);

    expect(first.closed).toBe(true);
    expect(stream.statuses).toContain('reconnecting');

    jest.advanceTimersByTime(stream.delays[0] ?? 0);
    expect(stream.sockets).toHaveLength(2);
  });
});

describe('MarketStream close', () => {
  it('closes the socket, clears timers and never reconnects', () => {
    const stream = harness({ symbols: ['BTC-USD'] });
    stream.stream.start();
    const socket = stream.last();
    socket.open();

    stream.stream.close();

    expect(socket.closed).toBe(true);
    expect(jest.getTimerCount()).toBe(0);

    socket.drop();
    jest.advanceTimersByTime(60_000);

    expect(stream.sockets).toHaveLength(1);
    expect(stream.statuses[stream.statuses.length - 1]).toBe('closed');
  });

  it('ignores frames that arrive after close', () => {
    const stream = harness();
    stream.stream.start();
    const socket = stream.last();
    socket.open();

    stream.stream.close();
    socket.emit({ type: 'quote', quote: QUOTE });

    expect(stream.quotes).toEqual([]);
  });

  it('is safe to call twice', () => {
    const stream = harness();
    stream.stream.start();
    stream.stream.close();

    expect(() => stream.stream.close()).not.toThrow();
  });
});
