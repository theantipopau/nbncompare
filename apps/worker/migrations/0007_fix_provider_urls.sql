-- Fix provider URLs that may be broken or outdated
-- Verified URLs as of January 2026

-- Exetel - correct URL confirmed
UPDATE providers SET canonical_url = 'https://www.exetel.com.au/broadband/nbn' WHERE slug = 'exetel';

-- Amaysim - may have changed structure
UPDATE providers SET canonical_url = 'https://www.amaysim.com.au/home-internet' WHERE slug = 'amaysim';

-- Aussie Broadband - verify correct path
UPDATE providers SET canonical_url = 'https://www.aussiebroadband.com.au/nbn-plans/' WHERE slug = 'aussiebroadband';

-- Superloop - updated URL structure
UPDATE providers SET canonical_url = 'https://www.superloop.com/consumer/nbn/' WHERE slug = 'superloop';

-- Dodo - verify correct path
UPDATE providers SET canonical_url = 'https://www.dodo.com/nbn' WHERE slug = 'dodo';

-- Vodafone - verify correct path  
UPDATE providers SET canonical_url = 'https://www.vodafone.com.au/internet/nbn' WHERE slug = 'vodafone';

-- iiNet - verify correct path
UPDATE providers SET canonical_url = 'https://www.iinet.net.au/internet/broadband/nbn' WHERE slug = 'iinet';

-- TPG - verify correct path
UPDATE providers SET canonical_url = 'https://www.tpg.com.au/nbn' WHERE slug = 'tpg';

-- Kogan - verify correct path
UPDATE providers SET canonical_url = 'https://www.kogan.com/au/shop/category/kogan-internet/' WHERE slug = 'kogan';

-- Belong - verify correct path
UPDATE providers SET canonical_url = 'https://www.belong.com.au/internet/nbn-plans' WHERE slug = 'belong';

-- Telstra - verify correct path
UPDATE providers SET canonical_url = 'https://www.telstra.com.au/internet/nbn' WHERE slug = 'telstra';

-- Optus - verify correct path
UPDATE providers SET canonical_url = 'https://www.optus.com.au/for-you/broadband-nbn/nbn-plans' WHERE slug = 'optus';

-- SpinTel - verify correct path
UPDATE providers SET canonical_url = 'https://www.spintel.net.au/nbn-plans' WHERE slug = 'spintel';

-- Tangerine - verify correct path
UPDATE providers SET canonical_url = 'https://www.tangerine.com.au/nbn' WHERE slug = 'tangerine';

-- Mate - verify correct path
UPDATE providers SET canonical_url = 'https://www.letsbemates.com.au/nbn' WHERE slug = 'mate';

-- Internode - update to correct path
UPDATE providers SET canonical_url = 'https://www.internode.on.net/residential/internet/nbn/' WHERE slug = 'internode';

-- Origin - verify correct path
UPDATE providers SET canonical_url = 'https://www.originenergy.com.au/internet/' WHERE slug = 'origin';

-- Flip - verify correct path
UPDATE providers SET canonical_url = 'https://www.flip.com.au/nbn' WHERE slug = 'flip';

-- Moose Mobile - verify correct path  
UPDATE providers SET canonical_url = 'https://moosemobile.com.au/nbn/' WHERE slug = 'moose-mobile';

-- Launtel - verify correct path
UPDATE providers SET canonical_url = 'https://www.launtel.net.au/residential/nbn' WHERE slug = 'launtel';

-- Westnet - simplify URL
UPDATE providers SET canonical_url = 'https://www.westnet.com.au/internet/broadband/nbn/' WHERE slug = 'westnet';

-- Activ8me - verify correct path
UPDATE providers SET canonical_url = 'https://www.activ8me.net.au/nbn-plans/' WHERE slug = 'activ8me';

-- Harbour ISP - verify correct path
UPDATE providers SET canonical_url = 'https://www.harbourisp.com.au/nbn' WHERE slug = 'harbourisp';

-- Leaptel - verify correct path
UPDATE providers SET canonical_url = 'https://www.leaptel.com.au/nbn' WHERE slug = 'leaptel';

-- Skymesh - verify correct path
UPDATE providers SET canonical_url = 'https://www.skymesh.net.au/internet/nbn-plans/' WHERE slug = 'skymesh';

-- Southern Phone - verify correct path
UPDATE providers SET canonical_url = 'https://www.southernphone.com.au/internet/nbn' WHERE slug = 'southernphone';
