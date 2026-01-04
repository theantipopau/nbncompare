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
    const speedMatch = line.match(/NBN\s*(\d{1,4})/i);
    if (priceMatch && speedMatch) {
      const planName = (line.replace(/<[^>]+>/g, "").slice(0, 80) || "Plan").trim();
      const isFixedWireless = /fixed.?wireless|wireless.?broadband/i.test(line) || /fixed.?wireless/i.test(url);
      
      results.push({
        providerSlug: urlToSlug(url),
        planName,
        speedTier: (() => {
          const n = parseInt(speedMatch[1]);
          const allowed: SpeedTier[] = [12, 25, 50, 100, 200, 250, 400, 500, 1000, 2000];
          return allowed.includes(n as SpeedTier) ? (n as SpeedTier) : null;
        })(),
        introPriceCents: Math.round(parseFloat(priceMatch[1]) * 100),
        introDurationDays: null,
        ongoingPriceCents: Math.round(parseFloat(priceMatch[1]) * 100),
        minTermDays: null,
        setupFeeCents: null,
        modemCostCents: null,
        conditionsText: null,
        typicalEveningSpeedMbps: null,
        sourceUrl: url,
        technologyType: isFixedWireless ? 'fixed-wireless' : 'standard',
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