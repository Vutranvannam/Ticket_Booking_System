-- ============================================================================
-- FILE: 02_venue_management.sql
-- MODULE: Venue Management (Map-First Architecture)
-- TABLES: venues, region_types, seat_types, venue_maps, map_regions,
--         map_cells, seats
-- DEPENDENCIES: None
-- ARCHITECTURE: Venue → Map → Region → Seat
-- ============================================================================

-- ============================================================================
-- TABLE: venues
-- PURPOSE: Physical locations where events take place
-- WHY IT EXISTS: Root entity — represents a real-world address/building.
--               A venue contains one or more Maps (layout configurations).
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
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    version         INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,

    CONSTRAINT pk_venues PRIMARY KEY (id),
    CONSTRAINT ck_venues_latitude CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
    CONSTRAINT ck_venues_longitude CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180))
);

CREATE INDEX idx_venues_city ON venues (city);
CREATE INDEX idx_venues_country ON venues (country);
CREATE INDEX idx_venues_active ON venues (is_active) WHERE deleted_at IS NULL;

COMMENT ON TABLE venues IS 'Physical locations where events take place — a venue contains one or more Maps';

-- ============================================================================
-- TABLE: region_types
-- PURPOSE: Lookup table for region classification — replaces ENUM
-- WHY IT EXISTS: Adding new region types (HALL, VIP, STAGE, FOOD_COURT...)
--               requires only an INSERT, not ALTER TYPE + migration.
-- ============================================================================
CREATE TABLE region_types (
    code                VARCHAR(30)     NOT NULL,
    name                VARCHAR(100)    NOT NULL,
    description         TEXT,
    is_bookable_default BOOLEAN         NOT NULL DEFAULT FALSE,
    icon                VARCHAR(50),
    color_default       VARCHAR(7),
    display_order       INT             NOT NULL DEFAULT 0,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,

    CONSTRAINT pk_region_types PRIMARY KEY (code),
    CONSTRAINT ck_rt_code_upper CHECK (code = UPPER(code))
);

COMMENT ON TABLE region_types IS 'Lookup table for region classification — extensible without schema migration';
COMMENT ON COLUMN region_types.is_bookable_default IS 'Default bookable flag when creating a region of this type — can be overridden per region';
COMMENT ON COLUMN region_types.color_default IS 'Default hex color code for UI rendering (e.g. #FF5733)';

-- ============================================================================
-- TABLE: seat_types
-- PURPOSE: Lookup table for seat classification — replaces ENUM
-- WHY IT EXISTS: Same rationale as region_types. Adding new seat types
--               (NORMAL, VIP, COUPLE, WHEELCHAIR, PREMIUM_RECLINER...)
--               requires only an INSERT.
-- ============================================================================
CREATE TABLE seat_types (
    code            VARCHAR(30)     NOT NULL,
    name            VARCHAR(100)    NOT NULL,
    description     TEXT,
    icon            VARCHAR(50),
    display_order   INT             NOT NULL DEFAULT 0,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,

    CONSTRAINT pk_seat_types PRIMARY KEY (code),
    CONSTRAINT ck_st_code_upper CHECK (code = UPPER(code))
);

COMMENT ON TABLE seat_types IS 'Lookup table for seat classification — extensible without schema migration';

-- ============================================================================
-- TABLE: venue_maps
-- PURPOSE: A canvas/grid layout for a venue — the central design unit
-- WHY IT EXISTS: A Map represents a specific
--               layout configuration of a physical space. One venue can have
--               multiple Maps (e.g. "Concert Mode", "Theater Mode").
--               Events/Shows reference a Map, not a Hall.
-- PROS: Flexible — same physical space can have different Maps for different
--       event types. Map lifecycle (DRAFT→PUBLISHED→ARCHIVED) protects
--       data integrity when Events are already using a Map.
-- CONS: Admin must understand that creating a new layout = creating a new Map.
-- ============================================================================
CREATE TABLE venue_maps (
    id                  UUID            NOT NULL DEFAULT gen_random_uuid(),
    venue_id            UUID            NOT NULL,
    name                VARCHAR(200)    NOT NULL,
    description         TEXT,
    grid_width          INT             NOT NULL,
    grid_height         INT             NOT NULL,
    status              VARCHAR(20)     NOT NULL DEFAULT 'DRAFT',
    background_image_url TEXT,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    version             INT             NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_venue_maps PRIMARY KEY (id),
    CONSTRAINT fk_vm_venue FOREIGN KEY (venue_id) REFERENCES venues (id) ON DELETE RESTRICT,
    CONSTRAINT uk_vm_venue_name UNIQUE (venue_id, name),
    CONSTRAINT ck_vm_grid_width CHECK (grid_width > 0 AND grid_width <= 500),
    CONSTRAINT ck_vm_grid_height CHECK (grid_height > 0 AND grid_height <= 500),
    CONSTRAINT ck_vm_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'))
);

