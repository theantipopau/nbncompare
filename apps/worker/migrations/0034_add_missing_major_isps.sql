-- Add Missing Major Australian ISPs
-- Migration: 0034_add_missing_major_isps.sql
-- Date: 2026-01-14

-- Flip (formerly Mate) - Budget provider popular with students
INSERT OR IGNORE INTO providers (
  name, slug, canonical_url, active, favicon_url,
  ipv6_support, cgnat, cgnat_opt_out, static_ip_available,
  australian_support, description, support_hours
) VALUES (
  'Flip', 'flip', 'https://www.flip.com.au/nbn', 1,
  'https://www.flip.com.au/favicon.ico',
  0, 1, 0, 0,
  2, 'Budget NBN provider popular with students and cost-conscious users. Simple plans, no lock-in contracts.',
  'Mon-Fri 9am-6pm AEST'
);

-- Harbour ISP - Sydney-based with excellent reviews
INSERT OR IGNORE INTO providers (
  name, slug, canonical_url, active, favicon_url,
  ipv6_support, cgnat, cgnat_opt_out, static_ip_available,
  australian_support, description, support_hours
) VALUES (
  'Harbour ISP', 'harbour-isp', 'https://www.harbourisp.com.au/nbn', 1,
  'https://www.harbourisp.com.au/favicon.ico',
  1, 0, 1, 1,
  3, 'Sydney-based ISP with excellent customer service and technical support. No CGNAT, IPv6 support.',
  'Mon-Fri 9am-5:30pm AEST'
);

-- Activ8me - Rural and regional specialist
INSERT OR IGNORE INTO providers (
  name, slug, canonical_url, active, favicon_url,
  ipv6_support, cgnat, cgnat_opt_out, static_ip_available,
  australian_support, description, support_hours
) VALUES (
  'Activ8me', 'activ8me', 'https://www.activ8me.net.au/nbn', 1,
  'https://www.activ8me.net.au/favicon.ico',
  0, 1, 1, 1,
  3, 'Specialist in rural and regional internet. Offers satellite, fixed wireless and NBN plans.',
  'Mon-Fri 9am-5pm, Sat 9am-1pm AEST'
);

-- SkyMesh - Satellite and rural broadband specialist
INSERT OR IGNORE INTO providers (
  name, slug, canonical_url, active, favicon_url,
  ipv6_support, cgnat, cgnat_opt_out, static_ip_available,
  australian_support, description, support_hours
) VALUES (
  'SkyMesh', 'skymesh', 'https://www.skymesh.net.au/nbn', 1,
  'https://www.skymesh.net.au/favicon.ico',
  0, 1, 1, 1,
  3, 'Specializes in satellite and rural broadband solutions including NBN Sky Muster. Australian-owned.',
  'Mon-Fri 8am-6pm, Sat 9am-5pm AEST'
);

-- More Telecom - Budget NBN provider
INSERT OR IGNORE INTO providers (
  name, slug, canonical_url, active, favicon_url,
  ipv6_support, cgnat, cgnat_opt_out, static_ip_available,
  australian_support, description, support_hours
) VALUES (
  'More Telecom', 'more-telecom', 'https://www.more.com.au/internet/nbn', 1,
  'https://www.more.com.au/favicon.ico',
  0, 1, 0, 0,
  2, 'Budget-friendly NBN plans with no lock-in contracts. Good value for basic internet needs.',
  'Mon-Fri 9am-5pm AEST'
);

-- Uniti Wireless - Fixed wireless specialist (SA)
INSERT OR IGNORE INTO providers (
  name, slug, canonical_url, active, favicon_url,
  ipv6_support, cgnat, cgnat_opt_out, static_ip_available,
  australian_support, description, support_hours
) VALUES (
  'Uniti Wireless', 'uniti', 'https://www.unitiwireless.com/home-internet', 1,
  'https://www.unitiwireless.com/favicon.ico',
  1, 0, 1, 1,
  3, 'Fixed wireless specialist in South Australia. Ultra-fast speeds without NBN. Also offers NBN plans.',
  'Mon-Fri 9am-5pm ACST'
);

-- Clear Networks - NSW regional provider
INSERT OR IGNORE INTO providers (
  name, slug, canonical_url, active, favicon_url,
  ipv6_support, cgnat, cgnat_opt_out, static_ip_available,
  australian_support, description, support_hours
) VALUES (
  'Clear Networks', 'clear-networks', 'https://www.clearnetworks.com.au/home-internet', 1,
  'https://www.clearnetworks.com.au/favicon.ico',
  0, 1, 1, 1,
  3, 'Regional NSW provider offering NBN and fixed wireless. Strong focus on customer service.',
  'Mon-Fri 8:30am-5:30pm AEST'
);

