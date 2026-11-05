-- Initial schema for the paper-trading API.
--
-- Money is NUMERIC(20, 8) everywhere. No FLOAT, no REAL: binary floating point
-- cannot represent 0.1 exactly and a trading ledger cannot tolerate drift.

CREATE TABLE users (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email            text NOT NULL,
    email_normalized text NOT NULL UNIQUE,
    display_name     text NOT NULL,
    password_hash    text NOT NULL,
    created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE accounts (
    user_id    uuid PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    cash       numeric(20, 8) NOT NULL CHECK (cash >= 0),
    currency   text NOT NULL DEFAULT 'USD',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE instruments (
    symbol    text PRIMARY KEY,
    name      text NOT NULL,
    kind      text NOT NULL CHECK (kind IN ('CRYPTO', 'EQUITY')),
    currency  text NOT NULL DEFAULT 'USD',
    tick_size numeric(20, 8) NOT NULL CHECK (tick_size > 0)
);

CREATE TABLE refresh_tokens (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash  text NOT NULL UNIQUE,
    expires_at  timestamptz NOT NULL,
    revoked_at  timestamptz,
    replaced_by uuid,
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX refresh_tokens_user_idx ON refresh_tokens (user_id);

CREATE TABLE orders (
    id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    symbol             text NOT NULL REFERENCES instruments (symbol),
    side               text NOT NULL CHECK (side IN ('BUY', 'SELL')),
    order_type         text NOT NULL CHECK (order_type IN ('MARKET', 'LIMIT')),
    status             text NOT NULL CHECK (status IN ('OPEN', 'FILLED', 'CANCELLED', 'REJECTED')),
    quantity           numeric(20, 8) NOT NULL CHECK (quantity > 0),
    limit_price        numeric(20, 8) CHECK (limit_price > 0),
    filled_quantity    numeric(20, 8) NOT NULL DEFAULT 0 CHECK (filled_quantity >= 0),
    average_fill_price numeric(20, 8) CHECK (average_fill_price > 0),
    fee                numeric(20, 8) NOT NULL DEFAULT 0 CHECK (fee >= 0),
    rejection_reason   text,
    created_at         timestamptz NOT NULL DEFAULT now(),
    updated_at         timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT orders_limit_price_matches_type
        CHECK ((order_type = 'LIMIT') = (limit_price IS NOT NULL)),
    CONSTRAINT orders_filled_quantity_within_order
        CHECK (filled_quantity <= quantity)
);

-- Order history is always read newest-first for one user.
CREATE INDEX orders_user_created_idx ON orders (user_id, created_at DESC, id DESC);

-- The matcher scans open limit orders by symbol; partial keeps it tiny.
CREATE INDEX orders_open_by_symbol_idx ON orders (symbol, created_at)
    WHERE status = 'OPEN';

CREATE TABLE trades (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    uuid NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    user_id     uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    symbol      text NOT NULL,
    side        text NOT NULL CHECK (side IN ('BUY', 'SELL')),
    quantity    numeric(20, 8) NOT NULL CHECK (quantity > 0),
    price       numeric(20, 8) NOT NULL CHECK (price > 0),
    fee         numeric(20, 8) NOT NULL CHECK (fee >= 0),
    executed_at timestamptz NOT NULL DEFAULT now()
);

-- v1 fills each order at most once. This index is the database-level guarantee.
CREATE UNIQUE INDEX trades_one_per_order_idx ON trades (order_id);
CREATE INDEX trades_user_executed_idx ON trades (user_id, executed_at DESC);

CREATE TABLE positions (
    user_id      uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    symbol       text NOT NULL REFERENCES instruments (symbol),
    quantity     numeric(20, 8) NOT NULL CHECK (quantity >= 0),
    average_cost numeric(20, 8) NOT NULL CHECK (average_cost >= 0),
    realized_pnl numeric(20, 8) NOT NULL DEFAULT 0,
    updated_at   timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, symbol)
);

CREATE TABLE idempotency_keys (
    user_id      uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    key          text NOT NULL,
    request_hash text NOT NULL,
    order_id     uuid REFERENCES orders (id) ON DELETE CASCADE,
    created_at   timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, key)
);

CREATE TABLE audit_events (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id    uuid REFERENCES users (id) ON DELETE SET NULL,
    action     text NOT NULL,
    subject    text,
    metadata   jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_events_user_created_idx ON audit_events (user_id, created_at DESC);

-- Tradable universe. Prices are simulated; these are the instruments the
-- deterministic engine will quote.
INSERT INTO instruments (symbol, name, kind, currency, tick_size) VALUES
    ('AAPL',    'Apple Inc.',                'EQUITY', 'USD', 0.01),
    ('BTC-USD', 'Bitcoin / US Dollar',       'CRYPTO', 'USD', 0.01),
    ('ETH-USD', 'Ethereum / US Dollar',      'CRYPTO', 'USD', 0.01),
    ('NVDA',    'NVIDIA Corp.',              'EQUITY', 'USD', 0.01),
    ('SOL-USD', 'Solana / US Dollar',        'CRYPTO', 'USD', 0.01),
    ('TSLA',    'Tesla Inc.',                'EQUITY', 'USD', 0.01);
