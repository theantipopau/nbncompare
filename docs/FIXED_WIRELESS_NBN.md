# Fixed Wireless NBN - Implementation Guide

## Overview
Fixed Wireless is a separate NBN technology type serving rural and regional areas where fibre or cable isn't available. It uses 4G/5G-style wireless towers to deliver internet to homes with a roof-mounted antenna.

## Key Differences from Standard NBN

### Technology Types
**Standard NBN:**
- FTTP (Fibre to the Premises)
- FTTC (Fibre to the Curb)
- FTTN (Fibre to the Node)
- FTTB (Fibre to the Building)
- HFC (Hybrid Fibre-Coaxial)

**Fixed Wireless NBN:**
- Fixed Wireless (FW)
- Satellite (Sky Muster) - different product entirely

### Speed Tiers Available

Fixed Wireless has **different speed tiers** than standard NBN:

| Tier | Download | Upload | Marketing Name |
|------|----------|--------|----------------|
| 25/5 | 25 Mbps | 5 Mbps | Home Fast |
| 50/20 | 50 Mbps | 20 Mbps | Home Superfast |
| 75/10 | 75 Mbps | 10 Mbps | Plus (some providers) |
| 100/20 | 100 Mbps | 20 Mbps | Home Ultrafast (limited availability) |

**Note:** The upload speeds differ significantly from standard NBN:
- Standard NBN 50 = 50/20
- Fixed Wireless 50 = 50/20 ✓ (same)
- Standard NBN 100 = 100/40
- Fixed Wireless 100 = 100/20 (lower upload)

### Pricing Differences
Fixed Wireless plans are typically:
- **$5-10/month cheaper** than equivalent fibre plans
- Subject to network congestion during peak times
- May have Fair Use Policies on some providers

## Implementation in Database

### Option 1: Separate Service Type Field
```sql
ALTER TABLE plans ADD COLUMN service_type TEXT DEFAULT 'standard';
-- Values: 'standard', 'fixed-wireless', 'satellite'

-- Update existing plans
UPDATE plans SET service_type = 'standard' WHERE service_type IS NULL;
```

### Option 2: Use Speed Tier with Suffix
```sql
-- Use speed_tier as integer but add notes:
-- 251 = Fixed Wireless 25/5
-- 501 = Fixed Wireless 50/20
-- 1001 = Fixed Wireless 100/20

-- Or add upload_speed_mbps field
ALTER TABLE plans ADD COLUMN upload_speed_mbps INTEGER;
```

### Option 3: Recommended - Separate Technology Column
```sql
ALTER TABLE plans ADD COLUMN technology_type TEXT DEFAULT 'FTTP/FTTC/HFC';
-- Values: 'FTTP', 'FTTC', 'FTTN', 'HFC', 'Fixed Wireless', 'Satellite'

ALTER TABLE plans ADD COLUMN upload_speed_mbps INTEGER;
```

## Provider Coverage

### Providers Offering Fixed Wireless Plans
Most major providers offer Fixed Wireless in eligible areas:
- ✅ Telstra
- ✅ Optus  
- ✅ TPG
- ✅ iiNet
- ✅ Aussie Broadband
- ✅ Superloop
- ✅ Exetel
- ✅ Mate
- ✅ Tangerine
- ✅ MyRepublic
- ✅ Launtel

## UI Considerations

### Filter Updates
Add technology filter:
```tsx
<select value={technologyFilter} onChange={e => setTechnologyFilter(e.target.value)}>
  <option value="">All Technologies</option>
  <option value="standard">Standard NBN (Fibre/HFC)</option>
  <option value="fixed-wireless">Fixed Wireless</option>
  <option value="satellite">Satellite</option>
</select>
```

### Display Badges
```tsx
{plan.technology_type === 'Fixed Wireless' && (
  <span className="tech-badge">📡 Fixed Wireless</span>
)}
```

### Speed Display
Show upload speed for Fixed Wireless:
```tsx
{plan.technology_type === 'Fixed Wireless' ? (
  <span>{plan.speed_tier}/{plan.upload_speed_mbps} Mbps</span>
) : (
  <span>{plan.speed_tier} Mbps</span>
)}
```

## Sample Plans

### Telstra Fixed Wireless
- NBN 25/5: $75/mo (vs $80/mo standard)
- NBN 50/20: $85/mo (vs $90/mo standard)
- NBN 100/20: $100/mo (vs $115/mo standard)

### Aussie Broadband Fixed Wireless
- NBN 25/5: $59/mo
- NBN 50/20: $79/mo
- NBN 100/20: $99/mo

### Exetel Fixed Wireless
- NBN 25/5: $49.90/mo
- NBN 50/20: $59.90/mo

## Migration Script

```sql
-- Migration: Add Fixed Wireless support
-- File: migrations/0003_add_fixed_wireless.sql

ALTER TABLE plans ADD COLUMN technology_type TEXT DEFAULT 'standard';
ALTER TABLE plans ADD COLUMN upload_speed_mbps INTEGER;

-- Set default upload speeds for existing standard plans
UPDATE plans SET upload_speed_mbps = 20 WHERE speed_tier IN (25, 50) AND upload_speed_mbps IS NULL;
UPDATE plans SET upload_speed_mbps = 40 WHERE speed_tier = 100 AND upload_speed_mbps IS NULL;
UPDATE plans SET upload_speed_mbps = 50 WHERE speed_tier = 250 AND upload_speed_mbps IS NULL;
UPDATE plans SET upload_speed_mbps = 50 WHERE speed_tier = 1000 AND upload_speed_mbps IS NULL;
UPDATE plans SET upload_speed_mbps = 100 WHERE speed_tier = 2000 AND upload_speed_mbps IS NULL;

CREATE INDEX idx_plans_technology ON plans(technology_type);
```

## NBN Co API Integration

The NBN Co address API returns technology type:
```json
{
  "techType": "FIXED_WIRELESS",
  "serviceType": "Fixed Wireless",
  "maxSpeed": 50
}
```

We should:
1. Display technology type from address check
2. Filter plans by matching technology
3. Show appropriate speed tiers for the technology

## Next Steps

1. ✅ Add migration script for technology_type and upload_speed_mbps
2. ✅ Update API to filter by technology
3. ✅ Add Fixed Wireless plans to database (10-15 major providers)
4. ✅ Update UI filters and display
5. ✅ Update parsers to detect Fixed Wireless plans
6. ✅ Add technology badge styling
7. ✅ Update address check to show technology type

## Resources
- [NBN Co Fixed Wireless Info](https://www.nbnco.com.au/learn/network-technology/fixed-wireless-explained)
- [NBN Co Speed Tiers](https://www.nbnco.com.au/residential/learn/speed)
- [ACCC Broadband Monitoring](https://www.accc.gov.au/consumers/internet-landline-services/broadband-speeds)
