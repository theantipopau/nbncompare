-- Comprehensive provider metadata update based on research
-- IPv6 support: 0=no, 1=yes
-- CGNAT: 0=no CGNAT, 1=uses CGNAT
-- CGNAT opt-out: 0=no opt-out, 1=free opt-out, 2=paid opt-out
-- Static IP: 0=no, 1=free, 2=paid addon
-- Australian support: 0=offshore, 1=mixed, 2=100% Australian

-- iiNet (TPG owned)
UPDATE providers SET 
  ipv6_support = 1,
  cgnat = 1,
  cgnat_opt_out = 2,
  static_ip_available = 2,
  australian_support = 1,
  parent_company = 'TPG Telecom',
  routing_info = 'Via TPG/AAPT backbone',
  description = 'Long-standing Australian ISP now owned by TPG',
  support_hours = '24/7'
WHERE slug = 'iinet';

-- Internode (TPG owned)
UPDATE providers SET 
  ipv6_support = 1,
  cgnat = 1,
  cgnat_opt_out = 2,
  static_ip_available = 2,
  australian_support = 2,
  parent_company = 'TPG Telecom',
  routing_info = 'Via TPG/AAPT backbone',
  description = 'Premium Australian ISP known for technical support, owned by TPG',
  support_hours = '24/7'
WHERE slug = 'internode';

-- Belong (Telstra owned)
UPDATE providers SET 
  ipv6_support = 1,
  cgnat = 1,
  cgnat_opt_out = 0,
  static_ip_available = 0,
  australian_support = 1,
  parent_company = 'Telstra Corporation',
  routing_info = 'Via Telstra network',
  description = 'Budget brand owned by Telstra with digital-first service',
  support_hours = 'Chat support 7am-midnight AEST'
WHERE slug = 'belong';

-- Tangerine (Aussie Broadband owned)
UPDATE providers SET 
  ipv6_support = 1,
  cgnat = 0,
  cgnat_opt_out = 0,
  static_ip_available = 1,
  australian_support = 2,
  parent_company = 'Aussie Broadband Ltd',
  routing_info = 'Via Aussie Broadband network',
  description = 'Budget brand from Aussie Broadband with Australian support',
  support_hours = '24/7 Australian support'
WHERE slug = 'tangerine';

-- Skymesh (regional specialist)
UPDATE providers SET 
  ipv6_support = 1,
  cgnat = 0,
  cgnat_opt_out = 0,
  static_ip_available = 2,
  australian_support = 2,
  parent_company = 'Skymesh Pty Ltd',
  routing_info = 'Regional specialist with direct peering',
  description = 'Regional and satellite internet specialist with Australian support',
  support_hours = 'Business hours, extended'
WHERE slug = 'skymesh';

-- Southern Phone (regional)
UPDATE providers SET 
  ipv6_support = 0,
  cgnat = 1,
  cgnat_opt_out = 1,
  static_ip_available = 2,
  australian_support = 2,
  parent_company = 'Southern Phone Company',
  routing_info = 'Regional Victoria specialist',
  description = 'Victoria-based regional ISP with local support',
  support_hours = 'Business hours'
WHERE slug = 'southernphone';

-- MyNetFone/On the Net
UPDATE providers SET 
  ipv6_support = 0,
  cgnat = 1,
  cgnat_opt_out = 1,
  static_ip_available = 2,
  australian_support = 2,
  parent_company = 'MNF Group',
  routing_info = 'Via Vocus network',
  description = 'Australian ISP with VoIP focus',
  support_hours = 'Business hours'
WHERE slug = 'onthenet';

-- Westnet (TPG owned)
UPDATE providers SET 
  ipv6_support = 1,
  cgnat = 1,
  cgnat_opt_out = 2,
  static_ip_available = 2,
  australian_support = 1,
  parent_company = 'TPG Telecom',
  routing_info = 'Via TPG network',
  description = 'WA-based ISP now part of TPG Telecom',
  support_hours = '24/7'
WHERE slug = 'westnet';

-- Launtel (flexible pricing)
UPDATE providers SET 
  ipv6_support = 1,
  cgnat = 0,
  cgnat_opt_out = 0,
  static_ip_available = 1,
  australian_support = 2,
  parent_company = 'Launtel Pty Ltd',
  routing_info = 'Direct peering with low latency focus',
  description = 'Innovative ISP with flexible day-to-day pricing and Australian support',
  support_hours = 'Business hours'
WHERE slug = 'launtel';

-- Amaysim (Optus wholesale)
UPDATE providers SET 
  ipv6_support = 0,
  cgnat = 1,
  cgnat_opt_out = 0,
  static_ip_available = 0,
  australian_support = 0,
  parent_company = 'Optus (reseller)',
  routing_info = 'Via Optus wholesale',
  description = 'Online-only budget ISP using Optus network',
  support_hours = 'Online chat support'
