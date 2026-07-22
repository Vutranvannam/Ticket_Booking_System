-- ============================================================================
-- FILE: 02_venue_management.sql
-- MODULE: Venue Management
-- TABLES: venues, halls, seats
-- DEPENDENCIES: None
-- ============================================================================

-- ============================================================================
-- TABLE: venues
-- PURPOSE: Physical locations where events take place
-- ============================================================================
CREATE TABLE venues (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    name            VARCHAR(200)    NOT NULL,
    address         TEXT            NOT NULL,
    city            VARCHAR(100)    NOT NULL,
    state           VARCHAR(100),
    country         VARCHAR(100)    NOT NULL,
    zip_code        VARCHAR(20),
    latitude        DECIMAL(10,7),
    longitude       DECIMAL(10,7),
    phone           VARCHAR(20),
    email           VARCHAR(255),
    description     TEXT,
    total_capacity  INT             NOT NULL,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    version         INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,

    CONSTRAINT pk_venues PRIMARY KEY (id),
    CONSTRAINT ck_venues_capacity CHECK (total_capacity > 0),
    CONSTRAINT ck_venues_latitude CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
    CONSTRAINT ck_venues_longitude CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180))
);

CREATE INDEX idx_venues_city ON venues (city);
CREATE INDEX idx_venues_country ON venues (country);
CREATE INDEX idx_venues_active ON venues (is_active) WHERE deleted_at IS NULL;

COMMENT ON TABLE venues IS 'Physical locations where events take place — a venue contains multiple halls';

-- ============================================================================
-- TABLE: halls
-- PURPOSE: Bookable space within a venue with seat configuration
-- ============================================================================
CREATE TABLE halls (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    venue_id        UUID            NOT NULL,
    name            VARCHAR(100)    NOT NULL,
    capacity        INT             NOT NULL,
    total_rows      INT,
    total_columns   INT,
    layout_config   JSONB,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    version         INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_halls PRIMARY KEY (id),
    CONSTRAINT fk_halls_venue FOREIGN KEY (venue_id) REFERENCES venues (id) ON DELETE RESTRICT,
    CONSTRAINT uk_halls_venue_name UNIQUE (venue_id, name),
    CONSTRAINT ck_halls_capacity CHECK (capacity > 0)
);

CREATE INDEX idx_halls_venue_id ON halls (venue_id);

COMMENT ON TABLE halls IS 'A bookable space within a venue — each hall has its own seat configuration';
COMMENT ON COLUMN halls.layout_config IS 'Flexible JSONB for rendering hints, stage position, aisle gaps, etc.';

-- ============================================================================
-- TABLE: seats
-- PURPOSE: Physical seats within a hall — reusable across shows
-- ============================================================================
CREATE TABLE seats (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    hall_id         UUID            NOT NULL,
    row_label       VARCHAR(10)     NOT NULL,
    seat_number     INT             NOT NULL,
    seat_type       VARCHAR(20)     NOT NULL DEFAULT 'NORMAL',
    x_position      INT,
    y_position      INT,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_seats PRIMARY KEY (id),
    CONSTRAINT fk_seats_hall FOREIGN KEY (hall_id) REFERENCES halls (id) ON DELETE RESTRICT,
    CONSTRAINT uk_seats_hall_row_number UNIQUE (hall_id, row_label, seat_number),
    CONSTRAINT ck_seats_type CHECK (seat_type IN ('NORMAL', 'VIP', 'COUPLE', 'WHEELCHAIR')),
    CONSTRAINT ck_seats_number CHECK (seat_number > 0)
);

CREATE INDEX idx_seats_hall_id ON seats (hall_id);
CREATE INDEX idx_seats_hall_type ON seats (hall_id, seat_type);

COMMENT ON TABLE seats IS 'Physical seats within a hall — represents infrastructure, NOT per-show availability';
COMMENT ON COLUMN seats.x_position IS 'X coordinate for UI seat map rendering';
COMMENT ON COLUMN seats.y_position IS 'Y coordinate for UI seat map rendering';
