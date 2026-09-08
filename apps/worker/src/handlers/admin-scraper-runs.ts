import { getDb } from "../lib/db";
import { jsonResponse } from "../lib/cors";

export async function getScraperRuns(_request: Request): Promise<Response> {
  try {
    const db = await getDb();
    const result = await db.prepare(`
      SELECT id, started_at, finished_at, status, notes
      FROM runs
      ORDER BY started_at DESC
      LIMIT 50
    `).all() as { results?: Array<Record<string, unknown>> };

    const runs = (result.results ?? []).map((run) => ({
      id: Number(run.id),
      started_at: run.started_at,
      finished_at: run.finished_at,
      status: run.status,
      providers_checked: 0,
      providers_changed: 0,
      plans_updated: 0,
      plans_added: 0,
      plans_removed: 0,
      errors_encountered: run.status === 'error' ? 1 : 0,
      notes: run.notes,
    }));

    return jsonResponse({ ok: true, runs });
  } catch (error) {
    console.error('Scraper run history error:', error);
    return jsonResponse({ ok: false, error: 'Failed to fetch scraper runs' }, 500);
  }
}
