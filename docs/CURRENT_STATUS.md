# Current Project Status

**Updated:** 2026-09-09
**Branch:** `main`
**Latest application commit:** `46b5847`

## Live Services

- Website: [https://nbncompare.info](https://nbncompare.info)
- Latest Pages deployment preview: [https://d3f11d6f.nbncompare-web.pages.dev](https://d3f11d6f.nbncompare-web.pages.dev)
- Worker: `nbncompare-worker.matt-hurley91.workers.dev`
- Worker routes: `nbncompare.info/*`, `www.nbncompare.info/*`
- Cron: every two hours (`0 */2 * * *`)

## Current API Smoke Checks

- `GET /` returns `200`
- `GET /api/status` returns `200` and confirms D1 connectivity
- `GET /api/plans/paginated?page=0&pageSize=1` returns `200`

## Frontend Quality

- Web TypeScript check passes
- Production Vite build passes
- Frontend tests pass: 8 tests across 3 test files
- Responsive comparison flow includes mobile cards, filters, comparison tray, dark mode, and reduced-motion support

## Data Pipeline

The Worker refresh queue prioritizes providers using `provider_scrape_strategy`, runs every two hours, limits scrape concurrency, supports Browser Rendering, updates current plan fields, and deactivates plans no longer present in a successful provider scrape.

The catalogue currently contains 56 active providers and 250 active plans according to the live status endpoint. Provider health and plan quality can change between refreshes. The same endpoint currently reports providers requiring attention and plans missing source, price, or speed data; these are tracked as ongoing data-quality work rather than hidden from operators.

## Release Commands

```bash
pnpm --filter @clearnbn/web build
npx wrangler pages deploy apps/web/dist --project-name=nbncompare-web
npx wrangler deploy --config apps/worker/wrangler.toml
```

## Documentation Note

See the root [CHANGELOG.md](../CHANGELOG.md) for the consolidated release history and fixes.

Files named `DEPLOYMENT_*`, `SESSION_*`, `PHASE_*`, and similar dated reports describe historical work and may contain earlier provider counts, schedules, and deployment IDs. Use this document and the root `README.md` for the current state.
