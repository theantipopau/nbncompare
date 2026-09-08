import { jsonResponse } from '../lib/cors';
import { isAdminTokenValid } from '../lib/admin-auth';
import type { D1Database } from '@cloudflare/workers-types';

interface Feedback {
  plan_id: number;
  issue_type: string; // 'wrong_price', 'wrong_speed', 'wrong_provider', 'missing_info', 'other'
  description: string;
  user_email?: string;
  created_at?: string;
}

interface WorkerEnv {
  D1: D1Database;
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
        return jsonResponse({ error: 'Too many requests. Please try again later.' }, 429);
      }
    } catch (rlErr) {
      console.error('Rate limiter error:', rlErr);
    }

    let feedback: Feedback;
    try {
      feedback = await request.json() as Feedback;
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    // Input validation
    const ALLOWED_ISSUE_TYPES = ['wrong_price', 'wrong_speed', 'wrong_provider', 'missing_info', 'other'];
    if (!Number.isInteger(feedback.plan_id) || feedback.plan_id <= 0) {
      return jsonResponse({ error: 'Invalid plan_id' }, 400);
    }
    if (!feedback.issue_type || !ALLOWED_ISSUE_TYPES.includes(feedback.issue_type)) {
      return jsonResponse({ error: `issue_type must be one of: ${ALLOWED_ISSUE_TYPES.join(', ')}` }, 400);
    }
    if (!feedback.description || typeof feedback.description !== 'string' || feedback.description.trim().length === 0) {
      return jsonResponse({ error: 'description is required' }, 400);
    }
    if (feedback.description.length > 1000) {
      return jsonResponse({ error: 'description must be 1000 characters or fewer' }, 400);
    }
    if (feedback.user_email && (typeof feedback.user_email !== 'string' || feedback.user_email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(feedback.user_email))) {
      return jsonResponse({ error: 'Invalid user_email' }, 400);
    }

    feedback.created_at = new Date().toISOString();

    try {
      const db = env.D1;

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

      return jsonResponse({ success: true, id: result.meta?.last_row_id }, 201);
    } catch (err) {
      console.error('Feedback error:', err);
      return jsonResponse({ error: 'Failed to save feedback' }, 500);
    }
  }

  if (request.method === 'GET') {
    // Admin endpoint: get unresolved feedback
    const token = request.headers.get('x-admin-token');
    if (!(await isAdminTokenValid(token, env.ADMIN_TOKEN))) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    try {
      const db = env.D1;
      const feedback = await db.prepare(
        `SELECT pf.*, p.plan_name, pr.name as provider_name 
         FROM plan_feedback pf
         JOIN plans p ON pf.plan_id = p.id
         JOIN providers pr ON p.provider_id = pr.id
         WHERE pf.resolved = 0
         ORDER BY pf.created_at DESC
         LIMIT 50`
      ).all();

      return jsonResponse({ feedback: feedback.results });
    } catch (err) {
      console.error('Feedback fetch error:', err);
      return jsonResponse({ error: 'Failed to fetch feedback' }, 500);
    }
  }

  if (request.method === 'PATCH') {
    const token = request.headers.get('x-admin-token');
    if (!(await isAdminTokenValid(token, env.ADMIN_TOKEN))) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const id = Number(new URL(request.url).pathname.split('/').pop());
    if (!Number.isInteger(id) || id <= 0) {
      return jsonResponse({ error: 'Invalid feedback id' }, 400);
    }

    let body: { resolved?: number };
    try {
      body = await request.json() as { resolved?: number };
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    if (body.resolved !== 0 && body.resolved !== 1) {
      return jsonResponse({ error: 'resolved must be 0 or 1' }, 400);
    }

    await env.D1.prepare('UPDATE plan_feedback SET resolved = ? WHERE id = ?')
      .bind(body.resolved, id)
      .run();
    return jsonResponse({ ok: true });
  }

  return jsonResponse({ error: 'Method not allowed' }, 405);
}
