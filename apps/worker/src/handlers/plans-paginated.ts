import { getDb } from "../lib/db";
import { jsonResponse } from "../lib/cors";

type D1Statement = {
  bind: (...args: unknown[]) => D1Statement;
  all: () => Promise<{ results?: unknown[] }>;
  first: () => Promise<unknown>;
  run: () => Promise<{ meta: any }>;
};

type D1DatabaseLike = {
  prepare: (q: string) => D1Statement;
};

type CacheLike = {
  put: (key: string, value: string, options?: { expirationTtl?: number }) => Promise<void>;
};

const CACHE_TTL = 300; // 5 minutes in seconds
const PAGE_CACHE_TTL_MS = 30 * 1000; // 30 seconds in-memory

// Local in-memory cache for page counts
const pageCountCache = new Map<string, { count: number; expires: number }>();

export async function getPagedPlans(req: Request, env?: { CACHE?: CacheLike }) {
  const startTime = Date.now();
  try {
    const url = new URL(req.url);
    console.log(`[plans-paginated] START:`, url.search);
    
    // Parse pagination parameters
    const page = Math.max(0, parseInt(url.searchParams.get("page") ?? "0"));
    const pageSize = Math.min(Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "20")), 100);
    const offset = page * pageSize;
    console.log(`[plans-paginated] page=${page} size=${pageSize} offset=${offset}`);

    // Build filter parameters from query string (same as /api/plans)
    const speedParam = url.searchParams.get("speed");
    const provider = url.searchParams.get("provider");
    const discount = url.searchParams.get("discount");
    const contractType = url.searchParams.get("contract");
    const dataAllowance = url.searchParams.get("data");
    const modemIncluded = url.searchParams.get("modem");
    const technologyType = url.searchParams.get("technology");
    const planType = url.searchParams.get("planType");
    const serviceType = url.searchParams.get("serviceType");
    const uploadSpeedParam = url.searchParams.get("uploadSpeed");
    const hideExpiredPromos = url.searchParams.get("hideExpiredPromos") === "1";

    // Generate cache key
    const cacheKey = `plans_paged:${url.searchParams.toString()}`;
    const now = Date.now();

    // Try in-memory cache first
    const cached = pageCountCache.get(cacheKey);
    if (cached && cached.expires > now) {
      // Use cached total count for pagination
    }

    const db = (await getDb()) as D1DatabaseLike;

    // Build WHERE clause
    let whereClause = " WHERE is_active = 1";
    const params: unknown[] = [];

    let speed: number | null = null;
    if (speedParam) {
      const parsed = parseInt(speedParam, 10);
      if (!isNaN(parsed)) speed = parsed;
    }
    if (speed !== null) { whereClause += ` AND speed_tier = ?`; params.push(speed); }
    if (provider) { whereClause += ` AND provider_id = (SELECT id FROM providers WHERE slug = ?)`; params.push(provider); }
    if (discount === "1") {
      whereClause += ` AND (intro_price_cents IS NOT NULL OR promo_code IS NOT NULL OR promo_description IS NOT NULL)`;
    }
    if (contractType) { whereClause += ` AND contract_type = ?`; params.push(contractType); }
    if (dataAllowance) { whereClause += ` AND data_allowance = ?`; params.push(dataAllowance); }
    if (modemIncluded === "1") { whereClause += ` AND modem_included = 1`; }
    if (technologyType) { whereClause += ` AND technology_type = ?`; params.push(technologyType); }
    if (planType) { whereClause += ` AND plan_type = ?`; params.push(planType); }
    if (serviceType) { whereClause += ` AND service_type = ?`; params.push(serviceType); }
    if (uploadSpeedParam) {
      const uploadSpeed = parseInt(uploadSpeedParam, 10);
      if (!isNaN(uploadSpeed)) {
        whereClause += ` AND upload_speed_mbps >= ?`;
        params.push(uploadSpeed);
      }
    }
    if (hideExpiredPromos) {
      whereClause += ` AND (promo_expires_at IS NULL OR promo_expires_at > datetime('now'))`;
    }

    // 1. Get total count
    const countQ = `SELECT COUNT(*) as total FROM plans${whereClause}`;
    console.log(`[plans-paginated] COUNT query starting...`);
    const t1 = Date.now();
    const countRes = await db.prepare(countQ).bind(...params).first() as any;
    console.log(`[plans-paginated] COUNT query: ${Date.now() - t1}ms, result=${countRes?.total}`);
    const totalCount = countRes?.total ?? 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Cache the count
    pageCountCache.set(cacheKey, { count: totalCount, expires: now + PAGE_CACHE_TTL_MS });

    // 2. Get paginated results
    const plansQ = `
      SELECT p.*, prov.name as provider_name, prov.favicon_url,
        prov.ipv6_support as provider_ipv6_support,
        prov.cgnat as provider_cgnat,
        prov.cgnat_opt_out as provider_cgnat_opt_out,
        prov.static_ip_available as provider_static_ip_available,
        prov.australian_support as provider_australian_support,
        prov.parent_company as provider_parent_company,
        prov.routing_info as provider_routing_info,
        prov.description as provider_description,
        prov.support_hours as provider_support_hours,
        p.promo_code, p.promo_description, p.promo_expires_at,
        p.confidence_score, p.effective_monthly_cents,
        p.technology_type,
        NULL as price_trend
        FROM plans p 
        JOIN providers prov ON p.provider_id = prov.id
        ${whereClause}
        ORDER BY (p.ongoing_price_cents IS NULL), p.ongoing_price_cents ASC
        LIMIT ? OFFSET ?
    `;

    const pageParams = [...params, pageSize, offset];
    console.log(`[plans-paginated] SELECT query starting...`);
    const t2 = Date.now();
    const rowsRes = await db.prepare(plansQ).bind(...pageParams).all();
    console.log(`[plans-paginated] SELECT query: ${Date.now() - t2}ms, rows=${rowsRes?.results?.length ?? 0}`);
    const rawRows = Array.isArray(rowsRes?.results) ? rowsRes.results : [];

    // Mark plans whose promo has expired
    const now2 = new Date().toISOString();
    const rows = (rawRows as Record<string, unknown>[]).map((row) => {
      const expiresAt = row.promo_expires_at as string | null;
      const promoExpired = expiresAt != null && expiresAt < now2;
      if (!promoExpired) return row;
      return { ...row, intro_price_cents: null, intro_duration_days: null, promo_expired: true };
    });

    const responseData = {
      ok: true,
      rows,
      pagination: {
        page,
        pageSize,
        total: totalCount,
        totalPages,
        hasNextPage: page < totalPages - 1,
        hasPrevPage: page > 0,
      },
    };

    // Cache response
    if (env?.CACHE) {
      await env.CACHE.put(cacheKey + `:page${page}`, JSON.stringify(responseData), {
        expirationTtl: CACHE_TTL
      });
    }

    const response = jsonResponse(responseData);
    response.headers.set('Cache-Control', `public, max-age=${CACHE_TTL}`);
    return response;

  } catch (err: unknown) {
    const elapsed = Date.now() - startTime;
    console.error(`[plans-paginated] FAIL after ${elapsed}ms:`, err);
    return jsonResponse({ ok: false, error: String(err), elapsed }, 500);
  }
}
