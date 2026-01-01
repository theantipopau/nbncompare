import { getDb } from "../lib/db";

export async function adminApprove(request: Request) {
  const token = request.headers.get("x-admin-token");
  const ADMIN_TOKEN = (globalThis as unknown as Record<string, string | undefined>).ADMIN_TOKEN;
  if (!token || token !== ADMIN_TOKEN) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const body = await request.json();
  const { provider_slug } = body;
  if (!provider_slug) return new Response(JSON.stringify({ error: "provider_slug required" }), { status: 400 });
  const db = await getDb();
  await db.prepare("UPDATE providers SET needs_review = 0 WHERE slug = ?").bind(provider_slug).run();
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
