import type { PlanExtract, SpeedTier } from "./types";

const SPEED_MAP: Record<string, SpeedTier> = {
  'nbn 12': 12,
  'nbn 25': 25,
  'nbn 50': 50,
  'nbn 100': 100,
  'nbn 250': 250,
  'nbn 500': 500,
  'nbn 1000': 1000,
  'standard': 12,
  'standard plus': 100,
  'superfast': 250,
};

export function parsePriceToCents(text: string | null | undefined): number | null {
  if (!text) return null;
  const clean = text.replace(/[ ,]/g, "");
  const m = clean.match(/(\d+(?:\.\d{1,2})?)/);
  if (!m) return null;
  const val = parseFloat(m[1]);
  if (!isFinite(val)) return null;
  return Math.round(val * 100);
}

export function parseDurationToDays(text: string | null | undefined): number | null {
  if (!text) return null;
  const m = text.match(/(\d+)\s*(month|months)/i);
  if (!m) return null;
  return parseInt(m[1]) * 30;
}

export function normalizeSpeed(text: string | number | null | undefined): SpeedTier | null {
  if (!text) return null;
  if (typeof text === 'number') {
    const n = text as number;
    if ([12,25,50,100,200,250,400,500,1000,2000].includes(n)) return n as SpeedTier;
    return null;
  }
  const s = String(text).trim().toLowerCase();
  const exact = s.match(/(\d{1,4})/);
  if (exact) {
    const n = parseInt(exact[1]);
    if ([12,25,50,100,200,250,400,500,1000,2000].includes(n)) return n as SpeedTier;
  }
  for (const key of Object.keys(SPEED_MAP)) {
    if (s.includes(key)) return SPEED_MAP[key];
  }
  return null;
}

export function validatePlan(p: PlanExtract) {
  const errors: string[] = [];
  const warnings: string[] = [];

  const planName = (p.planName || '').trim();
  const sourceUrl = (p.sourceUrl || '').trim();

  // Hard rejects: things that are almost certainly garbage and should not be stored.
  if (!planName) errors.push('missing plan name');
  if (planName.length > 120) errors.push(`plan name too long (${planName.length})`);
  if (!p.speedTier) errors.push('missing speed tier');
  if (!sourceUrl) errors.push('missing source url');

  const price = p.ongoingPriceCents ?? p.introPriceCents;
  if (price === null) {
    errors.push('missing price');
  } else {
    // $1/day / promo fragments frequently get mis-parsed as plan prices
    if (price < 2000) errors.push(`price too low (${price})`);
  }

  // Reject common marketing/FAQ paragraphs accidentally captured as plan names.
  if (planName.length > 50 && /(what is|about|want to|download|stream|in a world of|plan to rule them all)/i.test(planName)) {
    errors.push('plan name looks like marketing copy');
  }

  // Soft plausibility checks (warnings only)
  if (p.ongoingPriceCents !== null) {
    if (p.ongoingPriceCents < 3000) warnings.push(`ongoing_price_cents ${p.ongoingPriceCents} unusually low`);
    if (p.ongoingPriceCents > 30000) warnings.push(`ongoing_price_cents ${p.ongoingPriceCents} unusually high`);
  }

  if (p.introPriceCents !== null && p.ongoingPriceCents !== null) {
    if (p.introPriceCents > p.ongoingPriceCents) warnings.push('intro price higher than ongoing price');
  }

  if (p.uploadSpeedMbps !== undefined && p.uploadSpeedMbps !== null && p.speedTier !== null) {
    if (p.uploadSpeedMbps > p.speedTier) warnings.push('upload speed greater than download speed');
  }

  return { ok: errors.length === 0, reject: errors.length > 0, errors, warnings };
}

export function normalizeExtract(ex: PlanExtract): PlanExtract {
  return {
    ...ex,
    introPriceCents: typeof ex.introPriceCents === 'number' ? ex.introPriceCents : parsePriceToCents(String(ex.introPriceCents)) ?? null,
    ongoingPriceCents: typeof ex.ongoingPriceCents === 'number' ? ex.ongoingPriceCents : parsePriceToCents(String(ex.ongoingPriceCents)) ?? null,
    speedTier: normalizeSpeed(ex.speedTier),
    introDurationDays: typeof ex.introDurationDays === 'number' ? ex.introDurationDays : parseDurationToDays(String(ex.introDurationDays)) ?? null,
  };
}
