-- ============================================================================
-- FILE: 06_promotions.sql
-- MODULE: Promotions
-- TABLES: promotion_campaigns, coupons
-- NOTE: coupon_usages is created in 07_booking.sql (depends on bookings)
-- DEPENDENCIES: 01_identity_access.sql (users), 03_event_management.sql (events)
-- ============================================================================

-- ============================================================================
-- TABLE: promotion_campaigns
-- PURPOSE: Groups related coupon codes under a marketing campaign
-- ============================================================================
CREATE TABLE promotion_campaigns (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    name            VARCHAR(200)    NOT NULL,
    description     TEXT,
    campaign_type   VARCHAR(30)     NOT NULL,
    budget          DECIMAL(14,2),
    spent_amount    DECIMAL(14,2)   NOT NULL DEFAULT 0,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    start_date      TIMESTAMPTZ     NOT NULL,
    end_date        TIMESTAMPTZ     NOT NULL,
    created_by      UUID            NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_promotion_campaigns PRIMARY KEY (id),
    CONSTRAINT fk_pc_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT ck_pc_type CHECK (campaign_type IN ('SEASONAL', 'LAUNCH', 'FLASH_SALE', 'LOYALTY', 'PARTNERSHIP', 'REFERRAL')),
    CONSTRAINT ck_pc_dates CHECK (end_date > start_date),
    CONSTRAINT ck_pc_budget CHECK (budget IS NULL OR budget >= 0),
    CONSTRAINT ck_pc_spent CHECK (spent_amount >= 0)
);

CREATE INDEX idx_pc_active ON promotion_campaigns (is_active, start_date, end_date);

COMMENT ON TABLE promotion_campaigns IS 'Marketing campaign grouping for analytics and budget tracking';

-- ============================================================================
-- TABLE: coupons
-- PURPOSE: Promotional codes offering discounts on bookings
-- ============================================================================
CREATE TABLE coupons (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    code            VARCHAR(50)     NOT NULL,
    campaign_id     UUID,
    discount_type   VARCHAR(15)     NOT NULL,
    discount_value  DECIMAL(12,2)   NOT NULL,
    max_discount    DECIMAL(12,2),
    min_order_amount DECIMAL(12,2),
    max_usage       INT,
    max_usage_per_user INT,
    used_count      INT             NOT NULL DEFAULT 0,
    event_id        UUID,
    user_id         UUID,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    valid_from      TIMESTAMPTZ     NOT NULL,
    valid_until     TIMESTAMPTZ     NOT NULL,
    version         INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,

    CONSTRAINT pk_coupons PRIMARY KEY (id),
    CONSTRAINT fk_coupons_campaign FOREIGN KEY (campaign_id) REFERENCES promotion_campaigns (id) ON DELETE SET NULL,
    CONSTRAINT fk_coupons_event FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE SET NULL,
    CONSTRAINT fk_coupons_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT ck_coupons_type CHECK (discount_type IN ('PERCENTAGE', 'FIXED')),
    CONSTRAINT ck_coupons_value CHECK (discount_value > 0),
    CONSTRAINT ck_coupons_percentage CHECK (discount_type != 'PERCENTAGE' OR discount_value <= 100),
    CONSTRAINT ck_coupons_validity CHECK (valid_until > valid_from),
    CONSTRAINT ck_coupons_usage CHECK (used_count >= 0 AND (max_usage IS NULL OR used_count <= max_usage))
);

CREATE UNIQUE INDEX uk_coupons_code ON coupons (code) WHERE deleted_at IS NULL;

CREATE INDEX idx_coupons_event_id ON coupons (event_id) WHERE event_id IS NOT NULL;
CREATE INDEX idx_coupons_user_id ON coupons (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_coupons_validity ON coupons (valid_from, valid_until) WHERE is_active = TRUE;
CREATE INDEX idx_coupons_campaign ON coupons (campaign_id) WHERE campaign_id IS NOT NULL;

COMMENT ON TABLE coupons IS 'Promotional codes — version column enables optimistic locking for concurrent used_count updates';
COMMENT ON COLUMN coupons.max_usage_per_user IS 'Per-user limit — enforced by querying coupon_usages at booking time';
COMMENT ON COLUMN coupons.user_id IS 'User-specific coupon (private code for one user) — NULL means public coupon';
