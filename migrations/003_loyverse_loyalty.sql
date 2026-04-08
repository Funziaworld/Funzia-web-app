-- Loyverse sync placeholders + Supabase-led loyalty (points ledger)
-- Run in Supabase SQL Editor after 001 (bookings).

CREATE TABLE IF NOT EXISTS loyalty_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loyverse_customer_id TEXT NOT NULL UNIQUE,
  email_normalized TEXT,
  phone_normalized TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_members_email ON loyalty_members (email_normalized)
  WHERE email_normalized IS NOT NULL;

CREATE TABLE IF NOT EXISTS loyalty_package_earn_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loyverse_variant_id TEXT UNIQUE,
  loyverse_item_id TEXT UNIQUE,
  points_per_unit INTEGER NOT NULL CHECK (points_per_unit > 0),
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT loyalty_rule_target CHECK (
    loyverse_variant_id IS NOT NULL OR loyverse_item_id IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_loyalty_earn_variant ON loyalty_package_earn_rules (loyverse_variant_id)
  WHERE loyverse_variant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_loyalty_earn_item ON loyalty_package_earn_rules (loyverse_item_id)
  WHERE loyverse_item_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS loyalty_point_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loyalty_member_id UUID NOT NULL REFERENCES loyalty_members (id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'accrual',
    'redemption_bundle_hour',
    'redemption_minutes',
    'adjustment'
  )),
  points_delta INTEGER NOT NULL CHECK (points_delta <> 0),
  idempotency_key TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'loyverse',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_events_member ON loyalty_point_events (loyalty_member_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_events_created ON loyalty_point_events (created_at DESC);

CREATE TABLE IF NOT EXISTS loyverse_integration_state (
  id TEXT PRIMARY KEY DEFAULT 'default' CHECK (id = 'default'),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  merchant_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loyverse_item_variants_cache (
  variant_id TEXT PRIMARY KEY,
  item_id TEXT,
  sku TEXT,
  item_name TEXT,
  variant_name TEXT,
  raw JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loyverse_inventory_cache (
  store_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  in_stock NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (store_id, variant_id)
);

ALTER TABLE loyalty_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_package_earn_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_point_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyverse_integration_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyverse_item_variants_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyverse_inventory_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role loyalty_members"
  ON loyalty_members FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role loyalty_package_earn_rules"
  ON loyalty_package_earn_rules FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role loyalty_point_events"
  ON loyalty_point_events FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role loyverse_integration_state"
  ON loyverse_integration_state FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role loyverse_item_variants_cache"
  ON loyverse_item_variants_cache FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role loyverse_inventory_cache"
  ON loyverse_inventory_cache FOR ALL USING (true) WITH CHECK (true);

-- After migration, register earn rules (replace UUIDs with your Loyverse variant or item IDs):
-- INSERT INTO loyalty_package_earn_rules (loyverse_variant_id, points_per_unit, label)
-- VALUES ('YOUR-1HR-VARIANT-ID', 3, '1 hour gaming package');
-- INSERT INTO loyalty_package_earn_rules (loyverse_variant_id, points_per_unit, label)
-- VALUES ('YOUR-2HR-VARIANT-ID', 5, '2 hour gaming package');
