-- Migration: Add comprehensive plan metadata for full comparison
-- Adds: contract terms, fees, bundled services, typical speeds, service type

-- Contract and fee information
ALTER TABLE plans ADD COLUMN min_term_months INTEGER DEFAULT 0;
ALTER TABLE plans ADD COLUMN exit_fee_cents INTEGER;
ALTER TABLE plans ADD COLUMN setup_fee_cents INTEGER;

-- ACCC typical evening speed
ALTER TABLE plans ADD COLUMN typical_evening_speed_mbps INTEGER;

-- Bundled services (JSON array: ["Stan", "Optus Sport", "Fetch TV"])
ALTER TABLE plans ADD COLUMN bundled_services TEXT;

-- Service type expansion: 'nbn', '5g-home', 'satellite', 'fixed-wireless-non-nbn'
ALTER TABLE plans ADD COLUMN service_type TEXT DEFAULT 'nbn';

-- Provider-level additions
ALTER TABLE providers ADD COLUMN provider_type TEXT DEFAULT 'nbn';
-- provider_type: 'nbn', '5g-home', 'satellite', 'mixed'

ALTER TABLE providers ADD COLUMN accc_speed_rating REAL;
-- ACCC quarterly speed compliance percentage (e.g., 98.5)

-- Business plan specific fields
ALTER TABLE plans ADD COLUMN sla_uptime_percent REAL;
ALTER TABLE plans ADD COLUMN priority_support INTEGER DEFAULT 0;
ALTER TABLE plans ADD COLUMN dedicated_account_manager INTEGER DEFAULT 0;

-- Index for service type filtering
CREATE INDEX IF NOT EXISTS idx_plans_service_type ON plans(service_type);
CREATE INDEX IF NOT EXISTS idx_providers_type ON providers(provider_type);
