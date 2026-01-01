import type { PlanExtract } from "../..//types";
import { normalizeSpeed, parsePriceToCents } from "../../validators";
import { parseHTML } from "../dom-utils";

export function canHandle(url: string) {
  return url.includes("aussiebroadband.com.au");
}

export async function parse(html: string, url: string): Promise<PlanExtract[]> {
  // Simple deterministic parser for Aussie Broadband's NBN plans.
  // Uses DOMParser available in Cloudflare Workers or Node + jsdom during testing.
  const doc = parseHTML(html);
  const cards = Array.from(doc.querySelectorAll(".product-card, .plan-card, .nbn-plan"));
  const results: PlanExtract[] = cards.map((el) => {
    const planName = (el.querySelector("h3")?.textContent || el.querySelector(".title")?.textContent || "").trim();
    const priceText = (el.querySelector(".price")?.textContent || "").trim();
    const speedMatch = (el.textContent || "").match(/NBN\s*(\d{1,4})/i);
    const parsedSpeed = speedMatch ? parseInt(speedMatch[1]) : null;
    return {
      providerSlug: "aussiebroadband",
      planName: planName || "Not stated",
      speedTier: normalizeSpeed(parsedSpeed),
      introPriceCents: parsePriceToCents(priceText),
      introDurationDays: null,
      ongoingPriceCents: parsePriceToCents(priceText),
      minTermDays: null,
      setupFeeCents: null,
      modemCostCents: null,
      conditionsText: null,
      typicalEveningSpeedMbps: null,
      sourceUrl: url,
    };
  });
  return results;
}


