-- Fix Leaptel provider metadata (filters + tooltip)
UPDATE providers SET
  ipv6_support = 1,
  static_ip_available = 2, -- Static IP available (likely paid addon)
  australian_support = 2, -- 100% Australian support
  parent_company = 'Leaptel Pty Ltd',
  routing_info = 'Australian-based network with domestic peering',
  description = 'Australian-owned ISP known for strong support',
  support_hours = 'Business hours'
WHERE slug = 'leaptel';
