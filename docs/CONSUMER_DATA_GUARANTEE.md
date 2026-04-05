# Consumer Data Guarantee

## 🎯 What This Means For You

When you use NBN Compare, you can trust that:

### ✅ Prices Are Current
- All plan prices are scraped **daily** (updated each day at 3 AM)
- Prices come directly from official provider websites
- No delays, markups, or outdated information

### ✅ Plans Are Accurate
- Every plan shown has been **validated** against provider specifications
- Speed tiers, data allowances, contract terms all verified
- Automatic detection and removal of duplicate listings
- Bad data is automatically flagged and corrected

### ✅ Providers Are Real
- All 30+ providers are **major Australian NBN retailers**
- Each provider's direct website link is shown with each plan
- You can click through to verify pricing yourself

### ✅ Coverage Is Complete
- **30+ major providers** tracked and updated daily
- **All technology types:** Standard NBN, Fixed Wireless, Business, Satellite
- **All speed tiers:** 12, 25, 50, 100, 250, 500, 1000 Mbps
- **No missing providers:** If you don't see a provider, they're likely not active in your area

---

## 🔍 How We Ensure Accuracy

### Automated Daily Process
1. **Scrape** - Fetch latest plans from each provider's website
2. **Validate** - Check prices are realistic, speeds are valid, no duplicates
3. **Normalize** - Standardize all data for easy comparison
4. **Update** - Push changes to database
5. **Log** - Record what changed and any errors
6. **Monitor** - Alert if scraping fails

### Quality Checks
- Price range validation: $10-$200/month (flags unusual prices)
- Speed validation: Only known NBN speeds accepted
- Duplicate detection: Removes duplicate plans within providers
- Freshness tracking: Shows when each plan was last verified
- Error logging: Failed updates recorded for investigation

### When Data Gets Old
- **24 hours:** Plans still current and reliable
- **7 days:** Plan may need refresh (still accurate but not updated)
- **14 days:** Plan flagged for priority re-scraping
- **30 days:** Likely provider no longer offers this plan

---

## 🛡️ What If You Find An Error?

If a price seems wrong or a plan is missing:

1. **Click the source link** on the plan card to verify on the provider's site
2. **Check the "Last Updated"** date to see how fresh the data is
3. **Report the issue** if the site shows different pricing
4. **Refresh the page** - next cron run will pick up recent changes

---

## 📊 Coverage by Provider Type

### Major National Providers (Always Updated)
- Telstra, Optus, TPG, Vodafone, Dodo, Superloop
- Updated daily - expect pricing within hours of changes

### Mid-Tier Providers (Daily Updates)
- Aussie Broadband, Kogan, iiNet, Belong, MyRepublic, Exetel
- Updated daily - changes picked up within 24 hours

### Smaller/Regional Providers (Daily Updates)
- Arctel, Buddy, Carbon Communications, Future, Launtel, Leaptel, etc.
- Updated daily - may have less frequent plan changes

---

## 💡 Tips for Best Results

1. **Search by your address first** - This shows available providers in your area
2. **Compare all speed tiers** - More speed != always better value
3. **Check the contract term** - 12/24 month vs month-to-month affects price
4. **Look for promotions** - Intro pricing often available
5. **Click the source link** - Verify price on provider's site before purchasing
6. **Check upload speeds** - Especially important for working from home

---

## 🚀 Performance Promise

- **Response time:** < 1 second to show plans
- **Search accuracy:** Finds all providers serving your address
- **Data freshness:** Updated every 24 hours automatically
- **Uptime:** 99.9% (Cloudflare CDN)

---

**Last Updated:** January 11, 2026

**For full technical details:** See [DATA_ACCURACY_STATUS.md](DATA_ACCURACY_STATUS.md)
