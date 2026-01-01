# NBN Compare

**Live Site:** [https://nbncompare.info](https://nbncompare.info)

An open-source NBN plan comparison tool for Australia. Compare internet plans from 40+ providers with real-time pricing, speed tiers, and official NBN availability checks.

## ✨ Features

- 🔍 **NBN Address Check** - Verify service availability using official NBN Co API
- 📊 **40+ Providers** - Compare plans from Telstra, Optus, TPG, Aussie Broadband, iiNet, Superloop, and more
- 🎯 **Smart Filters** - Filter by speed tier, contract type, data allowance, and modem inclusion
- ⭐ **Favorites System** - Star your preferred plans for easy comparison
- 🔎 **Search** - Find plans by provider or plan name
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📱 **Mobile Responsive** - Optimized for all devices
- 💰 **Always Free** - No sign-ups, no hidden fees, no affiliate links

## 🏗️ Architecture

Built on Cloudflare's edge platform for maximum performance and zero hosting costs:
- **Frontend:** React + Vite, deployed on Cloudflare Pages
- **Backend:** Cloudflare Workers with D1 (SQLite) database
- **Scraping:** Automated daily updates via scheduled Cloudflare Workers
- **Cost:** $0/month (all services on free tier)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- [pnpm](https://pnpm.io/) package manager
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (`npm i -g wrangler`)
- Cloudflare account (free tier works)

### Local Development

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and set ADMIN_TOKEN, CF_ACCOUNT_ID, CF_API_TOKEN
   ```

3. **Set up database:**
   ```bash
   # Create D1 database in Cloudflare dashboard, then run migrations:
   wrangler d1 execute nbncompare --remote --file migrations/0001_create_tables.sql
   wrangler d1 execute nbncompare --remote --file migrations/0002_add_plan_filters.sql
   ```

4. **Run development servers:**
   ```bash
   # Frontend (http://localhost:5173):
   pnpm --filter @clearnbn/web dev
   
   # Worker (local):
   pnpm --filter @clearnbn/worker dev
   
   # Or run both:
   pnpm dev
   ```

## 📦 Deployment

### Deploy Worker
```bash
cd apps/worker
wrangler deploy
```

### Deploy Frontend
```bash
cd apps/web
npm run build
wrangler pages deploy dist
```

Or connect your GitHub repo to Cloudflare Pages for automatic deployments.

## 🔌 API Endpoints

### Public
- `GET /api/plans` - List all plans
  - Query params: `?speed=100&contract=month-to-month&data=unlimited&modem=1`
- `GET /api/providers` - List all providers
- `GET /api/providers/:slug` - Get provider details
- `GET /api/status` - System status and last cron run

### Internal
- `POST /internal/update-favicons` - Update provider favicons
- `GET /internal/cron/run` - Trigger manual scrape (requires ADMIN_TOKEN)

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, CSS3
- **Backend:** Cloudflare Workers, TypeScript
- **Database:** Cloudflare D1 (SQLite)
- **Automation:** Cloudflare Cron Triggers (daily updates)
- **Hosting:** Cloudflare Pages + Workers (100% free)

## 📊 Current Coverage

- **Providers:** 37 configured
- **Plans:** 30+ active plans across 9 providers
- **Speed Tiers:** 25, 50, 100, 250, 1000, 2000 Mbps

Providers with active plans:
- Telstra (6 plans)
- Optus (5 plans)
- TPG (5 plans)
- Aussie Broadband (5 plans)
- iiNet (3 plans)
- Superloop (3 plans)
- Dodo, SpinTel, Launtel (1+ plans each)

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Add more provider parsers (see `packages/shared/src/parsers/providers/`)
- Improve plan detection and price extraction
- Add more filters and comparison features
- Enhance mobile UI

## 📄 License

Open source - feel free to use and modify.

## 🙏 Credits

- NBN Co for their public API
- Cloudflare for free hosting infrastructure
- All contributors

---

**Website:** [https://nbncompare.info](https://nbncompare.info)  
**Built with ❤️ for Australian internet users**



