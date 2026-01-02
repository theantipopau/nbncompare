import { getDb } from "../lib/db";
import { jsonResponse } from "../lib/cors";

export async function getPriceHistory(planIdParam: string) {
  try {
    const planId = parseInt(planIdParam, 10);
    if (isNaN(planId)) {
      return jsonResponse({ ok: false, error: "Invalid plan ID" }, 400);
    }

    const db = await getDb();
    
    const history = await db
      .prepare(`
        SELECT 
          ph.id,
          ph.plan_id,
          ph.price_cents,
          ph.recorded_at
        FROM price_history ph
        WHERE ph.plan_id = ?
        ORDER BY ph.recorded_at DESC
        LIMIT 100
      `)
      .bind(planId)
      .all();

    return jsonResponse({
      ok: true,
      history: history.results || []
    });
  } catch (err) {
    console.error("Price history error:", err);
    return jsonResponse({ ok: false, error: String(err) }, 500);
  }
}
