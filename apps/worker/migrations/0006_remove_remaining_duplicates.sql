-- Remove remaining duplicate plans, keeping the earliest created entry for each

-- Carbon NBN 1000 duplicates (keep earliest, remove 2 newer ones)
DELETE FROM price_history WHERE plan_id IN (
  SELECT id FROM plans 
  WHERE provider_id = 23 AND plan_name = 'Carbon NBN 1000' 
  AND id NOT IN (
    SELECT MIN(id) FROM plans 
    WHERE provider_id = 23 AND plan_name = 'Carbon NBN 1000' AND is_active = 1
  )
);

DELETE FROM plans WHERE provider_id = 23 AND plan_name = 'Carbon NBN 1000' 
AND id NOT IN (
  SELECT MIN(id) FROM plans 
  WHERE provider_id = 23 AND plan_name = 'Carbon NBN 1000' AND is_active = 1
);

-- Carbon NBN 250 duplicates (keep earliest, remove 2 newer ones)
DELETE FROM price_history WHERE plan_id IN (
  SELECT id FROM plans 
  WHERE provider_id = 23 AND plan_name = 'Carbon NBN 250' 
  AND id NOT IN (
    SELECT MIN(id) FROM plans 
    WHERE provider_id = 23 AND plan_name = 'Carbon NBN 250' AND is_active = 1
  )
);

DELETE FROM plans WHERE provider_id = 23 AND plan_name = 'Carbon NBN 250' 
AND id NOT IN (
  SELECT MIN(id) FROM plans 
  WHERE provider_id = 23 AND plan_name = 'Carbon NBN 250' AND is_active = 1
);

-- TPG NBN 1000 duplicates (keep earliest, remove 1 newer one)
DELETE FROM price_history WHERE plan_id IN (
  SELECT id FROM plans 
  WHERE provider_id = 3 AND plan_name = 'TPG NBN 1000' 
  AND id NOT IN (
    SELECT MIN(id) FROM plans 
    WHERE provider_id = 3 AND plan_name = 'TPG NBN 1000' AND is_active = 1
  )
);

DELETE FROM plans WHERE provider_id = 3 AND plan_name = 'TPG NBN 1000' 
AND id NOT IN (
  SELECT MIN(id) FROM plans 
  WHERE provider_id = 3 AND plan_name = 'TPG NBN 1000' AND is_active = 1
);

-- TPG NBN 2000 duplicates (keep earliest, remove 1 newer one)
DELETE FROM price_history WHERE plan_id IN (
  SELECT id FROM plans 
  WHERE provider_id = 3 AND plan_name = 'TPG NBN 2000' 
  AND id NOT IN (
    SELECT MIN(id) FROM plans 
    WHERE provider_id = 3 AND plan_name = 'TPG NBN 2000' AND is_active = 1
  )
);

DELETE FROM plans WHERE provider_id = 3 AND plan_name = 'TPG NBN 2000' 
AND id NOT IN (
  SELECT MIN(id) FROM plans 
  WHERE provider_id = 3 AND plan_name = 'TPG NBN 2000' AND is_active = 1
);

-- Aussie Broadband NBN 2000 duplicates (keep earliest, remove 1 newer one)
DELETE FROM price_history WHERE plan_id IN (
  SELECT id FROM plans 
  WHERE provider_id = 4 AND plan_name = 'Aussie Broadband NBN 2000' 
  AND id NOT IN (
    SELECT MIN(id) FROM plans 
    WHERE provider_id = 4 AND plan_name = 'Aussie Broadband NBN 2000' AND is_active = 1
  )
);

DELETE FROM plans WHERE provider_id = 4 AND plan_name = 'Aussie Broadband NBN 2000' 
AND id NOT IN (
  SELECT MIN(id) FROM plans 
  WHERE provider_id = 4 AND plan_name = 'Aussie Broadband NBN 2000' AND is_active = 1
);
