import { getDb } from "../lib/db";
import { isAdminTokenValid } from "../lib/admin-auth";

export async function adminApprove(request: Request, env: { ADMIN_TOKEN: string }) {
  const token = request.headers.get("x-admin-token");
  if (!(await isAdminTokenValid(token, env.ADMIN_TOKEN))) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { provider_slug } = body as { provider_slug?: unknown };
  if (typeof provider_slug !== "string" || provider_slug.trim().length === 0) {
    return new Response(JSON.stringify({ ok: false, error: "provider_slug required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const db = await getDb();
  await db.prepare("UPDATE providers SET needs_review = 0 WHERE slug = ?").bind(provider_slug).run();
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
}
