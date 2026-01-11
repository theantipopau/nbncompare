-- Migration: 0025_mark_metadata_verification_pending.sql
-- Purpose: Initialize metadata verification tracking
-- Created: 2026-01-11
-- Status: Ready to deploy

-- Mark all providers as pending verification
UPDATE providers SET 
  metadata_verification_status = 'Pending',
  metadata_verified_date = NULL,
  metadata_verified_by = NULL,
  metadata_source = 'Seed'
WHERE metadata_verification_status IS NULL;

-- Add verification notes for bulk providers
UPDATE providers SET metadata_verification_notes = 
  'Metadata from initial seed. Requires verification against provider website.'
WHERE metadata_verification_notes IS NULL;

-- Create view for verification dashboard
CREATE VIEW IF NOT EXISTS provider_verification_status AS
SELECT 
  p.id,
  p.name,
  p.slug,
  p.metadata_verification_status AS status,
  p.metadata_verified_date AS last_verified,
  p.metadata_verified_by AS verified_by,
  COUNT(pl.id) AS plan_count,
  CASE 
    WHEN p.metadata_verification_status = 'Verified' THEN '✅'
    WHEN p.metadata_verification_status = 'Pending' THEN '⏳'
    WHEN p.metadata_verification_status = 'Outdated' THEN '⚠️'
    ELSE '❓'
  END AS status_icon,
  CASE
    WHEN p.metadata_verified_date IS NULL THEN 'Never'
    ELSE datetime(p.metadata_verified_date, '+0 hours')
  END AS verified_display
FROM providers p
LEFT JOIN plans pl ON p.id = pl.provider_id
GROUP BY p.id, p.name, p.slug;

-- Create view for parser enhancement status
CREATE VIEW IF NOT EXISTS parser_enhancement_status AS
SELECT 
  p.slug AS provider,
  COUNT(pl.id) AS total_plans,
  COUNT(CASE WHEN pl.upload_speed_mbps IS NOT NULL THEN 1 END) AS has_upload_speed,
  COUNT(CASE WHEN pl.data_allowance IS NOT NULL THEN 1 END) AS has_data_allowance,
  COUNT(CASE WHEN pl.contract_months IS NOT NULL THEN 1 END) AS has_contract_months,
  COUNT(CASE WHEN pl.setup_fee_cents IS NOT NULL THEN 1 END) AS has_setup_fee,
  COUNT(CASE WHEN pl.modem_included IS NOT NULL THEN 1 END) AS has_modem_info,
  ROUND(
    (COUNT(CASE WHEN pl.upload_speed_mbps IS NOT NULL THEN 1 END) +
     COUNT(CASE WHEN pl.data_allowance IS NOT NULL THEN 1 END) +
     COUNT(CASE WHEN pl.contract_months IS NOT NULL THEN 1 END) +
     COUNT(CASE WHEN pl.setup_fee_cents IS NOT NULL THEN 1 END) +
     COUNT(CASE WHEN pl.modem_included IS NOT NULL THEN 1 END)) * 100.0 / 
    (COUNT(pl.id) * 5),
    0
  ) AS enhancement_percentage
FROM providers p
LEFT JOIN plans pl ON p.id = pl.provider_id
WHERE pl.id IS NOT NULL
GROUP BY p.slug
ORDER BY enhancement_percentage DESC;
