-- ============================================================================
-- FILE: 16_triggers_functions.sql
-- MODULE: Triggers & Functions
-- PURPOSE: Data integrity at the database layer (prevent double sales, total calculation, status logs)
-- DEPENDENCIES: 04 (show_seat_inventory), 07 (bookings, booking_items, booking_status_history)
-- ============================================================================

-- ============================================================================
-- FUNCTION: check_booking_total
-- PURPOSE: Ensures booking total_amount equals sum of booking_items minus discount
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_check_booking_total()
RETURNS TRIGGER AS $$
DECLARE
    calculated_subtotal DECIMAL(12,2);
BEGIN
    -- Only check on INSERT or when amounts change
    IF (TG_OP = 'UPDATE' AND NEW.subtotal = OLD.subtotal AND NEW.discount_amount = OLD.discount_amount AND NEW.total_amount = OLD.total_amount) THEN
        RETURN NEW;
    END IF;

    -- Calculate sum of items
    SELECT COALESCE(SUM(price), 0) INTO calculated_subtotal
    FROM booking_items
    WHERE booking_id = NEW.id AND status = 'ACTIVE';

    -- Validate subtotal
    IF NEW.subtotal != calculated_subtotal THEN
        RAISE EXCEPTION 'Booking subtotal (%) does not match sum of active items (%)', NEW.subtotal, calculated_subtotal;
    END IF;

    -- Validate total
    IF NEW.total_amount != (NEW.subtotal - NEW.discount_amount) THEN
        RAISE EXCEPTION 'Booking total_amount (%) must equal subtotal - discount_amount (%)', NEW.total_amount, (NEW.subtotal - NEW.discount_amount);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER uses CONSTRAINT trigger to run AFTER statement (so items are already inserted)
CREATE CONSTRAINT TRIGGER trg_check_booking_total
AFTER INSERT OR UPDATE ON bookings
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION fn_check_booking_total();


-- ============================================================================
-- FUNCTION: prevent_double_sale
-- PURPOSE: Ensures a seat is never sold twice for the same show
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_prevent_double_sale()
RETURNS TRIGGER AS $$
DECLARE
    existing_sold_count INT;
BEGIN
    -- Check if seat is transitioning to SOLD or BOOKED
    IF NEW.status IN ('SOLD', 'BOOKED') THEN
        -- See if any other ACTIVE booking_item holds this seat
        SELECT COUNT(*)
        INTO existing_sold_count
        FROM booking_items bi
        JOIN bookings b ON bi.booking_id = b.id
        WHERE bi.show_seat_inventory_id = NEW.id
          AND bi.status = 'ACTIVE'
          AND b.status IN ('PAID', 'PENDING', 'PAYMENT_PROCESSING');

        -- If more than 0 (excluding current transaction if possible, but safe check), rollback
        IF existing_sold_count > 1 THEN
            RAISE EXCEPTION 'Seat (show_seat_inventory_id: %) is already sold or actively booked!', NEW.id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_double_sale
BEFORE UPDATE ON show_seat_inventory
FOR EACH ROW
EXECUTE FUNCTION fn_prevent_double_sale();


-- ============================================================================
-- FUNCTION: log_booking_status_change
-- PURPOSE: Automatically append to booking_status_history on status change
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND NEW.status != OLD.status) THEN
        INSERT INTO booking_status_history (
            booking_id,
            from_status,
            to_status,
            trigger,
            created_at
        ) VALUES (
            NEW.id,
            CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.status END,
            NEW.status,
            'DB_TRIGGER', -- Application should ideally insert this explicitly with real trigger context, but this is a fallback
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only enable if application is NOT writing to history table manually
-- (For this design, the app SHOULD write it manually to provide `triggered_by`.
-- This trigger is commented out, kept as an architectural option.)

/*
CREATE TRIGGER trg_log_booking_status_change
AFTER INSERT OR UPDATE OF status ON bookings
FOR EACH ROW
EXECUTE FUNCTION fn_log_booking_status_change();
*/
