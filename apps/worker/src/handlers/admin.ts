import { getDb } from "../lib/db";

export async function adminApprove(request: Request, env: { ADMIN_TOKEN: string }) {
  const token = request.headers.get("x-admin-token");
  if (!token || token !== env.ADMIN_TOKEN) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const body = await request.json();
  const { provider_slug } = body;
  if (!provider_slug) {
    return new Response(JSON.stringify({ ok: false, error: "provider_slug required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const db = await getDb();
  await db.prepare("UPDATE providers SET needs_review = 0 WHERE slug = ?").bind(provider_slug).run();
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
}
