import { getDb } from "../lib/db";
import { findParserForUrl } from "@clearnbn/shared";

export async function debugProvider(slug: string) {
  const db = await getDb();
  const prov = await db.prepare("SELECT * FROM providers WHERE slug = ?").bind(slug).first();
  if (!prov) return { error: 'not found' };
  try {
    const res = await fetch(prov.canonical_url, { method: 'GET' });
    if (!res.ok) return { error: 'fetch failed', status: res.status };
    const html = await res.text();
    const parser = findParserForUrl(prov.canonical_url);
    const out = await parser.parse(html, prov.canonical_url);
    return { ok: true, count: out.length, sample: out.slice(0,3) };
  } catch (err: any) {
    return { error: String(err), stack: err?.stack };
  }
}
