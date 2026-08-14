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
    password_hash   VARCHAR(255)    NOT NULL,
    full_name       VARCHAR(150)    NOT NULL,
    phone           VARCHAR(20),
    avatar_url      VARCHAR(500),
    is_email_verified BOOLEAN       NOT NULL DEFAULT FALSE,
    locked_until    TIMESTAMPTZ,
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

    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE RESTRICT
);

CREATE INDEX idx_role_permissions_role_id ON role_permissions (role_id);