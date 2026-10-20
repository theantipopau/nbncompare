// Workers AI removed (cost control). Read endpoints below serve cached summaries
// from D1; refresh is a no-op unless a free external summarizer is wired up.
import { getDb } from "../lib/db";
import { jsonResponse } from "../lib/cors";

// The Worker no longer provides an AI binding; refresh ignores its argument.

type SimpleStmt = {
  bind: (...args: unknown[]) => SimpleStmt;
  first: () => Promise<unknown>;
  all: () => Promise<{ results: unknown[] }>;
  run: () => Promise<{ meta: { last_row_id?: number } }>;
};

type SimpleDB = {
  prepare: (q: string) => SimpleStmt;
};

type SummaryRow = { summary: string | null; updated_at: string | null } | null;

async function logAiRun(db: SimpleDB, runType: string, status: string, error?: string) {
  const now = new Date().toISOString();
  await db
    .prepare(
      "INSERT INTO ai_run_log (run_type, started_at, completed_at, status, error) VALUES (?,?,?,?,?)"
    )
    .bind(runType, now, now, status, error ?? null)
    .run();
}

export async function refreshAiSummaries(_env?: unknown) {
  const db = (await getDb()) as SimpleDB;
  await logAiRun(db, "refresh", "skipped", "Workers AI disabled (free-plan cost control)");
  return {
    ok: false,
    error:
      "AI summaries disabled — Workers AI binding removed to stay free. Stored summaries remain readable.",
  };
}

export async function getPlanSummary(req: Request) {
  const url = new URL(req.url);
  const planId = url.searchParams.get("planId");
  if (!planId) return jsonResponse({ ok: false, error: "Missing planId" }, 400);
  const db = (await getDb()) as SimpleDB;
  const row = (await db
    .prepare("SELECT summary, updated_at FROM plan_ai_summaries WHERE plan_id = ?")
    .bind(planId)
    .first()) as SummaryRow;
  return jsonResponse({ ok: true, summary: row?.summary ?? null, updated_at: row?.updated_at ?? null });
}

export async function getProviderSummary(req: Request) {
  const url = new URL(req.url);
  const providerId = url.searchParams.get("providerId");
  if (!providerId) return jsonResponse({ ok: false, error: "Missing providerId" }, 400);
  const db = (await getDb()) as SimpleDB;
  const row = (await db
    .prepare("SELECT summary, updated_at FROM provider_ai_summaries WHERE provider_id = ?")
    .bind(providerId)
    .first()) as SummaryRow;
  return jsonResponse({
    ok: true,
    summary: row?.summary ?? null,
    updated_at: row?.updated_at ?? null,
  });
}

export async function getBestDealsSummary() {
  const db = (await getDb()) as SimpleDB;
  const row = (await db
    .prepare("SELECT summary, updated_at FROM best_deals_summary WHERE id = 1")
    .first()) as SummaryRow;
  return jsonResponse({ ok: true, summary: row?.summary ?? null, updated_at: row?.updated_at ?? null });
}
