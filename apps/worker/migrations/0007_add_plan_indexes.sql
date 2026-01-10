-- Add indexes to speed common queries and upserts
-- Safe/non-breaking: no uniqueness constraints.

CREATE INDEX IF NOT EXISTS idx_plans_provider_plan_name
  ON plans(provider_id, plan_name);

CREATE INDEX IF NOT EXISTS idx_plans_active_speed
  ON plans(is_active, speed_tier);

CREATE INDEX IF NOT EXISTS idx_plans_speed_price
  ON plans(speed_tier, ongoing_price_cents);

CREATE INDEX IF NOT EXISTS idx_plans_active_filters_price
  ON plans(is_active, speed_tier, technology_type, ongoing_price_cents);
