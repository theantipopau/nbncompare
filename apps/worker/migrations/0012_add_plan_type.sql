-- Add plan_type column to differentiate residential vs business plans
-- Business plans typically include SLAs, static IPs, priority support, and higher reliability

ALTER TABLE plans ADD COLUMN plan_type TEXT DEFAULT 'residential' CHECK(plan_type IN ('residential', 'business'));

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_plans_plan_type ON plans(plan_type);

-- All existing plans are residential by default (already set by DEFAULT clause)
