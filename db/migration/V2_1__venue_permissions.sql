-- ============================================================
-- 8. VENUE PERMISSIONS
-- ============================================================

INSERT INTO permissions (id, code, description, module) VALUES
    (gen_random_uuid(), 'VENUE_LIST',   'List all venues',         'VENUE'),
    (gen_random_uuid(), 'VENUE_VIEW',   'View venue details',      'VENUE'),
    (gen_random_uuid(), 'VENUE_CREATE', 'Create a new venue',      'VENUE'),
    (gen_random_uuid(), 'VENUE_UPDATE', 'Update an existing venue','VENUE'),
    (gen_random_uuid(), 'VENUE_DELETE', 'Soft-delete a venue',     'VENUE');