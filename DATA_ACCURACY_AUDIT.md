# ⚠️ DATA ACCURACY AUDIT - FINDINGS

**Date:** January 11, 2026  
**Status:** REQUIRES ATTENTION

---

## Critical Issues Found

### ❌ **CGNAT, Support, and Provider Metadata**

**PROBLEM:** These fields are **seeded from migrations, not scraped**

What we have:
- ✅ Basic plan prices (✓ accurate - scraped daily)
- ✅ Plan names (✓ accurate - scraped daily)
- ✅ Speed tiers (✓ accurate - scraped daily)
- ❌ CGNAT data (❌ **STATIC** - from migration only)
- ❌ IPv6 support (❌ **STATIC** - from migration only)
- ❌ Australian support (❌ **STATIC** - from migration only)
- ❌ Static IP info (❌ **STATIC** - from migration only)
- ❌ Upload speeds (❌ **MOSTLY MISSING**)
- ❌ Contract terms (❌ **MOSTLY MISSING**)
- ❌ Discounts (❌ **NOT TRACKED**)

### ❌ **Parser Limitations**

Current parsers only extract:
1. Plan name
2. Speed tier
3. Monthly price
4. Source URL

**NOT extracted:**
- Upload speeds
- Contract terms
- Data allowances
- CGNAT info
- IPv6 support
- Static IP options
- Setup fees
- Modem costs
- Promotions
- Discounts

### ❌ **URLs Accuracy**

The canonical URLs in the database are **static from migrations**:
```sql
INSERT INTO providers (name, slug, canonical_url, active) VALUES 
("Telstra", "telstra", "https://www.telstra.com.au/internet/nbn", 1);
```

**Issues:**
- Some URLs may be outdated
- Telstra changed their URL structure (now uses `nbn.telstra.com.au`)
- Optus NBN page structure may have changed
- Some providers restructure their sites regularly

### ❌ **Discounts Not Tracked**

Promotional pricing and discounts:
- ❌ Intro pricing exists but no duration tracking
- ❌ Bundle discounts not captured
- ❌ Loyalty discounts not tracked
- ❌ Limited time promotions not handled

---

## What NEEDS To Happen

### 1. **Parser Enhancement (HIGH PRIORITY)**

The parsers need to extract:
- [ ] Upload speeds
- [ ] Contract terms (month-to-month, 12-month, 24-month)
- [ ] Data allowances (unlimited vs capped)
- [ ] Modem included/cost
- [ ] Setup fees
- [ ] Promotion/discount info
- [ ] CGNAT/IPv6/Static IP (if displayed on site)

### 2. **Provider Metadata Accuracy (HIGH PRIORITY)**

Need to verify and update:
- [ ] CGNAT policies - **Verify against current provider docs**
- [ ] IPv6 support - **Test or verify against provider specs**
- [ ] Australian support - **Call and verify with each provider**
- [ ] Support hours - **Check current status**
- [ ] Static IP availability - **Verify if free/paid/available**

### 3. **URL Verification (MEDIUM PRIORITY)**

Need to verify each provider's current NBN page:
- [ ] Telstra - Check if URL still valid
- [ ] Optus - Check if URL still valid
- [ ] TPG - Check if URL still valid
- [ ] Aussie Broadband - Check if URL still valid
- [ ] All 30+ providers - Validate URLs

### 4. **Discount Tracking (MEDIUM PRIORITY)**

Need to capture:
- [ ] Intro pricing duration (in days)
- [ ] Promotion expiry dates
- [ ] Bundle discounts
- [ ] Loyalty/retention offers
- [ ] Bundled services discounts

---

## Current Reality Check

### What's Actually Accurate ✅
- **Plan prices** - Updated daily, accurate as of last scrape
- **Speed tiers** - Accurately extracted
- **Plan names** - Accurately extracted
- **Source URLs** - Point to plan pages

### What's Questionable ⚠️
- **Provider metadata** - May be outdated (seeded once)
- **Support hours** - Not updated
- **CGNAT policies** - Not verified recently
- **IPv6 support** - Not verified recently
- **Australian support** - Not verified recently

### What's Missing ❌
- **Upload speeds** - Not extracted
- **Contract terms** - Mostly missing
- **Promotions** - Not tracked
- **Discounts** - Not tracked
- **Bundle info** - Not captured

---

## Example: Aussie Broadband

**What we show:**
```
Aussie Broadband NBN 100
$79.99/month
Speed: 100 Mbps
```

**What we're MISSING:**
```
✓ Upload speed: 10 Mbps (NOT SHOWN)
✓ Contract: No lock-in (NOT SHOWN)
✓ Promotion: $79.99 for first 6 months (NOT TRACKED)
✓ Then: $99.99/month (NOT TRACKED)
✓ CGNAT: None available (STATIC DATA)
✓ IPv6: Yes, included (STATIC DATA)
✓ Static IP: Free included (STATIC DATA)
✓ Support: Australian 24/7 (STATIC DATA)
```

---

## Recommendations

### Immediate (This Week)
1. [ ] Manually verify provider URLs are still correct
2. [ ] Update seed data for provider metadata with current info
3. [ ] Document which parsers need enhancement

### Short Term (This Month)
1. [ ] Enhance parsers to extract contract terms
2. [ ] Enhance parsers to extract upload speeds
3. [ ] Enhance parsers to capture promotions
4. [ ] Test parsers against actual provider sites
5. [ ] Verify CGNAT/IPv6 data with each provider

### Medium Term (This Quarter)
1. [ ] Build provider metadata API (beyond seed data)
2. [ ] Add discount/promotion tracking
3. [ ] Create provider verification workflow
4. [ ] Implement quarterly metadata audits

### Long Term (This Year)
1. [ ] Auto-update provider URLs if changed
2. [ ] Real-time promotion tracking
3. [ ] Contract term variations detection
4. [ ] Speed test integration (actual vs advertised)

---

## For Consumers Now

**Be aware:**
1. ⚠️ **Plan prices are accurate** but may be missing intro period details
2. ⚠️ **CGNAT/IPv6 data may be outdated** - verify on provider site
3. ⚠️ **No promotion tracking** - check provider site for current deals
4. ⚠️ **Upload speeds may not be shown** - check provider site
5. ⚠️ **Contract terms mostly not captured** - check provider site

**Always verify on provider's official site before purchasing!**

---

## Next Steps

Would you like me to:

1. **Manually audit a sample of providers** (pick 5-10) to verify CGNAT/support/URLs?
2. **Enhance the parsers** to extract more fields?
3. **Update provider metadata** based on current information?
4. **Create a verification workflow** to keep data current?

---

**Status:** Honest assessment complete. Ready to fix issues identified.
