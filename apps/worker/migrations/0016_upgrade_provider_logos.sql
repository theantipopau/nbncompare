-- Migration: Update provider logos to use Clearbit high-res API
-- Clearbit provides 128x128 transparent PNG logos for better visual quality

-- Major providers - verified domains
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/telstra.com.au' WHERE slug = 'telstra';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/optus.com.au' WHERE slug = 'optus';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/tpg.com.au' WHERE slug = 'tpg';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/aussiebroadband.com.au' WHERE slug = 'aussiebroadband';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/iinet.net.au' WHERE slug = 'iinet';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/vodafone.com.au' WHERE slug = 'vodafone';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/dodo.com' WHERE slug = 'dodo';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/spintel.net.au' WHERE slug = 'spintel';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/belong.com.au' WHERE slug = 'belong';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/kogan.com' WHERE slug = 'kogan';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/myrepublic.net.au' WHERE slug = 'myrepublic';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/amaysim.com.au' WHERE slug = 'amaysim';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/superloop.com' WHERE slug = 'superloop';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/exetel.com.au' WHERE slug = 'exetel';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/southernphone.com.au' WHERE slug = 'southernphone';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/mate.com.au' WHERE slug = 'mate';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/foxtel.com.au' WHERE slug = 'foxtel';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/launtel.net.au' WHERE slug = 'launtel';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/leaptel.com.au' WHERE slug = 'leaptel';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/skymesh.com.au' WHERE slug = 'skymesh';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/tangerine.com.au' WHERE slug = 'tangerine';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/internode.on.net' WHERE slug = 'internode';

-- New 2 Gigabit providers
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/agl.com.au' WHERE slug = 'agl';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/myown.com.au' WHERE slug = 'myown';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/occom.com.au' WHERE slug = 'occom';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/peakconnect.com.au' WHERE slug = 'peakconnect';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/quokka.net.au' WHERE slug = 'quokka';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/telair.com.au' WHERE slug = 'telair';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/urlnetworks.com.au' WHERE slug = 'urlnetworks';

-- Verify update
SELECT name, favicon_url FROM providers WHERE active = 1 ORDER BY name LIMIT 10;
