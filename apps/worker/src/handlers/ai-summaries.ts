import { Ai } from "@cloudflare/ai";
import { getDb } from "../lib/db";
import { jsonResponse } from "../lib/cors";

type Env = { AI?: unknown };

type AiTextResult = { response?: string; result?: string } | string;

type SimpleStmt = {
  bind: (...args: unknown[]) => SimpleStmt;
  first: () => Promise<unknown>;
  all: () => Promise<{ results: unknown[] }>;
  run: () => Promise<{ meta: { last_row_id?: number } }>;
};

type SimpleDB = {
  prepare: (q: string) => SimpleStmt;
};

const PLAN_SUMMARY_MODEL = "@cf/meta/llama-3.1-8b-instruct";
const PROVIDER_SUMMARY_MODEL = "@cf/meta/llama-3.1-8b-instruct";
const DEALS_SUMMARY_MODEL = "@cf/meta/llama-3.1-8b-instruct";

const SUMMARY_MAX_AGE_DAYS = 7;

type PlanRow = {
  id: number;
  plan_name: string;
  speed_tier: number | null;
  upload_speed_mbps: number | null;
  intro_price_cents: number | null;
  ongoing_price_cents: number | null;
  intro_duration_days: number | null;
  contract_type: string | null;
  data_allowance: string | null;
  modem_included: number | null;
  technology_type: string | null;
  promo_code: string | null;
  promo_description: string | null;
  provider_name: string;
};

type ProviderRowSummary = {
  id: number;
  name: string;
  description: string | null;
  ipv6_support: number | null;
  cgnat: number | null;
  cgnat_opt_out: number | null;
  static_ip_available: number | null;
  australian_support: number | null;
  support_hours: string | null;
  routing_info: string | null;
  plan_count: number | null;
  min_price: number | null;
  max_speed: number | null;
};

type DealRow = {
  id: number;
  plan_name: string;
  speed_tier: number | null;
  ongoing_price_cents: number | null;
  intro_price_cents: number | null;
  intro_duration_days: number | null;
  promo_code: string | null;
  promo_description: string | null;
  provider_name: string;
};

type SummaryRow = { summary: string | null; updated_at: string | null } | null;

function pickAiText(result: AiTextResult): string {
  if (typeof result === "string") return result;
  return result.response ?? result.result ?? "";
}

function formatMoney(cents: number | null | undefined): string {
  if (!cents || cents <= 0) return "N/A";
  return `$${(cents / 100).toFixed(2)}/mo`;
}

async function logAiRun(db: SimpleDB, runType: string, status: string, error?: string) {
  const now = new Date().toISOString();
  await db.prepare(
    "INSERT INTO ai_run_log (run_type, started_at, completed_at, status, error) VALUES (?,?,?,?,?)"
  ).bind(runType, now, now, status, error ?? null).run();
}

export async function refreshAiSummaries(env: Env) {
  const db = (await getDb()) as SimpleDB;
  if (!env?.AI) {
    await logAiRun(db, "refresh", "skipped", "Missing AI binding");
    return { ok: false, error: "Missing AI binding" };
  }

  const ai = new Ai(env.AI);
  const planResult = await generatePlanSummaries(db, ai);
  const providerResult = await generateProviderSummaries(db, ai);
  const dealsResult = await generateBestDealsSummary(db, ai);

  return {
    ok: true,
    plans: planResult,
    providers: providerResult,
    bestDeals: dealsResult,
  };
}

