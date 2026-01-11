# PHASE 1 IMPLEMENTATION GUIDE: Critical Data Accuracy (Weeks 1-2)

**Goal:** Establish data trustworthiness and completeness foundation  
**Timeline:** January 11-24, 2026 (2 weeks)  
**Success Criteria:** All providers verified, URLs tested, parsers enhanced, seed data updated

---

## 📋 Tasks Overview

### Week 1: Verification & Audit

#### Task 1.1: Provider Metadata Verification
**Owners:** Developer + Data Analyst  
**Time:** 40 hours  
**Deliverable:** `PROVIDER_VERIFICATION_RESULTS.md`

**Process:**
1. Create verification checklist for each provider (see template below)
2. Visit each provider's website
3. Verify CGNAT policy (yes/no/free opt-out/paid)
4. Verify IPv6 support (included/available/not available)
5. Verify Australian support (100% AU/mixed/offshore)
6. Verify static IP (not available/free/paid addon)
7. Document findings with source URL
8. Compare against current seed data

**Template:**
```markdown
## Provider: Telstra

### CGNAT Policy
- Current DB Value: `cgnat = 0` (No CGNAT available)
- Website Evidence: [URL from telstra.com.au]
- Status: ✅ VERIFIED / ⚠️ NEEDS UPDATE / ❌ INCORRECT
- Finding: "CGNAT not offered for residential NBN"
- Source: https://www.telstra.com.au/internet/nbn/faq

### IPv6 Support
- Current DB Value: `ipv6_support = 1`
- Website Evidence: [URL from telstra.com.au]
- Status: ✅ VERIFIED / ⚠️ NEEDS UPDATE / ❌ INCORRECT
- Finding: "IPv6 included in all NBN plans"
- Source: https://www.telstra.com.au/internet/nbn/features

### Australian Support
- Current DB Value: `australian_support = 2` (100% Australian)
- Website Evidence: [URL from telstra.com.au]
- Status: ✅ VERIFIED / ⚠️ NEEDS UPDATE / ❌ INCORRECT
- Finding: "24/7 Australian customer support"
- Source: https://www.telstra.com.au/customer-service

### Static IP
- Current DB Value: `static_ip_available = 1` (Free)
- Website Evidence: [URL from telstra.com.au]
- Status: ✅ VERIFIED / ⚠️ NEEDS UPDATE / ❌ INCORRECT
- Finding: "Static IP included at no extra cost"
- Source: https://www.telstra.com.au/internet/nbn/benefits

### Summary
- Changes Needed: ✅ None / ⚠️ 2 fields / ❌ 3+ fields
- Verification Date: 2026-01-11
- Verified By: [Name]
- Evidence Link: [Shared folder with screenshots]
```

**Verification Order (Priority):**
1. **Tier 1 (Top providers, 60% of users):**
   - Telstra
   - Optus
   - TPG
   - Aussie Broadband
   - iiNet

2. **Tier 2 (Secondary providers, 30% of users):**
   - Vodafone
   - Dodo
   - Superloop
   - Spintel
   - Exetel

3. **Tier 3 (Small providers, 10% of users):**
   - Mate, Foxtel, Kogan, etc.

**Output:** Spreadsheet with all findings, categorized by status

---

#### Task 1.2: Provider URL Verification & Testing
**Owner:** Developer  
**Time:** 8 hours  
**Deliverable:** `URL_VERIFICATION_REPORT.md` + Updated seed data

**Process:**

Create automated script to test all URLs:

```typescript
// File: apps/worker/src/tools/verify-provider-urls.ts

async function verifyProviderUrls() {
  const providers = [
    { name: "Telstra", url: "https://www.telstra.com.au/internet/nbn" },
    { name: "Optus", url: "https://www.optus.com.au/network/nbn" },
    // ... all 30 providers
  ];

  const results = [];
  
  for (const provider of providers) {
    try {
      const response = await fetch(provider.url, { 
        method: 'HEAD',
        redirect: 'manual'
      });
      
      const result = {
        provider: provider.name,
        url: provider.url,
        status: response.status,
        redirectUrl: response.headers.get('location'),
        valid: response.status === 200,
        timestamp: new Date().toISOString(),
      };
      
      results.push(result);
      
      // Log issues
      if (response.status !== 200) {
        console.error(`⚠️ ${provider.name}: ${response.status}`);
      }
      if (response.headers.get('location')) {
        console.warn(`↪️ ${provider.name}: Redirects to ${result.redirectUrl}`);
      }
    } catch (error) {
      results.push({
        provider: provider.name,
        url: provider.url,
        valid: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      console.error(`❌ ${provider.name}: ${error.message}`);
    }
  }
  
  return results;
}
```

