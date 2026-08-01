-- ============================================================================
-- FILE: 12_organizer_teams.sql
-- MODULE: Organizer Teams
-- TABLES: organizer_members, organizer_invitations
-- DEPENDENCIES: 01_identity_access.sql (users), 03_event_management.sql (organizers)
-- ============================================================================

-- ============================================================================
-- TABLE: organizer_members
-- PURPOSE: Links users to organizers with specific access roles
-- ============================================================================
CREATE TABLE organizer_members (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    organizer_id    UUID            NOT NULL,
    user_id         UUID            NOT NULL,
    role            VARCHAR(30)     NOT NULL,
    joined_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    added_by        UUID,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,

    CONSTRAINT pk_organizer_members PRIMARY KEY (id),
    CONSTRAINT fk_om_organizer FOREIGN KEY (organizer_id) REFERENCES organizers (id) ON DELETE CASCADE,
    CONSTRAINT fk_om_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_om_added_by FOREIGN KEY (added_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT uk_om_organizer_user UNIQUE (organizer_id, user_id),
    CONSTRAINT ck_om_role CHECK (role IN ('OWNER', 'ADMIN', 'EVENT_MANAGER', 'FINANCE', 'GATE_SCANNER'))
);

CREATE INDEX idx_om_user_id ON organizer_members (user_id);
CREATE INDEX idx_om_organizer_id ON organizer_members (organizer_id);

COMMENT ON TABLE organizer_members IS 'Allows one organizer to have multiple team members (B2B SaaS model)';

-- ============================================================================
-- TABLE: organizer_invitations
-- PURPOSE: Pending invitations for new team members
-- ============================================================================
CREATE TABLE organizer_invitations (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    organizer_id    UUID            NOT NULL,
    email           VARCHAR(255)    NOT NULL,
    role            VARCHAR(30)     NOT NULL,
    token_hash      VARCHAR(255)    NOT NULL,
    invited_by      UUID            NOT NULL,
    expires_at      TIMESTAMPTZ     NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_organizer_invitations PRIMARY KEY (id),
    CONSTRAINT fk_oi_organizer FOREIGN KEY (organizer_id) REFERENCES organizers (id) ON DELETE CASCADE,
    CONSTRAINT fk_oi_invited_by FOREIGN KEY (invited_by) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT ck_oi_role CHECK (role IN ('OWNER', 'ADMIN', 'EVENT_MANAGER', 'FINANCE', 'GATE_SCANNER')),
    CONSTRAINT ck_oi_status CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED'))
);

CREATE UNIQUE INDEX uk_oi_token_hash ON organizer_invitations (token_hash);
CREATE INDEX idx_oi_email_status ON organizer_invitations (email, status);
CREATE INDEX idx_oi_organizer ON organizer_invitations (organizer_id);

COMMENT ON TABLE organizer_invitations IS 'Invitations to join an organizer team via email — uses hashed token like verification_tokens';
