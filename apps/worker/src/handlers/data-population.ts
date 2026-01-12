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

/**
 * Enhanced data population handler
 * Processes providers in batches to avoid timeout
 * Each call processes up to 3 providers (adjustable)
 * 
 * Scrapes all 20 providers and populates:
 * - upload_speed_mbps, contract_months, nbn_technology
 * - modem_included, setup_fee_cents, data_allowance
 * - Marks metadata_verification_status as "Verified"
 */
export async function handleDataPopulation(env?: { SCRAPER_API_KEY?: string }) {
  const db = (await getDb()) as SimpleDB;
  const batchSize = 3; // Process 3 providers at a time (adjust for timeout)
  
  console.log("🚀 Starting Batch Data Population...");
  
  const startTime = Date.now();
  const result = {
    totalProviders: 0,
    processedThisBatch: 0,
    processedOverall: 0,
    processedPlansThisBatch: 0,
    processedPlansOverall: 0,
    verifiedThisBatch: 0,
    verifiedOverall: 0,
    errors: 0,
    duration: 0,
    batchNumber: 0,
    moreToProcess: false,
    details: [] as Array<{ provider: string; plans: number; status: string; error?: string }>
  };

  try {
    // Get count of all active providers
    const countStmt = db.prepare("SELECT COUNT(*) as count FROM providers WHERE active = 1");
    const countRes = (await countStmt.first()) as { count: number } | undefined;
    result.totalProviders = countRes?.count || 0;

    // Get count of already-processed (verified) providers
    const verifiedStmt = db.prepare("SELECT COUNT(*) as count FROM providers WHERE metadata_verification_status = 'Verified'");
    const verifiedRes = (await verifiedStmt.first()) as { count: number } | undefined;
    result.verifiedOverall = verifiedRes?.count || 0;

    // Get unprocessed providers
    const stmt = db.prepare(
      "SELECT * FROM providers WHERE active = 1 AND metadata_verification_status != 'Verified' ORDER BY id ASC LIMIT ?"
    );
    const providersRes = typeof (stmt as any).all === 'function' ? await (stmt as any).all() : { results: [] };
    const providers = (providersRes && (providersRes as any).results ? (providersRes as any).results : []) as ProviderRow[];
    
    result.batchNumber = Math.ceil((result.totalProviders - result.verifiedOverall) / batchSize);
    console.log(`📊 Processing batch: ${result.batchNumber}/${Math.ceil(result.totalProviders / batchSize)}`);
    console.log(`   Already verified: ${result.verifiedOverall}/${result.totalProviders}`);
    console.log(`   Providers in queue: ${providers.length}`);

    // Process this batch
    const thisBatch = providers.slice(0, batchSize);
    
    for (const provider of thisBatch) {
      const providerDetail = {
        provider: provider.slug,
        plans: 0,
        status: "processing" as string,
        error: undefined as string | undefined
      };

      try {
        console.log(`\n🔄 ${provider.slug} (${provider.canonical_url})`);
        
        // Fetch HTML from provider
        const html = await fetchWithFallback(provider.canonical_url);
        console.log(`   ✅ Fetched (${Math.round(html.length / 1024)}KB)`);

        // Find and execute parser
        const parser = findParserForUrl(provider.canonical_url);
        if (!parser) {
          throw new Error(`No parser for: ${provider.canonical_url}`);
        }

        let extracts: any[] = [];
        try {
          const parsed = await parser.parse(html, provider.canonical_url);
          if (!Array.isArray(parsed)) throw new Error('Parser did not return array');
          extracts = parsed;
          console.log(`   ✅ Extracted ${extracts.length} plans`);
        } catch (parseErr) {
          throw new Error(`Parse failed: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`);
        }

        // Process and upsert plans
        let plansUpdated = 0;
        for (const extract of extracts) {
          try {
            const normalized = normalizeExtract(extract);
            const validated = validatePlan(normalized);
            
            if (!validated.ok) {
              console.warn(`   ⚠️  Plan validation failed: "${normalized.planName}"`);
              continue;
            }

            await upsertPlanEnhanced(db as any, provider.id, normalized);
            plansUpdated++;
          } catch (planErr) {
            console.error(`   ❌ Plan error:`, planErr);
          }
        }

        providerDetail.plans = plansUpdated;
        result.processedPlansThisBatch += plansUpdated;

        // Mark provider as verified
        const now = new Date().toISOString();
        await db.prepare(`
          UPDATE providers SET
            metadata_verification_status = 'Verified',
            metadata_verified_date = ?,
            metadata_verified_by = 'data-population-script',
            metadata_source = 'parser-extraction',
            metadata_verification_notes = ?,
            last_fetch_at = ?,
            last_error = NULL
          WHERE id = ?
        `).bind(now, `Updated ${plansUpdated} plans on ${now}`, now, provider.id).run();

        result.verifiedThisBatch++;
        result.processedThisBatch++;
        providerDetail.status = `✅ (${plansUpdated} plans)`;
        console.log(`   ✅ Verified with ${plansUpdated} plans`);

      } catch (err) {
        result.errors++;
        const errorMsg = err instanceof Error ? err.message : String(err);
        providerDetail.status = `❌`;
        providerDetail.error = errorMsg;
        console.error(`   ❌ ${errorMsg}`);

        // Mark as needs review
        await db.prepare(`
          UPDATE providers SET
            metadata_verification_status = 'Failed',
            metadata_verification_notes = ?,
            needs_review = 1,
            last_fetch_at = ?
          WHERE id = ?
        `).bind(errorMsg, new Date().toISOString(), provider.id).run();
      }

      result.details.push(providerDetail);
    }

    result.duration = Date.now() - startTime;
    result.moreToProcess = providers.length > batchSize;
    result.processedOverall = result.verifiedOverall + result.processedThisBatch;

    console.log("\n" + "=".repeat(60));
    console.log("📋 Batch Summary:");
    console.log(`   ✅ This Batch: ${result.processedThisBatch}/${batchSize} providers`);
    console.log(`   📊 Plans Updated: ${result.processedPlansThisBatch}`);
    console.log(`   ⏱️  Duration: ${(result.duration / 1000).toFixed(2)}s`);
    if (result.moreToProcess) {
      console.log(`   ➡️  MORE BATCHES REMAINING - Call again to continue`);
    } else {
      console.log(`   ✅ ALL PROVIDERS COMPLETE!`);
    }
    console.log("=".repeat(60));

    return { ok: true, result };
  } catch (err) {
    console.error("💥 Data population batch failed:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      result
    };
  }
}

