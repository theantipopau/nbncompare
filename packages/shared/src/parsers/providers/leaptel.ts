import type { PlanExtract } from "../../types";
import { normalizeSpeed, parsePriceToCents } from "../../validators";
import { parseHTML } from "../dom-utils";

function extractUploadSpeed(planElement: Element, downloadSpeed: number | null): number | null {
  if (!downloadSpeed) return null;
  const planText = planElement.textContent || "";
  const uploadMatch = planText.match(/(\d+)\s*Mbps\s*(up|upload|↑)/i);
  if (uploadMatch) {
    return parseInt(uploadMatch[1]);
  }
  const uploadRatios: { [key: number]: number } = {
    12: 1, 25: 1, 50: 2, 100: 10, 200: 20, 250: 20, 400: 40, 500: 40, 1000: 50, 2000: 100,
  };
  return uploadRatios[downloadSpeed] || null;
}

function extractDataAllowance(planElement: Element): string | null {
  const planText = (planElement.textContent || "").toLowerCase();
  if (planText.includes("unlimited")) return "Unlimited";
  const amountMatch = planText.match(/(\d+\.?\d*)\s*(tb|gb)/i);
  return amountMatch ? `${amountMatch[1]}${amountMatch[2].toUpperCase()}` : null;
}

function extractContractMonths(planElement: Element): number | null {
  const planText = (planElement.textContent || "").toLowerCase();
  if (planText.includes("no contract") || planText.includes("month-to-month")) return 0;
  if (planText.includes("24 month") || planText.includes("2 year")) return 24;
  if (planText.includes("12 month") || planText.includes("1 year")) return 12;
  return null;
}

function extractModemIncluded(planElement: Element): boolean | null {
  const planText = (planElement.textContent || "").toLowerCase();
  if (planText.includes("modem included") || planText.includes("router included") || planText.includes("free modem")) return true;
  if (planText.includes("modem $") || planText.includes("bring your own") || planText.includes("your own modem")) return false;
  return null;
}

function extractSetupFee(planElement: Element): number | null {
  const planText = planElement.textContent || "";
  if (planText.match(/free\s*(setup|connection|installation)/i)) return 0;
  const feeMatch = planText.match(/(setup|connection|installation)[\s:]*\$(\d+(?:\.\d{2})?)/i);
  return feeMatch ? Math.round(parseFloat(feeMatch[2]) * 100) : null;
}

export function canHandle(url: string) {
  return url.includes("leaptel.com.au") || url.includes("leaptel.net.au");
}

export async function parse(html: string, url: string): Promise<PlanExtract[]> {
  const doc = parseHTML(html);
  const results: PlanExtract[] = [];
  
  // Try main plan containers
  let rows = Array.from(doc.querySelectorAll(".plan, .plan-card, [class*='plan-'], .pricing-card"));
  
  if (rows.length === 0) {
    // Fallback: look for plan sections by heading
    rows = Array.from(doc.querySelectorAll("h3, h4")).filter(h => 
      /NBN|plan|speed|pricing/i.test(h.textContent || "")
    ).map(h => h.parentElement as Element).filter((el): el is Element => !!el);
  }
  
  for (const el of rows) {
    const speedText = (el.textContent || "").match(/NBN\s*(\d{1,4})/i) || 
                      (el.textContent || "").match(/(\d{1,4})\s*Mbps/i);
    if (!speedText) continue;
    
    const parsedSpeed = parseInt(speedText[1]);
    const speedTier = normalizeSpeed(parsedSpeed);
    if (!speedTier) continue;
    
    const priceText = el.querySelector(".price, [class*='price'], [class*='cost']")?.textContent || el.textContent || "";
    
    results.push({
      providerSlug: "leaptel",
      planName: (el.querySelector("h4, h5, .name, [class*='title']")?.textContent || "").trim() || `NBN ${speedTier}`,
      speedTier,
      uploadSpeedMbps: extractUploadSpeed(el, speedTier),
      dataAllowance: extractDataAllowance(el),
      contractMonths: extractContractMonths(el),
      modemIncluded: extractModemIncluded(el),
      introPriceCents: parsePriceToCents(priceText),
      introDurationDays: null,
      ongoingPriceCents: parsePriceToCents(priceText),
      minTermDays: null,
      setupFeeCents: extractSetupFee(el),
      modemCostCents: null,
      conditionsText: null,
      typicalEveningSpeedMbps: null,
      sourceUrl: url,
    });
  }
  
  return results;
}
