# NBN Compare Site - Improvement Roadmap
## Based on User Feedback - January 14, 2026

---

## 🚨 CRITICAL FIXES (Deploy Immediately)

### 1. Upload Speed Filter - Incorrect Values
**Problem**: Filter shows "100+ Mbps" and "200+ Mbps" but most NBN plans don't support these speeds.

**Current Reality**:
- NBN 12/25/50: 1-20 Mbps upload
- NBN 100: 20-40 Mbps upload
- NBN 250/500/1000: 25-50 Mbps upload
- NBN 2000: 200 Mbps upload

**Fix**:
```
Replace filter options with:
- Any
- 10+ Mbps (Basic plans)
- 20+ Mbps (Standard NBN 50/100)
- 40+ Mbps (Fast NBN 250+)
- 100+ Mbps (Ultra-fast 2000)
```

**Impact**: Users selecting "100+ Mbps" get zero results (causing confusion)

---

## 📊 DATA IMPROVEMENTS

### 2. Add Missing Major ISPs

**Currently Missing Providers** (NetBargains comparison):

#### Tier 1 - Major National ISPs:
- [ ] **Aussie Broadband** (Already have but needs verification)
- [ ] **Telstra** (Verify data completeness)
- [ ] **Optus** (Verify data completeness)
- [ ] **TPG** (Verify data completeness)
- [ ] **iiNet** (Verify data completeness)

#### Tier 2 - Popular Budget ISPs:
- [ ] **Flip (formerly Mate)** - Student/budget favorite
- [ ] **Harbour ISP** - Sydney-based, good reviews
- [ ] **Aussie Broadband NBN Essentials** - Low-income plans
- [ ] **Tangerine** (Verify if present)
- [ ] **More Telecom** - Budget provider
- [ ] **Superloop** (Verify if present)
- [ ] **Spintel** (Verify if present)
- [ ] **MyRepublic** (Verify if present)

#### Tier 3 - Regional/Specialty ISPs:
- [ ] **Activ8me** - Rural/regional specialist
- [ ] **SkyMesh** - Satellite/rural specialist
- [ ] **Clear Networks** - NSW regional
- [ ] **Southern Phone** (Verify if present)
- [ ] **Belong** (Telstra subsidiary)
- [ ] **Dodo/iPrimus** (Verify if present)
- [ ] **Exetel** (Verify if present)
- [ ] **Launtel** - Dynamic pricing ISP
- [ ] **Leaptel** (Verify if present)
- [ ] **Internode** (Verify if present)

#### Tier 4 - Business/Niche:
- [ ] **AussieBB Business**
- [ ] **Telstra Business**
- [ ] **Uniti Wireless** - Fixed wireless specialist
- [ ] **OptiComm** - FTTP provider
- [ ] **LBNCo** - FTTP provider
- [ ] **Pentanet** - WA fixed wireless

### 3. Promotional Offers Data Quality

**Issues**:
- [ ] Many plans missing intro pricing
- [ ] Promo codes not populated
- [ ] Cashback offers not tracked
- [ ] Bundle deals (mobile + internet) not shown
- [ ] Gift card/signup bonuses missing

**Solution**: Create migration to populate promotional data from known sources

### 4. Accurate Consumer Information

**Missing Critical Details**:
- [ ] **CVC/Bandwidth Info** - Important for speed guarantee
- [ ] **Peak Hour Speeds** - Typical Evening Speed not populated for all plans
- [ ] **Contract Exit Fees** - Critical consumer info missing
- [ ] **Lock-in Period Details** - Need clarity on minimum terms
- [ ] **Modem Cost Breakdown** - If modem included, what model? What's the cost if not?
- [ ] **Static IP Availability/Cost** - Many users need this
- [ ] **IPv6 Support** - Technical users care about this
- [ ] **CGNAT Details** - Can you opt out? At what cost?
- [ ] **Australian Support Hours** - Phone/chat availability
- [ ] **Setup Time** - How long until service is active?

### 5. Speed Tier Accuracy

**Problems**:
- Some plans showing "NBN 100" but actual speeds are 87/20
- Superfast Plus vs Ultrafast naming inconsistencies
- Fixed Wireless speed tiers don't match NBN Co specs
- 5G Home speeds vary wildly by provider but shown as flat numbers

