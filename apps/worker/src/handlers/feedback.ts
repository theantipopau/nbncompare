interface Feedback {
  plan_id: number;
  issue_type: string; // 'wrong_price', 'wrong_speed', 'wrong_provider', 'missing_info', 'other'
  description: string;
  user_email?: string;
  created_at?: string;
}

interface WorkerEnv {
  DB: unknown; // D1Database
  ADMIN_TOKEN?: string;
}

export async function handleFeedback(request: Request, env: WorkerEnv): Promise<Response> {
  if (request.method === 'POST') {
    const feedback: Feedback = await request.json();
    feedback.created_at = new Date().toISOString();

    try {
      const db = env.DB as any;
      
      // Create feedback table if it doesn't exist
      await db.exec(`
        CREATE TABLE IF NOT EXISTS plan_feedback (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          plan_id INTEGER NOT NULL,
          issue_type TEXT NOT NULL,
          description TEXT,
          user_email TEXT,
          resolved INTEGER DEFAULT 0,
          admin_notes TEXT,
          created_at TEXT,
          FOREIGN KEY(plan_id) REFERENCES plans(id)
        );
      `);

      // Insert feedback
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
        JSON.stringify({ success: true, id: result.meta.last_row_id }),
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
