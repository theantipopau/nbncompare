-- Update source_url for plans where providers have changed URLs
UPDATE plans 
SET source_url = 'https://www.exetel.com.au/nbn'
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'exetel')
  AND source_url LIKE '%/broadband/plans/nbn%';

UPDATE plans 
SET source_url = 'https://www.dodo.com/nbn'
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'dodo')
  AND (source_url LIKE '%/m/nbn%' OR source_url IS NULL);

UPDATE plans 
SET source_url = 'https://www.aussiebroadband.com.au/nbn-plans'
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'aussiebroadband')
  AND (source_url LIKE '%/broadband/nbn%' OR source_url IS NULL);

UPDATE plans 
SET source_url = 'https://www.amaysim.com.au/internet/nbn'
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'amaysim')
  AND (source_url LIKE '%/broadband/nbn%' OR source_url IS NULL);

UPDATE plans 
SET source_url = 'https://southernphone.com.au/internet/nbn'
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'southernphone')
  AND source_url NOT LIKE '%/internet/nbn%';

UPDATE plans 
SET source_url = 'https://www.mynetfone.com.au/internet/nbn'
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'mynetfone')
  AND (source_url LIKE '%/broadband/nbn%' OR source_url IS NULL);

UPDATE plans 
SET source_url = 'https://buddytelco.com.au/nbn'
WHERE provider_id = (SELECT id FROM providers WHERE slug = 'buddy')
  AND source_url LIKE '%/internet/nbn%';
