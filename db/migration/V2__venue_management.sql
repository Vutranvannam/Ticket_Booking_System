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


-- ============================================================
-- 4. VENUE MAPS
-- ============================================================
CREATE TABLE venue_maps (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL,
    created_by UUID,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    svg_content TEXT,
    view_box VARCHAR(100) NOT NULL,
    visibility VARCHAR(20) NOT NULL DEFAULT 'PRIVATE',
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    version INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_venue_maps PRIMARY KEY (id),

    CONSTRAINT fk_venue_maps_venue
        FOREIGN KEY (venue_id)
        REFERENCES venues (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_venue_maps_creator
        FOREIGN KEY (created_by)
        REFERENCES users (id)
        ON DELETE SET NULL,

    CONSTRAINT uq_venue_maps_name
        UNIQUE (venue_id, name),

    CONSTRAINT ck_venue_maps_visibility
        CHECK (visibility IN ('PUBLIC', 'PRIVATE')),

    CONSTRAINT ck_venue_maps_status
        CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'))
);

CREATE INDEX idx_venue_maps_venue_id
    ON venue_maps (venue_id);

CREATE INDEX idx_venue_maps_created_by
    ON venue_maps (created_by);

CREATE INDEX idx_venue_maps_visibility
    ON venue_maps (visibility)
    WHERE is_active = TRUE;

CREATE INDEX idx_venue_maps_status
    ON venue_maps (status)
    WHERE is_active = TRUE;


-- ============================================================
-- 5. MAP REGIONS
-- ============================================================
CREATE TABLE map_regions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    map_id UUID NOT NULL,
    region_type_code VARCHAR(30) NOT NULL,
    name VARCHAR(200) NOT NULL,
    svg_element_id VARCHAR(100) NOT NULL,
    seating_type VARCHAR(30) NOT NULL DEFAULT 'NONE',
    capacity INT,
    color_code VARCHAR(7),
    is_bookable BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT NOT NULL DEFAULT 0,
    properties JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_map_regions PRIMARY KEY (id),

    CONSTRAINT fk_map_regions_map
        FOREIGN KEY (map_id)
        REFERENCES venue_maps (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_map_regions_type
        FOREIGN KEY (region_type_code)
        REFERENCES region_types (code),

    CONSTRAINT uq_map_regions_name
        UNIQUE (map_id, name),

    CONSTRAINT uq_map_regions_svg_element
        UNIQUE (map_id, svg_element_id),

    CONSTRAINT ck_map_regions_capacity
        CHECK (capacity IS NULL OR capacity > 0),

    CONSTRAINT ck_map_regions_seating_type
        CHECK (
            seating_type IN (
                'NUMBERED',
                'STANDING',
                'OPEN_SEATING',
                'NONE'
            )
        ),

    CONSTRAINT ck_map_regions_bookable
        CHECK (
            NOT is_bookable
            OR seating_type IN (
                'NUMBERED',
                'STANDING',
                'OPEN_SEATING'
            )
        ),

    CONSTRAINT ck_map_regions_capacity_required
        CHECK (
            seating_type NOT IN ('STANDING', 'OPEN_SEATING')
            OR capacity IS NOT NULL
        )
);

CREATE INDEX idx_map_regions_map_id
    ON map_regions (map_id);

CREATE INDEX idx_map_regions_svg_element
    ON map_regions (map_id, svg_element_id);


-- ============================================================
-- 6. REGION MAPS
-- ============================================================
CREATE TABLE region_maps (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    region_id UUID NOT NULL,
    name VARCHAR(200),
    svg_content TEXT NOT NULL,
    view_box VARCHAR(100) NOT NULL,
    total_seats INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    version INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_region_maps PRIMARY KEY (id),

    CONSTRAINT fk_region_maps_region
        FOREIGN KEY (region_id)
        REFERENCES map_regions (id)
        ON DELETE CASCADE,

    CONSTRAINT uq_region_maps_region
        UNIQUE (region_id)
);

CREATE INDEX idx_region_maps_region_id
    ON region_maps (region_id);


-- ============================================================
-- 7. SEATS
-- ============================================================
CREATE TABLE seats (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    region_id UUID NOT NULL,
    seat_type_code VARCHAR(30) NOT NULL,
    row_label VARCHAR(10) NOT NULL,
    seat_number INT NOT NULL,
    svg_element_id VARCHAR(100) NOT NULL,
    x_coord DECIMAL(10,2) NOT NULL,
    y_coord DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_seats PRIMARY KEY (id),

    CONSTRAINT fk_seats_region
        FOREIGN KEY (region_id)
        REFERENCES map_regions (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_seats_type
        FOREIGN KEY (seat_type_code)
        REFERENCES seat_types (code),

    CONSTRAINT uq_seats_position
        UNIQUE (region_id, row_label, seat_number),

    CONSTRAINT uq_seats_svg_element
        UNIQUE (region_id, svg_element_id),

    CONSTRAINT ck_seats_number
        CHECK (seat_number > 0)
);

CREATE INDEX idx_seats_region_id
    ON seats (region_id);

CREATE INDEX idx_seats_svg_element
    ON seats (region_id, svg_element_id);



