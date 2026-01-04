import { getDb } from "../lib/db";

export async function getStatus(_req: Request) {
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
  
  return new Response(JSON.stringify({ 
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
  }), { 
    status: 200, 
    headers: { "Content-Type": "application/json" } 
  });
}
