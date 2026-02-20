/// <reference lib="dom" />
import type { PlanExtract } from "../../types";
import { normalizeSpeed } from "../../validators";
import { parseHTML } from "../dom-utils";

function extractUploadSpeed(planElement: globalThis.Element | null, downloadSpeed: number | null): number | null {
  if (!downloadSpeed) return null;
  const planText = planElement?.textContent || "";
  const uploadMatch = planText.match(/(\d+)\s*Mbps\s*(up|upload|↑)/i);
  if (uploadMatch) {
    return parseInt(uploadMatch[1]);
  }
  const uploadRatios: { [key: number]: number } = {
    12: 1, 25: 1, 50: 2, 100: 10, 200: 20, 250: 20, 400: 40, 500: 40, 1000: 50, 2000: 100,
  };
  return uploadRatios[downloadSpeed] || null;
}

function extractDataAllowance(planElement: globalThis.Element | null): string | null {
  const planText = (planElement?.textContent || "").toLowerCase();
  if (planText.includes("unlimited")) return "Unlimited";
  const amountMatch = planText.match(/(\d+\.?\d*)\s*(tb|gb)/i);
  return amountMatch ? `${amountMatch[1]}${amountMatch[2].toUpperCase()}` : null;
}

function extractContractMonths(planElement: globalThis.Element | null): number | null {
  const planText = (planElement?.textContent || "").toLowerCase();
  if (planText.includes("no contract") || planText.includes("month-to-month")) return 0;
  if (planText.includes("24 month") || planText.includes("2 year")) return 24;
  if (planText.includes("12 month") || planText.includes("1 year")) return 12;
  return null;
}

function extractModemIncluded(planElement: globalThis.Element | null): boolean | null {
  const planText = (planElement?.textContent || "").toLowerCase();
  if (planText.includes("modem included") || planText.includes("router included") || planText.includes("free modem")) return true;
  if (planText.includes("modem $") || planText.includes("bring your own") || planText.includes("your own modem")) return false;
  return null;
}

function extractSetupFee(planElement: globalThis.Element | null): number | null {
  const planText = planElement?.textContent || "";
  if (planText.match(/free\s*(setup|connection|installation)/i)) return 0;
  const feeMatch = planText.match(/(setup|connection|installation)[\s:]*\$(\d+(?:\.\d{2})?)/i);
  return feeMatch ? Math.round(parseFloat(feeMatch[2]) * 100) : null;
}

export function canHandle(url: string) {
  return url.includes("arctel.com.au");
}

