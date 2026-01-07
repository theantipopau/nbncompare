-- Migration: Deactivate unavailable 2000 Mbps (2 Gigabit) plans
-- Issue: User reported seeing 2000mbit plans from TPG, Optus, Dodo, Telstra that don't actually exist
-- Reality: NBN 2000 plans are extremely rare and most providers don't offer them
-- Only Aussie Broadband and a few specialist providers genuinely offer 2 Gigabit plans

-- Mark all 2000 Mbps plans as inactive EXCEPT legitimate providers from NBN Co's official list
-- Legitimate 2 Gigabit providers: Aussie Broadband, Superloop, Launtel, AGL, Leaptel, 
-- MyOwn Tel, Occom, Peak Connect, Quokka Net, Southern Phone, Telair, URL Networks
UPDATE plans 
SET is_active = 0
WHERE speed_tier = 2000 
  AND is_active = 1
  AND provider_id IN (
    SELECT id FROM providers 
    WHERE slug IN ('tpg', 'optus', 'dodo', 'telstra', 'iinet', 'vodafone', 'exetel', 'kogan', 'spintel', 'mate', 'internode', 'amaysim')
  );

-- Keep legitimate 2 Gigabit providers active (verified on NBN Co website)

-- Verify what we deactivated
SELECT p.name as provider, pl.plan_name, pl.speed_tier, pl.ongoing_price_cents/100.0 as price
FROM plans pl
JOIN providers p ON p.id = pl.provider_id
WHERE pl.speed_tier = 2000
ORDER BY pl.is_active DESC, pl.ongoing_price_cents ASC;
