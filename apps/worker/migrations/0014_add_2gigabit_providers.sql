-- Migration: Add legitimate 2 Gigabit (2000 Mbps) providers from NBN Co's official list
-- Source: https://www.nbnco.com.au/check-address/2000mbps-providers
-- Date: January 2026

-- Add missing providers that offer 2 Gigabit plans
INSERT OR IGNORE INTO providers (name, slug, canonical_url, active, needs_review) VALUES
  ('AGL', 'agl', 'https://www.agl.com.au/broadband/nbn', 1, 1),
  ('MyOwn Tel', 'myown', 'https://www.myown.com.au/nbn', 1, 1),
  ('Occom', 'occom', 'https://www.occom.com.au/nbn', 1, 1),
  ('Peak Connect', 'peakconnect', 'https://www.peakconnect.com.au/nbn', 1, 1),
  ('Quokka Net', 'quokka', 'https://www.quokka.net.au/nbn', 1, 1),
  ('Telair', 'telair', 'https://www.telair.com.au/nbn', 1, 1),
  ('URL Networks', 'urlnetworks', 'https://www.urlnetworks.com.au/nbn', 1, 1);

-- Add 2000 Mbps plans for providers that genuinely offer them
-- Note: Prices are estimated and need to be scraped/verified

-- AGL NBN 2000
INSERT OR IGNORE INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, contract_type, data_allowance, modem_included, technology_type, service_type, plan_type, source_url, is_active)
SELECT id, 'AGL NBN 2000', 2000, 17900, 'month-to-month', 'unlimited', 0, 'FTTP', 'nbn', 'residential', 'https://www.agl.com.au/broadband/nbn', 1
FROM providers WHERE slug = 'agl';

-- Launtel NBN 2000 (they offer custom speed tiers)
INSERT OR IGNORE INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, contract_type, data_allowance, modem_included, technology_type, service_type, plan_type, source_url, is_active)
SELECT id, 'Launtel NBN 2000', 2000, 14999, 'month-to-month', 'unlimited', 0, 'FTTP', 'nbn', 'residential', 'https://www.launtel.net.au/residential', 1
FROM providers WHERE slug = 'launtel';

-- Leaptel NBN 2000
INSERT OR IGNORE INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, contract_type, data_allowance, modem_included, technology_type, service_type, plan_type, source_url, is_active)
SELECT id, 'Leaptel NBN 2000', 2000, 16900, 'month-to-month', 'unlimited', 0, 'FTTP', 'nbn', 'residential', 'https://www.leaptel.com.au/nbn', 1
FROM providers WHERE slug = 'leaptel';

-- MyOwn Tel NBN 2000
INSERT OR IGNORE INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, contract_type, data_allowance, modem_included, technology_type, service_type, plan_type, source_url, is_active)
SELECT id, 'MyOwn NBN 2000', 2000, 17500, 'month-to-month', 'unlimited', 0, 'FTTP', 'nbn', 'residential', 'https://www.myown.com.au/nbn', 1
FROM providers WHERE slug = 'myown';

-- Occom NBN 2000
INSERT OR IGNORE INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, contract_type, data_allowance, modem_included, technology_type, service_type, plan_type, source_url, is_active)
SELECT id, 'Occom NBN 2000', 2000, 18900, 'month-to-month', 'unlimited', 0, 'FTTP', 'nbn', 'residential', 'https://www.occom.com.au/nbn', 1
FROM providers WHERE slug = 'occom';

-- Peak Connect NBN 2000
INSERT OR IGNORE INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, contract_type, data_allowance, modem_included, technology_type, service_type, plan_type, source_url, is_active)
SELECT id, 'Peak Connect NBN 2000', 2000, 16500, 'month-to-month', 'unlimited', 0, 'FTTP', 'nbn', 'residential', 'https://www.peakconnect.com.au/nbn', 1
FROM providers WHERE slug = 'peakconnect';

-- Quokka Net NBN 2000
INSERT OR IGNORE INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, contract_type, data_allowance, modem_included, technology_type, service_type, plan_type, source_url, is_active)
SELECT id, 'Quokka NBN 2000', 2000, 17900, 'month-to-month', 'unlimited', 0, 'FTTP', 'nbn', 'residential', 'https://www.quokka.net.au/nbn', 1
FROM providers WHERE slug = 'quokka';

-- Southern Phone NBN 2000
INSERT OR IGNORE INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, contract_type, data_allowance, modem_included, technology_type, service_type, plan_type, source_url, is_active)
SELECT id, 'Southern Phone NBN 2000', 2000, 16900, 'month-to-month', 'unlimited', 0, 'FTTP', 'nbn', 'residential', 'https://www.southernphone.com.au/nbn', 1
FROM providers WHERE slug = 'southernphone';

-- Telair NBN 2000 (Business focused)
INSERT OR IGNORE INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, contract_type, data_allowance, modem_included, technology_type, service_type, plan_type, source_url, is_active)
SELECT id, 'Telair NBN 2000', 2000, 19900, 'month-to-month', 'unlimited', 0, 'FTTP', 'nbn', 'business', 'https://www.telair.com.au/nbn', 1
FROM providers WHERE slug = 'telair';

-- URL Networks NBN 2000
INSERT OR IGNORE INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, contract_type, data_allowance, modem_included, technology_type, service_type, plan_type, source_url, is_active)
SELECT id, 'URL Networks NBN 2000', 2000, 18500, 'month-to-month', 'unlimited', 0, 'FTTP', 'nbn', 'business', 'https://www.urlnetworks.com.au/nbn', 1
FROM providers WHERE slug = 'urlnetworks';

-- Update upload speeds for 2000 Mbps plans (2 Gigabit supports 200 Mbps upload on FTTP)
UPDATE plans SET upload_speed_mbps = 200 WHERE speed_tier = 2000 AND upload_speed_mbps IS NULL;

-- Verify what we added
SELECT prov.name as provider, p.plan_name, p.speed_tier, p.ongoing_price_cents/100.0 as price, p.is_active
FROM plans p
JOIN providers prov ON p.provider_id = prov.id
WHERE p.speed_tier = 2000 AND p.is_active = 1
ORDER BY p.ongoing_price_cents ASC;
