import type { PlanExtract } from "../../types";
import { parsePriceToCents, normalizeSpeed } from "../../validators";
import { parseHTML } from "../dom-utils";

function extractUploadSpeed(planElement: globalThis.Element, downloadSpeed: number | null): number | null {
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

function extractDataAllowance(planElement: globalThis.Element): string | null {
  const planText = (planElement.textContent || "").toLowerCase();
  if (planText.includes("unlimited")) return "Unlimited";
  const amountMatch = planText.match(/(\d+\.?\d*)\s*(tb|gb)/i);
  return amountMatch ? `${amountMatch[1]}${amountMatch[2].toUpperCase()}` : null;
}

function extractContractMonths(planElement: globalThis.Element): number | null {
  const planText = (planElement.textContent || "").toLowerCase();
  if (planText.includes("no contract") || planText.includes("month-to-month")) return 0;
  if (planText.includes("24 month") || planText.includes("2 year")) return 24;
  if (planText.includes("12 month") || planText.includes("1 year")) return 12;
  return null;
}

function extractModemIncluded(planElement: globalThis.Element): boolean | null {
  const planText = (planElement.textContent || "").toLowerCase();
  if (planText.includes("modem included") || planText.includes("router included") || planText.includes("free modem")) return true;
  if (planText.includes("modem $") || planText.includes("bring your own") || planText.includes("your own modem")) return false;
  return null;
}

function extractSetupFee(planElement: globalThis.Element): number | null {
  const planText = planElement.textContent || "";
  if (planText.match(/free\s*(setup|connection|installation)/i)) return 0;
  const feeMatch = planText.match(/(setup|connection|installation)[\s:]*\$(\d+(?:\.\d{2})?)/i);
  return feeMatch ? Math.round(parseFloat(feeMatch[2]) * 100) : null;
}

export function canHandle(url: string) {
  return url.includes("foxtel.com") || url.includes("foxtel.com.au");
}

export async function parse(html: string, url: string): Promise<PlanExtract[]> {
  const doc = parseHTML(html);
  const cards = Array.from(doc.querySelectorAll(".plan, .offer, .product"));
  return cards.map((el) => {
    const planName = (el.querySelector("h3")?.textContent || el.querySelector(".title")?.textContent || "").trim();
    const priceText = (el.querySelector(".price")?.textContent || "").trim();
    const speedMatch = (el.textContent || "").match(/NBN\s*(\d{1,4})/i) || (el.textContent || "").match(/(\d{1,4})\s*Mbps/i);
    const parsedSpeed = speedMatch ? parseInt(speedMatch[1]) : null;
    const normalizedSpeed = normalizeSpeed(parsedSpeed);
    return {
      providerSlug: "foxtel",
      planName: planName || "Not stated",
      speedTier: normalizedSpeed,
      uploadSpeedMbps: extractUploadSpeed(el, normalizedSpeed),
      dataAllowance: extractDataAllowance(el),
      contractMonths: extractContractMonths(el),
      modemIncluded: extractModemIncluded(el),
      introPriceCents: parsePriceToCents(priceText),
      introDurationDays: null,
      ongoingPriceCents: parsePriceToCents(priceText),
      minTermDays: null,
      setupFeeCents: extractSetupFee(el),
      modemCostCents: null,
      conditionsText: (el.querySelector(".terms")?.textContent || el.textContent || "").trim() || null,
      typicalEveningSpeedMbps: null,
      sourceUrl: url,
    };
  });
}