**Expected Output:**
```markdown
# Provider URL Verification Report
Generated: 2026-01-11

## Summary
- Total Providers: 30
- Valid URLs: 28 ✅
- Broken URLs: 1 ❌
- Redirects (needs update): 1 ⚠️
- Not Tested: 0

## Issues Found

### 🔴 CRITICAL - Broken URL
- Provider: Carbon Communications
- Current URL: https://www.carboncomms.com.au/nbn
- Status: 404 Not Found
- Action: Check if provider still exists or update URL

### 🟡 WARNING - Redirect Detected
- Provider: iiNet
- Current URL: https://www.iinet.net.au/nbn
- Redirects to: https://www.iinet.net.au/internet/nbn
- Action: Update seed data to redirect target URL

## All URLs Status

| Provider | URL | Status | Issue |
|----------|-----|--------|-------|
| Telstra | https://www.telstra.com.au/internet/nbn | ✅ 200 | None |
| Optus | https://www.optus.com.au/network/nbn | ✅ 200 | None |
| ...more rows... |

## Recommendations
1. Update iiNet URL in seed_providers.sql
2. Investigate Carbon Communications (may be defunct)
3. Schedule quarterly re-verification
```

**Update seed data:**
```sql
-- File: migrations/0025_update_provider_urls.sql

UPDATE providers SET canonical_url = 'https://www.iinet.net.au/internet/nbn' 
WHERE slug = 'iinet';

-- Note any providers that need investigation
```

---

#### Task 1.3: Parser Enhancement - Initial Pass
**Owner:** Frontend Developer  
**Time:** 32 hours  
**Deliverable:** Enhanced parsers + updated parser tests

**Priority fields to add (in order):**

1. **Upload Speed** (1-2 hours per provider)
   - Search for "Upload" or "Up" in plan description
   - Usually appears next to download speed
   - Pattern: "100 Mbps download / 10 Mbps upload"
   - Fallback: 1/10th of download speed if not found

2. **Contract Term** (1-2 hours per provider)
   - Look for "Month-to-month", "12-month", "24-month" options
   - Check plan comparison table
   - Default to "month-to-month" if not found
   - Value: 0, 12, or 24 (months)

3. **Setup/Connection Fee** (30 minutes per provider)
   - Search for "setup", "connection", "installation" fees
   - Often listed separately from plan price
   - Default to 0 if not found
   - Value in cents

4. **Modem Included** (30 minutes per provider)
   - Check if router/modem included in plan
   - Boolean: true/false
   - Document if paid addon available

5. **Data Allowance** (30 minutes per provider)
   - Check if unlimited or capped
   - Some plans: "Unlimited data"
   - Others: "1 TB per month", "500 GB per month"
   - Value: String (e.g., "Unlimited", "1TB", "500GB") or null

**Example Enhancement:**

Before:
```typescript
// packages/shared/src/parsers/providers/telstra.ts
export const parser = {
  planName: "NBN 100",
  speedTier: 100,
  introPriceCents: 99 * 100,
  ongoingPriceCents: 129 * 100,
};
```

After:
```typescript
export const parser = {
  planName: "NBN 100",
  speedTier: 100,
  uploadSpeed: 10,           // NEW
  dataAllowance: "Unlimited", // NEW
  contractMonths: 0,         // NEW (0 = month-to-month)
  setupFeeCents: 0,          // NEW
  modemIncluded: true,       // NEW
  introPriceCents: 99 * 100,
  ongoingPriceCents: 129 * 100,
};
```

**Testing:**
- Test each parser against live website
- Update `test-samples/telstra.html` with new test
- Add assertions for new fields
- Run: `npm run test:parsers`

