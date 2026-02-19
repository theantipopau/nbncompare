-- Populate Promotional Offers for Existing Plans
-- Migration: 0035_populate_current_promotions.sql
-- Date: 2026-01-14
-- Note: These are representative January 2026 promotions based on common Australian ISP offers

-- Aussie Broadband Promos
UPDATE plans SET
  intro_price_cents = 6900,
  intro_duration_days = 180,
  promo_code = 'NEWSPEED'
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'aussiebroadband')
  AND speed_tier = 100
  AND ongoing_price_cents = 7900
  AND is_active = 1;

UPDATE plans SET
  intro_price_cents = 7900,
  intro_duration_days = 180
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'aussiebroadband')
  AND speed_tier = 250
  AND ongoing_price_cents = 8900
  AND is_active = 1;

-- Superloop Promotions
UPDATE plans SET
  intro_price_cents = 6490,
  intro_duration_days = 180,
  promo_code = 'SUPER100'
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'superloop')
  AND speed_tier = 100
  AND ongoing_price_cents = 7490
  AND is_active = 1;

UPDATE plans SET
  intro_price_cents = 8990,
  intro_duration_days = 180
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'superloop')
  AND speed_tier = 250
  AND ongoing_price_cents = 9990
  AND is_active = 1;

-- Tangerine Budget Deals
UPDATE plans SET
  intro_price_cents = 4990,
  intro_duration_days = 180
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'tangerine')
  AND speed_tier = 50
  AND is_active = 1;

UPDATE plans SET
  intro_price_cents = 5490,
  intro_duration_days = 180
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'tangerine')
  AND speed_tier = 100
  AND is_active = 1;

-- Mate/Flip Student Specials
UPDATE plans SET
  intro_price_cents = 5500,
  intro_duration_days = 90,
  promo_code = 'STUDENT'
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'mate')
  AND speed_tier = 100
  AND is_active = 1;

-- Belong (Telstra) Promos
UPDATE plans SET
  intro_price_cents = 6000,
  intro_duration_days = 180
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'belong')
  AND speed_tier = 100
  AND ongoing_price_cents = 6800
  AND is_active = 1;

-- Exetel Value Deals
UPDATE plans SET
  intro_price_cents = 5990,
  intro_duration_days = 180
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'exetel')
  AND speed_tier = 100
  AND is_active = 1;

UPDATE plans SET
  intro_price_cents = 6990,
  intro_duration_days = 180
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'exetel')
  AND speed_tier = 250
  AND is_active = 1;

-- Dodo Budget Promos
UPDATE plans SET
  intro_price_cents = 4990,
  intro_duration_days = 180,
  promo_code = 'DODO100'
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'dodo')
  AND speed_tier = 50
  AND is_active = 1;

UPDATE plans SET
  intro_price_cents = 5990,
  intro_duration_days = 180
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'dodo')
  AND speed_tier = 100
  AND is_active = 1;

-- TPG Promotions
UPDATE plans SET
  intro_price_cents = 6499,
  intro_duration_days = 180,
  promo_code = 'TPG100'
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'tpg')
  AND speed_tier = 100
  AND ongoing_price_cents = 7499
  AND is_active = 1;

-- iiNet Deals
UPDATE plans SET
  intro_price_cents = 6999,
  intro_duration_days = 180
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'iinet')
  AND speed_tier = 100
  AND ongoing_price_cents = 7999
  AND is_active = 1;

-- MyRepublic Gamer Deals
UPDATE plans SET
  intro_price_cents = 6990,
  intro_duration_days = 180,
  promo_code = 'GAMER'
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'myrepublic')
  AND speed_tier = 100
  AND is_active = 1;

UPDATE plans SET
  intro_price_cents = 8990,
  intro_duration_days = 180
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'myrepublic')
  AND speed_tier = 250
  AND is_active = 1;

-- Vodafone Bundle Offers
UPDATE plans SET
  intro_price_cents = 6500,
  intro_duration_days = 180,
  promo_code = 'BUNDLE'
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'vodafone')
  AND speed_tier = 100
  AND is_active = 1;

-- Optus Deals
UPDATE plans SET
  intro_price_cents = 7000,
  intro_duration_days = 180
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'optus')
  AND speed_tier = 100
  AND ongoing_price_cents = 8000
  AND is_active = 1;

-- SpinTel Promotions
UPDATE plans SET
  intro_price_cents = 5490,
  intro_duration_days = 180
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'spintel')
  AND speed_tier = 50
  AND is_active = 1;

UPDATE plans SET
  intro_price_cents = 6490,
  intro_duration_days = 180,
  promo_code = 'SPIN100'
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'spintel')
  AND speed_tier = 100
  AND is_active = 1;

-- Internode Quality Deals
UPDATE plans SET
  intro_price_cents = 7490,
  intro_duration_days = 180
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'internode')
  AND speed_tier = 100
  AND ongoing_price_cents = 8490
  AND is_active = 1;

-- Launtel (no intro pricing - daily pricing model)
-- Leaptel Tech Deals
UPDATE plans SET
  intro_price_cents = 6990,
  intro_duration_days = 90
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'leaptel')
  AND speed_tier = 100
  AND is_active = 1;

-- Kogan Budget Deals
UPDATE plans SET
  intro_price_cents = 5800,
  intro_duration_days = 180,
  promo_code = 'KOGANBB'
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'kogan')
  AND speed_tier = 100
  AND is_active = 1;

-- Amaysim Simple Deals
UPDATE plans SET
  intro_price_cents = 6000,
  intro_duration_days = 180
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'amaysim')
  AND speed_tier = 100
  AND is_active = 1;

-- Fixed Wireless & 5G Home Promos
UPDATE plans SET
  intro_price_cents = 5500,
  intro_duration_days = 180,
  promo_code = '5GHOME'
WHERE service_type = '5g-home'
  AND speed_tier >= 100
  AND ongoing_price_cents >= 6000
  AND intro_price_cents IS NULL
  AND is_active = 1;

-- Add promotional descriptions to provider table
UPDATE providers SET
  description = description || ' Current promo: $10 off for 6 months on NBN 100.'
WHERE slug IN ('aussiebroadband', 'superloop', 'exetel')
  AND description IS NOT NULL;

-- Mark promotions as recently updated
UPDATE plans SET
  updated_at = datetime('now')
WHERE intro_price_cents IS NOT NULL
  AND is_active = 1;

-- Create index for promo filtering
CREATE INDEX IF NOT EXISTS idx_plans_promo ON plans(intro_price_cents, intro_duration_days) WHERE is_active = 1;