-- Launtel - Dynamic pricing NBN provider
INSERT OR IGNORE INTO providers (
  name, slug, canonical_url, active, favicon_url,
  ipv6_support, cgnat, cgnat_opt_out, static_ip_available,
  australian_support, description, support_hours
) VALUES (
  'Launtel', 'launtel', 'https://www.launtel.net.au/', 1,
  'https://www.launtel.net.au/favicon.ico',
  1, 0, 1, 1,
  3, 'Unique dynamic pricing model. Change plans daily. No CGNAT, full IPv6, static IP available. Tech-savvy choice.',
  'Mon-Fri 9am-5pm AEST'
);

-- Leaptel - Technical users'' favorite
INSERT OR IGNORE INTO providers (
  name, slug, canonical_url, active, favicon_url,
  ipv6_support, cgnat, cgnat_opt_out, static_ip_available,
  australian_support, description, support_hours
) VALUES (
  'Leaptel', 'leaptel', 'https://www.leaptel.com.au/nbn', 1,
  'https://www.leaptel.com.au/favicon.ico',
  1, 0, 1, 1,
  3, 'Popular with technical users. IPv6, no CGNAT, static IPs. Excellent network performance.',
  'Mon-Fri 9am-5pm AEST'
);

-- Internode - Part of iiNet group
INSERT OR IGNORE INTO providers (
  name, slug, canonical_url, active, favicon_url,
  ipv6_support, cgnat, cgnat_opt_out, static_ip_available,
  australian_support, description, support_hours
) VALUES (
  'Internode', 'internode', 'https://www.internode.on.net/residential/nbn/', 1,
  'https://www.internode.on.net/favicon.ico',
  1, 0, 1, 1,
  3, 'Long-established Australian ISP (part of iiNet group). Known for technical expertise and good support.',
  'Mon-Fri 9am-9pm, Sat-Sun 10am-8pm AEST'
);

-- Tangerine Telecom - Budget provider
INSERT OR IGNORE INTO providers (
  name, slug, canonical_url, active, favicon_url,
  ipv6_support, cgnat, cgnat_opt_out, static_ip_available,
  australian_support, description, support_hours
) VALUES (
  'Tangerine', 'tangerine', 'https://www.tangerine.com.au/nbn', 1,
  'https://www.tangerine.com.au/favicon.ico',
  0, 1, 0, 0,
  2, 'Budget NBN provider with simple plans. Good value for basic internet users.',
  'Mon-Fri 9am-6pm AEST'
);

-- Origin Broadband (Energy company NBN)
INSERT OR IGNORE INTO providers (
  name, slug, canonical_url, active, favicon_url,
  ipv6_support, cgnat, cgnat_opt_out, static_ip_available,
  australian_support, description, support_hours
) VALUES (
  'Origin Energy', 'origin', 'https://www.originenergy.com.au/broadband/plans.html', 1,
  'https://www.originenergy.com.au/favicon.ico',
  0, 1, 0, 0,
  2, 'Energy company offering NBN plans. Bundle discounts available with electricity.',
  'Mon-Fri 8am-8pm, Sat-Sun 9am-5pm AEST'
);

-- Foxtel Broadband
INSERT OR IGNORE INTO providers (
  name, slug, canonical_url, active, favicon_url,
  ipv6_support, cgnat, cgnat_opt_out, static_ip_available,
  australian_support, description, support_hours
) VALUES (
  'Foxtel', 'foxtel', 'https://www.foxtel.com.au/broadband.html', 1,
  'https://www.foxtel.com.au/favicon.ico',
  0, 1, 0, 0,
  2, 'Foxtel''s NBN offering. Bundle with Foxtel TV for entertainment packages.',
  'Mon-Sun 8am-10pm AEST'
);

-- Pentanet - WA Fixed Wireless specialist
INSERT OR IGNORE INTO providers (
  name, slug, canonical_url, active, favicon_url,
  ipv6_support, cgnat, cgnat_opt_out, static_ip_available,
  australian_support, description, support_hours
) VALUES (
  'Pentanet', 'pentanet', 'https://www.pentanet.com.au/home-broadband', 1,
  'https://www.pentanet.com.au/favicon.ico',
  1, 0, 1, 1,
  3, 'Western Australian fixed wireless specialist. Ultra-low latency, gamers'' favorite.',
  'Mon-Fri 8:30am-5pm AWST'
);

-- Superloop (verify exists, add metadata)
UPDATE providers SET
  ipv6_support = 1,
  cgnat = 0,
  cgnat_opt_out = 1,
  static_ip_available = 1,
  australian_support = 3,
  description = 'Premium NBN provider focused on speed and reliability. No CGNAT, IPv6 support, excellent for gaming.',
  support_hours = 'Mon-Fri 9am-7pm, Sat-Sun 10am-6pm AEST'
WHERE slug = 'superloop';

-- Mate/Flip rebrand check
UPDATE providers SET
  description = 'Budget NBN provider (formerly Mate). Simple plans, no lock-in contracts, popular with students.',
  australian_support = 2,
  support_hours = 'Mon-Fri 9am-6pm AEST'
WHERE slug = 'mate';

