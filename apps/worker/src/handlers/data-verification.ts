/**
 * Data Verification and Population Handler
 * Endpoint: GET /internal/verify-data
 * Checks data integrity and returns audit report
 */

import { getDb } from "../lib/db";
import { jsonResponse } from "../lib/cors";

interface CountResult {
  count: number;
}

interface AuditResult {
  total?: number;
  missing_upload_speed?: number;
  missing_data_allowance?: number;
  missing_contract_type?: number;
  missing_modem_flag?: number;
  total_providers?: number;
  with_description?: number;
  with_ipv6?: number;
  no_cgnat?: number;
  with_au_support?: number;
  with_favicon?: number;
}

export async function verifyData(_req: Request) {
  try {
    const db = await getDb();

    // Count statistics
    const providers = await db.prepare("SELECT COUNT(*) as count FROM providers WHERE active = 1").first() as CountResult;
    const plans = await db.prepare("SELECT COUNT(*) as count FROM plans WHERE is_active = 1").first() as CountResult;
    const plansWithIntro = await db.prepare("SELECT COUNT(*) as count FROM plans WHERE is_active = 1 AND intro_price_cents IS NOT NULL").first() as CountResult;

    // Service type distribution
    const byServiceType = await db.prepare(`
      SELECT service_type, COUNT(*) as count 
      FROM plans 
      WHERE is_active = 1 
      GROUP BY service_type
    `).all() as { results: Array<{ service_type: string; count: number }> };

    // Technology type distribution
    const byTechnologyType = await db.prepare(`
      SELECT technology_type, COUNT(*) as count 
      FROM plans 
      WHERE is_active = 1 
      GROUP BY technology_type
    `).all() as { results: Array<{ technology_type: string; count: number }> };

    // Plans per provider
    const plansPerProvider = await db.prepare(`
      SELECT 
        prov.name,
        COUNT(*) as plan_count,
        SUM(CASE WHEN p.is_active = 1 THEN 1 ELSE 0 END) as active_plans,
        SUM(CASE WHEN p.intro_price_cents IS NOT NULL THEN 1 ELSE 0 END) as plans_with_deals
      FROM plans p
      JOIN providers prov ON p.provider_id = prov.id
      GROUP BY prov.id
      ORDER BY active_plans DESC
      LIMIT 20
    `).all() as { results: Array<{ name: string; plan_count: number; active_plans: number; plans_with_deals: number }> };

    // Missing fields check
    const missingFields = await db.prepare(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN upload_speed_mbps IS NULL THEN 1 END) as missing_upload_speed,
        COUNT(CASE WHEN data_allowance IS NULL OR data_allowance = '' THEN 1 END) as missing_data_allowance,
        COUNT(CASE WHEN contract_type IS NULL OR contract_type = '' THEN 1 END) as missing_contract_type,
        COUNT(CASE WHEN modem_included IS NULL THEN 1 END) as missing_modem_flag
      FROM plans
      WHERE is_active = 1
    `).first() as AuditResult;

    // Deals sample
    const topDeals = await db.prepare(`
      SELECT 
        p.id,
        prov.name as provider,
        p.plan_name,
        p.speed_tier,
        ROUND(p.intro_price_cents / 100.0, 2) as intro_price_aud,
        ROUND(p.ongoing_price_cents / 100.0, 2) as ongoing_price_aud,
        ROUND(p.intro_duration_days / 30.0, 0) as intro_months,
        p.promo_code
      FROM plans p
      JOIN providers prov ON p.provider_id = prov.id
      WHERE p.is_active = 1 AND p.intro_price_cents IS NOT NULL
      ORDER BY p.intro_price_cents ASC
      LIMIT 10
    `).all() as { results: Array<{ id: string; provider: string; plan_name: string; speed_tier: string; intro_price_aud: number; ongoing_price_aud: number; intro_months: number; promo_code: string }> };

    // Provider metadata coverage
    const metadataCoverage = await db.prepare(`
      SELECT
        COUNT(*) as total_providers,
        COUNT(CASE WHEN description IS NOT NULL AND description != '' THEN 1 END) as with_description,
        COUNT(CASE WHEN ipv6_support = 1 THEN 1 END) as with_ipv6,
        COUNT(CASE WHEN cgnat = 0 THEN 1 END) as no_cgnat,
        COUNT(CASE WHEN australian_support >= 1 THEN 1 END) as with_au_support,
        COUNT(CASE WHEN favicon_url IS NOT NULL AND favicon_url != '' THEN 1 END) as with_favicon
      FROM providers
      WHERE active = 1
    `).first() as AuditResult;

    const report = {
      ok: true,
      timestamp: new Date().toISOString(),
      summary: {
        active_providers: providers.count,
        active_plans: plans.count,
        plans_with_promotional_pricing: plansWithIntro.count,
        percent_of_plans_with_deals: ((plansWithIntro.count / plans.count) * 100).toFixed(1) + '%'
      },
      distribution: {
        by_service_type: byServiceType?.results || [],
        by_technology_type: byTechnologyType?.results || []
      },
      provider_stats: (plansPerProvider?.results || []).slice(0, 10),
      data_quality: {
        ...missingFields,
        coverage_percent: ((((missingFields.total ?? 0) - ((missingFields.missing_upload_speed ?? 0) + (missingFields.missing_data_allowance ?? 0) + (missingFields.missing_contract_type ?? 0) + (missingFields.missing_modem_flag ?? 0))) / (missingFields.total ?? 1)) * 100).toFixed(1) + '%'
      },
      top_deals: topDeals?.results || [],
      provider_metadata: metadataCoverage
    };

    // Cache the result for 5 minutes
    if (_req.headers.get('X-Check-Cache') !== '1') {
      // Store in KV cache if available (would need to be passed in env)
    }

    return jsonResponse(report);
  } catch (err: unknown) {
    console.error('Data verification error:', err);
    return jsonResponse({
      ok: false,
      error: String(err),
      timestamp: new Date().toISOString()
    }, 500);
  }
}
