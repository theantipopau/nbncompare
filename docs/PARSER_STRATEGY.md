# Parser Fixes & Data Collection Strategy

## Current Status

✅ **Working:**
- 7 providers successfully parsed (Arctel, Foxtel, Optus, Belong, SpinTel, Superloop, Vodafone)
- 20 sample plans added manually (Telstra, Optus, TPG, Aussie Broadband, iiNet, Superloop)
- UI fully functional with plan display

❌ **Failing:**
- 24 providers returning 403/404/timeout errors
- Most major providers blocking web scraping

---

## Priority Providers (Fix First)

Based on market share and consumer popularity:

### Tier 1 (Must Have - 70% market share)
1. **Telstra** - ~40% market share
2. **Optus** - ~15% market share  
3. **TPG/iiNet** - ~10% market share (same parent company)
4. **Aussie Broadband** - Growing rapidly, popular choice

### Tier 2 (Important - 20% market share)
5. **Vodafone** - ~8% market share
6. **Dodo/iPrimus** - ~5% market share (same parent)
7. **Mate** - Popular budget option
8. **Superloop** - Tech-savvy audience

### Tier 3 (Nice to Have)
9. Amaysim, Belong, Exetel, Kogan, MyRepublic, Southern Phone, SpinTel

---

## Solution Strategies

### Strategy 1: API Partnerships (Best Long-term)

**Contact providers directly:**

**Email Template:**
```
Subject: Partnership Inquiry - NBN Compare Platform

Dear [Provider] Partnership Team,

We are developing NBN Compare (nbncompare-web.pages.dev), a consumer-focused NBN plan comparison website that helps Australians find suitable internet plans.

We would like to include your NBN plans in our comparison engine. Rather than scraping your website, we're seeking a partnership to:

1. Access plan data via API or structured feed
2. Drive qualified leads to your website
3. Ensure accurate, up-to-date pricing

Benefits for [Provider]:
- Increased visibility to plan-shopping consumers
- Direct traffic to your site for sign-ups
- Accurate representation of your offerings

Would your team be open to discussing a data partnership?

Best regards,
[Your Name]
NBN Compare
[Contact details]
```

**Providers most likely to partner:**
- Aussie Broadband (tech-forward, developer-friendly)
- Superloop (similar culture)
- Smaller MVNOs looking for exposure

---

### Strategy 2: Browser Automation (For Anti-Bot Sites)

**Use Puppeteer/Playwright with Cloudflare Workers:**

Problem: Cloudflare Workers can't run headless browsers directly.

**Solution: Use Browserless.io or similar service**

```typescript
// Example integration
import { jsonResponse } from "../lib/cors";

async function fetchWithBrowser(url: string, browserlessApiKey: string) {
  const browserlessUrl = `https://chrome.browserless.io/content?token=${browserlessApiKey}`;
  
  const response = await fetch(browserlessUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: url,
      waitFor: 2000, // Wait for JS to load
      gotoOptions: {
        waitUntil: 'networkidle2'
      }
    })
  });
  
  return response.text();
}
```

**Costs:**
- Browserless.io: $50/month for 5000 requests
- BrowserStack: $29/month
- ScrapingBee: $49/month for 5000 credits

**Priority sites needing browser automation:**
- Telstra (JavaScript-heavy)
- Optus (Bot detection)
- TPG (Cloudflare protection)

---

### Strategy 3: Proxy Rotation (For 403 Errors)

Many providers block Cloudflare IPs. Use residential proxy service.

**Options:**
- **Bright Data** (formerly Luminati): $500/month minimum
- **Oxylabs**: Similar pricing
- **ScraperAPI**: $49/month for 100k requests
  - Handles proxies, CAPTCHAs, browser rendering
  - Simplest integration

**Implementation:**
```typescript
async function fetchViaProxy(url: string, scraperApiKey: string) {
  const proxyUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(url)}&render=true`;
  return fetch(proxyUrl);
}
```

---

### Strategy 4: Manual Data Entry + Periodic Updates

**Build Admin Interface** for manual plan entry:

**Features needed:**
1. Form to add/edit plans
2. Bulk import from CSV
3. Change tracking (price history)
4. Scheduled reminders to check provider sites

**Process:**
1. Staff checks provider websites monthly
2. Updates prices in admin interface
3. System flags significant changes
4. Auto-notify users of better deals

**Pros:**
- 100% accuracy
- No scraping issues
- Can include promotional deals

**Cons:**
- Labor intensive
- Not real-time
- Scales poorly

---

