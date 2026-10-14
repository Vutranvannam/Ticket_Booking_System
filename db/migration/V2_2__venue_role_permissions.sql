-- Assign Venue permissions to SUPER_ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'SUPER_ADMIN'
  AND p.code IN (
      'VENUE_LIST',
      'VENUE_VIEW',
      'VENUE_CREATE',
      'VENUE_UPDATE',
      'VENUE_DELETE'
  );

-- Assign Venue permissions to ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ADMIN'
  AND p.code IN (
      'VENUE_LIST',
      'VENUE_VIEW',
      'VENUE_CREATE',
      'VENUE_UPDATE',
      'VENUE_DELETE'
  );

-- Assign Venue permissions to ORGANIZER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ORGANIZER'
  AND p.code IN (
      'VENUE_LIST',
      'VENUE_VIEW',
      'VENUE_CREATE',
      'VENUE_UPDATE'
  );

-- V2.2: Assign Venue permissions to roles

-- ADMIN: all Venue permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ADMIN'
  AND p.code IN (
      'VENUE_LIST',
      'VENUE_VIEW',
      'VENUE_CREATE',
      'VENUE_UPDATE',
      'VENUE_DELETE'
  )
  AND NOT EXISTS (
      SELECT 1
      FROM role_permissions rp
      WHERE rp.role_id = r.id
        AND rp.permission_id = p.id
  );

-- ORGANIZER: list, view, create, update
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ORGANIZER'
  AND p.code IN (
      'VENUE_LIST',
      'VENUE_VIEW',
      'VENUE_CREATE',
      'VENUE_UPDATE'
  )
  AND NOT EXISTS (
      SELECT 1
      FROM role_permissions rp
      WHERE rp.role_id = r.id
        AND rp.permission_id = p.id
  );

-- SUPER_ADMIN: all Venue permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'SUPER_ADMIN'
  AND p.code IN (
      'VENUE_LIST',
      'VENUE_VIEW',
      'VENUE_CREATE',
      'VENUE_UPDATE',
      'VENUE_DELETE'
  )
  AND NOT EXISTS (
      SELECT 1
      FROM role_permissions rp
      WHERE rp.role_id = r.id
        AND rp.permission_id = p.id
  );