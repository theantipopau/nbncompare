-- Create scraper runs log table
-- Tracks when scrapers run, what they update, and any errors

CREATE TABLE IF NOT EXISTS scraper_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  status TEXT DEFAULT 'running',
  -- 'running', 'success', 'partial', 'failed'
  providers_checked INTEGER DEFAULT 0,
  providers_changed INTEGER DEFAULT 0,
  plans_updated INTEGER DEFAULT 0,
  plans_added INTEGER DEFAULT 0,
  plans_removed INTEGER DEFAULT 0,
  errors_encountered INTEGER DEFAULT 0,
  error_log TEXT,
  -- JSON array of errors
  notes TEXT
);

-- Track which plans changed in each run
CREATE TABLE IF NOT EXISTS plan_change_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id INTEGER NOT NULL,
  plan_id INTEGER NOT NULL,
  change_type TEXT,
  -- 'price_changed', 'metadata_updated', 'added', 'deactivated'
  old_value TEXT,
  new_value TEXT,
  changed_at TEXT,
  FOREIGN KEY(run_id) REFERENCES scraper_runs(id),
  FOREIGN KEY(plan_id) REFERENCES plans(id)
);

-- Create index for querying recent runs
CREATE INDEX IF NOT EXISTS idx_scraper_runs_recent 
  ON scraper_runs(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_plan_change_log_run 
  ON plan_change_log(run_id);

-- Initialize first run record (optional)
INSERT INTO scraper_runs (started_at, status, notes)
VALUES (datetime('now'), 'scheduled', 'Daily scraper runs configured');
