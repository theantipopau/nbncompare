import { getDb } from "../lib/db";

export async function getIssues(_req: Request) {
  const db = await getDb();
  const rowsData = await db.prepare("SELECT id, name, slug, canonical_url, last_error, needs_review FROM providers WHERE needs_review = 1 OR last_error IS NOT NULL ORDER BY needs_review DESC, name").all();
  const rows = (rowsData as any)?.results ?? (rowsData as any);
  return new Response(JSON.stringify(rows), { status: 200, headers: { "Content-Type": "application/json" } });
}
