import { getDb } from "../lib/db";
import { jsonResponse } from "../lib/cors";

export async function getPriceHistory(planId: number) {
  try {
    const db = await getDb();
    
    const history = await db
      .prepare(`
        SELECT 
          ph.price_cents,
          ph.recorded_at,
          p.plan_name,
          pr.name as provider_name
        FROM price_history ph
        JOIN plans p ON ph.plan_id = p.id
        JOIN providers pr ON p.provider_id = pr.id
        WHERE ph.plan_id = ?
        ORDER BY ph.recorded_at DESC
        LIMIT 100
      `)
      .bind(planId)
      .all();

    if (!history.results || history.results.length === 0) {
      return jsonResponse({ ok: false, error: "No price history found for this plan" }, 404);
    }

    return jsonResponse({
      ok: true,
      planId,
      planName: (history.results[0] as any).plan_name,
      providerName: (history.results[0] as any).provider_name,
      history: history.results.map((h: any) => ({
        priceCents: h.price_cents,
        recordedAt: h.recorded_at
      }))
    });
  } catch (err) {
    console.error("Price history error:", err);
    return jsonResponse({ ok: false, error: String(err) }, 500);
  }
}
