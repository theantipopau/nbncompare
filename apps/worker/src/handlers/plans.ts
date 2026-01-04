import { getDb } from "../lib/db";
import { jsonResponse } from "../lib/cors";

type D1Result = {
  bind: (...args: unknown[]) => D1Result;
  all: () => Promise<{ results: unknown[] }>;
};

// Cache TTL: 5 minutes (300 seconds)
const CACHE_TTL = 300;

export async function getPlans(req: Request, env?: { CACHE?: any }) {
  try {
    const url = new URL(req.url);
    const speedParam = url.searchParams.get("speed");
    const provider = url.searchParams.get("provider");
    const discount = url.searchParams.get("discount");
    const contractType = url.searchParams.get("contract");
    const dataAllowance = url.searchParams.get("data");
    const modemIncluded = url.searchParams.get("modem");
    const technologyType = url.searchParams.get("technology");
    const planType = url.searchParams.get("planType");
    const limitParam = url.searchParams.get("limit") ?? "100";

    // Generate cache key from query parameters
    const cacheKey = `plans:${url.searchParams.toString() || 'all'}`;
    
    // Try to get from cache first
    if (env?.CACHE) {
      const cached = await env.CACHE.get(cacheKey);
      if (cached) {
        const response = jsonResponse(JSON.parse(cached));
        response.headers.set('X-Cache', 'HIT');
        return response;
      }
    }

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

    let q = `SELECT p.*, prov.name as provider_name, prov.favicon_url,
      prov.ipv6_support as provider_ipv6_support,
      prov.cgnat as provider_cgnat,
      prov.cgnat_opt_out as provider_cgnat_opt_out,
      prov.static_ip_available as provider_static_ip_available,
      prov.australian_support as provider_australian_support,
      prov.parent_company as provider_parent_company,
      prov.routing_info as provider_routing_info,
      prov.description as provider_description,
      prov.support_hours as provider_support_hours,
      CASE 
        WHEN ph.price_cents IS NOT NULL AND p.ongoing_price_cents < ph.price_cents THEN 'down'
        WHEN ph.price_cents IS NOT NULL AND p.ongoing_price_cents > ph.price_cents THEN 'up'
        ELSE NULL
      END as price_trend
      FROM plans p 
      JOIN providers prov ON p.provider_id = prov.id
      LEFT JOIN (
        SELECT plan_id, price_cents,
          ROW_NUMBER() OVER (PARTITION BY plan_id ORDER BY recorded_at DESC) as rn
        FROM price_history
      ) ph ON p.id = ph.plan_id AND ph.rn = 2
      WHERE is_active = 1`;
    const params: unknown[] = [];
    if (speed !== null) { q += ` AND p.speed_tier = ?`; params.push(speed); }
    if (provider) { q += ` AND prov.slug = ?`; params.push(provider); }
    if (discount === "1") { q += ` AND p.intro_price_cents IS NOT NULL`; }
    if (contractType) { q += ` AND p.contract_type = ?`; params.push(contractType); }
    if (dataAllowance) { q += ` AND p.data_allowance = ?`; params.push(dataAllowance); }
    if (modemIncluded === "1") { q += ` AND p.modem_included = 1`; }
    if (technologyType) { q += ` AND p.technology_type = ?`; params.push(technologyType); }
    if (planType) { q += ` AND p.plan_type = ?`; params.push(planType); }

    // SQLite-friendly NULLS LAST emulation: order by (ongoing_price_cents IS NULL), then value asc
    q += ` ORDER BY (p.ongoing_price_cents IS NULL), p.ongoing_price_cents ASC LIMIT ?`;
    params.push(limit);

    const rowsRes = await (db.prepare(q) as D1Result).bind(...params).all();
    const rows = rowsRes && (rowsRes as any).results ? (rowsRes as any).results : rowsRes;

    const responseData = { ok: true, rows };
    
    // Store in cache
    if (env?.CACHE) {
      await env.CACHE.put(cacheKey, JSON.stringify(responseData), {
        expirationTtl: CACHE_TTL
      });
    }

    const response = jsonResponse(responseData);
    response.headers.set('X-Cache', 'MISS');
    response.headers.set('Cache-Control', `public, max-age=${CACHE_TTL}`);
    return response;
  } catch (err: unknown) {
    console.error('getPlans error:', err);
    return jsonResponse({ ok: false, error: String(err), stack: err instanceof Error ? err.stack : null }, 500);
  }
}
