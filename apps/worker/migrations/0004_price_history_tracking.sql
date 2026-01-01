-- Migration 0004: Price History Tracking
-- Adds trigger to automatically track price changes

-- Create trigger to track price changes when ongoing_price_cents changes
CREATE TRIGGER IF NOT EXISTS track_price_changes
AFTER UPDATE OF ongoing_price_cents ON plans
FOR EACH ROW
WHEN NEW.ongoing_price_cents IS NOT NULL AND (OLD.ongoing_price_cents IS NULL OR NEW.ongoing_price_cents != OLD.ongoing_price_cents)
BEGIN
  INSERT INTO price_history (plan_id, price_cents, recorded_at)
  VALUES (NEW.id, NEW.ongoing_price_cents, datetime('now'));
END;

-- Backfill current prices into price_history for all active plans
INSERT INTO price_history (plan_id, price_cents, recorded_at)
SELECT id, ongoing_price_cents, datetime('now')
FROM plans
WHERE is_active = 1 AND ongoing_price_cents IS NOT NULL
AND id NOT IN (SELECT DISTINCT plan_id FROM price_history);
