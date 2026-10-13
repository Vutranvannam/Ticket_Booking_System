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