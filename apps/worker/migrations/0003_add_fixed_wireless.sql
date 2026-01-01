-- Migration 0003: Add Fixed Wireless NBN Support
-- This adds technology type and upload speed tracking to plans

-- Add new columns
ALTER TABLE plans ADD COLUMN technology_type TEXT DEFAULT 'standard';
ALTER TABLE plans ADD COLUMN upload_speed_mbps INTEGER;

-- Set default upload speeds for existing standard NBN plans
-- Standard NBN upload speeds by tier:
-- 25/50 Mbps = 20 Mbps upload
-- 100 Mbps = 40 Mbps upload
-- 250 Mbps = 50 Mbps upload
-- 1000 Mbps = 50 Mbps upload
-- 2000 Mbps = 100 Mbps upload

UPDATE plans SET upload_speed_mbps = 20 WHERE speed_tier IN (25, 50) AND upload_speed_mbps IS NULL;
UPDATE plans SET upload_speed_mbps = 40 WHERE speed_tier = 100 AND upload_speed_mbps IS NULL;
UPDATE plans SET upload_speed_mbps = 50 WHERE speed_tier IN (250, 1000) AND upload_speed_mbps IS NULL;
UPDATE plans SET upload_speed_mbps = 100 WHERE speed_tier = 2000 AND upload_speed_mbps IS NULL;

-- Create index for faster filtering by technology type
CREATE INDEX IF NOT EXISTS idx_plans_technology ON plans(technology_type);

-- Update existing plans to explicitly mark as standard NBN
UPDATE plans SET technology_type = 'standard' WHERE technology_type IS NULL OR technology_type = '';
