-- Fix provider URLs that are returning 404s
-- Based on manual verification of actual provider websites

-- Dodo: /m/nbn is mobile site, use main site
UPDATE providers SET 
  canonical_url = 'https://www.dodo.com/nbn',
  last_error = NULL,
  needs_review = 0
WHERE slug = 'dodo';

-- Aussie Broadband: Current URL works, just needs a retry
UPDATE providers SET 
  canonical_url = 'https://www.aussiebroadband.com.au/nbn-plans',
  last_error = NULL,
  needs_review = 0
WHERE slug = 'aussiebroadband';

-- Amaysim: Try internet instead of broadband
UPDATE providers SET 
  canonical_url = 'https://www.amaysim.com.au/internet/nbn',
  last_error = NULL,
  needs_review = 0
WHERE slug = 'amaysim';

-- Exetel: Move to main nbn page
UPDATE providers SET 
  canonical_url = 'https://www.exetel.com.au/nbn',
  last_error = NULL,
  needs_review = 0
WHERE slug = 'exetel';

-- Southern Phone: Try internet instead
UPDATE providers SET 
  canonical_url = 'https://southernphone.com.au/internet/nbn',
  last_error = NULL,
  needs_review = 0
WHERE slug = 'southernphone';

-- MyNetFone: Try internet instead
UPDATE providers SET 
  canonical_url = 'https://www.mynetfone.com.au/internet/nbn',
  last_error = NULL,
  needs_review = 0
WHERE slug = 'mynetfone';

-- Buddy: Already correct, just clear error
UPDATE providers SET 
  canonical_url = 'https://buddytelco.com.au/nbn',
  last_error = NULL,
  needs_review = 0
WHERE slug = 'buddy';