async function generatePlanSummaries(db: SimpleDB, ai: Ai) {
  const planRows = await db.prepare(
    `SELECT p.id, p.plan_name, p.speed_tier, p.upload_speed_mbps,
            p.intro_price_cents, p.ongoing_price_cents, p.intro_duration_days,
            p.contract_type, p.data_allowance, p.modem_included, p.technology_type,
            p.promo_code, p.promo_description, prov.name as provider_name
     FROM plans p
     JOIN providers prov ON p.provider_id = prov.id
     LEFT JOIN plan_ai_summaries s ON s.plan_id = p.id
     WHERE p.is_active = 1
       AND (s.updated_at IS NULL OR s.updated_at < datetime('now', ?))
     ORDER BY p.updated_at DESC
     LIMIT 20`
  ).bind(`-${SUMMARY_MAX_AGE_DAYS} days`).all();

  const plans = getResults<PlanRow>(planRows);
  let updated = 0;

  for (const plan of plans) {
    const prompt = `Summarize this NBN plan in 2-3 short sentences. Be factual and concise.\n\n` +
      `Provider: ${plan.provider_name}\n` +
      `Plan: ${plan.plan_name}\n` +
      `Speed: ${plan.speed_tier ?? "N/A"} Mbps down / ${plan.upload_speed_mbps ?? "N/A"} Mbps up\n` +
      `Intro Price: ${formatMoney(plan.intro_price_cents)} for ${plan.intro_duration_days ? Math.round(plan.intro_duration_days / 30) + " months" : "N/A"}\n` +
      `Ongoing Price: ${formatMoney(plan.ongoing_price_cents)}\n` +
      `Contract: ${plan.contract_type ?? "month-to-month"}\n` +
      `Data: ${plan.data_allowance ?? "Unlimited"}\n` +
      `Modem: ${plan.modem_included === 1 ? "Included" : "BYO"}\n` +
      `Technology: ${plan.technology_type ?? "standard"}\n` +
      `Promo: ${plan.promo_code ?? "None"} ${plan.promo_description ?? ""}`;

    const result = await ai.run(PLAN_SUMMARY_MODEL, {
      messages: [
        { role: "system", content: "You are an ISP plan analyst. Output plain text only." },
        { role: "user", content: prompt }
      ]
    });

    const summary = pickAiText(result).trim();
    if (!summary) continue;

    await db.prepare(
      "INSERT INTO plan_ai_summaries (plan_id, summary, updated_at) VALUES (?,?,?) " +
      "ON CONFLICT(plan_id) DO UPDATE SET summary = excluded.summary, updated_at = excluded.updated_at"
    ).bind(plan.id, summary, new Date().toISOString()).run();

    updated++;
  }

  await logAiRun(db, "plan_summaries", "ok");
  return { updated, processed: plans.length };
}

async function generateProviderSummaries(db: SimpleDB, ai: Ai) {
  const providerRows = await db.prepare(
    `SELECT prov.id, prov.name, prov.description, prov.ipv6_support, prov.cgnat,
            prov.cgnat_opt_out, prov.static_ip_available, prov.australian_support,
            prov.support_hours, prov.routing_info,
            COUNT(p.id) as plan_count,
            MIN(p.ongoing_price_cents) as min_price,
            MAX(p.speed_tier) as max_speed
     FROM providers prov
     LEFT JOIN plans p ON p.provider_id = prov.id AND p.is_active = 1
     LEFT JOIN provider_ai_summaries s ON s.provider_id = prov.id
     WHERE prov.active = 1
       AND (s.updated_at IS NULL OR s.updated_at < datetime('now', ?))
     GROUP BY prov.id
     ORDER BY prov.name
     LIMIT 15`
  ).bind(`-${SUMMARY_MAX_AGE_DAYS} days`).all();

  const providers = getResults<ProviderRowSummary>(providerRows);
  let updated = 0;

  for (const provider of providers) {
    const prompt = `Summarize this Australian NBN provider in 2-3 short sentences. Be factual and concise.\n\n` +
      `Provider: ${provider.name}\n` +
      `Plans: ${provider.plan_count ?? 0}\n` +
      `Cheapest ongoing price: ${formatMoney(provider.min_price)}\n` +
      `Max speed: ${provider.max_speed ?? "N/A"} Mbps\n` +
      `IPv6: ${provider.ipv6_support ? "Yes" : "No"}\n` +
      `CGNAT: ${provider.cgnat === 0 ? "No" : "Yes"}\n` +
      `CGNAT opt-out: ${provider.cgnat_opt_out ? "Yes" : "No"}\n` +
      `Static IP: ${provider.static_ip_available ? "Available" : "No"}\n` +
      `Australian support: ${provider.australian_support ? "Yes" : "No"}\n` +
      `Support hours: ${provider.support_hours ?? "N/A"}\n` +
      `Routing: ${provider.routing_info ?? "N/A"}`;

    const result = await ai.run(PROVIDER_SUMMARY_MODEL, {
      messages: [
        { role: "system", content: "You are an ISP provider analyst. Output plain text only." },
        { role: "user", content: prompt }
      ]
    });

    const summary = pickAiText(result).trim();
    if (!summary) continue;

    await db.prepare(
      "INSERT INTO provider_ai_summaries (provider_id, summary, updated_at) VALUES (?,?,?) " +
      "ON CONFLICT(provider_id) DO UPDATE SET summary = excluded.summary, updated_at = excluded.updated_at"
    ).bind(provider.id, summary, new Date().toISOString()).run();

    updated++;
  }

  await logAiRun(db, "provider_summaries", "ok");
  return { updated, processed: providers.length };
}

