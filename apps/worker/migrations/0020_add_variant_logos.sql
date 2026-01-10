-- Add logos for business and 5G variants

UPDATE providers SET favicon_url = 'https://logo.clearbit.com/optus.com.au?size=128' WHERE slug = 'optus-5g';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/telstra.com.au?size=128' WHERE slug = 'telstra-5g';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/vodafone.com.au?size=128' WHERE slug = 'vodafone-5g';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/telstra.com.au?size=128' WHERE slug = 'telstra-business';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/tpg.com.au?size=128' WHERE slug = 'tpg-business';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/starlink.com?size=128' WHERE slug = 'starlink-business';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=swoop.com.au&sz=128' WHERE slug = 'swoop-business';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=telair.com.au&sz=128' WHERE slug = 'telair-business';
