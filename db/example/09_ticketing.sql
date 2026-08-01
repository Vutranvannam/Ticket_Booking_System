-- ============================================================================
-- FILE: 09_ticketing.sql
-- MODULE: Ticketing
-- TABLES: tickets, ticket_transfers, ticket_scan_logs
-- DEPENDENCIES: 01 (users), 04 (shows), 07 (bookings, booking_items)
-- ============================================================================

-- ============================================================================
-- TABLE: tickets
-- PURPOSE: Issued after payment — each ticket = one seat, one QR code
-- ============================================================================
CREATE TABLE tickets (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    ticket_number   VARCHAR(20)     NOT NULL,
    booking_id      UUID            NOT NULL,
    booking_item_id UUID            NOT NULL,
    user_id         UUID            NOT NULL,
    show_id         UUID            NOT NULL,
    qr_code         VARCHAR(500)    NOT NULL,
    qr_code_version INT             NOT NULL DEFAULT 1,
    qr_regenerated_at TIMESTAMPTZ,
    status          VARCHAR(20)     NOT NULL DEFAULT 'VALID',
    checked_in_at   TIMESTAMPTZ,
    checked_in_by   UUID,
    gate            VARCHAR(20),
    version         INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_tickets PRIMARY KEY (id),
    CONSTRAINT fk_tickets_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE RESTRICT,
    CONSTRAINT fk_tickets_bi FOREIGN KEY (booking_item_id) REFERENCES booking_items (id) ON DELETE RESTRICT,
    CONSTRAINT fk_tickets_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_tickets_show FOREIGN KEY (show_id) REFERENCES shows (id) ON DELETE RESTRICT,
    CONSTRAINT fk_tickets_checked_in_by FOREIGN KEY (checked_in_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT uk_tickets_number UNIQUE (ticket_number),
    CONSTRAINT uk_tickets_qr_code UNIQUE (qr_code),
    CONSTRAINT uk_tickets_booking_item UNIQUE (booking_item_id),
    CONSTRAINT ck_tickets_status CHECK (status IN ('VALID', 'CHECKED_IN', 'CANCELLED', 'EXPIRED'))
);

CREATE INDEX idx_tickets_booking_id ON tickets (booking_id);
CREATE INDEX idx_tickets_user_id ON tickets (user_id);
CREATE INDEX idx_tickets_show_id ON tickets (show_id);
CREATE INDEX idx_tickets_show_status ON tickets (show_id, status);

COMMENT ON TABLE tickets IS 'Generated only after payment SUCCESS — QR contains signed JWT with qr_code_version';
COMMENT ON COLUMN tickets.qr_code IS 'Signed JWT: ticket_id, show_id, seat_info, qr_code_version, issued_at — RS256 signing';
COMMENT ON COLUMN tickets.qr_code_version IS 'Incremented on QR regeneration — old QR fails version check at gate';

-- ============================================================================
-- TABLE: ticket_transfers
-- PURPOSE: Immutable log of ticket ownership changes
-- ============================================================================
CREATE TABLE ticket_transfers (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    ticket_id       UUID            NOT NULL,
    from_user_id    UUID            NOT NULL,
    to_user_id      UUID            NOT NULL,
    transfer_type   VARCHAR(20)     NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    transfer_fee    DECIMAL(12,2)   NOT NULL DEFAULT 0,
    message         VARCHAR(500),
    accepted_at     TIMESTAMPTZ,
    expired_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_ticket_transfers PRIMARY KEY (id),
    CONSTRAINT fk_tt_ticket FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE RESTRICT,
    CONSTRAINT fk_tt_from_user FOREIGN KEY (from_user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_tt_to_user FOREIGN KEY (to_user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT ck_tt_type CHECK (transfer_type IN ('TRANSFER', 'GIFT', 'RESALE')),
    CONSTRAINT ck_tt_status CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED')),
    CONSTRAINT ck_tt_different_users CHECK (from_user_id != to_user_id),
    CONSTRAINT ck_tt_fee CHECK (transfer_fee >= 0)
);

CREATE INDEX idx_tt_ticket_id ON ticket_transfers (ticket_id);
CREATE INDEX idx_tt_from_user ON ticket_transfers (from_user_id);
CREATE INDEX idx_tt_to_user ON ticket_transfers (to_user_id);
CREATE INDEX idx_tt_status ON ticket_transfers (status) WHERE status = 'PENDING';

COMMENT ON TABLE ticket_transfers IS 'Ownership chain — on acceptance: tickets.user_id updated, QR regenerated, old QR invalidated';

-- ============================================================================
-- TABLE: ticket_scan_logs
-- PURPOSE: Every scan attempt at every gate — security and operations
-- ============================================================================
CREATE TABLE ticket_scan_logs (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    ticket_id       UUID            NOT NULL,
    show_id         UUID            NOT NULL,
    scanned_by      UUID,
    gate            VARCHAR(20),
    scan_result     VARCHAR(20)     NOT NULL,
    device_id       VARCHAR(100),
    scanned_offline BOOLEAN         NOT NULL DEFAULT FALSE,
    synced_at       TIMESTAMPTZ,
    failure_reason  VARCHAR(255),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_ticket_scan_logs PRIMARY KEY (id),
    CONSTRAINT fk_tsl_ticket FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE RESTRICT,
    CONSTRAINT fk_tsl_show FOREIGN KEY (show_id) REFERENCES shows (id) ON DELETE RESTRICT,
    CONSTRAINT fk_tsl_scanned_by FOREIGN KEY (scanned_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT ck_scan_result CHECK (scan_result IN ('SUCCESS', 'ALREADY_CHECKED_IN', 'INVALID_TICKET', 'EXPIRED_TICKET', 'CANCELLED_TICKET', 'WRONG_SHOW', 'OFFLINE_ACCEPTED'))
) PARTITION BY RANGE (created_at);

-- Create initial partitions
CREATE TABLE ticket_scan_logs_y2026m07 PARTITION OF ticket_scan_logs
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE ticket_scan_logs_y2026m08 PARTITION OF ticket_scan_logs
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE ticket_scan_logs_y2026m09 PARTITION OF ticket_scan_logs
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE ticket_scan_logs_y2026m10 PARTITION OF ticket_scan_logs
    FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE ticket_scan_logs_y2026m11 PARTITION OF ticket_scan_logs
    FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE ticket_scan_logs_y2026m12 PARTITION OF ticket_scan_logs
    FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

CREATE INDEX idx_scan_ticket_id ON ticket_scan_logs (ticket_id);
CREATE INDEX idx_scan_show_gate ON ticket_scan_logs (show_id, gate);
CREATE INDEX idx_scan_show_time ON ticket_scan_logs (show_id, created_at);
CREATE INDEX idx_scan_result ON ticket_scan_logs (scan_result) WHERE scan_result != 'SUCCESS';

COMMENT ON TABLE ticket_scan_logs IS 'Partitioned by created_at — logs ALL scans including failed/duplicate for fraud detection';