async function generateBestDealsSummary(db: SimpleDB, ai: Ai) {
  const dealsRows = await db.prepare(
    `SELECT p.id, p.plan_name, p.speed_tier, p.ongoing_price_cents, p.intro_price_cents,
            p.intro_duration_days, p.promo_code, p.promo_description, prov.name as provider_name
     FROM plans p
     JOIN providers prov ON p.provider_id = prov.id
     WHERE p.is_active = 1
     ORDER BY (p.intro_price_cents IS NULL), p.intro_price_cents ASC, p.ongoing_price_cents ASC
     LIMIT 12`
  ).all();

  const deals = getResults<DealRow>(dealsRows);
  const lines = deals.map((deal) => {
    const intro = deal.intro_price_cents ? `${formatMoney(deal.intro_price_cents)} for ${deal.intro_duration_days ? Math.round(deal.intro_duration_days / 30) + " months" : "intro"}` : "N/A";
    return `- ${deal.provider_name}: ${deal.plan_name} (${deal.speed_tier ?? "N/A"} Mbps) | Intro: ${intro} | Ongoing: ${formatMoney(deal.ongoing_price_cents)} | Promo: ${deal.promo_code ?? "None"} ${deal.promo_description ?? ""}`;
  }).join("\n");

  const prompt = `Summarize the best current NBN deals in 3-5 bullet points. Be concise and factual.\n\n${lines}`;

  const result = await ai.run(DEALS_SUMMARY_MODEL, {
    messages: [
      { role: "system", content: "You summarize NBN deals for consumers. Output plain text bullets only." },
      { role: "user", content: prompt }
    ]
  });

  const summary = pickAiText(result).trim();
  if (summary) {
    await db.prepare(
      "INSERT INTO best_deals_summary (id, summary, updated_at) VALUES (1, ?, ?) " +
      "ON CONFLICT(id) DO UPDATE SET summary = excluded.summary, updated_at = excluded.updated_at"
    ).bind(summary, new Date().toISOString()).run();
  }

  await logAiRun(db, "best_deals", "ok");
  return { updated: summary ? 1 : 0, processed: deals.length };
}

export async function getPlanSummary(req: Request) {
  const url = new URL(req.url);
  const planId = url.searchParams.get("planId");
  if (!planId) return jsonResponse({ ok: false, error: "Missing planId" }, 400);
  const db = (await getDb()) as SimpleDB;
  const row = (await db.prepare("SELECT summary, updated_at FROM plan_ai_summaries WHERE plan_id = ?").bind(planId).first()) as SummaryRow;
  return jsonResponse({ ok: true, summary: row?.summary ?? null, updated_at: row?.updated_at ?? null });
}

export async function getProviderSummary(req: Request) {
  const url = new URL(req.url);
  const providerId = url.searchParams.get("providerId");
  if (!providerId) return jsonResponse({ ok: false, error: "Missing providerId" }, 400);
  const db = (await getDb()) as SimpleDB;
  const row = (await db.prepare("SELECT summary, updated_at FROM provider_ai_summaries WHERE provider_id = ?").bind(providerId).first()) as SummaryRow;
  return jsonResponse({ ok: true, summary: row?.summary ?? null, updated_at: row?.updated_at ?? null });
}

export async function getBestDealsSummary() {
  const db = (await getDb()) as SimpleDB;
  const row = (await db.prepare("SELECT summary, updated_at FROM best_deals_summary WHERE id = 1").first()) as SummaryRow;
  return jsonResponse({ ok: true, summary: row?.summary ?? null, updated_at: row?.updated_at ?? null });
}

function getResults<T>(rows: { results?: unknown[] } | T[]): T[] {
  if (Array.isArray(rows)) return rows as T[];
  return Array.isArray(rows.results) ? (rows.results as T[]) : [];
}
