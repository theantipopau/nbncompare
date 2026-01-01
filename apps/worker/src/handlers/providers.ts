import { getDb } from "../lib/db";
import { jsonResponse } from "../lib/cors";

export async function getProviders(_req: Request) {
  const db = await getDb();
  const rowsData = await db.prepare("SELECT * FROM providers ORDER BY name").all();
  const rows = (rowsData as any)?.results || rowsData;
  return jsonResponse(rows);
}

export async function getProvider(slug: string) {
  const db = await getDb();
  const row = await db.prepare("SELECT * FROM providers WHERE slug = ?").bind(slug).first();
  if (!row) return jsonResponse({ error: "Not found" }, 404);
  return jsonResponse(row);
}
