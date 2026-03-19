-- Migration 0038: Fix problem providers
-- Addresses "Too many subrequests" and stale 404 errors identified in audit

-- 1. Enable browser rendering for "Too many subrequests" providers
--    These providers' pages have too many sub-resources for a plain fetch
INSERT INTO provider_scrape_strategy (provider_slug, priority_tier, use_browser, timeout_ms, max_retries, notes)
VALUES
  ('buddy',        2, 1, 30000, 2, 'Uses heavy JS - needs browser rendering'),
  ('moretelecom',  2, 1, 30000, 2, 'Uses heavy JS - needs browser rendering'),
  ('onthenet',     2, 1, 30000, 2, 'Uses heavy JS - needs browser rendering'),
  ('southernphone',2, 1, 30000, 2, 'Uses heavy JS - needs browser rendering'),
  ('myrepublic',   3, 1, 30000, 2, 'HTTP 522 from CF - try browser; may need deactivation if AU ops shutdown')
ON CONFLICT(provider_slug) DO UPDATE SET
  use_browser    = excluded.use_browser,
  timeout_ms     = excluded.timeout_ms,
  max_retries    = excluded.max_retries,
  notes          = excluded.notes,
  updated_at     = datetime('now');

-- 2. Disable providers with confirmed bad URLs until they are manually corrected
--    mynetfone: /internet/nbn returns 404 (URL has changed)
--    optus-business: /business/broadband/nbn returns 404 (URL has moved)
INSERT INTO provider_scrape_strategy (provider_slug, priority_tier, use_browser, timeout_ms, enabled, notes)
VALUES
  ('mynetfone',     3, 0, 20000, 0, 'TODO: 404 - verify new URL at mynetfone.com.au'),
  ('optus-business',3, 0, 20000, 0, 'TODO: 404 - verify new URL at optus.com.au/business')
ON CONFLICT(provider_slug) DO UPDATE SET
  enabled    = excluded.enabled,
  notes      = excluded.notes,
  updated_at = datetime('now');

-- 3. Clear stale errors for launtel (canonical_url was already corrected from /residential-nbn to /residential/nbn)
UPDATE providers SET last_error = NULL, needs_review = 0
WHERE slug = 'launtel' AND last_error LIKE '%residential-nbn%';

-- 4. Seed strategies for providers that were originally missing from the strategy table
--    (catches any still using old defaults from the 0037 migration's secondary INSERT)
INSERT OR IGNORE INTO provider_scrape_strategy (provider_slug, priority_tier, use_browser, timeout_ms, max_retries)
SELECT slug, 2, 0, 20000, 3
FROM providers
WHERE active = 1 AND slug NOT IN (SELECT provider_slug FROM provider_scrape_strategy);
