-- ============================================================================
-- FILE: 04_show_management.sql
-- MODULE: Show Management
-- TABLES: shows, show_seat_inventory
-- DEPENDENCIES: 01_identity_access.sql (users), 02_venue_management.sql (venue_maps, seats),
--               03_event_management.sql (events)
-- NOTE: show_seat_inventory.pricing_tier_id FK added in 05_pricing.sql
--       show_seat_inventory.booking_id FK added in 07_booking.sql
-- ============================================================================

-- ============================================================================
-- TABLE: shows
-- PURPOSE: A scheduled showing of an event on a venue map — the bookable unit
-- ============================================================================
CREATE TABLE shows (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    event_id        UUID            NOT NULL,
    map_id          UUID            NOT NULL,
    start_time      TIMESTAMPTZ     NOT NULL,
    end_time        TIMESTAMPTZ     NOT NULL,
    booking_open_at TIMESTAMPTZ     NOT NULL,
    booking_close_at TIMESTAMPTZ    NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'SCHEDULED',
    total_seats     INT             NOT NULL,
    available_seats INT             NOT NULL,
    version         INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,

    CONSTRAINT pk_shows PRIMARY KEY (id),
    CONSTRAINT fk_shows_event FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE RESTRICT,
    CONSTRAINT fk_shows_map FOREIGN KEY (map_id) REFERENCES venue_maps (id) ON DELETE RESTRICT,
    CONSTRAINT ck_shows_status CHECK (status IN ('SCHEDULED', 'OPEN', 'SOLD_OUT', 'ONGOING', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT ck_shows_times CHECK (end_time > start_time),
    CONSTRAINT ck_shows_booking_window CHECK (booking_close_at > booking_open_at),
    CONSTRAINT ck_shows_booking_before_start CHECK (booking_close_at <= start_time),
    CONSTRAINT ck_shows_seats CHECK (available_seats >= 0 AND available_seats <= total_seats)
);

CREATE INDEX idx_shows_event_id ON shows (event_id);
CREATE INDEX idx_shows_map_id ON shows (map_id);
CREATE INDEX idx_shows_start_time ON shows (start_time) WHERE deleted_at IS NULL;
CREATE INDEX idx_shows_status ON shows (status) WHERE deleted_at IS NULL;
CREATE INDEX idx_shows_map_time ON shows (map_id, start_time, end_time);

COMMENT ON TABLE shows IS 'A specific scheduled showing — users book seats for a SHOW, not for an event';
COMMENT ON COLUMN shows.available_seats IS 'Denormalized counter — avoids COUNT(*) on show_seat_inventory for every seat map load';
COMMENT ON COLUMN shows.version IS 'Most critical optimistic lock — prevents double-booking at the show level';

-- ============================================================================
-- TABLE: show_seat_inventory
-- PURPOSE: The heart of the concurrency model — tracks seat availability per show
-- NOTE: pricing_tier_id FK will be added in 05_pricing.sql
--       booking_id FK will be added in 07_booking.sql
-- ============================================================================
CREATE TABLE show_seat_inventory (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    show_id         UUID            NOT NULL,
    seat_id         UUID            NOT NULL,
    pricing_tier_id UUID,
    status          VARCHAR(20)     NOT NULL DEFAULT 'AVAILABLE',
    base_price      DECIMAL(12,2)   NOT NULL,
    held_by_user_id UUID,
    held_until      TIMESTAMPTZ,
    booking_id      UUID,
    version         INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_show_seat_inventory PRIMARY KEY (id),
    CONSTRAINT fk_ssi_show FOREIGN KEY (show_id) REFERENCES shows (id) ON DELETE CASCADE,
    CONSTRAINT fk_ssi_seat FOREIGN KEY (seat_id) REFERENCES seats (id) ON DELETE RESTRICT,
    CONSTRAINT fk_ssi_held_by FOREIGN KEY (held_by_user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT uk_ssi_show_seat UNIQUE (show_id, seat_id),
    CONSTRAINT ck_ssi_status CHECK (status IN ('AVAILABLE', 'HELD', 'BOOKED', 'SOLD', 'BLOCKED')),
    CONSTRAINT ck_ssi_price CHECK (base_price >= 0),
    CONSTRAINT ck_ssi_hold_consistency CHECK (
        (status = 'HELD' AND held_by_user_id IS NOT NULL AND held_until IS NOT NULL)
        OR
        (status != 'HELD' AND held_by_user_id IS NULL AND held_until IS NULL)
    )
);

-- NOTE: fk_ssi_pricing_tier → pricing_tiers(id) added in 05_pricing.sql
-- NOTE: fk_ssi_booking → bookings(id) added in 07_booking.sql

CREATE INDEX idx_ssi_show_id ON show_seat_inventory (show_id);
CREATE INDEX idx_ssi_show_status ON show_seat_inventory (show_id, status);
CREATE INDEX idx_ssi_held_until ON show_seat_inventory (held_until) WHERE status = 'HELD';
CREATE INDEX idx_ssi_booking_id ON show_seat_inventory (booking_id) WHERE booking_id IS NOT NULL;
CREATE INDEX idx_ssi_held_by_user ON show_seat_inventory (held_by_user_id) WHERE held_by_user_id IS NOT NULL;
CREATE INDEX idx_ssi_pricing_tier ON show_seat_inventory (pricing_tier_id) WHERE pricing_tier_id IS NOT NULL;

COMMENT ON TABLE show_seat_inventory IS 'Heart of concurrency — materialized per-show seat records with optimistic locking per seat';
COMMENT ON COLUMN show_seat_inventory.version IS 'Optimistic lock per seat — UPDATE WHERE version=? AND status=AVAILABLE returns 0 rows if someone else got it first';
COMMENT ON COLUMN show_seat_inventory.held_until IS 'Seat hold expiry — background job releases seats where held_until < NOW()';