**Fix**: Add "Typical Evening Speed" prominently + disclaimers

---

## 🎨 GUI/UX IMPROVEMENTS

### 6. Comparison Features

**Add to Match NetBargains**:
- [ ] **Side-by-side comparison** - Select 2-4 plans to compare in detail
- [ ] **Comparison table view** - All specs in columns
- [ ] **Provider comparison page** - Compare all plans from 2-3 ISPs
- [ ] **"Best Value" badges** - Auto-calculate best price/performance
- [ ] **User ratings/reviews** - Community feedback integration
- [ ] **Speed test integration** - "Test your current speed" widget

### 7. Advanced Filtering

**Add**:
- [ ] **Price range slider** - $50-$150/month
- [ ] **Multiple speed selection** - "Show me 100 AND 250 plans"
- [ ] **Region/location filter** - FTTP vs FTTN availability by address
- [ ] **Provider reputation filter** - Customer satisfaction ratings
- [ ] **Bundle deals filter** - Internet + Mobile combos
- [ ] **Entertainment add-ons** - Netflix/sports packages included

### 8. Visual Design Enhancements

**Current Issues**:
- Plan cards are dense with text
- No visual hierarchy for important info (price too small)
- Colors don't indicate value (red=bad, green=good deals)
- No iconography for features (✓ for included, ✗ for not included)

**Improvements**:
```
Plan Card Redesign:
┌─────────────────────────────────────┐
│ 🟢 BEST DEAL   Aussie Broadband     │
│ ────────────────────────────────────│
│ NBN 100                             │
│ $79/month → $69/month (6 months) 🎉 │
│                                     │
│ ✓ Unlimited data                    │
│ ✓ Modem included ($0)               │
│ ✓ No setup fee                      │
│ ✓ No lock-in contract               │
│ ✓ Aussie support 24/7               │
│                                     │
│ 📊 Typical speed: 87/20 Mbps        │
│ [View Details]  [Add to Compare]    │
└─────────────────────────────────────┘
```

### 9. Mobile Optimization

**Current Issues**:
- Filter sidebar doesn't work well on mobile
- Plan cards too wide
- Service worker errors on mobile networks
- Touch targets too small

**Fixes**:
- Collapsible filter drawer
- Stacked card layout
- Bigger tap targets
- Progressive Web App (PWA) optimization

### 10. Performance Improvements

**Issues from Logs**:
- Service worker throwing many "Failed to fetch" errors
- Cloudflare Insights CORS errors
- Logo/favicon loading failures
- 503 errors on `/api/providers/comparison`

**Fixes**:
- Fix service worker error handling (currently throwing on external resource failures)
- Add fallback for Cloudflare Insights
- Fix favicon fallback chain (Google Favicons → Clearbit → Initials)
- Debug 503 error on comparison endpoint

---

## 📈 FEATURE ADDITIONS

### 11. Smart Recommendations

**"Help Me Choose" Wizard**:
```
Step 1: What do you use internet for?
  ○ Streaming Netflix/YouTube
  ○ Gaming
  ○ Working from home
  ○ Casual browsing
  ○ Running a business

Step 2: How many people/devices?
  ○ 1-2 people
  ○ 3-4 people
  ○ 5+ people

Step 3: What's your budget?
  ○ Under $60/month
  ○ $60-$80/month
  ○ $80-$100/month
  ○ $100+/month

→ Show recommended plans
```

### 12. Deal Alerts

**Features**:
- Email alerts when specific ISP drops prices
- "Price drop" notifications for favorited plans
- Monthly newsletter with best deals
- RSS feed for deal hunters

### 13. Address Lookup

**Critical Feature Missing**:
- Users can't check what's available at their address
- NBN Co API integration for:
  - Technology type at address (FTTP/FTTN/HFC/Fixed Wireless)
  - Available speed tiers
  - Service class (residential/business)
  - Location ID for signup

**Implementation**: Use NBN Co public API or Address Check widget

### 14. Provider Reputation Data

