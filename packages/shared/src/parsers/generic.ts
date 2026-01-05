import type { PlanExtract, SpeedTier } from "../types";

export function canHandle(_url: string) {
  return true; // fallback
}

export async function parse(html: string, url: string): Promise<PlanExtract[]> {
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");
  // Heuristic: find lines with $ and NBN speed mentions nearby
  const lines = text.split(/\n|<br>|<\/p>|<li>|<\/li>/i);
  const results: PlanExtract[] = [];
  for (const line of lines) {
    const priceMatch = line.match(/\$\s*([0-9]+(?:\.[0-9]{1,2})?)/);
    // Updated regex to catch 500, 1000, 2000, 1Gbps, 2Gbps, 1 Gbps, 2 Gbps patterns
    const speedMatch = line.match(/NBN\s*(\d{1,4})/i) || 
                       line.match(/(\d{1,4})\s*Mbps/i) ||
                       line.match(/(\d)\s*Gbps/i) ||
                       line.match(/(\d)Gbps/i);
    if (priceMatch && speedMatch) {
      const priceCents = Math.round(parseFloat(priceMatch[1]) * 100);
      
      // Skip obviously invalid prices (likely promo fragments like "$1/day")
      if (priceCents < 2000) continue;
      
      let speedValue = parseInt(speedMatch[1]);
      // Convert Gbps to Mbps (e.g., 1 Gbps = 1000 Mbps, 2 Gbps = 2000 Mbps)
      if (line.match(/Gbps/i)) {
        speedValue = speedValue * 1000;
      }
      
      // Skip if plan name looks like marketing copy (long descriptions)
      const rawName = line.replace(/<[^>]+>/g, "").trim();
      if (rawName.length > 100) continue;
      if (/what is|about|want to|download a hefty|stream your|in a world of/i.test(rawName)) continue;
      
      const planName = (rawName.slice(0, 80) || "Plan").trim();
      const isFixedWireless = /fixed.?wireless|wireless.?broadband/i.test(line) || /fixed.?wireless/i.test(url);
      const isBusiness = /business|enterprise|corporate|sme|small.?business/i.test(line) || /business/i.test(url);
      
      // Try to extract upload speed (e.g., "100/20" or "1000/100 Mbps")
      const uploadMatch = line.match(/(\d{1,4})\s*\/\s*(\d{1,4})\s*Mbps/i) || 
                          line.match(/Upload[:\s]+(\d{1,4})\s*Mbps/i);
      const uploadSpeed = uploadMatch ? parseInt(uploadMatch[uploadMatch.length === 3 ? 2 : 1]) : null;
      
      const speedTier = (() => {
        const allowed: SpeedTier[] = [12, 25, 50, 100, 200, 250, 400, 500, 1000, 2000];
        return allowed.includes(speedValue as SpeedTier) ? (speedValue as SpeedTier) : null;
      })();
      
      // Skip if we couldn't map to a valid speed tier
      if (!speedTier) continue;
      
      results.push({
        providerSlug: urlToSlug(url),
        planName,
        speedTier,
        uploadSpeedMbps: uploadSpeed,
        introPriceCents: priceCents,
        introDurationDays: null,
        ongoingPriceCents: priceCents,
        minTermDays: null,
        setupFeeCents: null,
        modemCostCents: null,
        conditionsText: null,
        typicalEveningSpeedMbps: null,
        sourceUrl: url,
        technologyType: isFixedWireless ? 'fixed-wireless' : 'standard',
        planType: isBusiness ? 'business' : 'residential',
      });
    }
  }
  return results;
}

function urlToSlug(url: string) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/\./g, "-");
  } catch (e) {
    return "unknown";
  }
}