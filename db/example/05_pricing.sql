-- ============================================================================
-- FILE: 05_pricing.sql
-- MODULE: Pricing
-- TABLES: pricing_tiers, pricing_rules
-- ALTER: show_seat_inventory ADD pricing_tier_id FK
-- DEPENDENCIES: 04_show_management.sql (shows, show_seat_inventory)
-- ============================================================================

-- ============================================================================
-- TABLE: pricing_tiers
-- PURPOSE: Named pricing tiers for groups of seats within a show
-- ============================================================================
CREATE TABLE pricing_tiers (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    show_id         UUID            NOT NULL,
    name            VARCHAR(50)     NOT NULL,
    base_price      DECIMAL(12,2)   NOT NULL,
    color_code      VARCHAR(7),
    display_order   INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_pricing_tiers PRIMARY KEY (id),
    CONSTRAINT fk_pt_show FOREIGN KEY (show_id) REFERENCES shows (id) ON DELETE CASCADE,
    CONSTRAINT uk_pt_show_name UNIQUE (show_id, name),
    CONSTRAINT ck_pt_price CHECK (base_price >= 0)
);

CREATE INDEX idx_pt_show_id ON pricing_tiers (show_id);

COMMENT ON TABLE pricing_tiers IS 'Named pricing levels (Platinum, Gold, Silver) per show — linked to seats via show_seat_inventory';

-- ============================================================================
-- TABLE: pricing_rules
-- PURPOSE: Dynamic pricing rules — early bird, surge, flash sale, etc.
-- ============================================================================
CREATE TABLE pricing_rules (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    show_id         UUID,
    pricing_tier_id UUID,
    name            VARCHAR(100)    NOT NULL,
    rule_type       VARCHAR(30)     NOT NULL,
    adjustment_type VARCHAR(15)     NOT NULL,
    adjustment_value DECIMAL(12,2)  NOT NULL,
    max_adjustment  DECIMAL(12,2),
    conditions      JSONB           NOT NULL DEFAULT '{}',
    priority        INT             NOT NULL DEFAULT 0,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    valid_from      TIMESTAMPTZ,
    valid_until     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_pricing_rules PRIMARY KEY (id),
    CONSTRAINT fk_pr_show FOREIGN KEY (show_id) REFERENCES shows (id) ON DELETE CASCADE,
    CONSTRAINT fk_pr_tier FOREIGN KEY (pricing_tier_id) REFERENCES pricing_tiers (id) ON DELETE CASCADE,
    CONSTRAINT ck_pr_rule_type CHECK (rule_type IN ('EARLY_BIRD', 'LAST_MINUTE', 'DEMAND_SURGE', 'FLASH_SALE', 'HOLIDAY', 'SEAT_TYPE_MULTIPLIER', 'SECTION_PREMIUM')),
    CONSTRAINT ck_pr_adjustment CHECK (adjustment_type IN ('PERCENTAGE', 'FIXED_INCREASE', 'FIXED_DECREASE', 'OVERRIDE')),
    CONSTRAINT ck_pr_value CHECK (adjustment_value > 0)
);

CREATE INDEX idx_pr_show_id ON pricing_rules (show_id);
CREATE INDEX idx_pr_active ON pricing_rules (show_id, is_active, priority);

COMMENT ON TABLE pricing_rules IS 'Dynamic pricing engine — conditions stored as JSONB for maximum flexibility';
COMMENT ON COLUMN pricing_rules.conditions IS 'Rule-specific conditions: {"days_before_show_min": 30} or {"occupancy_threshold_percent": 80}';

-- ============================================================================
-- ALTER: Add pricing_tier_id FK to show_seat_inventory (deferred from 04)
-- ============================================================================
ALTER TABLE show_seat_inventory
    ADD CONSTRAINT fk_ssi_pricing_tier
    FOREIGN KEY (pricing_tier_id) REFERENCES pricing_tiers (id) ON DELETE SET NULL;
