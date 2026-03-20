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
  return url.includes("superloop.net") || url.includes("superloop.com");
}

export async function parse(html: string, url: string): Promise<PlanExtract[]> {
  const plans: PlanExtract[] = [];
  const doc = parseHTML(html);

  // --- Strategy 1: DOM-based extraction ---
  // Superloop renders plan cards with various class patterns depending on their React version
  const cardSelectors = [
    '[class*="PlanCard"]', '[class*="plan-card"]', '[class*="plan_card"]',
    '[class*="ProductCard"]', '[class*="product-card"]',
    '[class*="PricingCard"]', '[class*="pricing-card"]',
    '[class*="nbn-plan"]', '[class*="NBNPlan"]',
    '.plan', '.package', '.product',
  ];
  let cards: Element[] = [];
  for (const sel of cardSelectors) {
    cards = Array.from(doc.querySelectorAll(sel));
    if (cards.length >= 2) break; // need at least 2 to be meaningful
  }

  for (const el of cards) {
    const text = el.textContent || '';
    // Must contain a speed indicator to be a plan card
    const speedMatch = text.match(/\b(\d{3,4})\s*Mbps\b/i) ||
                       text.match(/NBN\s*(\d{2,4})/i) ||
                       text.match(/\b(25|50|100|250|500|1000|2000)\b/);
    if (!speedMatch) continue;
    const rawSpeed = parseInt(speedMatch[1]);
    const speed = normalizeSpeed(rawSpeed);
    if (!speed) continue;

    const planName = `Superloop NBN ${speed}`;
    const intro = extractIntroOffer(text);
    const priceText = el.querySelector('[class*="price"], [class*="Price"], .price, .cost')?.textContent || '';
    const ongoingPrice = intro.thenPriceCents ?? parsePriceToCents(priceText);

    if (!ongoingPrice && !intro.introPriceCents) continue;

    plans.push({
      providerSlug: 'superloop',
      planName,
      speedTier: speed,
      uploadSpeedMbps: extractUploadSpeed(el, rawSpeed),
      dataAllowance: extractDataAllowance(el) ?? 'Unlimited',
      contractMonths: extractContractMonths(el) ?? 0,
      modemIncluded: extractModemIncluded(el),
      introPriceCents: intro.introPriceCents,
      introDurationDays: intro.introDurationDays,
      ongoingPriceCents: ongoingPrice,
      minTermDays: null,
      setupFeeCents: extractSetupFee(el),
      modemCostCents: null,
      conditionsText: text.trim().slice(0, 500) || null,
      promoDescription: intro.promoDescription,
      typicalEveningSpeedMbps: null,
      sourceUrl: url,
      technologyType: 'standard',
      planType: 'residential',
    });
  }

  if (plans.length > 0) return deduplicateSuperloopPlans(plans);

  // --- Strategy 2: Full-page text extraction ---
  // For React SPAs, `html` may be the raw app shell before hydration.
  // Extract speed+price pairs from any contiguous text block.
  const pageText = (doc.body?.textContent || html).replace(/\s+/g, ' ');
  const speeds: Array<{ speed: number; text: string }> = [];

  // Collect blocks around each speed mention
  for (const match of pageText.matchAll(/\b(25|50|100|250|500|1000|2000)\s*Mbps\b/gi)) {
    const idx = match.index ?? 0;
    speeds.push({ speed: parseInt(match[1]), text: pageText.slice(Math.max(0, idx - 100), idx + 300) });
  }

  for (const { speed, text } of speeds) {
    const norm = normalizeSpeed(speed);
    if (!norm) continue;
    const intro = extractIntroOffer(text);
    // Try extracting first $ amount in block as ongoing price
    const priceMatch = text.match(/\$\s*(\d{2,3}(?:\.\d{1,2})?)/g);
    const prices = (priceMatch || []).map(p => parsePriceToCents(p)).filter((p): p is number => p !== null && p > 2000);
    const ongoingPrice = intro.thenPriceCents ?? prices.find(p => p > (intro.introPriceCents ?? 0)) ?? prices[0] ?? null;

    if (!ongoingPrice && !intro.introPriceCents) continue;

    // Avoid duplicate speeds
    if (plans.find(p => p.speedTier === norm)) continue;

    plans.push({
      providerSlug: 'superloop',
      planName: `Superloop NBN ${speed}`,
      speedTier: norm,
      uploadSpeedMbps: { 25: 5, 50: 20, 100: 20, 250: 25, 500: 50, 1000: 50, 2000: 100 }[speed] ?? null,
      dataAllowance: 'Unlimited',
      contractMonths: 0,
      modemIncluded: null,
      introPriceCents: intro.introPriceCents,
      introDurationDays: intro.introDurationDays,
      ongoingPriceCents: ongoingPrice,
      minTermDays: null,
      setupFeeCents: null,
      modemCostCents: null,
      conditionsText: text.trim().slice(0, 500) || null,
      promoDescription: intro.promoDescription,
      typicalEveningSpeedMbps: null,
      sourceUrl: url,
      technologyType: 'standard',
      planType: 'residential',
    });
  }

  return deduplicateSuperloopPlans(plans);
}

/** Keep only one entry per speed tier — prefer the one with more fields populated. */
function deduplicateSuperloopPlans(plans: PlanExtract[]): PlanExtract[] {
  const bySpeed = new Map<number, PlanExtract>();
  for (const plan of plans) {
    const key = plan.speedTier ?? 0;
    const existing = bySpeed.get(key);
    if (!existing || score(plan) > score(existing)) bySpeed.set(key, plan);
  }
  return Array.from(bySpeed.values()).sort((a, b) => (a.speedTier ?? 0) - (b.speedTier ?? 0));
}

function score(p: PlanExtract): number {
  return (p.ongoingPriceCents ? 2 : 0) + (p.introPriceCents ? 1 : 0) + (p.uploadSpeedMbps ? 1 : 0);
}
