-- ============================================================================
-- FILE: 03_event_management.sql
-- MODULE: Event Management
-- TABLES: organizers, event_categories, events, event_images
-- DEPENDENCIES: 01_identity_access.sql (users)
-- ============================================================================

-- ============================================================================
-- TABLE: organizers
-- PURPOSE: Event organizers — companies or individuals who create events
-- ============================================================================
CREATE TABLE organizers (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL,
    name            VARCHAR(200)    NOT NULL,
    description     TEXT,
    logo_url        VARCHAR(500),
    website         VARCHAR(500),
    phone           VARCHAR(20),
    email           VARCHAR(255),
    is_verified     BOOLEAN         NOT NULL DEFAULT FALSE,
    version         INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,

    CONSTRAINT pk_organizers PRIMARY KEY (id),
    CONSTRAINT fk_organizers_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT
);

CREATE INDEX idx_organizers_user_id ON organizers (user_id);
CREATE INDEX idx_organizers_is_verified ON organizers (is_verified);

COMMENT ON TABLE organizers IS 'Event organizers — decoupled from users to allow one user to manage multiple brands';
COMMENT ON COLUMN organizers.user_id IS 'Primary owner — team members managed via organizer_members table';

-- ============================================================================
-- TABLE: event_categories
-- PURPOSE: Event classification (Concert, Sports, Theater, etc.)
-- ============================================================================
CREATE TABLE event_categories (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    name            VARCHAR(100)    NOT NULL,
    slug            VARCHAR(100)    NOT NULL,
    description     VARCHAR(500),
    icon_url        VARCHAR(500),
    display_order   INT             NOT NULL DEFAULT 0,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_event_categories PRIMARY KEY (id),
    CONSTRAINT uk_event_categories_name UNIQUE (name),
    CONSTRAINT uk_event_categories_slug UNIQUE (slug)
);

COMMENT ON TABLE event_categories IS 'Flat event classification — slug enables SEO-friendly URLs';

-- ============================================================================
-- TABLE: events
-- PURPOSE: Core business entity — an event that users can book tickets for
-- ============================================================================
CREATE TABLE events (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    organizer_id    UUID            NOT NULL,
    category_id     UUID            NOT NULL,
    title           VARCHAR(300)    NOT NULL,
    description     TEXT,
    slug            VARCHAR(350)    NOT NULL,
    event_status    VARCHAR(20)     NOT NULL DEFAULT 'DRAFT',
    min_age         SMALLINT,
    start_date      TIMESTAMPTZ     NOT NULL,
    end_date        TIMESTAMPTZ     NOT NULL,
    thumbnail_url   VARCHAR(500),
    is_featured     BOOLEAN         NOT NULL DEFAULT FALSE,
    version         INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,

    CONSTRAINT pk_events PRIMARY KEY (id),
    CONSTRAINT fk_events_organizer FOREIGN KEY (organizer_id) REFERENCES organizers (id) ON DELETE RESTRICT,
    CONSTRAINT fk_events_category FOREIGN KEY (category_id) REFERENCES event_categories (id) ON DELETE RESTRICT,
    CONSTRAINT ck_events_status CHECK (event_status IN ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED', 'SUSPENDED')),
    CONSTRAINT ck_events_dates CHECK (end_date > start_date),
    CONSTRAINT ck_events_min_age CHECK (min_age IS NULL OR (min_age >= 0 AND min_age <= 21))
);

CREATE UNIQUE INDEX uk_events_slug ON events (slug) WHERE deleted_at IS NULL;

CREATE INDEX idx_events_organizer_id ON events (organizer_id);
CREATE INDEX idx_events_category_id ON events (category_id);
CREATE INDEX idx_events_status ON events (event_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_start_date ON events (start_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_featured ON events (is_featured) WHERE is_featured = TRUE AND deleted_at IS NULL;

COMMENT ON TABLE events IS 'Core business entity — no venue FK because an event can have shows in multiple venues (touring)';
COMMENT ON COLUMN events.event_status IS 'VARCHAR + CHECK preferred over ENUM — easier to add new statuses without ALTER TYPE';

-- ============================================================================
-- TABLE: event_images
-- PURPOSE: Gallery images for an event with ordering
-- ============================================================================
CREATE TABLE event_images (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    event_id        UUID            NOT NULL,
    image_url       VARCHAR(500)    NOT NULL,
    alt_text        VARCHAR(255),
    display_order   INT             NOT NULL DEFAULT 0,
    is_primary      BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_event_images PRIMARY KEY (id),
    CONSTRAINT fk_event_images_event FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
);

-- At most one primary image per event
CREATE UNIQUE INDEX uk_event_images_primary ON event_images (event_id) WHERE is_primary = TRUE;

CREATE INDEX idx_event_images_event_id ON event_images (event_id);

COMMENT ON TABLE event_images IS 'Gallery images — CASCADE delete when event is removed';
