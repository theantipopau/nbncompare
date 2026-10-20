-- Sept 2025 NBN wholesale speed upgrade: correct upload-speed data.
-- What actually changed (FTTP/HFC wholesale profiles):
--   25: 5 (or 10 by tech) | 50: 20 | 100: 20 | 250: 25 | 500: 50
--   750: 50 (NEW tier, accelerated ex-250) | 1000: 50 -> 100 (doubled)
--   2000: 200 FTTP / 100 HFC (new tier)
-- NOTE: contrary to a common misconception, uploads did NOT rise on every
-- tier — 25/50/100/250/500 uploads are unchanged. The old parser fallback
-- map (50:2, 100:10, 250:20, 500:40, 1000:50) was stale long before Sept 2025.
--
-- Safety: only NULLs and values exactly matching the OLD hardcoded parser
-- fallback (provably stale artifacts) are touched. Genuine scraped values
-- are left for the scrapers to refresh. 2000/100 rows are left alone: HFC
-- 2000/100 is a real profile, indistinguishable from fallback artifacts.

-- 1. Wholesale-mandated: 1000/50 is no longer sold; uplift to 100.
UPDATE plans SET upload_speed_mbps = 100, updated_at = datetime('now')
WHERE speed_tier = 1000 AND upload_speed_mbps = 50;

-- 2. Correct stale fallback artifacts to current wholesale profiles.
UPDATE plans SET upload_speed_mbps = 5, updated_at = datetime('now')
WHERE speed_tier = 25 AND upload_speed_mbps = 1;

UPDATE plans SET upload_speed_mbps = 20, updated_at = datetime('now')
WHERE speed_tier = 50 AND upload_speed_mbps = 2;

UPDATE plans SET upload_speed_mbps = 20, updated_at = datetime('now')
WHERE speed_tier = 100 AND upload_speed_mbps = 10;

UPDATE plans SET upload_speed_mbps = 25, updated_at = datetime('now')
WHERE speed_tier = 250 AND upload_speed_mbps = 20;

UPDATE plans SET upload_speed_mbps = 50, updated_at = datetime('now')
WHERE speed_tier = 500 AND upload_speed_mbps = 40;

-- 3. Fill NULLs with current wholesale profiles (incl. new 750 tier).
UPDATE plans SET upload_speed_mbps = CASE speed_tier
  WHEN 12 THEN 1
  WHEN 25 THEN 5
  WHEN 50 THEN 20
  WHEN 100 THEN 20
  WHEN 200 THEN 20
  WHEN 250 THEN 25
  WHEN 400 THEN 40
  WHEN 500 THEN 50
  WHEN 750 THEN 50
  WHEN 1000 THEN 100
  WHEN 2000 THEN 200
  ELSE upload_speed_mbps
END, updated_at = datetime('now')
WHERE upload_speed_mbps IS NULL
  AND speed_tier IN (12, 25, 50, 100, 200, 250, 400, 500, 750, 1000, 2000);
