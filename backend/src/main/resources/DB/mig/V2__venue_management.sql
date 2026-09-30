-- region_types
-- seat_types
--      ↓
-- venues
--      ↓
-- venue_maps
--      ↓
-- map_regions
--      ↓
-- region_maps
--      ↓
-- seats

-- ============================================================
-- V2__venue_management.sql
-- Venue Management - V2
-- ============================================================

-- ============================================================
-- 1. REGION TYPES
-- ============================================================

CREATE TABLE region_types (
    code                    VARCHAR(30)  NOT NULL,
    name                    VARCHAR(100) NOT NULL,
    description             TEXT,
    is_bookable_default     BOOLEAN      NOT NULL DEFAULT FALSE,
    default_seating_type    VARCHAR(30)  NOT NULL DEFAULT 'NONE',
    icon                    VARCHAR(50),
    color_default           VARCHAR(7),
    display_order           INT          NOT NULL DEFAULT 0,
    is_active               BOOLEAN      NOT NULL DEFAULT TRUE,

    CONSTRAINT pk_region_types
        PRIMARY KEY (code),

    CONSTRAINT ck_rt_code_upper
        CHECK (code = UPPER(code)),

    CONSTRAINT ck_rt_default_seating
        CHECK (
            default_seating_type IN (
                'NUMBERED',
                'STANDING',
                'OPEN_SEATING',
                'NONE'
            )
        )
);

-- ============================================================
-- 2. SEAT TYPES
-- ============================================================
CREATE TABLE seat_types (
    code            VARCHAR(30)  NOT NULL,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    color_default   VARCHAR(7),
    icon            VARCHAR(50),
    display_order   INT          NOT NULL DEFAULT 0,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,

    CONSTRAINT pk_seat_types
        PRIMARY KEY (code),

    CONSTRAINT ck_st_code_upper
        CHECK (code = UPPER(code))
);

-- ============================================================
-- 3. VENUES
-- ============================================================

CREATE TABLE venues (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    created_by      UUID,
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

    visibility      VARCHAR(20)     NOT NULL DEFAULT 'PRIVATE',
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    version         INT             NOT NULL DEFAULT 0,

    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,

    CONSTRAINT pk_venues
        PRIMARY KEY (id),

    CONSTRAINT fk_venues_creator
        FOREIGN KEY (created_by)
        REFERENCES users (id)
        ON DELETE SET NULL,

    CONSTRAINT ck_venues_visibility
        CHECK (visibility IN ('PUBLIC', 'PRIVATE')),

    CONSTRAINT ck_venues_latitude
        CHECK (
            latitude IS NULL
            OR (latitude >= -90 AND latitude <= 90)
        ),

    CONSTRAINT ck_venues_longitude
        CHECK (
            longitude IS NULL
            OR (longitude >= -180 AND longitude <= 180)
        )
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_venues_city
    ON venues (city);

CREATE INDEX idx_venues_created_by
    ON venues (created_by);

CREATE INDEX idx_venues_visibility
    ON venues (visibility)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_venues_active
    ON venues (is_active)
    WHERE deleted_at IS NULL;