/**
 * Free-only fetch helper (Browser Rendering removed).
 *
 * History: this module previously wrapped Cloudflare Browser Rendering
 * (`env.BROWSER.launch()`). That binding caused a large unexpected bill
 * (dozens of concurrent browsers, 100+ hours), so it has been fully removed.
 *
 * Current strategy — 100% free:
 * 1. Plain fetch with User-Agent rotation + realistic headers (see scraper-api.ts)
 * 2. Exponential backoff + per-host circuit breaker (see scraper-api.ts)
 * 3. If a JS-heavy provider cannot be parsed, it is marked `needs_review`
 *    instead of launching a headless browser. Operators can update those
 *    few plans manually via the admin UI, or the GitHub Actions workflow
 *    (which can run Playwright on GitHub's free runners) handles them.
 */

export interface BrowserBinding {
  // Kept only so old env typings don't break external tooling.
  // Never provided — any call that requires it throws.
  launch?: never;
}

interface FetchSettings {
  timeoutMs?: number;
  maxRetries?: number;
}

/**
 * Previously rendered via headless browser. Now always throws with a
 * clear message so callers can't accidentally reintroduce paid usage.
 */
export async function fetchViaBrowser(url: string): Promise<string> {
  throw new Error(
    `Browser rendering is disabled (removed to stay on Cloudflare free plan). ` +
      `Plain fetch failed for ${url}; provider flagged for manual review / GitHub Actions Playwright run.`
  );
}

/**
 * Smart fallback chain (free only):
 * User-Agent rotation, then give up with a clear error.
 */
export async function fetchWithSmartFallback(
  url: string,
  _browserBinding?: unknown,
  settings: FetchSettings = {}
): Promise<string> {
  const { fetchWithFallback } = await import('./scraper-api');
  const maxRetries = settings.maxRetries ?? 3;
  console.log(`Attempting plain fetch (User-Agent rotation) for ${url}...`);
  return await fetchWithFallback(url, undefined, 0, {
    timeoutMs: settings.timeoutMs,
    maxRetries,
  });
}
