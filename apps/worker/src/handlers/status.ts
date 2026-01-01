import { getDb } from "../lib/db";

export async function getStatus(_req: Request) {
  const db = await getDb();
  const lastRun = await db.prepare("SELECT * FROM runs ORDER BY started_at DESC LIMIT 1").first();
  const counts = await db.prepare("SELECT COUNT(*) as providers FROM providers").first();
  return new Response(JSON.stringify({ lastRun, providers: counts }), { status: 200, headers: { "Content-Type": "application/json" } });
}
