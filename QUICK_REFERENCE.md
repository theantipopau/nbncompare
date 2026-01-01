# Quick Reference Guide - NBN Compare

## 🚀 Deployment Commands

### Frontend
```bash
cd apps/web
pnpm build
wrangler pages deploy dist --project-name=nbncompare-web
```

### Worker
```bash
cd apps/worker
wrangler deploy
```

### Database Updates
```bash
cd apps/worker
wrangler d1 execute nbncompare --remote --command "YOUR_SQL_HERE"
```

---

## 🔗 Important URLs

**Live Site:** https://6b574223.nbncompare-web.pages.dev  
**Worker API:** https://nbncompare-worker.matt-hurley91.workers.dev  
**About Page:** https://6b574223.nbncompare-web.pages.dev/about  
**Admin Panel:** https://6b574223.nbncompare-web.pages.dev/admin  

---

## 📊 Key Files

### Frontend (`apps/web/src/`)
- `App.tsx` - Main app with routing and navigation
- `pages/Compare.tsx` - Homepage with plan comparison
- `pages/About.tsx` - About page with your projects
- `pages/Admin.tsx` - Admin panel (basic version)
- `pages/Status.tsx` - System status
- `styles.css` - All styling (animations, glassmorphism)

### Worker (`apps/worker/src/`)
- `index.ts` - Main router and exports
- `lib/scraper-api.ts` - User-Agent rotation scraping
- `lib/browser-rendering.ts` - Cloudflare Browser Rendering
- `handlers/providers-fetcher.ts` - Provider scraping logic
- `handlers/address.ts` - NBN address search/qualification
- `handlers/plans.ts` - Plan query endpoints

### Configuration
- `apps/worker/wrangler.toml` - Worker config (has browser binding!)
- `apps/web/vite.config.ts` - Vite build config
- `package.json` - Dependencies

---

## 🎨 Color Scheme

**Primary Gradient:**
- Start: `#667eea` (purple)
- End: `#764ba2` (magenta)

**Usage:**
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

**Hover States:**
- Purple: `#667eea`
- Shadows: `rgba(102, 126, 234, 0.3)`

---

## 🗄️ Database Schema

### providers table
```sql
id INTEGER PRIMARY KEY
slug TEXT UNIQUE NOT NULL
name TEXT NOT NULL
canonical_url TEXT
active INTEGER DEFAULT 1
last_fetch_at TEXT
last_hash TEXT
last_error TEXT
needs_review INTEGER DEFAULT 0
```

### plans table
```sql
id INTEGER PRIMARY KEY
provider_id INTEGER
plan_name TEXT
speed_tier INTEGER
ongoing_price_cents INTEGER
source_url TEXT
last_checked_at TEXT
FOREIGN KEY(provider_id) REFERENCES providers(id)
```

---

## 🔧 Common Tasks

### Add a New Provider
```sql
INSERT INTO providers (slug, name, canonical_url, active)
VALUES ('provider-slug', 'Provider Name', 'https://...', 1);
```

### Add a Plan Manually
```sql
INSERT INTO plans (provider_id, plan_name, speed_tier, ongoing_price_cents, source_url, last_checked_at)
VALUES (1, 'Telstra NBN 100', 100, 7999, 'https://...', datetime('now'));
```

### Check Provider Status
```sql
SELECT slug, name, last_fetch_at, last_error 
FROM providers 
WHERE active = 1 
ORDER BY last_fetch_at DESC;
```

### Find Cheapest Plans by Speed
```sql
SELECT p.name, pr.plan_name, pr.speed_tier, pr.ongoing_price_cents/100.0 as price
FROM plans pr
JOIN providers p ON p.id = pr.provider_id
WHERE pr.speed_tier = 100
ORDER BY pr.ongoing_price_cents ASC
LIMIT 10;
```

---

## 🧪 Testing Locally

### Frontend Dev Server
```bash
cd apps/web
pnpm dev
# Opens on http://localhost:5173
```

### Worker Dev Server
```bash
cd apps/worker
wrangler dev
# Opens on http://localhost:8787
```

### Test API Endpoints
```bash
# Get all plans
curl https://nbncompare-worker.matt-hurley91.workers.dev/api/plans

# Filter by speed
curl https://nbncompare-worker.matt-hurley91.workers.dev/api/plans?speed=100

# Address search
curl "https://nbncompare-worker.matt-hurley91.workers.dev/api/address/search?q=123+Queen+St+Brisbane"

# Service qualification
curl https://nbncompare-worker.matt-hurley91.workers.dev/api/address/qualify?locationId=LOC000074058396
```

