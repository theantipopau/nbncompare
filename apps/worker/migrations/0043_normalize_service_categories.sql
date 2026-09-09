-- Normalize service categories so the public filters can query the full catalogue.
-- Re-running is safe because updates are idempotent.

-- Fixed Wireless plans are NBN plans with a distinct technology type.
UPDATE plans
SET service_type = 'nbn', technology_type = 'fixed-wireless'
WHERE is_active = 1
  AND (
    LOWER(plan_name) LIKE '%fixed wireless%'
    OR LOWER(plan_name) LIKE '%fixed-wireless%'
    OR LOWER(plan_name) LIKE '%wireless broadband%'
    OR LOWER(plan_name) LIKE '%wireless home%'
    OR LOWER(plan_name) LIKE '%fw %'
    OR LOWER(plan_name) LIKE '% fw/%'
  );

-- 5G Home plans should be queryable independently of standard NBN plans.
UPDATE plans
SET service_type = '5g-home', technology_type = 'standard'
WHERE is_active = 1
  AND (
    LOWER(plan_name) LIKE '%5g home%'
    OR LOWER(plan_name) LIKE '%5g broadband%'
    OR LOWER(plan_name) LIKE '%5g internet%'
    OR LOWER(source_url) LIKE '%5g-home%'
    OR LOWER(source_url) LIKE '%5g-home-internet%'
  );

-- Satellite plans are also a separate consumer service category.
UPDATE plans
SET service_type = 'satellite', technology_type = 'satellite'
WHERE is_active = 1
  AND (
    LOWER(plan_name) LIKE '%satellite%'
    OR LOWER(plan_name) LIKE '%starlink%'
    OR LOWER(plan_name) LIKE '%skymuster%'
    OR LOWER(source_url) LIKE '%starlink%'
    OR LOWER(source_url) LIKE '%sky-muster%'
  );

CREATE INDEX IF NOT EXISTS idx_plans_active_service_technology
  ON plans(is_active, service_type, technology_type, speed_tier);
