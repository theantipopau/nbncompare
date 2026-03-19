import { Router } from "itty-router";
import type { D1Database, ExecutionContext, KVNamespace } from "@cloudflare/workers-types";

console.log('Worker module evaluation: index.ts loaded');

let initError: Error | null = null;
let router: ReturnType<typeof Router> | null = null;
try {
  router = Router();

  router.get("/api/providers", async (req: Request) => {
    const { getProviders } = await import("./handlers/providers");
    return getProviders(req);
  });

  router.get("/api/providers/:slug", async ({ params }: { params: { slug: string } }) => {
    const { getProvider } = await import("./handlers/providers");
    return getProvider(params.slug);
  });

  router.get("/api/plans", async (req: Request) => {
    const { getPlans } = await import("./handlers/plans");
    return getPlans(req);
  });

  router.get("/api/plans/:id/history", async ({ params }: { params: { id: string } }) => {
    const { getPriceHistory } = await import("./handlers/price-history");
    return getPriceHistory(params.id);
  });

  router.get("/api/price-history/:id", async ({ params }: { params: { id: string } }) => {
    const { getPriceHistory } = await import("./handlers/price-history");
    return getPriceHistory(params.id);
  });

  router.get("/api/address/search", async (req: Request) => {
    const { searchAddress } = await import("./handlers/address");
    return searchAddress(req);
  });

  router.get("/api/address/qualify", async (req: Request) => {
    const { qualifyAddress } = await import("./handlers/address");
    return qualifyAddress(req);
  });

  router.get("/api/status", async (req: Request, env: Env) => {
    const { getStatus } = await import("./handlers/status");
    return getStatus(req, { CACHE: env.CACHE });
  });

  router.get("/api/status/stale", async (req: Request) => {
    const { getStaleStatus } = await import("./handlers/status");
    return getStaleStatus(req);
  });

  router.get("/api/admin/issues", async (req: Request) => {
    const { getIssues } = await import("./handlers/admin-issues");
    return getIssues(req);
  });

  router.get("/api/admin/provider-verification", async (req: Request) => {
    const { getProviderVerification } = await import("./handlers/provider-verification");
    return getProviderVerification(req);
  });

  router.post("/api/admin/review/approve", async (request: Request, env: Env) => {
    const { adminApprove } = await import("./handlers/admin");
    return adminApprove(request, { ADMIN_TOKEN: env.ADMIN_TOKEN });
  });

  // New endpoints for consumer features
  router.get("/api/providers/comparison", async (req: Request, env: Env) => {
    const { getProviderComparison } = await import("./handlers/provider-comparison");
    return getProviderComparison(req, env);
  });

  router.post("/api/savings/calculate", async (request: Request, env: Env) => {
    const { calculateSavings } = await import("./handlers/savings-calculator");
    return calculateSavings(request, env);
  });

  router.post("/api/feedback", async (request: Request, env: Env) => {
    const { handleFeedback } = await import("./handlers/feedback");
    return handleFeedback(request, env);
  });

  router.get("/api/feedback", async (request: Request, env: Env) => {
    const { handleFeedback } = await import("./handlers/feedback");
    return handleFeedback(request, env);
  });

  router.post("/internal/update-favicons", async () => {
    try {
      const { updateProviderFavicons } = await import("./lib/favicon");
      const result = await updateProviderFavicons();
      return new Response(JSON.stringify({ ok: true, result }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (err: unknown) {
      console.error('Favicon update failed:', err);
      return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
  });

  // Data verification endpoint
  router.get("/internal/verify-data", async (req: Request) => {
    const { verifyData } = await import("./handlers/data-verification");
    return verifyData(req);
  });

  // Data population endpoints
  router.post("/internal/data-population/populate", async (req: Request, env: Env) => {
    try {
      const { handleDataPopulation } = await import("./handlers/data-population");
      const result = await handleDataPopulation(env);
      return new Response(JSON.stringify(result), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (err: unknown) {
      console.error('Data population failed:', err);
      return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
  });

  router.get("/internal/data-population/status", async () => {
    try {
      const { getDataPopulationStatus } = await import("./handlers/data-population");
      const result = await getDataPopulationStatus();
      return new Response(JSON.stringify({ ok: true, result }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (err: unknown) {
      console.error('Status check failed:', err);
      return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
  });
} catch (err: unknown) {
  initError = err instanceof Error ? err : new Error(String(err));
  console.error('Initialization error:', initError);
}
// Cron route triggered by worker scheduled handler
  router.get("/internal/cron/run", async (req: Request, env: Env) => {
  try {
    const { handleCron } = await import("./handlers/cron");
      const result = await handleCron(env);
    return new Response(JSON.stringify({ ok: true, result }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err: unknown) {
    console.error('Cron run failed:', err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});

  router.post("/internal/ai/refresh", async (_req: Request, env: Env) => {
    try {
      const { refreshAiSummaries } = await import("./handlers/ai-summaries");
      const result = await refreshAiSummaries(env);
      return new Response(JSON.stringify({ ok: true, result }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (err: unknown) {
      console.error('AI refresh failed:', err);
      return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
  });

  router.get("/api/ai/plan-summary", async (req: Request) => {
    const { getPlanSummary } = await import("./handlers/ai-summaries");
    return getPlanSummary(req);
  });

  router.get("/api/ai/provider-summary", async (req: Request) => {
    const { getProviderSummary } = await import("./handlers/ai-summaries");
    return getProviderSummary(req);
  });

  router.get("/api/ai/best-deals", async () => {
    const { getBestDealsSummary } = await import("./handlers/ai-summaries");
    return getBestDealsSummary();
  });

router.get('/internal/debug/:slug', async ({ params }: { params: { slug: string } }) => {
  try {
    const { debugProvider } = await import('./handlers/debug');
    const out = await debugProvider(params.slug);
    return new Response(JSON.stringify(out), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: unknown) {
    console.error('Debug handler error:', err);
    return new Response(JSON.stringify({ ok: false, error: String(err), stack: err instanceof Error ? err.stack : null }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});

router.get('/internal/ping', async () => {
  try {
    const db = await (await import('./lib/db')).getDb();
    const r = await db.prepare('SELECT 1 as ok').first();
    return new Response(JSON.stringify({ ok: true, db: !!r }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: unknown) {
    console.error('Ping error:', err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});

router.get('/internal/env', async () => {
  try {
    const globals = globalThis as Record<string, unknown> & { D1?: D1Database };
    const hasD1 = typeof globals.D1 !== 'undefined';
    const keys: string[] = Object.keys(globals).filter(k => k.length < 60).slice(0, 200);
    return new Response(JSON.stringify({ ok: true, hasD1, keys }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: unknown) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});

import { recordRunError } from "./lib/db";
import { corsHeaders } from "./lib/cors";

interface Env {
  D1: D1Database;
  ADMIN_TOKEN: string;
  CACHE?: KVNamespace;
  AI?: unknown;
  ENVIRONMENT?: string;
  DEBUG?: string;
}

function isDebugEnabled(env: Env | undefined) {
  if (!env) return false;
  if (env.DEBUG === '1' || env.DEBUG === 'true') return true;
  if (env.ENVIRONMENT && env.ENVIRONMENT !== 'production') return true;
  return false;
}

function errorJson(err: unknown, env: Env | undefined) {
  const message = err instanceof Error ? err.message : String(err);
  const debug = isDebugEnabled(env);
  return {
    ok: false,
    error: message,
    ...(debug
      ? { stack: err instanceof Error ? err.stack ?? null : null }
      : {}),
  };
}

function requireAdmin(request: Request, env: Env): Response | null {
  const token = request.headers.get('x-admin-token');
  if (!token || token !== env.ADMIN_TOKEN) {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}

async function fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
  // Store env.D1 in globalThis for db.ts to access
  const globals = globalThis as { D1?: D1Database; ADMIN_TOKEN?: string };
  globals.D1 = env.D1;
  // Back-compat for any handlers still reading globalThis
  globals.ADMIN_TOKEN = env.ADMIN_TOKEN;
  
  console.log('fetch start', request.method, request.url);
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }
  
  if (initError) {
    const msg = initError.stack || initError.message || String(initError);
    console.error('Initialization error during fetch:', msg);
    try { await recordRunError(String(msg)); } catch (dbErr) { console.error('Failed to write run error to DB', dbErr); }
    return new Response(JSON.stringify({ ok: false, initError: String(msg) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const pathname = new URL(request.url).pathname;

  // Protect admin/internal routes.
  // Note: /api/admin/* is used by the in-app Admin page.
  // Exception: /internal/data-population/populate is allowed without auth for initial setup
  if ((pathname.startsWith('/internal/') && !pathname.includes('/data-population/')) || pathname.startsWith('/api/admin/')) {
    const unauthorized = requireAdmin(request, env);
    if (unauthorized) return unauthorized;
  }

  // Short-circuit critical health endpoints to avoid router hangs and get immediate diagnostics
  if (pathname === '/internal/env') {
    try {
      const hasD1 = typeof (globalThis as any).D1 !== 'undefined';
      const keys: string[] = Object.keys(globalThis as any).filter(k => k.length < 60).slice(0, 200);
      return new Response(JSON.stringify({ ok: true, hasD1, keys }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err: unknown) {
      console.error('/internal/env direct handler error:', err);
      const msg = err instanceof Error ? err.stack || err.message : String(err);
      try { await recordRunError(String(msg)); } catch (dbErr) { console.error('Failed to write run error to DB', dbErr); }
      return new Response(JSON.stringify(errorJson(err, env)), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (pathname === '/internal/ping') {
    try {
      const { getDb } = await import('./lib/db');
      const db = await getDb();
      const r = await db.prepare('SELECT 1 as ok').first();
      return new Response(JSON.stringify({ ok: true, db: !!r }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err: unknown) {
      console.error('/internal/ping direct handler error:', err);
      const msg = err instanceof Error ? err.stack || err.message : String(err);
      try { await recordRunError(String(msg)); } catch (dbErr) { console.error('Failed to write run error to DB', dbErr); }
      return new Response(JSON.stringify(errorJson(err, env)), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (pathname.startsWith('/internal/debug/')) {
    try {
      const slug = pathname.split('/').pop();
      const { debugProvider } = await import('./handlers/debug');
      const out = await debugProvider(slug || '');
      return new Response(JSON.stringify({ ok: true, out }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err: unknown) {
      console.error('/internal/debug direct handler error:', err);
      const msg = err instanceof Error ? err.stack || err.message : String(err);
      try { await recordRunError(String(msg)); } catch (dbErr) { console.error('Failed to write run error to DB', dbErr); }
      return new Response(JSON.stringify(errorJson(err, env)), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (pathname === '/internal/cron/run') {
    try {
      const { handleCron } = await import('./handlers/cron');
      // Allow up to 120 seconds for scraping to complete
      const result = await Promise.race([
        handleCron(env),
        new Promise((_res, rej) => setTimeout(() => rej(new Error('Scraping timeout - operation took longer than 2 minutes')), 120000))
      ]);
      return new Response(JSON.stringify({ ok: true, result }), { status: 200, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
    } catch (err: unknown) {
      console.error('/internal/cron/run direct handler error:', err);
      const msg = err instanceof Error ? err.stack || err.message : String(err);
      try { await recordRunError(String(msg)); } catch (dbErr) { console.error('Failed to write run error to DB', dbErr); }
      return new Response(JSON.stringify(errorJson(err, env)), { status: 500, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
    }
  }

  // Direct handlers for API endpoints to bypass router timeout
  if (pathname === '/api/providers') {
    try {
      const { getProviders } = await import('./handlers/providers');
      return await getProviders(request);
    } catch (err: unknown) {
      console.error('/api/providers direct handler error:', err);
      return new Response(JSON.stringify(errorJson(err, env)), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (pathname === '/api/plans') {
    try {
      const { getPlans } = await import('./handlers/plans');
      return await getPlans(request, env);
    } catch (err: unknown) {
      console.error('/api/plans direct handler error:', err);
      return new Response(JSON.stringify(errorJson(err, env)), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (pathname === '/api/status/stale') {
    try {
      const { getStaleStatus } = await import('./handlers/status');
      return await getStaleStatus(request);
    } catch (err: unknown) {
      console.error('/api/status/stale direct handler error:', err);
      return new Response(JSON.stringify(errorJson(err, env)), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (pathname === '/api/ai/plan-summary') {
    try {
      const { getPlanSummary } = await import('./handlers/ai-summaries');
      return await getPlanSummary(request);
    } catch (err: unknown) {
      console.error('/api/ai/plan-summary direct handler error:', err);
      return new Response(JSON.stringify(errorJson(err, env)), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (pathname === '/api/ai/provider-summary') {
    try {
      const { getProviderSummary } = await import('./handlers/ai-summaries');
      return await getProviderSummary(request);
    } catch (err: unknown) {
      console.error('/api/ai/provider-summary direct handler error:', err);
      return new Response(JSON.stringify(errorJson(err, env)), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (pathname === '/api/ai/best-deals') {
    try {
      const { getBestDealsSummary } = await import('./handlers/ai-summaries');
      return await getBestDealsSummary();
    } catch (err: unknown) {
      console.error('/api/ai/best-deals direct handler error:', err);
      return new Response(JSON.stringify(errorJson(err, env)), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (pathname === '/api/address/search') {
    try {
      const { searchAddress } = await import('./handlers/address');
      return await searchAddress(request);
    } catch (err: unknown) {
      console.error('/api/address/search direct handler error:', err);
      return new Response(JSON.stringify(errorJson(err, env)), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (pathname === '/api/address/qualify') {
    try {
      const { qualifyAddress } = await import('./handlers/address');
      return await qualifyAddress(request);
    } catch (err: unknown) {
      console.error('/api/address/qualify direct handler error:', err);
      return new Response(JSON.stringify(errorJson(err, env)), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  // Price history endpoint
  const priceHistoryMatch = pathname.match(/^\/api\/price-history\/(\d+)$/);
  if (priceHistoryMatch) {
    try {
      const { getPriceHistory } = await import('./handlers/price-history');
      return await getPriceHistory(priceHistoryMatch[1]);
    } catch (err: unknown) {
      console.error('/api/price-history direct handler error:', err);
      return new Response(JSON.stringify(errorJson(err, env)), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  // Favicon update endpoint
  if (pathname === '/internal/update-favicons' && request.method === 'POST') {
    try {
      const { updateProviderFavicons } = await import('./lib/favicon');
      const result = await updateProviderFavicons();
      return new Response(JSON.stringify({ ok: true, result }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err: unknown) {
      console.error('/internal/update-favicons direct handler error:', err);
      return new Response(JSON.stringify(errorJson(err, env)), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (pathname === '/internal/ai/refresh' && request.method === 'POST') {
    try {
      const { refreshAiSummaries } = await import('./handlers/ai-summaries');
      const result = await refreshAiSummaries(env);
      return new Response(JSON.stringify({ ok: true, result }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err: unknown) {
      console.error('/internal/ai/refresh direct handler error:', err);
      return new Response(JSON.stringify(errorJson(err, env)), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (pathname === '/api/admin/review/approve' && request.method === 'POST') {
    try {
      const { adminApprove } = await import('./handlers/admin');
      return await adminApprove(request, env);
    } catch (err: unknown) {
      console.error('/api/admin/review/approve direct handler error:', err);
      return new Response(JSON.stringify(errorJson(err, env)), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (pathname === '/api/admin/audit' && request.method === 'GET') {
    try {
      const { getAudit } = await import('./handlers/admin-audit');
      return await getAudit(request);
    } catch (err: unknown) {
      console.error('/api/admin/audit direct handler error:', err);
      return new Response(JSON.stringify(errorJson(err, env)), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (!router) {
    const msg = 'Router not initialized';
    console.error(msg);
    try { await recordRunError(msg); } catch (dbErr) { console.error('Failed to write run error to DB', dbErr); }
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 503, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    // Guard against a hanging router.handle by racing with a timeout
    const res = await Promise.race([
      (router.handle(request, env) as Promise<Response>),
      new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('router.handle timeout')), 15000))
    ]);
    return res;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.stack || err.message : String(err);
    console.error('Fetch handler error:', msg);
    try { await recordRunError(String(msg)); } catch (dbErr) { console.error('Failed to write run error to DB', dbErr); }
    return new Response(JSON.stringify({ ok: false, error: String(msg) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

async function scheduled(_event: any, env: Env, ctx: any): Promise<void> {
  // Store env.D1 in globalThis for db.ts to access
  (globalThis as any).D1 = env.D1;
  (globalThis as any).ADMIN_TOKEN = env.ADMIN_TOKEN;
  
  if (initError) {
    const msg = initError.stack || initError.message || String(initError);
    console.error('Scheduled handler aborted due to init error:', msg);
    try { await recordRunError(String(msg)); } catch (dbErr) { console.error('Failed to write run error to DB', dbErr); }
    return;
  }

  try {
    console.log('scheduled handler starting');
    const { handleCron } = await import("./handlers/cron");
    // Use ctx.waitUntil so the scheduled handler can return while work continues
    ctx.waitUntil(handleCron(env));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.stack || err.message : String(err);
    console.error('Scheduled handler error:', msg);
    try { await recordRunError(String(msg)); } catch (dbErr) { console.error('Failed to write run error to DB', dbErr); }
    throw err;
  }
}

export default { fetch, scheduled };
