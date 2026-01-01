import type { PlanExtract } from "../../types";
import { parsePriceToCents, normalizeSpeed } from "../../validators";
import { parseHTML } from "../dom-utils";

export function canHandle(url: string) {
  return url.includes("optus.com") || url.includes("optus.com.au");
}

export async function parse(html: string, url: string): Promise<PlanExtract[]> {
  const doc = parseHTML(html);
  const cards = Array.from(doc.querySelectorAll(".offer, .product, .plan-card, .plan"));
  return cards.map((el) => {
    const planName = (el.querySelector("h3")?.textContent || el.querySelector(".title")?.textContent || "").trim();
    const priceText = (el.querySelector(".price")?.textContent || "").trim();
    const speedMatch = (el.textContent || "").match(/(NBN\s*)?(\d{1,4})/i);
    const parsedSpeed = speedMatch ? parseInt(speedMatch[2]) : null;
    return {
      providerSlug: "optus",
      planName: planName || "Not stated",
      speedTier: normalizeSpeed(parsedSpeed),
      introPriceCents: parsePriceToCents(priceText),
      introDurationDays: null,
      ongoingPriceCents: parsePriceToCents(priceText),
      minTermDays: null,
      setupFeeCents: null,
      modemCostCents: null,
      conditionsText: el.querySelector(".terms")?.textContent?.trim() ?? null,
      typicalEveningSpeedMbps: null,
      sourceUrl: url,
    };
  });
}
