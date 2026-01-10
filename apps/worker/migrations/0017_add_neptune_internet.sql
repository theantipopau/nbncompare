-- Add Neptune Internet provider
INSERT INTO providers (name, slug, canonical_url, active, favicon_url) VALUES 
('Neptune Internet', 'neptune', 'https://www.neptune.net.au', 1, 'https://logo.clearbit.com/neptune.net.au');

-- Add Neptune Internet NBN plans
-- Neptune is known for affordable no-contract plans
INSERT INTO plans (
  provider_id, plan_name, speed_tier, download_speed_mbps, upload_speed_mbps,
  ongoing_price_cents, contract_type, data_allowance, modem_included,
  technology_type, active, source_url
) VALUES
-- NBN 25
((SELECT id FROM providers WHERE slug = 'neptune'), 'NBN 25 Unlimited', 25, 25, 5, 5990, 'month-to-month', 'Unlimited', 0, 'nbn', 1, 'https://www.neptune.net.au/nbn'),
-- NBN 50
((SELECT id FROM providers WHERE slug = 'neptune'), 'NBN 50 Unlimited', 50, 50, 20, 6490, 'month-to-month', 'Unlimited', 0, 'nbn', 1, 'https://www.neptune.net.au/nbn'),
-- NBN 100
((SELECT id FROM providers WHERE slug = 'neptune'), 'NBN 100 Unlimited', 100, 100, 20, 7490, 'month-to-month', 'Unlimited', 0, 'nbn', 1, 'https://www.neptune.net.au/nbn'),
-- NBN 250
((SELECT id FROM providers WHERE slug = 'neptune'), 'NBN 250 Unlimited', 250, 250, 25, 9990, 'month-to-month', 'Unlimited', 0, 'nbn', 1, 'https://www.neptune.net.au/nbn'),
-- NBN 1000
((SELECT id FROM providers WHERE slug = 'neptune'), 'NBN 1000 Unlimited', 1000, 1000, 50, 11990, 'month-to-month', 'Unlimited', 0, 'nbn', 1, 'https://www.neptune.net.au/nbn');

-- Update provider metadata for Neptune
UPDATE providers SET
  description = 'Neptune Internet offers simple, affordable NBN plans with no lock-in contracts. Known for competitive pricing and straightforward terms.',
  ipv6_support = 1,
  cgnat = 1,
  cgnat_opt_out = 1,
  static_ip_available = 2,
  australian_support = 2,
  parent_company = 'Independent',
  support_hours = '9am-5pm AEST Monday-Friday'
WHERE slug = 'neptune';
