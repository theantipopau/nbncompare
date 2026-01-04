import { fetchProvidersToUpdate } from "./providers-fetcher";
import { recordRunStartEnd } from "../lib/db";

export async function handleCron() {
  const runId = await recordRunStartEnd({ started: true });
  try {
    // Scrape up to 30 providers per run (most active providers)
    const result = await fetchProvidersToUpdate(undefined, 30);
    // record run results
    await recordRunStartEnd({ started: false, runId, notes: JSON.stringify(result) });
    return { ok: true, result };
  } catch (err: unknown) {
    console.error('Cron failed:', err);
    const note = err instanceof Error ? err.message : String(err);
    await recordRunStartEnd({ started: false, runId, notes: note });
    return { ok: false, error: note, stack: err instanceof Error ? err.stack : null };
  }
}
