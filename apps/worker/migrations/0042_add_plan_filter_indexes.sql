-- Add indexes for the most common plan filter combinations.
-- Keep the set small and aligned with /api/plans and /api/plans/paginated.

CREATE INDEX IF NOT EXISTS idx_plans_active_contract_filters
  ON plans(is_active, contract_type, data_allowance, modem_included);

CREATE INDEX IF NOT EXISTS idx_plans_active_technology_upload
  ON plans(is_active, technology_type, upload_speed_mbps);

CREATE INDEX IF NOT EXISTS idx_plans_active_service_type
  ON plans(is_active, service_type);