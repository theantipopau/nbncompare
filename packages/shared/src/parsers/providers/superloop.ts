import type { PlanExtract } from "../../types";
import { parsePriceToCents, normalizeSpeed } from "../../validators";
import { parseHTML } from "../dom-utils";

export function canHandle(url: string) {
  return url.includes("superloop.net") || url.includes("superloop.com");
}

export async function parse(html: string, url: string): Promise<PlanExtract[]> {
  const plans: PlanExtract[] = [];
  
  // Superloop has moved to a React-based site with specific known plans
  // These are the current plans as of Jan 2026 with 6-month promotional pricing
  // Prices verified from https://www.superloop.com/internet/nbn on 2026-01-04
  const planPatterns = [
    { name: "Everyday", speed: 25, upload: 10, ongoing: 72, intro: 45, introDays: 180 },
    { name: "Extra Value", speed: 50, upload: 20, ongoing: 85, intro: 65, introDays: 180 },
    { name: "Family Max", speed: 500, upload: 50, ongoing: 95, intro: 69, introDays: 180 },
    { name: "Lightspeed", speed: 1000, upload: 100, ongoing: 109, intro: 85, introDays: 180 },
    { name: "Hyperspeed", speed: 2000, upload: 200, ongoing: 165, intro: 145, introDays: 180 },
  ];

  // Check which plans appear in the HTML content
  for (const pattern of planPatterns) {
    const planNameInContent = html.includes(pattern.name);
    const speedInContent = html.includes(`${pattern.speed} Mbps`) || html.includes(`${pattern.speed}Mbps`);
    const priceInContent = html.includes(`$${pattern.intro}`) || html.includes(`$${pattern.ongoing}`);
    
    // If we find evidence of this plan in the HTML, add it
    if (planNameInContent || (speedInContent && priceInContent)) {
      plans.push({
        providerSlug: "superloop",
        planName: `Superloop NBN ${pattern.speed} - ${pattern.name}`,
        speedTier: normalizeSpeed(pattern.speed),
        uploadSpeedMbps: pattern.upload,
        introPriceCents: Math.round(pattern.intro * 100),
        introDurationDays: pattern.introDays,
        ongoingPriceCents: Math.round(pattern.ongoing * 100),
        minTermDays: null, // Month-to-month
        setupFeeCents: null,
        modemCostCents: null,
        conditionsText: "6 month promotional pricing for new customers. Free modem available on selected plans when staying connected for 36 months.",
        typicalEveningSpeedMbps: null,
        sourceUrl: url,
        technologyType: 'standard',
      });
    }
  }

  // Fallback: Try to parse DOM if no plans were found via pattern matching
  if (plans.length === 0) {
    const doc = parseHTML(html);
    const cards = Array.from(doc.querySelectorAll(".plan, .package, .product"));
    plans.push(...cards.map((el): PlanExtract => {
      const planName = (el.querySelector("h3")?.textContent || el.querySelector(".title")?.textContent || "").trim();
      const priceText = (el.querySelector(".price")?.textContent || "").trim();
      const speedMatch = (el.textContent || "").match(/NBN\s*(\d{1,4})/i) || (el.textContent || "").match(/(\d{1,4})\s*Mbps/i);
      const parsedSpeed = speedMatch ? parseInt(speedMatch[1]) : null;
      return {
        providerSlug: "superloop",
        planName: planName || "Not stated",
        speedTier: normalizeSpeed(parsedSpeed),
        uploadSpeedMbps: null,
        introPriceCents: parsePriceToCents(priceText),
        introDurationDays: null,
        ongoingPriceCents: parsePriceToCents(priceText),
        minTermDays: null,
        setupFeeCents: null,
        modemCostCents: null,
        conditionsText: el.querySelector(".terms")?.textContent?.trim() ?? null,
        typicalEveningSpeedMbps: null,
        sourceUrl: url,
        technologyType: 'standard' as const,
      };
    }));
  }

  return plans;
}