WHERE slug = 'amaysim';

-- Kogan Internet (Vodafone wholesale)
UPDATE providers SET 
  ipv6_support = 0,
  cgnat = 1,
  cgnat_opt_out = 0,
  static_ip_available = 0,
  australian_support = 0,
  parent_company = 'Vodafone (reseller)',
  routing_info = 'Via Vodafone/TPG network',
  description = 'Online retailer budget NBN plans via Vodafone',
  support_hours = 'Email/chat only'
WHERE slug = 'kogan';

-- Moose Mobile (budget)
UPDATE providers SET 
  ipv6_support = 0,
  cgnat = 1,
  cgnat_opt_out = 0,
  static_ip_available = 0,
  australian_support = 0,
  parent_company = 'Moose Mobile',
  routing_info = 'Via wholesale provider',
  description = 'Budget mobile-first provider expanding to NBN',
  support_hours = 'Online support'
WHERE slug = 'moose-mobile';

-- Foxtel Broadband (Telstra wholesale)
UPDATE providers SET 
  ipv6_support = 0,
  cgnat = 1,
  cgnat_opt_out = 0,
  static_ip_available = 0,
  australian_support = 1,
  parent_company = 'News Corp/Telstra JV',
  routing_info = 'Via Telstra wholesale',
  description = 'Pay TV provider bundling NBN with entertainment',
  support_hours = '24/7'
WHERE slug = 'foxtel';

-- Activ8me (regional specialist)
UPDATE providers SET 
  ipv6_support = 0,
  cgnat = 1,
  cgnat_opt_out = 1,
  static_ip_available = 2,
  australian_support = 2,
  parent_company = 'Activ8me Pty Ltd',
  routing_info = 'Regional and rural specialist',
  description = 'Regional ISP specializing in rural and satellite internet',
  support_hours = 'Business hours'
WHERE slug = 'activ8me';

-- Harbour ISP (Sydney regional)
UPDATE providers SET 
  ipv6_support = 1,
  cgnat = 0,
  cgnat_opt_out = 0,
  static_ip_available = 1,
  australian_support = 2,
  parent_company = 'Harbour ISP Pty Ltd',
  routing_info = 'Sydney-based with direct peering',
  description = 'Sydney-based boutique ISP with premium support',
  support_hours = 'Business hours'
WHERE slug = 'harbourisp';

-- Buddy (budget)
UPDATE providers SET 
  ipv6_support = 0,
  cgnat = 1,
  cgnat_opt_out = 0,
  static_ip_available = 0,
  australian_support = 1,
  parent_company = 'Buddy Telco',
  routing_info = 'Via Vocus wholesale',
  description = 'Budget ISP with simple plans',
  support_hours = 'Online support'
WHERE slug = 'buddy';

-- Origin Broadband
UPDATE providers SET 
  ipv6_support = 0,
  cgnat = 1,
  cgnat_opt_out = 1,
  static_ip_available = 2,
  australian_support = 2,
  parent_company = 'Origin Broadband',
  routing_info = 'Australian network',
  description = 'Australian ISP with focus on reliability',
  support_hours = 'Business hours'
WHERE slug = 'origin';

-- Future Broadband
UPDATE providers SET 
  ipv6_support = 0,
  cgnat = 1,
  cgnat_opt_out = 1,
  static_ip_available = 1,
  australian_support = 2,
  parent_company = 'Future Broadband',
  routing_info = 'Via Vocus network',
  description = 'Australian ISP with competitive pricing',
  support_hours = 'Business hours'
WHERE slug = 'future';

-- Arctel
UPDATE providers SET 
  ipv6_support = 0,
  cgnat = 1,
  cgnat_opt_out = 1,
  static_ip_available = 2,
  australian_support = 2,
  parent_company = 'Arctel',
  routing_info = 'Australian network',
  description = 'Australian ISP provider',
  support_hours = 'Business hours'
WHERE slug = 'arctel';

-- Carbon Communications
UPDATE providers SET 
  ipv6_support = 0,
  cgnat = 1,
  cgnat_opt_out = 1,
  static_ip_available = 2,
  australian_support = 2,
  parent_company = 'Carbon Communications',
  routing_info = 'Via Vocus wholesale',
  description = 'Victorian ISP with local support',
  support_hours = 'Business hours'
WHERE slug = 'carboncomms';

-- Neptune
UPDATE providers SET 
  ipv6_support = 0,
  cgnat = 1,
  cgnat_opt_out = 0,
  static_ip_available = 0,
  australian_support = 1,
  parent_company = 'Neptune',
  routing_info = 'Wholesale provider',
  description = 'Budget ISP provider',
  support_hours = 'Online support'
