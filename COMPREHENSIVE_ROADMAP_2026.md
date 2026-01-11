# NBN Compare - Comprehensive Development Roadmap 2026

**Status:** Building the definitive Australian NBN comparison tool  
**Current Date:** January 11, 2026  
**Vision:** Be the most accurate, trusted, and feature-rich NBN comparison site in Australia

---

## 📊 Current State Assessment

### ✅ What We Have
- 142 active plans from 30+ providers
- Daily scraper (3 AM UTC)
- Promotional pricing support
- Speed tier filtering (25-2000 Mbps)
- Contract term filtering
- Price history tracking
- Dark mode, favorites, PWA support
- Fixed Wireless NBN support
- Blog section with 4 articles
- Cloudflare KV caching (5-min TTL)
- Web Analytics integration

### ❌ Critical Gaps
- **CGNAT/IPv6/Static IP data** → Hardcoded from migrations (not updated)
- **Upload speeds** → Not extracted by parsers
- **Contract terms** → Mostly missing
- **Promotion tracking** → Duration not tracked
- **Provider URLs** → May be outdated
- **User discounts** → Not tracked
- **No email notifications** → Price alerts not possible
- **No user accounts** → Can't save preferences
- **No advanced filters** → Bundle deals invisible
- **No SEO optimization** → Low organic search visibility
- **No provider reviews** → No social proof
- **No real-time status** → Users don't know data freshness

---

## 🚀 Phase 1: Critical Data Accuracy (Weeks 1-2)

### Goal: Make data trustworthy and comprehensive

#### 1.1 Provider Metadata Audit & Update

**Issue:** CGNAT, IPv6, Australian support, static IP data are all seeded once and never updated

**Action:** Manually verify and update all provider metadata

```
Providers to verify:
□ Telstra        - Check CGNAT/IPv6/Static IP policies
□ Optus          - Verify free opt-out claim
□ TPG            - Check Australian support status
□ Aussie Broadband - Verify CGNAT=0, IPv6=1 claims
□ iiNet          - Verify support location
□ Vodafone       - Check CGNAT policies
□ Dodo           - Verify metadata accuracy
□ Superloop      - Check support hours
□ Spintel        - Verify Australian support
□ Foxtel         - Check Fixed Wireless metadata
+ 20 more providers (lower priority)
```

**Implementation:**
- [ ] Create verification checklist for each provider
- [ ] Document findings in spreadsheet with evidence URLs
- [ ] Update `seed_provider_metadata.sql` with verified data
- [ ] Create migration `0024_update_provider_metadata_verified.sql`
- [ ] Add `metadata_verified_at` column to track when data was verified
- [ ] Add `metadata_source` column to document where info came from

**Result:** Database will accurately reflect current provider offerings

#### 1.2 Provider URL Verification

**Issue:** Canonical URLs hardcoded from migrations, may be outdated

**Action:** Test and verify all provider URLs

```
Create URL verification tool:
1. Read all provider URLs from seed_providers.sql
2. Test each URL (200 status, no redirects to different domain)
3. Document any issues (broken, moved, unreachable)
4. Update seed data with current URLs
5. Add quarterly re-verification to maintenance schedule
```

**Implementation:**
- [ ] Create `apps/worker/src/tools/verify-provider-urls.ts`
- [ ] Add script to `package.json`: `"verify-urls": "node verify-provider-urls.ts"`
- [ ] Generate report: `URL_VERIFICATION_REPORT.md`
- [ ] Update any broken URLs
- [ ] Document maintenance schedule for URL verification

**Result:** All provider URLs are valid and current

#### 1.3 Parser Enhancement - Phase 1 (Basic Fields)

**Issue:** Parsers only extract plan name, speed, price - missing upload speeds, contracts, allowances

**Action:** Enhance parsers to capture more data fields

**New fields to extract:**
- [ ] Upload speed (Mbps) → Usually next to download speed
- [ ] Data allowance (GB) or "Unlimited" flag → Often in plan description
- [ ] Contract term (None/12/24 months) → Usually in T&Cs or plan details
- [ ] Setup fee (dollars) → Often in pricing section
- [ ] Modem included (yes/no) or modem cost → Usually stated in features
- [ ] NBN technology (FTTP/FTTC/FTTN/HFC/Fixed Wireless) → From context or metadata

**Implementation per parser:**