**Checklist for each provider:**
- [ ] Upload speed extracted
- [ ] Contract options identified
- [ ] Setup fee documented
- [ ] Modem info captured
- [ ] Data allowance noted
- [ ] Tests updated
- [ ] Parser tested against live site

**Providers to enhance (in order):**
1. Telstra (highest priority, highest users)
2. Optus
3. TPG
4. Aussie Broadband
5. iiNet
6. Vodafone
7. Dodo
8. Superloop
9. Spintel
10. Foxtel
... remaining 20 providers

---

### Week 2: Data Updates & Deployment

#### Task 2.1: Update Database Schema
**Owner:** Backend Developer  
**Time:** 4 hours  
**Deliverable:** Migration 0024 + Migration 0025

**Migration 0024 - Add new parser fields:**
```sql
-- File: apps/worker/migrations/0024_add_parser_fields.sql

ALTER TABLE plans ADD COLUMN upload_speed_mbps INTEGER;
ALTER TABLE plans ADD COLUMN data_allowance TEXT; -- "Unlimited", "1TB", "500GB", etc
ALTER TABLE plans ADD COLUMN contract_months INTEGER; -- 0 (month-to-month), 12, 24
ALTER TABLE plans ADD COLUMN setup_fee_cents INTEGER DEFAULT 0;
ALTER TABLE plans ADD COLUMN modem_included BOOLEAN DEFAULT 1;
ALTER TABLE plans ADD COLUMN modem_cost_cents INTEGER DEFAULT 0;
ALTER TABLE plans ADD COLUMN nbn_technology TEXT; -- FTTP, FTTC, FTTN, HFC, Fixed Wireless

-- Add columns for metadata verification tracking
ALTER TABLE providers ADD COLUMN metadata_verified_date TEXT;
ALTER TABLE providers ADD COLUMN metadata_verified_by TEXT;
ALTER TABLE providers ADD COLUMN metadata_source TEXT; -- "Seed", "Manual", "API"
ALTER TABLE providers ADD COLUMN metadata_verification_status TEXT; -- "Verified", "Pending", "Outdated"
ALTER TABLE providers ADD COLUMN metadata_verification_notes TEXT;
```

**Migration 0025 - Update verified data:**
```sql
-- File: apps/worker/migrations/0025_update_provider_metadata.sql

-- Update Telstra based on verification
UPDATE providers SET 
  metadata_verified_date = '2026-01-11',
  metadata_verified_by = '[Name]',
  metadata_source = 'Manual',
  metadata_verification_status = 'Verified',
  cgnat = 0,
  ipv6_support = 1,
  australian_support = 2,
  static_ip_available = 1
WHERE slug = 'telstra';

-- Update Optus based on verification
UPDATE providers SET
  metadata_verified_date = '2026-01-11',
  metadata_verified_by = '[Name]',
  metadata_source = 'Manual',
  metadata_verification_status = 'Verified',
  cgnat = 2, -- Free opt-out
  ipv6_support = 1,
  australian_support = 2,
  static_ip_available = 1
WHERE slug = 'optus';

-- ... more provider updates
```

---

#### Task 2.2: Backfill Existing Data
**Owner:** Backend Developer  
**Time:** 8 hours  
**Deliverable:** Data populated in new fields

**Script to backfill upload speeds from historical patterns:**

```typescript
// File: apps/worker/src/tools/backfill-parser-fields.ts

async function backfillParserFields() {
  // For each plan in DB, determine upload speed from speedTier
  // Most NBN plans follow these ratios:
  // Download: Upload ratio
  // 25 Mbps: 1 Mbps (4%)
  // 50 Mbps: 2 Mbps (4%)
  // 100 Mbps: 10 Mbps (10%)
  // 250 Mbps: 20 Mbps (8%)
  // 500 Mbps: 40 Mbps (8%)
  // 1000 Mbps: 50 Mbps (5%)
  
  const uploadSpeedRatios = {
    25: 1,
    50: 2,
    100: 10,
    250: 20,
    500: 40,
    1000: 50,
    2000: 100,
  };
  
  // Query all plans without upload_speed
  const plans = await db
    .prepare("SELECT id, speed_tier FROM plans WHERE upload_speed_mbps IS NULL")
    .all();
  
  for (const plan of plans) {
    const uploadSpeed = uploadSpeedRatios[plan.speed_tier] || null;
    
    if (uploadSpeed) {
      await db
        .prepare("UPDATE plans SET upload_speed_mbps = ? WHERE id = ?")
        .run(uploadSpeed, plan.id);
    }
  }
  
  console.log(`✅ Backfilled ${plans.length} plans with upload speeds`);
}
```

