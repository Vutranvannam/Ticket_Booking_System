-- ============================================================================
-- FILE: 14_user_engagement.sql
-- MODULE: User Engagement
-- TABLES: event_favorites, event_reviews
-- DEPENDENCIES: 01 (users), 03 (events), 07 (bookings)
-- ============================================================================

-- ============================================================================
-- TABLE: event_favorites
-- PURPOSE: User wishlist for upcoming events
-- ============================================================================
CREATE TABLE event_favorites (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL,
    event_id        UUID            NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_event_favorites PRIMARY KEY (id),
    CONSTRAINT fk_ef_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_ef_event FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
    CONSTRAINT uk_ef_user_event UNIQUE (user_id, event_id)
);

CREATE INDEX idx_ef_event_id ON event_favorites (event_id);

COMMENT ON TABLE event_favorites IS 'User wishlist — used for targeted notifications (e.g., "Tickets are on sale now")';

-- ============================================================================
-- TABLE: event_reviews
-- PURPOSE: Ratings and reviews for events (verified buyers only)
-- ============================================================================
CREATE TABLE event_reviews (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    event_id        UUID            NOT NULL,
    user_id         UUID            NOT NULL,
    booking_id      UUID            NOT NULL,
    rating          SMALLINT        NOT NULL,
    review_title    VARCHAR(100),
    review_text     TEXT,
    status          VARCHAR(20)     NOT NULL DEFAULT 'PUBLISHED',
    reported_count  INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_event_reviews PRIMARY KEY (id),
    CONSTRAINT fk_er_event FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
    CONSTRAINT fk_er_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_er_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE,
    CONSTRAINT uk_er_user_event UNIQUE (user_id, event_id),
    CONSTRAINT uk_er_booking UNIQUE (booking_id),
    CONSTRAINT ck_er_rating CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT ck_er_status CHECK (status IN ('PENDING_MODERATION', 'PUBLISHED', 'HIDDEN', 'DELETED'))
);

CREATE INDEX idx_er_event_rating ON event_reviews (event_id, rating) WHERE status = 'PUBLISHED';
CREATE INDEX idx_er_status ON event_reviews (status) WHERE status = 'PENDING_MODERATION';

COMMENT ON TABLE event_reviews IS 'Verified buyer reviews — enforced by booking_id FK and UNIQUE constraint';
