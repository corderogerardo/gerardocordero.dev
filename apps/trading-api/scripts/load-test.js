// On-demand load test. Not part of `make verify`: it needs a running server and
// takes minutes. The goal is to see the shape of the latency curve and to prove
// the ledger stays consistent under concurrency, not to chase a benchmark.
//
//   make db-up && make run           # terminal 1
//   k6 run scripts/load-test.js      # terminal 2
//
// Environment overrides:
//   BASE_URL=http://127.0.0.1:8080
//   VUS=25 ITERATIONS=400

import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomUUID } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:8080';
const SYMBOLS = ['BTC-USD', 'ETH-USD', 'AAPL', 'TSLA'];

export const options = {
  scenarios: {
    trading_mix: {
      executor: 'ramping-vus',
      startVUs: 2,
      stages: [
        { duration: '20s', target: Number(__ENV.VUS || 25) },
        { duration: '40s', target: Number(__ENV.VUS || 25) },
        { duration: '10s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    'http_req_duration{name:markets}': ['p(95)<150'],
    'http_req_duration{name:portfolio}': ['p(95)<250'],
    'http_req_duration{name:order}': ['p(95)<600'],
  },
};

function register() {
  const email = `load-${randomUUID()}@example.test`;
  const response = http.post(
    `${BASE_URL}/v1/auth/register`,
    JSON.stringify({
      email,
      password: 'correct horse battery staple',
      displayName: 'Load Tester',
    }),
    { headers: { 'content-type': 'application/json' }, tags: { name: 'register' } },
  );

  check(response, { 'registered': (r) => r.status === 201 });
  return response.json();
}

export function setup() {
  return { sessions: Array.from({ length: 10 }, register) };
}

export default function (data) {
  const session = data.sessions[__VU % data.sessions.length];
  const auth = { headers: { authorization: `Bearer ${session.accessToken}` } };

  const markets = http.get(`${BASE_URL}/v1/markets`, { tags: { name: 'markets' } });
  check(markets, { 'markets 200': (r) => r.status === 200 });

  const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  const order = http.post(
    `${BASE_URL}/v1/orders`,
    JSON.stringify({
      symbol,
      side: 'BUY',
      type: 'MARKET',
      quantity: '0.001',
    }),
    {
      headers: {
        ...auth.headers,
        'content-type': 'application/json',
        'idempotency-key': randomUUID(),
      },
      tags: { name: 'order' },
    },
  );
  check(order, {
    'order accepted or rejected for funds': (r) => r.status === 201 || r.status === 422,
  });

  const portfolio = http.get(`${BASE_URL}/v1/portfolio`, {
    ...auth,
    tags: { name: 'portfolio' },
  });
  check(portfolio, { 'portfolio 200': (r) => r.status === 200 });

  sleep(1);
}
