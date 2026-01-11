import type { PlanExtract } from "../../types";
import { parsePriceToCents, normalizeSpeed } from "../../validators";
import { parseHTML } from "../dom-utils";

export function canHandle(url: string) {
  return url.includes("telstra.com") || url.includes("telstra.com.au");
}

// Helper functions for Phase 1 enhancements
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

export async function parse(html: string, url: string): Promise<PlanExtract[]> {
  // Enhanced Telstra parser with Phase 1 fields:
  // upload speed, data allowance, contract terms, modem info
  const doc = parseHTML(html);
  const cards = Array.from(doc.querySelectorAll(".plan-card, .plan, .product, .offer, .package"));
  const results: PlanExtract[] = cards.map((el) => {
    const planName = (el.querySelector("h3")?.textContent || el.querySelector(".plan-name")?.textContent || "").trim();
    const priceText = (el.querySelector(".price")?.textContent || el.querySelector(".cost")?.textContent || "").trim();
    const speedMatch = (el.textContent || "").match(/NBN\s*(\d{1,4})/i) || (el.textContent || "").match(/(\d{1,4})\s*Mbps/i);
    const parsedSpeed = speedMatch ? parseInt(speedMatch[1]) : null;
    const normalizedSpeed = normalizeSpeed(parsedSpeed);
    const isFixedWireless = /fixed.?wireless|wireless.?broadband/i.test(el.textContent || "") || /fixed.?wireless/i.test(planName);
    
    // Phase 1: Extract new fields
    const uploadSpeed = extractUploadSpeed(el, normalizedSpeed);
    const dataAllowance = extractDataAllowance(el);
    const contractMonths = extractContractMonths(el);
    const modemIncluded = extractModemIncluded(el);
    const setupFee = extractSetupFee(el);

    return {
      providerSlug: "telstra",
      planName: planName || "Not stated",
      speedTier: normalizedSpeed,
      uploadSpeedMbps: uploadSpeed,
      dataAllowance: dataAllowance,
      contractMonths: contractMonths,
      modemIncluded: modemIncluded,
      introPriceCents: parsePriceToCents(priceText),
      introDurationDays: null,
      ongoingPriceCents: parsePriceToCents(priceText),
      minTermDays: null,
      setupFeeCents: setupFee,
      modemCostCents: null,
      conditionsText: el.querySelector(".terms")?.textContent?.trim() ?? null,
      typicalEveningSpeedMbps: null,
      sourceUrl: url,
      technologyType: isFixedWireless ? 'fixed-wireless' : 'standard',
    };
  });
  return results;
}