async function upsertPlanEnhanced(
  db: SimpleDB,
  providerId: number,
  ext: any
) {
  const now = new Date().toISOString();
  const technologyType = ext.technologyType || 'standard';
  const planType = ext.planType || 'residential';

  // Extract all 9 fields
  const speedTier = ext.speedTier ?? null;
  const uploadSpeedMbps = ext.uploadSpeedMbps ?? null;
  const dataAllowance = ext.dataAllowance ?? null;
  const contractMonths = ext.contractMonths ?? null;
  const modemIncluded = ext.modemIncluded ? 1 : 0;
  const setupFeeCents = ext.setupFeeCents ?? null;
  const introPriceCents = ext.introPriceCents ?? null;
  const ongoingPriceCents = ext.ongoingPriceCents ?? null;

  // Check if plan already exists
  const existing = (await db.prepare(
    "SELECT id FROM plans WHERE provider_id = ? AND plan_name = ?"
  ).bind(providerId, ext.planName).first()) as { id?: number } | undefined;

  if (existing && typeof existing.id === 'number') {
    // Update existing plan with all new fields
    await db.prepare(`
      UPDATE plans SET
        speed_tier = ?,
        upload_speed_mbps = ?,
        data_allowance = ?,
        contract_months = ?,
        modem_included = ?,
        setup_fee_cents = ?,
        intro_price_cents = ?,
        ongoing_price_cents = ?,
        technology_type = ?,
        plan_type = ?,
        updated_at = ?,
        is_active = 1
      WHERE id = ?
    `).bind(
      speedTier,
      uploadSpeedMbps,
      dataAllowance,
      contractMonths,
      modemIncluded,
      setupFeeCents,
      introPriceCents,
      ongoingPriceCents,
      technologyType,
      planType,
      now,
      existing.id
    ).run();
  } else {
    // Insert new plan with all fields
    await db.prepare(`
      INSERT INTO plans (
        provider_id, plan_name, speed_tier, upload_speed_mbps, data_allowance,
        contract_months, modem_included, setup_fee_cents, intro_price_cents,
        ongoing_price_cents, source_url, technology_type, plan_type,
        last_checked_at, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      providerId,
      ext.planName,
      speedTier,
      uploadSpeedMbps,
      dataAllowance,
      contractMonths,
      modemIncluded,
      setupFeeCents,
      introPriceCents,
      ongoingPriceCents,
      ext.sourceUrl || null,
      technologyType,
      planType,
      now,
      1,
      now,
      now
    ).run();
  }
}

/**
 * Get data population status
 */
export async function getDataPopulationStatus() {
  const db = (await getDb()) as SimpleDB;
  
  const verifiedStmt = db.prepare(
    "SELECT COUNT(*) as count FROM providers WHERE metadata_verification_status = 'Verified'"
  );
  const verified = (await verifiedStmt.first()) as { count: number } | undefined;

  const pendingStmt = db.prepare(
    "SELECT COUNT(*) as count FROM providers WHERE metadata_verification_status = 'Pending'"
  );
  const pending = (await pendingStmt.first()) as { count: number } | undefined;

  const failedStmt = db.prepare(
    "SELECT COUNT(*) as count FROM providers WHERE metadata_verification_status = 'Failed'"
  );
  const failed = (await failedStmt.first()) as { count: number } | undefined;

  const plansStmt = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN upload_speed_mbps IS NOT NULL THEN 1 ELSE 0 END) as with_upload_speed,
      SUM(CASE WHEN data_allowance IS NOT NULL THEN 1 ELSE 0 END) as with_data_allowance,
      SUM(CASE WHEN contract_months IS NOT NULL THEN 1 ELSE 0 END) as with_contract_months,
      SUM(CASE WHEN modem_included IS NOT NULL THEN 1 ELSE 0 END) as with_modem_included,
      SUM(CASE WHEN setup_fee_cents IS NOT NULL THEN 1 ELSE 0 END) as with_setup_fee
    FROM plans WHERE is_active = 1
  `);
  const plansStats = (await plansStmt.first()) as any | undefined;

  return {
    providers: {
      verified: verified?.count || 0,
      pending: pending?.count || 0,
      failed: failed?.count || 0,
      total: (verified?.count || 0) + (pending?.count || 0) + (failed?.count || 0)
    },
    plans: {
      total: plansStats?.total || 0,
      with_upload_speed: plansStats?.with_upload_speed || 0,
      with_data_allowance: plansStats?.with_data_allowance || 0,
      with_contract_months: plansStats?.with_contract_months || 0,
      with_modem_included: plansStats?.with_modem_included || 0,
      with_setup_fee: plansStats?.with_setup_fee || 0
    }
  };
}
