import type { PlanExtract } from "../..//types";
import { normalizeSpeed, parsePriceToCents } from "../../validators";
import { parseHTML } from "../dom-utils";

export function canHandle(url: string) {
  return url.includes("dodo.com.au");
}

export async function parse(html: string, url: string): Promise<PlanExtract[]> {
  const doc = parseHTML(html);
  const plans = Array.from(doc.querySelectorAll(".plan, .product"));
  return plans.map((p) => {
    const name = p.querySelector("h3, h2, .title")?.textContent?.trim() || "Not stated";
    const price = p.querySelector(".price")?.textContent || p.textContent || "";
    const s = (p.textContent || "").match(/NBN\s*(\d{1,4})/i)?.[1] ?? null;
    return {
      providerSlug: "dodo",
      planName: name,
      speedTier: normalizeSpeed(s ? parseInt(s) : null),
      introPriceCents: parsePriceToCents(price),
      introDurationDays: null,
      ongoingPriceCents: parsePriceToCents(price),
      minTermDays: null,
      setup_fee_cents: null,
      setupFeeCents: null,
      modemCostCents: null,
      conditionsText: null,
      typicalEveningSpeedMbps: null,
      sourceUrl: url,
    };
  });
}