```typescript
// Example: aussiebroadband.ts enhancement
export const parser = {
  // Existing:
  planName: "NBN 100",
  speedTier: 100,
  introPriceCents: 7999,
  ongoingPriceCents: 9999,
  
  // NEW FIELDS:
  uploadSpeed: 10,           // Mbps
  dataAllowance: "Unlimited", // String or null
  contractMonths: null,       // 0, 12, 24 or null for month-to-month
  setupFeeCents: 0,          // 0 if free, otherwise cents
  modemIncluded: true,       // Boolean
  modemCost: 0,              // 0 if included, otherwise cents
  nbnTechnology: "FTTP",     // From page or assumed
}
```

**Testing:**
- [ ] Run parser against each provider's live site
- [ ] Verify fields are extracted correctly
- [ ] Update `test-samples/` with new test assertions
- [ ] Create `packages/shared/scripts/verify-parsers.ts` to test all

**Result:** Parsers extract 6-8 fields per plan instead of just 4

#### 1.4 Create Data Verification Dashboard

**Purpose:** See what data is current vs stale

**New endpoint:** `GET /api/admin/data-status`

```json
{
  "lastScraperRun": "2026-01-11T03:00:00Z",
  "dataFreshness": {
    "planPrices": "Updated 8 hours ago",
    "planDetails": "Updated 8 hours ago",
    "providerMetadata": "Updated 47 days ago ⚠️",
    "uploadSpeeds": "Not tracked",
    "contractTerms": "Partially tracked (60%)"
  },
  "providerCoverage": {
    "total": 30,
    "pricesUpdating": 28,
    "metadataVerified": 12,
    "urlsVerified": 8
  }
}
```

**Admin page updates:**
- [ ] Show "Data Last Updated" for each field type
- [ ] Display metadata verification status per provider
- [ ] Show URL verification date
- [ ] Highlight fields needing attention

**Result:** Clear visibility into data quality and freshness

---

## 🔧 Phase 2: Enhanced Data Collection & Verification (Weeks 3-4)

### Goal: Automated system for keeping data current and accurate

#### 2.1 Promote Dynamic Metadata Extraction

**Issue:** CGNAT, IPv6, Static IP still hardcoded

**Approach:** Can't easily automate these, but create quarterly verification workflow

**Implementation:**
- [ ] Create `docs/METADATA_VERIFICATION_GUIDE.md` with:
  - Where to find CGNAT info on each provider's site
  - How to check IPv6 support
  - How to verify Australian support
  - What to look for regarding static IP availability
  
- [ ] Automate what we can:
  ```typescript
  // New parser function for metadata hints
  export async function extractMetadataHints(providerUrl: string) {
    // Look for common patterns in HTML:
    // - "CGNAT" in text → likely supported
    // - "IPv6" in tech specs → likely supported
    // - "Static IP" in features → check if free/paid
    // - "+61" phone number → Australian support
    // - "24/7 Australian support" → definite flag
    // Return hints as JSON, not definitive (requires human verification)
  }
  ```

- [ ] Create quarterly verification schedule:
  ```
  Q1 2026: Verify Telstra, Optus, TPG, Aussie (top 4 providers)
  Q2 2026: Verify iiNet, Vodafone, Dodo, Superloop, Spintel (next 5)
  Q3 2026: Verify remaining 20 providers
  Q4 2026: Re-verify top providers quarterly
  ```

- [ ] Add to migrations:
  ```sql
  ALTER TABLE providers ADD COLUMN metadata_verified_date TEXT;
  ALTER TABLE providers ADD COLUMN metadata_verified_by TEXT;
  ALTER TABLE providers ADD COLUMN metadata_source TEXT; -- "Seed", "Manual", "API"
  ```

**Result:** Metadata has clear provenance and freshness

#### 2.2 Track Promotion Duration Accurately

**Issue:** Promo pricing exists but duration not tracked

**New data model:**

```typescript
// In plans table:
promo_intro_price_cents: 7999,
promo_intro_duration_days: 180,      // NEW: Duration in days
promo_then_price_cents: 9999,         // NEW: Price after promo ends
promo_active_from: "2026-01-01",      // NEW: When promo starts
promo_active_until: "2026-06-30",     // NEW: When promo ends
```

**Parser enhancement:**
- [ ] Extract promo end date if visible
- [ ] Calculate duration from dates
- [ ] Add fallback logic if duration not shown
- [ ] Track historical promos (archive old ones)

**Result:** Users see "First 6 months $79, then $99"

