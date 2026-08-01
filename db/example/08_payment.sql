-- ============================================================================
-- FILE: 08_payment.sql
-- MODULE: Payment
-- TABLES: payment_providers, payments, refunds, webhook_events, settlement_records
-- DEPENDENCIES: 01 (users), 03 (organizers), 07 (bookings)
-- ============================================================================

-- ============================================================================
-- TABLE: payment_providers
-- PURPOSE: Reference table for supported payment providers
-- ============================================================================
CREATE TABLE payment_providers (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    name            VARCHAR(50)     NOT NULL,
    code            VARCHAR(20)     NOT NULL,
    description     VARCHAR(255),
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    config          JSONB,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_payment_providers PRIMARY KEY (id),
    CONSTRAINT uk_pp_name UNIQUE (name),
    CONSTRAINT uk_pp_code UNIQUE (code)
);

COMMENT ON TABLE payment_providers IS 'Reference table — config stores non-sensitive provider settings (fees, endpoints)';

-- ============================================================================
-- TABLE: payments
-- PURPOSE: Every payment attempt for a booking
-- ============================================================================
CREATE TABLE payments (
    id                      UUID            NOT NULL DEFAULT gen_random_uuid(),
    transaction_id          VARCHAR(50)     NOT NULL,
    booking_id              UUID            NOT NULL,
    provider_id             UUID            NOT NULL,
    user_id                 UUID            NOT NULL,
    amount                  DECIMAL(12,2)   NOT NULL,
    currency                VARCHAR(3)      NOT NULL DEFAULT 'VND',
    status                  VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    provider_transaction_id VARCHAR(255),
    provider_response       JSONB,
    failure_reason          VARCHAR(500),
    paid_at                 TIMESTAMPTZ,
    refunded_at             TIMESTAMPTZ,
    version                 INT             NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_payments PRIMARY KEY (id),
    CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE RESTRICT,
    CONSTRAINT fk_payments_provider FOREIGN KEY (provider_id) REFERENCES payment_providers (id) ON DELETE RESTRICT,
    CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT uk_payments_transaction_id UNIQUE (transaction_id),
    CONSTRAINT ck_payments_status CHECK (status IN ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED')),
    CONSTRAINT ck_payments_amount CHECK (amount > 0),
    CONSTRAINT ck_payments_currency CHECK (LENGTH(currency) = 3)
);

CREATE INDEX idx_payments_booking_id ON payments (booking_id);
CREATE INDEX idx_payments_user_id ON payments (user_id);
CREATE INDEX idx_payments_status ON payments (status);
CREATE INDEX idx_payments_provider_tx ON payments (provider_transaction_id) WHERE provider_transaction_id IS NOT NULL;
CREATE INDEX idx_payments_created_at ON payments (created_at);

COMMENT ON TABLE payments IS 'One booking can have multiple payment records (failed attempt → retry with new record)';
COMMENT ON COLUMN payments.version IS 'Optimistic locking — prevents duplicate webhook processing';

-- ============================================================================
-- TABLE: refunds
-- PURPOSE: First-class refund/chargeback tracking — separate from payments
-- ============================================================================
CREATE TABLE refunds (
    id                  UUID            NOT NULL DEFAULT gen_random_uuid(),
    refund_number       VARCHAR(30)     NOT NULL,
    payment_id          UUID            NOT NULL,
    booking_id          UUID            NOT NULL,
    user_id             UUID            NOT NULL,
    type                VARCHAR(20)     NOT NULL,
    amount              DECIMAL(12,2)   NOT NULL,
    currency            VARCHAR(3)      NOT NULL DEFAULT 'VND',
    reason              VARCHAR(500)    NOT NULL,
    status              VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    approved_by         UUID,
    approved_at         TIMESTAMPTZ,
    provider_refund_id  VARCHAR(255),
    provider_response   JSONB,
    processed_at        TIMESTAMPTZ,
    failure_reason      VARCHAR(500),
    version             INT             NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_refunds PRIMARY KEY (id),
    CONSTRAINT fk_refunds_payment FOREIGN KEY (payment_id) REFERENCES payments (id) ON DELETE RESTRICT,
    CONSTRAINT fk_refunds_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE RESTRICT,
    CONSTRAINT fk_refunds_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_refunds_approved_by FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT uk_refunds_number UNIQUE (refund_number),
    CONSTRAINT ck_refunds_type CHECK (type IN ('FULL_REFUND', 'PARTIAL_REFUND', 'CHARGEBACK', 'GOODWILL')),
    CONSTRAINT ck_refunds_status CHECK (status IN ('PENDING', 'APPROVED', 'PROCESSING', 'SUCCESS', 'FAILED', 'DISPUTED')),
    CONSTRAINT ck_refunds_amount CHECK (amount > 0)
);

CREATE INDEX idx_refunds_payment_id ON refunds (payment_id);
CREATE INDEX idx_refunds_booking_id ON refunds (booking_id);
CREATE INDEX idx_refunds_status ON refunds (status) WHERE status IN ('PENDING', 'APPROVED');
CREATE INDEX idx_refunds_created_at ON refunds (created_at);
CREATE INDEX idx_refunds_provider ON refunds (provider_refund_id) WHERE provider_refund_id IS NOT NULL;

COMMENT ON TABLE refunds IS 'A refund is NOT a payment — separate table for financial reconciliation, partial refunds, and chargebacks';

-- ============================================================================
-- TABLE: webhook_events
-- PURPOSE: Idempotency store for incoming payment provider webhooks
-- ============================================================================
CREATE TABLE webhook_events (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    provider_id     UUID            NOT NULL,
    event_id        VARCHAR(255)    NOT NULL,
    event_type      VARCHAR(100)    NOT NULL,
    payload         JSONB           NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'RECEIVED',
    processed_at    TIMESTAMPTZ,
    error_message   VARCHAR(1000),
    retry_count     INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_webhook_events PRIMARY KEY (id),
    CONSTRAINT fk_we_provider FOREIGN KEY (provider_id) REFERENCES payment_providers (id) ON DELETE RESTRICT,
    CONSTRAINT uk_webhook_provider_event UNIQUE (provider_id, event_id),
    CONSTRAINT ck_webhook_status CHECK (status IN ('RECEIVED', 'PROCESSING', 'PROCESSED', 'FAILED', 'SKIPPED'))
) PARTITION BY RANGE (created_at);

-- Create initial partitions
CREATE TABLE webhook_events_y2026m07 PARTITION OF webhook_events
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE webhook_events_y2026m08 PARTITION OF webhook_events
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE webhook_events_y2026m09 PARTITION OF webhook_events
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE webhook_events_y2026m10 PARTITION OF webhook_events
    FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE webhook_events_y2026m11 PARTITION OF webhook_events
    FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE webhook_events_y2026m12 PARTITION OF webhook_events
    FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

CREATE INDEX idx_webhook_status ON webhook_events (status) WHERE status IN ('RECEIVED', 'FAILED');
CREATE INDEX idx_webhook_created_at ON webhook_events (created_at);

COMMENT ON TABLE webhook_events IS 'Idempotency key = (provider_id, event_id) — INSERT ON CONFLICT DO NOTHING detects duplicates';
COMMENT ON COLUMN webhook_events.event_id IS 'Provider-assigned unique event ID — the idempotency key';

-- ============================================================================
-- TABLE: settlement_records
-- PURPOSE: Tracks payment provider settlements (money to organizer bank)
-- ============================================================================
CREATE TABLE settlement_records (
    id                      UUID            NOT NULL DEFAULT gen_random_uuid(),
    provider_id             UUID            NOT NULL,
    settlement_reference    VARCHAR(255)    NOT NULL,
    organizer_id            UUID            NOT NULL,
    total_amount            DECIMAL(14,2)   NOT NULL,
    fee_amount              DECIMAL(14,2)   NOT NULL DEFAULT 0,
    net_amount              DECIMAL(14,2)   NOT NULL,
    currency                VARCHAR(3)      NOT NULL DEFAULT 'VND',
    status                  VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    period_start            TIMESTAMPTZ     NOT NULL,
    period_end              TIMESTAMPTZ     NOT NULL,
    settled_at              TIMESTAMPTZ,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_settlement_records PRIMARY KEY (id),
    CONSTRAINT fk_sr_provider FOREIGN KEY (provider_id) REFERENCES payment_providers (id) ON DELETE RESTRICT,
    CONSTRAINT fk_sr_organizer FOREIGN KEY (organizer_id) REFERENCES organizers (id) ON DELETE RESTRICT,
    CONSTRAINT ck_settlement_status CHECK (status IN ('PENDING', 'PROCESSING', 'SETTLED', 'FAILED')),
    CONSTRAINT ck_settlement_amounts CHECK (total_amount >= 0 AND fee_amount >= 0 AND net_amount >= 0),
    CONSTRAINT ck_settlement_period CHECK (period_end > period_start)
);

CREATE INDEX idx_settlement_organizer ON settlement_records (organizer_id);
CREATE INDEX idx_settlement_status ON settlement_records (status);

COMMENT ON TABLE settlement_records IS 'Financial reconciliation — tracks when money is actually transferred to organizer';
