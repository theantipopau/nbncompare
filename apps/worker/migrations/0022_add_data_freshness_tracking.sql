-- Add data freshness tracking
-- Enables showing "Last Updated X hours ago" badges

ALTER TABLE plans ADD COLUMN last_checked_at TEXT;
-- Timestamp when plan data was last verified from source

ALTER TABLE plans ADD COLUMN last_scraped_at TEXT;
-- Timestamp when plan was last scraped

ALTER TABLE plans ADD COLUMN is_stale INTEGER DEFAULT 0;
-- 1 if last_checked_at is > 7 days old

-- Index for finding stale data
CREATE INDEX IF NOT EXISTS idx_plans_freshness ON plans(last_checked_at, is_stale);

-- Update existing plans with current timestamp as baseline
UPDATE plans SET last_checked_at = datetime('now'), last_scraped_at = datetime('now')
WHERE last_checked_at IS NULL;

-- Create table for tracking data quality issues
CREATE TABLE IF NOT EXISTS data_quality_issues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id INTEGER NOT NULL,
  issue_type TEXT NOT NULL,
  -- 'missing_source_url', 'missing_price', 'missing_speed', 'stale_data', 'invalid_data'
  severity TEXT DEFAULT 'warning',
  -- 'info', 'warning', 'error', 'critical'
  description TEXT,
  detected_at TEXT,
  resolved_at TEXT,
  FOREIGN KEY(plan_id) REFERENCES plans(id)
);

CREATE INDEX IF NOT EXISTS idx_quality_issues_unresolved 
  ON data_quality_issues(plan_id, resolved_at);
