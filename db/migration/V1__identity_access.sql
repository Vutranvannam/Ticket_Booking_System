-- ============================================================================
-- FILE: 01_identity_access.sql
-- MODULE: Identity & Access
-- TABLES: users, roles, permissions, user_roles, role_permissions, verification_tokens
-- DEPENDENCIES: None (this is the foundation module)
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLE: users
-- PURPOSE: Central identity store for all platform users
-- ============================================================================
CREATE TABLE users (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    email           VARCHAR(255)    NOT NULL,
    password_hash   VARCHAR(255),
    full_name       VARCHAR(150)    NOT NULL,
    phone           VARCHAR(20),
    avatar_url      VARCHAR(500),
    is_email_verified BOOLEAN       NOT NULL DEFAULT FALSE,
    locked_until    TIMESTAMPTZ,
    security_stamp     BIGINT       NOT NULL DEFAULT 1,
    permission_version BIGINT       NOT NULL DEFAULT 1,
    version         INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,

    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT ck_users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Partial unique: allow same email in soft-deleted rows
CREATE UNIQUE INDEX uk_users_email ON users (email) WHERE deleted_at IS NULL;

CREATE INDEX idx_users_email ON users (email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_deleted_at ON users (deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_users_phone ON users (phone) WHERE phone IS NOT NULL;

COMMENT ON TABLE users IS 'Central identity store for all platform users — customers, organizers, and admins';
COMMENT ON COLUMN users.version IS 'Optimistic locking version — prevents lost updates during concurrent profile edits';
COMMENT ON COLUMN users.deleted_at IS 'Soft delete marker — preserves booking and payment history';

-- ============================================================================
-- TABLE: roles
-- PURPOSE: Named authorization roles (CUSTOMER, ORGANIZER, ADMIN, SUPER_ADMIN)
-- ============================================================================
CREATE TABLE roles (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    name            VARCHAR(50)     NOT NULL,
    description     VARCHAR(255),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_roles PRIMARY KEY (id),
    CONSTRAINT uk_roles_name UNIQUE (name)
);

COMMENT ON TABLE roles IS 'Named authorization roles for RBAC — uses table instead of ENUM for runtime flexibility';

-- ============================================================================
-- TABLE: permissions
-- PURPOSE: Fine-grained permission codes (EVENT_CREATE, BOOKING_CANCEL, etc.)
-- ============================================================================
CREATE TABLE permissions (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    code            VARCHAR(100)    NOT NULL,
    description     VARCHAR(255),
    module          VARCHAR(50)     NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_permissions PRIMARY KEY (id),
    CONSTRAINT uk_permissions_code UNIQUE (code)
);

CREATE INDEX idx_permissions_module ON permissions (module);

COMMENT ON TABLE permissions IS 'Fine-grained permission codes grouped by module for RBAC';

-- ============================================================================
-- TABLE: user_roles
-- PURPOSE: M:N junction linking users to roles
-- ============================================================================
CREATE TABLE user_roles (
    user_id         UUID            NOT NULL,
    role_id         UUID            NOT NULL,

    CONSTRAINT pk_user_roles PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE RESTRICT
);

CREATE INDEX idx_user_roles_user_id ON user_roles (user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles (role_id);

-- ============================================================================
-- TABLE: role_permissions
-- PURPOSE: M:N junction linking roles to permissions
-- ============================================================================
CREATE TABLE role_permissions (
    role_id         UUID            NOT NULL,
    permission_id   UUID            NOT NULL,

    CONSTRAINT pk_role_permissions PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE RESTRICT
);

CREATE INDEX idx_role_permissions_role_id ON role_permissions (role_id);

-- ============================================================================
-- SEED DATA — V1 (Identity & Access)
-- NOTE: Permissions for V2–V5 modules will be seeded by their respective
--       migration files (V2__, V3__, V4__, V9__).
-- ============================================================================

-- ── Roles ────────────────────────────────────────────────────────────────────
-- All 4 roles are foundational and defined here once.
-- Later migrations will extend role_permissions as new modules are introduced.
INSERT INTO roles (id, name, description) VALUES
    ('00000000-0000-0000-0000-000000000001', 'SUPER_ADMIN', 'Full platform access — reserved for internal ops team'),
    ('00000000-0000-0000-0000-000000000002', 'ADMIN',       'Administrative access — manage users and platform configuration'),
    ('00000000-0000-0000-0000-000000000003', 'ORGANIZER',   'Event organizer — create and manage own events and shows'),
    ('00000000-0000-0000-0000-000000000004', 'CUSTOMER',    'Regular customer — browse events and book tickets');

-- ── Permissions — USER module only (matches AppPermissions.java exactly) ──────
INSERT INTO permissions (id, code, description, module) VALUES
    ('10000000-0000-0000-0000-000000000001', 'USER_LIST',   'List all users',          'USER'),
    ('10000000-0000-0000-0000-000000000002', 'USER_VIEW',   'View any user profile',   'USER'),
    ('10000000-0000-0000-0000-000000000003', 'USER_UPDATE', 'Update any user profile', 'USER'),
    ('10000000-0000-0000-0000-000000000004', 'USER_DELETE', 'Soft-delete a user',      'USER');

-- ── Role → Permission assignments (V1 scope: USER_* only) ─────────────────────

-- SUPER_ADMIN: all currently defined permissions (more will be added by later migrations)
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id
FROM permissions
WHERE module = 'USER';

-- ADMIN: full user management
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id
FROM permissions
WHERE code IN ('USER_LIST', 'USER_VIEW', 'USER_UPDATE', 'USER_DELETE');

-- ORGANIZER: no USER permissions at V1
-- (venue/event permissions will be granted in V2/V3 migrations)

-- CUSTOMER: no USER permissions at V1
-- (customers access their own data via /me endpoints — auth-only, no explicit permission needed)

-- ── Default dev user — SUPER_ADMIN ───────────────────────────────────────────
-- Password: Admin@123  (BCrypt, cost 12)
-- !! Change credentials before deploying to any non-local environment !!
INSERT INTO users (id, email, password_hash, full_name, is_email_verified, security_stamp, permission_version)
VALUES (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'admin@ticketbooking.local',
    '$2a$12$B0usGi5BqKCN7zJWzQWHiOVOYIp60aIrHxXO4MyRznFs.93hRuKWi',
    'Super Admin',
    TRUE,
    1,
    1
);

INSERT INTO user_roles (user_id, role_id) VALUES
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', '00000000-0000-0000-0000-000000000001');