### Strategy 5: Crowd-Sourced Data

**Let users contribute plans:**

1. "Submit a Plan" button on site
2. Users paste plan details
3. Admin reviews and approves
4. Credits shown on site

**Validation:**
- Require source URL
- Screenshot optional
- Admin verification required
- Track submitter reputation

---

## Recommended Approach (Hybrid)

### Phase 1: Quick Wins (Week 1)
1. ✅ Add sample plans manually (DONE)
2. Fix parsers for sites without bot protection:
   - Update selectors for changed HTML
   - Test each parser individually
3. Contact Tier 1 providers for API partnerships

### Phase 2: Bot Protection Bypass (Week 2-3)
1. Integrate ScraperAPI ($49/month)
   - Start with Telstra, Optus, TPG
   - Monitor success rate
2. Alternative: Browserless.io for JS-heavy sites

### Phase 3: Scale (Week 4+)
1. Build admin interface for manual entry
2. Set up weekly price checks
3. Implement change notifications
4. Add user-submitted plans feature

---

## Parser-Specific Fixes

### Telstra (Provider ID: 1)
**Issue:** 403 Forbidden
**URL:** https://www.telstra.com.au/internet/nbn

**Options:**
1. Use ScraperAPI/proxy
2. Manual entry (most reliable short-term)
3. Request API partnership

**Manual Entry Data:**
- Basic 25: $85/month
- Standard 50: $95/month
- Fast 100: $115/month
- Superfast 250: $145/month
- Ultrafast 1000: $165/month

---

### TPG (Provider ID: 3)
**Issue:** 403 Forbidden
**URL:** https://www.tpg.com.au/nbn

**Fix Strategy:**
1. TPG likely blocking Cloudflare Workers IPs
2. Use residential proxy
3. OR: Parse from WhistleOut/comparison sites (they aggregate TPG data)

---

### Aussie Broadband (Provider ID: 4)
**Issue:** 404 Not Found
**URL:** https://www.aussiebroadband.com.au/broadband/nbn

**Fix:**
- URL may have changed
- Check actual URL: https://www.aussiebroadband.com.au/internet/
- Update parser URL
- Test new selector paths

**Action:**
```typescript
// Update in update_provider_urls.sql
UPDATE providers 
SET canonical_url = 'https://www.aussiebroadband.com.au/internet/' 
WHERE slug = 'aussiebroadband';
```

---

## Cost Comparison

### Manual Entry
- **Cost:** $0 (labor time only)
- **Accuracy:** 95%+
- **Updates:** Monthly
- **Best for:** 5-10 providers

### ScraperAPI
- **Cost:** $49/month
- **Accuracy:** 80-90%
- **Updates:** Daily
- **Best for:** 20+ providers with bot protection

### API Partnerships
- **Cost:** $0 (revenue share or free)
- **Accuracy:** 100%
- **Updates:** Real-time
- **Best for:** Major providers willing to partner

### Browserless.io
- **Cost:** $50/month
- **Accuracy:** 85-95%
- **Updates:** Daily
- **Best for:** JS-heavy sites

---

## Immediate Action Plan

### This Week:
1. ✅ Add sample plans (DONE - 20 plans added)
2. ✅ Test UI with plans (DONE - working)
3. **Update parser URLs** for 404 errors:
   - Check Aussie Broadband, Dodo, Launtel URLs
   - Update in migrations
   - Redeploy

### Next Week:
4. **Build simple admin interface:**
   - Add plan form
   - Edit plan form
   - Bulk delete/deactivate
5. **Sign up for ScraperAPI trial** ($0 for 1000 requests)
   - Test with Telstra parser
   - Measure success rate

### Month 1:
6. **Contact Tier 1 providers** for partnerships
7. **Manual data entry** for remaining Tier 1 providers
8. **Set up weekly cron** to check for plan changes

---

## Next Steps - Choose Your Priority:

**Option A: Quick & Reliable (Recommended)**
→ Manual entry for top 10 providers
→ Build admin interface
→ Monthly update process
→ **Time:** 2-3 days
→ **Cost:** $0

**Option B: Automated & Scalable**
→ Integrate ScraperAPI
→ Update all parsers
→ Daily automated updates
→ **Time:** 1-2 weeks
→ **Cost:** $49/month

**Option C: Best of Both**
→ Manual entry for Tier 1 (5 providers)
→ ScraperAPI for Tier 2/3 (20+ providers)
→ Admin interface as backup
→ **Time:** 1 week
→ **Cost:** $49/month

Which approach do you prefer?
