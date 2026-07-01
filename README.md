# NBN Compare

**Live Site:** [https://nbncompare.info](https://nbncompare.info)

An open-source NBN plan comparison tool for Australia. Compare internet plans from 30+ providers with real-time pricing, promotional offers, and official NBN availability checks.

## ✨ Features

- 🔍 **NBN Address Check** - Verify service availability using official NBN Co API
- 📊 **153 Plans from 30 Providers** - Compare plans from Telstra, Optus, TPG, Aussie Broadband, iiNet, and more
- 🎯 **Smart Filters** - Filter by speed tier (25-2000 Mbps), contract type, data allowance, modem, and technology type
- 🏷️ **Promotional Pricing** - See intro offers with duration (e.g., "$85/mo for 6 months")
- ⚖️ **Plan Comparison** - Compare up to 3 plans side-by-side in detailed modal
- ⭐ **Favorites System** - Star your preferred plans for easy comparison
- 🔎 **Search** - Find plans by provider or plan name
- 📡 **Fixed Wireless NBN** - Special support for regional/rural Fixed Wireless plans
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
   # Apply the canonical numbered migrations from the worker package:
   cd apps/worker
   wrangler d1 migrations apply nbncompare --remote
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
pnpm build
wrangler pages deploy dist
```

Or connect your GitHub repo to Cloudflare Pages for automatic deployments.

## 🔌 API Endpoints

### Public
- `GET /api/plans` - List all plans
  - Query params: `?speed=100&contract=month-to-month&data=unlimited&modem=1&technology=standard`
  - Technology types: `standard`, `fixed-wireless`
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

## 📊 Current Coverage (January 2026)

- **153 active plans** across **30 providers** (83% of target)
- **Speed tiers:** 25, 50, 100, 250, 1000, 2000 Mbps
- **Technology types:** Standard NBN + Fixed Wireless
- **30 promotional offers** with intro pricing

### Major Providers (10+ plans)
- Telstra, Optus, TPG, Aussie Broadband (10 plans each)
- Carbon Communications (12 plans)

### Medium Providers (4-9 plans)
- Exetel, Mate, Superloop, Tangerine, iiNet, Vodafone (4-9 plans)
- Internode, Kogan, MyRepublic, Belong, Amaysim (4 plans each)

### Growing Coverage
- 20+ additional providers with 1-4 plans
- Includes regional specialists: Skymesh, Leaptel, Launtel
- Budget providers: Dodo, SpinTel, Moose Mobile, Buddy

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Add more provider parsers (see `packages/shared/src/parsers/providers/`)
- Improve plan detection and price extraction
- Add more filters and comparison features
- Enhance mobile UI

## 📄 License

Open source - feel free to use and modify.

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup

1. **Prerequisites**
   - Node.js 18+
   - pnpm package manager
   - Wrangler CLI for Cloudflare Workers

2. **Clone and Install**
   ```bash
   git clone https://github.com/theantipopau/nbncompare.git
   cd nbncompare
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your Cloudflare credentials
   ```

4. **Development**
   ```bash
   pnpm dev  # Runs both frontend and worker in development
   ```

### Code Quality

- **Linting**: `pnpm lint`
- **Testing**: `pnpm --filter @clearnbn/web test`
- **Type Checking**: TypeScript is configured with strict mode

### Architecture

- **Frontend**: React + Vite, TypeScript, responsive design
- **Backend**: Cloudflare Workers + D1 database
- **Data**: Automated scraping with quality monitoring

### Adding a New Provider

1. Add parser in `packages/shared/src/parsers/providers/`
2. Update test samples in `packages/shared/test-samples/`
3. Add provider metadata in worker migrations
4. Test with `pnpm --filter @clearnbn/shared test:parsers`

### Pull Requests

- Follow conventional commit format
- Include tests for new features
- Update documentation as needed
- Ensure CI passes

## 🙏 Credits

- NBN Co for their public API
- Cloudflare for free hosting infrastructure
- All contributors

---

**Website:** [https://nbncompare.info](https://nbncompare.info)  
**Built with ❤️ for Australian internet users**



