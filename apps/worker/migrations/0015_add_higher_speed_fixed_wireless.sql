-- Migration: Add higher speed Fixed Wireless plans (200 and 400 Mbps tiers)
-- Fixed Wireless Plus: 100 Mbps
-- Fixed Wireless Max: 200 Mbps (new in 2024)
-- Fixed Wireless Ultra: 400 Mbps (new in 2024)
-- Source: https://www.nbnco.com.au/support/network-status/fixed-wireless

-- Telstra Fixed Wireless 200 (Home Plus)
INSERT OR IGNORE INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, intro_price_cents, intro_duration_days, contract_type, data_allowance, modem_included, upload_speed_mbps, technology_type, service_type, plan_type, source_url, is_active)
SELECT id, 'Telstra Fixed Wireless Plus 200', 200, 11000, NULL, NULL, 'month-to-month', 'unlimited', 0, 20, 'fixed-wireless', 'nbn', 'residential', 'https://www.telstra.com.au/broadband/home-internet', 1
FROM providers WHERE slug = 'telstra';

-- Optus Fixed Wireless 200
INSERT OR IGNORE INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, intro_price_cents, intro_duration_days, contract_type, data_allowance, modem_included, upload_speed_mbps, technology_type, service_type, plan_type, source_url, is_active)
SELECT id, 'Optus Fixed Wireless Max 200', 200, 10000, NULL, NULL, 'month-to-month', 'unlimited', 0, 20, 'fixed-wireless', 'nbn', 'residential', 'https://www.optus.com.au/broadband/nbn', 1
FROM providers WHERE slug = 'optus';

-- Aussie Broadband Fixed Wireless 200
INSERT OR IGNORE INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, intro_price_cents, intro_duration_days, contract_type, data_allowance, modem_included, upload_speed_mbps, technology_type, service_type, plan_type, source_url, is_active)
SELECT id, 'Aussie Broadband FW 200/20', 200, 10900, NULL, NULL, 'month-to-month', 'unlimited', 0, 20, 'fixed-wireless', 'nbn', 'residential', 'https://www.aussiebroadband.com.au/nbn-plans/', 1
FROM providers WHERE slug = 'aussiebroadband';

-- Superloop Fixed Wireless 200
INSERT OR IGNORE INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, intro_price_cents, intro_duration_days, contract_type, data_allowance, modem_included, upload_speed_mbps, technology_type, service_type, plan_type, source_url, is_active)
SELECT id, 'Superloop FW Max 200/20', 200, 9995, NULL, NULL, 'month-to-month', 'unlimited', 0, 20, 'fixed-wireless', 'nbn', 'residential', 'https://www.superloop.com/nbn', 1
FROM providers WHERE slug = 'superloop';

-- Tangerine Fixed Wireless 200
INSERT OR IGNORE INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, intro_price_cents, intro_duration_days, contract_type, data_allowance, modem_included, upload_speed_mbps, technology_type, service_type, plan_type, source_url, is_active)
SELECT id, 'Tangerine FW 200/20', 200, 8990, NULL, NULL, 'month-to-month', 'unlimited', 0, 20, 'fixed-wireless', 'nbn', 'residential', 'https://www.tangerine.com.au/nbn', 1
FROM providers WHERE slug = 'tangerine';

-- TPG Fixed Wireless 200
INSERT OR IGNORE INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, intro_price_cents, intro_duration_days, contract_type, data_allowance, modem_included, upload_speed_mbps, technology_type, service_type, plan_type, source_url, is_active)
SELECT id, 'TPG Fixed Wireless 200/20', 200, 8999, NULL, NULL, 'month-to-month', 'unlimited', 0, 20, 'fixed-wireless', 'nbn', 'residential', 'https://www.tpg.com.au/nbn', 1
FROM providers WHERE slug = 'tpg';

-- ========== 400 Mbps Fixed Wireless Ultra ==========

-- Telstra Fixed Wireless 400 (Premium)
INSERT OR IGNORE INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, intro_price_cents, intro_duration_days, contract_type, data_allowance, modem_included, upload_speed_mbps, technology_type, service_type, plan_type, source_url, is_active)
SELECT id, 'Telstra Fixed Wireless Ultra 400', 400, 12500, NULL, NULL, 'month-to-month', 'unlimited', 0, 40, 'fixed-wireless', 'nbn', 'residential', 'https://www.telstra.com.au/broadband/home-internet', 1
FROM providers WHERE slug = 'telstra';

-- Optus Fixed Wireless 400
INSERT OR IGNORE INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, intro_price_cents, intro_duration_days, contract_type, data_allowance, modem_included, upload_speed_mbps, technology_type, service_type, plan_type, source_url, is_active)
SELECT id, 'Optus Fixed Wireless Ultra 400', 400, 11500, NULL, NULL, 'month-to-month', 'unlimited', 0, 40, 'fixed-wireless', 'nbn', 'residential', 'https://www.optus.com.au/broadband/nbn', 1
FROM providers WHERE slug = 'optus';

-- Aussie Broadband Fixed Wireless 400
INSERT OR IGNORE INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, intro_price_cents, intro_duration_days, contract_type, data_allowance, modem_included, upload_speed_mbps, technology_type, service_type, plan_type, source_url, is_active)
SELECT id, 'Aussie Broadband FW 400/40', 400, 11900, NULL, NULL, 'month-to-month', 'unlimited', 0, 40, 'fixed-wireless', 'nbn', 'residential', 'https://www.aussiebroadband.com.au/nbn-plans/', 1
FROM providers WHERE slug = 'aussiebroadband';

-- Superloop Fixed Wireless 400
INSERT OR IGNORE INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, intro_price_cents, intro_duration_days, contract_type, data_allowance, modem_included, upload_speed_mbps, technology_type, service_type, plan_type, source_url, is_active)
SELECT id, 'Superloop FW Ultra 400/40', 400, 10995, NULL, NULL, 'month-to-month', 'unlimited', 0, 40, 'fixed-wireless', 'nbn', 'residential', 'https://www.superloop.com/nbn', 1
FROM providers WHERE slug = 'superloop';

-- Verify what we added
SELECT prov.name as provider, p.plan_name, p.speed_tier, p.technology_type, p.ongoing_price_cents/100.0 as price
FROM plans p
JOIN providers prov ON p.provider_id = prov.id
WHERE p.technology_type = 'fixed-wireless' AND p.speed_tier IN (200, 400) AND p.is_active = 1
ORDER BY p.speed_tier, p.ongoing_price_cents;
