-- Migration: 0024_add_parser_enhancement_fields.sql
-- Purpose: Add new fields extracted by Phase 1 parser enhancements
-- Created: 2026-01-11
-- Status: Ready to deploy

-- Add parser-extracted fields to plans table
ALTER TABLE plans ADD COLUMN upload_speed_mbps INTEGER;
-- ↑ Upload speed in Mbps (e.g., 10 for NBN 100)

ALTER TABLE plans ADD COLUMN data_allowance TEXT;
-- ↑ Data allowance: "Unlimited", "1TB", "500GB", etc. or NULL

ALTER TABLE plans ADD COLUMN contract_months INTEGER;
-- ↑ Contract term: 0 (month-to-month), 12, 24, or NULL

ALTER TABLE plans ADD COLUMN setup_fee_cents INTEGER DEFAULT 0;
-- ↑ Setup/connection fee in cents (0 if free)

ALTER TABLE plans ADD COLUMN modem_included BOOLEAN DEFAULT 1;
-- ↑ Whether modem/router is included in plan

ALTER TABLE plans ADD COLUMN modem_cost_cents INTEGER DEFAULT 0;
-- ↑ Cost of modem if not included (0 if included)

ALTER TABLE plans ADD COLUMN nbn_technology TEXT;
-- ↑ NBN type: FTTP, FTTC, FTTN, HFC, Fixed Wireless, etc.

-- Add metadata verification tracking columns
ALTER TABLE providers ADD COLUMN metadata_verified_date TEXT;
-- ↑ Date when provider metadata was last verified

ALTER TABLE providers ADD COLUMN metadata_verified_by TEXT;
-- ↑ Who verified the metadata (email/name)

ALTER TABLE providers ADD COLUMN metadata_source TEXT;
-- ↑ Source of metadata: "Seed", "Manual", "API", etc.

ALTER TABLE providers ADD COLUMN metadata_verification_status TEXT DEFAULT 'Pending';
-- ↑ Status: Verified, Pending, Outdated, Not Found

ALTER TABLE providers ADD COLUMN metadata_verification_notes TEXT;
-- ↑ Notes about verification (URLs checked, issues found, etc.)

-- Create verification history table
CREATE TABLE IF NOT EXISTS provider_metadata_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider_id INTEGER NOT NULL,
  verified_date TEXT NOT NULL,
  verified_by TEXT,
  cgnat INTEGER,           -- Previous value
  cgnat_new INTEGER,       -- New value
  ipv6_support INTEGER,
  ipv6_support_new INTEGER,
  australian_support INTEGER,
  australian_support_new INTEGER,
  static_ip_available INTEGER,
  static_ip_available_new INTEGER,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (provider_id) REFERENCES providers(id)
);

-- Create index for faster lookups
CREATE INDEX idx_providers_verification_status 
  ON providers(metadata_verification_status);

CREATE INDEX idx_plans_upload_speed 
  ON plans(upload_speed_mbps);

CREATE INDEX idx_plans_contract_months 
  ON plans(contract_months);
