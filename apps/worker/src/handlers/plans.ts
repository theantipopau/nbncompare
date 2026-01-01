import { getDb } from "../lib/db";
import { jsonResponse } from "../lib/cors";

type D1Result = {
  bind: (...args: unknown[]) => D1Result;
  all: () => Promise<{ results: unknown[] }>;
};

export async function getPlans(req: Request) {
  try {
    const url = new URL(req.url);
    const speedParam = url.searchParams.get("speed");
    const provider = url.searchParams.get("provider");
    const discount = url.searchParams.get("discount");
    const contractType = url.searchParams.get("contract");
    const dataAllowance = url.searchParams.get("data");
    const modemIncluded = url.searchParams.get("modem");
    const limitParam = url.searchParams.get("limit") ?? "100";

    let speed: number | null = null;
    if (speedParam) {
      const parsed = parseInt(speedParam, 10);
      if (isNaN(parsed)) {
        return jsonResponse({ ok: false, error: "invalid speed parameter" }, 400);
      }
      speed = parsed;
    }

    let limit = parseInt(limitParam, 10);
    if (isNaN(limit) || limit < 1) limit = 100;
    limit = Math.min(limit, 500);

    const db = await getDb() as unknown as { prepare: (q: string) => { all: (...args: unknown[]) => Promise<any> } };

    let q = `SELECT p.*, prov.name as provider_name, prov.favicon_url FROM plans p JOIN providers prov ON p.provider_id = prov.id WHERE is_active = 1`;
    const params: unknown[] = [];
    if (speed !== null) { q += ` AND p.speed_tier = ?`; params.push(speed); }
    if (provider) { q += ` AND prov.slug = ?`; params.push(provider); }
    if (discount === "1") { q += ` AND p.intro_price_cents IS NOT NULL`; }
    if (contractType) { q += ` AND p.contract_type = ?`; params.push(contractType); }
    if (dataAllowance) { q += ` AND p.data_allowance = ?`; params.push(dataAllowance); }
    if (modemIncluded === "1") { q += ` AND p.modem_included = 1`; }

    // SQLite-friendly NULLS LAST emulation: order by (ongoing_price_cents IS NULL), then value asc
    q += ` ORDER BY (p.ongoing_price_cents IS NULL), p.ongoing_price_cents ASC LIMIT ?`;
    params.push(limit);

    const rowsRes = await (db.prepare(q) as D1Result).bind(...params).all();
    const rows = rowsRes && (rowsRes as any).results ? (rowsRes as any).results : rowsRes;

    return jsonResponse({ ok: true, rows });
  } catch (err: unknown) {
    console.error('getPlans error:', err);
    return jsonResponse({ ok: false, error: String(err), stack: err instanceof Error ? err.stack : null }, 500);
  }
}
