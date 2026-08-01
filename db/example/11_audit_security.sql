-- ============================================================================
-- FILE: 11_audit_security.sql
-- MODULE: Audit & Security
-- TABLES: audit_logs, admin_action_logs, fraud_signals
-- DEPENDENCIES: 01_identity_access.sql (users)
-- ============================================================================

-- ============================================================================
-- TABLE: audit_logs
-- PURPOSE: System-wide audit trail for critical entity changes
-- ============================================================================
CREATE TABLE audit_logs (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    entity_name     VARCHAR(100)    NOT NULL,
    entity_id       UUID            NOT NULL,
    action          VARCHAR(20)     NOT NULL,
    user_id         UUID,
    old_values      JSONB,
    new_values      JSONB,
    ip_address      VARCHAR(45),
    user_agent      VARCHAR(500),
    correlation_id  VARCHAR(100),
    trace_id        VARCHAR(100),
    span_id         VARCHAR(100),
    service_name    VARCHAR(50)     NOT NULL DEFAULT 'monolith',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_audit_logs PRIMARY KEY (id),
    CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT ck_audit_logs_action CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'RESTORE'))
) PARTITION BY RANGE (created_at);

-- Create initial partitions
CREATE TABLE audit_logs_y2026m07 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE audit_logs_y2026m08 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE audit_logs_y2026m09 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE audit_logs_y2026m10 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE audit_logs_y2026m11 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE audit_logs_y2026m12 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

CREATE INDEX idx_audit_entity ON audit_logs (entity_name, entity_id);
CREATE INDEX idx_audit_user_id ON audit_logs (user_id);
CREATE INDEX idx_audit_created_at ON audit_logs (created_at);
CREATE INDEX idx_audit_correlation ON audit_logs (correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX idx_audit_trace ON audit_logs (trace_id) WHERE trace_id IS NOT NULL;

COMMENT ON TABLE audit_logs IS 'Partitioned append-only log — trace_id/span_id added for distributed tracing in microservices';

-- ============================================================================
-- TABLE: admin_action_logs
-- PURPOSE: Accountability for sensitive admin actions
-- ============================================================================
CREATE TABLE admin_action_logs (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    admin_id        UUID            NOT NULL,
    action_type     VARCHAR(50)     NOT NULL,
    target_type     VARCHAR(50)     NOT NULL,
    target_id       VARCHAR(255)    NOT NULL,
    reason          VARCHAR(500)    NOT NULL,
    details         JSONB,
    ip_address      VARCHAR(45),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_admin_action_logs PRIMARY KEY (id),
    CONSTRAINT fk_aal_admin FOREIGN KEY (admin_id) REFERENCES users (id) ON DELETE RESTRICT
) PARTITION BY RANGE (created_at);

-- Create initial partitions
CREATE TABLE admin_action_logs_y2026m07 PARTITION OF admin_action_logs
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE admin_action_logs_y2026m08 PARTITION OF admin_action_logs
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE admin_action_logs_y2026m09 PARTITION OF admin_action_logs
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE admin_action_logs_y2026m10 PARTITION OF admin_action_logs
    FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE admin_action_logs_y2026m11 PARTITION OF admin_action_logs
    FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE admin_action_logs_y2026m12 PARTITION OF admin_action_logs
    FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

CREATE INDEX idx_aal_admin_id ON admin_action_logs (admin_id);
CREATE INDEX idx_aal_target ON admin_action_logs (target_type, target_id);
CREATE INDEX idx_aal_created_at ON admin_action_logs (created_at);

COMMENT ON TABLE admin_action_logs IS 'Tracks human admin actions (e.g., manual refunds, user bans, organizer verification)';

-- ============================================================================
-- TABLE: fraud_signals
-- PURPOSE: Async fraud detection signals from rules engine
-- ============================================================================
CREATE TABLE fraud_signals (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    user_id         UUID,
    booking_id      UUID,
    payment_id      UUID,
    signal_type     VARCHAR(50)     NOT NULL,
    risk_score      INT             NOT NULL,
    details         JSONB           NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'NEW',
    resolved_by     UUID,
    resolved_at     TIMESTAMPTZ,
    resolution_note VARCHAR(500),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_fraud_signals PRIMARY KEY (id),
    CONSTRAINT fk_fs_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_fs_resolved_by FOREIGN KEY (resolved_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT ck_fs_score CHECK (risk_score >= 0 AND risk_score <= 100),
    CONSTRAINT ck_fs_status CHECK (status IN ('NEW', 'INVESTIGATING', 'FALSE_POSITIVE', 'CONFIRMED_FRAUD'))
);

CREATE INDEX idx_fs_user_id ON fraud_signals (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_fs_booking_id ON fraud_signals (booking_id) WHERE booking_id IS NOT NULL;
CREATE INDEX idx_fs_status ON fraud_signals (status) WHERE status IN ('NEW', 'INVESTIGATING');

COMMENT ON TABLE fraud_signals IS 'Populated asynchronously by fraud detection workers (e.g., Kafka consumers evaluating velocity)';