#### 2.3 Add Discount & Bundle Tracking

**Issue:** Discounts (bundle, loyalty, limited-time) not visible

**New database:**
```sql
CREATE TABLE plan_discounts (
  id, plan_id, discount_type, discount_name, 
  discount_amount_cents, discount_percentage, 
  conditions, valid_from, valid_until, active
);
```

**Types tracked:**
- Bundle (Internet + Phone, Internet + TV)
- Loyalty discounts
- Limited-time offers
- Student/Senior discounts
- New customer discounts

**Parser enhancement:**
- [ ] Detect and extract discount offers from plan pages
- [ ] Link discounts to specific plans
- [ ] Track validity periods
- [ ] Mark as active/expired

**Result:** Users see "Save $15/mo with phone bundle"

#### 2.4 Enhanced User Feedback System

**Build on existing feedback system:**

- [ ] Categorize feedback:
  - Price incorrect
  - Plan removed/no longer available
  - Missing plan
  - CGNAT/IPv6 info wrong
  - URL broken
  - Other data issue

- [ ] Add admin actions:
  ```typescript
  // Admin can:
  - Mark feedback as "verified" (acknowledged)
  - Mark as "fixed" (data corrected)
  - Add response to user
  - Link multiple feedback items (duplicate detection)
  - View trends (which providers have most issues)
  ```

- [ ] New admin page: Feedback Dashboard
  - Sort by provider
  - Filter by status (new, verified, fixed)
  - Response rate metrics
  - Trend analysis

**Result:** Community helps identify data problems

---

## ✨ Phase 3: Advanced Features (Weeks 5-8)

### Goal: Make NBN Compare the most useful comparison tool

#### 3.1 Total Cost of Ownership (TCO) Calculator

**What:** Calculate true total cost including setup, modem, services

**Inputs:**
- Plan choice
- Comparison period (6/12/24 months)
- Bundle options (add phone/TV)
- Modem choice (upgrade options)
- Speed tier (what they actually need)

**Outputs:**
- Total cost breakdown
- Cost per month
- Cost vs competitor plans
- ROI of speed upgrade
- Best value recommendation

**Implementation:**
```typescript
interface TCOCalculation {
  planCost: number;
  setupFee: number;
  modemCost: number;
  bundleAddOns: number;
  totalCost: number;
  costPerMonth: number;
  breakEvenVsCurrentPlan: number; // months until savings kick in
}
```

**Result:** Users see "Switching to Aussie Broadband saves $180 over 12 months"

#### 3.2 Contract Analyzer

**What:** Help users understand contract terms and exit costs

**Shows:**
- Lock-in period
- Early termination fees
- Month-to-month options
- Flexibility score (1-10)
- Comparison of flexibility across competitors

**Inputs:**
- Provider
- Contract term (12/24 months)
- Plan

**Outputs:**
```json
{
  "contractTerm": "24 months",
  "earlyExitFee": "$50",
  "monthlyFromTermination": true,
  "flexibilityScore": 4,
  "competitorsWithBetter": ["Aussie Broadband", "Superloop"],
  "recommendation": "Consider month-to-month with Superloop if flexibility matters"
}
```

**Result:** Users understand true commitment cost

#### 3.3 Speed Requirement Advisor

**What:** Help users choose right speed tier

**Assessment:**
- Usage type (email/browsing, streaming, gaming, video calls)
- Household size
- Simultaneous users
- Recommended speed tier
- Why (e.g., "4K video needs 25 Mbps")
- Plans at that speed (filtered)

**Implementation:**
```typescript
const speedAdvice = {
  email_browsing: { min: 10, recommended: 25, unit: "Mbps" },
  hd_streaming: { min: 15, recommended: 50, unit: "Mbps" },
  "4k_streaming": { min: 25, recommended: 100, unit: "Mbps" },
  gaming: { min: 10, recommended: 50, unit: "Mbps" },
  "video_conferencing": { min: 5, recommended: 50, unit: "Mbps" },
  multiple_users_4k: { min: 50, recommended: 250, unit: "Mbps" },
}
```

**Result:** Users choose right speed and don't overpay

#### 3.4 Price Trend Alerts & Notifications

**What:** Email alerts when prices change

**Triggers:**
- Favorite plan price drops
- Competitor of current plan gets cheaper
- New promo appears on wanted plan
- Plan becomes available in area

