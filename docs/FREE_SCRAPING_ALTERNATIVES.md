# Free Scraping Alternatives to ScraperAPI

## 🆓 Best Free Options for Your Setup

### Option 1: Cloudflare Browser Rendering (RECOMMENDED)
**Cost:** 2 million requests/month FREE  
**Works with:** Cloudflare Workers (native integration)

Cloudflare's own browser rendering service - perfect for your stack!

```typescript
// Enable in wrangler.toml
browser = { binding = "BROWSER" }

// Usage
const browser = await env.BROWSER.launch();
const page = await browser.newPage();
await page.goto(url);
const html = await page.content();
await browser.close();
```

**Pros:**
- ✅ 2M requests/month FREE
- ✅ Native Cloudflare integration
- ✅ Full JavaScript rendering
- ✅ No external API needed
- ✅ Fast (same network)

**Cons:**
- ❌ More complex than fetch
- ❌ Slower than direct fetch (~2-3s per page)

---

### Option 2: User-Agent Rotation + Delays (SIMPLEST)
**Cost:** $0  
**Works with:** Any setup

Simple approach - rotate user agents and add random delays.

```typescript
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...',
  'Mozilla/5.0 (X11; Linux x86_64)...',
];

async function fetchWithRotation(url: string) {
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  await new Promise(r => setTimeout(r, Math.random() * 2000 + 1000)); // 1-3s delay
  
  return fetch(url, {
    headers: {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Referer': 'https://www.google.com/',
    }
  });
}
```

**Pros:**
- ✅ 100% free
- ✅ Simple to implement
- ✅ Works for many sites
- ✅ No external dependencies

**Cons:**
- ❌ Won't bypass strong bot protection
- ❌ May get blocked eventually
- ❌ Slower (due to delays)

---

### Option 3: ScrapingBee Free Tier
**Cost:** 1,000 requests/month FREE  
**Similar to:** ScraperAPI

```typescript
async function fetchViaScrapingBee(url: string, apiKey: string) {
  const params = new URLSearchParams({
    api_key: apiKey,
    url: url,
    render_js: 'true',
    premium_proxy: 'false',
  });
  
  const response = await fetch(`https://app.scrapingbee.com/api/v1/?${params}`);
  return await response.text();
}
```

**Pros:**
- ✅ 1,000 free requests/month
- ✅ JavaScript rendering
- ✅ Similar API to ScraperAPI

**Cons:**
- ❌ Limited free tier
- ❌ External service dependency

---

### Option 4: Bright Data's Web Unlocker Free Trial
**Cost:** 7-day free trial, then paid  

Not truly free long-term, but generous trial.

---

### Option 5: Hybrid Manual Entry (BEST FOR YOUR CASE)
**Cost:** $0  
**Time:** ~30 minutes/week

Given you have only **31 providers**, manual entry might be most reliable:

**Weekly Process:**
1. Visit top 5 provider websites (Telstra, Optus, TPG, Aussie, iiNet)
2. Copy plan details into admin form
3. Let automated scraper handle the remaining 26 (less critical)

**Why this works:**
- Top 5 providers = 80% of market share
- Manual entry = 100% accuracy
- Remaining 26 can fail without major impact
- Total time: 5-10 minutes per provider = 30-50 min/week

---

## 🎯 Recommended Approach

### For Your NBN Compare Site

**Use a 3-tier strategy:**

1. **Tier 1: Manual Entry (Top 5 providers)**
   - Telstra, Optus, TPG, Aussie Broadband, iiNet
   - Update weekly via admin interface
   - 100% accuracy where it matters

2. **Tier 2: User-Agent Rotation (Next 15 providers)**
   - Simple rotation + delays
   - Update daily
   - Free, works for sites without strong protection

3. **Tier 3: Cloudflare Browser Rendering (Blocked sites)**
   - For sites that block Tier 2
   - 2M free requests/month
   - JavaScript rendering

### Implementation Priority

**Week 1:** Build admin interface for manual entry
**Week 2:** Implement User-Agent rotation
**Week 3:** Add Cloudflare Browser Rendering for failures
**Week 4:** Monitor and optimize

---

## 💾 Quick Implementation: User-Agent Rotation

I'll update your code with a free user-agent rotation approach:

```typescript
// apps/worker/src/lib/free-scraper.ts

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
];

export async function fetchWithRotation(url: string, options: { delay?: boolean } = {}) {
  // Random user agent
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  
  // Optional delay to avoid rate limiting
  if (options.delay) {
    const delayMs = Math.random() * 2000 + 1000; // 1-3 seconds
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
      },
    });
    
    if (!response.ok && response.status !== 403 && response.status !== 429) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('Fetch with rotation failed:', error);
    throw error;
  }
}

// Fallback chain: rotation -> fail gracefully
export async function fetchWithFallback(url: string) {
  try {
    return await fetchWithRotation(url, { delay: true });
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    throw new Error(`Could not fetch ${url}: ${error}`);
  }
}
```

---

## 📊 Cost Comparison

| Solution | Free Tier | After Free Tier | Best For |
|----------|-----------|-----------------|----------|
| **Cloudflare Browser** | 2M req/month | $5 per 1M | Cloudflare users |
| **User-Agent Rotation** | Unlimited | $0 | Simple sites |
| **ScrapingBee** | 1,000 req/month | $49/month | Quick setup |
| **Manual Entry** | Unlimited | Your time | Critical accuracy |
| **Bright Data** | 7-day trial | $500+/month | Enterprise |

---

## 🎬 Next Steps

1. **Immediate:** Switch to User-Agent rotation (free, works now)
2. **This week:** Build admin interface for manual entry
3. **Next week:** Add Cloudflare Browser Rendering for tough sites
4. **Ongoing:** Manual updates for top 5 providers weekly

**Want me to implement the User-Agent rotation approach now?** It's 100% free and will work for many of your providers immediately.
