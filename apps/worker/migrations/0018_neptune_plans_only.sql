-- Add Neptune Internet plans (provider already exists as ID 63)
-- Using SELECT to get provider_id dynamically

INSERT INTO plans (provider_id, plan_name, speed_tier, upload_speed_mbps, ongoing_price_cents, contract_type, data_allowance, typical_evening_speed_mbps, modem_included, technology_type, source_url, is_active)
SELECT id, 'NBN 25', 25, 10, 5990, 'month-to-month', 'unlimited', 25, 0, 'standard', 'https://www.neptune.net.au/nbn-internet', 1
FROM providers WHERE slug = 'neptune';

INSERT INTO plans (provider_id, plan_name, speed_tier, upload_speed_mbps, ongoing_price_cents, contract_type, data_allowance, typical_evening_speed_mbps, modem_included, technology_type, source_url, is_active)
SELECT id, 'NBN 50', 50, 20, 6490, 'month-to-month', 'unlimited', 50, 0, 'standard', 'https://www.neptune.net.au/nbn-internet', 1
FROM providers WHERE slug = 'neptune';

INSERT INTO plans (provider_id, plan_name, speed_tier, upload_speed_mbps, ongoing_price_cents, contract_type, data_allowance, typical_evening_speed_mbps, modem_included, technology_type, source_url, is_active)
SELECT id, 'NBN 100', 100, 20, 7490, 'month-to-month', 'unlimited', 100, 0, 'standard', 'https://www.neptune.net.au/nbn-internet', 1
FROM providers WHERE slug = 'neptune';

INSERT INTO plans (provider_id, plan_name, speed_tier, upload_speed_mbps, ongoing_price_cents, contract_type, data_allowance, typical_evening_speed_mbps, modem_included, technology_type, source_url, is_active)
SELECT id, 'NBN 250', 250, 25, 9990, 'month-to-month', 'unlimited', 250, 0, 'standard', 'https://www.neptune.net.au/nbn-internet', 1
FROM providers WHERE slug = 'neptune';

INSERT INTO plans (provider_id, plan_name, speed_tier, upload_speed_mbps, ongoing_price_cents, contract_type, data_allowance, typical_evening_speed_mbps, modem_included, technology_type, source_url, is_active)
SELECT id, 'NBN 1000', 1000, 50, 11990, 'month-to-month', 'unlimited', 1000, 0, 'standard', 'https://www.neptune.net.au/nbn-internet', 1
FROM providers WHERE slug = 'neptune';
