# ScraperAPI Setup Guide

## Quick Setup (5 minutes)

### Step 1: Get API Key
1. Visit https://www.scraperapi.com
2. Sign up for free account (1,000 requests included)
3. Copy your API key from the dashboard

### Step 2: Add to Cloudflare Worker
```bash
cd apps/worker
wrangler secret put SCRAPER_API_KEY
# Paste your API key when prompted
```

### Step 3: Update Environment Type
Edit `apps/worker/src/index.ts` and add to the Env interface:

```typescript
interface Env {
  D1: D1Database;
  ADMIN_TOKEN: string;
  SCRAPER_API_KEY?: string; // Add this line
}
```

### Step 4: Deploy Worker
```bash
wrangler deploy
```

That's it! The worker will now automatically use ScraperAPI when direct fetches are blocked.

## How It Works

### Smart Fallback Strategy
The system tries direct fetch first (free and fast), then falls back to ScraperAPI only when needed:

1. **Direct Fetch** → Success ✅
   - No cost, fast response
   - Used when provider doesn't block Cloudflare IPs

2. **Direct Fetch** → 403/429 Error ❌ → **ScraperAPI** → Success ✅
   - Uses ScraperAPI credit
   - Bypasses bot protection
   - Rotates IP addresses
   - Renders JavaScript if needed

3. **Direct Fetch** → Network Error ❌ → **ScraperAPI** → Success ✅
   - Handles timeout/connection issues
   - Uses premium proxies

### Cost Optimization
- **Free tier:** 1,000 requests/month
- **Paid tier:** $49/month for 100,000 credits
- **Average usage:** 
  - 31 providers × 1 fetch/day = ~930 credits/month
  - Fits in free tier! 🎉

### Features Enabled
- ✅ IP rotation (bypass rate limits)
- ✅ Browser fingerprinting (looks like real browser)
- ✅ JavaScript rendering (for React/Vue sites)
- ✅ CAPTCHA solving (automatic)
- ✅ Geolocation (Australian proxies with `country_code: 'au'`)
- ✅ Session management (for multi-page scrapes)

## Testing

### Test ScraperAPI Directly
```bash
curl "http://api.scraperapi.com?api_key=YOUR_KEY&url=https://www.telstra.com.au/internet/nbn"
```

### Test Worker Integration
```bash
curl https://nbncompare-worker.matt-hurley91.workers.dev/api/admin/fetch-providers
```

Check logs:
```bash
wrangler tail
```

Look for:
- `"(ScraperAPI enabled)"` - Key configured correctly
- `"Direct fetch blocked (403), using ScraperAPI..."` - Fallback working
- `"Parser failed"` - May need to adjust parser logic

## Monitoring

### Check Usage
```typescript
import { getScraperAPIStatus } from './lib/scraper-api';

const status = await getScraperAPIStatus(env.SCRAPER_API_KEY);
console.log(status);
// Example: { credits_remaining: 950, total_requests: 50 }
```

### Provider Success Rate
Visit: https://nbncompare-worker.matt-hurley91.workers.dev/api/admin/issues

Shows:
- Which providers are failing
- Error messages
- Last successful fetch time
- Plans count per provider

## Troubleshooting

### "ScraperAPI returned 401"
- Check API key is correct
- Verify key is set: `wrangler secret list`

### "ScraperAPI returned 403"
- Website may have advanced protection
- Try with `premium: true` option
- May need to contact ScraperAPI support

### "ScraperAPI returned 429"
- Rate limit exceeded
- Wait a few minutes
- Consider upgrading plan

### Parser Still Failing
Some sites need custom handling:
- JavaScript rendering: `{ render: true }`
- Residential proxies: `{ premium: true }`
- Australian proxy: `{ country_code: 'au' }`
- Sticky session: `{ session_number: 123 }`

## Advanced Configuration

### Provider-Specific Options
Edit `apps/worker/src/handlers/providers-fetcher.ts`:

```typescript
// For Telstra (JavaScript-heavy)
const options = prov.slug === 'telstra' ? { render: true } : {};
const html = await fetchViaScraperAPI(url, scraperKey, options);

// For TPG (strong bot protection)
const options = prov.slug === 'tpg' ? { premium: true, country_code: 'au' } : {};
const html = await fetchViaScraperAPI(url, scraperKey, options);
```

### Custom User-Agent
```typescript
const options = {
  render: true,
  country_code: 'au',
  keep_headers: true, // Preserve custom headers
};
```

## Cost Estimates

### Scenarios

**Scenario 1: Daily Scraping (31 providers)**
- 31 providers × 30 days = 930 credits/month
- **Cost:** $0 (free tier covers it!)

**Scenario 2: Hourly Scraping (31 providers)**
- 31 providers × 24 hours × 30 days = 22,320 credits/month
- **Cost:** $49/month (100k credits)

**Scenario 3: With Premium Proxies (10 providers)**
- 10 premium + 21 standard × 30 days
- 300 premium (25 credits each) + 630 standard = 7,500 + 630 = 8,130 credits/month
- **Cost:** $49/month

### Recommendation
Start with free tier, monitor usage for 1 month, then decide on paid plan.

## Alternative: Hybrid Strategy

Instead of automated scraping, consider:
1. **Top 5 providers:** Manual entry (Telstra, Optus, TPG, Aussie, iiNet)
   - Update weekly
   - Highest accuracy
   - $0 cost
2. **Remaining 26 providers:** Automated with ScraperAPI
   - Update daily
   - Good enough accuracy
   - Low credit usage

This gives you:
- 95% accuracy where it matters (top providers)
- Full automation for long tail
- <500 credits/month (free tier!)

See [PARSER_STRATEGY.md](PARSER_STRATEGY.md) for more details.

---

**Questions?** Check ScraperAPI docs: https://www.scraperapi.com/documentation