**Implementation:**
```typescript
interface PriceAlert {
  userId: string;
  planId: string;
  alertType: "price_drop" | "competitor_cheaper" | "new_promo" | "now_available";
  triggerPrice?: number; // Alert if drops below this
  emailNotification: boolean;
  smsNotification?: boolean;
  active: boolean;
}
```

**Database:**
```sql
CREATE TABLE price_alerts (
  id, user_id, plan_id, alert_type, trigger_price_cents,
  email_notification, sms_notification, active, created_at
);

CREATE TABLE alert_history (
  id, alert_id, triggered_at, plan_price_cents, message_sent
);
```

**Result:** Users notified: "NBN 50 at Telstra dropped from $89 to $79"

#### 3.5 Saved Profiles & Comparison History

**What:** Users save their favorite plans for easy reference

**Features:**
- Save plan list (no login required, browser-based)
- Name profiles ("My home", "Office option", "Backup option")
- Share profile link with others
- Compare profile across time (prices tracked)
- Export profile as PDF

**Implementation:**
```typescript
// Browser-based storage
interface SavedProfile {
  id: string; // UUID
  name: string;
  address: string;
  savedPlans: Plan[];
  createdAt: Date;
  lastModified: Date;
}

// Stored in localStorage
// Sync to cloud optionally (with user account)
```

**Result:** Users can say "Here are my shortlisted plans"

#### 3.6 Provider Review System

**What:** Let users rate and review providers

**Components:**
- Star rating (1-5)
- Review categories:
  - Plan accuracy (did speeds match advertised?)
  - Customer support quality
  - Setup experience
  - Reliability
  - Value for money

**Database:**
```sql
CREATE TABLE provider_reviews (
  id, provider_id, user_email, rating,
  accuracy_score, support_score, setup_score,
  reliability_score, value_score,
  review_text, helpful_count, created_at
);
```

**Display:**
- Average ratings per category
- Recent reviews on provider page
- Helpful/not helpful voting
- Moderation for fake reviews

**Result:** "Telstra: 3.8/5 (247 reviews) - Good coverage but slow support"

#### 3.7 Speed Test Integration

**What:** Built-in speed test for users to check actual speeds

**Approach:**
- Integration with Speedtest or Ookla API
- User tests their connection
- Results stored (with consent)
- Compared to advertised plan speed
- Shows "Getting expected performance" or warning

**Implementation:**
```typescript
interface SpeedTestResult {
  planId: string;
  userId?: string;
  downloadMbps: number;
  uploadMbps: number;
  latencyMs: number;
  advertisedSpeed: number;
  performanceRating: "Excellent" | "Good" | "Fair" | "Poor";
  testedAt: Date;
}
```

**Result:** "Your actual speed: 98 Mbps (advertised 100) ✅"

---

## 📱 Phase 4: Platform Expansion (Weeks 9-12)

### Goal: Reach users on their preferred platforms

#### 4.1 Mobile App (iOS/Android)

**Tech:** React Native / Expo for code sharing

**Features:**
- All web features
- Push notifications for price alerts
- One-tap favorite plans
- Offline plan comparison (cached data)
- QR code sharing of saved profiles

**Priority:**
- 1. Android app (larger market)
- 2. iOS app

**Release:** Q1 2026

#### 4.2 Email Newsletter

**What:** Weekly updates on trending plans, price drops, new offers

**Content:**
- Top trending plans (most viewed)
- Biggest price decreases
- New plans added
- Regional spotlight (VIC, NSW, QLD, etc.)
- Editor's pick for value

**Frequency:** Weekly digest on Sundays

**Implementation:**
```typescript
interface NewsletterSubscription {
  id: string;
  email: string;
  regions: string[]; // NSW, VIC, QLD, etc.
  interests: string[]; // FTTP, Fixed Wireless, etc.
  frequency: "weekly" | "daily" | "none";
  subscribedAt: Date;
}
```

#### 4.3 API for Developers

**What:** Public API so developers can build on NBN data

**Endpoints:**
- `GET /api/public/plans` - List all plans
- `GET /api/public/providers` - List all providers
- `GET /api/public/plans/:id` - Plan details
- `GET /api/public/address/:postcode/:suburb` - Check service
- `GET /api/public/price-trends/:id` - Historical prices

**Rate limits:**
- Free tier: 100 req/day
- Registered: 1000 req/day
- Premium: Unlimited

**Result:** Third-party tools can use NBN Compare data

