/**
 * Data Validation Report Script
 * Usage: wrangler d1 execute nbncompare -- < apps/worker/migrations/0032_audit_data.sql
 * Or run via handler: GET /internal/audit-data
 */

-- Get provider count by service type
SELECT 'PROVIDERS_BY_SERVICE_TYPE' as report_type, 
  COALESCE(active::text, 'unknown') as metric,
  COUNT(*) as count
FROM (
  SELECT CASE 
    WHEN active = 1 THEN 'active'
    WHEN active = 0 THEN 'inactive'
    ELSE 'unknown'
  END as active
  FROM providers
)
GROUP BY metric;

-- Get plan statistics
SELECT 'PLAN_COUNTS' as report_type,
  COUNT(*) as total_plans,
  SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_plans,
  SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_plans
FROM plans;

-- Get plans by service type
SELECT 'PLANS_BY_SERVICE_TYPE' as report_type,
  COALESCE(service_type, 'NULL') as service_type,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM plans WHERE is_active = 1), 1) as percent
FROM plans 
WHERE is_active = 1
GROUP BY service_type
ORDER BY count DESC;

-- Get plans by technology type
SELECT 'PLANS_BY_TECHNOLOGY' as report_type,
  COALESCE(technology_type, 'NULL') as technology_type,
  COUNT(*) as count
FROM plans
WHERE is_active = 1
GROUP BY technology_type
ORDER BY count DESC;

-- Check for plans missing critical fields
SELECT 'MISSING_FIELDS' as report_type,
  COUNT(*) as count,
  COUNT(CASE WHEN upload_speed_mbps IS NULL THEN 1 END) as missing_upload_speed,
  COUNT(CASE WHEN data_allowance IS NULL OR data_allowance = '' THEN 1 END) as missing_data_allowance,
  COUNT(CASE WHEN contract_type IS NULL OR contract_type = '' THEN 1 END) as missing_contract_type,
  COUNT(CASE WHEN modem_included IS NULL THEN 1 END) as missing_modem_flag,
  COUNT(CASE WHEN ongoing_price_cents IS NULL THEN 1 END) as missing_price,
  COUNT(CASE WHEN intro_price_cents IS NOT NULL AND intro_duration_days IS NULL THEN 1 END) as intro_without_duration
FROM plans
WHERE is_active = 1;

-- Get top 10 plans with intro pricing (deals)
SELECT 'TOP_DEALS_WITH_INTRO' as report_type,
  p.id,
  prov.name as provider,
  p.plan_name,
  p.speed_tier,
  ROUND(p.intro_price_cents / 100.0, 2) as intro_price_aud,
  ROUND(p.ongoing_price_cents / 100.0, 2) as ongoing_price_aud,
  ROUND(p.intro_duration_days / 30.0, 0) as intro_months,
  p.promo_code,
  p.promo_description
FROM plans p
JOIN providers prov ON p.provider_id = prov.id
WHERE p.is_active = 1 
  AND p.intro_price_cents IS NOT NULL
ORDER BY p.intro_price_cents ASC
LIMIT 10;

-- Count plans per provider
SELECT 'PLANS_PER_PROVIDER' as report_type,
  prov.name as provider,
  COUNT(*) as plan_count,
  SUM(CASE WHEN p.is_active = 1 THEN 1 ELSE 0 END) as active_count
FROM plans p
JOIN providers prov ON p.provider_id = prov.id
GROUP BY prov.name
ORDER BY active_count DESC;

-- Get plans missing favicon
SELECT 'MISSING_FAVICONS' as report_type,
  COUNT(*) as providers_without_favicon
FROM (
  SELECT DISTINCT p.provider_id
  FROM plans p
  JOIN providers prov ON p.provider_id = prov.id
  WHERE prov.favicon_url IS NULL OR prov.favicon_url = ''
  LIMIT 50
);

-- Check provider metadata coverage
SELECT 'PROVIDER_METADATA_COVERAGE' as report_type,
  COUNT(*) as total_providers,
  COUNT(CASE WHEN description IS NOT NULL AND description != '' THEN 1 END) as with_description,
  COUNT(CASE WHEN ipv6_support = 1 THEN 1 END) as with_ipv6,
  COUNT(CASE WHEN cgnat = 0 THEN 1 END) as no_cgnat,
  COUNT(CASE WHEN australian_support >= 1 THEN 1 END) as au_support,
  COUNT(CASE WHEN static_ip_available >= 1 THEN 1 END) as static_ip_available
FROM providers
WHERE active = 1;
