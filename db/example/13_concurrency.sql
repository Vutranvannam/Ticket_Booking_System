-- ============================================================================
-- FILE: 13_concurrency.sql
-- MODULE: Concurrency
-- TABLES: idempotency_keys, distributed_locks
-- DEPENDENCIES: 01_identity_access.sql (users)
-- ============================================================================

-- ============================================================================
-- TABLE: idempotency_keys
-- PURPOSE: Generic API idempotency for mutations beyond payments
-- ============================================================================
CREATE TABLE idempotency_keys (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL,
    idempotency_key VARCHAR(100)    NOT NULL,
    request_path    VARCHAR(255)    NOT NULL,
    request_params  JSONB,
    response_code   INT,
    response_body   JSONB,
    status          VARCHAR(20)     NOT NULL DEFAULT 'STARTED',
    expires_at      TIMESTAMPTZ     NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_idempotency_keys PRIMARY KEY (id),
    CONSTRAINT fk_ik_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uk_ik_user_key UNIQUE (user_id, idempotency_key),
    CONSTRAINT ck_ik_status CHECK (status IN ('STARTED', 'COMPLETED', 'FAILED'))
);

CREATE INDEX idx_ik_expires_at ON idempotency_keys (expires_at) WHERE expires_at < NOW();

COMMENT ON TABLE idempotency_keys IS 'Idempotency mechanism for non-idempotent POST/PATCH APIs (e.g., creating an event)';
COMMENT ON COLUMN idempotency_keys.expires_at IS 'Keys expire automatically (e.g., 24h) — cron job cleans up expired keys';

-- ============================================================================
-- TABLE: distributed_locks
-- PURPOSE: DB fallback for distributed locking if Redis goes down
-- ============================================================================
CREATE TABLE distributed_locks (
    lock_key        VARCHAR(255)    NOT NULL,
    locked_by       VARCHAR(255)    NOT NULL,
    locked_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ     NOT NULL,

    CONSTRAINT pk_distributed_locks PRIMARY KEY (lock_key)
);

CREATE INDEX idx_dl_expires_at ON distributed_locks (expires_at);

COMMENT ON TABLE distributed_locks IS 'Fallback mechanism for distributed locking — used only if Redis is unavailable or for extremely critical slow locks';