---

## 🎯 Phase 5: SEO & Marketing (Weeks 13-16)

### Goal: Reach more Australians searching for NBN plans

#### 5.1 SEO Content Strategy

**Target keywords:**
- "Best NBN plans Australia"
- "NBN 100 vs NBN 250"
- "Cheap NBN plans"
- "NBN availability [suburb]"
- "Compare NBN providers"
- "[Provider] vs [Provider]"

**Content to add:**
- [ ] 20+ provider comparison articles
- [ ] Speed tier buyer's guides
- [ ] Fixed Wireless vs FTTP guide
- [ ] Contract term comparison
- [ ] "How much should you pay for NBN?"
- [ ] "Is your speed good enough?"
- [ ] Provider-specific guides

**Implementation:**
- Create content calendar
- Blog posts with schema markup
- Internal linking strategy
- Meta descriptions optimization

#### 5.2 Structured Data & Rich Snippets

**Add JSON-LD schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "NBN 100 - Telstra",
  "offers": {
    "@type": "Offer",
    "price": "99.99",
    "priceCurrency": "AUD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.2",
    "reviewCount": "247"
  }
}
```

**Result:** Better SERP display, rich snippets for plans

#### 5.3 Social Media Strategy

**Platforms:**
- [ ] TikTok - Short clips on NBN myths, money-saving tips
- [ ] Instagram - Infographics on speed comparisons
- [ ] Twitter - NBN news, plan updates
- [ ] LinkedIn - Industry insights
- [ ] Facebook - Community discussions

**Content types:**
- Plan comparison videos
- Money-saving hacks
- NBN outage updates
- New plan announcements
- User success stories ("I saved $200/year!")

---

## 📊 Phase 6: Analytics & Optimization (Ongoing)

### Goal: Understand users and continuously improve

#### 6.1 Advanced Analytics

**Track:**
- Which plans users view most
- Search terms used
- Filter combinations most popular
- Comparison patterns
- Where users drop off
- Conversion to favorite/save

**Tools:**
- Google Analytics 4 + GA4 API
- Cloudflare Analytics Engine
- Custom events tracking

#### 6.2 A/B Testing Framework

**Test:**
- Plan card layouts
- Filter options
- Recommendation algorithms
- CTA button text/position
- Hero section messaging

**Implementation:**
```typescript
interface ABTest {
  name: string;
  variants: { id: string; name: string; weight: number }[];
  startDate: Date;
  endDate?: Date;
  metric: string; // "clicks", "comparisons", "time_on_page"
  winner?: string;
  results: TestResult[];
}
```

#### 6.3 Performance Monitoring

**Monitor:**
- Page load times (target: <2s)
- API response times (target: <500ms)
- Time to interactive (target: <3s)
- Core Web Vitals
- Error rates

**Tools:**
- Cloudflare Analytics
- Sentry for errors
- Custom monitoring

---

## 💰 Phase 7: Monetization (Optional)

### Goal: Create revenue to fund ongoing development

#### 7.1 Affiliate Partnerships

**Approach:** If user clicks through to provider and signs up, earn commission

**Challenges:**
- NBN Co restrictions (may prohibit)
- Disclosure requirements (transparent to users)
- Conflict of interest (might bias recommendations)

**Recommendation:** Get legal advice before implementing

#### 7.2 Premium Features

**Options:**
- Free tier: Basic comparison, no alerts
- Premium tier ($2.99/month): Price alerts, advanced filters, saved profiles
- Pro tier ($9.99/month): Above + API access, no ads

**Cautious:** Keep free tier highly functional

#### 7.3 Partner Sponsorships

**Potential:**
- NBN Co sponsorship
- ISP partnerships for data feeds
- Hardware sponsors (modem companies)

---

## 🗓️ Implementation Timeline

```
JANUARY 2026
├─ Week 1-2: Phase 1 (Data accuracy) 🔴 CRITICAL
├─ Week 3-4: Phase 2 (Enhanced data)
└─ Week 5: Phase 3 starts (Advanced features)

FEBRUARY 2026
├─ Week 1-4: Phase 3 continues (TCO, alerts, profiles)
└─ Week 3-4: Phase 4 planning (mobile app)

MARCH 2026
├─ Week 1-4: Phase 5 (SEO & marketing)
└─ Phase 4 development (app)

APRIL 2026
├─ Mobile app soft launch
├─ Phase 6 analytics
└─ Continuous Phase 3 enhancements