---

#### Task 2.3: Deploy Migrations & Updates
**Owner:** DevOps/Backend  
**Time:** 4 hours  
**Deliverable:** Production migration + data live

**Deployment steps:**

```bash
# 1. Test migrations locally
cd apps/worker
npm run dev

# Test: curl http://localhost:8787/api/plans
# Verify new fields appear in response

# 2. Test in staging
wrangler d1 migrations apply nbncompare --env staging

# 3. Backup production database (CRITICAL)
# Via Cloudflare dashboard: Export database snapshot

# 4. Apply to production
wrangler d1 migrations apply nbncompare --remote

# 5. Verify production
curl https://api.nbncompare.info/api/plans | jq '.plans[0]' | grep upload_speed

# 6. Update frontend to display new fields
```

---

#### Task 2.4: Update API & Frontend for New Fields
**Owner:** Frontend Developer  
**Time:** 12 hours  
**Deliverable:** New fields visible in UI

**API Response Example (GET /api/plans):**
```json
{
  "id": 1,
  "provider": "Telstra",
  "planName": "NBN 100",
  "speedTier": 100,
  "uploadSpeed": 10,              // NEW
  "dataAllowance": "Unlimited",   // NEW
  "contractMonths": 0,            // NEW
  "setupFeeCents": 0,             // NEW
  "modemIncluded": true,          // NEW
  "modemCostCents": 0,            // NEW
  "nbnTechnology": "FTTP",        // NEW
  "introPriceCents": 9999,
  "ongoingPriceCents": 12999,
  "metadataVerified": true,       // NEW
  "metadataVerifiedDate": "2026-01-11", // NEW
  "sourceUrl": "https://..."
}
```

**UI Updates:**

1. **Plan Card Enhancement:**
```
TELSTRA NBN 100
Speed: 100 Mbps ↓ / 10 Mbps ↑                    // NEW
Data: Unlimited ✅                                // NEW
Contract: Month-to-month (no lock-in) ✅         // NEW
Setup: Free 🎯                                   // NEW
Modem: Included 🖥️                               // NEW
Price: $99.99/month (was $120 first 6 months)   // Existing
```

2. **Comparison Modal Update:**
```
Add new columns:
- Upload Speed (sortable)
- Data Allowance (sortable)
- Contract Terms (filterable)
- Setup Cost (included in TCO)
- Modem included (yes/no badge)
```

3. **Filter Enhancements:**
```
New filters:
- Data Allowance: Unlimited only / Any / Specific cap
- Contract Type: Month-to-month / 12-month / 24-month
- Setup Cost: Free only / Any
- Modem: Included / Not included / Any
```

**Component Changes:**
- [ ] Update `PlanCard.tsx` to show new fields
- [ ] Update `ComparisonModal.tsx` with new columns
- [ ] Update `FilterPanel.tsx` with new filters
- [ ] Update `PlanDetails.tsx` with comprehensive breakdown
- [ ] Add "Verified on 2026-01-11" badge to metadata

---

#### Task 2.5: Create Admin Verification Dashboard
**Owner:** Backend + Frontend Developer  
**Time:** 8 hours  
**Deliverable:** Admin page showing verification status

**New Endpoint: GET /api/admin/verification-status**
```json
{
  "lastUpdated": "2026-01-11T14:30:00Z",
  "providers": [
    {
      "name": "Telstra",
      "metadataVerified": true,
      "verifiedDate": "2026-01-11",
      "verifiedBy": "john@example.com",
      "status": "Current",
      "issues": []
    },
    {
      "name": "Carbon Communications",
      "metadataVerified": false,
      "verifiedDate": null,
      "status": "Pending - Low Priority",
      "issues": ["No parsers updated yet"]
    }
  ],
  "summary": {
    "totalProviders": 30,
    "verified": 12,
    "pending": 18,
    "coverage": "40%"
  }
}
```

