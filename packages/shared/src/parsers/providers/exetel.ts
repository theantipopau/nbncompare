import type { PlanExtract, SpeedTier } from "../../types";
import { cleanText, extractPrice, findSpeedTier } from "../dom-utils";

export function canHandle(url: string) {
  return /exetel\.com\.au/i.test(url);
}

export async function parse(html: string, url: string): Promise<PlanExtract[]> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  
  const results: PlanExtract[] = [];
  
  // Exetel has a specific structure - try to find plan cards/sections
  const planElements = doc.querySelectorAll('[class*="plan"], [class*="product"], [class*="card"]');
  
  for (const element of planElements) {
    try {
      const text = element.textContent || '';
      
      // Look for heading-like elements within the plan card
      const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6, [class*="title"], [class*="heading"]');
      let planName = '';
      
      // Try to extract a clean plan name from headings
      for (const heading of headings) {
        const headingText = cleanText(heading.textContent || '');
        // Look for patterns like "NBN 100", "The One Plan", "Exetel NBN 1000"
        if (/NBN\s+\d+|The\s+One\s+Plan|Exetel/i.test(headingText) && headingText.length < 50) {
          planName = headingText;
          break;
        }
      }
      
      // If no heading found, try to extract from text
      if (!planName) {
        const nameMatch = text.match(/Exetel\s+(?:NBN|FW)\s+\d+/i) || 
                         text.match(/The\s+One\s+Plan/i) ||
                         text.match(/NBN\s+\d+/i);
        if (nameMatch) {
          planName = cleanText(nameMatch[0]);
        }
      }
      
      if (!planName) continue;
      
      // Extract price
      const priceInfo = extractPrice(element);
      if (!priceInfo || !priceInfo.ongoingPriceCents) continue;
      
      // Validate price is reasonable (not $1 garbage)
      if (priceInfo.ongoingPriceCents < 2000) continue; // Skip plans under $20/month
      
      // Extract speed tier
      const speedTier = findSpeedTier(text);
      if (!speedTier) continue;
      
      // Check if Fixed Wireless
      const isFixedWireless = /fixed.?wireless|FW\s+\d+/i.test(text);
      
      // Try to extract upload speed
      const uploadMatch = text.match(/(\d{1,4})\s*\/\s*(\d{1,4})\s*Mbps/i);
      const uploadSpeed = uploadMatch ? parseInt(uploadMatch[2]) : null;
      
      results.push({
        providerSlug: 'exetel',
        planName,
        speedTier,
        uploadSpeedMbps: uploadSpeed,
        introPriceCents: priceInfo.introPriceCents || priceInfo.ongoingPriceCents,
        introDurationDays: priceInfo.introDurationDays,
        ongoingPriceCents: priceInfo.ongoingPriceCents,
        minTermDays: null,
        setupFeeCents: null,
        modemCostCents: null,
        conditionsText: null,
        typicalEveningSpeedMbps: null,
        sourceUrl: url,
        technologyType: isFixedWireless ? 'fixed-wireless' : 'standard',
        planType: 'residential',
      });
    } catch (error) {
      console.error('Error parsing Exetel plan element:', error);
    }
  }
  
  // If we didn't find any plans with the card approach, fall back to text scanning
  if (results.length === 0) {
    const text = doc.body.textContent || '';
    const lines = text.split(/\n/);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for lines with "Exetel NBN X" or similar
      const nameMatch = line.match(/(Exetel\s+(?:NBN|FW)\s+\d+|The\s+One\s+Plan)/i);
      if (!nameMatch) continue;
      
      const planName = cleanText(nameMatch[1]);
      
      // Look for price in this line or next few lines
      let priceMatch = null;
      for (let j = i; j < Math.min(i + 5, lines.length); j++) {
        priceMatch = lines[j].match(/\$\s*([0-9]+(?:\.[0-9]{1,2})?)/);
        if (priceMatch) break;
      }
      
      if (!priceMatch) continue;
      
      const priceCents = Math.round(parseFloat(priceMatch[1]) * 100);
      if (priceCents < 2000) continue; // Skip garbage prices under $20
      
      const speedTier = findSpeedTier(line);
      if (!speedTier) continue;
      
      const isFixedWireless = /FW\s+\d+|fixed.?wireless/i.test(line);
      
      results.push({
        providerSlug: 'exetel',
        planName,
        speedTier,
        uploadSpeedMbps: null,
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
        planType: 'residential',
      });
    }
  }
  
  return results;
}
