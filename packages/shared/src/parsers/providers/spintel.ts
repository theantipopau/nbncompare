import type { PlanExtract } from "../..//types";
import { normalizeSpeed, parsePriceToCents } from "../../validators";
import { parseHTML } from "../dom-utils";

export function canHandle(url: string) {
  return url.includes("spintel.net.au") || url.includes("spintel.com");
}

export async function parse(html: string, url: string): Promise<PlanExtract[]> {
  const doc = parseHTML(html);
  const results: PlanExtract[] = [];
  const rows = Array.from(doc.querySelectorAll(".plans-list .plan, .plan-block"));
  if (rows.length === 0) {
    // fallback: try to find price blocks
    const priceEls = Array.from(doc.querySelectorAll(".price"));
    for (const p of priceEls) {
      results.push({
        providerSlug: "spintel",
        planName: p.previousElementSibling?.textContent?.trim() || "Plan",
        speedTier: null,
        introPriceCents: parsePriceToCents(p.textContent || ""),
        introDurationDays: null,
        ongoingPriceCents: parsePriceToCents(p.textContent || ""),
        minTermDays: null,
        setupFeeCents: null,
        modemCostCents: null,
        conditionsText: null,
        typicalEveningSpeedMbps: null,
        sourceUrl: url,
      });
    }
  } else {
    for (const el of rows) {
      const s = (el.textContent || "").match(/NBN\s*(\d{1,4})/i)?.[1] ?? null;
      results.push({
        providerSlug: "spintel",
        planName: (el.querySelector(".name")?.textContent || el.querySelector("h4")?.textContent || "").trim(),
        speedTier: normalizeSpeed(s ? parseInt(s) : null),
        introPriceCents: parsePriceToCents(el.querySelector(".price")?.textContent || ""),
        introDurationDays: null,
        ongoingPriceCents: parsePriceToCents(el.querySelector(".price")?.textContent || ""),
        minTermDays: null,
        setupFeeCents: null,
        modemCostCents: null,
        conditionsText: null,
        typicalEveningSpeedMbps: null,
        sourceUrl: url,
      });
    }
  }
  return results;
}


