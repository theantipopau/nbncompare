import { getDb } from "../lib/db";
import { jsonResponse } from "../lib/cors";

interface CountResult {
  count: number;
}

interface PlanSample {
  id: number;
  plan_name: string;
  provider_id: number;
  ongoing_price_cents?: number;
}

interface QueryResults<T> {
  results: T[];
}

function toInt(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export async function getAudit(_req: Request) {
  const db = (await getDb()) as D1Database;

  const now = await db.prepare("SELECT datetime('now') as now").first();

  const missingSourceUrl = await db
    .prepare(
      "SELECT COUNT(*) as count FROM plans WHERE is_active = 1 AND (source_url IS NULL OR TRIM(source_url) = '')"
    )
    .first() as CountResult | null;

  const missingSourceUrlSample = await db
    .prepare(
      "SELECT id, plan_name, provider_id FROM plans WHERE is_active = 1 AND (source_url IS NULL OR TRIM(source_url) = '') LIMIT 20"
    )
    .all() as QueryResults<PlanSample>;

  const missingPrice = await db
    .prepare(
      "SELECT COUNT(*) as count FROM plans WHERE is_active = 1 AND (ongoing_price_cents IS NULL OR ongoing_price_cents <= 0)"
    )
    .first() as CountResult | null;

  const missingPriceSample = await db
    .prepare(
      "SELECT id, plan_name, provider_id, ongoing_price_cents FROM plans WHERE is_active = 1 AND (ongoing_price_cents IS NULL OR ongoing_price_cents <= 0) LIMIT 20"
    )
    .all() as QueryResults<PlanSample>;

  const missingSpeed = await db
    .prepare("SELECT COUNT(*) as count FROM plans WHERE is_active = 1 AND (speed_tier IS NULL OR speed_tier <= 0)")
    .first() as CountResult | null;

  const missingSpeedSample = await db
    .prepare(
      "SELECT id, plan_name, provider_id, speed_tier FROM plans WHERE is_active = 1 AND (speed_tier IS NULL OR speed_tier <= 0) LIMIT 20"
    )
    .all() as QueryResults<PlanSample>;

  const providersMissingMetadata = await db
    .prepare(
      "SELECT COUNT(*) as count FROM providers WHERE active = 1 AND ipv6_support = 0 AND static_ip_available = 0 AND australian_support = 0 AND (description IS NULL OR TRIM(description) = '')"
    )
    .first() as CountResult | null;

  const providersMissingMetadataSample = await db
    .prepare(
      "SELECT id, name, slug, ipv6_support, static_ip_available, australian_support, description FROM providers WHERE active = 1 AND ipv6_support = 0 AND static_ip_available = 0 AND australian_support = 0 AND (description IS NULL OR TRIM(description) = '') LIMIT 20"
    )
    .all() as QueryResults<PlanSample>;

  const response = {
    ok: true,
    now: (now as { now: string } | null)?.now ?? null,
    summary: {
      plans_missing_source_url: toInt(missingSourceUrl?.count),
      plans_missing_price: toInt(missingPrice?.count),
      plans_missing_speed: toInt(missingSpeed?.count),
      providers_missing_metadata: toInt(providersMissingMetadata?.count),
    },
    samples: {
      plans_missing_source_url: missingSourceUrlSample.results ?? missingSourceUrlSample,
      plans_missing_price: missingPriceSample.results ?? missingPriceSample,
      plans_missing_speed: missingSpeedSample.results ?? missingSpeedSample,
      providers_missing_metadata: providersMissingMetadataSample.results ?? providersMissingMetadataSample,
    },
  };

  return jsonResponse(response);
}
