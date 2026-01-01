-- providers
CREATE TABLE IF NOT EXISTS providers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  canonical_url TEXT NOT NULL,
  active INTEGER DEFAULT 1,
  last_fetch_at TEXT,
  last_hash TEXT,
  last_error TEXT,
  needs_review INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- plans
CREATE TABLE IF NOT EXISTS plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider_id INTEGER NOT NULL REFERENCES providers(id),
  plan_name TEXT NOT NULL,
  speed_tier INTEGER,
  intro_price_cents INTEGER,
  intro_duration_days INTEGER,
  ongoing_price_cents INTEGER,
  min_term_days INTEGER,
  setup_fee_cents INTEGER,
  modem_cost_cents INTEGER,
  conditions_text TEXT,
  typical_evening_speed_mbps INTEGER,
  source_url TEXT,
  last_checked_at TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_plans_provider ON plans(provider_id);

-- plan_history
CREATE TABLE IF NOT EXISTS plan_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id INTEGER REFERENCES plans(id),
  captured_at TEXT DEFAULT (datetime('now')),
  snapshot_json TEXT
);

-- runs
CREATE TABLE IF NOT EXISTS runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT,
  finished_at TEXT,
  status TEXT,
  notes TEXT,
  providers_checked INTEGER,
  providers_changed INTEGER,
  plans_updated INTEGER
);
