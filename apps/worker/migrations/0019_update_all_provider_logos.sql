-- Update all provider logos with high-quality sources
-- Priority: 1) Clearbit 128px 2) Google Favicon 128px 3) Direct favicon

-- Major providers with Clearbit support
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/telstra.com.au?size=128' WHERE slug = 'telstra';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/optus.com.au?size=128' WHERE slug = 'optus';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/tpg.com.au?size=128' WHERE slug = 'tpg';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/iinet.net.au?size=128' WHERE slug = 'iinet';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/aussiebroadband.com.au?size=128' WHERE slug = 'aussiebroadband';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/superloop.com?size=128' WHERE slug = 'superloop';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/exetel.com.au?size=128' WHERE slug = 'exetel';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/dodo.com?size=128' WHERE slug = 'dodo';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/belong.com.au?size=128' WHERE slug = 'belong';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/vodafone.com.au?size=128' WHERE slug = 'vodafone';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/kogan.com?size=128' WHERE slug = 'kogan';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/amaysim.com.au?size=128' WHERE slug = 'amaysim';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/foxtel.com.au?size=128' WHERE slug = 'foxtel';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/tangerine.com.au?size=128' WHERE slug = 'tangerine';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/spintel.net.au?size=128' WHERE slug = 'spintel';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/internode.on.net?size=128' WHERE slug = 'internode';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/agl.com.au?size=128' WHERE slug = 'agl';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/origin.com.au?size=128' WHERE slug = 'origin';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/aussiebroadband.com.au?size=128' WHERE slug = 'aussiebroadband-business';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/exetel.com.au?size=128' WHERE slug = 'exetel-business';

-- Smaller providers - Google's high-res favicon API (sz=128)
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=launtel.net.au&sz=128' WHERE slug = 'launtel';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=leaptel.com.au&sz=128' WHERE slug = 'leaptel';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=skymesh.net.au&sz=128' WHERE slug = 'skymesh';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=mate.com.au&sz=128' WHERE slug = 'mate';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=myrepublic.net.au&sz=128' WHERE slug = 'myrepublic';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=southern.com.au&sz=128' WHERE slug = 'southern-phone';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=uniti.com.au&sz=128' WHERE slug = 'uniti';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=futurebroadband.com.au&sz=128' WHERE slug = 'futurebroadband';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=buddy.com.au&sz=128' WHERE slug = 'buddy';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=activ8me.net.au&sz=128' WHERE slug = 'activ8me';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=harbourisp.com.au&sz=128' WHERE slug = 'harbourisp';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=clearnetworks.com.au&sz=128' WHERE slug = 'clearnetworks';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=flip.com.au&sz=128' WHERE slug = 'flip';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=ausbbs.net&sz=128' WHERE slug = 'ausbbs';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=westnet.com.au&sz=128' WHERE slug = 'westnet';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=moretelecom.com.au&sz=128' WHERE slug = 'moretelecom';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=arctel.com.au&sz=128' WHERE slug = 'arctel';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=carboncomms.com.au&sz=128' WHERE slug = 'carboncomms';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=swoop.com.au&sz=128' WHERE slug = 'swoop';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=symbio.global&sz=128' WHERE slug = 'symbio';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=pentanet.com.au&sz=128' WHERE slug = 'pentanet';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=lightning.net.au&sz=128' WHERE slug = 'lightning';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=opticomm.net.au&sz=128' WHERE slug = 'opticomm';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=nuskope.com.au&sz=128' WHERE slug = 'nuskope';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=node1.net.au&sz=128' WHERE slug = 'node1';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=numobile.com.au&sz=128' WHERE slug = 'numobile';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=spintel.com.au&sz=128' WHERE slug = 'spintel';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=neptune.net.au&sz=128' WHERE slug = 'neptune';

-- Starlink and Satellite providers
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/starlink.com?size=128' WHERE slug = 'starlink';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=nbnco.com.au&sz=128' WHERE slug = 'skymuster';

-- Business providers (use parent brand)
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/aussiebroadband.com.au?size=128' WHERE slug LIKE '%aussie%business%';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/exetel.com.au?size=128' WHERE slug LIKE '%exetel%business%';
UPDATE providers SET favicon_url = 'https://logo.clearbit.com/superloop.com?size=128' WHERE slug LIKE '%superloop%business%';
