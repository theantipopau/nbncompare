-- Migration: Add plan filter fields
-- Date: 2026-01-01
-- Description: Add contract_type, data_allowance, modem_included, and favicon_url fields

-- Add new columns to plans table
ALTER TABLE plans ADD COLUMN contract_type TEXT DEFAULT 'month-to-month';
ALTER TABLE plans ADD COLUMN data_allowance TEXT DEFAULT 'unlimited';
ALTER TABLE plans ADD COLUMN modem_included INTEGER DEFAULT 0;
ALTER TABLE plans ADD COLUMN price_history TEXT; -- JSON string of price changes

-- Add favicon_url to providers table
ALTER TABLE providers ADD COLUMN favicon_url TEXT;

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
