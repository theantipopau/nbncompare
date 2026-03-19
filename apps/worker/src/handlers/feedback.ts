interface Feedback {
  plan_id: number;
  issue_type: string; // 'wrong_price', 'wrong_speed', 'wrong_provider', 'missing_info', 'other'
  description: string;
  user_email?: string;
  created_at?: string;
}

interface D1Database {
  exec: (sql: string) => Promise<{ results: unknown[] }>;
  prepare: (sql: string) => {
    bind: (...args: unknown[]) => { 
      run(): Promise<{ success: boolean; meta?: { last_row_id?: number } }>;
      all(): Promise<{ results: unknown[] }>;
      first(): Promise<unknown>;
    };
    run(): Promise<{ success: boolean; meta?: { last_row_id?: number } }>;
    all(): Promise<{ results: unknown[] }>;
    first(): Promise<unknown>;
  };
}

interface WorkerEnv {
  DB: D1Database;
  ADMIN_TOKEN?: string;
}

export async function handleFeedback(request: Request, env: WorkerEnv): Promise<Response> {
  if (request.method === 'POST') {
    // Rate limit: 10 submissions per IP per minute
    try {
      const { createRateLimiter } = await import('../lib/rate-limit');
      const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 10 });
      const rate = await limiter(request);
      if (!rate.allowed) {
        return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json', 'Retry-After': '60' }
        });
      }
    } catch (rlErr) {
      console.error('Rate limiter error:', rlErr);
    }

    let feedback: Feedback;
    try {
      feedback = await request.json() as Feedback;
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Input validation
    const ALLOWED_ISSUE_TYPES = ['wrong_price', 'wrong_speed', 'wrong_provider', 'missing_info', 'other'];
    if (!Number.isInteger(feedback.plan_id) || feedback.plan_id <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid plan_id' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (!feedback.issue_type || !ALLOWED_ISSUE_TYPES.includes(feedback.issue_type)) {
      return new Response(JSON.stringify({ error: `issue_type must be one of: ${ALLOWED_ISSUE_TYPES.join(', ')}` }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (feedback.description && typeof feedback.description === 'string' && feedback.description.length > 1000) {
      return new Response(JSON.stringify({ error: 'description must be 1000 characters or fewer' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (feedback.user_email && (typeof feedback.user_email !== 'string' || feedback.user_email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(feedback.user_email))) {
      return new Response(JSON.stringify({ error: 'Invalid user_email' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    feedback.created_at = new Date().toISOString();

    try {
      const db = env.DB;

      // Insert feedback (table created by migration 0024_add_fresh_new_tables.sql)
      const result = await db.prepare(
        `INSERT INTO plan_feedback (plan_id, issue_type, description, user_email, created_at)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(
        feedback.plan_id,
        feedback.issue_type,
        feedback.description,
        feedback.user_email || null,
        feedback.created_at
      ).run();

      return new Response(
        JSON.stringify({ success: true, id: result.meta?.last_row_id }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (err) {
      console.error('Feedback error:', err);
      return new Response(
        JSON.stringify({ error: 'Failed to save feedback' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  if (request.method === 'GET') {
    // Admin endpoint: get unresolved feedback
    const token = request.headers.get('x-admin-token');
    if (token !== env.ADMIN_TOKEN) {
      return new Response('Unauthorized', { status: 401 });
    }

    try {
      const db = env.DB;
      const feedback = await db.prepare(
        `SELECT pf.*, p.plan_name, pr.name as provider_name 
         FROM plan_feedback pf
         JOIN plans p ON pf.plan_id = p.id
         JOIN providers pr ON p.provider_id = pr.id
         WHERE pf.resolved = 0
         ORDER BY pf.created_at DESC
         LIMIT 50`
      ).all();

      return new Response(
        JSON.stringify({ feedback: feedback.results }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    } catch (err) {
      console.error('Feedback fetch error:', err);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch feedback' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
