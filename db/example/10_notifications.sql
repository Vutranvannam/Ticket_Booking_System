-- ============================================================================
-- FILE: 10_notifications.sql
-- MODULE: Notifications
-- TABLES: notification_templates, notification_preferences, notifications
-- DEPENDENCIES: 01_identity_access.sql (users)
-- ============================================================================

-- ============================================================================
-- TABLE: notification_templates
-- PURPOSE: Reusable, editable templates with variable substitution
-- ============================================================================
CREATE TABLE notification_templates (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    code            VARCHAR(50)     NOT NULL,
    channel         VARCHAR(15)     NOT NULL,
    language        VARCHAR(5)      NOT NULL DEFAULT 'vi',
    subject         VARCHAR(255),
    body_template   TEXT            NOT NULL,
    variables       JSONB,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    version         INT             NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_notification_templates PRIMARY KEY (id),
    CONSTRAINT uk_nt_code_channel_lang UNIQUE (code, channel, language, version),
    CONSTRAINT ck_nt_channel CHECK (channel IN ('IN_APP', 'EMAIL', 'SMS', 'PUSH'))
);

CREATE INDEX idx_nt_code_channel ON notification_templates (code, channel, language) WHERE is_active = TRUE;

COMMENT ON TABLE notification_templates IS 'Editable templates — body_template uses {{variable}} placeholders';
COMMENT ON COLUMN notification_templates.version IS 'Template versioning for A/B testing';

-- ============================================================================
-- TABLE: notification_preferences
-- PURPOSE: User opt-in/opt-out per notification type and channel
-- ============================================================================
CREATE TABLE notification_preferences (
    id                  UUID            NOT NULL DEFAULT gen_random_uuid(),
    user_id             UUID            NOT NULL,
    notification_type   VARCHAR(30)     NOT NULL,
    channel             VARCHAR(15)     NOT NULL,
    is_enabled          BOOLEAN         NOT NULL DEFAULT TRUE,
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_notification_preferences PRIMARY KEY (id),
    CONSTRAINT fk_np_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uk_np_user_type_channel UNIQUE (user_id, notification_type, channel),
    CONSTRAINT ck_np_channel CHECK (channel IN ('IN_APP', 'EMAIL', 'SMS', 'PUSH'))
);

CREATE INDEX idx_np_user_id ON notification_preferences (user_id);

COMMENT ON TABLE notification_preferences IS 'GDPR compliance — users control which notifications they receive and through which channel';

-- ============================================================================
-- TABLE: notifications
-- PURPOSE: Notifications sent to users across multiple channels
-- ============================================================================
CREATE TABLE notifications (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL,
    template_id     UUID,
    type            VARCHAR(30)     NOT NULL,
    channel         VARCHAR(15)     NOT NULL,
    title           VARCHAR(255)    NOT NULL,
    content         TEXT            NOT NULL,
    metadata        JSONB,
    delivery_status VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    read_at         TIMESTAMPTZ,
    sent_at         TIMESTAMPTZ,
    retry_count     INT             NOT NULL DEFAULT 0,
    failure_reason  VARCHAR(500),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_notifications PRIMARY KEY (id),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_template FOREIGN KEY (template_id) REFERENCES notification_templates (id) ON DELETE SET NULL,
    CONSTRAINT ck_notifications_type CHECK (type IN ('BOOKING_CONFIRMATION', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'BOOKING_CANCELLED', 'BOOKING_REMINDER', 'EVENT_UPDATE', 'PROMOTION', 'SYSTEM')),
    CONSTRAINT ck_notifications_channel CHECK (channel IN ('IN_APP', 'EMAIL', 'SMS', 'PUSH')),
    CONSTRAINT ck_notifications_status CHECK (delivery_status IN ('PENDING', 'SENDING', 'SENT', 'DELIVERED', 'FAILED', 'READ'))
) PARTITION BY RANGE (created_at);

-- Create initial partitions
CREATE TABLE notifications_y2026m07 PARTITION OF notifications
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE notifications_y2026m08 PARTITION OF notifications
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE notifications_y2026m09 PARTITION OF notifications
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE notifications_y2026m10 PARTITION OF notifications
    FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE notifications_y2026m11 PARTITION OF notifications
    FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE notifications_y2026m12 PARTITION OF notifications
    FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_user_unread ON notifications (user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_status ON notifications (delivery_status) WHERE delivery_status IN ('PENDING', 'FAILED');
CREATE INDEX idx_notifications_created_at ON notifications (created_at);

COMMENT ON TABLE notifications IS 'Partitioned by created_at — old notifications rarely queried';
