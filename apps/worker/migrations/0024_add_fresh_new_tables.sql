-- Add missing columns to plans table
ALTER TABLE plans ADD COLUMN last_scraped_at TEXT;
ALTER TABLE plans ADD COLUMN is_stale INTEGER DEFAULT 0;

CREATE TABLE data_quality_issues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id INTEGER NOT NULL,
  issue_type TEXT NOT NULL CHECK(issue_type IN ('missing_source_url', 'missing_price', 'missing_speed', 'stale_data')),
  severity TEXT NOT NULL CHECK(severity IN ('info', 'warning', 'error', 'critical')),
  description TEXT,
  detected_at TEXT DEFAULT (datetime('now')),
  resolved_at TEXT,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);

CREATE INDEX idx_data_quality_plan ON data_quality_issues(plan_id);
CREATE INDEX idx_data_quality_type ON data_quality_issues(issue_type);

-- Create plan feedback table
CREATE TABLE plan_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id INTEGER NOT NULL,
  issue_type TEXT NOT NULL CHECK(issue_type IN ('wrong_price', 'wrong_speed', 'wrong_provider', 'missing_info', 'other')),
  description TEXT,
  user_email TEXT,
  resolved INTEGER DEFAULT 0,
  admin_notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);

CREATE INDEX idx_plan_feedback_plan ON plan_feedback(plan_id);
CREATE INDEX idx_plan_feedback_resolved ON plan_feedback(resolved);

-- Create scraper runs logging table
CREATE TABLE scraper_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  status TEXT CHECK(status IN ('running', 'success', 'partial', 'failed')),
  providers_checked INTEGER DEFAULT 0,
  providers_changed INTEGER DEFAULT 0,
  plans_updated INTEGER DEFAULT 0,
  plans_added INTEGER DEFAULT 0,
  plans_removed INTEGER DEFAULT 0,
  errors_encountered INTEGER DEFAULT 0,
  error_log TEXT,
  notes TEXT
);

CREATE INDEX idx_scraper_runs_status ON scraper_runs(status);
CREATE INDEX idx_scraper_runs_started ON scraper_runs(started_at);

-- Create plan change log table
CREATE TABLE plan_change_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id INTEGER NOT NULL,
  plan_id INTEGER NOT NULL,
  change_type TEXT NOT NULL CHECK(change_type IN ('price_changed', 'metadata_updated', 'added', 'deactivated')),
  old_value TEXT,
  new_value TEXT,
  changed_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (run_id) REFERENCES scraper_runs(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);

CREATE INDEX idx_plan_change_run ON plan_change_log(run_id);
CREATE INDEX idx_plan_change_plan ON plan_change_log(plan_id);
CREATE INDEX idx_plan_change_type ON plan_change_log(change_type);
