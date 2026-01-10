import type { PlanExtract } from "../../types";
import { normalizeSpeed } from "../../validators";
import { parseHTML } from "../dom-utils";

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

    // Extract upload speed if present
    const uploadMatch = text.match(/(\d+)\s*\/\s*(\d+)\s*Mbps/i) || 
                        text.match(/Upload[:\s]+(\d+)\s*Mbps/i);
    const uploadSpeed = uploadMatch ? parseInt(uploadMatch[uploadMatch.length === 3 ? 2 : 1]) : null;

    // Detect features
    const isFixedWireless = /fixed.?wireless|wireless/i.test(text);
    const isBusiness = /business|corporate|enterprise/i.test(text);
    const hasModem = /modem|router|included/i.test(text) && /free|includ/i.test(text);

    results.push({
      providerSlug: "arctel",
      planName: planName.slice(0, 80),
      speedTier,
      uploadSpeedMbps: uploadSpeed,
      introPriceCents: introPriceCents || ongoingPriceCents || null,
      introDurationDays,
      ongoingPriceCents: ongoingPriceCents || introPriceCents || null,
      minTermDays: null,
      setupFeeCents: null,
      modemCostCents: hasModem ? 0 : null,
      conditionsText: null,
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
        introPriceCents: introPriceCents || ongoingPriceCents,
        introDurationDays,
        ongoingPriceCents: ongoingPriceCents || introPriceCents,
        minTermDays: null,
        setupFeeCents: null,
        modemCostCents: null,
        conditionsText: null,
        typicalEveningSpeedMbps: null,
        sourceUrl: url,
        technologyType: "standard",
        planType: "residential",
      });
    }
  }

  return results;
}
