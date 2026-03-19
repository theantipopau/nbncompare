import { getDb } from "../lib/db";
import { findParserForUrl, validatePlan, normalizeExtract, ProviderRow } from "@clearnbn/shared";
import { fetchWithSmartFallback, fetchViaBrowser } from "../lib/browser-rendering";

type SimpleStmt = {
  bind: (...args: unknown[]) => SimpleStmt;
  first: () => Promise<unknown>;
  all: () => Promise<{ results: unknown[] }>;
  run: () => Promise<{ meta: { last_row_id?: number } }>;
};

type SimpleDB = {
  prepare: (q: string) => SimpleStmt;
};

type ProviderWithStrategy = ProviderRow & {
  priority_tier?: number;
  refresh_interval_minutes?: number;
  use_browser?: number;
  timeout_ms?: number;
  max_retries?: number;
};

const JS_RENDER_PROVIDERS = new Set([
  'telstra',
  'optus',
  'vodafone',
  'tpg',
  'iinet',
  'superloop',
  'kogan'
]);

type FetchEnv = { SCRAPER_API_KEY?: string; BROWSER?: unknown };

export async function fetchProvidersToUpdate(env?: FetchEnv, maxProviders: number = 5) {
  const db = (await getDb()) as SimpleDB;
  console.log(`fetchProvidersToUpdate: starting (max ${maxProviders} providers, adaptive strategy scheduling enabled)`);
  const stmt = db.prepare(`
    SELECT
      p.*,
      COALESCE(ps.priority_tier, 2) as priority_tier,
      COALESCE(ps.refresh_interval_minutes, 360) as refresh_interval_minutes,
      COALESCE(ps.use_browser, 0) as use_browser,
      COALESCE(ps.timeout_ms, 20000) as timeout_ms,
      COALESCE(ps.max_retries, 3) as max_retries
    FROM providers p
    LEFT JOIN provider_scrape_strategy ps ON ps.provider_slug = p.slug
    WHERE p.active = 1
      AND COALESCE(ps.enabled, 1) = 1
      AND (
        p.last_fetch_at IS NULL
        OR datetime(p.last_fetch_at) <= datetime('now', '-' || COALESCE(ps.refresh_interval_minutes, 360) || ' minutes')
      )
    ORDER BY COALESCE(ps.priority_tier, 2) ASC, p.last_fetch_at ASC NULLS FIRST
    LIMIT ?
  `).bind(maxProviders);
  const providersRes = await stmt.all();
  const providers = (providersRes?.results ?? []) as ProviderWithStrategy[];
  const result: { checked: number; changed: number; errors: number } = { checked: 0, changed: 0, errors: 0 };
  
  // Process providers in parallel with timeout protection
  const providerPromises = providers.map(prov => processProvider(db, prov, result, env));
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

async function processProvider(db: SimpleDB, prov: ProviderWithStrategy, result: { checked: number; changed: number; errors: number }, env?: FetchEnv) {
  result.checked++;
  console.log(`Checking provider ${prov.slug} (${prov.canonical_url})`);
  try {
    const preferBrowser = prov.use_browser === 1 || JS_RENDER_PROVIDERS.has(prov.slug);
    const timeoutMs = typeof prov.timeout_ms === 'number' && prov.timeout_ms >= 5000 ? prov.timeout_ms : 20000;
    const maxRetries = typeof prov.max_retries === 'number' && prov.max_retries >= 1 ? prov.max_retries : 3;
    let usedBrowser = false;
    let html: string;

    if (preferBrowser && env?.BROWSER) {
      try {
        html = await fetchViaBrowser(prov.canonical_url, env.BROWSER, { timeoutMs });
        usedBrowser = true;
      } catch (err) {
        console.warn(`Browser render failed for ${prov.slug}, falling back to smart fetch`, err);
        html = await fetchWithSmartFallback(prov.canonical_url, env?.BROWSER, { timeoutMs, maxRetries });
      }
    } else {
      html = await fetchWithSmartFallback(prov.canonical_url, env?.BROWSER, { timeoutMs, maxRetries });
    }
    const hash = await computeHash(html);
    if (!preferBrowser && hash === prov.last_hash) {
      // update last_fetch_at and clear errors
      await db.prepare("UPDATE providers SET last_fetch_at = ?, last_error = NULL, needs_review = 0 WHERE id = ?").bind(new Date().toISOString(), prov.id).run();
      console.log(`Provider ${prov.slug} unchanged (hash match)`);
      return;
    }
    // choose parser
    const parser = findParserForUrl(prov.canonical_url);
    if (!parser) {
      throw new Error(`No parser found for ${prov.canonical_url}`);
    }
    let extracts: PlanExtract[] = [];
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
    // Fallback to browser render if parse failed or missing prices
    if (!usedBrowser && env?.BROWSER) {
      const missingPrices = extracts.filter((e) => !e.ongoingPriceCents && !e.introPriceCents).length;
      if (extracts.length === 0 || missingPrices / Math.max(extracts.length, 1) > 0.6) {
        try {
          const browserHtml = await fetchViaBrowser(prov.canonical_url, env.BROWSER, { timeoutMs });
          const parsed = await parser.parse(browserHtml, prov.canonical_url);
          if (Array.isArray(parsed) && parsed.length > 0) {
            extracts = parsed;
            usedBrowser = true;
          }
        } catch (err) {
          console.warn(`Browser fallback parse failed for ${prov.slug}`, err);
        }
      }
    }

    // validate and upsert plans (simple approach)
    let providerNeedsReview = false;
    for (const e of extracts) {
      try {
        const normalized = normalizeExtract(e);
        const v = validatePlan(normalized);
        if (!v.ok) {
          providerNeedsReview = true;
          console.warn(`Rejecting plan for provider ${prov.slug}: ${normalized.planName}`, v.errors);
          continue;
        }
        if (v.warnings && v.warnings.length > 0) {
          providerNeedsReview = true;
          console.warn(`Plan warnings for provider ${prov.slug}: ${normalized.planName}`, v.warnings);
        }
        await upsertPlan(db, prov.id, normalized);
      } catch (err) {
        console.error(`Failed processing plan for provider ${prov.slug}:`, err);
        providerNeedsReview = true;
      }
    }
    await db.prepare("UPDATE providers SET last_hash = ?, last_fetch_at = ?, last_error = NULL, needs_review = ? WHERE id = ?").bind(hash, new Date().toISOString(), providerNeedsReview ? 1 : 0, prov.id).run();
    result.changed++;
  } catch (err: unknown) {
    result.errors++;
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`Provider ${prov.slug} failed:`, errorMsg);
    
    // Mark as needs_review if it's a 403 or persistent error
    const needsReview = errorMsg.includes('403') || errorMsg.includes('Forbidden') ? 1 : 0;
    await db.prepare("UPDATE providers SET last_error = ?, last_fetch_at = ?, needs_review = ? WHERE id = ?").bind(errorMsg, new Date().toISOString(), needsReview, prov.id).run();
    
    if (errorMsg.includes('403')) {
      console.log(`Provider ${prov.slug} is temporarily blocked (403) - marked for review`);
    }
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
  const technologyType = ext.technologyType || 'standard';
  const planType = ext.planType || 'residential';
  const serviceType = ext.serviceType ?? 'nbn';
  const dataAllowance = ext.dataAllowance ?? null;
  const contractType = ext.contractType ?? null;
  const setupFeeCents = ext.setupFeeCents ?? null;
  const modemCostCents = ext.modemCostCents ?? null;
  const introDurationDays = ext.introDurationDays ?? null;
  const promoCode = ext.promoCode ?? null;
  const promoDescription = ext.promoDescription ?? null;
  const promoExpiresAt = ext.promoExpiresAt ?? null;
  const confidenceScore = computeConfidenceScore(ext);
  const effectiveMonthlyCents = computeEffectiveMonthlyCents(ext);
  
  if (existing && typeof existing.id === 'number') {
    await db.prepare(
      `UPDATE plans SET
        speed_tier = ?,
        upload_speed_mbps = ?,
        intro_price_cents = ?,
        ongoing_price_cents = ?,
        data_allowance = COALESCE(?, data_allowance),
        contract_type = COALESCE(?, contract_type),
        setup_fee_cents = COALESCE(?, setup_fee_cents),
        modem_cost_cents = COALESCE(?, modem_cost_cents),
        intro_duration_days = COALESCE(?, intro_duration_days),
        promo_code = COALESCE(?, promo_code),
        promo_description = COALESCE(?, promo_description),
        promo_expires_at = COALESCE(?, promo_expires_at),
        technology_type = ?,
        plan_type = ?,
        service_type = COALESCE(?, service_type),
        confidence_score = ?,
        effective_monthly_cents = ?,
        updated_at = ?,
        is_active = 1
      WHERE id = ?`
    ).bind(
      ext.speedTier ?? null,
      ext.uploadSpeedMbps ?? null,
      ext.introPriceCents ?? null,
      ext.ongoingPriceCents ?? null,
      dataAllowance,
      contractType,
      setupFeeCents,
      modemCostCents,
      introDurationDays,
      promoCode,
      promoDescription,
      promoExpiresAt,
      technologyType,
      planType,
      serviceType,
      confidenceScore,
      effectiveMonthlyCents,
      now,
      existing.id
    ).run();
  } else {
    await db.prepare(
      `INSERT INTO plans (
        provider_id, plan_name, speed_tier, upload_speed_mbps,
        intro_price_cents, ongoing_price_cents, source_url,
        data_allowance, contract_type, setup_fee_cents, modem_cost_cents,
        intro_duration_days, promo_code, promo_description, promo_expires_at,
        technology_type, plan_type, service_type,
        confidence_score, effective_monthly_cents,
        last_checked_at, is_active, created_at, updated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(
      providerId,
      ext.planName,
      ext.speedTier ?? null,
      ext.uploadSpeedMbps ?? null,
      ext.introPriceCents ?? null,
      ext.ongoingPriceCents ?? null,
      ext.sourceUrl,
      dataAllowance,
      contractType,
      setupFeeCents,
      modemCostCents,
      introDurationDays,
      promoCode,
      promoDescription,
      promoExpiresAt,
      technologyType,
      planType,
      serviceType,
      confidenceScore,
      effectiveMonthlyCents,
      now,
      1,
      now,
      now
    ).run();
  }
}

function computeConfidenceScore(ext: PlanExtract): number {
  let score = 0;
  if (ext.ongoingPriceCents) score += 0.35;
  if (ext.speedTier) score += 0.25;
  if (ext.uploadSpeedMbps) score += 0.10;
  if (ext.typicalEveningSpeedMbps) score += 0.10;
  if (ext.dataAllowance) score += 0.05;
  if (ext.contractType) score += 0.05;
  if (ext.conditionsText) score += 0.05;
  if (ext.setupFeeCents !== undefined && ext.setupFeeCents !== null) score += 0.05;
  return Math.round(Math.min(1.0, score) * 100) / 100;
}

function computeEffectiveMonthlyCents(ext: PlanExtract): number | null {
  const ongoing = ext.ongoingPriceCents;
  if (!ongoing) return null;
  if (ext.introPriceCents && ext.introDurationDays && ext.introDurationDays > 0) {
    const introMonths = Math.min(ext.introDurationDays / 30, 12);
    const ongoingMonths = Math.max(0, 12 - introMonths);
    return Math.round((ext.introPriceCents * introMonths + ongoing * ongoingMonths) / 12);
  }
  return ongoing;
}