CREATE INDEX idx_vm_venue_id ON venue_maps (venue_id);
CREATE INDEX idx_vm_status ON venue_maps (status) WHERE is_active = TRUE;

COMMENT ON TABLE venue_maps IS 'A canvas/grid layout — the central design unit in Map-First architecture. Replaces the old halls table.';
COMMENT ON COLUMN venue_maps.grid_width IS 'Canvas width in cells (max 500) — determines the horizontal resolution of the editor grid';
COMMENT ON COLUMN venue_maps.grid_height IS 'Canvas height in cells (max 500) — determines the vertical resolution of the editor grid';
COMMENT ON COLUMN venue_maps.status IS 'Lifecycle: DRAFT (editable) → PUBLISHED (read-only, used by Events) → ARCHIVED (retired)';
COMMENT ON COLUMN venue_maps.version IS 'Optimistic lock — prevents concurrent editor saves from overwriting each other';

-- ============================================================================
-- TABLE: map_regions
-- PURPOSE: A named zone drawn on the canvas — the core of the Map-First model
-- WHY IT EXISTS: Regions represent areas like Seating Zone, Stage, VIP,
--               Walkway, Food Court, etc. "Hall" is just a region type.
--               This replaces the rigid Hall entity with a flexible,
--               type-driven model.
-- PROS: Infinitely extensible via region_types. No schema change needed to
--       add new zone types. Each region carries its own business properties.
-- CONS: Business logic for "bookable vs non-bookable" must be enforced at
--       the application layer (aided by is_bookable flag).
-- ============================================================================
CREATE TABLE map_regions (
    id                  UUID            NOT NULL DEFAULT gen_random_uuid(),
    map_id              UUID            NOT NULL,
    region_type_code    VARCHAR(30)     NOT NULL,
    name                VARCHAR(200)    NOT NULL,
    color_code          VARCHAR(7),
    is_bookable         BOOLEAN         NOT NULL DEFAULT FALSE,
    display_order       INT             NOT NULL DEFAULT 0,
    capacity            INT,
    properties          JSONB           NOT NULL DEFAULT '{}',
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_map_regions PRIMARY KEY (id),
    CONSTRAINT fk_mr_map FOREIGN KEY (map_id) REFERENCES venue_maps (id) ON DELETE CASCADE,
    CONSTRAINT fk_mr_region_type FOREIGN KEY (region_type_code) REFERENCES region_types (code),
    CONSTRAINT uk_mr_map_name UNIQUE (map_id, name),
    -- Composite unique needed for FK referencing from map_cells
    CONSTRAINT uk_mr_id_map UNIQUE (id, map_id),
    CONSTRAINT ck_mr_capacity CHECK (capacity IS NULL OR capacity > 0)
);

CREATE INDEX idx_mr_map_id ON map_regions (map_id);
CREATE INDEX idx_mr_type ON map_regions (region_type_code);

COMMENT ON TABLE map_regions IS 'A named zone on the canvas — Hall, Stage, VIP, Walkway are all region types. Hall is NOT a separate entity.';
COMMENT ON COLUMN map_regions.is_bookable IS 'Whether tickets can be sold for seats in this region — overrides region_types.is_bookable_default';
COMMENT ON COLUMN map_regions.capacity IS 'Optional manual capacity override — if NULL, computed from seat count';
COMMENT ON COLUMN map_regions.properties IS 'Flexible type-specific attributes (e.g. stage angle, gate rules) — only for data NOT needed in SQL queries';