---

## 🔐 Admin Token

**Default:** `changeme` (set in wrangler.toml)

**Change it:**
```bash
cd apps/worker
wrangler secret put ADMIN_TOKEN
# Enter new token when prompted
```

**Use it:**
- Admin panel: Enter token to login
- API calls: Add header `Authorization: Bearer YOUR_TOKEN`

---

## 📝 Provider ID Reference

Quick reference for common providers:

| ID | Provider | Slug |
|----|----------|------|
| 1 | Telstra | telstra |
| 2 | Optus | optus |
| 3 | TPG | tpg |
| 4 | Aussie Broadband | aussiebroadband |
| 7 | iiNet | iinet |
| 8 | Vodafone | vodafone |
| 9 | Superloop | superloop |
| 11 | Exetel | exetel |
| 12 | Launtel | launtel |

*Use SQL query to see all: `SELECT id, slug, name FROM providers ORDER BY id;`*

---

## 🎯 Speed Tiers

| Tier | Name | Typical Use |
|------|------|-------------|
| 12 | NBN 12 | Light browsing, email |
| 25 | NBN 25 | HD streaming (1-2 devices) |
| 50 | NBN 50 | HD streaming (2-3 devices) |
| 100 | NBN 100 | 4K streaming, gaming |
| 250 | NBN 250 | Multiple 4K streams |
| 500 | NBN 500 | Power users, large downloads |
| 1000 | NBN 1000 | Professional/business use |
| 2000 | NBN 2000 | Ultra-fast for tech enthusiasts |

---

## 🐛 Troubleshooting

### Plans not loading?
1. Check API endpoint is responding: `/api/plans`
2. Check browser console for errors
3. Verify VITE_API_URL is set correctly
4. Check D1 database has plans: `wrangler d1 execute nbncompare --remote --command "SELECT COUNT(*) FROM plans"`

### Address search not working?
1. Verify NBN API is responding
2. Check network tab for CORS issues
3. Test directly: `/api/address/search?q=test`

### Scraper failing?
1. Check provider URLs are still valid
2. Review error logs: `/api/admin/issues`
3. Test with browser rendering: may need to update parser
4. Consider manual entry for that provider

### Browser rendering not working?
1. Verify `env.BROWSER` binding exists in worker
2. Check wrangler.toml has `[browser]` section
3. Monitor usage (2M requests/month limit)
4. Check Cloudflare dashboard for errors

---

## 📚 Resources

**Cloudflare Docs:**
- Workers: https://developers.cloudflare.com/workers/
- D1: https://developers.cloudflare.com/d1/
- Browser Rendering: https://developers.cloudflare.com/browser-rendering/
- Pages: https://developers.cloudflare.com/pages/

**NBN Co API:**
- Address Search: https://places.nbnco.net.au/places/v1/autocomplete
- Service Details: https://places.nbnco.net.au/places/v2/details/{locationId}

**Matt's Other Projects:**
- OmenCore: https://omencore.info
- Reddit: https://reddit.com/r/omencore
- Discord: https://discord.gg/ahcUC2Un

---

## 💾 Backup & Recovery

### Export Database
```bash
# Export all data
wrangler d1 export nbncompare --remote --output=backup.sql

# Export specific table
wrangler d1 execute nbncompare --remote --command "SELECT * FROM plans" > plans_backup.json
```

### Import Data
```bash
# From SQL file
wrangler d1 execute nbncompare --remote --file=backup.sql

# Specific inserts
wrangler d1 execute nbncompare --remote --command "INSERT INTO..."
```

---

## 🎨 Design Tokens

**Spacing:**
- Small: 8px
- Medium: 16px
- Large: 24px
- XLarge: 32px

**Border Radius:**
- Small: 6px
- Medium: 8px
- Large: 12px
- XLarge: 16px

**Shadows:**
- Light: `0 2px 8px rgba(0,0,0,0.08)`
- Medium: `0 10px 30px rgba(0,0,0,0.15)`
- Heavy: `0 15px 40px rgba(0,0,0,0.2)`

**Animation:**
- Fast: 0.2s
- Medium: 0.3s
- Slow: 0.5s

---

## 🚦 Performance Benchmarks

**Target Metrics:**
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Total Blocking Time: < 200ms
- Cumulative Layout Shift: < 0.1

**Current (estimated):**
- FCP: ~0.8s ✅
- LCP: ~1.2s ✅
- TTI: ~2.0s ✅
- TBT: ~100ms ✅
- CLS: ~0.05 ✅

---

**Quick Start:** Just run `pnpm build` and `wrangler deploy` to push changes! 🚀
