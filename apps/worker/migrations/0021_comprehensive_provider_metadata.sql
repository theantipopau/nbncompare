-- Update logos to 128px and add comprehensive provider metadata

-- Fix remaining 64px logos to 128px
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=futurebroadband.com.au&sz=128' WHERE slug = 'futurebroadband';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=moosemobile.com.au&sz=128' WHERE slug = 'moosemobile';
UPDATE providers SET favicon_url = 'https://www.google.com/s2/favicons?domain=onthenet.com.au&sz=128' WHERE slug = 'onthenet';

-- Add missing descriptions for providers without them
UPDATE providers SET description = 'Major Australian telecommunications provider with extensive NBN coverage and premium support' WHERE slug = 'telstra' AND (description IS NULL OR description = '');
UPDATE providers SET description = 'Second largest telco in Australia offering NBN, mobile, and entertainment bundles' WHERE slug = 'optus' AND (description IS NULL OR description = '');
UPDATE providers SET description = 'Telstra-owned brand offering value NBN plans with reliable performance' WHERE slug = 'belong' AND (description IS NULL OR description = '');
UPDATE providers SET description = 'Popular Australian ISP known for excellent customer service and network quality' WHERE slug = 'aussiebroadband' AND (description IS NULL OR description = '');
UPDATE providers SET description = 'Budget-friendly NBN provider with straightforward pricing' WHERE slug = 'dodo' AND (description IS NULL OR description = '');
UPDATE providers SET description = 'Affordable NBN plans with competitive pricing and no lock-in contracts' WHERE slug = 'exetel' AND (description IS NULL OR description = '');
UPDATE providers SET description = 'Modern infrastructure provider with high-speed NBN plans' WHERE slug = 'superloop' AND (description IS NULL OR description = '');
UPDATE providers SET description = 'Budget NBN and mobile provider owned by Vodafone' WHERE slug = 'amaysim' AND (description IS NULL OR description = '');
UPDATE providers SET description = 'Flexible month-to-month NBN plans with day-by-day billing' WHERE slug = 'launtel' AND (description IS NULL OR description = '');
UPDATE providers SET description = 'Regional Australian ISP with strong customer focus' WHERE slug = 'leaptel' AND (description IS NULL OR description = '');
UPDATE providers SET description = 'Aussie-owned ISP specializing in rural and regional NBN' WHERE slug = 'skymesh' AND (description IS NULL OR description = '');
UPDATE providers SET description = 'Value-focused provider with simple, affordable NBN plans' WHERE slug = 'mate' AND (description IS NULL OR description = '');
UPDATE providers SET description = 'Energy company offering bundled NBN and electricity/gas services' WHERE slug = 'agl' AND (description IS NULL OR description = '');
UPDATE providers SET description = 'Energy provider with NBN plans and bundle discounts' WHERE slug = 'origin' AND (description IS NULL OR description = '');
UPDATE providers SET description = 'Budget retailer offering value NBN plans with no frills' WHERE slug = 'kogan' AND (description IS NULL OR description = '');
UPDATE providers SET description = 'Entertainment-focused NBN provider with streaming bundles' WHERE slug = 'foxtel' AND (description IS NULL OR description = '');
UPDATE providers SET description = 'Vodafone''s NBN brand offering competitive plans' WHERE slug = 'vodafone' AND (description IS NULL OR description = '');
UPDATE providers SET description = 'Veteran Australian ISP with technical expertise and quality support' WHERE slug = 'internode' AND (description IS NULL OR description = '');
UPDATE providers SET description = 'iiNet-owned brand offering value NBN plans' WHERE slug = 'iinet' AND (description IS NULL OR description = '');
UPDATE providers SET description = 'Business-focused NBN provider with enterprise solutions' WHERE slug = 'tpg' AND (description IS NULL OR description = '');
UPDATE providers SET description = 'Value NBN provider with straightforward plans' WHERE slug = 'tangerine' AND (description IS NULL OR description = '');
UPDATE providers SET description = 'SpinTel provides competitive NBN plans with good customer service' WHERE slug = 'spintel' AND (description IS NULL OR description = '');
UPDATE providers SET description = 'Carbon Communications offers eco-friendly NBN plans with great value' WHERE slug = 'carboncomms' AND (description IS NULL OR description = '');
UPDATE providers SET description = 'Buddy Telco provides simple, affordable NBN with Australian support' WHERE slug = 'buddy' AND (description IS NULL OR description = '');
UPDATE providers SET description = 'Future Broadband specializes in rural and regional NBN connectivity' WHERE slug = 'futurebroadband' AND (description IS NULL OR description = '');
UPDATE providers SET description = 'Neptune Internet offers reliable NBN plans with competitive pricing' WHERE slug = 'neptune' AND (description IS NULL OR description = '');
UPDATE providers SET description = 'Activ8me specializes in rural internet including SkyMuster satellite' WHERE slug = 'activ8me' AND (description IS NULL OR description = '');
UPDATE providers SET description = 'Arctel provides business-grade NBN with enterprise features' WHERE slug = 'arctel' AND (description IS NULL OR description = '');
UPDATE providers SET description = 'SpaceX''s satellite internet service offering global coverage' WHERE slug = 'starlink' AND (description IS NULL OR description = '');

-- Add support hours for major providers
UPDATE providers SET support_hours = '24/7' WHERE slug IN ('telstra', 'optus', 'aussiebroadband', 'superloop', 'launtel', 'starlink');
UPDATE providers SET support_hours = '8am-8pm AEST' WHERE slug IN ('belong', 'dodo', 'exetel', 'amaysim', 'mate', 'kogan', 'vodafone', 'tangerine');
UPDATE providers SET support_hours = '9am-9pm AEST' WHERE slug IN ('leaptel', 'skymesh', 'internode', 'iinet', 'tpg');
UPDATE providers SET support_hours = '9am-5pm AEST' WHERE slug IN ('agl', 'origin', 'foxtel', 'neptune', 'buddy', 'carboncomms', 'spintel');

-- Add parent company information
UPDATE providers SET parent_company = 'Telstra Corporation' WHERE slug IN ('telstra', 'belong', 'telstra-5g', 'telstra-business');
UPDATE providers SET parent_company = 'Singtel Optus' WHERE slug IN ('optus', 'optus-5g');
UPDATE providers SET parent_company = 'Vodafone Hutchison Australia' WHERE slug IN ('vodafone', 'vodafone-5g');
UPDATE providers SET parent_company = 'TPG Telecom' WHERE slug IN ('tpg', 'iinet', 'internode', 'tpg-business');
UPDATE providers SET parent_company = 'Vocus Communications' WHERE slug IN ('dodo', 'commander');
UPDATE providers SET parent_company = 'Kogan.com' WHERE slug = 'kogan';
UPDATE providers SET parent_company = 'Amaysim Australia' WHERE slug = 'amaysim';
UPDATE providers SET parent_company = 'Foxtel Group' WHERE slug = 'foxtel';
UPDATE providers SET parent_company = 'AGL Energy' WHERE slug = 'agl';
UPDATE providers SET parent_company = 'Origin Energy' WHERE slug = 'origin';
UPDATE providers SET parent_company = 'SpaceX' WHERE slug IN ('starlink', 'starlink-business');