**Admin Page Display:**
```
Provider Verification Status Dashboard

Summary
├─ Total Providers: 30
├─ Verified: 12 ✅
├─ Pending: 18 ⏳
└─ Coverage: 40%

Verified Providers (Green)
├─ Telstra (verified 2026-01-11 by John)
├─ Optus (verified 2026-01-11 by Sarah)
├─ TPG (verified 2026-01-11 by John)
└─ ... 9 more

Pending Verification (Yellow)
├─ iiNet
├─ Vodafone
├─ Dodo
└─ ... 15 more

Broken URLs (Red)
├─ Carbon Communications - 404 Not Found

Parser Enhancement Status
├─ Telstra: 5/5 fields ✅
├─ Optus: 5/5 fields ✅
├─ TPG: 4/5 fields (modem_cost missing)
└─ ... more

Data Freshness
├─ Plans last scraped: 8 hours ago
├─ Metadata last verified: 2 hours ago
├─ URLs last tested: 1 hour ago
```

---

## 📊 Deliverables Checklist

### End of Week 1:

- [ ] **Provider Verification Results**
  - Tier 1 (5 providers): 100% verified
  - Tier 2 (5 providers): 50% verified
  - Document: `PROVIDER_VERIFICATION_RESULTS.md`

- [ ] **URL Verification Report**
  - All 30 URLs tested
  - Document: `URL_VERIFICATION_REPORT.md`
  - Issues identified and prioritized

- [ ] **Parser Enhancements**
  - Top 5 providers: All 5 new fields
  - Remaining 25: At least 3 new fields
  - All tests passing: `npm run test:parsers`

### End of Week 2:

- [ ] **Database Migrations**
  - Migration 0024 deployed (new schema)
  - Migration 0025 deployed (updated data)
  - Backfill script completed

- [ ] **API Updates**
  - GET `/api/plans` returns new fields
  - GET `/api/admin/verification-status` operational

- [ ] **UI Updates**
  - Plan cards show upload speed, data allowance
  - Comparison modal shows all new fields
  - New filters available
  - Verification badges visible

- [ ] **Admin Dashboard**
  - Shows provider verification status
  - Displays parser completion status
  - Shows data freshness metrics

---

## 🎯 Success Criteria

**Data Accuracy:**
- ✅ 100% of Tier 1 providers (5) metadata verified
- ✅ 50%+ of Tier 2 providers (5) metadata verified
- ✅ All provider URLs tested and current
- ✅ URLs added to Git history with verification timestamp

**Parser Completeness:**
- ✅ Upload speeds extracted for all providers
- ✅ Contract terms captured (where available)
- ✅ Setup fees documented
- ✅ Modem info included
- ✅ Data allowances noted
- ✅ All parser tests passing

**Database:**
- ✅ 7 new columns in plans table
- ✅ 5 new columns in providers table
- ✅ 150+ plans with new fields populated
- ✅ 12+ providers marked as verified
- ✅ Zero migration errors

**Frontend:**
- ✅ All new fields visible in UI
- ✅ New filters working correctly
- ✅ Verification badges displayed
- ✅ Mobile responsive for new content
- ✅ No performance regression

**Admin:**
- ✅ Verification dashboard accessible
- ✅ Real-time status updates
- ✅ Clear priority for next phase

---

## 📝 Notes & Reminders

- **Database backup:** Create production snapshot before migrations
- **Testing:** Always test migrations locally first
- **Git commits:** One commit per task with clear messages
- **Communication:** Share progress daily with team
- **Blockers:** Escalate any provider data accessibility issues immediately
- **Evidence:** Save screenshots of provider websites as verification proof

---

## 🔄 Transition to Phase 2

Once Week 2 is complete and all criteria met:

1. **Review & approve** all Phase 1 deliverables
2. **Announce improvements** to users (email, blog post)
3. **Tag release** with version (e.g., v1.1.0)
4. **Begin Phase 2** (Discount tracking, user feedback system)

---

**Status:** Ready to execute  
**Next Action:** Start Task 1.1 immediately  
**Target Completion:** January 24, 2026
