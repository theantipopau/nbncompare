import type { PlanExtract } from "../../types";
import { parsePriceToCents, normalizeSpeed } from "../../validators";
import { parseHTML } from "../dom-utils";

export function canHandle(url: string) {
  return url.includes("superloop.net") || url.includes("superloop.com");
}

export async function parse(html: string, url: string): Promise<PlanExtract[]> {
  const doc = parseHTML(html);
  const cards = Array.from(doc.querySelectorAll(".plan, .package, .product"));
  return cards.map((el) => {
    const planName = (el.querySelector("h3")?.textContent || el.querySelector(".title")?.textContent || "").trim();
    const priceText = (el.querySelector(".price")?.textContent || "").trim();
    const speedMatch = (el.textContent || "").match(/NBN\s*(\d{1,4})/i) || (el.textContent || "").match(/(\d{1,4})\s*Mbps/i);
    const parsedSpeed = speedMatch ? parseInt(speedMatch[1]) : null;
    return {
      providerSlug: "superloop",
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
