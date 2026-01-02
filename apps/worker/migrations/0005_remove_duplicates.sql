-- Migration 0005: Remove duplicate plans and fix bad data
-- Created: 2026-01-02

-- First, delete price_history entries for plans we're about to remove
DELETE FROM price_history WHERE plan_id IN (127, 131, 128, 132, 156, 157, 1);

-- Delete Carbon Communications duplicates (keep oldest: 123, 124)
DELETE FROM plans WHERE id IN (127, 131, 128, 132);

-- Delete bad Internode plans from scraper (incorrect names)
DELETE FROM plans WHERE id IN (156, 157);

-- Delete empty SpinTel plan
DELETE FROM plans WHERE id = 1 AND plan_name = '';

-- Verification query (run after migration)
-- SELECT plan_name, provider_name, COUNT(*) as count 
-- FROM plans p JOIN providers pr ON p.provider_id = pr.id 
-- WHERE p.is_active = 1 
-- GROUP BY plan_name, provider_name 
-- HAVING COUNT(*) > 1;
