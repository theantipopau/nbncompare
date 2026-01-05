import type { PlanExtract } from "../../types";
import { normalizeSpeed, parsePriceToCents } from "../../validators";
import { parseHTML } from "../dom-utils";

export function canHandle(url: string) {
  return /exetel\.com\.au/i.test(url);
}

export async function parse(html: string, url: string): Promise<PlanExtract[]> {
  const doc = parseHTML(html);
  
  const results: PlanExtract[] = [];
  
  // Exetel has a specific structure - try to find plan cards/sections
  const planElements = doc.querySelectorAll('[class*="plan"], [class*="product"], [class*="card"]');
  
  for (const element of Array.from(planElements)) {
    try {
      const text = element.textContent || '';
      
      // Look for heading-like elements within the plan card
      const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6, [class*="title"], [class*="heading"]');
      let planName = '';
      
      // Try to extract a clean plan name from headings
      for (const heading of Array.from(headings)) {
        const headingText = (heading.textContent || '').trim();
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
          planName = nameMatch[0].trim();
        }
      }
      
      if (!planName) continue;
      
      // Extract price
      const priceText = (element.querySelector('[class*="price"]')?.textContent || element.textContent || '').trim();
      const priceCents = parsePriceToCents(priceText);
      if (!priceCents) continue;
      
      // Validate price is reasonable (not $1 garbage)
      if (priceCents < 2000) continue; // Skip plans under $20/month
      
      // Extract speed tier
      const speedMatch = text.match(/NBN\s*(\d{1,4})/i) || text.match(/(\d{1,4})\s*Mbps/i);
      const speedValue = speedMatch ? parseInt(speedMatch[1]) : null;
      const speedTier = normalizeSpeed(speedValue);
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
      
      const planName = nameMatch[1].trim();
      
      // Look for price in this line or next few lines
      let priceText = '';
      for (let j = i; j < Math.min(i + 5, lines.length); j++) {
        if (/\$\s*[0-9]+/.test(lines[j])) {
          priceText = lines[j];
          break;
        }
      }
      
      if (!priceText) continue;
      
      const priceCents = parsePriceToCents(priceText);
      if (!priceCents || priceCents < 2000) continue; // Skip garbage prices under $20
      
      const speedMatch = line.match(/(?:NBN|FW)\s*(\d{1,4})/i);
      const speedValue = speedMatch ? parseInt(speedMatch[1]) : null;
      const speedTier = normalizeSpeed(speedValue);
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
