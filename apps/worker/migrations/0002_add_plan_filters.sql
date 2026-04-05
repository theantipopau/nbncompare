-- Migration: Add plan filter fields
-- Date: 2026-01-01
-- Description: Add contract_type, data_allowance, modem_included, and favicon_url fields
-- NOTE: These columns already exist in the schema (they were pre-applied)
-- This migration is now effectively a no-op to allow subsequent migrations to run

-- The following were already added to the schema before proper migration tracking:
-- ALTER TABLE plans ADD COLUMN contract_type TEXT DEFAULT 'month-to-month';
-- ALTER TABLE plans ADD COLUMN data_allowance TEXT DEFAULT 'unlimited';
-- ALTER TABLE plans ADD COLUMN modem_included INTEGER DEFAULT 0;
-- ALTER TABLE plans ADD COLUMN price_history TEXT;
-- ALTER TABLE providers ADD COLUMN favicon_url TEXT;

-- All necessary tables and columns exist - this migration does nothing
-- This allows the migration chain to continue to 0003+
SELECT 1;

-- Create price_history table for tracking
CREATE TABLE IF NOT EXISTS price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (plan_id) REFERENCES plans(id)
);

CREATE INDEX IF NOT EXISTS idx_price_history_plan ON price_history(plan_id);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(recorded_at);
