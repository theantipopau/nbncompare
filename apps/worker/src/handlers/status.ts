import { getDb } from "../lib/db";

// Cache TTL for status: 5 minutes (300 seconds)
const STATUS_CACHE_TTL = 300;

export async function getStatus(_req: Request, env?: { CACHE?: any }) {
  try {
    // Try to get from cache first
    const cacheKey = 'status:system';
    if (env?.CACHE) {
      const cached = await env.CACHE.get(cacheKey);
      if (cached) {
        const response = new Response(cached, {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'X-Cache': 'HIT'
          }
        });
        return response;
      }
    }

    const db = await getDb();
  
  // Get last run information
  const lastRun = await db.prepare("SELECT * FROM runs ORDER BY started_at DESC LIMIT 1").first();
  
  // Get provider counts
  const totalProviders = await db.prepare("SELECT COUNT(*) as count FROM providers WHERE active = 1").first() as any;
  const providersWithErrors = await db.prepare("SELECT COUNT(*) as count FROM providers WHERE active = 1 AND (needs_review = 1 OR last_error IS NOT NULL)").first() as any;
  const providersUpToDate = await db.prepare("SELECT COUNT(*) as count FROM providers WHERE active = 1 AND last_fetch_at > datetime('now', '-1 day') AND last_error IS NULL").first() as any;
  
  // Get plan counts
  const totalPlans = await db.prepare("SELECT COUNT(*) as count FROM plans WHERE is_active = 1").first() as any;
  const plansByTier = await db.prepare(
    "SELECT speed_tier, COUNT(*) as count FROM plans WHERE is_active = 1 AND speed_tier IS NOT NULL GROUP BY speed_tier ORDER BY speed_tier"
  ).all() as any;
  
  // Get recent errors
  const recentErrors = await db.prepare(
    "SELECT name, slug, last_error, last_fetch_at FROM providers WHERE last_error IS NOT NULL AND active = 1 ORDER BY last_fetch_at DESC LIMIT 5"
  ).all() as any;
  
  // Get oldest fetch times (providers that need updating)
  const staleProviders = await db.prepare(
    "SELECT name, slug, last_fetch_at FROM providers WHERE active = 1 ORDER BY last_fetch_at ASC NULLS FIRST LIMIT 5"
  ).all() as any;
  
  const responseData = JSON.stringify({ 
    lastRun,
    providers: {
      total: totalProviders?.count || 0,
      upToDate: providersUpToDate?.count || 0,
      withErrors: providersWithErrors?.count || 0,
      stale: staleProviders?.results || staleProviders || []
    },
    plans: {
      total: totalPlans?.count || 0,
      byTier: plansByTier?.results || plansByTier || []
    },
    recentErrors: recentErrors?.results || recentErrors || []
  });

  // Store in cache
  if (env?.CACHE) {
    await env.CACHE.put(cacheKey, responseData, {
      expirationTtl: STATUS_CACHE_TTL
    });
  }

  return new Response(responseData, { 
    status: 200, 
    headers: { 
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "X-Cache": "MISS",
      "Cache-Control": `public, max-age=${STATUS_CACHE_TTL}`
    } 
  });
  } catch (err: unknown) {
    console.error('getStatus error:', err);
    return new Response(JSON.stringify({ 
      ok: false, 
      error: String(err) 
    }), { 
      status: 500, 
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      } 
    });
  }
}
