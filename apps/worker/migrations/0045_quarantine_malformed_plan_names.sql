-- Quarantine records where the parser captured only an HTML tag or attribute.
UPDATE plans
SET is_active = 0,
    is_stale = 1,
    updated_at = datetime('now')
WHERE is_active = 1
  AND (
    TRIM(plan_name) = ''
    OR plan_name LIKE '<%'
    OR LOWER(plan_name) LIKE '%class=%'
    OR LOWER(plan_name) LIKE '%href=%'
  );