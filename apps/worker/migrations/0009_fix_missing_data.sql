-- Fix missing speed_tier and upload_speed_mbps values

-- Amaysim NBN 750 plans should be 500 tier (closest match)
UPDATE plans SET speed_tier = 500, upload_speed_mbps = 50 WHERE id IN (173, 167);

-- Optus 5G Home 300 should have upload speed
UPDATE plans SET upload_speed_mbps = 50 WHERE id = 194;

-- SpinTel plan with empty name - need to check this one
-- Set a default speed based on other SpinTel plans
UPDATE plans SET speed_tier = 100, upload_speed_mbps = 20 WHERE id = 158 AND speed_tier IS NULL;

-- Starlink Priority 40GB - satellite with 150 tier
UPDATE plans SET upload_speed_mbps = 20 WHERE id = 198;