export async function parse(html: string, url: string): Promise<PlanExtract[]> {
  const doc = parseHTML(html);
  const results: PlanExtract[] = [];

  // Arctel uses plan cards/sections, try multiple selectors
  const planElements = Array.from(
    doc.querySelectorAll(
      ".plan-card, .plan-box, .pricing-card, .nbn-plan, [class*='plan'], [class*='pricing']"
    )
  );

  for (const element of planElements) {
    const text = element.textContent || "";
    
    // Skip if element has no content or is too small
    if (text.length < 20) continue;

    // Extract speed - look for "NBN XXXX" or "XXXX Mbps"
    const speedMatch = text.match(/NBN\s*(\d{3,4})/i) || 
                       text.match(/(\d{3,4})\s*(?:Mbps|mbps)/i) ||
                       text.match(/(\d)\s*Gbps/i);
    
    if (!speedMatch) continue;

    let speedValue = parseInt(speedMatch[1]);
    if (text.match(/Gbps/i)) {
      speedValue = speedValue * 1000;
    }

    const speedTier = normalizeSpeed(speedValue);
    if (!speedTier) continue;

    // Extract plan name
    const titleEl = element.querySelector("h2, h3, h4, .title, .plan-name");
    const planName = (titleEl?.textContent || text.slice(0, 50)).trim();

    // Look for pricing info - check for both intro and ongoing prices
    // Pattern: "$80/mo" or "$80/month" or "$80 per month"
    // Also look for "for 12 months then $XX"
    
    let introPriceCents: number | null = null;
    let introDurationDays: number | null = null;
    let ongoingPriceCents: number | null = null;

    // Match patterns like "$80 for 12 months then $99"
    const dealMatch = text.match(
      /\$\s*(\d+(?:\.\d{2})?)\s*(?:\/)?(?:month|mo|p\.?m\.?)?(?:\s+for\s+)?(\d+)\s*(?:month|mo)/i
    );
    
    if (dealMatch) {
      introPriceCents = Math.round(parseFloat(dealMatch[1]) * 100);
      introDurationDays = parseInt(dealMatch[2]) * 30;
      
      // Look for ongoing price after "then"
      const ongoingMatch = text.match(/then\s*\$\s*(\d+(?:\.\d{2})?)/i);
      if (ongoingMatch) {
        ongoingPriceCents = Math.round(parseFloat(ongoingMatch[1]) * 100);
      }
    }

    // If no deal pattern, look for single price
    if (!introPriceCents) {
      const priceMatch = text.match(/\$\s*(\d+(?:\.\d{2})?)\s*(?:\/)?(?:month|mo|p\.?m\.?)/i);
      if (priceMatch) {
        const priceCents = Math.round(parseFloat(priceMatch[1]) * 100);
        if (priceCents >= 2000) {
          ongoingPriceCents = priceCents;
        }
      }
    }

    // Skip if no valid price found
    if (!introPriceCents && !ongoingPriceCents) continue;

    // Detect features
    const isFixedWireless = /fixed.?wireless|wireless/i.test(text);
    const isBusiness = /business|corporate|enterprise/i.test(text);
    const hasModem = /modem|router|included/i.test(text) && /free|includ/i.test(text);

    results.push({
      providerSlug: "arctel",
      planName: planName.slice(0, 80),
      speedTier,
      uploadSpeedMbps: extractUploadSpeed(element, speedTier),
      dataAllowance: extractDataAllowance(element),
      contractMonths: extractContractMonths(element),
      modemIncluded: extractModemIncluded(element),
      introPriceCents: introPriceCents || ongoingPriceCents || null,
      introDurationDays,
      ongoingPriceCents: ongoingPriceCents || introPriceCents || null,
      minTermDays: null,
      setupFeeCents: extractSetupFee(element),
      modemCostCents: hasModem ? 0 : null,
      conditionsText: (element.textContent || "").trim() || null,
      typicalEveningSpeedMbps: null,
      sourceUrl: url,
      technologyType: isFixedWireless ? "fixed-wireless" : "standard",
      planType: isBusiness ? "business" : "residential",
    });
  }

  // If generic method found nothing, fall back to text parsing
  if (results.length === 0) {
    // Parse text directly for better deal detection
    const lines = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .split(/\n|<br>/i);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nextLine = i + 1 < lines.length ? lines[i + 1] : "";
      const chunk = line + " " + nextLine;

      const speedMatch = chunk.match(/NBN\s*(\d{3,4})/i) || 
                         chunk.match(/(\d{3,4})\s*Mbps/i);
      if (!speedMatch) continue;

      const speedValue = parseInt(speedMatch[1]);
      const speedTier = normalizeSpeed(speedValue);
      if (!speedTier) continue;

      // Look for promo pricing
      const promoMatch = chunk.match(/\$\s*(\d+(?:\.\d{2})?)\s*for\s*(\d+)\s*month/i);
      let introPriceCents: number | null = null;
      let introDurationDays: number | null = null;
      let ongoingPriceCents: number | null = null;

      if (promoMatch) {
        introPriceCents = Math.round(parseFloat(promoMatch[1]) * 100);
        introDurationDays = parseInt(promoMatch[2]) * 30;
      }

      // Always look for ongoing price
      const ongoingMatch = chunk.match(/then\s*\$\s*(\d+(?:\.\d{2})?)|ongoing.*\$\s*(\d+(?:\.\d{2})?)/i);
      if (ongoingMatch) {
        ongoingPriceCents = Math.round(parseFloat(ongoingMatch[1] || ongoingMatch[2]) * 100);
      }

      if (!ongoingMatch && !promoMatch) {
        const priceMatch = chunk.match(/\$\s*(\d+(?:\.\d{2})?)/);
        if (priceMatch) {
          ongoingPriceCents = Math.round(parseFloat(priceMatch[1]) * 100);
        }
      }

      if (!introPriceCents && !ongoingPriceCents) continue;

      const planName = line.slice(0, 80).replace(/<[^>]+>/g, "").trim();
      if (planName.length < 3) continue;

      results.push({
        providerSlug: "arctel",
        planName,
        speedTier,
        uploadSpeedMbps: null,
        dataAllowance: null,
        contractMonths: null,
        modemIncluded: null,
        introPriceCents: introPriceCents || ongoingPriceCents,
        introDurationDays,
        ongoingPriceCents: ongoingPriceCents || introPriceCents,
        minTermDays: null,
        setupFeeCents: null,
        modemCostCents: null,
        conditionsText: (chunk || "").trim() || null,
        typicalEveningSpeedMbps: null,
        sourceUrl: url,
        technologyType: "standard",
        planType: "residential",
      });
    }
  }

  return results;
}
