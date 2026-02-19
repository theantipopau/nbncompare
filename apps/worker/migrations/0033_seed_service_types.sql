-- Migration: 0033_seed_service_types.sql
-- Purpose: Ensure proper distribution of plans across service types
-- This migration tags existing plans and creates seed data for complete coverage
-- Date: 2026-01-14

-- First, let's mark all currently seeded NBN standard plans correctly
UPDATE plans SET 
  service_type = 'nbn',
  technology_type = CASE 
    WHEN plan_name LIKE '%Fixed Wireless%' THEN 'fixed-wireless'
    WHEN plan_name LIKE '%wireless%' THEN 'fixed-wireless'
    ELSE 'standard'
  END,
  plan_type = 'residential'
WHERE service_type IS NULL 
  AND is_active = 1
  AND provider_id IN (SELECT id FROM providers WHERE active = 1);

-- Ensure critical fields have values for existing plans
UPDATE plans SET 
  data_allowance = CASE 
    WHEN data_allowance IS NULL OR data_allowance = '' THEN 'unlimited'
    ELSE data_allowance
  END,
  contract_type = CASE 
    WHEN contract_type IS NULL OR contract_type = '' THEN 'month-to-month'
    ELSE contract_type
  END,
  modem_included = COALESCE(modem_included, 0),
  upload_speed_mbps = COALESCE(upload_speed_mbps, 
    CASE 
      WHEN speed_tier = 12 THEN 1
      WHEN speed_tier = 25 THEN 1
      WHEN speed_tier = 50 THEN 2
      WHEN speed_tier = 100 THEN 10
      WHEN speed_tier = 250 THEN 20
      WHEN speed_tier = 500 THEN 40
      WHEN speed_tier = 1000 THEN 50
      WHEN speed_tier = 2000 THEN 100
      ELSE 5
    END
  ),
  technology_type = COALESCE(NULLIF(technology_type, ''), 'standard')
WHERE is_active = 1;

-- Add marker for plans that should be shown in 5G view
-- These are typically marketed as 5G/Fixed Wireless alternatives
-- For now, we assume no providers in seed data specifically market 5G
-- This can be updated when 5G providers are added

-- Ensure provider metadata is set with sensible defaults
UPDATE providers SET 
  description = COALESCE(NULLIF(description, ''), name || ' NBN Provider'),
  support_hours = COALESCE(NULLIF(support_hours, ''), '24/7'),
  cgnat = COALESCE(cgnat, 1),
  cgnat_opt_out = COALESCE(cgnat_opt_out, 0),
  ipv6_support = COALESCE(ipv6_support, 1),
  australian_support = COALESCE(australian_support, 1),
  static_ip_available = COALESCE(static_ip_available, 0)
WHERE active = 1;

-- Create plan count statistics
-- This helps identify if seeding is complete
CREATE TABLE IF NOT EXISTS data_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  audit_date TEXT DEFAULT (datetime('now')),
  total_providers INTEGER,
  active_providers INTEGER,
  total_plans INTEGER,
  active_plans INTEGER,
  plans_with_intro INTEGER,
  plans_by_service_nbn INTEGER,
  plans_by_service_5g INTEGER,
  plans_by_service_satellite INTEGER,
  plans_by_service_fwl INTEGER,
  avg_plans_per_provider REAL,
  providers_with_favicon INTEGER
);

-- Insert audit baseline
INSERT INTO data_audit_log (
  total_providers,
  active_providers,
  total_plans,
  active_plans,
  plans_with_intro,
  plans_by_service_nbn,
  plans_by_service_5g,
  plans_by_service_satellite,
  plans_by_service_fwl,
  avg_plans_per_provider,
  providers_with_favicon
) VALUES (
  (SELECT COUNT(*) FROM providers),
  (SELECT COUNT(*) FROM providers WHERE active = 1),
  (SELECT COUNT(*) FROM plans),
  (SELECT COUNT(*) FROM plans WHERE is_active = 1),
  (SELECT COUNT(*) FROM plans WHERE is_active = 1 AND intro_price_cents IS NOT NULL),
  (SELECT COUNT(*) FROM plans WHERE is_active = 1 AND service_type = 'nbn'),
  (SELECT COUNT(*) FROM plans WHERE is_active = 1 AND service_type = '5g-home'),
  (SELECT COUNT(*) FROM plans WHERE is_active = 1 AND service_type = 'satellite'),
  (SELECT COUNT(*) FROM plans WHERE is_active = 1 AND service_type = 'nbn' AND technology_type = 'fixed-wireless'),
  (SELECT CAST(COUNT(*) AS REAL) / (SELECT COUNT(*) FROM providers WHERE active = 1) FROM plans WHERE is_active = 1),
  (SELECT COUNT(*) FROM providers WHERE active = 1 AND (favicon_url IS NOT NULL AND favicon_url != ''))
);
