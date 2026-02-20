import type { PlanExtract } from "../../types";
import { normalizeSpeed, parsePriceToCents } from "../../validators";
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

function extractIntroOffer(text: string): { introPriceCents: number | null; introDurationDays: number | null; thenPriceCents: number | null; promoDescription: string | null } {
  const introMatch = text.match(/\$\s*([0-9]+(?:\.[0-9]{1,2})?)\s*(?:\/mo|\/month|per\s*month|pm)?\s*(?:for|first)\s*(\d{1,2})\s*(?:months|month|mo)/i);
  const thenMatch = text.match(/then\s*\$\s*([0-9]+(?:\.[0-9]{1,2})?)/i);
  const introPriceCents = introMatch ? parsePriceToCents(introMatch[1]) : null;
  const introDurationDays = introMatch ? parseInt(introMatch[2], 10) * 30 : null;
  const thenPriceCents = thenMatch ? parsePriceToCents(thenMatch[1]) : null;
  const promoDescription = introMatch ? introMatch[0].trim() : null;
  return { introPriceCents, introDurationDays, thenPriceCents, promoDescription };
}

export function canHandle(url: string) {
  return url.includes("dodo.com.au");
}

export async function parse(html: string, url: string): Promise<PlanExtract[]> {
  const doc = parseHTML(html);
  const plans = Array.from(doc.querySelectorAll(".plan, .product"));
  return plans.map((p) => {
    const name = p.querySelector("h3, h2, .title")?.textContent?.trim() || "Not stated";
    const price = p.querySelector(".price")?.textContent || p.textContent || "";
    const introOffer = extractIntroOffer(p.textContent || "");
    const s = (p.textContent || "").match(/NBN\s*(\d{1,4})/i)?.[1] ?? null;
    const parsedSpeed = s ? parseInt(s) : null;
    const normalizedSpeed = normalizeSpeed(parsedSpeed);
    return {
      providerSlug: "dodo",
      planName: name,
      speedTier: normalizedSpeed,
      uploadSpeedMbps: extractUploadSpeed(p, normalizedSpeed),
      dataAllowance: extractDataAllowance(p),
      contractMonths: extractContractMonths(p),
      modemIncluded: extractModemIncluded(p),
      introPriceCents: introOffer.introPriceCents ?? parsePriceToCents(price),
      introDurationDays: introOffer.introDurationDays,
      ongoingPriceCents: introOffer.thenPriceCents ?? parsePriceToCents(price),
      minTermDays: null,
      setupFeeCents: extractSetupFee(p),
      modemCostCents: null,
      conditionsText: (p.textContent || "").trim() || null,
      promoDescription: introOffer.promoDescription,
      typicalEveningSpeedMbps: null,
      sourceUrl: url,
      technologyType: 'standard',
      planType: 'residential',
    };
  });
}

