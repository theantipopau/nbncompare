# Changelog

This file records shipped fixes and notable release work. It is intentionally concise; detailed historical plans remain under `docs/`.

## 2026-09-09

### Trustworthy Decisions: price and plan integrity

- `f01e846` Stopped representing equal introductory and ongoing prices as promotions unless a verified duration and price difference exist.
- Added parser regression assertions for equal-price offers and HTML leakage in plan names.
- Added migration `0044_clear_unverified_promotions.sql`; 40 legacy equal-price promotion rows were cleaned in production.
- `ea1b901` Quarantined six active plans whose names were HTML-only parser fragments and tightened future incomplete-markup cleanup.
- Production verification: 0 equal intro/ongoing promotions and 0 HTML-leaking active plan names; 18 active plans still lack source URLs and remain in the provenance backlog.

### Wireless coverage and service classification

- `46b5847` Fixed server-side Fixed Wireless filtering so the UI no longer paginates the entire residential catalogue and filters only the current page.
- Added migration `0043_normalize_service_categories.sql` to classify obvious Fixed Wireless, 5G Home, and satellite plans from plan names and source URLs.
- Expanded Fixed Wireless speed choices to 25, 50, 75, 100, 200, and 400 Mbps.
- Expanded 5G Home speed choices to 50, 100, 250, 300, and 500 Mbps.
- Production verification: 26 Fixed Wireless plans are available across two pages; Telstra and Optus plans are present.

### Blog and SPA routing

- `6ca93ff` Fixed blog cards and article links to use the custom SPA history router.
- Added guides covering Wi-Fi 7 and NBN home networks, 5G Home versus NBN, and interpreting ISP promotions.
- `739dc71`, `a9ce5c1`, `e9cd1e6` Added the Worker asset binding and index fallback required for direct `/blog` and `/blog/...` navigation.
- Verified the blog index, existing CGNAT article, and all new article routes return HTTP 200.

### Provider logos

- `6e24726` Added canonical provider URLs to plan API responses.
- Logo resolution now tries stored logos, canonical-domain favicons, known provider domains, guessed domains, and initials/color fallback.
- Worker favicon updates now derive domains from provider canonical URLs instead of relying only on a hardcoded slug map.

### Provider health and operations

- `7d8744d` Added provider refresh age, target interval, stale state, and last error to the admin provider verification API.
- Added the Admin Dashboard Provider Health queue for stale and failed providers.
- Added recursive `.wrangler/` ignores and removed tracked generated Wrangler temporary files.

### Frontend and backend hardening

- `9a240e9` Refreshed the comparison UI palette, typography, mobile card layout, comparison tray, reduced-motion behavior, and provider refresh pipeline.
- Added bounded scraper concurrency, stale-plan retirement after successful scrapes, empty-parse failure handling, and direct replacement of refreshed promotion fields.
- Added server-side search and filter handling to paginated plans.
- `2819289` Fixed the production `/api/status` router timeout by adding direct dispatch.
- Fixed admin feedback updates, scraper-run history, provider verification typing, and strict TypeScript configuration.

## 2026-07-01

- `6377f71` Consolidated migration handling.
- `4fbdc46` Streamlined the comparison page.
- `d4cbdfb` Expanded parser coverage.
- `19bd802` Hardened admin authentication.
- `89c2465` Normalized provider API responses.
- `2630c1c` Unified dark-mode state.
- `b27de68` Added public API rate limiting.
- `e1e8ed1` Added multi-provider plan filters.

## Known follow-up work

- 5G Home currently has 10 catalogue plans; more provider-specific 5G source URLs and parsers are still needed.
- The live status endpoint may report providers with scrape failures or incomplete source/price/speed data. These are visible in the provider health queue and require provider-specific remediation.
- Remote D1 already contains schema history that does not fully match the local migration ledger. Migration `0043` was applied directly to the existing remote schema after Wrangler correctly refused to replay incompatible historical migrations.
