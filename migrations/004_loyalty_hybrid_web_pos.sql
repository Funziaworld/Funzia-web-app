-- Hybrid loyalty (C): web bookings accrue via Paystack; POS via Loyverse webhooks.
-- Members may have email only (web), Loyverse id only (POS), or both after merge.

ALTER TABLE loyalty_members
  ALTER COLUMN loyverse_customer_id DROP NOT NULL;

ALTER TABLE loyalty_members
  ADD CONSTRAINT loyalty_members_has_identity CHECK (
    loyverse_customer_id IS NOT NULL OR email_normalized IS NOT NULL
  );

CREATE UNIQUE INDEX IF NOT EXISTS loyalty_members_email_norm_unique
  ON loyalty_members (email_normalized)
  WHERE email_normalized IS NOT NULL;

-- Existing UNIQUE(loyverse_customer_id) from 003 still enforces one row per Loyverse id; PostgreSQL allows multiple NULLs.

-- POS rules that mirror web catalog: set booking_service_match so POS accrual is skipped
-- when the same member recently earned web points for that service (dedupe_window_hours).
ALTER TABLE loyalty_package_earn_rules
  ADD COLUMN IF NOT EXISTS booking_service_match TEXT NULL
    CHECK (
      booking_service_match IS NULL
      OR booking_service_match IN ('Arcade', 'VR', 'The Ball Pit', 'Fun Rides')
    );

ALTER TABLE loyalty_package_earn_rules
  ADD COLUMN IF NOT EXISTS dedupe_window_hours INTEGER NOT NULL DEFAULT 72
    CHECK (dedupe_window_hours > 0 AND dedupe_window_hours <= 8760);

COMMENT ON COLUMN loyalty_package_earn_rules.booking_service_match IS
  'When set, skip Loyverse accrual for this line if member has a web accrual for this service within dedupe_window_hours (same loyalty_members row; merge via Loyverse customer email).';

-- Example (after you know variant/item ids):
-- UPDATE loyalty_package_earn_rules SET booking_service_match = 'Arcade' WHERE loyverse_variant_id = 'YOUR-ID';
