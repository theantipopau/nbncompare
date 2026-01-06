-- Update upload speeds to match official NBN tier specifications
-- NBN upload speeds are standardized per tier

-- NBN 12 Basic: 1 Mbps upload
UPDATE plans SET upload_speed_mbps = 1 WHERE speed_tier = 12 AND upload_speed_mbps IS NULL;

-- NBN 25 Standard: 5-10 Mbps upload (standard is 5, some providers offer 10)
UPDATE plans SET upload_speed_mbps = 5 WHERE speed_tier = 25 AND upload_speed_mbps IS NULL;

-- NBN 50 Standard Plus: 20 Mbps upload
UPDATE plans SET upload_speed_mbps = 20 WHERE speed_tier = 50 AND upload_speed_mbps IS NULL;

-- NBN 100 Fast: 20 Mbps standard, 40 Mbps available on FTTP/HFC
UPDATE plans SET upload_speed_mbps = 20 WHERE speed_tier = 100 AND upload_speed_mbps IS NULL;

-- NBN 250 Superfast: 25 Mbps upload
UPDATE plans SET upload_speed_mbps = 25 WHERE speed_tier = 250 AND upload_speed_mbps IS NULL;

-- NBN 500 Ultrafast: 50 Mbps upload (requires FTTP or upgraded HFC)
UPDATE plans SET upload_speed_mbps = 50 WHERE speed_tier = 500 AND upload_speed_mbps IS NULL;

-- NBN 1000 Home Ultrafast: 50 Mbps upload
UPDATE plans SET upload_speed_mbps = 50 WHERE speed_tier = 1000 AND upload_speed_mbps IS NULL;

-- NBN 2000 2 Gigabit: 200 Mbps upload (FTTP only)
UPDATE plans SET upload_speed_mbps = 200 WHERE speed_tier = 2000 AND upload_speed_mbps IS NULL;

-- 5G Home typically has higher uploads
UPDATE plans SET upload_speed_mbps = 50 WHERE technology_type = '5g-home' AND upload_speed_mbps IS NULL;

-- Satellite plans
UPDATE plans SET upload_speed_mbps = 20 WHERE technology_type = 'satellite' AND upload_speed_mbps IS NULL;
