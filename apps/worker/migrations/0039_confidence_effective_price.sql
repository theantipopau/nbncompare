-- Migration 0039: Add confidence score, effective monthly cost, and promo expiry to plans

-- confidence_score: 0.0-1.0 quality rating for extracted plan data
-- effective_monthly_cents: Year-1 average price (blending intro + ongoing periods)
-- promo_expires_at: ISO datetime when promotion ends (extracted from page when available)

ALTER TABLE plans ADD COLUMN confidence_score REAL DEFAULT NULL;
ALTER TABLE plans ADD COLUMN effective_monthly_cents INTEGER DEFAULT NULL;
ALTER TABLE plans ADD COLUMN promo_expires_at TEXT DEFAULT NULL;

-- Back-fill effective_monthly_cents for existing plans
-- If no intro price: effective = ongoing
-- If intro price + duration: blend over 12 months
UPDATE plans
SET effective_monthly_cents = CASE
  WHEN intro_price_cents IS NOT NULL AND intro_duration_days IS NOT NULL AND intro_duration_days > 0
  THEN CAST(ROUND(
    (intro_price_cents * MIN(CAST(intro_duration_days AS REAL) / 30.0, 12.0)
     + ongoing_price_cents * MAX(0.0, 12.0 - MIN(CAST(intro_duration_days AS REAL) / 30.0, 12.0)))
    / 12.0
  ) AS INTEGER)
  ELSE ongoing_price_cents
END
WHERE ongoing_price_cents IS NOT NULL;

-- Back-fill confidence_score for existing plans based on field completeness
UPDATE plans
SET confidence_score = ROUND(
  CASE WHEN ongoing_price_cents IS NOT NULL THEN 0.35 ELSE 0.0 END
  + CASE WHEN speed_tier IS NOT NULL THEN 0.25 ELSE 0.0 END
  + CASE WHEN upload_speed_mbps IS NOT NULL THEN 0.10 ELSE 0.0 END
  + CASE WHEN typical_evening_speed_mbps IS NOT NULL THEN 0.10 ELSE 0.0 END
  + CASE WHEN data_allowance IS NOT NULL THEN 0.05 ELSE 0.0 END
  + CASE WHEN contract_type IS NOT NULL THEN 0.05 ELSE 0.0 END
  + CASE WHEN conditions_text IS NOT NULL THEN 0.05 ELSE 0.0 END
  + CASE WHEN setup_fee_cents IS NOT NULL THEN 0.05 ELSE 0.0 END,
  2
);
