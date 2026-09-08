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

type PaginatedEnv = {
  D1?: D1DatabaseLike;
};

const CACHE_TTL = 300; // 5 minutes in seconds

export async function getPagedPlans(req: Request, env?: PaginatedEnv) {
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
    const search = url.searchParams.get("search")?.trim().toLowerCase();
    const provider = url.searchParams.get("provider");
    const providerParams = url.searchParams.getAll("provider");
    const discount = url.searchParams.get("discount");
    const contractType = url.searchParams.get("contract");
    const dataAllowance = url.searchParams.get("data");
    const modemIncluded = url.searchParams.get("modem");
    const technologyType = url.searchParams.get("technology");
    const planType = url.searchParams.get("planType");
    const serviceType = url.searchParams.get("serviceType");
    const uploadSpeedParam = url.searchParams.get("uploadSpeed");
    const ipv6 = url.searchParams.get("ipv6") === "1";
    const noCgnat = url.searchParams.get("noCgnat") === "1";
    const auSupport = url.searchParams.get("auSupport") === "1";
    const staticIp = url.searchParams.get("staticIp") === "1";
    const setupFee = url.searchParams.get("setupFee");
    const modemCost = url.searchParams.get("modemCost");
    const excludeSixMonth = url.searchParams.get("exclude6Month") === "1";
    const hideExpiredPromos = url.searchParams.get("hideExpiredPromos") === "1";

    const db = (env?.D1 || (await getDb())) as D1DatabaseLike;

    // Build WHERE clause
    let whereClause = " WHERE is_active = 1";
    const params: unknown[] = [];

    let speed: number | null = null;
    if (speedParam) {
      const parsed = parseInt(speedParam, 10);
      if (!isNaN(parsed)) speed = parsed;
    }
    if (speed !== null) { whereClause += ` AND speed_tier = ?`; params.push(speed); }
    if (search) {
      whereClause += ` AND (LOWER(plan_name) LIKE ? OR provider_id IN (SELECT id FROM providers WHERE LOWER(name) LIKE ?))`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }
    if (providerParams.length > 0) {
      if (providerParams.length === 1) {
        whereClause += ` AND provider_id = (SELECT id FROM providers WHERE slug = ?)`;
        params.push(providerParams[0]);
      } else {
        whereClause += ` AND provider_id IN (SELECT id FROM providers WHERE slug IN (${providerParams.map(() => "?").join(",")}))`;
        params.push(...providerParams);
      }
    } else if (provider) {
      whereClause += ` AND provider_id = (SELECT id FROM providers WHERE slug = ?)`;
      params.push(provider);
    }
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
    if (ipv6) whereClause += ` AND provider_id IN (SELECT id FROM providers WHERE ipv6_support >= 1)`;
    if (noCgnat) whereClause += ` AND provider_id IN (SELECT id FROM providers WHERE cgnat = 0 OR cgnat_opt_out >= 1)`;
    if (auSupport) whereClause += ` AND provider_id IN (SELECT id FROM providers WHERE australian_support >= 1)`;
    if (staticIp) whereClause += ` AND provider_id IN (SELECT id FROM providers WHERE static_ip_available >= 1)`;
    if (setupFee === "0") whereClause += ` AND setup_fee_cents = 0`;
    if (setupFee === "1-100") whereClause += ` AND setup_fee_cents BETWEEN 100 AND 10000`;
    if (setupFee === "100-200") whereClause += ` AND setup_fee_cents BETWEEN 10000 AND 20000`;
    if (modemCost === "0") whereClause += ` AND modem_cost_cents = 0`;
    if (modemCost === "paid") whereClause += ` AND modem_cost_cents > 0`;
    if (excludeSixMonth) {
      whereClause += ` AND (contract_type IS NULL OR contract_type != '6-month') AND NOT (intro_duration_days BETWEEN 175 AND 185)`;
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

    // 1b. Get aggregate stats for current filter set (across all pages)
    const statsQ = `
      SELECT
        COUNT(DISTINCT prov.id) as total_providers,
        MIN(p.ongoing_price_cents) as cheapest_cents,
        MAX(p.speed_tier) as top_speed
      FROM plans p
      JOIN providers prov ON p.provider_id = prov.id
      ${whereClause}
    `;
    const statsRes = await db.prepare(statsQ).bind(...params).first() as {
      total_providers?: number | null;
      cheapest_cents?: number | null;
      top_speed?: number | null;
    } | null;

    // 2. Get paginated results (explicit columns only to avoid timeout on large result serialization)
    const plansQ = `
      SELECT 
        p.id, p.plan_name, p.speed_tier, p.intro_price_cents, p.intro_duration_days,
        p.ongoing_price_cents, p.setup_fee_cents, p.modem_cost_cents, p.source_url,
        p.last_checked_at, p.contract_type, p.data_allowance, p.modem_included,
        p.technology_type, p.upload_speed_mbps, p.promo_code, p.promo_description,
        p.promo_expires_at, p.confidence_score, p.effective_monthly_cents,
        p.plan_type, p.service_type,
        prov.id as provider_id, prov.name as provider_name, prov.favicon_url,
        prov.ipv6_support as provider_ipv6_support,
        prov.cgnat as provider_cgnat,
        prov.cgnat_opt_out as provider_cgnat_opt_out,
        prov.static_ip_available as provider_static_ip_available,
        prov.australian_support as provider_australian_support,
        prov.parent_company as provider_parent_company,
        prov.routing_info as provider_routing_info,
        prov.description as provider_description,
        prov.support_hours as provider_support_hours,
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
      stats: {
        providers: statsRes?.total_providers ?? 0,
        cheapestCents: statsRes?.cheapest_cents ?? null,
        topSpeed: statsRes?.top_speed ?? null,
      },
      pagination: {
        page,
        pageSize,
        total: totalCount,
        totalPages,
        hasNextPage: page < totalPages - 1,
        hasPrevPage: page > 0,
      },
    };

    const response = jsonResponse(responseData);
    response.headers.set('Cache-Control', `public, max-age=${CACHE_TTL}`);
    return response;

  } catch (err: unknown) {
    const elapsed = Date.now() - startTime;
    console.error(`[plans-paginated] FAIL after ${elapsed}ms:`, err);
    return jsonResponse({ ok: false, error: String(err), elapsed }, 500);
  }
}
