-- ============================================================================
-- FILE: 07_booking.sql
-- MODULE: Booking
-- TABLES: bookings, booking_items, booking_status_history, waitlist_entries,
--         coupon_usages (from Promotions module — depends on bookings)
-- ALTER: show_seat_inventory ADD booking_id FK
-- DEPENDENCIES: 01 (users), 04 (shows, show_seat_inventory), 06 (coupons)
-- ============================================================================

-- ============================================================================
-- TABLE: bookings
-- PURPOSE: A user's booking — group of seats for a specific show
-- ============================================================================
CREATE TABLE bookings (
    id                  UUID            NOT NULL DEFAULT gen_random_uuid(),
    booking_number      VARCHAR(20)     NOT NULL,
    user_id             UUID            NOT NULL,
    show_id             UUID            NOT NULL,
    coupon_id           UUID,
    status              VARCHAR(25)     NOT NULL DEFAULT 'PENDING',
    item_count          INT             NOT NULL,
    subtotal            DECIMAL(12,2)   NOT NULL,
    discount_amount     DECIMAL(12,2)   NOT NULL DEFAULT 0,
    total_amount        DECIMAL(12,2)   NOT NULL,
    expires_at          TIMESTAMPTZ,
    cancellation_reason VARCHAR(500),
    notes               TEXT,
    idempotency_key     VARCHAR(64),
    version             INT             NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_bookings PRIMARY KEY (id),
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_show FOREIGN KEY (show_id) REFERENCES shows (id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_coupon FOREIGN KEY (coupon_id) REFERENCES coupons (id) ON DELETE SET NULL,
    CONSTRAINT uk_bookings_number UNIQUE (booking_number),
    CONSTRAINT ck_bookings_status CHECK (status IN ('PENDING', 'HOLDING', 'PAYMENT_PROCESSING', 'PAID', 'PARTIALLY_CANCELLED', 'CANCELLED', 'EXPIRED', 'REFUNDED')),
    CONSTRAINT ck_bookings_amounts CHECK (subtotal >= 0 AND discount_amount >= 0 AND total_amount >= 0),
    CONSTRAINT ck_bookings_discount CHECK (discount_amount <= subtotal),
    CONSTRAINT ck_bookings_total CHECK (total_amount = subtotal - discount_amount),
    CONSTRAINT ck_bookings_items CHECK (item_count > 0)
);

CREATE UNIQUE INDEX uk_bookings_idempotency ON bookings (idempotency_key) WHERE idempotency_key IS NOT NULL;

CREATE INDEX idx_bookings_user_id ON bookings (user_id);
CREATE INDEX idx_bookings_show_id ON bookings (show_id);
CREATE INDEX idx_bookings_status ON bookings (status);
CREATE INDEX idx_bookings_expires_at ON bookings (expires_at) WHERE status IN ('PENDING', 'HOLDING');
CREATE INDEX idx_bookings_user_status ON bookings (user_id, status);
CREATE INDEX idx_bookings_created_at ON bookings (created_at);

COMMENT ON TABLE bookings IS 'Transactional anchor — connects users, shows, seats, payments, and tickets';
COMMENT ON COLUMN bookings.idempotency_key IS 'Client-generated key for crash recovery — prevents duplicate bookings on retry';
COMMENT ON COLUMN bookings.expires_at IS 'Unpaid bookings expire — background job transitions to EXPIRED';

-- ============================================================================
-- ALTER: Add booking_id FK to show_seat_inventory (deferred from 04)
-- ============================================================================
ALTER TABLE show_seat_inventory
    ADD CONSTRAINT fk_ssi_booking
    FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE SET NULL;

-- ============================================================================
-- TABLE: booking_items
-- PURPOSE: Line items — each row represents one seat in a booking
-- ============================================================================
CREATE TABLE booking_items (
    id                      UUID            NOT NULL DEFAULT gen_random_uuid(),
    booking_id              UUID            NOT NULL,
    show_seat_inventory_id  UUID            NOT NULL,
    price                   DECIMAL(12,2)   NOT NULL,
    status                  VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    cancelled_at            TIMESTAMPTZ,
    cancellation_reason     VARCHAR(255),
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_booking_items PRIMARY KEY (id),
    CONSTRAINT fk_bi_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE,
    CONSTRAINT fk_bi_ssi FOREIGN KEY (show_seat_inventory_id) REFERENCES show_seat_inventory (id) ON DELETE RESTRICT,
    CONSTRAINT uk_bi_booking_seat UNIQUE (booking_id, show_seat_inventory_id),
    CONSTRAINT ck_bi_price CHECK (price >= 0),
    CONSTRAINT ck_bi_status CHECK (status IN ('ACTIVE', 'CANCELLED', 'REFUNDED'))
);

CREATE INDEX idx_bi_booking_id ON booking_items (booking_id);
CREATE INDEX idx_bi_ssi_id ON booking_items (show_seat_inventory_id);
CREATE INDEX idx_bi_booking_status ON booking_items (booking_id, status);

COMMENT ON TABLE booking_items IS 'Line items with snapshotted price — supports partial cancellation via item-level status';
COMMENT ON COLUMN booking_items.price IS 'Snapshotted at booking time — immutable even if pricing rules change later';

-- ============================================================================
-- TABLE: booking_status_history
-- PURPOSE: Immutable append-only log of every booking status transition
-- ============================================================================
CREATE TABLE booking_status_history (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    booking_id      UUID            NOT NULL,
    from_status     VARCHAR(25),
    to_status       VARCHAR(25)     NOT NULL,
    trigger         VARCHAR(50)     NOT NULL,
    triggered_by    UUID,
    metadata        JSONB,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_booking_status_history PRIMARY KEY (id),
    CONSTRAINT fk_bsh_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE,
    CONSTRAINT fk_bsh_triggered_by FOREIGN KEY (triggered_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT ck_bsh_to_status CHECK (to_status IN ('PENDING', 'HOLDING', 'PAYMENT_PROCESSING', 'PAID', 'PARTIALLY_CANCELLED', 'CANCELLED', 'EXPIRED', 'REFUNDED')),
    CONSTRAINT ck_bsh_trigger CHECK (trigger IN ('USER_ACTION', 'SYSTEM_EXPIRATION', 'PAYMENT_CALLBACK', 'PAYMENT_FAILURE', 'ADMIN_ACTION', 'REFUND_PROCESSED', 'SCHEDULER_JOB'))
) PARTITION BY RANGE (created_at);

-- Create initial partitions (extend as needed)
CREATE TABLE booking_status_history_y2026m07 PARTITION OF booking_status_history
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE booking_status_history_y2026m08 PARTITION OF booking_status_history
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE booking_status_history_y2026m09 PARTITION OF booking_status_history
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE booking_status_history_y2026m10 PARTITION OF booking_status_history
    FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE booking_status_history_y2026m11 PARTITION OF booking_status_history
    FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE booking_status_history_y2026m12 PARTITION OF booking_status_history
    FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

CREATE INDEX idx_bsh_booking_id ON booking_status_history (booking_id);
CREATE INDEX idx_bsh_booking_created ON booking_status_history (booking_id, created_at);
CREATE INDEX idx_bsh_to_status ON booking_status_history (to_status);
CREATE INDEX idx_bsh_created_at ON booking_status_history (created_at);

COMMENT ON TABLE booking_status_history IS 'Immutable append-only — partitioned by created_at monthly for efficient retention';

-- ============================================================================
-- TABLE: waitlist_entries
-- PURPOSE: Sold-out show waitlist with priority queue
-- ============================================================================
CREATE TABLE waitlist_entries (
    id                      UUID            NOT NULL DEFAULT gen_random_uuid(),
    show_id                 UUID            NOT NULL,
    user_id                 UUID            NOT NULL,
    requested_seat_count    INT             NOT NULL,
    preferred_seat_type     VARCHAR(20),
    max_price_per_seat      DECIMAL(12,2),
    priority                INT             NOT NULL DEFAULT 0,
    status                  VARCHAR(20)     NOT NULL DEFAULT 'WAITING',
    notified_at             TIMESTAMPTZ,
    offer_expires_at        TIMESTAMPTZ,
    converted_booking_id    UUID,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_waitlist_entries PRIMARY KEY (id),
    CONSTRAINT fk_wl_show FOREIGN KEY (show_id) REFERENCES shows (id) ON DELETE CASCADE,
    CONSTRAINT fk_wl_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_wl_booking FOREIGN KEY (converted_booking_id) REFERENCES bookings (id) ON DELETE SET NULL,
    CONSTRAINT uk_wl_show_user UNIQUE (show_id, user_id),
    CONSTRAINT ck_wl_status CHECK (status IN ('WAITING', 'NOTIFIED', 'OFFER_EXPIRED', 'CONVERTED', 'CANCELLED')),
    CONSTRAINT ck_wl_seats CHECK (requested_seat_count > 0)
);

CREATE INDEX idx_wl_show_priority ON waitlist_entries (show_id, priority DESC, created_at) WHERE status = 'WAITING';
CREATE INDEX idx_wl_user_id ON waitlist_entries (user_id);
CREATE INDEX idx_wl_offer_expires ON waitlist_entries (offer_expires_at) WHERE status = 'NOTIFIED';

COMMENT ON TABLE waitlist_entries IS 'Priority queue for sold-out shows — highest priority notified first when seats open';

-- ============================================================================
-- TABLE: coupon_usages (from Promotions module — placed here due to bookings FK)
-- PURPOSE: Tracks each coupon usage for audit and per-user limit enforcement
-- ============================================================================
CREATE TABLE coupon_usages (
    id                  UUID            NOT NULL DEFAULT gen_random_uuid(),
    coupon_id           UUID            NOT NULL,
    user_id             UUID            NOT NULL,
    booking_id          UUID            NOT NULL,
    discount_applied    DECIMAL(12,2)   NOT NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_coupon_usages PRIMARY KEY (id),
    CONSTRAINT fk_cu_coupon FOREIGN KEY (coupon_id) REFERENCES coupons (id) ON DELETE RESTRICT,
    CONSTRAINT fk_cu_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_cu_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE,
    CONSTRAINT uk_cu_coupon_booking UNIQUE (coupon_id, booking_id),
    CONSTRAINT ck_cu_discount CHECK (discount_applied >= 0)
);

CREATE INDEX idx_cu_coupon_user ON coupon_usages (coupon_id, user_id);
CREATE INDEX idx_cu_booking_id ON coupon_usages (booking_id);

COMMENT ON TABLE coupon_usages IS 'Audit trail — idx_cu_coupon_user supports per-user limit enforcement via COUNT query';
