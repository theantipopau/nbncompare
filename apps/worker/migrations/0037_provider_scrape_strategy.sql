-- Migration: 0037_provider_scrape_strategy.sql
-- Purpose: Adaptive provider refresh strategy to improve data freshness and reliability
-- Date: 2026-03-19

CREATE TABLE IF NOT EXISTS provider_scrape_strategy (
  provider_slug TEXT PRIMARY KEY,
  priority_tier INTEGER NOT NULL DEFAULT 2, -- 1=high, 2=normal, 3=low
  refresh_interval_minutes INTEGER NOT NULL DEFAULT 360,
  use_browser INTEGER NOT NULL DEFAULT 0,
  timeout_ms INTEGER NOT NULL DEFAULT 20000,
  max_retries INTEGER NOT NULL DEFAULT 3,
  enabled INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(provider_slug) REFERENCES providers(slug)
);

CREATE INDEX IF NOT EXISTS idx_provider_scrape_strategy_tier ON provider_scrape_strategy(priority_tier);
CREATE INDEX IF NOT EXISTS idx_provider_scrape_strategy_enabled ON provider_scrape_strategy(enabled);

-- Tier 1: highest market share / highest traffic providers (refresh every 120 minutes)
INSERT INTO provider_scrape_strategy (
  provider_slug, priority_tier, refresh_interval_minutes, use_browser, timeout_ms, max_retries, enabled, notes
) VALUES
  ('telstra', 1, 120, 1, 25000, 3, 1, 'Tier 1 - JS heavy / anti-bot'),
  ('optus', 1, 120, 1, 25000, 3, 1, 'Tier 1 - JS heavy / anti-bot'),
  ('tpg', 1, 120, 1, 25000, 3, 1, 'Tier 1 - JS heavy / anti-bot'),
  ('iinet', 1, 120, 1, 25000, 3, 1, 'Tier 1 - JS heavy / anti-bot'),
  ('aussiebroadband', 1, 120, 0, 20000, 3, 1, 'Tier 1 - high demand'),
  ('superloop', 1, 120, 1, 25000, 3, 1, 'Tier 1 - high demand')
ON CONFLICT(provider_slug) DO UPDATE SET
  priority_tier = excluded.priority_tier,
  refresh_interval_minutes = excluded.refresh_interval_minutes,
  use_browser = excluded.use_browser,
  timeout_ms = excluded.timeout_ms,
  max_retries = excluded.max_retries,
  enabled = excluded.enabled,
  notes = excluded.notes,
  updated_at = datetime('now');

-- Tier 2 defaults for known providers not explicitly configured
INSERT INTO provider_scrape_strategy (
  provider_slug, priority_tier, refresh_interval_minutes, use_browser, timeout_ms, max_retries, enabled, notes
)
SELECT slug, 2, 360, 0, 20000, 3, 1, 'Default adaptive strategy'
FROM providers
WHERE active = 1
  AND slug NOT IN (SELECT provider_slug FROM provider_scrape_strategy)
ON CONFLICT(provider_slug) DO NOTHING;
