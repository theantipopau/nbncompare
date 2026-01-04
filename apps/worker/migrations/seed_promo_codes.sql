-- Add sample promo codes to some plans for testing

-- Update a few Aussie Broadband plans with promo codes
UPDATE plans 
SET promo_code = 'SAVE20', 
    promo_description = '$20 off first month'
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'aussie-broadband' OR slug = 'aussiebroadband')
  AND speed_tier = 50
  AND is_active = 1
LIMIT 1;

-- Update a Telstra plan
UPDATE plans 
SET promo_code = 'TELSTRA50', 
    promo_description = '$50 off for 3 months'
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'telstra')
  AND speed_tier >= 100
  AND is_active = 1
LIMIT 1;

-- Update an Optus plan
UPDATE plans 
SET promo_code = 'OPTUS30', 
    promo_description = '$30 credit when you sign up'
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'optus')
  AND is_active = 1
LIMIT 1;

-- Update a TPG plan
UPDATE plans 
SET promo_code = 'TPG6MTHS', 
    promo_description = 'Half price for 6 months'
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'tpg')
  AND intro_price_cents IS NOT NULL
  AND is_active = 1
LIMIT 1;