**Add Metrics**:
- Customer satisfaction scores (ACMA/ACCC data)
- Support response times
- Connection reliability
- Complaint rates
- Whirlpool forum sentiment

### 15. Blog/Content Section

**SEO + User Value**:
- "What NBN speed do I need?"
- "Understanding NBN technology types"
- "How to switch ISPs without downtime"
- "NBN troubleshooting guide"
- Provider reviews
- Monthly "Best NBN Deals" roundup

---

## 🔧 TECHNICAL IMPROVEMENTS

### 16. Data Pipeline

**Current**: Manual migrations
**Needed**: Automated scraping + verification

**Build**:
- Scheduled scrapers for ISP websites
- Price change detection
- Data validation rules
- Admin dashboard for reviewing changes
- Automated deal detection

### 17. API Enhancements

**Missing Endpoints**:
- `/api/deals` - Latest promotional offers
- `/api/providers/{slug}/plans` - All plans for one ISP
- `/api/plans/{id}/history` - Price history chart
- `/api/compare?ids=1,2,3` - Compare specific plans
- `/api/recommendations` - Smart suggestions
- `/api/address-check` - NBN availability

### 18. Analytics Integration

**Track**:
- Most viewed plans
- Most compared plans
- Filter usage patterns
- Conversion tracking (click-through to ISP)
- Search terms
- User journey mapping

---

## 💰 MONETIZATION (Post-Launch)

### 19. Affiliate Links

**Strategy**:
- Partner with ISPs for referral commissions
- Clearly disclose affiliate relationships
- Don't let money influence rankings
- "Sponsored" badges for paid placements

### 20. Premium Features

**Freemium Model**:
- Free: Basic comparison + filtering
- Premium ($5/month):
  - Price drop alerts
  - Full comparison mode (unlimited plans)
  - Historical price charts
  - Ad-free experience
  - Priority support

---

## 📊 METRICS TO TRACK

### Success Metrics:
- **Provider Coverage**: Currently ~20-30 ISPs → Target: 50+ ISPs
- **Plan Count**: Currently ~100-200 plans → Target: 500+ active plans
- **Data Freshness**: Update frequency (daily for deals, weekly for plans)
- **User Engagement**: Time on site, plans compared, filter usage
- **Accuracy**: % of plans with complete data (target: 95%+)
- **Click-through Rate**: % users who click through to ISP

---

## 🎯 PRIORITY ORDER

### Phase 1 (This Week):
1. ✅ Fix upload speed filter values
2. ✅ Fix service worker errors
3. ✅ Fix 503 error on comparison endpoint
4. ✅ Add top 10 missing ISPs
5. ✅ Populate promotional offers

### Phase 2 (Next 2 Weeks):
6. Add side-by-side comparison feature
7. Implement address lookup
8. Add "Help Me Choose" wizard
9. Visual design refresh (plan cards)
10. Mobile optimization

### Phase 3 (Month 2):
11. Build automated scraping pipeline
12. Add user ratings/reviews
13. Implement deal alerts
14. Create blog/content section
15. Analytics dashboard

### Phase 4 (Month 3+):
16. Provider reputation system
17. Historical price tracking
18. API v2 with advanced features
19. Premium features
20. Affiliate program launch

---

## 📝 NEXT STEPS

1. **Fix upload speed filter now** (5 minutes)
2. **Audit current provider list** (30 minutes)
3. **Create migration to add top 10 ISPs** (2 hours)
4. **Populate promotional offers** (4 hours)
5. **Fix service worker errors** (1 hour)
6. **Design comparison UI** (4 hours)

**Estimated Total Time for Phase 1**: 12-15 hours of development

---

## 🔗 RESOURCES

- **NetBargains**: https://www.netbargains.com.au/ (competitor analysis)
- **WhistleOut**: https://www.whistleout.com.au/ (feature inspiration)
- **NBN Co API**: https://www.nbnco.com.au/learn/tools-widgets
- **ACMA Broadband Performance**: https://www.acma.gov.au/
- **Whirlpool ISP Reviews**: https://whirlpool.net.au/wiki/isp

---

*Generated: January 14, 2026*
*Based on: User feedback from Whirlpool Forums*
