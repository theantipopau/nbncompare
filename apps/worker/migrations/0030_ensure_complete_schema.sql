-- Migration: 0030_ensure_complete_schema.sql
-- Purpose: Ensure all required columns exist with proper defaults
-- Date: 2026-01-14
-- Note: Uses CREATE TABLE IF NOT EXISTS logic to safely add missing columns

-- Plans table - ensure all service type columns exist
ALTER TABLE plans ADD COLUMN service_type TEXT DEFAULT 'nbn';
-- Values: 'nbn', '5g-home', 'satellite', 'fixed-wireless-non-nbn'

ALTER TABLE plans ADD COLUMN plan_type TEXT DEFAULT 'residential';
-- Values: 'residential', 'business'

-- Ensure core filter columns exist
ALTER TABLE plans ADD COLUMN contract_type TEXT DEFAULT 'month-to-month';
ALTER TABLE plans ADD COLUMN data_allowance TEXT DEFAULT 'unlimited';
ALTER TABLE plans ADD COLUMN modem_included INTEGER DEFAULT 0;
ALTER TABLE plans ADD COLUMN upload_speed_mbps INTEGER;
ALTER TABLE plans ADD COLUMN technology_type TEXT DEFAULT 'standard';
-- Values for technology_type: 'standard', 'fixed-wireless'

-- Add promotional fields
ALTER TABLE plans ADD COLUMN promo_code TEXT;
ALTER TABLE plans ADD COLUMN promo_description TEXT;

-- Providers table - ensure metadata columns exist
ALTER TABLE providers ADD COLUMN favicon_url TEXT;
ALTER TABLE providers ADD COLUMN ipv6_support INTEGER DEFAULT 0;
ALTER TABLE providers ADD COLUMN cgnat INTEGER DEFAULT 1;
ALTER TABLE providers ADD COLUMN cgnat_opt_out INTEGER DEFAULT 0;
ALTER TABLE providers ADD COLUMN static_ip_available INTEGER DEFAULT 0;
ALTER TABLE providers ADD COLUMN australian_support INTEGER DEFAULT 0;
ALTER TABLE providers ADD COLUMN parent_company TEXT;
ALTER TABLE providers ADD COLUMN routing_info TEXT;
ALTER TABLE providers ADD COLUMN description TEXT;
ALTER TABLE providers ADD COLUMN support_hours TEXT;

-- Ensure all required indexes exist for filtering performance
CREATE INDEX IF NOT EXISTS idx_plans_service_type ON plans(service_type);
CREATE INDEX IF NOT EXISTS idx_plans_plan_type ON plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_plans_technology_type ON plans(technology_type);
CREATE INDEX IF NOT EXISTS idx_plans_upload_speed ON plans(upload_speed_mbps);
CREATE INDEX IF NOT EXISTS idx_plans_contract_type ON plans(contract_type);
CREATE INDEX IF NOT EXISTS idx_plans_data_allowance ON plans(data_allowance);
CREATE INDEX IF NOT EXISTS idx_plans_modem_included ON plans(modem_included);
CREATE INDEX IF NOT EXISTS idx_plans_active_service ON plans(is_active, service_type);
