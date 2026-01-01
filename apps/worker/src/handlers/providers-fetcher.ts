import { getDb } from "../lib/db";
import { findParserForUrl, validatePlan, normalizeExtract, ProviderRow } from "@clearnbn/shared";
import { fetchWithFallback } from "../lib/scraper-api";

type SimpleStmt = {
  bind: (...args: unknown[]) => SimpleStmt;
  first: () => Promise<unknown>;
  all: () => Promise<{ results: unknown[] }>;
  run: () => Promise<{ meta: { last_row_id?: number } }>;
};

type SimpleDB = {
  prepare: (q: string) => SimpleStmt;
};

export async function fetchProvidersToUpdate(env?: { SCRAPER_API_KEY?: string }, maxProviders: number = 5) {
  const db = (await getDb()) as SimpleDB;
  console.log(`fetchProvidersToUpdate: starting (max ${maxProviders} providers, using free User-Agent rotation)`);
  const stmt = db.prepare("SELECT * FROM providers WHERE active = 1 ORDER BY last_fetch_at ASC NULLS FIRST LIMIT ?").bind(maxProviders);
  const providersRes = typeof (stmt as any).all === 'function' ? await (stmt as any).all() : { results: [] };
  const providers = (providersRes && (providersRes as any).results ? (providersRes as any).results : []) as ProviderRow[];
  const result: { checked: number; changed: number; errors: number } = { checked: 0, changed: 0, errors: 0 };
  
  // Process providers in parallel with timeout protection
  const providerPromises = providers.map(prov => processProvider(db, prov, result));
  const results = await Promise.allSettled(providerPromises);
  
  // Count results
  results.forEach((res, idx) => {
    if (res.status === 'rejected') {
      console.error(`Provider ${providers[idx].slug} failed:`, res.reason);
      result.errors++;
    }
  });
  
  return result;
}

async function processProvider(db: SimpleDB, prov: ProviderRow, result: { checked: number; changed: number; errors: number }) {
  result.checked++;
  console.log(`Checking provider ${prov.slug} (${prov.canonical_url})`);
  try {
    // Use free User-Agent rotation for fetching
    const html = await fetchWithFallback(prov.canonical_url);
    const hash = await computeHash(html);
    if (hash === prov.last_hash) {
      // update last_fetch_at
      await db.prepare("UPDATE providers SET last_fetch_at = ?, last_error = NULL WHERE id = ?").bind(new Date().toISOString(), prov.id).run();
      return;
    }
    // choose parser
    const parser = findParserForUrl(prov.canonical_url);
    let extracts: any[] = [];
    try {
      const parsed = await parser.parse(html, prov.canonical_url);
      if (!Array.isArray(parsed)) throw new Error('Parser did not return an array');
      extracts = parsed;
    } catch (err) {
      console.error(`Parser failed for provider ${prov.slug}:`, err);
      await db.prepare("UPDATE providers SET last_error = ?, last_fetch_at = ? WHERE id = ?").bind(String(err), new Date().toISOString(), prov.id).run();
      // mark needs review and skip this provider
      await db.prepare("UPDATE providers SET needs_review = 1 WHERE id = ?").bind(prov.id).run();
      result.errors++;
      return;
    }
    // validate and upsert plans (simple approach)
    let providerNeedsReview = false;
    for (const e of extracts) {
      try {
        const normalized = normalizeExtract(e);
        const v = validatePlan(normalized);
        if (!v.ok) providerNeedsReview = true;
        await upsertPlan(db as any, prov.id, normalized);
      } catch (err) {
        console.error(`Failed processing plan for provider ${prov.slug}:`, err);
        providerNeedsReview = true;
      }
    }
    await db.prepare("UPDATE providers SET last_hash = ?, last_fetch_at = ?, last_error = NULL, needs_review = ? WHERE id = ?").bind(hash, new Date().toISOString(), providerNeedsReview ? 1 : 0, prov.id).run();
    result.changed++;
  } catch (err: unknown) {
    result.errors++;
    console.error(`Provider ${prov.slug} failed:`, err);
    await db.prepare("UPDATE providers SET last_error = ?, last_fetch_at = ? WHERE id = ?").bind(String(err), new Date().toISOString(), prov.id).run();
  }
}

async function computeHash(text: string) {
  // use crypto.subtle for deterministic hash
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

import type { PlanExtract } from "@clearnbn/shared";

async function upsertPlan(db: SimpleDB, providerId: number, ext: PlanExtract) {
  // naive upsert based on provider_id + plan_name
  const existing = (await db.prepare("SELECT id FROM plans WHERE provider_id = ? AND plan_name = ?").bind(providerId, ext.planName).first()) as { id?: number } | undefined;
  const now = new Date().toISOString();
  if (existing && typeof existing.id === 'number') {
    await db.prepare(`UPDATE plans SET speed_tier = ?, intro_price_cents = ?, ongoing_price_cents = ?, updated_at = ?, is_active = 1 WHERE id = ?`).bind(ext.speedTier ?? null, ext.introPriceCents ?? null, ext.ongoingPriceCents ?? null, now, existing.id).run();
  } else {
    await db.prepare(`INSERT INTO plans (provider_id, plan_name, speed_tier, intro_price_cents, ongoing_price_cents, source_url, last_checked_at, is_active, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`).bind(providerId, ext.planName, ext.speedTier ?? null, ext.introPriceCents ?? null, ext.ongoingPriceCents ?? null, ext.sourceUrl, now, 1, now, now).run();
  }
}
