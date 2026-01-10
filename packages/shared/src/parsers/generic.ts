import type { PlanExtract, SpeedTier } from "../types";

export function canHandle(_url: string) {
  return true; // fallback
}

export async function parse(html: string, url: string): Promise<PlanExtract[]> {
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");
  
  // Split by different delimiters to capture deal blocks
  const lines = text.split(/\n|<br>|<\/p>|<li>|<\/li>|<\/div>|<\/span>/i);
  const results: PlanExtract[] = [];
  
  // Process longer chunks to capture complete deal info (price + duration)
  const chunks: string[] = [];
  let currentChunk = "";
  for (const line of lines) {
    currentChunk += " " + line;
    if (currentChunk.length > 300 || /\$\s*\d+/.test(line)) {
      chunks.push(currentChunk);
      currentChunk = "";
    }
  }
  if (currentChunk.length > 0) chunks.push(currentChunk);
  
  for (const chunk of chunks) {
    // Find all price mentions in the chunk
    const priceMatches = Array.from(chunk.matchAll(/\$\s*([0-9]+(?:\.[0-9]{1,2})?)/g));
    
    // Find speed mentions
    const speedMatch = chunk.match(/NBN\s*(\d{1,4})/i) || 
                       chunk.match(/(\d{1,4})\s*Mbps/i) ||
                       chunk.match(/(\d)\s*Gbps/i) ||
                       chunk.match(/(\d)Gbps/i);
    
    if (priceMatches.length === 0 || !speedMatch) continue;
    
    let speedValue = parseInt(speedMatch[1]);
    if (chunk.match(/Gbps/i)) {
      speedValue = speedValue * 1000;
    }
    
    const speedTier = (() => {
      const allowed: SpeedTier[] = [12, 25, 50, 100, 200, 250, 400, 500, 1000, 2000];
      return allowed.includes(speedValue as SpeedTier) ? (speedValue as SpeedTier) : null;
    })();
    
    if (!speedTier) continue;
    
    // Check if this chunk looks like marketing copy (skip it)
    if (/what is|about|want to|download a hefty|stream your|in a world of|contact us|call now|sign up today/i.test(chunk) && chunk.length > 150) continue;
    
    // Extract plan name from chunk (first line-like segment)
    const nameMatch = chunk.match(/^([^$\n]{10,80}?)[\s]*\$/);
    const planName = (nameMatch ? nameMatch[1].trim() : chunk.slice(0, 80).trim()).replace(/<[^>]+>/g, "").trim();
    
    if (planName.length < 3) continue;
    
    // Try to extract upload speed
    const uploadMatch = chunk.match(/(\d{1,4})\s*\/\s*(\d{1,4})\s*Mbps/i) || 
                        chunk.match(/Upload[:\s]+(\d{1,4})\s*Mbps/i);
    const uploadSpeed = uploadMatch ? parseInt(uploadMatch[uploadMatch.length === 3 ? 2 : 1]) : null;
    
    // Detect technology type and plan type
    const isFixedWireless = /fixed.?wireless|wireless.?broadband/i.test(chunk) || /fixed.?wireless/i.test(url);
    const isBusiness = /business|enterprise|corporate|sme|small.?business/i.test(chunk) || /business/i.test(url);
    
    // Process prices: first price is often intro, later ones might be ongoing
    // Look for patterns like "$80/month for 12 months then $99/month"
    const introMatch = chunk.match(/\$\s*([0-9]+(?:\.[0-9]{1,2})?)\s*(?:\/month|\/mo|p\.?m\.?)\s*(?:for|during)?\s*(\d{1,2})\s*(?:month|mo)/i);
    const ongoingMatch = chunk.match(/then\s*\$\s*([0-9]+(?:\.[0-9]{1,2})?)|ongoing\s*\$\s*([0-9]+(?:\.[0-9]{1,2})?)|after\s*\$\s*([0-9]+(?:\.[0-9]{1,2})?)/i);
    
    let introPriceCents = null;
    let introDurationDays = null;
    let ongoingPriceCents = null;
    
    if (introMatch) {
      introPriceCents = Math.round(parseFloat(introMatch[1]) * 100);
      // Skip if obviously invalid (like $1/day promotions)
      if (introPriceCents < 2000) {
        introPriceCents = null;
      } else {
        introDurationDays = parseInt(introMatch[2]) * 30; // Convert months to days
      }
    }
    
    if (ongoingMatch) {
      const ongoingPrice = ongoingMatch[1] || ongoingMatch[2] || ongoingMatch[3];
      if (ongoingPrice) {
        ongoingPriceCents = Math.round(parseFloat(ongoingPrice) * 100);
      }
    }
    
    // If we only found one price, use it as ongoing
    if (!introPriceCents && priceMatches.length === 1) {
      const priceCents = Math.round(parseFloat(priceMatches[0][1]) * 100);
      if (priceCents >= 2000) {
        ongoingPriceCents = priceCents;
      }
    } else if (!ongoingPriceCents && priceMatches.length > 1) {
      // Use the last (or highest non-intro) price as ongoing
      const priceCents = Math.round(parseFloat(priceMatches[priceMatches.length - 1][1]) * 100);
      if (priceCents >= 2000 && priceCents !== introPriceCents) {
        ongoingPriceCents = priceCents;
      }
    }
    
    // If we only have intro price, use it as ongoing too
    if (!ongoingPriceCents && introPriceCents) {
      ongoingPriceCents = introPriceCents;
    }
    
    // Skip if we have no valid pricing
    if (!ongoingPriceCents && !introPriceCents) continue;
    
    results.push({
      providerSlug: urlToSlug(url),
      planName: planName.slice(0, 80),
      speedTier,
      uploadSpeedMbps: uploadSpeed,
      introPriceCents: introPriceCents || ongoingPriceCents,
      introDurationDays: introDurationDays,
      ongoingPriceCents: ongoingPriceCents || introPriceCents,
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
  
  return results;
}

function urlToSlug(url: string) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/\./g, "-");
  } catch {
    return "unknown";
  }
}