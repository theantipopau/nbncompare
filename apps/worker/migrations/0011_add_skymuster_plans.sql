-- Add SkyMuster satellite plans for Activ8me and Skymesh
-- SkyMuster is NBN's satellite service - 25/5 Mbps speeds typically

-- Get provider IDs
-- Activ8me plans
INSERT INTO plans (provider_id, plan_name, speed_tier, upload_speed_mbps, ongoing_price_cents, technology_type, source_url, is_active)
SELECT id, 'SkyMuster NBN Satellite Plus', 25, 5, 8900, 'satellite', 'https://www.activ8me.net.au/internet/skymuster', 1
FROM providers WHERE slug = 'activ8me';

INSERT INTO plans (provider_id, plan_name, speed_tier, upload_speed_mbps, ongoing_price_cents, technology_type, source_url, is_active)
SELECT id, 'SkyMuster NBN Satellite Standard', 25, 5, 7900, 'satellite', 'https://www.activ8me.net.au/internet/skymuster', 1
FROM providers WHERE slug = 'activ8me';

-- Skymesh plans
INSERT INTO plans (provider_id, plan_name, speed_tier, upload_speed_mbps, ongoing_price_cents, technology_type, source_url, is_active)
SELECT id, 'SkyMuster Plus Unlimited', 25, 5, 7490, 'satellite', 'https://www.skymesh.net.au/nbn-services/sky-muster', 1
FROM providers WHERE slug = 'skymesh';

INSERT INTO plans (provider_id, plan_name, speed_tier, upload_speed_mbps, ongoing_price_cents, technology_type, source_url, is_active)
SELECT id, 'SkyMuster Standard 150GB', 25, 5, 5990, 'satellite', 'https://www.skymesh.net.au/nbn-services/sky-muster', 1
FROM providers WHERE slug = 'skymesh';

-- Update SkyMuster provider info
UPDATE providers SET 
  description = 'NBN Co SkyMuster satellite service - provides internet to remote and rural Australia',
  support_hours = 'Varies by RSP',
  ipv6_support = 1
WHERE slug = 'skymuster';
