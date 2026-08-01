-- ============================================================================
-- FILE: 17_seed_data.sql
-- MODULE: Seed Data
-- PURPOSE: Base reference data required for the system to run
-- DEPENDENCIES: 01 (roles, permissions), 03 (event_categories), 08 (payment_providers)
-- ============================================================================

-- ============================================================================
-- 1. SEED ROLES
-- ============================================================================
INSERT INTO roles (id, name, description) VALUES
    ('00000000-0000-0000-0000-000000000001', 'SUPER_ADMIN', 'Full system access'),
    ('00000000-0000-0000-0000-000000000002', 'ADMIN', 'Platform administrator (support, moderation)'),
    ('00000000-0000-0000-0000-000000000003', 'ORGANIZER', 'Event creator and manager'),
    ('00000000-0000-0000-0000-000000000004', 'CUSTOMER', 'Standard user who books tickets')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 2. SEED PERMISSIONS (Partial list for demonstration)
-- ============================================================================
INSERT INTO permissions (id, code, module, description) VALUES
    -- Event Management
    (gen_random_uuid(), 'EVENT_CREATE', 'EVENT', 'Create new events'),
    (gen_random_uuid(), 'EVENT_UPDATE', 'EVENT', 'Update existing events'),
    (gen_random_uuid(), 'EVENT_PUBLISH', 'EVENT', 'Publish draft events'),

    -- Booking Management
    (gen_random_uuid(), 'BOOKING_VIEW', 'BOOKING', 'View booking details'),
    (gen_random_uuid(), 'BOOKING_CANCEL', 'BOOKING', 'Cancel bookings (Admin/Org)'),

    -- Financial
    (gen_random_uuid(), 'REFUND_APPROVE', 'FINANCE', 'Approve refund requests')
ON CONFLICT (code) DO NOTHING;

-- Map all permissions to SUPER_ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. SEED EVENT CATEGORIES
-- ============================================================================
INSERT INTO event_categories (id, name, slug, display_order) VALUES
    ('10000000-0000-0000-0000-000000000001', 'Live Music & Concerts', 'music-concerts', 1),
    ('10000000-0000-0000-0000-000000000002', 'Theater & Arts', 'theater-arts', 2),
    ('10000000-0000-0000-0000-000000000003', 'Sports', 'sports', 3),
    ('10000000-0000-0000-0000-000000000004', 'Conferences & Seminars', 'conferences', 4),
    ('10000000-0000-0000-0000-000000000005', 'Festivals', 'festivals', 5),
    ('10000000-0000-0000-0000-000000000006', 'Comedy Shows', 'comedy', 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 4. SEED REGION TYPES
-- ============================================================================
INSERT INTO region_types (code, name, description, is_bookable_default, icon, color_default, display_order) VALUES
    ('HALL',        'Hall',             'General-purpose hall or auditorium',            TRUE,   'door-open',      '#4A90D9', 1),
    ('SEATING',     'Seating Zone',     'Standard seated area',                          TRUE,   'armchair',        '#5CB85C', 2),
    ('VIP',         'VIP Zone',         'Premium/VIP seating area',                      TRUE,   'crown',           '#F0AD4E', 3),
    ('STANDING',    'Standing Zone',    'General admission standing area',               TRUE,   'person-standing', '#5BC0DE', 4),
    ('STAGE',       'Stage',            'Performance stage area',                        FALSE,  'music',           '#D9534F', 5),
    ('AISLE',       'Aisle / Walkway',  'Walking path between zones',                    FALSE,  'arrow-right',     '#CCCCCC', 6),
    ('FOOD_COURT',  'Food Court',       'Food and beverage service area',                FALSE,  'utensils',        '#FF8C00', 7),
    ('RESTROOM',    'Restroom',         'Restroom / toilet facilities',                  FALSE,  'droplet',         '#6C757D', 8),
    ('EXIT',        'Exit',             'Emergency or regular exit point',               FALSE,  'sign-out',        '#DC3545', 9),
    ('BACKSTAGE',   'Backstage',        'Restricted backstage / crew area',              FALSE,  'lock',            '#343A40', 10),
    ('CAMERA_AREA', 'Camera Area',      'Designated press / camera zone',                FALSE,  'camera',          '#17A2B8', 11),
    ('SECURITY',    'Security Zone',    'Security checkpoint or monitoring area',        FALSE,  'shield',          '#6610F2', 12),
    ('PARKING',     'Parking',          'Vehicle parking area',                          FALSE,  'car',             '#795548', 13),
    ('MERCHANDISE', 'Merchandise',      'Merchandise / souvenir booth area',             FALSE,  'shopping-bag',    '#E91E63', 14)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 5. SEED SEAT TYPES
-- ============================================================================
INSERT INTO seat_types (code, name, description, icon, display_order) VALUES
    ('NORMAL',      'Normal',           'Standard seat',                                 'chair',        1),
    ('VIP',         'VIP',              'VIP / premium seat with extra legroom',          'crown',        2),
    ('COUPLE',      'Couple',           'Double-width seat for couples',                  'heart',        3),
    ('WHEELCHAIR',  'Wheelchair',       'Accessible seat for wheelchair users',           'wheelchair',   4),
    ('PREMIUM',     'Premium Recliner', 'Reclining premium seat',                        'star',         5),
    ('BENCH',       'Bench',            'Shared bench seating',                           'sofa',         6)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 6. SEED PAYMENT PROVIDERS
-- ============================================================================
INSERT INTO payment_providers (id, name, code, description, config) VALUES
    ('20000000-0000-0000-0000-000000000001', 'VNPay', 'VNPAY', 'VNPay Gateway', '{"fee_percentage": 1.5, "fixed_fee": 2000, "currency": "VND"}'),
    ('20000000-0000-0000-0000-000000000002', 'Momo', 'MOMO', 'Momo E-Wallet', '{"fee_percentage": 1.2, "fixed_fee": 1500, "currency": "VND"}'),
    ('20000000-0000-0000-0000-000000000003', 'ZaloPay', 'ZALOPAY', 'ZaloPay Gateway', '{"fee_percentage": 1.0, "fixed_fee": 1000, "currency": "VND"}'),
    ('20000000-0000-0000-0000-000000000004', 'Stripe', 'STRIPE', 'International Cards', '{"fee_percentage": 2.9, "fixed_fee": 0.3, "currency": "USD"}')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================
