-- Add 5G Home and Satellite plans

-- Telstra 5G Home plans
INSERT INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, contract_type, data_allowance, modem_included, service_type, source_url, is_active)
VALUES (64, '5G Home Broadband Essential', 100, 8500, 'month-to-month', 'unlimited', 1, '5g-home', 'https://www.telstra.com.au/internet/5g-home-internet', 1);

INSERT INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, contract_type, data_allowance, modem_included, service_type, source_url, is_active)
VALUES (64, '5G Home Broadband Speed Plus', 250, 9500, 'month-to-month', 'unlimited', 1, '5g-home', 'https://www.telstra.com.au/internet/5g-home-internet', 1);

-- Optus 5G Home plans
INSERT INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, contract_type, data_allowance, modem_included, service_type, source_url, is_active)
VALUES (65, 'Optus 5G Home Internet 300', 300, 6900, 'month-to-month', 'unlimited', 1, '5g-home', 'https://www.optus.com.au/fixed-wireless/5g-home-broadband', 1);

INSERT INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, contract_type, data_allowance, modem_included, service_type, source_url, is_active)
VALUES (65, 'Optus 5G Home Internet Turbo', 500, 7900, 'month-to-month', 'unlimited', 1, '5g-home', 'https://www.optus.com.au/fixed-wireless/5g-home-broadband', 1);

-- Vodafone 5G Home
INSERT INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, contract_type, data_allowance, modem_included, service_type, source_url, is_active)
VALUES (66, 'Vodafone 5G Home Broadband', 50, 6000, 'month-to-month', 'unlimited', 1, '5g-home', 'https://www.vodafone.com.au/nbn/5g-home-broadband', 1);

-- Starlink Residential
INSERT INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, contract_type, data_allowance, modem_included, service_type, source_url, is_active)
VALUES (67, 'Starlink Standard', 100, 13900, 'month-to-month', 'unlimited', 1, 'satellite', 'https://www.starlink.com/residential', 1);

INSERT INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, contract_type, data_allowance, modem_included, service_type, source_url, is_active)
VALUES (67, 'Starlink Priority 40GB', 150, 13900, 'month-to-month', '40GB priority', 0, 'satellite', 'https://www.starlink.com/residential', 1);

-- SkyMuster NBN Satellite
INSERT INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, contract_type, data_allowance, modem_included, service_type, source_url, is_active)
VALUES (68, 'SkyMuster Satellite 25', 25, 5800, 'month-to-month', '45GB peak', 0, 'satellite', 'https://www.nbnco.com.au/learn/sky-muster', 1);

INSERT INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, contract_type, data_allowance, modem_included, service_type, source_url, is_active)
VALUES (68, 'SkyMuster Satellite 50', 50, 7500, 'month-to-month', '100GB peak', 0, 'satellite', 'https://www.nbnco.com.au/learn/sky-muster', 1);

-- Starlink Business
INSERT INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, contract_type, data_allowance, modem_included, service_type, source_url, is_active)
VALUES (69, 'Starlink Business', 250, 37500, 'month-to-month', 'unlimited', 1, 'satellite', 'https://www.starlink.com/business', 1);
