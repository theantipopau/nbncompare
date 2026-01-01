import { Router } from "itty-router";

console.log('Worker module evaluation: index.ts loaded');

let initError: Error | null = null;
let router: any = null;
try {
  router = Router();

  router.get("/api/providers", async (req: Request) => {
    const { getProviders } = await import("./handlers/providers");
    return getProviders(req);
  });

  router.get("/api/providers/:slug", async ({ params }: any) => {
    const { getProvider } = await import("./handlers/providers");
    return getProvider(params.slug);
  });

  router.get("/api/plans", async (req: Request) => {
    const { getPlans } = await import("./handlers/plans");
    return getPlans(req);
  });

  router.get("/api/plans/:id/history", async ({ params }: any) => {
    const { getPriceHistory } = await import("./handlers/price-history");
    return getPriceHistory(parseInt(params.id));
  });

  router.get("/api/address/search", async (req: Request) => {
    const { searchAddress } = await import("./handlers/address");
    return searchAddress(req);
  });

  router.get("/api/address/qualify", async (req: Request) => {
    const { qualifyAddress } = await import("./handlers/address");
    return qualifyAddress(req);
  });

  router.get("/api/status", async (req: Request) => {
    const { getStatus } = await import("./handlers/status");
    return getStatus(req);
  });

  router.get("/api/admin/issues", async (req: Request) => {
    const { getIssues } = await import("./handlers/admin-issues");
    return getIssues(req);
  });

  router.post("/api/admin/review/approve", async (request: Request) => {
    const { adminApprove } = await import("./handlers/admin");
    return adminApprove(request as Request);
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
} catch (err: any) {
  initError = err instanceof Error ? err : new Error(String(err));
  console.error('Initialization error:', initError);
}
// Cron route triggered by worker scheduled handler
router.get("/internal/cron/run", async () => {
  try {
    const { handleCron } = await import("./handlers/cron");
    const result = await handleCron();
    return new Response(JSON.stringify({ ok: true, result }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err: unknown) {
    console.error('Cron run failed:', err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});

router.get('/internal/debug/:slug', async ({ params }) => {
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
    const hasD1 = typeof (globalThis as any).D1 !== 'undefined';
    const keys: string[] = Object.keys(globalThis as any).filter(k => k.length < 60).slice(0, 200);
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
}

async function fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  // Store env.D1 in globalThis for db.ts to access
  (globalThis as any).D1 = env.D1;
  
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

  // Short-circuit critical health endpoints to avoid router hangs and get immediate diagnostics
  if (pathname === '/internal/env') {
    try {
      const hasD1 = typeof (globalThis as any).D1 !== 'undefined';
      const keys: string[] = Object.keys(globalThis as any).filter(k => k.length < 60).slice(0, 200);
      return new Response(JSON.stringify({ ok: true, hasD1, keys }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.stack || err.message : String(err);
      console.error('/internal/env direct handler error:', msg);
      try { await recordRunError(String(msg)); } catch (dbErr) { console.error('Failed to write run error to DB', dbErr); }
      return new Response(JSON.stringify({ ok: false, error: String(msg) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (pathname === '/internal/ping') {
    try {
      const { getDb } = await import('./lib/db');
      const db = await getDb();
      const r = await db.prepare('SELECT 1 as ok').first();
      return new Response(JSON.stringify({ ok: true, db: !!r }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.stack || err.message : String(err);
      console.error('/internal/ping direct handler error:', msg);
      try { await recordRunError(String(msg)); } catch (dbErr) { console.error('Failed to write run error to DB', dbErr); }
      return new Response(JSON.stringify({ ok: false, error: String(err), stack: err instanceof Error ? err.stack : null }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (pathname.startsWith('/internal/debug/')) {
    try {
      const slug = pathname.split('/').pop();
      const { debugProvider } = await import('./handlers/debug');
      const out = await debugProvider(slug || '');
      return new Response(JSON.stringify({ ok: true, out }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.stack || err.message : String(err);
      console.error('/internal/debug direct handler error:', msg);
      try { await recordRunError(String(msg)); } catch (dbErr) { console.error('Failed to write run error to DB', dbErr); }
      return new Response(JSON.stringify({ ok: false, error: String(err), stack: err instanceof Error ? err.stack : null }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (pathname === '/internal/cron/run') {
    try {
      const { handleCron } = await import('./handlers/cron');
      // run with a tight timeout
      const result = await Promise.race([
        handleCron(),
        new Promise((_res, rej) => setTimeout(() => rej(new Error('cron handler timeout')), 30000))
      ]);
      return new Response(JSON.stringify({ ok: true, result }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.stack || err.message : String(err);
      console.error('/internal/cron/run direct handler error:', msg);
      try { await recordRunError(String(msg)); } catch (dbErr) { console.error('Failed to write run error to DB', dbErr); }
      return new Response(JSON.stringify({ ok: false, error: String(err), stack: err instanceof Error ? err.stack : null }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  // Direct handlers for API endpoints to bypass router timeout
  if (pathname === '/api/providers') {
    try {
      const { getProviders } = await import('./handlers/providers');
      return await getProviders(request);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.stack || err.message : String(err);
      console.error('/api/providers direct handler error:', msg);
      return new Response(JSON.stringify({ ok: false, error: String(err), stack: err instanceof Error ? err.stack : null }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (pathname === '/api/plans') {
    try {
      const { getPlans } = await import('./handlers/plans');
      return await getPlans(request);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.stack || err.message : String(err);
      console.error('/api/plans direct handler error:', msg);
      return new Response(JSON.stringify({ ok: false, error: String(err), stack: err instanceof Error ? err.stack : null }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (pathname === '/api/address/search') {
    try {
      const { searchAddress } = await import('./handlers/address');
      return await searchAddress(request);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.stack || err.message : String(err);
      console.error('/api/address/search direct handler error:', msg);
      return new Response(JSON.stringify({ ok: false, error: String(err), stack: err instanceof Error ? err.stack : null }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (pathname === '/api/address/qualify') {
    try {
      const { qualifyAddress } = await import('./handlers/address');
      return await qualifyAddress(request);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.stack || err.message : String(err);
      console.error('/api/address/qualify direct handler error:', msg);
      return new Response(JSON.stringify({ ok: false, error: String(err), stack: err instanceof Error ? err.stack : null }), { status: 500, headers: { 'Content-Type': 'application/json' } });
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
      (router.handle(request) as Promise<Response>),
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

async function scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
  // Store env.D1 in globalThis for db.ts to access
  (globalThis as any).D1 = env.D1;
  
  if (initError) {
    const msg = initError.stack || initError.message || String(initError);
    console.error('Scheduled handler aborted due to init error:', msg);
    try { await recordRunError(String(msg)); } catch (dbErr) { console.error('Failed to write run error to DB', dbErr); }
    return;
  }

  try {
    console.log('scheduled handler starting');
    const { handleCron } = await import("./handlers/cron");
    event.waitUntil(handleCron());
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.stack || err.message : String(err);
    console.error('Scheduled handler error:', msg);
    try { await recordRunError(String(msg)); } catch (dbErr) { console.error('Failed to write run error to DB', dbErr); }
    throw err;
  }
}

export default { fetch, scheduled };
