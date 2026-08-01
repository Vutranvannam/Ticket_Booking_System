-- ============================================================================
-- FILE: 15_finance.sql
-- MODULE: Finance
-- TABLES: wallets, wallet_transactions
-- DEPENDENCIES: 01_identity_access.sql (users)
-- ============================================================================

-- ============================================================================
-- TABLE: wallets
-- PURPOSE: User e-wallet for refunds and quick purchases
-- ============================================================================
CREATE TABLE wallets (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL,
    balance         DECIMAL(14,2)   NOT NULL DEFAULT 0,
    currency        VARCHAR(3)      NOT NULL DEFAULT 'VND',
    status          VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    version         INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_wallets PRIMARY KEY (id),
    CONSTRAINT fk_wallets_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT uk_wallets_user UNIQUE (user_id),
    CONSTRAINT ck_wallets_balance CHECK (balance >= 0),
    CONSTRAINT ck_wallets_status CHECK (status IN ('ACTIVE', 'FROZEN', 'CLOSED'))
);

COMMENT ON TABLE wallets IS 'User e-wallet — enables instant refunds to wallet without banking delays';
COMMENT ON COLUMN wallets.version IS 'Optimistic locking for concurrent balance updates';

-- ============================================================================
-- TABLE: wallet_transactions
-- PURPOSE: Double-entry ledger for wallet movements
-- ============================================================================
CREATE TABLE wallet_transactions (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    wallet_id       UUID            NOT NULL,
    transaction_type VARCHAR(20)    NOT NULL,
    amount          DECIMAL(14,2)   NOT NULL,
    balance_before  DECIMAL(14,2)   NOT NULL,
    balance_after   DECIMAL(14,2)   NOT NULL,
    reference_type  VARCHAR(50)     NOT NULL,
    reference_id    VARCHAR(255)    NOT NULL,
    description     VARCHAR(255),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_wallet_transactions PRIMARY KEY (id),
    CONSTRAINT fk_wt_wallet FOREIGN KEY (wallet_id) REFERENCES wallets (id) ON DELETE RESTRICT,
    CONSTRAINT ck_wt_type CHECK (transaction_type IN ('DEPOSIT', 'WITHDRAWAL', 'PAYMENT', 'REFUND')),
    CONSTRAINT ck_wt_amount CHECK (amount > 0),
    CONSTRAINT ck_wt_balance CHECK (
        (transaction_type IN ('DEPOSIT', 'REFUND') AND balance_after = balance_before + amount)
        OR
        (transaction_type IN ('WITHDRAWAL', 'PAYMENT') AND balance_after = balance_before - amount)
    )
) PARTITION BY RANGE (created_at);

-- Create initial partitions
CREATE TABLE wallet_transactions_y2026m07 PARTITION OF wallet_transactions
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE wallet_transactions_y2026m08 PARTITION OF wallet_transactions
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE wallet_transactions_y2026m09 PARTITION OF wallet_transactions
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE wallet_transactions_y2026m10 PARTITION OF wallet_transactions
    FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE wallet_transactions_y2026m11 PARTITION OF wallet_transactions
    FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE wallet_transactions_y2026m12 PARTITION OF wallet_transactions
    FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

CREATE INDEX idx_wt_wallet_id ON wallet_transactions (wallet_id, created_at DESC);
CREATE INDEX idx_wt_reference ON wallet_transactions (reference_type, reference_id);

COMMENT ON TABLE wallet_transactions IS 'Immutable ledger ensuring wallet balance history is traceable and mathematically sound';