WHERE slug = 'neptune';

-- Flip (Vocus owned)
UPDATE providers SET 
  ipv6_support = 0,
  cgnat = 1,
  cgnat_opt_out = 1,
  static_ip_available = 1,
  australian_support = 1,
  parent_company = 'Vocus Communications',
  routing_info = 'Via Vocus network',
  description = 'Digital-first ISP owned by Vocus',
  support_hours = 'Online support 24/7'
WHERE slug = 'flip';

-- More Telecom
UPDATE providers SET 
  ipv6_support = 0,
  cgnat = 1,
  cgnat_opt_out = 1,
  static_ip_available = 2,
  australian_support = 2,
  parent_company = 'More Telecom',
  routing_info = 'Australian network',
  description = 'Australian telecommunications provider',
  support_hours = 'Business hours'
WHERE slug = 'moretelecom';

-- Starlink (satellite)
UPDATE providers SET 
  ipv6_support = 1,
  cgnat = 1,
  cgnat_opt_out = 0,
  static_ip_available = 0,
  australian_support = 0,
  parent_company = 'SpaceX',
  routing_info = 'Low Earth Orbit satellite constellation',
  description = 'Global satellite internet service by SpaceX',
  support_hours = 'Online support only'
WHERE slug = 'starlink';

-- Starlink Business
UPDATE providers SET 
  ipv6_support = 1,
  cgnat = 1,
  cgnat_opt_out = 0,
  static_ip_available = 2,
  australian_support = 0,
  parent_company = 'SpaceX',
  routing_info = 'Low Earth Orbit satellite with business priority',
  description = 'SpaceX business satellite internet with higher speeds and priority',
  support_hours = 'Business support online'
WHERE slug = 'starlink-business';

-- Leaptel CGNAT fix (they do use CGNAT but offer opt-out)
UPDATE providers SET 
  cgnat = 1,
  cgnat_opt_out = 2
WHERE slug = 'leaptel';

-- Update all business variants to inherit from parent where metadata missing
UPDATE providers SET 
  ipv6_support = (SELECT ipv6_support FROM providers p2 WHERE p2.slug = REPLACE(providers.slug, '-business', '') LIMIT 1),
  cgnat = (SELECT cgnat FROM providers p2 WHERE p2.slug = REPLACE(providers.slug, '-business', '') LIMIT 1),
  cgnat_opt_out = (SELECT cgnat_opt_out FROM providers p2 WHERE p2.slug = REPLACE(providers.slug, '-business', '') LIMIT 1),
  static_ip_available = CASE WHEN static_ip_available = 0 THEN 2 ELSE static_ip_available END,
  australian_support = (SELECT australian_support FROM providers p2 WHERE p2.slug = REPLACE(providers.slug, '-business', '') LIMIT 1),
  parent_company = (SELECT parent_company FROM providers p2 WHERE p2.slug = REPLACE(providers.slug, '-business', '') LIMIT 1),
  routing_info = (SELECT routing_info FROM providers p2 WHERE p2.slug = REPLACE(providers.slug, '-business', '') LIMIT 1),
  description = (SELECT REPLACE(description, 'ISP', 'business ISP') FROM providers p2 WHERE p2.slug = REPLACE(providers.slug, '-business', '') LIMIT 1),
  support_hours = (SELECT support_hours FROM providers p2 WHERE p2.slug = REPLACE(providers.slug, '-business', '') LIMIT 1)
WHERE slug LIKE '%-business' AND description IS NULL;

-- Update 5G variants
UPDATE providers SET 
  ipv6_support = (SELECT ipv6_support FROM providers p2 WHERE p2.slug = REPLACE(providers.slug, '-5g', '') LIMIT 1),
  cgnat = 1,
  cgnat_opt_out = 0,
  static_ip_available = 0,
  australian_support = (SELECT australian_support FROM providers p2 WHERE p2.slug = REPLACE(providers.slug, '-5g', '') LIMIT 1),
  parent_company = (SELECT parent_company FROM providers p2 WHERE p2.slug = REPLACE(providers.slug, '-5g', '') LIMIT 1),
  routing_info = '5G wireless network',
  description = (SELECT parent_company FROM providers p2 WHERE p2.slug = REPLACE(providers.slug, '-5g', '') LIMIT 1) || ' 5G home wireless broadband',
  support_hours = (SELECT support_hours FROM providers p2 WHERE p2.slug = REPLACE(providers.slug, '-5g', '') LIMIT 1)
WHERE slug LIKE '%-5g' AND description IS NULL;
