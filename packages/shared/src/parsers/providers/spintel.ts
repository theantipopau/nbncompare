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
  return url.includes("spintel.net.au") || url.includes("spintel.com");
}

export async function parse(html: string, url: string): Promise<PlanExtract[]> {
  const doc = parseHTML(html);
  const results: PlanExtract[] = [];
  const rows = Array.from(doc.querySelectorAll(".plans-list .plan, .plan-block"));
  if (rows.length === 0) {
    // fallback: try to find price blocks
    const priceEls = Array.from(doc.querySelectorAll(".price"));
    for (const p of priceEls) {
      const speedTier = null;
      results.push({
        providerSlug: "spintel",
        planName: p.previousElementSibling?.textContent?.trim() || "Plan",
        speedTier,
        uploadSpeedMbps: extractUploadSpeed(p, speedTier),
        dataAllowance: extractDataAllowance(p),
        contractMonths: extractContractMonths(p),
        modemIncluded: extractModemIncluded(p),
        introPriceCents: parsePriceToCents(p.textContent || ""),
        introDurationDays: null,
        ongoingPriceCents: parsePriceToCents(p.textContent || ""),
        minTermDays: null,
        setupFeeCents: extractSetupFee(p),
        modemCostCents: null,
        conditionsText: null,
        typicalEveningSpeedMbps: null,
        sourceUrl: url,
      });
    }
  } else {
    for (const el of rows) {
      const s = (el.textContent || "").match(/NBN\s*(\d{1,4})/i)?.[1] ?? null;
      const parsedSpeed = s ? parseInt(s) : null;
      const speedTier = normalizeSpeed(parsedSpeed);
      results.push({
        providerSlug: "spintel",
        planName: (el.querySelector(".name")?.textContent || el.querySelector("h4")?.textContent || "").trim(),
        speedTier,
        uploadSpeedMbps: extractUploadSpeed(el, speedTier),
        dataAllowance: extractDataAllowance(el),
        contractMonths: extractContractMonths(el),
        modemIncluded: extractModemIncluded(el),
        introPriceCents: parsePriceToCents(el.querySelector(".price")?.textContent || ""),
        introDurationDays: null,
        ongoingPriceCents: parsePriceToCents(el.querySelector(".price")?.textContent || ""),
        minTermDays: null,
        setupFeeCents: extractSetupFee(el),
        modemCostCents: null,
        conditionsText: null,
        typicalEveningSpeedMbps: null,
        sourceUrl: url,
      });
    }
  }
  return results;
}


