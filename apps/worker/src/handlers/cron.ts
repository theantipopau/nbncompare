import { fetchProvidersToUpdate } from "./providers-fetcher";
import { recordRunStartEnd } from "../lib/db";

// Free-only cron: plain fetch, no Browser Rendering, no Workers AI.
// Triggered manually via POST /internal/cron/run (admin token) from
// GitHub Actions on a schedule — NOT via Cloudflare [triggers] crons,
// so there are zero background Worker runs unless explicitly called.
export async function handleCron(_env?: { SCRAPER_API_KEY?: string }) {
  const runId = await recordRunStartEnd({ started: true });
  try {
    // Small batch per run to stay well within free subrequest/CPU limits.
    // GitHub Actions loops / re-calls to cover the full provider list.
    const result = await fetchProvidersToUpdate(_env, 10);
    // AI summaries disabled: Workers AI binding removed (cost control).
    // Summaries already stored in DB remain readable via /api/ai/*.
    await recordRunStartEnd({ started: false, runId, notes: JSON.stringify(result) });
    return { ok: true, result };
  } catch (err: unknown) {
    console.error('Cron failed:', err);
    const note = err instanceof Error ? err.message : String(err);
    await recordRunStartEnd({ started: false, runId, notes: note });
    return { ok: false, error: note, stack: err instanceof Error ? err.stack : null };
  }
}
