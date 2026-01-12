import { getDb } from "../lib/db";

type SimpleStmt = {
  bind: (...args: unknown[]) => SimpleStmt;
  first: () => Promise<unknown>;
  all: () => Promise<{ results: unknown[] }>;
  run: () => Promise<{ meta: { last_row_id?: number } }>;
};

type SimpleDB = {
  prepare: (q: string) => SimpleStmt;
};

export interface ProviderMetadata {
  provider_id: number;
  provider_name: string;
  verification_status: string;
  plan_count: number;
  has_upload_speed: number;
  has_data_allowance: number;
  has_contract_months: number;
  has_modem_included: number;
  metadata_verified_date: string | null;
  metadata_verification_notes: string | null;
}

/**
 * Admin endpoint for provider metadata verification status
 * Returns data for the metadata verification dashboard
 */
export async function getProviderVerification(req: Request) {
  try {
    // Check for admin authorization (optional - can be enhanced)
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Allow for now - in production should verify admin token
      console.warn("No authorization header provided for provider-verification endpoint");
    }

    const db = (await getDb()) as SimpleDB;

    // Get verification status for all providers with plan statistics
    const query = `
      SELECT
        p.id as provider_id,
        p.slug as provider_name,
        p.metadata_verification_status as verification_status,
        COUNT(pl.id) as plan_count,
        SUM(CASE WHEN pl.upload_speed_mbps IS NOT NULL THEN 1 ELSE 0 END) as has_upload_speed,
        SUM(CASE WHEN pl.data_allowance IS NOT NULL THEN 1 ELSE 0 END) as has_data_allowance,
        SUM(CASE WHEN pl.contract_months IS NOT NULL THEN 1 ELSE 0 END) as has_contract_months,
        SUM(CASE WHEN pl.modem_included IS NOT NULL THEN 1 ELSE 0 END) as has_modem_included,
        p.metadata_verified_date,
        p.metadata_verification_notes
      FROM providers p
      LEFT JOIN plans pl ON p.id = pl.provider_id AND pl.is_active = 1
      WHERE p.active = 1
      GROUP BY p.id
      ORDER BY p.slug ASC
    `;

    const stmt = db.prepare(query);
    const result = typeof (stmt as any).all === 'function'
      ? await (stmt as any).all()
      : { results: [] };

    const metadata = (
      result && (result as any).results ? (result as any).results : []
    ) as ProviderMetadata[];

    // Calculate completeness percentages
    const withPercentages = metadata.map((m) => ({
      ...m,
      uploadSpeedPct: m.plan_count > 0 ? ((m.has_upload_speed / m.plan_count) * 100).toFixed(0) : 0,
      dataAllowancePct: m.plan_count > 0 ? ((m.has_data_allowance / m.plan_count) * 100).toFixed(0) : 0,
      contractMonthsPct: m.plan_count > 0 ? ((m.has_contract_months / m.plan_count) * 100).toFixed(0) : 0,
      modemIncludedPct: m.plan_count > 0 ? ((m.has_modem_included / m.plan_count) * 100).toFixed(0) : 0
    }));

    return new Response(JSON.stringify({ ok: true, data: withPercentages }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: unknown) {
    console.error("Provider verification endpoint error:", err);
    return new Response(
      JSON.stringify({
        ok: false,
        error: err instanceof Error ? err.message : String(err)
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
