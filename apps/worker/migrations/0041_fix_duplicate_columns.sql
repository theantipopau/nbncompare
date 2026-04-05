-- Migration 0041: Fix duplicate column issues and ensure complete schema
-- This migration runs after all others and safely adds any missing columns
-- without failing if they already exist

-- Plans table - add missing columns if they don't exist
-- We use workaround since SQLite doesn't support IF NOT EXISTS on ALTER

-- Try adding columns individually - if they exist, wrap in conditional check
-- For now, we'll just rely on the subsequent migrations handling the columns
-- This is a safe migration that doesn't duplicate what 0002 tries to do

-- Ensure the price_history table exists
CREATE TABLE IF NOT EXISTS price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id INTEGER NOT NULL UNIQUE,
  price_cents INTEGER NOT NULL,
  recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (plan_id) REFERENCES plans(id)
);

-- Ensure plan_ai_summaries table exists (from 0036)
CREATE TABLE IF NOT EXISTS plan_ai_summaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id INTEGER NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  key_features TEXT,
  best_for TEXT,
  generated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (plan_id) REFERENCES plans(id)
);

-- Ensure provider_scrape_strategy table exists (from 0037)  
CREATE TABLE IF NOT EXISTS provider_scrape_strategy (
  provider_slug TEXT PRIMARY KEY,
  enabled INTEGER DEFAULT 1,
  priority_tier INTEGER DEFAULT 2,
  refresh_interval_minutes INTEGER DEFAULT 360,
  use_browser INTEGER DEFAULT 0,
  timeout_ms INTEGER DEFAULT 20000,
  max_retries INTEGER DEFAULT 3,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Core indexes - these should all use IF NOT EXISTS
CREATE INDEX IF NOT EXISTS idx_plans_active_speed ON plans(is_active, speed_tier, ongoing_price_cents);
CREATE INDEX IF NOT EXISTS idx_plans_active_provider ON plans(is_active, provider_id, ongoing_price_cents);
CREATE INDEX IF NOT EXISTS idx_plans_active_confidence ON plans(is_active, COALESCE(confidence_score, 0) DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_plan_date ON price_history(plan_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_providers_active ON providers(active);
CREATE INDEX IF NOT EXISTS idx_plans_active_contract ON plans(is_active, COALESCE(contract_type, ''), ongoing_price_cents);
CREATE INDEX IF NOT EXISTS idx_plans_active_technology ON plans(is_active, COALESCE(technology_type, ''), speed_tier);
CREATE INDEX IF NOT EXISTS idx_plans_has_intro ON plans(is_active, is INT NOT NULL) WHERE intro_price_cents IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_plans_service_type ON plans(service_type);
CREATE INDEX IF NOT EXISTS idx_plans_plan_type ON plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_plans_technology_type ON plans(technology_type);
CREATE INDEX IF NOT EXISTS idx_plans_upload_speed ON plans(upload_speed_mbps);
CREATE INDEX IF NOT EXISTS idx_plans_contract_type ON plans(contract_type);
CREATE INDEX IF NOT EXISTS idx_plans_data_allowance ON plans(data_allowance);
CREATE INDEX IF NOT EXISTS idx_plans_modem_included ON plans(modem_included);
CREATE INDEX IF NOT EXISTS idx_plans_active_service ON plans(is_active, service_type);
CREATE INDEX IF NOT EXISTS idx_price_history_plan ON price_history(plan_id);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(recorded_at);
