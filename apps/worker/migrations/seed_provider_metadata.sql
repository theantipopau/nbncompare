-- Seed provider metadata with technical details for major Australian ISPs

-- Telstra (largest Australian telco)
UPDATE providers SET 
  ipv6_support = 1,
  cgnat = 1,
  cgnat_opt_out = 2, -- Paid opt-out available
  static_ip_available = 2, -- Paid addon
  australian_support = 2, -- 100% Australian call centers
  parent_company = 'Telstra Corporation',
  routing_info = 'Direct peering at major IXs, extensive domestic network',
  description = 'Australia''s largest telecommunications company',
  support_hours = '24/7'
WHERE slug = 'telstra';

-- Optus (second largest)
UPDATE providers SET 
  ipv6_support = 1,
  cgnat = 1,
  cgnat_opt_out = 1, -- Free opt-out available
  static_ip_available = 2, -- Paid addon
  australian_support = 1, -- Mixed Australian/overseas
  parent_company = 'Singtel (Singapore)',
  routing_info = 'Via Singapore to Equinix, domestic peering',
  description = 'Singapore-owned telco, second largest in Australia',
  support_hours = '24/7'
WHERE slug = 'optus';

-- TPG
UPDATE providers SET 
  ipv6_support = 1,
  cgnat = 1,
  cgnat_opt_out = 0, -- No opt-out available
  static_ip_available = 2, -- Paid addon
  australian_support = 1, -- Mixed
  parent_company = 'TPG Telecom',
  routing_info = 'Via Vocus/AAPT network, domestic IXs',
  description = 'Part of TPG Telecom merged entity',
  support_hours = '24/7'
WHERE slug = 'tpg';

-- Aussie Broadband (popular for gamers/power users)
UPDATE providers SET 
  ipv6_support = 1,
  cgnat = 0, -- No CGNAT - full public IPv4
  cgnat_opt_out = 0,
  static_ip_available = 1, -- Free static IP
  australian_support = 2, -- 100% Australian support
  parent_company = 'Aussie Broadband Ltd',
  routing_info = 'Direct peering at Equinix, IX Australia, low latency',
  description = 'Australian-owned ISP known for gaming performance',
  support_hours = '24/7 with Australian staff'
WHERE slug = 'aussie-broadband' OR slug = 'aussiebroadband';

-- iiNet (TPG owned)
UPDATE providers SET 
  ipv6_support = 1,
  cgnat = 1,
  cgnat_opt_out = 0,
  static_ip_available = 2,
  australian_support = 1,
  parent_company = 'TPG Telecom',
  routing_info = 'Via TPG/AAPT backbone',
  description = 'Long-standing Australian ISP now owned by TPG',
  support_hours = '24/7'
WHERE slug = 'iinet';

-- Vodafone
UPDATE providers SET 
  ipv6_support = 0, -- No IPv6 on fixed NBN
  cgnat = 1,
  cgnat_opt_out = 0,
  static_ip_available = 0,
  australian_support = 1,
  parent_company = 'TPG Telecom',
  routing_info = 'Via TPG Telecom network',
  description = 'Mobile-focused brand under TPG Telecom',
  support_hours = '24/7'
WHERE slug = 'vodafone';

-- Exetel
UPDATE providers SET 
  ipv6_support = 0,
  cgnat = 1,
  cgnat_opt_out = 1, -- Free opt-out
  static_ip_available = 1, -- Free static IP
  australian_support = 1,
  parent_company = 'Exetel Pty Ltd',
  routing_info = 'Wholesale Vocus network',
  description = 'Budget-focused ISP with barebones service',
  support_hours = 'Business hours (email support 24/7)'
WHERE slug = 'exetel';

-- Dodo
UPDATE providers SET 
  ipv6_support = 0,
  cgnat = 1,
  cgnat_opt_out = 0,
  static_ip_available = 0,
  australian_support = 0, -- Primarily offshore
  parent_company = 'Vocus Communications',
  routing_info = 'Vocus network backbone',
  description = 'Budget ISP owned by Vocus',
  support_hours = '24/7'
WHERE slug = 'dodo';

-- Superloop
UPDATE providers SET 
  ipv6_support = 1,
  cgnat = 0, -- No CGNAT
  cgnat_opt_out = 0,
  static_ip_available = 2, -- Paid addon
  australian_support = 2, -- Australian support
  parent_company = 'Superloop Ltd',
  routing_info = 'Own fibre network, direct peering',
  description = 'Infrastructure company with consumer NBN',
  support_hours = 'Business hours'
WHERE slug = 'superloop';

-- Spintel
UPDATE providers SET 
  ipv6_support = 0,
  cgnat = 1,
  cgnat_opt_out = 1, -- Free opt-out
  static_ip_available = 1, -- Free static IP
  australian_support = 2,
  parent_company = 'Spintel Pty Ltd',
  routing_info = 'Wholesale via Vocus',
  description = 'Adelaide-based independent ISP',
  support_hours = 'Business hours (extended)'
WHERE slug = 'spintel';

-- Mate
UPDATE providers SET 
  ipv6_support = 0,
  cgnat = 1,
  cgnat_opt_out = 1, -- Free opt-out available
  static_ip_available = 1, -- Free static IP
  australian_support = 1, -- Mixed
  parent_company = 'Owned by Vocus (via Symbio)',
  routing_info = 'Vocus network',
  description = 'Millennial-focused ISP with app-based management',
  support_hours = '24/7'
WHERE slug = 'mate';

-- Foxtel Broadband
UPDATE providers SET 
  ipv6_support = 0,
  cgnat = 1,
  cgnat_opt_out = 0,
  static_ip_available = 0,
  australian_support = 1,
  parent_company = 'News Corp/Telstra JV',
  routing_info = 'Via Telstra wholesale',
  description = 'Pay TV provider''s NBN offering',
  support_hours = '24/7'
WHERE slug = 'foxtel' OR slug = 'foxtel-broadband';

-- Kogan Internet
UPDATE providers SET 
  ipv6_support = 0,
  cgnat = 1,
  cgnat_opt_out = 0,
  static_ip_available = 0,
  australian_support = 0, -- Primarily offshore
  parent_company = 'Vodafone (reseller)',
  routing_info = 'Via Vodafone/TPG network',
  description = 'Online retailer''s NBN reseller service',
  support_hours = 'Email support only'
WHERE slug = 'kogan' OR slug = 'kogan-internet';
