# NBN Compare

[![Live site](https://img.shields.io/badge/live-nbncompare.info-0f766e)](https://nbncompare.info)
[![Frontend tests](https://img.shields.io/badge/tests-8%20passing-16a34a)](apps/web/src)

NBN Compare is an open-source Australian broadband comparison tool. It brings provider plans, promotional pricing, technical metadata, address qualification, and freshness signals into one no-sign-up interface.

Live site: [nbncompare.info](https://nbncompare.info)
Repository: [github.com/theantipopau/nbncompare](https://github.com/theantipopau/nbncompare)

Current production status: [docs/CURRENT_STATUS.md](docs/CURRENT_STATUS.md)

## Features

- Address search and NBN technology qualification
- Paginated plan search across active providers
- Filters for speed, upload speed, contract, data, modem, setup fees, service type, IPv6, CGNAT, static IP, and Australian support
- Promotional and ongoing pricing shown separately
- Side-by-side comparison for up to three plans
- Favorites, saved filter presets, price history, and provider detail pages
- Standard NBN, Fixed Wireless, 5G Home, satellite, and business views
- Provider freshness indicators and public system status
- Responsive mobile card layout, dark mode, keyboard navigation, and reduced-motion support

## Architecture

This is a pnpm workspace:

- `apps/web`: React + TypeScript + Vite frontend, deployed to Cloudflare Pages
- `apps/worker`: Cloudflare Worker API, scheduled scraper, admin endpoints, and D1 access
- `packages/shared`: shared plan types, validation, normalization, generic parser, and provider parsers
- `apps/worker/migrations`: numbered D1 migrations

The provider refresh queue runs every two hours. It prioritizes providers using `provider_scrape_strategy`, limits scrape concurrency, supports Browser Rendering for JavaScript-heavy sites, updates current plan fields, and retires plans no longer present in a successful provider scrape.

Data is sourced from provider websites and should be verified against the provider before ordering. Scraping success and coverage vary by provider because of redirects, JavaScript rendering, bot protection, and changing site layouts.

## Local Development

### Prerequisites

- Node.js 18+
- pnpm
- Cloudflare Wrangler for Worker/D1 development and deployment
- A Cloudflare account for remote D1, Pages, and Worker operations

### Install and run

```bash
git clone https://github.com/theantipopau/nbncompare.git
cd nbncompare
pnpm install
pnpm dev
```

The combined command starts the Vite frontend and Worker development server. You can also run them separately:

```bash
pnpm --filter @clearnbn/web dev
pnpm --filter @clearnbn/worker dev
```

For remote D1 migrations:

```bash
cd apps/worker
wrangler d1 migrations apply nbncompare --remote
```

Keep secrets such as `ADMIN_TOKEN` outside Git. Use Wrangler secrets or local `.dev.vars`/environment configuration; do not commit credentials.

## Quality Checks

```bash
pnpm lint
pnpm --filter @clearnbn/web test:run
pnpm --filter @clearnbn/shared test:parsers
pnpm --filter @clearnbn/web build
```

The Worker TypeScript boundary excludes the Node-only provider URL verification utility. To typecheck the deployed Worker source:

```bash
cd apps/worker
npx tsc --noEmit -p tsconfig.json
```

## Deployment

Build the frontend before deploying the Worker because the Worker configuration serves the frontend distribution as assets:

```bash
pnpm --filter @clearnbn/web build
npx wrangler pages deploy apps/web/dist --project-name=nbncompare-web
npx wrangler deploy --config apps/worker/wrangler.toml
```

The Worker is configured for:

- `nbncompare.info/*`
- `www.nbncompare.info/*`
- D1 database binding `D1`
- KV binding `CACHE`
- Browser Rendering binding `BROWSER`
- AI binding `AI`
- Cron schedule `0 */2 * * *`

## Public API

- `GET /api/plans` - non-paginated plan queries
- `GET /api/plans/paginated` - paginated plans, aggregate stats, search, provider filters, and freshness-aware filtering
- `GET /api/providers` - active provider list
- `GET /api/providers/:slug` - provider details
- `GET /api/price-history/:id` - plan price history
- `GET /api/address/search` - address suggestions
- `GET /api/address/qualify` - service qualification
- `GET /api/status` - database, provider, plan, and scraper health
- `GET /api/status/stale` - providers outside their refresh target

Administrative and internal routes require `x-admin-token`, including manual scraping, data verification, provider review, feedback management, and scraper-run history.

## Adding a Provider

1. Add or update provider seed data in a numbered migration.
2. Add a specialized parser under `packages/shared/src/parsers/providers/` when the provider needs custom extraction.
3. Register the parser in `packages/shared/src/parsers/index.ts`.
4. Add or update parser fixtures and run `pnpm --filter @clearnbn/shared test:parsers`.
5. Add provider scrape strategy settings when Browser Rendering, priority, timeout, or retry behavior needs tuning.
6. Verify the provider URL, pricing, promotional duration, source URL, and extracted plan count before deployment.

## Contributing

Pull requests are welcome. Keep changes focused, include tests for behavior changes, update documentation when commands or public contracts change, and do not commit secrets or generated `.wrangler` output.

## License

Open source. See the repository history and contribution guidance before redistributing provider content.

## Credits

Built for Australian internet users. Thanks to NBN Co for public availability information and Cloudflare for the edge platform.