-- ============================================================================
-- TABLE: map_cells
-- PURPOSE: Normalized grid geometry — each row is one "painted" cell on canvas
-- WHY IT EXISTS: Instead of storing region shapes as JSONB coordinates,
--               this table normalizes each cell as a row. The composite PK
--               (map_id, x, y) is the STRONGEST possible anti-overlap
--               constraint — it is physically impossible for two regions to
--               claim the same cell.
-- PROS: 3NF compliant. Easy JOIN. Fast query "give me all cells for region X".
--       PK guarantees no overlap without application-layer validation.
-- CONS: Row count = number of painted cells. A 200×200 fully painted map =
--       40,000 rows. Trivial for PostgreSQL (even 1M rows is fine).
-- ============================================================================
CREATE TABLE map_cells (
    map_id          UUID            NOT NULL,
    x_coord         INT             NOT NULL,
    y_coord         INT             NOT NULL,
    region_id       UUID            NOT NULL,

    CONSTRAINT pk_map_cells PRIMARY KEY (map_id, x_coord, y_coord),
    CONSTRAINT fk_mc_map FOREIGN KEY (map_id) REFERENCES venue_maps (id) ON DELETE CASCADE,
    -- Composite FK ensures region belongs to the SAME map as the cell
    CONSTRAINT fk_mc_region FOREIGN KEY (region_id, map_id) REFERENCES map_regions (id, map_id),
    CONSTRAINT ck_mc_x CHECK (x_coord >= 0),
    CONSTRAINT ck_mc_y CHECK (y_coord >= 0)
);

CREATE INDEX idx_mc_region_id ON map_cells (region_id);

COMMENT ON TABLE map_cells IS 'Normalized grid geometry — composite PK makes cell overlap physically impossible at the DB level';
COMMENT ON COLUMN map_cells.x_coord IS 'Horizontal position on the grid (0-indexed, left to right)';
COMMENT ON COLUMN map_cells.y_coord IS 'Vertical position on the grid (0-indexed, top to bottom)';

-- ============================================================================
-- TABLE: seats
-- PURPOSE: Physical seats placed on a bookable region's cells
-- WHY IT EXISTS: Seats are the atomic bookable unit — users buy tickets for
--               a specific seat. A seat belongs to a region (not a hall).
--               Only regions with is_bookable=TRUE should contain seats.
-- PROS: Direct FK to region. Coordinates allow precise UI rendering.
--       Multiple unique constraints prevent duplicate seat labels AND
--       duplicate seat positions within a region.
-- CONS: Enforcing "seat must be on a cell that belongs to its region"
--       requires application-layer validation (no pure FK possible without
--       denormalizing map_id into seats).
-- ============================================================================
CREATE TABLE seats (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    region_id       UUID            NOT NULL,
    seat_type_code  VARCHAR(30)     NOT NULL,
    row_label       VARCHAR(10)     NOT NULL,
    seat_number     INT             NOT NULL,
    x_coord         INT             NOT NULL,
    y_coord         INT             NOT NULL,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_seats PRIMARY KEY (id),
    CONSTRAINT fk_seats_region FOREIGN KEY (region_id) REFERENCES map_regions (id) ON DELETE CASCADE,
    CONSTRAINT fk_seats_type FOREIGN KEY (seat_type_code) REFERENCES seat_types (code),
    CONSTRAINT uk_seats_region_row_number UNIQUE (region_id, row_label, seat_number),
    CONSTRAINT uk_seats_region_position UNIQUE (region_id, x_coord, y_coord),
    CONSTRAINT ck_seats_number CHECK (seat_number > 0),
    CONSTRAINT ck_seats_x CHECK (x_coord >= 0),
    CONSTRAINT ck_seats_y CHECK (y_coord >= 0)
);

CREATE INDEX idx_seats_region_id ON seats (region_id);
CREATE INDEX idx_seats_type ON seats (seat_type_code);

COMMENT ON TABLE seats IS 'Physical seats on a bookable region — the atomic unit that users purchase tickets for';
COMMENT ON COLUMN seats.row_label IS 'Human-readable row identifier (A, B, C... or 1, 2, 3...)';
COMMENT ON COLUMN seats.seat_number IS 'Seat number within the row — unique per (region, row_label)';
COMMENT ON COLUMN seats.x_coord IS 'X coordinate on the grid for UI rendering — must fall within region cells (enforced by app layer)';
COMMENT ON COLUMN seats.y_coord IS 'Y coordinate on the grid for UI rendering — must fall within region cells (enforced by app layer)';
