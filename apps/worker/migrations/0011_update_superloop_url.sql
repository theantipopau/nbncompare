-- Update Superloop URL to correct domain and path
UPDATE providers 
SET canonical_url = 'https://www.superloop.com/internet/nbn'
WHERE slug = 'superloop';
