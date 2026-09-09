-- Remove legacy promotion labels where no duration or price difference proves a promotion.
UPDATE plans
SET intro_price_cents = NULL,
    intro_duration_days = NULL,
    updated_at = datetime('now')
WHERE is_active = 1
  AND intro_price_cents IS NOT NULL
  AND ongoing_price_cents IS NOT NULL
  AND intro_price_cents = ongoing_price_cents
  AND (intro_duration_days IS NULL OR intro_duration_days <= 0);