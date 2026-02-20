-- Migration: 0036_add_ai_summaries.sql
-- Purpose: Store AI-generated summaries for plans, providers, and best deals
-- Date: 2026-02-11

CREATE TABLE IF NOT EXISTS plan_ai_summaries (
  plan_id INTEGER PRIMARY KEY,
  summary TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS provider_ai_summaries (
  provider_id INTEGER PRIMARY KEY,
  summary TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS best_deals_summary (
  id INTEGER PRIMARY KEY,
  summary TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_run_log (
  id INTEGER PRIMARY KEY,
  run_type TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT,
  error TEXT
);

CREATE INDEX IF NOT EXISTS idx_plan_ai_summaries_updated_at ON plan_ai_summaries(updated_at);
CREATE INDEX IF NOT EXISTS idx_provider_ai_summaries_updated_at ON provider_ai_summaries(updated_at);
CREATE INDEX IF NOT EXISTS idx_ai_run_log_started_at ON ai_run_log(started_at);
