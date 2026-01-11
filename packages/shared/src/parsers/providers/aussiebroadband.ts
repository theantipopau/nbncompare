import type { PlanExtract } from "../../types";
import { normalizeSpeed, parsePriceToCents } from "../../validators";
import { parseHTML } from "../dom-utils";

export function canHandle(url: string) {
  return url.includes("aussiebroadband.com.au");
}

// Extract upload speed from plan element or use standard ratios
function extractUploadSpeed(planElement: Element, downloadSpeed: number | null): number | null {
  if (!downloadSpeed) return null;

  const planText = planElement.textContent || "";

  // Try to find explicit upload speed mentions
  const uploadMatch = planText.match(/(\d+)\s*Mbps\s*(up|upload|↑)/i);
  if (uploadMatch) {
    return parseInt(uploadMatch[1]);
  }

  // Standard NBN upload speed ratios
  const uploadRatios: { [key: number]: number } = {
    12: 1,
    25: 1,
    50: 2,
    100: 10,
    200: 20,
    250: 20,
    400: 40,
    500: 40,
    1000: 50,
    2000: 100,
  };

  return uploadRatios[downloadSpeed] || null;
}

// Extract data allowance from plan element
function extractDataAllowance(planElement: Element): string | null {
  const planText = (planElement.textContent || "").toLowerCase();

  // Check for unlimited
  if (planText.includes("unlimited")) {
    return "Unlimited";
  }

  // Check for specific amounts (1TB, 500GB, etc.)
  const amountMatch = planText.match(/(\d+\.?\d*)\s*(tb|gb)/i);
  if (amountMatch) {
    return `${amountMatch[1]}${amountMatch[2].toUpperCase()}`;
  }

  return null;
}

// Extract contract term from plan element
function extractContractMonths(planElement: Element): number | null {
  const planText = (planElement.textContent || "").toLowerCase();

  if (planText.includes("no contract") || planText.includes("month-to-month")) {
    return 0;
  }

  if (planText.includes("24 month") || planText.includes("2 year")) {
    return 24;
  }

  if (planText.includes("12 month") || planText.includes("1 year")) {
    return 12;
  }

  return null;
}

// Check if modem is included in plan
function extractModemIncluded(planElement: Element): boolean | null {
  const planText = (planElement.textContent || "").toLowerCase();

  if (planText.includes("modem included") || planText.includes("router included") || planText.includes("free modem")) {
    return true;
  }

  if (
    planText.includes("modem $") ||
    planText.includes("bring your own") ||
    planText.includes("your own modem")
  ) {
    return false;
  }

  return null;
}

// Extract setup fee from plan element
function extractSetupFee(planElement: Element): number | null {
  const planText = planElement.textContent || "";

  if (planText.match(/free\s*(setup|connection|installation)/i)) {
    return 0;
  }

  const feeMatch = planText.match(/(setup|connection|installation)[\s:]*\$(\d+(?:\.\d{2})?)/i);
  if (feeMatch) {
    return Math.round(parseFloat(feeMatch[2]) * 100);
  }

  return null;
}

export async function parse(html: string, url: string): Promise<PlanExtract[]> {
  // Enhanced parser for Aussie Broadband's NBN plans
  // Extracts: plan name, speed, upload speed, data allowance, contract terms, modem info, fees
  const doc = parseHTML(html);
  const cards = Array.from(doc.querySelectorAll(".product-card, .plan-card, .nbn-plan"));

  const results: PlanExtract[] = cards.map((el) => {
    const planName = (el.querySelector("h3")?.textContent || el.querySelector(".title")?.textContent || "").trim();
    const priceText = (el.querySelector(".price")?.textContent || "").trim();

    // Extract download speed
    const speedMatch = (el.textContent || "").match(/NBN\s*(\d{1,4})/i);
    const parsedSpeed = speedMatch ? parseInt(speedMatch[1]) : null;
    const normalizedSpeed = normalizeSpeed(parsedSpeed);

    // Extract new fields
    const uploadSpeed = extractUploadSpeed(el, normalizedSpeed);
    const dataAllowance = extractDataAllowance(el);
    const contractMonths = extractContractMonths(el);
    const modemIncluded = extractModemIncluded(el);
    const setupFee = extractSetupFee(el);

    return {
      providerSlug: "aussiebroadband",
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
      conditionsText: null,
      typicalEveningSpeedMbps: null,
      sourceUrl: url,
    };
  });

  return results;
}