ONGOING
├─ Monthly data verification
├─ Weekly content updates
├─ Continuous feature rollout
└─ Community feedback integration
```

---

## 🎯 Success Metrics

### By End Q1 2026 (March 31)
- [ ] 100% of provider metadata verified
- [ ] All provider URLs current and tested
- [ ] Parsers extract 8+ fields per plan (not just 4)
- [ ] Price alerts system live
- [ ] Saved profiles feature live
- [ ] Blog expanded to 10+ articles
- [ ] Mobile app released
- [ ] 10,000+ monthly users
- [ ] 50,000+ monthly impressions

### By End Q2 2026 (June 30)
- [ ] Provider review system live
- [ ] TCO calculator operational
- [ ] Speed requirement advisor live
- [ ] API publicly available
- [ ] 20,000+ monthly users
- [ ] Top 10 for "compare NBN plans" keyword
- [ ] 100,000+ monthly impressions

### By End Q3 2026 (September 30)
- [ ] Speed test integration live
- [ ] Newsletter 5,000+ subscribers
- [ ] 50,000+ monthly users
- [ ] Top 5 for major NBN keywords
- [ ] 500,000+ monthly impressions

### By End Q4 2026 (December 31)
- [ ] Monetization strategy decided and implemented
- [ ] 100,000+ monthly users
- [ ] #1 search result for "compare NBN plans"
- [ ] 1,000,000+ monthly impressions
- [ ] Sustainable revenue model

---

## 🏗️ Technical Architecture Goals

### Database Improvements
- [ ] Provider metadata versioning (track history)
- [ ] Price history partitioning (by month for speed)
- [ ] User data encryption (privacy-first)
- [ ] Audit logging for all admin changes

### Backend Enhancement
- [ ] Rate limiting per endpoint
- [ ] Request caching strategy
- [ ] Error handling & retry logic
- [ ] Monitoring & alerting

### Frontend Polish
- [ ] Performance audit & optimization
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Responsive design review
- [ ] Dark mode refinement
- [ ] Mobile experience optimization

### DevOps/Deployment
- [ ] Automated testing (unit + integration)
- [ ] Staging environment
- [ ] Blue/green deployments
- [ ] Rollback procedures
- [ ] Disaster recovery plan

---

## 🤝 Team & Resources

### Immediate Needs
- 1-2 full-stack developers (data accuracy phase)
- 1 content writer (SEO content)
- 1 QA/tester (verification)

### Later Phases
- Mobile app developer (React Native)
- Data analyst (analytics & A/B testing)
- DevOps engineer (infrastructure)
- Community manager (feedback, support)

### Community Involvement
- Open source contributions welcome
- Bug bounty program
- Provider feedback program
- User beta testing program

---

## 📝 Success Indicators

| Metric | Current | Target (Q2) | Target (Q4) |
|--------|---------|-----------|-----------|
| Monthly Users | ~5k | 20k | 100k |
| Plans in Database | 142 | 200+ | 250+ |
| Providers Covered | 30 | 35 | 40+ |
| Data Freshness | Daily (prices only) | Daily (all) | Real-time (key fields) |
| Provider Metadata Verified | 5% | 80% | 100% |
| Blog Articles | 4 | 15 | 30+ |
| User Reviews | 0 | 100 | 1000+ |
| Page Load Time | 1.5s | <1s | <0.8s |
| Search Ranking | Not ranked | Top 50 | Top 5 |
| Mobile Traffic % | 60% | 70% | 75% |
| Organic Traffic % | 15% | 30% | 50% |

---

## 🚀 How to Proceed

1. **Immediately (This Week):**
   - [ ] Start Phase 1 provider verification
   - [ ] Audit all provider URLs
   - [ ] Begin parser enhancement work

2. **Next Week:**
   - [ ] Deploy Phase 1 updates
   - [ ] Update seed data with verified info
   - [ ] Begin Phase 2 discount tracking

3. **This Month:**
   - [ ] Complete Phase 1 & 2
   - [ ] Launch price alerts
   - [ ] Launch saved profiles
   - [ ] Begin Phase 3 work

4. **Going Forward:**
   - [ ] Follow implementation timeline
   - [ ] Measure against success metrics
   - [ ] Adjust based on user feedback
   - [ ] Maintain community engagement

---

**Next Action:** Start Phase 1 immediately. Which provider should we verify first?
