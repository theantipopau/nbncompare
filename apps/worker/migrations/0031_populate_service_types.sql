-- Migration: 0031_populate_service_types.sql
-- Purpose: Ensure all plans have proper service_type and category assignments
-- Date: 2026-01-14

-- Ensure NBN standard plans are marked correctly
UPDATE plans SET service_type = 'nbn', technology_type = 'standard' 
WHERE service_type IS NULL OR service_type = '' 
AND plan_type != 'business';

-- Fixed Wireless NBN plans should be marked with correct technology and service type
-- These typically have lower caps and wireless technology
UPDATE plans SET 
  service_type = 'nbn',
  technology_type = 'fixed-wireless'
WHERE plan_name LIKE '%Fixed Wireless%' 
  OR plan_name LIKE '%wireless%'
  OR (technology_type = 'fixed-wireless' AND service_type != 'nbn');

-- Ensure business plans have business flag
UPDATE plans SET plan_type = 'business'
WHERE plan_name LIKE '%business%'
  OR plan_name LIKE '%enterprise%'
  OR provider_id IN (
    SELECT id FROM providers WHERE name LIKE '%Business%'
  );

-- Ensure default values for critical fields
UPDATE plans SET modem_included = 0 WHERE modem_included IS NULL;
UPDATE plans SET data_allowance = 'unlimited' WHERE data_allowance IS NULL OR data_allowance = '';
UPDATE plans SET contract_type = 'month-to-month' WHERE contract_type IS NULL OR contract_type = '';

-- Set default upload speeds based on download speed if missing
UPDATE plans SET upload_speed_mbps = 1 WHERE upload_speed_mbps IS NULL AND speed_tier = 12;
UPDATE plans SET upload_speed_mbps = 1 WHERE upload_speed_mbps IS NULL AND speed_tier = 25;
UPDATE plans SET upload_speed_mbps = 2 WHERE upload_speed_mbps IS NULL AND speed_tier = 50;
UPDATE plans SET upload_speed_mbps = 10 WHERE upload_speed_mbps IS NULL AND speed_tier = 100;
UPDATE plans SET upload_speed_mbps = 20 WHERE upload_speed_mbps IS NULL AND speed_tier = 250;
UPDATE plans SET upload_speed_mbps = 40 WHERE upload_speed_mbps IS NULL AND speed_tier = 500;
UPDATE plans SET upload_speed_mbps = 50 WHERE upload_speed_mbps IS NULL AND speed_tier = 1000;
UPDATE plans SET upload_speed_mbps = 100 WHERE upload_speed_mbps IS NULL AND speed_tier = 2000;

-- Ensure all plans marked inactive don't have NULL is_active
UPDATE plans SET is_active = 1 WHERE is_active IS NULL;

-- Set provider metadata defaults
UPDATE providers SET australian_support = 0 WHERE australian_support IS NULL;
UPDATE providers SET ipv6_support = 0 WHERE ipv6_support IS NULL;
UPDATE providers SET cgnat = 1 WHERE cgnat IS NULL;
UPDATE providers SET cgnat_opt_out = 0 WHERE cgnat_opt_out IS NULL;
UPDATE providers SET static_ip_available = 0 WHERE static_ip_available IS NULL;
